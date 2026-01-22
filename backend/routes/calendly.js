// backend/routes/calendly.js
const express = require("express");
const db = require("../db");

const { syncPendingForStudent } = require("../utils/syncPending");
const { useCreditsForClass } = require("../utils/useCreditsForClass");
const { refundCredits } = require("../utils/refundCredits");

const router = express.Router();

/* ---------------------------------------------------------
   CALENDLY BOOKING WEBHOOK
   POST /webhooks/calendly/booking
   Triggered when a student books a class
--------------------------------------------------------- */
router.post("/webhooks/calendly/booking", async (req, res) => {
  try {
    const event = req.body;

    // Calendly payload structure
    const email = event.payload?.invitee?.email;
    const uid = event.payload?.invitee?.uuid; // If you store UID in Calendly metadata
    const classType = event.payload?.event_type?.name || "general_class";
    const calendlyEventId = event.payload?.event?.uuid;

    if (!email) {
      return res.status(400).json({ error: "Missing student email" });
    }

    // Find student by email
    const student = await db.students.findOne({ where: { email } });

    if (!student) {
      // Store pending credit deduction for pre‑signup users
      await db.pendingCredits.create({
        email,
        delta: -1,
        typeBreakdown: { [classType]: 1 },
        meta: { calendlyEventId, classType }
      });

      return res.json({
        success: true,
        pending: true,
        message: "Student not found — deduction stored as pending"
      });
    }

    // Sync pending credits/subscriptions
    await syncPendingForStudent(student);

    // Deduct 1 credit for the class
    const newTotal = await useCreditsForClass(
      student.id,
      1,
      classType,
      { calendlyEventId }
    );

    res.json({
      success: true,
      message: "Credits deducted for class booking",
      remainingCredits: newTotal
    });
  } catch (err) {
    console.error("Calendly booking webhook error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ---------------------------------------------------------
   CALENDLY CANCELLATION WEBHOOK
   POST /webhooks/calendly/cancel
   Triggered when a student cancels a class
--------------------------------------------------------- */
router.post("/webhooks/calendly/cancel", async (req, res) => {
  try {
    const event = req.body;

    const email = event.payload?.invitee?.email;
    const classType = event.payload?.event_type?.name || "general_class";
    const calendlyEventId = event.payload?.event?.uuid;

    if (!email) {
      return res.status(400).json({ error: "Missing student email" });
    }

    // Find student
    const student = await db.students.findOne({ where: { email } });

    if (!student) {
      // Store pending refund for pre‑signup users
      await db.pendingCredits.create({
        email,
        delta: 1,
        typeBreakdown: { [classType]: 1 },
        meta: { calendlyEventId, classType, reason: "class_cancelled" }
      });

      return res.json({
        success: true,
        pending: true,
        message: "Student not found — refund stored as pending"
      });
    }

    // Sync pending credits/subscriptions
    await syncPendingForStudent(student);

    // Refund 1 credit
    const newTotal = await refundCredits(
      student.id,
      1,
      classType,
      { calendlyEventId, reason: "class_cancelled" }
    );

    res.json({
      success: true,
      message: "Credits refunded for class cancellation",
      remainingCredits: newTotal
    });
  } catch (err) {
    console.error("Calendly cancellation webhook error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
