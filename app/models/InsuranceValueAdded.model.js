const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class InsuranceValueAdded extends Model {}

  InsuranceValueAdded.init(
    {
      InsuranceValueAddedID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      InsuranceCode: {
        type: DataTypes.STRING(25),
      },
      AddOnType: {
        type: DataTypes.STRING(100),
      },
      Description: {
        type: DataTypes.STRING(100),
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
      modelName: "InsuranceValueAdded",
      tableName: "InsuranceValueAdded", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return InsuranceValueAdded;
};
