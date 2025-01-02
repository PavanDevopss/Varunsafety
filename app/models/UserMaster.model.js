const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class usermaster extends Model {}

  usermaster.init(
    {
      UserID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      UserName: {
        type: DataTypes.STRING(100),
      },
      EmpID: {
        type: DataTypes.STRING,
        unique: true,
      },
      Email: {
        type: DataTypes.STRING(100),
        allowNull: true, // Field is required
        unique: true, // Email must be unique
        validate: {
          isEmail: true, // Validates the string is in email format
          len: [1, 100], // Length must be between 1 and 255 characters
        },
      },
      Mobile: {
        type: DataTypes.STRING(15),
      },
      Designation: {
        type: DataTypes.STRING(50),
      },
      MPIN: {
        type: DataTypes.STRING,
      },
      Password: {
        type: DataTypes.STRING,
        allowNull: true, // Field is required
        validate: {
          len: [8, 255], // Length must be between 8 and 255 characters
        },
      },
      UserStatus: {
        type: DataTypes.BOOLEAN,
      },
      RoleID: {
        type: DataTypes.STRING(50),
        // references: {
        //   model: "RoleMaster", // This is the name of the referenced model
        //   key: "RoleID", // This is the name of the referenced column
        // },
      },
      State: {
        type: DataTypes.STRING(100),
      },
      Region: {
        type: DataTypes.STRING(100),
      },
      City: {
        type: DataTypes.STRING(100),
      },
      Branch: {
        type: DataTypes.STRING(100),
      },
      BranchID: {
        type: DataTypes.INTEGER,
        references: {
          model: "BranchMaster", // This is the name of the referenced model
          key: "BranchID", // This is the name of the referenced column
        },
      },
      RegionID: {
        type: DataTypes.INTEGER,
        references: {
          model: "RegionMaster", // This is the name of the referenced model
          key: "RegionID", // This is the name of the referenced column
        },
      },
      DeptID: {
        type: DataTypes.INTEGER,
        references: {
          model: "DepartmentMaster", // This is the name of the referenced model
          key: "DeptID", // This is the name of the referenced column
        },
      },
      StateID: {
        type: DataTypes.INTEGER,
        references: {
          model: "StateMaster", // This is the name of the referenced model
          key: "StateID", // This is the name of the referenced column
        },
      },
      OEMID: {
        type: DataTypes.STRING(50),
      },
      DateOfJoining: {
        type: DataTypes.DATE,
      },
      DrivingLicense: {
        type: DataTypes.STRING(25),
      },
      Status: {
        type: DataTypes.STRING(25),
      },
      IsActive: {
        type: DataTypes.BOOLEAN,
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
      modelName: "usermaster",
      tableName: "UserMaster", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return usermaster;
};
