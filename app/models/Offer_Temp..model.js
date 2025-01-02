const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Offer_Temp extends Model {}

  Offer_Temp.init(
    {
      OfferTempID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      OfferName: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      DiscountID: {
        type: DataTypes.INTEGER,
      },
      DiscountName: {
        type: DataTypes.STRING,
      },
      BranchID: {
        type: DataTypes.INTEGER,
      },
      BranchCode: {
        type: DataTypes.STRING,
      },
      ModelID: {
        type: DataTypes.INTEGER,
      },
      ModelCode: {
        type: DataTypes.STRING,
      },
      VariantID: {
        type: DataTypes.INTEGER,
      },
      VariantCode: {
        type: DataTypes.STRING,
      },
      ColourID: {
        type: DataTypes.INTEGER,
      },
      ColourCode: {
        type: DataTypes.STRING,
      },
      TransmissionID: {
        type: DataTypes.INTEGER,
      },
      TransmissionCode: {
        type: DataTypes.STRING,
      },
      FuelTypeID: {
        type: DataTypes.INTEGER,
      },
      FuelTypeCode: {
        type: DataTypes.STRING,
      },
      ValidFrom: {
        type: DataTypes.DATEONLY,
      },
      ValidUpto: {
        type: DataTypes.DATEONLY,
      },
      MFGShare: {
        type: DataTypes.DOUBLE,
      },
      DealerShare: {
        type: DataTypes.DOUBLE,
      },
      TaxAmount: {
        type: DataTypes.DOUBLE,
      },
      IGSTRate: {
        type: DataTypes.DOUBLE,
      },
      CESSRate: {
        type: DataTypes.DOUBLE,
      },
      OfferAmount: {
        type: DataTypes.DOUBLE,
      },
      Remarks: {
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
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("NOW()"),
      },
      ModifiedDate: {
        type: DataTypes.DATE,
        allowNull: true,
        // defaultValue: sequelize.literal("NOW()"),
      },
    },
    {
      sequelize,
      modelName: "Offer_Temp",
      tableName: "Offer_Temp", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return Offer_Temp;
};
