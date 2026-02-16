// backend/model/CoachingSession.js
module.exports = (sequelize, DataTypes) => {
  const CoachingSession = sequelize.define("CoachingSession", {
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

  return CoachingSession;
};
