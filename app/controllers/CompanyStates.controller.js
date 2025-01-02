/* eslint-disable no-unused-vars */
const db = require("../models");
const CompanyStates = db.companystates;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;
const CompanyMaster = db.companymaster;

// Basic CRUD API
// Create and Save a new CompanyStates
exports.create = async (req, res) => {
  console.log("CmpyStateName:", req.body.CmpyStateName);

  try {
    // Validate request
    if (!req.body.CmpyStateName) {
      return res.status(400).json({ message: "CmpyStateName cannot be empty" });
    }
    if (!/^[a-zA-Z ]*$/.test(req.body.CmpyStateName)) {
      console.log(
        "Validation failed: CmpyStateName contains special characters."
      );
      return res.status(400).json({
        message: "CmpyStateName should contain only letters",
      });
    }
    // Check if StateName already exists
    const existingModel = await CompanyStates.findOne({
      where: { CmpyStateName: req.body.CmpyStateName },
    });
    if (existingModel) {
      return res.status(400).json({ message: "CmpyStateName already exists" });
    }

    // Create a new CompanyStates
    const newCompanyStates = await CompanyStates.create({
      CmpyStateName: req.body.CmpyStateName,
      IsActive: req.body.IsActive || true,
      Status: req.body.Status || "Active",
    });

    // Save CompanyStates in database
    console.log("New CompanyStates created:", newCompanyStates);

    return res.status(201).json(newCompanyStates); // Send the newly created CompanyStates as response
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
        message: "Database error occurred while creating CompanyStates.",
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
    console.error("Error creating CompanyStates:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Retrieve all CompanyStates from the database.
exports.findAll = async (req, res) => {
  try {
    // Fetch all state data with included nation data
    const stateData = await CompanyStates.findAll({
      attributes: ["CmpyStateID", "CmpyStateName", "IsActive", "Status"],
      order: [
        ["CmpyStateName", "ASC"], // Order by ModelDescription in ascending order
      ],
    });

    // Check if data is empty
    if (!stateData || stateData.length === 0) {
      return res.status(404).json({
        message: "No state data found.",
      });
    }

    // Map the data for response
    const combinedData = stateData.map((item) => ({
      CmpyStateID: item.CmpyStateID,
      CmpyStateName: item.CmpyStateName,
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
        message: "Database error occurred while retrieving state name data.",
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

    console.error("Error retrieving state data:", error);
    res.status(500).json({
      message: "Failed to retrieve state data. Please try again later.",
    });
  }
};

// Find a single CompanyStates with an id
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;

    // Fetch the state data by primary key with included nation data
    const stateData = await CompanyStates.findOne({
      where: {
        CmpyStateID: id, // Replaced OEMID with StateID
      },
      attributes: ["CmpyStateID", "CmpyStateName", "IsActive", "Status"],
    });

    // Check if data is found
    if (!stateData) {
      return res.status(404).json({
        message: "State data not found.",
      });
    }

    // Prepare the response data
    const responseData = {
      CmpyStateID: stateData.CmpyStateID, // Updated to use StateID
      CmpyStateName: stateData.CmpyStateName,
      IsActive: stateData.IsActive,
      Status: stateData.Status,
    };

    // Send the response data
    res.json(responseData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while retrieving state data.",
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
    console.error("Error retrieving state data:", error);
    res.status(500).json({
      message: "Failed to retrieve state data. Please try again later.",
    });
  }
};

// Update a CompanyStates by the id in the request
exports.updateByPk = async (req, res) => {
  console.log("CmpyStateName:", req.body.CmpyStateName);

  try {
    // Validate request
    if (!req.body.CmpyStateName) {
      return res.status(400).json({ message: "CmpyStateName cannot be empty" });
    }
    if (!/^[a-zA-Z ]*$/.test(req.body.CmpyStateName)) {
      console.log(
        "Validation failed: CmpyStateName contains special characters."
      );
      return res.status(400).json({
        message: "CmpyStateName should contain only letters",
      });
    }
    // Find the CompanyStates by ID
    const stateID = req.params.id;
    let companyStates = await CompanyStates.findByPk(stateID);

    if (!companyStates) {
      return res.status(404).json({ message: "CompanyStates not found" });
    }

    // Update fields
    companyStates.CmpyStateName =
      req.body.CmpyStateName || companyStates.CmpyStateName;
    companyStates.IsActive = req.body.IsActive || companyStates.IsActive;
    companyStates.Status = req.body.Status || companyStates.Status;
    companyStates.ModifiedDate = new Date();

    // Save updated CompanyStates in the database
    const updatedCompanyStates = await companyStates.save();

    return res.status(200).json(updatedCompanyStates); // Send the updated CompanyStates as response
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
        message: "Database error occurred while updating CompanyStates.",
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
    console.error("Error updating CompanyStates:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a CompanyStates with the specified id in the request
exports.deleteById = async (req, res) => {
  const id = req.params.id;

  try {
    // Find the model by ID
    const companyStates = await CompanyStates.findByPk(id);

    // Check if the model exists
    if (!companyStates) {
      return res
        .status(404)
        .json({ message: "CompanyStates not found with id: " + id });
    }

    // Delete the model
    await companyStates.destroy();

    // Send a success message
    res.status(200).json({
      message: "CompanyStates with id: " + id + " deleted successfully",
    });
  } catch (err) {
    // Handle errors based on specific types
    if (err.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while deleting CompanyStates.",
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
    console.error("Error deleting CompanyStates:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
