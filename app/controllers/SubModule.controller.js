/* eslint-disable no-dupe-keys */
/* eslint-disable no-unused-vars */
require("dotenv").config();
const db = require("../models");
const SubModule = db.submodule;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;
const ModuleMaster = db.modulemaster;

// Basic CRUD API
// Create and Save a new SubModule
exports.create = async (req, res) => {
  console.log("SubModule Name:", req.body.SubModuleName);

  try {
    // Validate request
    if (!req.body.SubModuleName) {
      return res.status(400).json({ message: "SubModuleName cannot be empty" });
    }
    if (!/^[a-zA-Z ]*$/.test(req.body.SubModuleName)) {
      console.log(
        "Validation failed: SubModuleName contains special characters."
      );
      return res.status(400).json({
        message: "SubModuleName should contain only letters",
      });
    }
    // Check if SubModule already exists
    const existingModel = await SubModule.findOne({
      where: { SubModuleName: req.body.SubModuleName },
    });
    if (existingModel) {
      return res.status(400).json({ message: "SubModuleName already exists" });
    }

    // Create a SubModule
    const subModule = {
      SubModuleName: req.body.SubModuleName,
      ModuleID: req.body.ModuleID,
      Sequence: req.body.Sequence,
      IsActive: req.body.IsActive || true,
      Status: req.body.Status || "Active",
    };

    // Save SubModule in the database
    const newSubModule = await SubModule.create(subModule);

    return res.status(201).json(newSubModule); // Send the newly created SubModule as response
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

    console.error("Error creating SubModule:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Retrieve all SubModule from the database.
exports.findAll = async (req, res) => {
  try {
    // Fetch all SubModule data with included parent company data
    const subModuleNameData = await SubModule.findAll({
      attributes: [
        "SubModuleID",
        "SubModuleName",
        "Sequence",
        "IsActive",
        "Status",
      ],
      include: [
        {
          model: ModuleMaster,
          as: "SMModuleID",
          attributes: ["ModuleID", "ModuleCode", "ModuleName"],
        },
      ],
      order: [
        ["SubModuleName", "ASC"], // Order by SubModule in ascending order
      ],
    });

    // Check if data is empty
    if (!subModuleNameData || subModuleNameData.length === 0) {
      return res.status(404).json({
        message: "No sub module name data found.",
      });
    }

    // Map the data for response
    const combinedData = subModuleNameData.map((item) => ({
      SubModuleID: item.SubModuleID,
      SubModuleName: item.SubModuleName,
      Sequence: item.Sequence,
      ModuleID: item.SMModuleID ? item.SMModuleID.ModuleID : null,
      ModuleCode: item.SMModuleID ? item.SMModuleID.ModuleCode : null,
      ModuleName: item.SMModuleID ? item.SMModuleID.ModuleName : null,
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
          "Database error occurred while retrieving SubModule name data.",
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
    console.error("Error retrieving SubModule name data:", error);
    return res.status(500).json({
      message:
        "Failed to retrieve SubModule name data. Please try again later.",
    });
  }
};

// Find a single SubModule with an id
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;

    // Validate the ID parameter
    if (!id) {
      return res.status(400).json({
        message: "ID parameter is required.",
      });
    }

    // Fetch the SubModule data by primary key with included parent company data
    const subModuleNameData = await SubModule.findOne({
      where: { SubModuleID: id },
      attributes: [
        "SubModuleID",
        "SubModuleName",
        "Sequence",
        "IsActive",
        "Status",
      ],
      include: [
        {
          model: ModuleMaster,
          as: "SMModuleID",
          attributes: ["ModuleID", "ModuleCode", "ModuleName"],
        },
      ],
      order: [
        ["SubModuleName", "ASC"], // Order by SubModule in ascending order
      ],
    });

    // Check if data is empty
    if (!subModuleNameData || subModuleNameData.length === 0) {
      return res.status(404).json({
        message: "No sub module name data found.",
      });
    }

    // Prepare the response data
    const responseData = {
      SubModuleID: subModuleNameData.SubModuleID,
      SubModuleName: subModuleNameData.SubModuleName,
      Sequence: subModuleNameData.Sequence,
      ModuleID: subModuleNameData.SMModuleID
        ? subModuleNameData.SMModuleID.ModuleID
        : null,
      ModuleCode: subModuleNameData.SMModuleID
        ? subModuleNameData.SMModuleID.ModuleCode
        : null,
      ModuleName: subModuleNameData.SMModuleID
        ? subModuleNameData.SMModuleID.ModuleName
        : null,
      IsActive: subModuleNameData.IsActive,
      Status: subModuleNameData.Status,
    };

    // Send the response data
    res.json(responseData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message:
          "Database error occurred while retrieving SubModule name data.",
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
    console.error("Error retrieving SubModule name data:", error);
    return res.status(500).json({
      message:
        "Failed to retrieve SubModule name data. Please try again later.",
    });
  }
};

// Update a SubModule by the id in the request
exports.updateByPk = async (req, res) => {
  console.log("SubModuleName:", req.body.SubModuleName);

  try {
    // Validate request
    if (!req.body.SubModuleName) {
      return res.status(400).json({ message: "SubModuleName cannot be empty" });
    }
    if (!/^[a-zA-Z ]*$/.test(req.body.SubModuleName)) {
      console.log(
        "Validation failed: SubModuleName contains special characters."
      );
      return res.status(400).json({
        message: "SubModuleName should contain only letters",
      });
    }
    // Find the division by ID
    const submoduleId = req.params.id;

    // Validate the ID parameter
    if (!submoduleId) {
      return res.status(400).json({ message: "ID parameter is required." });
    }

    let subModule = await SubModule.findByPk(submoduleId);

    if (!subModule) {
      return res.status(404).json({ message: "SubModule not found" });
    }

    // Update fields
    subModule.SubModuleName = req.body.SubModuleName;
    subModule.ModuleID = req.body.ModuleID || subModule.ModuleID;
    subModule.Sequence = req.body.Sequence || subModule.Sequence;
    subModule.IsActive = req.body.IsActive || subModule.IsActive;
    subModule.Status = req.body.Status || subModule.Status;
    subModule.ModifiedDate = new Date();

    // Save updated SubModule in the database
    const updatedSubModule = await subModule.save();

    return res.status(200).json(updatedSubModule); // Send the updated SubModule as response
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
        message: "Database error occurred while updating SubModule.",
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
    console.error("Error updating SubModule:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a SubModule with the specified id in the request
exports.deleteById = async (req, res) => {
  const id = req.params.id;

  try {
    // Validate the ID parameter
    if (!id) {
      return res.status(400).json({ message: "ID parameter is required." });
    }

    // Find the model by ID
    const subModule = await SubModule.findByPk(id);

    // Check if the model exists
    if (!subModule) {
      return res
        .status(404)
        .json({ message: "SubModule not found with id: " + id });
    }

    // Delete the model
    await subModule.destroy();

    // Send a success message
    res.status(200).json({
      message: "SubModule with id: " + id + " deleted successfully",
    });
  } catch (err) {
    // Handle errors based on specific types
    if (err.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while deleting SubModule.",
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
    console.error("Error deleting SubModule:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
