const { Model, DataTypes } = require("sequelize");
module.exports = (sequelize) => {
  class FormAccessRights extends Model {}
  FormAccessRights.init(
    {
      AccessID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      RoleID: {
        type: DataTypes.INTEGER,
        references: {
          model: "RolesMaster",
          key: "RoleID",
        },
      },
      ModuleID: {
        type: DataTypes.INTEGER,
        references: {
          model: "ModuleMaster",
          key: "ModuleID",
        },
      },
      FormID: {
        type: DataTypes.INTEGER,
        references: {
          model: "FormsMaster",
          key: "FormID",
        },
      },
      ActionID: {
        type: DataTypes.INTEGER,
        references: {
          model: "APIActionMaster",
          key: "ActionID",
        },
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
      modelName: "FormAccessRights",
      tableName: "FormAccessRights", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );
  return FormAccessRights;
};
