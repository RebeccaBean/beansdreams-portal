// backend/services/badgeService.js
const BadgeProgress = require("../models/BadgeProgress");
const badgeDefinitions = require("../badges/badgeDefinitions");

exports.updateBadgeProgressInternal = async (uid, progressKey, increment = 1) => {
  let badgeDoc = await BadgeProgress.findOne({ where: { uid } });

  if (!badgeDoc) {
    badgeDoc = await BadgeProgress.create({ uid });
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
};
