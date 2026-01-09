// backend/model/User.js
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("User", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },

    name: {
      type: DataTypes.STRING,
      allowNull: true
    },

    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },

    password: {
      type: DataTypes.STRING,
      allowNull: false
    },

    role: {
      type: DataTypes.ENUM("student", "admin", "teacher"),
      defaultValue: "student"
    },

    credits: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },

    remainingCredits: {
      type: DataTypes.JSONB,
      defaultValue: { total: 0, byType: {} }
    },

    paymentHistory: {
      type: DataTypes.JSONB,
      defaultValue: []
    },

    subscriptions: {
      type: DataTypes.JSONB,
      defaultValue: []
    },

    downloads: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },

    reset_token: {
      type: DataTypes.STRING
    },

    reset_token_expiry: {
      type: DataTypes.DATE
    }
  });

  return User;
};
