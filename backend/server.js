// backend/server.js
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const path = require("path");

const app = express();

// ===============================
// Middleware
// ===============================
app.use(cors());
app.use(express.json());

// ===============================
// Auth Middleware
// ===============================
function authenticate(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(403).json({ message: "Invalid token" });
  }
}

function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
}

// ===============================
// Authenticated File Serving
// ===============================
// Example: GET /files/myphoto.png
app.get("/files/:filename", authenticate, (req, res) => {
  const filePath = path.join(__dirname, "uploads", req.params.filename);
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error("File serving error:", err);
      res.status(404).json({ error: "File not found" });
    }
  });
});

// ===============================
// Route Imports
// ===============================
const authRoutes = require("./routes/auth");
const orderRoutes = require("./routes/orders");
const creditsRoutes = require("./routes/credits");
const badgesRoutes = require("./routes/badges");
const classesRoutes = require("./routes/classes");
const emailRoutes = require("./routes/email");
const uploadsRoutes = require("./routes/uploads");
const journalsRoutes = require("./routes/journals");
const reflectionsRoutes = require("./routes/reflections");
const coachingRoutes = require("./routes/coaching");
const streaksRoutes = require("./routes/streaks");
const eventsRoutes = require("./routes/events");
const paypalWebhooks = require("./routes/paypalWebhooks");
const studentsRoutes = require("./routes/students");
const notificationsRoutes = require("./routes/notifications");
const adminRoutes = require("./routes/admin");
const adminFilesRoutes = require("./routes/adminFiles");
const adminAuthRoutes = require("./routes/adminAuth");
const filesRoutes = require("./routes/files");

const referralRoutes = require("./routes/referrals");
const referralAnalyticsRoutes = require("./routes/referralAnalytics");
const referralLeaderboardRoutes = require("./routes/referralLeaderboard");
const referralWebhooksRoutes = require("./routes/referralWebhooks");

// ===============================
// Public Routes
// ===============================
app.use("/auth", authRoutes);
app.use("/webhooks", paypalWebhooks);

// ===============================
// Authenticated User Routes
// ===============================
app.use("/orders", authenticate, orderRoutes);
app.use("/api/credits", authenticate, creditsRoutes);
app.use("/api/badges", authenticate, badgesRoutes);
app.use("/api/classes", authenticate, classesRoutes);
app.use("/api/email", authenticate, emailRoutes);
app.use("/api/uploads", authenticate, uploadsRoutes);
app.use("/api/journals", authenticate, journalsRoutes);
app.use("/api/reflections", authenticate, reflectionsRoutes);
app.use("/api/coaching", authenticate, coachingRoutes);
app.use("/api/streaks", authenticate, streaksRoutes);
app.use("/api/events", authenticate, eventsRoutes);
app.use("/api/students", authenticate, studentsRoutes);
app.use("/api/notifications", authenticate, notificationsRoutes);
app.use("/files", authenticate, filesRoutes);

// ===============================
// Referral System Routes
// ===============================
app.use("/api/referrals", authenticate, referralRoutes);
app.use("/api/referrals/webhooks", referralWebhooksRoutes);

// Admin‑only analytics
app.use(
  "/api/referrals/analytics",
  authenticate,
  authorizeRoles("admin"),
  referralAnalyticsRoutes
);

// Admin‑only leaderboard
app.use(
  "/api/referrals/leaderboard",
  authenticate,
  authorizeRoles("admin"),
  referralLeaderboardRoutes
);

// ===============================
// Admin Routes (secured)
// ===============================
app.use("/api/admin/auth", adminAuthRoutes);

app.use(
  "/api/admin",
  authenticate,
  authorizeRoles("admin"),
  adminRoutes
);

app.use(
  "/api/admin/files",
  authenticate,
  authorizeRoles("admin"),
  adminFilesRoutes
);

// ===============================
// Error Handler
// ===============================
const errorHandler = require("./middleware/errorHandler");
app.use(errorHandler);

// ===============================
// Start Server
// ===============================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Portal backend running on http://localhost:${PORT}`);
});
