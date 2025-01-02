const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class BranchTypes extends Model {}

  BranchTypes.init(
    {
      BranchTypeID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      BranchTypeName: {
        type: DataTypes.STRING(25), //foreign key refering to branch indents
      },
      IsActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      Status: {
        type: DataTypes.STRING(25),
        defaultValue: "Active", //Enums refer Prabhakar before execution
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
      modelName: "BranchTypes",
      tableName: "BranchTypes", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return BranchTypes;
};
