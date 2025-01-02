/* eslint-disable no-unused-vars */
const db = require("../models");
const FinanceMaster = db.financemaster;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;

// Basic CRUD API

// Create and Save a new FinanceMaster
exports.create = async (req, res) => {
  console.log("Financier Code:", req.body.FinancierCode);

  try {
    // Check if FinanceMaster already exists
    const existingModel = await FinanceMaster.findOne({
      where: { FinancierCode: req.body.FinancierCode },
    });
    if (existingModel) {
      return res.status(400).json({ message: "Finance Code already exists" });
    }

    // Map fields individually from req.body to financeMaster object
    const financeMaster = {
      FinancierCode: req.body.FinancierCode,
      FinancierName: req.body.FinancierName,
      Category: req.body.Category,
      Location: req.body.Location || null,
      Contact: req.body.Contact || null,
      EmailID: req.body.EmailID || null,
      PlaceOfSupply: req.body.PlaceOfSupply || null,
      GSTIN: req.body.GSTIN || null,
      Address: req.body.Address || null,
      IsActive: req.body.IsActive || true,
      Status: req.body.Status || "Active",
    };

    // Save FinanceMasters in the database
    const newFinanceMaster = await FinanceMaster.create(financeMaster);

    return res.status(201).json(newFinanceMaster); // Send the newly created FinanceMaster as response
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
        message: "Database error occurred while creating FinanceMaster.",
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

    console.error("Error creating FinanceMaster:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Retrieve all FinanceMasters from the database.
exports.findAll = async (req, res) => {
  try {
    // Fetch FinanceMasters
    const financeMasters = await FinanceMaster.findAll({
      attributes: [
        "FinancierID",
        "FinancierCode",
        "FinancierName",
        "Category",
        "Location",
        "Contact",
        "EmailID",
        "PlaceOfSupply",
        "GSTIN",
        "Address",
        "IsActive",
        "Status",
        "CreatedDate",
        "ModifiedDate",
      ],
      order: [
        ["CreatedDate", "DESC"], // Order by CreatedDate in decending order
      ],
    });

    if (financeMasters.length === 0) {
      return res.status(404).json({ message: "No Financier Types found" });
    }

    res.status(200).json(financeMasters);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message:
          "Database error occurred while retrieving FinanceMaster name data.",
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

    console.error("Error fetching FinanceMasters:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Find a single FinanceMaster with an id
exports.findOne = async (req, res) => {
  const id = req.params.id;

  try {
    // Fetch the FinanceMaster with the given ID
    const financeMaster = await FinanceMaster.findByPk(id, {
      attributes: [
        "FinancierID",
        "FinancierCode",
        "FinancierName",
        "Category",
        "Location",
        "Contact",
        "EmailID",
        "PlaceOfSupply",
        "GSTIN",
        "Address",
        "IsActive",
        "Status",
        "CreatedDate",
        "ModifiedDate",
      ],
    });

    if (!financeMaster) {
      return res
        .status(404)
        .json({ message: "FinanceMaster not found with id: " + id });
    }

    res.status(200).json(financeMaster);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while retrieving FinanceMaster data.",
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
    console.error("Error fetching FinanceMaster:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Update a FinanceMaster by the id in the request
exports.updateByPk = async (req, res) => {
  console.log("Financier ID:", req.body.FinancierID);

  try {
    // Validate request
    if (!req.params.id) {
      return res.status(400).json({ message: "Financier ID is required" });
    }
    // Find the model by ID
    const ID = req.params.id;
    let financeMaster = await FinanceMaster.findByPk(ID);
    console.log("fuel data: ", financeMaster);

    if (!financeMaster) {
      return res.status(404).json({ message: "FinanceMaster not found" });
    }

    // Update fields
    financeMaster.FinancierCode =
      req.body.FinancierCode || financeMaster.FinancierCode;
    financeMaster.FinancierName =
      req.body.FinancierName || financeMaster.FinancierName;
    financeMaster.Category = req.body.Category || financeMaster.Category;
    financeMaster.Location =
      req.body.Location || financeMaster.Location || null;
    financeMaster.Contact = req.body.Contact || financeMaster.Contact || null;
    financeMaster.EmailID = req.body.EmailID || financeMaster.EmailID || null;
    financeMaster.PlaceOfSupply =
      req.body.PlaceOfSupply || financeMaster.PlaceOfSupply || null;
    financeMaster.GSTIN = req.body.GSTIN || financeMaster.GSTIN || null;
    financeMaster.Address = req.body.Address || financeMaster.Address || null;
    financeMaster.IsActive =
      req.body.IsActive !== undefined
        ? req.body.IsActive
        : financeMaster.IsActive || true;
    financeMaster.Status = req.body.Status || financeMaster.Status || "Active";
    financeMaster.ModifiedDate = new Date();

    // // Set Status based on IsActive value
    // if (req.body.IsActive === true) {
    //     financeMaster.Status = "Active";
    // } else {
    //     financeMaster.Status = "In-Active";
    // }

    console.log("model:", financeMaster);

    // Save updated FinanceMaster in the database
    const updatedFinanceMaster = await financeMaster.save();

    return res.status(200).json(updatedFinanceMaster); // Send the updated FinanceMaster as response
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
        message: "Database error occurred while updating FinanceMaster.",
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
    console.error("Error updating FinanceMaster:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a FinanceMaster with the specified id in the request
exports.deleteById = async (req, res) => {
  const id = req.params.id;

  try {
    // Find the model by ID
    const financeMaster = await FinanceMaster.findByPk(id);

    // Check if the model exists
    if (!financeMaster) {
      return res
        .status(404)
        .json({ message: "FinanceMaster not found with id: " + id });
    }

    // Delete the model
    await financeMaster.destroy();

    // Send a success message
    res.status(200).json({
      message: "FinanceMaster with id: " + id + " deleted successfully",
    });
  } catch (err) {
    // Handle errors based on specific types
    if (err.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while deleting FinanceMaster.",
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
    console.error("Error deleting FinanceMaster:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
