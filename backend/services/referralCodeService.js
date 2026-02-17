// backend/services/referralCodeService.js

const crypto = require("crypto");
const { referrals: Referral } = require("../db");

// ===============================
// Generate a short base code from UID
// ===============================
function generateBaseCode(referrerUid) {
  if (!referrerUid) {
    throw new Error("referrerUid is required to generate a referral code");
  }

  const randomPart = crypto.randomBytes(3).toString("hex"); // 6 chars

  // Base64 encode UID, strip non-alphanumerics, take first 4 chars
  const uidPart = Buffer.from(String(referrerUid))
    .toString("base64")
    .replace(/[^A-Z0-9]/gi, "")
    .slice(0, 4)
    .toUpperCase();

  return (uidPart + randomPart).toUpperCase();
}

// ===============================
// Generate a unique referral code
// ===============================
async function generateUniqueReferralCode(referrerUid) {
  try {
    if (!referrerUid) {
      throw new Error("referrerUid is required");
    }

    let attempts = 0;

    while (attempts < 5) {
      const code = generateBaseCode(referrerUid);

      const existing = await Referral.findOne({ where: { referralCode: code } });
      if (!existing) {
        return code;
      }

      attempts++;
    }

    // Fallback — extremely unlikely
    return crypto.randomUUID().split("-")[0].toUpperCase();
  } catch (err) {
    console.error("generateUniqueReferralCode error:", err);

    // Final fallback if something unexpected happens
    return crypto.randomUUID().split("-")[0].toUpperCase();
  }
}

module.exports = {
  generateUniqueReferralCode
};
