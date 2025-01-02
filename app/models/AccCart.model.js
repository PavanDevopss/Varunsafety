const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class AccCartModel extends Model {}

  AccCartModel.init(
    {
      AccCartID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      DiscountType: {
        type: DataTypes.ENUM,
        values: ["Value", "FOC", "Percentage"],
      },
      DiscountValue: {
        type: DataTypes.FLOAT,
      },
      DiscountPercentage: {
        type: DataTypes.FLOAT,
      },
      PartMasterID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "AccPartMaster",
          key: "PartMasterID",
        },
      },
      BookingID: {
        type: DataTypes.INTEGER,
        references: {
          model: "NewCarBookings", // Reference to NewCarBookings Model
          key: "BookingID", //use primary key or referencing field name in  NewCarBookings
        },
      },
      CustomerID: {
        type: DataTypes.INTEGER, // reference ID from Customer Master
        references: {
          model: "CustomerMaster", // Reference to CustomerMaster Model
          key: "CustomerID", //use primary key or referencing field name in  CustomerMaster
        },
        allowNull: true,
      },
      QTY: {
        type: DataTypes.FLOAT,
      },
      AccOfferAmt: {
        type: DataTypes.FLOAT,
      },
      // AccOfferID: {
      //   type: DataTypes.INTEGER,
      //   references: {
      //     model: "Offer", // Reference to CustomerMaster Model
      //     key: "OfferID", //use primary key or referencing field name in  CustomerMaster
      //   },
      // },
      CartStatus: {
        type: DataTypes.ENUM,
        values: [
          "Pending",
          "Approved",
          "Rejected",
          "Cancel Requested",
          "Cancelled",
          "Cancel Rejected",
          "RequestStore",
        ],
        defaultValue: "Pending",
      },
      RequestedBy: {
        type: DataTypes.INTEGER,
        references: {
          model: "UserMaster", // Name of the referenced model
          key: "UserID", // Primary key in the referenced model
        },
      },
      ApprovedBy: {
        type: DataTypes.INTEGER,
        references: {
          model: "UserMaster", // Name of the referenced model
          key: "UserID", // Primary key in the referenced model
        },
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
      modelName: "AccCart",
      tableName: "AccCart",
      timestamps: false,
    }
  );

  return AccCartModel;
};
