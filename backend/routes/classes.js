// backend/routes/classes.js
const express = require("express");
const router = express.Router();
const classesController = require("../controllers/classesController");
const { requireAuth } = require("../middleware/auth");

// Mark a class as completed
router.post("/complete", requireAuth, classesController.completeClass);

module.exports = router;
