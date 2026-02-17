// backend/services/coachingService.js

const CoachingSession = require("../model/CoachingSession");
const { emit } = require("./badgeEventService");

// ===============================
// Record a completed coaching session
// ===============================
async function completeCoachingSession(uid, sessionType = "general") {
  try {
    if (!uid) {
      throw new Error("UID is required");
    }

    const normalizedType = String(sessionType).trim().toLowerCase();

    // Save coaching session completion
    await CoachingSession.create({
      uid,
      sessionType: normalizedType,
      completedAt: new Date()
    });

    // Emit badge event
    await emit(uid, "coaching_session_completed");

    return { success: true };
  } catch (err) {
    console.error("completeCoachingSession error:", err);
    throw err;
  }
}

// ===============================
// Get all completed coaching sessions for a user
// ===============================
async function getCoachingHistory(uid) {
  try {
    if (!uid) {
      throw new Error("UID is required");
    }

    return await CoachingSession.findAll({
      where: { uid },
      order: [["completedAt", "DESC"]]
    });
  } catch (err) {
    console.error("getCoachingHistory error:", err);
    throw err;
  }
}

module.exports = {
  completeCoachingSession,
  getCoachingHistory
};
