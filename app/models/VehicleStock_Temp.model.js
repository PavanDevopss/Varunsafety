const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class VehicleStock_Temp extends Model {}

  VehicleStock_Temp.init(
    {
      PurchaseID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },

      // Additional Fields
      VendorName: {
        type: DataTypes.STRING,
      },
      VendorID: {
        type: DataTypes.INTEGER,
      },
      BranchID: {
        type: DataTypes.INTEGER,
      },
      BranchCode: {
        type: DataTypes.STRING,
      },
      VariantCode: {
        type: DataTypes.STRING,
      },
      ModelCode: {
        type: DataTypes.STRING,
      },
      SKUCode: {
        type: DataTypes.STRING,
      },
      ColourCode: {
        type: DataTypes.STRING,
      },
      EngineNo: {
        type: DataTypes.STRING,
      },
      ChassisNo: {
        type: DataTypes.STRING,
      },
      KeyNo: {
        type: DataTypes.STRING,
      },
      FuelType: {
        type: DataTypes.STRING,
      },
      TransmissionCode: {
        type: DataTypes.STRING,
      },
      InvoiceNo: {
        type: DataTypes.STRING,
      },
      InvoiceDate: {
        type: DataTypes.DATE,
      },
      GRNNo: {
        type: DataTypes.STRING,
      },
      GRNDate: {
        type: DataTypes.DATE,
      },
      StockInDate: {
        type: DataTypes.DATE,
      },
      EWayBillNo: {
        type: DataTypes.STRING,
      },
      TruckNo: {
        type: DataTypes.STRING,
      },
      TransporterName: {
        type: DataTypes.STRING,
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
        type: DataTypes.STRING,
      },
      Remarks: {
        type: DataTypes.STRING,
      },
      FundAccount: {
        type: DataTypes.STRING,
      },
      CITY: {
        type: DataTypes.STRING,
      },
      INVOICETYPE: {
        type: DataTypes.STRING,
      },
      FinNo: {
        type: DataTypes.STRING,
      },
      ACCOUNTCODE: {
        type: DataTypes.STRING,
      },
      CHASSISPREFIX: {
        type: DataTypes.STRING,
      },
      INVOICEDATE: {
        type: DataTypes.DATE,
      },
      INV_DATE_FOR_ROAD_PERMIT: {
        type: DataTypes.DATE,
      },
      AssessableValue: {
        type: DataTypes.FLOAT,
      },
      TCS: {
        type: DataTypes.FLOAT,
      },
      ORDERCATEGORY: {
        type: DataTypes.STRING,
      },
      PLANT: {
        type: DataTypes.STRING,
      },
      TIN: {
        type: DataTypes.STRING,
      },
      SENTBY: {
        type: DataTypes.STRING,
      },
      TRIPNO_CONSIGNMENTNO: {
        type: DataTypes.STRING,
      },
      INDENT_ALLOTNO: {
        type: DataTypes.STRING,
      },
      EMAILID: {
        type: DataTypes.STRING,
      },
      FINANCIER: {
        type: DataTypes.STRING,
      },
      CreatedDate: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      ModifiedDate: {
        allowNull: true,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      Status: {
        type: DataTypes.ENUM,
        values: ["In-Transit", "In-Stock"],
      },
    },
    {
      sequelize,
      modelName: "VehicleStock_Temp",
      tableName: "VehicleStock_Temp", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return VehicleStock_Temp;
};
