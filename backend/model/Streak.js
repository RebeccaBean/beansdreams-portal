// backend/models/Streak.js
const { DataTypes } = require("sequelize");
const db = require("../db");

const Streak = db.sequelize.define("Streak", {
  uid: {
    type: DataTypes.UUID,
    primaryKey: true
  },
  currentStreak: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  longestStreak: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  lastActivityDate: {
    type: DataTypes.DATE,
    allowNull: true
  }
});

module.exports = Streak;
