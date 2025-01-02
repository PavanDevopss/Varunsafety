/* eslint-disable no-unused-vars */
const db = require("../models");
const VehicleAllotment = db.vehicleallotment;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;
const NewCarBookings = db.NewCarBookings;
const CustomerMaster = db.customermaster;
const ModelMaster = db.modelmaster;
const VariantMaster = db.variantmaster;
const ColourMaster = db.colourmaster;
const FuelType = db.fueltypes;
const Transmission = db.transmission;
const BranchMaster = db.branchmaster;
const UserMaster = db.usermaster;
const VehicleStock = db.vehiclestock;
const FinanceLoanApplication = db.financeloanapplication;
const FinanceApplication = db.financeapplication;
const FinanceStatusUpdate = db.finstatusupdate;
const FinanceMaster = db.financemaster;
const PaymentRequest = db.PaymentRequests;
const CustomerReceipts = db.CustReceipt;
const FinStatusTracking = db.finstatustracking;
const VehicleChangeRequest = db.vehiclechangereq;
const {
  generateAllotReqNo,
  genVehicleChangeReqNo,
} = require("../Utils/generateService");
// Basic CRUD API
// Create and Save a new VehicleAllotment
exports.create = async (req, res) => {
  console.log("Request Data:", req.body);

  // Validate request
  try {
    // Check if BookingID already exists
    const existingRequest = await VehicleAllotment.findOne({
      where: { BookingID: req.body.BookingID },
    });
    if (existingRequest) {
      if (existingRequest.AllotmentStatus != "Cancelled") {
        return res.status(400).json({
          message: "Vehicle Allotment request already raised for this Booking!",
        });
      }
    }
    const existingBooking = await NewCarBookings.findOne({
      where: { BookingID: req.body.BookingID },
    });

    let newVehicleAllotment = null;

    if (
      existingBooking.ModelName == req.body.ModelName &&
      existingBooking.ColourName == req.body.ColourName &&
      existingBooking.VariantName == req.body.VariantName
    ) {
      const genReqNo = await generateAllotReqNo();

      // Prepare the data for VehicleAllotment creation
      const vehicleAllotmentData = {
        ReqNo: genReqNo || req.body.ReqNo,
        ReqDate: req.body.ReqDate || new Date(),
        OnRoadPrice: req.body.OnRoadPrice,
        BookingID: req.body.BookingID,
        CustomerID: req.body.CustomerID,
        ModelMasterID: req.body.ModelMasterID,
        VariantID: req.body.VariantID,
        ColourID: req.body.ColourID,
        FuelTypeID: req.body.FuelTypeID,
        TransmissionID: req.body.TransmissionID,
        BranchID: req.body.BranchID,
        SalesPersonID: req.body.SalesPersonID,
        TeamLeadID: req.body.TeamLeadID,
        PurchaseID: req.body.PurchaseID,
        ExchangeID: req.body.ExchangeID,
        FinanceLoanID: req.body.FinanceLoanID,
        AllotmentValidFrom: req.body.AllotmentValidFrom,
        AllotmentValidTill: req.body.AllotmentValidTill,
        FIFOPosition: req.body.FIFOPosition,
        PaymentReceived: req.body.PaymentReceived,
        Remarks: req.body.Remarks,
        AllotmentStatus: req.body.AllotmentStatus || "Pending",
        IsActive: req.body.IsActive || true,
        Status: req.body.Status || "Active",
      };

      // Save VehicleAllotment to the database
      newVehicleAllotment = await VehicleAllotment.create(vehicleAllotmentData);
    } else {
      const genChangeReqNo = await genVehicleChangeReqNo();
      // console.log("genereated Number: ", genChangeReqNo);

      const vehicleAllotmentData = {
        ReqNo: genChangeReqNo || req.body.ReqNo,
        ReqDate: req.body.ReqDate || new Date(),
        BookingID: req.body.BookingID,
        CustomerID: req.body.CustomerID,
        ModelMasterID: req.body.ModelMasterID,
        VariantID: req.body.VariantID,
        ColourID: req.body.ColourID,
        FuelTypeID: req.body.FuelTypeID,
        TransmissionID: req.body.TransmissionID,
        BranchID: req.body.BranchID,
        SalesPersonID: req.body.SalesPersonID,
        TeamLeadID: req.body.TeamLeadID,
        FinanceLoanID: req.body.FinanceLoanID,
        // ApprovedEmpID: req.body.ApprovedEmpID,
        Remarks: req.body.Remarks,
        ChangeStatus: req.body.ChangeStatus || "Pending",
        IsActive: req.body.IsActive || true,
        Status: req.body.Status || "Active",
      };

      // Save VehicleAllotment to the database
      newVehicleAllotment = await VehicleChangeRequest.create(
        vehicleAllotmentData
      );
    }

    return res.status(201).json(newVehicleAllotment); // Return newly created VehicleAllotment
  } catch (err) {
    // Handle errors based on specific types
    if (err.name === "SequelizeValidationError") {
      return res.status(400).json({
        message: "Validation error",
        details: err.errors.map((e) => e.message),
      });
    }

    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        message: "Unique constraint error",
        details: err.errors.map((e) => e.message),
      });
    }

    if (err.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message: "Database error occurred while creating VehicleAllotment.",
        details: err.message,
      });
    }

    if (err.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: err.message,
      });
    }

    console.error("Error creating VehicleAllotment:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// exports.create = async (req, res) => {
//   console.log("Request Data:", req.body);

//   // Validate request
//   try {
//     // Check if BookingID already exists
//     const existingBooking = await VehicleAllotment.findOne({
//       where: { BookingID: req.body.BookingID },
//     });
//     if (existingBooking) {
//       return res.status(400).json({
//         message: "Vehicle Allotment request already raised for this Booking!",
//       });
//     }
//     const genReqNo = generateAllotReqNo();
//     // Prepare the data for VehicleAllotment creation
//     const vehicleAllotmentData = {
//       ReqNo: genReqNo || req.body.ReqNo,
//       ReqDate: req.body.ReqDate || new Date(),
//       OnRoadPrice: req.body.OnRoadPrice,
//       BookingID: req.body.BookingID,
//       CustomerID: req.body.CustomerID,
//       ModelMasterID: req.body.ModelMasterID,
//       VariantID: req.body.VariantID,
//       ColourID: req.body.ColourID,
//       FuelTypeID: req.body.FuelTypeID,
//       TransmissionID: req.body.TransmissionID,
//       BranchID: req.body.BranchID,
//       SalesPersonID: req.body.SalesPersonID,
//       TeamLeadID: req.body.TeamLeadID,
//       PurchaseID: req.body.PurchaseID,
//       ExchangeID: req.body.ExchangeID,
//       FinanceLoanID: req.body.FinanceLoanID,
//       AllotmentValidFrom: req.body.AllotmentValidFrom,
//       AllotmentValidTill: req.body.AllotmentValidTill,
//       FIFOPosition: req.body.FIFOPosition,
//       PaymentReceived: req.body.PaymentReceived,
//       Remarks: req.body.Remarks,
//       AllotmentStatus: req.body.AllotmentStatus || "Pending",
//       IsActive: req.body.IsActive || true,
//       Status: req.body.Status || "Active",
//     };

//     // Save VehicleAllotment to the database
//     const newVehicleAllotment = await VehicleAllotment.create(
//       vehicleAllotmentData
//     );

//     return res.status(201).json(newVehicleAllotment); // Return newly created VehicleAllotment
//   } catch (err) {
//     // Handle errors based on specific types
//     if (err.name === "SequelizeValidationError") {
//       return res.status(400).json({
//         message: "Validation error",
//         details: err.errors.map((e) => e.message),
//       });
//     }

//     if (err.name === "SequelizeUniqueConstraintError") {
//       return res.status(400).json({
//         message: "Unique constraint error",
//         details: err.errors.map((e) => e.message),
//       });
//     }

//     if (err.name === "SequelizeDatabaseError") {
//       return res.status(500).json({
//         message: "Database error occurred while creating VehicleAllotment.",
//         details: err.message,
//       });
//     }

//     if (err.name === "SequelizeConnectionError") {
//       return res.status(503).json({
//         message: "Service unavailable. Unable to connect to the database.",
//         details: err.message,
//       });
//     }

//     console.error("Error creating VehicleAllotment:", err);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };
// Retrieve all VehicleAllotment from the database.
exports.findAll = async (req, res) => {
  try {
    const regionID = req.query.RegionID;
    if (!regionID) {
      return res.status(400).send({
        message: "regionID is required to get Allotment List.",
      });
    }
    console.log("region Id: ", regionID);

    const branchesInRegion = await BranchMaster.findAll({
      where: { RegionID: regionID },
      attributes: ["BranchID", "BranchCode", "RegionID"],
    });

    const extractedBranchIDs = branchesInRegion.map((id) => id.BranchID);
    console.log("Branch Ids: ", extractedBranchIDs);
    // Fetch all vehicle allotment data with related data from other models (e.g., Booking, Customer, etc.)
    const vehicleAllotmentData = await VehicleAllotment.findAll({
      where: { BranchID: extractedBranchIDs },
      attributes: [
        "AllotmentReqID",
        "ReqNo",
        "ReqDate",
        "OnRoadPrice",
        "BookingID",
        "CustomerID",
        "ModelMasterID",
        "VariantID",
        "ColourID",
        "FuelTypeID",
        "TransmissionID",
        "BranchID",
        "SalesPersonID",
        "TeamLeadID",
        "PurchaseID",
        "ExchangeID",
        "FinanceLoanID",
        "AllotmentValidFrom",
        "AllotmentValidTill",
        "FIFOPosition",
        "PaymentReceived",
        "Remarks",
        "AllotmentStatus",
        "IsActive",
        "Status",
        "CreatedDate",
        "ModifiedDate",
      ],
      include: [
        {
          model: NewCarBookings, // Assuming the related model name is Booking
          as: "AllotBookingID",
          attributes: [
            "BookingID",
            "BookingNo",
            "FirstName",
            "LastName",
            "PhoneNo",
          ], // Include relevant fields from Booking
        },
        {
          model: CustomerMaster,
          as: "AllotCustomerID",
          attributes: ["FirstName", "Email"], // Example fields
        },
        {
          model: ModelMaster,
          as: "AllotModelMasterID",
          attributes: ["ModelMasterID", "ModelDescription"], // Example fields
        },
        {
          model: VariantMaster,
          as: "AllotVariantID",
          attributes: ["VariantID", "VariantCode"], // Example fields
        },
        {
          model: ColourMaster,
          as: "AllotColourID",
          attributes: ["ColourID", "ColourDescription"], // Example fields
        },
        {
          model: FuelType,
          as: "AllotFuelTypeID",
          attributes: ["FuelTypeID", "FuelTypeName"], // Example fields
        },
        {
          model: Transmission,
          as: "AllotTransmissionID",
          attributes: ["TransmissionID", "TransmissionCode"], // Example fields
        },
        {
          model: BranchMaster,
          as: "AllotBranchID",
          attributes: ["BranchID", "BranchName"], // Example fields
        },
        {
          model: UserMaster,
          as: "AllotSPID",
          attributes: ["UserID", "UserName", "EmpID"], // Example fields for sales person
        },
        {
          model: UserMaster,
          as: "AllotTLID",
          attributes: ["UserID", "UserName", "EmpID"], // Example fields for team lead
        },
        {
          model: UserMaster,
          as: "AllotEmpID",
          attributes: ["UserID", "UserName", "EmpID"], // Example fields for team lead
        },
        {
          model: VehicleStock,
          as: "AllotPurchaseID",
          attributes: ["PurchaseID", "EngineNo"], // Example fields
        },
        {
          model: FinanceLoanApplication,
          as: "AllotFinanceLoanID",
          attributes: ["FinanceLoanID", "Category", "SanctionAmount"], // Example fields
        },
      ],
      order: [["ReqDate", "DESC"]], // Order by ReqDate in ascending order
    });

    // Check if data is empty
    if (!vehicleAllotmentData || vehicleAllotmentData.length === 0) {
      return res.status(404).json({
        message: "No vehicle allotment data found.",
      });
    }

    // Map the data for response, combining relevant fields from related models
    const combinedData = vehicleAllotmentData.map((item) => ({
      AllotmentReqID: item.AllotmentReqID,
      ReqNo: item.ReqNo,
      ReqDate: item.ReqDate,
      OnRoadPrice: item.OnRoadPrice,
      BookingID: item.BookingID,
      CustomerID: item.CustomerID,
      ModelMasterID: item.ModelMasterID,
      VariantID: item.VariantID,
      ColourID: item.ColourID,
      FuelTypeID: item.FuelTypeID,
      TransmissionID: item.TransmissionID,
      BranchID: item.BranchID,
      SalesPersonID: item.SalesPersonID,
      TeamLeadID: item.TeamLeadID,
      PurchaseID: item.PurchaseID,
      ExchangeID: item.ExchangeID,
      FinanceLoanID: item.FinanceLoanID,
      AllotmentValidFrom: item.AllotmentValidFrom,
      AllotmentValidTill: item.AllotmentValidTill,
      FIFOPosition: item.FIFOPosition,
      PaymentReceived: item.PaymentReceived,
      Remarks: item.Remarks,
      IsActive: item.IsActive,
      Status: item.Status,
      CreatedDate: item.CreatedDate,
      ModifiedDate: item.ModifiedDate,
      BookingNo: item.AllotBookingID ? item.AllotBookingID.BookingNo : null,
      CustFirstName: item.AllotBookingID ? item.AllotBookingID.FirstName : null,
      CustLastName: item.AllotBookingID ? item.AllotBookingID.LastName : null,
      CustPhoneNo: item.AllotBookingID ? item.AllotBookingID.PhoneNo : null,
      CustEmail: item.AllotCustomerID ? item.AllotCustomerID.Email : null,
      ModelName: item.AllotModelMasterID
        ? item.AllotModelMasterID.ModelDescription
        : null,
      VariantCode: item.AllotVariantID ? item.AllotVariantID.VariantCode : null,
      ColourName: item.AllotColourID
        ? item.AllotColourID.ColourDescription
        : null,
      FuelTypeName: item.AllotFuelTypeID
        ? item.AllotFuelTypeID.FuelTypeName
        : null,
      TransmissionCode: item.AllotTransmissionID
        ? item.AllotTransmissionID.TransmissionCode
        : null,
      BranchName: item.AllotBranchID ? item.AllotBranchID.BranchName : null,
      SalesPersonName: item.AllotSPID ? item.AllotSPID.UserName : null,
      SalesPersonEmpID: item.AllotSPID ? item.AllotSPID.EmpID : null,
      TeamLeadName: item.AllotTLID ? item.AllotTLID.UserName : null,
      TeamLeadEmpID: item.AllotTLID ? item.AllotTLID.EmpID : null,
      PurchaseNo: item.AllotPurchaseID ? item.AllotPurchaseID.PurchaseID : null,
      EngineNo: item.AllotPurchaseID ? item.AllotPurchaseID.EngineNo : null,
      Category: item.AllotFinanceLoanID
        ? item.AllotFinanceLoanID.Category
        : null,
      SanctionAmount: item.AllotFinanceLoanID
        ? item.AllotFinanceLoanID.SanctionAmount
        : null,
      AllotmentStatus: item.AllotmentStatus,
    }));

    // Send the combined data as response
    res.json(combinedData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message:
          "Database error occurred while retrieving vehicle allotment data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      // Handle connection errors
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    console.error("Error retrieving vehicle allotment data:", error);
    res.status(500).json({
      message:
        "Failed to retrieve vehicle allotment data. Please try again later.",
    });
  }
};

// Find a single VehicleAllotment with an id
exports.findOne = async (req, res) => {
  try {
    // Fetch a single vehicle allotment record by its AllotmentReqID with related data from other models
    const vehicleAllotmentData = await VehicleAllotment.findOne({
      where: { AllotmentReqID: req.params.id }, // Find the record by AllotmentReqID (from the URL parameter)
      attributes: [
        "AllotmentReqID",
        "ReqNo",
        "ReqDate",
        "OnRoadPrice",
        "BookingID",
        "CustomerID",
        "ModelMasterID",
        "VariantID",
        "ColourID",
        "FuelTypeID",
        "TransmissionID",
        "BranchID",
        "SalesPersonID",
        "TeamLeadID",
        "PurchaseID",
        "ExchangeID",
        "FinanceLoanID",
        "AllotmentValidFrom",
        "AllotmentValidTill",
        "FIFOPosition",
        "PaymentReceived",
        "Remarks",
        "AllotmentStatus",
        "IsActive",
        "Status",
        "CreatedDate",
        "ModifiedDate",
      ],
      include: [
        {
          model: NewCarBookings, // Related model for Booking
          as: "AllotBookingID",
          attributes: ["BookingNo"], // Include relevant fields from Booking
        },
        {
          model: CustomerMaster,
          as: "AllotCustomerID",
          attributes: ["FirstName", "Email"], // Include relevant fields from Customer
        },
        {
          model: ModelMaster,
          as: "AllotModelMasterID",
          attributes: ["ModelDescription"], // Include relevant fields from ModelMaster
        },
        {
          model: VariantMaster,
          as: "AllotVariantID",
          attributes: ["VariantCode"], // Include relevant fields from VariantMaster
        },
        {
          model: ColourMaster,
          as: "AllotColourID",
          attributes: ["ColourDescription"], // Include relevant fields from ColourMaster
        },
        {
          model: FuelType,
          as: "AllotFuelTypeID",
          attributes: ["FuelTypeName"], // Include relevant fields from FuelType
        },
        {
          model: Transmission,
          as: "AllotTransmissionID",
          attributes: ["TransmissionCode"], // Include relevant fields from Transmission
        },
        {
          model: BranchMaster,
          as: "AllotBranchID",
          attributes: ["BranchName"], // Include relevant fields from BranchMaster
        },
        {
          model: UserMaster,
          as: "AllotSPID",
          attributes: ["UserName", "EmpID"], // Include relevant fields from SalesPerson
        },
        {
          model: UserMaster,
          as: "AllotTLID",
          attributes: ["UserName", "EmpID"], // Include relevant fields from TeamLead
        },
        {
          model: VehicleStock,
          as: "AllotPurchaseID",
          attributes: ["PurchaseID", "EngineNo"], // Include relevant fields from VehicleStock
        },
        {
          model: FinanceLoanApplication,
          as: "AllotFinanceLoanID",
          attributes: ["Category", "SanctionAmount"], // Include relevant fields from FinanceLoanApplication
        },
      ],
    });

    // Check if data is not found
    if (!vehicleAllotmentData) {
      return res.status(404).json({
        message: "Vehicle allotment data not found.",
      });
    }

    // Map the data for response, combining relevant fields from related models
    const combinedData = {
      AllotmentReqID: vehicleAllotmentData.AllotmentReqID,
      ReqNo: vehicleAllotmentData.ReqNo,
      ReqDate: vehicleAllotmentData.ReqDate,
      OnRoadPrice: vehicleAllotmentData.OnRoadPrice,
      BookingID: vehicleAllotmentData.BookingID,
      CustomerID: vehicleAllotmentData.CustomerID,
      ModelMasterID: vehicleAllotmentData.ModelMasterID,
      VariantID: vehicleAllotmentData.VariantID,
      ColourID: vehicleAllotmentData.ColourID,
      FuelTypeID: vehicleAllotmentData.FuelTypeID,
      TransmissionID: vehicleAllotmentData.TransmissionID,
      BranchID: vehicleAllotmentData.BranchID,
      SalesPersonID: vehicleAllotmentData.SalesPersonID,
      TeamLeadID: vehicleAllotmentData.TeamLeadID,
      PurchaseID: vehicleAllotmentData.PurchaseID,
      ExchangeID: vehicleAllotmentData.ExchangeID,
      FinanceLoanID: vehicleAllotmentData.FinanceLoanID,
      AllotmentValidFrom: vehicleAllotmentData.AllotmentValidFrom,
      AllotmentValidTill: vehicleAllotmentData.AllotmentValidTill,
      FIFOPosition: vehicleAllotmentData.FIFOPosition,
      PaymentReceived: vehicleAllotmentData.PaymentReceived,
      Remarks: vehicleAllotmentData.Remarks,
      AllotmentStatus: vehicleAllotmentData.AllotmentStatus,
      IsActive: vehicleAllotmentData.IsActive,
      Status: vehicleAllotmentData.Status,
      CreatedDate: vehicleAllotmentData.CreatedDate,
      ModifiedDate: vehicleAllotmentData.ModifiedDate,
      // Combine relevant data from the included models
      BookingNo: vehicleAllotmentData.AllotBookingID
        ? vehicleAllotmentData.AllotBookingID.BookingNo
        : null,
      CustomerName: vehicleAllotmentData.AllotCustomerID
        ? vehicleAllotmentData.AllotCustomerID.FirstName
        : null,
      CustomerEmail: vehicleAllotmentData.AllotCustomerID
        ? vehicleAllotmentData.AllotCustomerID.Email
        : null,
      ModelName: vehicleAllotmentData.AllotModelMasterID
        ? vehicleAllotmentData.AllotModelMasterID.ModelDescription
        : null,
      VariantCode: vehicleAllotmentData.AllotVariantID
        ? vehicleAllotmentData.AllotVariantID.VariantCode
        : null,
      ColourName: vehicleAllotmentData.AllotColourID
        ? vehicleAllotmentData.AllotColourID.ColourDescription
        : null,
      FuelTypeName: vehicleAllotmentData.AllotFuelTypeID
        ? vehicleAllotmentData.AllotFuelTypeID.FuelTypeName
        : null,
      TransmissionCode: vehicleAllotmentData.AllotTransmissionID
        ? vehicleAllotmentData.AllotTransmissionID.TransmissionCode
        : null,
      BranchName: vehicleAllotmentData.AllotBranchID
        ? vehicleAllotmentData.AllotBranchID.BranchName
        : null,
      SalesPersonName: vehicleAllotmentData.AllotSPID
        ? vehicleAllotmentData.AllotSPID.UserName
        : null,
      SalesPersonEmpID: vehicleAllotmentData.AllotSPID
        ? vehicleAllotmentData.AllotSPID.EmpID
        : null,
      TeamLeadName: vehicleAllotmentData.AllotTLID
        ? vehicleAllotmentData.AllotTLID.UserName
        : null,
      TeamLeadEmpID: vehicleAllotmentData.AllotTLID
        ? vehicleAllotmentData.AllotTLID.EmpID
        : null,
      PurchaseNo: vehicleAllotmentData.AllotPurchaseID
        ? vehicleAllotmentData.AllotPurchaseID.PurchaseID
        : null,
      EngineNo: vehicleAllotmentData.AllotPurchaseID
        ? vehicleAllotmentData.AllotPurchaseID.EngineNo
        : null,
      Category: vehicleAllotmentData.AllotFinanceLoanID
        ? vehicleAllotmentData.AllotFinanceLoanID.Category
        : null,
      SanctionAmount: vehicleAllotmentData.AllotFinanceLoanID
        ? vehicleAllotmentData.AllotFinanceLoanID.SanctionAmount
        : null,
    };

    // Send the combined data as a response
    res.json(combinedData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message:
          "Database error occurred while retrieving vehicle allotment data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      // Handle connection errors
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    console.error("Error retrieving vehicle allotment data:", error);
    res.status(500).json({
      message:
        "Failed to retrieve vehicle allotment data. Please try again later.",
    });
  }
};

// Update a VehicleAllotment by the id in the request
exports.updateByPk = async (req, res) => {
  const { id } = req.params; // The ID is passed in the URL parameter (AllotmentReqID)
  const {
    // ReqNo,
    // ReqDate,
    OnRoadPrice,
    // BookingID,
    // CustomerID,
    // ModelMasterID,
    // VariantID,
    // ColourID,
    // FuelTypeID,
    // TransmissionID,
    // BranchID,
    // SalesPersonID,
    // TeamLeadID,
    PurchaseID,
    // ExchangeID,
    // FinanceLoanID,
    AllotmentValidFrom,
    AllotmentValidTill,
    FIFOPosition,
    AllottedEmpID,
    // PaymentReceived,
    Remarks,
    AllotmentStatus,
    // IsActive,
    // Status,
    ModifiedDate, // Optional: Date when the record was modified
  } = req.body; // The new values to be updated

  try {
    // Fetch the record to check if it exists
    const vehicleAllotment = await VehicleAllotment.findByPk(id);

    if (!vehicleAllotment) {
      return res.status(404).json({
        message: "Vehicle allotment data not found.",
      });
    }

    // Update fields (only the fields passed in the request body)
    // vehicleAllotment.ReqNo = ReqNo || vehicleAllotment.ReqNo;
    // vehicleAllotment.ReqDate = ReqDate || vehicleAllotment.ReqDate;
    vehicleAllotment.OnRoadPrice = OnRoadPrice || vehicleAllotment.OnRoadPrice;
    // vehicleAllotment.BookingID = BookingID || vehicleAllotment.BookingID;
    // vehicleAllotment.CustomerID = CustomerID || vehicleAllotment.CustomerID;
    // vehicleAllotment.ModelMasterID =
    //   ModelMasterID || vehicleAllotment.ModelMasterID;
    // vehicleAllotment.VariantID = VariantID || vehicleAllotment.VariantID;
    // vehicleAllotment.ColourID = ColourID || vehicleAllotment.ColourID;
    // vehicleAllotment.FuelTypeID = FuelTypeID || vehicleAllotment.FuelTypeID;
    // vehicleAllotment.TransmissionID =
    // TransmissionID || vehicleAllotment.TransmissionID;
    // vehicleAllotment.BranchID = BranchID || vehicleAllotment.BranchID;
    // vehicleAllotment.SalesPersonID =
    // SalesPersonID || vehicleAllotment.SalesPersonID;
    // vehicleAllotment.TeamLeadID = TeamLeadID || vehicleAllotment.TeamLeadID;
    vehicleAllotment.AllottedEmpID =
      AllottedEmpID || vehicleAllotment.AllottedEmpID;
    vehicleAllotment.PurchaseID = PurchaseID || vehicleAllotment.PurchaseID;
    // vehicleAllotment.ExchangeID = ExchangeID || vehicleAllotment.ExchangeID;
    // vehicleAllotment.FinanceLoanID =
    // FinanceLoanID || vehicleAllotment.FinanceLoanID;
    vehicleAllotment.AllotmentValidFrom =
      AllotmentValidFrom || vehicleAllotment.AllotmentValidFrom;
    vehicleAllotment.AllotmentValidTill =
      AllotmentValidTill || vehicleAllotment.AllotmentValidTill;
    vehicleAllotment.FIFOPosition =
      FIFOPosition || vehicleAllotment.FIFOPosition;
    // vehicleAllotment.PaymentReceived =
    // PaymentReceived || vehicleAllotment.PaymentReceived;
    vehicleAllotment.Remarks = Remarks || vehicleAllotment.Remarks;
    vehicleAllotment.AllotmentStatus =
      AllotmentStatus || vehicleAllotment.AllotmentStatus;
    // vehicleAllotment.IsActive = IsActive ?? vehicleAllotment.IsActive;
    // vehicleAllotment.Status = Status || vehicleAllotment.Status;
    vehicleAllotment.ModifiedDate = ModifiedDate || new Date(); // Set to the current date if not provided

    // Save the updated record
    await vehicleAllotment.save();

    const updatedStockData = await VehicleStock.update(
      { Status: AllotmentStatus, ModifiedDate: new Date() },
      {
        where: { PurchaseID: PurchaseID },
      }
    );

    // Send back the updated record
    res.json({
      message: "Vehicle allotment data updated successfully.",
      updatedRecord: vehicleAllotment,
      updatedStock: updatedStockData,
    });
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message:
          "Database error occurred while updating vehicle allotment data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      // Handle connection errors
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    console.error("Error updating vehicle allotment data:", error);
    res.status(500).json({
      message:
        "Failed to update vehicle allotment data. Please try again later.",
    });
  }
};

// Delete a VehicleAllotment with the specified id in the request
exports.deleteById = async (req, res) => {
  const { id } = req.params; // The ID is passed in the URL parameter (AllotmentReqID)

  try {
    // Fetch the record to check if it exists
    const vehicleAllotment = await VehicleAllotment.findByPk(id);

    if (!vehicleAllotment) {
      return res.status(404).json({
        message: "Vehicle allotment data not found.",
      });
    }

    // Delete the record
    await vehicleAllotment.destroy();

    // Send back a success response
    res.json({
      message: "Vehicle allotment data deleted successfully.",
    });
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message:
          "Database error occurred while deleting vehicle allotment data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      // Handle connection errors
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    console.error("Error deleting vehicle allotment data:", error);
    res.status(500).json({
      message:
        "Failed to delete vehicle allotment data. Please try again later.",
    });
  }
};

exports.BookingsForAllotment = async (req, res) => {
  const userID = req.query.UserID;

  // Validate userID input
  if (!userID) {
    return res.status(400).send({ message: "UserID is required" });
  }

  try {
    // Fetch booking data
    const bookingData = await NewCarBookings.findAll({
      where: [{ SalesPersonID: userID }, { BookingStatus: "Active" }],
      include: [
        {
          model: UserMaster,
          as: "NCBSPUserID",
          attributes: ["UserName", "Branch"],
        },
      ],
      attributes: [
        "BookingID",
        "BookingNo",
        "CustomerID",
        "FirstName",
        "LastName",
        "PhoneNo",
        "ModelName",
        "ColourName",
        "VariantName",
        "Transmission",
        "Fuel",
        "BranchName",
        "SalesPersonID",
        "TeamLeadID",
        "BookingTime",
        "BookingStatus",
        "CreatedDate",
      ],
      order: [["CreatedDate", "ASC"]],
    });

    // Handle case where no bookings are found
    if (!bookingData || bookingData.length === 0) {
      console.log("Booking data not found");
      return res.status(404).send({ message: "Booking data not found" });
    }

    // Extract BookingIDs
    const bookingIDs = bookingData.map((booking) => booking.BookingID);

    // Fetch related vehicle allotment data
    const vehicleAllotmentData = await VehicleAllotment.findAll({
      where: { BookingID: bookingIDs },
      attributes: ["BookingID", "AllotmentStatus"],
    });

    // Fetch related vehicle allotment Change Request data
    const vehicleChangeReqData = await VehicleChangeRequest.findAll({
      where: { BookingID: bookingIDs },
      attributes: ["BookingID", "ChangeStatus"],
    });

    // Fetch related model, variant, color, fuel, and transmission data
    const modelsData = bookingData.map((model) => model.ModelName);
    const modelMasterData = await ModelMaster.findAll({
      where: { ModelDescription: modelsData },
      attributes: ["ModelMasterID", "ModelDescription", "ModelCode"],
    });

    const variantData = bookingData.map((variant) => variant.VariantName);
    const variantMasterData = await VariantMaster.findAll({
      where: { VariantCode: variantData },
      attributes: ["VariantID", "VariantCode"],
    });

    const colourData = bookingData.map((colour) => colour.ColourName);
    const colourMasterData = await ColourMaster.findAll({
      where: { ColourDescription: colourData },
      attributes: ["ColourID", "ColourDescription", "ColourCode"],
    });

    const fuelData = bookingData.map((fuel) => fuel.Fuel);
    const fuelMasterData = await FuelType.findAll({
      where: { FuelTypeName: fuelData },
      attributes: ["FuelTypeID", "FuelTypeName"],
    });

    const transmissionData = bookingData.map(
      (transmission) => transmission.Transmission
    );
    const transmissionMasterData = await Transmission.findAll({
      where: { TransmissionCode: transmissionData },
      attributes: ["TransmissionID", "TransmissionCode"],
    });

    const finData = await FinanceLoanApplication.findAll({
      where: { BookingID: bookingIDs },
      attributes: ["FinanceLoanID", "BookingID"],
    });

    // Create allotment map for quick lookup
    const allotmentMap = vehicleAllotmentData.reduce((acc, allotment) => {
      acc[allotment.BookingID] = allotment.AllotmentStatus;
      return acc;
    }, {});

    // Create change request map for quick lookup
    const changeReqMap = vehicleChangeReqData.reduce((acc, changeReq) => {
      acc[changeReq.BookingID] = changeReq.ChangeStatus;
      return acc;
    }, {});

    // Map over the booking data and enrich with master data IDs
    const updatedBookingData = bookingData.map((booking) => {
      let allotmentStatus;

      // Check for allotment status
      if (allotmentMap[booking.BookingID]) {
        allotmentStatus = allotmentMap[booking.BookingID]; // Use allotment status if it exists
      } else if (changeReqMap[booking.BookingID]) {
        allotmentStatus = "Approval Pending" || changeReqMap[booking.BookingID]; // Use change request status if allotment doesn't exist
      } else {
        allotmentStatus = "Not Requested"; // Set to "Not Requested" if neither exist
      }

      // Enrich booking data
      booking.dataValues.AllotmentStatus = allotmentStatus;

      // Find master data IDs based on exact matches
      const modelMaster = modelMasterData.find(
        (model) => model.ModelDescription === booking.ModelName
      );
      const variantMaster = variantMasterData.find(
        (variant) => variant.VariantCode === booking.VariantName
      );
      const colourMaster = colourMasterData.find(
        (colour) => colour.ColourDescription === booking.ColourName
      );
      const fuelMaster = fuelMasterData.find(
        (fuel) => fuel.FuelTypeName === booking.Fuel
      );
      const transmissionMaster = transmissionMasterData.find(
        (transmission) => transmission.TransmissionCode === booking.Transmission
      );
      const LoanData = finData.find(
        (LoanApp) => LoanApp.BookingID === booking.BookingID
      );

      // Enrich booking data with master IDs
      booking.dataValues.ModelMasterID = modelMaster
        ? modelMaster.ModelMasterID
        : null;
      booking.dataValues.ModelCode = modelMaster ? modelMaster.ModelCode : null;
      booking.dataValues.VariantID = variantMaster
        ? variantMaster.VariantID
        : null;
      booking.dataValues.ColourID = colourMaster ? colourMaster.ColourID : null;
      booking.dataValues.ColourCode = colourMaster
        ? colourMaster.ColourCode
        : null;
      booking.dataValues.FuelTypeID = fuelMaster ? fuelMaster.FuelTypeID : null;
      booking.dataValues.TransmissionID = transmissionMaster
        ? transmissionMaster.TransmissionID
        : null;
      booking.dataValues.FinanceLoanID = LoanData
        ? LoanData.FinanceLoanID
        : null;

      return booking;
    });

    // Send the updated booking data as the response
    return res.json(updatedBookingData);
  } catch (err) {
    console.error("Error retrieving NewCarBookings:", err);

    // Check if headers have already been sent before trying to send another response
    if (!res.headersSent) {
      res.status(500).send({
        message: "An error occurred while processing the request.",
        error: err.message,
      });
    }
  }
};

// AvailableStockSearch API
exports.AvailableStockSearch = async (req, res) => {
  try {
    const { ModelCode, VariantCode, ColourCode } = req.query;

    // Initialize filters
    const filters = {};
    if (ModelCode) filters.ModelCode = ModelCode;

    // Determine group by conditions
    const groupByConditions = ["ModelCode", "VariantCode", "ColourCode"];

    // Check if VariantCode is provided
    if (VariantCode) {
      filters.VariantCode = VariantCode;
    }

    // Check if ColourCode is provided
    if (ColourCode) {
      filters.ColourCode = ColourCode;
    }

    // Query the VehicleStock table
    const vehicleStockResults = await VehicleStock.findAll({
      where: filters,
      attributes: [
        // ...(ModelCode ? [] : ["ModelCode"]),
        // ...(VariantCode ? [] : ["VariantCode"]),
        // ...(ColourCode ? [] : ["ColourCode"]),
        "ModelCode",
        "VariantCode",
        "ColourCode",
        [
          VehicleStock.sequelize.fn(
            "COUNT",
            VehicleStock.sequelize.col("PurchaseID")
          ),
          "Count",
        ],
      ],
      group: groupByConditions, // Use the updated group by conditions
    });
    // Log the results from VehicleStock query
    // console.log("Vehicle Stock Results:", vehicleStockResults);

    // Extract unique ModelCodes and ColourCodes from the result
    // const modelCodes = [
    //   ...new Set(vehicleStockResults.map((item) => item.ModelCode)),
    // ];

    const modelCodes = [
      ...new Set(
        vehicleStockResults
          .map((item) => item.dataValues.ModelCode)
          .filter((code) => code) // Filter out null values for ColourCode
      ),
    ];

    const colourCodes = [
      ...new Set(
        vehicleStockResults
          .map((item) => item.dataValues.ColourCode)
          .filter((code) => code) // Filter out null values for ColourCode
      ),
    ];
    const variantCodes = [
      ...new Set(
        vehicleStockResults
          .map((item) => item.VariantCode)
          .filter((code) => code) // Filter out null values for VariantCode
      ),
    ];
    // console.log("Model Codes:", modelCodes);
    // console.log("Variant Codes:", variantCodes);

    // Fetch all model descriptions in one query
    const modelMasterData = await ModelMaster.findAll({
      where: { ModelCode: modelCodes },
      attributes: ["ModelCode", "ModelDescription", "ModelMasterID"],
    });

    // Fetch all colour descriptions in one query
    const colourMasterData = await ColourMaster.findAll({
      where: { ColourCode: colourCodes },
      attributes: ["ColourCode", "ColourDescription", "ColourID"],
    });
    // Fetch all variant descriptions and IDs in one query
    const variantMasterData = await VariantMaster.findAll({
      where: { VariantCode: variantCodes },
      attributes: ["VariantCode", "VariantID"],
    });
    // console.log("Variant Master Data:", variantMasterData);
    // Map the descriptions and IDs for easier lookup
    const modelDescriptionMap = modelMasterData.reduce((acc, model) => {
      acc[model.ModelCode] = {
        description: model.ModelDescription,
        id: model.ModelMasterID,
      };
      return acc;
    }, {});

    const colourDescriptionMap = colourMasterData.reduce((acc, colour) => {
      acc[colour.ColourCode] = {
        description: colour.ColourDescription,
        id: colour.ColourID,
      };
      return acc;
    }, {});
    const variantDescriptionMap = variantMasterData.reduce((acc, variant) => {
      acc[variant.VariantCode] = {
        id: variant.VariantID,
      };
      return acc;
    }, {});
    // console.log("Variant Description Map:", variantDescriptionMap);
    // Format the result by mapping descriptions and IDs to vehicle stock data
    const formattedResult = vehicleStockResults.map((item) => {
      const variantID =
        variantDescriptionMap[item.dataValues.VariantCode]?.id || null;
      const result = {
        // Model: item.ModelCode,
        Model: item.dataValues.ModelCode || ColourCode || null,
        ModelDescription:
          modelDescriptionMap[item.ModelCode]?.description || null,
        ModelID: modelDescriptionMap[item.ModelCode]?.id || null,
        Variant: item.dataValues.VariantCode || VariantCode || null,
        VariantID: variantID,
        Colour: item.dataValues.ColourCode || ColourCode || null,
        ColourDescription:
          colourDescriptionMap[item.dataValues.ColourCode]?.description || null,
        ColourID: colourDescriptionMap[item.dataValues.ColourCode]?.id || null,
        Count: item.dataValues.Count,
      };
      // console.log("Formatted Result Item:", result);
      return result;
    });

    // Return the response
    res.json(formattedResult);
  } catch (err) {
    console.error("Error in AvailableStockSearch:", err);
    res.status(500).send({
      message: "Some error occurred while processing the request.",
      error: err.message,
    });
  }
};

// Find a VehicleAllotment with an id for WEB
exports.getDataforAllotment = async (req, res) => {
  try {
    const Id = req.params.id;
    if (!Id) {
      return res.status(400).send({ message: "ID is required" });
    }
    // Fetch a single vehicle allotment record by its AllotmentReqID with related data from other models
    const vehicleAllotmentData = await VehicleAllotment.findOne({
      where: { AllotmentReqID: Id }, // Find the record by AllotmentReqID (from the URL parameter)
      attributes: [
        "AllotmentReqID",
        "ReqNo",
        "ReqDate",
        "BookingID",
        "CustomerID",
        "ModelMasterID",
        "VariantID",
        "ColourID",
        "FuelTypeID",
        "TransmissionID",
        "BranchID",
        "SalesPersonID",
        "TeamLeadID",
        // "PurchaseID",
        // "ExchangeID",
        "FinanceLoanID",
        // "AllotmentValidFrom",
        // "AllotmentValidTill",
        // "FIFOPosition",
        // "PaymentReceived",
        // "Remarks",
        "AllotmentStatus",
        // "IsActive",
        // "Status",
        "CreatedDate",
        // "ModifiedDate",
      ],
      include: [
        {
          model: NewCarBookings, // Related model for Booking
          as: "AllotBookingID",
          attributes: [
            "BookingID",
            "BookingNo",
            "FirstName",
            "LastName",
            "PhoneNo",
            "Email",
          ], // Include relevant fields from Booking
        },
        {
          model: CustomerMaster,
          as: "AllotCustomerID",
          attributes: ["CustID", "CustomerID"], // Include relevant fields from Customer
        },
        {
          model: ModelMaster,
          as: "AllotModelMasterID",
          attributes: ["ModelMasterID", "ModelCode", "ModelDescription"], // Include relevant fields from ModelMaster
        },
        {
          model: VariantMaster,
          as: "AllotVariantID",
          attributes: ["VariantID", "VariantCode"], // Include relevant fields from VariantMaster
        },
        {
          model: ColourMaster,
          as: "AllotColourID",
          attributes: ["ColourID", "ColourCode", "ColourDescription"], // Include relevant fields from ColourMaster
        },
        {
          model: FuelType,
          as: "AllotFuelTypeID",
          attributes: ["FuelTypeID", "FuelTypeName"], // Include relevant fields from FuelType
        },
        {
          model: Transmission,
          as: "AllotTransmissionID",
          attributes: ["TransmissionID", "TransmissionCode"], // Include relevant fields from Transmission
        },
        {
          model: BranchMaster,
          as: "AllotBranchID",
          attributes: ["BranchID", "BranchCode", "BranchName"], // Include relevant fields from BranchMaster
        },
        {
          model: UserMaster,
          as: "AllotSPID",
          attributes: ["UserID", "UserName", "EmpID"], // Include relevant fields from SalesPerson
        },
        {
          model: UserMaster,
          as: "AllotTLID",
          attributes: ["UserID", "UserName", "EmpID"], // Include relevant fields from TeamLead
        },
        // {
        //   model: VehicleStock,
        //   as: "AllotPurchaseID",
        //   attributes: ["UserID", "PurchaseID", "EngineNo"], // Include relevant fields from VehicleStock
        // },
        {
          model: FinanceLoanApplication,
          as: "AllotFinanceLoanID",
          attributes: [
            "FinanceLoanID",
            "Category",
            "RefAppNo",
            "SanctionAmount",
            "FinancierID",
          ], // Include relevant fields from FinanceLoanApplication
          include: [
            {
              model: FinanceMaster,
              as: "FLAFinancierID",
              attributes: ["FinancierID", "FinancierName"],
            },
          ],
        },
      ],
    });

    // Check if data is not found
    if (!vehicleAllotmentData) {
      return res.status(404).json({
        message: "Vehicle allotment data not found.",
      });
    }

    // Function to retrieve finance tracking based on FinAppID
    const getFinanceTracking = async (finAppID) => {
      const finStatusUpdate = await FinanceStatusUpdate.findOne({
        where: { FinAppID: finAppID },
        attributes: ["FinStatusID", "CurrentStage"],
      });

      if (finStatusUpdate) {
        return await FinStatusTracking.findAll({
          where: { FinStatusID: finStatusUpdate.FinStatusID },
          attributes: ["CurrentStage", "StatusDate"],
          order: [["FinStatusTrackID", "ASC"]],
        });
      }
      return null;
    };

    // Get loan data and tracking information based on booking ID
    let finTracking = [];
    const financeData = await FinanceLoanApplication.findOne({
      where: { BookingID: vehicleAllotmentData.AllotBookingID.BookingID },
      attributes: ["FinanceLoanID", "FinAppID"],
    });
    // console.log("test1", financeData.FinAppID);

    // Check if financeData is null before accessing FinAppID
    if (financeData && financeData.FinAppID) {
      finTracking = await getFinanceTracking(financeData.FinAppID);
    } else {
      const pendingFinanceAppData = await FinanceApplication.findOne({
        where: { BookingID: vehicleAllotmentData.AllotBookingID.BookingID },
        attributes: ["FinAppID"],
      });

      if (pendingFinanceAppData && pendingFinanceAppData.FinAppID) {
        finTracking = await getFinanceTracking(pendingFinanceAppData.FinAppID);
      }
    }

    // Map the data for response, combining relevant fields from related models
    const combinedData = {
      AllotmentReqID: vehicleAllotmentData.AllotmentReqID,
      ReqNo: vehicleAllotmentData.ReqNo,
      ReqDate: vehicleAllotmentData.ReqDate,
      // OnRoadPrice: vehicleAllotmentData.OnRoadPrice,
      BookingID: vehicleAllotmentData.BookingID,
      CustomerID: vehicleAllotmentData.CustomerID,
      ModelMasterID: vehicleAllotmentData.ModelMasterID,
      VariantID: vehicleAllotmentData.VariantID,
      ColourID: vehicleAllotmentData.ColourID,
      FuelTypeID: vehicleAllotmentData.FuelTypeID,
      TransmissionID: vehicleAllotmentData.TransmissionID,
      BranchID: vehicleAllotmentData.BranchID,
      SalesPersonID: vehicleAllotmentData.SalesPersonID,
      TeamLeadID: vehicleAllotmentData.TeamLeadID,
      // PurchaseID: vehicleAllotmentData.PurchaseID,
      // ExchangeID: vehicleAllotmentData.ExchangeID,
      FinanceLoanID: vehicleAllotmentData.FinanceLoanID,
      // AllotmentValidFrom: vehicleAllotmentData.AllotmentValidFrom,
      // AllotmentValidTill: vehicleAllotmentData.AllotmentValidTill,
      // FIFOPosition: vehicleAllotmentData.FIFOPosition,
      // PaymentReceived: vehicleAllotmentData.PaymentReceived,
      // Remarks: vehicleAllotmentData.Remarks,
      AllotmentStatus: vehicleAllotmentData.AllotmentStatus,
      // IsActive: vehicleAllotmentData.IsActive,
      // Status: vehicleAllotmentData.Status,
      CreatedDate: vehicleAllotmentData.CreatedDate,
      // ModifiedDate: vehicleAllotmentData.ModifiedDate,
      // Combine relevant data from the included models
      BookingNo: vehicleAllotmentData.AllotBookingID
        ? vehicleAllotmentData.AllotBookingID.BookingNo
        : null,
      CustFirstName: vehicleAllotmentData.AllotBookingID
        ? vehicleAllotmentData.AllotBookingID.FirstName
        : null,
      CustLastName: vehicleAllotmentData.AllotBookingID
        ? vehicleAllotmentData.AllotBookingID.LastName
        : null,
      CustPhoneNo: vehicleAllotmentData.AllotBookingID
        ? vehicleAllotmentData.AllotBookingID.PhoneNo
        : null,
      CustEmail: vehicleAllotmentData.AllotCustomerID
        ? vehicleAllotmentData.AllotCustomerID.Email
        : null,
      ModelName: vehicleAllotmentData.AllotModelMasterID
        ? vehicleAllotmentData.AllotModelMasterID.ModelDescription
        : null,
      VariantCode: vehicleAllotmentData.AllotVariantID
        ? vehicleAllotmentData.AllotVariantID.VariantCode
        : null,
      ColourName: vehicleAllotmentData.AllotColourID
        ? vehicleAllotmentData.AllotColourID.ColourDescription
        : null,
      FuelTypeName: vehicleAllotmentData.AllotFuelTypeID
        ? vehicleAllotmentData.AllotFuelTypeID.FuelTypeName
        : null,
      TransmissionCode: vehicleAllotmentData.AllotTransmissionID
        ? vehicleAllotmentData.AllotTransmissionID.TransmissionCode
        : null,
      BranchCode: vehicleAllotmentData.AllotBranchID
        ? vehicleAllotmentData.AllotBranchID.BranchCode
        : null,
      BranchName: vehicleAllotmentData.AllotBranchID
        ? vehicleAllotmentData.AllotBranchID.BranchName
        : null,
      SalesPersonName: vehicleAllotmentData.AllotSPID
        ? vehicleAllotmentData.AllotSPID.UserName
        : null,
      SalesPersonEmpID: vehicleAllotmentData.AllotSPID
        ? vehicleAllotmentData.AllotSPID.EmpID
        : null,
      TeamLeadName: vehicleAllotmentData.AllotTLID
        ? vehicleAllotmentData.AllotTLID.UserName
        : null,
      TeamLeadEmpID: vehicleAllotmentData.AllotTLID
        ? vehicleAllotmentData.AllotTLID.EmpID
        : null,
      // PurchaseNo: vehicleAllotmentData.AllotPurchaseID
      //   ? vehicleAllotmentData.AllotPurchaseID.PurchaseID
      //   : null,
      // EngineNo: vehicleAllotmentData.AllotPurchaseID
      //   ? vehicleAllotmentData.AllotPurchaseID.EngineNo
      //   : null,
      Category: vehicleAllotmentData.AllotFinanceLoanID
        ? vehicleAllotmentData.AllotFinanceLoanID.Category
        : null,
      SanctionAmount: vehicleAllotmentData.AllotFinanceLoanID
        ? vehicleAllotmentData.AllotFinanceLoanID.SanctionAmount
        : null,
      RefAppNo: vehicleAllotmentData.AllotFinanceLoanID
        ? vehicleAllotmentData.AllotFinanceLoanID.RefAppNo
        : null,
      FinancierID: vehicleAllotmentData.AllotFinanceLoanID
        ? vehicleAllotmentData.AllotFinanceLoanID.FinancierID
        : null,
      FinancierName:
        vehicleAllotmentData.AllotFinanceLoanID &&
        vehicleAllotmentData.AllotFinanceLoanID.FLAFinancierID
          ? vehicleAllotmentData.AllotFinanceLoanID.FLAFinancierID.FinancierName
          : null,
    };

    const paymentData = await PaymentRequest.findAll({
      where: {
        TransactionID: vehicleAllotmentData.BookingID,
        RequestStatus: "Accepted",
      },
      attributes: ["ID"],
    });
    const paymentIds = paymentData.map((id) => id.ID);

    const recieptData = await CustomerReceipts.findAll({
      where: {
        RequestID: paymentIds,
      },
      attributes: [
        "ReceiptID",
        "ReceiptNo",
        "ReceiptDate",
        "PaymentMode",
        "Amount",
      ],
    });

    // Fetch stock data based on VariantCode, ColourCode, and ModelCode from the branch indent data
    const stockData = await VehicleStock.findAll({
      where: {
        VariantCode: vehicleAllotmentData.AllotVariantID.VariantCode,
        ColourCode: vehicleAllotmentData.AllotColourID.ColourCode,
        ModelCode: vehicleAllotmentData.AllotModelMasterID.ModelCode,
        Status: "In-Stock",
      },
      attributes: [
        "PurchaseID",
        "VendorID",
        "BranchID",
        [sequelize.col("PEBranchID.BranchCode"), "BranchCode"],
        [sequelize.col("PEBranchID.BranchName"), "BranchName"],
        // "VariantCode",
        // "ModelCode",
        // "ColourCode",
        // "SKUCode",
        // "FuelType",
        // "TransmissionCode",
        "EngineNo",
        "ChassisNo",
        "KeyNo",
        "InvoiceNo",
        "InvoiceDate",
        // "GRNNo",
        // "GRNDate",
        "StockInDate",
        // "EWayBillNo",
        // "TruckNo",
        // "TransporterName",
        "MFGDate",
        // "BasicValue",
        // "Discount",
        // "DRF",
        // "TaxableValue",
        // "IGSTRate",
        // "CESSRate",
        // "IGSTAmt",
        // "CGSTAmt",
        // "SGSTAmt",
        // "CESSAmt",
        "InvoiceValue",
        "DispatchCode",
        // "Remarks",
        // "FundAccount",
        "Status",
        "CreatedDate",
        // "ModifiedDate",
      ],
      include: [
        {
          model: BranchMaster,
          as: "PEBranchID",
          attributes: [],
        },
      ],
      order: [["MFGDate", "ASC"]], // Order stock data by CreatedDate in descending order
    });

    // Calculate Ageing after fetching data
    const formattedStockData = stockData.map((record) => {
      const mfgDate = new Date(record.MFGDate); // Parse MFGDate
      const now = new Date(); // Current date
      const diffTime = Math.abs(now - mfgDate); // Difference in milliseconds
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Convert to days

      return {
        ...record.dataValues,
        Ageing: `${diffDays} days`, // Add Ageing field
      };
    });

    // Send the combined data as a response
    res.json({
      CustomerData: combinedData,
      paymentData: recieptData,
      VehicleAllotment: formattedStockData,
      FinanceTracking: finTracking,
    });
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message:
          "Database error occurred while retrieving vehicle allotment data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      // Handle connection errors
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    console.error("Error retrieving vehicle allotment data:", error);
    res.status(500).json({
      message:
        "Failed to retrieve vehicle allotment data. Please try again later.",
    });
  }
};

// FIFO order for WEB
exports.FIFOOrderforWeb = async (req, res) => {
  try {
    const Id = req.params.id;
    if (!Id) {
      return res.status(400).send({ message: "ID is required" });
    }

    // Fetch vehicle allotment data by AllotmentReqID
    const vehicleAllotmentData = await VehicleAllotment.findOne({
      where: { AllotmentReqID: Id },
      attributes: [
        "AllotmentReqID",
        "ModelMasterID",
        "VariantID",
        "ColourID",
        "FuelTypeID",
        "TransmissionID",
      ],
      include: [
        {
          model: ModelMaster,
          as: "AllotModelMasterID",
          attributes: ["ModelDescription"],
        },
        {
          model: VariantMaster,
          as: "AllotVariantID",
          attributes: ["VariantCode"],
        },
        {
          model: ColourMaster,
          as: "AllotColourID",
          attributes: ["ColourDescription"],
        },
        {
          model: FuelType,
          as: "AllotFuelTypeID",
          attributes: ["FuelTypeName"],
        },
        {
          model: Transmission,
          as: "AllotTransmissionID",
          attributes: ["TransmissionCode"],
        },
      ],
    });

    if (!vehicleAllotmentData) {
      return res
        .status(404)
        .json({ message: "Vehicle allotment data not found." });
    }

    // Fetch bookings matching vehicle details
    const bookingsList = await NewCarBookings.findAll({
      where: {
        ModelName: vehicleAllotmentData.AllotModelMasterID.ModelDescription,
        VariantName: vehicleAllotmentData.AllotVariantID.VariantCode,
        ColourName: vehicleAllotmentData.AllotColourID.ColourDescription,
        Transmission: vehicleAllotmentData.AllotTransmissionID.TransmissionCode,
        Fuel: vehicleAllotmentData.AllotFuelTypeID.FuelTypeName,
      },
      attributes: [
        "BookingID",
        "BookingNo",
        "BookingTime",
        "FirstName",
        "LastName",
      ],
      order: [["BookingTime", "ASC"]], // Order by BookingTime in ascending order
    });

    if (!bookingsList || bookingsList.length === 0) {
      return res
        .status(404)
        .json({ message: "No bookings found matching the criteria." });
    }

    // Get the Booking IDs
    const bookingIds = bookingsList.map((booking) => booking.BookingID);

    // Fetch Payment Requests for the bookings
    const paymentData = await PaymentRequest.findAll({
      where: {
        TransactionID: bookingIds,
        RequestStatus: "Accepted",
      },
      attributes: ["ID", "TransactionID"],
    });

    // Fetch Receipts for the payment requests
    const paymentIds = paymentData.map((payment) => payment.ID);
    const receiptData = await CustomerReceipts.findAll({
      where: {
        RequestID: paymentIds,
      },
      attributes: ["RequestID", "Amount"],
    });

    const financeData = await FinanceLoanApplication.findAll({
      where: {
        BookingID: bookingIds,
      },
      attributes: ["BookingID", "Category", "ApplicationStatus"],
    });

    const pendingfinanceAppData = await FinanceApplication.findAll({
      where: {
        BookingID: bookingIds,
      },
      attributes: ["FinAppID", "BookingID"],
    });

    const finappId = pendingfinanceAppData.map((id) => id.FinAppID);

    const pendingfinanceData = await FinanceStatusUpdate.findAll({
      where: {
        FinAppID: finappId,
      },
      attributes: ["FinStatusID", "FinAppID", "CurrentStage"],
    });

    // Aggregate payment amounts for each booking based on RequestID
    const bookingAmounts = {};

    receiptData.forEach((receipt) => {
      const requestId = receipt.RequestID;
      const amount = receipt.Amount || 0;

      // Aggregate the total amount per booking
      const paymentRequest = paymentData.find(
        (payment) => payment.ID === requestId
      );
      if (paymentRequest) {
        const transactionID = paymentRequest.TransactionID;
        if (!bookingAmounts[transactionID]) {
          bookingAmounts[transactionID] = 0;
        }
        bookingAmounts[transactionID] += amount;
      }
    });

    // // Prepare final response data
    // const Data = bookingsList.map((booking) => {
    //   const totalAmount = bookingAmounts[booking.BookingID] || 0;

    //   return {
    //     Name: `${booking.FirstName} ${booking.LastName}`,
    //     Date: booking.BookingTime,
    //     Amount: totalAmount,
    //   };
    // });

    // Create a lookup for finance data
    const financeStatusLookup = financeData.reduce((acc, finance) => {
      acc[finance.BookingID] = finance.ApplicationStatus;
      return acc;
    }, {});

    // Create a lookup for pending finance status by FinAppID
    const financeStageLookup = pendingfinanceData.reduce(
      (acc, financeStatus) => {
        acc[financeStatus.FinAppID] = financeStatus.CurrentStage;
        return acc;
      },
      {}
    );

    // Prepare final response data
    const Data = bookingsList.map((booking) => {
      const totalAmount = bookingAmounts[booking.BookingID] || 0;

      // Determine the finance status
      let status;
      if (financeStatusLookup[booking.BookingID]) {
        // Use ApplicationStatus if available
        status = financeStatusLookup[booking.BookingID];
      } else {
        // Otherwise, check pending finance data
        const pendingFinanceApp = pendingfinanceAppData.find(
          (pending) => pending.BookingID === booking.BookingID
        );
        if (
          pendingFinanceApp &&
          financeStageLookup[pendingFinanceApp.FinAppID]
        ) {
          status = financeStageLookup[pendingFinanceApp.FinAppID];
        } else {
          status = "No Finance Data";
        }
      }

      return {
        BookingID: booking.BookingID, // Add BookingID to response
        Name: `${booking.FirstName} ${booking.LastName}`,
        Date: booking.BookingTime,
        Amount: totalAmount,
        Status: status,
      };
    });

    // Send the combined data as a response
    res.json(Data);
  } catch (error) {
    console.error("Error retrieving vehicle allotment data:", error);
    res.status(500).json({
      message:
        "Failed to retrieve vehicle allotment data. Please try again later.",
    });
  }
};

// get All Payments For Booking
exports.getAllPaymentsForBooking = async (req, res) => {
  try {
    const Id = req.params.id;
    if (!Id) {
      return res.status(400).send({ message: "ID is required" });
    }

    const paymentData = await PaymentRequest.findAll({
      where: {
        TransactionID: Id,
        RequestStatus: "Accepted",
      },
      attributes: ["ID"],
    });

    const paymentIds = paymentData.map((id) => id.ID);
    const receiptData = await CustomerReceipts.findAll({
      where: {
        RequestID: paymentIds,
      },
      attributes: [
        "ReceiptID",
        "ReceiptNo",
        "ReceiptDate",
        "PaymentMode",
        "Amount",
      ],
    });

    const getFinanceTracking = async (finAppID) => {
      const finStatusUpdate = await FinanceStatusUpdate.findOne({
        where: { FinAppID: finAppID },
        attributes: ["FinStatusID", "CurrentStage"],
      });

      if (finStatusUpdate) {
        return await FinStatusTracking.findAll({
          where: { FinStatusID: finStatusUpdate.FinStatusID },
          attributes: ["CurrentStage", "StatusDate"],
          order: [["FinStatusTrackID", "ASC"]],
        });
      }
      return null;
    };

    let finTracking = [];
    let loanData = {
      FinancierName: null,
      LoanAmount: null,
    };

    const financeData = await FinanceLoanApplication.findOne({
      where: { BookingID: Id },
      include: [
        {
          model: FinanceMaster,
          as: "FLAFinancierID",
          attributes: ["FinancierName"],
        },
      ],
      attributes: [
        "FinanceLoanID",
        "BookingID",
        "CustomerID",
        "FinAppID",
        "SanctionAmount",
        "ApplicationStatus",
      ],
    });

    if (financeData) {
      loanData.FinancierName = financeData.FLAFinancierID?.FinancierName;
      loanData.LoanAmount = financeData.SanctionAmount;

      const pendingFinanceAppData = await FinanceApplication.findOne({
        where: { FinAppID: financeData.FinAppID },
        attributes: ["FinAppID", "BookingID", "FinancierName", "LoanAmt"],
      });

      if (pendingFinanceAppData) {
        finTracking = await getFinanceTracking(pendingFinanceAppData.FinAppID);
      }
    } else {
      const pendingFinanceAppData = await FinanceApplication.findOne({
        where: { BookingID: Id },
        attributes: ["FinAppID", "BookingID", "FinancierName", "LoanAmt"],
      });

      if (pendingFinanceAppData) {
        loanData.FinancierName = pendingFinanceAppData.FinancierName;
        loanData.LoanAmount = pendingFinanceAppData.LoanAmt;
        finTracking = await getFinanceTracking(pendingFinanceAppData.FinAppID);
      }
    }

    // Send the combined data as a response
    res.json({
      receiptData,
      loanData,
      finTracking: finTracking.length > 0 ? finTracking : [],
    });
  } catch (error) {
    console.error("Error retrieving vehicle allotment data:", error);
    res.status(500).json({
      message:
        "Failed to retrieve vehicle allotment data. Please try again later.",
    });
  }
};

// Get Allottment Data by Booking ID
exports.AllotDataByBookingID = async (req, res) => {
  try {
    const bookingID = req.query.BookingID;

    // Validate input
    if (!bookingID) {
      return res.status(400).send({
        message: "Booking ID is required in query parameters.",
      });
    }

    // Fetch a single vehicle allotment record by its AllotmentReqID with related data from other models
    const vehicleAllotmentData = await VehicleAllotment.findOne({
      where: { BookingID: bookingID }, // Find the record by AllotmentReqID (from the URL parameter)
      attributes: [
        "AllotmentReqID",
        "ReqNo",
        "ReqDate",
        // "OnRoadPrice",
        "BookingID",
        // "CustomerID",
        // "ModelMasterID",
        // "VariantID",
        // "ColourID",
        // "FuelTypeID",
        // "TransmissionID",
        // "BranchID",
        // "SalesPersonID",
        // "TeamLeadID",
        // "PurchaseID",
        // "ExchangeID",
        // "FinanceLoanID",
        "AllotmentValidFrom",
        "AllotmentValidTill",
        "FIFOPosition",
        "PaymentReceived",
        "Remarks",
        "AllotmentStatus",
        "IsActive",
        "Status",
        "CreatedDate",
        "ModifiedDate",
      ],
      include: [
        // {
        //   model: NewCarBookings, // Related model for Booking
        //   as: "AllotBookingID",
        //   attributes: ["BookingNo"], // Include relevant fields from Booking
        // },
        // {
        //   model: CustomerMaster,
        //   as: "AllotCustomerID",
        //   attributes: ["FirstName", "Email"], // Include relevant fields from Customer
        // },
        {
          model: ModelMaster,
          as: "AllotModelMasterID",
          attributes: ["ModelDescription"], // Include relevant fields from ModelMaster
        },
        {
          model: VariantMaster,
          as: "AllotVariantID",
          attributes: ["VariantCode"], // Include relevant fields from VariantMaster
        },
        {
          model: ColourMaster,
          as: "AllotColourID",
          attributes: ["ColourDescription"], // Include relevant fields from ColourMaster
        },
        {
          model: FuelType,
          as: "AllotFuelTypeID",
          attributes: ["FuelTypeName"], // Include relevant fields from FuelType
        },
        {
          model: Transmission,
          as: "AllotTransmissionID",
          attributes: ["TransmissionCode"], // Include relevant fields from Transmission
        },
        {
          model: BranchMaster,
          as: "AllotBranchID",
          attributes: ["BranchName"], // Include relevant fields from BranchMaster
        },
        // {
        //   model: UserMaster,
        //   as: "AllotSPID",
        //   attributes: ["UserName", "EmpID"], // Include relevant fields from SalesPerson
        // },
        // {
        //   model: UserMaster,
        //   as: "AllotTLID",
        //   attributes: ["UserName", "EmpID"], // Include relevant fields from TeamLead
        // },
        {
          model: VehicleStock,
          as: "AllotPurchaseID",
          attributes: ["PurchaseID", "EngineNo", "ChassisNo"], // Include relevant fields from VehicleStock
        },
        // {
        //   model: FinanceLoanApplication,
        //   as: "AllotFinanceLoanID",
        //   attributes: ["Category", "SanctionAmount"], // Include relevant fields from FinanceLoanApplication
        // },
      ],
    });

    let vehicleChangeReqData = null;
    // Check if data is not found
    if (!vehicleAllotmentData) {
      vehicleChangeReqData = await VehicleChangeRequest.findOne({
        where: { BookingID: bookingID }, // Find the record by AllotmentReqID (from the URL parameter)
        attributes: [
          "VehicleChngReqID",
          "ReqNo",
          "ReqDate",
          // "OnRoadPrice",
          "BookingID",
          // "CustomerID",
          // "ModelMasterID",
          // "VariantID",
          // "ColourID",
          // "FuelTypeID",
          // "TransmissionID",
          // "BranchID",
          // "SalesPersonID",
          // "TeamLeadID",
          // "PurchaseID",
          // "ExchangeID",
          // "FinanceLoanID",
          // "AllotmentValidFrom",
          // "AllotmentValidTill",
          // "FIFOPosition",
          // "PaymentReceived",
          "Remarks",
          "ChangeStatus",
          "IsActive",
          "Status",
          "CreatedDate",
          "ModifiedDate",
        ],
        include: [
          // {
          //   model: NewCarBookings, // Related model for Booking
          //   as: "AllotBookingID",
          //   attributes: ["BookingNo"], // Include relevant fields from Booking
          // },
          // {
          //   model: CustomerMaster,
          //   as: "AllotCustomerID",
          //   attributes: ["FirstName", "Email"], // Include relevant fields from Customer
          // },
          {
            model: ModelMaster,
            as: "AllotChngModelMasterID",
            attributes: ["ModelDescription"], // Include relevant fields from ModelMaster
          },
          {
            model: VariantMaster,
            as: "AllotChngVariantID",
            attributes: ["VariantCode"], // Include relevant fields from VariantMaster
          },
          {
            model: ColourMaster,
            as: "AllotChngColourID",
            attributes: ["ColourDescription"], // Include relevant fields from ColourMaster
          },
          {
            model: FuelType,
            as: "AllotChngFuelTypeID",
            attributes: ["FuelTypeName"], // Include relevant fields from FuelType
          },
          {
            model: Transmission,
            as: "AllotChngTransmissionID",
            attributes: ["TransmissionCode"], // Include relevant fields from Transmission
          },
          {
            model: BranchMaster,
            as: "AllotChngBranchID",
            attributes: ["BranchName"], // Include relevant fields from BranchMaster
          },
          // {
          //   model: UserMaster,
          //   as: "AllotSPID",
          //   attributes: ["UserName", "EmpID"], // Include relevant fields from SalesPerson
          // },
          // {
          //   model: UserMaster,
          //   as: "AllotTLID",
          //   attributes: ["UserName", "EmpID"], // Include relevant fields from TeamLead
          // },
          // {
          //   model: VehicleStock,
          //   as: "AllotPurchaseID",
          //   attributes: ["PurchaseID", "EngineNo", "ChassisNo"], // Include relevant fields from VehicleStock
          // },
          // {
          //   model: FinanceLoanApplication,
          //   as: "AllotFinanceLoanID",
          //   attributes: ["Category", "SanctionAmount"], // Include relevant fields from FinanceLoanApplication
          // },
        ],
      });
      // return res.status(404).json({
      //   message: "Vehicle allotment data not found.",
      // });
    }

    // Map the data for response, combining relevant fields from related models
    // const combinedData = {
    //   AllotmentReqID: vehicleAllotmentData.AllotmentReqID,
    //   ReqNo: vehicleAllotmentData.ReqNo,
    //   ReqDate: vehicleAllotmentData.ReqDate,
    //   // OnRoadPrice: vehicleAllotmentData.OnRoadPrice,
    //   BookingID: vehicleAllotmentData.BookingID,
    //   // CustomerID: vehicleAllotmentData.CustomerID,
    //   // ModelMasterID: vehicleAllotmentData.ModelMasterID,
    //   // VariantID: vehicleAllotmentData.VariantID,
    //   // ColourID: vehicleAllotmentData.ColourID,
    //   // FuelTypeID: vehicleAllotmentData.FuelTypeID,
    //   // TransmissionID: vehicleAllotmentData.TransmissionID,
    //   // BranchID: vehicleAllotmentData.BranchID,
    //   // SalesPersonID: vehicleAllotmentData.SalesPersonID,
    //   // TeamLeadID: vehicleAllotmentData.TeamLeadID,
    //   // PurchaseID: vehicleAllotmentData.PurchaseID,
    //   // ExchangeID: vehicleAllotmentData.ExchangeID,
    //   // FinanceLoanID: vehicleAllotmentData.FinanceLoanID,
    //   AllotmentValidFrom: vehicleAllotmentData.AllotmentValidFrom,
    //   AllotmentValidTill: vehicleAllotmentData.AllotmentValidTill,
    //   FIFOPosition: vehicleAllotmentData.FIFOPosition,
    //   PaymentReceived: vehicleAllotmentData.PaymentReceived,
    //   Remarks: vehicleAllotmentData.Remarks,
    //   AllotmentStatus: vehicleAllotmentData.AllotmentStatus,
    //   IsActive: vehicleAllotmentData.IsActive,
    //   Status: vehicleAllotmentData.Status,
    //   CreatedDate: vehicleAllotmentData.CreatedDate,
    //   ModifiedDate: vehicleAllotmentData.ModifiedDate,
    //   // Combine relevant data from the included models
    //   // BookingNo: vehicleAllotmentData.AllotBookingID
    //   //   ? vehicleAllotmentData.AllotBookingID.BookingNo
    //   //   : null,
    //   // CustomerName: vehicleAllotmentData.AllotCustomerID
    //   //   ? vehicleAllotmentData.AllotCustomerID.FirstName
    //   //   : null,
    //   // CustomerEmail: vehicleAllotmentData.AllotCustomerID
    //   //   ? vehicleAllotmentData.AllotCustomerID.Email
    //   //   : null,
    //   ModelName: vehicleAllotmentData.AllotModelMasterID
    //     ? vehicleAllotmentData.AllotModelMasterID.ModelDescription
    //     : null,
    //   VariantCode: vehicleAllotmentData.AllotVariantID
    //     ? vehicleAllotmentData.AllotVariantID.VariantCode
    //     : null,
    //   ColourName: vehicleAllotmentData.AllotColourID
    //     ? vehicleAllotmentData.AllotColourID.ColourDescription
    //     : null,
    //   FuelTypeName: vehicleAllotmentData.AllotFuelTypeID
    //     ? vehicleAllotmentData.AllotFuelTypeID.FuelTypeName
    //     : null,
    //   TransmissionCode: vehicleAllotmentData.AllotTransmissionID
    //     ? vehicleAllotmentData.AllotTransmissionID.TransmissionCode
    //     : null,
    //   // BranchName: vehicleAllotmentData.AllotBranchID
    //   //   ? vehicleAllotmentData.AllotBranchID.BranchName
    //   //   : null,
    //   // SalesPersonName: vehicleAllotmentData.AllotSPID
    //   //   ? vehicleAllotmentData.AllotSPID.UserName
    //   //   : null,
    //   // SalesPersonEmpID: vehicleAllotmentData.AllotSPID
    //   //   ? vehicleAllotmentData.AllotSPID.EmpID
    //   //   : null,
    //   // TeamLeadName: vehicleAllotmentData.AllotTLID
    //   //   ? vehicleAllotmentData.AllotTLID.UserName
    //   //   : null,
    //   // TeamLeadEmpID: vehicleAllotmentData.AllotTLID
    //   //   ? vehicleAllotmentData.AllotTLID.EmpID
    //   //   : null,
    //   PurchaseNo: vehicleAllotmentData.AllotPurchaseID
    //     ? vehicleAllotmentData.AllotPurchaseID.PurchaseID
    //     : null,
    //   EngineNo: vehicleAllotmentData.AllotPurchaseID
    //     ? vehicleAllotmentData.AllotPurchaseID.EngineNo
    //     : null,
    //   ChassisNo: vehicleAllotmentData.AllotPurchaseID
    //     ? vehicleAllotmentData.AllotPurchaseID.ChassisNo
    //     : null,
    //   // Category: vehicleAllotmentData.AllotFinanceLoanID
    //   //   ? vehicleAllotmentData.AllotFinanceLoanID.Category
    //   //   : null,
    //   // SanctionAmount: vehicleAllotmentData.AllotFinanceLoanID
    //   //   ? vehicleAllotmentData.AllotFinanceLoanID.SanctionAmount
    //   //   : null,
    // };
    const combinedData = {
      ReqID:
        vehicleAllotmentData?.AllotmentReqID ||
        vehicleChangeReqData?.VehicleChngReqID ||
        null,
      ReqNo: vehicleAllotmentData?.ReqNo || vehicleChangeReqData?.ReqNo || null,
      Type: vehicleAllotmentData ? 0 : 1,
      ReqDate:
        vehicleAllotmentData?.ReqDate || vehicleChangeReqData?.ReqDate || null,
      BookingID:
        vehicleAllotmentData?.BookingID ||
        vehicleChangeReqData?.BookingID ||
        null,
      Remarks:
        vehicleAllotmentData?.Remarks || vehicleChangeReqData?.Remarks || null,
      AllotmentValidFrom: vehicleAllotmentData?.AllotmentValidFrom || null,
      AllotmentValidTill: vehicleAllotmentData?.AllotmentValidTill || null,
      FIFOPosition: vehicleAllotmentData?.FIFOPosition || null,
      PaymentReceived: vehicleAllotmentData?.PaymentReceived || null,
      AllotmentStatus:
        vehicleAllotmentData?.AllotmentStatus ||
        vehicleChangeReqData?.ChangeStatus ||
        null,
      IsActive:
        vehicleAllotmentData?.IsActive ||
        vehicleChangeReqData?.IsActive ||
        null,
      Status:
        vehicleAllotmentData?.Status || vehicleChangeReqData?.Status || null,
      CreatedDate:
        vehicleAllotmentData?.CreatedDate ||
        vehicleChangeReqData?.CreatedDate ||
        null,
      ModifiedDate:
        vehicleAllotmentData?.ModifiedDate ||
        vehicleChangeReqData?.ModifiedDate ||
        null,

      // Combine relevant data from the included models
      ModelName:
        vehicleAllotmentData?.AllotModelMasterID?.ModelDescription ||
        vehicleChangeReqData?.AllotChngModelMasterID?.ModelDescription ||
        null,
      VariantCode:
        vehicleAllotmentData?.AllotVariantID?.VariantCode ||
        vehicleChangeReqData?.AllotChngVariantID?.VariantCode ||
        null,
      ColourName:
        vehicleAllotmentData?.AllotColourID?.ColourDescription ||
        vehicleChangeReqData?.AllotChngColourID?.ColourDescription ||
        null,
      FuelTypeName:
        vehicleAllotmentData?.AllotFuelTypeID?.FuelTypeName ||
        vehicleChangeReqData?.AllotChngFuelTypeID?.FuelTypeName ||
        null,
      TransmissionCode:
        vehicleAllotmentData?.AllotTransmissionID?.TransmissionCode ||
        vehicleChangeReqData?.AllotChngTransmissionID?.TransmissionCode ||
        null,
      // BranchName: vehicleAllotmentData?.AllotBranchID?.BranchName || vehicleChangeReqData?.AllotChngBranchID?.BranchName || null,
      // Add other fields as necessary
      PurchaseNo: vehicleAllotmentData?.AllotPurchaseID?.PurchaseID || null,
      EngineNo: vehicleAllotmentData?.AllotPurchaseID?.EngineNo || null,
      ChassisNo: vehicleAllotmentData?.AllotPurchaseID?.ChassisNo || null,
    };

    // Send the combined data as a response
    res.json(combinedData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message:
          "Database error occurred while retrieving vehicle allotment data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      // Handle connection errors
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    console.error("Error retrieving vehicle allotment data:", error);
    res.status(500).json({
      message:
        "Failed to retrieve vehicle allotment data. Please try again later.",
    });
  }
};

// Update Allotment for Cancel and Revoke
exports.AllotReqUpdate = async (req, res) => {
  const { ReqID, Type, Remarks, Status, UserID } = req.body;

  // Validate required fields
  if (!ReqID) {
    return res.status(400).json({ message: "ReqID is required." });
  }
  if (!Type) {
    return res.status(400).json({ message: "Type is required." });
  }
  if (!Status) {
    return res.status(400).json({ message: "Status is required." });
  }
  if (!UserID) {
    return res.status(400).json({ message: "UserID is required." });
  }

  const transaction = await Seq.transaction();
  const now = new Date(); // Reuse the date instance
  try {
    // console.log("Request Body:", req.body);
    let updateData = null;

    if (Type == 0) {
      updateData = await VehicleAllotment.findByPk(ReqID, { transaction });
      if (!updateData) {
        await transaction.rollback();
        return res
          .status(404)
          .json({ message: "Vehicle allotment not found." });
      }

      if (Status === "Cancelled") {
        updateData.AllotmentStatus = Status;
        updateData.RevokedEmpID = UserID;
        updateData.Remarks = Remarks;
        updateData.IsActive = false;
        updateData.Status = "In-Active";
        updateData.ModifiedDate = now;

        const chngreqData = await VehicleChangeRequest.findOne({
          where: { VehicleChngReqID: updateData.VehicleChngReqID },
          transaction,
        });

        if (chngreqData) {
          chngreqData.ChangeStatus = Status;
          chngreqData.CancelledEmpID = UserID;
          chngreqData.Remarks = Remarks;
          chngreqData.IsActive = false;
          chngreqData.Status = "In-Active";
          chngreqData.ModifiedDate = now;
          await chngreqData.save({ transaction });
        }
      } else if (Status === "Revoked") {
        updateData.AllotmentStatus = Status;
        updateData.RevokedEmpID = UserID;
        updateData.Remarks = Remarks;
        updateData.ModifiedDate = now;
      }
      // Only update VehicleStock if PurchaseID exists
      if (updateData.PurchaseID) {
        await VehicleStock.update(
          {
            Status: "In-Stock",
            ModifiedDate: now,
          },
          { where: { PurchaseID: updateData.PurchaseID }, transaction }
        );
      }

      await updateData.save({ transaction });
    } else if (Type == 1) {
      updateData = await VehicleChangeRequest.findByPk(ReqID, { transaction });
      if (!updateData) {
        await transaction.rollback();
        return res.status(404).json({ message: "Change request not found." });
      }

      if (Status === "Cancelled") {
        updateData.ChangeStatus = Status;
        updateData.CancelledEmpID = UserID;
        updateData.Remarks = Remarks;
        updateData.IsActive = false;
        updateData.Status = "In-Active";
        updateData.ModifiedDate = now;
        await updateData.save({ transaction });
      }
    }

    await transaction.commit();

    res.json({
      message: "Data updated successfully.",
      updatedRecord: updateData,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error updating vehicle allotment data:", error);

    if (error.name === "SequelizeDatabaseError") {
      return res
        .status(500)
        .json({ message: "Database error occurred.", details: error.message });
    }

    if (error.name === "SequelizeConnectionError") {
      return res
        .status(503)
        .json({ message: "Service unavailable.", details: error.message });
    }

    res
      .status(500)
      .json({ message: "Failed to update data. Please try again later." });
  }
};

// exports.AllotReqUpdate = async (req, res) => {
//   const {
//     ReqID,
//     Type,
//     // BookingID,
//     // AllottedEmpID,
//     // PaymentReceived,
//     Remarks,
//     Status,
//     UserID,
//     // IsActive,
//     // Status,
//     // ModifiedDate, // Optional: Date when the record was modified
//   } = req.body; // The new values to be updated

//   try {
//     console.log("Request Body:", req.body);
//     let updateData = null;
//     if (Type == 0) {
//       // Fetch the record to check if it exists
//       // updateData = await VehicleAllotment.findOne({
//       //   where: { AllotmentReqID: ReqID },
//       // });
//       updateData = await VehicleAllotment.findByPk(ReqID);
//       // mobile can cancel when status is pending and web can cancel allotment anytime
//       if (Status == "Cancelled") {
//         updateData.AllotmentStatus = Status;
//         updateData.RevokedEmpID = UserID;
//         updateData.Remarks = Remarks;
//         updateData.IsActive = false;
//         updateData.Status = "In-Active";
//         updateData.ModifiedDate = new Date();
//         const chngreqData = await VehicleChangeRequest.findOne({
//           where: { VehicleChngReqID: updateData.VehicleChngReqID },
//         });
//         chngreqData.ChangeStatus = Status;
//         chngreqData.CancelledEmpID = UserID;
//         chngreqData.Remarks = Remarks;
//         chngreqData.IsActive = false;
//         chngreqData.Status = "In-Active";
//         chngreqData.ModifiedDate = new Date();

//         await updateData.save();
//         await chngreqData.save();
//       }
//       // Only Web can revoke an allotment
//       if (Status == "Revoked") {
//         updateData.AllotmentStatus = Status;
//         updateData.RevokedEmpID = UserID;
//         updateData.Remarks = Remarks;
//         updateData.ModifiedDate = new Date();
//         await updateData.save();
//       }
//     } else if (Type == 1) {
//       // Fetch the record to check if it exists
//       // updateData = await VehicleChangeRequest.findOne({
//       //   where: { VehicleChngReqID: ReqID },
//       // });

//       // Only Mobile can cancel the change request from this api
//       updateData = await VehicleChangeRequest.findByPk(ReqID);
//       if (Status == "Cancelled") {
//         updateData.ChangeStatus = Status;
//         updateData.CancelledEmpID = UserID;
//         updateData.Remarks = Remarks;
//         updateData.IsActive = false;
//         updateData.Status = "In-Active";
//         updateData.ModifiedDate = new Date();

//         await updateData.save();
//       }
//     }

//     if (!updateData) {
//       return res.status(404).json({
//         message: "Data not found for provided ReqID.",
//       });
//     }

//     // Save the updated record
//     // await updateData.save();

//     // const updatedStockData = await VehicleStock.update(
//     //   { Status: AllotmentStatus, ModifiedDate: new Date() },
//     //   {
//     //     where: { PurchaseID: PurchaseID },
//     //   }
//     // );

//     // Send back the updated record
//     res.json({
//       message: "Data updated successfully.",
//       updatedRecord: updateData,
//       // updatedStock: updatedStockData,
//     });
//   } catch (error) {
//     // Handle errors based on specific types
//     if (error.name === "SequelizeDatabaseError") {
//       // Handle database errors
//       return res.status(500).json({
//         message:
//           "Database error occurred while updating vehicle allotment data.",
//         details: error.message,
//       });
//     }

//     if (error.name === "SequelizeConnectionError") {
//       // Handle connection errors
//       return res.status(503).json({
//         message: "Service unavailable. Unable to connect to the database.",
//         details: error.message,
//       });
//     }

//     console.error("Error updating vehicle allotment data:", error);
//     res.status(500).json({
//       message:
//         "Failed to update vehicle allotment data. Please try again later.",
//     });
//   }
// };
