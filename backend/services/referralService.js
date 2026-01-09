// backend/services/referralService.js

const { referrals: Referral } = require("../db");
const { Op } = require("sequelize");
const { updateBadgeProgressInternal } = require("../controllers/badgesController");

// Rate limiting config
const MAX_REFERRALS_PER_WINDOW = 5;
const REFERRAL_WINDOW_MINUTES = 10;

/**
 * Internal: check per-referrer rate limit.
 */
async function checkRateLimit(referrerUid) {
  const windowStart = new Date(Date.now() - REFERRAL_WINDOW_MINUTES * 60 * 1000);

  const count = await Referral.count({
    where: {
      referrerUid,
      createdAt: {
        [Op.gte]: windowStart
      }
    }
  });

  if (count >= MAX_REFERRALS_PER_WINDOW) {
    throw new Error(
      `Too many referrals. Please wait ${REFERRAL_WINDOW_MINUTES} minutes before creating more.`
    );
  }
}

/**
 * Resolve referrer from referral code (if you use codes as primary entry).
 * This assumes there is at least one referral row for that code.
 */
async function resolveReferrerUidFromCode(referralCode) {
  const existing = await Referral.findOne({ where: { referralCode } });
  if (!existing) {
    throw new Error("Invalid referral code");
  }
  return existing.referrerUid;
}

/**
 * Create a referral.
 * Accepts either:
 *  - referrerUid directly (logged-in user)
 *  - or referralCode (to resolve referrerUid)
 */
async function createReferral({ referrerUid, email, referralCode }) {
  if (!email) {
    throw new Error("Referred email is required");
  }

  let finalReferrerUid = referrerUid || null;

  // If UID not provided but code is, resolve code → UID
  if (!finalReferrerUid && referralCode) {
    finalReferrerUid = await resolveReferrerUidFromCode(referralCode);
  }

  if (!finalReferrerUid) {
    throw new Error("Missing referrerUid or valid referralCode");
  }

  // Rate limit: prevent spam from a single referrer
  await checkRateLimit(finalReferrerUid);

  // Duplicate prevention: email can only be referred once
  const existingReferral = await Referral.findOne({
    where: { referredEmail: email }
  });

  if (existingReferral) {
    throw new Error("This email has already been referred");
  }

  return Referral.create({
    referrerUid: finalReferrerUid,
    referredEmail: email,
    status: "pending"
  });
}

/**
 * Mark a referral as signed up.
 * Called from secure webhook (server-to-server).
 */
async function markSignedUp(email) {
  const referral = await Referral.findOne({ where: { referredEmail: email } });
  if (!referral) return null;

  referral.status = "signed_up";
  await referral.save();

  // Optional: if you later add badges for signups
  // await updateBadgeProgressInternal(referral.referrerUid, "referrals_signed_up", 1);

  return referral;
}

/**
 * Mark a referral as completed (paid).
 * Called from secure webhook (server-to-server).
 */
async function markCompleted(email) {
  const referral = await Referral.findOne({ where: { referredEmail: email } });
  if (!referral) return null;

  referral.status = "completed";
  await referral.save();

  // Award badge progress for paid referrals
  await updateBadgeProgressInternal(referral.referrerUid, "referrals_paid", 1);

  return referral;
}

module.exports = {
  createReferral,
  markSignedUp,
  markCompleted
};
