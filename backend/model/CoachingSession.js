const { DataTypes } = require("sequelize");
const db = require("../db");

const CoachingSession = db.sequelize.define("CoachingSession", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  uid: {
    type: DataTypes.UUID,
    allowNull: false
  },
  sessionType: {
    type: DataTypes.STRING,
    defaultValue: "general"
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: false
  }
});

module.exports = CoachingSession;
