const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class ColourMapping extends Model {}

  ColourMapping.init(
    {
      ColourMappingID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      SKUID: {
        type: DataTypes.INTEGER, //foreign key referencing to SKUMaster
        references: {
          model: "SKUMaster", // Updated to BranchMaster
          key: "SKUID", // Assuming BranchID is the name of the referenced column
        },
      },
      ColourID: {
        type: DataTypes.INTEGER, //foreign key referencing to ColourMaster
        references: {
          model: "ColourMaster", // Updated to BranchMaster
          key: "ColourID", // Assuming BranchID is the name of the referenced column
        },
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
      modelName: "ColourMapping",
      tableName: "ColourMapping", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return ColourMapping;
};
