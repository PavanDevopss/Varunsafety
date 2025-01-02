const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class AccWishlistModel extends Model {}

  AccWishlistModel.init(
    {
      AccWishlistID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
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
          model: "NewCarBookings", // Reference to BranchIndents Model
          key: "BookingID", //use primary key or referencing field name in  BranchIndents
        },
      },
      CustomerID: {
        type: DataTypes.INTEGER, // reference ID from Customer Master
        references: {
          model: "CustomerMaster", // Reference to BranchIndents Model
          key: "CustomerID", //use primary key or referencing field name in  BranchIndents
        },
        allowNull: true,
      },
      QTY: {
        type: DataTypes.FLOAT,
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
      modelName: "AccWishList",
      tableName: "AccWishList",
      timestamps: false,
    }
  );

  return AccWishlistModel;
};
