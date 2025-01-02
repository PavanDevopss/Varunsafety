const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class VASManagerApprovals extends Model {}

  VASManagerApprovals.init(
    {
      VASManagerApprovalsID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      VASProductID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "VASProductPricing", // Reference model name
          key: "VASProductID", // Reference column name
        },
      },
      BookingID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "NewCarBookings", // Reference model name
          key: "BookingID", // Reference column name
        },
      },
      UserID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "UserMaster", // Reference model name
          key: "UserID", // Reference column name
        },
      },
      // BranchName: {
      //   type: DataTypes.STRING(50),
      // },
      BranchID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "BranchMaster", // Reference model name
          key: "BranchID", // Reference column name
        },
      },
      Reason: {
        type: DataTypes.STRING(225),
      },
      Remarks: {
        type: DataTypes.STRING(225),
      },

      IsActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      Status: {
        type: DataTypes.ENUM,
        values: ["Pending", "Applied", "Approved", "Requested", "Rejected"],
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
      },
    },
    {
      sequelize,
      modelName: "VASManagerApprovals",
      tableName: "VASManagerApprovals", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable automatic timestamps
    }
  );

  return VASManagerApprovals;
};
