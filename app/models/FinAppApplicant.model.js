const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class FinAppApplicant extends Model {}

  FinAppApplicant.init(
    {
      LoanAppCustID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      FinAppID: {
        type: DataTypes.INTEGER,
        // references: {
        //   model: "FinanceApplication", // Reference to BranchIndents Model
        //   key: "FinAppID", //use primary key or referencing field name in  BranchIndents
        // },
        allowNull: true,
      },
      CustomerID: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "CustomerMaster", // This is the name of the referenced model
          key: "CustomerID", // This is the name of the referenced column
        },
      },
      BookingID: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "NewCarBookings", // This is the name of the referenced model
          key: "BookingID", // This is the name of the referenced column
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
      Title: {
        type: DataTypes.ENUM,
        values: ["Mr.", "Ms.", "M/s."],
      },
      FirstName: {
        type: DataTypes.STRING(100),
      },
      LastName: {
        type: DataTypes.STRING(100),
      },
      PhoneNo: {
        type: DataTypes.STRING(15),
      },
      Email: {
        type: DataTypes.STRING(50),
        // allowNull: false, // Field is required
        // unique: true, // Email must be unique
        validate: {
          isEmail: true, // Validates the string is in email format
          len: [1, 255], // Length must be between 1 and 255 characters
        },
      },
      Gender: {
        type: DataTypes.ENUM,
        values: ["Male", "Female", "Others"],
      },
      DateOfBirth: {
        type: DataTypes.DATEONLY,
      },
      Occupation: {
        type: DataTypes.STRING(50),
      },
      Company: {
        type: DataTypes.STRING(100),
      },
      Address: {
        type: DataTypes.STRING(255),
      },
      District: {
        type: DataTypes.STRING(50),
      },
      State: {
        type: DataTypes.STRING(50),
      },
      PinCode: {
        type: DataTypes.STRING(6),
      },
      IncomeSource: {
        type: DataTypes.STRING(100),
      },
      AnnualIncome: {
        type: DataTypes.STRING(50),
      },
      MonthlyIncome: {
        type: DataTypes.DOUBLE,
      },
      EMIDeduction: {
        type: DataTypes.DOUBLE,
      },
      MonthlyNetIncome: {
        type: DataTypes.DOUBLE,
      },
      IsCoApplicant: {
        type: DataTypes.BOOLEAN,
      },
      RefferedEmp: {
        type: DataTypes.STRING(100),
      },
      Model: {
        type: DataTypes.STRING(100),
      },
      Variant: {
        type: DataTypes.STRING(100),
      },
      Transmission: {
        type: DataTypes.STRING(100),
      },
      FuelType: {
        type: DataTypes.STRING(100),
      },
      Colour: {
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
      modelName: "FinAppApplicant",
      tableName: "FinAppApplicant", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return FinAppApplicant;
};
