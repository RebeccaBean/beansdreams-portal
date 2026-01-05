// backend/models/ReflectionEntry.js
const { DataTypes } = require("sequelize");
const db = require("../db");

const ReflectionEntry = db.sequelize.define("ReflectionEntry", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  uid: {
    type: DataTypes.UUID,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  meta: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false
  }
});

module.exports = ReflectionEntry;
