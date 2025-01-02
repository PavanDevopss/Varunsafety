const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class SKUMaster_Temp extends Model {}

  SKUMaster_Temp.init(
    {
      TempSKUID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      SKUCode: {
        type: DataTypes.STRING,
      },
      ModelCode: {
        // Corrected column name
        type: DataTypes.STRING,
      },
      VariantCode: {
        type: DataTypes.STRING,
      },
      VariantDescription: {
        type: DataTypes.STRING,
      },
      IGSTRate: {
        type: DataTypes.DOUBLE,
      },
      CESSRate: {
        type: DataTypes.DOUBLE,
      },
      HSNCode: {
        type: DataTypes.STRING,
      },
      DRF: {
        type: DataTypes.DOUBLE,
      },
      FuelCode: {
        type: DataTypes.STRING,
      },
      IsActive: {
        type: DataTypes.BOOLEAN,
      },
      Status: {
        type: DataTypes.STRING,
      },
      ModelMasterID: {
        // Corrected column name
        type: DataTypes.INTEGER,
      },
      VariantID: {
        type: DataTypes.INTEGER,
      },
      FuelTypeID: {
        // Corrected column name
        type: DataTypes.INTEGER,
      },
      CreatedDate: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      ModifiedDate: {
        allowNull: true,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "SKUMaster_Temp",
      tableName: "SKUMaster_Temp",
      timestamps: false,
    }
  );

  return SKUMaster_Temp;
};
