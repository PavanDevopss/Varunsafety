const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class DocumentVerification extends Model {}

  DocumentVerification.init(
    {
      DOCVerificationID: {
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
      DocID: {
        type: DataTypes.INTEGER,
        references: {
          model: "CustomerDocInfo", // Name of the referenced model
          key: "DocID", // Primary key in the referenced model
        },
        onUpdate: "CASCADE",
        onDelete: "NO ACTION", // or 'CASCADE' or 'SET NULL' as per your requirement
      },
      UploadBy: {
        type: DataTypes.STRING(100),
        references: {
          model: "UserMaster", // Name of the referenced model
          key: "EmpID", // Primary key in the referenced model
        },
        onUpdate: "CASCADE",
        onDelete: "NO ACTION", // or 'CASCADE' or 'SET NULL' as per your requirement
      },
      ApprovedBy: {
        type: DataTypes.STRING(100),
        references: {
          model: "UserMaster", // Name of the referenced model
          key: "EmpID", // Primary key in the referenced model
        },
        onUpdate: "CASCADE",
        onDelete: "NO ACTION", // or 'CASCADE' or 'SET NULL' as per your requirement
      },
      GSTID: {
        type: DataTypes.INTEGER,
        references: {
          model: "CustomerGSTInfo", // Name of the referenced model
          key: "GSTID", // Primary key in the referenced model
        },
        onUpdate: "CASCADE",
        onDelete: "NO ACTION", // or 'CASCADE' or 'SET NULL' as per your requirement
      },
      Remarks: {
        type: DataTypes.STRING(255),
      },
      IsActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      Status: {
        type: DataTypes.ENUM,
        values: ["Approved", "Pending", "Re-Upload"],
        defaultValue: "Pending",
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
      modelName: "DocumentVerification",
      tableName: "DocumentVerification", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return DocumentVerification;
};
