const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class BranchTransfers extends Model {}

  BranchTransfers.init(
    {
      BranchTransferID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      IndentID: {
        type: DataTypes.INTEGER, //foreign key refering to branch indents
        references: {
          model: "BranchIndents", // Reference to BranchIndents Model
          key: "IndentID", //use primary key or referencing field name in  BranchIndents
        },
      },
      DCNo: {
        type: DataTypes.STRING(25),
      },
      DCDate: {
        type: DataTypes.DATE,
      },
      IssuedBy: {
        type: DataTypes.INTEGER, //EmployeeID
        references: {
          model: "UserMaster", // name of Target model
          key: "UserID", // key in Target model that we're referencing
        },
      },
      FromBranch: {
        type: DataTypes.INTEGER, //foreign key refering to branch master
        references: {
          model: "BranchMaster", // Reference to BranchMaster model
          key: "BranchID", //  use primary key or referencing field name in branch master
        },
      },
      ToBranch: {
        type: DataTypes.INTEGER, //foreign key refering to branch master
        references: {
          model: "BranchMaster", // Reference to BranchMaster model
          key: "BranchID", //  use primary key or referencing field name in branch master
        },
      },
      ChassisNo: {
        type: DataTypes.STRING(100),
      },
      EngineNo: {
        type: DataTypes.STRING(100),
      },
      KeyNo: {
        type: DataTypes.STRING(25),
      },
      FuelQty: {
        type: DataTypes.INTEGER,
      },
      PurchaseID: {
        type: DataTypes.INTEGER, // foreign key refering to purchase entries
        references: {
          model: "VehicleStock", // Reference to VehicleStock model
          key: "PurchaseID", //  use primary key or referencing field name in Vehicle Stock
        },
      },
      EWBNo: {
        type: DataTypes.STRING(50),
      },
      EWBDate: {
        type: DataTypes.STRING(50),
      },
      EWBValidUpto: {
        type: DataTypes.STRING(50),
      },
      VehicleNo: {
        type: DataTypes.STRING(50),
      },
      DriverID: {
        type: DataTypes.INTEGER,
        references: {
          model: "UserMaster", // Reference to BranchMaster model
          key: "UserID", //  use primary key or referencing field name in branch master
        },
      },
      DriverOTP: {
        type: DataTypes.INTEGER,
      },
      GateOutTime: {
        type: DataTypes.DATE,
      },
      StartingKM: {
        type: DataTypes.INTEGER,
      },
      GateInTime: {
        type: DataTypes.DATE,
      },
      EndingKM: {
        type: DataTypes.INTEGER,
      },
      GRNNo: {
        type: DataTypes.STRING(30),
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
      Remarks: {
        type: DataTypes.STRING(255),
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
      modelName: "BranchTransfers",
      tableName: "BranchTransfers", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return BranchTransfers;
};
