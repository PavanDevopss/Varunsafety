const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class AuthReq extends Model {}

  AuthReq.init(
    {
      AuthReqID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      GSTIN: {
        type: DataTypes.STRING,
      },
      Client_ID: {
        type: DataTypes.STRING(100),
      },
      Client_Secret: {
        type: DataTypes.STRING(100),
      },
      UserName: {
        type: DataTypes.STRING(100),
      },
      Password: {
        type: DataTypes.STRING(100),
      },
      URL: {
        type: DataTypes.STRING,
      },
      ReqTime: {
        type: DataTypes.DATE,
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
      modelName: "AuthReq",
      tableName: "AuthReq", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return AuthReq;
};
