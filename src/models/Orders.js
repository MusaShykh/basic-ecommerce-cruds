import { model } from "mongoose";
import orderSchema from "../schemas/Orders.js";


const OrdersModel = model('order', orderSchema);
export default OrdersModel;