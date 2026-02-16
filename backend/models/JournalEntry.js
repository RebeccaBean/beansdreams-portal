// backend/model/JournalEntry.js
module.exports = (sequelize, DataTypes) => {
  const JournalEntry = sequelize.define("JournalEntry", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    uid: {
      type: DataTypes.UUID,
      allowNull: false
    },
    kind: {
      type: DataTypes.STRING,
      defaultValue: "healing"
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
  });

  return JournalEntry;
};
