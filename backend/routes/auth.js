// backend/routes/auth.js
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { Op } = require("sequelize");
const db = require("../db");

// Email utilities (disabled for now)
const { sendEmail } = require("../utils/mailer");
const { welcomeEmail, resetPasswordEmail } = require("../utils/emailTemplates");

// Sync pending data
const { syncPendingForStudent } = require("../utils/syncPending");

// Auth middleware
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

/**
 * NORMALIZE EMAIL
 */
function normalizeEmail(email) {
  return email.toLowerCase().trim();
}

/**
 * SIGN UP — All new users become "student"
 */
router.post("/signup", async (req, res) => {
  let { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({
        error: "Name, email, and password are required"
      });
    }

    email = normalizeEmail(email);

    const existing = await db.students.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create student with forced role = student
    const student = await db.students.create({
      name,
      email,
      password: hashedPassword,
      role: "student"
    });

    // Sync pending data (credits, downloads, subs, orders)
    const synced = await syncPendingForStudent(student);

    /**
     * EMAIL SENDING DISABLED FOR RENDER
     * (Prevents ECONNREFUSED 127.0.0.1:587 crashes)
     */
    try {
      const html = welcomeEmail({
        brand: "Student Portal",
        firstName: student.name.split(" ")[0],
        email: student.email,
        role: student.role,
        dashboardUrl: "https://yourdomain.com/dashboard",
        supportEmail: "support@yourdomain.com",
        logoUrl: "https://yourcdn.com/logo.png",
        websiteUrl: "https://yourdomain.com"
      });

      // DISABLED — uncomment when SMTP is configured
      // await sendEmail(student.email, "Welcome to Student Portal", html);

    } catch (emailErr) {
      console.error("Email send failed (ignored):", emailErr);
    }

    res.json({
      id: student.id,
      email: student.email,
      role: student.role,
      syncedPending: synced
    });

  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Error signing up" });
  }
});

/**
 * SIGN IN
 */
router.post("/signin", async (req, res) => {
  let { email, password } = req.body;

  try {
    email = normalizeEmail(email);

    const student = await db.students.findOne({ where: { email } });
    if (!student) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const match = await bcrypt.compare(password, student.password);
    if (!match) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Sync pending data on login
    const synced = await syncPendingForStudent(student);

    const token = jwt.sign(
      { id: student.id, role: student.role, email: student.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, syncedPending: synced });

  } catch (err) {
    console.error("Signin error:", err);
    res.status(500).json({ error: "Error signing in" });
  }
});

/**
 * FORGOT PASSWORD — Sends reset email
 */
router.post("/forgot-password", async (req, res) => {
  let { email } = req.body;

  try {
    email = normalizeEmail(email);

    const student = await db.students.findOne({ where: { email } });
    if (!student) {
      return res.status(400).json({ error: "User not found" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 3600000); // 1 hour

    student.reset_token = token;
    student.reset_token_expiry = expiry;
    await student.save();

    const resetLink = `https://yourdomain.com/reset-password?token=${token}`;

    const html = resetPasswordEmail({
      brand: "Student Portal",
      firstName: student.name.split(" ")[0],
      resetLink,
      supportEmail: "support@yourdomain.com",
      logoUrl: "https://yourcdn.com/logo.png",
      websiteUrl: "https://yourdomain.com"
    });

    // DISABLED — uncomment when SMTP is configured
    // await sendEmail(email, "Reset your Student Portal password", html);

    res.json({ message: "Password reset email sent" });

  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ error: "Error generating reset link" });
  }
});

/**
 * RESET PASSWORD
 */
router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const student = await db.students.findOne({
      where: {
        reset_token: token,
        reset_token_expiry: { [Op.gt]: new Date() }
      }
    });

    if (!student) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    student.password = hashedPassword;
    student.reset_token = null;
    student.reset_token_expiry = null;
    await student.save();

    res.json({ message: "Password updated successfully" });

  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ error: "Error resetting password" });
  }
});

/**
 * GET /auth/me
 */
router.get("/me", requireAuth, async (req, res) => {
  res.json({
    id: req.user.id,
    email: req.user.email,
    name: req.user.name,
    role: req.user.role
  });
});

module.exports = router;
