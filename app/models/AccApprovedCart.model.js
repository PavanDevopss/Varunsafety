const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class AccApprovedCart extends Model {}

  AccApprovedCart.init(
    {
      AccApprovedCartID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      AccApprovalReqID: {
        type: DataTypes.INTEGER,
        references: {
          model: "AccApprovalReq", // This is the name of the referenced model
          key: "AccApprovalReqID", // This is the name of the referenced column
        },
      },
      AccCartID: {
        type: DataTypes.ARRAY(DataTypes.INTEGER),
        // allowNull: false,
        // references: {
        //   model: "AccCart", // This is the name of the referenced model
        //   key: "AccCartID", // This is the name of the referenced column
        // },
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
      TotalGrossValue: {
        type: DataTypes.DOUBLE,
      },
      Discount: {
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
      modelName: "AccApprovedCart",
      tableName: "AccApprovedCart", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return AccApprovedCart;
};
