// backend/model/BadgeProgress.js
module.exports = (sequelize, DataTypes) => {
  const BadgeProgress = sequelize.define("BadgeProgress", {
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

    progress: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },

    earnedBadges: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },

    unlockedCodes: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    }
  });

  return BadgeProgress;
};
