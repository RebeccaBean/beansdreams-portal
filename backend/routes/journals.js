// backend/routes/journals.js
const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");
const journalsController = require("../controllers/journalsController");

router.post("/", requireAuth, journalsController.submitJournal);
router.get("/", requireAuth, journalsController.getJournals);

module.exports = router;
