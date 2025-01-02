const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class TRProcess extends Model {}

  TRProcess.init(
    {
      TRProcessID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },

      CmpyStateID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "CompanyStates", // This is the name of the referenced model
          key: "CmpyStateID", // This is the name of the referenced column
        },
      },
      RegistrationPortal: {
        type: DataTypes.ENUM,
        values: ["Vahan Portal", "State Portal"],
      },
      RegistrationType: {
        type: DataTypes.ENUM,
        values: ["Commercial", "Tax", "Private"],
      },
      SlabValue: {
        type: DataTypes.DOUBLE,
      },
      TaxPeriod: {
        type: DataTypes.ENUM,
        values: ["Quaterly", "Tax", "Private"],
      },
      VehicleClassification: {
        type: DataTypes.STRING,
      },
      ChargeType: {
        type: DataTypes.ENUM,
        values: ["Percentage", "Value"],
      },
      // Charge: {
      //   type: DataTypes.DOUBLE,
      // },
      TaxValue: {
        type: DataTypes.DOUBLE,
      },
      TRCharges: {
        type: DataTypes.DOUBLE,
      },
      PRCharges: {
        type: DataTypes.DOUBLE,
      },
      Hypothecation: {
        type: DataTypes.STRING,
      },
      HSPRCharge: {
        type: DataTypes.DOUBLE,
      },
      RegistrationFee: {
        type: DataTypes.DOUBLE,
      },
      OtherCharges: {
        type: DataTypes.DOUBLE,
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
      modelName: "TRProcess",
      tableName: "TRProcess", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return TRProcess;
};
