/* eslint-disable no-unused-vars */
const db = require("../models");
const StateMaster = db.statemaster;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;
const NationMaster = db.nationmaster;

// Basic CRUD API
// Create and Save a new StateMaster
exports.create = async (req, res) => {
  console.log("StateName:", req.body.StateName);

  try {
    // Validate request
    if (!req.body.StateName) {
      return res.status(400).json({ message: "StateName cannot be empty" });
    }
    if (!/^[a-zA-Z ]*$/.test(req.body.StateName)) {
      console.log("Validation failed: StateName contains special characters.");
      return res.status(400).json({
        message: "StateName should contain only letters",
      });
    }
    // Check if StateName already exists
    const existingModel = await StateMaster.findOne({
      where: { StateName: req.body.StateName },
    });
    if (existingModel) {
      return res.status(400).json({ message: "StateName already exists" });
    }

    // Create a new StateMaster
    const newStateMaster = await StateMaster.create({
      StateName: req.body.StateName,
      NationID: req.body.NationID,
      IsActive: req.body.IsActive || true,
      Status: req.body.Status || "Active",
    });

    // Save StateMaster in database
    console.log("New StateMaster created:", newStateMaster);

    return res.status(201).json(newStateMaster); // Send the newly created StateMaster as response
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
        message: "Database error occurred while creating StateMaster.",
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
    console.error("Error creating StateMaster:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Retrieve all OEMMasters from the database.
exports.findAll = async (req, res) => {
  try {
    // Fetch all state data with included nation data
    const stateData = await StateMaster.findAll({
      attributes: ["StateID", "StateName", "IsActive", "Status"],
      include: [
        {
          model: NationMaster,
          as: "SMNationID",
          attributes: ["NationID", "NationName"], // Include NationID and NationName attributes
        },
      ],
      order: [
        ["StateName", "ASC"], // Order by ModelDescription in ascending order
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
      StateID: item.StateID,
      StateName: item.StateName,
      NationID: item.SMNationID ? item.SMNationID.NationID : null, // Access NationID from the nation association
      NationName: item.SMNationID ? item.SMNationID.NationName : null, // Access NationName from the nation association
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

// Find a single OEMMaster with an id
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;

    // Fetch the state data by primary key with included nation data
    const stateData = await StateMaster.findOne({
      where: {
        StateID: id, // Replaced OEMID with StateID
      },
      attributes: ["StateID", "StateName", "IsActive", "Status"], // Added StateID
      include: [
        {
          model: NationMaster, // Replaced DivisionMaster with NationMaster
          as: "SMNationID",
          attributes: ["NationID", "NationName"], // Added NationID and NationName
        },
      ],
    });

    // Check if data is found
    if (!stateData) {
      return res.status(404).json({
        message: "State data not found.",
      });
    }

    // Prepare the response data
    const responseData = {
      StateID: stateData.StateID, // Updated to use StateID
      StateName: stateData.StateName,
      NationID: stateData.SMNationID ? stateData.SMNationID.NationID : null,
      NationName: stateData.SMNationID ? stateData.SMNationID.NationName : null, // Updated to use NationName
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

// Update a OEMMaster by the id in the request
exports.updateByPk = async (req, res) => {
  console.log("StateName:", req.body.StateName);

  try {
    // Validate request
    if (!req.body.StateName) {
      return res.status(400).json({ message: "StateName cannot be empty" });
    }
    if (!/^[a-zA-Z ]*$/.test(req.body.StateName)) {
      console.log("Validation failed: StateName contains special characters.");
      return res.status(400).json({
        message: "StateName should contain only letters",
      });
    }
    // Find the StateMaster by ID
    const stateID = req.params.id;
    let stateMaster = await StateMaster.findByPk(stateID);

    if (!stateMaster) {
      return res.status(404).json({ message: "StateMaster not found" });
    }

    // Update fields
    stateMaster.StateName = req.body.StateName;
    stateMaster.NationID = req.body.NationID || stateMaster.NationID;
    stateMaster.IsActive = req.body.IsActive || stateMaster.IsActive;
    stateMaster.Status = req.body.Status || stateMaster.Status;
    stateMaster.ModifiedDate = new Date();

    // Save updated StateMaster in the database
    const updatedStateMaster = await stateMaster.save();

    return res.status(200).json(updatedStateMaster); // Send the updated StateMaster as response
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
        message: "Database error occurred while updating StateMaster.",
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
    console.error("Error updating StateMaster:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a OEMMaster with the specified id in the request
exports.deleteById = async (req, res) => {
  const id = req.params.id;

  try {
    // Find the model by ID
    const stateMaster = await StateMaster.findByPk(id);

    // Check if the model exists
    if (!stateMaster) {
      return res
        .status(404)
        .json({ message: "StateMaster not found with id: " + id });
    }

    // Delete the model
    await stateMaster.destroy();

    // Send a success message
    res.status(200).json({
      message: "StateMaster with id: " + id + " deleted successfully",
    });
  } catch (err) {
    // Handle errors based on specific types
    if (err.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while deleting StateMaster.",
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
    console.error("Error deleting StateMaster:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
