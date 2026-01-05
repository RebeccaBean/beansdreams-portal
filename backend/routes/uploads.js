// backend/routes/uploads.js
const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");
const uploadsController = require("../controllers/uploadsController");

router.post("/", requireAuth, uploadsController.createUpload);
router.get("/", requireAuth, uploadsController.getUploads);

module.exports = router;
