const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class BranchMaster extends Model {}

  BranchMaster.init(
    {
      BranchID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      BranchCode: {
        type: DataTypes.STRING(50),
      },
      BranchName: {
        type: DataTypes.STRING(100),
      },
      OEMStoreName: {
        type: DataTypes.STRING(150),
      },
      CompanyID: {
        type: DataTypes.INTEGER,
        references: {
          model: "CompanyMaster", //Reference to CompanyMaster Model
          key: "CompanyID", //  use primary key or referencing field name in  CompanyMaster
        },
      },
      BranchTypeID: {
        type: DataTypes.INTEGER,
        references: {
          model: "BranchTypes", // Reference to BranchTypes Model
          key: "BranchTypeID", //use primary key or referencing field name in  BranchTypes
        },
      },
      RegionID: {
        type: DataTypes.INTEGER,
        references: {
          model: "RegionMaster", // Reference to RegionMaster Model
          key: "RegionID", //use primary key or referencing field name in  RegionMaster
        },
      },
      CmpyRegionID: {
        type: DataTypes.INTEGER,
        references: {
          model: "CompanyRegions", //Reference to CompanyMaster Model
          key: "CmpyRegionID", //  use primary key or referencing field name in  CompanyMaster
        },
      },
      StatePOSID: {
        type: DataTypes.INTEGER,
        references: {
          model: "StatePOS", // Reference to RegionMaster Model
          key: "StatePOSID", //use primary key or referencing field name in  RegionMaster
        },
      },
      CmpyStateID: {
        type: DataTypes.INTEGER,
        references: {
          model: "CompanyStates", // Reference to RegionMaster Model
          key: "CmpyStateID", //use primary key or referencing field name in  RegionMaster
        },
      },
      OEMID: {
        type: DataTypes.INTEGER,
        references: {
          model: "OEMMaster", // Reference to RegionMaster Model
          key: "OEMID", //use primary key or referencing field name in  RegionMaster
        },
      },
      CmpyGSTID: {
        type: DataTypes.INTEGER,
        references: {
          model: "CompanyGSTMaster", // Reference to RegionMaster Model
          key: "CmpyGSTID", //use primary key or referencing field name in  RegionMaster
        },
      },
      ChannelID: {
        type: DataTypes.INTEGER,
        references: {
          model: "ChannelMaster", // Reference to ChannelMaster Model
          key: "ChannelID", // use primary key or referencing field name in  ChannelMaster
        },
      },
      Contact: {
        type: DataTypes.STRING(15),
      },
      Email: {
        type: DataTypes.STRING(50),
        allowNull: true, // Field is required
        // unique: true, // Email must be unique
        // validate: {
        //   isEmail: true, // Validates the string is in email format
        //   len: [1, 50], // Length must be between 1 and 255 characters
        // },
      },
      MSILCode: {
        type: DataTypes.STRING(50),
      },
      DealerCode: {
        type: DataTypes.STRING(50),
      },
      CityCode: {
        type: DataTypes.STRING(50),
      },
      StoreID: {
        type: DataTypes.STRING(100),
      },
      StoreCode: {
        type: DataTypes.STRING(50),
      },
      LocationCode: {
        type: DataTypes.STRING(50),
      },
      SubLedger: {
        type: DataTypes.STRING(100),
      },
      GSTIN: {
        type: DataTypes.STRING(50),
      },
      State: {
        type: DataTypes.STRING(50),
      },
      District: {
        type: DataTypes.STRING(50),
      },
      Address: {
        type: DataTypes.STRING(100),
      },
      PINCode: {
        type: DataTypes.STRING(6),
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
      modelName: "BranchMaster",
      tableName: "BranchMaster", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return BranchMaster;
};
