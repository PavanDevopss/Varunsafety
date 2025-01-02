const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class VendorBankDetails extends Model {}

  VendorBankDetails.init(
    {
      VendorBankDetailsID: {
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
      BankName: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      IFSCCode: {
        type: DataTypes.STRING(150),
        defaultValue: true,
      },
      AccountNumber: {
        type: DataTypes.STRING(50),
      },
      AccountHolderName: {
        type: DataTypes.STRING(50),
      },
      Address: {
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
      modelName: "VendorBankDetails",
      tableName: "VendorBankDetails", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return VendorBankDetails;
};
