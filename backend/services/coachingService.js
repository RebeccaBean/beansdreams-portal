// backend/services/coachingService.js
const CoachingSession = require("../model/CoachingSession");
const { emit } = require("./badgeEventService");

/**
 * Record a completed coaching session and update badge progress
 */
async function completeCoachingSession(uid, sessionType = "general") {
  if (!uid) throw new Error("UID is required");

  // 1. Save coaching session completion
  await CoachingSession.create({
    uid,
    sessionType,
    completedAt: new Date()
  });

  // 2. Emit badge event
  await emit(uid, "coaching_session_completed");

  return { success: true };
}

/**
 * Get all completed coaching sessions for a user
 */
async function getCoachingHistory(uid) {
  if (!uid) throw new Error("UID is required");

  return CoachingSession.findAll({
    where: { uid },
    order: [["completedAt", "DESC"]]
  });
}

module.exports = {
  completeCoachingSession,
  getCoachingHistory
};
