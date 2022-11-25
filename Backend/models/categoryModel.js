const Joi = require("joi");
const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      minlength: 5,
      maxlength: 30,
    },
    description: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 255,
    },
    image: {
      type: String,
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

const Category = mongoose.model("Category", categorySchema);

const schema = Joi.object({
  name: Joi.string().min(5).max(30).required(),
  description: Joi.string().min(5).max(255).required(),
  status: Joi.string().required(),
});

module.exports = {
  Category,
  validate: (category) => schema.validate(category),
};
