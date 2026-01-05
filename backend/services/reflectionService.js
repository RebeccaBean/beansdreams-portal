// backend/services/reflectionService.js
const ReflectionEntry = require("../models/ReflectionEntry");
const { emit } = require("./badgeEventService");

/**
 * Submit a reflection or practice log
 */
async function submitReflection(uid, content, meta = {}) {
  if (!uid) throw new Error("UID is required");
  if (!content) throw new Error("Reflection content is required");

  const reflection = await ReflectionEntry.create({
    uid,
    content,
    meta,
    createdAt: new Date()
  });

  // Badge: reflections_submitted
  await emit(uid, "reflection_submitted");

  // Optional: if some reflections count as healing exercises
  if (meta.isHealingExercise) {
    await emit(uid, "healing_exercise_completed");
  }

  return reflection;
}

/**
 * Get reflections for a user
 */
async function getReflections(uid, filter = {}) {
  if (!uid) throw new Error("UID is required");

  return ReflectionEntry.findAll({
    where: { uid, ...filter },
    order: [["createdAt", "DESC"]]
  });
}

module.exports = {
  submitReflection,
  getReflections
};
