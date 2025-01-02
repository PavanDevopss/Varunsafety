const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class BankMaster extends Model {}

  BankMaster.init(
    {
      BankID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      BankCode: {
        type: DataTypes.STRING(25),
      },
      BankName: {
        type: DataTypes.STRING(100),
      },
      BankType: {
        type: DataTypes.STRING(50),
      },
      ContactNo: {
        type: DataTypes.STRING(15),
      },
      Email: {
        type: DataTypes.STRING(50),
      },
      Website: {
        type: DataTypes.STRING(255),
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
      modelName: "BankMaster",
      tableName: "BankMaster", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return BankMaster;
};
