const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class ClusterMaster extends Model {}

  ClusterMaster.init(
    {
      ClusterID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      ClusterName: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      ClusterType: {
        type: DataTypes.STRING(25),
        allowNull: false,
      },
      BranchID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "BranchMaster", // Updated to BranchMaster
          key: "BranchID", // Assuming BranchID is the name of the referenced column
        },
      },
      IsActive: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
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
      modelName: "ClusterMaster",
      tableName: "ClusterMaster", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return ClusterMaster;
};
