/* eslint-disable no-dupe-keys */
/* eslint-disable no-unused-vars */
require("dotenv").config();
const db = require("../models");
const StatePOSModel = require("../models/StatePOS.model");
const VendorMaster = db.vendormaster;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;
const VendorGSTDetails = db.vendorgstdetails;
const VendorAddressDetails = db.vendoraddressdetails;
const VendorBankDetails = db.vendorbankdetails;
const VendorDocuments = db.vendordocuments;
const StateMaster = db.statemaster;
const StatePOS = db.statepos;
const DocumentType = db.documenttypes;
// Basic CRUD API
// Create and Save a new VendorMaster
exports.create = async (req, res) => {
  console.log("VendorName:", req.body.VendorName);

  try {
    // Validate request
    if (!req.body.VendorName) {
      return res.status(400).json({ message: "VendorName cannot be empty" });
    }
    if (!/^[a-zA-Z ]*$/.test(req.body.VendorName)) {
      console.log("Validation failed: VendorName contains special characters.");
      return res.status(400).json({
        message: "VendorName should contain only letters",
      });
    }
    // Check if VendorMaster already exists
    const existingModel = await VendorMaster.findOne({
      where: { VendorName: req.body.VendorName },
    });
    if (existingModel) {
      return res.status(400).json({ message: "VendorName already exists" });
    }

    // Create a VendorMaster
    const vendorMaster = {
      VendorType: req.body.VendorType,
      VendorCode: req.body.VendorCode,
      VendorName: req.body.VendorName,
      Address: req.body.Address,
      City: req.body.City,
      State: req.body.State,
      RegionID: req.body.State,
      PINCode: req.body.PINCode,
      PhoneNo: req.body.PhoneNo,
      MobileNo: req.body.MobileNo,
      Email: req.body.Email,
      TAN: req.body.TAN,
      PAN: req.body.PAN,
      Bank: req.body.Bank,
      AccountHolderName: req.body.AccountHolderName,
      AccountNo: req.body.AccountNo,
      IFSCCode: req.body.IFSCCode,
      BranchDetails: req.body.BranchDetails,
      MSEMRegistration: req.body.MSEMRegistration || null,
      MSEMNo: req.body.MSEMNo || null,
      MSEMDate: req.body.MSEMDate || null,
      GSTRegistration: req.body.GSTRegistration || null,
      GSTID: req.body.GSTID || null,
      IsActive: req.body.IsActive || true,
      Status: req.body.Status || "Active",
    };

    // Save SubModule in the database
    const newVendorMaster = await VendorMaster.create(vendorMaster);

    return res.status(201).json(newVendorMaster); // Send the newly created SubModule as response
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

    console.error("Error creating VendorMaster:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Retrieve all VendorMaster from the database.
exports.findAll = async (req, res) => {
  try {
    // Fetch all VendorMaster data with included parent company data
    const subVendorMasterData = await VendorMaster.findAll({
      attributes: [
        "VendorMasterID",
        "VendorType",
        "VendorCode",
        "VendorName",
        "Address",
        "City",
        "State",
        "RegionID",
        "PINCode",
        "PhoneNo",
        "MobileNo",
        "Email",
        "TAN",
        "PAN",
        "Bank",
        "AccountHolderName",
        "AccountNo",
        "IFSCCode",
        "BranchDetails",
        "MSEMRegistration",
        "MSEMNo",
        "MSEMDate",
        "GSTRegistration",
        "GSTID",
        "CreatedDate",
        "ModifiedDate",
      ],

      order: [
        ["VendorName", "ASC"], // Order by SubModule in ascending order
      ],
    });

    // Check if data is empty
    if (!subVendorMasterData || subVendorMasterData.length === 0) {
      return res.status(404).json({
        message: "No sub vendor name data found.",
      });
    }

    // Map the data for response
    const combinedData = subVendorMasterData.map((item) => ({
      VendorMasterID: item.VendorMasterID,
      VendorType: item.VendorType,
      VendorCode: item.VendorType,
      VendorName: item.VendorName,
      Address: item.Address,
      City: item.City,
      State: item.State,
      RegionID: item.RegionID,
      PINCode: item.PINCode,
      PhoneNo: item.PhoneNo,
      MobileNo: item.MobileNo,
      Email: item.Email,
      TAN: item.TAN,
      PAN: item.PAN,
      Bank: item.Bank,
      AccountHolderName: item.AccountHolderName,
      AccountNo: item.AccountNo,
      IFSCCode: item.IFSCCode,
      MSEMRegistration: item.MSEMRegistration,
      MSEMNo: item.MSEMNo,
      MSEMDate: item.MSEMDate,
      GSTRegistration: item.GSTRegistration,
      GSTID: item.GSTID,
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
        message:
          "Database error occurred while retrieving VendorMaster name data.",
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
    console.error("Error retrieving VendorMaster name data:", error);
    return res.status(500).json({
      message:
        "Failed to retrieve VendorMaster name data. Please try again later.",
    });
  }
};

// Find a single VendorMaster with an id
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;

    // Validate the ID parameter
    if (!id) {
      return res.status(400).json({
        message: "ID parameter is required.",
      });
    }

    // Fetch the VendorMaster data by primary key with included parent company data
    const subVendorMasterData = await VendorMaster.findOne({
      where: { VendorMasterID: id },
      attributes: [
        "VendorMasterID",
        "VendorType",
        "VendorCode",
        "VendorName",
        "Address",
        "City",
        "State",
        "RegionID",
        "PINCode",
        "PhoneNo",
        "MobileNo",
        "Email",
        "TAN",
        "PAN",
        "Bank",
        "AccountHolderName",
        "AccountNo",
        "IFSCCode",
        "BranchDetails",
        "MSEMRegistration",
        "MSEMNo",
        "MSEMDate",
        "GSTRegistration",
        "GSTID",
        "CreatedDate",
        "ModifiedDate",
      ],

      order: [
        ["VendorName", "ASC"], // Order by SubModule in ascending order
      ],
    });

    // Check if data is empty
    if (!subVendorMasterData || subVendorMasterData.length === 0) {
      return res.status(404).json({
        message: "No VendorName name data found.",
      });
    }

    // Prepare the response data
    const responseData = {
      VendorMasterID: subVendorMasterData.VendorMasterID,
      VendorType: subVendorMasterData.VendorType,
      VendorName: subVendorMasterData.VendorName,
      Address: subVendorMasterData.Address,
      City: subVendorMasterData.City,
      State: subVendorMasterData.State,
      RegionID: subVendorMasterData.RegionID,
      PhoneNo: subVendorMasterData.PhoneNo,
      MobileNo: subVendorMasterData.MobileNo,
      Email: subVendorMasterData.Email,
      TAN: subVendorMasterData.TAN,
      PAN: subVendorMasterData.PAN,
      Bank: subVendorMasterData.Bank,
      AccountHolderName: subVendorMasterData.AccountHolderName,
      AccountNo: subVendorMasterData.AccountNo,
      IFSCCode: subVendorMasterData.IFSCCode,
      BranchDetails: subVendorMasterData.BranchDetails,
      MSEMRegistration: subVendorMasterData.MSEMRegistration,
      MSEMNo: subVendorMasterData.MSEMNo,
      MSEMDate: subVendorMasterData.MSEMDate,
      GSTRegistration: subVendorMasterData.GSTRegistration,
      GSTID: subVendorMasterData.GSTID,
      IsActive: subVendorMasterData.IsActive,
      Status: subVendorMasterData.Status,
    };

    // Send the response data
    res.json(responseData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message:
          "Database error occurred while retrieving VendorMaster name data.",
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
    console.error("Error retrieving VendorMaster name data:", error);
    return res.status(500).json({
      message:
        "Failed to retrieve VendorMaster name data. Please try again later.",
    });
  }
};

// Update a VendorMaster by the id in the request
exports.updateByPk = async (req, res) => {
  console.log("VendorName:", req.body.VendorName);

  try {
    // Validate request
    if (!req.body.VendorName) {
      return res.status(400).json({ message: "VendorName cannot be empty" });
    }
    if (!/^[a-zA-Z ]*$/.test(req.body.VendorName)) {
      console.log("Validation failed: VendorName contains special characters.");
      return res.status(400).json({
        message: "VendorName should contain only letters",
      });
    }
    // Find the division by ID
    const vendormasterid = req.params.id;

    // Validate the ID parameter
    if (!vendormasterid) {
      return res.status(400).json({ message: "ID parameter is required." });
    }

    let vendorMaster = await VendorMaster.findByPk(vendormasterid);

    if (!vendorMaster) {
      return res.status(404).json({ message: "VendorMaster not found" });
    }

    // Update fields
    vendorMaster.VendorName = req.body.VendorName;
    vendorMaster.VendorType = req.body.VendorType || vendorMaster.VendorType;
    vendorMaster.Address = req.body.Address || vendorMaster.Address;
    vendorMaster.City = req.body.City || vendorMaster.City;
    vendorMaster.State = req.body.State || vendorMaster.State;
    vendorMaster.RegionID = req.body.RegionID || vendorMaster.RegionID;
    vendorMaster.PhoneNo = req.body.PhoneNo || vendorMaster.PhoneNo;
    vendorMaster.MobileNo = req.body.MobileNo || vendorMaster.MobileNo;
    vendorMaster.Email = req.body.Email || vendorMaster.Email;
    vendorMaster.TAN = req.body.TAN || vendorMaster.TAN;
    vendorMaster.PAN = req.body.PAN || vendorMaster.PAN;
    vendorMaster.Bank = req.body.Bank || vendorMaster.Bank;
    vendorMaster.AccountHolderName =
      req.body.AccountHolderName || vendorMaster.AccountHolderName;
    vendorMaster.AccountNo = req.body.AccountNo || vendorMaster.AccountNo;
    vendorMaster.IFSCCode = req.body.IFSCCode || vendorMaster.IFSCCode;
    vendorMaster.BranchDetails =
      req.body.BranchDetails || vendorMaster.BranchDetails;
    vendorMaster.MSEMRegistration =
      req.body.MSEMRegistration || vendorMaster.MSEMRegistration;
    vendorMaster.MSEMNo = req.body.MSEMNo || vendorMaster.MSEMNo;
    vendorMaster.MSEMDate = req.body.MSEMDate || vendorMaster.MSEMDate;
    vendorMaster.MSEMNo = req.body.MSEMNo || vendorMaster.MSEMNo;
    vendorMaster.GSTRegistration =
      req.body.GSTRegistration || vendorMaster.GSTRegistration;
    vendorMaster.GSTID = req.body.GSTID || vendorMaster.GSTID;
    vendorMaster.IsActive = req.body.IsActive || vendorMaster.IsActive;
    vendorMaster.Status = req.body.Status || vendorMaster.Status;
    vendorMaster.ModifiedDate = new Date();

    // Save updated VendorMaster in the database
    const updatedVendorMaster = await vendorMaster.save();

    return res.status(200).json(updatedVendorMaster); // Send the updated SubModule as response
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
        message: "Database error occurred while updating VendorMaster.",
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
    console.error("Error updating VendorMaster:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a VendorMaster with the specified id in the request
exports.deleteById = async (req, res) => {
  const id = req.params.id;

  try {
    // Validate the ID parameter
    if (!id) {
      return res.status(400).json({ message: "ID parameter is required." });
    }

    // Find the model by ID
    const vendorMaster = await VendorMaster.findByPk(id);

    // Check if the model exists
    if (!vendorMaster) {
      return res
        .status(404)
        .json({ message: "VendorMaster not found with id: " + id });
    }

    // Delete the model
    await vendorMaster.destroy();

    // Send a success message
    res.status(200).json({
      message: "VendorMaster with id: " + id + " deleted successfully",
    });
  } catch (err) {
    // Handle errors based on specific types
    if (err.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while deleting VendorMaster.",
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
    console.error("Error deleting VendorMaster:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.createnewvendor = async (req, res) => {
  console.log("VendorName:", req.body.VendorName);

  try {
    // Validate request
    if (!req.body.VendorName) {
      return res.status(400).json({ message: "VendorName cannot be empty" });
    }
    if (!/^[a-zA-Z ]*$/.test(req.body.VendorName)) {
      console.log("Validation failed: VendorName contains special characters.");
      return res.status(400).json({
        message: "VendorName should contain only letters",
      });
    }
    // Check if VendorMaster already exists
    const existingModel = await VendorMaster.findOne({
      where: { VendorName: req.body.VendorName },
    });
    if (existingModel) {
      return res.status(400).json({ message: "VendorName already exists" });
    }

    // Create a VendorMaster
    const vendorMaster = {
      VendorType: req.body.VendorType,
      VendorCode: req.body.VendorCode,
      VendorName: req.body.VendorName,
      PhoneNo: req.body.PhoneNo,
      Email: req.body.Email,
      TAN: req.body.TAN,
      PAN: req.body.PAN,
      MSEMRegistration: req.body.MSEMRegistration || null,
      MSEMNo: req.body.MSEMNo || null,
      MSEMDate: req.body.MSEMDate || null,
      IsActive: req.body.IsActive || true,
      Status: req.body.Status || "Active",
    };

    // Save SubModule in the database
    const newVendorMaster = await VendorMaster.create(vendorMaster);

    return res.status(201).json(newVendorMaster); // Send the newly created SubModule as response
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

    console.error("Error creating VendorMaster:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.findAllVendors = async (req, res) => {
  try {
    // Fetch all VendorMaster data with included parent company data
    const subVendorMasterData = await VendorMaster.findAll({
      attributes: [
        "VendorMasterID",
        "VendorType",
        "VendorCode",
        "VendorName",
        "PhoneNo",
        "Email",
        "TAN",
        "PAN",
        "MSEMRegistration",
        "MSEMNo",
        "MSEMDate",
        "CreatedDate",
        "ModifiedDate",
      ],

      order: [
        ["CreatedDate", "DESC"], // Order by SubModule in ascending order
      ],
    });

    // Check if data is empty
    if (!subVendorMasterData || subVendorMasterData.length === 0) {
      return res.status(404).json({
        message: "No sub vendor name data found.",
      });
    }

    // Map the data for response
    const combinedData = subVendorMasterData.map((item) => ({
      VendorMasterID: item.VendorMasterID,
      VendorType: item.VendorType,
      VendorCode: item.VendorCode,
      VendorName: item.VendorName,
      PhoneNo: item.PhoneNo,
      MobileNo: item.MobileNo,
      Email: item.Email,
      TAN: item.TAN,
      PAN: item.PAN,
      MSEMRegistration: item.MSEMRegistration,
      MSEMNo: item.MSEMNo,
      MSEMDate: item.MSEMDate,
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
        message:
          "Database error occurred while retrieving VendorMaster name data.",
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
    console.error("Error retrieving VendorMaster name data:", error);
    return res.status(500).json({
      message:
        "Failed to retrieve VendorMaster name data. Please try again later.",
    });
  }
};

exports.findOneVendor = async (req, res) => {
  try {
    // Extract query parameters
    const { VendorMasterID } = req.query;

    // Validate the VendorMasterID parameter
    if (!VendorMasterID) {
      return res
        .status(400)
        .json({ message: "VendorMasterID parameter is required." });
    }

    // Fetch vendor data from VendorMaster
    const vendorData = await VendorMaster.findOne({
      where: { VendorMasterID },
      attributes: [
        "VendorMasterID",
        "VendorType",
        "VendorCode",
        "VendorName",
        "PhoneNo",
        "Email",
        "TAN",
        "PAN",
        "MSEMNo",
        "MSEMRegistration",
        "MSEMDate",
        "CreatedDate",
        "ModifiedDate",
      ],
    });

    // If vendor data is not found
    if (!vendorData) {
      return res.status(404).json({ message: "Vendor data not found." });
    }

    // Fetch multiple addresses for the vendor
    const addressData = await VendorAddressDetails.findAll({
      where: { VendorMasterID },
      attributes: [
        "VendorAddressDetailsID",
        "Address",
        "StatePOSID",
        "City",
        "Contact",
        "Email",
        "PINCode",
      ],
      include: [
        {
          model: StatePOS,
          as: "VADStatePOSID",
          attributes: ["StateName"],
        },
      ],
    });

    // Fetch multiple GST entries for the vendor
    const gstData = await VendorGSTDetails.findAll({
      where: { VendorMasterID },
      attributes: [
        "VendorGSTDetailsID",
        "RegistrationNo",
        "RegistrationType",
        "Address",
        "PINCode",
        "StatePOSID",
        "LegalName",
        "TradeName",
        "EntityType",
        "DateOfReg",
        "IsActive",
        "Status",
      ],
      include: [
        {
          model: StatePOS,
          as: "VGDStatePOSID",
          attributes: ["POSID", "StateName"],
        },
      ],
    });

    // Fetch multiple bank details for the vendor
    const bankData = await VendorBankDetails.findAll({
      where: { VendorMasterID },
      attributes: [
        "VendorBankDetailsID",
        "BankName",
        "IFSCCode",
        "AccountNumber",
        "AccountHolderName",
        "Address",
      ],
    });

    // Fetch multiple document entries for the vendor
    const documentData = await VendorDocuments.findAll({
      where: { VendorMasterID },
      attributes: ["VendorDocumentsID", "DocTypeID", "DocURL"],
      include: [
        {
          model: DocumentType,
          as: "VDDocTypeID",
          attributes: ["Doctype", "DocumentAs"],
        },
      ],
    });

    // Prepare the response data with all fields mapped
    const responseData = {
      VendorMasterID: vendorData.VendorMasterID,
      VendorType: vendorData.VendorType,
      VendorCode: vendorData.VendorCode,
      VendorName: vendorData.VendorName,
      PhoneNo: vendorData.PhoneNo,
      Email: vendorData.Email,
      TAN: vendorData.TAN,
      PAN: vendorData.PAN,
      MSEMNo: vendorData.MSEMNo,
      MSEMRegistration: vendorData.MSEMRegistration,
      MSEMDate: vendorData.MSEMDate,
      CreatedDate: vendorData.CreatedDate,
      ModifiedDate: vendorData.ModifiedDate,
      // Address Data
      Addresses: addressData.map((address) => ({
        VendorAddressDetailsID: address.VendorAddressDetailsID,
        Address: address.Address,
        StatePOSID: address.StatePOSID,
        City: address.City,
        Contact: address.Contact,
        Email: address.Email,
        PINCode: address.PINCode,
        StateName: address.VADStatePOSID
          ? address.VADStatePOSID.StateName
          : null,
      })),
      // GST Data
      GSTs: gstData.map((gst) => ({
        VendorGSTDetailsID: gst.VendorGSTDetailsID,
        RegistrationNo: gst.RegistrationNo,
        RegistrationType: gst.RegistrationType,
        Address: gst.Address,
        PINCode: gst.PINCode,
        StatePOSID: gst.StatePOSID,
        LegalName: gst.LegalName,
        TradeName: gst.TradeName,
        EntityType: gst.EntityType,
        DateOfReg: gst.DateOfReg,
        IsActive: gst.IsActive,
        Status: gst.Status,
        POSID: gst.VGDStatePOSID ? gst.VGDStatePOSID.POSID : null,
        StateName: gst.VGDStatePOSID ? gst.VGDStatePOSID.StateName : null,
      })),
      // Bank Data
      Banks: bankData.map((bank) => ({
        VendorBankDetailsID: bank.VendorBankDetailsID,
        BankName: bank.BankName,
        IFSCCode: bank.IFSCCode,
        AccountNumber: bank.AccountNumber,
        AccountHolderName: bank.AccountHolderName,
        Address: bank.Address,
      })),
      // Document Data
      Documents: documentData.map((doc) => ({
        VendorDocumentsID: doc.VendorDocumentsID,
        DocTypeID: doc.DocTypeID,
        DocURL: doc.DocURL,
        Doctype: doc.VDDocTypeID ? doc.VDDocTypeID.Doctype : null,
        DocumentAs: doc.VDDocTypeID ? doc.VDDocTypeID.DocumentAs : null,
      })),
    };

    // Send the response data
    res.json(responseData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message: "Database error occurred while retrieving vendor data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    // General error handling
    console.error("Error retrieving vendor data:", error);
    return res.status(500).json({
      message: "Failed to retrieve vendor data. Please try again later.",
    });
  }
};

exports.updateforVendor = async (req, res) => {
  console.log("VendorName:", req.body.VendorName);

  try {
    // Validate request

    if (!/^[a-zA-Z ]*$/.test(req.body.VendorName)) {
      console.log("Validation failed: VendorName contains special characters.");
      return res.status(400).json({
        message: "VendorName should contain only letters",
      });
    }
    // Find the division by ID
    const vendormasterid = req.params.id;

    // Validate the ID parameter
    if (!vendormasterid) {
      return res.status(400).json({ message: "ID parameter is required." });
    }

    let vendorMaster = await VendorMaster.findByPk(vendormasterid);

    if (!vendorMaster) {
      return res.status(404).json({ message: "VendorMaster not found" });
    }

    // Update fields
    vendorMaster.VendorName = req.body.VendorName || vendorMaster.VendorName;
    vendorMaster.VendorType = req.body.VendorType || vendorMaster.VendorType;
    vendorMaster.VendorCode = req.body.VendorCode || vendorMaster.VendorCode;
    vendorMaster.PhoneNo = req.body.PhoneNo || vendorMaster.PhoneNo;
    vendorMaster.Email = req.body.Email || vendorMaster.Email;
    vendorMaster.TAN = req.body.TAN || vendorMaster.TAN;
    vendorMaster.PAN = req.body.PAN || vendorMaster.PAN;
    vendorMaster.MSEMRegistration =
      req.body.MSEMRegistration || vendorMaster.MSEMRegistration;
    vendorMaster.MSEMNo = req.body.MSEMNo || vendorMaster.MSEMNo;
    vendorMaster.MSEMDate = req.body.MSEMDate || vendorMaster.MSEMDate;
    vendorMaster.MSEMNo = req.body.MSEMNo || vendorMaster.MSEMNo;
    vendorMaster.IsActive = req.body.IsActive || vendorMaster.IsActive;
    vendorMaster.Status = req.body.Status || vendorMaster.Status;
    vendorMaster.ModifiedDate = new Date();

    // Save updated VendorMaster in the database
    const updatedVendorMaster = await vendorMaster.save();

    return res.status(200).json(updatedVendorMaster); // Send the updated SubModule as response
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
        message: "Database error occurred while updating VendorMaster.",
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
    console.error("Error updating VendorMaster:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
