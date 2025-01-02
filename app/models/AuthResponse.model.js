const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class AuthResponse extends Model {}

  AuthResponse.init(
    {
      AuthResID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      AuthReqID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "AuthReq", // This is the name of the referenced model
          key: "AuthReqID", // This is the name of the referenced column
        },
      },
      ResStatus: {
        type: DataTypes.INTEGER,
      },
      ResMsg: {
        type: DataTypes.STRING,
      },
      AuthToken: {
        type: DataTypes.STRING,
      },
      TokenExpiry: {
        type: DataTypes.DATE,
      },
      SEK: {
        type: DataTypes.STRING,
      },
      ErrorMessage: {
        type: DataTypes.STRING,
      },
      ErrorCode: {
        type: DataTypes.INTEGER,
      },
      ResTime: {
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
      modelName: "AuthResponse",
      tableName: "AuthResponse", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return AuthResponse;
};
