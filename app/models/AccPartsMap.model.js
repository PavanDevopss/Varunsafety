const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class AccPartsMap extends Model {}

  AccPartsMap.init(
    {
      AccPartMapID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      AccCartID: {
        type: DataTypes.INTEGER,
        references: {
          model: "AccCart", // This is the name of the referenced model
          key: "AccCartID", // This is the name of the referenced column
        },
      },
      AccIssueID: {
        type: DataTypes.INTEGER,
        references: {
          model: "AccIssueReq", // This is the name of the referenced model
          key: "AccIssueID", // This is the name of the referenced column
        },
      },
      IssueDate: {
        type: DataTypes.DATEONLY,
      },
      AccReturnID: {
        type: DataTypes.INTEGER,
        references: {
          model: "AccReturnReq", // This is the name of the referenced model
          key: "AccReturnID", // This is the name of the referenced column
        },
      },
      ReturnDate: {
        type: DataTypes.DATEONLY,
      },
      ReqQty: {
        type: DataTypes.FLOAT,
      },
      IssueQty: {
        type: DataTypes.FLOAT,
      },
      FittedQty: {
        type: DataTypes.FLOAT,
      },
      ReturnQty: {
        type: DataTypes.FLOAT,
      },
      IssuedStatus: {
        type: DataTypes.ENUM,
        values: ["Pending", "Partial", "Issued", "Rejected", "Cancelled"],
      },
      FitmentStatus: {
        type: DataTypes.ENUM,
        values: ["Pending", "Partial", "Fitted", "Rejected", "Cancelled"],
      },
      ReturnStatus: {
        type: DataTypes.ENUM,
        values: ["Pending", "Partial", "Returned", "Rejected", "Cancelled"],
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
      modelName: "AccPartsMap",
      tableName: "AccPartsMap",
      timestamps: false,
    }
  );

  return AccPartsMap;
};
