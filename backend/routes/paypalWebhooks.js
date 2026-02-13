const express = require("express");
const router = express.Router();

// Your existing code
router.post("/paypal", async (req, res) => {
  try {
    // 1. Verify signature
    const valid = await verifyPayPalSignature(req);
    if (!valid) {
      return res.status(400).json({ error: "Invalid PayPal signature" });
    }

    const event = req.body;
    const eventType = event.event_type;
    const resource = event.resource;

    // 2. Prevent duplicate processing
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

    const subscriptionId =
      resource?.id ||
      resource?.billing_agreement_id ||
      resource?.subscription_id ||
      null;

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

      await fetch(`${PORTAL_API_URL}/orders/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, email })
      });

      return res.json({ success: true });
    }

    const forward = async (endpoint, payload) => {
      if (!PORTAL_API_URL) return;
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
    }

    if (eventType === "BILLING.SUBSCRIPTION.CANCELLED") {
      await forward("/subscriptions/update-status", {
        paypalSubscriptionId: subscriptionId,
        status: "cancelled"
      });
    }

    if (eventType === "BILLING.SUBSCRIPTION.SUSPENDED") {
      await forward("/subscriptions/update-status", {
        paypalSubscriptionId: subscriptionId,
        status: "suspended"
      });
    }

    if (eventType === "BILLING.SUBSCRIPTION.PAYMENT.FAILED") {
      await forward("/subscriptions/update-status", {
        paypalSubscriptionId: subscriptionId,
        status: "past_due"
      });
    }

    if (
      eventType === "BILLING.SUBSCRIPTION.PAYMENT.SUCCEEDED" ||
      eventType === "PAYMENT.SALE.COMPLETED"
    ) {
      await forward("/subscriptions/apply-renewal", {
        paypalSubscriptionId: subscriptionId
      });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("PayPal webhook error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Export router so server.js can use it
module.exports = router;
