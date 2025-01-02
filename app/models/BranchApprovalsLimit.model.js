const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class BranchApprovalsLimit extends Model {}

  BranchApprovalsLimit.init(
    {
      BranchApprovalsLimitID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      RegionID: {
        type: DataTypes.INTEGER,
        references: {
          model: "RegionMaster", // This is the name of the referenced model
          key: "RegionID", // This is the name of the referenced column
        },
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
      UserID: {
        type: DataTypes.INTEGER,
        references: {
          model: "UserMaster",
          key: "UserID",
        },
      },
      TeamID: {
        type: DataTypes.INTEGER,
        references: {
          model: "Teams",
          key: "TeamID",
        },
      },
      LevelID: {
        type: DataTypes.STRING(255),
      },
      ThresholdLimit: {
        type: DataTypes.DOUBLE,
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
      modelName: "BranchApprovalsLimit",
      tableName: "BranchApprovalsLimit", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return BranchApprovalsLimit;
};
