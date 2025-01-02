const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class ApprovalRefferal extends Model {}

  ApprovalRefferal.init(
    {
      RefferalID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      CustOfferID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "OffersApprovals", // This is the name of the referenced model
          key: "CustOfferID", // This is the name of the referenced column
        },
      },
      RequestedBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "UserMaster", // This is the name of the referenced model
          key: "UserID", // This is the name of the referenced column
        },
      },
      RequestDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      RequestedTo: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "UserMaster", // This is the name of the referenced model
          key: "UserID", // This is the name of the referenced column
        },
      },
      ActionDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      RequestStatus: {
        type: DataTypes.ENUM,
        values: ["Requested", "Reffered"],
        allowNull: false,
      },

      ActionStatus: {
        type: DataTypes.ENUM,
        values: ["Requested", "Approved", "Rejected", "Reffered", "Expired"],
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
      modelName: "ApprovalRefferal",
      tableName: "ApprovalRefferal", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return ApprovalRefferal;
};
