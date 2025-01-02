const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class VendorMaster extends Model {}

  VendorMaster.init(
    {
      VendorMasterID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      VendorType: {
        type: DataTypes.ENUM,
        values: ["Company", "Individual"],
      },
      VendorCode: {
        type: DataTypes.STRING(50),
      },
      VendorName: {
        type: DataTypes.STRING(100),
      },
      Address: {
        type: DataTypes.STRING(255),
      },
      City: {
        type: DataTypes.STRING(100),
      },
      State: {
        type: DataTypes.STRING(100),
      },
      RegionID: {
        type: DataTypes.INTEGER,
        references: {
          model: "RegionMaster", // This is the name of the referenced model
          key: "RegionID", // This is the name of the referenced column
        },
      },
      CmpyRegionID: {
        type: DataTypes.INTEGER,
        references: {
          model: "CompanyRegions", //Reference to CompanyMaster Model
          key: "CmpyRegionID", //  use primary key or referencing field name in  CompanyMaster
        },
      },
      PINCode: {
        type: DataTypes.STRING(6),
      },
      PhoneNo: {
        type: DataTypes.STRING(15),
      },
      MobileNo: {
        type: DataTypes.STRING(15),
      },
      Email: {
        type: DataTypes.STRING(50),
        allowNull: true, // Field is required
        // unique: true, // Email must be unique
        validate: {
          isEmail: true, // Validates the string is in email format
          len: [1, 50], // Length must be between 1 and 255 characters
        },
      },
      TAN: {
        type: DataTypes.STRING(50),
      },
      PAN: {
        type: DataTypes.STRING(50),
      },
      Bank: {
        type: DataTypes.STRING(100),
      },
      AccountHolderName: {
        type: DataTypes.STRING(100),
      },
      AccountNo: {
        type: DataTypes.STRING(50),
      },
      IFSCCode: {
        type: DataTypes.STRING(50),
      },
      BranchDetails: {
        type: DataTypes.STRING(100),
      },
      MSEMRegistration: {
        type: DataTypes.BOOLEAN,
      },
      MSEMNo: {
        type: DataTypes.STRING(100),
      },
      MSEMDate: {
        type: DataTypes.DATE,
      },
      GSTRegistration: {
        type: DataTypes.BOOLEAN,
      },
      GSTID: {
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
      modelName: "VendorMaster",
      tableName: "VendorMaster", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return VendorMaster;
};
