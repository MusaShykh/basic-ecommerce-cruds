import  express  from "express";
import * as productsRoutes from "../controllers/product.controller.js";

const router = express.Router();

router.post("/",productsRoutes.addProduct);
router.get("/",productsRoutes.getAllProducts);
router.get("/:id",productsRoutes.getSingleProduct);
router.put("/:id", productsRoutes.updateProduct);

export default router;
