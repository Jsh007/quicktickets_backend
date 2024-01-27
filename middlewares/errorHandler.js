/*
 * @Author: Joshua Eigbe self@joshuaeigbe.com
 * @Github: https://github.com/jsh007
 * @Date: 2024-01-04 18:41:44
 * @LastEditors: Joshua Eigbe self@joshuaeigbe.com
 * @LastEditTime: 2024-01-26 13:55:44
 * @FilePath: /quicktickets_backend/middlewares/errorHandler.js
 * @copyrightText: Copyright (c) Joshua Eigbe. All Rights Reserved.
 * @Description: See Github repo
 */
const { logEvents } = require("./logger");

const errorHandler = (err, req, res, next) => {
  logEvents(
    `${err.name}: ${err.message}\t${res.method}\t${res.url}\t${res?.headers?.origin}`
  );
  console.log(err.stack);
  const statusCode = res.statusCode ? res.statusCode : 500; // Return status code 500 to indicate error a server error
  res.status(statusCode);
  res.json({ message: err.message, isError: true });
};

module.exports = errorHandler;
