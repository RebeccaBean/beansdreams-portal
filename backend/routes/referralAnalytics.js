// backend/routes/referralAnalytics.js

const express = require("express");
const router = express.Router();
const referralAnalyticsController = require("../controllers/referralAnalyticsController");

// You may want to protect these with admin auth middleware
router.get("/overview", referralAnalyticsController.getOverviewStats);
router.get("/referrer/:uid", referralAnalyticsController.getReferrerStats);
router.get("/timeline", referralAnalyticsController.getReferralsOverTime);

module.exports = router;
