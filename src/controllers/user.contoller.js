import usersModel from "./../models/Users.js";
import { v4 as uuid } from "uuid";

export const createUser = async (req, res) => {
  const requestBody = req.body;
  console.log(req);

  let { name, email, phone, address, password } = requestBody;

  const id = uuid();
  if (!name || !email || !phone) {
    try {
      await usersModel.insertOne({
        user_id: id,
        name,
        email,
        phoneNumber: phone,
        address,
        password,
      });
      res.status(200).send({
        mesage: "Record Inserted !",
      });
    } catch (error) {
      console.log("coulod not enter record due to error:", error);
    }
  } else {
    res.status(400).send({
      mesage: "details not enough !",
    });
  }
};

export const getSingleUser = async (req, res) => {
  const id = req.params.id || null;

  if (!id) {
    res.status(400).send({
      message: "user id not given !",
    });
  }
  try {
    const user = await usersModel.findOne({ user_id: id }).lean();
    console.log("user1", user);

    let { _id, __v, password, ...newUser } = user;
    res.status(200).send({
      message: "user fetched successfully !",
      data: { user: newUser },
    });
  } catch (error) {
    console.log("Could not find record due to error:", error);
  }
};

export const getAllUser = async (req, res) => {
  try {
    const users = await usersModel.find().lean();
    let newLeanUsers = users.map(({ __v, _id, password, ...restOfUser }) => {
      return restOfUser;
    });

    res.status(200).send({
      message: "user fetched successfully !",
      data: { users: newLeanUsers },
    });
  } catch (error) {
    console.log("Could not find record due to error:", error);
  }
};

export const updateUser = async (req, res) => {
  const id = req.params.id || null;

  if (!id) {
    res.status(400).send({
      message: "user id not given !",
    });
  }
  let updates = req.body;

  try {
    // await usersModel.findByIdAndUpdate()

    let userExists = await usersModel.findOne({ user_id: id });
    if (!userExists) {
      res.status(404).send({
        status: false,
        message: "user does not exist",
      });
      return;
    }
    await usersModel.updateOne(
      { user_id: id },
      { $set: updates },
      { new: true, runValidators: true }
    );
    res.status(200).send({
      message: "User Updated.",
    });
  } catch (error) {
    console.log("User could not be Updated ! ERROR:", error);
    res.status(500).send({
      message: "Could not update user.",
    });
  }
};

export const deleteUser = async (req, res) => {
  const id = req.params.id || null;

  if (!id) {
    res.status(400).send({
      message: "user id not given !",
    });
  }

  try {
    let userExists = await usersModel.findOne({ user_id: id });
    if (!userExists) {
      res.status(404).send({
        status: false,
        message: "user does not exist",
      });
      return;
    }
    await usersModel.deleteOne({ user_id: id });
    res.status(200).send({
      message: "User Deleted.",
    });
  } catch (error) {
    console.log("User could not be Updated ! ERROR:", error);
    res.status(500).send({
      message: "Could not delete user.",
    });
  }
};
