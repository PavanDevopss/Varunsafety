/* eslint-disable no-unused-vars */
const db = require("../models");
const BankMaster = db.bankmaster;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;

//Basic CRUD API for BankMaster
exports.create = async (req, res) => {
  console.log("BankName:", req.body.BankName);

  try {
    // Validate request
    if (!req.body.BankName) {
      return res.status(400).json({ message: "BankName cannot be empty" });
    }
    if (!/^[a-zA-Z ]*$/.test(req.body.BankName)) {
      console.log("Validation failed: BankName contains special characters.");
      return res.status(400).json({
        message: "BankName should contain only letters",
      });
    }

    // Check if BranchName already exists
    const existingModel = await BankMaster.findOne({
      where: { BankName: req.body.BankName },
    });
    if (existingModel) {
      return res.status(400).json({ message: "BankName already exists" });
    }

    // Create a BranchMaster without specifying BranchID
    const bankMaster = {
      BankName: req.body.BankName,
      BankType: req.body.BankType,
      ContactNo: req.body.ContactNo,
      Email: req.body.Email,
      Website: req.body.Website,
      IsActive: req.body.IsActive || true,
      Status: req.body.Status || "Active",
    };
    console.log("mapped data: ", bankMaster);

    // Save BankMaster in the database
    const newBankMaster = await BankMaster.create(bankMaster);
    console.log("saved data: ", newBankMaster);

    return res.status(201).json(newBankMaster); // Send the newly created BankMaster as response
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

    console.error("Error creating BankMaster:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//Retrieve all stock from the database
exports.findAll = async (req, res) => {
  try {
    // Define the allowed bank types
    const allowedBankTypes = [
      "Private Sector Banks",
      "Public Sector Banks",
      "Regional Rural Banks",
      "Non-Banking Sector",
    ];

    const bankData = await BankMaster.findAll({
      attributes: [
        "BankID",
        "BankName",
        "BankType",
        "ContactNo",
        "Email",
        "Website",
        "IsActive",
        "Status",
      ],
      where: {
        // Add condition to filter by allowed BankType
        BankType: allowedBankTypes,
      },
      order: [
        ["BankName", "ASC"], // Order by BankName in ascending order
      ],
    });

    // Check if data is empty
    if (!bankData || bankData.length === 0) {
      return res.status(404).json({
        message: "No bank data found for the specified bank types.",
      });
    }

    // Map the data for response
    const mappedData = bankData.map((item) => ({
      BankID: item.BankID,
      BankName: item.BankName,
      BankType: item.BankType,
      ContactNo: item.ContactNo,
      Email: item.Email,
      Website: item.Website,
      IsActive: item.IsActive,
      Status: item.Status,
    }));

    // Send the mapped data as response
    res.json(mappedData);
  } catch (error) {
    // Handle errors
    console.error("Error retrieving bank data:", error);
    res.status(500).json({
      message: "Failed to retrieve bank data. Please try again later.",
      error: error.message,
    });
  }
};

// Find a single stock with an id
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;

    // Validate the ID parameter
    if (!id) {
      return res.status(400).json({
        message: "ID parameter is required.",
      });
    }

    // Fetch the bank data by primary key
    const bankData = await BankMaster.findOne({
      where: {
        BankID: id, // Replace 'BranchID' with 'BankID' or your primary key for the Bank table
      },
      attributes: [
        "BankID",
        "BankName",
        "BankType",
        "ContactNo",
        "Email",
        "Website",
        "IsActive",
        "Status",
      ],
    });

    // Check if data is found
    if (!bankData) {
      return res.status(404).json({
        message: "Bank data not found.",
      });
    }

    // Prepare the response data
    const responseData = {
      BankID: bankData.BankID,
      BankName: bankData.BankName,
      BankType: bankData.BankType,
      ContactNo: bankData.ContactNo,
      Email: bankData.Email,
      Website: bankData.Website,
      IsActive: bankData.IsActive,
      Status: bankData.Status,
    };

    // Send the response data
    res.json(responseData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while retrieving bank data.",
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
    console.error("Error retrieving bank data:", error);
    return res.status(500).json({
      message: "Failed to retrieve bank data. Please try again later.",
    });
  }
};

// Update a BranchMaster by the id in the request
exports.updateByPk = async (req, res) => {
  console.log("BankName:", req.body.BankName);

  try {
    // Validate request
    if (!req.body.BankName) {
      return res.status(400).json({ message: "BankName cannot be empty" });
    }
    if (!/^[a-zA-Z ]*$/.test(req.body.BankName)) {
      console.log("Validation failed: BankName contains special characters.");
      return res.status(400).json({
        message: "BankName should contain only letters",
      });
    }

    // Find the bank by ID
    const bankId = req.params.id;

    // Validate the ID parameter
    if (!bankId) {
      return res.status(400).json({ message: "ID parameter is required." });
    }

    let bankMaster = await BankMaster.findByPk(bankId);

    if (!bankMaster) {
      return res.status(404).json({ message: "BankMaster not found" });
    }

    // Update fields
    bankMaster.BankName = req.body.BankName;
    bankMaster.BankType = req.body.BankType || bankMaster.BankType;
    bankMaster.ContactNo = req.body.ContactNo || bankMaster.ContactNo;
    bankMaster.Email = req.body.Email || bankMaster.Email;
    bankMaster.Website = req.body.Website || bankMaster.Website;
    bankMaster.IsActive =
      req.body.IsActive !== undefined ? req.body.IsActive : bankMaster.IsActive;
    bankMaster.Status = req.body.Status || bankMaster.Status;
    bankMaster.ModifiedDate = new Date();

    // Save updated BankMaster in the database
    const updatedBankMaster = await bankMaster.save();

    return res.status(200).json(updatedBankMaster); // Send the updated BankMaster as response
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
        message: "Database error occurred while updating BankMaster.",
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
    console.error("Error updating BankMaster:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a BranchMaster with the specified id in the request
exports.deleteById = async (req, res) => {
  const id = req.params.id;

  try {
    // Validate the ID parameter
    if (!id) {
      return res.status(400).json({ message: "ID parameter is required." });
    }

    // Find the model by ID
    const bankMaster = await BankMaster.findByPk(id);

    // Check if the model exists
    if (!bankMaster) {
      return res
        .status(404)
        .json({ message: "BankMaster not found with id: " + id });
    }

    // Delete the model
    await bankMaster.destroy();

    // Send a success message
    res.status(200).json({
      message: "BankMaster with id: " + id + " deleted successfully",
    });
  } catch (err) {
    // Handle errors based on specific types
    if (err.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while deleting BankMaster.",
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
    console.error("Error deleting BankMaster:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
