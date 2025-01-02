const { Model, DataTypes } = require("sequelize");
module.exports = (sequelize) => {
  class SubModule extends Model {}
  SubModule.init(
    {
      SubModuleID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      ModuleID: {
        type: DataTypes.INTEGER,
        references: {
          model: "ModuleMaster", // This is the name of the referenced model
          key: "ModuleID", // This is the name of the referenced column
        },
      },
      SubModuleName: {
        type: DataTypes.STRING(50),
      },
      Sequence: {
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
      modelName: "SubModule",
      tableName: "SubModule", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );
  return SubModule;
};
