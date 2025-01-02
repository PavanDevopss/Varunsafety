const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class AccPartImgModel extends Model {}

  AccPartImgModel.init(
    {
      PartUrlID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      PartMasterID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "AccPartMaster",
          key: "PartMasterID",
        },
      },
      PartImgUrl: {
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
      modelName: "AccPartImages",
      tableName: "AccPartImages",
      timestamps: false,
    }
  );

  return AccPartImgModel;
};
