// backend/routes/reflections.js
const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");
const reflectionsController = require("../controllers/reflectionsController");

router.post("/", requireAuth, reflectionsController.submitReflection);
router.get("/", requireAuth, reflectionsController.getReflections);

module.exports = router;
