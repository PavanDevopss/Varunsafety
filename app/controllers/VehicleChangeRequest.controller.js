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
exports.create = async (req, res) => {
  console.log("Request Data:", req.body);

  // Validate request
  try {
    // Check if BookingID already exists
    const existingBooking = await VehicleAllotment.findOne({
      where: { BookingID: req.body.BookingID },
    });
    if (existingBooking) {
      return res.status(400).json({
        message: "Vehicle Allotment request already raised for this Booking!",
      });
    }
    const genReqNo = generateAllotReqNo();
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
    const newVehicleAllotment = await VehicleAllotment.create(
      vehicleAllotmentData
    );

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
    const vehicleAllotmentData = await VehicleChangeRequest.findAll({
      where: { BranchID: extractedBranchIDs },
      attributes: [
        "VehicleChngReqID",
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
        "FinanceLoanID",
        "ApprovedEmpID",
        "CancelledEmpID",
        "Remarks",
        "ChangeStatus",
        "IsActive",
        "Status",
        "CreatedDate",
        "ModifiedDate",
      ],
      include: [
        {
          model: NewCarBookings, // Assuming the related model name is Booking
          as: "AllotChngBookingID",
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
          as: "AllotChngCustomerID",
          attributes: ["FirstName", "Email"], // Example fields
        },
        {
          model: ModelMaster,
          as: "AllotChngModelMasterID",
          attributes: ["ModelMasterID", "ModelDescription"], // Example fields
        },
        {
          model: VariantMaster,
          as: "AllotChngVariantID",
          attributes: ["VariantID", "VariantCode"], // Example fields
        },
        {
          model: ColourMaster,
          as: "AllotChngColourID",
          attributes: ["ColourID", "ColourDescription"], // Example fields
        },
        {
          model: FuelType,
          as: "AllotChngFuelTypeID",
          attributes: ["FuelTypeID", "FuelTypeName"], // Example fields
        },
        {
          model: Transmission,
          as: "AllotChngTransmissionID",
          attributes: ["TransmissionID", "TransmissionCode"], // Example fields
        },
        {
          model: BranchMaster,
          as: "AllotChngBranchID",
          attributes: ["BranchID", "BranchName"], // Example fields
        },
        {
          model: UserMaster,
          as: "AllotChngSPID",
          attributes: ["UserID", "UserName", "EmpID"], // Example fields for sales person
        },
        {
          model: UserMaster,
          as: "AllotChngTLID",
          attributes: ["UserID", "UserName", "EmpID"], // Example fields for team lead
        },
        {
          model: UserMaster,
          as: "AllotChngEmpID",
          attributes: ["UserID", "UserName", "EmpID"], // Example fields for team lead
        },
        {
          model: FinanceLoanApplication,
          as: "AllotChngFinanceLoanID",
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
      VehicleChngReqID: item.VehicleChngReqID,
      ReqNo: item.ReqNo,
      ReqDate: item.ReqDate,
      // OnRoadPrice: item.OnRoadPrice,
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
      FinanceLoanID: item.FinanceLoanID,
      ApprovedEmpID: item.ApprovedEmpID,
      CancelledEmpID: item.CancelledEmpID,
      Remarks: item.Remarks,
      IsActive: item.IsActive,
      Status: item.Status,
      CreatedDate: item.CreatedDate,
      ModifiedDate: item.ModifiedDate,
      BookingNo: item.AllotChngBookingID
        ? item.AllotChngBookingID.BookingNo
        : null,
      CustFirstName: item.AllotChngBookingID
        ? item.AllotChngBookingID.FirstName
        : null,
      CustLastName: item.AllotChngBookingID
        ? item.AllotChngBookingID.LastName
        : null,
      CustPhoneNo: item.AllotChngBookingID
        ? item.AllotChngBookingID.PhoneNo
        : null,
      CustEmail: item.AllotChngCustomerID
        ? item.AllotChngCustomerID.Email
        : null,
      ModelName: item.AllotChngModelMasterID
        ? item.AllotChngModelMasterID.ModelDescription
        : null,
      VariantCode: item.AllotChngVariantID
        ? item.AllotChngVariantID.VariantCode
        : null,
      ColourName: item.AllotChngColourID
        ? item.AllotChngColourID.ColourDescription
        : null,
      FuelTypeName: item.AllotChngFuelTypeID
        ? item.AllotChngFuelTypeID.FuelTypeName
        : null,
      TransmissionCode: item.AllotChngTransmissionID
        ? item.AllotChngTransmissionID.TransmissionCode
        : null,
      BranchName: item.AllotChngBranchID
        ? item.AllotChngBranchID.BranchName
        : null,
      SalesPersonName: item.AllotChngSPID ? item.AllotChngSPID.UserName : null,
      SalesPersonEmpID: item.AllotChngSPID ? item.AllotChngSPID.EmpID : null,
      TeamLeadName: item.AllotChngTLID ? item.AllotChngTLID.UserName : null,
      TeamLeadEmpID: item.AllotChngTLID ? item.AllotChngTLID.EmpID : null,
      Category: item.AllotChngFinanceLoanID
        ? item.AllotChngFinanceLoanID.Category
        : null,
      SanctionAmount: item.AllotChngFinanceLoanID
        ? item.AllotChngFinanceLoanID.SanctionAmount
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
    const vehicleAllotmentData = await VehicleChangeRequest.findOne({
      where: { VehicleChngReqID: req.params.id }, // Find the record by AllotmentReqID (from the URL parameter)
      attributes: [
        "VehicleChngReqID",
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
        "FinanceLoanID",
        "ApprovedEmpID",
        "CancelledEmpID",
        "Remarks",
        "ChangeStatus",
        "IsActive",
        "Status",
        "CreatedDate",
        "ModifiedDate",
      ],
      include: [
        {
          model: NewCarBookings, // Assuming the related model name is Booking
          as: "AllotChngBookingID",
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
          as: "AllotChngCustomerID",
          attributes: ["FirstName", "Email"], // Example fields
        },
        {
          model: ModelMaster,
          as: "AllotChngModelMasterID",
          attributes: ["ModelMasterID", "ModelDescription"], // Example fields
        },
        {
          model: VariantMaster,
          as: "AllotChngVariantID",
          attributes: ["VariantID", "VariantCode"], // Example fields
        },
        {
          model: ColourMaster,
          as: "AllotChngColourID",
          attributes: ["ColourID", "ColourDescription"], // Example fields
        },
        {
          model: FuelType,
          as: "AllotChngFuelTypeID",
          attributes: ["FuelTypeID", "FuelTypeName"], // Example fields
        },
        {
          model: Transmission,
          as: "AllotChngTransmissionID",
          attributes: ["TransmissionID", "TransmissionCode"], // Example fields
        },
        {
          model: BranchMaster,
          as: "AllotChngBranchID",
          attributes: ["BranchID", "BranchName"], // Example fields
        },
        {
          model: UserMaster,
          as: "AllotChngSPID",
          attributes: ["UserID", "UserName", "EmpID"], // Example fields for sales person
        },
        {
          model: UserMaster,
          as: "AllotChngTLID",
          attributes: ["UserID", "UserName", "EmpID"], // Example fields for team lead
        },
        {
          model: UserMaster,
          as: "AllotChngEmpID",
          attributes: ["UserID", "UserName", "EmpID"], // Example fields for team lead
        },
        {
          model: FinanceLoanApplication,
          as: "AllotChngFinanceLoanID",
          attributes: ["FinanceLoanID", "Category", "SanctionAmount"], // Example fields
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
      VehicleChngReqID: vehicleAllotmentData.VehicleChngReqID,
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
      PurchaseID: vehicleAllotmentData.PurchaseID,
      ExchangeID: vehicleAllotmentData.ExchangeID,
      FinanceLoanID: vehicleAllotmentData.FinanceLoanID,
      ApprovedEmpID: vehicleAllotmentData.ApprovedEmpID,
      CancelledEmpID: vehicleAllotmentData.CancelledEmpID,
      Remarks: vehicleAllotmentData.Remarks,
      IsActive: vehicleAllotmentData.IsActive,
      Status: vehicleAllotmentData.Status,
      CreatedDate: vehicleAllotmentData.CreatedDate,
      ModifiedDate: vehicleAllotmentData.ModifiedDate,
      // Combine relevant data from the included models
      BookingNo: vehicleAllotmentData.AllotChngBookingID
        ? vehicleAllotmentData.AllotChngBookingID.BookingNo
        : null,
      CustomerName: vehicleAllotmentData.AllotChngCustomerID
        ? vehicleAllotmentData.AllotChngCustomerID.FirstName
        : null,
      CustomerEmail: vehicleAllotmentData.AllotChngCustomerID
        ? vehicleAllotmentData.AllotChngCustomerID.Email
        : null,
      ModelName: vehicleAllotmentData.AllotChngModelMasterID
        ? vehicleAllotmentData.AllotChngModelMasterID.ModelDescription
        : null,
      VariantCode: vehicleAllotmentData.AllotChngVariantID
        ? vehicleAllotmentData.AllotChngVariantID.VariantCode
        : null,
      ColourName: vehicleAllotmentData.AllotChngColourID
        ? vehicleAllotmentData.AllotChngColourID.ColourDescription
        : null,
      FuelTypeName: vehicleAllotmentData.AllotChngFuelTypeID
        ? vehicleAllotmentData.AllotChngFuelTypeID.FuelTypeName
        : null,
      TransmissionCode: vehicleAllotmentData.AllotChngTransmissionID
        ? vehicleAllotmentData.AllotChngTransmissionID.TransmissionCode
        : null,
      BranchName: vehicleAllotmentData.AllotChngBranchID
        ? vehicleAllotmentData.AllotChngBranchID.BranchName
        : null,
      SalesPersonName: vehicleAllotmentData.AllotChngSPID
        ? vehicleAllotmentData.AllotChngSPID.UserName
        : null,
      SalesPersonEmpID: vehicleAllotmentData.AllotChngSPID
        ? vehicleAllotmentData.AllotChngSPID.EmpID
        : null,
      TeamLeadName: vehicleAllotmentData.AllotChngTLID
        ? vehicleAllotmentData.AllotChngTLID.UserName
        : null,
      TeamLeadEmpID: vehicleAllotmentData.AllotChngTLID
        ? vehicleAllotmentData.AllotChngTLID.EmpID
        : null,
      Category: vehicleAllotmentData.AllotChngFinanceLoanID
        ? vehicleAllotmentData.AllotChngFinanceLoanID.Category
        : null,
      SanctionAmount: vehicleAllotmentData.AllotChngFinanceLoanID
        ? vehicleAllotmentData.AllotChngFinanceLoanID.SanctionAmount
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

// Update Change Request for Web
exports.ChngReqUpdateWeb = async (req, res) => {
  const { ReqID, BookingID, Remarks, Status, UserID } = req.body; // The new values to be updated
  const transaction = await Seq.transaction();
  const now = new Date();
  try {
    if (!ReqID) {
      return res.status(400).json({ message: "ReqID is required." });
    }
    if (!Status) {
      return res.status(400).json({ message: "Status is required." });
    }
    if (!UserID) {
      return res.status(400).json({ message: "UserID is required." });
    }

    // console.log("Request Body:", req.body);
    let updateData = await VehicleChangeRequest.findOne({
      where: { VehicleChngReqID: ReqID },
      transaction,
    });

    if (!updateData) {
      await transaction.rollback();
      return res
        .status(404)
        .json({ message: "Data not found for provided ReqID." });
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

    // Only Web can approve
    if (Status === "Approved") {
      updateData.ChangeStatus = Status;
      updateData.ApprovedEmpID = UserID;
      updateData.Remarks = Remarks;
      updateData.ModifiedDate = now;
      await updateData.save({ transaction });

      const genReqNo = await generateAllotReqNo();

      // Prepare the data for VehicleAllotment creation
      const vehicleAllotmentData = {
        ReqNo: genReqNo || req.body.ReqNo || null,
        ReqDate: req.body.ReqDate || now,
        OnRoadPrice: req.body.OnRoadPrice || null,
        BookingID: updateData?.BookingID || null,
        CustomerID: updateData?.CustomerID || null,
        ModelMasterID: updateData?.ModelMasterID || null,
        VariantID: updateData?.VariantID || null,
        ColourID: updateData?.ColourID || null,
        FuelTypeID: updateData?.FuelTypeID || null,
        TransmissionID: updateData?.TransmissionID || null,
        BranchID: updateData?.BranchID || null,
        SalesPersonID: updateData?.SalesPersonID || null,
        TeamLeadID: updateData?.TeamLeadID || null,
        PurchaseID: req.body.PurchaseID || null,
        ExchangeID: req.body.ExchangeID || null,
        FinanceLoanID: updateData?.FinanceLoanID || null,
        AllottedEmpID: null,
        RevokedEmpID: null,
        VehicleChngReqID: updateData?.VehicleChngReqID || null,
        AllotmentValidFrom: req.body.AllotmentValidFrom || null,
        AllotmentValidTill: req.body.AllotmentValidTill || null,
        FIFOPosition: req.body.FIFOPosition || null,
        PaymentReceived: req.body.PaymentReceived || null,
        Remarks: req.body.Remarks || null,
        AllotmentStatus: "Pending",
        IsActive: req.body.IsActive || true,
        Status: req.body.Status || "Active",
      };

      await VehicleAllotment.create(vehicleAllotmentData, { transaction });
    }

    // Commit the transaction
    await transaction.commit();

    // Send back the updated record
    res.json({
      message: "Data updated successfully.",
      updatedRecord: updateData,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error updating vehicle change request data:", error);

    if (error.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message:
          "Database error occurred while updating vehicle change request data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    res.status(500).json({
      message:
        "Failed to update vehicle change request data. Please try again later.",
    });
  }
};

// Find a VehicleAllotment with an id for WEB
exports.getDataforChangeApproval = async (req, res) => {
  try {
    const Id = req.params.id;
    if (!Id) {
      return res.status(400).send({ message: "ID is required" });
    }
    // Fetch a single vehicle allotment record by its AllotmentReqID with related data from other models
    const vehicleAllotmentData = await VehicleChangeRequest.findOne({
      where: { VehicleChngReqID: Id }, // Find the record by AllotmentReqID (from the URL parameter)
      attributes: [
        "VehicleChngReqID",
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
        "Remarks",
        // "AllotmentStatus",
        // "IsActive",
        "Status",
        "CreatedDate",
        // "ModifiedDate",
      ],
      include: [
        {
          model: NewCarBookings, // Related model for Booking
          as: "AllotChngBookingID",
          attributes: [
            "BookingID",
            "BookingNo", // Adding BookingNo field
            "CustomerID",
            "Title",
            "FirstName",
            "LastName", // Adding LastName field
            "PhoneNo",
            "OfficeNo",
            "Email",
            "Gender",
            "DOB",
            "DateOfAnniversary",
            "Occupation",
            "Company",
            "Address",
            "PINCode",
            "District",
            "State",
            "ModelName", // Adding ModelName field
            "ColourName", // Adding ColourName field
            "VariantName", // Adding VariantName field
            "Transmission", // Adding VariantName field
            "Fuel", // Adding VariantName field
            "BranchName",
            "BookingTime",
            "BookingStatus",
            "Exchange",
          ], // Include relevant fields from Booking
        },
        {
          model: CustomerMaster,
          as: "AllotChngCustomerID",
          attributes: ["CustID", "CustomerID"], // Include relevant fields from Customer
        },
        {
          model: ModelMaster,
          as: "AllotChngModelMasterID",
          attributes: ["ModelMasterID", "ModelCode", "ModelDescription"], // Include relevant fields from ModelMaster
        },
        {
          model: VariantMaster,
          as: "AllotChngVariantID",
          attributes: ["VariantID", "VariantCode"], // Include relevant fields from VariantMaster
        },
        {
          model: ColourMaster,
          as: "AllotChngColourID",
          attributes: ["ColourID", "ColourCode", "ColourDescription"], // Include relevant fields from ColourMaster
        },
        {
          model: FuelType,
          as: "AllotChngFuelTypeID",
          attributes: ["FuelTypeID", "FuelTypeName"], // Include relevant fields from FuelType
        },
        {
          model: Transmission,
          as: "AllotChngTransmissionID",
          attributes: ["TransmissionID", "TransmissionCode"], // Include relevant fields from Transmission
        },
        {
          model: BranchMaster,
          as: "AllotChngBranchID",
          attributes: ["BranchID", "BranchCode", "BranchName"], // Include relevant fields from BranchMaster
        },
        {
          model: UserMaster,
          as: "AllotChngSPID",
          attributes: ["UserID", "UserName", "EmpID"], // Include relevant fields from SalesPerson
        },
        {
          model: UserMaster,
          as: "AllotChngTLID",
          attributes: ["UserID", "UserName", "EmpID"], // Include relevant fields from TeamLead
        },
        // {
        //   model: VehicleStock,
        //   as: "AllotPurchaseID",
        //   attributes: ["UserID", "PurchaseID", "EngineNo"], // Include relevant fields from VehicleStock
        // },
        {
          model: FinanceLoanApplication,
          as: "AllotChngFinanceLoanID",
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
      where: { BookingID: vehicleAllotmentData.AllotChngBookingID.BookingID },
      attributes: ["FinanceLoanID", "FinAppID"],
    });
    // console.log("test1", financeData.FinAppID);

    // Check if financeData is null before accessing FinAppID
    if (financeData && financeData.FinAppID) {
      finTracking = await getFinanceTracking(financeData.FinAppID);
    } else {
      const pendingFinanceAppData = await FinanceApplication.findOne({
        where: { BookingID: vehicleAllotmentData.AllotChngBookingID.BookingID },
        attributes: ["FinAppID"],
      });

      if (pendingFinanceAppData && pendingFinanceAppData.FinAppID) {
        finTracking = await getFinanceTracking(pendingFinanceAppData.FinAppID);
      }
    }

    // Map the data for response, combining relevant fields from related models
    const combinedData = {
      VehicleChngReqID: vehicleAllotmentData.VehicleChngReqID,
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
      Status: vehicleAllotmentData.Status,
      // IsActive: vehicleAllotmentData.IsActive,
      // Status: vehicleAllotmentData.Status,
      CreatedDate: vehicleAllotmentData.CreatedDate,
      // ModifiedDate: vehicleAllotmentData.ModifiedDate,
      // Combine relevant data from the included models
      BookingNo: vehicleAllotmentData.AllotChngBookingID
        ? vehicleAllotmentData.AllotChngBookingID.BookingNo
        : null,
      Title: vehicleAllotmentData.AllotChngBookingID
        ? vehicleAllotmentData.AllotChngBookingID.Title
        : null,
      CustFirstName: vehicleAllotmentData.AllotChngBookingID
        ? vehicleAllotmentData.AllotChngBookingID.FirstName
        : null,
      CustLastName: vehicleAllotmentData.AllotChngBookingID
        ? vehicleAllotmentData.AllotChngBookingID.LastName
        : null,
      CustPhoneNo: vehicleAllotmentData.AllotChngBookingID
        ? vehicleAllotmentData.AllotChngBookingID.PhoneNo
        : null,
      OfficeNo: vehicleAllotmentData.AllotChngBookingID
        ? vehicleAllotmentData.AllotChngBookingID.OfficeNo
        : null,
      CustEmail: vehicleAllotmentData.AllotChngBookingID
        ? vehicleAllotmentData.AllotChngBookingID.Email
        : null,
      Gender: vehicleAllotmentData.AllotChngBookingID
        ? vehicleAllotmentData.AllotChngBookingID.Gender
        : null,
      DOB: vehicleAllotmentData.AllotChngBookingID
        ? vehicleAllotmentData.AllotChngBookingID.DOB
        : null,
      DateOfAnniversary: vehicleAllotmentData.AllotChngBookingID
        ? vehicleAllotmentData.AllotChngBookingID.DateOfAnniversary
        : null,
      Occupation: vehicleAllotmentData.AllotChngBookingID
        ? vehicleAllotmentData.AllotChngBookingID.Occupation
        : null,
      Company: vehicleAllotmentData.AllotChngBookingID
        ? vehicleAllotmentData.AllotChngBookingID.Company
        : null,
      Address: vehicleAllotmentData.AllotChngBookingID
        ? vehicleAllotmentData.AllotChngBookingID.Address
        : null,
      PINCode: vehicleAllotmentData.AllotChngBookingID
        ? vehicleAllotmentData.AllotChngBookingID.PINCode
        : null,
      District: vehicleAllotmentData.AllotChngBookingID
        ? vehicleAllotmentData.AllotChngBookingID.District
        : null,
      State: vehicleAllotmentData.AllotChngBookingID
        ? vehicleAllotmentData.AllotChngBookingID.State
        : null,
      ModelName: vehicleAllotmentData.AllotChngModelMasterID
        ? vehicleAllotmentData.AllotChngModelMasterID.ModelDescription
        : null,
      VariantCode: vehicleAllotmentData.AllotChngVariantID
        ? vehicleAllotmentData.AllotChngVariantID.VariantCode
        : null,
      ColourName: vehicleAllotmentData.AllotChngColourID
        ? vehicleAllotmentData.AllotChngColourID.ColourDescription
        : null,
      FuelTypeName: vehicleAllotmentData.AllotChngFuelTypeID
        ? vehicleAllotmentData.AllotChngFuelTypeID.FuelTypeName
        : null,
      TransmissionCode: vehicleAllotmentData.AllotChngTransmissionID
        ? vehicleAllotmentData.AllotChngTransmissionID.TransmissionCode
        : null,
      BookingTime: vehicleAllotmentData.AllotChngBookingID
        ? vehicleAllotmentData.AllotChngBookingID.BookingTime
        : null,
      Exchange: vehicleAllotmentData.AllotChngBookingID
        ? vehicleAllotmentData.AllotChngBookingID.Exchange
        : null,
      BranchCode: vehicleAllotmentData.AllotChngBranchID
        ? vehicleAllotmentData.AllotChngBranchID.BranchCode
        : null,
      BranchName: vehicleAllotmentData.AllotChngBranchID
        ? vehicleAllotmentData.AllotChngBranchID.BranchName
        : null,
      SalesPersonName: vehicleAllotmentData.AllotChngSPID
        ? vehicleAllotmentData.AllotChngSPID.UserName
        : null,
      SalesPersonEmpID: vehicleAllotmentData.AllotChngSPID
        ? vehicleAllotmentData.AllotChngSPID.EmpID
        : null,
      TeamLeadName: vehicleAllotmentData.AllotChngTLID
        ? vehicleAllotmentData.AllotChngTLID.UserName
        : null,
      TeamLeadEmpID: vehicleAllotmentData.AllotChngTLID
        ? vehicleAllotmentData.AllotChngTLID.EmpID
        : null,
      // PurchaseNo: vehicleAllotmentData.AllotPurchaseID
      //   ? vehicleAllotmentData.AllotPurchaseID.PurchaseID
      //   : null,
      // EngineNo: vehicleAllotmentData.AllotPurchaseID
      //   ? vehicleAllotmentData.AllotPurchaseID.EngineNo
      //   : null,
      Category: vehicleAllotmentData.AllotChngFinanceLoanID
        ? vehicleAllotmentData.AllotChngFinanceLoanID.Category
        : null,
      SanctionAmount: vehicleAllotmentData.AllotChngFinanceLoanID
        ? vehicleAllotmentData.AllotChngFinanceLoanID.SanctionAmount
        : null,
      RefAppNo: vehicleAllotmentData.AllotChngFinanceLoanID
        ? vehicleAllotmentData.AllotChngFinanceLoanID.RefAppNo
        : null,
      FinancierID: vehicleAllotmentData.AllotChngFinanceLoanID
        ? vehicleAllotmentData.AllotChngFinanceLoanID.FinancierID
        : null,
      FinancierName:
        vehicleAllotmentData.AllotChngFinanceLoanID &&
        vehicleAllotmentData.AllotChngFinanceLoanID.FLAFinancierID
          ? vehicleAllotmentData.AllotChngFinanceLoanID.FLAFinancierID
              .FinancierName
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
        VariantCode: vehicleAllotmentData.AllotChngVariantID.VariantCode,
        ColourCode: vehicleAllotmentData.AllotChngColourID.ColourCode,
        ModelCode: vehicleAllotmentData.AllotChngModelMasterID.ModelCode,
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

    // Build the reqData array with the required structure
    const reqData = [
      {
        Model: combinedData.ModelName || null,
        Variant: combinedData.VariantCode || null,
        Colour: combinedData.ColourName || null,
      },
      {
        Model: vehicleAllotmentData.AllotChngBookingID
          ? vehicleAllotmentData.AllotChngBookingID.ModelName
          : null,
        Variant: vehicleAllotmentData.AllotChngBookingID
          ? vehicleAllotmentData.AllotChngBookingID.VariantName
          : null,
        Colour: vehicleAllotmentData.AllotChngBookingID
          ? vehicleAllotmentData.AllotChngBookingID.ColourName
          : null,
      },
    ];

    // Send the combined data as a response
    res.json({
      CustomerData: combinedData,
      paymentData: recieptData,
      VehicleAllotment: formattedStockData,
      FinanceTracking: finTracking,
      ReqChangeTable: reqData,
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
exports.FIFOOrderforVCRWeb = async (req, res) => {
  try {
    const Id = req.params.id;
    if (!Id) {
      return res.status(400).send({ message: "ID is required" });
    }

    // Fetch vehicle allotment data by AllotmentReqID
    const vehicleAllotmentData = await VehicleChangeRequest.findOne({
      where: { VehicleChngReqID: Id },
      attributes: [
        "VehicleChngReqID",
        "ModelMasterID",
        "VariantID",
        "ColourID",
        "FuelTypeID",
        "TransmissionID",
      ],
      include: [
        {
          model: ModelMaster,
          as: "AllotChngModelMasterID",
          attributes: ["ModelDescription"],
        },
        {
          model: VariantMaster,
          as: "AllotChngVariantID",
          attributes: ["VariantCode"],
        },
        {
          model: ColourMaster,
          as: "AllotChngColourID",
          attributes: ["ColourDescription"],
        },
        {
          model: FuelType,
          as: "AllotChngFuelTypeID",
          attributes: ["FuelTypeName"],
        },
        {
          model: Transmission,
          as: "AllotChngTransmissionID",
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
        ModelName: vehicleAllotmentData.AllotChngModelMasterID.ModelDescription,
        VariantName: vehicleAllotmentData.AllotChngVariantID.VariantCode,
        ColourName: vehicleAllotmentData.AllotChngColourID.ColourDescription,
        Transmission:
          vehicleAllotmentData.AllotChngTransmissionID.TransmissionCode,
        Fuel: vehicleAllotmentData.AllotChngFuelTypeID.FuelTypeName,
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
