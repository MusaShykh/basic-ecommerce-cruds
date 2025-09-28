import  express  from "express";
import * as orderController from '../controllers/order.controler.js';

const router = express.Router();

router.post("/orders", orderController.createOrder);
router.get("/orders/:id", orderController.fetchSingleOrder);
router.get("/orders/user/:userId", orderController.getAllOrdersAgainstUser);
router.put("/orders/:orderId/status", orderController.updateOrder);
router.get("/order-items/:orderId", orderController.orderGezette)

export default router;
