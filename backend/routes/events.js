// backend/routes/events.js
const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");
const { emit } = require("../services/badgeEventService");

// Optional: use services when the event implies data creation
const uploadService = require("../services/uploadService");
const journalService = require("../services/journalService");
const reflectionService = require("../services/reflectionService");

/**
 * Unified event endpoint
 * POST /events
 * body: { type: "journal_submitted" | "reflection_submitted" | ..., data: {...} }
 */
router.post("/", requireAuth, async (req, res) => {
  try {
    const uid = req.user.uid;
    const { type, data = {} } = req.body;

    if (!type) {
      return res.status(400).json({ error: "Event type is required" });
    }

    // Some events should go through services (to persist data)
    if (type === "journal_submitted") {
      const entry = await journalService.submitJournal(uid, data.content, data.kind);
      return res.json({ success: true, entry });
    }

    if (type === "reflection_submitted") {
      const entry = await reflectionService.submitReflection(uid, data.content, data.meta);
      return res.json({ success: true, entry });
    }

    if (type === "performance_uploaded" || type === "vocal_recording_uploaded" || type === "creative_submission") {
      const uploadType =
        type === "performance_uploaded"
          ? "performance"
          : type === "vocal_recording_uploaded"
          ? "vocal_recording"
          : "creative_submission";

      const upload = await uploadService.createUpload(uid, uploadType, data.fileMeta || {});
      return res.json({ success: true, upload });
    }

    // For simple “no persistence” events, just emit directly
    await emit(uid, type, data);

    res.json({ success: true });
  } catch (err) {
    console.error("POST /events error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
