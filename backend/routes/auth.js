// backend/routes/auth.js
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { db } from '../db.js'; // import Sequelize models
import { Op } from 'sequelize'; // ✅ import Op directly

const router = express.Router();

// SIGN UP
router.post('/signup', async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const student = await db.students.create({
      name,
      email,
      password: hashedPassword,   // make sure Student model has a password field
      role: role || 'student'
    });

    // ✅ Send welcome email
    await sendEmail(email, 'Welcome to the Portal', `
      <h2>Welcome, ${name}!</h2>
      <p>We’re excited to have you on board.</p>
    `);

    res.json({ id: student.id, email: student.email, role: student.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error signing up' });
  }
});

// SIGN IN
router.post('/signin', async (req, res) => {
  const { email, password } = req.body;
  try {
    const student = await db.students.findOne({ where: { email } });
    if (!student) return res.status(400).json({ error: 'User not found' });

    const match = await bcrypt.compare(password, student.password);
    if (!match) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: student.id, role: student.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error signing in' });
  }
});

// FORGOT PASSWORD
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 3600000); // 1 hour
    const student = await db.students.findOne({ where: { email } });
    if (!student) return res.status(400).json({ error: 'User not found' });

    student.reset_token = token;
    student.reset_token_expiry = expiry;
    await student.save();

    // ✅ Send reset email
    const resetLink = `http://localhost:5500/auth.html?token=${token}`;
    await sendEmail(email, 'Password Reset', `
      <p>Click here to reset your password:</p>
      <a href="${resetLink}">${resetLink}</a>
    `);

    res.json({ message: 'Password reset link sent to your email' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error generating reset link' });
  }
});

// RESET PASSWORD
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const student = await db.students.findOne({
      where: {
        reset_token: token,
        reset_token_expiry: { [Op.gt]: new Date() }
      }
    });
    if (!student) return res.status(400).json({ error: 'Invalid or expired token' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    student.password = hashedPassword;
    student.reset_token = null;
    student.reset_token_expiry = null;
    await student.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error resetting password' });
  }
});

// ✅ Helper: Nodemailer setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Gmail address
    pass: process.env.EMAIL_PASS  // Gmail App Password
  }
});

async function sendEmail(to, subject, html) {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    html
  });
}

export default router;
