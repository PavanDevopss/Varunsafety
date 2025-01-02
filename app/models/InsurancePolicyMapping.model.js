const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class InsurancePolicyMapping extends Model {}

  InsurancePolicyMapping.init(
    {
      InsurancePolicyMappingID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      InsurancePolicyTypeID: {
        type: DataTypes.INTEGER,
        references: {
          model: "InsurancePolicyType", // This is the name of the referenced model
          key: "InsurancePolicyTypeID", // This is the name of the referenced column
        },
      },
      ModelMasterID: {
        type: DataTypes.INTEGER,
        references: {
          model: "ModelMaster", // This is the name of the referenced model
          key: "ModelMasterID", // This is the name of the referenced column
        },
      },
      VariantID: {
        type: DataTypes.INTEGER,
        references: {
          model: "VariantMaster", // This is the name of the referenced model
          key: "VariantID", // This is the name of the referenced column
        },
      },
      TransmissionID: {
        type: DataTypes.INTEGER,
        references: {
          model: "Transmission", // This is the name of the referenced model
          key: "TransmissionID", // This is the name of the referenced column
        },
      },
      OwnDamage: {
        type: DataTypes.BOOLEAN,
      },
      TPCover: {
        type: DataTypes.BOOLEAN,
      },
      OwnDamagePriceType: {
        type: DataTypes.ENUM,
        values: ["Percentage", "Value"],
      },
      OwnDamagePriceValue: {
        type: DataTypes.DOUBLE,
      },
      OwnDamageDiscountType: {
        type: DataTypes.ENUM,
        values: ["Percentage", "Value"],
      },
      OwnDamageDiscountValue: {
        type: DataTypes.DOUBLE,
      },
      TPCoverPriceType: {
        type: DataTypes.ENUM,
        values: ["Percentage", "Value"],
      },
      TPCoverPriceValue: {
        type: DataTypes.DOUBLE,
      },
      TPCoverDiscountType: {
        type: DataTypes.ENUM,
        values: ["Percentage", "Value"],
      },
      TPCoverDiscountValue: {
        type: DataTypes.DOUBLE,
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
      modelName: "InsurancePolicyMapping",
      tableName: "InsurancePolicyMapping", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return InsurancePolicyMapping;
};
