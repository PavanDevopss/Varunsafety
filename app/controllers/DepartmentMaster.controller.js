/* eslint-disable no-dupe-keys */
/* eslint-disable no-unused-vars */
const db = require("../models");
const DepartmentMaster = db.departmentmaster;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;

// Basic CRUD API
// Create and Save a new DepartmentMaster
exports.create = async (req, res) => {
  console.log("DeptName:", req.body.DeptName);

  try {
    // Validate request
    if (!req.body.DeptName) {
      return res.status(400).json({ message: "DeptName cannot be empty" });
    }
    if (!/^[a-zA-Z ]*$/.test(req.body.DeptName)) {
      console.log("Validation failed: DeptName contains special characters.");
      return res.status(400).json({
        message: "DeptName should contain only letters",
      });
    }
    // Check if DeptName already exists
    const existingModel = await DepartmentMaster.findOne({
      where: { DeptName: req.body.DeptName },
    });
    if (existingModel) {
      return res.status(400).json({ message: "DeptName already exists" });
    }

    // Create a DepartmentMaster
    const departmentMaster = {
      DeptID: req.body.DeptID,
      DeptCode: req.body.DeptCode,
      DeptName: req.body.DeptName,
      IsActive: req.body.IsActive || true,
      Status: req.body.Status || "Active",
    };

    // Save DepartmentMaster in the database
    const newDepartmentMaster = await DepartmentMaster.create(departmentMaster);

    return res.status(201).json(newDepartmentMaster); // Send the newly created DepartmentMaster as response
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

    console.error("Error creating DepartmentMaster:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Retrieve all DepartmentMaster from the database.
exports.findAll = async (req, res) => {
  try {
    // Fetch all department data
    const departmentData = await DepartmentMaster.findAll({
      attributes: ["DeptID", "DeptCode", "DeptName", "IsActive", "Status"],
      order: [
        ["DeptName", "ASC"], // Order by ModelDescription in ascending order
      ],
    });

    // Check if data is empty
    if (!departmentData || departmentData.length === 0) {
      return res.status(404).json({
        message: "No department data found.",
      });
    }

    // Map the data for response
    const combinedData = departmentData.map((item) => ({
      DeptID: item.DeptID,
      DeptCode: item.DeptCode,
      DeptName: item.DeptName,
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
        message: "Database error occurred while retrieving department data.",
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
    console.error("Error retrieving department data:", error);
    return res.status(500).json({
      message: "Failed to retrieve department data. Please try again later.",
    });
  }
};

// Find a single DepartmentMaster with an id
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;

    // Validate the ID parameter
    if (!id) {
      return res.status(400).json({
        message: "ID parameter is required.",
      });
    }

    // Fetch the department data by primary key
    const departmentData = await DepartmentMaster.findOne({
      where: {
        DeptID: id,
      },
      attributes: ["DeptID", "DeptCode", "DeptName", "IsActive", "Status"],
    });

    // Check if data is found
    if (!departmentData) {
      return res.status(404).json({
        message: "Department data not found.",
      });
    }

    // Prepare the response data
    const responseData = {
      DeptID: departmentData.DeptID,
      DeptCode: departmentData.DeptCode,
      DeptName: departmentData.DeptName,
      IsActive: departmentData.IsActive,
      Status: departmentData.Status,
    };

    // Send the response data
    res.json(responseData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while retrieving department data.",
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
    console.error("Error retrieving department data:", error);
    return res.status(500).json({
      message: "Failed to retrieve department data. Please try again later.",
    });
  }
};

// Update a DepartmentMaster by the id in the request
exports.updateByPk = async (req, res) => {
  console.log("DeptName:", req.body.DeptName);

  try {
    // Validate request
    if (!req.body.DeptName) {
      return res.status(400).json({ message: "DeptName cannot be empty" });
    }
    if (!/^[a-zA-Z ]*$/.test(req.body.DeptName)) {
      console.log("Validation failed: DeptName contains special characters.");
      return res.status(400).json({
        message: "DeptName should contain only letters",
      });
    }
    // Find the department by ID
    const deptId = req.params.id;

    // Validate the ID parameter
    if (!deptId) {
      return res.status(400).json({ message: "ID parameter is required." });
    }

    let departmentMaster = await DepartmentMaster.findByPk(deptId);

    if (!departmentMaster) {
      return res.status(404).json({ message: "DepartmentMaster not found" });
    }

    // Update fields
    departmentMaster.DeptCode = req.body.DeptCode || departmentMaster.DeptCode;
    departmentMaster.DeptName = req.body.DeptName;
    departmentMaster.IsActive = req.body.IsActive || departmentMaster.IsActive;
    departmentMaster.Status = req.body.Status || departmentMaster.Status;
    departmentMaster.ModifiedDate = new Date();

    // Save updated DepartmentMaster in the database
    const updatedDepartmentMaster = await departmentMaster.save();

    return res.status(200).json(updatedDepartmentMaster); // Send the updated DepartmentMaster as response
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
        message: "Database error occurred while updating DepartmentMaster.",
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
    console.error("Error updating DepartmentMaster:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
// Delete a DepartmentMaster with the specified id in the request
exports.deleteById = async (req, res) => {
  const id = req.params.id;

  try {
    // Validate the ID parameter
    if (!id) {
      return res.status(400).json({ message: "ID parameter is required." });
    }

    // Find the department by ID
    const departmentMaster = await DepartmentMaster.findByPk(id);

    // Check if the department exists
    if (!departmentMaster) {
      return res
        .status(404)
        .json({ message: "DepartmentMaster not found with id: " + id });
    }

    // Delete the department
    await departmentMaster.destroy();

    // Send a success message
    res.status(200).json({
      message: "DepartmentMaster with id: " + id + " deleted successfully",
    });
  } catch (err) {
    // Handle errors based on specific types
    if (err.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while deleting DepartmentMaster.",
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
    console.error("Error deleting DepartmentMaster:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
