const { Model, DataTypes } = require("sequelize");
module.exports = (sequelize) => {
  class DemoConversion extends Model {}
  DemoConversion.init(
    {
      DemoConvID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      ReqNo: {
        type: DataTypes.STRING(50),
      },
      ReqDate: {
        type: DataTypes.DATEONLY,
      },
      RequestedBy: {
        type: DataTypes.INTEGER,
        references: {
          model: "UserMaster", // This is the name of the referenced model
          key: "UserID", // This is the name of the referenced column
        },
      },
      FromBranch: {
        type: DataTypes.INTEGER,
        references: {
          model: "BranchMaster", // This is the name of the referenced model
          key: "BranchID", // This is the name of the referenced column
        },
      },
      PurchaseID: {
        type: DataTypes.INTEGER,
        references: {
          model: "VehicleStock", // This is the name of the referenced model
          key: "PurchaseID", // This is the name of the referenced column
        },
      },
      ChassisNo: {
        type: DataTypes.STRING(50),
      },
      EngineNo: {
        type: DataTypes.STRING(50),
      },
      SKUCode: {
        type: DataTypes.STRING(50),
      },
      VariantDesc: {
        type: DataTypes.STRING(100),
      },
      ColourCode: {
        type: DataTypes.STRING(50),
      },
      Transmission: {
        type: DataTypes.STRING(50),
      },
      FuelType: {
        type: DataTypes.STRING(50),
      },
      ApprovedBy: {
        type: DataTypes.INTEGER,
        references: {
          model: "UserMaster", // This is the name of the referenced model
          key: "UserID", // This is the name of the referenced column
        },
      },
      ApprovalStatus: {
        type: DataTypes.ENUM,
        values: ["Requested", "Approved", "Rejected", "Cancelled"],
      },
      Remarks: {
        type: DataTypes.STRING(100),
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
      modelName: "DemoConversion",
      tableName: "DemoConversion", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );
  return DemoConversion;
};
