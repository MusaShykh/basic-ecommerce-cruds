import { Schema } from "mongoose";

const orderSchema = Schema(
  {
    order_id: {
      type: String,
      required: true,
      unique: true,
    },
    user_id: {
      type: String,
      required: true,
    },
    total_amount: {
      type: Number,
      required: false,
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "paid", "shipped", "completed", "cancelled", "dead"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default orderSchema;