const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class VariantMapping extends Model {}

  VariantMapping.init(
    {
      VariantMappingID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      ModelMasterID: {
        type: DataTypes.INTEGER,
        references: {
          model: "ModelMaster", // This is the name of the referenced model
          key: "ModelMasterID", // This is the name of the referenced column
        },
      },
      VariantID: {
        type: DataTypes.INTEGER,
        references: {
          model: "VariantMaster", // This is the name of the referenced model
          key: "VariantID", // This is the name of the referenced column
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
      modelName: "VariantMapping",
      tableName: "VariantMapping", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return VariantMapping;
};
