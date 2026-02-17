// backend/controllers/notificationsController.js

const notificationService = require("../services/notificationService");

// ===============================
// GET /notifications
// ===============================
exports.getNotifications = async (req, res) => {
  try {
    const uid = req.user.id;   // FIXED

    const notifications = await notificationService.getNotifications(uid);
    res.json({ notifications });
  } catch (err) {
    console.error("Get notifications error:", err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

// ===============================
// POST /notifications/:id/read
// ===============================
exports.markAsRead = async (req, res) => {
  try {
    const uid = req.user.id;   // FIXED
    const { id } = req.params;

    await notificationService.markAsRead(uid, id);
    res.json({ success: true });
  } catch (err) {
    console.error("Mark notification as read error:", err);
    res.status(500).json({ error: "Failed to mark notification as read" });
  }
};
