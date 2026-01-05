const express = require("express");
const db = require("../db");
const { requireAuth, requireAdmin } = require("../middleware/auth");
const { syncPendingForStudent } = require("../utils/syncPending");
const adminLogger = require("../middleware/adminLogger");
const validate = require("../middleware/validate");
const buildSearchQuery = require("../utils/searchQuery");

const router = express.Router();

/* ============================================================
   ADMIN STUDENT MANAGEMENT
============================================================ */

/* GET ALL STUDENTS (with search/filter) */
router.get("/students", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const where = buildSearchQuery(req.query);

    const students = await db.students.findAll({
      where,
      order: [["createdAt", "DESC"]],
      attributes: { exclude: ["password"] }
    });

    res.json({ students });
  } catch (err) {
    next(err);
  }
});

/* GET SINGLE STUDENT (FULL PROFILE) */
router.get("/students/:uid", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const student = await db.students.findByPk(req.params.uid, {
      attributes: { exclude: ["password"] },
      include: [
        { model: db.creditTransactions },
        { model: db.downloads },
        { model: db.subscriptions },
        { model: db.orders, include: [db.orderItems] },
        { model: db.uploads }
      ]
    });

    if (!student) return res.status(404).json({ error: "Student not found" });

    res.json({ student });
  } catch (err) {
    next(err);
  }
});

/* UPDATE STUDENT INFO */
router.put("/students/:uid", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const student = await db.students.findByPk(req.params.uid);
    if (!student) return res.status(404).json({ error: "Student not found" });

    await student.update(req.body);

    res.json({ success: true, student });
  } catch (err) {
    next(err);
  }
});

/* ============================================================
   ADMIN CREDIT MANAGEMENT
============================================================ */

router.post(
  "/students/:uid/credits",
  requireAuth,
  requireAdmin,
  adminLogger("ADD_CREDITS"),
  validate(["delta"]),
  async (req, res, next) => {
    try {
      const { uid } = req.params;
      const { delta, typeBreakdown, source } = req.body;

      const student = await db.students.findByPk(uid);
      if (!student) return res.status(404).json({ error: "Student not found" });

      const tx = await db.creditTransactions.create({
        studentId: uid,
        delta,
        typeBreakdown: typeBreakdown || {},
        source: source || "admin_manual",
        meta: { adminId: req.user.id }
      });

      res.json({ success: true, transaction: tx });
    } catch (err) {
      next(err);
    }
  }
);

/* ============================================================
   ADMIN DOWNLOAD ASSIGNMENT
============================================================ */

router.post(
  "/students/:uid/downloads",
  requireAuth,
  requireAdmin,
  adminLogger("ASSIGN_DOWNLOAD"),
  validate(["productId"]),
  async (req, res, next) => {
    try {
      const { uid } = req.params;
      const { productId } = req.body;

      const student = await db.students.findByPk(uid);
      if (!student) return res.status(404).json({ error: "Student not found" });

      await syncPendingForStudent(student);

      const download = await db.downloads.create({
        studentId: uid,
        productId
      });

      res.json({ success: true, download });
    } catch (err) {
      next(err);
    }
  }
);

/* CUSTOM FILE DOWNLOAD */
router.post(
  "/students/:uid/downloads/custom",
  requireAuth,
  requireAdmin,
  adminLogger("ASSIGN_CUSTOM_DOWNLOAD"),
  validate(["fileId", "label"]),
  async (req, res, next) => {
    try {
      const { uid } = req.params;
      const { fileId, label } = req.body;

      const student = await db.students.findByPk(uid);
      if (!student) return res.status(404).json({ error: "Student not found" });

      const file = await db.uploads.findByPk(fileId);
      if (!file) return res.status(404).json({ error: "File not found" });

      const download = await db.downloads.create({
        studentId: uid,
        productId: `custom_${fileId}`,
        meta: {
          label,
          fileId,
          fileMeta: file.meta
        }
      });

      res.json({ success: true, download });
    } catch (err) {
      next(err);
    }
  }
);

/* ============================================================
   ADMIN NOTES SYSTEM
============================================================ */

router.post(
  "/students/:uid/notes",
  requireAuth,
  requireAdmin,
  adminLogger("ADD_NOTE"),
  validate(["note"]),
  async (req, res, next) => {
    try {
      const student = await db.students.findByPk(req.params.uid);
      if (!student) return res.status(404).json({ error: "Student not found" });

      const noteRecord = await db.uploads.create({
        uid: student.id,
        type: "admin_note",
        meta: {
          note: req.body.note,
          adminId: req.user.id,
          createdAt: new Date().toISOString()
        }
      });

      res.json({ success: true, note: noteRecord });
    } catch (err) {
      next(err);
    }
  }
);

