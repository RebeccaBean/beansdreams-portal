// backend/utils/useCreditsForClass.js

const db = require("../db");
const { deductCredits } = require("./deductCredits");

/**
 * Deduct credits for a class booking.
 *
 * @param {string} uid - Student ID
 * @param {number} amount - Credits to deduct (usually 1)
 * @param {string} classType - e.g. "guitar", "vocal", "dance"
 * @param {object} meta - Additional metadata (classId, calendlyEventId, etc.)
 */
async function useCreditsForClass(uid, amount = 1, classType = null, meta = {}) {
  try {
    // Deduct credits using your unified system
    const newTotal = await deductCredits(uid, amount, classType, {
      source: "class_booking",
      ...meta
    });

    // Log the transaction in SQL
    await db.creditTransactions.create({
      studentId: uid,
      delta: -amount,
      typeBreakdown: classType ? { [classType]: amount } : {},
      source: "class_booking",
      meta
    });

    return newTotal;
  } catch (err) {
    console.error("useCreditsForClass error:", err);
    throw err;
  }
}

module.exports = { useCreditsForClass };
