const { Model, DataTypes } = require("sequelize");
module.exports = (sequelize) => {
  class TestDriveAllot extends Model {}
  TestDriveAllot.init(
    {
      TestDriveAllotID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      TestDriveID: {
        type: DataTypes.INTEGER,
        references: {
          model: "TestDrive",
          key: "TestDriveID",
        },
      },
      AssignedBy: {
        type: DataTypes.INTEGER,
        references: {
          model: "UserMaster",
          key: "UserID",
        },
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
      ScheduleDate: {
        type: DataTypes.DATEONLY,
      },
      ScheduleTime: {
        type: DataTypes.TIME,
      },
      TripStartTime: {
        type: DataTypes.DATE,
      },
      OdometerStartReading: {
        type: DataTypes.STRING(50),
      },
      TripEndTime: {
        type: DataTypes.DATE,
      },
      OdometerEndReading: {
        type: DataTypes.STRING(50),
      },
      Remarks: {
        type: DataTypes.STRING(225),
      },
      AllotStatus: {
        type: DataTypes.ENUM,
        values: ["Assigned", "Rejected", "Cancelled", "Completed"],
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
      modelName: "TestDriveAllot",
      tableName: "TestDriveAllot", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );
  return TestDriveAllot;
};
