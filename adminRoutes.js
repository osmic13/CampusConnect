const express = require("express");

const adminController =
    require("../controllers/adminController");

const authenticateToken =
    require("../middleware/authMiddleware");

const adminMiddleware =
    require("../middleware/adminMiddleware");
const uploadSignature = require("../middleware/signatureUploadMiddleware");

const router = express.Router();


/*
    DASHBOARD
*/
router.get(
    "/dashboard",
    authenticateToken,
    adminMiddleware,
    adminController.getDashboard
);


/*
    USERS
*/
router.get(
    "/users",
    authenticateToken,
    adminMiddleware,
    adminController.getAllUsers
);


/*
    USER MANAGEMENT
*/
router.get(
    "/roles",
    authenticateToken,
    adminMiddleware,
    adminController.getAllRoles
);

router.post(
    "/users",
    authenticateToken,
    adminMiddleware,
    uploadSignature.single("signature"),
    adminController.createUser
);


router.put(
    "/users/:userId/signature",
    authenticateToken,
    adminMiddleware,
    uploadSignature.single("signature"),
    adminController.uploadUserSignature
);


/*
    OPPORTUNITIES
*/
router.get(
    "/opportunities",
    authenticateToken,
    adminMiddleware,
    adminController.getAllOpportunities
);


/*
    NOTICES
*/
router.get(
    "/notices",
    authenticateToken,
    adminMiddleware,
    adminController.getAllNotices
);


/*
    HODS
*/
router.get(
    "/hods",
    authenticateToken,
    adminMiddleware,
    adminController.getHODs
);


/*
    CREATE NOTICE
*/
router.post(
    "/notices",
    authenticateToken,
    adminMiddleware,
    adminController.createNotice
);


/*
    UPDATE NOTICE

    Used for:
    - rejected notices
    - approved notices that need changes

    Updating resets HOD approvals.
*/
router.patch(
    "/notices/:noticeId",
    authenticateToken,
    adminMiddleware,
    adminController.updateNotice
);


/*
    PUBLISH NOTICE

    Only APPROVED notices can
    be published.
*/
router.post(
    "/notices/:noticeId/publish",
    authenticateToken,
    adminMiddleware,
    adminController.publishNotice
);


/*
    OLD VERIFICATION ROUTE

    Kept temporarily so existing
    functionality does not break.
*/
router.patch(
    "/notices/:postId/verification",
    authenticateToken,
    adminMiddleware,
    adminController.updateNoticeVerification
);


module.exports = router;