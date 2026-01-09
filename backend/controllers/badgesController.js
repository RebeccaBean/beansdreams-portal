// backend/controllers/badgesController.js

// Load Sequelize model from db.js (factory pattern)
const { badgeProgress: BadgeProgress } = require("../db");

// Load badge definitions (achievement + referral)
const { achievementBadges, referralBadges } = require("../badges/badgeDefinitions");

// Combine all badges into one list
const allBadges = [...achievementBadges, ...referralBadges];

// Group badges by progressKey for fast lookup
const badgesByProgressKey = allBadges.reduce((acc, badge) => {
  if (!acc[badge.progressKey]) acc[badge.progressKey] = [];
  acc[badge.progressKey].push(badge);
  return acc;
}, {});

// ===============================
// GET /students/:uid/badges
// ===============================
exports.getBadges = async (req, res) => {
  try {
    const { uid } = req.params;

    let badgeDoc = await BadgeProgress.findOne({ where: { uid } });

    if (!badgeDoc) {
      badgeDoc = await BadgeProgress.create({ uid });
    }

    res.json({
      progress: badgeDoc.progress || {},
      earnedBadges: badgeDoc.earnedBadges || [],
      unlockedCodes: badgeDoc.unlockedCodes || [],
      achievementBadges,
      referralBadges
    });
  } catch (err) {
    console.error("getBadges error:", err);
    res.status(500).json({ error: "Failed to load badges" });
  }
};

// ===============================
// POST /students/:uid/badges/update
// ===============================
exports.updateBadgeProgress = async (req, res) => {
  try {
    const { uid } = req.params;
    const { progressKey, increment, setTo } = req.body;

    let badgeDoc = await BadgeProgress.findOne({ where: { uid } });

    if (!badgeDoc) {
      badgeDoc = await BadgeProgress.create({ uid });
    }

    const progress = badgeDoc.progress || {};
    const currentValue = progress[progressKey] || 0;

    // Determine new progress value
    const newValue =
      typeof setTo === "number"
        ? setTo
        : typeof increment === "number"
        ? currentValue + increment
        : currentValue;

    progress[progressKey] = newValue;

    // Track earned badges + unlocked codes
    const newlyEarnedBadges = [];
    const newlyUnlockedCodes = [];

    const earned = new Set(badgeDoc.earnedBadges || []);
    const unlocked = new Set(badgeDoc.unlockedCodes || []);

    const affectedBadges = badgesByProgressKey[progressKey] || [];

    for (const badge of affectedBadges) {
      const target = badge.maxProgress;

      const isEarned =
        target === "all" ? newValue >= 1 : newValue >= target;

      if (isEarned && !earned.has(badge.name)) {
        earned.add(badge.name);
        newlyEarnedBadges.push(badge.name);

        if (badge.rewardCode && !unlocked.has(badge.rewardCode)) {
          unlocked.add(badge.rewardCode);
          newlyUnlockedCodes.push(badge.rewardCode);
        }
      }
    }

    await badgeDoc.update({
      progress,
      earnedBadges: Array.from(earned),
      unlockedCodes: Array.from(unlocked)
    });

    res.json({
      progress,
      earnedBadges: Array.from(earned),
      unlockedCodes: Array.from(unlocked),
      newlyEarnedBadges,
      newlyUnlockedCodes
    });
  } catch (err) {
    console.error("updateBadgeProgress error:", err);
    res.status(500).json({ error: "Failed to update badge progress" });
  }
};

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

  const affectedBadges = badgesByProgressKey[progressKey] || [];

  for (const badge of affectedBadges) {
    const target = badge.maxProgress;
    const isEarned = target === "all" ? newValue >= 1 : newValue >= target;

    if (isEarned && !earned.has(badge.name)) {
      earned.add(badge.name);
      if (badge.rewardCode) unlocked.add(badge.rewardCode);
    }
  }

  await badgeDoc.update({
    progress,
    earnedBadges: Array.from(earned),
    unlockedCodes: Array.from(unlocked)
  });
};
