const express = require("express");
const profileController = require("../controllers/profileController");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
    "/",
    authenticateToken,
    profileController.getProfile
);

module.exports = router;