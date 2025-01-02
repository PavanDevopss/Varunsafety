const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class DivisionMaster extends Model {}

  DivisionMaster.init(
    {
      DivisionID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      DivisionName: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      ParentCmpyID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "ParentCompany", // This is the name of the referenced model
          key: "ParentCmpyID", // This is the name of the referenced column
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
      modelName: "DivisionMaster",
      tableName: "DivisionMaster", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return DivisionMaster;
};
