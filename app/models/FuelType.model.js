const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class FuelType extends Model {}

  FuelType.init(
    {
      FuelTypeID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      FuelTypeName: {
        type: DataTypes.STRING(50),
      },
      FuelCode: {
        type: DataTypes.STRING(25),
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
      modelName: "FuelType",
      tableName: "FuelType", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return FuelType;
};
