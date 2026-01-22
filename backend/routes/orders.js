// backend/routes/orders.js
const express = require("express");
const db = require("../db");

const { syncPendingForStudent } = require("../utils/syncPending");
const { applyCredits } = require("../utils/applyCredits");
const { sendEmail } = require("../utils/mailer");
const { purchaseConfirmationEmail } = require("../utils/emailTemplates");

const router = express.Router();

/* ---------------------------------------------------------
   GET /students/:uid/orders
   Returns all orders for a student
--------------------------------------------------------- */
router.get("/students/:uid/orders", async (req, res) => {
  try {
    const { uid } = req.params;

    const student = await db.students.findByPk(uid);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    await syncPendingForStudent(student);

    const orders = await db.orders.findAll({
      where: { studentId: uid },
      include: [{ model: db.orderItems }],
      order: [["createdAt", "DESC"]]
    });

    res.json({ orders });
  } catch (err) {
    console.error("GET /students/:uid/orders error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ---------------------------------------------------------
   POST /orders/create
   Called by PayPal server after capture
   Creates order + applies credits + sends email
--------------------------------------------------------- */
router.post("/orders/create", async (req, res) => {
  try {
    const { uid, email, cart, paypalOrder, status } = req.body;

    if (!email || !cart) {
      return res.status(400).json({ error: "Missing email or cart" });
    }

    const student = uid ? await db.students.findByPk(uid) : null;

    /* ---------------------------------------------------------
       Student NOT found → store as pending order
    --------------------------------------------------------- */
    if (!student) {
      await db.pendingOrders.create({
        email,
        order: {
          cart,
          paypalOrder,
          status: status || "completed"
        },
        createdAt: new Date().toISOString()
      });

      return res.json({
        success: true,
        pending: true,
        message: "Student not found — order stored as pending"
      });
    }

    /* ---------------------------------------------------------
       Student exists → sync pending + create order
    --------------------------------------------------------- */
    await syncPendingForStudent(student);

    const order = await db.orders.create({
      studentId: uid,
      email,
      cart,
      paypalOrder,
      status: status || "completed",
      createdAt: new Date().toISOString()
    });

    /* ---------------------------------------------------------
       Create order items
    --------------------------------------------------------- */
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

    /* ---------------------------------------------------------
       APPLY CREDITS (if the order contains credit bundles)
    --------------------------------------------------------- */
    let totalCreditsAdded = 0;

    for (const item of cart) {
      if (item.type === "credit_bundle") {
        const credits = item.credits || 0;
        const typeBreakdown = item.creditType ? { [item.creditType]: credits } : {};

        if (credits > 0) {
          await applyCredits(uid, credits, typeBreakdown, {
            source: "order_purchase",
            orderId: order.id
          });

          totalCreditsAdded += credits;
        }
      }
    }

    /* ---------------------------------------------------------
       SEND PURCHASE CONFIRMATION EMAIL
    --------------------------------------------------------- */
    if (totalCreditsAdded > 0) {
      const html = purchaseConfirmationEmail({
        brand: "Bean's Dreams",
        firstName: student.name.split(" ")[0],
        creditsAdded: totalCreditsAdded,
        dashboardUrl: "https://portal.beansdreams.org/dashboard",
        supportEmail: "support@beansdreams.org",
        logoUrl: "https://yourcdn.com/logo.png",
        websiteUrl: "https://beansdreams.org"
      });

      await sendEmail(student.email, "Your credits have been added!", html);
    }

    res.json({ success: true, order, creditsAdded: totalCreditsAdded });
  } catch (err) {
    console.error("POST /orders/create error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ---------------------------------------------------------
   POST /orders/:orderId/printify
   Stores Printify order data
--------------------------------------------------------- */
router.post("/orders/:orderId/printify", async (req, res) => {
  try {
    const { orderId } = req.params;
    const { printify } = req.body;

    const order = await db.orders.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    order.printifyData = printify;
    await order.save();

    res.json({ success: true });
  } catch (err) {
    console.error("POST /orders/:orderId/printify error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;

