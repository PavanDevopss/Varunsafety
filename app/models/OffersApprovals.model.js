const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class OffersApprovals extends Model {}

  OffersApprovals.init(
    {
      CustOfferID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      BookingID: {
        type: DataTypes.INTEGER,
        // allowNull: false,
        references: {
          model: "NewCarBookings", // This is the name of the referenced model
          key: "BookingID", // This is the name of the referenced column
        },
      },
      OfferID: {
        type: DataTypes.INTEGER,
        // allowNull: false,
        references: {
          model: "Offers", // This is the name of the referenced model
          key: "OfferID", // This is the name of the referenced column
        },
      },
      MFGShare: {
        type: DataTypes.DOUBLE,
        // allowNull: false,
      },
      DealerShare: {
        type: DataTypes.DOUBLE,
        // allowNull: false,
      },
      TaxAmount: {
        type: DataTypes.DOUBLE,
        // allowNull: false,
      },
      IGSTRate: {
        type: DataTypes.DOUBLE,
        // allowNull: false,
      },
      CESSRate: {
        type: DataTypes.DOUBLE,
        // allowNull: false,
      },
      OfferAmount: {
        type: DataTypes.DOUBLE,
        // allowNull: false,
      },
      RequestedBy: {
        type: DataTypes.INTEGER,
        // allowNull: false,
        references: {
          model: "UserMaster", // This is the name of the referenced model
          key: "UserID", // This is the name of the referenced column
        },
      },
      ApprovedBy: {
        type: DataTypes.INTEGER,
        // allowNull: false,
        references: {
          model: "UserMaster", // This is the name of the referenced model
          key: "UserID", // This is the name of the referenced column
        },
      },
      Reffered: {
        type: DataTypes.BOOLEAN,
        // allowNull: false,
        defaultValue: false,
      },
      Remarks: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      Status: {
        type: DataTypes.ENUM,
        values: [
          "Requested",
          "Approved",
          "Rejected",
          "Reffered",
          "Expired",
          "Saved",
        ],
        allowNull: false,
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
      modelName: "OffersApprovals",
      tableName: "OffersApprovals", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return OffersApprovals;
};
