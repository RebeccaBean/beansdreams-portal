// backend/controllers/coachingController.js
const coachingService = require("../services/coachingService");

exports.completeSession = async (req, res) => {
  try {
    const uid = req.user.uid;
    const { sessionType } = req.body;

    const result = await coachingService.completeCoachingSession(uid, sessionType);
    res.json(result);
  } catch (err) {
    console.error("Coaching error:", err);
    res.status(500).json({ error: "Failed to complete coaching session" });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const uid = req.user.uid;
    const history = await coachingService.getCoachingHistory(uid);
    res.json({ history });
  } catch (err) {
    console.error("Get coaching history error:", err);
    res.status(500).json({ error: "Failed to fetch coaching history" });
  }
};
