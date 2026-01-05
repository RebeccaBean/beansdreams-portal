// backend/utils/syncPending.js
const db = require("../db.js");

/**
 * Sync ALL pending data for a student:
 * - Pending credits
 * - Pending downloads
 * - Pending subscriptions
 * - Pending orders
 *
 * Returns an object describing what was synced.
 */
async function syncPendingForStudent(student) {
  if (!student) return { credits: 0, downloads: 0, subscriptions: 0, orders: 0 };

  const uid = student.id;
  const email = student.email;

  let synced = {
    credits: 0,
    downloads: 0,
    subscriptions: 0,
    orders: 0
  };

  /* -----------------------------
     1. Sync Pending Credits
  ----------------------------- */
  const pendingCredits = await db.pendingCredits.findAll({ where: { email } });

  for (const p of pendingCredits) {
    await db.creditTransactions.create({
      studentId: uid,
      delta: p.delta,
      typeBreakdown: p.typeBreakdown,
      source: p.meta?.source || "pending_sync",
      orderId: p.meta?.orderId || null,
      meta: p.meta
    });
  }

  if (pendingCredits.length) {
    await db.pendingCredits.destroy({ where: { email } });
    synced.credits = pendingCredits.length;
  }

  /* -----------------------------
     2. Sync Pending Downloads
  ----------------------------- */
  const pendingDownloads = await db.pendingDownloads.findAll({ where: { email } });

  for (const p of pendingDownloads) {
    await db.downloads.create({
      studentId: uid,
      productId: p.productId
    });
  }

  if (pendingDownloads.length) {
    await db.pendingDownloads.destroy({ where: { email } });
    synced.downloads = pendingDownloads.length;
  }

  /* -----------------------------
     3. Sync Pending Subscriptions
  ----------------------------- */
  const pendingSubs = await db.pendingSubscriptions.findAll({ where: { email } });

  for (const p of pendingSubs) {
    await db.subscriptions.create({
      studentId: uid,
      planType: p.planType,
      paypalSubscriptionId: p.paypalSubscriptionId,
      status: p.status || "created"
    });
  }

  if (pendingSubs.length) {
    await db.pendingSubscriptions.destroy({ where: { email } });
    synced.subscriptions = pendingSubs.length;
  }

  /* -----------------------------
     4. Sync Pending Orders
  ----------------------------- */
  const pendingOrders = await db.pendingOrders.findAll({ where: { email } });

  for (const p of pendingOrders) {
    const order = await db.orders.create({
      studentId: uid,
      email,
      cart: p.order.cart || [],
      paypalOrder: p.order.paypalOrder || null,
      status: "completed",
      mergedFromPending: true,
      createdAt: new Date().toISOString()
    });

    // Create order items
    for (const item of p.order.cart || []) {
      await db.orderItems.create({
        orderId: order.id,
        itemType: item.type,
        bundleKey: item.bundleKey || null,
        productId: item.productId || null,
        quantity: item.quantity || 1,
        meta: item
      });
    }
  }

  if (pendingOrders.length) {
    await db.pendingOrders.destroy({ where: { email } });
    synced.orders = pendingOrders.length;
  }

  return synced;
}

module.exports = {
  syncPendingForStudent
};
