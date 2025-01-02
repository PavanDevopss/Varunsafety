const { Model, DataTypes } = require("sequelize");
module.exports = (sequelize) => {
  class Teams extends Model {}
  Teams.init(
    {
      TeamID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      TeamName: {
        type: DataTypes.STRING(100),
      },
      LeaderName: {
        type: DataTypes.STRING(100),
      },
      BranchID: {
        type: DataTypes.INTEGER,
        references: {
          model: "BranchMaster",
          key: "BranchID",
        },
      },
      DeptID: {
        type: DataTypes.INTEGER,
        references: {
          model: "DepartmentMaster",
          key: "DeptID",
        },
      },
      TeamLeadID: {
        type: DataTypes.INTEGER,
        references: {
          model: "UserMaster",
          key: "UserID",
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
      modelName: "Teams",
      tableName: "Teams", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );
  return Teams;
};
