const { Model, DataTypes } = require("sequelize");
module.exports = (sequelize) => {
  class TestDriveMaster extends Model {}
  TestDriveMaster.init(
    {
      TestDriveMasterID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      BranchID: {
        type: DataTypes.INTEGER,
        references: {
          model: "BranchMaster",
          key: "BranchID",
        },
      },
      VehicleRegNo: {
        type: DataTypes.STRING(50),
      },
      ModelMasterID: {
        type: DataTypes.INTEGER,
        references: {
          model: "ModelMaster",
          key: "ModelMasterID",
        },
      },
      ModelDescription: {
        type: DataTypes.STRING(50),
      },
      VariantID: {
        type: DataTypes.INTEGER,
        references: {
          model: "VariantMaster",
          key: "VariantID",
        },
      },
      FuelTypeID: {
        type: DataTypes.INTEGER,
        references: {
          model: "FuelType",
          key: "FuelTypeID",
        },
      },
      KeyNumber: {
        type: DataTypes.STRING(100),
      },
      TransmissionID: {
        type: DataTypes.INTEGER,
        references: {
          model: "Transmission",
          key: "TransmissionID",
        },
      },
      ColourID: {
        type: DataTypes.INTEGER,
        references: {
          model: "ColourMaster",
          key: "ColourID",
        },
      },
      ColourDescription: {
        type: DataTypes.STRING(50),
      },
      ChassisNumber: {
        type: DataTypes.STRING(50),
      },
      EngineNumber: {
        type: DataTypes.STRING(50),
      },
      InsuranceID: {
        type: DataTypes.STRING(50),
      },
      ValidFrom: {
        type: DataTypes.DATEONLY,
      },
      ValidTo: {
        type: DataTypes.DATEONLY,
      },
      PollutionValidFrom: {
        type: DataTypes.DATEONLY,
      },
      PollutionValidTo: {
        type: DataTypes.DATEONLY,
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
      modelName: "TestDriveMaster",
      tableName: "TestDriveMaster", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );
  return TestDriveMaster;
};
