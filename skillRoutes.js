const express = require("express");
const skillController = require("../controllers/skillController");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
    "/",
    authenticateToken,
    skillController.getAllSkills
);

module.exports = router;