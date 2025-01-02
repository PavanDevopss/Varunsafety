const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class PaymentRequests extends Model {}

  PaymentRequests.init(
    {
      ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      RequestID: {
        type: DataTypes.STRING(100),
      },
      CustomerID: {
        type: DataTypes.INTEGER,
        references: {
          model: "CustomerMaster", // Name of the referenced model
          key: "CustomerID", // Primary key in the referenced model
        },
        onUpdate: "CASCADE",
        onDelete: "NO ACTION", // or 'CASCADE' or 'SET NULL' as per your requirement
      },
      TransactionID: {
        type: DataTypes.INTEGER,
      },
      RefTypeID: {
        type: DataTypes.INTEGER,
        references: {
          model: "PaymentReference", // Name of the referenced model
          key: "ID", // Primary key in the referenced model
        },
        onUpdate: "CASCADE",
        onDelete: "NO ACTION", // or 'CASCADE' or 'SET NULL' as per your requirement
      },
      FinanceLoanID: {
        type: DataTypes.INTEGER,
        references: {
          model: "FinanceLoanApplication", // Name of the referenced model
          key: "FinanceLoanID", // Primary key in the referenced model
        },
      },
      UTRNo: {
        type: DataTypes.STRING(50),
      },
      RequestDate: {
        type: DataTypes.DATE,
      },
      PaymentPurpose: {
        type: DataTypes.STRING(100),
      },
      PaymentMode: {
        type: DataTypes.STRING(50),
      },
      Amount: {
        type: DataTypes.DOUBLE,
      },
      InstrumentNo: {
        type: DataTypes.STRING(50),
      },
      InstrumentDate: {
        type: DataTypes.DATE,
      },
      BankName: {
        type: DataTypes.STRING(100),
      },
      BranchName: {
        type: DataTypes.STRING(100),
      },
      BankCharges: {
        type: DataTypes.DOUBLE,
      },
      CollectionBranchID: {
        type: DataTypes.INTEGER,
        references: {
          model: "BranchMaster", // Name of the referenced model
          key: "BranchID", // Primary key in the referenced model
        },
        onUpdate: "CASCADE",
        onDelete: "NO ACTION", // or 'CASCADE' or 'SET NULL' as per your requirement
      },
      RequestStatus: {
        type: DataTypes.ENUM,
        values: ["Pending", "Accepted", "Cancelled", "Rejected", "Transferred"],
        defaultValue: "Pending",
      },
      RequestBy: {
        type: DataTypes.INTEGER,
        references: {
          model: "UserMaster", // Name of the referenced model
          key: "UserID", // Primary key in the referenced model
        },
        onUpdate: "CASCADE",
        onDelete: "NO ACTION", // or 'CASCADE' or 'SET NULL' as per your requirement
      },
      Remarks: {
        type: DataTypes.STRING(100),
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
      modelName: "PaymentRequests",
      tableName: "PaymentRequests", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return PaymentRequests;
};
