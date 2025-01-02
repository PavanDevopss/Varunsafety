/* eslint-disable no-unused-vars */
const db = require("../models");
const NationMaster = db.nationmaster;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;

// Basic CRUD API
// Create and Save a new OEMMaster
exports.create = async (req, res) => {
  console.log("NationName:", req.body.NationName);

  try {
    // Validate request
    if (!req.body.NationName) {
      return res.status(400).json({ message: "NationName cannot be empty" });
    }
    if (!/^[a-zA-Z ]*$/.test(req.body.NationName)) {
      console.log("Validation failed: NationName contains special characters.");
      return res.status(400).json({
        message: "NationName should contain only letters",
      });
    }
    // Check if NationName already exists
    const existingModel = await NationMaster.findOne({
      where: { NationName: req.body.NationName },
    });
    if (existingModel) {
      return res.status(400).json({ message: "NationName already exists" });
    }

    // Create a new NationMaster
    const newNationMaster = await NationMaster.create({
      NationName: req.body.NationName,
      IsActive: req.body.IsActive || true,
      Status: req.body.Status || "Active",
    });

    // Save NationMaster in database
    console.log("New NationMaster created:", newNationMaster);

    // Send the newly created NationMaster as response
    return res.status(201).json(newNationMaster);
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
        message: "Database error occurred while creating NationMaster.",
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
    console.error("Error creating NationMaster:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Retrieve all OEMMasters from the database.
exports.findAll = async (req, res) => {
  try {
    // Fetch all nation data
    const nationData = await NationMaster.findAll({
      attributes: ["NationID", "NationName", "IsActive", "Status"],
      order: [
        ["NationName", "ASC"], // Order by ModelDescription in ascending order
      ],
    });

    // Check if data is empty
    if (!nationData || nationData.length === 0) {
      return res.status(404).json({
        message: "No nation data found.",
      });
    }

    // Map the data for response
    const combinedData = nationData.map((item) => ({
      NationID: item.NationID,
      NationName: item.NationName,
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
        message: "Database error occurred while retrieving nation data.",
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
    console.error("Error retrieving nation data:", error);
    return res.status(500).json({
      message: "Failed to retrieve nation data. Please try again later.",
    });
  }
};

// Find a single OEMMaster with an id
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;

    // Fetch the nation data by primary key
    const nationData = await NationMaster.findOne({
      where: {
        NationID: id,
      },
      attributes: ["NationID", "NationName", "IsActive", "Status"],
    });

    // Check if data is found
    if (!nationData) {
      return res.status(404).json({
        message: "Nation data not found.",
      });
    }

    // Send the response data
    res.json(nationData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while retrieving nation data.",
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
    console.error("Error retrieving nation data:", error);
    return res.status(500).json({
      message: "Failed to retrieve nation data. Please try again later.",
    });
  }
};

// Update a OEMMaster by the id in the request
exports.updateByPk = async (req, res) => {
  console.log("NationName:", req.body.NationName);

  try {
    // Validate request
    if (!req.body.NationName) {
      return res.status(400).json({ message: "NationName cannot be empty" });
    }
    if (!/^[a-zA-Z ]*$/.test(req.body.NationName)) {
      console.log("Validation failed: NationName contains special characters.");
      return res.status(400).json({
        message: "NationName should contain only letters",
      });
    }
    // Find the NationMaster by ID
    const nationID = req.params.id;
    let nationMaster = await NationMaster.findByPk(nationID);

    // Check if NationMaster exists
    if (!nationMaster) {
      return res.status(404).json({ message: "NationMaster not found" });
    }

    // Update fields
    nationMaster.NationName = req.body.NationName;
    nationMaster.IsActive = req.body.IsActive || nationMaster.IsActive;
    nationMaster.Status = req.body.Status || nationMaster.Status;
    nationMaster.ModifiedDate = new Date();

    // Save updated NationMaster in the database
    const updatedNationMaster = await nationMaster.save();

    // Send the updated NationMaster as response
    return res.status(200).json(updatedNationMaster);
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
        message: "Database error occurred while updating NationMaster.",
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
    console.error("Error updating NationMaster:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a OEMMaster with the specified id in the request
exports.deleteById = async (req, res) => {
  const id = req.params.id;

  try {
    // Find the model by ID
    const nationMaster = await NationMaster.findByPk(id);

    // Check if the model exists
    if (!nationMaster) {
      return res
        .status(404)
        .json({ message: "NationMaster not found with id: " + id });
    }

    // Delete the model
    await nationMaster.destroy();

    // Send a success message
    return res.status(200).json({
      message: "NationMaster with id: " + id + " deleted successfully",
    });
  } catch (err) {
    // Handle errors based on specific types
    if (err.name === "SequelizeForeignKeyConstraintError") {
      // Handle foreign key constraint errors
      return res.status(409).json({
        message:
          "Cannot delete. This NationMaster is referenced by other records.",
        details: err.message,
      });
    }

    if (err.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while deleting NationMaster.",
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
    console.error("Error deleting NationMaster:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
