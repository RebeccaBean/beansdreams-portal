// backend/utils/refundCredits.js

const db = require("../db");
const { applyCredits } = require("./applyCredits");

/**
 * Refund credits to a student.
 *
 * @param {string} uid - Student ID
 * @param {number} amount - Credits to refund
 * @param {string|null} classType - Optional credit type
 * @param {object} meta - Metadata (classId, reason, etc.)
 */
async function refundCredits(uid, amount = 1, classType = null, meta = {}) {
  try {
    const newTotal = await applyCredits(uid, amount, classType ? { [classType]: amount } : {}, {
      source: "refund",
      ...meta
    });

    // Log refund in SQL
    await db.creditTransactions.create({
      studentId: uid,
      delta: amount,
      typeBreakdown: classType ? { [classType]: amount } : {},
      source: "refund",
      meta
    });

    return newTotal;
  } catch (err) {
    console.error("refundCredits error:", err);
    throw err;
  }
}

module.exports = { refundCredits };
