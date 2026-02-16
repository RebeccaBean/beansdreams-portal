// backend/model/Streak.js
module.exports = (sequelize, DataTypes) => {
  const Streak = sequelize.define("Streak", {
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

  return Streak;
};
