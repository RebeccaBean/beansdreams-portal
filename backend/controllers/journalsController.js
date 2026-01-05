// backend/controllers/journalsController.js
const journalService = require("../services/journalService");

exports.submitJournal = async (req, res) => {
  try {
    const uid = req.user.uid;
    const { content, kind } = req.body;

    const entry = await journalService.submitJournal(uid, content, kind);
    res.json({ success: true, entry });
  } catch (err) {
    console.error("Journal error:", err);
    res.status(500).json({ error: "Failed to submit journal" });
  }
};

exports.getJournals = async (req, res) => {
  try {
    const uid = req.user.uid;
    const entries = await journalService.getJournals(uid);
    res.json({ entries });
  } catch (err) {
    console.error("Get journals error:", err);
    res.status(500).json({ error: "Failed to fetch journals" });
  }
};
