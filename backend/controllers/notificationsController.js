const notificationService = require("../services/notificationService");

exports.getNotifications = async (req, res) => {
  const uid = req.user.uid;
  const notifications = await notificationService.getNotifications(uid);
  res.json({ notifications });
};

exports.markAsRead = async (req, res) => {
  const uid = req.user.uid;
  const id = req.params.id;
  await notificationService.markAsRead(uid, id);
  res.json({ success: true });
};
