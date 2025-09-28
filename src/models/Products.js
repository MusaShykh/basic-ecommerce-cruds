import { model } from "mongoose";
import productSchema from "../schemas/Products.js";


const productsModel = model('product', productSchema);
export default productsModel;