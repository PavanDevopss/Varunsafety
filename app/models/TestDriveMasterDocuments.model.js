const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class TestDriveMasterDocments extends Model {}

  TestDriveMasterDocments.init(
    {
      TestDriveMasterDocumentID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      TestDriveMasterID: {
        type: DataTypes.INTEGER,
        references: {
          model: "TestDriveMaster", // Name of the referenced table
          key: "TestDriveMasterID", // Primary key in the referenced table
        },
      },
      DocTypeID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "DocumentTypes", // Name of the referenced table
          key: "DocTypeID", // Primary key in the referenced table
        },
      },
      DocURL: {
        type: DataTypes.STRING(255),
        allowNull: false,
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
      },
    },
    {
      sequelize,
      modelName: "TestDriveMasterDocments",
      tableName: "TestDriveMasterDocments", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return TestDriveMasterDocments;
};
