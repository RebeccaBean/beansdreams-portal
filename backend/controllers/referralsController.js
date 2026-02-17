// backend/controllers/referralsController.js

const referralService = require("../services/referralService");
const { updateBadgeProgressInternal } = require("./badgesController");

// ===============================
// POST /referrals/create
// ===============================
exports.createReferral = async (req, res) => {
  try {
    const referrerUid = req.user?.uid || null;
    const { email, referralCode } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Missing required field: email" });
    }

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

// ===============================
// POST /referrals/signed-up
// ===============================
exports.markSignedUp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Missing required field: email" });
    }

    const referral = await referralService.markSignedUp(email);
    res.json({ success: true, referral });
  } catch (err) {
    console.error("Referral signup error:", err);
    res.status(500).json({ error: "Failed to update referral" });
  }
};

// ===============================
// POST /referrals/completed
// ===============================
exports.markCompleted = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Missing required field: email" });
    }

    const referral = await referralService.markCompleted(email);
    res.json({ success: true, referral });
  } catch (err) {
    console.error("Referral completion error:", err);
    res.status(500).json({ error: "Failed to update referral" });
  }
};
