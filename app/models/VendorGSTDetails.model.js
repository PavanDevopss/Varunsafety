const { Model, DataTypes, STRING } = require("sequelize");

module.exports = (sequelize) => {
  class VendorGSTDetails extends Model {}

  VendorGSTDetails.init(
    {
      VendorGSTDetailsID: {
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
      RegistrationNo: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      RegistrationType: {
        type: DataTypes.STRING(100),
      },
      Address: {
        type: DataTypes.STRING(225),
      },
      PINCode: {
        type: DataTypes.STRING(10),
      },
      StatePOSID: {
        type: DataTypes.INTEGER,
        references: {
          model: "StatePOS",
          key: "StatePOSID",
        },
      },
      LegalName: {
        type: DataTypes.STRING(100),
      },
      TradeName: {
        type: DataTypes.STRING(100),
      },
      EntityType: {
        type: DataTypes.STRING(100),
      },
      DateOfReg: {
        type: DataTypes.STRING(25),
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
      modelName: "VendorGSTDetails",
      tableName: "VendorGSTDetails", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return VendorGSTDetails;
};
