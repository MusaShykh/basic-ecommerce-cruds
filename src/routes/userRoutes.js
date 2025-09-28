import express from "express";
import * as userController from "../controllers/user.contoller.js";

const router = express.Router();

router.post("/create-user", userController.createUser);
router.get("/", userController.getAllUser);
router.get("/:id", userController.getSingleUser);
router.patch("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);

export default router;
