const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class EWBRes extends Model {}

  EWBRes.init(
    {
      EWBResID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      EWBReqID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "EWBReq", // This is the name of the referenced model
          key: "EWBReqID", // This is the name of the referenced column
        },
      },
      ResStatus: {
        type: DataTypes.INTEGER,
      },
      ResMsg: {
        type: DataTypes.STRING,
      },
      ResTime: {
        type: DataTypes.DATE,
      },
      ewayBillNo: {
        type: DataTypes.STRING,
      },
      ewayBillDate: {
        type: DataTypes.DATE,
      },
      validUpto: {
        type: DataTypes.DATE,
      },
      alert: {
        type: DataTypes.STRING,
      },
      ErrorMessage: {
        type: DataTypes.STRING,
      },
      ErrorCode: {
        type: DataTypes.INTEGER,
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
      modelName: "EWBRes",
      tableName: "EWBRes", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return EWBRes;
};
