const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");
const notificationsController = require("../controllers/notificationsController");

router.get("/", requireAuth, notificationsController.getNotifications);
router.post("/:id/read", requireAuth, notificationsController.markAsRead);

module.exports = router;
