const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class AccCategoryModel extends Model {}

  AccCategoryModel.init(
    {
      AccCategoryID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      AccCategoryName: {
        type: DataTypes.STRING(255),
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
      modelName: "AccCategory",
      tableName: "AccCategory",
      timestamps: false,
    }
  );

  return AccCategoryModel;
};
