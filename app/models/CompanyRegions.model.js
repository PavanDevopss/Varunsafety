const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class CompanyRegions extends Model {}

  CompanyRegions.init(
    {
      CmpyRegionID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      CmpyRegionName: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      CmpyStateID: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "CompanyStates", // This is the name of the referenced model
          key: "CmpyStateID", // This is the name of the referenced column
        },
      },
      StatePOSID: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "StatePOS", // This is the name of the referenced model
          key: "StatePOSID", // This is the name of the referenced column
        },
      },
      CompanyID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "CompanyMaster", // This is the name of the referenced model
          key: "CompanyID", // This is the name of the referenced column
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
      modelName: "CompanyRegions",
      tableName: "CompanyRegions", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return CompanyRegions;
};
