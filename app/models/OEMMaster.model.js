const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class OEMMaster extends Model {}

  OEMMaster.init(
    {
      OEMID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      OEMCode: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      OEMName: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      CompanyID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "CompanyMaster", // This is the name of the referenced model
          key: "CompanyID", // This is the name of the referenced column
        },
      },
      ParentCmpyID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "ParentCompany", // This is the name of the referenced model
          key: "ParentCmpyID", // This is the name of the referenced column
        },
      },
      IndustryID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "IndustryMaster", // This is the name of the referenced model
          key: "IndustryID", // This is the name of the referenced column
        },
      },
      // DivisionID: {
      //   type: DataTypes.INTEGER,
      //   allowNull: false,
      //   references: {
      //     model: "DivisionMaster", // This is the name of the referenced model
      //     key: "DivisionID", // This is the name of the referenced column
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
      modelName: "OEMMaster",
      tableName: "OEMMaster", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return OEMMaster;
};
