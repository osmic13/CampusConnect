
const express = require("express");
const authenticateToken = require("../middleware/authMiddleware");
const reactionController = require("../controllers/reactionController");

const router = express.Router();

router.use(authenticateToken);

router.post(
    "/:targetType/:id",
    reactionController.toggleReaction
);

module.exports = router;
