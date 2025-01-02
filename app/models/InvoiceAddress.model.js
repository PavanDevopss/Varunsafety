const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class InvoiceAddress extends Model {}

  InvoiceAddress.init(
    {
      InvoiceAddressID: {
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
      GSTStatus: {
        type: DataTypes.STRING(50),
      },
      GSTNo: {
        type: DataTypes.STRING(50),
      },
      GSTName: {
        type: DataTypes.STRING(100),
      },
      GSTType: {
        type: DataTypes.STRING(50),
      },
      AddressType: {
        type: DataTypes.ENUM,
        values: ["Billing", "Shipping"],
      },
      PANNo: {
        type: DataTypes.STRING(25),
      },
      IsSameAddress: {
        type: DataTypes.BOOLEAN,
      },
      Address1: {
        type: DataTypes.STRING(100),
      },
      Address2: {
        type: DataTypes.STRING(100),
      },
      City: {
        type: DataTypes.STRING(50),
      },
      State: {
        type: DataTypes.STRING(50),
      },
      PINCode: {
        type: DataTypes.STRING(10),
      },
      PlaceOfSupply: {
        type: DataTypes.STRING(100),
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
      modelName: "InvoiceAddress",
      tableName: "InvoiceAddress",
      timestamps: false, // Disable timestamps
    }
  );

  return InvoiceAddress;
};
