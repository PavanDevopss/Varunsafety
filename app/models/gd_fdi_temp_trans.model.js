const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class GdFdiTempTrans extends Model {}

  GdFdiTempTrans.init(
    {
      utd: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      createddate: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: sequelize.literal("NOW()"),
      },
    },
    {
      sequelize,
      modelName: "gd_fdi_temp_trans",
      tableName: "gd_fdi_temp_trans", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return GdFdiTempTrans;
};
