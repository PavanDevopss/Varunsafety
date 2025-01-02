const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class SKUMaster extends Model {}

  SKUMaster.init(
    {
      SKUID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      SKUCode: {
        type: DataTypes.STRING(25),
      },
      ModelMasterID: {
        // Corrected column name
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "ModelMaster",
          key: "ModelMasterID",
        },
      },
      VariantID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "VariantMaster",
          key: "VariantID",
        },
      },
      FuelTypeID: {
        // Corrected column name
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "FuelType",
          key: "FuelTypeID",
        },
      },
      VariantDescription: {
        type: DataTypes.STRING(100),
      },
      EmissionNorm: {
        type: DataTypes.ENUM,
        values: ["Bharat Stage VI"],
      },
      IGSTRate: {
        type: DataTypes.DOUBLE,
      },
      CESSRate: {
        type: DataTypes.DOUBLE,
      },
      HSNCode: {
        type: DataTypes.STRING(50),
      },
      DRF: {
        type: DataTypes.DOUBLE,
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
      modelName: "SKUMaster",
      tableName: "SKUMaster",
      timestamps: false,
    }
  );

  return SKUMaster;
};
