const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class ValueAddedService extends Model {}

  ValueAddedService.init(
    {
      VASID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      ProductCode: {
        type: DataTypes.STRING(50),
      },
      ProductName: {
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
      modelName: "ValueAddedService",
      tableName: "ValueAddedService", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return ValueAddedService;
};
