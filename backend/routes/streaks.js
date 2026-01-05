// backend/routes/streaks.js
const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");
const streaksController = require("../controllers/streaksController");

router.get("/", requireAuth, streaksController.getStreak);

module.exports = router;
