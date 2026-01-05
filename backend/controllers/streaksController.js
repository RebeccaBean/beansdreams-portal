// backend/controllers/streaksController.js
const streakService = require("../services/streakService");

exports.getStreak = async (req, res) => {
  try {
    const uid = req.user.uid;
    const streak = await streakService.getStreak(uid);
    res.json({ streak });
  } catch (err) {
    console.error("Get streak error:", err);
    res.status(500).json({ error: "Failed to fetch streak" });
  }
};
