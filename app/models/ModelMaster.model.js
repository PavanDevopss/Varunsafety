const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class ModelMaster extends Model {}

  ModelMaster.init(
    {
      ModelMasterID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      ModelCode: {
        type: DataTypes.STRING(50),
      },
      ModelDescription: {
        type: DataTypes.STRING(150),
      },
      ModelTypeID: {
        type: DataTypes.INTEGER,
        references: {
          model: "ModelType", // Reference to ModelType model
          key: "ModelTypeID",
        },
      },
      ChannelID: {
        type: DataTypes.INTEGER,
        references: {
          model: "ChannelMaster", // Reference to ChannelMaster model
          key: "ChannelID",
        },
      },
      ModelImageURL: {
        type: DataTypes.STRING(255),
      },
      IsActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      Status: {
        type: DataTypes.STRING,
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
      modelName: "ModelMaster",
      tableName: "ModelMaster",
      timestamps: false, // Disable timestamps
    }
  );

  return ModelMaster;
};
