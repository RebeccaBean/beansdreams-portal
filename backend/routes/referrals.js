// backend/routes/referrals.js
const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");
const referralsController = require("../controllers/referralsController");

router.post("/", requireAuth, referralsController.createReferral);
router.post("/signed-up", referralsController.markSignedUp);
router.post("/completed", referralsController.markCompleted);

module.exports = router;
