const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class VehicleStock extends Model {}

  VehicleStock.init(
    {
      PurchaseID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      // VendorName: {
      //   type: DataTypes.STRING(150),
      // },
      VendorID: {
        type: DataTypes.INTEGER,
        references: {
          model: "VendorMaster", // Name of the referenced model
          key: "VendorMasterID", // Primary key in the referenced model
        },
      },
      BranchID: {
        type: DataTypes.INTEGER,
        references: {
          model: "BranchMaster", // Name of the referenced model
          key: "BranchID", // Primary key in the referenced model
        },
      },
      VariantCode: {
        type: DataTypes.STRING(100),
      },
      ModelCode: {
        type: DataTypes.STRING(100),
      },
      ColourCode: {
        type: DataTypes.STRING(100),
      },
      SKUCode: {
        type: DataTypes.STRING(100),
      },
      FuelType: {
        type: DataTypes.STRING(50),
      },
      TransmissionCode: {
        type: DataTypes.STRING(100),
      },
      EngineNo: {
        type: DataTypes.STRING(100),
      },
      ChassisNo: {
        type: DataTypes.STRING(100),
      },
      KeyNo: {
        type: DataTypes.STRING(50),
      },
      InvoiceNo: {
        type: DataTypes.STRING(50),
      },
      InvoiceDate: {
        type: DataTypes.DATE,
      },
      GRNNo: {
        type: DataTypes.STRING(25),
      },
      GRNDate: {
        type: DataTypes.DATE,
      },
      StockInDate: {
        type: DataTypes.DATE,
      },
      EWayBillNo: {
        type: DataTypes.STRING(50),
      },
      TruckNo: {
        type: DataTypes.STRING(50),
      },
      TransporterName: {
        type: DataTypes.STRING(100),
      },
      MFGDate: {
        type: DataTypes.DATEONLY,
      },
      BasicValue: {
        type: DataTypes.FLOAT,
      },
      Discount: {
        type: DataTypes.FLOAT,
      },
      DRF: {
        type: DataTypes.FLOAT,
      },
      TaxableValue: {
        type: DataTypes.FLOAT,
      },
      IGSTRate: {
        type: DataTypes.FLOAT,
      },
      CESSRate: {
        type: DataTypes.FLOAT,
      },
      IGSTAmt: {
        type: DataTypes.FLOAT,
      },
      CGSTAmt: {
        type: DataTypes.FLOAT,
      },
      SGSTAmt: {
        type: DataTypes.FLOAT,
      },
      CESSAmt: {
        type: DataTypes.FLOAT,
      },
      InvoiceValue: {
        type: DataTypes.FLOAT,
      },
      DispatchCode: {
        type: DataTypes.STRING(100),
      },
      Remarks: {
        type: DataTypes.STRING(255),
      },
      FundAccount: {
        type: DataTypes.STRING(100),
      },
      Status: {
        type: DataTypes.ENUM,
        values: ["In-Transit", "In-Stock", "Transferred", "Allotted", "Sold"],
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
      modelName: "VehicleStock",
      tableName: "VehicleStock", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return VehicleStock;
};
