/* eslint-disable no-dupe-keys */
/* eslint-disable no-unused-vars */
require("dotenv").config();
const db = require("../models");
const TRProcess = db.trprocess;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;
const CompanyStates = db.companystates;

// Basic CRUD API
// Create and Save a new TRProcess
exports.create = async (req, res) => {
  try {
    // Create a TRProcess
    const trProcess = {
      CmpyStateID: req.body.CmpyStateID,
      RegistrationPortal: req.body.RegistrationPortal,
      RegistrationType: req.body.RegistrationType,
      SlabValue: req.body.SlabValue,
      TaxPeriod: req.body.TaxPeriod,
      VehicleClassification: req.body.VehicleClassification,
      ChargeType: req.body.ChargeType,
      TaxValue: req.body.TaxValue,
      TRCharges: req.body.TRCharges,
      PRCharges: req.body.PRCharges,
      Hypothecation: req.body.Hypothecation,
      HSPRCharge: req.body.HSPRCharge,
      RegistrationFee: req.body.RegistrationFee,
      OtherCharges: req.body.OtherCharges,
      IsActive: req.body.IsActive || true,
      Status: req.body.Status || "Active",
    };

    // Save TRProcess in the database
    const newTRProcess = await TRProcess.create(trProcess);

    return res.status(201).json(newTRProcess); // Send the newly created TRProcess as response
  } catch (err) {
    if (err.name === "SequelizeValidationError") {
      // Handle Sequelize validation errors
      return res.status(400).json({
        message: "Validation error",
        details: err.errors.map((e) => e.message),
      });
    }

    if (err.name === "SequelizeUniqueConstraintError") {
      // Handle unique constraint errors
      return res.status(400).json({
        message: "Unique constraint error",
        details: err.errors.map((e) => e.message),
      });
    }

    console.error("Error creating TRProcess:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Retrieve all TRProcesss from the database.
exports.findAll = async (req, res) => {
  try {
    // Fetch all TRProcesss with included CompanyStates data
    const trProcessData = await TRProcess.findAll({
      attributes: [
        "TRProcessID",
        "CmpyStateID",
        "RegistrationPortal",
        "RegistrationType",
        "SlabValue",
        "TaxPeriod",
        "VehicleClassification",
        "ChargeType",
        "TaxValue",
        "TRCharges",
        "PRCharges",
        "Hypothecation",
        "HSPRCharge",
        "RegistrationFee",
        "OtherCharges",
      ],
      include: [
        {
          model: CompanyStates,
          as: "TRCmpyStateID",
          attributes: ["CmpyStateName"],
        },
      ],
      order: [["CreatedDate", "DESC"]],
    });

    // Check if data is empty
    if (!trProcessData || trProcessData.length === 0) {
      return res.status(404).json({
        message: "No TRProcess data found.",
      });
    }

    // Map the data for response
    const combinedData = trProcessData.map((item) => ({
      TRProcessID: item.TRProcessID,
      DivisionName: item.DivisionName,
      CmpyStateID: item.CmpyStateID,
      CmpyStateName: item.TRCmpyStateID
        ? item.TRCmpyStateID.CmpyStateName
        : null,
      RegistrationPortal: item.RegistrationPortal,
      RegistrationType: item.RegistrationType,
      SlabValue: item.SlabValue,
      TaxPeriod: item.TaxPeriod,
      VehicleClassification: item.VehicleClassification,
      ChargeType: item.ChargeType,
      TaxValue: item.TaxValue,
      TRCharges: item.TRCharges,
      PRCharges: item.PRCharges,
      Hypothecation: item.Hypothecation,
      HSPRCharge: item.HSPRCharge,
      RegistrationFee: item.RegistrationFee,
      OtherCharges: item.OtherCharges,
      IsActive: item.IsActive,
      Status: item.Status,
    }));

    // Send the combined data as response
    res.json(combinedData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while retrieving TRProcess data.",
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

    // General error handling
    console.error("Error retrieving TRProcess data:", error);
    return res.status(500).json({
      message: "Failed to retrieve TRProcess data. Please try again later.",
    });
  }
};

// Find a single TRProcess with an id
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;

    // Validate the ID parameter
    if (!id) {
      return res.status(400).json({
        message: "ID parameter is required.",
      });
    }
    // Fetch all TRProcesss with included CompanyStates data
    const trProcessData = await TRProcess.findOne({
      where: { TRProcessID: id },
      attributes: [
        "TRProcessID",
        "CmpyStateID",
        "RegistrationPortal",
        "RegistrationType",
        "SlabValue",
        "TaxPeriod",
        "VehicleClassification",
        "ChargeType",
        "TaxValue",
        "TRCharges",
        "PRCharges",
        "Hypothecation",
        "HSPRCharge",
        "RegistrationFee",
        "OtherCharges",
      ],
      include: [
        {
          model: CompanyStates,
          as: "TRCmpyStateID",
          attributes: ["CmpyStateName"],
        },
      ],
      order: [["CreatedDate", "DESC"]],
    });

    // Check if data is empty
    if (!trProcessData || trProcessData.length === 0) {
      return res.status(404).json({
        message: "No TRProcess data found.",
      });
    }

    // Prepare the response data
    const responseData = {
      TRProcessID: trProcessData.TRProcessID,
      CmpyStateID: trProcessData.CmpyStateID,
      CmpyStateName: trProcessData.TRCmpyStateID
        ? trProcessData.TRCmpyStateID.CmpyStateName
        : null,
      RegistrationPortal: trProcessData.RegistrationPortal,
      RegistrationType: trProcessData.RegistrationType,
      SlabValue: trProcessData.SlabValue,
      TaxPeriod: trProcessData.TaxPeriod,
      VehicleClassification: trProcessData.VehicleClassification,
      ChargeType: trProcessData.ChargeType,
      TaxValue: trProcessData.TaxValue,
      TRCharges: trProcessData.TRCharges,
      PRCharges: trProcessData.PRCharges,
      Hypothecation: trProcessData.Hypothecation,
      HSPRCharge: trProcessData.HSPRCharge,
      RegistrationFee: trProcessData.RegistrationFee,
      OtherCharges: trProcessData.OtherCharges,
      IsActive: trProcessData.IsActive,
      Status: trProcessData.Status,
    };

    // Send the response data
    res.json(responseData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while retrieving TRProcess data.",
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

    // General error handling
    console.error("Error retrieving TRProcess data:", error);
    return res.status(500).json({
      message: "Failed to retrieve TRProcess data. Please try again later.",
    });
  }
};

// Update a TRProcess by the id in the request
exports.updateByPk = async (req, res) => {
  try {
    // Find the TRProcess by ID
    const trProcessId = req.params.id;

    // Validate the ID parameter
    if (!trProcessId) {
      return res.status(400).json({ message: "ID parameter is required." });
    }

    let trProcess = await TRProcess.findByPk(trProcessId);

    if (!trProcess) {
      return res.status(404).json({ message: "TRProcess not found" });
    }

    // Update fields
    // trProcess.TRProcessID = trProcess.TRProcessID;
    trProcess.CmpyStateID = req.body.CmpyStateID || trProcess.CmpyStateID;
    trProcess.RegistrationPortal =
      req.body.RegistrationPortal || trProcess.RegistrationPortal;
    trProcess.RegistrationType =
      req.body.RegistrationType || trProcess.RegistrationType;
    trProcess.SlabValue = req.body.SlabValue || trProcess.SlabValue;
    trProcess.TaxPeriod = req.body.TaxPeriod || trProcess.TaxPeriod;
    trProcess.VehicleClassification =
      req.body.VehicleClassification || trProcess.VehicleClassification;
    trProcess.ChargeType = req.body.ChargeType || trProcess.ChargeType;
    trProcess.TaxValue = req.body.TaxValue || trProcess.TaxValue;
    trProcess.TRCharges = req.body.TRCharges || trProcess.TRCharges;
    trProcess.PRCharges = req.body.PRCharges || trProcess.PRCharges;
    trProcess.Hypothecation = req.body.Hypothecation || trProcess.Hypothecation;
    trProcess.HSPRCharge = req.body.HSPRCharge || trProcess.HSPRCharge;
    trProcess.RegistrationFee =
      req.body.RegistrationFee || trProcess.RegistrationFee;
    trProcess.OtherCharges = req.body.OtherCharges || trProcess.OtherCharges;
    trProcess.IsActive = req.body.IsActive || trProcess.IsActive;
    trProcess.Status = req.body.Status || trProcess.Status;
    trProcess.ModifiedDate = new Date();

    // Save updated TRProcess in the database
    const updatedTRProcess = await trProcess.save();

    return res.status(200).json(updatedTRProcess); // Send the updated TRProcess as response
  } catch (err) {
    // Handle errors based on specific types
    if (err.name === "SequelizeValidationError") {
      // Handle Sequelize validation errors
      return res.status(400).json({
        message: "Validation error",
        details: err.errors.map((e) => e.message),
      });
    }

    if (err.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while updating TRProcess.",
        details: err.message,
      });
    }

    if (err.name === "SequelizeConnectionError") {
      // Handle connection errors
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: err.message,
      });
    }

    // General error handling
    console.error("Error updating TRProcess:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a TRProcess with the specified id in the request
exports.deleteById = async (req, res) => {
  const id = req.params.id;

  try {
    // Validate the ID parameter
    if (!id) {
      return res.status(400).json({ message: "ID parameter is required." });
    }

    // Find the model by ID
    const trProcess = await TRProcess.findByPk(id);

    // Check if the model exists
    if (!trProcess) {
      return res
        .status(404)
        .json({ message: "TRProcess not found with id: " + id });
    }

    // Delete the model
    await trProcess.destroy();

    // Send a success message
    res.status(200).json({
      message: "TRProcess with id: " + id + " deleted successfully",
    });
  } catch (err) {
    // Handle errors based on specific types
    if (err.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while deleting TRProcess.",
        details: err.message,
      });
    }

    if (err.name === "SequelizeConnectionError") {
      // Handle connection errors
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: err.message,
      });
    }

    // General error handling
    console.error("Error deleting TRProcess:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
