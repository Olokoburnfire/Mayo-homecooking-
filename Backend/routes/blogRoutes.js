const express = require("express");
const router = express.Router();
const {
  createBlog,
  getAllBlogs,
  getSingleBlog,
  updateBlog,
  deleteBlog,
  sendBlog,
  sendAllBlog,
} = require("../controllers/blogController");
const { protect, verify, admin } = require("../middleware/authMiddleware");

router.route("/").post(protect, verify, admin, createBlog);
router.route("/").get(getAllBlogs);
router.route("/:id").get(getSingleBlog);
router.route("/:id").put(protect, verify, admin, updateBlog);
router.route("/:id").delete(protect, verify, admin, deleteBlog);
router.route("/send/:id").post(protect, verify, admin, sendBlog);
router.route("/send-all/:id").post(protect, verify, admin, sendAllBlog);

module.exports = router;
