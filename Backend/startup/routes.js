const express = require("express");
const users = require("../routes/userRoutes");
const fileUpload = require("express-fileupload");

module.exports = function (app) {
  app.use(express.json());
  app.use(
    fileUpload({
      useTempFiles: true,
    })
  );
  app.use("/api/user", users);
  //   app.use(error);
};
