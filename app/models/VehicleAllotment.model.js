const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class VehicleAllotment extends Model {}

  VehicleAllotment.init(
    {
      // ID Fields
      AllotmentReqID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      ReqNo: {
        type: DataTypes.STRING(100), //  Generate Number
      },
      ReqDate: {
        type: DataTypes.DATE,
      },
      OnRoadPrice: {
        type: DataTypes.DOUBLE,
      },
      BookingID: {
        type: DataTypes.INTEGER, // Mandatory
        allowNull: false,
        references: {
          model: "NewCarBookings", // Name of the referenced model
          key: "BookingID", // Primary key in the referenced model
        },
      },
      CustomerID: {
        type: DataTypes.INTEGER, // Mandatory
        allowNull: false,
        references: {
          model: "CustomerMaster", // Name of the referenced model
          key: "CustomerID", // Primary key in the referenced model
        },
      },
      ModelMasterID: {
        type: DataTypes.INTEGER,
        references: {
          model: "ModelMaster", // Name of the referenced model
          key: "ModelMasterID", // Primary key in the referenced model
        },
      },
      VariantID: {
        type: DataTypes.INTEGER,
        references: {
          model: "VariantMaster", // Name of the referenced model
          key: "VariantID", // Primary key in the referenced model
        },
      },
      ColourID: {
        type: DataTypes.INTEGER,
        references: {
          model: "ColourMaster", // Name of the referenced model
          key: "ColourID", // Primary key in the referenced model
        },
      },
      FuelTypeID: {
        type: DataTypes.INTEGER,
        references: {
          model: "FuelType", // Name of the referenced model
          key: "FuelTypeID", // Primary key in the referenced model
        },
      },
      TransmissionID: {
        type: DataTypes.INTEGER,
        references: {
          model: "Transmission", // Name of the referenced model
          key: "TransmissionID", // Primary key in the referenced model
        },
      },
      BranchID: {
        type: DataTypes.INTEGER,
        references: {
          model: "BranchMaster", // Name of the referenced model
          key: "BranchID", // Primary key in the referenced model
        },
      },
      SalesPersonID: {
        type: DataTypes.INTEGER,
        references: {
          model: "UserMaster", // Name of the referenced model
          key: "UserID", // Primary key in the referenced model
        },
      },
      TeamLeadID: {
        type: DataTypes.INTEGER,
        references: {
          model: "UserMaster", // Name of the referenced model
          key: "UserID", // Primary key in the referenced model
        },
      },
      PurchaseID: {
        type: DataTypes.INTEGER,
        references: {
          model: "VehicleStock", // Name of the referenced model
          key: "PurchaseID", // Primary key in the referenced model
        },
      },
      ExchangeID: {
        type: DataTypes.INTEGER,
      },
      FinanceLoanID: {
        type: DataTypes.INTEGER,
        references: {
          model: "FinanceLoanApplication", // Name of the referenced model
          key: "FinanceLoanID", // Primary key in the referenced model
        },
      },
      AllottedEmpID: {
        type: DataTypes.INTEGER,
        references: {
          model: "UserMaster", // Name of the referenced model
          key: "UserID", // Primary key in the referenced model
        },
      },
      RevokedEmpID: {
        type: DataTypes.INTEGER,
        references: {
          model: "UserMaster", // Name of the referenced model
          key: "UserID", // Primary key in the referenced model
        },
      },
      // General Information
      // BookingNo: {
      //   type: DataTypes.STRING(100),
      // },
      // VINNo: {
      //   type: DataTypes.STRING(100),
      // },
      VehicleChngReqID: {
        type: DataTypes.INTEGER,
        references: {
          model: "VehicleChangeRequest", // Name of the referenced model
          key: "VehicleChngReqID", // Primary key in the referenced model
        },
      },
      AllotmentValidFrom: {
        type: DataTypes.DATE,
      },
      AllotmentValidTill: {
        type: DataTypes.DATE,
      },
      FIFOPosition: {
        type: DataTypes.INTEGER,
      },
      PaymentReceived: {
        type: DataTypes.DECIMAL,
      },

      // Finance and Exchange Status
      // FinanceStatus: {
      //   type: DataTypes.STRING(100),
      // },
      // ExchangeStatus: {
      //   type: DataTypes.STRING(100),
      // },

      // Remarks
      Remarks: {
        type: DataTypes.STRING(255),
      },

      // Status and Active Fields
      AllotmentStatus: {
        type: DataTypes.ENUM,
        values: ["Pending", "Allotted", "Revoked", "Cancelled", "Invoiced"],
      },
      IsActive: {
        type: DataTypes.BOOLEAN,
      },
      Status: {
        type: DataTypes.STRING(100),
      },

      // Timestamps
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
      modelName: "VehicleAllotment",
      tableName: "VehicleAllotment", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return VehicleAllotment;
};
