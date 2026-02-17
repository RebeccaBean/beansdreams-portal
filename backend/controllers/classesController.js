// controllers/classesController.js

// Load class service (business logic layer)
const classService = require("../services/classService");

// ===============================
// POST /classes/complete
// ===============================
exports.completeClass = async (req, res) => {
  try {
    // Ensure UID exists (depends on your auth middleware)
    const uid = req.user?.uid;
    if (!uid) {
      return res.status(401).json({ error: "Unauthorized: Missing user UID" });
    }

    const { classType } = req.body;

    if (!classType) {
      return res.status(400).json({ error: "Missing required field: classType" });
    }

    const result = await classService.completeClass(uid, classType);

    res.json(result);
  } catch (err) {
    console.error("Class completion error:", err);
    res.status(500).json({ error: "Failed to complete class" });
  }
};
