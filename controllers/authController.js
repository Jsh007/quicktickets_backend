/*
 * @Author: Joshua Eigbe self@joshuaeigbe.com
 * @Github: https://github.com/jsh007
 * @Date: 2024-01-18 12:58:48
 * @LastEditors: Joshua Eigbe self@joshuaeigbe.com
 * @LastEditTime: 2024-01-26 09:01:27
 * @FilePath: /quicktickets_backend/controllers/authController.js
 * @copyrightText: Copyright (c) Joshua Eigbe. All Rights Reserved.
 * @Description: See Github repo
 */
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

/**
 * @description Login User and generate access  and refresh tokens
 * @route POST /auth
 * @access public
 */

const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: " Username and Password are both required" });
  }

  const foundUser = await User.findOne({ username }).exec();

  if (!foundUser || !foundUser.active) {
    return res.status(401).json({ message: "Unauthorized !" });
  }

  const isMatchedUser = await bcrypt.compare(password, foundUser.password);

  if (!isMatchedUser) res.status(401).json({ message: "Unauthorized !" });

  // console.log(foundUser);
  // console.log(isMatchedUser);

  const accessToken = jwt.sign(
    {
      userInfo: {
        username: foundUser.username,
        roles: foundUser.roles,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { username: foundUser.username },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "1d" }
  );

  // Create secure cookie with refresh token
  res.cookie("jwt", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "None", // Enables cross-site cookie
    // accessControllAllowCredentials: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  // send access token containing usename and roles
  res.json({ accessToken });
});

/**
 * @description Regenerate User Access Token
 * @route GET /auth/refresh
 * @access public - because access token has expired
 */

const refresh = (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.status(401).json({ message: `Unauthorized` });
  const refreshToken = cookies.jwt;
  // console.log(refreshToken);

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    asyncHandler(async (err, decodedUser) => {
      if (err) return res.status(403).json({ message: `Forbidden` });
      // console.log(decodedUser);

      const foundUser = await User.findOne({
        username: decodedUser.username,
      }).exec();
      // console.log(foundUser);
      if (!foundUser) return res.status(401).json({ message: `Unauthorized` });
      // console.log(decodedUser);

      const accessToken = jwt.sign(
        {
          userInfo: {
            username: decodedUser.username,
            roles: decodedUser.roles,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
      );

      res.json({ accessToken });
    })
  );
};

/**
 * @description Logout User
 * @route POST /auth/logout
 * @access public - to enable clearing of cookie if it exists
 */

const logout = asyncHandler(async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204); // No content
  res.clearCookie("jwt", { httpOnly: true, sameSite: "none", secure: true });
  res.json({ message: "Cookie cleared successfully !" });
});

module.exports = { login, refresh, logout };
