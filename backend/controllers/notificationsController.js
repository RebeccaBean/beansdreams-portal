// backend/controllers/notificationsController.js

const notificationService = require("../services/notificationService");

// ===============================
// GET /notifications
// ===============================
exports.getNotifications = async (req, res) => {
  try {
    const uid = req.user?.uid;
    if (!uid) {
      return res.status(401).json({ error: "Unauthorized: Missing user UID" });
    }

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
    const uid = req.user?.uid;
    if (!uid) {
      return res.status(401).json({ error: "Unauthorized: Missing user UID" });
    }

    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Missing notification ID" });
    }

    await notificationService.markAsRead(uid, id);
    res.json({ success: true });
  } catch (err) {
    console.error("Mark notification as read error:", err);
    res.status(500).json({ error: "Failed to mark notification as read" });
  }
};
