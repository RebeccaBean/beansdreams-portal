// backend/controllers/coachingController.js

const coachingService = require("../services/coachingService");

// ===============================
// POST /coaching/complete
// ===============================
exports.completeSession = async (req, res) => {
  try {
    const uid = req.user?.uid;
    if (!uid) {
      return res.status(401).json({ error: "Unauthorized: Missing user UID" });
    }

    const { sessionType } = req.body;
    if (!sessionType) {
      return res.status(400).json({ error: "Missing required field: sessionType" });
    }

    const result = await coachingService.completeCoachingSession(uid, sessionType);
    res.json(result);
  } catch (err) {
    console.error("Coaching error:", err);
    res.status(500).json({ error: "Failed to complete coaching session" });
  }
};

// ===============================
// GET /coaching/history
// ===============================
exports.getHistory = async (req, res) => {
  try {
    const uid = req.user?.uid;
    if (!uid) {
      return res.status(401).json({ error: "Unauthorized: Missing user UID" });
    }

    const history = await coachingService.getCoachingHistory(uid);
    res.json({ history });
  } catch (err) {
    console.error("Get coaching history error:", err);
    res.status(500).json({ error: "Failed to fetch coaching history" });
  }
};
