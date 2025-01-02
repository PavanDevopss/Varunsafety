const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class CustomerDocInfo extends Model {}

  CustomerDocInfo.init(
    {
      DocID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      CustomerID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "CustomerMaster", // Name of the referenced model
          key: "CustomerID", // Primary key in the referenced model
        },
        onUpdate: "CASCADE",
        onDelete: "NO ACTION", // or 'CASCADE' or 'SET NULL' as per your requirement
      },
      CustomerRelation: {
        type: DataTypes.ENUM, // Assuming this is an ENUM type as per your original schema
        values: ["Self", "Co-Applicant"], // Update with your actual values
      },
      DocURL: {
        type: DataTypes.STRING(255),
      },
      DocTypeID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "DocumentTypes", // Name of the referenced model
          key: "DocTypeID", // Primary key in the referenced model
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
      modelName: "CustomerDocInfo",
      tableName: "CustomerDocInfo", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return CustomerDocInfo;
};
