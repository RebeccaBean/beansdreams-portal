// backend/routes/referralWebhooks.js
const express = require("express");
const router = express.Router();
const referralsController = require("../controllers/referralsController");
const verifyWebhookSecret = require("../middleware/verifyWebhookSecret");

// Secure server-to-server webhook endpoints
router.post("/signed-up", verifyWebhookSecret, referralsController.markSignedUp);
router.post("/completed", verifyWebhookSecret, referralsController.markCompleted);

module.exports = router;
