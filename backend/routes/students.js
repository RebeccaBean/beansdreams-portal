const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");
const studentsController = require("../controllers/studentsController");

router.get("/:uid/dashboard", requireAuth, studentsController.getDashboard);
router.get("/:uid/badges", requireAuth, studentsController.getBadges);
router.post("/:uid/badges/update", requireAuth, studentsController.updateBadgeProgress);

router.post("/me/student-notes", requireAuth, studentsController.saveStudentNotes);
router.post("/me/session-links", requireAuth, studentsController.saveSessionLinks);

module.exports = router;
