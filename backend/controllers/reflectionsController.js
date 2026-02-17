// backend/controllers/reflectionsController.js

const reflectionService = require("../services/reflectionService");

// ===============================
// POST /reflections/submit
// ===============================
exports.submitReflection = async (req, res) => {
  try {
    const uid = req.user?.uid;
    if (!uid) {
      return res.status(401).json({ error: "Unauthorized: Missing user UID" });
    }

    const { content, meta } = req.body;

    if (!content) {
      return res.status(400).json({ error: "Missing required field: content" });
    }

    const entry = await reflectionService.submitReflection(uid, content, meta);
    res.json({ success: true, entry });
  } catch (err) {
    console.error("Reflection error:", err);
    res.status(500).json({ error: "Failed to submit reflection" });
  }
};

// ===============================
// GET /reflections
// ===============================
exports.getReflections = async (req, res) => {
  try {
    const uid = req.user?.uid;
    if (!uid) {
      return res.status(401).json({ error: "Unauthorized: Missing user UID" });
    }

    const entries = await reflectionService.getReflections(uid);
    res.json({ entries });
  } catch (err) {
    console.error("Get reflections error:", err);
    res.status(500).json({ error: "Failed to fetch reflections" });
  }
};
