// backend/db.js
const { Sequelize, DataTypes } = require("sequelize");
const dotenv = require("dotenv");
dotenv.config();

/* ---------------------------
   1. Initialize Sequelize
--------------------------- */
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false
});

/* ---------------------------
   2. Load Models from /model
--------------------------- */
const Student = require("./model/Student")(sequelize, DataTypes);
const ClassCompletion = require("./model/ClassCompletion")(sequelize, DataTypes);

const Upload = require("./model/Upload")(sequelize, DataTypes);
const JournalEntry = require("./model/JournalEntry")(sequelize, DataTypes);
const ReflectionEntry = require("./model/ReflectionEntry")(sequelize, DataTypes);
const CoachingSession = require("./model/CoachingSession")(sequelize, DataTypes);
const Streak = require("./model/Streak")(sequelize, DataTypes);
const BadgeProgress = require("./model/BadgeProgress")(sequelize, DataTypes);
const Referral = require("./model/Referral")(sequelize, DataTypes);
const Notification = require("./model/Notification")(sequelize, DataTypes);

/* ---------------------------
   3. STUDENT MODEL (already loaded)
--------------------------- */
// Student is loaded from ./model/Student

/* ---------------------------
   4. ORDER MODELS
--------------------------- */
const Order = sequelize.define(
  "Order",
  {
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
  },
  { freezeTableName: true }
);

const OrderItem = sequelize.define(
  "OrderItem",
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    orderId: { type: DataTypes.UUID, allowNull: false },
    itemType: { type: DataTypes.STRING },
    bundleKey: { type: DataTypes.STRING },
    productId: { type: DataTypes.STRING },
    quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
    meta: { type: DataTypes.JSONB },
  },
  { freezeTableName: true }
);

const PendingOrder = sequelize.define(
  "PendingOrder",
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    email: { type: DataTypes.STRING, allowNull: false },
    order: { type: DataTypes.JSONB, allowNull: false },
    createdAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
  },
  { freezeTableName: true }
);

/* ---------------------------
   5. CREDIT MODELS
--------------------------- */
const CreditTransaction = sequelize.define(
  "CreditTransaction",
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    studentId: { type: DataTypes.UUID },
    delta: { type: DataTypes.INTEGER, allowNull: false },
    typeBreakdown: { type: DataTypes.JSONB, defaultValue: {} },
    source: { type: DataTypes.STRING },
    orderId: { type: DataTypes.UUID },
    meta: { type: DataTypes.JSONB },
    createdAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
  },
  { freezeTableName: true }
);

const PendingCredit = sequelize.define(
  "PendingCredit",
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    email: { type: DataTypes.STRING, allowNull: false },
    delta: { type: DataTypes.INTEGER, allowNull: false },
    typeBreakdown: { type: DataTypes.JSONB, defaultValue: {} },
    meta: { type: DataTypes.JSONB, defaultValue: {} },
    createdAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
  },
  { freezeTableName: true }
);

/* ---------------------------
   6. DOWNLOAD MODELS
--------------------------- */
const Download = sequelize.define(
  "Download",
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    studentId: { type: DataTypes.UUID },
    productId: { type: DataTypes.STRING, allowNull: false },
    grantedAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
  },
  { freezeTableName: true }
);

const PendingDownload = sequelize.define(
  "PendingDownload",
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    email: { type: DataTypes.STRING, allowNull: false },
    productId: { type: DataTypes.STRING, allowNull: false },
    meta: { type: DataTypes.JSONB, defaultValue: {} },
    createdAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
  },
  { freezeTableName: true }
);

/* ---------------------------
   7. SUBSCRIPTIONS
--------------------------- */
const Subscription = sequelize.define(
  "Subscription",
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    studentId: { type: DataTypes.UUID },
    planType: { type: DataTypes.STRING },
    paypalSubscriptionId: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: "created" },
    createdAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
    updatedAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
  },
  { freezeTableName: true }
);

const PendingSubscription = sequelize.define(
  "PendingSubscription",
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    email: { type: DataTypes.STRING, allowNull: false },
    planType: { type: DataTypes.STRING, allowNull: false },
    paypalSubscriptionId: { type: DataTypes.STRING, allowNull: false },
    status: { type: DataTypes.STRING, defaultValue: "created" },
    meta: { type: DataTypes.JSONB, defaultValue: {} },
    createdAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
  },
  { freezeTableName: true }
);

/* ---------------------------
   8. SINGLE CLASS PURCHASE
--------------------------- */
const SingleClassPurchase = sequelize.define(
  "SingleClassPurchase",
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    studentId: { type: DataTypes.UUID },
    email: { type: DataTypes.STRING },
    classType: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: "created" },
    createdAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
  },
  { freezeTableName: true }
);

/* ---------------------------
   9. WEBHOOK LOGS
--------------------------- */
const PayPalWebhook = sequelize.define(
  "PayPalWebhook",
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    body: { type: DataTypes.JSONB },
    receivedAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
  },
  { freezeTableName: true }
);

const PrintifyEvent = sequelize.define(
  "PrintifyEvent",
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    event: { type: DataTypes.JSONB },
    receivedAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
  },
  { freezeTableName: true }
);

const CalendlyEvent = sequelize.define(
  "CalendlyEvent",
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    event: { type: DataTypes.JSONB },
    email: { type: DataTypes.STRING },
    studentId: { type: DataTypes.UUID },
    receivedAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
  },
  { freezeTableName: true }
);

/* ---------------------------
   10. ASSOCIATIONS
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
   11. BADGE SYSTEM ASSOCIATIONS
--------------------------- */
Student.hasMany(ClassCompletion, { foreignKey: "uid", sourceKey: "id" });
ClassCompletion.belongsTo(Student, { foreignKey: "uid", targetKey: "id" });

Student.hasMany(Upload, { foreignKey: "uid", sourceKey: "id" });
Upload.belongsTo(Student, { foreignKey: "uid", targetKey: "id" });

Student.hasMany(JournalEntry, { foreignKey: "uid", sourceKey: "id" });
JournalEntry.belongsTo(Student, { foreignKey: "uid", targetKey: "id" });

Student.hasMany(ReflectionEntry, { foreignKey: "uid", sourceKey: "id" });
ReflectionEntry.belongsTo(Student, { foreignKey: "uid", targetKey: "id" });

Student.hasMany(CoachingSession, { foreignKey: "uid", sourceKey: "id" });
CoachingSession.belongsTo(Student, { foreignKey: "uid", targetKey: "id" });

Student.hasOne(Streak, { foreignKey: "uid", sourceKey: "id" });
Streak.belongsTo(Student, { foreignKey: "uid", targetKey: "id" });

/* ---------------------------
   12. INIT DB
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
   13. EXPORTS
--------------------------- */
module.exports = {
  sequelize,

  // core models
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

  // badge / progress / engagement
  badgeProgress: BadgeProgress,
  classCompletions: ClassCompletion,
  uploads: Upload,
  journalEntries: JournalEntry,
  reflectionEntries: ReflectionEntry,
  streaks: Streak,
  coachingSessions: CoachingSession,

  // referrals / notifications
  referrals: Referral,
  notifications: Notification,
};
