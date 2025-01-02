const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class VendorDocuments extends Model {}

  VendorDocuments.init(
    {
      VendorDocumentsID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      VendorMasterID: {
        type: DataTypes.INTEGER,
        references: {
          model: "VendorMaster",
          key: "VendorMasterID",
        },
      },
      DocTypeID: {
        type: DataTypes.INTEGER,
        references: {
          model: "DocumentTypes",
          key: "DocTypeID",
        },
      },
      DocURL: {
        type: DataTypes.STRING(225),
      },
      IsActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      Status: {
        type: DataTypes.STRING(25),
        defaultValue: "Active",
      },
      CreatedDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("NOW()"),
      },
      ModifiedDate: {
        type: DataTypes.DATE,
        allowNull: true,
        // defaultValue: sequelize.literal("NOW()"),
      },
    },
    {
      sequelize,
      modelName: "VendorDocuments",
      tableName: "VendorDocuments", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return VendorDocuments;
};
