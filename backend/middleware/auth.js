// backend/middleware/auth.js
const jwt = require("jsonwebtoken");
const db = require("../db");

/**
 * Verify JWT and attach user to req.user
 */
async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user from DB (students table)
    const user = await db.students.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = user; // attach user to request
    next();

  } catch (err) {
    console.error("Auth error:", err);
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

/**
 * Allow only admins
 */
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

/**
 * Allow only teachers
 */
function requireTeacher(req, res, next) {
  if (!req.user || req.user.role !== "teacher") {
    return res.status(403).json({ error: "Teacher access required" });
  }
  next();
}

/**
 * Allow teachers OR admins
 */
function requireTeacherOrAdmin(req, res, next) {
  if (!req.user || !["teacher", "admin"].includes(req.user.role)) {
    return res.status(403).json({ error: "Teacher or admin access required" });
  }
  next();
}

module.exports = {
  requireAuth,
  requireAdmin,
  requireTeacher,
  requireTeacherOrAdmin
};
