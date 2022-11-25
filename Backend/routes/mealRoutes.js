const express = require("express");
const router = express.Router();
const {
  createMeal,
  getMeals,
  getMeal,
  updateMeal,
  deleteMeal,
} = require("../controllers/mealController");
const { protect, verify, admin } = require("../middleware/authMiddleware");

router.route("/").post(protect, verify, admin, createMeal);
router.route("/").get(getMeals);
router.route("/:id").get(getMeal);
router.route("/:id").put(protect, verify, admin, updateMeal);
router.route("/:id").delete(protect, verify, admin, deleteMeal);

module.exports = router;
