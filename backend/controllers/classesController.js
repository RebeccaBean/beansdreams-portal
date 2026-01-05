// controllers/classesController.js
const classService = require("../services/classService");

exports.completeClass = async (req, res) => {
  try {
    const uid = req.user.uid;
    const { classType } = req.body;

    const result = await classService.completeClass(uid, classType);

    res.json(result);
  } catch (err) {
    console.error("Class completion error:", err);
    res.status(500).json({ error: "Failed to complete class" });
  }
};
