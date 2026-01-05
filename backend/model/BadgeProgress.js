// backend/models/BadgeProgress.js
const { DataTypes } = require("sequelize");
const db = require("../db");

const BadgeProgress = db.sequelize.define("BadgeProgress", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },

  uid: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true
  },

  // Stores badge progress as a JSON object
  progress: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },

  // List of earned badge keys
  earnedBadges: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },

  // List of unlocked reward codes
  unlockedCodes: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  }
});

module.exports = BadgeProgress;
