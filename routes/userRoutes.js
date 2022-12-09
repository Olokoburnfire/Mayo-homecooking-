const express = require("express");
const router = express.Router();
const {
  createUser,
  loginUser,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  updatePassword,
} = require("../controllers/userController");
const { verify, protect, admin } = require("../middleware/authMiddleware");

router.route("/").post(createUser);
router.route("/login").post(loginUser);
router.route("/verify/:id/:token").get(verifyEmail);
router.route("/resend-verification-email").post(resendVerificationEmail);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password/:id/:token").get(resetPassword);
router.route("/update-password").put(protect, verify, updatePassword);

module.exports = router;
