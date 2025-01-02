const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class RegionMaster extends Model {}

  RegionMaster.init(
    {
      RegionID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      RegionName: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      StateID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "StateMaster", // This is the name of the referenced model
          key: "StateID", // This is the name of the referenced column
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
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("NOW()"),
      },
      ModifiedDate: {
        type: DataTypes.DATE,
        allowNull: true,
        // defaultValue: sequelize.literal("NOW()"),
      },
    },
    {
      sequelize,
      modelName: "RegionMaster",
      tableName: "RegionMaster", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return RegionMaster;
};
