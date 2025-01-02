const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class GSTIRNErrorCodes extends Model {}

  GSTIRNErrorCodes.init(
    {
      GSTIRNErrorCodeID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      ErrorCodes: {
        type: DataTypes.STRING(50),
      },
      Description: {
        type: DataTypes.STRING(),
      },
      ReasonForError: {
        type: DataTypes.STRING(),
      },
      Resolution: {
        type: DataTypes.STRING(),
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
      modelName: "GSTIRNErrorCodes",
      tableName: "GSTIRNErrorCodes", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return GSTIRNErrorCodes;
};
