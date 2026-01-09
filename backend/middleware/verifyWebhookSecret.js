// backend/middleware/verifyWebhookSecret.js
module.exports = function verifyWebhookSecret(req, res, next) {
  const secret = req.headers["x-webhook-secret"];
  if (!secret || secret !== process.env.REFERRAL_WEBHOOK_SECRET) {
    return res.status(403).json({ message: "Invalid webhook secret" });
  }
  next();
};
