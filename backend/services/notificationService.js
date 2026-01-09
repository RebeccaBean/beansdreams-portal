// backend/services/notificationService.js
const Notification = require("../model/Notification");
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

/**
 * Create a notification (in-app + optional email + optional badge event)
 */
async function createNotification(uid, message, options = {}) {
  const { email = false, badgeEvent = null, payload = {} } = options;

  // Save in-app notification
  const notification = await Notification.create({
    uid,
    message,
    read: false,
    createdAt: new Date()
  });

  // Send email if requested
  if (email && process.env.EMAIL_USER) {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: options.to || process.env.ADMIN_EMAIL,
      subject: "New Notification",
      text: message
    });
  }

  // Trigger badge event if provided
  if (badgeEvent) {
    await emit(uid, badgeEvent, payload);
  }

  return notification;
}

/**
 * Get notifications for a user
 */
async function getNotifications(uid) {
  return Notification.findAll({
    where: { uid },
    order: [["createdAt", "DESC"]]
  });
}

/**
 * Mark a notification as read
 */
async function markAsRead(uid, id) {
  const notification = await Notification.findOne({
    where: { id, uid }
  });

  if (!notification) return;

  notification.read = true;
  await notification.save();
}

module.exports = {
  createNotification,
  getNotifications,
  markAsRead
};
