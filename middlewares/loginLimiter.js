/*
 * @Author: Joshua Eigbe self@joshuaeigbe.com
 * @Github: https://github.com/jsh007
 * @Date: 2024-01-18 09:17:44
 * @LastEditors: Joshua Eigbe self@joshuaeigbe.com
 * @LastEditTime: 2024-01-18 14:24:07
 * @FilePath: /mern-crud/middlewares/loginLimiter.js
 * @copyrightText: Copyright (c) Joshua Eigbe. All Rights Reserved.
 * @Description: See Github repo
 */
const rateLimit = require("express-rate-limit");
const { logEvents } = require("./logger");

/**
 * @description: Monitors a user's login attempts and prevents them from trying until set time have passed.
 */
const loginLimiter = rateLimit({
  windowsMs: 60 * 1000,
  max: 5,
  message: {
    message:
      "Too many login attempts from this IP, please try again after 60 seconds.",
  },
  handler: (req, res, next, options) => {
    logEvents(
      `Too Many Requests: ${options.message.message}\t${req.method}\t${req.url}\t${req.headers.origin}`,
      "errLog.log"
    );
    res.status(options.statusCode).send(options.message);
  },
  standardheaders: true,
  legacyheaders: false,
});

module.exports = loginLimiter;
