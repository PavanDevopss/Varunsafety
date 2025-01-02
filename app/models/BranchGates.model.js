const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class BranchGates extends Model {}

  BranchGates.init(
    {
      BranchGateID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      BranchTypeID: {
        type: DataTypes.INTEGER,
        references: {
          model: "BranchTypes",
          key: "BranchTypeID",
        },
      },
      BranchID: {
        type: DataTypes.INTEGER,
        references: {
          model: "BranchMaster",
          key: "BranchID",
        },
      },
      City: {
        type: DataTypes.STRING(50),
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
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: sequelize.literal("NOW()"),
      },
      ModifiedDate: {
        allowNull: true,
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      modelName: "BranchGates",
      tableName: "BranchGates", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return BranchGates;
};
