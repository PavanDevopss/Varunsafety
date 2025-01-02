/* eslint-disable no-dupe-keys */
/* eslint-disable no-unused-vars */
const db = require("../models");
const APIActionMaster = db.apiactionmaster;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;

// Basic CRUD API
// Create and Save a new APIActionMaster
exports.create = async (req, res) => {
  console.log("ActionName:", req.body.ActionName);

  try {
    // Validate request
    if (!req.body.ActionName) {
      return res.status(400).json({ message: "ActionName cannot be empty" });
    }
    if (!/^[a-zA-Z ]*$/.test(req.body.ActionName)) {
      console.log("Validation failed: ActionName contains special characters.");
      return res.status(400).json({
        message: "ActionName should contain only letters",
      });
    }
    // Check if ActionName already exists
    const existingModel = await APIActionMaster.findOne({
      where: { ActionName: req.body.ActionName },
    });
    if (existingModel) {
      return res.status(400).json({ message: "ActionName already exists" });
    }

    // Create an APIActionMaster
    const apiActionMaster = {
      ActionID: req.body.ActionID,
      ActionName: req.body.ActionName,
      IsActive: req.body.IsActive || true,
      Status: req.body.Status || "Active",
    };

    // Save APIActionMaster in the database
    const newAPIActionMaster = await APIActionMaster.create(apiActionMaster);

    return res.status(201).json(newAPIActionMaster); // Send the newly created APIActionMaster as response
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

    console.error("Error creating APIActionMaster:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Retrieve all APIActionMaster from the database.
exports.findAll = async (req, res) => {
  try {
    // Fetch all action data
    const actionData = await APIActionMaster.findAll({
      attributes: ["ActionID", "ActionName", "IsActive", "Status"],
      order: [
        ["ActionName", "ASC"], // Order by ModelDescription in ascending order
      ],
    });

    // Check if data is empty
    if (!actionData || actionData.length === 0) {
      return res.status(404).json({
        message: "No action data found.",
      });
    }

    // Map the data for response
    const combinedData = actionData.map((item) => ({
      ActionID: item.ActionID,
      ActionName: item.ActionName,
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
        message: "Database error occurred while retrieving action data.",
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
    console.error("Error retrieving action data:", error);
    return res.status(500).json({
      message: "Failed to retrieve action data. Please try again later.",
    });
  }
};

// Find a single APIActionMaster with an id
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;

    // Validate the ID parameter
    if (!id) {
      return res.status(400).json({
        message: "ID parameter is required.",
      });
    }

    // Fetch the action data by primary key
    const actionData = await APIActionMaster.findOne({
      where: {
        ActionID: id,
      },
      attributes: ["ActionID", "ActionName", "IsActive", "Status"],
    });

    // Check if data is found
    if (!actionData) {
      return res.status(404).json({
        message: "Action data not found.",
      });
    }

    // Prepare the response data
    const responseData = {
      ActionID: actionData.ActionID,
      ActionName: actionData.ActionName,
      IsActive: actionData.IsActive,
      Status: actionData.Status,
    };

    // Send the response data
    res.json(responseData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while retrieving action data.",
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
    console.error("Error retrieving action data:", error);
    return res.status(500).json({
      message: "Failed to retrieve action data. Please try again later.",
    });
  }
};

// Update a APIActionMaster by the id in the request
exports.updateByPk = async (req, res) => {
  console.log("ActionName:", req.body.ActionName);

  try {
    // Validate request
    if (!req.body.ActionName) {
      return res.status(400).json({ message: "ActionName cannot be empty" });
    }
    if (!/^[a-zA-Z ]*$/.test(req.body.ActionName)) {
      console.log("Validation failed: ActionName contains special characters.");
      return res.status(400).json({
        message: "ActionName should contain only letters",
      });
    }
    // Find the action by ID
    const actionId = req.params.id;

    // Validate the ID parameter
    if (!actionId) {
      return res.status(400).json({ message: "ID parameter is required." });
    }

    let actionMaster = await APIActionMaster.findByPk(actionId);

    if (!actionMaster) {
      return res.status(404).json({ message: "APIActionMaster not found" });
    }

    // Update fields
    actionMaster.ActionName = req.body.ActionName;
    actionMaster.IsActive = req.body.IsActive || actionMaster.IsActive;
    actionMaster.Status = req.body.Status || actionMaster.Status;
    actionMaster.ModifiedDate = new Date();

    // Save updated APIActionMaster in the database
    const updatedActionMaster = await actionMaster.save();

    return res.status(200).json(updatedActionMaster); // Send the updated APIActionMaster as response
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
        message: "Database error occurred while updating APIActionMaster.",
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
    console.error("Error updating APIActionMaster:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a APIActionMaster with the specified id in the request
exports.deleteById = async (req, res) => {
  const id = req.params.id;

  try {
    // Validate the ID parameter
    if (!id) {
      return res.status(400).json({ message: "ID parameter is required." });
    }

    // Find the action by ID
    const actionMaster = await APIActionMaster.findByPk(id);

    // Check if the action exists
    if (!actionMaster) {
      return res
        .status(404)
        .json({ message: "APIActionMaster not found with id: " + id });
    }

    // Delete the action
    await actionMaster.destroy();

    // Send a success message
    res.status(200).json({
      message: "APIActionMaster with id: " + id + " deleted successfully",
    });
  } catch (err) {
    // Handle errors based on specific types
    if (err.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while deleting APIActionMaster.",
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
    console.error("Error deleting APIActionMaster:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
