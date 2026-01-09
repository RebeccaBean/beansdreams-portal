// backend/routes/referralLeaderboard.js

const express = require("express");
const router = express.Router();
const referralLeaderboardController = require("../controllers/referralLeaderboardController");

// Public or protected, depending on your app design
router.get("/", referralLeaderboardController.getTopReferrers);

module.exports = router;
