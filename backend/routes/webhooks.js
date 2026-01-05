// backend/routes/paypal.js
const express = require("express");
const router = express.Router();
const db = require("../db");

// If you're using node-fetch:
const fetch = require("node-fetch");

// Load from environment
const PORTAL_API_URL = process.env.PORTAL_API_URL;

/**
 * PayPal Webhook Receiver
 */
router.post("/paypal", async (req, res) => {
  try {
    const { body, receivedAt } = req.body;

    // Log webhook
    await db.paypalWebhooks.create({
      body,
      receivedAt: receivedAt || new Date().toISOString()
    });

    const eventType = body.event_type;
    const resource = body.resource;

    // Extract subscription ID if present
    const subscriptionId =
      resource?.id ||
      resource?.billing_agreement_id ||
      resource?.subscription_id ||
      null;

    /* -------------------------------------------------------
       1️⃣ PAYMENT.CAPTURE.COMPLETED
       → Create pending order (cart-less PayPal purchase)
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

    // Subscription activated
    if (eventType === "BILLING.SUBSCRIPTION.ACTIVATED") {
      await fetch(`${PORTAL_API_URL}/subscriptions/update-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paypalSubscriptionId: subscriptionId,
          status: "active"
        })
      });

      return res.json({ success: true });
    }

    // Subscription cancelled
    if (eventType === "BILLING.SUBSCRIPTION.CANCELLED") {
      await fetch(`${PORTAL_API_URL}/subscriptions/update-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paypalSubscriptionId: subscriptionId,
          status: "cancelled"
        })
      });

      return res.json({ success: true });
    }

    // Subscription suspended
    if (eventType === "BILLING.SUBSCRIPTION.SUSPENDED") {
      await fetch(`${PORTAL_API_URL}/subscriptions/update-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paypalSubscriptionId: subscriptionId,
          status: "suspended"
        })
      });

      return res.json({ success: true });
    }

    // Payment failed
    if (eventType === "BILLING.SUBSCRIPTION.PAYMENT.FAILED") {
      await fetch(`${PORTAL_API_URL}/subscriptions/update-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paypalSubscriptionId: subscriptionId,
          status: "past_due"
        })
      });

      return res.json({ success: true });
    }

    // Renewal (payment succeeded)
    if (
      eventType === "BILLING.SUBSCRIPTION.PAYMENT.SUCCEEDED" ||
      eventType === "PAYMENT.SALE.COMPLETED"
    ) {
      await fetch(`${PORTAL_API_URL}/subscriptions/apply-renewal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paypalSubscriptionId: subscriptionId
        })
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
