const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class AccPartMapWithModel extends Model {}

  AccPartMapWithModel.init(
    {
      PartModelID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      PartMasterID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "AccPartMaster",
          key: "PartMasterID",
        },
      },
      ModelMasterID: {
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
      AccCategoryID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "AccCategory",
          key: "AccCategoryID",
        },
      },
      AccSubCategoryID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "AccSubCategory",
          key: "AccSubCategoryID",
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
      modelName: "AccPartMapWithModel",
      tableName: "AccPartMapWithModel",
      timestamps: false,
    }
  );

  return AccPartMapWithModel;
};
