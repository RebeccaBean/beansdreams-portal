// backend/controllers/referralsController.js

const referralService = require("../services/referralService");
const { updateBadgeProgressInternal } = require("./badgesController");

exports.createReferral = async (req, res) => {
  try {
    const referrerUid = req.user?.uid || null;
    const { email, referralCode } = req.body;

    // Track share (for badges)
    if (referrerUid) {
      await updateBadgeProgressInternal(referrerUid, "shares", 1);
    }

    const referral = await referralService.createReferral({
      referrerUid,
      email,
      referralCode
    });

    res.json({ success: true, referral });
  } catch (err) {
    console.error("Create referral error:", err);
    res.status(400).json({ error: err.message || "Failed to create referral" });
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
