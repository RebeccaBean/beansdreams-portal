// backend/services/classService.js
const ClassCompletion = require("../model/ClassCompletion");
const { updateBadgeProgressInternal } = require("./badgeService");
const { emit } = require("./badgeEventService");

// Map class types to badge progress keys
const CLASS_BADGE_MAP = {
  vocal: "classes_vocal",
  dance: "classes_dance",
  guitar: "classes_guitar",
  theory: "theory_lessons",
  healing: "healing_classes_completed"
};

/**
 * Record a completed class and update badge progress + badge events
 */
async function completeClass(uid, classType) {
  if (!uid) throw new Error("UID is required");
  if (!classType) throw new Error("classType is required");

  const normalizedType = classType.toLowerCase();

  // Save class completion
  await ClassCompletion.create({
    uid,
    classType: normalizedType,
    completedAt: new Date()
  });

  // Badge progress: total classes
  await updateBadgeProgressInternal(uid, "classes_total", 1);

  // Badge progress: category-specific
  const progressKey = CLASS_BADGE_MAP[normalizedType];
  if (progressKey) {
    await updateBadgeProgressInternal(uid, progressKey, 1);
  }

  // Badge events
  await emit(uid, "class_completed");
  await emit(uid, "class_category_completed", { classType });

  // Morning class event
  const hour = new Date().getHours();
  if (hour < 12) {
    await emit(uid, "morning_class_completed");
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
