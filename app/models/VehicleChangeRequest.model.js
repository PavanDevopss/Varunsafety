const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class VehicleChangeRequest extends Model {}

  VehicleChangeRequest.init(
    {
      // ID Fields
      VehicleChngReqID: {
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
      FinanceLoanID: {
        type: DataTypes.INTEGER,
        references: {
          model: "FinanceLoanApplication", // Name of the referenced model
          key: "FinanceLoanID", // Primary key in the referenced model
        },
      },
      ApprovedEmpID: {
        type: DataTypes.INTEGER,
        references: {
          model: "UserMaster", // Name of the referenced model
          key: "UserID", // Primary key in the referenced model
        },
      },
      CancelledEmpID: {
        type: DataTypes.INTEGER,
        references: {
          model: "UserMaster", // Name of the referenced model
          key: "UserID", // Primary key in the referenced model
        },
      },
      // Remarks
      Remarks: {
        type: DataTypes.STRING(255),
      },
      // Status and Active Fields
      ChangeStatus: {
        type: DataTypes.ENUM,
        values: ["Pending", "Approved", "Rejected", "Cancelled"],
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
      modelName: "VehicleChangeRequest",
      tableName: "VehicleChangeRequest", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return VehicleChangeRequest;
};
