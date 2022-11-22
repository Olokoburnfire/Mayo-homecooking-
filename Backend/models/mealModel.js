const mongoose = require("mongoose");
const Joi = require("joi");

const mealSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 30,
    },
    description: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 255,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      max: 1000,
    },
    image: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 30,
    },
    status: {
      type: String,
      required: true,
      enum: ["available", "unavailable"],
    },
  },
  {
    timestamps: true,
  }
);

const Meal = mongoose.model("Meal", mealSchema);

const schema = Joi.object({
  name: Joi.string().min(5).max(30).required(),
});
