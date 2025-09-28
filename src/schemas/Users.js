import { Schema } from "mongoose";

const userSchema = Schema(
  {
    user_id: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: false,
    },
    address: {
      type: String,
      required: false,
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);
// text based
// userSchema.index({ user_id: "text" });

userSchema.index({ user_id: 1 });

export default userSchema;
