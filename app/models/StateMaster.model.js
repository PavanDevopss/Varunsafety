const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class StateMaster extends Model {}

  StateMaster.init(
    {
      StateID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      StateName: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      NationID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "NationMaster", // This is the name of the referenced model
          key: "NationID", // This is the name of the referenced column
        },
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
      modelName: "StateMaster",
      tableName: "StateMaster", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return StateMaster;
};
