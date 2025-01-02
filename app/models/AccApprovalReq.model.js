const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class AccApprovalReq extends Model {}

  AccApprovalReq.init(
    {
      AccApprovalReqID: {
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
        // allowNull: false,
        // references: {
        //   model: "AccCart", // This is the name of the referenced model
        //   key: "AccCartID", // This is the name of the referenced column
        // },
        // constraints: false, // Disabling constraints since it's an array
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
      RefferedTo: {
        type: DataTypes.INTEGER,
        // allowNull: false,
        references: {
          model: "UserMaster", // This is the name of the referenced model
          key: "UserID", // This is the name of the referenced column
        },
      },
      TotalDiscount: {
        type: DataTypes.DOUBLE,
      },
      AccOfferAmt: {
        type: DataTypes.DOUBLE,
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
      modelName: "AccApprovalReq",
      tableName: "AccApprovalReq", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return AccApprovalReq;
};
