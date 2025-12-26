// backend/server.js
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const authRoutes = require("./routes/auth");
const orderRoutes = require("./routes/orders");

const app = express();

import creditsRoutes from "./routes/credits.js";
app.use("/dashboard/credits", creditsRoutes);

// Middleware
app.use(cors());
app.use(express.json());

// Middleware: verify JWT and attach user
function authenticate(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid token" });
  }
}

// Middleware: role-based access
function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
}

// Mount routes
app.use("/auth", authRoutes);
app.use("/orders", orderRoutes);

// Example protected route
app.get("/admin", authenticate, authorizeRoles("admin"), (req, res) => {
  res.send("Welcome Admin!");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Portal backend running on http://localhost:${PORT}`);
});

