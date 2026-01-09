// backend/model/Referral.js

module.exports = (sequelize, DataTypes) => {
  const Referral = sequelize.define(
    "Referral",
    {
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
        allowNull: false,
        unique: true, // Prevent duplicate referrals
        validate: {
          isEmail: true
        }
      },

      referralCode: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true // Ensures referral codes are unique
      },

      status: {
        type: DataTypes.ENUM("pending", "signed_up", "completed"),
        allowNull: false,
        defaultValue: "pending"
      },

      metadata: {
        type: DataTypes.JSONB,
        allowNull: true
      }
    },
    {
      timestamps: true,

      indexes: [
        // Rate limiting: fast lookup of referrals created recently
        {
          fields: ["referrerUid", "createdAt"]
        },

        // Fast lookup for referral code validation
        {
          unique: true,
          fields: ["referralCode"]
        },

        // Prevent duplicate referrals by email
        {
          unique: true,
          fields: ["referredEmail"]
        }
      ]
    }
  );

  return Referral;
};
