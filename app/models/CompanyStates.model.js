const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class CompanyStates extends Model {}

  CompanyStates.init(
    {
      CmpyStateID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      CmpyStateName: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      // CompanyID: {
      //   type: DataTypes.INTEGER,
      //   allowNull: false,
      //   references: {
      //     model: "CompanyMaster", // This is the name of the referenced model
      //     key: "CompanyID", // This is the name of the referenced column
      //   },
      // },
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
      modelName: "CompanyStates",
      tableName: "CompanyStates", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return CompanyStates;
};
