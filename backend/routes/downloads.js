// backend/routes/downloads.js
const express = require("express");
const db = require("../db");
const { syncPendingForStudent } = require("../utils/syncPending");

const router = express.Router();

/**
 * POST /students/:uid/downloads
 * Grants a download entitlement.
 * If student does NOT exist → store as pending download.
 * If student exists → sync pending + grant download.
 */
router.post("/students/:uid/downloads", async (req, res) => {
  try {
    const { uid } = req.params;
    const { productId, email } = req.body;

    if (!productId) {
      return res.status(400).json({ error: "Missing productId" });
    }

    // Check if student exists
    const student = await db.students.findByPk(uid);

    if (!student) {
      // Store as pending download (pre‑signup)
      await db.pendingDownloads.create({
        email: email || null,
        productId,
        meta: { uid }
      });

      return res.json({
        success: true,
        pending: true,
        message: "Student not found — download stored as pending"
      });
    }

    // Sync ALL pending data before granting new download
    await syncPendingForStudent(student);

    // Grant download
    await db.downloads.create({
      studentId: uid,
      productId
    });

    res.json({ success: true });
  } catch (err) {
    console.error("POST /students/:uid/downloads error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * GET /students/:uid/downloads
 * Returns all download entitlements.
 * Automatically syncs pending downloads first.
 */
router.get("/students/:uid/downloads", async (req, res) => {
  try {
    const { uid } = req.params;

    const student = await db.students.findByPk(uid);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Sync ALL pending data before returning downloads
    await syncPendingForStudent(student);

    const downloads = await db.downloads.findAll({
      where: { studentId: uid }
    });

    res.json({ downloads });
  } catch (err) {
    console.error("GET /students/:uid/downloads error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
