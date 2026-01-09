// backend/services/streakService.js
const Streak = require("../model/Streak");
const { emit } = require("./badgeEventService");

/**
 * Update weekly streak when a class or session is completed
 * You call this from class/coaching completion flows.
 */
async function updateWeeklyStreak(uid, activityDate = new Date()) {
  if (!uid) throw new Error("UID is required");

  const today = new Date(activityDate);
  const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  let streak = await Streak.findOne({ where: { uid } });

  if (!streak) {
    streak = await Streak.create({
      uid,
      currentStreak: 1,
      lastActivityDate: todayDateOnly,
      longestStreak: 1
    });

    await emit(uid, "weekly_streak_incremented");
    return streak;
  }

  const last = new Date(streak.lastActivityDate);
  const diffDays = Math.floor((todayDateOnly - last) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    // same day, no change
    return streak;
  }

  if (diffDays === 1) {
    // continue streak
    streak.currentStreak += 1;
  } else {
    // streak broken
    streak.currentStreak = 1;
  }

  streak.lastActivityDate = todayDateOnly;

  if (streak.currentStreak > streak.longestStreak) {
    streak.longestStreak = streak.currentStreak;
  }

  await streak.save();

  // Badge event
  await emit(uid, "weekly_streak_incremented");

  return streak;
}

async function getStreak(uid) {
  if (!uid) throw new Error("UID is required");
  return Streak.findOne({ where: { uid } });
}

module.exports = {
  updateWeeklyStreak,
  getStreak
};
