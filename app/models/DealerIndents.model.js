const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class DealerIndents extends Model {}

  DealerIndents.init(
    {
      IndentID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      IndentNo: {
        type: DataTypes.STRING(25),
      },
      IndentDate: {
        type: DataTypes.DATE,
      },
      FromBranch: {
        type: DataTypes.INTEGER, //foreign key refering to branch master
        references: {
          model: "BranchMaster", // name of Target model
          key: "BranchID", // key in Target model that we're referencing
        },
      },
      ToRegion: {
        type: DataTypes.INTEGER, //foreign key refering to branch master
        references: {
          model: "VendorMaster", // name of Target model
          key: "VendorMasterID", // key in Target model that we're referencing
        },
      },
      DealerType: {
        type: DataTypes.STRING(50),
      },
      ModelCode: {
        type: DataTypes.STRING(50), // refering to model master
      },
      VariantCode: {
        type: DataTypes.STRING(50), // refering to variant master
      },
      ColourCode: {
        type: DataTypes.STRING(50), // refering to colour master
      },
      FuelType: {
        type: DataTypes.STRING(25),
      },
      Transmission: {
        type: DataTypes.STRING(25),
      },
      DriverID: {
        type: DataTypes.STRING(25), // refering to Employee (user because employee master is not created) master to EmpID field
      },
      DriverName: {
        type: DataTypes.STRING(100),
      },
      EMPMobileNo: {
        type: DataTypes.STRING(15),
      },
      Status: {
        type: DataTypes.ENUM,
        values: [
          "Open",
          "Issued",
          "In-Transit",
          "Received",
          "Cancelled",
          "Returned",
        ],
        defaultValue: "Open",
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
      modelName: "DealerIndents",
      tableName: "DealerIndents", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return DealerIndents;
};
