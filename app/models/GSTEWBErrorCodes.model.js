const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class GSTEWBErrorCodes extends Model {}

  GSTEWBErrorCodes.init(
    {
      GSTEWBErrorCodeID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      ErrorCodes: {
        type: DataTypes.STRING(50),
      },
      Description: {
        type: DataTypes.STRING(),
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
      modelName: "GSTEWBErrorCodes",
      tableName: "GSTEWBErrorCodes", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return GSTEWBErrorCodes;
};
