const bcrypt = require("bcrypt");
const generateToken = require("../utils/generateToken");
const _ = require("lodash");
const { User, validate } = require("../models/userModel");
const { successMsg, errorMsg } = require("../utils/response");
const { Token } = require("../models/tokenModel");
const sgMail = require("@sendgrid/mail");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const Joi = require("joi");

// @desc    Sign up a new user
// @route   POST /api/users
// @access  Public
const createUser = async (req, res) => {
  try {
    const { error } = validate(req.body);
    if (error) return errorMsg(res, error.details[0].message, 400);
    let user = await User.findOne({ email: req.body.email });
    if (user) return errorMsg(res, "User already registered.", 400);

    user = new User(_.pick(req.body, ["name", "email", "password"]));
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    user = await user.save();

    const verifyToken = await new Token({
      userId: user._id,
      token: Math.floor(100000 + Math.random() * 900000),
    }).save();

    const url = `${process.env.BASE_URL}/user/verify/${user._id}/${verifyToken.token}`;

    await sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const msg = {
      to: user.email,
      from: {
        email: process.env.USER,
        name: process.env.NAME,
      },
      subject: "Verify your email address",
      text: `Please verify your email address by clicking the link below:
      here is your link: ${url}`,
      html: `<strong>Please verify your email address by clicking the link below:
      here is your link: ${url}</strong>`,
    };
    await sgMail.send(msg);

    const token = generateToken(user);
    successMsg(
      res,
      {
        user: _.pick(user, ["_id", "name", "email"]),
        token,
      },
      201
    );
  } catch (error) {
    errorMsg(res, error.message, 500);
  }
};

// @desc    Login a user
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { error } = validateLogin(req.body);
    if (error) return errorMsg(res, error.details[0].message, 400);

    const user = await User.findOne({
      email: req.body.email,
    });

    if (!user.verified) {
      return errorMsg(res, "Please verify your email address.", 400);
    }

    if (!user) return errorMsg(res, "Invalid email or password.", 400);

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword) return errorMsg(res, "Invalid email or password.", 400);

    const token = generateToken(user);
    res
      .header("x-auth-token", token)
      .status(200)
      .json({
        success: true,
        message: "Login successful",
        data: {
          user: _.pick(user, ["_id", "name", "email"]),
          token,
        },
      });
  } catch (error) {
    errorMsg(res, error.message, 500);
  }
};

// @desc  Verify user email
// @route GET /api/users/verify-email
// @access Public
const verifyEmail = async (req, res) => {
  try {
    const { id, token } = req.params;

    const user = await User.findById(id);
    if (!user) return errorMsg(res, "User not found.", 404);

    const verifyToken = await Token.findOne({ id, token });
    if (!verifyToken) return errorMsg(res, "Invalid or expired token.", 400);

    user.verified = true;
    user.verifyToken = undefined;
    await user.save();
    await verifyToken.deleteOne();

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const msg = {
      to: user.email,
      from: {
        email: process.env.USER,
        name: process.env.NAME,
      },
      subject: "Email address verified",
      text: "Your email address has been verified.",
      html: "<strong>Your email address has been verified.</strong>",
    };
    await sgMail.send(msg);

    successMsg(res, "Email verified successfully.", null, 200);
  } catch (error) {
    errorMsg(res, error.message, 500);
  }
};

// @desc  Resend verification email
// @route POST /api/users/resend-verification-email
// @access Public
const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return errorMsg(res, "User not found.", 404);

    if (user.verified) return errorMsg(res, "Email already verified.", 400);

    const verifyToken = await new Token({
      userId: user._id,
      token: crypto.randomBytes(32).toString("hex"),
    }).save();

    const url = `${process.env.BASE_URL}/user/${user._id}/verify/${verifyToken.token}`;

    await sendEmail(user.email, "Verify your email address", url);

    successMsg(res, "Verification email sent.", null, 200);
  } catch (error) {
    errorMsg(res, error.message, 500);
    console.log(error);
  }
};

