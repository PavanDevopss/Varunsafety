const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class BranchGatesMapping extends Model {}

  BranchGatesMapping.init(
    {
      BranchGatesMappingID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      BranchGateID: {
        type: DataTypes.INTEGER,
        references: {
          model: "BranchGates",
          key: "BranchGateID",
        },
      },
      GateName: {
        type: DataTypes.STRING(50),
      },
      GateType: {
        type: DataTypes.ENUM,
        values: ["IN", "OUT", "BOTH"],
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
      },
    },
    {
      sequelize,
      modelName: "BranchGatesMapping",
      tableName: "BranchGatesMapping", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return BranchGatesMapping;
};
