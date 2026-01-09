// backend/model/ReflectionEntry.js
module.exports = (sequelize, DataTypes) => {
  const ReflectionEntry = sequelize.define("ReflectionEntry", {
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

  return ReflectionEntry;
};
