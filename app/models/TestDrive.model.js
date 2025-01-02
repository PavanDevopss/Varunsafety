const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class TestDrive extends Model {}

  TestDrive.init(
    {
      TestDriveID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      RequestNo: {
        type: DataTypes.STRING,
      },
      CustomerID: {
        type: DataTypes.INTEGER,
        references: {
          model: "CustomerMaster", // This is the name of the referenced model
          key: "CustomerID", // This is the name of the referenced column
        },
      },
      UserID: {
        type: DataTypes.INTEGER,
        references: {
          model: "UserMaster", // This is the name of the referenced model
          key: "UserID", // This is the name of the referenced column
        },
      },
      BranchID: {
        type: DataTypes.INTEGER,
        references: {
          model: "BranchMaster", // This is the name of the referenced model
          key: "BranchID", // This is the name of the referenced column
        },
      },
      Title: {
        type: DataTypes.ENUM,
        values: ["Mr.", "Ms.", "M/s."],
      },
      FirstName: {
        type: DataTypes.STRING(100),
      },
      LastName: {
        type: DataTypes.STRING(100),
      },
      PhoneNo: {
        type: DataTypes.STRING(15),
      },
      Email: {
        type: DataTypes.STRING(50),
        // allowNull: false, // Field is required
        // unique: true, // Email must be unique
        validate: {
          isEmail: true, // Validates the string is in email format
          len: [1, 255], // Length must be between 1 and 255 characters
        },
      },
      Gender: {
        type: DataTypes.ENUM,
        values: ["Male", "Female", "Others"],
      },
      DateOfBirth: {
        type: DataTypes.DATEONLY,
      },
      Occupation: {
        type: DataTypes.STRING(50),
      },
      Address: {
        type: DataTypes.STRING(255),
      },
      OffAddress: {
        type: DataTypes.STRING(255),
      },
      PINCode: {
        type: DataTypes.STRING(6),
      },
      DistrictID: {
        type: DataTypes.INTEGER,
        references: {
          model: "RegionMaster", // This is the name of the referenced model
          key: "RegionID", // This is the name of the referenced column
        },
      },
      StateID: {
        type: DataTypes.INTEGER,
        references: {
          model: "StateMaster", // This is the name of the referenced model
          key: "StateID", // This is the name of the referenced column
        },
      },
      AadharNumber: {
        type: DataTypes.STRING(100),
      },
      ModelMasterID: {
        type: DataTypes.INTEGER,
        references: {
          model: "ModelMaster", // This is the name of the referenced model
          key: "ModelMasterID", // This is the name of the referenced column
        },
      },
      FuelTypeID: {
        type: DataTypes.INTEGER,
        references: {
          model: "FuelType", // This is the name of the referenced model
          key: "FuelTypeID", // This is the name of the referenced column
        },
      },
      TransmissionID: {
        type: DataTypes.INTEGER,
        references: {
          model: "Transmission", // This is the name of the referenced model
          key: "TransmissionID", // This is the name of the referenced column
        },
      },
      DemoEmpID: {
        type: DataTypes.STRING(100),
        // references: {
        //   model: "UserMaster", // This is the name of the referenced model
        //   key: "UserID", // This is the name of the referenced column
        // },
      },
      DemoName: {
        type: DataTypes.STRING(100),
      },
      TestDriveBy: {
        type: DataTypes.ENUM,
        values: ["Customer", "Relative", "Emp"],
      },
      TestDriveEmpID: {
        type: DataTypes.INTEGER,
        references: {
          model: "UserMaster", // This is the name of the referenced model
          key: "UserID", // This is the name of the referenced column
        },
      },
      TestDriveName: {
        type: DataTypes.STRING(100),
      },
      DrivingLicense: {
        type: DataTypes.STRING(100),
      },
      RequestStatus: {
        type: DataTypes.ENUM,
        values: [
          "Pending",
          "Requested",
          "Assigned",
          "Rejected",
          "Cancelled",
          "Completed",
        ],
        defaultValue: "Pending",
      },
      RequestedBy: {
        type: DataTypes.INTEGER,
        references: {
          model: "UserMaster", // This is the name of the referenced model
          key: "UserID", // This is the name of the referenced column
        },
      },
      AssignedBy: {
        type: DataTypes.INTEGER,
        references: {
          model: "UserMaster", // This is the name of the referenced model
          key: "UserID", // This is the name of the referenced column
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
      },
    },
    {
      sequelize,
      modelName: "TestDrive",
      tableName: "TestDrive", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return TestDrive;
};
