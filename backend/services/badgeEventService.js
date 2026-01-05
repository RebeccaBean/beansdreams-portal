// backend/services/badgeEventService.js
const badgeEvents = require("../badges/badgeEvents");
const { updateBadgeProgressInternal } = require("./badgeService");

async function emit(uid, eventName, payload = {}) {
  const event = badgeEvents[eventName];
  if (!event) {
    console.warn(`Unknown badge event: ${eventName}`);
    return;
  }

  let progressKey = event.progressKey;

  // Dynamic mapping (e.g., class categories)
  if (!progressKey && event.dynamic) {
    progressKey = event.dynamic(payload);
  }

  if (!progressKey) {
    console.warn(`No progressKey resolved for event: ${eventName}`);
    return;
  }

  await updateBadgeProgressInternal(uid, progressKey, 1);
}

module.exports = { emit };
