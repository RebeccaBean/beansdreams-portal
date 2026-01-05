// backend/badges/badgeEvents.js

module.exports = {
  class_completed: {
    progressKey: "classes_total"
  },

  class_category_completed: {
    dynamic: (payload) => {
      const map = {
        vocal: "classes_vocal",
        dance: "classes_dance",
        guitar: "classes_guitar",
        theory: "theory_lessons",
        healing: "healing_classes_completed"
      };
      return map[payload.classType] || null;
    }
  },

  reflection_submitted: {
    progressKey: "reflections_submitted"
  },

  journal_submitted: {
    progressKey: "healing_journals"
  },

  healing_exercise_completed: {
    progressKey: "healing_exercises"
  },

  coaching_session_completed: {
    progressKey: "coaching_sessions"
  },

  performance_uploaded: {
    progressKey: "performance_uploads"
  },

  composition_submitted: {
    progressKey: "compositions_submitted"
  },

  creative_submission: {
    progressKey: "creative_submissions"
  },

  vocal_recording_uploaded: {
    progressKey: "vocal_recordings"
  },

  morning_class_completed: {
    progressKey: "morning_classes"
  },

  weekly_streak_incremented: {
    progressKey: "weekly_streak"
  },

  category_explored: {
    progressKey: "class_types_explored"
  }
};
