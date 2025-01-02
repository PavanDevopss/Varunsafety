const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class CompanyGSTMaster extends Model {}

  CompanyGSTMaster.init(
    {
      CmpyGSTID: {
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
      GSTIN: {
        type: DataTypes.STRING(25),
        allowNull: false,
      },
      RegistrationType: {
        type: DataTypes.STRING(50),
      },
      LegalName: {
        type: DataTypes.STRING(255),
      },
      TradeName: {
        type: DataTypes.STRING(255),
      },
      DOR: {
        type: DataTypes.DATEONLY,
      },
      EntityType: {
        type: DataTypes.STRING(255),
      },
      Address: {
        type: DataTypes.STRING(255),
      },
      StatePOSID: {
        type: DataTypes.INTEGER,
        references: {
          model: "StatePOS", // This is the name of the referenced model
          key: "StatePOSID", // This is the name of the referenced column
        },
      },
      PINCode: {
        type: DataTypes.STRING(6),
      },
      ClientID: {
        type: DataTypes.STRING(100),
      },
      ClientSecret: {
        type: DataTypes.STRING(100),
      },
      UserName: {
        type: DataTypes.STRING(50),
      },
      Password: {
        type: DataTypes.STRING(100),
      },
      GSTStatus: {
        type: DataTypes.BOOLEAN,
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
      modelName: "CompanyGSTMaster",
      tableName: "CompanyGSTMaster", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );
  // CompanyGSTMaster.addHook('beforeUpdate', (company, options) => {
  //   company.ModifiedDate = sequelize.literal("NOW()");
  // });

  return CompanyGSTMaster;
};
