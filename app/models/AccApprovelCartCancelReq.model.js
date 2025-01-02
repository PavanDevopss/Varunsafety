const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class AccApprovalCartCancelReq extends Model {}

  AccApprovalCartCancelReq.init(
    {
      AccApprovalCartCancelReqID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      ReqNo: {
        type: DataTypes.STRING,
        // allowNull: false,
      },
      ReqDate: {
        type: DataTypes.DATE,
        // allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      ReqEmpID: {
        type: DataTypes.INTEGER,
        // allowNull: false,
        references: {
          model: "UserMaster", // This is the name of the referenced model
          key: "UserID", // This is the name of the referenced column
        },
      },
      BookingID: {
        type: DataTypes.INTEGER,
        // allowNull: false,
        references: {
          model: "NewCarBookings", // This is the name of the referenced model
          key: "BookingID", // This is the name of the referenced column
        },
      },
      BranchID: {
        type: DataTypes.INTEGER,
        // allowNull: false,
        references: {
          model: "BranchMaster", // This is the name of the referenced model
          key: "BranchID", // This is the name of the referenced column
        },
      },
      AccCartID: {
        type: DataTypes.ARRAY(DataTypes.INTEGER),
        // references: {
        //   model: "AccCart", // This is the name of the referenced model
        //   key: "AccCartID", // This is the name of the referenced column
        // },
      },
      ApprovedEmpID: {
        type: DataTypes.INTEGER,
        // allowNull: false,
        references: {
          model: "UserMaster", // This is the name of the referenced model
          key: "UserID", // This is the name of the referenced column
        },
      },
      CancelledEmpID: {
        type: DataTypes.INTEGER,
        // allowNull: false,
        references: {
          model: "UserMaster", // This is the name of the referenced model
          key: "UserID", // This is the name of the referenced column
        },
      },
      TotalGrossValue: {
        type: DataTypes.DOUBLE,
      },
      TotalDiscount: {
        type: DataTypes.DOUBLE,
      },
      NetValue: {
        type: DataTypes.DOUBLE,
      },
      NewCarAccOffer: {
        type: DataTypes.DOUBLE,
      },
      TotalPayableAmt: {
        type: DataTypes.DOUBLE,
      },
      RemovalReason: {
        type: DataTypes.STRING,
      },
      Remarks: {
        type: DataTypes.STRING,
        // allowNull: true,
      },
      ApprovalStatus: {
        type: DataTypes.ENUM,
        values: ["Pending", "Approved", "Rejected", "Referred", "Expired"],
        // allowNull: false,
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
      modelName: "AccApprovalCartCancelReq",
      tableName: "AccApprovalCartCancelReq", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return AccApprovalCartCancelReq;
};
