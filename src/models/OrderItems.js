import { model } from "mongoose";
import OrderItems from "../schemas/OrderItems.js";


const OrderItemModel = model('orderItem', OrderItems);
export default OrderItemModel;