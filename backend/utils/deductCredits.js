// backend/utils/deductCredits.js

const db = require("../db");
const { sendEmail } = require("./mailer");
const { lowCreditsWarningEmail } = require("./emailTemplates");

const LOW_CREDIT_THRESHOLD = 2;

/**
 * Deduct credits from a student and optionally send a low-credit warning.
 *
 * @param {string} uid - Student ID
 * @param {number} amount - Number of credits to deduct
 * @param {string|null} creditType - Optional credit type (e.g., "guitar", "dance")
 * @param {object} meta - Optional metadata for logging
 */
async function deductCredits(uid, amount, creditType = null, meta = {}) {
  try {
    const student = await db.students.findByPk(uid);
    if (!student) throw new Error("Student not found");

    // Ensure credits exist
    const currentCredits = student.credits || 0;
    const remaining = student.remainingCredits || { total: 0, byType: {} };

    // Deduct from total credits
    const newTotal = currentCredits - amount;
    student.credits = Math.max(newTotal, 0);

    // Deduct from type-specific credits if provided
    if (creditType) {
      const typeCount = remaining.byType[creditType] || 0;
      remaining.byType[creditType] = Math.max(typeCount - amount, 0);
    }

    // Update remainingCredits.total
    remaining.total = Math.max((remaining.total || 0) - amount, 0);
    student.remainingCredits = remaining;

    await student.save();

    // Log deduction in paymentHistory
    const historyEntry = {
      type: "credit_deduction",
      amount: -amount,
      creditType,
      meta,
      date: new Date().toISOString()
    };

    const history = student.paymentHistory || [];
    history.push(historyEntry);
    student.paymentHistory = history;
    await student.save();

    // 🔥 LOW CREDIT WARNING TRIGGER
    if (student.credits <= LOW_CREDIT_THRESHOLD) {
      const html = lowCreditsWarningEmail({
        brand: "Bean's Dreams",
        firstName: student.name.split(" ")[0],
        remainingCredits: student.credits,
        dashboardUrl: "https://portal.beansdreams.org/dashboard",
        supportEmail: "support@beansdreams.org",
        logoUrl: "https://yourcdn.com/logo.png",
        websiteUrl: "https://beansdreams.org"
      });

      await sendEmail(
        student.email,
        "You're running low on credits",
        html
      );
    }

    return student.credits;
  } catch (err) {
    console.error("deductCredits error:", err);
    throw err;
  }
}

module.exports = { deductCredits };
