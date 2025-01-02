const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class ColourCategory extends Model {}

  ColourCategory.init(
    {
      ColourCategoryID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      ColourCategoryName: {
        type: DataTypes.STRING(25), //foreign key refering to branch indents
      },
      IsActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      Status: {
        type: DataTypes.STRING(25), //Enums refer Prabhakar before execution
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
      modelName: "ColourCategory",
      tableName: "ColourCategory", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return ColourCategory;
};
