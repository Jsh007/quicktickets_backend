/*
 * @Author: Joshua Eigbe self@joshuaeigbe.com
 * @Github: https://github.com/jsh007
 * @Date: 2024-01-06 19:19:11
 * @LastEditors: Joshua Eigbe self@joshuaeigbe.com
 * @LastEditTime: 2024-01-08 00:03:05
 * @FilePath: /mern-crud/controllers/usersController.js
 * @copyrightText: Copyright (c) Joshua Eigbe. All Rights Reserved.
 * @Description: See Github repo
 */
const User = require("../models/User");
const Note = require("../models/Note");
const bcrypt = require("bcrypt");
const asyncHandler = require("express-async-handler");

/**
 * @description Get All users
 * @route GET /users
 * @access private
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password").lean();
  if (!users?.length) {
    return res.status(400).json({ message: "No users found" });
  }
  res.json(users);
});

/**
 * @description Create user
 * @route POST /users
 * @access private
 */
const createUser = asyncHandler(async (req, res) => {
  const { username, password, roles } = req.body;

  // confirm user
  if (!username || !password || !Array.isArray(roles) || !roles.length) {
    return res.status(400).json({ message: "All fields are required !" });
  }

  // Check for duplicates
  const duplicate = await User.findOne({ username }).lean().exec();
  if (duplicate) {
    return res.status(409).json({ message: "Duplicate Username !" });
  }

  // Hash password
  const hashedPwd = await bcrypt.hash(password, 10);
  const userObject = { username, password: hashedPwd, roles };

  // create and store new user
  const newUser = await User.create(userObject);

  if (newUser) {
    res.status(201).json({ message: `New user ${username} created !` });
  } else {
    res.status(400).json({ message: "Invalid user data received" });
  }
});

/**
 * @description Update user
 * @route PATCH /users
 * @access private
 */
const updateUser = asyncHandler(async (req, res) => {
  const { id, username, password, roles, active } = req.body;

  // confrm data
  if (
    !id ||
    !username ||
    !Array.isArray(roles) ||
    !roles.length ||
    typeof active !== "boolean"
  ) {
    return res.status(400).json({ message: " All fields are required" });
  }
  // Fetch user
  const user = await User.findById(id).exec();
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  // Check for duplicates
  const duplicate = await User.findOne({ username }).lean().exec();

  // Allow updates to the orginal user
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate Username Found !" });
  }

  user.username = username;
  user.roles = roles;
  user.active = active;

  if (password) {
    // Hash password
    user.password = await bcrypt.hash(password, 10);
  }
  const updatedUser = await user.save();
  res.json({ message: `Updated ${updatedUser.username} !` });
});

/**
 * @description Delete user
 * @route DELETE /users
 * @access private
 */
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ message: "User ID required !" });
  }
  // Check if user currently has notes
  const note = await Note.findOne({ user: id }).lean().exec();
  if (note) {
    return res.status(400).json({ message: "User has assigned notes" });
  }

  // Fetch User Data
  const user = await User.findById({ _id: id }).exec();
  if (!user) {
    return res.status(400).json({ message: "User not Found !" });
  }

  const result = await user.deleteOne();
  //   console.log(result);
  const reply = `User ${user.username} with ID ${user.id} is deleted !`;
  res.json(reply);
});

module.exports = { getAllUsers, createUser, updateUser, deleteUser };
