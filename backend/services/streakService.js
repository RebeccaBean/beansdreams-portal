// backend/services/streakService.js

const Streak = require("../model/Streak");
const { emit } = require("./badgeEventService");

// ===============================
// Update weekly streak
// ===============================
async function updateWeeklyStreak(uid, activityDate = new Date()) {
  try {
    if (!uid) {
      throw new Error("UID is required");
    }

    const today = new Date(activityDate);
    const todayDateOnly = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    let streak = await Streak.findOne({ where: { uid } });

    // First-ever streak entry
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
    const diffDays = Math.floor(
      (todayDateOnly - last) / (1000 * 60 * 60 * 24)
    );

    // Same day → no change
    if (diffDays === 0) {
      return streak;
    }

    // Continue streak
    if (diffDays === 1) {
      streak.currentStreak += 1;
    } else {
      // Streak broken
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
  } catch (err) {
    console.error("updateWeeklyStreak error:", err);
    throw err;
  }
}

// ===============================
// Get streak for a user
// ===============================
async function getStreak(uid) {
  try {
    if (!uid) {
      throw new Error("UID is required");
    }

    return await Streak.findOne({ where: { uid } });
  } catch (err) {
    console.error("getStreak error:", err);
    throw err;
  }
}

module.exports = {
  updateWeeklyStreak,
  getStreak
};
