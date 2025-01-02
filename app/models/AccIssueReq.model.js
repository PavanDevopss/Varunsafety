const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class AccIssueReq extends Model {}

  AccIssueReq.init(
    {
      AccIssueID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      IssueNo: {
        type: DataTypes.STRING(50),
      },
      IssueDate: {
        type: DataTypes.DATE,
      },
      BookingID: {
        type: DataTypes.INTEGER,
        references: {
          model: "NewCarBookings", // This is the name of the referenced model
          key: "BookingID", // This is the name of the referenced column
        },
      },
      AllotmentID: {
        type: DataTypes.INTEGER,
        references: {
          model: "VehicleAllotment", // This is the name of the referenced model
          key: "AllotmentReqID", // This is the name of the referenced column
        },
      },
      ReqEmpID: {
        type: DataTypes.INTEGER,

        references: {
          model: "UserMaster", // This is the name of the referenced model
          key: "UserID", // This is the name of the referenced column
        },
      },
      IssuedEmpID: {
        type: DataTypes.INTEGER,

        references: {
          model: "UserMaster", // This is the name of the referenced model
          key: "UserID", // This is the name of the referenced column
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
      Remarks: {
        type: DataTypes.STRING,
      },

      IssueStatus: {
        type: DataTypes.ENUM,

        values: ["Pending", "Partial", "Issued", "Cancelled"],
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
      modelName: "AccIssueReq",
      tableName: "AccIssueReq",
      timestamps: false,
    }
  );

  return AccIssueReq;
};
