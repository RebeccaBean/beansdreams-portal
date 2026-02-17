// backend/services/uploadService.js

const Upload = require("../model/Upload");
const { emit } = require("./badgeEventService");

// ===============================
// Create an upload and trigger badge events
// ===============================
async function createUpload(uid, type, fileMeta = {}) {
  try {
    if (!uid) {
      throw new Error("UID is required");
    }

    if (!type) {
      throw new Error("Upload type is required");
    }

    const normalizedType = String(type).trim().toLowerCase();
    const safeMeta = typeof fileMeta === "object" && fileMeta !== null ? fileMeta : {};

    // Save upload record
    const upload = await Upload.create({
      uid,
      type: normalizedType,
      meta: safeMeta,
      uploadedAt: new Date()
    });

    // Emit badge events based on type
    try {
      if (normalizedType === "performance") {
        await emit(uid, "performance_uploaded");
      }

      if (normalizedType === "vocal_recording") {
        await emit(uid, "vocal_recording_uploaded");
      }

      if (normalizedType === "creative_submission") {
        await emit(uid, "creative_submission");
      }
    } catch (eventErr) {
      console.error("Upload badge event error:", eventErr);
      // Do not throw — upload should still succeed
    }

    return upload;
  } catch (err) {
    console.error("createUpload error:", err);
    throw err;
  }
}

// ===============================
// Get uploads for a user
// ===============================
async function getUploads(uid, filter = {}) {
  try {
    if (!uid) {
      throw new Error("UID is required");
    }

    const safeFilter = typeof filter === "object" && filter !== null ? filter : {};

    return await Upload.findAll({
      where: { uid, ...safeFilter },
      order: [["uploadedAt", "DESC"]]
    });
  } catch (err) {
    console.error("getUploads error:", err);
    throw err;
  }
}

module.exports = {
  createUpload,
  getUploads
};
