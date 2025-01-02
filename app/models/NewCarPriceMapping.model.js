const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class NewCarPriceMapping extends Model {}

  NewCarPriceMapping.init(
    {
      NewCarPriceMappingID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      NewCarPriceListID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "NewCarPriceList", // This is the name of the referenced model
          key: "NewCarPriceListID", // This is the name of the referenced column
        },
      },
      BranchID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "BranchMaster", // This is the name of the referenced model
          key: "BranchID", // This is the name of the referenced column
        },
      },
      StateID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "StateMaster", // This is the name of the referenced model
          key: "StateID", // This is the name of the referenced column
        },
      },
      RegionID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "RegionMaster", // This is the name of the referenced model
          key: "RegionID", // This is the name of the referenced column
        },
      },
      PriceType: {
        type: DataTypes.ENUM,
        values: ["Individual", "CSD"],
      },
      CostOfPrice: {
        type: DataTypes.DOUBLE,
      },
      EffectiveDate: {
        type: DataTypes.DATEONLY,
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
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("NOW()"),
      },
      ModifiedDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "NewCarPriceMapping",
      tableName: "NewCarPriceMapping", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return NewCarPriceMapping;
};
