// backend/controllers/journalsController.js

const journalService = require("../services/journalService");

// ===============================
// POST /journals/submit
// ===============================
exports.submitJournal = async (req, res) => {
  try {
    const uid = req.user?.uid;
    if (!uid) {
      return res.status(401).json({ error: "Unauthorized: Missing user UID" });
    }

    const { content, kind } = req.body;

    if (!content) {
      return res.status(400).json({ error: "Missing required field: content" });
    }

    if (!kind) {
      return res.status(400).json({ error: "Missing required field: kind" });
    }

    const entry = await journalService.submitJournal(uid, content, kind);
    res.json({ success: true, entry });
  } catch (err) {
    console.error("Journal error:", err);
    res.status(500).json({ error: "Failed to submit journal" });
  }
};

// ===============================
// GET /journals
// ===============================
exports.getJournals = async (req, res) => {
  try {
    const uid = req.user?.uid;
    if (!uid) {
      return res.status(401).json({ error: "Unauthorized: Missing user UID" });
    }

    const entries = await journalService.getJournals(uid);
    res.json({ entries });
  } catch (err) {
    console.error("Get journals error:", err);
    res.status(500).json({ error: "Failed to fetch journals" });
  }
};

