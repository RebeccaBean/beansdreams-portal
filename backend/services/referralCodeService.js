// backend/services/referralCodeService.js

const crypto = require("crypto");
const { referrals: Referral } = require("../db");

function generateBaseCode(referrerUid) {
  // Short hash from UID + random bytes
  const randomPart = crypto.randomBytes(3).toString("hex"); // 6 chars
  const uidPart = Buffer.from(referrerUid).toString("base64").replace(/[^A-Z0-9]/gi, "").slice(0, 4);
  return (uidPart + randomPart).toUpperCase();
}

async function generateUniqueReferralCode(referrerUid) {
  let attempts = 0;

  while (attempts < 5) {
    const code = generateBaseCode(referrerUid);

    const existing = await Referral.findOne({ where: { referralCode: code } });
    if (!existing) return code;

    attempts++;
  }

  // Fallback, very unlikely to reach here
  return crypto.randomUUID().split("-")[0].toUpperCase();
}

module.exports = {
  generateUniqueReferralCode
};
