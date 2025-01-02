const { Model, DataTypes } = require("sequelize");
module.exports = (sequelize) => {
  class TestDriveDocument extends Model {}
  TestDriveDocument.init(
    {
      TestDriveDocID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      TestDriveID: {
        type: DataTypes.INTEGER,
        references: {
          model: "TestDrive",
          key: "TestDriveID",
        },
      },
      DocTypeID: {
        type: DataTypes.INTEGER,
        references: {
          model: "DocumentTypes",
          key: "DocTypeID",
        },
      },
      TestDriveDocURL: {
        type: DataTypes.STRING(100),
      },
      TestDriveEmpID: {
        type: DataTypes.INTEGER,
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
      modelName: "TestDriveDocument",
      tableName: "TestDriveDocument", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );
  return TestDriveDocument;
};
