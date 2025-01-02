/* eslint-disable no-unused-vars */
const db = require("../models");
const { genMasterProductsNo } = require("../Utils/generateService");
const MasterProducts = db.masterproducts;
const UserMaster = db.usermaster;
const VehicleAllotment = db.vehicleallotment;
const CustomerMaster = db.customermaster;
const BranchMaster = db.branchmaster;
const PaymentReference = db.paymentRef;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;

// Basic CRUD API

// Create and Save a new MasterProducts
exports.create = async (req, res) => {
  try {
    // Check if a MasterProduct already exists with the same ProductName
    const existingProduct = await MasterProducts.findOne({
      where: {
        ProductName: req.body.ProductName,
      },
    });

    if (existingProduct) {
      return res.status(400).json({
        message: "A product with the same ProductName already exists.",
      });
    }

    // Map fields from req.body to MasterProducts object
    const masterProductData = {
      ProductType: req.body.ProductType,
      ProductName: req.body.ProductName,
      ProductCost: req.body.ProductCost,
      HSNValue: req.body.HSNValue,
      CESSRate: req.body.CESSRate,
      GSTRate: req.body.GSTRate,
      IsActive: req.body.IsActive !== undefined ? req.body.IsActive : true,
      Status: req.body.Status || "Active",
    };

    // Save the new MasterProduct in the database
    const newMasterProduct = await MasterProducts.create(masterProductData);

    // Return the newly created MasterProduct as a response
    return res.status(201).json(newMasterProduct);
  } catch (err) {
    // Handle Sequelize-specific errors
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
        message: "Database error occurred while creating MasterProduct.",
        details: err.message,
      });
    }

    if (err.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: err.message,
      });
    }

    // Log and return a general error
    console.error("Error creating MasterProduct:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Retrieve all MasterProductss from the database.
exports.findAll = async (req, res) => {
  try {
    // Fetch all MasterProducts entries
    const masterProductsList = await MasterProducts.findAll({
      attributes: [
        "MasterProdID",
        "ProductType",
        "ProductName",
        "ProductCost",
        "HSNValue",
        "CESSRate",
        "GSTRate",
        "IsActive",
        "Status",
        "CreatedDate",
        "ModifiedDate",
      ],
      order: [["MasterProdID", "DESC"]], // Order by MasterProdID in descending order
    });

    // Check if there are no records
    if (masterProductsList.length === 0) {
      return res.status(404).json({ message: "No MasterProducts found" });
    }

    // Return the records as a JSON response
    res.status(200).json(masterProductsList);
  } catch (error) {
    // Handle specific Sequelize errors
    if (error.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message: "Database error occurred while retrieving MasterProducts.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    // Log and return a general error
    console.error("Error fetching MasterProducts:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Find a single MasterProducts with an id
exports.findOne = async (req, res) => {
  try {
    const masterProdId = req.params.id; // Get MasterProdID from URL parameter

    // Fetch the MasterProduct by MasterProdID
    const masterProduct = await MasterProducts.findOne({
      where: { MasterProdID: masterProdId }, // Find the MasterProduct by its ID
      attributes: [
        "MasterProdID",
        "ProductType",
        "ProductName",
        "ProductCost",
        "HSNValue",
        "CESSRate",
        "GSTRate",
        "IsActive",
        "Status",
        "CreatedDate",
        "ModifiedDate",
      ],
    });

    // If no MasterProduct is found, return a 404 error
    if (!masterProduct) {
      return res.status(404).json({ message: "MasterProduct not found" });
    }

    // Return the found MasterProduct
    res.status(200).json(masterProduct);
  } catch (error) {
    // Handle specific Sequelize errors
    if (error.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message: "Database error occurred while retrieving the MasterProduct.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    // Log and return a general error
    console.error("Error fetching MasterProduct:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Update a MasterProducts by the id in the request
exports.update = async (req, res) => {
  console.log("MasterProdID:", req.params.id); // Log the MasterProdID

  try {
    // Validate request - Check if MasterProdID is provided in the URL params
    if (!req.params.id) {
      return res.status(400).json({ message: "MasterProdID is required" });
    }

    const masterProdId = req.params.id;

    // Find the MasterProduct by ID
    let masterProduct = await MasterProducts.findByPk(masterProdId);
    console.log("MasterProduct data: ", masterProduct);

    // If the MasterProduct doesn't exist, return a 404 error
    if (!masterProduct) {
      return res.status(404).json({ message: "MasterProduct not found" });
    }

    // Update fields based on the request body
    masterProduct.ProductType =
      req.body.ProductType || masterProduct.ProductType;
    masterProduct.ProductName =
      req.body.ProductName || masterProduct.ProductName;
    masterProduct.ProductCost =
      req.body.ProductCost || masterProduct.ProductCost;
    masterProduct.HSNValue = req.body.HSNValue || masterProduct.HSNValue;
    masterProduct.CESSRate = req.body.CESSRate || masterProduct.CESSRate;
    masterProduct.GSTRate = req.body.GSTRate || masterProduct.GSTRate;
    masterProduct.IsActive =
      req.body.IsActive !== undefined
        ? req.body.IsActive
        : masterProduct.IsActive;
    masterProduct.Status = req.body.Status || masterProduct.Status || "Active";
    masterProduct.ModifiedDate = new Date(); // Set the modification date to current timestamp

    console.log("Updated MasterProduct:", masterProduct);

    // Save updated MasterProduct in the database
    const updatedMasterProduct = await masterProduct.save();

    // Return the updated MasterProduct as a response
    return res.status(200).json(updatedMasterProduct);
  } catch (err) {
    // Handle Sequelize validation error
    if (err.name === "SequelizeValidationError") {
      return res.status(400).json({
        message: "Validation error",
        details: err.errors.map((e) => e.message),
      });
    }

    // Handle database-related errors
    if (err.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message: "Database error occurred while updating MasterProduct.",
        details: err.message,
      });
    }

    // Handle connection errors
    if (err.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: err.message,
      });
    }

    // Catch-all for unexpected errors
    console.error("Error updating MasterProduct:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a MasterProducts with the specified id in the request
exports.delete = async (req, res) => {
  const id = req.params.id; // Extract the MasterProdID from the URL parameters

  try {
    // Find the MasterProduct by its ID
    const masterProduct = await MasterProducts.findByPk(id);

    // Check if the MasterProduct exists
    if (!masterProduct) {
      return res
        .status(404)
        .json({ message: `MasterProduct not found with id: ${id}` });
    }

    // Delete the MasterProduct
    await masterProduct.destroy();

    // Send a success response with a message
    res.status(200).json({
      message: `MasterProduct with id: ${id} deleted successfully`,
    });
  } catch (err) {
    // Handle specific Sequelize errors
    if (err.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message: "Database error occurred while deleting the MasterProduct.",
        details: err.message,
      });
    }

    if (err.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: err.message,
      });
    }

    // Log and handle any other unexpected errors
    console.error("Error deleting MasterProduct:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
