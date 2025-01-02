/* eslint-disable no-unused-vars */
const db = require("../models");
const ColourMaster = db.colourmaster;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;
const ColourCategory = db.colourcategory;

// Basic CRUD API
// Create and Save a new ColourMaster
exports.create = async (req, res) => {
  console.log("Colour Code:", req.body.ColourCode);

  try {
    // Validate request
    if (!req.body.ColourCode) {
      return res.status(400).json({ message: "Colour Code cannot be empty" });
    }
    if (!/^[A-Z0-9]*$/.test(req.body.ColourCode)) {
      console.log("Validation failed: ColourCode contains special characters.");
      return res.status(400).json({
        message: "ColourCode should contain only letters and numbers",
      });
    }
    if (!req.body.ColourDescription) {
      return res
        .status(400)
        .json({ message: "Colour Description cannot be empty" });
    }
    if (!req.body.ColourCategoryID) {
      return res
        .status(400)
        .json({ message: "Colour Category cannot be empty" });
    }

    // Check if ColourCode already exists
    const existingModel = await ColourMaster.findOne({
      where: { ColourCode: req.body.ColourCode },
    });
    if (existingModel) {
      return res.status(400).json({ message: "Colour Code already exists" });
    }

    // Create a model
    const colourMaster = {
      ColourCode: req.body.ColourCode.toUpperCase(),
      ColourDescription: req.body.ColourDescription.toUpperCase(),
      ColourCategoryID: req.body.ColourCategoryID,
      IsActive: req.body.IsActive !== undefined ? req.body.IsActive : true,
      Status: req.body.Status || "Active",
    };

    console.log("ColourDescription:", colourMaster.ColourDescription);

    // Save ColourMaster in the database
    const newColourMaster = await ColourMaster.create(colourMaster);

    return res.status(201).json(newColourMaster); // Send the newly created ColourMaster as response
  } catch (err) {
    // Handle errors based on specific types
    if (err.name === "SequelizeValidationError") {
      return res.status(400).json({
        message: "Validation error",
        details: err.errors.map((e) => e.message),
      });
    }

    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        message: "Unique constraint error",
        details: err.errors.map((e) => e.message),
      });
    }

    if (err.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message: "Database error occurred while creating ColourMaster.",
        details: err.message,
      });
    }

    if (err.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: err.message,
      });
    }

    console.error("Error creating ColourMaster:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Retrieve all ColourMasters from the database.
exports.findAll = async (req, res) => {
  try {
    // Fetch all colour data with included colour category data
    const colourData = await ColourMaster.findAll({
      attributes: [
        "ColourID",
        "ColourCode",
        "ColourDescription",
        "ColourCategoryID",
        "IsActive",
        "Status",
      ],
      include: [
        {
          model: ColourCategory,
          as: "CMColourCategoryID",
          attributes: ["ColourCategoryName"],
        },
      ],
      order: [
        ["CreatedDate", "DESC"], // Order by CreatedDate in decending order
      ],
    });

    // Check if data is empty
    if (!colourData || colourData.length === 0) {
      return res.status(404).json({
        message: "No colour data found.",
      });
    }

    // Map the data for response
    const combinedData = colourData.map((item) => ({
      ColourID: item.ColourID,
      ColourCode: item.ColourCode,
      ColourDescription: item.ColourDescription,
      ColourCategoryID: item.ColourCategoryID,
      ColourCategoryName: item.CMColourCategoryID
        ? item.CMColourCategoryID.ColourCategoryName
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
        message: "Database error occurred while retrieving colour name data.",
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
    // Handle errors
    console.error("Error retrieving colour data:", error);
    res.status(500).json({
      message: "Failed to retrieve colour data. Please try again later.",
    });
  }
};

// Find a single ColourMaster with an id
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;

    // Fetch the colour data by primary key with included colour category data
    const colourData = await ColourMaster.findOne({
      where: {
        ColourID: id,
      },
      attributes: [
        "ColourID",
        "ColourCode",
        "ColourDescription",
        "ColourCategoryID",
        "IsActive",
        "Status",
      ],
      include: [
        {
          model: ColourCategory,
          as: "CMColourCategoryID",
          attributes: ["ColourCategoryName"],
        },
      ],
    });

    // Check if data is found
    if (!colourData) {
      return res.status(404).json({
        message: "Colour data not found.",
      });
    }

    // Prepare the response data
    const responseData = {
      ColourID: colourData.ColourID,
      ColourCode: colourData.ColourCode,
      ColourDescription: colourData.ColourDescription,
      ColourCategoryID: colourData.ColourCategoryID,
      ColourCategoryName: colourData.CMColourCategoryID
        ? colourData.CMColourCategoryID.ColourCategoryName
        : null,
      IsActive: colourData.IsActive,
      Status: colourData.Status,
    };

    // Send the response data
    res.json(responseData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while retrieving colour data.",
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
    // Handle errors
    console.error("Error retrieving colour data:", error);
    res.status(500).json({
      message: "Failed to retrieve colour data. Please try again later.",
    });
  }
};

// Update a ColourMaster by the id in the request
exports.updateByPk = async (req, res) => {
  try {
    // Log ColourMaster ID and Colour Code for debugging
    console.log("ColourMaster ID:", req.params.id);
    console.log("Colour Code:", req.body.ColourCode);

    // Validate request
    if (!req.body.ColourCode) {
      return res.status(400).json({ message: "ColourCode cannot be empty" });
    }
    if (!/^[A-Z0-9]*$/.test(req.body.ColourCode)) {
      console.log("Validation failed: ColourCode contains special characters.");
      return res.status(400).json({
        message: "ColourCode should contain only letters and numbers",
      });
    }
    if (!req.body.ColourCategoryID) {
      return res
        .status(400)
        .json({ message: "Colour Category cannot be empty" });
    }

    // Find the ColourMaster record by ID
    const colourId = req.params.id;
    let colourMaster = await ColourMaster.findByPk(colourId);

    if (!colourMaster) {
      return res
        .status(404)
        .json({ message: `ColourMaster with ID ${colourId} not found` });
    }

    // Update fields
    colourMaster.ColourCode = req.body.ColourCode.toUpperCase();
    colourMaster.ColourDescription =
      req.body.ColourDescription?.toUpperCase() ||
      colourMaster.ColourDescription;
    colourMaster.ColourCategoryID =
      req.body.ColourCategoryID || colourMaster.ColourCategoryID;
    colourMaster.IsActive =
      req.body.IsActive !== undefined
        ? req.body.IsActive
        : colourMaster.IsActive;

    // Set Status field based on IsActive
    colourMaster.Status = colourMaster.IsActive ? "Active" : "In-Active";
    colourMaster.ModifiedDate = new Date();

    // Save updated ColourMaster in the database
    const updatedColourMaster = await colourMaster.save();

    return res.status(200).json(updatedColourMaster); // Send the updated ColourMaster as response
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
        message: "Database error occurred while updating ColourMaster.",
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

    // Log error and return generic error message
    console.error("Error updating ColourMaster:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a ColourMaster with the specified id in the request
exports.deleteById = async (req, res) => {
  const id = req.params.id;

  try {
    // Find the model by ID
    const colourMaster = await ColourMaster.findByPk(id);

    // Check if the model exists
    if (!colourMaster) {
      return res
        .status(404)
        .json({ message: "ColourMaster not found with id: " + id });
    }

    // Delete the model
    await colourMaster.destroy();

    // Send a success message
    res.status(200).json({
      message: "ColourMaster with id: " + id + " deleted successfully",
    });
  } catch (err) {
    // Handle errors based on specific types
    if (err.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while deleting ColourMaster.",
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
    console.error("Error deleting ColourMaster:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
