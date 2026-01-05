// backend/controllers/reflectionsController.js
const reflectionService = require("../services/reflectionService");

exports.submitReflection = async (req, res) => {
  try {
    const uid = req.user.uid;
    const { content, meta } = req.body;

    const entry = await reflectionService.submitReflection(uid, content, meta);
    res.json({ success: true, entry });
  } catch (err) {
    console.error("Reflection error:", err);
    res.status(500).json({ error: "Failed to submit reflection" });
  }
};

exports.getReflections = async (req, res) => {
  try {
    const uid = req.user.uid;
    const entries = await reflectionService.getReflections(uid);
    res.json({ entries });
  } catch (err) {
    console.error("Get reflections error:", err);
    res.status(500).json({ error: "Failed to fetch reflections" });
  }
};
