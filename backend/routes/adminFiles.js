const express = require("express");
const upload = require("../middleware/upload");
const db = require("../db");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

/**
 * POST /api/admin/students/:uid/files
 * Upload a file and attach it to a student
 */
router.post(
  "/students/:uid/files",
  requireAuth,
  requireAdmin,
  upload.single("file"),
  async (req, res) => {
    try {
      const { uid } = req.params;

      const student = await db.students.findByPk(uid);
      if (!student) {
        return res.status(404).json({ error: "Student not found" });
      }

      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const fileRecord = await db.uploads.create({
        uid: student.id,
        type: "admin_upload",
        meta: {
          filename: req.file.filename,
          originalName: req.file.originalname,
          mimeType: req.file.mimetype,
          path: req.file.path,
          size: req.file.size
        }
      });

      res.json({
        success: true,
        file: fileRecord
      });
    } catch (err) {
      console.error("Admin file upload error:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

module.exports = router;
