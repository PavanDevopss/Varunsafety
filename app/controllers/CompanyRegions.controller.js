/* eslint-disable no-unused-vars */
const db = require("../models");
const StatePOSModel = require("../models/StatePOS.model");
const CompanyRegions = db.companyregions;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;
const CompanyStates = db.companystates;
const CompanyMaster = db.companymaster;
const StatePOS = db.statepos;

// Basic CRUD API
// Create and Save a new CompanyRegions
exports.create = async (req, res) => {
  console.log("CmpyRegionName:", req.body.CmpyRegionName);

  try {
    // Validate request
    if (!req.body.CmpyRegionName) {
      return res
        .status(400)
        .json({ message: "CmpyRegionName cannot be empty" });
    }
    if (!/^[a-zA-Z ]*$/.test(req.body.CmpyRegionName)) {
      console.log(
        "Validation failed: CmpyRegionName contains invalid characters."
      );
      return res.status(400).json({
        message: "CmpyRegionName should contain only letters and spaces",
      });
    }

    // Check if RegionName already exists
    const existingModel = await CompanyRegions.findOne({
      where: { CmpyRegionName: req.body.CmpyRegionName },
    });
    if (existingModel) {
      return res.status(400).json({ message: "RegionName already exists" });
    }

    // Create a new CompanyRegions
    const newCompanyRegions = await CompanyRegions.create({
      CmpyRegionName: req.body.CmpyRegionName,
      CmpyStateID: req.body.CmpyStateID,
      StatePOSID: req.body.StatePOSID,
      CompanyID: req.body.CompanyID,
      IsActive: req.body.IsActive || true,
      Status: req.body.Status || "Active",
    });

    // Save CompanyRegions in database
    console.log("New CompanyRegions created:", newCompanyRegions);

    return res.status(201).json(newCompanyRegions); // Send the newly created CompanyRegions as response
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
        message: "Database error occurred while creating CompanyRegions.",
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

    console.error("Error creating CompanyRegions:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Retrieve all CompanyRegions from the database.
exports.findAll = async (req, res) => {
  try {
    // Fetch all region data with included state data
    const regionData = await CompanyRegions.findAll({
      attributes: [
        "CmpyRegionID",
        "CmpyRegionName",
        "CmpyStateID",
        "CompanyID",
        "StatePOSID",
        "IsActive",
        "Status",
      ],
      include: [
        {
          model: CompanyStates,
          as: "CRCmpyStateID",
          attributes: ["CmpyStateID", "CmpyStateName"], // Include StateID and StateName attributes
        },
        {
          model: CompanyMaster,
          as: "CRCompanyID",
          attributes: ["CompanyID", "CompanyName"], // Include StateID and StateName attributes
        },
        {
          model: StatePOS,
          as: "CRCStatePOSID",
          attributes: ["StateName"], // Include StateID and StateName attributes
        },
      ],
      order: [
        ["CmpyRegionName", "ASC"], // Order by ModelDescription in ascending order
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
      CmpyRegionID: item.CmpyRegionID,
      CmpyRegionName: item.CmpyRegionName,
      CmpyStateID: item.CmpyStateID,
      CmpyStateName: item.CRCmpyStateID
        ? item.CRCmpyStateID.CmpyStateName
        : null,
      CompanyID: item.CompanyID,
      CompanyName: item.CRCompanyID ? item.CRCompanyID.CompanyName : null,
      CmpyStateName: item.CRCStatePOSID ? item.CRCStatePOSID.StateName : null,
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

// Find a single CompanyRegions with an id
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;

    // Fetch the region data by primary key with included state data
    const regionData = await CompanyRegions.findOne({
      where: {
        CmpyRegionID: id, // Replaced StateID with RegionID
      },
      attributes: [
        "CmpyRegionID",
        "CmpyRegionName",
        "CmpyStateID",
        "StatePOSID",
        "CompanyID",
        "IsActive",
        "Status",
      ],
      include: [
        {
          model: CompanyStates,
          as: "CRCmpyStateID",
          attributes: ["CmpyStateID", "CmpyStateName"], // Include StateID and StateName attributes
        },
        {
          model: CompanyMaster,
          as: "CRCompanyID",
          attributes: ["CompanyID", "CompanyName"], // Include StateID and StateName attributes
        },
        {
          model: StatePOS,
          as: "CRCStatePOSID",
          attributes: ["StateName"], // Include StateID and StateName attributes
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
      CmpyRegionID: regionData.CmpyRegionID, // Updated to use RegionID
      CmpyRegionName: regionData.CmpyRegionName,
      CmpyStateID: regionData.CmpyStateID,
      CmpyStateName: regionData.CRCmpyStateID
        ? regionData.CRCmpyStateID.CmpyStateName
        : null,
      CompanyID: regionData.CompanyID,
      CompanyName: regionData.CRCompanyID
        ? regionData.CRCompanyID.CompanyName
        : null,
      CmpyStateName: regionData.CRCStatePOSID
        ? regionData.CRCStatePOSID.StateName
        : null,
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

// Update a CompanyRegions by the id in the request
exports.updateByPk = async (req, res) => {
  console.log("CmpyRegionName:", req.body.CmpyRegionName);

  try {
    // Validate request
    if (!req.body.CmpyRegionName) {
      return res
        .status(400)
        .json({ message: "CmpyRegionName cannot be empty" });
    }
    if (!/^[a-zA-Z ]*$/.test(req.body.CmpyRegionName)) {
      console.log(
        "Validation failed: CmpyRegionName contains special characters."
      );
      return res.status(400).json({
        message: "CmpyRegionName should contain only letters",
      });
    }
    // Find the CompanyRegions by ID
    const regionID = req.params.id;
    let companyRegions = await CompanyRegions.findByPk(regionID);

    if (!companyRegions) {
      return res.status(404).json({ message: "CompanyRegions not found" });
    }

    // Update fields
    companyRegions.CmpyRegionName =
      req.body.CmpyRegionName || companyRegions.CmpyRegionName;
    companyRegions.StateID = req.body.StateID || companyRegions.StateID;
    companyRegions.CompanyID = req.body.CompanyID || companyRegions.CompanyID;
    companyRegions.StatePOSID =
      req.body.StatePOSID || companyRegions.StatePOSID;
    companyRegions.IsActive = req.body.IsActive || companyRegions.IsActive;
    companyRegions.Status = req.body.Status || companyRegions.Status;
    companyRegions.ModifiedDate = new Date();

    // Save updated CompanyRegions in the database
    const updatedCompanyRegions = await companyRegions.save();

    return res.status(200).json(updatedCompanyRegions); // Send the updated CompanyRegions as response
  } catch (err) {
    console.error("Error updating CompanyRegions:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a CompanyRegions with the specified id in the request
exports.deleteById = async (req, res) => {
  const id = req.params.id;

  try {
    // Find the model by ID
    const companyRegions = await CompanyRegions.findByPk(id);

    // Check if the model exists
    if (!companyRegions) {
      return res
        .status(404)
        .json({ message: "CompanyRegions not found with id: " + id });
    }

    // Delete the model
    await companyRegions.destroy();

    // Send a success message
    res.status(200).json({
      message: "CompanyRegions with id: " + id + " deleted successfully",
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
        message: "Database error occurred while updating CompanyRegions.",
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
    console.error("Error deleting CompanyRegions:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
