import express from "express";

import dotenv from "dotenv";
import { connectDatabases } from "./src/db/connectDB.js";
import userRoutes from "./src/routes/userRoutes.js";
import productRoutes from "./src/routes/productRoutes.js";
import orderRoutes from "./src/routes/orderRoutes.js";
// import orderItemRoutes from "./src/routes/orderitemsRoutes.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
try {
  connectDatabases();
} catch (error) {
  console.log("An Error Occured while connecting to Databases....", error);
}
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api", orderRoutes);
// app.use("/api/order-items", orderItemRoutes);
// Start server
app.listen(process.env.PORT, () => {
  console.log(`🚀 Server running on port ${process.env.PORT}`);
});
