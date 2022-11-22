const mongoose = require("mongoose");
const Joi = require("joi");

const tokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      minlength: 5,
      maxlength: 1024,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    createdAt: {
      type: Date,
      required: true,
      default: Date.now,
      expires: 3600,
    },
  },
  {
    timestamps: true,
  }
);

const Token = mongoose.model("Token", tokenSchema);

const schema = Joi.object({
  token: Joi.string().min(5).max(1024).required(),
  user: Joi.string().required(),
  type: Joi.string().required(),
  expires: Joi.date().required(),
});

module.exports = {
  Token,
  validate: (token) => schema.validate(token),
};
