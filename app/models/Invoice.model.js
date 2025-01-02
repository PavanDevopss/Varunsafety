const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Invoice extends Model {}

  Invoice.init(
    {
      InvoiceID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      InvoiceNo: {
        type: DataTypes.STRING(25),
      },
      InvoiceDate: {
        type: DataTypes.DATE,
      },
      TransactionID: {
        type: DataTypes.INTEGER,
      },
      TransactionType: {
        type: DataTypes.INTEGER,
        references: {
          model: "PaymentReference", // Reference to ModelType model
          key: "ID",
        },
      },
      AllotmentID: {
        type: DataTypes.INTEGER,
        references: {
          model: "VehicleAllotment", // Reference to ModelType model
          key: "AllotmentReqID",
        },
      },
      CustomerID: {
        type: DataTypes.INTEGER,
        references: {
          model: "CustomerMaster", // Reference to ModelType model
          key: "CustomerID",
        },
      },
      CustomerName: {
        type: DataTypes.STRING(100),
      },
      SaleBranchID: {
        type: DataTypes.INTEGER,
        references: {
          model: "BranchMaster", // Reference to ModelType model
          key: "BranchID",
        },
      },
      SalesPersonID: {
        type: DataTypes.INTEGER,
        references: {
          model: "UserMaster", // Reference to ModelType model
          key: "UserID",
        },
      },
      SalesPersonName: {
        type: DataTypes.STRING(100),
      },
      TeamLeadID: {
        type: DataTypes.INTEGER,
        references: {
          model: "UserMaster", // Reference to ModelType model
          key: "UserID",
        },
      },
      TeamLeadName: {
        type: DataTypes.STRING(100),
      },
      AadharNo: {
        type: DataTypes.STRING(25),
      },
      ChassisNo: {
        type: DataTypes.STRING(50),
      },
      EngineNo: {
        type: DataTypes.STRING(50),
      },
      FinanceID: {
        type: DataTypes.INTEGER,
        references: {
          model: "FinanceLoanApplication", // Reference to ModelType model
          key: "FinanceLoanID",
        },
      },
      FinancierName: {
        type: DataTypes.STRING(100),
      },
      FinancierAmt: {
        type: DataTypes.FLOAT,
      },
      FinAddress: {
        type: DataTypes.STRING(100),
      },
      FinStatus: {
        type: DataTypes.STRING(50),
      },
      InvoiceType: {
        type: DataTypes.STRING(50),
      },
      CustomerType: {
        type: DataTypes.STRING(50),
      },
      BillType: {
        type: DataTypes.STRING(50),
      },
      RCM: {
        type: DataTypes.STRING(50),
      },
      DiscountValue: {
        type: DataTypes.FLOAT,
      },
      TotalAmt: {
        type: DataTypes.FLOAT,
      },
      TCSRate: {
        type: DataTypes.FLOAT,
      },
      TCSValue: {
        type: DataTypes.FLOAT,
      },
      InvoiceAmt: {
        type: DataTypes.FLOAT,
      },
      IsActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      Status: {
        type: DataTypes.STRING,
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
      modelName: "Invoice",
      tableName: "Invoice",
      timestamps: false, // Disable timestamps
    }
  );

  return Invoice;
};
