const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class VariantMaster extends Model {}

  VariantMaster.init(
    {
      VariantID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      VariantCode: {
        type: DataTypes.STRING(50),
      },
      TransmissionID: {
        type: DataTypes.INTEGER,
        references: {
          model: "Transmission", // References the Transmission model
          key: "TransmissionID",
        },
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
      modelName: "VariantMaster",
      tableName: "VariantMaster", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return VariantMaster;
};
