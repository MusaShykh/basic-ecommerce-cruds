// POST : Create Order
import productsModel from "../models/Products.js";
import usersModel from "../models/Users.js";
import OrderItemModel from "../models/OrderItems.js";
import { v4 as uuidv4 } from "uuid";
import OrdersModel from "../models/Orders.js";

export const createOrder = async (req, res) => {
  if (!req.body.userId) {
    return res.status(400).send({
      status: false,
      message: "UserId is required!",
    });
  }

  const userId = req.body.userId;

  try {
    // 1. Validate user
    const userFound = await usersModel.findOne({ user_id: userId });
    if (!userFound) {
      return res.status(404).send({
        status: false,
        message: "User could not be found",
      });
    }

    // 2. Extract productIds from request
    const passedProducts = req.body.items; // [{productId, quantity}]
    const productIds = passedProducts.map((item) => item.productId);

    // 3. Fetch products from DB
    const products = await productsModel
      .find({ product_id: { $in: productIds } })
      .lean();

    // 4. Validate IDs
    const foundIds = products.map((p) => p.product_id);
    const invalidIds = productIds.filter((id) => !foundIds.includes(id));
    if (invalidIds.length > 0) {
      return res.status(400).send({
        status: false,
        message: "Invalid product IDs",
        invalid_product_ids: invalidIds,
      });
    }

    // 5. Validate stock
    const productsWithInvalidQty = [];
    passedProducts.forEach((item) => {
      const product = products.find((p) => p.product_id === item.productId);
      if (product && product.stock < item.quantity) {
        productsWithInvalidQty.push({
          product_id: item.productId,
          quantity_available: product.stock,
        });
      }
    });
    if (productsWithInvalidQty.length > 0) {
      return res.status(400).send({
        status: false,
        message: "Product is out of stock!",
        invalid_stock_product: productsWithInvalidQty,
      });
    }

    // 6. Calculate total
    let orderTotal = 0;
    passedProducts.forEach((item) => {
      const product = products.find((p) => p.product_id === item.productId);
      orderTotal += Number(product.price) * Number(item.quantity);
    });

    // 7. Deduct stock
    for (const prod of passedProducts) {
      const update = await productsModel.updateOne(
        { product_id: prod.productId, stock: { $gte: prod.quantity } },
        { $inc: { stock: -prod.quantity } }
      );
      if (update.matchedCount === 0) {
        return res.status(400).send({
          status: false,
          message: `Stock issue for product ${prod.productId}`,
        });
      }
    }

    // 8. Create order
    const orderId = uuidv4();
    await OrdersModel.insertOne({
      order_id: orderId,
      user_id: userId,
      total_amount: orderTotal,
      status: "pending", // default for now
      created_at: new Date(),
    });

    // 9. Create order items
    for (const item of passedProducts) {
      const product = products.find((p) => p.product_id === item.productId);

      await OrderItemModel.insertOne({
        order_item_id: uuidv4(),
        order_id: orderId,
        product_id: item.productId,
        price: product.price, // snapshot price
        quantity: item.quantity,
      });
    }

    return res.status(200).send({
      status: true,
      message: "Order created successfully!",
      order_id: orderId,
      total: orderTotal,
    });
  } catch (error) {
    console.error("Could not create order, ERROR:", error);
    return res.status(500).send({
      status: false,
      message: "Server error while creating order",
      error: error.message,
    });
  }
};

export const fetchSingleOrder = async (req, res) => {
  if (!req.params.id) {
    res.status(404).send({
      status: 404,
      message: "order id is required.",
    });
  }
  let orderId = req.params.id;
  let childOrderItems;
  // fetch order with order and items detail
  let parentOrder = await OrdersModel.findOne({
    order_id: orderId,
  }).lean();

  if (parentOrder?._id) {
    childOrderItems = await OrderItemModel.find({
      order_id: orderId,
    }).lean();

    // form payload to send
    const data = {
      order: parentOrder,
      orderItems: childOrderItems,
    };

    res.status(200).send({
      status: true,
      data: data,
    });
  } else {
    res.status(404).send({
      status: false,
      message: "order not found !!",
    });
  }
};

export const getAllOrdersAgainstUser = async (req, res) => {
  if (!req.params.userId) {
    res.status(404).send({
      status: false,
      message: "user id is required.",
    });
  }

  const userId = req.params.userId;

  // check if valid user_id
  let userFound = await usersModel.findOne({
    user_id: userId,
  });
  if (!userFound) {
    res.status(404).send({
      status: false,
      message: "User does not exists",
    });
    return;
  }

  let foundOrders = await OrdersModel.find(
    { user_id: userId },
    { _id: 0, __v: 0, createdAt: 0, updatedAt: 0 }
  ).lean();

  if (foundOrders.length === 0) {
    res.status(404).send({
      status: false,
      message: "orders not found",
    });
    return;
  }

  res.status(200).send({
    status: true,
    order_list: foundOrders,
  });

  if (foundOrders.length > 0) {
    res.status(404).send({
      status: false,
      message: "Could not find any orders for user !",
    });
  }
};

export const updateOrder = async (req, res) => {
  const orderId = req.params?.orderId;
  const statusToUpdate = req.body.status;
  console.log("statusssss", statusToUpdate);

  if (!orderId) {
    return res.status(404).send({
      status: false,
      message: "Order Id is required",
    });
  }

  const orderExists = await OrdersModel.findOne({
    order_id: orderId,
  });

  if (!orderExists) {
    return res.status(404).send({
      status: false,
      message: "Please enter valid order id",
    });
  }
  const existingStatus = orderExists?.status;

  // Allowed transitions
  const STATUS_TRANSITIONS = {
    pending: ["shipped", "cancelled"],
    shipped: ["completed", "returned"],
    completed: ["returned", "dead"],
    cancelled: ["dead"],
  };

  if (STATUS_TRANSITIONS[existingStatus]?.includes(statusToUpdate)) {
    await OrdersModel.findOneAndUpdate(
      {
        order_id: orderId,
      },
      { status: statusToUpdate }
    );
    return res.status(200).send({
      status: true,
      message: "Your Order status has been updated",
    });
  } else {
    return res.status(400).send({
      status: false,
      message: `Status could not be updated to ${statusToUpdate} `,
    });
  }
};

export const orderGezette = async (req, res) => {
  const orderId = req.params.orderId;

  if (!orderId) {
    return res.status(400).send({
      status: false,
      message: "order id is required",
    });
  }

  const orderExists = await OrdersModel.findOne({ order_id: orderId });

  if (!orderExists) {
    return res.status(404).send({
      status: false,
      message: "invalid order ID",
    });
  }

  // find order items
  const orderItems = await OrderItemModel.find({
    order_id: orderId,
  }).lean();

  let productIds = [];

  for (const order of orderItems) {
    productIds.push(order.product_id);
  }

  // find product-info

  const products = await productsModel
    .find({
      product_id: { $in: productIds },
    })
    .lean();

  let response = {
    order_detail: orderExists,
    order_items: orderItems,
    products: products,
  };

  return res.status(200).send({
    status: true,
    data: response,
  });
};
