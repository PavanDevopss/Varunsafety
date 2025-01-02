/* eslint-disable no-unused-vars */
const db = require("../models");
const ParentCompany = db.parentcompany;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;

// Basic CRUD API
// Create and Save a new ParentCompany
exports.create = async (req, res) => {
  try {
    // Validate request
    if (!req.body.ParentCmpyName) {
      return res
        .status(400)
        .json({ message: "ParentCmpyName cannot be empty" });
    }
    if (!/^[a-zA-Z ]*$/.test(req.body.ParentCmpyName)) {
      console.log(
        "Validation failed: ParentCmpyName contains special characters."
      );
      return res.status(400).json({
        message: "ParentCmpyName should contain only letters",
      });
    }
    // Check if ModelCode already exists
    const existingModel = await ParentCompany.findOne({
      where: { ParentCmpyName: req.body.ParentCmpyName },
    });
    if (existingModel) {
      return res
        .status(400)
        .json({ message: "Parent Company  already exists" });
    }

    // Access uploaded file paths
    //const filePaths = req.files.map((file) => file.path);

    // Create a model
    const parentCompany = {
      ParentCmpyName: req.body.ParentCmpyName,
      IsActive: req.body.IsActive || true,
      Status: req.body.Status || "Active",
    };

    // Save ParentCompanys in the database
    const newParentCompany = await ParentCompany.create(parentCompany);

    return res.status(201).json(newParentCompany); // Send the newly created ParentCompany as response
  } catch (err) {
    // Handle specific errors
    if (err.name === "SequelizeValidationError") {
      // Handle Sequelize validation errors
      return res.status(400).json({
        message: "Validation error",
        details: err.errors.map((e) => e.message),
      });
    }

    if (err.name === "SequelizeUniqueConstraintError") {
      // Handle unique constraint errors (e.g., duplicate entry)
      return res.status(400).json({
        message: "Parent Company already exists",
        details: err.message,
      });
    }

    if (err.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while creating ParentCompany.",
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
    console.error("Error creating ParentCompany:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Retrieve all ParentCompanys from the database.
exports.findAll = async (req, res) => {
  try {
    // Fetch all variant data with included transmission data
    const parentCmpyData = await ParentCompany.findAll({
      attributes: ["ParentCmpyID", "ParentCmpyName", "IsActive", "Status"],
      order: [
        ["ParentCmpyName", "ASC"], // Order by ModelDescription in ascending order
      ],
    });

    // Check if data is empty
    if (!parentCmpyData || parentCmpyData.length === 0) {
      return res.status(404).json({
        message: "No parent Cmpy data found.",
      });
    }

    // Send the data as response
    res.json(parentCmpyData);
  } catch (error) {
    // Handle specific errors
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message:
          "Database error occurred while retrieving parent company data.",
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
    console.error("Error retrieving parent Cmpy data:", error);
    res.status(500).json({
      message: "Failed to retrieve parent Cmpy data. Please try again later.",
    });
  }
};

// Find a single ParentCompany with an id
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;

    // Fetch the parent company data by primary key
    const parentCmpyData = await ParentCompany.findOne({
      where: {
        ParentCmpyID: id,
      },
      attributes: ["ParentCmpyID", "ParentCmpyName", "IsActive", "Status"],
    });

    // Check if data is found
    if (!parentCmpyData) {
      return res.status(404).json({
        message: "Parent company data not found.",
      });
    }

    // Send the response data
    res.json(parentCmpyData);
  } catch (error) {
    // Handle specific errors
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message:
          "Database error occurred while retrieving parent company data.",
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
    console.error("Error retrieving parent company data:", error);
    res.status(500).json({
      message:
        "Failed to retrieve parent company data. Please try again later.",
    });
  }
};

// Update a ParentCompany by the id in the request
exports.updateByPk = async (req, res) => {
  try {
    // Validate request
    if (!req.body.ParentCmpyName) {
      return res
        .status(400)
        .json({ message: "ParentCmpyName cannot be empty" });
    }
    if (!/^[a-zA-Z ]*$/.test(req.body.ParentCmpyName)) {
      console.log(
        "Validation failed: ParentCmpyName contains special characters."
      );
      return res.status(400).json({
        message: "ParentCmpyName should contain only letters",
      });
    }
    // Find the model by ID
    const ParentCmpyID = req.params.id;
    let parentCompany = await ParentCompany.findByPk(ParentCmpyID);

    // Check if the model exists
    if (!parentCompany) {
      return res.status(404).json({ message: "ParentCompany not found" });
    }

    // Update fields
    parentCompany.ParentCmpyName = req.body.ParentCmpyName;
    parentCompany.IsActive = req.body.IsActive || parentCompany.IsActive;
    parentCompany.Status = req.body.Status || parentCompany.Status;
    parentCompany.ModifiedDate = new Date();

    // Save updated ParentCompany in the database
    const updatedParentCompany = await parentCompany.save();

    // Send the updated ParentCompany as response
    return res.status(200).json(updatedParentCompany);
  } catch (err) {
    // Handle specific errors
    if (err.name === "SequelizeValidationError") {
      // Handle Sequelize validation errors
      return res.status(400).json({
        message: "Validation error occurred.",
        details: err.errors.map((error) => ({
          message: error.message,
          field: error.path,
        })),
      });
    }

    if (err.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while updating ParentCompany.",
        details: err.message,
      });
    }

    // General error handling
    console.error("Error updating ParentCompany:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a ParentCompany with the specified id in the request
exports.deleteById = async (req, res) => {
  const id = req.params.id;

  try {
    // Find the model by ID
    const parentCompany = await ParentCompany.findByPk(id);

    // Check if the model exists
    if (!parentCompany) {
      return res
        .status(404)
        .json({ message: "ParentCompany not found with id: " + id });
    }

    // Delete the model
    await parentCompany.destroy();

    // Send a success message
    return res.status(200).json({
      message: "ParentCompany with id: " + id + " deleted successfully",
    });
  } catch (err) {
    // Handle specific errors
    if (err.name === "SequelizeForeignKeyConstraintError") {
      // Handle foreign key constraint errors
      return res.status(409).json({
        message: "Cannot delete ParentCompany due to existing relationships.",
        details: err.message,
      });
    }

    // General error handling
    console.error("Error deleting ParentCompany:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
