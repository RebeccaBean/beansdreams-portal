// backend/routes/badges.js
const express = require("express");
const router = express.Router();
const badgesController = require("../controllers/badgesController");
const { requireAuth } = require("../middleware/auth");

// GET all badge progress for a student
router.get(
  "/students/:uid/badges",
  requireAuth,
  badgesController.getBadges
);

// UPDATE badge progress
router.post(
  "/students/:uid/badges/update",
  requireAuth,
  badgesController.updateBadgeProgress
);

module.exports = router;
