const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class CompanyMaster extends Model {}

  CompanyMaster.init(
    {
      CompanyID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      CompanyName: {
        type: DataTypes.STRING(100),
        allowNull: false,
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
      StateID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "StateMaster", // This is the name of the referenced model
          key: "StateID", // This is the name of the referenced column
        },
      },
      // OEMID: {
      //   type: DataTypes.INTEGER,
      //   allowNull: false,
      //   references: {
      //     model: "OEMMaster", // This is the name of the referenced model
      //     key: "OEMID", // This is the name of the referenced column
      //   },
      // },
      Contact: {
        type: DataTypes.STRING(15),
      },
      Website: {
        type: DataTypes.STRING(50),
      },
      PANNo: {
        type: DataTypes.STRING(25),
      },
      TAN: {
        type: DataTypes.STRING(25),
      },
      CIN: {
        type: DataTypes.STRING(25),
      },
      RegAddress: {
        type: DataTypes.STRING(255),
      },
      // CmpyStateID: {
      //   type: DataTypes.INTEGER,
      //   references: {
      //     model: "CompanyStates", // This is the name of the referenced model
      //     key: "CmpyStateID", // This is the name of the referenced column
      //   },
      // },
      Email: {
        type: DataTypes.STRING(50),
      },
      City: {
        type: DataTypes.STRING(50),
      },
      PINCode: {
        type: DataTypes.STRING(6),
      },
      Country: {
        type: DataTypes.STRING(15),
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
      modelName: "CompanyMaster",
      tableName: "CompanyMaster", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );
  // CompanyMaster.addHook('beforeUpdate', (company, options) => {
  //   company.ModifiedDate = sequelize.literal("NOW()");
  // });

  return CompanyMaster;
};