// @desc  Forgot password
// @route POST /api/users/forgot-password
// @access Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return errorMsg(res, "User not found.", 404);

    const resetToken = await new Token({
      userId: user._id,
      token: Math.floor(100000 + Math.random() * 900000),
    }).save();

    const url = `${process.env.BASE_URL}/user/reset-password/${user._id}/${resetToken.token}`;

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const msg = {
      to: user.email,
      from: {
        email: process.env.USER,
        name: process.env.NAME,
      },
      subject: "Reset your password",
      text: `Please reset your password by clicking the link below:
      here is your link: ${url}`,
      html: `<strong>Please reset your password by clicking the link below:
      here is your link: ${url}</strong>`,
    };
    await sgMail.send(msg);

    successMsg(res, "Password reset email sent.", null, 200);
  } catch (error) {
    errorMsg(res, error.message, 500);
  }
};

// @desc  Reset password
// @route POST /api/users/reset-password
// @access Public
const resetPassword = async (req, res) => {
  try {
    const { id, token } = req.params;

    console.log(id, token, req.params);

    const user = await User.findById(id);
    if (!user) return errorMsg(res, "User not found.", 404);

    const resetToken = await Token.findOne({ id, token });
    if (!resetToken) return errorMsg(res, "Invalid or expired token.", 400);

    const { error } = validatePassword(req.body);
    if (error) return errorMsg(res, error.details[0].message, 400);

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);
    user.resetToken = undefined;
    await user.save();
    await resetToken.deleteOne();

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const msg = {
      to: user.email,
      from: {
        email: process.env.USER,
        name: process.env.NAME,
      },
      subject: "Password reset",
      text: "Your password has been reset.",
      html: "<strong>Your password has been reset.</strong>",
    };

    await sgMail.send(msg);

    successMsg(res, "Password reset successfully.", null, 200);
  } catch (error) {
    errorMsg(res, error.message, 500);
  }
};

// @desc Update user password
// @route PUT /api/users/update-password
// @access Private
const updatePassword = async (req, res) => {
  try {
    const { error } = validatePassword(req.body);

    if (error) return errorMsg(res, error.details[0].message, 400);

    const user = await User.findById(req.user._id);

    const validPassword = await bcrypt.compare(
      req.body.currentPassword,
      user.password
    );

    if (!validPassword) return errorMsg(res, "Invalid password.", 400);

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);
    await user.save();

    successMsg(res, "Password updated successfully.", null, 200);
  } catch (error) {
    errorMsg(res, error.message, 500);
  }
};

// @desc  Update user profile
// @route PUT /api/users/update-profile
// @access Private
const updateProfile = async (req, res) => {
  try {
    const { error } = validateProfile(req.body);

    if (error) return errorMsg(res, error.details[0].message, 400);

    const user = await User.findById(req.user._id);

    user.name = req.body.name;
    user.email = req.body.email;

    await user.save();

    successMsg(res, "Profile updated successfully.", null, 200);
  } catch (error) {
    errorMsg(res, error.message, 500);
  }
};

// @desc  Delete user
// @route DELETE /api/users/delete
// @access Private
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user._id);

    successMsg(res, "User deleted successfully.", null, 200);
  } catch (error) {
    errorMsg(res, error.message, 500);
  }
};

const validatePassword = (user) => {
  const schema = Joi.object({
    password: Joi.string().min(6).max(255).required(),
  });

  return schema.validate(user);
};

const validateProfile = (user) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(255).required(),
    email: Joi.string().min(6).max(255).required().email(),
  });

  return schema.validate(user);
};

const validateLogin = (user) => {
  const schema = Joi.object({
    email: Joi.string().min(6).max(255).required().email(),
    password: Joi.string().min(6).max(255).required(),
  });

  return schema.validate(user);
};

module.exports = {
  createUser,
  loginUser,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  updatePassword,
  updateProfile,
  deleteUser,
};
