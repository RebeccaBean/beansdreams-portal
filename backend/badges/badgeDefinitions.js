// backend/badges/badgeDefinitions.js

// ===============================
// ACHIEVEMENT BADGES
// ===============================

const achievementBadges = [
  {
    name: "Rockstar Rookie",
    icon: "🌟",
    requirement: "Complete your first class of any type.",
    progressKey: "classes_total",
    maxProgress: 1
  },
  {
    name: "Vocal Virtuoso",
    icon: "🎤",
    requirement: "Complete 5 singing or voice classes.",
    progressKey: "classes_vocal",
    maxProgress: 5
  },
  {
    name: "Dance Dynamo",
    icon: "💃",
    requirement: "Complete 5 dance classes.",
    progressKey: "classes_dance",
    maxProgress: 5
  },
  {
    name: "Guitar Guru",
    icon: "🎸",
    requirement: "Complete 5 guitar classes.",
    progressKey: "classes_guitar",
    maxProgress: 5
  },
  {
    name: "Theory Titan",
    icon: "📘",
    requirement: "Complete 3 music theory lessons or exercises.",
    progressKey: "theory_lessons",
    maxProgress: 3
  },
  {
    name: "Creative Spark",
    icon: "✨",
    requirement: "Submit 3 reflection notes or practice logs.",
    progressKey: "reflections_submitted",
    maxProgress: 3
  },
  {
    name: "Healing Master",
    icon: "🧘",
    requirement: "Complete all Healing classes at least once. Unlocks code HEALME1 for 1 free Healing credit.",
    progressKey: "healing_classes_completed",
    maxProgress: "all"
  },
  {
    name: "Mindful Musician",
    icon: "🧠",
    requirement: "Complete 3 guided healing journal prompts.",
    progressKey: "healing_journals",
    maxProgress: 3
  },
  {
    name: "Wellness Warrior",
    icon: "💪",
    requirement: "Complete 5 guided healing exercises or journal prompts.",
    progressKey: "healing_exercises",
    maxProgress: 5
  },
  {
    name: "First Session",
    icon: "🎥",
    requirement: "Complete your first coaching session.",
    progressKey: "coaching_sessions",
    maxProgress: 1
  },
  {
    name: "Coaching Champion",
    icon: "🏆",
    requirement: "Complete 5 coaching sessions. Unlocks code COACHME1 for 1 free Coaching credit.",
    progressKey: "coaching_sessions",
    maxProgress: 5
  },
  {
    name: "Music Star",
    icon: "⭐",
    requirement: "Complete 10 music classes total.",
    progressKey: "classes_total",
    maxProgress: 10
  },
  {
    name: "Early Bird",
    icon: "🌅",
    requirement: "Book and attend 3 classes before noon.",
    progressKey: "morning_classes",
    maxProgress: 3
  },
  {
    name: "Persistent Performer",
    icon: "🔥",
    requirement: "Attend 7 consecutive weekly classes.",
    progressKey: "weekly_streak",
    maxProgress: 7
  },
  {
    name: "Collaborator",
    icon: "🤝",
    requirement: "Record and upload 3 performance submissions.",
    progressKey: "performance_uploads",
    maxProgress: 3
  },
  {
    name: "Explorer",
    icon: "🧭",
    requirement: "Try 3 different class types.",
    progressKey: "class_types_explored",
    maxProgress: 3
  },
  {
    name: "Composer in Training",
    icon: "🎼",
    requirement: "Submit 1 original composition.",
    progressKey: "compositions_submitted",
    maxProgress: 1
  },
  {
    name: "Rhythm Rockstar",
    icon: "🥁",
    requirement: "Complete all warm-up and rhythm exercises.",
    progressKey: "rhythm_exercises",
    maxProgress: "all"
  },
  {
    name: "Dance Floor Star",
    icon: "🌈",
    requirement: "Complete 10 dance classes.",
    progressKey: "classes_dance",
    maxProgress: 10
  },
  {
    name: "Innovation Icon",
    icon: "💡",
    requirement: "Submit 3 original compositions or creative exercises.",
    progressKey: "creative_submissions",
    maxProgress: 3
  },
  {
    name: "Singing Star",
    icon: "🎶",
    requirement: "Record yourself singing 3 songs or exercises.",
    progressKey: "vocal_recordings",
    maxProgress: 3
  },
  {
    name: "All-Rounder",
    icon: "🏅",
    requirement: "Complete at least one class in four different categories.",
    progressKey: "categories_completed",
    maxProgress: 4
  }
];

// ===============================
// REFERRAL BADGES
// ===============================

const referralBadges = [
  {
    name: "Referral Rockstar",
    icon: "🎉",
    requirement: "Refer 2 new paying students. Unlocks FRIENDS2.",
    progressKey: "referrals_paid",
    maxProgress: 2
  },
  {
    name: "Friend Zone",
    icon: "👯",
    requirement: "Refer 6 new students. Unlocks FRIENDS6.",
    progressKey: "referrals_paid",
    maxProgress: 6
  },
  {
    name: "Super Connector",
    icon: "🔗",
    requirement: "Refer 12 new students. Unlocks FRIENDS12.",
    progressKey: "referrals_paid",
    maxProgress: 12
  },
  {
    name: "Community Pillar",
    icon: "🏛️",
    requirement: "Refer 20 new students. Unlocks FRIENDS20.",
    progressKey: "referrals_paid",
    maxProgress: 20
  },
  {
    name: "Growth Ambassador",
    icon: "🌱",
    requirement: "Refer 28 new students. Unlocks FRIENDS28.",
    progressKey: "referrals_paid",
    maxProgress: 28
  },
  {
    name: "Social Sharer",
    icon: "📣",
    requirement: "Share your referral link on social media.",
    progressKey: "shares",
    maxProgress: 1
  },
  {
    name: "Community Amplifier",
    icon: "📢",
    requirement: "Share your referral link 5 times.",
    progressKey: "shares",
    maxProgress: 5
  },
  {
    name: "Social Star",
    icon: "🌟",
    requirement: "Share your referral link 10 times.",
    progressKey: "shares",
    maxProgress: 10
  },
  {
    name: "Marketing Maven",
    icon: "💼",
    requirement: "Share your referral link 20 times.",
    progressKey: "shares",
    maxProgress: 20
  },
  {
    name: "Community Leader",
    icon: "👑",
    requirement: "Share your referral link 50 times.",
    progressKey: "shares",
    maxProgress: 50
  }
];

// ===============================
// EXPORT
// ===============================

module.exports = {
  achievementBadges,
  referralBadges
};
