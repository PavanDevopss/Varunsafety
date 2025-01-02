const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class FinancePayments extends Model {}

  FinancePayments.init(
    {
      FinPaymentID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      FinAppID: {
        type: DataTypes.INTEGER,
        references: {
          model: "FinanceApplication", // Name of the referenced table
          key: "FinAppID", // Primary key in the referenced table
        },
      },
      CustomerID: {
        type: DataTypes.INTEGER,
        references: {
          model: "CustomerMaster", // Name of the referenced table
          key: "CustomerID", // Primary key in the referenced table
        },
      },
      LoanAppCustID: {
        type: DataTypes.INTEGER,
        references: {
          model: "FinAppApplicant", // Name of the referenced table
          key: "LoanAppCustID", // Primary key in the referenced table
        },
      },
      BookingID: {
        type: DataTypes.INTEGER,
        references: {
          model: "NewCarBookings", // Name of the referenced table
          key: "BookingID", // Primary key in the referenced table
        },
      },
      FinanceLoanID: {
        type: DataTypes.INTEGER,
        references: {
          model: "FinanceLoanApplication", // Name of the referenced table
          key: "FinanceLoanID", // Primary key in the referenced table
        },
      },
      FinDocID: {
        type: DataTypes.INTEGER,
        references: {
          model: "FinanceDocuments", // Name of the referenced table
          key: "FinDocID", // Primary key in the referenced table
        },
      },
      UserID: {
        type: DataTypes.INTEGER,
        references: {
          model: "UserMaster", // Name of the referenced table
          key: "UserID", // Primary key in the referenced table
        },
      },
      PaymentMode: {
        type: DataTypes.ENUM,
        values: ["Online", "Cheque"],
      },
      ApplicationCategory: {
        type: DataTypes.ENUM,
        values: ["Inhouse", "Self"],
      },
      FinancerType: {
        type: DataTypes.STRING(50),
      },
      Financer: {
        type: DataTypes.STRING(50),
      },
      Branch: {
        type: DataTypes.STRING(50),
      },
      LoanAmt: {
        type: DataTypes.DOUBLE,
      },
      UTRNo: {
        type: DataTypes.DOUBLE,
      },
      FinPaymentStatus: {
        type: DataTypes.BOOLEAN,
      },
      PayoutType: {
        type: DataTypes.ENUM,
        values: ["Percentage", "Amount"],
      },
      DealerPayout: {
        type: DataTypes.DOUBLE,
      },
      ExcutivePayout: {
        type: DataTypes.DOUBLE,
      },
      TotalPayout: {
        type: DataTypes.DOUBLE,
      },
      IsActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      Status: {
        type: DataTypes.ENUM,
        values: ["Approved", "Pending"],
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
      modelName: "FinancePayments",
      tableName: "FinancePayments", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return FinancePayments;
};
