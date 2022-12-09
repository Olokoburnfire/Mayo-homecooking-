const { cloudinary } = require("../config/cloudinaryConfig");
const { errorMsg, successMsg } = require("../utils/response");
const { Meal, validate } = require("../models/mealModel");
const { Category } = require("../models/categoryModel");

// desc   Create new Meal
// route  POST /api/meals
// access Private
const createMeal = async (req, res) => {
  try {
    let { name, description, price, status } = req.body;
    let main = { name, description, price, status };

    // reference category with category name
    const { category } = req.body;
    const categoryExists = await Category.findOne({ name: category });
    if (!categoryExists) return errorMsg(res, "Category not found.", 404);
    console.log(categoryExists);

    // main.category = categoryRef._id;

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
      folder: "meals",
    });

    const { error } = validate(main);
    if (error) return errorMsg(res, error.details[0].message, 400);

    const meal = new Meal({
      name,
      description,
      price,
      image: cloudFile.secure_url,
      category: categoryExists.name,
      status,
    });

    await meal.save();

    successMsg(res, "Meal created successfully.", meal, 201);
  } catch (error) {
    errorMsg(res, error.message, 500);
  }
};

// desc   Get all meals
// route  GET /api/meals
// access Public
const getMeals = async (req, res) => {
  try {
    const meals = await Meal.find();
    successMsg(res, "Meals fetched successfully.", meals);
  } catch (error) {
    errorMsg(res, error.message, 500);
  }
};

// desc   Get single meal
// route  GET /api/meals/:id
// access Public
const getMeal = async (req, res) => {
  try {
    const meal = await Meal.findById(req.params.id);
    if (!meal) return errorMsg(res, "Meal not found.", 404);
    successMsg(res, "Meal fetched successfully.", meal);
  } catch (error) {
    errorMsg(res, error.message, 500);
  }
};

// desc   Update meal
// route  PUT /api/meals/:id
// access Private
const updateMeal = async (req, res) => {
  try {
    const { error } = validate(req.body);
    if (error) return errorMsg(res, error.details[0].message, 400);

    const meal = await Meal.findById(req.params.id);
    if (!meal) return errorMsg(res, "Meal not found.", 404);

    let { name, description, price, category, status } = req.body;
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
      folder: "meals",
    });

    meal.name = name;
    meal.description = description;
    meal.price = price;
    meal.image = cloudFile.secure_url;
    meal.category = category;
    meal.status = status;

    await meal.save();

    successMsg(res, "Meal updated successfully.", meal);
  } catch (error) {
    errorMsg(res, error.message, 500);
  }
};

// desc   Delete meal
// route  DELETE /api/meals/:id
// access Private
const deleteMeal = async (req, res) => {
  try {
    const meal = await Meal.findById(req.params.id);
    if (!meal) return errorMsg(res, "Meal not found.", 404);

    await meal.remove();

    successMsg(res, "Meal deleted successfully.");
  } catch (error) {
    errorMsg(res, error.message, 500);
  }
};

module.exports = {
  createMeal,
  getMeals,
  getMeal,
  updateMeal,
  deleteMeal,
};
