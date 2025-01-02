/* eslint-disable no-dupe-keys */
/* eslint-disable no-unused-vars */
require("dotenv").config();
const db = require("../models");
const DivisionMaster = db.divisionmaster;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;
const ParentCompany = db.parentcompany;

// Basic CRUD API
// Create and Save a new DivisionMaster
exports.create = async (req, res) => {
  console.log("DivisionName:", req.body.DivisionName);

  try {
    // Validate request
    if (!req.body.DivisionName) {
      return res.status(400).json({ message: "DivisionName cannot be empty" });
    }
    if (!/^[a-zA-Z ]*$/.test(req.body.DivisionName)) {
      console.log(
        "Validation failed: DivisionName contains special characters."
      );
      return res.status(400).json({
        message: "DivisionName should contain only letters",
      });
    }
    // Check if DivisionName already exists
    const existingModel = await DivisionMaster.findOne({
      where: { DivisionName: req.body.DivisionName },
    });
    if (existingModel) {
      return res.status(400).json({ message: "DivisionName already exists" });
    }

    // Create a DivisionMaster
    const divisionMaster = {
      DivisionName: req.body.DivisionName,
      ParentCmpyID: req.body.ParentCmpyID,
      IsActive: req.body.IsActive || true,
      Status: req.body.Status || "Active",
    };

    // Save DivisionMaster in the database
    const newDivisionMaster = await DivisionMaster.create(divisionMaster);

    return res.status(201).json(newDivisionMaster); // Send the newly created DivisionMaster as response
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

    console.error("Error creating DivisionMaster:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Retrieve all DivisionMasters from the database.
exports.findAll = async (req, res) => {
  try {
    console.log("UserName", process.env.USERNAME);
    // Fetch all division data with included parent company data
    const divisionNameData = await DivisionMaster.findAll({
      attributes: ["DivisionID", "DivisionName", "IsActive", "Status"],
      include: [
        {
          model: ParentCompany,
          as: "DMParentCmpyID",
          attributes: ["ParentCmpyID", "ParentCmpyName"],
        },
      ],
      order: [
        ["DivisionName", "ASC"], // Order by ModelDescription in ascending order
      ],
    });

    // Check if data is empty
    if (!divisionNameData || divisionNameData.length === 0) {
      return res.status(404).json({
        message: "No division name data found.",
      });
    }

    // Map the data for response
    const combinedData = divisionNameData.map((item) => ({
      DivisionID: item.DivisionID,
      DivisionName: item.DivisionName,
      ParentCmpyID: item.DMParentCmpyID
        ? item.DMParentCmpyID.ParentCmpyID
        : null,
      ParentCmpyName: item.DMParentCmpyID
        ? item.DMParentCmpyID.ParentCmpyName
        : null,
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

// Find a single DivisionMaster with an id
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
    const divisionNameData = await DivisionMaster.findOne({
      where: {
        DivisionID: id,
      },
      attributes: ["DivisionID", "DivisionName", "IsActive", "Status"],
      include: [
        {
          model: ParentCompany,
          as: "DMParentCmpyID",
          attributes: ["ParentCmpyID", "ParentCmpyName"],
        },
      ],
    });

    // Check if data is found
    if (!divisionNameData) {
      return res.status(404).json({
        message: "Division name data not found.",
      });
    }

    // Prepare the response data
    const responseData = {
      DivisionID: divisionNameData.DivisionID,
      DivisionName: divisionNameData.DivisionName,
      ParentCmpyID: divisionNameData.DMParentCmpyID
        ? divisionNameData.DMParentCmpyID.ParentCmpyID
        : null,
      ParentCmpyName: divisionNameData.DMParentCmpyID
        ? divisionNameData.DMParentCmpyID.ParentCmpyName
        : null,
      IsActive: divisionNameData.IsActive,
      Status: divisionNameData.Status,
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

// Update a DivisionMaster by the id in the request
exports.updateByPk = async (req, res) => {
  console.log("DivisionName:", req.body.DivisionName);

  try {
    // Validate request
    if (!req.body.DivisionName) {
      return res.status(400).json({ message: "DivisionName cannot be empty" });
    }
    if (!/^[a-zA-Z ]*$/.test(req.body.DivisionName)) {
      console.log(
        "Validation failed: DivisionName contains special characters."
      );
      return res.status(400).json({
        message: "DivisionName should contain only letters",
      });
    }
    // Find the division by ID
    const divisionId = req.params.id;

    // Validate the ID parameter
    if (!divisionId) {
      return res.status(400).json({ message: "ID parameter is required." });
    }

    let divisionMaster = await DivisionMaster.findByPk(divisionId);

    if (!divisionMaster) {
      return res.status(404).json({ message: "DivisionMaster not found" });
    }

    // Update fields
    divisionMaster.DivisionName = req.body.DivisionName;
    divisionMaster.ParentCmpyID =
      req.body.ParentCmpyID || divisionMaster.ParentCmpyID;
    divisionMaster.IsActive = req.body.IsActive || divisionMaster.IsActive;
    divisionMaster.Status = req.body.Status || divisionMaster.Status;
    divisionMaster.ModifiedDate = new Date();

    // Save updated DivisionMaster in the database
    const updatedDivisionMaster = await divisionMaster.save();

    return res.status(200).json(updatedDivisionMaster); // Send the updated DivisionMaster as response
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
        message: "Database error occurred while updating DivisionMaster.",
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
    console.error("Error updating DivisionMaster:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a DivisionMaster with the specified id in the request
exports.deleteById = async (req, res) => {
  const id = req.params.id;

  try {
    // Validate the ID parameter
    if (!id) {
      return res.status(400).json({ message: "ID parameter is required." });
    }

    // Find the model by ID
    const divisionMaster = await DivisionMaster.findByPk(id);

    // Check if the model exists
    if (!divisionMaster) {
      return res
        .status(404)
        .json({ message: "DivisionMaster not found with id: " + id });
    }

    // Delete the model
    await divisionMaster.destroy();

    // Send a success message
    res.status(200).json({
      message: "DivisionMaster with id: " + id + " deleted successfully",
    });
  } catch (err) {
    // Handle errors based on specific types
    if (err.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while deleting DivisionMaster.",
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
    console.error("Error deleting DivisionMaster:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
