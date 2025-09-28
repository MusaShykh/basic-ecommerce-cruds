import { model } from "mongoose";
import userSchema from "../schemas/Users.js";

const usersModel = model("user", userSchema);
export default usersModel;
