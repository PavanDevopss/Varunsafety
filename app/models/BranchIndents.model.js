const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class BranchIndents extends Model {}

  BranchIndents.init(
    {
      IndentID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      IndentNo: {
        type: DataTypes.STRING(25),
      },
      IndentDate: {
        type: DataTypes.DATE,
      },
      FromBranch: {
        type: DataTypes.INTEGER, //foreign key refering to branch master
        references: {
          model: "BranchMaster", // Reference to BranchMaster model
          key: "BranchID", //  use primary key or referencing field name in branch master
        },
      },
      ToBranch: {
        type: DataTypes.INTEGER, //foreign key refering to branch master
        references: {
          model: "BranchMaster", // Reference to BranchMaster model
          key: "BranchID", //  use primary key or referencing field name in branch master
        },
      },
      ModelCode: {
        type: DataTypes.STRING(50),
      },
      VariantCode: {
        type: DataTypes.STRING(50),
      },
      ColourCode: {
        type: DataTypes.STRING(25),
      },
      Transmission: {
        type: DataTypes.STRING(25),
      },
      FuelType: {
        type: DataTypes.STRING(25),
      },
      DriverID: {
        type: DataTypes.STRING(25), // refering to Employee (user because employee master is not created) master to EmpID field
      },
      DriverName: {
        type: DataTypes.STRING(50),
      },
      EMPMobileNo: {
        type: DataTypes.STRING(15),
      },
      Status: {
        type: DataTypes.ENUM,
        values: [
          "Open",
          "Issued",
          "In-Transit",
          "Received",
          "Cancelled",
          "Returned",
        ],
        defaultValue: "Open",
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
      modelName: "BranchIndents",
      tableName: "BranchIndents", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return BranchIndents;
};
