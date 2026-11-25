
const express = require("express");
const noticeController = require("../controllers/noticeController");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
    "/published",
    authenticateToken,
    noticeController.getPublishedNotices
);

module.exports = router;
