const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Offer extends Model {}

  Offer.init(
    {
      OfferID: {
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
        allowNull: false,
        references: {
          model: "DiscountMaster", // This is the name of the referenced model
          key: "DiscountID", // This is the name of the referenced column
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
      ModelID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "ModelMaster", // This is the name of the referenced model
          key: "ModelMasterID", // This is the name of the referenced column
        },
      },
      VariantID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "VariantMaster", // This is the name of the referenced model
          key: "VariantID", // This is the name of the referenced column
        },
      },
      ColourID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "ColourMaster", // This is the name of the referenced model
          key: "ColourID", // This is the name of the referenced column
        },
      },
      TransmissionID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Transmission", // This is the name of the referenced model
          key: "TransmissionID", // This is the name of the referenced column
        },
      },
      FuelTypeID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "FuelType", // This is the name of the referenced model
          key: "FuelTypeID", // This is the name of the referenced column
        },
      },
      ValidFrom: {
        type: DataTypes.DATE,
      },
      ValidUpto: {
        type: DataTypes.DATE,
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
      modelName: "Offer",
      tableName: "Offers", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return Offer;
};
