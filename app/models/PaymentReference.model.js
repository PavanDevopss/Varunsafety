const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class PaymentRef extends Model {}

  PaymentRef.init(
    {
      ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      PaymentRefName: {
        type: DataTypes.STRING(100),
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
      modelName: "PaymentReference",
      tableName: "PaymentReference", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return PaymentRef;
};
