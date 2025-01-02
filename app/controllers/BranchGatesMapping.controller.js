/* eslint-disable no-dupe-keys */
/* eslint-disable no-unused-vars */
require("dotenv").config();
const db = require("../models");
const BranchGatesMapping = db.branchgatesmapping;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;
const BranchGates = db.branchgates;

// Basic CRUD API
// Create and Save a new BranchGatesMapping
exports.create = async (req, res) => {
  try {
    const existingBranchGates = await BranchGates.findOne({
      where: { BranchGateID: req.body.BranchGateID },
    });

    if (!existingBranchGates) {
      return res.status(400).json({
        message: "No existingBranchGates found with the provided BranchGateID",
      });
    }
    // Check if DivisionName already exists
    const existingModel = await BranchGatesMapping.findOne({
      where: { GateName: req.body.GateName },
    });
    if (existingModel) {
      return res.status(400).json({ message: "GateName already exists" });
    }
    const newBranchGatesMapping = await BranchGatesMapping.create({
      BranchGateID: req.body.BranchGateID,
      GateName: req.body.GateName,
      GateType: req.body.GateType,
      IsActive: req.body.IsActive || true,
      Status: req.body.Status || "Active",
    });

    // Save CompanyGSTMaster in database
    console.log("New newBranchGatesMapping created:", newBranchGatesMapping);

    return res.status(201).json(newBranchGatesMapping);
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

    console.error("Error creating BranchGatesMapping:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Retrieve all BranchGatesMapping from the database.
exports.findAll = async (req, res) => {
  try {
    const { BranchGateID } = req.query;
    // Fetch all BranchGatesMapping data with included parent company data
    const branchGatesMappingData = await BranchGatesMapping.findAll({
      where: { BranchGateID },
      attributes: [
        "BranchGatesMappingID",
        "BranchGateID",
        "GateName",
        "GateType",
        "IsActive",
        "Status",
      ],
      order: [["CreatedDate", "DESC"]],
    });

    // Check if data is empty
    if (!branchGatesMappingData || branchGatesMappingData.length === 0) {
      return res.status(404).json({
        message: "No BranchGatesMapping data found.",
      });
    }
    res.json(branchGatesMappingData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message:
          "Database error occurred while retrieving BranchGatesMapping data.",
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
    console.error("Error retrieving BranchGatesMapping data:", error);
    return res.status(500).json({
      message:
        "Failed to retrieve BranchGatesMapping data. Please try again later.",
    });
  }
};

// Find a single BranchGatesMapping with an id
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;

    // Validate the ID parameter
    if (!id) {
      return res.status(400).json({
        message: "ID parameter is required.",
      });
    }

    const branchGatesMappingData = await BranchGatesMapping.findOne({
      where: { BranchGatesMappingID: id },
      attributes: [
        "BranchGatesMappingID",
        "BranchGateID",
        "GateName",
        "GateType",
        "IsActive",
        "Status",
      ],
      order: [["CreatedDate", "DESC"]],
    });

    // Check if data is empty
    if (!branchGatesMappingData || branchGatesMappingData.length === 0) {
      return res.status(404).json({
        message: "No BranchGatesMapping data found.",
      });
    }
    res.json(branchGatesMappingData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message:
          "Database error occurred while retrieving BranchGatesMapping data.",
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
    console.error("Error retrieving BranchGatesMapping data:", error);
    return res.status(500).json({
      message:
        "Failed to retrieve BranchGatesMapping data. Please try again later.",
    });
  }
};

// Update a BranchGatesMapping by the id in the request
exports.updateByPk = async (req, res) => {
  try {
    const branchGateMappingID = req.body.BranchGatesMappingID;

    // Check if an update or create operation is intended
    if (branchGateMappingID === undefined) {
      return res
        .status(400)
        .json({ message: "BranchGatesMappingID is required." });
    }

    let branchGatesMapping;

    if (branchGateMappingID) {
      // If BranchGatesMappingID is provided, attempt to find the record
      branchGatesMapping = await BranchGatesMapping.findByPk(
        branchGateMappingID
      );

      if (branchGatesMapping) {
        // Update existing record
        branchGatesMapping.GateName =
          req.body.GateName || branchGatesMapping.GateName;
        branchGatesMapping.GateType =
          req.body.GateType || branchGatesMapping.GateType;
        branchGatesMapping.IsActive =
          req.body.IsActive !== undefined
            ? req.body.IsActive
            : branchGatesMapping.IsActive; // Allow `false` values for IsActive
        branchGatesMapping.Status =
          req.body.Status || branchGatesMapping.Status;
        branchGatesMapping.ModifiedDate = new Date();

        // Save the updated record
        const updatedBranchGatesMapping = await branchGatesMapping.save();

        return res.status(200).json({
          message: "BranchGatesMapping updated successfully.",
          data: updatedBranchGatesMapping,
        });
      } else {
        return res.status(404).json({
          message: `BranchGatesMapping with ID ${branchGateMappingID} not found.`,
        });
      }
    } else {
      // Create a new record if BranchGatesMappingID is null
      const newBranchGatesMapping = await BranchGatesMapping.create({
        BranchGateID: req.body.BranchGateID,
        GateName: req.body.GateName,
        GateType: req.body.GateType,
        IsActive: req.body.IsActive !== undefined ? req.body.IsActive : true, // Default to `true` if not provided
        Status: req.body.Status || "Active", // Default to `Active` if not provided
        CreatedDate: new Date(),
      });

      return res.status(201).json({
        message: "BranchGatesMapping created successfully.",
        data: newBranchGatesMapping,
      });
    }
  } catch (err) {
    // Handle specific Sequelize errors
    if (err.name === "SequelizeValidationError") {
      return res.status(400).json({
        message: "Validation error.",
        details: err.errors.map((e) => e.message),
      });
    }

    if (err.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message: "Database error occurred while processing BranchGatesMapping.",
        details: err.message,
      });
    }

    if (err.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: err.message,
      });
    }

    // General error handling
    console.error("Error processing BranchGatesMapping:", err);
    return res.status(500).json({
      message: "Internal server error. Please try again later.",
    });
  }
};

// Delete a BranchGatesMapping with the specified id in the request
exports.deleteById = async (req, res) => {
  const id = req.params.id;

  try {
    // Validate the ID parameter
    if (!id) {
      return res.status(400).json({ message: "ID parameter is required." });
    }

    // Find the model by ID
    const branchGatesMapping = await BranchGatesMapping.findByPk(id);

    // Check if the model exists
    if (!branchGatesMapping) {
      return res
        .status(404)
        .json({ message: "BranchGatesMapping not found with id: " + id });
    }

    // Delete the model
    await branchGatesMapping.destroy();

    // Send a success message
    res.status(200).json({
      message: "BranchGatesMapping with id: " + id + " deleted successfully",
    });
  } catch (err) {
    // Handle errors based on specific types
    if (err.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while deleting BranchGatesMapping.",
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
    console.error("Error deleting BranchGatesMapping:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
