// backend/services/classService.js
const ClassCompletion = require("../models/ClassCompletion");
const { updateBadgeProgressInternal } = require("./badgeService");

// Map class types to badge progress keys
const CLASS_BADGE_MAP = {
  vocal: "classes_vocal",
  dance: "classes_dance",
  guitar: "classes_guitar",
  theory: "theory_lessons",
  healing: "healing_classes_completed"
};

/**
 * Record a completed class and update badge progress
 */
async function completeClass(uid, classType) {
  if (!uid) throw new Error("UID is required");
  if (!classType) throw new Error("classType is required");

  const normalizedType = classType.toLowerCase();

  // Validate class type
  if (!CLASS_BADGE_MAP[normalizedType]) {
    console.warn(`Unknown classType "${classType}" — no badge mapping found.`);
  }

  // 1. Save class completion
  await ClassCompletion.create({
    uid,
    classType: normalizedType,
    completedAt: new Date()
  });

  // 2. Always increment total classes
  await updateBadgeProgressInternal(uid, "classes_total", 1);

  // 3. Increment category-specific badge progress
  const progressKey = CLASS_BADGE_MAP[normalizedType];
  if (progressKey) {
    await updateBadgeProgressInternal(uid, progressKey, 1);
  }

  return { success: true };
}

/**
 * Get all completed classes for a user
 */
async function getCompletedClasses(uid) {
  if (!uid) throw new Error("UID is required");

  return ClassCompletion.findAll({
    where: { uid },
    order: [["completedAt", "DESC"]]
  });
}

module.exports = {
  completeClass,
  getCompletedClasses
};

// backend/services/classService.js
const { emit } = require("./badgeEventService");

async function completeClass(uid, classType) {
  await ClassCompletion.create({ uid, classType, completedAt: new Date() });

  await emit(uid, "class_completed");
  await emit(uid, "class_category_completed", { classType });

  return { success: true };
}
const classDate = new Date();
const hour = classDate.getHours();

if (hour < 12) {
  await emit(uid, "morning_class_completed");
}
async function updateWeeklyStreak(uid) {
  const streak = await calculateStreak(uid);

  if (streak.incremented) {
    await emit(uid, "weekly_streak_incremented");
  }
}
