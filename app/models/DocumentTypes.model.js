const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class DocumentTypes extends Model {}

  DocumentTypes.init(
    {
      DocTypeID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      DocumentAs: {
        type: DataTypes.ENUM,
        values: [
          "ID Proof",
          "Address Proof",
          "Income Proof",
          "GST",
          "MSME",
          "Sanction Letter",
          "Finance Payment Mode",
          "Finance Loan Document",
          "Registration",
          "Insurance",
          "Pollution",
        ],
      },
      Doctype: {
        type: DataTypes.STRING(50),
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
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: sequelize.literal("NOW()"),
      },
      ModifiedDate: {
        allowNull: true,
        type: DataTypes.DATE,
        // defaultValue: sequelize.literal("NOW()"),
      },
    },
    {
      sequelize,
      modelName: "DocumentTypes",
      tableName: "DocumentTypes", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return DocumentTypes;
};
