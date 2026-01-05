// backend/controllers/referralsController.js
const referralService = require("../services/referralService");

exports.createReferral = async (req, res) => {
  try {
    const referrerUid = req.user.uid;
    const { email } = req.body;

    const referral = await referralService.createReferral(referrerUid, email);
    res.json({ success: true, referral });
  } catch (err) {
    console.error("Create referral error:", err);
    res.status(500).json({ error: "Failed to create referral" });
  }
};

exports.markSignedUp = async (req, res) => {
  try {
    const { email } = req.body;
    const referral = await referralService.markSignedUp(email);

    res.json({ success: true, referral });
  } catch (err) {
    console.error("Referral signup error:", err);
    res.status(500).json({ error: "Failed to update referral" });
  }
};

exports.markCompleted = async (req, res) => {
  try {
    const { email } = req.body;
    const referral = await referralService.markCompleted(email);

    res.json({ success: true, referral });
  } catch (err) {
    console.error("Referral completion error:", err);
    res.status(500).json({ error: "Failed to update referral" });
  }
};
