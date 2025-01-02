const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class CustomerMaster extends Model {}

  CustomerMaster.init(
    {
      CustomerID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      CustomerType: {
        type: DataTypes.ENUM,
        values: ["Individual", "Company"],
      },
      CustID: {
        type: DataTypes.STRING(25),
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
          len: [1, 255], // Length must be between 1 and 255 characters
        },
      },
      Occupation: {
        type: DataTypes.STRING(50),
      },
      Company: {
        type: DataTypes.STRING(100),
      },
      DateOfBirth: {
        type: DataTypes.DATEONLY,
      },
      DateOfAnniversary: {
        type: DataTypes.DATEONLY,
      },
      Address: {
        type: DataTypes.STRING(255),
      },
      Gender: {
        type: DataTypes.ENUM,
        values: ["Male", "Female", "Others"],
      },
      RelationName: {
        type: DataTypes.STRING(50),
      },
      RelationType: {
        type: DataTypes.ENUM,
        values: [
          "Father",
          "Mother",
          "Spouse",
          "Guardian",
          "C/O",
          "Representative",
        ],
      },
      // District: {
      //   type: DataTypes.STRING(100),
      // },
      // State: {
      //   type: DataTypes.STRING(50),
      // },
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
      PINCode: {
        type: DataTypes.STRING(6),
      },
      ModelName: {
        type: DataTypes.STRING(100),
      },
      VariantName: {
        type: DataTypes.STRING(100),
      },
      FuelType: {
        type: DataTypes.STRING(50),
      },
      ColourName: {
        type: DataTypes.STRING(50),
      },
      Transmission: {
        type: DataTypes.STRING(50),
      },
      // ModelID: {
      //   type: DataTypes.INTEGER,
      //   references: {
      //     model: "ModelMaster", // This is the name of the referenced model
      //     key: "ModelMasterID", // This is the name of the referenced column
      //   },
      // },
      // VariantID: {
      //   type: DataTypes.INTEGER,
      //   references: {
      //     model: "VariantMaster", // This is the name of the referenced model
      //     key: "VariantID", // This is the name of the referenced column
      //   },
      // },
      // FuelTypeID: {
      //   type: DataTypes.INTEGER,
      //   references: {
      //     model: "FuelType", // This is the name of the referenced model
      //     key: "FuelTypeID", // This is the name of the referenced column
      //   },
      // },
      // ColourID: {
      //   type: DataTypes.INTEGER,
      //   references: {
      //     model: "ColourMaster", // This is the name of the referenced model
      //     key: "ColourID", // This is the name of the referenced column
      //   },
      // },
      AadharNo: {
        type: DataTypes.STRING(25),
      },
      PANNo: {
        type: DataTypes.STRING(25),
      },
      DrivingLicence: {
        type: DataTypes.STRING(25),
      },
      // GSTIN: {
      //   type: DataTypes.STRING(25),
      // },
      // GstType: {
      //   type: DataTypes.STRING(50),
      // },
      AccountHolderName: {
        type: DataTypes.STRING(100),
      },
      AccountNo: {
        type: DataTypes.STRING(25),
      },
      IFSCCode: {
        type: DataTypes.STRING(25),
      },
      // Bank: {
      //   type: DataTypes.STRING(50),
      // },
      BankID: {
        type: DataTypes.INTEGER,
        // references: {
        //   model: "BankMaster", // This is the name of the referenced model
        //   key: "BankID", // This is the name of the referenced column
        // },
      },
      MSMEID: {
        type: DataTypes.INTEGER,
        references: {
          model: "MSMEInfo", // This is the name of the referenced model
          key: "MSMEID", // This is the name of the referenced column
        },
      },
      BranchDetails: {
        type: DataTypes.STRING(100),
      },
      IsActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      KycStatus: {
        type: DataTypes.ENUM,
        values: ["Pending", "Partial", "Full-KYC", "Re-Upload"],
        defaultValue: "Pending",
      },
      DocStatus: {
        type: DataTypes.ENUM,
        values: ["Pending", "Partial", "Approved"],
        defaultValue: "Pending",
      },
      CustomerStatus: {
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
      modelName: "CustomerMaster",
      tableName: "CustomerMaster", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return CustomerMaster;
};
