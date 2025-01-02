const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class FinStatusUpdate extends Model {}

  FinStatusUpdate.init(
    {
      FinStatusID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      FinAppID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "FinanceApplication", // Replace with the actual model name for FinAppID if different
          key: "FinAppID",
        },
      },
      CurrentStage: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      StatusDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("NOW()"),
      },
      NextStage: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      Remarks: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      FinDocURL: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      Status: {
        type: DataTypes.STRING(25),
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
      modelName: "FinStatusUpdate",
      tableName: "FinStatusUpdate", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable automatic timestamp fields (createdAt, updatedAt)
    }
  );

  return FinStatusUpdate;
};
