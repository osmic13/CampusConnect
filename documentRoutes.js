const express = require("express");
const authenticateToken = require("../middleware/authMiddleware");
const uploadDocument = require("../middleware/documentUploadMiddleware");
const documentController = require("../controllers/documentController");

const router = express.Router();
router.use(authenticateToken);

const handleDocumentUpload = (req, res, next) => {
    uploadDocument.single("document")(req, res, (error) => {
        if (error) return res.status(400).json({ message: error.message || "Document upload failed" });
        next();
    });
};

router.get("/types", documentController.getDocumentTypes);
router.post("/", handleDocumentUpload, documentController.createRequest);
router.get("/mine", documentController.getMyRequests);
router.get("/inbox", documentController.getPendingRequests);
router.get("/:id/file", documentController.downloadLatestFile);
router.get("/:id", documentController.getRequestDetails);
router.patch("/:id/decision", documentController.decideRequest);
router.post("/:id/resubmit", handleDocumentUpload, documentController.resubmitRequest);

module.exports = router;