/* ============================================================
   ADMIN ORDERS MANAGEMENT
============================================================ */

router.get("/orders", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const orders = await db.orders.findAll({
      include: [db.orderItems, db.students],
      order: [["createdAt", "DESC"]]
    });

    res.json({ orders });
  } catch (err) {
    next(err);
  }
});

router.get("/orders/:orderId", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const order = await db.orders.findByPk(req.params.orderId, {
      include: [db.orderItems, db.students]
    });

    if (!order) return res.status(404).json({ error: "Order not found" });

    res.json({ order });
  } catch (err) {
    next(err);
  }
});

router.post(
  "/students/:uid/orders",
  requireAuth,
  requireAdmin,
  adminLogger("CREATE_ORDER"),
  validate(["cart", "totalAmount"]),
  async (req, res, next) => {
    try {
      const { uid } = req.params;
      const { cart, totalAmount } = req.body;

      const student = await db.students.findByPk(uid);
      if (!student) return res.status(404).json({ error: "Student not found" });

      const order = await db.orders.create({
        studentId: uid,
        email: student.email,
        cart,
        totalAmount,
        status: "completed",
        mergedFromPending: false
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
      next(err);
    }
  }
);

/* ============================================================
   ADMIN SUBSCRIPTIONS MANAGEMENT
============================================================ */

router.get("/subscriptions", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const subs = await db.subscriptions.findAll({
      include: [db.students],
      order: [["createdAt", "DESC"]]
    });

    res.json({ subscriptions: subs });
  } catch (err) {
    next(err);
  }
});

router.get("/students/:uid/subscriptions", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const subs = await db.subscriptions.findAll({
      where: { studentId: req.params.uid }
    });

    res.json({ subscriptions: subs });
  } catch (err) {
    next(err);
  }
});

router.post(
  "/subscriptions/:id/cancel",
  requireAuth,
  requireAdmin,
  adminLogger("CANCEL_SUBSCRIPTION"),
  async (req, res, next) => {
    try {
      const sub = await db.subscriptions.findByPk(req.params.id);
      if (!sub) return res.status(404).json({ error: "Subscription not found" });

      await sub.update({ status: "cancelled" });

      res.json({ success: true, subscription: sub });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  "/students/:uid/subscriptions",
  requireAuth,
  requireAdmin,
  adminLogger("CREATE_SUBSCRIPTION"),
  validate(["planType"]),
  async (req, res, next) => {
    try {
      const student = await db.students.findByPk(req.params.uid);
      if (!student) return res.status(404).json({ error: "Student not found" });

      const sub = await db.subscriptions.create({
        studentId: req.params.uid,
        planType: req.body.planType,
        status: "active"
      });

      res.json({ success: true, subscription: sub });
    } catch (err) {
      next(err);
    }
  }
);

/* ============================================================
   ADMIN PENDING-SYNC TOOLS
============================================================ */

router.get("/pending", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const pending = {
      credits: await db.pendingCredits.findAll(),
      downloads: await db.pendingDownloads.findAll(),
      orders: await db.pendingOrders.findAll(),
      subscriptions: await db.pendingSubscriptions.findAll()
    };

    res.json({ pending });
  } catch (err) {
    next(err);
  }
});

router.post("/students/:uid/sync", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const student = await db.students.findByPk(req.params.uid);
    if (!student) return res.status(404).json({ error: "Student not found" });

    const result = await syncPendingForStudent(student);

    res.json({ success: true, synced: result });
  } catch (err) {
    next(err);
  }
});

router.post("/sync-all", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const students = await db.students.findAll();
    let summary = [];

    for (const student of students) {
      const result = await syncPendingForStudent(student);
      summary.push({ studentId: student.id, ...result });
    }

    res.json({ success: true, summary });
  } catch (err) {
    next(err);
  }
});

/* ============================================================
   ADMIN DASHBOARD SUMMARY
============================================================ */

router.get("/dashboard", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const [
      studentCount,
      orderCount,
      subscriptionCount,
      pendingCredits,
      pendingDownloads,
      pendingOrders,
      pendingSubscriptions
    ] = await Promise.all([
      db.students.count(),
      db.orders.count(),
      db.subscriptions.count(),
      db.pendingCredits.count(),
      db.pendingDownloads.count(),
      db.pendingOrders.count(),
      db.pendingSubscriptions.count()
    ]);

    res.json({
      stats: {
        students: studentCount,
        orders: orderCount,
        subscriptions: subscriptionCount,
        pending: {
          credits: pendingCredits,
          downloads: pendingDownloads,
          orders: pendingOrders,
          subscriptions: pendingSubscriptions
        }
      }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
