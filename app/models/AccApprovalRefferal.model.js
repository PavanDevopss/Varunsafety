const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class AccApprovalRefferal extends Model {}

  AccApprovalRefferal.init(
    {
      AccApprovalRefID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      AccApprovalReqID: {
        type: DataTypes.INTEGER,
        // allowNull: false,
        references: {
          model: "AccApprovalReq", // This is the name of the referenced model
          key: "AccApprovalReqID", // This is the name of the referenced column
        },
      },
      AccCartID: {
        type: DataTypes.INTEGER,
        // allowNull: false,
        references: {
          model: "AccCart", // This is the name of the referenced model
          key: "AccCartID", // This is the name of the referenced column
        },
      },
      ReqByEmpID: {
        type: DataTypes.INTEGER,
        // allowNull: false,
        references: {
          model: "UserMaster", // This is the name of the referenced model
          key: "UserID", // This is the name of the referenced column
        },
      },
      ReqDate: {
        type: DataTypes.DATE,
        // allowNull: false,
        // defaultValue: DataTypes.NOW,
      },
      ReqToEmpID: {
        type: DataTypes.INTEGER,
        // allowNull: false,
        references: {
          model: "UserMaster", // This is the name of the referenced model
          key: "UserID", // This is the name of the referenced column
        },
      },
      ActionDate: {
        type: DataTypes.DATE,
        // allowNull: true,
      },
      RequestStatus: {
        type: DataTypes.ENUM,
        values: ["Requested", "Referred"],
        // allowNull: false,
      },

      ActionStatus: {
        type: DataTypes.ENUM,
        values: ["Requested", "Approved", "Rejected", "Referred", "Expired"],
        // allowNull: false,
      },
      Remarks: {
        type: DataTypes.STRING(150),
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
        // allowNull: false,
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
      modelName: "AccApprovalRefferal",
      tableName: "AccApprovalRefferal", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return AccApprovalRefferal;
};
