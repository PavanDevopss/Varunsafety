const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class BookingsDocInfo extends Model {}

  BookingsDocInfo.init(
    {
      BDocID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      BookingID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "NewCarBookings", // Name of the referenced model
          key: "BookingID", // Primary key in the referenced model
        },
        onUpdate: "CASCADE",
        onDelete: "NO ACTION", // or 'CASCADE' or 'SET NULL' as per your requirement
      },
      CustomerID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "CustomerMaster", // Name of the referenced model
          key: "CustomerID", // Primary key in the referenced model
        },
      },
      CustomerRelation: {
        type: DataTypes.ENUM, // Assuming this is an ENUM type as per your original schema
        values: ["Applicant", "Co-Applicant"], // Update with your actual values
      },
      UploadBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "UserMaster", // Name of the referenced model
          key: "UserID", // Primary key in the referenced model
        },
      },
      BookingDocURL: {
        type: DataTypes.STRING(255),
      },
      DocTypeID: {
        type: DataTypes.INTEGER,
        allowNull: true,
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
      modelName: "BookingsDocInfo",
      tableName: "BookingsDocInfo", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return BookingsDocInfo;
};
