const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class NewCarBookings extends Model {}

  NewCarBookings.init(
    {
      BookingID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      BookingNo: {
        type: DataTypes.STRING(50),
      },
      CustomerID: {
        type: DataTypes.INTEGER, //foreign key refering to customer master
        references: {
          model: "CustomerMaster", // Name of the referenced model
          key: "CustomerID", // Primary key in the referenced model
        },
        onUpdate: "CASCADE",
        onDelete: "NO ACTION", // or 'CASCADE' or 'SET NULL' as per your requirement
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
      OfficeNo: {
        type: DataTypes.STRING(15),
      },
      Email: {
        type: DataTypes.STRING(50),
        // allowNull: false, // Field is required
        // unique: true, // Email must be unique
        validate: {
          isEmail: true, // Validates the string is in email format
          len: [1, 50], // Length must be between 1 and 255 characters
        },
      },
      Gender: {
        type: DataTypes.ENUM,
        values: ["Male", "Female", "Others"],
      },
      DOB: {
        type: DataTypes.DATEONLY,
      },
      DateOfAnniversary: {
        type: DataTypes.DATEONLY,
      },
      Occupation: {
        type: DataTypes.STRING,
      },
      Company: {
        type: DataTypes.STRING,
      },
      Address: {
        type: DataTypes.STRING(255),
      },
      PINCode: {
        type: DataTypes.STRING(25),
      },
      District: {
        type: DataTypes.STRING(50),
      },
      State: {
        type: DataTypes.STRING(50),
      },
      // ModelID: {
      //   type: DataTypes.INTEGER, //foreign key refering to model master
      //   references: {
      //     model: "ModelMaster", // Name of the referenced model
      //     key: "ModelMasterID", // Primary key in the referenced model
      //   },
      //   onUpdate: "CASCADE",
      //   onDelete: "NO ACTION", // or 'CASCADE' or 'SET NULL' as per your requirement
      // },
      // ColourID: {
      //   type: DataTypes.INTEGER, //foreign key refering to colour master
      //   references: {
      //     model: "ColourMaster", // Name of the referenced model
      //     key: "ColourID", // Primary key in the referenced model
      //   },
      //   onUpdate: "CASCADE",
      //   onDelete: "NO ACTION", // or 'CASCADE' or 'SET NULL' as per your requirement
      // },
      // VariantID: {
      //   type: DataTypes.INTEGER, //foreign key refering to variant master
      //   references: {
      //     model: "VariantMaster", // Name of the referenced model
      //     key: "VariantID", // Primary key in the referenced model
      //   },
      //   onUpdate: "CASCADE",
      //   onDelete: "NO ACTION", // or 'CASCADE' or 'SET NULL' as per your requirement
      // },
      // BranchID: {
      //   type: DataTypes.INTEGER, //foreign key refering to branch master / gets it from booking branch name
      //   references: {
      //     model: "BranchMaster", // Name of the referenced model
      //     key: "BranchID", // Primary key in the referenced model
      //   },
      //   onUpdate: "CASCADE",
      //   onDelete: "NO ACTION", // or 'CASCADE' or 'SET NULL' as per your requirement
      // },

      ModelName: {
        type: DataTypes.STRING(100),
      },
      ColourName: {
        type: DataTypes.STRING(100),
      },
      VariantName: {
        type: DataTypes.STRING(100),
      },
      Transmission: {
        type: DataTypes.STRING(100),
      },
      Fuel: {
        type: DataTypes.STRING(100),
      },
      BranchName: {
        type: DataTypes.STRING(100),
      },
      CorporateSchema: {
        type: DataTypes.BOOLEAN,
      },
      RegistrationType: {
        type: DataTypes.ENUM,
        values: ["Goods Carrier", "Private", "Commercial"],
      },
      Finance: {
        type: DataTypes.ENUM,
        values: ["In-House", "Direct", "Cash"],
      },
      Insurance: {
        type: DataTypes.ENUM,
        values: ["In-House", "Direct"],
      },
      Exchange: {
        type: DataTypes.BOOLEAN,
        // values: ["Yes", "No"],
      },
      SalesPersonID: {
        type: DataTypes.INTEGER,
        references: {
          model: "UserMaster", // Name of the referenced model
          key: "UserID", // Primary key in the referenced model
        },
        onUpdate: "CASCADE",
        onDelete: "NO ACTION", // or 'CASCADE' or 'SET NULL' as per your requirement
      },
      TeamLeadID: {
        type: DataTypes.INTEGER,
        references: {
          model: "UserMaster", // Name of the referenced model
          key: "UserID", // Primary key in the referenced model
        },
        onUpdate: "CASCADE",
        onDelete: "NO ACTION", // or 'CASCADE' or 'SET NULL' as per your requirement
      },
      BookingTime: {
        type: DataTypes.DATE,
      },
      BookingStatus: {
        type: DataTypes.ENUM,
        values: ["Pending", "Active", "Completed", "Cancelled", "Transferred"],
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
      modelName: "NewCarBookings",
      tableName: "NewCarBookings", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return NewCarBookings;
};
