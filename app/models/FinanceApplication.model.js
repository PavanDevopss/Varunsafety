const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class FinanceApplication extends Model {}

  FinanceApplication.init(
    {
      FinAppID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      CustomerID: {
        type: DataTypes.INTEGER, // reference ID from Customer Master
        references: {
          model: "CustomerMaster", // Reference to BranchIndents Model
          key: "CustomerID", //use primary key or referencing field name in  BranchIndents
        },
        allowNull: true,
      },
      IsCoApplicant: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      ApplicationNumber: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      LoanAppCustID: {
        type: DataTypes.INTEGER,
        references: {
          model: "FinAppApplicant", // Reference to BranchIndents Model
          key: "LoanAppCustID", //use primary key or referencing field name in  BranchIndents
        },
        // allowNull: true,
      },
      BookingID: {
        type: DataTypes.INTEGER,
        references: {
          model: "NewCarBookings", // Reference to BranchIndents Model
          key: "BookingID", //use primary key or referencing field name in  BranchIndents
        },
      },
      UserID: {
        type: DataTypes.INTEGER,
        references: {
          model: "UserMaster", // Reference to BranchIndents Model
          key: "UserID", //use primary key or referencing field name in  BranchIndents
        },
      },
      SalesPersonID: {
        type: DataTypes.INTEGER,
        references: {
          model: "UserMaster", // Reference to BranchIndents Model
          key: "UserID", //use primary key or referencing field name in  BranchIndents
        },
      },
      QuotationNo: {
        type: DataTypes.STRING(50),
      },
      QuotationDate: {
        type: DataTypes.DATE,
      },
      QuotationAmt: {
        type: DataTypes.STRING(50),
      },
      ApplicantIncome: {
        type: DataTypes.STRING(50),
      },
      FinancierID: {
        type: DataTypes.INTEGER,
        references: {
          model: "FinanceMaster", // Reference to BranchIndents Model
          key: "FinancierID", //use primary key or referencing field name in  BranchIndents
        },
      },
      FinancierName: {
        type: DataTypes.STRING(100),
      },
      Branch: {
        type: DataTypes.STRING(100),
      },
      ExShowRoom: {
        type: DataTypes.STRING(50),
      },
      LifeTax: {
        type: DataTypes.STRING(50),
      },
      Accessories: {
        type: DataTypes.STRING(50),
      },
      Insurance: {
        type: DataTypes.STRING(50),
      },
      OtherAmt: {
        type: DataTypes.STRING(50),
      },
      OnRoadPrice: {
        type: DataTypes.STRING(50),
      },
      RateOfInterest: {
        type: DataTypes.STRING(50),
      },
      Tenure: {
        type: DataTypes.STRING(50),
      },
      LoanAmt: {
        type: DataTypes.STRING(50),
      },
      Status: {
        type: DataTypes.STRING(25),
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
      modelName: "FinanceApplication",
      tableName: "FinanceApplication", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return FinanceApplication;
};
