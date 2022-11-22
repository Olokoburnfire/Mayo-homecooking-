import { Category, validate } from "../models/categoryModel";
import { cloudinary } from "../config/cloudinaryConfig";
import { errorMsg, successMsg } from "../utils/response";

// desc   Create new Category
// route  POST /api/categories
// access Private
const createCategory = async (req, res) => {
  try {
    let { name, description, status } = req.body;
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

module.exports = {
  createCategory,
  getCategories,
};
