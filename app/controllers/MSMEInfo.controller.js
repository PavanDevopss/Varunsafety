/* eslint-disable no-dupe-keys */
/* eslint-disable no-unused-vars */
require("dotenv").config();
const db = require("../models");
const MSMEInfo = db.msmeInfo;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;
// const CustomerMAster = db.customermaster;

// Basic CRUD API
// Create and Save a new MSMEInfo
exports.create = async (req, res) => {
  try {
    // Validate request
    if (!req.body.CustomerID) {
      return res.status(400).json({ message: "CustomerID cannot be empty" });
    }
    //   if (!req.body.RegistrationType) {
    //     return res
    //       .status(400)
    //       .json({ message: "RegistrationType cannot be empty" });
    //   }
    //   if (!req.body.NameOfEnterprise) {
    //     return res
    //       .status(400)
    //       .json({ message: "NameOfEnterprise cannot be empty" });
    //   }
    //   if (!req.body.RegistrationNo) {
    //     return res
    //       .status(400)
    //       .json({ message: "RegistrationNo cannot be empty" });
    //   }

    // Additional validation example: Check if RegistrationNo is unique
    const existingMSME = await MSMEInfo.findOne({
      where: { RegistrationNo: req.body.RegistrationNo },
    });
    if (existingMSME) {
      return res.status(400).json({
        message: "RegistrationNo already exists",
      });
    }

    // Create an MSMEInfo object
    const msmeInfo = {
      CustomerID: req.body.CustomerID,
      RegistrationType: req.body.RegistrationType,
      DateOfRegistration: req.body.DateOfRegistration || null,
      NameOfEnterprise: req.body.NameOfEnterprise,
      RegistrationNo: req.body.RegistrationNo,
      IsActive: req.body.IsActive !== undefined ? req.body.IsActive : true,
      Status: req.body.Status || "Active",
    };

    // Save MSMEInfo in the database
    const newMSMEInfo = await MSMEInfo.create(msmeInfo);

    return res.status(201).json(newMSMEInfo); // Send the newly created MSMEInfo as a response
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

    console.error("Error creating MSMEInfo:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Retrieve all MSMEInfo from the database.
exports.findAll = async (req, res) => {
  try {
    // Fetch all MSMEInfo data with included related data if necessary
    const msmeInfoData = await MSMEInfo.findAll({
      attributes: [
        "CustomerID",
        "RegistrationType",
        "DateOfRegistration",
        "NameOfEnterprise",
        "RegistrationNo",
        "IsActive",
        "Status",
        "CreatedDate",
        "ModifiedDate",
      ],
      order: [["CreatedDate", "ASC"]], // Order by NameOfEnterprise in ascending order
    });

    // Check if data is empty
    if (!msmeInfoData || msmeInfoData.length === 0) {
      return res.status(404).json({
        message: "No MSME information found.",
      });
    }

    // Map the data for response
    const combinedData = msmeInfoData.map((item) => ({
      CustomerID: item.CustomerID,
      RegistrationType: item.RegistrationType,
      DateOfRegistration: item.DateOfRegistration,
      NameOfEnterprise: item.NameOfEnterprise,
      RegistrationNo: item.RegistrationNo,
      IsActive: item.IsActive,
      Status: item.Status,
      CreatedDate: item.CreatedDate,
      ModifiedDate: item.ModifiedDate,
    }));

    // Send the combined data as response
    res.json(combinedData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while retrieving MSME information.",
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
    console.error("Error retrieving MSME information:", error);
    return res.status(500).json({
      message: "Failed to retrieve MSME information. Please try again later.",
    });
  }
};

// Find a single MSMEInfo with an id
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;

    // Validate the ID parameter
    if (!id) {
      return res.status(400).json({
        message: "ID parameter is required.",
      });
    }

    // Fetch the division data by primary key with included parent company data
    const msmeInfoData = await MSMEInfo.findOne({
      where: {
        MSMEID: id,
      },
      attributes: [
        "CustomerID",
        "RegistrationType",
        "DateOfRegistration",
        "NameOfEnterprise",
        "RegistrationNo",
        "IsActive",
        "Status",
      ],
    });

    // Check if data is found
    if (!msmeInfoData) {
      return res.status(404).json({
        message: "msmeInfo name data not found.",
      });
    }

    // Prepare the response data
    const responseData = {
      CustomerID: msmeInfoData.CustomerID,
      RegistrationType: msmeInfoData.RegistrationType,
      DateOfRegistration: msmeInfoData.DateOfRegistration,
      NameOfEnterprise: msmeInfoData.NameOfEnterprise,
      RegistrationNo: msmeInfoData.RegistrationNo,

      IsActive: msmeInfoData.IsActive,
      Status: msmeInfoData.Status,
    };

    // Send the response data
    res.json(responseData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while retrieving division name data.",
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
    console.error("Error retrieving division name data:", error);
    return res.status(500).json({
      message: "Failed to retrieve division name data. Please try again later.",
    });
  }
};

// Update a MSMEInfo by the id in the request
exports.updateByPk = async (req, res) => {
  try {
    // Validate request

    // Find the MSMEInfo by ID
    const MSMEID = req.params.id;

    // Validate the ID parameter
    if (!MSMEID) {
      return res.status(400).json({ message: "ID parameter is required." });
    }

    let msmeInfo = await MSMEInfo.findByPk(MSMEID);

    if (!msmeInfo) {
      return res.status(404).json({ message: "MSMEInfo not found" });
    }

    // Update fields
    msmeInfo.CustomerID = req.body.CustomerID || msmeInfo.CustomerID;
    msmeInfo.RegistrationType =
      req.body.RegistrationType || msmeInfo.RegistrationType;
    msmeInfo.DateOfRegistration =
      req.body.DateOfRegistration || msmeInfo.DateOfRegistration;
    msmeInfo.NameOfEnterprise =
      req.body.NameOfEnterprise || msmeInfo.NameOfEnterprise;
    msmeInfo.RegistrationNo =
      req.body.RegistrationNo || msmeInfo.RegistrationNo;
    msmeInfo.IsActive = req.body.IsActive || msmeInfo.IsActive;
    msmeInfo.Status = req.body.Status || msmeInfo.Status;
    msmeInfo.ModifiedDate = new Date();

    // Save updated DivisionMaster in the database
    const updatedMSMEInfo = await msmeInfo.save();

    return res.status(200).json(updatedMSMEInfo); // Send the updated DivisionMaster as response
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
        message: "Database error occurred while updating MSMEInfo.",
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
    console.error("Error updating MSMEInfo:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a MSMEInfo with the specified id in the request
exports.deleteById = async (req, res) => {
  const msmeID = req.params.id;

  try {
    // Validate the ID parameter
    if (!msmeID) {
      return res.status(400).json({ message: "ID parameter is required." });
    }

    // Find the model by ID
    const msmeInfo = await MSMEInfo.findByPk(msmeID);

    // Check if the model exists
    if (!msmeInfo) {
      return res
        .status(404)
        .json({ message: "MSMEInfo not found with id: " + msmeID });
    }

    // Delete the model
    await msmeInfo.destroy();

    // Send a success message
    res.status(200).json({
      message: "MSMEInfo with id: " + msmeID + " deleted successfully",
    });
  } catch (err) {
    // Handle errors based on specific types
    if (err.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while deleting MSMEInfo.",
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
    console.error("Error deleting MSMEInfo:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
