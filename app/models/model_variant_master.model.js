const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class ModelVariantMaster extends Model {}

  ModelVariantMaster.init(
    {
      model_cd: {
        type: DataTypes.STRING(45),
      },
      model_desc: {
        type: DataTypes.STRING(200),
      },
      variant_cd: {
        type: DataTypes.STRING(45),
      },
      variant_desc: {
        type: DataTypes.STRING(200),
      },
      ecolor_cd: {
        type: DataTypes.STRING(45),
      },
      ecolor_desc: {
        type: DataTypes.STRING(200),
      },
      model_variant_master_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      created_date: {
        type: DataTypes.STRING(50),
      },
      ax_flag: {
        type: DataTypes.STRING(1),
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
      modelName: "model_variant_master",
      tableName: "model_variant_master", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return ModelVariantMaster;
};
