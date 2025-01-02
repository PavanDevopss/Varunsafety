/* eslint-disable no-dupe-keys */
/* eslint-disable no-unused-vars */
require("dotenv").config();
const db = require("../models");
const IndustryMaster = db.industrymaster;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;
const ParentCompany = db.parentcompany;

// Basic CRUD API
// Create and Save a new IndustryMaster
exports.create = async (req, res) => {
  console.log("IndustryName:", req.body.IndustryName);

  try {
    // Validate request
    if (!req.body.IndustryName) {
      return res.status(400).json({ message: "IndustryName cannot be empty" });
    }
    if (!/^[a-zA-Z ]*$/.test(req.body.IndustryName)) {
      console.log(
        "Validation failed: IndustryName contains special characters."
      );
      return res.status(400).json({
        message: "IndustryName should contain only letters",
      });
    }
    // Check if IndustryName already exists
    const existingModel = await IndustryMaster.findOne({
      where: { IndustryName: req.body.IndustryName },
    });
    if (existingModel) {
      return res.status(400).json({ message: "Industry Name already exists" });
    }

    // Create a IndustryMaster
    const industryMaster = {
      IndustryName: req.body.IndustryName,
      IsActive: req.body.IsActive || true,
      Status: req.body.Status || "Active",
    };

    // Save IndustryMaster in the database
    const newIndustryMaster = await IndustryMaster.create(industryMaster);

    return res.status(201).json(newIndustryMaster); // Send the newly created IndustryMaster as response
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

    console.error("Error creating IndustryMaster:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Retrieve all IndustryMasters from the database.
exports.findAll = async (req, res) => {
  try {
    console.log("UserName", process.env.USERNAME);
    // Fetch all division data with included parent company data
    const industryNameData = await IndustryMaster.findAll({
      attributes: ["IndustryID", "IndustryName", "IsActive", "Status"],
      order: [
        ["IndustryName", "ASC"], // Order by ModelDescription in ascending order
      ],
    });

    // Check if data is empty
    if (!industryNameData || industryNameData.length === 0) {
      return res.status(404).json({
        message: "No division name data found.",
      });
    }

    // Map the data for response
    const combinedData = industryNameData.map((item) => ({
      IndustryID: item.IndustryID,
      IndustryName: item.IndustryName,
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
        message: "Database error occurred while retrieving industry name data.",
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
    console.error("Error retrieving industry name data:", error);
    return res.status(500).json({
      message: "Failed to retrieve industry name data. Please try again later.",
    });
  }
};

// Find a single IndustryMaster with an id
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
    const industryNameData = await IndustryMaster.findOne({
      where: {
        IndustryID: id,
      },
      attributes: ["IndustryID", "IndustryName", "IsActive", "Status"],
    });

    // Check if data is found
    if (!industryNameData) {
      return res.status(404).json({
        message: "Industry name data not found.",
      });
    }

    // Prepare the response data
    const responseData = {
      IndustryID: industryNameData.IndustryID,
      IndustryName: industryNameData.IndustryName,
      IsActive: industryNameData.IsActive,
      Status: industryNameData.Status,
    };

    // Send the response data
    res.json(responseData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while retrieving industry name data.",
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
    console.error("Error retrieving industry name data:", error);
    return res.status(500).json({
      message: "Failed to retrieve industry name data. Please try again later.",
    });
  }
};

// Update a IndustryMaster by the id in the request
exports.updateByPk = async (req, res) => {
  console.log("IndustryName:", req.body.IndustryName);

  try {
    // Validate request
    if (!req.body.IndustryName) {
      return res.status(400).json({ message: "IndustryName cannot be empty" });
    }
    if (!/^[a-zA-Z ]*$/.test(req.body.IndustryName)) {
      console.log(
        "Validation failed: IndustryName contains special characters."
      );
      return res.status(400).json({
        message: "IndustryName should contain only letters",
      });
    }
    // Find the division by ID
    const industryId = req.params.id;

    // Validate the ID parameter
    if (!industryId) {
      return res.status(400).json({ message: "ID parameter is required." });
    }

    let industryMaster = await IndustryMaster.findByPk(industryId);

    if (!industryMaster) {
      return res.status(404).json({ message: "IndustryMaster not found" });
    }

    // Update fields
    industryMaster.IndustryName = req.body.IndustryName;
    industryMaster.ParentCmpyID = industryMaster.IsActive =
      req.body.IsActive || industryMaster.IsActive;
    industryMaster.Status = req.body.Status || industryMaster.Status;
    industryMaster.ModifiedDate = new Date();

    // Save updated IndustryMaster in the database
    const updatedIndustryMaster = await industryMaster.save();

    return res.status(200).json(updatedIndustryMaster); // Send the updated IndustryMaster as response
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
        message: "Database error occurred while updating IndustryMaster.",
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
    console.error("Error updating IndustryMaster:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a IndustryMaster with the specified id in the request
exports.deleteById = async (req, res) => {
  const id = req.params.id;

  try {
    // Validate the ID parameter
    if (!id) {
      return res.status(400).json({ message: "ID parameter is required." });
    }

    // Find the model by ID
    const industryMaster = await IndustryMaster.findByPk(id);

    // Check if the model exists
    if (!industryMaster) {
      return res
        .status(404)
        .json({ message: "IndustryMaster not found with id: " + id });
    }

    // Delete the model
    await industryMaster.destroy();

    // Send a success message
    res.status(200).json({
      message: "IndustryMaster with id: " + id + " deleted successfully",
    });
  } catch (err) {
    // Handle errors based on specific types
    if (err.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while deleting IndustryMaster.",
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
    console.error("Error deleting IndustryMaster:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
