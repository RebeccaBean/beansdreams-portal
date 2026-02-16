// backend/services/uploadService.js
const Upload = require("../models/Upload");
const { emit } = require("./badgeEventService");

/**
 * Create an upload and trigger badge events
 * type examples:
 *  - "performance"
 *  - "vocal_recording"
 *  - "creative_submission"
 */
async function createUpload(uid, type, fileMeta = {}) {
  if (!uid) throw new Error("UID is required");
  if (!type) throw new Error("Upload type is required");

  const normalizedType = type.toLowerCase();

  // 1. Save upload record
  const upload = await Upload.create({
    uid,
    type: normalizedType,
    meta: fileMeta,
    uploadedAt: new Date()
  });

  // 2. Emit badge events based on type
  if (normalizedType === "performance") {
    await emit(uid, "performance_uploaded");
  }

  if (normalizedType === "vocal_recording") {
    await emit(uid, "vocal_recording_uploaded");
  }

  if (normalizedType === "creative_submission") {
    await emit(uid, "creative_submission");
  }

  return upload;
}

/**
 * Get uploads for a user
 */
async function getUploads(uid, filter = {}) {
  if (!uid) throw new Error("UID is required");

  return Upload.findAll({
    where: { uid, ...filter },
    order: [["uploadedAt", "DESC"]]
  });
}

module.exports = {
  createUpload,
  getUploads
};
