const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class CmpyStateMap extends Model {}

  CmpyStateMap.init(
    {
      CmpyStateMapID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      CompanyID: {
        type: DataTypes.INTEGER,
        references: {
          model: "CompanyMaster",
          key: "CompanyID",
        },
      },
      StatePOSID: {
        type: DataTypes.INTEGER,
        references: {
          model: "StatePOS",
          key: "StatePOSID",
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
      modelName: "CmpyStateMap",
      tableName: "CmpyStateMap", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return CmpyStateMap;
};
