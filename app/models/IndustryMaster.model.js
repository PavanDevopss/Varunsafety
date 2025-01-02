const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class IndustryMaster extends Model {}

  IndustryMaster.init(
    {
      IndustryID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      IndustryName: {
        type: DataTypes.STRING(100),
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
        // defaultValue: sequelize.literal("NOW()"),
      },
    },
    {
      sequelize,
      modelName: "IndustryMaster",
      tableName: "IndustryMaster", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return IndustryMaster;
};