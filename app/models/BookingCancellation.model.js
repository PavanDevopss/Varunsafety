const { Model, DataTypes } = require("sequelize");
module.exports = (sequelize) => {
  class BookingCancellation extends Model {}
  BookingCancellation.init(
    {
      BookingCancellationID: {
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
      ReqEmpID: {
        type: DataTypes.INTEGER,
        references: {
          model: "UserMaster",
          key: "UserID",
        },
      },
      TLEmpID: {
        type: DataTypes.INTEGER,
        references: {
          model: "UserMaster",
          key: "UserID",
        },
      },
      TLApprovalStatus: {
        type: DataTypes.ENUM,
        values: ["Pending", "Approved", "Rejected"],
      },
      ApprovedBy: {
        type: DataTypes.INTEGER,
        references: {
          model: "UserMaster",
          key: "UserID",
        },
      },
      ReqBranch: {
        type: DataTypes.INTEGER,
        references: {
          model: "BranchMaster",
          key: "BranchID",
        },
      },
      Reason: {
        type: DataTypes.STRING(100),
      },
      Remarks: {
        type: DataTypes.STRING(225),
      },
      CancelStatus: {
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
      modelName: "BookingCancellation",
      tableName: "BookingCancellation", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );
  return BookingCancellation;
};
