// backend/models/ClassCompletion.js
const { DataTypes } = require("sequelize");
const db = require("../db");

const ClassCompletion = db.sequelize.define("ClassCompletion", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },

  uid: {
    type: DataTypes.UUID,
    allowNull: false
  },

  classType: {
    type: DataTypes.STRING,
    allowNull: false
  },

  completedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

module.exports = ClassCompletion;
