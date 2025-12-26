// backend/routes/webhooks.js
import express from "express";
import db from "../db.js";
import { syncPendingForStudent } from "../utils/syncPending.js";

const router = express.Router();

/* -------------------------------------------------------
   ✅ PAYPAL WEBHOOK
   Receives verified events forwarded from your PayPal server.
-------------------------------------------------------- */
router.post("/paypal", async (req, res) => {
  try {
    const { body, receivedAt } = req.body;

    // ✅ Log webhook
    await db.paypalWebhooks.create({
      body,
      receivedAt: receivedAt || new Date().toISOString()
    });

    const eventType = body.event_type;
    const resource = body.resource;

    const email =
      resource?.payer?.email_address ||
      resource?.subscriber?.email_address ||
      null;

    /* -------------------------------------------------------
       ✅ 1. PAYMENT CAPTURE COMPLETED
       → Create pending order (user may not exist yet)
    -------------------------------------------------------- */
    if (eventType === "PAYMENT.CAPTURE.COMPLETED") {
      const orderId =
        resource.supplementary_data?.related_ids?.order_id ||
        resource.invoice_id ||
        `pending-${Date.now()}`;

      await db.pendingOrders.create({
        email,
        order: {
          cart: [],
          paypalOrder: resource,
          orderId
        },
        createdAt: new Date().toISOString()
      });

      return res.json({ success: true });
    }

    /* -------------------------------------------------------
       ✅ 2. SUBSCRIPTION PAYMENT SUCCEEDED
       → Apply credits or store pending subscription
    -------------------------------------------------------- */
    if (
      eventType === "BILLING.SUBSCRIPTION.PAYMENT.SUCCEEDED" ||
      eventType === "BILLING.SUBSCRIPTION.CHARGED_SUCCESSFULLY"
    ) {
      const subscriptionId =
        resource?.id || resource?.billing_agreement_id || null;

      const sub = await db.subscriptions.findOne({
        where: { paypalSubscriptionId: subscriptionId }
      });

      if (!sub) {
        // ✅ Store as pending subscription
        await db.pendingSubscriptions.create({
          email,
          planType: "classPass",
          paypalSubscriptionId: subscriptionId,
          status: "renewal",
          meta: resource
        });

        return res.json({ success: true });
      }

      // ✅ Apply renewal credits
      await db.creditTransactions.create({
        studentId: sub.studentId,
        delta: 4,
        typeBreakdown: { Any: 4 },
        source: "paypal_subscription_renewal",
        meta: resource
      });

      return res.json({ success: true });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("PayPal webhook error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* -------------------------------------------------------
   ✅ PRINTIFY WEBHOOK
-------------------------------------------------------- */
router.post("/printify", async (req, res) => {
  try {
    const { event, receivedAt } = req.body;

    await db.printifyEvents.create({
      event,
      receivedAt: receivedAt || new Date().toISOString()
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Printify webhook error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* -------------------------------------------------------
   ✅ CALENDLY WEBHOOK
-------------------------------------------------------- */
router.post("/calendly", async (req, res) => {
  try {
    const { event, receivedAt } = req.body;

    const email = event?.payload?.invitee?.email;
    const classTypeName = event?.payload?.event_type?.name || "Unknown";

    // ✅ Log event
    await db.calendlyEvents.create({
      event,
      email,
      receivedAt: receivedAt || new Date().toISOString()
    });

    // ✅ Find student
    const student = await db.students.findOne({ where: { email } });

    if (!student) {
      // ✅ Store as pending order (class booking)
      await db.pendingOrders.create({
        email,
        order: {
          type: "calendly_booking",
          event,
          classTypeName
        },
        createdAt: new Date().toISOString()
      });

      return res.json({ success: true });
    }

    // ✅ Sync pending data before consuming credits
    await syncPendingForStudent(student);

    // ✅ Consume 1 credit
    await db.creditTransactions.create({
      studentId: student.id,
      delta: -1,
      typeBreakdown: { [classTypeName]: -1 },
      source: "calendly_booking",
      meta: event
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Calendly webhook error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
