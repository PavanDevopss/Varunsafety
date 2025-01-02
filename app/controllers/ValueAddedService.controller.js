/* eslint-disable no-unused-vars */
const db = require("../models");
const ValueAddedService = db.valueaddedservice;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;

// Basic CRUD API
// Create and Save a new ValueAddedService
exports.create = async (req, res) => {
  console.log("Product Code:", req.body.ProductCode);

  try {
    // Validate request
    if (!/^[a-zA-Z0-9 ]*$/.test(req.body.ProductCode)) {
      return res.status(400).json({ message: "Product Code cannot be empty" });
    }
    if (!req.body.ProductName) {
      return res.status(400).json({ message: "Product Name cannot be empty" });
    }
    if (!/^[a-zA-Z ]*$/.test(req.body.ProductName)) {
      console.log(
        "Validation failed: ProductName contains special characters."
      );
      return res.status(400).json({
        message: "ProductName should contain only letters",
      });
    }
    // Check if ModelCode already exists
    const existingModel = await ValueAddedService.findOne({
      where: { ProductCode: req.body.ProductCode },
    });
    if (existingModel) {
      return res.status(400).json({ message: "Product Code already exists" });
    }

    // Create a model
    const valueaddedservice = {
      ProductName: req.body.ProductName,
      ProductCode: req.body.ProductCode,
      IsActive: req.body.IsActive || true,
      Status: req.body.Status || "Active",
    };

    // Save FuelTypes in the database
    const newValueAddedService = await ValueAddedService.create(
      valueaddedservice
    );

    return res.status(201).json(newValueAddedService); // Send the newly created FuelType as response
  } catch (err) {
    // Handle errors based on specific types
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

    if (err.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while creating ValueAddedService.",
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

    console.error("Error creating ValueAddedService:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Retrieve all ValueAddedService from the database.
exports.findAll = async (req, res) => {
  try {
    // Fetch FuelTypes
    const valueAdded = await ValueAddedService.findAll({
      attributes: ["VASID", "ProductCode", "ProductName", "IsActive", "Status"],
      order: [
        ["CreatedDate", "DESC"], // Order by in ascending order
      ],
    });

    if (valueAdded.length === 0) {
      return res.status(404).json({ message: "No ValueAddedService found" });
    }

    res.status(200).json(valueAdded);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message:
          "Database error occurred while retrieving ValueAddedService name data.",
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

    console.error("Error fetching ValueAddedService:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Find a single ValueAddedService with an id
exports.findOne = async (req, res) => {
  const id = req.params.id;

  try {
    // Fetch the FuelType with the given ID
    const valueAdded = await ValueAddedService.findByPk(id, {
      attributes: ["VASID", "ProductCode", "ProductName", "IsActive", "Status"],
    });

    if (!valueAdded) {
      return res
        .status(404)
        .json({ message: "ValueAddedService not found with id: " + id });
    }

    res.status(200).json(valueAdded);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message:
          "Database error occurred while retrieving ValueAddedService data.",
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
    console.error("Error fetching FuelType:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Update a ValueAddedService by the id in the request
exports.updateByPk = async (req, res) => {
  console.log("Fuel Code:", req.body.ProductCode);

  try {
    // Validate request
    if (!req.body.ProductCode) {
      return res.status(400).json({ message: "ProductCode cannot be empty" });
    }
    if (!req.body.ProductName) {
      return res.status(400).json({ message: "ProductName cannot be empty" });
    }

    // Find the model by ID
    const vasId = req.params.id;
    let valueAdded = await ValueAddedService.findByPk(vasId);
    console.log("fuel data: ", valueAdded);

    if (!valueAdded) {
      return res.status(404).json({ message: "ValueAddedService not found" });
    }

    // Update other fields
    valueAdded.ProductName = req.body.ProductName || valueAdded.ProductName;
    valueAdded.ProductCode = req.body.ProductCode || valueAdded.ProductCode;
    valueAdded.IsActive =
      req.body.IsActive !== undefined ? req.body.IsActive : valueAdded.IsActive;

    // Set Status field based on IsActive
    valueAdded.Status = req.body.Status || valueAdded.Status || "Active";
    valueAdded.ModifiedDate = new Date();

    console.log("valueAdded:", valueAdded);

    // Save updated FuelType in the database
    const updatedValueAdded = await valueAdded.save();

    return res.status(200).json(updatedValueAdded); // Send the updated FuelType as response
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
        message: "Database error occurred while updating ValueAddedService.",
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
    console.error("Error updating ValueAddedService:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a ValueAddedService with the specified id in the request
exports.deleteById = async (req, res) => {
  const id = req.params.id;

  try {
    // Find the model by ID
    const valueAdded = await ValueAddedService.findByPk(id);

    // Check if the model exists
    if (!valueAdded) {
      return res
        .status(404)
        .json({ message: "ValueAddedService not found with id: " + id });
    }

    // Delete the model
    await valueAdded.destroy();

    // Send a success message
    res.status(200).json({
      message: "ValueAddedService with id: " + id + " deleted successfully",
    });
  } catch (err) {
    // Handle errors based on specific types
    if (err.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while deleting ValueAddedService.",
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
    console.error("Error deleting ValueAddedService:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
