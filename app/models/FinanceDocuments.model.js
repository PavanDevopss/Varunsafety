const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class FinanceDocuments extends Model {}

  FinanceDocuments.init(
    {
      FinDocID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      CustomerID: {
        type: DataTypes.INTEGER,
        // references: {
        //   model: "FinAppApplicant", // Name of the referenced table
        //   key: "LoanAppCustID", // Primary key in the referenced table
        // },
      },
      CustomerType: {
        type: DataTypes.ENUM,
        values: ["Applicant", "CoApplicant"],
      },
      FinanceLoanID: {
        type: DataTypes.INTEGER,
        references: {
          model: "FinanceLoanApplication", // Name of the referenced table
          key: "FinanceLoanID", // Primary key in the referenced table
        },
      },
      FinPaymentID: {
        type: DataTypes.INTEGER,
        // references: {
        //   model: "FinancePayments", // Name of the referenced table
        //   key: "FinPaymentID", // Primary key in the referenced table
        // },
      },
      DocTypeID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "DocumentTypes", // Name of the referenced table
          key: "DocTypeID", // Primary key in the referenced table
        },
      },
      DocURL: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      Remarks: {
        type: DataTypes.STRING(255),
      },
      DocStatus: {
        type: DataTypes.STRING(25),
        // defaultValue: "Active",
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
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("NOW()"),
      },
      ModifiedDate: {
        type: DataTypes.DATE,
        allowNull: true,
        // defaultValue: sequelize.literal("NOW()"),
      },
    },
    {
      sequelize,
      modelName: "FinanceDocuments",
      tableName: "FinanceDocuments", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return FinanceDocuments;
};
