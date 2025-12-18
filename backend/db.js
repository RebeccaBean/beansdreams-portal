// backend/db.js
const { Sequelize, DataTypes } = require("sequelize");
const dotenv = require("dotenv");

dotenv.config();

// Connect to PostgreSQL using environment variables
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST || "localhost",
    dialect: "postgres",
    logging: false,
  }
);

// Define models
const Student = sequelize.define("Student", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING, unique: true },
  password: { type: DataTypes.STRING, allowNull: false }, // ✅ moved inside model
  role: {
    type: DataTypes.ENUM("student", "admin", "teacher"),
    defaultValue: "student",
  },
  credits: { type: DataTypes.INTEGER, defaultValue: 0 },
  remainingCredits: {
    type: DataTypes.JSONB,
    defaultValue: { total: 0, byType: {} },
  },
  paymentHistory: { type: DataTypes.JSONB, defaultValue: [] },
  subscriptions: { type: DataTypes.JSONB, defaultValue: [] },
  downloads: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
  reset_token: { type: DataTypes.STRING }, // ✅ moved inside model
  reset_token_expiry: { type: DataTypes.DATE }, // ✅ moved inside model
});

const Order = sequelize.define("Order", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  uid: { type: DataTypes.UUID },
  email: { type: DataTypes.STRING },
  cart: { type: DataTypes.JSONB },
  paypalOrder: { type: DataTypes.JSONB },
  status: { type: DataTypes.STRING, defaultValue: "pending" },
  createdAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
});

const SingleClassPurchase = sequelize.define("SingleClassPurchase", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  uid: { type: DataTypes.UUID },
  email: { type: DataTypes.STRING },
  classType: { type: DataTypes.STRING },
  status: { type: DataTypes.STRING, defaultValue: "created" },
  createdAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
});

const PayPalWebhook = sequelize.define("PayPalWebhook", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  body: { type: DataTypes.JSONB },
  receivedAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
});

const PrintifyEvent = sequelize.define("PrintifyEvent", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  event: { type: DataTypes.JSONB },
  receivedAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
});

const CalendlyEvent = sequelize.define("CalendlyEvent", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  event: { type: DataTypes.JSONB },
  email: { type: DataTypes.STRING },
  uid: { type: DataTypes.UUID },
  receivedAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
});

// Sync models with DB
async function initDB() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected");
    await sequelize.sync({ alter: true }); // auto-create/update tables
    console.log("✅ Tables synced");
  } catch (err) {
    console.error("❌ DB connection error:", err);
  }
}

initDB();

module.exports = {
  sequelize,
  students: Student,
  orders: Order,
  singleClassPurchases: SingleClassPurchase,
  paypalWebhooks: PayPalWebhook,
  printifyEvents: PrintifyEvent,
  calendlyEvents: CalendlyEvent,
};
