// backend/services/reflectionService.js

const ReflectionEntry = require("../model/ReflectionEntry");
const { emit } = require("./badgeEventService");

// ===============================
// Submit a reflection or practice log
// ===============================
async function submitReflection(uid, content, meta = {}) {
  try {
    if (!uid) {
      throw new Error("UID is required");
    }

    if (!content) {
      throw new Error("Reflection content is required");
    }

    const normalizedMeta = typeof meta === "object" && meta !== null ? meta : {};

    const reflection = await ReflectionEntry.create({
      uid,
      content,
      meta: normalizedMeta,
      createdAt: new Date()
    });

    // Badge: reflections_submitted
    await emit(uid, "reflection_submitted");

    // Optional: healing exercise badge
    if (normalizedMeta.isHealingExercise) {
      await emit(uid, "healing_exercise_completed");
    }

    return reflection;
  } catch (err) {
    console.error("submitReflection error:", err);
    throw err;
  }
}

// ===============================
// Get reflections for a user
// ===============================
async function getReflections(uid, filter = {}) {
  try {
    if (!uid) {
      throw new Error("UID is required");
    }

    const safeFilter = typeof filter === "object" && filter !== null ? filter : {};

    return await ReflectionEntry.findAll({
      where: { uid, ...safeFilter },
      order: [["createdAt", "DESC"]]
    });
  } catch (err) {
    console.error("getReflections error:", err);
    throw err;
  }
}

module.exports = {
  submitReflection,
  getReflections
};
