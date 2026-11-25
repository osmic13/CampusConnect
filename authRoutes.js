const express = require("express");
const authController = require("../controllers/authController");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/login", authController.login);

router.post(
    "/change-password",
    authenticateToken,
    authController.changePassword
);

router.post(
    "/forgot-password",
    authController.forgotPassword
);

router.post(
    "/verify-otp",
    authController.verifyOTP
);

router.post(
    "/reset-password",
    authController.resetPassword
);

module.exports = router;