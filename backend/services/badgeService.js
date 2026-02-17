// backend/services/badgeService.js

const { badgeProgress } = require("../db");
const badgeDefinitions = require("../badges/badgeDefinitions");

// ===============================
// INTERNAL: Update badge progress
// ===============================
exports.updateBadgeProgressInternal = async (uid, progressKey, increment = 1) => {
  try {
    if (!uid) {
      console.warn("Badge update skipped: missing UID");
      return null;
    }

    if (!progressKey) {
      console.warn("Badge update skipped: missing progressKey");
      return null;
    }

    let badgeDoc = await badgeProgress.findOne({ where: { uid } });

    if (!badgeDoc) {
      badgeDoc = await badgeProgress.create({
        uid,
        progress: {},
        earnedBadges: [],
        unlockedCodes: []
      });
    }

    const progress = badgeDoc.progress || {};
    const currentValue = progress[progressKey] || 0;
    const newValue = currentValue + increment;

    progress[progressKey] = newValue;

    const earned = new Set(badgeDoc.earnedBadges || []);
    const unlocked = new Set(badgeDoc.unlockedCodes || []);

    const affectedBadges = badgeDefinitions.byProgressKey[progressKey] || [];

    for (const badge of affectedBadges) {
      const target = badge.maxProgress;
      const isEarned = target === "all" ? newValue >= 1 : newValue >= target;

      if (isEarned && !earned.has(badge.name)) {
        earned.add(badge.name);

        if (badge.rewardCode) {
          unlocked.add(badge.rewardCode);
        }
      }
    }

    await badgeDoc.update({
      progress,
      earnedBadges: Array.from(earned),
      unlockedCodes: Array.from(unlocked)
    });

    return badgeDoc;
  } catch (err) {
    console.error("Badge progress update error:", err);
    return null;
  }
};

// ===============================
// PUBLIC: Get badge progress
// ===============================
exports.getBadgeProgress = async (uid) => {
  try {
    if (!uid) {
      console.warn("Get badge progress skipped: missing UID");
      return { progress: {}, earnedBadges: [], unlockedCodes: [] };
    }

    let badgeDoc = await badgeProgress.findOne({ where: { uid } });

    if (!badgeDoc) {
      badgeDoc = await badgeProgress.create({
        uid,
        progress: {},
        earnedBadges: [],
        unlockedCodes: []
      });
    }

    return {
      progress: badgeDoc.progress || {},
      earnedBadges: badgeDoc.earnedBadges || [],
      unlockedCodes: badgeDoc.unlockedCodes || []
    };
  } catch (err) {
    console.error("Get badge progress error:", err);
    return { progress: {}, earnedBadges: [], unlockedCodes: [] };
  }
};

