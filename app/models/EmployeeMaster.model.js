const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class EmployeeMaster extends Model {}

  EmployeeMaster.init(
    {
      ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      EmpID: {
        type: DataTypes.STRING(255),
      },
      Name: {
        type: DataTypes.STRING(255),
      },
      Gender: {
        type: DataTypes.STRING(255),
      },
      Designation: {
        type: DataTypes.STRING(255),
      },
      Division: {
        type: DataTypes.STRING(255),
      },
      Branch: {
        type: DataTypes.STRING(255), // Assuming Branch refers to another table
      },
      BranchID: {
        type: DataTypes.INTEGER, // Assuming Branch refers to another table
      },
      DOB: {
        type: DataTypes.DATE,
      },
      DOJ: {
        type: DataTypes.DATE,
      },
      MobileNo: {
        type: DataTypes.STRING(255),
      },
      Email: {
        type: DataTypes.STRING(255),
      },
      DOR: {
        type: DataTypes.DATE,
      },
      Status: {
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
      modelName: "EmployeeMaster",
      tableName: "EmployeeMaster", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return EmployeeMaster;
};
