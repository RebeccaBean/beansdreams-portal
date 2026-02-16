// backend/model/Upload.js
module.exports = (sequelize, DataTypes) => {
  const Upload = sequelize.define("Upload", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    uid: {
      type: DataTypes.UUID,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    meta: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    uploadedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  });

  return Upload;
};
