const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class AccSubCategoryModel extends Model {}

  AccSubCategoryModel.init(
    {
      AccSubCategoryID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      AccSubCategoryName: {
        type: DataTypes.STRING(255),
      },
      AccCategoryID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "AccCategory",
          key: "AccCategoryID",
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
      modelName: "AccSubCategory",
      tableName: "AccSubCategory",
      timestamps: false,
    }
  );

  return AccSubCategoryModel;
};
