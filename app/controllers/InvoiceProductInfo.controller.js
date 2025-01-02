/* eslint-disable no-dupe-keys */
/* eslint-disable no-unused-vars */
require("dotenv").config();
const db = require("../models");
const InvoiceProductInfoModel = require("../models/InvoiceProductInfo.model");
const InvoiceProductInfo = db.invoiceprodinfo;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;
const Invoice = db.invoice;
const MasterProducts = db.masterproducts;

// Basic CRUD API
// Create and Save a new invoiceProductInfo
exports.create = async (req, res) => {
  try {
    // Create a invoiceProductInfo
    const invoiceProductInfo = {
      InvoiceID: req.body.InvoiceID,
      ProductID: req.body.ProductID,
      ProductName: req.body.ProductName,
      ProductCost: req.body.ProductCost,
      DiscountPercentage: req.body.DiscountPercentage,
      DiscountValue: req.body.DiscountValue,
      TaxableValue: req.body.TaxableValue,
      GSTRate: req.body.GSTRate,
      IGSTRate: req.body.IGSTRate,
      IGSTValue: req.body.IGSTValue,
      CESSRate: req.body.CESSRate,
      CESSValue: req.body.CESSValue,
      SGSTValue: req.body.SGSTValue,
      IsActive: req.body.IsActive || true,
      Status: req.body.Status || "Active",
    };

    // Save invoiceProductInfo in the database
    const newinvoiceProductInfo = await InvoiceProductInfo.create(
      invoiceProductInfo
    );

    return res.status(201).json(newinvoiceProductInfo); // Send the newly created invoiceProductInfo as response
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

    console.error("Error creating invoiceProductInfo:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Retrieve all invoiceProductInfos from the database.
exports.findAll = async (req, res) => {
  try {
    // Fetch all invoice product info data with included related data
    const invoiceProductInfoData = await InvoiceProductInfo.findAll({
      attributes: [
        "InvoiceProdInfoID",
        "InvoiceID",
        "ProductID",
        "ProductName",
        "ProductCost",
        "DiscountPercentage",
        "DiscountValue",
        "TaxableValue",
        "GSTRate",
        "IGSTRate",
        "IGSTValue",
        "CESSRate",
        "CESSValue",
        "CGSTValue",
        "SGSTValue",
        "IsActive",
        "Status",
        "CreatedDate",
        "ModifiedDate",
      ],
      include: [
        {
          model: Invoice,
          as: "IPIInvoiceID", // Alias for Invoice association
          attributes: ["CustomerName"], // Add other fields if required
        },
        {
          model: MasterProducts,
          as: "IPIMasterProdID", // Alias for MasterProducts association
          attributes: ["ProductType"], // Add other fields if required
        },
      ],
      order: [["CreatedDate", "DESC"]],
    });

    // Check if data is empty
    if (!invoiceProductInfoData || invoiceProductInfoData.length === 0) {
      return res.status(404).json({
        message: "No invoice product info data found.",
      });
    }

    // Map the data for response
    const combinedData = invoiceProductInfoData.map((item) => ({
      InvoiceProdInfoID: item.InvoiceProdInfoID,
      InvoiceID: item.InvoiceID,
      ProductID: item.ProductID,
      ProductName: item.ProductName,
      ProductCost: item.ProductCost,
      DiscountPercentage: item.DiscountPercentage,
      DiscountValue: item.DiscountValue,
      TaxableValue: item.TaxableValue,
      GSTRate: item.GSTRate,
      IGSTRate: item.IGSTRate,
      IGSTValue: item.IGSTValue,
      CESSRate: item.CESSRate,
      CESSValue: item.CESSValue,
      CGSTValue: item.CGSTValue,
      SGSTValue: item.SGSTValue,
      IsActive: item.IsActive,
      Status: item.Status,
      CreatedDate: item.CreatedDate,
      ModifiedDate: item.ModifiedDate,
      CustomerName: item.IPIInvoiceID ? item.IPIInvoiceID.CustomerName : null,
      ProductType: item.IPIMasterProdID
        ? item.IPIMasterProdID.ProductType
        : null,
    }));

    // Send the combined data as response
    res.json(combinedData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message:
          "Database error occurred while retrieving invoice product info data.",
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
    console.error("Error retrieving invoice product info data:", error);
    return res.status(500).json({
      message:
        "Failed to retrieve invoice product info data. Please try again later.",
    });
  }
};

// Find a single invoiceProductInfo with an id
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;

    // Validate the ID parameter
    if (!id) {
      return res.status(400).json({
        message: "ID parameter is required.",
      });
    }

    // Fetch the invoice product info data by primary key with related models
    const invoiceProductInfoData = await InvoiceProductInfo.findOne({
      where: {
        InvoiceProdInfoID: id,
      },
      attributes: [
        "InvoiceProdInfoID",
        "InvoiceID",
        "ProductID",
        "ProductName",
        "ProductCost",
        "DiscountPercentage",
        "DiscountValue",
        "TaxableValue",
        "GSTRate",
        "IGSTRate",
        "IGSTValue",
        "CESSRate",
        "CESSValue",
        "CGSTValue",
        "SGSTValue",
        "IsActive",
        "Status",
        "CreatedDate",
        "ModifiedDate",
      ],
      include: [
        {
          model: Invoice,
          as: "IPIInvoiceID", // Alias for Invoice association
          attributes: ["CustomerName"], // Add other fields if required
        },
        {
          model: MasterProducts,
          as: "IPIMasterProdID", // Alias for MasterProducts association
          attributes: ["ProductType"], // Add other fields if required
        },
      ],
    });

    // Check if data is found
    if (!invoiceProductInfoData) {
      return res.status(404).json({
        message: "Invoice product info data not found.",
      });
    }

    // Prepare the response data
    const responseData = {
      InvoiceProdInfoID: invoiceProductInfoData.InvoiceProdInfoID,
      InvoiceID: invoiceProductInfoData.InvoiceID,
      ProductID: invoiceProductInfoData.ProductID,
      ProductName: invoiceProductInfoData.ProductName,
      ProductCost: invoiceProductInfoData.ProductCost,
      DiscountPercentage: invoiceProductInfoData.DiscountPercentage,
      DiscountValue: invoiceProductInfoData.DiscountValue,
      TaxableValue: invoiceProductInfoData.TaxableValue,
      GSTRate: invoiceProductInfoData.GSTRate,
      IGSTRate: invoiceProductInfoData.IGSTRate,
      IGSTValue: invoiceProductInfoData.IGSTValue,
      CESSRate: invoiceProductInfoData.CESSRate,
      CESSValue: invoiceProductInfoData.CESSValue,
      CGSTValue: invoiceProductInfoData.CGSTValue,
      SGSTValue: invoiceProductInfoData.SGSTValue,
      IsActive: invoiceProductInfoData.IsActive,
      Status: invoiceProductInfoData.Status,
      CreatedDate: invoiceProductInfoData.CreatedDate,
      ModifiedDate: invoiceProductInfoData.ModifiedDate,
      CustomerName: invoiceProductInfoData.IPIInvoiceID
        ? invoiceProductInfoData.IPIInvoiceID.CustomerName
        : null,
      ProductType: invoiceProductInfoData.IPIMasterProdID
        ? invoiceProductInfoData.IPIMasterProdID.ProductType
        : null,
    };

    // Send the response data
    res.json(responseData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message:
          "Database error occurred while retrieving invoice product info data.",
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
    console.error("Error retrieving invoice product info data:", error);
    return res.status(500).json({
      message:
        "Failed to retrieve invoice product info data. Please try again later.",
    });
  }
};

// Update a invoiceProductInfo by the id in the request
exports.updateByPk = async (req, res) => {
  try {
    // Find the division by ID
    const invoiceProductInfoID = req.params.id;

    // Validate the ID parameter
    if (!invoiceProductInfoID) {
      return res.status(400).json({ message: "ID parameter is required." });
    }

    let invoiceProductInfo = await InvoiceProductInfo.findByPk(
      invoiceProductInfoID
    );

    if (!invoiceProductInfo) {
      return res.status(404).json({ message: "invoiceProductInfo not found" });
    }

    // Update fields
    invoiceProductInfo.InvoiceID =
      req.body.InvoiceID || invoiceProductInfo.InvoiceID;
    invoiceProductInfo.ProductID =
      req.body.ProductID || invoiceProductInfo.ProductID;
    invoiceProductInfo.ProductName =
      req.body.ProductName || invoiceProductInfo.ProductName;
    invoiceProductInfo.ProductCost =
      req.body.ProductCost || invoiceProductInfo.ProductCost;
    invoiceProductInfo.DiscountPercentage =
      req.body.DiscountPercentage || invoiceProductInfo.DiscountPercentage;
    invoiceProductInfo.DiscountValue =
      req.body.DiscountValue || invoiceProductInfo.DiscountValue;
    invoiceProductInfo.TaxableValue =
      req.body.TaxableValue || invoiceProductInfo.TaxableValue;
    invoiceProductInfo.GSTRate = req.body.GSTRate || invoiceProductInfo.GSTRate;
    invoiceProductInfo.IGSTRate =
      req.body.IGSTRate || invoiceProductInfo.IGSTRate;
    invoiceProductInfo.IGSTValue =
      req.body.IGSTValue || invoiceProductInfo.IGSTValue;
    invoiceProductInfo.CESSRate =
      req.body.CESSRate || invoiceProductInfo.CESSRate;
    invoiceProductInfo.CESSValue =
      req.body.CESSValue || invoiceProductInfo.CESSValue;
    invoiceProductInfo.CGSTValue =
      req.body.CGSTValue || invoiceProductInfo.CGSTValue;
    invoiceProductInfo.SGSTValue =
      req.body.SGSTValue || invoiceProductInfo.SGSTValue;
    invoiceProductInfo.IsActive =
      req.body.IsActive || invoiceProductInfo.IsActive;
    invoiceProductInfo.Status = req.body.Status || invoiceProductInfo.Status;
    invoiceProductInfo.ModifiedDate = new Date();

    // Save updated invoiceProductInfo in the database
    const updatedinvoiceProductInfo = await invoiceProductInfo.save();

    return res.status(200).json(updatedinvoiceProductInfo); // Send the updated invoiceProductInfo as response
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
        message: "Database error occurred while updating invoiceProductInfo.",
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
    console.error("Error updating invoiceProductInfo:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a invoiceProductInfo with the specified id in the request
exports.deleteById = async (req, res) => {
  const id = req.params.id;

  try {
    // Validate the ID parameter
    if (!id) {
      return res.status(400).json({ message: "ID parameter is required." });
    }

    // Find the model by ID
    const invoiceProductInfo = await InvoiceProductInfo.findByPk(id);

    // Check if the model exists
    if (!invoiceProductInfo) {
      return res
        .status(404)
        .json({ message: "invoiceProductInfo not found with id: " + id });
    }

    // Delete the model
    await invoiceProductInfo.destroy();

    // Send a success message
    res.status(200).json({
      message: "invoiceProductInfo with id: " + id + " deleted successfully",
    });
  } catch (err) {
    // Handle errors based on specific types
    if (err.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while deleting invoiceProductInfo.",
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
    console.error("Error deleting invoiceProductInfo:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
