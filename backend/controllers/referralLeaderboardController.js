// backend/controllers/referralLeaderboardController.js

const { referrals: Referral } = require("../db");
const { Sequelize } = require("sequelize");

exports.getTopReferrers = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;

    const results = await Referral.findAll({
      attributes: [
        "referrerUid",
        [Sequelize.fn("COUNT", Sequelize.col("id")), "totalReferrals"],
        [
          Sequelize.fn("SUM", Sequelize.literal(`CASE WHEN status = 'completed' THEN 1 ELSE 0 END`)),
          "completedReferrals"
        ]
      ],
      group: ["referrerUid"],
      order: [[Sequelize.literal("completedReferrals"), "DESC"]],
      limit
    });

    res.json({ leaderboard: results });
  } catch (err) {
    console.error("getTopReferrers error:", err);
    res.status(500).json({ error: "Failed to load leaderboard" });
  }
};
