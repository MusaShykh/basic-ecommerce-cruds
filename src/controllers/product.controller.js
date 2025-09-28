import { v4 as uuid } from "uuid";

import productsModel from "./../models/Products.js";

export const addProduct = async (req, res) => {
  let productPayload = req.body;

  let { name, description, price, stock, category } = productPayload;
  if (!name || !price) {
    return res.status(400).send({
      status: false,
      message: "Name and price are required !",
    });
  }
  const id = uuid();
  try {
    await productsModel.insertOne({
      product_id: id,
      ...(name && { name }),
      ...(description && { description }),
      ...(price && { price }),
      ...(stock && { stock }),
      ...(category && { category }),
    });
    res.status(200).send({
      status: true,
      message: "product added",
    });
  } catch (error) {
    console.log("Could not add Product !");
    res.status(500).send({
      status: false,
      message: "Error while adding product, ERROR:",
      error,
    });
  }

  productsModel;
};

export const getSingleProduct = async (req, res) => {
  const id = req.params.id || null;
  console.log("query params", queryParams);

  if (!id) {
    res.status(400).send({
      message: "Product id not given !",
    });
  }

  try {
    const product = await productsModel.findOne({ product_id: id }).lean();

    let { _id, __v, createdAt, updatedAt, ...sanitizedProduct } = product;
    res.status(200).send({
      message: "Product fetched successfully !",
      data: { product: sanitizedProduct },
    });
  } catch (error) {
    console.log("Could not find record due to error:", error);
  }
};

export const getAllProducts = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  let limit = parseInt(req.query.limit) || 10;
  let query = {};
  if (req.query.search) {
    query.$text = { $search: req.query.search };
  }
  if (req.query.category) {
    query.category = req.query.category;
  }
  if (req.query.minPrice || req.query.maxPrice) {
    query.price = {};
    if (req.query.minPrice) query.price.$gte = Number(req.query.minPrice);
    if (req.query.maxPrice) query.price.$lte = Number(req.query.maxPrice);
  }
  if (req.query.stockBelow) {
    query.stock = {};
    query.stock.$lt = Number(req.query.stockBelow);
  }

  limit = Math.min(limit, 1000);
  const skip = (page - 1) * limit;
  console.log(query);
  
  try {
    const products = await productsModel
      .find(query)
      .skip(skip)
      .limit(limit)
      .lean();
    let newLeanproducts = products.map(({ __v, _id, ...restOfUser }) => {
      return restOfUser;
    });
    const productsCount = await productsModel.countDocuments(query);
    const totalPages = Math.ceil(productsCount / limit);

    if (products) {
      res.status(200).send({
        status: true,
        message: "Products fetched successfully !",
        total_products: productsCount,
        total_pages: totalPages,
        data: { products: newLeanproducts },
      });
    } else {
      res.status(404).send({
        status: true,
        message: "No Products Found!",
      });
    }
  } catch (error) {
    console.log("Could not find record due to error:", error);
  }
};

export const updateProduct = async (req, res) => {
  const id = req.params.id || null;

  if (!id) {
    res.status(400).send({
      message: "product id not given !",
    });
  }
  let updates = req.body;

  try {
    // await usersModel.findByIdAndUpdate()

    let userExists = await productsModel.findOne({ product_id: id });
    if (!userExists) {
      res.status(404).send({
        status: false,
        message: "peoduct does not exist",
      });
      return;
    }
    await productsModel.updateOne(
      { product_id: id },
      { $set: updates },
      { new: true, runValidators: true }
    );
    res.status(200).send({
      message: "Product Updated.",
    });
  } catch (error) {
    console.log("Product could not be Updated ! ERROR:", error);
    res.status(500).send({
      message: "Could not update Product.",
    });
  }
};

// export const deleteUser = async (req, res) => {
//   const id = req.params.id || null;

//   if (!id) {
//     res.status(400).send({
//       message: "user id not given !",
//     });
//   }

//   try {
//     let userExists = await usersModel.findOne({ user_id: id });
//     if (!userExists) {
//       res.status(404).send({
//         status: false,
//         message: "user does not exist",
//       });
//       return;
//     }
//     await usersModel.deleteOne({ user_id: id });
//     res.status(200).send({
//       message: "User Deleted.",
//     });
//   } catch (error) {
//     console.log("User could not be Updated ! ERROR:", error);
//     res.status(500).send({
//       message: "Could not delete user.",
//     });
//   }
// };
