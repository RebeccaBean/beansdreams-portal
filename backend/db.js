// backend/db.js
const { Sequelize, DataTypes } = require("sequelize");
const dotenv = require("dotenv");

// Core models
const BadgeProgress = require("./models/BadgeProgress");
const ClassCompletion = require("./models/ClassCompletion");
const Upload = require("./models/Upload");
const User = require("./models/User");

// Badge-related models
const JournalEntry = require("./models/JournalEntry");
const ReflectionEntry = require("./models/ReflectionEntry");
const Streak = require("./models/Streak");
const CoachingSession = require("./models/CoachingSession");

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
   STUDENT MODEL
--------------------------- */
const Student = sequelize.define("Student", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: {
    type: DataTypes.ENUM("student", "admin", "teacher"),
    defaultValue: "student",
  },

  // Legacy fields
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

/* ---------------------------
   ORDER MODELS
--------------------------- */
const Order = sequelize.define("Order", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  studentId: { type: DataTypes.UUID },
  email: { type: DataTypes.STRING },
  status: { type: DataTypes.STRING, defaultValue: "pending" },
  cart: { type: DataTypes.JSONB },
  paypalOrder: { type: DataTypes.JSONB },
  totalAmount: { type: DataTypes.FLOAT },
  mergedFromPending: { type: DataTypes.BOOLEAN, defaultValue: false },
  printifyData: { type: DataTypes.JSONB },
  createdAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
});

const OrderItem = sequelize.define("OrderItem", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  orderId: { type: DataTypes.UUID, allowNull: false },
  itemType: { type: DataTypes.STRING },
  bundleKey: { type: DataTypes.STRING },
  productId: { type: DataTypes.STRING },
  quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
  meta: { type: DataTypes.JSONB },
});

const PendingOrder = sequelize.define("PendingOrder", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  email: { type: DataTypes.STRING, allowNull: false },
  order: { type: DataTypes.JSONB, allowNull: false },
  createdAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
});

/* ---------------------------
   CREDIT MODELS
--------------------------- */
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

const PendingCredit = sequelize.define("PendingCredit", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  email: { type: DataTypes.STRING, allowNull: false },
  delta: { type: DataTypes.INTEGER, allowNull: false },
  typeBreakdown: { type: DataTypes.JSONB, defaultValue: {} },
  meta: { type: DataTypes.JSONB, defaultValue: {} },
  createdAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
});

/* ---------------------------
   DOWNLOAD MODELS
--------------------------- */
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
  createdAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
});

/* ---------------------------
   SUBSCRIPTIONS
--------------------------- */
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
  createdAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
});

/* ---------------------------
   SINGLE CLASS PURCHASE
--------------------------- */
const SingleClassPurchase = sequelize.define("SingleClassPurchase", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  studentId: { type: DataTypes.UUID },
  email: { type: DataTypes.STRING },
  classType: { type: DataTypes.STRING },
  status: { type: DataTypes.STRING, defaultValue: "created" },
  createdAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
});

/* ---------------------------
   WEBHOOK LOGS
--------------------------- */
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
   BADGE SYSTEM ASSOCIATIONS
--------------------------- */

// Student → Class Completions
Student.hasMany(ClassCompletion, { foreignKey: "uid", sourceKey: "id" });
ClassCompletion.belongsTo(Student, { foreignKey: "uid", targetKey: "id" });

// Student → Uploads
Student.hasMany(Upload, { foreignKey: "uid", sourceKey: "id" });
Upload.belongsTo(Student, { foreignKey: "uid", targetKey: "id" });

// Student → Journals
Student.hasMany(JournalEntry, { foreignKey: "uid", sourceKey: "id" });
JournalEntry.belongsTo(Student, { foreignKey: "uid", targetKey: "id" });

// Student → Reflections
Student.hasMany(ReflectionEntry, { foreignKey: "uid", sourceKey: "id" });
ReflectionEntry.belongsTo(Student, { foreignKey: "uid", targetKey: "id" });

// Student → Coaching Sessions
Student.hasMany(CoachingSession, { foreignKey: "uid", sourceKey: "id" });
CoachingSession.belongsTo(Student, { foreignKey: "uid", targetKey: "id" });

// Student → Streak
Student.hasOne(Streak, { foreignKey: "uid", sourceKey: "id" });
Streak.belongsTo(Student, { foreignKey: "uid", targetKey: "id" });

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
module.exports = {
  sequelize,
  students: Student,
  users: User,
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

  // Badge system models
  badgeProgress: BadgeProgress,
  classCompletions: ClassCompletion,
  uploads: Upload,
  journalEntries: JournalEntry,
  reflectionEntries: ReflectionEntry,
  streaks: Streak,
  coachingSessions: CoachingSession,
};
