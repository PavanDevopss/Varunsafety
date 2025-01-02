/* eslint-disable no-unused-vars */
const { Model } = require("sequelize");
const db = require("../models");
const InsuranceValueMapping = db.insurancevaluemapping;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;
const InsurancePolicyMapping = db.insurancepolicymapping;
const InsuranceValueAdded = db.insurancevalueadded;
const InsurancePolicyType = db.insurancepolicytype;
const ModelMaster = db.modelmaster;
const VariantMaster = db.variantmaster;
const Transmission = db.transmission;
// Basic CRUD API
// Create and Save a new InsuranceValueMapping
exports.create = async (req, res) => {
  try {
    // Log the incoming request body for debugging purposes
    console.log("Request Body Data:", req.body);

    const { InsurancePolicyMappingID, mappings } = req.body;

    // Ensure InsurancePolicyMappingID is provided
    if (!InsurancePolicyMappingID) {
      return res.status(400).json({
        message: "InsurancePolicyMappingID is required",
      });
    }

    // Check if the provided InsurancePolicyMappingID exists
    const existingPolicyMapping = await InsurancePolicyMapping.findOne({
      where: { InsurancePolicyMappingID },
    });

    if (!existingPolicyMapping) {
      return res.status(400).json({
        message: "InsurancePolicyMappingID does not exist",
      });
    }

    // Separate out the duplicate mappings
    const duplicateMappings = [];
    const newMappings = [];

    for (const mapping of mappings) {
      const existingValueMapping = await InsuranceValueMapping.findOne({
        where: {
          InsurancePolicyMappingID,
          InsuranceValueAddedID: mapping.InsuranceValueAddedID,
        },
      });

      if (existingValueMapping) {
        // Add to duplicates if found
        duplicateMappings.push(mapping);
      } else {
        // Otherwise, prepare it for creation
        newMappings.push({
          InsurancePolicyMappingID,
          InsuranceValueAddedID: mapping.InsuranceValueAddedID,
          PriceType: mapping.PriceType,
          PriceValue: mapping.PriceValue,
          DiscountType: mapping.DiscountType,
          DiscountValue: mapping.DiscountValue,
          IsActive: mapping.IsActive !== undefined ? mapping.IsActive : true,
          Status: mapping.Status || "Active",
        });
      }
    }

    // If there are no new mappings to create
    if (newMappings.length === 0 && duplicateMappings.length > 0) {
      return res.status(400).json({
        message: "All mappings are duplicates",
        duplicates: duplicateMappings,
      });
    }

    // Bulk create new mappings
    const createdMappings = await InsuranceValueMapping.bulkCreate(newMappings);

    // Log the created objects for debugging purposes
    console.log("New InsuranceValueMappings created:", createdMappings);

    // Send the response with both created and duplicate mappings
    return res.status(201).json({
      created: createdMappings,
      duplicates: duplicateMappings,
    });
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
          "Database error occurred while creating InsuranceValueMappings.",
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
    console.error("Error creating InsuranceValueMappings:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Retrieve all InsuranceValueMappings from the database.
exports.findAll = async (req, res) => {
  try {
    // Fetch all InsuranceValueMapping data
    const insuranceValueMappingData = await InsuranceValueMapping.findAll({
      attributes: [
        "InsuranceValueMappingID",
        "InsurancePolicyMappingID",
        "InsuranceValueAddedID",
        "PriceType",
        "PriceValue",
        "DiscountType",
        "DiscountValue",
        "IsActive",
        "Status",
      ],
      include: [
        {
          model: InsuranceValueAdded,
          as: "IVMInsuranceValueAddedID",
          attributes: ["InsuranceCode", "AddOnType", "Description"],
        },
        {
          model: InsurancePolicyMapping,
          as: "IVMInsurancePolicyMappingID",
          attributes: [
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
              attributes: [
                "PolicyCode",
                "PolicyName",
                "Duration",
                "Description",
              ],
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
        },
      ],
      order: [["CreatedDate", "DESC"]],
    });

    // Check if data is empty
    if (!insuranceValueMappingData || insuranceValueMappingData.length === 0) {
      return res.status(404).json({
        message: "No InsuranceValueMapping data found.",
      });
    }

    // Map the data for response
    const combinedData = insuranceValueMappingData.map((item) => ({
      InsuranceValueMappingID: item.InsuranceValueMappingID,
      InsurancePolicyMappingID: item.InsurancePolicyMappingID,
      InsuranceValueAddedID: item.InsuranceValueAddedID,
      PriceType: item.PriceType,
      PriceValue: item.PriceValue,
      DiscountType: item.DiscountType,
      DiscountValue: item.DiscountValue,
      IsActive: item.IsActive,
      Status: item.Status,

      // Mapping InsuranceValueAdded attributes
      InsuranceCode: item.IVMInsuranceValueAddedID
        ? item.IVMInsuranceValueAddedID.InsuranceCode
        : null,
      AddOnType: item.IVMInsuranceValueAddedID
        ? item.IVMInsuranceValueAddedID.AddOnType
        : null,
      Description: item.IVMInsuranceValueAddedID
        ? item.IVMInsuranceValueAddedID.Description
        : null,

      // Mapping InsurancePolicyMapping attributes
      InsurancePolicyTypeID: item.IVMInsurancePolicyMappingID
        ? item.IVMInsurancePolicyMappingID.InsurancePolicyTypeID
        : null,
      ModelMasterID: item.IVMInsurancePolicyMappingID
        ? item.IVMInsurancePolicyMappingID.ModelMasterID
        : null,
      VariantID: item.IVMInsurancePolicyMappingID
        ? item.IVMInsurancePolicyMappingID.VariantID
        : null,
      TransmissionID: item.IVMInsurancePolicyMappingID
        ? item.IVMInsurancePolicyMappingID.TransmissionID
        : null,
      OwnDamage: item.IVMInsurancePolicyMappingID
        ? item.IVMInsurancePolicyMappingID.OwnDamage
        : null,
      TPCover: item.IVMInsurancePolicyMappingID
        ? item.IVMInsurancePolicyMappingID.TPCover
        : null,
      OwnDamagePriceType: item.IVMInsurancePolicyMappingID
        ? item.IVMInsurancePolicyMappingID.OwnDamagePriceType
        : null,
      OwnDamagePriceValue: item.IVMInsurancePolicyMappingID
        ? item.IVMInsurancePolicyMappingID.OwnDamagePriceValue
        : null,
      OwnDamageDiscountType: item.IVMInsurancePolicyMappingID
        ? item.IVMInsurancePolicyMappingID.OwnDamageDiscountType
        : null,
      OwnDamageDiscountValue: item.IVMInsurancePolicyMappingID
        ? item.IVMInsurancePolicyMappingID.OwnDamageDiscountValue
        : null,
      TPCoverPriceType: item.IVMInsurancePolicyMappingID
        ? item.IVMInsurancePolicyMappingID.TPCoverPriceType
        : null,
      TPCoverPriceValue: item.IVMInsurancePolicyMappingID
        ? item.IVMInsurancePolicyMappingID.TPCoverPriceValue
        : null,
      TPCoverDiscountType: item.IVMInsurancePolicyMappingID
        ? item.IVMInsurancePolicyMappingID.TPCoverDiscountType
        : null,
      TPCoverDiscountValue: item.IVMInsurancePolicyMappingID
        ? item.IVMInsurancePolicyMappingID.TPCoverDiscountValue
        : null,

      // Mapping InsurancePolicyType attributes
      PolicyCode: item.IVMInsurancePolicyMappingID?.IPMInsurancePolicyTypeID
        ? item.IVMInsurancePolicyMappingID.IPMInsurancePolicyTypeID.PolicyCode
        : null,
      PolicyName: item.IVMInsurancePolicyMappingID?.IPMInsurancePolicyTypeID
        ? item.IVMInsurancePolicyMappingID.IPMInsurancePolicyTypeID.PolicyName
        : null,
      Duration: item.IVMInsurancePolicyMappingID?.IPMInsurancePolicyTypeID
        ? item.IVMInsurancePolicyMappingID.IPMInsurancePolicyTypeID.Duration
        : null,
      PolicyDescription: item.IVMInsurancePolicyMappingID
        ?.IPMInsurancePolicyTypeID
        ? item.IVMInsurancePolicyMappingID.IPMInsurancePolicyTypeID.Description
        : null,

      // Mapping ModelMaster attributes
      ModelCode: item.IVMInsurancePolicyMappingID?.IPMModelMasterID
        ? item.IVMInsurancePolicyMappingID.IPMModelMasterID.ModelCode
        : null,
      ModelDescription: item.IVMInsurancePolicyMappingID?.IPMModelMasterID
        ? item.IVMInsurancePolicyMappingID.IPMModelMasterID.ModelDescription
        : null,

      // Mapping VariantMaster attributes
      VariantCode: item.IVMInsurancePolicyMappingID?.IPMVariantID
        ? item.IVMInsurancePolicyMappingID.IPMVariantID.VariantCode
        : null,

      // Mapping Transmission attributes
      TransmissionDescription: item.IVMInsurancePolicyMappingID
        ?.IPMTransmissionID
        ? item.IVMInsurancePolicyMappingID.IPMTransmissionID
            .TransmissionDescription
        : null,
      TransmissionCode: item.IVMInsurancePolicyMappingID?.IPMTransmissionID
        ? item.IVMInsurancePolicyMappingID.IPMTransmissionID.TransmissionCode
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
          "Database error occurred while retrieving InsuranceValueMapping data.",
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
    console.error("Error retrieving InsuranceValueMapping data:", error);
    return res.status(500).json({
      message:
        "Failed to retrieve InsuranceValueMapping data. Please try again later.",
    });
  }
};

// Find a single InsuranceValueMapping with an id
exports.findOne = async (req, res) => {
  try {
    const insuranceValueMappingID = req.query.InsuranceValueMappingID;
    const insurancePolicyMappingID = req.query.InsurancePolicyMappingID;

    // Fetch the InsuranceValueMapping data by primary key
    const insuranceValueMappingData = await InsuranceValueMapping.findOne({
      where: { InsuranceValueMappingID: insuranceValueMappingID },
      attributes: ["InsuranceValueMappingID"],
      include: [
        {
          model: InsuranceValueAdded,
          as: "IVMInsuranceValueAddedID",
          attributes: ["InsuranceCode", "AddOnType", "Description"],
        },
        {
          model: InsurancePolicyMapping,
          as: "IVMInsurancePolicyMappingID",
          attributes: [
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
              attributes: [
                "PolicyCode",
                "PolicyName",
                "Duration",
                "Description",
              ],
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
        },
      ],
      order: [["CreatedDate", "DESC"]],
    });

    // Check if data is empty
    if (!insuranceValueMappingData) {
      return res.status(404).json({
        message: "No InsuranceValueMapping data found.",
      });
    }

    const insurancePolicyMappingData = await InsuranceValueMapping.findAll({
      include: [
        {
          model: InsuranceValueAdded,
          as: "IVMInsuranceValueAddedID",
          attributes: ["InsuranceCode", "AddOnType"],
        },
      ],
      where: { InsurancePolicyMappingID: insurancePolicyMappingID },
    });

    // Map the data for response
    const combinedData = insurancePolicyMappingData.map((item) => ({
      InsuranceValueMappingID: item.InsuranceValueMappingID,
      InsurancePolicyMappingID: item.InsurancePolicyMappingID,
      InsuranceValueAddedID: item.InsuranceValueAddedID,
      PriceType: item.PriceType,
      PriceValue: item.PriceValue,
      DiscountType: item.DiscountType,
      DiscountValue: item.DiscountValue,
      IsActive: item.IsActive,
      Status: item.Status,
      InsuranceCode: item.IVMInsuranceValueAddedID
        ? item.IVMInsuranceValueAddedID.InsuranceCode
        : null,
      AddOnType: item.IVMInsuranceValueAddedID
        ? item.IVMInsuranceValueAddedID.AddOnType
        : null,
    }));
    // Prepare the response data
    const responseData = {
      InsuranceValueMappingID:
        insuranceValueMappingData.InsuranceValueMappingID,
      InsurancePolicyMappingID:
        insuranceValueMappingData.InsurancePolicyMappingID,
      InsuranceValueAddedID: insuranceValueMappingData.InsuranceValueAddedID,
      PriceType: insuranceValueMappingData.PriceType,
      PriceValue: insuranceValueMappingData.PriceValue,
      DiscountType: insuranceValueMappingData.DiscountType,
      DiscountValue: insuranceValueMappingData.DiscountValue,
      IsActive: insuranceValueMappingData.IsActive,
      Status: insuranceValueMappingData.Status,
      InsurancePolicyTypeID: insuranceValueMappingData
        .IVMInsurancePolicyMappingID.IPMInsurancePolicyTypeID
        ? insuranceValueMappingData.IVMInsurancePolicyMappingID
            .IPMInsurancePolicyTypeID.PolicyCode
        : null,
      PolicyCode: insuranceValueMappingData.IVMInsurancePolicyMappingID
        .IPMInsurancePolicyTypeID
        ? insuranceValueMappingData.IVMInsurancePolicyMappingID
            .IPMInsurancePolicyTypeID.PolicyCode
        : null,
      PolicyName: insuranceValueMappingData.IVMInsurancePolicyMappingID
        .IPMInsurancePolicyTypeID
        ? insuranceValueMappingData.IVMInsurancePolicyMappingID
            .IPMInsurancePolicyTypeID.PolicyName
        : null,
      Duration: insuranceValueMappingData.IVMInsurancePolicyMappingID
        .IPMInsurancePolicyTypeID
        ? insuranceValueMappingData.IVMInsurancePolicyMappingID
            .IPMInsurancePolicyTypeID.Duration
        : null,
      Description: insuranceValueMappingData.IVMInsurancePolicyMappingID
        .IPMInsurancePolicyTypeID
        ? insuranceValueMappingData.IVMInsurancePolicyMappingID
            .IPMInsurancePolicyTypeID.Description
        : null,
      ModelMasterID:
        insuranceValueMappingData.IVMInsurancePolicyMappingID.ModelMasterID,
      ModelCode: insuranceValueMappingData.IVMInsurancePolicyMappingID
        .IPMModelMasterID
        ? insuranceValueMappingData.IVMInsurancePolicyMappingID.IPMModelMasterID
            .ModelCode
        : null,
      ModelDescription: insuranceValueMappingData.IVMInsurancePolicyMappingID
        .IPMModelMasterID
        ? insuranceValueMappingData.IVMInsurancePolicyMappingID.IPMModelMasterID
            .ModelDescription
        : null,
      VariantID:
        insuranceValueMappingData.IVMInsurancePolicyMappingID.VariantID,
      VariantCode: insuranceValueMappingData.IVMInsurancePolicyMappingID
        .IPMVariantID
        ? insuranceValueMappingData.IVMInsurancePolicyMappingID.IPMVariantID
            .VariantCode
        : null,
      TransmissionID:
        insuranceValueMappingData.IVMInsurancePolicyMappingID.TransmissionID,
      TransmissionDescription: insuranceValueMappingData
        .IVMInsurancePolicyMappingID.IPMTransmissionID
        ? insuranceValueMappingData.IVMInsurancePolicyMappingID
            .IPMTransmissionID.TransmissionDescription
        : null,
      TransmissionCode: insuranceValueMappingData.IVMInsurancePolicyMappingID
        .IPMTransmissionID
        ? insuranceValueMappingData.IVMInsurancePolicyMappingID
            .IPMTransmissionID.TransmissionCode
        : null,
      OwnDamage:
        insuranceValueMappingData.IVMInsurancePolicyMappingID.OwnDamage,
      TPCover: insuranceValueMappingData.IVMInsurancePolicyMappingID.TPCover,
      OwnDamagePriceType:
        insuranceValueMappingData.IVMInsurancePolicyMappingID
          .OwnDamagePriceType,
      OwnDamagePriceValue:
        insuranceValueMappingData.IVMInsurancePolicyMappingID
          .OwnDamagePriceValue,
      OwnDamageDiscountType:
        insuranceValueMappingData.IVMInsurancePolicyMappingID
          .OwnDamageDiscountType,
      OwnDamageDiscountValue:
        insuranceValueMappingData.IVMInsurancePolicyMappingID
          .OwnDamageDiscountValue,
      TPCoverPriceType:
        insuranceValueMappingData.IVMInsurancePolicyMappingID.TPCoverPriceType,
      TPCoverPriceValue:
        insuranceValueMappingData.IVMInsurancePolicyMappingID.TPCoverPriceValue,
      TPCoverDiscountType:
        insuranceValueMappingData.IVMInsurancePolicyMappingID
          .TPCoverDiscountType,
      TPCoverDiscountValue:
        insuranceValueMappingData.IVMInsurancePolicyMappingID
          .TPCoverDiscountValue,
      MappedAddOn: combinedData,
    };

    // Send the response data
    res.json(responseData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message:
          "Database error occurred while retrieving InsuranceValueMapping data.",
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
    console.error("Error retrieving InsuranceValueMapping data:", error);
    return res.status(500).json({
      message:
        "Failed to retrieve InsuranceValueMapping data. Please try again later.",
    });
  }
};

// Update a InsuranceValueMapping by the id in the request
exports.bulkUpdate = async (req, res) => {
  try {
    // If it's a bulk request, we can loop through the provided records
    if (Array.isArray(req.body)) {
      // Prepare an array of promises for bulk operations
      const bulkOperations = req.body.map(async (item) => {
        const existingRecord = await InsuranceValueMapping.findByPk(
          item.InsuranceValueMappingID
        );

        // If record exists, update it
        if (existingRecord) {
          return existingRecord.update(item);
        }
        // If record does not exist, create a new one
        else {
          return InsuranceValueMapping.create(item);
        }
      });

      // Wait for all bulk operations to complete
      const result = await Promise.all(bulkOperations);
      return res.status(200).json(result);
    }

    // If it's a single record update or create
    const insuranceValueMappingID = req.body.InsuranceValueMappingID;
    let insuranceValueMapping = await InsuranceValueMapping.findByPk(
      insuranceValueMappingID
    );

    // Check if InsuranceValueMapping exists
    if (!insuranceValueMapping) {
      // If it doesn't exist, create a new one
      const newRecord = await InsuranceValueMapping.create({
        InsurancePolicyMappingID: req.body.InsurancePolicyMappingID,
        InsuranceValueAddedID: req.body.InsuranceValueAddedID,
        PriceType: req.body.PriceType,
        PriceValue: req.body.PriceValue,
        DiscountType: req.body.DiscountType,
        DiscountValue: req.body.DiscountValue,
        IsActive: req.body.IsActive,
        Status: req.body.Status,
        CreatedDate: new Date(),
        ModifiedDate: new Date(),
      });

      return res.status(201).json(newRecord);
    }

    // Update fields for existing record
    insuranceValueMapping.InsurancePolicyMappingID =
      req.body.InsurancePolicyMappingID ||
      insuranceValueMapping.InsurancePolicyMappingID;
    insuranceValueMapping.InsuranceValueAddedID =
      req.body.InsuranceValueAddedID ||
      insuranceValueMapping.InsuranceValueAddedID;
    insuranceValueMapping.PriceType =
      req.body.PriceType || insuranceValueMapping.PriceType;
    insuranceValueMapping.PriceValue =
      req.body.PriceValue || insuranceValueMapping.PriceValue;
    insuranceValueMapping.DiscountType =
      req.body.DiscountType || insuranceValueMapping.DiscountType;
    insuranceValueMapping.DiscountValue =
      req.body.DiscountValue || insuranceValueMapping.DiscountValue;
    insuranceValueMapping.IsActive =
      req.body.IsActive || insuranceValueMapping.IsActive;
    insuranceValueMapping.Status =
      req.body.Status || insuranceValueMapping.Status;
    insuranceValueMapping.ModifiedDate = new Date();

    // Save updated InsuranceValueMapping in the database
    const updatedInsuranceValueMapping = await insuranceValueMapping.save();

    // Send the updated InsuranceValueMapping as response
    return res.status(200).json(updatedInsuranceValueMapping);
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
          "Database error occurred while updating InsuranceValueMapping.",
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
    console.error("Error updating InsuranceValueMapping:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a InsuranceValueMapping with the specified id in the request
exports.deleteById = async (req, res) => {
  const id = req.params.id;

  try {
    // Find the model by ID
    const insuranceValueMapping = await InsuranceValueMapping.findByPk(id);

    // Check if the model exists
    if (!insuranceValueMapping) {
      return res
        .status(404)
        .json({ message: "InsuranceValueMapping not found with id: " + id });
    }

    // Delete the model
    await insuranceValueMapping.destroy();

    // Send a success message
    return res.status(200).json({
      message: "InsuranceValueMapping with id: " + id + " deleted successfully",
    });
  } catch (err) {
    // Handle errors based on specific types
    if (err.name === "SequelizeForeignKeyConstraintError") {
      // Handle foreign key constraint errors
      return res.status(409).json({
        message:
          "Cannot delete. This InsuranceValueMapping is referenced by other records.",
        details: err.message,
      });
    }

    if (err.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message:
          "Database error occurred while deleting InsuranceValueMapping.",
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
    console.error("Error deleting InsuranceValueMapping:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
