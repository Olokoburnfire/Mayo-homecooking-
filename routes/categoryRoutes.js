const express = require("express");
const router = express.Router();
const {
  createCategory,
  getCategories,
  getMealsByCategory,
} = require("../controllers/categoryController");
const { protect, verify, admin } = require("../middleware/authMiddleware");

router.route("/").post(protect, verify, admin, createCategory);
router.route("/").get(getCategories);
router.route("/:category").get(getMealsByCategory);

module.exports = router;
