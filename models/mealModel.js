const mongoose = require("mongoose");
const Joi = require("joi");

const mealSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 3,
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
      // cast category to string

      type: mongoose.Schema.Types.Mixed,
      ref: "Category",
      required: true,
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

const validate = (meal) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    description: Joi.string().min(5).max(255).required(),
    price: Joi.number().min(0).max(1000).required(),
    status: Joi.string().required(),
  });

  return schema.validate(meal);
};

module.exports = {
  Meal,
  validate,
};
