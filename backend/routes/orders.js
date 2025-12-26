// backend/routes/orders.js
import express from "express";
import db from "../db.js";
import { syncPendingForStudent } from "../utils/syncPending.js";

const router = express.Router();

/**
 * ✅ GET /students/:uid/orders
 * Returns all orders for a student.
 * Automatically syncs pending orders first.
 */
router.get("/students/:uid/orders", async (req, res) => {
  try {
    const { uid } = req.params;

    const student = await db.students.findByPk(uid);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // ✅ Sync ALL pending data before returning orders
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

/**
 * ✅ POST /orders/create
 * Called by the PayPal server after capture.
 * Creates an order + order items.
 * If student does NOT exist → store as pending order.
 */
router.post("/orders/create", async (req, res) => {
  try {
    const { uid, email, cart, paypalOrder, status } = req.body;

    if (!email || !cart) {
      return res.status(400).json({ error: "Missing email or cart" });
    }

    // ✅ If student does NOT exist → store as pending order
    const student = uid ? await db.students.findByPk(uid) : null;

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

    // ✅ Student exists → sync pending + create order
    await syncPendingForStudent(student);

    const order = await db.orders.create({
      studentId: uid,
      email,
      cart,
      paypalOrder,
      status: status || "completed",
      createdAt: new Date().toISOString()
    });

    // ✅ Create order items
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
    console.error("POST /orders/create error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * ✅ POST /orders/:orderId/printify
 * Stores Printify order data after PayPal server creates a merch order.
 */
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

export default router;
