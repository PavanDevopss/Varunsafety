const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class AccPartMaster extends Model {}

  AccPartMaster.init(
    {
      PartMasterID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      PartCode: {
        type: DataTypes.STRING(50),
      },
      PartName: {
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
      AccSubCategoryID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "AccSubCategory",
          key: "AccSubCategoryID",
        },
      },
      MinQuantity: {
        type: DataTypes.INTEGER,
      },
      Price: {
        type: DataTypes.DOUBLE,
      },
      Origin: {
        type: DataTypes.ENUM,
        values: ["OEM", "Others"],
      },
      Specification: {
        type: DataTypes.STRING,
      },
      Features: {
        type: DataTypes.STRING,
      },
      UniverselModel: {
        type: DataTypes.BOOLEAN,
      },
      FitmentStatus: {
        type: DataTypes.BOOLEAN,
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
      modelName: "AccPartMaster",
      tableName: "AccPartMaster",
      timestamps: false,
    }
  );

  return AccPartMaster;
};
