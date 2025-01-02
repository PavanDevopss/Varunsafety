/* eslint-disable no-unused-vars */
const { Model } = require("sequelize");
const db = require("../models");
const InsurancePolicyMapping = db.insurancepolicymapping;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;
const InsurancePolicyType = db.insurancepolicytype;
const ModelMaster = db.modelmaster;
const VariantMaster = db.variantmaster;
const Transmission = db.transmission;

// Basic CRUD API
// Create and Save a new InsurancePolicyMapping
exports.create = async (req, res) => {
  try {
    // Log the incoming request body for debugging purposes
    console.log("Request Body Data:", req.body);

    // Check if an InsurancePolicyMapping with the same InsurancePolicyTypeID already exists
    const existingModel = await InsurancePolicyMapping.findOne({
      where: { InsurancePolicyTypeID: req.body.InsurancePolicyTypeID },
    });

    if (existingModel) {
      return res.status(400).json({
        message: "InsurancePolicyType already exists",
      });
    }

    // Create a new InsurancePolicyMapping
    const newInsurancePolicyMapping = await InsurancePolicyMapping.create({
      InsurancePolicyTypeID: req.body.InsurancePolicyTypeID,
      ModelMasterID: req.body.ModelMasterID,
      VariantID: req.body.VariantID,
      TransmissionID: req.body.TransmissionID,
      OwnDamage: req.body.OwnDamage,
      TPCover: req.body.TPCover,
      OwnDamagePriceType: req.body.OwnDamagePriceType,
      OwnDamagePriceValue: req.body.OwnDamagePriceValue,
      OwnDamageDiscountType: req.body.OwnDamageDiscountType,
      OwnDamageDiscountValue: req.body.OwnDamageDiscountValue, // Correct spelling
      TPCoverPriceType: req.body.TPCoverPriceType,
      TPCoverPriceValue: req.body.TPCoverPriceValue,
      TPCoverDiscountType: req.body.TPCoverDiscountType,
      TPCoverDiscountValue: req.body.TPCoverDiscountValue, // Correct spelling
      IsActive: req.body.IsActive !== undefined ? req.body.IsActive : true,
      Status: req.body.Status || "Active",
    });

    // Log the created object for debugging purposes
    console.log(
      "New InsurancePolicyMapping created:",
      newInsurancePolicyMapping
    );

    // Send the newly created InsurancePolicyMapping as response
    return res.status(201).json(newInsurancePolicyMapping);
  } catch (err) {
    // Handle specific Sequelize errors
    if (err.name === "SequelizeValidationError") {
      return res.status(400).json({
        message: "Validation error",
        details: err.errors.map((e) => e.message),
      });
    }

    if (err.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message:
          "Database error occurred while creating InsurancePolicyMapping.",
        details: err.message,
      });
    }

    if (err.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: err.message,
      });
    }

    // General error handling
    console.error("Error creating InsurancePolicyMapping:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Retrieve all InsurancePolicyMappings from the database.
exports.findAll = async (req, res) => {
  try {
    // Fetch all InsurancePolicyMapping data
    const insurancePolicyMappingData = await InsurancePolicyMapping.findAll({
      attributes: [
        "InsurancePolicyMappingID",
        "InsurancePolicyTypeID",
        "ModelMasterID",
        "VariantID",
        "TransmissionID",
        "OwnDamage",
        "TPCover",
        "OwnDamagePriceType",
        "OwnDamagePriceValue",
        "OwnDamageDiscountType",
        "OwnDamageDiscountValue",
        "TPCoverPriceType",
        "TPCoverPriceValue",
        "TPCoverDiscountType",
        "TPCoverDiscountValue",
        "IsActive",
        "Status",
      ],
      include: [
        {
          model: InsurancePolicyType,
          as: "IPMInsurancePolicyTypeID",
          attributes: ["PolicyCode", "PolicyName", "Duration", "Description"],
        },
        {
          model: ModelMaster,
          as: "IPMModelMasterID",
          attributes: ["ModelCode", "ModelDescription"],
        },
        {
          model: VariantMaster,
          as: "IPMVariantID",
          attributes: ["VariantCode"],
        },
        {
          model: Transmission,
          as: "IPMTransmissionID",
          attributes: ["TransmissionDescription", "TransmissionCode"],
        },
      ],
      order: [["CreatedDate", "DESC"]],
    });

    // Check if data is empty
    if (
      !insurancePolicyMappingData ||
      insurancePolicyMappingData.length === 0
    ) {
      return res.status(404).json({
        message: "No InsurancePolicyMapping data found.",
      });
    }

    // Map the data for response
    const combinedData = insurancePolicyMappingData.map((item) => ({
      InsurancePolicyMappingID: item.InsurancePolicyMappingID,
      InsurancePolicyTypeID: item.InsurancePolicyTypeID,
      PolicyCode: item.IPMInsurancePolicyTypeID
        ? item.IPMInsurancePolicyTypeID.PolicyCode
        : null,
      PolicyName: item.IPMInsurancePolicyTypeID
        ? item.IPMInsurancePolicyTypeID.PolicyName
        : null,
      Duration: item.IPMInsurancePolicyTypeID
        ? item.IPMInsurancePolicyTypeID.Duration
        : null,
      Description: item.IPMInsurancePolicyTypeID
        ? item.IPMInsurancePolicyTypeID.Description
        : null,
      ModelMasterID: item.ModelMasterID,
      ModelCode: item.IPMModelMasterID ? item.IPMModelMasterID.ModelCode : null,
      ModelDescription: item.IPMModelMasterID
        ? item.IPMModelMasterID.ModelDescription
        : null,
      VariantID: item.VariantID,
      VariantCode: item.IPMVariantID ? item.IPMVariantID.VariantCode : null,
      TransmissionID: item.TransmissionID,
      TransmissionDescription: item.IPMTransmissionID
        ? item.IPMTransmissionID.TransmissionDescription
        : null,
      TransmissionCode: item.IPMTransmissionID
        ? item.IPMTransmissionID.TransmissionCode
        : null,
      OwnDamage: item.OwnDamage,
      TPCover: item.TPCover,
      OwnDamagePriceType: item.OwnDamagePriceType,
      OwnDamagePriceValue: item.OwnDamagePriceValue,
      OwnDamageDiscountType: item.OwnDamageDiscountType,
      OwnDamageDiscountValue: item.OwnDamageDiscountValue,
      TPCoverPriceType: item.TPCoverPriceType,
      TPCoverPriceValue: item.TPCoverPriceValue,
      TPCoverDiscountType: item.TPCoverDiscountType,
      TPCoverDiscountValue: item.TPCoverDiscountValue,
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
          "Database error occurred while retrieving InsurancePolicyMapping data.",
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
    console.error("Error retrieving InsurancePolicyMapping data:", error);
    return res.status(500).json({
      message:
        "Failed to retrieve InsurancePolicyMapping data. Please try again later.",
    });
  }
};

// Find a single InsurancePolicyMapping with an id
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;

    // Fetch the InsurancePolicyMapping data by primary key
    // Fetch all InsurancePolicyMapping data
    const insurancePolicyMappingData = await InsurancePolicyMapping.findOne({
      where: { InsurancePolicyMappingID: id },
      attributes: [
        "InsurancePolicyMappingID",
        "InsurancePolicyTypeID",
        "ModelMasterID",
        "VariantID",
        "TransmissionID",
        "OwnDamage",
        "TPCover",
        "OwnDamagePriceType",
        "OwnDamagePriceValue",
        "OwnDamageDiscountType",
        "OwnDamageDiscountValue",
        "TPCoverPriceType",
        "TPCoverPriceValue",
        "TPCoverDiscountType",
        "TPCoverDiscountValue",
        "IsActive",
        "Status",
      ],
      include: [
        {
          model: InsurancePolicyType,
          as: "IPMInsurancePolicyTypeID",
          attributes: ["PolicyCode", "PolicyName", "Duration", "Description"],
        },
        {
          model: ModelMaster,
          as: "IPMModelMasterID",
          attributes: ["ModelCode", "ModelDescription"],
        },
        {
          model: VariantMaster,
          as: "IPMVariantID",
          attributes: ["VariantCode"],
        },
        {
          model: Transmission,
          as: "IPMTransmissionID",
          attributes: ["TransmissionDescription", "TransmissionCode"],
        },
      ],
      order: [["CreatedDate", "DESC"]],
    });

    // Check if data is empty
    if (
      !insurancePolicyMappingData ||
      insurancePolicyMappingData.length === 0
    ) {
      return res.status(404).json({
        message: "No InsurancePolicyMapping data found.",
      });
    }
    // Prepare the response data
    const responseData = {
      InsurancePolicyMappingID:
        insurancePolicyMappingData.InsurancePolicyMappingID,
      InsurancePolicyTypeID: insurancePolicyMappingData.InsurancePolicyTypeID,
      PolicyCode: insurancePolicyMappingData.IPMInsurancePolicyTypeID
        ? insurancePolicyMappingData.IPMInsurancePolicyTypeID.PolicyCode
        : null,
      PolicyName: insurancePolicyMappingData.IPMInsurancePolicyTypeID
        ? insurancePolicyMappingData.IPMInsurancePolicyTypeID.PolicyName
        : null,
      Duration: insurancePolicyMappingData.IPMInsurancePolicyTypeID
        ? insurancePolicyMappingData.IPMInsurancePolicyTypeID.Duration
        : null,
      Description: insurancePolicyMappingData.IPMInsurancePolicyTypeID
        ? insurancePolicyMappingData.IPMInsurancePolicyTypeID.Description
        : null,
      ModelMasterID: insurancePolicyMappingData.ModelMasterID,
      ModelCode: insurancePolicyMappingData.IPMModelMasterID
        ? insurancePolicyMappingData.IPMModelMasterID.ModelCode
        : null,
      ModelDescription: insurancePolicyMappingData.IPMModelMasterID
        ? insurancePolicyMappingData.IPMModelMasterID.ModelDescription
        : null,
      VariantID: insurancePolicyMappingData.VariantID,
      VariantCode: insurancePolicyMappingData.IPMVariantID
        ? insurancePolicyMappingData.IPMVariantID.VariantCode
        : null,
      TransmissionID: insurancePolicyMappingData.TransmissionID,
      TransmissionDescription: insurancePolicyMappingData.IPMTransmissionID
        ? insurancePolicyMappingData.IPMTransmissionID.TransmissionDescription
        : null,
      TransmissionCode: insurancePolicyMappingData.IPMTransmissionID
        ? insurancePolicyMappingData.IPMTransmissionID.TransmissionCode
        : null,
      OwnDamage: insurancePolicyMappingData.OwnDamage,
      TPCover: insurancePolicyMappingData.TPCover,
      OwnDamagePriceType: insurancePolicyMappingData.OwnDamagePriceType,
      OwnDamagePriceValue: insurancePolicyMappingData.OwnDamagePriceValue,
      OwnDamageDiscountType: insurancePolicyMappingData.OwnDamageDiscountType,
      OwnDamageDiscountValue: insurancePolicyMappingData.OwnDamageDiscountValue,
      TPCoverPriceType: insurancePolicyMappingData.TPCoverPriceType,
      TPCoverPriceValue: insurancePolicyMappingData.TPCoverPriceValue,
      TPCoverDiscountType: insurancePolicyMappingData.TPCoverDiscountType,
      TPCoverDiscountValue: insurancePolicyMappingData.TPCoverDiscountValue,

      IsActive: insurancePolicyMappingData.IsActive,
      Status: insurancePolicyMappingData.Status,
    };
    // Send the response data
    res.json(responseData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message:
          "Database error occurred while retrieving InsurancePolicyMapping data.",
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
    console.error("Error retrieving InsurancePolicyMapping data:", error);
    return res.status(500).json({
      message:
        "Failed to retrieve InsurancePolicyMapping data. Please try again later.",
    });
  }
};

// Update a InsurancePolicyMapping by the id in the request
exports.updateByPk = async (req, res) => {
  try {
    // Find the InsurancePolicyMapping by ID
    const InsurancePolicyMappingID = req.params.id;
    let insurancePolicyMapping = await InsurancePolicyMapping.findByPk(
      InsurancePolicyMappingID
    );

    // Check if InsurancePolicyMapping exists
    if (!insurancePolicyMapping) {
      return res
        .status(404)
        .json({ message: "InsurancePolicyMapping not found" });
    }

    // Update fields
    insurancePolicyMapping.InsurancePolicyMappingID =
      insurancePolicyMapping.InsurancePolicyMappingID;
    insurancePolicyMapping.InsurancePolicyTypeID =
      req.body.InsurancePolicyTypeID ||
      insurancePolicyMapping.InsurancePolicyTypeID;
    insurancePolicyMapping.ModelMasterID =
      req.body.ModelMasterID || insurancePolicyMapping.ModelMasterID;
    insurancePolicyMapping.VariantID =
      req.body.VariantID || insurancePolicyMapping.VariantID;
    insurancePolicyMapping.TransmissionID =
      req.body.TransmissionID || insurancePolicyMapping.TransmissionID;
    insurancePolicyMapping.OwnDamage =
      req.body.OwnDamage || insurancePolicyMapping.OwnDamage;
    insurancePolicyMapping.TPCover =
      req.body.TPCover || insurancePolicyMapping.TPCover;
    insurancePolicyMapping.OwnDamagePriceType =
      req.body.OwnDamagePriceType || insurancePolicyMapping.OwnDamagePriceType;
    insurancePolicyMapping.OwnDamagePriceValue =
      req.body.OwnDamagePriceValue ||
      insurancePolicyMapping.OwnDamagePriceValue;

    insurancePolicyMapping.OwnDamageDiscountType =
      req.body.OwnDamageDiscountType ||
      insurancePolicyMapping.OwnDamageDiscountType;
    insurancePolicyMapping.OwnDamageDiscountValue =
      req.body.OwnDamageDiscountValue ||
      insurancePolicyMapping.OwnDamageDiscountValue;
    insurancePolicyMapping.TPCoverPriceType =
      req.body.TPCoverPriceType || insurancePolicyMapping.TPCoverPriceType;
    insurancePolicyMapping.TPCoverPriceValue =
      req.body.TPCoverPriceValue || insurancePolicyMapping.TPCoverPriceValue;
    insurancePolicyMapping.TPCoverDiscountType =
      req.body.TPCoverDiscountType ||
      insurancePolicyMapping.TPCoverDiscountType;
    insurancePolicyMapping.TPCoverDiscountValue =
      req.body.TPCoverDiscountValue ||
      insurancePolicyMapping.TPCoverDiscountValue;
    insurancePolicyMapping.IsActive =
      req.body.IsActive || insurancePolicyMapping.IsActive;
    insurancePolicyMapping.Status =
      req.body.Status || insurancePolicyMapping.Status;
    insurancePolicyMapping.ModifiedDate = new Date();

    // Save updated InsurancePolicyMapping in the database
    const updatedInsurancePolicyMapping = await insurancePolicyMapping.save();

    // Send the updated InsurancePolicyMapping as response
    return res.status(200).json(updatedInsurancePolicyMapping);
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
        message:
          "Database error occurred while updating InsurancePolicyMapping.",
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
    console.error("Error updating InsurancePolicyMapping:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a InsurancePolicyMapping with the specified id in the request
exports.deleteById = async (req, res) => {
  const id = req.params.id;

  try {
    // Find the model by ID
    const insurancePolicyMapping = await InsurancePolicyMapping.findByPk(id);

    // Check if the model exists
    if (!insurancePolicyMapping) {
      return res
        .status(404)
        .json({ message: "InsurancePolicyMapping not found with id: " + id });
    }

    // Delete the model
    await insurancePolicyMapping.destroy();

    // Send a success message
    return res.status(200).json({
      message:
        "InsurancePolicyMapping with id: " + id + " deleted successfully",
    });
  } catch (err) {
    // Handle errors based on specific types
    if (err.name === "SequelizeForeignKeyConstraintError") {
      // Handle foreign key constraint errors
      return res.status(409).json({
        message:
          "Cannot delete. This InsurancePolicyMapping is referenced by other records.",
        details: err.message,
      });
    }

    if (err.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message:
          "Database error occurred while deleting InsurancePolicyMapping.",
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
    console.error("Error deleting InsurancePolicyMapping:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
