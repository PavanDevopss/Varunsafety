const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class ColourMaster extends Model {}

  ColourMaster.init(
    {
      ColourID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      ColourCode: {
        type: DataTypes.STRING(25),
      },
      ColourDescription: {
        type: DataTypes.STRING(100),
      },
      ColourCategoryID: {
        type: DataTypes.INTEGER,
        references: {
          model: "ColourCategory", // References the ColourCategory model
          key: "ColourCategoryID",
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
      modelName: "ColourMaster",
      tableName: "ColourMaster", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return ColourMaster;
};
