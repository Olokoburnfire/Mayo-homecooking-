const mongoose = require("mongoose");
const Joi = require("joi");

const faqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 30,
    },
    answer: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 255,
    },
  },
  {
    timestamps: true,
  }
);

const Faq = mongoose.model("Faq", faqSchema);

const validate = (faq) => {
  const schema = Joi.object({
    question: Joi.string().min(3).max(30).required(),
    answer: Joi.string().min(5).max(255).required(),
  });

  return schema.validate(faq);
};

module.exports = {
  Faq,
  validate,
};
