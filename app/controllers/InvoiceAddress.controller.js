/* eslint-disable no-dupe-keys */
/* eslint-disable no-unused-vars */
require("dotenv").config();
const db = require("../models");
const InvoiceAddress = db.invoiceaddress;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;
const Invoice = db.invoice;

// Basic CRUD API
// Create and Save a new InvoiceAddress
exports.create = async (req, res) => {
  try {
    // Create a InvoiceAddress
    const invoiceAddress = {
      InvoiceID: req.body.InvoiceID,
      GSTStatus: req.body.GSTStatus,
      GSTNo: req.body.GSTNo,
      GSTName: req.body.GSTName,
      GSTType: req.body.GSTType,
      AddressType: req.body.AddressType,
      PANNo: req.body.PANNo,
      IsSameAddress: req.body.IsSameAddress,
      Address1: req.body.Address1,
      Address2: req.body.Address2,
      City: req.body.City,
      State: req.body.State,
      PINCode: req.body.PINCode,
      PlaceOfSupply: req.body.PlaceOfSupply,
      IsActive: req.body.IsActive || true,
      Status: req.body.Status || "Active",
    };

    // Save InvoiceAddress in the database
    const newInvoiceAddress = await InvoiceAddress.create(invoiceAddress);

    return res.status(201).json(newInvoiceAddress); // Send the newly created InvoiceAddress as response
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

    console.error("Error creating InvoiceAddress:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Retrieve all InvoiceAddresss from the database.
exports.findAll = async (req, res) => {
  try {
    // Fetch all division data with included parent company data
    const invoiceAddressData = await InvoiceAddress.findAll({
      attributes: [
        "InvoiceAddressID",
        "InvoiceID",
        "GSTStatus",
        "GSTNo",
        "GSTName",
        "GSTType",
        "AddressType",
        "PANNo",
        "IsSameAddress",
        "Address1",
        "Address2",
        "City",
        "State",
        "PINCode",
        "PlaceOfSupply",
      ],
      include: [
        {
          model: Invoice,
          as: "IAInvoiceID",
          attributes: ["CustomerName"],
        },
      ],
      order: [["CreatedDate", "DESC"]],
    });

    // Check if data is empty
    if (!invoiceAddressData || invoiceAddressData.length === 0) {
      return res.status(404).json({
        message: "No invoice address data found.",
      });
    }

    // Map the data for response
    const combinedData = invoiceAddressData.map((item) => ({
      InvoiceAddressID: item.InvoiceAddressID,
      InvoiceID: item.InvoiceID,
      GSTStatus: item.GSTStatus,
      GSTNo: item.GSTNo,
      GSTName: item.GSTName,
      GSTType: item.GSTType,
      AddressType: item.AddressType,
      PANNo: item.PANNo,
      IsSameAddress: item.IsSameAddress,
      Address1: item.Address1,
      Address2: item.Address2,
      City: item.City,
      State: item.State,
      PINCode: item.PINCode,
      PlaceOfSupply: item.PlaceOfSupply,
      CustomerName: item.IAInvoiceID ? item.IAInvoiceID.CustomerName : null,
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
          "Database error occurred while retrieving invoice address data.",
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
    console.error("Error retrieving invoice address data:", error);
    return res.status(500).json({
      message:
        "Failed to retrieve invoice address data. Please try again later.",
    });
  }
};

// Find a single InvoiceAddress with an id
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;

    // Validate the ID parameter
    if (!id) {
      return res.status(400).json({
        message: "ID parameter is required.",
      });
    }

    // Fetch the division data by primary key with included parent company data
    const invoiceAddressData = await InvoiceAddress.findOne({
      where: {
        InvoiceAddressID: id,
      },
      attributes: [
        "InvoiceAddressID",
        "InvoiceID",
        "GSTStatus",
        "GSTNo",
        "GSTName",
        "GSTType",
        "AddressType",
        "PANNo",
        "IsSameAddress",
        "Address1",
        "Address2",
        "City",
        "State",
        "PINCode",
        "PlaceOfSupply",
      ],
      include: [
        {
          model: Invoice,
          as: "IAInvoiceID",
          attributes: ["CustomerName"],
        },
      ],
      order: [["CreatedDate", "DESC"]],
    });

    // Check if data is found
    if (!invoiceAddressData) {
      return res.status(404).json({
        message: "invoice address data not found.",
      });
    }

    // Prepare the response data
    const responseData = {
      InvoiceAddressID: invoiceAddressData.InvoiceAddressID,
      InvoiceID: invoiceAddressData.InvoiceID,
      GSTStatus: invoiceAddressData.GSTStatus,
      GSTNo: invoiceAddressData.GSTNo,
      GSTName: invoiceAddressData.GSTName,
      GSTType: invoiceAddressData.GSTType,
      AddressType: invoiceAddressData.AddressType,
      PANNo: invoiceAddressData.PANNo,
      IsSameAddress: invoiceAddressData.IsSameAddress,
      Address1: invoiceAddressData.Address1,
      Address2: invoiceAddressData.Address2,
      City: invoiceAddressData.City,
      State: invoiceAddressData.State,
      PINCode: invoiceAddressData.PINCode,
      PlaceOfSupply: invoiceAddressData.PlaceOfSupply,
      CustomerName: invoiceAddressData.IAInvoiceID
        ? invoiceAddressData.IAInvoiceID.CustomerName
        : null,
      IsActive: invoiceAddressData.IsActive,
      Status: invoiceAddressData.Status,
    };

    // Send the response data
    res.json(responseData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message:
          "Database error occurred while retrieving invoice address data.",
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
    console.error("Error retrieving invoice address data:", error);
    return res.status(500).json({
      message:
        "Failed to retrieve invoice address data. Please try again later.",
    });
  }
};

// Update a InvoiceAddress by the id in the request
exports.updateByPk = async (req, res) => {
  try {
    // Find the division by ID
    const invoiceAddressID = req.params.id;

    // Validate the ID parameter
    if (!invoiceAddressID) {
      return res.status(400).json({ message: "ID parameter is required." });
    }

    let invoiceAddress = await InvoiceAddress.findByPk(invoiceAddressID);

    if (!invoiceAddress) {
      return res.status(404).json({ message: "InvoiceAddress not found" });
    }

    // Update fields
    invoiceAddress.InvoiceID = req.body.InvoiceID || invoiceAddress.InvoiceID;
    invoiceAddress.GSTStatus = req.body.GSTStatus || invoiceAddress.GSTStatus;
    invoiceAddress.GSTNo = req.body.GSTNo || invoiceAddress.GSTNo;
    invoiceAddress.GSTName = req.body.GSTName || invoiceAddress.GSTName;
    invoiceAddress.GSTType = req.body.GSTType || invoiceAddress.GSTType;
    invoiceAddress.AddressType =
      req.body.AddressType || invoiceAddress.AddressType;
    invoiceAddress.PANNo = req.body.PANNo || invoiceAddress.PANNo;
    invoiceAddress.IsSameAddress =
      req.body.IsSameAddress || invoiceAddress.IsSameAddress;
    invoiceAddress.Address1 = req.body.Address1 || invoiceAddress.Address1;
    invoiceAddress.Address2 = req.body.Address2 || invoiceAddress.Address2;
    invoiceAddress.City = req.body.City || invoiceAddress.City;
    invoiceAddress.State = req.body.State || invoiceAddress.State;
    invoiceAddress.PINCode = req.body.PINCode || invoiceAddress.PINCode;
    invoiceAddress.PlaceOfSupply =
      req.body.PlaceOfSupply || invoiceAddress.PlaceOfSupply;
    invoiceAddress.IsActive = req.body.IsActive || invoiceAddress.IsActive;
    invoiceAddress.Status = req.body.Status || invoiceAddress.Status;
    invoiceAddress.ModifiedDate = new Date();

    // Save updated InvoiceAddress in the database
    const updatedInvoiceAddress = await invoiceAddress.save();

    return res.status(200).json(updatedInvoiceAddress); // Send the updated InvoiceAddress as response
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
        message: "Database error occurred while updating InvoiceAddress.",
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
    console.error("Error updating InvoiceAddress:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a InvoiceAddress with the specified id in the request
exports.deleteById = async (req, res) => {
  const id = req.params.id;

  try {
    // Validate the ID parameter
    if (!id) {
      return res.status(400).json({ message: "ID parameter is required." });
    }

    // Find the model by ID
    const invoiceAddress = await InvoiceAddress.findByPk(id);

    // Check if the model exists
    if (!invoiceAddress) {
      return res
        .status(404)
        .json({ message: "InvoiceAddress not found with id: " + id });
    }

    // Delete the model
    await invoiceAddress.destroy();

    // Send a success message
    res.status(200).json({
      message: "InvoiceAddress with id: " + id + " deleted successfully",
    });
  } catch (err) {
    // Handle errors based on specific types
    if (err.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while deleting InvoiceAddress.",
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
    console.error("Error deleting InvoiceAddress:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
