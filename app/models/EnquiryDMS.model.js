const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class EnquiryDMS extends Model {}

  EnquiryDMS.init(
    {
      EnquiryID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      Branch: {
        type: DataTypes.STRING(100),
      },
      EnquiryNo: {
        type: DataTypes.STRING(50),
        unique: true,
      },
      Date: {
        type: DataTypes.DATE,
      },
      TeamLeadName: {
        type: DataTypes.STRING(100),
      },
      DSECode: {
        type: DataTypes.STRING(50),
      },
      User: {
        type: DataTypes.STRING(100),
      },
      CustomerType: {
        type: DataTypes.STRING(50),
      },
      CompanyInstitution: {
        type: DataTypes.STRING(150),
      },
      SubCompany: {
        type: DataTypes.STRING(150),
      },
      Title: {
        type: DataTypes.STRING(50),
      },
      FirstName: {
        type: DataTypes.STRING(100),
      },
      Address: {
        type: DataTypes.STRING(255),
      },
      PINCode: {
        type: DataTypes.STRING(50),
      },
      PINDescription: {
        type: DataTypes.STRING(100),
      },
      STDCodeResPhNo: {
        type: DataTypes.STRING(50),
      },
      ResPhone: {
        type: DataTypes.STRING(15),
      },
      STDCodeOfficePhone: {
        type: DataTypes.STRING(50),
      },
      OfficePhone: {
        type: DataTypes.STRING(15),
      },
      // STDCode: {
      //     type: DataTypes.STRING
      // },
      MobileNo: {
        type: DataTypes.STRING(15),
      },
      STDCodeFAX: {
        type: DataTypes.STRING(50),
      },
      FAXNo: {
        type: DataTypes.STRING(50),
      },
      EmailID: {
        type: DataTypes.STRING(50),
        // allowNull: false, // Field is required
        // unique: true, // Email must be unique
        // validate: {
        //   isEmail: true, // Validates the string is in email format
        //   len: [1, 50], // Length must be between 1 and 255 characters
        // },
      },
      ModelCode: {
        type: DataTypes.STRING(50),
      },
      Model: {
        type: DataTypes.STRING(100),
      },
      FuelType: {
        type: DataTypes.STRING(50),
      },
      VariantCode: {
        type: DataTypes.STRING(50),
      },
      Variant: {
        type: DataTypes.STRING(100),
      },
      FinancierName: {
        type: DataTypes.STRING(100),
      },
      DSAName: {
        type: DataTypes.STRING(100),
      },
      EnquiryStatus: {
        type: DataTypes.STRING(50),
        defaultValue: "Active",
      },
      EnquiryStatusDate: {
        type: DataTypes.DATE,
      },
      Source: {
        type: DataTypes.STRING(150),
      },
      SubSource: {
        type: DataTypes.STRING(150),
      },
      BuyerType: {
        type: DataTypes.STRING(100),
      },
      TradeIn: {
        type: DataTypes.STRING(100),
      },
      Mode: {
        type: DataTypes.STRING(100),
      },
      LostorDropReason: {
        type: DataTypes.STRING(150),
      },
      FeedbackorRemarks: {
        type: DataTypes.STRING(150),
      },
      CustomerRequest: {
        type: DataTypes.STRING(100),
      },
      DateofBirth: {
        type: DataTypes.STRING(25),
      },
      DateofAnniversary: {
        type: DataTypes.STRING(25),
      },
      TestDriveGiven: {
        type: DataTypes.STRING(50),
      },
      TestDriveDate: {
        type: DataTypes.DATE,
      },
      FvisitDate: {
        type: DataTypes.DATE,
      },
      Ageing: {
        type: DataTypes.STRING(50),
      },
      DealerName: {
        type: DataTypes.STRING(100),
      },
      BuyingNo: {
        type: DataTypes.STRING(50),
      },
      EvaluatorName: {
        type: DataTypes.STRING(100),
      },
      EvaluatorMSPIN: {
        type: DataTypes.STRING(50),
      },
      OldCarOwnerName: {
        type: DataTypes.STRING(150),
      },
      EvaluationDate: {
        type: DataTypes.DATE,
      },
      OldVehStatus: {
        type: DataTypes.STRING(50),
      },
      RefPrice: {
        type: DataTypes.STRING(50),
      },
      ReOfferedPrice: {
        type: DataTypes.STRING(50),
      },
      CustomerExpPrice: {
        type: DataTypes.STRING(50),
      },
      LatestOfferedPrice: {
        type: DataTypes.STRING(50),
      },
      BoughtDate: {
        type: DataTypes.STRING(50),
      },
      LostToPOC: {
        type: DataTypes.STRING(100),
      },
      ReferenceType: {
        type: DataTypes.STRING(100),
      },
      ReferredBy: {
        type: DataTypes.STRING(100),
      },
      ReferenceNo: {
        type: DataTypes.STRING(50),
      },
      RefVehicleRegnNo: {
        type: DataTypes.STRING(100),
      },
      RefMobileNo: {
        type: DataTypes.STRING(50),
      },
      StateDesc: {
        type: DataTypes.STRING(100),
      },
      District: {
        type: DataTypes.STRING(100),
      },
      TehsilDesc: {
        type: DataTypes.STRING(100),
      },
      VillageName: {
        type: DataTypes.STRING(100),
      },
      EnquiryStrength: {
        type: DataTypes.STRING(100),
      },
      Tenure: {
        type: DataTypes.STRING(50),
      },
      Registrationtype: {
        type: DataTypes.STRING(100),
      },
      Price: {
        type: DataTypes.STRING(50),
      },
      Leasecompany: {
        type: DataTypes.STRING(100),
      },
      Colour: {
        type: DataTypes.STRING(50),
      },
      Transmission: {
        type: DataTypes.STRING(50),
      },
    },

    {
      sequelize,
      modelName: "EnquiryDMS",
      tableName: "EnquiryDMS", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return EnquiryDMS;
};
