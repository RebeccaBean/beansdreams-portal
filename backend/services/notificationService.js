// backend/services/notificationService.js

const { notifications } = require("../db");
const nodemailer = require("nodemailer");
const { emit } = require("./badgeEventService");

// --- EMAIL TRANSPORTER ---
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ===============================
// Create a notification
// ===============================
async function createNotification(uid, message, options = {}) {
  try {
    if (!uid) {
      throw new Error("UID is required");
    }

    if (!message) {
      throw new Error("Notification message is required");
    }

    const { email = false, badgeEvent = null, payload = {}, to = null } = options;

    // Save in-app notification
    const notification = await notifications.create({
      uid,
      message,
      read: false,
      createdAt: new Date()
    });

    // Send email if requested
    if (email && process.env.EMAIL_USER) {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: to || process.env.ADMIN_EMAIL,
          subject: "New Notification",
          text: message
        });
      } catch (emailErr) {
        console.error("Email send error:", emailErr);
        // Do NOT throw — email failure shouldn't break notifications
      }
    }

    // Trigger badge event if provided
    if (badgeEvent) {
      try {
        await emit(uid, badgeEvent, payload);
      } catch (eventErr) {
        console.error("Badge event error:", eventErr);
      }
    }

    return notification;
  } catch (err) {
    console.error("createNotification error:", err);
    throw err;
  }
}

// ===============================
// Get notifications for a user
// ===============================
async function getNotifications(uid) {
  try {
    if (!uid) {
      throw new Error("UID is required");
    }

    return await notifications.findAll({
      where: { uid },
      order: [["createdAt", "DESC"]]
    });
  } catch (err) {
    console.error("getNotifications error:", err);
    throw err;
  }
}

// ===============================
// Mark a notification as read
// ===============================
async function markAsRead(uid, id) {
  try {
    if (!uid) {
      throw new Error("UID is required");
    }

    if (!id) {
      throw new Error("Notification ID is required");
    }

    const notification = await notifications.findOne({
      where: { id, uid }
    });

    if (!notification) {
      return null;
    }

    notification.read = true;
    await notification.save();

    return notification;
  } catch (err) {
    console.error("markAsRead error:", err);
    throw err;
  }
}

module.exports = {
  createNotification,
  getNotifications,
  markAsRead
};
