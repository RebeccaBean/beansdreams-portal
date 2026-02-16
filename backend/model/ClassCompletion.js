// backend/model/ClassCompletion.js
module.exports = (sequelize, DataTypes) => {
  const ClassCompletion = sequelize.define("ClassCompletion", {
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

  return ClassCompletion;
};

