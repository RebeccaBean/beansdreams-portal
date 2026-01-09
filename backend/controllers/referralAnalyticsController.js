// backend/controllers/referralAnalyticsController.js

const { referrals: Referral } = require("../db");
const { Op } = require("sequelize");

exports.getOverviewStats = async (req, res) => {
  try {
    const [total, pending, signedUp, completed] = await Promise.all([
      Referral.count(),
      Referral.count({ where: { status: "pending" } }),
      Referral.count({ where: { status: "signed_up" } }),
      Referral.count({ where: { status: "completed" } })
    ]);

    const conversionRate = total > 0 ? completed / total : 0;

    res.json({
      totalReferrals: total,
      pending,
      signedUp,
      completed,
      conversionRate
    });
  } catch (err) {
    console.error("getOverviewStats error:", err);
    res.status(500).json({ error: "Failed to load referral stats" });
  }
};

exports.getReferrerStats = async (req, res) => {
  try {
    const referrerUid = req.params.uid;

    const [total, signedUp, completed] = await Promise.all([
      Referral.count({ where: { referrerUid } }),
      Referral.count({ where: { referrerUid, status: "signed_up" } }),
      Referral.count({ where: { referrerUid, status: "completed" } })
    ]);

    res.json({
      referrerUid,
      totalReferrals: total,
      signedUp,
      completed
    });
  } catch (err) {
    console.error("getReferrerStats error:", err);
    res.status(500).json({ error: "Failed to load referrer stats" });
  }
};

exports.getReferralsOverTime = async (req, res) => {
  try {
    const { from, to } = req.query;

    const where = {};
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt[Op.gte] = new Date(from);
      if (to) where.createdAt[Op.lte] = new Date(to);
    }

    const referrals = await Referral.findAll({
      where,
      attributes: ["createdAt", "status"]
    });

    res.json({ referrals });
  } catch (err) {
    console.error("getReferralsOverTime error:", err);
    res.status(500).json({ error: "Failed to load referral timeline" });
  }
};
