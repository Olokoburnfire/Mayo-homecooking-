const express = require("express");
const router = express.Router();
const { createUser, loginUser } = require("../controllers/userController");

router.route("/").post(createUser);
router.post("/login", loginUser);

module.exports = router;
