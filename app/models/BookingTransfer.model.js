const { Model, DataTypes } = require("sequelize");
module.exports = (sequelize) => {
  class BookingTransfer extends Model {}
  BookingTransfer.init(
    {
      BookingTransferID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      RequestID: {
        type: DataTypes.STRING(100),
      },
      BookingID: {
        type: DataTypes.INTEGER,
        references: {
          model: "NewCarBookings",
          key: "BookingID",
        },
      },
      RequestBy: {
        type: DataTypes.INTEGER,
        references: {
          model: "UserMaster",
          key: "UserID",
        },
      },
      AcceptedBy: {
        type: DataTypes.INTEGER,
        references: {
          model: "UserMaster",
          key: "UserID",
        },
      },
      ToBranch: {
        type: DataTypes.INTEGER,
        references: {
          model: "BranchMaster",
          key: "BranchID",
        },
      },
      FromBranch: {
        type: DataTypes.INTEGER,
        references: {
          model: "BranchMaster",
          key: "BranchID",
        },
      },
      RequestType: {
        type: DataTypes.ENUM,
        values: ["Received", "Raised"],
      },
      Reason: {
        type: DataTypes.STRING(100),
      },
      Remarks: {
        type: DataTypes.STRING(225),
      },
      TransferStatus: {
        type: DataTypes.ENUM,
        values: ["Pending", "Approved", "Rejected"],
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
      },
    },
    {
      sequelize,
      modelName: "BookingTransfer",
      tableName: "BookingTransfer", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );
  return BookingTransfer;
};
