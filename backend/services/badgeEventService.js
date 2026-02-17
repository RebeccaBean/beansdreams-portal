// backend/services/badgeEventService.js

const badgeEvents = require("../badges/badgeEvents");
const { updateBadgeProgressInternal } = require("./badgeService");

// ===============================
// Emit a badge-related event
// ===============================
async function emit(uid, eventName, payload = {}) {
  try {
    if (!uid) {
      console.warn("Badge event ignored: missing UID");
      return;
    }

    const event = badgeEvents[eventName];
    if (!event) {
      console.warn(`Unknown badge event: ${eventName}`);
      return;
    }

    let progressKey = event.progressKey;

    // Dynamic mapping (e.g., class categories)
    if (!progressKey && typeof event.dynamic === "function") {
      progressKey = event.dynamic(payload);
    }

    if (!progressKey) {
      console.warn(`No progressKey resolved for event: ${eventName}`);
      return;
    }

    await updateBadgeProgressInternal(uid, progressKey, 1);
  } catch (err) {
    console.error("Badge event emit error:", err);
  }
}

module.exports = { emit };
