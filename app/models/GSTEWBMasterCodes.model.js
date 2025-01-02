const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class GSTEWBMasterCodes extends Model {}

  GSTEWBMasterCodes.init(
    {
      GSTEWBMasterCodeID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      MasterName: {
        type: DataTypes.STRING(100),
      },
      Code: {
        type: DataTypes.STRING(255),
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
      modelName: "GSTEWBMasterCodes",
      tableName: "GSTEWBMasterCodes", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return GSTEWBMasterCodes;
};
