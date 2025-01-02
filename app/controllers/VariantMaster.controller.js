/* eslint-disable no-unused-vars */
const db = require("../models");
const VariantMaster = db.variantmaster;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;
const Transmission = db.transmission;

// Basic CRUD API
// Create and Save a new VariantMaster
exports.create = async (req, res) => {
  console.log("Variant Code:", req.body.VariantCode);

  // Validate request
  try {
    if (!req.body.VariantCode) {
      return res.status(400).json({ message: "VariantCode cannot be empty" });
    }
    if (!req.body.TransmissionID) {
      return res
        .status(400)
        .json({ message: "TransmissionID cannot be empty" });
    }

    // Check if ModelCode already exists
    const existingModel = await VariantMaster.findOne({
      where: { VariantCode: req.body.VariantCode },
    });
    if (existingModel) {
      return res.status(400).json({ message: "VariantCode already exists" });
    }

    // Access uploaded file paths
    //const filePaths = req.files.map((file) => file.path);

    // Create a model
    const variantMaster = {
      VariantCode: req.body.VariantCode.toUpperCase(),
      TransmissionID: req.body.TransmissionID,
      IsActive: req.body.IsActive || true,
      Status: req.body.Status || "Active",
    };

    // Save VariantMasters in the database
    const newVariantMaster = await VariantMaster.create(variantMaster);

    return res.status(201).json(newVariantMaster); // Send the newly created VariantMaster as response
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
        message: "Database error occurred while creating VariantMaster.",
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
    console.error("Error creating VariantMaster:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Retrieve all VariantMasters from the database.
exports.findAll = async (req, res) => {
  try {
    // Fetch all variant data with included transmission data
    const variantData = await VariantMaster.findAll({
      attributes: [
        "VariantID",
        "VariantCode",
        "TransmissionID",
        "IsActive",
        "Status",
      ],
      include: [
        {
          model: Transmission,
          as: "VMTransmissionID",
          attributes: ["TransmissionCode"],
        },
      ],
      order: [
        ["CreatedDate", "DESC"], // Order by CreatedDate in decending order
      ],
    });

    // Check if data is empty
    if (!variantData || variantData.length === 0) {
      return res.status(404).json({
        message: "No variant data found.",
      });
    }

    // Map the data for response
    const combinedData = variantData.map((item) => ({
      VariantID: item.VariantID,
      VariantCode: item.VariantCode,
      TransmissionID: item.TransmissionID,
      TransmissionCode: item.VMTransmissionID
        ? item.VMTransmissionID.TransmissionCode
        : null,
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
        message: "Database error occurred while retrieving variant name data.",
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
    console.error("Error retrieving variant data:", error);
    res.status(500).json({
      message: "Failed to retrieve variant data. Please try again later.",
    });
  }
};

// Find a single VariantMaster with an id
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;

    // Fetch the variant data by primary key with included transmission data
    const variantData = await VariantMaster.findOne({
      where: {
        VariantID: id,
      },
      attributes: [
        "VariantID",
        "VariantCode",
        "TransmissionID",
        "IsActive",
        "Status",
      ],
      include: [
        {
          model: Transmission,
          as: "VMTransmissionID",
          attributes: ["TransmissionCode"],
        },
      ],
    });

    // Check if data is found
    if (!variantData) {
      return res.status(404).json({
        message: "Variant data not found.",
      });
    }

    // Prepare the response data
    const responseData = {
      VariantID: variantData.VariantID,
      VariantCode: variantData.VariantCode,
      TransmissionID: variantData.TransmissionID,
      TransmissionCode: variantData.VMTransmissionID
        ? variantData.VMTransmissionID.TransmissionCode
        : null,
      IsActive: variantData.IsActive,
      Status: variantData.Status,
    };

    // Send the response data
    res.json(responseData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while retrieving variant data.",
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
    console.error("Error retrieving variant data:", error);
    res.status(500).json({
      message: "Failed to retrieve variant data. Please try again later.",
    });
  }
};

// Update a VariantMaster by the id in the request
exports.updateByPk = async (req, res) => {
  console.log("Variant Code:", req.body.VariantCode);

  try {
    // Validate request
    if (!req.body.VariantCode) {
      return res.status(400).json({ message: "VariantCode cannot be empty" });
    }
    if (!req.body.TransmissionID) {
      return res
        .status(400)
        .json({ message: "TransmissionID cannot be empty" });
    }

    // Find the model by ID
    const variantId = req.params.id;
    let variantMaster = await VariantMaster.findByPk(variantId);

    if (!variantMaster) {
      return res.status(404).json({ message: "VariantMaster not found" });
    }

    // Update other fields
    variantMaster.VariantCode = req.body.VariantCode.toUpperCase();
    variantMaster.TransmissionID =
      req.body.TransmissionID || variantMaster.TransmissionID;
    variantMaster.IsActive =
      req.body.IsActive !== undefined
        ? req.body.IsActive
        : variantMaster.IsActive;

    // Set Status field based on IsActive
    variantMaster.Status = variantMaster.IsActive ? "Active" : "In-Active";
    variantMaster.ModifiedDate = new Date();

    // console.log("model:", VariantMaster);

    // Save updated VariantMaster in the database
    const updatedVariantMaster = await variantMaster.save();

    return res.status(200).json(updatedVariantMaster); // Send the updated VariantMaster as response
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
        message: "Database error occurred while updating VariantMaster.",
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
    console.error("Error updating VariantMaster:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a VariantMaster with the specified id in the request
exports.deleteById = async (req, res) => {
  const id = req.params.id;

  try {
    // Find the model by ID
    const variantMaster = await VariantMaster.findByPk(id);

    // Check if the model exists
    if (!variantMaster) {
      return res
        .status(404)
        .json({ message: "VariantMaster not found with id: " + id });
    }

    // Delete the model
    await variantMaster.destroy();

    // Send a success message
    res.status(200).json({
      message: "VariantMaster with id: " + id + " deleted successfully",
    });
  } catch (err) {
    // Handle errors based on specific types
    if (err.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while deleting VariantMaster.",
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
    console.error("Error deleting VariantMaster:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
