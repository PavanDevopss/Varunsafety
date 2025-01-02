const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class ChannelMaster extends Model {}

  ChannelMaster.init(
    {
      ChannelID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      CompanyID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "CompanyMaster", // This is the name of the referenced model
          key: "CompanyID", // This is the name of the referenced column
        },
      },
      OEMID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "OEMMaster", // This is the name of the referenced model
          key: "OEMID", // This is the name of the referenced column
        },
      },
      ChannelName: {
        type: DataTypes.STRING(50), //foreign key refering to branch indents
      },
      IsActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      Status: {
        type: DataTypes.STRING(25),
        defaultValue: "Active", //Enums refer Prabhakar before execution
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
      modelName: "ChannelMaster",
      tableName: "ChannelMaster", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );
  // ChannelMaster.belongsTo(sequelize.define("ModelMaster"), {
  //   foreignKey: "ChannelID",
  //   as: "channel",
  // });
  return ChannelMaster;
};
