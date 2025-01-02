const { Model, DataTypes } = require("sequelize");
module.exports = (sequelize) => {
  class UserSpecialRights extends Model {}
  UserSpecialRights.init(
    {
      SpecialID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      UserID: {
        type: DataTypes.INTEGER,
        references: {
          model: "UserMaster",
          key: "UserID",
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
      WebAccess: {
        type: DataTypes.BOOLEAN,
        defaultValue: "false",
      },
      MobileAccess: {
        type: DataTypes.BOOLEAN,
        defaultValue: "false",
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
      modelName: "UserSpecialRights",
      tableName: "UserSpecialRights", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );
  return UserSpecialRights;
};
