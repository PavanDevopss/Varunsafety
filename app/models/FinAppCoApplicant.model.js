const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class FinAppCoApplicant extends Model {}

  FinAppCoApplicant.init(
    {
      LoanAppCoCustID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      FinAppID: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      LoanAppCustID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "FinAppApplicant", // This is the name of the referenced model
          key: "LoanAppCustID", // This is the name of the referenced column
        },
      },
      Title: {
        type: DataTypes.ENUM,
        values: ["Mr.", "Ms.", "M/s."],
        allowNull: false,
      },
      FirstName: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      LastName: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      PhoneNo: {
        type: DataTypes.STRING(15),
        allowNull: true,
      },
      Email: {
        type: DataTypes.STRING(50),
        validate: {
          isEmail: true, // Validates the string is in email format
          len: [1, 255], // Length must be between 1 and 255 characters
        },
      },
      Gender: {
        type: DataTypes.ENUM,
        values: ["Male", "Female", "Others"],
        allowNull: true,
      },
      DateOfBirth: {
        type: DataTypes.DATEONLY, // Using string to avoid date format issues
        allowNull: true,
      },
      Occupation: {
        type: DataTypes.STRING(50),
      },
      Company: {
        type: DataTypes.STRING(100),
      },
      Address: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      District: {
        type: DataTypes.STRING(100),
      },
      State: {
        type: DataTypes.STRING(50),
      },
      PINCode: {
        type: DataTypes.STRING(6),
        allowNull: true,
      },
      IncomeSource: {
        type: DataTypes.STRING(100),
      },
      AnnualIncome: {
        type: DataTypes.STRING(100),
      },
      EMIDeduction: {
        type: DataTypes.DOUBLE,
      },
      MonthlyIncome: {
        type: DataTypes.DOUBLE,
      },
      MonthlyNetIncome: {
        type: DataTypes.DOUBLE,
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
      modelName: "FinAppCoApplicant",
      tableName: "FinAppCoApplicant", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return FinAppCoApplicant;
};
