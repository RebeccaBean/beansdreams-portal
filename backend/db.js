// backend/db.js
import { Sequelize, DataTypes } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

/* ---------------------------
   Initialize Sequelize
--------------------------- */
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

/* ---------------------------
   MODELS
--------------------------- */

// ✅ STUDENT
const Student = sequelize.define("Student", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: {
    type: DataTypes.ENUM("student", "admin", "teacher"),
    defaultValue: "student",
  },

  // Legacy fields (kept for backward compatibility)
  credits: { type: DataTypes.INTEGER, defaultValue: 0 },
  remainingCredits: {
    type: DataTypes.JSONB,
    defaultValue: { total: 0, byType: {} },
  },
  paymentHistory: { type: DataTypes.JSONB, defaultValue: [] },
  subscriptions: { type: DataTypes.JSONB, defaultValue: [] },
  downloads: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },

  reset_token: { type: DataTypes.STRING },
  reset_token_expiry: { type: DataTypes.DATE },
});

// ✅ ORDER
const Order = sequelize.define("Order", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  studentId: { type: DataTypes.UUID },
  email: { type: DataTypes.STRING },
  status: { type: DataTypes.STRING, defaultValue: "pending" },
  cart: { type: DataTypes.JSONB }, // legacy
  paypalOrder: { type: DataTypes.JSONB },
  totalAmount: { type: DataTypes.FLOAT },
  mergedFromPending: { type: DataTypes.BOOLEAN, defaultValue: false },
  printifyData: { type: DataTypes.JSONB },
  createdAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
});

// ✅ ORDER ITEM
const OrderItem = sequelize.define("OrderItem", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  orderId: { type: DataTypes.UUID, allowNull: false },
  itemType: { type: DataTypes.STRING }, // bundle, digital, merch
  bundleKey: { type: DataTypes.STRING },
  productId: { type: DataTypes.STRING },
  quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
  meta: { type: DataTypes.JSONB },
});
// ✅ PENDING ORDER (for pre‑signup purchases)
const PendingOrder = sequelize.define("PendingOrder", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },

  email: {
    type: DataTypes.STRING,
    allowNull: false
  },

  // The entire order payload from PayPal server
  order: {
    type: DataTypes.JSONB,
    allowNull: false
  },

  createdAt: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW
  }
});

// ✅ CREDIT TRANSACTION
const CreditTransaction = sequelize.define("CreditTransaction", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  studentId: { type: DataTypes.UUID },
  delta: { type: DataTypes.INTEGER, allowNull: false },
  typeBreakdown: { type: DataTypes.JSONB, defaultValue: {} },
  source: { type: DataTypes.STRING },
  orderId: { type: DataTypes.UUID },
  meta: { type: DataTypes.JSONB },
  createdAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
});

// ✅ PENDING CREDIT (NEW)
const PendingCredit = sequelize.define("PendingCredit", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  email: { type: DataTypes.STRING, allowNull: false },
  delta: { type: DataTypes.INTEGER, allowNull: false },
  typeBreakdown: { type: DataTypes.JSONB, defaultValue: {} },
  meta: { type: DataTypes.JSONB, defaultValue: {} },
  createdAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
});

// ✅ DOWNLOAD ENTITLEMENT
const Download = sequelize.define("Download", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  studentId: { type: DataTypes.UUID },
  productId: { type: DataTypes.STRING, allowNull: false },
  grantedAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
});
const PendingDownload = sequelize.define("PendingDownload", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  email: { type: DataTypes.STRING, allowNull: false },
  productId: { type: DataTypes.STRING, allowNull: false },
  meta: { type: DataTypes.JSONB, defaultValue: {} },
  createdAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW }
});

// ✅ SUBSCRIPTION
const Subscription = sequelize.define("Subscription", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  studentId: { type: DataTypes.UUID },
  planType: { type: DataTypes.STRING },
  paypalSubscriptionId: { type: DataTypes.STRING },
  status: { type: DataTypes.STRING, defaultValue: "created" },
  createdAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
  updatedAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
});
const PendingSubscription = sequelize.define("PendingSubscription", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  email: { type: DataTypes.STRING, allowNull: false },
  planType: { type: DataTypes.STRING, allowNull: false },
  paypalSubscriptionId: { type: DataTypes.STRING, allowNull: false },
  status: { type: DataTypes.STRING, defaultValue: "created" },
  meta: { type: DataTypes.JSONB, defaultValue: {} },
  createdAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW }
});

// ✅ SINGLE CLASS PURCHASE (legacy)
const SingleClassPurchase = sequelize.define("SingleClassPurchase", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  studentId: { type: DataTypes.UUID },
  email: { type: DataTypes.STRING },
  classType: { type: DataTypes.STRING },
  status: { type: DataTypes.STRING, defaultValue: "created" },
  createdAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
});

// ✅ WEBHOOK LOGS
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
  studentId: { type: DataTypes.UUID },
  receivedAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
});

/* ---------------------------
   ASSOCIATIONS
--------------------------- */

// Student → Orders
Student.hasMany(Order, { foreignKey: "studentId" });
Order.belongsTo(Student, { foreignKey: "studentId" });

// Order → OrderItems
Order.hasMany(OrderItem, { foreignKey: "orderId" });
OrderItem.belongsTo(Order, { foreignKey: "orderId" });

// Student → CreditTransactions
Student.hasMany(CreditTransaction, { foreignKey: "studentId" });
CreditTransaction.belongsTo(Student, { foreignKey: "studentId" });

// Student → Downloads
Student.hasMany(Download, { foreignKey: "studentId" });
Download.belongsTo(Student, { foreignKey: "studentId" });

// Student → Subscriptions
Student.hasMany(Subscription, { foreignKey: "studentId" });
Subscription.belongsTo(Student, { foreignKey: "studentId" });

// Student → SingleClassPurchase
Student.hasMany(SingleClassPurchase, { foreignKey: "studentId" });
SingleClassPurchase.belongsTo(Student, { foreignKey: "studentId" });

// Student → CalendlyEvent
Student.hasMany(CalendlyEvent, { foreignKey: "studentId" });
CalendlyEvent.belongsTo(Student, { foreignKey: "studentId" });

/* ---------------------------
   INIT DB
--------------------------- */
async function initDB() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected");

    await sequelize.sync({ alter: true });
    console.log("✅ Tables synced");
  } catch (err) {
    console.error("❌ DB connection error:", err);
  }
}

initDB();

/* ---------------------------
   EXPORTS
--------------------------- */
export default {
  sequelize,
  students: Student,
  orders: Order,
  orderItems: OrderItem,
  creditTransactions: CreditTransaction,
  pendingCredits: PendingCredit,
  downloads: Download,
  subscriptions: Subscription,
  singleClassPurchases: SingleClassPurchase,
  paypalWebhooks: PayPalWebhook,
  printifyEvents: PrintifyEvent,
  calendlyEvents: CalendlyEvent,
  pendingDownloads: PendingDownload,
  pendingOrders: PendingOrder,
  pendingSubscriptions: PendingSubscription,
};
