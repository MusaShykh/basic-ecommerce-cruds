import { Schema } from "mongoose";

const OrderItems = Schema(
  {
    order_item_id: {
      type: String,
      required: true,
      unique: true,
    },
    order_id: {
      type: String,
      required: true,
    },
    product_id: {
      type: String,
      required: false,
    },
    price: {
      type: String,
      required: false,
    },
    quantity: {
      type: Number,
      required: false,
    },
  },
  { timestamps: true }
);

export default OrderItems;
