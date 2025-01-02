const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class InsuranceValueMapping extends Model {}

  InsuranceValueMapping.init(
    {
      InsuranceValueMappingID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      InsurancePolicyMappingID: {
        type: DataTypes.INTEGER,
        references: {
          model: "InsurancePolicyMapping", // This is the name of the referenced model
          key: "InsurancePolicyMappingID", // This is the name of the referenced column
        },
      },
      InsuranceValueAddedID: {
        type: DataTypes.INTEGER,
        references: {
          model: "InsuranceValueAdded", // This is the name of the referenced model
          key: "InsuranceValueAddedID", // This is the name of the referenced column
        },
      },
      PriceType: {
        type: DataTypes.ENUM,
        values: ["Percentage", "Value"],
      },
      PriceValue: {
        type: DataTypes.DOUBLE,
      },
      DiscountType: {
        type: DataTypes.ENUM,
        values: ["Percentage", "Value"],
      },
      DiscountValue: {
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
      modelName: "InsuranceValueMapping",
      tableName: "InsuranceValueMapping", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return InsuranceValueMapping;
};
