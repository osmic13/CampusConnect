const express = require("express");

const authenticateToken = require("../middleware/authMiddleware");
const hodMiddleware = require("../middleware/hodMiddleware");
const hodController = require("../controllers/hodController");

const router = express.Router();

router.get(
    "/notices/pending",
    authenticateToken,
    hodMiddleware,
    hodController.getPendingNotices
);

router.patch(
    "/notices/:noticeId/review",
    authenticateToken,
    hodMiddleware,
    hodController.updateNoticeReview
);

module.exports = router;