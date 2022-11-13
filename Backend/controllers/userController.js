const bcrypt = require("bcrypt");
const generateToken = require("../utils/generateToken");
const _ = require("lodash");
const { User, validate } = require("../models/userModel");
const { successMsg, errorMsg } = require("../utils/response");
const sgMail = require("@sendgrid/mail");

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
    await user.save();

    const token = generateToken(user);
    successMsg(
      res,
      "User created successfully.",
      { user: _.pick(user, ["_id", "name", "email"]), token },
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
    const { error } = validate(req.body);
    if (error) return errorMsg(res, error.details[0].message, 400);

    let user = await User.findOne({ email: req.body.email });
    if (!user) return errorMsg(res, "Invalid email or password.", 400);

    if (user.status !== "active")
      return errorMsg(res, "User account is not active.", 400);

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword) return errorMsg(res, "Invalid email or password.", 400);

    const token = generateToken(user);
    successMsg(
      res,
      "User logged in successfully.",
      { user: _.pick(user, ["_id", "name", "email"]), token },
      200
    );
  } catch (error) {
    errorMsg(res, error.message, 500);
  }
};

// @desc  Verify user email
// @route GET /api/users/verify-email
// @access Public
const verifyEmail = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.query.email });
    if (!user) return errorMsg(res, "User not found.", 404);
    if (user.status === "active")
      return errorMsg(res, "User already verified.", 400);
    if (user.verificationToken !== req.query.token)
      return errorMsg(res, "Invalid verification token.", 400);
    user.status = "active";
    user.verificationToken = "";
    await user.save();
    successMsg(res, "User verified successfully.", null, 200);
  } catch (error) {
    errorMsg(res, error.message, 500);
  }
};

// @desc  Resend verification email
// @route POST /api/users/resend-verification-email
// @access Public
const resendVerificationEmail = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return errorMsg(res, "User not found.", 404);
    if (user.status === "active")
      return errorMsg(res, "User already verified.", 400);

    const token = generateToken(user);
    user.verificationToken = token;
    await user.save();

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const msg = {
      to: user.email,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject: "Verify your email address",
      html: `<p>Hi ${user.name},</p>
            <p>Thanks for signing up for an account!</p>
            <p>Please verify your email address by clicking on the link below.</p>
            <p><a href="${process.env.CLIENT_URL}/verify-email?email=${user.email}&token=${token}">Verify Email</a></p>
            <p>If you did not request this, please ignore this email.</p>
            <p>Thanks,</p>
            <p>Admin</p>`,
    };
    await sgMail.send(msg);
    successMsg(res, "Verification email sent successfully.", null, 200);
  } catch (error) {
    errorMsg(res, error.message, 500);
  }
};

module.exports = {
  createUser,
  loginUser,
};
