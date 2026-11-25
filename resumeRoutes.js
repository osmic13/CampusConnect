const express = require("express");

const resumeController =
    require("../controllers/resumeController");

const authenticateToken =
    require("../middleware/authMiddleware");

const uploadResume =
    require("../middleware/uploadMiddleware");

const router = express.Router();

router.post(
    "/upload",
    authenticateToken,
    uploadResume.single("resume"),
    resumeController.uploadResume
);

router.get(
    "/",
    authenticateToken,
    resumeController.getResume
);

module.exports = router;