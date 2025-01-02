const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class AccJobOrder extends Model {}

  AccJobOrder.init(
    {
      AccJobOrderID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      JobOrderNo: {
        type: DataTypes.STRING,
      },
      JobOrderDate: {
        type: DataTypes.DATE,
      },
      BookingID: {
        type: DataTypes.INTEGER,
        references: {
          model: "NewCarBookings", // This is the name of the referenced model
          key: "BookingID", // This is the name of the referenced column
        },
      },
      FitmentEmpID: {
        type: DataTypes.INTEGER,
        references: {
          model: "UserMaster", // This is the name of the referenced model
          key: "UserID", // This is the name of the referenced column
        },
      },
      CancelledEmpID: {
        type: DataTypes.INTEGER,
        references: {
          model: "UserMaster", // This is the name of the referenced model
          key: "UserID", // This is the name of the referenced column
        },
      },
      AccIssueID: {
        type: DataTypes.INTEGER,
        references: {
          model: "AccIssueReq", // This is the name of the referenced model
          key: "AccIssueID", // This is the name of the referenced column
        },
      },
      Remarks: {
        type: DataTypes.STRING,
      },
      IssueStatus: {
        type: DataTypes.ENUM,
        values: ["Pending", "Partial", "Issued", "Cancelled"],
      },
      JobStatus: {
        type: DataTypes.ENUM,
        values: ["Requested", "Accepted", "Completed", "Cancelled"],
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
      modelName: "AccJobOrder",
      tableName: "AccJobOrder", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return AccJobOrder;
};
