// backend/routes/coaching.js
const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");
const coachingController = require("../controllers/coachingController");

router.post("/complete", requireAuth, coachingController.completeSession);
router.get("/", requireAuth, coachingController.getHistory);

module.exports = router;
