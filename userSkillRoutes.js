const express = require("express");
const userSkillController = require("../controllers/userSkillController");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
    "/",
    authenticateToken,
    userSkillController.getUserSkills
);

router.post(
    "/",
    authenticateToken,
    userSkillController.addUserSkill
);

module.exports = router;