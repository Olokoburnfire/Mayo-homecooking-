const express = require("express");
const users = require("../routes/userRoutes");
const category = require("../routes/categoryRoutes");
const meal = require("../routes/mealRoutes");
const blog = require("../routes/blogRoutes");
const fileUpload = require("express-fileupload");

module.exports = function (app) {
  app.use(express.json());
  app.use(
    fileUpload({
      useTempFiles: true,
    })
  );
  app.use("/api/user", users);
  app.use("/api/category", category);
  app.use("/api/meal", meal);
  app.use("/api/blog", blog);
  //   app.use(error);
};
