// backend/routes/paypal.js
const express = require("express");
const router = express.Router();
const db = require("../db");

// Native fetch (Node 18+)
const fetch = global.fetch;

// Environment
const PORTAL_API_URL = process.env.PORTAL_API_URL;

/**
 * PayPal Webhook Receiver
 * NOTE: This endpoint must NOT use authentication middleware.
 */
router.post("/paypal", async (req, res) => {
  try {
    const event = req.body;

    if (!event || !event.event_type) {
      return res.status(400).json({ error: "Invalid webhook payload" });
    }

    const eventType = event.event_type;
    const resource = event.resource;

    // Prevent duplicate processing
    const existing = await db.paypalWebhooks.findOne({
      where: { eventId: event.id }
    });

    if (!existing) {
      await db.paypalWebhooks.create({
        eventId: event.id,
        body: event,
        receivedAt: new Date().toISOString()
      });
    }

    // Extract subscription ID
    const subscriptionId =
      resource?.id ||
      resource?.billing_agreement_id ||
      resource?.subscription_id ||
      null;

    /* -------------------------------------------------------
       1️⃣ PAYMENT.CAPTURE.COMPLETED
       → Create pending order
    -------------------------------------------------------- */
    if (eventType === "PAYMENT.CAPTURE.COMPLETED") {
      const email =
        resource?.payer?.email_address ||
        resource?.subscriber?.email_address ||
        null;

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
       2️⃣ SUBSCRIPTION EVENTS
       Forward to portal subscription handlers
    -------------------------------------------------------- */

    const forward = async (endpoint, payload) => {
      if (!PORTAL_API_URL) {
        console.error("Missing PORTAL_API_URL");
        return;
      }

      await fetch(`${PORTAL_API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    };

    if (eventType === "BILLING.SUBSCRIPTION.ACTIVATED") {
      await forward("/subscriptions/update-status", {
        paypalSubscriptionId: subscriptionId,
        status: "active"
      });
      return res.json({ success: true });
    }

    if (eventType === "BILLING.SUBSCRIPTION.CANCELLED") {
      await forward("/subscriptions/update-status", {
        paypalSubscriptionId: subscriptionId,
        status: "cancelled"
      });
      return res.json({ success: true });
    }

    if (eventType === "BILLING.SUBSCRIPTION.SUSPENDED") {
      await forward("/subscriptions/update-status", {
        paypalSubscriptionId: subscriptionId,
        status: "suspended"
      });
      return res.json({ success: true });
    }

    if (eventType === "BILLING.SUBSCRIPTION.PAYMENT.FAILED") {
      await forward("/subscriptions/update-status", {
        paypalSubscriptionId: subscriptionId,
        status: "past_due"
      });
      return res.json({ success: true });
    }

    if (
      eventType === "BILLING.SUBSCRIPTION.PAYMENT.SUCCEEDED" ||
      eventType === "PAYMENT.SALE.COMPLETED"
    ) {
      await forward("/subscriptions/apply-renewal", {
        paypalSubscriptionId: subscriptionId
      });
      return res.json({ success: true });
    }

    // Default
    res.json({ success: true });
  } catch (err) {
    console.error("PayPal webhook error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;