import { Schema } from "mongoose";

const productSchema = Schema(
  {
    product_id: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    price: {
      type: String,
      required: true,
    },
    stock: {
      type: Number,
      required: false,
    },
    category: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

productSchema.index({ name: "text", description: "text" });
productSchema.index({ category: 1, price: 1, stock: 1 });

export default productSchema;
