const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class CustomerGSTInfo extends Model {}

  CustomerGSTInfo.init(
    {
      GSTID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      CustomerID: {
        type: DataTypes.INTEGER,
        references: {
          model: "CustomerMaster", // Name of the referenced model
          key: "CustomerID", // Primary key in the referenced model
        },
        onUpdate: "CASCADE",
        onDelete: "NO ACTION", // or 'CASCADE' or 'SET NULL' as per your requirement
      },
      GSTIN: {
        type: DataTypes.STRING(25),
      },
      RegistrationType: {
        type: DataTypes.STRING(50),
      },
      LegalName: {
        type: DataTypes.STRING(100),
      },
      TradeName: {
        type: DataTypes.STRING(100),
      },
      DOR: {
        type: DataTypes.STRING(100),
      },
      EntityType: {
        type: DataTypes.STRING(100),
      },
      Address: {
        type: DataTypes.STRING(255),
      },
      StateID: {
        type: DataTypes.INTEGER,
        references: {
          model: "StatePOS", // Name of the referenced model
          key: "StatePOSID", // Primary key in the referenced model
        },
        onUpdate: "CASCADE",
        onDelete: "NO ACTION", // or 'CASCADE' or 'SET NULL' as per your requirement
      },
      PINCode: {
        type: DataTypes.INTEGER,
      },
      DocID: {
        type: DataTypes.INTEGER,
        references: {
          model: "CustomerDocInfo", // Name of the referenced model
          key: "DocID", // Primary key in the referenced model
        },
        onUpdate: "CASCADE",
        onDelete: "NO ACTION", // or 'CASCADE' or 'SET NULL' as per your requirement
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
      modelName: "CustomerGSTInfo",
      tableName: "CustomerGSTInfo", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return CustomerGSTInfo;
};
