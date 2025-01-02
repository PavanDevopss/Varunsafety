/* eslint-disable no-unused-vars */
const db = require("../models");
const InsuranceValueAdded = db.insurancevalueadded;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;

// Basic CRUD API
// Create and Save a new InsuranceValueAdded
exports.create = async (req, res) => {
  console.log("InsuranceCode:", req.body.InsuranceCode);

  try {
    // Validate request
    if (!req.body.InsuranceCode) {
      return res.status(400).json({ message: "PolicyCode cannot be empty" });
    }
    if (!/^[a-zA-Z ]*$/.test(req.body.InsuranceCode)) {
      console.log(
        "Validation failed: InsuranceCode contains special characters."
      );
      return res.status(400).json({
        message: "InsuranceCode should contain only letters",
      });
    }
    // Check if InsuranceValueAddedName already exists
    const existingModel = await InsuranceValueAdded.findOne({
      where: { InsuranceCode: req.body.InsuranceCode },
    });
    if (existingModel) {
      return res.status(400).json({ message: "InsuranceCode already exists" });
    }

    // Create a new InsuranceValueAdded
    const newInsuranceValueAdded = await InsuranceValueAdded.create({
      InsuranceCode: req.body.InsuranceCode.toUpperCase(),
      AddOnType: req.body.AddOnType,
      Description: req.body.Description,
      IsActive: req.body.IsActive || true,
      Status: req.body.Status || "Active",
    });

    // Save InsuranceValueAdded in database
    console.log("New InsuranceValueAdded created:", newInsuranceValueAdded);

    // Send the newly created InsuranceValueAdded as response
    return res.status(201).json(newInsuranceValueAdded);
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
        message: "Database error occurred while creating InsuranceValueAdded.",
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
    console.error("Error creating InsuranceValueAdded:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Retrieve all InsuranceValueAddeds from the database.
exports.findAll = async (req, res) => {
  try {
    // Fetch all InsuranceValueAdded data
    const insuranceValueAddedData = await InsuranceValueAdded.findAll({
      attributes: [
        "InsuranceValueAddedID",
        "InsuranceCode",
        "AddOnType",
        "Description",
        "IsActive",
        "Status",
      ],
      order: [
        ["CreatedDate", "DESC"], // Order by InsuranceValueAddedID in ascending order
      ],
    });

    // Check if data is empty
    if (!insuranceValueAddedData || insuranceValueAddedData.length === 0) {
      return res.status(404).json({
        message: "No InsuranceValueAdded data found.",
      });
    }
    // Send the insuranceValueAddedData data as response
    res.json(insuranceValueAddedData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message:
          "Database error occurred while retrieving InsuranceValueAdded data.",
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
    console.error("Error retrieving InsuranceValueAdded data:", error);
    return res.status(500).json({
      message:
        "Failed to retrieve InsuranceValueAdded data. Please try again later.",
    });
  }
};

// Find a single InsuranceValueAdded with an id
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;

    // Fetch the InsuranceValueAdded data by primary key
    const insuranceValueAddedData = await InsuranceValueAdded.findOne({
      where: {
        InsuranceValueAddedID: id,
      },
      attributes: [
        "InsuranceValueAddedID",
        "InsuranceCode",
        "AddOnType",
        "Description",
        "IsActive",
        "Status",
      ],
      order: [
        ["InsuranceValueAddedID", "ASC"], // Order by InsuranceValueAddedID in ascending order
      ],
    });

    // Check if data is found
    if (!insuranceValueAddedData) {
      return res.status(404).json({
        message: "InsuranceValueAdded data not found.",
      });
    }

    // Send the response data
    res.json(insuranceValueAddedData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message:
          "Database error occurred while retrieving InsuranceValueAdded data.",
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
    console.error("Error retrieving InsuranceValueAdded data:", error);
    return res.status(500).json({
      message:
        "Failed to retrieve InsuranceValueAdded data. Please try again later.",
    });
  }
};

// Update a InsuranceValueAdded by the id in the request
exports.updateByPk = async (req, res) => {
  try {
    // Find the InsuranceValueAdded by ID
    const InsuranceValueAddedID = req.params.id;
    let insuranceValueAdded = await InsuranceValueAdded.findByPk(
      InsuranceValueAddedID
    );

    // Check if InsuranceValueAdded exists
    if (!insuranceValueAdded) {
      return res.status(404).json({ message: "InsuranceValueAdded not found" });
    }

    // Update fields
    insuranceValueAdded.InsuranceCode = insuranceValueAdded.InsuranceCode;
    insuranceValueAdded.AddOnType =
      req.body.AddOnType || insuranceValueAdded.AddOnType;
    insuranceValueAdded.Description =
      req.body.Description || insuranceValueAdded.Description;
    insuranceValueAdded.IsActive =
      req.body.IsActive || insuranceValueAdded.IsActive;
    insuranceValueAdded.Status = req.body.Status || insuranceValueAdded.Status;
    insuranceValueAdded.ModifiedDate = new Date();

    // Save updated InsuranceValueAdded in the database
    const updatedInsuranceValueAdded = await insuranceValueAdded.save();

    // Send the updated InsuranceValueAdded as response
    return res.status(200).json(updatedInsuranceValueAdded);
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
        message: "Database error occurred while updating InsuranceValueAdded.",
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
    console.error("Error updating InsuranceValueAdded:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a InsuranceValueAdded with the specified id in the request
exports.deleteById = async (req, res) => {
  const id = req.params.id;

  try {
    // Find the model by ID
    const insuranceValueAdded = await InsuranceValueAdded.findByPk(id);

    // Check if the model exists
    if (!insuranceValueAdded) {
      return res
        .status(404)
        .json({ message: "InsuranceValueAdded not found with id: " + id });
    }

    // Delete the model
    await insuranceValueAdded.destroy();

    // Send a success message
    return res.status(200).json({
      message: "InsuranceValueAdded with id: " + id + " deleted successfully",
    });
  } catch (err) {
    // Handle errors based on specific types
    if (err.name === "SequelizeForeignKeyConstraintError") {
      // Handle foreign key constraint errors
      return res.status(409).json({
        message:
          "Cannot delete. This InsuranceValueAdded is referenced by other records.",
        details: err.message,
      });
    }

    if (err.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while deleting InsuranceValueAdded.",
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
    console.error("Error deleting InsuranceValueAdded:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
