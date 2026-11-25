const express = require("express");
const opportunityController = require("../controllers/opportunityController");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
    "/",
    authenticateToken,
    opportunityController.getAllOpportunities
);

router.get(
    "/recommended",
    authenticateToken,
    opportunityController.getRecommendedOpportunities
);

router.get(
    "/:id",
    authenticateToken,
    opportunityController.getOpportunityById
);

router.post(
    "/",
    authenticateToken,
    opportunityController.createOpportunity
);

router.post(
    "/:id/skills",
    authenticateToken,
    opportunityController.addOpportunitySkill
);

router.get(
    "/:id/skills",
    authenticateToken,
    opportunityController.getOpportunitySkills
);

module.exports = router;