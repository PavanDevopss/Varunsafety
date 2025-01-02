const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class CompanyLevel extends Model {}

  CompanyLevel.init(
    {
      LevelID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      LevelName: {
        type: DataTypes.STRING(50),
      },
      ParentID: {
        type: DataTypes.INTEGER,
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
        // defaultValue: sequelize.literal("NOW()"),
      },
    },
    {
      sequelize,
      modelName: "CompanyLevel",
      tableName: "CompanyLevel", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return CompanyLevel;
};
