// backend/routes/creditHistory.js

const express = require("express");
const db = require("../db");
const { syncPendingForStudent } = require("../utils/syncPending");

const router = express.Router();

/**
 * GET /students/:uid/credit-history
 * Returns credit totals + full transaction history
 */
router.get("/students/:uid/credit-history", async (req, res) => {
  try {
    const { uid } = req.params;

    const student = await db.students.findByPk(uid);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Sync pending credits/subscriptions
    await syncPendingForStudent(student);

    const tx = await db.creditTransactions.findAll({
      where: { studentId: uid },
      order: [["createdAt", "DESC"]]
    });

    let total = 0;
    let byType = {};

    for (const t of tx) {
      total += t.delta;

      for (const [key, val] of Object.entries(t.typeBreakdown || {})) {
        byType[key] = (byType[key] || 0) + val * Math.sign(t.delta);
      }
    }

    res.json({
      student: {
        id: student.id,
        name: student.name,
        email: student.email
      },
      remainingCredits: { total, byType },
      history: tx
    });
  } catch (err) {
    console.error("GET /students/:uid/credit-history error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
