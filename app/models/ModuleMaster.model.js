const { Model, DataTypes } = require("sequelize");
module.exports = (sequelize) => {
  class ModuleMaster extends Model {}
  ModuleMaster.init(
    {
      ModuleID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      ModuleCode: {
        type: DataTypes.STRING(50),
      },
      ModuleName: {
        type: DataTypes.STRING(50),
      },
      ParentModuleID: {
        type: DataTypes.INTEGER,
      },
      WebAccess: {
        type: DataTypes.BOOLEAN,
      },
      MobileAccess: {
        type: DataTypes.BOOLEAN,
      },
      Sequence: {
        type: DataTypes.INTEGER,
      },
      IconURL: {
        type: DataTypes.STRING(255),
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
      modelName: "ModuleMaster",
      tableName: "ModuleMaster", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );
  return ModuleMaster;
};
