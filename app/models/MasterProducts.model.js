const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class MasterProducts extends Model {}

  MasterProducts.init(
    {
      MasterProdID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      ProductType: {
        type: DataTypes.ENUM,
        values: ["Goods", "Service"],
      },
      ProductName: {
        type: DataTypes.STRING(100),
      },
      ProductCost: {
        type: DataTypes.FLOAT,
      },
      HSNValue: {
        type: DataTypes.STRING(50),
      },
      CESSRate: {
        type: DataTypes.FLOAT,
      },
      GSTRate: {
        type: DataTypes.FLOAT,
      },
      IsActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      Status: {
        type: DataTypes.STRING,
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
      modelName: "MasterProducts",
      tableName: "MasterProducts",
      timestamps: false, // Disable timestamps
    }
  );

  return MasterProducts;
};
