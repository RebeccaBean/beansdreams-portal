// backend/routes/dashboard.js
import express from "express";
import db from "../db.js";
import { syncPendingForStudent } from "../utils/syncPending.js";

const router = express.Router();

/**
 * ✅ Helper: compute credit totals from transactions
 */
function computeCreditTotals(transactions) {
  let total = 0;
  let byType = {};

  for (const tx of transactions) {
    total += tx.delta;

    for (const [key, val] of Object.entries(tx.typeBreakdown || {})) {
      byType[key] = (byType[key] || 0) + val * Math.sign(tx.delta);
    }
  }

  return { total, byType };
}

/**
 * ✅ GET /students/:uid/dashboard
 * Returns a complete dashboard snapshot.
 * Automatically syncs ALL pending data.
 */
router.get("/students/:uid/dashboard", async (req, res) => {
  try {
    const { uid } = req.params;

    const student = await db.students.findByPk(uid);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // ✅ Sync ALL pending data (credits, downloads, subs, orders)
    const synced = await syncPendingForStudent(student);

    // ✅ Fetch updated data after sync
    const [credits, orders, subs, downloads] = await Promise.all([
      db.creditTransactions.findAll({ where: { studentId: uid } }),
      db.orders.findAll({
        where: { studentId: uid },
        include: [db.orderItems],
        order: [["createdAt", "DESC"]]
      }),
      db.subscriptions.findAll({ where: { studentId: uid } }),
      db.downloads.findAll({ where: { studentId: uid } })
    ]);

    const remainingCredits = computeCreditTotals(credits);

    res.json({
      student,
      remainingCredits,
      orders,
      subscriptions: subs,
      downloads,
      syncedPending: synced
    });
  } catch (err) {
    console.error("GET /students/:uid/dashboard error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;

