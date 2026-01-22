const express = require("express");
const db = require("../db");
const { syncPendingForStudent } = require("../utils/syncPending");
const { sendEmail } = require("../utils/mailer");

const router = express.Router();

/* ---------------------------------------------------------
   SHARED SECRET AUTH
--------------------------------------------------------- */
function requireServiceKey(req, res, next) {
  const key = req.headers["x-service-key"];
  if (!key || key !== process.env.SERVICE_SECRET) {
    return res.status(401).json({ error: "Unauthorized service" });
  }
  next();
}

/* ---------------------------------------------------------
   APPLY CREDITS
   POST /system/students/:uid/credits
--------------------------------------------------------- */
router.post("/students/:uid/credits", requireServiceKey, async (req, res) => {
  try {
    const { uid } = req.params;
    const { credits, type, meta } = req.body;

    if (typeof credits !== "number") {
      return res.status(400).json({ error: "Missing or invalid credits" });
    }

    const student = await db.students.findByPk(uid);

    if (!student) {
      await db.pendingCredits.create({
        email: meta?.email || null,
        delta: credits,
        typeBreakdown: type || {},
        meta: { ...meta, uid }
      });

      return res.json({ success: true, pending: true });
    }

    await syncPendingForStudent(student);

    await db.creditTransactions.create({
      studentId: uid,
      delta: credits,
      typeBreakdown: type || {},
      source: meta?.source || "system",
      orderId: meta?.orderId || null,
      meta: meta || {}
    });

    res.json({ success: true });
  } catch (err) {
    console.error("SYSTEM credits error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ---------------------------------------------------------
   GRANT DOWNLOAD
   POST /system/students/:uid/downloads
--------------------------------------------------------- */
router.post("/students/:uid/downloads", requireServiceKey, async (req, res) => {
  try {
    const { uid } = req.params;
    const { productId, email } = req.body;

    if (!productId) {
      return res.status(400).json({ error: "Missing productId" });
    }

    const student = await db.students.findByPk(uid);

    if (!student) {
      await db.pendingDownloads.create({
        email: email || null,
        productId,
        meta: { uid }
      });

      return res.json({ success: true, pending: true });
    }

    await syncPendingForStudent(student);

    await db.downloads.create({ studentId: uid, productId });

    res.json({ success: true });
  } catch (err) {
    console.error("SYSTEM downloads error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ---------------------------------------------------------
   CREATE ORDER
   POST /system/orders
--------------------------------------------------------- */
router.post("/orders", requireServiceKey, async (req, res) => {
  try {
    const { uid, email, cart, paypalOrder, status } = req.body;

    if (!email || !cart) {
      return res.status(400).json({ error: "Missing email or cart" });
    }

    const student = uid ? await db.students.findByPk(uid) : null;

    if (!student) {
      await db.pendingOrders.create({
        email,
        order: { cart, paypalOrder, status: status || "completed" }
      });

      return res.json({ success: true, pending: true });
    }

    await syncPendingForStudent(student);

    const order = await db.orders.create({
      studentId: uid,
      email,
      cart,
      paypalOrder,
      status: status || "completed"
    });

    for (const item of cart) {
      await db.orderItems.create({
        orderId: order.id,
        itemType: item.type,
        bundleKey: item.bundleKey || null,
        productId: item.productId || null,
        quantity: item.quantity || 1,
        meta: item
      });
    }

    res.json({ success: true, order });
  } catch (err) {
    console.error("SYSTEM orders error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ---------------------------------------------------------
   PENDING ORDERS
--------------------------------------------------------- */
router.post("/pending-orders", requireServiceKey, async (req, res) => {
  try {
    const { email, order } = req.body;

    if (!email || !order) {
      return res.status(400).json({ error: "Missing email or order" });
    }

    await db.pendingOrders.create({ email, order });

    res.json({ success: true });
  } catch (err) {
    console.error("SYSTEM pending-orders error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/pending-orders/:email", requireServiceKey, async (req, res) => {
  try {
    const email = req.params.email;

    const pending = await db.pendingOrders.findAll({ where: { email } });

    if (!pending.length) {
      return res.status(404).json({ error: "No pending orders" });
    }

    res.json({ orders: pending.map(p => p.order) });
  } catch (err) {
    console.error("SYSTEM pending-orders GET error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/pending-orders/:email", requireServiceKey, async (req, res) => {
  try {
    const email = req.params.email;

    await db.pendingOrders.destroy({ where: { email } });

    res.json({ success: true });
  } catch (err) {
    console.error("SYSTEM pending-orders DELETE error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ---------------------------------------------------------
   SUBSCRIPTIONS
   POST /system/students/:uid/subscriptions
--------------------------------------------------------- */
router.post("/students/:uid/subscriptions", requireServiceKey, async (req, res) => {
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

      return res.json({ success: true, pending: true });
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
    console.error("SYSTEM subscriptions error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ---------------------------------------------------------
   EMAIL
   POST /system/email/send
--------------------------------------------------------- */
router.post("/email/send", requireServiceKey, async (req, res) => {
  try {
    const { template, payload } = req.body;

    if (!template) {
      return res.status(400).json({ error: "Missing template" });
    }

    await sendEmail(template, payload);

    res.json({ success: true });
  } catch (err) {
    console.error("SYSTEM email error:", err);
    res.status(500).json({ error: "Email send failed" });
  }
});

module.exports = router;
