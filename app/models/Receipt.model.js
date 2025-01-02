const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Receipttable extends Model {}

  Receipttable.init(
    {
      ReceiptID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      ReceiptNo: {
        type: DataTypes.STRING(100),
      },
      ReceiptDate: {
        type: DataTypes.DATE,
      },
      BranchID: {
        type: DataTypes.INTEGER,
        references: {
          model: "BranchMaster", // Name of the referenced model
          key: "BranchID", // Primary key in the referenced model
        },
        onUpdate: "CASCADE",
        onDelete: "NO ACTION", // or 'CASCADE' or 'SET NULL' as per your requirement
      },
      RequestID: {
        type: DataTypes.INTEGER,
        references: {
          model: "PaymentRequests", // Name of the referenced model
          key: "ID", // Primary key in the referenced model
        },
        onUpdate: "CASCADE",
        onDelete: "NO ACTION", // or 'CASCADE' or 'SET NULL' as per your requirement
      },
      PaymentPurpose: {
        type: DataTypes.STRING(100),
      },
      PaymentMode: {
        type: DataTypes.STRING(50),
      },
      Amount: {
        type: DataTypes.DOUBLE,
      },
      InstrumentNo: {
        type: DataTypes.STRING(100),
      },
      InstrumentDate: {
        type: DataTypes.DATE,
      },
      BankID: {
        type: DataTypes.INTEGER,
        references: {
          model: "BankMaster", // Name of the referenced model
          key: "BankID", // Primary key in the referenced model
        },
      },
      BankBranch: {
        type: DataTypes.STRING(100),
      },
      BankCharges: {
        type: DataTypes.DOUBLE,
      },
      ImgURL: {
        type: DataTypes.STRING(255),
      },
      // OnlineTransID: {
      //   type: DataTypes.INTEGER,
      // },
      OnlineTransID: {
        type: DataTypes.STRING(50),
      },
      OnlineTransType: {
        type: DataTypes.STRING(100),
      },
      OnlineTransPartner: {
        type: DataTypes.STRING(100),
      },
      CustID: {
        type: DataTypes.INTEGER,
        references: {
          model: "CustomerMaster", // Name of the referenced model
          key: "CustomerID", // Primary key in the referenced model
        },
        onUpdate: "CASCADE",
        onDelete: "NO ACTION", // or 'CASCADE' or 'SET NULL' as per your requirement
      },
      AuthorisedBy: {
        type: DataTypes.INTEGER,
        references: {
          model: "UserMaster", // Name of the referenced model
          key: "UserID", // Primary key in the referenced model
        },
        onUpdate: "CASCADE",
        onDelete: "NO ACTION", // or 'CASCADE' or 'SET NULL' as per your requirement
      },
      ReceiptStatus: {
        type: DataTypes.STRING(100),
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
      modelName: "Receipts",
      tableName: "CustomerReceipts", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return Receipttable;
};
