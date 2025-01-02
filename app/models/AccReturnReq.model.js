const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class AccReturnReq extends Model {}

  AccReturnReq.init(
    {
      AccReturnID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      ReturnNo: {
        type: DataTypes.STRING(50),
      },
      ReturnDate: {
        type: DataTypes.DATE,
      },
      AccIssueID: {
        type: DataTypes.INTEGER,
        references: {
          model: "AccIssueReq", // This is the name of the referenced model
          key: "AccIssueID", // This is the name of the referenced column
        },
      },
      BookingID: {
        type: DataTypes.INTEGER,
        references: {
          model: "NewCarBookings", // This is the name of the referenced model
          key: "BookingID", // This is the name of the referenced column
        },
      },
      FitReturnEmpID: {
        type: DataTypes.INTEGER,
        references: {
          model: "UserMaster", // This is the name of the referenced model
          key: "UserID", // This is the name of the referenced column
        },
      },
      ApprovedEmpID: {
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

      ReturnStatus: {
        type: DataTypes.ENUM,

        values: ["Pending", "Partial", "Returned", "Cancelled"],
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
      modelName: "AccReturnReq",
      tableName: "AccReturnReq",
      timestamps: false,
    }
  );

  return AccReturnReq;
};
