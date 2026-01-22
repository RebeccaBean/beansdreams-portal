// backend/utils/applyCredits.js

const db = require("../db");
const { sendEmail } = require("./mailer");
const { lowCreditsWarningEmail } = require("./emailTemplates");

// How many credits left before warning email is sent
const LOW_CREDIT_THRESHOLD = 2;

/**
 * Apply credits to a student and optionally send a low-credit warning.
 *
 * @param {string} uid - Student ID
 * @param {number} credits - Number of credits to add (can be negative)
 * @param {object} typeBreakdown - Optional breakdown of credit types
 * @param {object} meta - Optional metadata for logging
 */
async function applyCredits(uid, credits, typeBreakdown = {}, meta = {}) {
  try {
    const student = await db.students.findByPk(uid);
    if (!student) throw new Error("Student not found");

    // Ensure credits field exists
    const currentCredits = student.credits || 0;

    // Apply credits
    const newTotal = currentCredits + credits;
    student.credits = newTotal;
    await student.save();

    // Optional: Save credit history (if you have a table for this)
    if (db.creditHistory) {
      await db.creditHistory.create({
        studentId: uid,
        creditsChanged: credits,
        typeBreakdown,
        meta,
        createdAt: new Date().toISOString()
      });
    }

    // 🔥 LOW CREDIT WARNING TRIGGER
    if (newTotal <= LOW_CREDIT_THRESHOLD) {
      const html = lowCreditsWarningEmail({
        brand: "Bean's Dreams",
        firstName: student.name.split(" ")[0],
        remainingCredits: newTotal,
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

    return newTotal;
  } catch (err) {
    console.error("applyCredits error:", err);
    throw err;
  }
}

module.exports = { applyCredits };
