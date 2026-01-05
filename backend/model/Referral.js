// backend/models/Referral.js
const { DataTypes } = require("sequelize");
const db = require("../db");

const Referral = db.sequelize.define("Referral", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },

  referrerUid: {
    type: DataTypes.UUID,
    allowNull: false
  },

  referredEmail: {
    type: DataTypes.STRING,
    allowNull: false
  },

  status: {
    type: DataTypes.ENUM("pending", "signed_up", "completed"),
    defaultValue: "pending"
  }
});

module.exports = Referral;
