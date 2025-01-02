const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class FinanceLoanApplication extends Model {}

  FinanceLoanApplication.init(
    {
      FinanceLoanID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      Category: {
        type: DataTypes.ENUM,
        values: ["In-House", "Direct"],
        allowNull: false,
      },
      LoanAppCustID: {
        type: DataTypes.INTEGER,
        references: {
          model: "FinAppApplicant", // Name of the referenced table
          key: "LoanAppCustID", // Primary key in the referenced table
        },
        allowNull: false,
      },
      RefAppNo: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      BookingID: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "NewCarBookings", // This is the name of the referenced model
          key: "BookingID", // This is the name of the referenced column
        },
      },
      CustomerID: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "CustomerMaster", // This is the name of the referenced model
          key: "CustomerID", // This is the name of the referenced column
        },
      },
      FinAppID: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "FinanceApplication", // This is the name of the referenced model
          key: "FinAppID", // This is the name of the referenced column
        },
      },
      UserID: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "UserMaster", // This is the name of the referenced model
          key: "UserID", // This is the name of the referenced column
        },
      },
      FinancierID: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "FinanceMaster", // This is the name of the referenced model
          key: "FinancierID", // This is the name of the referenced column
        },
      },
      SanctionAmount: {
        type: DataTypes.FLOAT,
      },
      ROI: {
        type: DataTypes.FLOAT,
      },
      Tenure: {
        type: DataTypes.STRING(50),
      },
      DocumentCharge: {
        type: DataTypes.FLOAT,
      },
      StampDuties: {
        type: DataTypes.FLOAT,
      },
      ServiceCharges: {
        type: DataTypes.FLOAT,
      },
      ProcessingFee: {
        type: DataTypes.FLOAT,
      },
      Insurance: {
        type: DataTypes.FLOAT,
      },
      Others: {
        type: DataTypes.FLOAT,
      },
      TotalDeductions: {
        type: DataTypes.FLOAT,
      },
      MarginAmount: {
        type: DataTypes.FLOAT,
      },
      NetDisbursement: {
        type: DataTypes.FLOAT,
      },
      DealerPayoutType: {
        type: DataTypes.ENUM,
        values: ["Percentage", "Value"],
      },
      DealerPayoutPercentage: {
        type: DataTypes.FLOAT,
      },
      DealerPayoutValue: {
        type: DataTypes.FLOAT,
      },
      ExecPayoutType: {
        type: DataTypes.ENUM,
        values: ["Percentage", "Value"],
      },
      ExecPayoutPercentage: {
        type: DataTypes.FLOAT,
      },
      ExecPayoutValue: {
        type: DataTypes.FLOAT,
      },
      TotalPayout: {
        type: DataTypes.FLOAT,
      },
      ApprovedDate: {
        type: DataTypes.DATEONLY,
      },
      ApplicationStatus: {
        type: DataTypes.STRING(50),
      },
      IsActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      PaymentStatus: {
        type: DataTypes.ENUM,
        values: ["Pending", "Approved"],
        allowNull: false,
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
      modelName: "FinanceLoanApplication",
      tableName: "FinanceLoanApplication", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return FinanceLoanApplication;
};
