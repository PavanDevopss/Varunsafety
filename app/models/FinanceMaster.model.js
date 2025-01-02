const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class FinanceMaster extends Model {}

  FinanceMaster.init(
    {
      FinancierID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      FinancierCode: {
        type: DataTypes.STRING(25),
        allowNull: false,
        unique: true,
      },
      FinancierName: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      Category: {
        type: DataTypes.ENUM(
          "Public Sector Banks",
          "Private Sector Banks",
          "Regional Rural Banks",
          "Non-Banking Sector",
          "Others"
        ),
        allowNull: false,
      },
      Location: {
        type: DataTypes.STRING(100),
      },
      Contact: {
        type: DataTypes.STRING(15),
      },
      EmailID: {
        type: DataTypes.STRING(50),
      },
      PlaceOfSupply: {
        type: DataTypes.STRING(100),
      },
      GSTIN: {
        type: DataTypes.STRING(16),
      },
      Address: {
        type: DataTypes.STRING(255),
      },
      IsActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      Status: {
        type: DataTypes.STRING(50),
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
      modelName: "FinanceMaster",
      tableName: "FinanceMaster", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return FinanceMaster;
};
