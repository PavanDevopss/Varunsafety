const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class DealerTransfers extends Model {}

  DealerTransfers.init(
    {
      DealerTransferID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      IndentID: {
        type: DataTypes.INTEGER, //foreign key refering to dealer indents
        references: {
          model: "DealerIndents", // This is the name of the referenced model
          key: "IndentID", // This is the name of the referenced column
        },
      },
      InvoiceNo: {
        type: DataTypes.STRING(25),
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
        type: DataTypes.INTEGER, //foreign key refering to Purchase entries (check table name)
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
        type: DataTypes.STRING(25),
      },
      TransferType: {
        type: DataTypes.STRING(50),
      },
      DealerType: {
        type: DataTypes.STRING(50),
      },
      TaxType: {
        type: DataTypes.STRING(50),
      },
      ExShowRoom: {
        type: DataTypes.FLOAT,
      },
      CostOfVehicle: {
        type: DataTypes.FLOAT,
      },
      IGSTValue: {
        type: DataTypes.FLOAT,
      },
      CESSValue: {
        type: DataTypes.FLOAT,
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
      modelName: "DealerTransfers",
      tableName: "DealerTransfers", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return DealerTransfers;
};
