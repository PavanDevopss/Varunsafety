const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Transmission extends Model {}

  Transmission.init(
    {
      TransmissionID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      TransmissionDescription: {
        type: DataTypes.STRING(100),
      },
      TransmissionCode: {
        type: DataTypes.STRING(50),
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
      modelName: "Transmission",
      tableName: "Transmission", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return Transmission;
};
