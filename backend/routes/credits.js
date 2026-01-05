// backend/routes/credits.js
const express = require("express");
const db = require("../db");
const { syncPendingForStudent } = require("../utils/syncPending");

const router = express.Router();

/**
 * POST /students/:uid/credits
 * Apply credit changes (positive or negative).
 * If student does NOT exist → store as pending credit.
 * If student exists → sync pending + apply credit.
 */
router.post("/students/:uid/credits", async (req, res) => {
  try {
    const { uid } = req.params;
    const { credits, type, meta } = req.body;

    if (typeof credits !== "number") {
      return res.status(400).json({ error: "Missing or invalid credits" });
    }

    // Check if student exists
    const student = await db.students.findByPk(uid);

    if (!student) {
      // Store as pending credit (pre‑signup)
      await db.pendingCredits.create({
        email: meta?.email || null,
        delta: credits,
        typeBreakdown: type || {},
        meta: { ...meta, uid }
      });

      return res.json({
        success: true,
        pending: true,
        message: "Student not found — credits stored as pending"
      });
    }

    // Sync ALL pending data before applying new credit
    await syncPendingForStudent(student);

    // Apply credit transaction
    await db.creditTransactions.create({
      studentId: uid,
      delta: credits,
      typeBreakdown: type || {},
      source: meta?.source || "manual",
      orderId: meta?.orderId || null,
      meta: meta || {}
    });

    // Recalculate totals
    const allTx = await db.creditTransactions.findAll({
      where: { studentId: uid }
    });

    let total = 0;
    let byType = {};

    for (const tx of allTx) {
      total += tx.delta;

      for (const [t, amount] of Object.entries(tx.typeBreakdown || {})) {
        byType[t] = (byType[t] || 0) + amount * Math.sign(tx.delta);
      }
    }

    res.json({
      success: true,
      remainingCredits: { total, byType }
    });
  } catch (err) {
    console.error("POST /students/:uid/credits error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * GET /students/:uid/credits
 * Returns credit summary + history.
 * Automatically syncs pending data.
 */
router.get("/students/:uid/credits", async (req, res) => {
  try {
    const { uid } = req.params;

    const student = await db.students.findByPk(uid);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Sync ALL pending data before returning credit info
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
      remainingCredits: { total, byType },
      creditHistory: tx
    });
  } catch (err) {
    console.error("GET /students/:uid/credits error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
