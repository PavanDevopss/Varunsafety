const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class CmpyBankAccount extends Model {}

  CmpyBankAccount.init(
    {
      CmpyBankID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      BankName: {
        type: DataTypes.STRING,
      },
      ACType: {
        type: DataTypes.STRING,
      },
      ACNo: {
        type: DataTypes.STRING,
      },
      ACHolderName: {
        type: DataTypes.STRING,
      },
      IFSCCode: {
        type: DataTypes.STRING,
      },
      BranchName: {
        type: DataTypes.STRING,
      },
      ContactNo: {
        type: DataTypes.STRING,
      },
      Address: {
        type: DataTypes.STRING,
      },
      City: {
        type: DataTypes.STRING,
      },
      State: {
        type: DataTypes.STRING,
      },
      PINCode: {
        type: DataTypes.STRING,
      },
      CIFNo: {
        type: DataTypes.STRING,
      },
      IsActive: {
        type: DataTypes.BOOLEAN,
      },
      Status: {
        type: DataTypes.STRING,
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
      modelName: "CmpyBankAccount",
      tableName: "CmpyBankAccount", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return CmpyBankAccount;
};
