const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class ManagerApprovalsMap extends Model {}

  ManagerApprovalsMap.init(
    {
      ManagerApprovalsMapID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      VASManagerApprovalsID: {
        type: DataTypes.INTEGER,
        references: {
          model: "VASManagerApprovals", // This is the name of the referenced model
          key: "VASManagerApprovalsID", // This is the name of the referenced column
        },
      },
      VASProductID: {
        type: DataTypes.INTEGER,
        references: {
          model: "VASProductPricing", // This is the name of the referenced model
          key: "VASProductID", // This is the name of the referenced column
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
      },
    },
    {
      sequelize,
      modelName: "ManagerApprovalsMap",
      tableName: "ManagerApprovalsMap", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return ManagerApprovalsMap;
};
