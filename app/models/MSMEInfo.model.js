const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class MSMEInfo extends Model {}

  MSMEInfo.init(
    {
      MSMEID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      CustomerID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        // references: {
        //   model: "CustomerMaster", // This is the name of the referenced model
        //   key: "CustomerID", // This is the name of the referenced column
        // },
      },
      RegistrationType: {
        type: DataTypes.STRING(100),
        // allowNull: false,
      },
      DateOfRegistration: {
        type: DataTypes.DATEONLY,
        // allowNull: false, // Assuming this field cannot be null
      },
      NameOfEnterprise: {
        type: DataTypes.STRING(100),
        // allowNull: false,
      },
      RegistrationNo: {
        type: DataTypes.STRING(100),
        // allowNull: false,
      },
      Status: {
        type: DataTypes.STRING(25),
        defaultValue: "Active",
        unique: false,
      },
      IsActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
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
      modelName: "MSMEInfo",
      tableName: "MSMEInfo", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return MSMEInfo;
};
