const { Model, DataTypes } = require("sequelize");
module.exports = (sequelize) => {
  class Forms extends Model {}
  Forms.init(
    {
      FormID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      FormCode: {
        type: DataTypes.STRING(50),
      },
      FormName: {
        type: DataTypes.STRING(100),
      },
      ModuleID: {
        type: DataTypes.INTEGER,
        references: {
          model: "ModuleMaster",
          key: "ModuleID",
        },
      },
      FormInterface: {
        type: DataTypes.ENUM,
        values: ["Web", "Mobile"],
      },
      FormType: {
        type: DataTypes.ENUM,
        values: ["Form", "Report"],
      },
      URLPath: {
        type: DataTypes.STRING(255),
      },
      Sequence: {
        type: DataTypes.INTEGER,
      },
      MenuListing: {
        type: DataTypes.BOOLEAN,
      },
      IconURL: {
        type: DataTypes.STRING(255),
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
      modelName: "FormsMaster",
      tableName: "FormsMaster", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );
  return Forms;
};
