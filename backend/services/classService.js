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

// ===============================
// Record a completed class
// ===============================
async function completeClass(uid, classType) {
  try {
    if (!uid) {
      throw new Error("UID is required");
    }

    if (!classType) {
      throw new Error("classType is required");
    }

    const normalizedType = String(classType).trim().toLowerCase();

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
    await emit(uid, "class_category_completed", { classType: normalizedType });

    // Morning class event
    const hour = new Date().getHours();
    if (hour < 12) {
      await emit(uid, "morning_class_completed");
    }

    return { success: true };
  } catch (err) {
    console.error("completeClass error:", err);
    throw err;
  }
}

// ===============================
// Get all completed classes for a user
// ===============================
async function getCompletedClasses(uid) {
  try {
    if (!uid) {
      throw new Error("UID is required");
    }

    return await ClassCompletion.findAll({
      where: { uid },
      order: [["completedAt", "DESC"]]
    });
  } catch (err) {
    console.error("getCompletedClasses error:", err);
    throw err;
  }
}

module.exports = {
  completeClass,
  getCompletedClasses
};
