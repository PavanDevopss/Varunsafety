/* eslint-disable no-unused-vars */
const db = require("../models");
const CompanyGSTMaster = db.companygstmaster;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;
const CompanyMaster = db.companymaster;
const StatePOS = db.statepos;

// Basic CRUD API
// Create and Save a new CompanyGSTMaster
exports.create = async (req, res) => {
  console.log("GSTIN:", req.body.GSTIN);

  try {
    // Validate request
    if (!req.body.GSTIN) {
      return res.status(400).json({ message: "GSTIN cannot be empty" });
    }
    if (!/^[a-zA-Z ]*$/.test(req.body.GSTIN)) {
      console.log("Validation failed: GSTIN contains special characters.");
      return res.status(400).json({
        message: "GSTIN should contain only letters",
      });
    }
    // Check if CompanyName already exists
    const existingModel = await CompanyGSTMaster.findOne({
      where: { GSTIN: req.body.GSTIN },
    });
    if (existingModel) {
      return res.status(400).json({ message: "GSTIN already exists" });
    }

    // Create a new CompanyGSTMaster
    const newCompanyGSTMaster = await CompanyGSTMaster.create({
      CompanyID: req.body.CompanyID,
      GSTIN: req.body.GSTIN,
      RegistrationType: req.body.RegistrationType,
      LegalName: req.body.LegalName,
      TradeName: req.body.TradeName,
      DOR: req.body.DOR,
      Address: req.body.Address,
      StatePOSID: req.body.StatePOSID,
      ClientID: req.body.ClientID,
      ClientSecret: req.body.ClientSecret,
      PINCode: req.body.PINCode,
      UserName: req.body.UserName,
      Password: req.body.Password,
      GSTStatus: req.body.GSTStatus || true,
      IsActive: req.body.IsActive || true,
      Status: req.body.Status || "Active",
    });

    // Save CompanyGSTMaster in database
    console.log("New CompanyGSTMaster created:", newCompanyGSTMaster);

    return res.status(201).json(newCompanyGSTMaster); // Send the newly created CompanyGSTMaster as response
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
        message: "Database error occurred while creating CompanyGSTMaster.",
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
    console.error("Error creating CompanyGSTMaster:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Retrieve all CompanyGSTMaster from the database.
exports.findAll = async (req, res) => {
  try {
    const CompanyID = req.query.CompanyID;
    // Fetch all company data with included OEM data
    const companyNameData = await CompanyGSTMaster.findAll({
      where: { CompanyID },
      attributes: ["CmpyGSTID", "CompanyID", "GSTIN", "StatePOSID", "Status"],
      include: [
        {
          model: StatePOS,
          as: "CmpyGSTMStatePOSID",
          attributes: ["StatePOSID", "POSID", "StateName"], // Include OEMID and OEMName attributes
        },
      ],
      order: [
        ["CompanyID", "ASC"], // Order by ModelDescription in ascending order
      ],
    });

    // Check if data is empty
    if (!companyNameData || companyNameData.length === 0) {
      return res.status(404).json({
        message: "No company name data found.",
      });
    }

    // Map the data for response
    const combinedData = companyNameData.map((item) => ({
      CmpyGSTID: item.CmpyGSTID,
      CompanyID: item.CompanyID,
      GSTIN: item.GSTIN,
      StatePOSID: item.StatePOSID,
      POSID: item.CmpyGSTMStatePOSID ? item.CmpyGSTMStatePOSID.POSID : null,
      StateName: item.CmpyGSTMStatePOSID
        ? item.CmpyGSTMStatePOSID.StateName
        : null,
      Status: item.Status,
    }));

    // Send the combined data as response
    res.json(combinedData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while retrieving company name data.",
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
    console.error("Error retrieving company name data:", error);
    return res.status(500).json({
      message: "Failed to retrieve company name data. Please try again later.",
    });
  }
};

// Find a single CompanyGSTMaster with an id
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;
    // Validate the ID parameter
    if (!id) {
      return res.status(400).json({ message: "ID parameter is required." });
    }
    // Fetch the company data by primary key with included OEMMaster data
    const companyData = await CompanyGSTMaster.findOne({
      where: {
        CmpyGSTID: id, // Replaced OEMID with CompanyID
      },
      attributes: [
        "CmpyGSTID",
        "CompanyID",
        "GSTIN",
        "RegistrationType",
        "LegalName",
        "TradeName",
        "DOR",
        "Address",
        "StatePOSID",
        "PINCode",
        "ClientID",
        "ClientSecret",
        "UserName",
        "Password",
        "GSTStatus",
        "IsActive",
        "Status",
      ],
      include: [
        {
          model: CompanyMaster,
          as: "CmpyGSTMCompanyID",
          attributes: ["CompanyID", "CompanyName"], // Include OEMID and OEMName attributes
        },
        {
          model: StatePOS,
          as: "CmpyGSTMStatePOSID",
          attributes: ["StatePOSID", "POSID"], // Include OEMID and OEMName attributes
        },
      ],
    });

    // Check if data is found
    if (!companyData) {
      return res.status(404).json({
        message: "Company data not found.",
      });
    }

    // Prepare the response data
    const responseData = {
      CmpyGSTID: companyData.CmpyGSTID,
      CompanyID: companyData.CompanyID,
      CompanyName: companyData.CmpyGSTMCompanyID
        ? companyData.CmpyGSTMCompanyID.CompanyName
        : null,
      GSTIN: companyData.GSTIN,
      RegistrationType: companyData.RegistrationType,
      LegalName: companyData.LegalName,
      TradeName: companyData.TradeName,
      DOR: companyData.DOR,
      Address: companyData.Address,
      StatePOSID: companyData.StatePOSID,
      POSID: companyData.CmpyGSTMStatePOSID
        ? companyData.CmpyGSTMStatePOSID.POSID
        : null,
      PINCode: companyData.PINCode,
      ClientID: companyData.ClientID,
      ClientSecret: companyData.ClientSecret,
      UserName: companyData.UserName,
      Password: companyData.Password,
      GSTStatus: companyData.GSTStatus,
      IsActive: companyData.IsActive,
      Status: companyData.Status,
      CreatedDate: companyData.CreatedDate,
      ModifiedDate: companyData.ModifiedDate,
    };

    // Send the response data
    res.json(responseData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while retrieving company data.",
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
    console.error("Error retrieving company data:", error);
    return res.status(500).json({
      message: "Failed to retrieve company data. Please try again later.",
    });
  }
};

// Update a CompanyGSTMaster by the id in the request
exports.updateByPk = async (req, res) => {
  console.log("GSTIN:", req.body.GSTIN);

  try {
    // Validate request
    if (!req.body.GSTIN) {
      return res.status(400).json({ message: "GSTIN cannot be empty" });
    }
    if (!/^[a-zA-Z ]*$/.test(req.body.GSTIN)) {
      console.log("Validation failed: GSTIN contains special characters.");
      return res.status(400).json({
        message: "GSTIN should contain only letters",
      });
    }
    // Find the CompanyGSTMaster by ID
    const cmpyGSTID = req.params.id;
    let companyGSTMaster = await CompanyGSTMaster.findByPk(cmpyGSTID);

    if (!companyGSTMaster) {
      return res.status(404).json({ message: "CompanyGSTMaster not found" });
    }

    // Update fields
    companyGSTMaster.CompanyID =
      req.body.CompanyID || companyGSTMaster.CompanyID;
    companyGSTMaster.CompanyName =
      req.body.CompanyName || companyGSTMaster.CompanyName;
    companyGSTMaster.GSTIN = req.body.GSTIN || companyGSTMaster.GSTIN;
    companyGSTMaster.RegistrationType =
      req.body.RegistrationType || companyGSTMaster.RegistrationType;
    companyGSTMaster.LegalName =
      req.body.LegalName || companyGSTMaster.LegalName;
    companyGSTMaster.TradeName =
      req.body.TradeName || companyGSTMaster.TradeName;
    companyGSTMaster.DOR = req.body.DOR || companyGSTMaster.DOR;
    companyGSTMaster.Address = req.body.Address || companyGSTMaster.Address;
    companyGSTMaster.StatePOSID =
      req.body.StatePOSID || companyGSTMaster.StatePOSID;
    companyGSTMaster.PINCode = req.body.PINCode || companyGSTMaster.PINCode;
    companyGSTMaster.ClientID = req.body.ClientID || companyGSTMaster.ClientID;
    companyGSTMaster.ClientSecret =
      req.body.ClientSecret || companyGSTMaster.ClientSecret;
    companyGSTMaster.UserName = req.body.UserName || companyGSTMaster.UserName;
    companyGSTMaster.Password = req.body.Password || companyGSTMaster.Password;
    companyGSTMaster.GSTStatus =
      req.body.GSTStatus || companyGSTMaster.GSTStatus;
    companyGSTMaster.IsActive = req.body.IsActive || companyGSTMaster.IsActive;
    companyGSTMaster.Status = req.body.Status || companyGSTMaster.Status;
    companyGSTMaster.ModifiedDate = new Date();

    // Save updated CompanyGSTMaster in the database
    const updatedCompanyGSTMaster = await companyGSTMaster.save();

    return res.status(200).json(updatedCompanyGSTMaster); // Send the updated CompanyGSTMaster as response
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
        message: "Database error occurred while updating CompanyGSTMaster.",
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
    console.error("Error updating CompanyGSTMaster:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a CompanyGSTMaster with the specified id in the request
exports.deleteById = async (req, res) => {
  const id = req.params.id;

  try {
    // Find the model by ID
    const companyGSTMaster = await CompanyGSTMaster.findByPk(id);

    // Check if the model exists
    if (!companyGSTMaster) {
      return res
        .status(404)
        .json({ message: "CompanyGSTMaster not found with id: " + id });
    }

    // Delete the model
    await companyGSTMaster.destroy();

    // Send a success message
    res.status(200).json({
      message: "CompanyGSTMaster with id: " + id + " deleted successfully",
    });
  } catch (err) {
    // Handle errors based on specific types
    if (err.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while deleting CompanyGSTMaster.",
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
    console.error("Error deleting CompanyGSTMaster:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
