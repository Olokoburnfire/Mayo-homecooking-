const mongoose = require("mongoose");
const Joi = require("joi");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 255,
    },
    password: {
      type: String,
      required: true,
      unique: true,
      minlength: 5,
      maxlength: 1024,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

const schema = Joi.object({
  name: Joi.string().min(5).max(30).required(),
  email: Joi.string().min(5).max(255).required().email(),
  password: Joi.string().min(5).max(255).required(),
});

module.exports = {
  User,
  validate: (user) => schema.validate(user),
};
