/*
 * @Author: Joshua Eigbe self@joshuaeigbe.com
 * @Github: https://github.com/jsh007
 * @Date: 2024-01-19 12:06:05
 * @LastEditors: Joshua Eigbe jeigbe@gmail.com
 * @LastEditTime: 2024-01-28 14:43:12
 * @FilePath: /quicktickets_backend/middlewares/verifyJWT.js
 * @copyrightText: Copyright (c) Joshua Eigbe. All Rights Reserved.
 * @Description: See Github repo
 */
const jwt = require("jsonwebtoken");

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  // console.log(authHeader);

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decodedUser) => {
    if (err) return res.status(403).json({ message: "Forbidden" });
    // This is the reason why  I keep getting a undefined roles iin the frontend after refresh; req.roles = decodedUser.roles
    // access token is set with a "UserInfo" object but here that object isn't referenced. Note that decodedUser is not a mongoDB document
    req.user = decodedUser.UserInfo.username;
    req.id = decodedUser.UserInfo.id;
    req.roles = decodedUser.UserInfo.roles;
    next();
  });
};

module.exports = verifyJWT;
