// backend/server.js
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");

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
const paypalWebhooks = require("./routes/paypal");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// JWT middleware
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

// Role middleware
function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
}

// ROUTES
app.use("/auth", authRoutes);
app.use("/orders", orderRoutes);
app.use("/api/credits", creditsRoutes);
app.use("/api/badges", badgesRoutes);
app.use("/api/classes", classesRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/uploads", uploadsRoutes);
app.use("/api/journals", journalsRoutes);
app.use("/api/reflections", reflectionsRoutes);
app.use("/api/coaching", coachingRoutes);
app.use("/api/streaks", streaksRoutes);
app.use("/api/events", eventsRoutes);
app.use("/webhooks", paypalWebhooks);
app.use("/api/students", require("./routes/students"));
app.use("/api/notifications", require("./routes/notifications"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/admin/files", require("./routes/adminFiles"));
app.use("/uploads", express.static("uploads"));
app.use("/api/admin", require("./routes/adminAuth"));
app.use("/files", require("./routes/files"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/admin", require("./routes/adminFiles"));

const errorHandler = require("./middleware/errorHandler");
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Portal backend running on http://localhost:${PORT}`);
});
