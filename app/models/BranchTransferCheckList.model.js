const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class BTCheckList extends Model {}

  BTCheckList.init(
    {
      BTCheckID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      DCNo: {
        type: DataTypes.STRING(50),
      },
      CheckListType: {
        type: DataTypes.ENUM,
        values: ["In", "Out"],
      },
      Model: {
        type: DataTypes.BOOLEAN,
        defaultValue: false, // Assuming default is false, adjust as necessary
      },
      Variant: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      Colour: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      FuelType: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      Transmission: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      ChassisNo: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      EngineNo: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      KeyNo: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      DCPrint: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      RearBumper: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      QuarterPanel: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      ManualGuided: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      DRL: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      Remarks: {
        type: DataTypes.STRING(255),
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
      modelName: "BTCheckList",
      tableName: "BTCheckList", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return BTCheckList;
};
