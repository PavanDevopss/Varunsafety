/* eslint-disable no-unused-vars */
const db = require("../models");
const RegionMaster = db.regionmaster;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;
const StateMaster = db.statemaster;
const CompanyMaster = db.companymaster;

// Basic CRUD API
// Create and Save a new StateMaster
exports.create = async (req, res) => {
  console.log("RegionName:", req.body.RegionName);

  try {
    // Validate request
    if (!req.body.RegionName) {
      return res.status(400).json({ message: "RegionName cannot be empty" });
    }
    if (!/^[a-zA-Z ]*$/.test(req.body.DiscountName)) {
      console.log(
        "Validation failed: DiscountName contains invalid characters."
      );
      return res.status(400).json({
        message: "DiscountName should contain only letters and spaces",
      });
    }

    // Check if RegionName already exists
    const existingModel = await RegionMaster.findOne({
      where: { RegionName: req.body.RegionName },
    });
    if (existingModel) {
      return res.status(400).json({ message: "RegionName already exists" });
    }

    // Create a new RegionMaster
    const newRegionMaster = await RegionMaster.create({
      RegionName: req.body.RegionName,
      StateID: req.body.StateID,
      IsActive: req.body.IsActive || true,
      Status: req.body.Status || "Active",
    });

    // Save RegionMaster in database
    console.log("New RegionMaster created:", newRegionMaster);

    return res.status(201).json(newRegionMaster); // Send the newly created RegionMaster as response
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
        message: "Database error occurred while creating RegionMaster.",
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

    console.error("Error creating RegionMaster:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Retrieve all OEMMasters from the database.
exports.findAll = async (req, res) => {
  try {
    // Fetch all region data with included state data
    const regionData = await RegionMaster.findAll({
      attributes: ["RegionID", "RegionName", "IsActive", "Status"],
      include: [
        {
          model: StateMaster,
          as: "RMStateID",
          attributes: ["StateID", "StateName"], // Include StateID and StateName attributes
        },
      ],
      order: [
        ["RegionName", "ASC"], // Order by ModelDescription in ascending order
      ],
    });

    // Check if data is empty
    if (!regionData || regionData.length === 0) {
      return res.status(404).json({
        message: "No region data found.",
      });
    }

    // Map the data for response
    const combinedData = regionData.map((item) => ({
      RegionID: item.RegionID,
      RegionName: item.RegionName,
      StateID: item.RMStateID ? item.RMStateID.StateID : null, // Access StateID from the state association
      StateName: item.RMStateID ? item.RMStateID.StateName : null,
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
        message: "Database error occurred while retrieving region name data.",
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
    console.error("Error retrieving region data:", error);
    res.status(500).json({
      message: "Failed to retrieve region data. Please try again later.",
    });
  }
};

// Find a single OEMMaster with an id
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;

    // Fetch the region data by primary key with included state data
    const regionData = await RegionMaster.findOne({
      where: {
        RegionID: id, // Replaced StateID with RegionID
      },
      attributes: ["RegionID", "RegionName", "IsActive", "Status"], // Updated attributes
      include: [
        {
          model: StateMaster, // Replaced NationMaster with StateMaster
          as: "RMStateID",
          attributes: ["StateID", "StateName"], // Updated attributes
        },
      ],
    });

    // Check if data is found
    if (!regionData) {
      return res.status(404).json({
        message: "Region data not found.",
      });
    }

    // Prepare the response data
    const responseData = {
      RegionID: regionData.RegionID, // Updated to use RegionID
      RegionName: regionData.RegionName,
      StateID: regionData.RMStateID ? regionData.RMStateID.StateID : null, // Access StateID from the stateMaster association
      StateName: regionData.RMStateID ? regionData.RMStateID.StateName : null, // Access StateName from the stateMaster association
      IsActive: regionData.IsActive,
      Status: regionData.Status,
    };

    // Send the response data
    res.json(responseData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while retrieving region data.",
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
    console.error("Error retrieving region data:", error);
    res.status(500).json({
      message: "Failed to retrieve region data. Please try again later.",
    });
  }
};

// Update a OEMMaster by the id in the request
exports.updateByPk = async (req, res) => {
  console.log("RegionName:", req.body.RegionName);

  try {
    // Validate request
    if (!req.body.RegionName) {
      return res.status(400).json({ message: "RegionName cannot be empty" });
    }
    if (!/^[a-zA-Z ]*$/.test(req.body.RegionName)) {
      console.log("Validation failed: RegionName contains special characters.");
      return res.status(400).json({
        message: "RegionName should contain only letters",
      });
    }
    // Find the RegionMaster by ID
    const regionID = req.params.id;
    let regionMaster = await RegionMaster.findByPk(regionID);

    if (!regionMaster) {
      return res.status(404).json({ message: "RegionMaster not found" });
    }

    // Update fields
    regionMaster.RegionName = req.body.RegionName;
    regionMaster.StateID = req.body.StateID || regionMaster.StateID; // StateID as a foreign key
    regionMaster.IsActive = req.body.IsActive || regionMaster.IsActive;
    regionMaster.Status = req.body.Status || regionMaster.Status;
    regionMaster.ModifiedDate = new Date();

    // Save updated RegionMaster in the database
    const updatedRegionMaster = await regionMaster.save();

    return res.status(200).json(updatedRegionMaster); // Send the updated RegionMaster as response
  } catch (err) {
    console.error("Error updating RegionMaster:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a OEMMaster with the specified id in the request
exports.deleteById = async (req, res) => {
  const id = req.params.id;

  try {
    // Find the model by ID
    const regionMaster = await RegionMaster.findByPk(id);

    // Check if the model exists
    if (!regionMaster) {
      return res
        .status(404)
        .json({ message: "RegionMaster not found with id: " + id });
    }

    // Delete the model
    await regionMaster.destroy();

    // Send a success message
    res.status(200).json({
      message: "RegionMaster with id: " + id + " deleted successfully",
    });
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
        message: "Database error occurred while updating RegionMaster.",
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
    console.error("Error deleting RegionMaster:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
