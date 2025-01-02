/* eslint-disable no-dupe-keys */
/* eslint-disable no-unused-vars */
require("dotenv").config();
const db = require("../models");
const FinStatusTracking = db.finstatustracking;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;
const FinStatusUpdate = db.finstatusupdate;

// Basic CRUD API
// Create and Save a new FinStatusTracking
exports.create = async (req, res) => {
  try {
    // Create a FinStatusTracking
    const statusTracking = {
      FinStatusID: req.body.FinStatusID,
      CurrentStage: req.body.CurrentStage,
      StatusDate: req.body.StatusDate || new Date(),
      Active: req.body.ParentCmpyID || true,
      Status: req.body.Status || "Active",
    };

    // Save FinStatusTracking in the database
    const newStatusTracking = await FinStatusTracking.create(statusTracking);

    return res.status(201).json(newStatusTracking); // Send the newly created FinStatusTracking as response
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

// Retrieve all FinStatusTracking from the database.
exports.findAll = async (req, res) => {
  try {
    const { FinStatusID } = req.body;

    // Fetch all status tracking data with included status update data
    const statusTrackingData = await FinStatusTracking.findAll({
      attributes: [
        "FinStatusTrackID",
        "FinStatusID",
        "CurrentStage",
        "StatusDate",
        "IsActive",
        "Status",
      ],
      include: [
        {
          model: FinStatusUpdate,
          as: "FSTFinStatusID",
          attributes: ["CurrentStage", "StatusDate"],
        },
      ],
      where: {
        FinStatusID: FinStatusID, // Apply the where condition based on FinStatusID
      },
      order: [
        ["StatusDate", "ASC"], // Order by StatusDate in ascending order
      ],
    });

    // Check if data is empty
    if (!statusTrackingData || statusTrackingData.length === 0) {
      return res.status(404).json({
        message: "No status tracking data found.",
      });
    }

    // Map the data for response
    const combinedData = statusTrackingData.map((item) => ({
      FinStatusTrackID: item.FinStatusTrackID,
      FinStatusID: item.FinStatusID,
      CurrentStage: item.CurrentStage,
      StatusDate: item.StatusDate,
      IsActive: item.IsActive,
      Status: item.Status,
      FSTCurrentStage: item.FSTFinStatusID
        ? item.FSTFinStatusID.CurrentStage
        : null,
      FSTStatusDate: item.FSTFinStatusID
        ? item.FSTFinStatusID.StatusDate
        : null,
    }));

    // Send the combined data as response
    res.json(combinedData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message:
          "Database error occurred while retrieving status tracking data.",
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
    console.error("Error retrieving status tracking data:", error);
    return res.status(500).json({
      message:
        "Failed to retrieve status tracking data. Please try again later.",
    });
  }
};

// Find a single FinStatusTracking record with an id
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;

    // Validate the ID parameter
    if (!id) {
      return res.status(400).json({
        message: "ID parameter is required.",
      });
    }

    // Fetch the status tracking data by primary key with included status update data
    const statusTrackingData = await FinStatusTracking.findOne({
      where: {
        FinStatusTrackID: id, // Filter by the provided id
      },
      attributes: [
        "FinStatusTrackID",
        "FinStatusID",
        "CurrentStage",
        "StatusDate",
        "IsActive",
        "Status",
      ],
      include: [
        {
          model: FinStatusUpdate,
          as: "FSTFinStatusID",
          attributes: ["CurrentStage", "StatusDate"],
        },
      ],
    });

    // Check if data is found
    if (!statusTrackingData) {
      return res.status(404).json({
        message: "Status tracking data not found.",
      });
    }

    // Prepare the response data
    const responseData = {
      FinStatusTrackID: statusTrackingData.FinStatusTrackID,
      FinStatusID: statusTrackingData.FinStatusID,
      CurrentStage: statusTrackingData.CurrentStage,
      StatusDate: statusTrackingData.StatusDate,
      IsActive: statusTrackingData.IsActive,
      Status: statusTrackingData.Status,
      FSTCurrentStage: statusTrackingData.FSTFinStatusID
        ? statusTrackingData.FSTFinStatusID.CurrentStage
        : null,
      FSTStatusDate: statusTrackingData.FSTFinStatusID
        ? statusTrackingData.FSTFinStatusID.StatusDate
        : null,
    };

    // Send the response data
    res.json(responseData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message:
          "Database error occurred while retrieving status tracking data.",
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
    console.error("Error retrieving status tracking data:", error);
    return res.status(500).json({
      message:
        "Failed to retrieve status tracking data. Please try again later.",
    });
  }
};

// Update a FinStatusTracking by the id in the request
exports.updateByPk = async (req, res) => {
  console.log("CurrentStage:", req.body.CurrentStage);

  try {
    // Validate the request body
    //   if (!req.body.CurrentStage) {
    //     return res.status(400).json({ message: "CurrentStage cannot be empty" });
    //   }

    //   // Ensure CurrentStage only contains letters and spaces
    //   if (!/^[a-zA-Z ]*$/.test(req.body.CurrentStage)) {
    //     console.log("Validation failed: CurrentStage contains special characters.");
    //     return res.status(400).json({
    //       message: "CurrentStage should contain only letters",
    //     });
    //   }

    // Retrieve the FinStatusID from request parameters
    const finStatusId = req.params.id;

    // Validate the ID parameter
    if (!finStatusId) {
      return res.status(400).json({ message: "ID parameter is required." });
    }

    // Find the record by its primary key
    const finStatusTracking = await FinStatusTracking.findByPk(finStatusId);

    // Check if the record exists
    if (!finStatusTracking) {
      return res.status(404).json({ message: "finStatusTracking not found." });
    }

    // Update fields with the provided values, or retain current values if not provided
    finStatusTracking.CurrentStage = req.body.CurrentStage;
    finStatusTracking.StatusDate =
      req.body.StatusDate ?? finStatusTracking.StatusDate;
    finStatusTracking.Status = req.body.Status ?? finStatusTracking.Status;
    finStatusTracking.IsActive =
      req.body.IsActive ?? finStatusTracking.IsActive;
    finStatusTracking.ModifiedDate = new Date();

    // Save the updated record in the database
    const updatedFinStatusTracking = await finStatusTracking.save();

    // Send the updated record as the response
    return res.status(200).json(updatedFinStatusTracking);
  } catch (err) {
    // Handle different types of errors
    if (err.name === "SequelizeValidationError") {
      return res.status(400).json({
        message: "Validation error",
        details: err.errors.map((e) => e.message),
      });
    }

    if (err.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message: "Database error occurred while updating FinStatusTracking.",
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
    console.error("Error updating FinStatusTracking:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a FinStatusTracking with the specified id in the request
exports.deleteById = async (req, res) => {
  const id = req.params.id;

  try {
    // Validate the ID parameter
    if (!id) {
      return res.status(400).json({ message: "ID parameter is required." });
    }

    // Find the model by ID
    const finstatusTracking = await FinStatusTracking.findByPk(id);

    // Check if the model exists
    if (!finstatusTracking) {
      return res
        .status(404)
        .json({ message: "FinStatusTracking not found with id: " + id });
    }

    // Delete the model
    await finstatusTracking.destroy();

    // Send a success message
    res.status(200).json({
      message: "FinStatusTracking with id: " + id + " deleted successfully",
    });
  } catch (err) {
    // Handle errors based on specific types
    if (err.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while deleting FinStatusTracking.",
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
    console.error("Error deleting FinStatusTracking:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
