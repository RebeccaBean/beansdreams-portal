const db = require("../db");
const { getBadgeProgress } = require("../services/badgeService");

exports.getDashboard = async (req, res) => {
  const uid = req.params.uid;

  const student = await db.students.findByPk(uid, {
    include: [
      db.subscriptions,
      db.downloads,
      db.orders,
      db.creditTransactions
    ]
  });

  res.json({
    subscriptions: student.subscriptions,
    remainingCredits: student.remainingCredits,
    downloads: student.downloads,
    orders: student.orders,
    achievements: [], // optional
    instructorNotes: [],
    studentNotes: student.studentNotes || {},
    sessionLinks: student.sessionLinks || {},
    nextSession: {}
  });
};

exports.getBadges = async (req, res) => {
  const uid = req.params.uid;
  const progress = await getBadgeProgress(uid);
  res.json({ progress });
};

exports.updateBadgeProgress = async (req, res) => {
  const uid = req.params.uid;
  const { key, amount } = req.body;
  await updateBadgeProgressInternal(uid, key, amount);
  res.json({ success: true });
};

exports.saveStudentNotes = async (req, res) => {
  const uid = req.user.uid;
  await db.students.update({ studentNotes: req.body }, { where: { id: uid } });
  res.json({ success: true });
};

exports.saveSessionLinks = async (req, res) => {
  const uid = req.user.uid;
  await db.students.update({ sessionLinks: req.body }, { where: { id: uid } });
  res.json({ success: true });
};
