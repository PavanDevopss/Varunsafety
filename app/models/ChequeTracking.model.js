const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class ChequeTracking extends Model {}

  ChequeTracking.init(
    {
      ChqTrackID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      ReceiptID: {
        type: DataTypes.INTEGER,
        references: {
          model: "CustomerReceipts", // Name of the referenced model
          key: "ReceiptID", // Primary key in the referenced model
        },
      },
      CustomerID: {
        type: DataTypes.INTEGER,
        references: {
          model: "CustomerMaster", // Name of the referenced model
          key: "CustomerID", // Primary key in the referenced model
        },
      },
      PaymentID: {
        type: DataTypes.INTEGER,
        references: {
          model: "PaymentRequests", // Name of the referenced model
          key: "ID", // Primary key in the referenced model
        },
      },
      CurrentStage: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      StageDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("NOW()"),
      },
      IsActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      Status: {
        type: DataTypes.STRING(25),
        allowNull: false,
        defaultValue: "Pending",
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
      modelName: "ChequeTracking",
      tableName: "ChequeTracking", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return ChequeTracking;
};
