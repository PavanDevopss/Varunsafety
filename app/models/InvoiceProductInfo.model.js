const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class InvoiceProdInfo extends Model {}

  InvoiceProdInfo.init(
    {
      InvoiceProdInfoID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      InvoiceID: {
        type: DataTypes.INTEGER,
        references: {
          model: "Invoice", // Reference to ModelType model
          key: "InvoiceID",
        },
      },
      ProductID: {
        type: DataTypes.INTEGER,
        references: {
          model: "MasterProducts", // Reference to ModelType model
          key: "MasterProdID",
        },
      },
      ProductName: {
        type: DataTypes.STRING(100),
      },
      ProductCost: {
        type: DataTypes.FLOAT,
      },
      DiscountPercentage: {
        type: DataTypes.FLOAT,
      },
      DiscountValue: {
        type: DataTypes.FLOAT,
      },
      TaxableValue: {
        type: DataTypes.FLOAT, // Product Cost - Discount Value = Taxable balue
      },
      GSTRate: {
        type: DataTypes.FLOAT,
      },
      IGSTRate: {
        type: DataTypes.FLOAT,
      },
      IGSTValue: {
        type: DataTypes.FLOAT,
      },
      CESSRate: {
        type: DataTypes.FLOAT,
      },
      CESSValue: {
        type: DataTypes.FLOAT,
      },
      CGSTValue: {
        type: DataTypes.FLOAT,
      },
      SGSTValue: {
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
      modelName: "InvoiceProdInfo",
      tableName: "InvoiceProdInfo",
      timestamps: false, // Disable timestamps
    }
  );

  return InvoiceProdInfo;
};
