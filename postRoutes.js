
const express = require("express");
const postController = require("../controllers/postController");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authenticateToken, postController.getAllPosts);

module.exports = router;
