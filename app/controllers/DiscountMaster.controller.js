/* eslint-disable no-dupe-keys */
/* eslint-disable no-unused-vars */
const db = require("../models");
const DiscountMaster = db.discountmaster;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;

// Basic CRUD API
// Create and Save a new DiscountMaster
exports.create = async (req, res) => {
  console.log("DiscountName:", req.body.DiscountName);

  try {
    // Validate request
    if (!req.body.DiscountName) {
      return res.status(400).json({ message: "DiscountName cannot be empty" });
    }

    // // Custom validation for DiscountName
    // if (!/^[a-zA-Z ]*$/.test(req.body.DiscountName)) {
    //   console.log(
    //     "Validation failed: DiscountName contains special characters."
    //   );
    //   return res.status(400).json({
    //     message: "DiscountName should contain only letters and spaces",
    //   });
    // }

    // Check if DiscountName already exists
    const existingModel = await DiscountMaster.findOne({
      where: { DiscountName: req.body.DiscountName },
    });
    if (existingModel) {
      return res.status(400).json({ message: "DiscountName already exists" });
    }

    // Create a DiscountMaster
    const discountMaster = {
      DiscountName: req.body.DiscountName,
      MultipleSelection: req.body.MultipleSelection,
      IsActive: req.body.IsActive || true,
      Status: req.body.Status || "Active",
    };

    // Save DiscountMaster in the database
    const newDiscountMaster = await DiscountMaster.create(discountMaster);

    return res.status(201).json(newDiscountMaster); // Send the newly created DiscountMaster as response
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

    console.error("Error creating DiscountMaster:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Retrieve all DivisionMasters from the database.
exports.findAll = async (req, res) => {
  try {
    // Fetch all discount data
    const discountData = await DiscountMaster.findAll({
      attributes: [
        "DiscountID",
        "DiscountName",
        "MultipleSelection",
        "CreatedDate",
        "IsActive",
        "Status",
      ],
      order: [
        ["CreatedDate", "DESC"], // Order by ModelDescription in ascending order
      ],
    });

    // Check if data is empty
    if (!discountData || discountData.length === 0) {
      return res.status(404).json({
        message: "No discount data found.",
      });
    }

    // Map the data for response
    const combinedData = discountData.map((item) => ({
      DiscountID: item.DiscountID,
      DiscountName: item.DiscountName,
      MultipleSelection: item.MultipleSelection,
      CreatedDate: item.CreatedDate,
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
        message: "Database error occurred while retrieving discount data.",
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
    console.error("Error retrieving discount data:", error);
    return res.status(500).json({
      message: "Failed to retrieve discount data. Please try again later.",
    });
  }
};
// Find a single DivisionMaster with an id
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;

    // Validate the ID parameter
    if (!id) {
      return res.status(400).json({
        message: "ID parameter is required.",
      });
    }

    // Fetch the discount data by primary key
    const discountData = await DiscountMaster.findOne({
      where: {
        DiscountID: id,
      },
      attributes: [
        "DiscountID",
        "DiscountName",
        "MultipleSelection",
        "IsActive",
        "Status",
      ],
    });

    // Check if data is found
    if (!discountData) {
      return res.status(404).json({
        message: "Discount data not found.",
      });
    }

    // Prepare the response data
    const responseData = {
      DiscountID: discountData.DiscountID,
      DiscountName: discountData.DiscountName,
      MultipleSelection: discountData.MultipleSelection,
      IsActive: discountData.IsActive,
      Status: discountData.Status,
      CreatedDate: discountData.CreatedDate,
      ModifiedDate: discountData.ModifiedDate,
    };

    // Send the response data
    res.json(responseData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while retrieving discount data.",
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
    console.error("Error retrieving discount data:", error);
    return res.status(500).json({
      message: "Failed to retrieve discount data. Please try again later.",
    });
  }
};
// Update a DivisionMaster by the id in the request
exports.updateByPk = async (req, res) => {
  console.log("DiscountName:", req.body.DiscountName);

  try {
    // Validate request
    if (!req.body.DiscountName) {
      return res.status(400).json({ message: "DiscountName cannot be empty" });
    }

    // Custom validation for DiscountName
    if (!/^[a-zA-Z ]*$/.test(req.body.DiscountName)) {
      console.log(
        "Validation failed: DiscountName contains special characters."
      );
      return res.status(400).json({
        message: "DiscountName should contain only letters and spaces",
      });
    }
    // Find the discount by ID
    const discountId = req.params.id;

    // Validate the ID parameter
    if (!discountId) {
      return res.status(400).json({ message: "ID parameter is required." });
    }

    let discountMaster = await DiscountMaster.findByPk(discountId);

    if (!discountMaster) {
      return res.status(404).json({ message: "DiscountMaster not found" });
    }

    // Update fields
    discountMaster.DiscountName = req.body.DiscountName;
    discountMaster.MultipleSelection = req.body.MultipleSelection;
    discountMaster.IsActive = req.body.IsActive || discountMaster.IsActive;
    discountMaster.Status = req.body.Status || discountMaster.Status;
    discountMaster.CreatedDate =
      req.body.CreatedDate || discountMaster.CreatedDate;
    discountMaster.ModifiedDate = new Date();

    // Save updated DiscountMaster in the database
    const updatedDiscountMaster = await discountMaster.save();

    return res.status(200).json(updatedDiscountMaster); // Send the updated DiscountMaster as response
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
        message: "Database error occurred while updating DiscountMaster.",
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
    console.error("Error updating DiscountMaster:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a DivisionMaster with the specified id in the request
exports.deleteById = async (req, res) => {
  const id = req.params.id;

  try {
    // Validate the ID parameter
    if (!id) {
      return res.status(400).json({ message: "ID parameter is required." });
    }

    // Find the model by ID
    const discountMaster = await DiscountMaster.findByPk(id);

    // Check if the model exists
    if (!discountMaster) {
      return res
        .status(404)
        .json({ message: "DiscountMaster not found with id: " + id });
    }

    // Delete the model
    await discountMaster.destroy();

    // Send a success message
    res.status(200).json({
      message: "DiscountMaster with id: " + id + " deleted successfully",
    });
  } catch (err) {
    // Handle errors based on specific types
    if (err.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while deleting DiscountMaster.",
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
    console.error("Error deleting DiscountMaster:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
