/*
 * @Author: Joshua Eigbe self@joshuaeigbe.com
 * @Github: https://github.com/jsh007
 * @Date: 2024-01-18 08:52:38
 * @LastEditors: Joshua Eigbe self@joshuaeigbe.com
 * @LastEditTime: 2024-01-18 14:02:57
 * @FilePath: /mern-crud/routes/authRoutes.js
 * @copyrightText: Copyright (c) Joshua Eigbe. All Rights Reserved.
 * @Description: See Github repo
 */
const express = require("express");
const router = express.Router();
const { login, refresh, logout } = require("../controllers/authController");
const loginLimiter = require("../middlewares/loginLimiter");

router.route("/").post(loginLimiter, login);

router.route("/refresh").get(refresh);

router.route("/logout").post(logout);

module.exports = router;
