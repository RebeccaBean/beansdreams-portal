// backend/routes/subscriptions.js
const express = require("express");
const db = require("../db");

// NEW email system
const { sendEmail } = require("../utils/mailer");
const {
  subscriptionRenewalEmail,
  subscriptionActivatedEmail,
  subscriptionCancelledEmail,
  subscriptionPaymentFailedEmail
} = require("../utils/emailTemplates");

// Existing utilities
const { syncPendingForStudent } = require("../utils/syncPending");
const { applyCredits } = require("../utils/applyCredits");

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
      return res.status(400).json({ error: "Missing planType or paypalSubscriptionId" });
    }

    const student = await db.students.findByPk(uid);

    if (!student) {
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

    await syncPendingForStudent(student);

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
    if (!student) return res.status(404).json({ error: "Student not found" });

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
   UPDATE SUBSCRIPTION STATUS (ACTIVATED, CANCELLED, FAILED)
   POST /subscriptions/update-status
--------------------------------------------------------- */
router.post("/subscriptions/update-status", async (req, res) => {
  try {
    const { paypalSubscriptionId, status, nextBillingDate } = req.body;

    if (!paypalSubscriptionId || !status) {
      return res.status(400).json({ error: "Missing subscriptionId or status" });
    }

    const sub = await db.subscriptions.findOne({
      where: { paypalSubscriptionId }
    });

    if (!sub) return res.status(404).json({ error: "Subscription not found" });

    const student = await db.students.findByPk(sub.studentId);
    if (!student) return res.status(404).json({ error: "Student not found" });

    sub.status = status;
    if (nextBillingDate) sub.nextBillingDate = nextBillingDate;
    await sub.save();

    const firstName = student.name.split(" ")[0];
    const brand = "Bean's Dreams";
    const logoUrl = "https://yourcdn.com/logo.png";
    const websiteUrl = "https://beansdreams.org";
    const dashboardUrl = "https://portal.beansdreams.org/dashboard";

    // Send correct email based on status
    if (status === "active") {
      const html = subscriptionActivatedEmail({
        brand,
        firstName,
        subscriptionName: sub.planType,
        dashboardUrl,
        supportEmail: "support@beansdreams.org",
        logoUrl,
        websiteUrl
      });
      await sendEmail(student.email, "Your subscription is active", html);
    }

    if (status === "cancelled") {
      const html = subscriptionCancelledEmail({
        brand,
        firstName,
        subscriptionName: sub.planType,
        endDate: nextBillingDate || "your next billing cycle",
        supportEmail: "support@beansdreams.org",
        logoUrl,
        websiteUrl
      });
      await sendEmail(student.email, "Your subscription has been cancelled", html);
    }

    if (status === "past_due") {
      const html = subscriptionPaymentFailedEmail({
        brand,
        firstName,
        subscriptionName: sub.planType,
        retryDate: nextBillingDate || "soon",
        supportEmail: "support@beansdreams.org",
        dashboardUrl,
        logoUrl,
        websiteUrl
      });
      await sendEmail(student.email, "Payment failed for your subscription", html);
    }

    res.json({ success: true, subscription: sub });
  } catch (err) {
    console.error("POST /subscriptions/update-status error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ---------------------------------------------------------
   APPLY RENEWAL CREDITS + SEND RENEWAL EMAIL
   POST /subscriptions/apply-renewal
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

    if (!sub) return res.status(404).json({ error: "Subscription not found" });

    const student = await db.students.findByPk(sub.studentId);
    if (!student) return res.status(404).json({ error: "Student not found" });

    const credits = sub.creditsPerCycle || 0;
    const typeBreakdown = sub.creditType || {};

    if (credits > 0) {
      await applyCredits(sub.studentId, credits, typeBreakdown, {
        source: "subscription_renewal",
        subscriptionId: sub.paypalSubscriptionId
      });
    }

    const html = subscriptionRenewalEmail({
      brand: "Bean's Dreams",
      firstName: student.name.split(" ")[0],
      subscriptionName: sub.planType,
      renewalDate: new Date().toLocaleDateString(),
      amount: credits,
      currency: "credits",
      dashboardUrl: "https://portal.beansdreams.org/dashboard",
      supportEmail: "support@beansdreams.org",
      logoUrl: "https://yourcdn.com/logo.png",
      websiteUrl: "https://beansdreams.org"
    });

    await sendEmail(student.email, "Your subscription has renewed", html);

    res.json({ success: true, creditsApplied: credits });
  } catch (err) {
    console.error("POST /subscriptions/apply-renewal error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;

