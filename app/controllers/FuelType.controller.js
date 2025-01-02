/* eslint-disable no-unused-vars */
const db = require("../models");
const FuelType = db.fueltypes;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;

// Basic CRUD API
// Create and Save a new FuelType
exports.create = async (req, res) => {
  console.log("Fuel Code:", req.body.FuelCode);

  try {
    // Validate request
    if (!/^[a-zA-Z0-9 ]*$/.test(req.body.FuelCode)) {
      return res.status(400).json({ message: "Fuel Code cannot be empty" });
    }
    if (!req.body.FuelTypeName) {
      return res
        .status(400)
        .json({ message: "Fuel Type Name cannot be empty" });
    }
    if (!/^[a-zA-Z ]*$/.test(req.body.FuelTypeName)) {
      console.log(
        "Validation failed: FuelTypeName contains special characters."
      );
      return res.status(400).json({
        message: "FuelTypeName should contain only letters",
      });
    }
    // Check if ModelCode already exists
    const existingModel = await FuelType.findOne({
      where: { FuelCode: req.body.FuelCode },
    });
    if (existingModel) {
      return res.status(400).json({ message: "Fuel Code already exists" });
    }

    // Create a model
    const fuelType = {
      FuelTypeName: req.body.FuelTypeName.toUpperCase(),
      FuelCode: req.body.FuelCode.toUpperCase(),
      IsActive: req.body.IsActive || true,
      Status: req.body.Status || "Active",
    };

    // Save FuelTypes in the database
    const newFuelType = await FuelType.create(fuelType);

    return res.status(201).json(newFuelType); // Send the newly created FuelType as response
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
        message: "Database error occurred while creating FuelType.",
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

    console.error("Error creating FuelType:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Retrieve all FuelTypes from the database.
exports.findAll = async (req, res) => {
  try {
    // Fetch FuelTypes
    const fuelTypes = await FuelType.findAll({
      attributes: [
        "FuelTypeID",
        "FuelTypeName",
        "FuelCode",
        "IsActive",
        "Status",
      ],
      order: [
        ["CreatedDate", "DESC"], // Order by CreatedDate in decending order
      ],
    });

    if (fuelTypes.length === 0) {
      return res.status(404).json({ message: "No Fuel Types found" });
    }

    res.status(200).json(fuelTypes);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while retrieving FuelType name data.",
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

    console.error("Error fetching FuelTypes:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Find a single FuelType with an id
exports.findOne = async (req, res) => {
  const id = req.params.id;

  try {
    // Fetch the FuelType with the given ID
    const fuelType = await FuelType.findByPk(id, {
      attributes: [
        "FuelTypeID",
        "FuelTypeName",
        "FuelCode",
        "IsActive",
        "Status",
      ],
    });

    if (!fuelType) {
      return res
        .status(404)
        .json({ message: "FuelType not found with id: " + id });
    }

    res.status(200).json(fuelType);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while retrieving FuelType data.",
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

// Update a FuelType by the id in the request
exports.updateByPk = async (req, res) => {
  console.log("Fuel Code:", req.body.FuelCode);

  try {
    // Validate request
    if (!req.body.FuelCode) {
      return res.status(400).json({ message: "Fuel Code cannot be empty" });
    }
    if (!req.body.FuelTypeName) {
      return res
        .status(400)
        .json({ message: "Fuel Type Name cannot be empty" });
    }

    // Find the model by ID
    const fuelId = req.params.id;
    let fuelType = await FuelType.findByPk(fuelId);
    console.log("fuel data: ", fuelType);

    if (!fuelType) {
      return res.status(404).json({ message: "FuelType not found" });
    }

    // Update other fields
    fuelType.FuelTypeName =
      req.body.FuelTypeName.toUpperCase() || fuelType.FuelTypeName;
    fuelType.FuelCode = req.body.FuelCode.toUpperCase() || fuelType.FuelCode;
    fuelType.IsActive =
      req.body.IsActive !== undefined ? req.body.IsActive : fuelType.IsActive;

    // Set Status field based on IsActive
    fuelType.Status = fuelType.IsActive ? "Active" : "In-Active";
    fuelType.ModifiedDate = new Date();

    console.log("model:", fuelType);

    // Save updated FuelType in the database
    const updatedFuelType = await fuelType.save();

    return res.status(200).json(updatedFuelType); // Send the updated FuelType as response
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
        message: "Database error occurred while updating FuelType.",
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
    console.error("Error updating FuelType:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a FuelType with the specified id in the request
exports.deleteById = async (req, res) => {
  const id = req.params.id;

  try {
    // Find the model by ID
    const fuelType = await FuelType.findByPk(id);

    // Check if the model exists
    if (!fuelType) {
      return res
        .status(404)
        .json({ message: "FuelType not found with id: " + id });
    }

    // Delete the model
    await fuelType.destroy();

    // Send a success message
    res.status(200).json({
      message: "FuelType with id: " + id + " deleted successfully",
    });
  } catch (err) {
    // Handle errors based on specific types
    if (err.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while deleting FuelType.",
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
    console.error("Error deleting FuelType:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
