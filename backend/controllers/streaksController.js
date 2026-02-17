// backend/controllers/streaksController.js

const streakService = require("../services/streakService");

// ===============================
// GET /streak
// ===============================
exports.getStreak = async (req, res) => {
  try {
    const uid = req.user?.uid;
    if (!uid) {
      return res.status(401).json({ error: "Unauthorized: Missing user UID" });
    }

    const streak = await streakService.getStreak(uid);
    res.json({ streak });
  } catch (err) {
    console.error("Get streak error:", err);
    res.status(500).json({ error: "Failed to fetch streak" });
  }
};
