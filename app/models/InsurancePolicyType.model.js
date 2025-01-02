const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class InsurancePolicyType extends Model {}

  InsurancePolicyType.init(
    {
      InsurancePolicyTypeID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      PolicyCode: {
        type: DataTypes.STRING(25),
      },
      PolicyName: {
        type: DataTypes.STRING(100),
      },
      Duration: {
        type: DataTypes.STRING(100),
      },
      Description: {
        type: DataTypes.STRING(100),
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
      modelName: "InsurancePolicyType",
      tableName: "InsurancePolicyType", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return InsurancePolicyType;
};
