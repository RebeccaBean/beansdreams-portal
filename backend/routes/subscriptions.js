// backend/routes/subscriptions.js
const express = require("express");
const db = require("../db");
const { syncPendingForStudent } = require("../utils/syncPending");
const { applyCredits } = require("../utils/applyCredits");
const { sendPortalEmail } = require("../utils/sendPortalEmail");

const router = express.Router();

/* ---------------------------------------------------------
   CREATE SUBSCRIPTION
   POST /students/:uid/subscriptions
--------------------------------------------------------- */
router.post("/students/:uid/subscriptions", async (req, res) => {
  try {
    const { uid } = req.params;
    const { planType, paypalSubscriptionId, status, email } = req.body;

    if (!planType || !paypalSubscriptionId) {
      return res
        .status(400)
        .json({ error: "Missing planType or paypalSubscriptionId" });
    }

    // Check if student exists
    const student = await db.students.findByPk(uid);

    if (!student) {
      // Store as pending subscription (pre‑signup)
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

    // Sync pending data before creating subscription
    await syncPendingForStudent(student);

    // Create subscription
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

/* ---------------------------------------------------------
   GET SUBSCRIPTIONS FOR STUDENT
   GET /students/:uid/subscriptions
--------------------------------------------------------- */
router.get("/students/:uid/subscriptions", async (req, res) => {
  try {
    const { uid } = req.params;

    const student = await db.students.findByPk(uid);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Sync pending subscriptions before returning
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

/* ---------------------------------------------------------
   UPDATE SUBSCRIPTION STATUS
   POST /subscriptions/update-status
   Called by PayPal webhook handler
--------------------------------------------------------- */
router.post("/subscriptions/update-status", async (req, res) => {
  try {
    const { paypalSubscriptionId, status, nextBillingDate } = req.body;

    if (!paypalSubscriptionId || !status) {
      return res
        .status(400)
        .json({ error: "Missing subscriptionId or status" });
    }

    const sub = await db.subscriptions.findOne({
      where: { paypalSubscriptionId }
    });

    if (!sub) {
      return res.status(404).json({ error: "Subscription not found" });
    }

    sub.status = status;
    if (nextBillingDate) sub.nextBillingDate = nextBillingDate;
    await sub.save();

    res.json({ success: true, subscription: sub });
  } catch (err) {
    console.error("POST /subscriptions/update-status error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ---------------------------------------------------------
   APPLY RENEWAL CREDITS
   POST /subscriptions/apply-renewal
   Called when PayPal sends PAYMENT.SALE.COMPLETED
--------------------------------------------------------- */
router.post("/subscriptions/apply-renewal", async (req, res) => {
  try {
    const { paypalSubscriptionId } = req.body;

    if (!paypalSubscriptionId) {
      return res.status(400).json({ error: "Missing subscriptionId" });
    }

    const sub = await db.subscriptions.findOne({
      where: { paypalSubscriptionId }
    });

    if (!sub) {
      return res.status(404).json({ error: "Subscription not found" });
    }

    const student = await db.students.findByPk(sub.studentId);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Apply credits for renewal
    const credits = sub.creditsPerCycle || 0;
    const typeBreakdown = sub.creditType || {};

    if (credits > 0) {
      await applyCredits(sub.studentId, credits, typeBreakdown, {
        source: "subscription_renewal",
        subscriptionId: sub.paypalSubscriptionId
      });
    }

    // Notify student
    await sendPortalEmail("subscription_renewed", {
      uid: sub.studentId,
      email: student.email,
      plan: sub.planType,
      credits
    });

    res.json({ success: true, creditsApplied: credits });
  } catch (err) {
    console.error("POST /subscriptions/apply-renewal error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
