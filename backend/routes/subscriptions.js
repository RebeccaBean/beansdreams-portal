// backend/routes/subscriptions.js
import express from "express";
import db from "../db.js";
import { syncPendingForStudent } from "../utils/syncPending.js";

const router = express.Router();

/**
 * ✅ POST /students/:uid/subscriptions
 * Creates a subscription record.
 * If student does NOT exist → store as pending subscription.
 * If student exists → sync pending + create subscription.
 */
router.post("/students/:uid/subscriptions", async (req, res) => {
  try {
    const { uid } = req.params;
    const { planType, paypalSubscriptionId, status, email } = req.body;

    if (!planType || !paypalSubscriptionId) {
      return res.status(400).json({ error: "Missing planType or paypalSubscriptionId" });
    }

    // ✅ Check if student exists
    const student = await db.students.findByPk(uid);

    if (!student) {
      // ✅ Store as pending subscription (pre‑signup)
      await db.pendingSubscriptions.create({
        email: email || null,
        planType,
        paypalSubscriptionId,
        status: status || "created",
        meta: { uid }
      });

      return res.json({
        success: true,
        pending: true,
        message: "Student not found — subscription stored as pending"
      });
    }

    // ✅ Sync ALL pending data before creating new subscription
    await syncPendingForStudent(student);

    // ✅ Create subscription
    const sub = await db.subscriptions.create({
      studentId: uid,
      planType,
      paypalSubscriptionId,
      status: status || "created"
    });

    res.json({ success: true, subscription: sub });
  } catch (err) {
    console.error("POST /students/:uid/subscriptions error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * ✅ GET /students/:uid/subscriptions
 * Returns all subscriptions for a student.
 * Automatically syncs pending subscriptions first.
 */
router.get("/students/:uid/subscriptions", async (req, res) => {
  try {
    const { uid } = req.params;

    const student = await db.students.findByPk(uid);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // ✅ Sync ALL pending data before returning subscriptions
    await syncPendingForStudent(student);

    const subs = await db.subscriptions.findAll({
      where: { studentId: uid }
    });

    res.json({ subscriptions: subs });
  } catch (err) {
    console.error("GET /students/:uid/subscriptions error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
