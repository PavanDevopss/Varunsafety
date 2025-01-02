const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class VendorAddressDetails extends Model {}

  VendorAddressDetails.init(
    {
      VendorAddressDetailsID: {
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
      Address: {
        type: DataTypes.STRING(100),
        defaultValue: true,
      },
      StatePOSID: {
        type: DataTypes.INTEGER,
        references: {
          model: "StatePOS",
          key: "StatePOSID",
        },
      },
      City: {
        type: DataTypes.STRING(25),
      },
      Contact: {
        type: DataTypes.STRING(25),
      },
      Email: {
        type: DataTypes.STRING(25),
        validate: {
          isEmail: true, // Validates the string is in email format
          len: [1, 255], // Length must be between 1 and 255 characters
        },
      },
      PINCode: {
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
      modelName: "VendorAddressDetails",
      tableName: "VendorAddressDetails", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return VendorAddressDetails;
};
