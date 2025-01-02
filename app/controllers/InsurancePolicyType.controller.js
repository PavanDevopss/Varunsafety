/* eslint-disable no-unused-vars */
const db = require("../models");
const InsurancePolicyType = db.insurancepolicytype;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;

// Basic CRUD API
// Create and Save a new InsurancePolicyType
exports.create = async (req, res) => {
  console.log("PolicyCode:", req.body.PolicyCode);

  try {
    // Validate request
    if (!req.body.PolicyCode) {
      return res.status(400).json({ message: "PolicyCode cannot be empty" });
    }
    if (!/^[a-zA-Z ]*$/.test(req.body.PolicyCode)) {
      console.log("Validation failed: PolicyCode contains special characters.");
      return res.status(400).json({
        message: "PolicyCode should contain only letters",
      });
    }
    // Check if InsurancePolicyTypeName already exists
    const existingModel = await InsurancePolicyType.findOne({
      where: { PolicyCode: req.body.PolicyCode },
    });
    if (existingModel) {
      return res.status(400).json({ message: "PolicyCode already exists" });
    }

    // Create a new InsurancePolicyType
    const newInsurancePolicyType = await InsurancePolicyType.create({
      PolicyCode: req.body.PolicyCode.toUpperCase(),
      PolicyName: req.body.PolicyName,
      Duration: req.body.Duration,
      Description: req.body.Description,
      IsActive: req.body.IsActive || true,
      Status: req.body.Status || "Active",
    });

    // Save InsurancePolicyType in database
    console.log("New InsurancePolicyType created:", newInsurancePolicyType);

    // Send the newly created InsurancePolicyType as response
    return res.status(201).json(newInsurancePolicyType);
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
        message: "Database error occurred while creating InsurancePolicyType.",
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
    console.error("Error creating InsurancePolicyType:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Retrieve all InsurancePolicyTypes from the database.
exports.findAll = async (req, res) => {
  try {
    // Fetch all InsurancePolicyType data
    const insurancePolicyTypeData = await InsurancePolicyType.findAll({
      attributes: [
        "InsurancePolicyTypeID",
        "PolicyCode",
        "PolicyName",
        "Duration",
        "Description",
        "IsActive",
        "Status",
      ],
      order: [
        ["CreatedDate", "DESC"], // Order by InsurancePolicyTypeID in ascending order
      ],
    });

    // Check if data is empty
    if (!insurancePolicyTypeData || insurancePolicyTypeData.length === 0) {
      return res.status(404).json({
        message: "No InsurancePolicyType data found.",
      });
    }

    // Map the data for response
    const combinedData = insurancePolicyTypeData.map((item) => ({
      InsurancePolicyTypeID: item.InsurancePolicyTypeID,
      PolicyCode: item.PolicyCode,
      PolicyName: item.PolicyName,
      Duration: item.Duration,
      Description: item.Description,
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
        message:
          "Database error occurred while retrieving InsurancePolicyType data.",
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
    console.error("Error retrieving InsurancePolicyType data:", error);
    return res.status(500).json({
      message:
        "Failed to retrieve InsurancePolicyType data. Please try again later.",
    });
  }
};

// Find a single InsurancePolicyType with an id
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;

    // Fetch the InsurancePolicyType data by primary key
    const insurancePolicyTypeData = await InsurancePolicyType.findOne({
      where: {
        InsurancePolicyTypeID: id,
      },
      attributes: [
        "InsurancePolicyTypeID",
        "PolicyCode",
        "PolicyName",
        "Duration",
        "Description",
        "IsActive",
        "Status",
      ],
    });

    // Check if data is found
    if (!insurancePolicyTypeData) {
      return res.status(404).json({
        message: "InsurancePolicyType data not found.",
      });
    }

    // Send the response data
    res.json(insurancePolicyTypeData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message:
          "Database error occurred while retrieving InsurancePolicyType data.",
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
    console.error("Error retrieving InsurancePolicyType data:", error);
    return res.status(500).json({
      message:
        "Failed to retrieve InsurancePolicyType data. Please try again later.",
    });
  }
};

// Update a InsurancePolicyType by the id in the request
exports.updateByPk = async (req, res) => {
  try {
    // Find the InsurancePolicyType by ID
    const insurancePolicyTypeID = req.params.id;
    let insurancePolicyType = await InsurancePolicyType.findByPk(
      insurancePolicyTypeID
    );

    // Check if InsurancePolicyType exists
    if (!insurancePolicyTypeID) {
      return res.status(404).json({ message: "InsurancePolicyType not found" });
    }

    // Update fields
    insurancePolicyType.PolicyCode = insurancePolicyType.PolicyCode;
    insurancePolicyType.PolicyName =
      req.body.PolicyName || insurancePolicyType.PolicyName;
    insurancePolicyType.Duration =
      req.body.Duration || insurancePolicyType.Duration;
    insurancePolicyType.Description =
      req.body.Description || insurancePolicyType.Description;
    insurancePolicyType.IsActive =
      req.body.IsActive || insurancePolicyType.IsActive;
    insurancePolicyType.Status = req.body.Status || insurancePolicyType.Status;
    insurancePolicyType.ModifiedDate = new Date();

    // Save updated InsurancePolicyType in the database
    const updatedInsurancePolicyType = await insurancePolicyType.save();

    // Send the updated InsurancePolicyType as response
    return res.status(200).json(updatedInsurancePolicyType);
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
        message: "Database error occurred while updating InsurancePolicyType.",
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
    console.error("Error updating InsurancePolicyType:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a InsurancePolicyType with the specified id in the request
exports.deleteById = async (req, res) => {
  const id = req.params.id;

  try {
    // Find the model by ID
    const insurancePolicyType = await InsurancePolicyType.findByPk(id);

    // Check if the model exists
    if (!insurancePolicyType) {
      return res
        .status(404)
        .json({ message: "InsurancePolicyType not found with id: " + id });
    }

    // Delete the model
    await insurancePolicyType.destroy();

    // Send a success message
    return res.status(200).json({
      message: "InsurancePolicyType with id: " + id + " deleted successfully",
    });
  } catch (err) {
    // Handle errors based on specific types
    if (err.name === "SequelizeForeignKeyConstraintError") {
      // Handle foreign key constraint errors
      return res.status(409).json({
        message:
          "Cannot delete. This InsurancePolicyType is referenced by other records.",
        details: err.message,
      });
    }

    if (err.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while deleting InsurancePolicyType.",
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
    console.error("Error deleting InsurancePolicyType:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
