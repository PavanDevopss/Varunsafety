const { Model, DataTypes } = require("sequelize");
module.exports = (sequelize) => {
  class RolesMaster extends Model {}
  RolesMaster.init(
    {
      RoleID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      RoleCode: {
        type: DataTypes.STRING(100),
      },
      RoleName: {
        type: DataTypes.STRING(100),
      },
      DeptID: {
        type: DataTypes.INTEGER,
        references: {
          model: "DepartmentMaster",
          key: "DeptID",
        },
      },
      WebAccess: {
        type: DataTypes.BOOLEAN,
      },
      MobileAccess: {
        type: DataTypes.BOOLEAN,
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
      modelName: "RolesMaster",
      tableName: "RolesMaster", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );
  return RolesMaster;
};
