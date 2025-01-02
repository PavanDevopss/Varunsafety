/* eslint-disable no-dupe-keys */
/* eslint-disable no-unused-vars */
require("dotenv").config();
const db = require("../models");
const BranchGates = db.branchgates;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;
const BranchTypes = db.branchtypes;
const BranchMaster = db.branchmaster;
const BranchGatesMapping = db.branchgatesmapping;

// Basic CRUD API
// Create and Save a new BranchGates
exports.create = async (req, res) => {
  try {
    // Create a BranchGates
    const branchGates = {
      BranchTypeID: req.body.BranchTypeID,
      BranchID: req.body.BranchID,
      City: req.body.City,
      IsActive: req.body.IsActive || true,
      Status: req.body.Status || "Active",
    };

    // Save BranchGates in the database
    const newBranchGates = await BranchGates.create(branchGates);

    return res.status(201).json(newBranchGates); // Send the newly created BranchGates as response
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

    console.error("Error creating BranchGates:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Retrieve all BranchGates from the database.
exports.findAll = async (req, res) => {
  try {
    // Fetch all BranchGates data
    const branchGatesData = await BranchGates.findAll({
      attributes: [
        "BranchGateID",
        "BranchTypeID",
        "BranchID",
        "City",
        "IsActive",
        "Status",
      ],
      include: [
        {
          model: BranchTypes,
          as: "BGSBranchTypeID",
          attributes: ["BranchTypeName"],
        },
        {
          model: BranchMaster,
          as: "BGSBranchID",
          attributes: [
            "BranchCode",
            "BranchName",
            "State",
            "District",
            "Status",
          ],
        },
      ],
      order: [["CreatedDate", "DESC"]],
    });

    // Fetch all BranchGatesMapping data
    const branchGatesMappingData = await BranchGatesMapping.findAll({
      attributes: ["BranchGateID"],
    });

    // Count mappings for each BranchGateID
    const mappingsCount = branchGatesMappingData.reduce((acc, mapping) => {
      acc[mapping.BranchGateID] = (acc[mapping.BranchGateID] || 0) + 1;
      return acc;
    }, {});

    // Combine the data
    const combinedData = branchGatesData.map((item) => ({
      BranchGateID: item.BranchGateID,
      BranchTypeID: item.BranchTypeID,
      BranchID: item.BranchID,
      City: item.City,
      BranchTypeName: item.BGSBranchTypeID
        ? item.BGSBranchTypeID.BranchTypeName
        : null,
      BranchCode: item.BGSBranchID ? item.BGSBranchID.BranchCode : null,
      BranchName: item.BGSBranchID ? item.BGSBranchID.BranchName : null,
      State: item.BGSBranchID ? item.BGSBranchID.State : null,
      District: item.BGSBranchID ? item.BGSBranchID.District : null,
      BranchStatus: item.BGSBranchID ? item.BGSBranchID.Status : null,
      MappingsCount: mappingsCount[item.BranchGateID] || 0, // Default to 0 if no mappings
      IsActive: item.IsActive,
      Status: item.Status,
    }));

    // Check if data is empty
    if (combinedData.length === 0) {
      return res.status(404).json({
        message: "No BranchGates data found.",
      });
    }

    // Send the combined data as response
    res.json(combinedData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while retrieving BranchGates data.",
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
    console.error("Error retrieving BranchGates data:", error);
    return res.status(500).json({
      message: "Failed to retrieve BranchGates data. Please try again later.",
    });
  }
};

// Find a single BranchGates with an id
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
    const branchGatesData = await BranchGates.findOne({
      where: { BranchGateID: id },
      attributes: [
        "BranchGateID",
        "BranchTypeID",
        "BranchID",
        "City",
        "IsActive",
        "Status",
      ],
      include: [
        {
          model: BranchTypes,
          as: "BGSBranchTypeID",
          attributes: ["BranchTypeName"],
        },
        {
          model: BranchMaster,
          as: "BGSBranchID",
          attributes: [
            "BranchCode",
            "BranchName",
            "State",
            "District",
            "Status",
          ],
        },
      ],
      order: [["CreatedDate", "DESC"]],
    });

    // Check if data is empty
    if (!branchGatesData || branchGatesData.length === 0) {
      return res.status(404).json({
        message: "No BranchGates data found.",
      });
    }
    // Prepare the response data
    const responseData = {
      BranchGateID: branchGatesData.BranchGateID,
      BranchTypeID: branchGatesData.BranchTypeID,
      BranchID: branchGatesData.BranchID,
      City: branchGatesData.City,
      BranchTypeName: branchGatesData.BGSBranchTypeID
        ? branchGatesData.BGSBranchTypeID.BranchTypeName
        : null,
      BranchCode: branchGatesData.BGSBranchID
        ? branchGatesData.BGSBranchID.BranchCode
        : null,
      BranchName: branchGatesData.BGSBranchID
        ? branchGatesData.BGSBranchID.BranchName
        : null,
      State: branchGatesData.BGSBranchID
        ? branchGatesData.BGSBranchID.State
        : null,
      District: branchGatesData.BGSBranchID
        ? branchGatesData.BGSBranchID.District
        : null,
      BranchStatus: branchGatesData.BGSBranchID
        ? branchGatesData.BGSBranchID.Status
        : null,

      IsActive: branchGatesData.IsActive,
      Status: branchGatesData.Status,
    };

    // Send the response data
    res.json(responseData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while retrieving BranchGates data.",
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
    console.error("Error retrieving BranchGates data:", error);
    return res.status(500).json({
      message: "Failed to retrieve BranchGates data. Please try again later.",
    });
  }
};

// Update a BranchGates by the id in the request
exports.updateByPk = async (req, res) => {
  try {
    // Find the division by ID
    const branchGateID = req.params.id;

    // Validate the ID parameter
    if (!branchGateID) {
      return res.status(400).json({ message: "ID parameter is required." });
    }

    let branchGates = await BranchGates.findByPk(branchGateID);

    if (!branchGates) {
      return res.status(404).json({ message: "BranchGates not found" });
    }

    // Update fields
    branchGates.BranchTypeID =
      req.body.BranchTypeID || branchGates.BranchTypeID;
    branchGates.BranchID = req.body.BranchID || branchGates.BranchID;
    branchGates.City = req.body.City || branchGates.City;
    branchGates.IsActive = req.body.IsActive || branchGates.IsActive;
    branchGates.Status = req.body.Status || branchGates.Status;
    branchGates.ModifiedDate = new Date();

    // Save updated BranchGates in the database
    const updatedBranchGates = await branchGates.save();

    return res.status(200).json(updatedBranchGates); // Send the updated BranchGates as response
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
        message: "Database error occurred while updating BranchGates.",
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
    console.error("Error updating BranchGates:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a BranchGates with the specified id in the request
exports.deleteById = async (req, res) => {
  const id = req.params.id;

  try {
    // Validate the ID parameter
    if (!id) {
      return res.status(400).json({ message: "ID parameter is required." });
    }

    // Find the model by ID
    const branchGates = await BranchGates.findByPk(id);

    // Check if the model exists
    if (!branchGates) {
      return res
        .status(404)
        .json({ message: "BranchGates not found with id: " + id });
    }

    // Delete the model
    await branchGates.destroy();

    // Send a success message
    res.status(200).json({
      message: "BranchGates with id: " + id + " deleted successfully",
    });
  } catch (err) {
    // Handle errors based on specific types
    if (err.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while deleting BranchGates.",
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
    console.error("Error deleting BranchGates:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
