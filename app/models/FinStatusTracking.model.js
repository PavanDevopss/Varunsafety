const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class FinStatusTracking extends Model {}

  FinStatusTracking.init(
    {
      FinStatusTrackID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      FinStatusID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "FinStatusUpdate", // Replace with the actual model name for FinAppID if different
          key: "FinStatusID",
        },
      },
      CurrentStage: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      StatusDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("NOW()"),
      },
      Status: {
        type: DataTypes.STRING(25),
        allowNull: false,
        defaultValue: "Pending",
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
      modelName: "FinStatusTracking",
      tableName: "FinStatusTracking", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable automatic timestamp fields (createdAt, updatedAt)
    }
  );

  return FinStatusTracking;
};
