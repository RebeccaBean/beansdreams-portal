// ===============================
// BADGE DEFINITIONS
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
// TEMP PROGRESS DATA (demo)
// Replace with real backend values later
// ===============================
const progressData = {
  classes_total: 3,
  classes_vocal: 1,
  classes_dance: 2,
  classes_guitar: 0,
  theory_lessons: 1,
  reflections_submitted: 0,
  healing_classes_completed: 0,
  healing_journals: 0,
  healing_exercises: 0,
  coaching_sessions: 1,
  morning_classes: 0,
  weekly_streak: 0,
  performance_uploads: 0,
  class_types_explored: 1,
  compositions_submitted: 0,
  rhythm_exercises: 0,
  creative_submissions: 0,
  vocal_recordings: 0,
  categories_completed: 1,
  referrals_paid: 0,
  shares: 0
};

// ===============================
// CONFETTI (simple DOM-based burst)
// ===============================
function triggerConfetti(x = window.innerWidth / 2, y = window.innerHeight / 2) {
  const confettiCount = 40;
  const colors = ["#FFD700", "#FF69B4", "#7C3AED", "#10B981", "#F97316"];

  for (let i = 0; i < confettiCount; i++) {
    const div = document.createElement("div");
    div.className = "confetti-piece";
    div.style.position = "fixed";
    div.style.left = `${x}px`;
    div.style.top = `${y}px`;
    div.style.width = "8px";
    div.style.height = "14px";
    div.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    div.style.opacity = "1";
    div.style.zIndex = "9999";
    div.style.borderRadius = "2px";

    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 6 + 4;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed - 6;

    let life = 0;
    const gravity = 0.25;

    function animate() {
      life += 1;
      const currentTop = parseFloat(div.style.top);
      const currentLeft = parseFloat(div.style.left);

      const newVy = vy + gravity * life;
      div.style.top = `${currentTop + newVy}px`;
      div.style.left = `${currentLeft + vx}px`;
      div.style.opacity = `${Math.max(0, 1 - life / 60)}`;

      if (life < 60) {
        requestAnimationFrame(animate);
      } else {
        div.remove();
      }
    }

    document.body.appendChild(div);
    requestAnimationFrame(animate);
  }
}

// ===============================
// LOCALSTORAGE: TRACK CELEBRATED BADGES
// ===============================
function getCelebratedBadges() {
  try {
    const raw = localStorage.getItem("celebratedBadges");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function setCelebratedBadges(map) {
  localStorage.setItem("celebratedBadges", JSON.stringify(map));
}

// ===============================
// RENDERING FUNCTIONS
// ===============================
function renderAchievementBadgesWithProgress(progressDataInput) {
  const list = document.getElementById("achievementBadgesList");
  if (!list) return;
  list.innerHTML = "";

  const celebrated = getCelebratedBadges();

  achievementBadges.forEach(badge => {
    const progress = progressDataInput[badge.progressKey] || 0;
    const percent = badge.maxProgress === "all"
      ? (progress >= 1 ? 100 : 0)
      : Math.min((progress / badge.maxProgress) * 100, 100);

    const li = document.createElement("li");
    li.className = "badge-item";

    li.innerHTML = `
      <span class="badge-icon">${badge.icon}</span>
      <span class="badge-label">${badge.name}</span>

      <div class="badge-tooltip">
        <strong>Requirement:</strong><br>
        ${badge.requirement}
        <div class="badge-progress">
          <div class="badge-progress-fill" style="width:${percent}%"></div>
        </div>
        <div style="font-size:0.75rem;margin-top:4px;">
          Progress: ${progress} / ${badge.maxProgress === "all" ? "All" : badge.maxProgress}
        </div>
      </div>
    `;

    const alreadyEarned = celebrated[badge.name] === true;
    const isNowEarned = percent >= 100;

    if (isNowEarned) {
      li.classList.add("earned", "pop-in");

      if (!alreadyEarned) {
        const rect = li.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        triggerConfetti(x, y);

        celebrated[badge.name] = true;
        setCelebratedBadges(celebrated);
      }

      setTimeout(() => {
        li.classList.remove("pop-in");
      }, 700);
    }

    list.appendChild(li);
  });
}

function renderReferralBadgesWithProgress(progressDataInput) {
  const list = document.getElementById("referralBadgesList");
  if (!list) return;
  list.innerHTML = "";

  const celebrated = getCelebratedBadges();

  referralBadges.forEach(badge => {
    const progress = progressDataInput[badge.progressKey] || 0;
    const percent = Math.min((progress / badge.maxProgress) * 100, 100);

    const li = document.createElement("li");
    li.className = "badge-item";

    li.innerHTML = `
      <span class="badge-icon referral">${badge.icon}</span>
      <span class="badge-label">${badge.name}</span>

      <div class="badge-tooltip">
        <strong>Requirement:</strong><br>
        ${badge.requirement}
        <div class="badge-progress">
          <div class="badge-progress-fill" style="width:${percent}%"></div>
        </div>
        <div style="font-size:0.75rem;margin-top:4px;">
          Progress: ${progress} / ${badge.maxProgress}
        </div>
      </div>
    `;

    const alreadyEarned = celebrated[badge.name] === true;
    const isNowEarned = percent >= 100;

    if (isNowEarned) {
      li.classList.add("earned", "pop-in");

      if (!alreadyEarned) {
        const rect = li.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        triggerConfetti(x, y);

        celebrated[badge.name] = true;
        setCelebratedBadges(celebrated);
      }

      setTimeout(() => {
        li.classList.remove("pop-in");
      }, 700);
    }

    list.appendChild(li);
  });
}

// ===============================
// PUBLIC INIT FUNCTION
// ===============================
function initBadges() {
  renderAchievementBadgesWithProgress(progressData);
  renderReferralBadgesWithProgress(progressData);
}
