/* eslint-disable no-unused-vars */
const db = require("../models");
const SKUMaster = db.skumaster;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;
const ModelMaster = db.modelmaster;
const VariantMaster = db.variantmaster;
const FuelType = db.fueltypes;

// Basic CRUD API

// Create and Save a new SKUMaster
exports.create = async (req, res) => {
  console.log("SKU Code:", req.body.SKUCode);

  try {
    // Validate request
    if (!req.body.SKUCode) {
      return res.status(400).json({ message: "SKU Code cannot be empty" });
    }
    if (!req.body.ModelMasterID) {
      return res
        .status(400)
        .json({ message: "Model Master ID cannot be empty" });
    }
    if (!req.body.VariantID) {
      return res.status(400).json({ message: "Variant ID cannot be empty" });
    }
    if (!req.body.VariantDescription) {
      return res
        .status(400)
        .json({ message: "Variant Description cannot be empty" });
    }
    if (!req.body.IGSTRate) {
      return res.status(400).json({ message: "IGST Rate cannot be empty" });
    }
    if (!req.body.CESSRate) {
      return res.status(400).json({ message: "CESS Rate cannot be empty" });
    }
    if (!req.body.HSNCode) {
      return res.status(400).json({ message: "HSN Code cannot be empty" });
    }
    if (!/^\d+$/.test(req.body.HSNCode)) {
      return res
        .status(400)
        .json({ message: "HSNCode should contain only numbers" });
    }
    if (!req.body.DRF) {
      return res.status(400).json({ message: "DRF cannot be empty" });
    }
    if (!req.body.FuelTypeID) {
      return res.status(400).json({ message: "Fuel Type ID cannot be empty" });
    }

    // Check if ModelCode already exists
    const existingModel = await SKUMaster.findOne({
      where: { SKUCode: req.body.SKUCode },
    });
    if (existingModel) {
      return res.status(400).json({ message: "SKU Code already exists" });
    }

    // Create a model
    const skuMaster = {
      SKUCode: req.body.SKUCode.toUpperCase(),
      ModelMasterID: req.body.ModelMasterID,
      VariantID: req.body.VariantID,
      VariantDescription: req.body.VariantDescription.toUpperCase(),
      EmissionNorm: req.body.EmissionNorm,
      IGSTRate: req.body.IGSTRate,
      CESSRate: req.body.CESSRate,
      HSNCode: req.body.HSNCode,
      DRF: req.body.DRF,
      FuelTypeID: req.body.FuelTypeID,
      IsActive: req.body.IsActive || true,
      Status: req.body.Status || "Active",
      CreatedDate: req.body.CreatedDate || new Date(),
      // ModifiedDate: req.body.ModifiedDate || new Date(),
    };

    // Save SKUMasters in the database
    const newSKUMaster = await SKUMaster.create(skuMaster);

    return res.status(201).json(newSKUMaster); // Send the newly created SKUMaster as response
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
        message: "Database error occurred while creating SKUMaster.",
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
    console.error("Error creating SKUMaster:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Retrieve all SKUMasters from the database.
exports.findAll = async (req, res) => {
  try {
    const skuMasters = await SKUMaster.findAll({
      include: [
        {
          model: ModelMaster,
          as: "SKUMModelMasterID",
          attributes: ["ModelCode", "ModelDescription"],
        },
        {
          model: VariantMaster,
          as: "SKUMVariantID",
          attributes: ["VariantCode"],
        },
        {
          model: FuelType,
          as: "SKUMFuelTypeID",
          attributes: ["FuelTypeName"],
        },
      ],
      attributes: [
        "SKUID",
        "SKUCode",
        "VariantDescription", // Retrieving VariantDescription from SKUMaster
        "EmissionNorm",
        "IGSTRate",
        "CESSRate",
        "HSNCode",
        "DRF",
        "IsActive",
        "Status",
        "CreatedDate",
        "ModifiedDate",
        "ModelMasterID", // Corrected to ModelMasterID
        "VariantID", // Corrected to VariantID
        "FuelTypeID", // Corrected to FuelTypeID
      ],
      order: [
        ["SKUCode", "ASC"], // Order by ModelDescription in ascending order
      ],
    });

    // Map data for structured response
    const mappedData = skuMasters.map((skuMaster) => ({
      SKUID: skuMaster.SKUID,
      SKUCode: skuMaster.SKUCode,
      ModelMasterID: skuMaster.ModelMasterID, // Using ModelMasterID from SKUMaster
      ModelCode: skuMaster.SKUMModelMasterID
        ? skuMaster.SKUMModelMasterID.ModelCode
        : null,
      ModelDescription: skuMaster.SKUMModelMasterID
        ? skuMaster.SKUMModelMasterID.ModelDescription
        : null,
      VariantID: skuMaster.VariantID, // Using VariantID from SKUMaster
      VariantCode: skuMaster.SKUMVariantID
        ? skuMaster.SKUMVariantID.VariantCode
        : null,
      VariantDescription: skuMaster.VariantDescription, // Using VariantDescription from SKUMaster
      EmissionNorm: skuMaster.EmissionNorm,
      IGSTRate: skuMaster.IGSTRate,
      CESSRate: skuMaster.CESSRate,
      HSNCode: skuMaster.HSNCode,
      DRF: skuMaster.DRF,
      FuelTypeID: skuMaster.FuelTypeID, // Using FuelTypeID from SKUMaster
      FuelTypeName: skuMaster.SKUMFuelTypeID
        ? skuMaster.SKUMFuelTypeID.FuelTypeName
        : null,
      IsActive: skuMaster.IsActive,
      Status: skuMaster.Status,
      CreatedDate: skuMaster.CreatedDate,
      ModifiedDate: skuMaster.ModifiedDate,
    }));

    return res.status(200).json(mappedData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while retrieving sku name data.",
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

    console.error("Error while fetching SKUMasters:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Find a single SKUMaster with an id
exports.findOne = async (req, res) => {
  try {
    const { id } = req.params;

    const skuMaster = await SKUMaster.findOne({
      where: { SKUID: id },
      include: [
        {
          model: ModelMaster,
          as: "SKUMModelMasterID",
          attributes: ["ModelCode", "ModelDescription"],
        },
        {
          model: VariantMaster,
          as: "SKUMVariantID",
          attributes: ["VariantCode"],
        },
        {
          model: FuelType,
          as: "SKUMFuelTypeID",
          attributes: ["FuelTypeName"],
        },
      ],
      attributes: [
        "SKUID",
        "SKUCode",
        "VariantDescription", // Retrieving VariantDescription from SKUMaster
        "EmissionNorm",
        "IGSTRate",
        "CESSRate",
        "HSNCode",
        "DRF",
        "IsActive",
        "Status",
        "CreatedDate",
        "ModifiedDate",
        "ModelMasterID", // Corrected to ModelMasterID
        "VariantID", // Corrected to VariantID
        "FuelTypeID", // Corrected to FuelTypeID
      ],
    });

    if (!skuMaster) {
      return res.status(404).json({ message: "SKUMaster not found" });
    }

    // Map data for structured response
    const mappedData = {
      SKUID: skuMaster.SKUID,
      SKUCode: skuMaster.SKUCode,
      ModelMasterID: skuMaster.ModelMasterID, // Using ModelMasterID from SKUMaster
      ModelCode: skuMaster.SKUMModelMasterID
        ? skuMaster.SKUMModelMasterID.ModelCode
        : null,
      ModelDescription: skuMaster.SKUMModelMasterID
        ? skuMaster.SKUMModelMasterID.ModelDescription
        : null,
      VariantID: skuMaster.VariantID, // Using VariantID from SKUMaster
      VariantCode: skuMaster.SKUMVariantID
        ? skuMaster.SKUMVariantID.VariantCode
        : null,
      VariantDescription: skuMaster.VariantDescription, // Using VariantDescription from SKUMaster
      EmissionNorm: skuMaster.EmissionNorm,
      IGSTRate: skuMaster.IGSTRate,
      CESSRate: skuMaster.CESSRate,
      HSNCode: skuMaster.HSNCode,
      DRF: skuMaster.DRF,
      FuelTypeID: skuMaster.FuelTypeID, // Using FuelTypeID from SKUMaster
      FuelTypeName: skuMaster.SKUMFuelTypeID
        ? skuMaster.SKUMFuelTypeID.FuelTypeName
        : null,
      IsActive: skuMaster.IsActive,
      Status: skuMaster.Status,
      CreatedDate: skuMaster.CreatedDate,
      ModifiedDate: skuMaster.ModifiedDate,
    };

    return res.status(200).json(mappedData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while retrieving sku data.",
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

    console.error("Error while fetching SKUMaster:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update a SKUMaster by the id in the request
exports.updateByPk = async (req, res) => {
  console.log("SKU Code:", req.body.SKUCode);

  try {
    // Validate request
    if (!req.body.SKUCode) {
      return res.status(400).json({ message: "SKU Code cannot be empty" });
    }
    if (!req.body.ModelMasterID) {
      return res
        .status(400)
        .json({ message: "Model Master ID cannot be empty" });
    }
    if (!req.body.VariantID) {
      return res.status(400).json({ message: "Variant ID cannot be empty" });
    }
    if (!req.body.VariantDescription) {
      return res
        .status(400)
        .json({ message: "Variant Description cannot be empty" });
    }
    if (!req.body.IGSTRate) {
      return res.status(400).json({ message: "IGST Rate cannot be empty" });
    }
    if (!req.body.CESSRate) {
      return res.status(400).json({ message: "CESS Rate cannot be empty" });
    }
    if (!req.body.HSNCode) {
      return res.status(400).json({ message: "HSN Code cannot be empty" });
    }
    if (!/^\d+$/.test(req.body.HSNCode)) {
      return res
        .status(400)
        .json({ message: "HSNCode should contain only numbers" });
    }
    if (!req.body.DRF) {
      return res.status(400).json({ message: "DRF cannot be empty" });
    }
    if (!req.body.FuelTypeID) {
      return res.status(400).json({ message: "Fuel Type ID cannot be empty" });
    }

    // Find the model by ID
    const SKUId = req.params.id;
    let skuMaster = await SKUMaster.findByPk(SKUId);

    if (!SKUMaster) {
      return res.status(404).json({ message: "SKUMaster not found" });
    }

    // Update other fields
    skuMaster.SKUCode = req.body.SKUCode.toUpperCase() || skuMaster.SKUCode;
    skuMaster.ModelMasterID = req.body.ModelMasterID || skuMaster.ModelMasterID;
    skuMaster.VariantID = req.body.VariantID || skuMaster.VariantID;
    skuMaster.VariantDescription =
      req.body.VariantDescription.toUpperCase() || skuMaster.VariantDescription;
    skuMaster.EmissionNorm = req.body.EmissionNorm || skuMaster.EmissionNorm;
    skuMaster.IGSTRate = req.body.IGSTRate || skuMaster.IGSTRate;
    skuMaster.CESSRate = req.body.CESSRate || skuMaster.CESSRate;
    skuMaster.HSNCode = req.body.HSNCode || skuMaster.HSNCode;
    skuMaster.DRF = req.body.DRF || skuMaster.DRF;
    skuMaster.FuelTypeID = req.body.FuelTypeID || skuMaster.FuelTypeID;
    skuMaster.IsActive =
      req.body.IsActive !== undefined ? req.body.IsActive : skuMaster.IsActive;

    // Set Status field based on IsActive
    skuMaster.Status = skuMaster.IsActive ? "Active" : "In-Active";
    skuMaster.ModifiedDate = new Date();

    // console.log("model:", skuMaster);

    // Save updated SKUMaster in the database
    const updatedSKUMaster = await skuMaster.save();

    return res.status(200).json(updatedSKUMaster); // Send the updated SKUMaster as response
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
        message: "Database error occurred while updating SKUMaster.",
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

    console.error("Error updating SKUMaster:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a SKUMaster with the specified id in the request
exports.deleteById = async (req, res) => {
  const id = req.params.id;

  try {
    // Find the model by ID
    const skuMaster = await SKUMaster.findByPk(id);

    // Check if the model exists
    if (!skuMaster) {
      return res
        .status(404)
        .json({ message: "SKUMaster not found with id: " + id });
    }

    // Delete the model
    await skuMaster.destroy();

    // Send a success message
    res.status(200).json({
      message: "SKUMaster with id: " + id + " deleted successfully",
    });
  } catch (err) {
    // Handle errors based on specific types
    if (err.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while deleting SKUMaster.",
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
    console.error("Error deleting SKUMaster:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
