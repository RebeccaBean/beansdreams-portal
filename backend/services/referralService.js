// backend/services/referralService.js
const Referral = require("../models/Referral");
const { updateBadgeProgressInternal } = require("./badgeService");

async function createReferral(referrerUid, email) {
  return Referral.create({
    referrerUid,
    referredEmail: email,
    status: "pending"
  });
}

async function markSignedUp(email) {
  const referral = await Referral.findOne({ where: { referredEmail: email } });
  if (!referral) return null;

  referral.status = "signed_up";
  await referral.save();

  // Award badge progress
  await updateBadgeProgressInternal(referral.referrerUid, "referrals_signed_up", 1);

  return referral;
}

async function markCompleted(email) {
  const referral = await Referral.findOne({ where: { referredEmail: email } });
  if (!referral) return null;

  referral.status = "completed";
  await referral.save();

  // Award badge progress
  await updateBadgeProgressInternal(referral.referrerUid, "referrals_completed", 1);

  return referral;
}

module.exports = {
  createReferral,
  markSignedUp,
  markCompleted
};
