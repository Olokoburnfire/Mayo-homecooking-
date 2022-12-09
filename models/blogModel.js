const mongoose = require("mongoose");
const Joi = require("joi");

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 30,
    },
    content: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 10000,
    },
    image: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["published", "unpublished"],
    },
  },
  {
    timestamps: true,
  }
);

const Blog = mongoose.model("Blog", blogSchema);

const validate = (blog) => {
  const schema = Joi.object({
    title: Joi.string().min(3).max(30).required(),
    content: Joi.string().min(5).max(10000).required(),
    status: Joi.string().required(),
  });

  return schema.validate(blog);
};

module.exports = {
  Blog,
  validate,
};
