/* eslint-disable no-unused-vars */
const db = require("../models");
const OEMMaster = db.oemmaster;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;
const CompanyMaster = db.companymaster;
const ParentCompany = db.parentcompany;
const IndustryMaster = db.industrymaster;

// Basic CRUD API
// Create and Save a new OEMMaster
exports.create = async (req, res) => {
  console.log("OEMName:", req.body.OEMName);

  try {
    // Validate request
    if (!req.body.OEMName) {
      return res.status(400).json({ message: "OEMName cannot be empty" });
    }
    if (!/^[a-zA-Z ]*$/.test(req.body.OEMName)) {
      console.log("Validation failed: OEMName contains special characters.");
      return res.status(400).json({
        message: "OEMName should contain only letters",
      });
    }
    // Check if OEMName already exists
    const existingModel = await OEMMaster.findOne({
      where: { OEMCode: req.body.OEMCode },
    });
    if (existingModel) {
      return res.status(400).json({ message: "OEMCode already exists" });
    }
    const existingModel1 = await OEMMaster.findOne({
      where: { OEMName: req.body.OEMName },
    });
    if (existingModel1) {
      return res.status(400).json({ message: "OEMName already exists" });
    }
    if (existingModel) {
      return res.status(400).json({ message: "OEMCode already exists" });
    }
    // Create a new OEMMaster
    const newOEMMaster = await OEMMaster.create({
      OEMCode: req.body.OEMCode,
      OEMName: req.body.OEMName,
      CompanyID: req.body.CompanyID,
      ParentCmpyID: req.body.ParentCmpyID,
      IndustryID: req.body.IndustryID,
      IsActive: req.body.IsActive || true,
      Status: req.body.Status || "Active",
    });

    // Save OEMMaster in database
    console.log("New OEMMaster created:", newOEMMaster);

    return res.status(201).json(newOEMMaster); // Send the newly created OEMMaster as response
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
        message: "Database error occurred while creating OEMMaster.",
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
    console.error("Error creating OEMMaster:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Retrieve all OEMMasters from the database.
exports.findAll = async (req, res) => {
  try {
    // Fetch all OEM data with included division data
    const oemNameData = await OEMMaster.findAll({
      attributes: ["OEMID", "OEMCode", "OEMName", "IsActive", "Status"],
      include: [
        {
          model: CompanyMaster,
          as: "OEMMCompanyID",
          attributes: ["CompanyID", "CompanyName"],
        },
        {
          model: ParentCompany,
          as: "OEMMParentCmpyID",
          attributes: ["ParentCmpyID", "ParentCmpyName"],
        },
        {
          model: IndustryMaster,
          as: "OEMMIndustryID",
          attributes: ["IndustryID", "IndustryName"],
        },
      ],
      order: [
        ["OEMName", "ASC"], // Order by ModelDescription in ascending order
      ],
    });

    // Check if data is empty
    if (!oemNameData || oemNameData.length === 0) {
      return res.status(404).json({
        message: "No OEM name data found.",
      });
    }

    // Map the data for response
    const combinedData = oemNameData.map((item) => ({
      OEMID: item.OEMID,
      OEMName: item.OEMName,
      OEMCode: item.OEMCode,
      CompanyID: item.OEMMCompanyID ? item.OEMMCompanyID.CompanyID : null,
      CompanyName: item.OEMMCompanyID ? item.OEMMCompanyID.CompanyName : null,
      ParentCmpyID: item.OEMMParentCmpyID
        ? item.OEMMParentCmpyID.ParentCmpyID
        : null,
      ParentCmpyName: item.OEMMParentCmpyID
        ? item.OEMMParentCmpyID.ParentCmpyName
        : null,
      IndustryID: item.OEMMIndustryID ? item.OEMMIndustryID.IndustryID : null,
      IndustryName: item.OEMMIndustryID
        ? item.OEMMIndustryID.IndustryName
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
        message: "Database error occurred while retrieving OEM data.",
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
    console.error("Error retrieving OEM name data:", error);
    res.status(500).json({
      message: "Failed to retrieve OEM name data. Please try again later.",
    });
  }
};

// Find a single OEMMaster with an id
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;

    // Fetch the OEM data by primary key with included DivisionMaster data
    const oemData = await OEMMaster.findOne({
      where: {
        OEMID: id, // Replaced DivisionID with OEMID
      },
      attributes: ["OEMID", "OEMCode", "OEMName", "IsActive", "Status"], // Added OEMID
      include: [
        {
          model: CompanyMaster,
          as: "OEMMCompanyID",
          attributes: ["CompanyID", "CompanyName"],
        },
        {
          model: ParentCompany,
          as: "OEMMParentCmpyID",
          attributes: ["ParentCmpyID", "ParentCmpyName"],
        },
        {
          model: IndustryMaster,
          as: "OEMMIndustryID",
          attributes: ["IndustryID", "IndustryName"],
        },
      ],
    });

    // Check if data is found
    if (!oemData) {
      return res.status(404).json({
        message: "OEM data not found.",
      });
    }

    // Prepare the response data
    const responseData = {
      OEMID: oemData.OEMID,
      OEMName: oemData.OEMName,
      OEMCode: oemData.OEMCode,
      CompanyID: oemData.OEMMCompanyID ? oemData.OEMMCompanyID.CompanyID : null, // Updated to use divisionMaster
      CompanyName: oemData.OEMMCompanyID
        ? oemData.OEMMCompanyID.CompanyName
        : null, // Updated to use divisionMaster
      ParentCmpyID: oemData.OEMMParentCmpyID
        ? oemData.OEMMParentCmpyID.ParentCmpyID
        : null,
      ParentCmpyName: oemData.OEMMParentCmpyID
        ? oemData.OEMMParentCmpyID.ParentCmpyName
        : null,
      IndustryID: oemData.OEMMIndustryID
        ? oemData.OEMMIndustryID.IndustryID
        : null,
      IndustryName: oemData.OEMMIndustryID
        ? oemData.OEMMIndustryID.IndustryName
        : null,
      IsActive: oemData.IsActive,
      Status: oemData.Status,
    };

    // Send the response data
    res.json(responseData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while retrieving OEM data.",
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
    console.error("Error retrieving OEM data:", error);
    res.status(500).json({
      message: "Failed to retrieve OEM data. Please try again later.",
    });
  }
};

// Update a OEMMaster by the id in the request
exports.updateByPk = async (req, res) => {
  console.log("OEMName:", req.body.OEMName);

  try {
    // Validate request
    if (!req.body.OEMName) {
      return res.status(400).json({ message: "OEMName cannot be empty" });
    }
    if (!/^[a-zA-Z ]*$/.test(req.body.OEMName)) {
      console.log("Validation failed: OEMName contains special characters.");
      return res.status(400).json({
        message: "OEMName should contain only letters",
      });
    }
    // Find the OEMMaster by ID
    const oemID = req.params.id;
    let oemMaster = await OEMMaster.findByPk(oemID);

    if (!oemMaster) {
      return res.status(404).json({ message: "OEMMaster not found" });
    }

    // Update fields
    oemMaster.OEMName = req.body.OEMName;
    oemMaster.OEMCode = req.body.OEMCode;
    oemMaster.CompanyID = req.body.CompanyID || oemMaster.CompanyID;
    oemMaster.ParentCmpyID = req.body.CompanyID || oemMaster.ParentCmpyID;
    oemMaster.IndustryID = req.body.CompanyID || oemMaster.IndustryID;
    oemMaster.IsActive = req.body.IsActive || oemMaster.IsActive;
    oemMaster.Status = req.body.Status || oemMaster.Status;
    oemMaster.ModifiedDate = new Date();

    // Save updated OEMMaster in the database
    const updatedOEMMaster = await oemMaster.save();

    return res.status(200).json(updatedOEMMaster); // Send the updated OEMMaster as response
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
        message: "Database error occurred while updating OEMMaster.",
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

    console.error("Error updating OEMMaster:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a OEMMaster with the specified id in the request
exports.deleteById = async (req, res) => {
  const id = req.params.id;

  try {
    // Find the model by ID
    const oemMaster = await OEMMaster.findByPk(id);

    // Check if the model exists
    if (!oemMaster) {
      return res
        .status(404)
        .json({ message: "OEMMaster not found with id: " + id });
    }

    // Delete the model
    await oemMaster.destroy();

    // Send a success message
    res.status(200).json({
      message: "OEMMaster with id: " + id + " deleted successfully",
    });
  } catch (err) {
    // Handle errors based on specific types
    if (err.name === "SequelizeForeignKeyConstraintError") {
      // Handle foreign key constraint errors
      return res.status(409).json({
        message:
          "Cannot delete. This OEMMaster is referenced by other records.",
        details: err.message,
      });
    }

    if (err.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while deleting OEMMaster.",
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
    console.error("Error deleting OEMMaster:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
