
const express = require("express");
const authenticateToken = require("../middleware/authMiddleware");
const chatController = require("../controllers/chatController");

const router = express.Router();

router.use(authenticateToken);

router.get("/conversations", chatController.getConversations);
router.post("/conversations", chatController.createConversation);

router.get(
    "/conversations/:id/messages",
    chatController.getMessages
);

router.post(
    "/conversations/:id/messages",
    chatController.sendMessage
);

router.get("/users", chatController.getAvailableUsers);

module.exports = router;
