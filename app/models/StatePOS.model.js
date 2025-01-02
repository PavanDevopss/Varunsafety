const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class StatePOS extends Model {}

  StatePOS.init(
    {
      StatePOSID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      POSID: {
        type: DataTypes.STRING(25),
      },
      StateName: {
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
      modelName: "StatePOS",
      tableName: "StatePOS", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return StatePOS;
};
