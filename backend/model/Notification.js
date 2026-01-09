module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Notification", {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    uid: { type: DataTypes.UUID, allowNull: false },
    message: { type: DataTypes.STRING, allowNull: false },
    read: { type: DataTypes.BOOLEAN, defaultValue: false },
    createdAt: { type: DataTypes.DATE, defaultValue: sequelize.literal("NOW()") }
  }, {
    freezeTableName: true
  });
};
