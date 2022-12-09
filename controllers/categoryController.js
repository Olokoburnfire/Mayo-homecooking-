const { Category, validate } = require("../models/categoryModel");
const { Meal } = require("../models/mealModel");
const { cloudinary } = require("../config/cloudinaryConfig");
const { errorMsg, successMsg } = require("../utils/response");

// desc   Create new Category
// route  POST /api/categories
// access Private
const createCategory = async (req, res) => {
  try {
    let { name, description, status } = req.body;
    if (!req.files) return res.send("Please upload an image");
    let { image } = req.files;

    const fileTypes = ["image/jpeg", "image/jpg", "image/png"];
    const imageSize = 1024;

    if (!fileTypes.includes(image.mimetype)) {
      return errorMsg(res, "Only jpeg, jpg and png files are allowed.", 400);
    }

    if (image.size > imageSize * 1024) {
      return errorMsg(res, "Image size should be less than 1MB.", 400);
    }

    const cloudFile = await cloudinary.uploader.upload(image.tempFilePath, {
      folder: "categories",
    });

    console.log(cloudFile);

    const { error } = validate(req.body);
    if (error) return errorMsg(res, error.details[0].message, 400);

    const category = new Category({
      name,
      description,
      image: cloudFile.secure_url,
      status,
    });

    await category.save();

    successMsg(res, "Category created successfully.", category, 201);
  } catch (error) {
    errorMsg(res, error.message, 500);
  }
};

// desc   Get all categories
// route  GET /api/categories
// access Public
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    successMsg(res, "Categories fetched successfully.", categories);
  } catch (error) {
    errorMsg(res, error.message, 500);
  }
};

// desc  Get meals by category
// route  GET /api/categories/:category
// access Public
const getMealsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const categoryExists = await Category.findOne({ name: category });
    if (!categoryExists) return errorMsg(res, "Category not found.", 404);

    const meals = await Meal.find({
      category: categoryExists.name,
    });

    successMsg(res, "Meals fetched successfully.", meals);
  } catch (error) {
    errorMsg(res, error.message, 500);
  }
};

module.exports = {
  createCategory,
  getCategories,
  getMealsByCategory,
};
