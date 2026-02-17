// backend/controllers/studentsController.js

const db = require("../db");
const { getBadgeProgress, updateBadgeProgressInternal } = require("../services/badgeService");

// ===============================
// GET /students/:uid/dashboard
// ===============================
exports.getDashboard = async (req, res) => {
  try {
    const uid = req.params.uid;
    if (!uid) {
      return res.status(400).json({ error: "Missing student UID" });
    }

    const student = await db.students.findByPk(uid, {
      include: [
        db.subscriptions,
        db.downloads,
        db.orders,
        db.creditTransactions
      ]
    });

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json({
      subscriptions: student.subscriptions,
      remainingCredits: student.remainingCredits,
      downloads: student.downloads,
      orders: student.orders,
      achievements: [], // optional placeholder
      instructorNotes: [],
      studentNotes: student.studentNotes || {},
      sessionLinks: student.sessionLinks || {},
      nextSession: {}
    });
  } catch (err) {
    console.error("Get dashboard error:", err);
    res.status(500).json({ error: "Failed to load dashboard" });
  }
};

// ===============================
// GET /students/:uid/badges
// ===============================
exports.getBadges = async (req, res) => {
  try {
    const uid = req.params.uid;
    if (!uid) {
      return res.status(400).json({ error: "Missing student UID" });
    }

    const progress = await getBadgeProgress(uid);
    res.json({ progress });
  } catch (err) {
    console.error("Get badges error:", err);
    res.status(500).json({ error: "Failed to load badge progress" });
  }
};

// ===============================
// POST /students/:uid/badges/update
// ===============================
exports.updateBadgeProgress = async (req, res) => {
  try {
    const uid = req.params.uid;
    const { key, amount } = req.body;

    if (!uid) {
      return res.status(400).json({ error: "Missing student UID" });
    }
    if (!key) {
      return res.status(400).json({ error: "Missing badge progress key" });
    }

    await updateBadgeProgressInternal(uid, key, amount || 1);
    res.json({ success: true });
  } catch (err) {
    console.error("Update badge progress error:", err);
    res.status(500).json({ error: "Failed to update badge progress" });
  }
};

// ===============================
// POST /students/notes
// ===============================
exports.saveStudentNotes = async (req, res) => {
  try {
    const uid = req.user?.uid;
    if (!uid) {
      return res.status(401).json({ error: "Unauthorized: Missing user UID" });
    }

    await db.students.update(
      { studentNotes: req.body },
      { where: { id: uid } }
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Save student notes error:", err);
    res.status(500).json({ error: "Failed to save student notes" });
  }
};

// ===============================
// POST /students/session-links
// ===============================
exports.saveSessionLinks = async (req, res) => {
  try {
    const uid = req.user?.uid;
    if (!uid) {
      return res.status(401).json({ error: "Unauthorized: Missing user UID" });
    }

    await db.students.update(
      { sessionLinks: req.body },
      { where: { id: uid } }
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Save session links error:", err);
    res.status(500).json({ error: "Failed to save session links" });
  }
};
