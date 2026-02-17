// backend/services/referralService.js

const { referrals: Referral } = require("../db");
const { Op } = require("sequelize");
const { updateBadgeProgressInternal } = require("./badgeService");

// Rate limiting config
const MAX_REFERRALS_PER_WINDOW = 5;
const REFERRAL_WINDOW_MINUTES = 10;

// ===============================
// Internal: check per-referrer rate limit
// ===============================
async function checkRateLimit(referrerUid) {
  try {
    if (!referrerUid) {
      throw new Error("referrerUid is required for rate limiting");
    }

    const windowStart = new Date(Date.now() - REFERRAL_WINDOW_MINUTES * 60 * 1000);

    const count = await Referral.count({
      where: {
        referrerUid,
        createdAt: { [Op.gte]: windowStart }
      }
    });

    if (count >= MAX_REFERRALS_PER_WINDOW) {
      throw new Error(
        `Too many referrals. Please wait ${REFERRAL_WINDOW_MINUTES} minutes before creating more.`
      );
    }
  } catch (err) {
    console.error("checkRateLimit error:", err);
    throw err;
  }
}

// ===============================
// Resolve referrer from referral code
// ===============================
async function resolveReferrerUidFromCode(referralCode) {
  try {
    if (!referralCode) {
      throw new Error("Referral code is required");
    }

    const existing = await Referral.findOne({ where: { referralCode } });
    if (!existing) {
      throw new Error("Invalid referral code");
    }

    return existing.referrerUid;
  } catch (err) {
    console.error("resolveReferrerUidFromCode error:", err);
    throw err;
  }
}

// ===============================
// Create a referral
// ===============================
async function createReferral({ referrerUid, email, referralCode }) {
  try {
    if (!email) {
      throw new Error("Referred email is required");
    }

    let finalReferrerUid = referrerUid || null;

    // Resolve referral code → UID
    if (!finalReferrerUid && referralCode) {
      finalReferrerUid = await resolveReferrerUidFromCode(referralCode);
    }

    if (!finalReferrerUid) {
      throw new Error("Missing referrerUid or valid referralCode");
    }

    // Rate limit
    await checkRateLimit(finalReferrerUid);

    // Prevent duplicate referrals
    const existingReferral = await Referral.findOne({
      where: { referredEmail: email }
    });

    if (existingReferral) {
      throw new Error("This email has already been referred");
    }

    return await Referral.create({
      referrerUid: finalReferrerUid,
      referredEmail: email,
      status: "pending"
    });
  } catch (err) {
    console.error("createReferral error:", err);
    throw err;
  }
}

// ===============================
// Mark referral as signed up
// ===============================
async function markSignedUp(email) {
  try {
    if (!email) {
      throw new Error("Email is required");
    }

    const referral = await Referral.findOne({ where: { referredEmail: email } });
    if (!referral) return null;

    referral.status = "signed_up";
    await referral.save();

    // Optional future badge logic:
    // await updateBadgeProgressInternal(referral.referrerUid, "referrals_signed_up", 1);

    return referral;
  } catch (err) {
    console.error("markSignedUp error:", err);
    throw err;
  }
}

// ===============================
// Mark referral as completed (paid)
// ===============================
async function markCompleted(email) {
  try {
    if (!email) {
      throw new Error("Email is required");
    }

    const referral = await Referral.findOne({ where: { referredEmail: email } });
    if (!referral) return null;

    referral.status = "completed";
    await referral.save();

    // Award badge progress
    await updateBadgeProgressInternal(referral.referrerUid, "referrals_paid", 1);

    return referral;
  } catch (err) {
    console.error("markCompleted error:", err);
    throw err;
  }
}

module.exports = {
  createReferral,
  markSignedUp,
  markCompleted
};
