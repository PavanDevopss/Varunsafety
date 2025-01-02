/* eslint-disable no-unused-vars */
const db = require("../models");
const VariantMapping = db.variantmapping;
const ModelMaster = db.modelmaster;
const VariantMaster = db.variantmaster;
const Op = db.Sequelize.Op;

exports.create = async (req, res) => {
  try {
    const variantIDs = req.body.VariantID;

    if (!Array.isArray(variantIDs) || variantIDs.length === 0) {
      return res
        .status(400)
        .json({ message: "VariantID should be a non-empty array" });
    }

    const variantMapping = variantIDs.map((variantID) => ({
      ModelMasterID: req.body.ModelMasterID,
      VariantID: variantID,
      Status: req.body.Status || "Active",
      IsActive: req.body.IsActive !== undefined ? req.body.IsActive : true,
    }));

    // Check for duplicates in the database
    const existingMappings = await VariantMapping.findAll({
      where: {
        [Op.or]: variantMapping.map((entry) => ({
          ModelMasterID: entry.ModelMasterID,
          VariantID: entry.VariantID,
        })),
      },
    });

    const existingCombinations = new Set(
      existingMappings.map(
        (mapping) => `${mapping.ModelMasterID}-${mapping.VariantID}`
      )
    );

    // Filter out duplicate combinations
    const newMappings = variantMapping.filter(
      (entry) =>
        !existingCombinations.has(`${entry.ModelMasterID}-${entry.VariantID}`)
    );

    if (newMappings.length === 0) {
      return res.status(400).json({
        message: "All provided combinations already exist.",
      });
    }

    // Save only new entries in the database
    const createdMappings = await VariantMapping.bulkCreate(newMappings, {
      validate: true,
    });

    return res.status(200).json({
      message: "Successfully created new mappings.",
      created: createdMappings,
    });
  } catch (err) {
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

    console.error("Error creating VariantMapping:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.findAll = async (req, res) => {
  try {
    // Fetch all Variant mappings from the database
    const variantMappings = await VariantMapping.findAll({
      attributes: [
        "VariantMappingID",
        "ModelMasterID",
        "VariantID",
        "Status",
        "IsActive",
      ],
      include: [
        {
          model: ModelMaster,
          as: "VMModelMasterID",
          attributes: ["ModelCode", "ModelDescription"],
        },
        {
          model: VariantMaster,
          as: "VMVariantID",
          attributes: ["VariantCode"],
        },
      ],
      order: [["CreatedDate", "DESC"]], // Optional: order by creation date
    });

    // Check if any records were found
    if (!variantMappings || variantMappings.length === 0) {
      return res.status(404).json({
        message: "No variant mappings found.",
      });
    }
    // Map the data for response
    const combinedData = variantMappings.map((item) => ({
      VariantMappingID: item.VariantMappingID,
      ModelMasterID: item.ModelMasterID,
      VariantID: item.VariantID,
      ModelCode: item.VMModelMasterID ? item.VMModelMasterID.ModelCode : null,
      ModelDescription: item.VMModelMasterID
        ? item.VMModelMasterID.ModelDescription
        : null,
      VariantCode: item.VMVariantID ? item.VMVariantID.VariantCode : null,
      IsActive: item.IsActive,
      Status: item.Status,
    }));
    // Send the fetched variant mappings as a response
    return res.status(200).json(combinedData);
  } catch (err) {
    // Handle possible errors
    if (err.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message: "Database error occurred while fetching variant mappings.",
        details: err.message,
      });
    }

    console.error("Error fetching variant mappings:", err);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
exports.findOne = async (req, res) => {
  try {
    // Extract the VariantMappingID from the request parameters
    const variantMappingID = req.params.VariantMappingID;

    // Fetch the Variant mapping by ID from the database
    const variantMapping = await VariantMapping.findOne({
      where: { VariantMappingID: variantMappingID },
      attributes: [
        "VariantMappingID",
        "ModelMasterID",
        "VariantID",
        "Status",
        "IsActive",
      ],
      include: [
        {
          model: ModelMaster,
          as: "VMModelMasterID",
          attributes: ["ModelCode", "ModelDescription"],
        },
        {
          model: VariantMaster,
          as: "VMVariantID",
          attributes: ["VariantCode"],
        },
      ],
    });

    // Check if the record was found
    if (!variantMapping) {
      return res.status(404).json({
        message: "Variant mapping not found.",
      });
    }
    const responseData = {
      VariantMappingID: variantMapping.VariantMappingID,
      ModelMasterID: variantMapping.ModelMasterID,
      VariantID: variantMapping.VariantID,
      ColourID: variantMapping.ColourID,
      ModelCode: variantMapping.VMModelMasterID
        ? variantMapping.VMModelMasterID.ModelCode
        : null, // Updated to use divisionMaster
      ModelDescription: variantMapping.VMModelMasterID
        ? variantMapping.VMModelMasterID.ModelDescription
        : null,
      VariantCode: variantMapping.VMVariantID
        ? variantMapping.VMVariantID.VariantCode
        : null,
      IsActive: variantMapping.IsActive,
      Status: variantMapping.Status,
    };
    // Send the fetched variant mapping as a response
    return res.status(200).json(responseData);
  } catch (err) {
    // Handle possible errors
    if (err.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message: "Database error occurred while fetching the variant mapping.",
        details: err.message,
      });
    }

    console.error("Error fetching variant mapping:", err);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
exports.update = async (req, res) => {
  try {
    // Extract the VariantMappingID from the request parameters
    const variantMappingID = req.params.VariantMappingID;
    const { ModelMasterID, VariantID } = req.body;
    // Check if VariantMappingID is provided
    if (!variantMappingID) {
      return res.status(400).json({ message: "VariantMappingID is required." });
    }
    if (!ModelMasterID) {
      return res.status(400).json({ message: "ModelMasterID is required." });
    }
    if (!VariantID) {
      return res.status(400).json({ message: "VariantID is required." });
    }

    // Check if the request body has values to update
    const updateData = {
      ModelMasterID: req.body.ModelMasterID,
      VariantID: req.body.VariantID,
      Status: req.body.Status,
      IsActive: req.body.IsActive,
      ModifiedDate: new Date(),
    };

    // Ensure that at least one field is being updated
    if (Object.values(updateData).every((val) => val === undefined)) {
      return res.status(400).json({
        message: "No valid fields provided for update.",
      });
    }

    // Fetch the existing variant mapping by ID
    const variantMapping = await VariantMapping.findOne({
      where: { VariantMappingID: variantMappingID },
    });

    // If the variant mapping is not found, return a 404 response
    if (!variantMapping) {
      return res.status(404).json({ message: "Variant mapping not found." });
    }

    // Perform the update on the found record
    await VariantMapping.update(updateData, {
      where: { VariantMappingID: variantMappingID },
    });

    // Send a success response after updating
    return res
      .status(200)
      .json({ message: "Variant mapping updated successfully." });
  } catch (err) {
    // Handle possible errors
    if (err.name === "SequelizeValidationError") {
      return res.status(400).json({
        message: "Validation error",
        details: err.errors.map((e) => e.message),
      });
    }

    console.error("Error updating variant mapping:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.delete = async (req, res) => {
  try {
    // Extract the VariantMappingID from the request parameters
    const variantMappingID = req.params.VariantMappingID;

    // Check if VariantMappingID is provided
    if (!variantMappingID) {
      return res.status(400).json({ message: "VariantMappingID is required." });
    }

    // Find the variant mapping by ID to check if it exists
    const variantMapping = await VariantMapping.findOne({
      where: { VariantMappingID: variantMappingID },
    });

    // If the variant mapping is not found, return a 404 response
    if (!variantMapping) {
      return res.status(404).json({ message: "Variant mapping not found." });
    }

    // Delete the variant mapping
    await VariantMapping.destroy({
      where: { VariantMappingID: variantMappingID },
    });

    // Send a success response after deletion
    return res
      .status(200)
      .json({ message: "Variant mapping deleted successfully." });
  } catch (err) {
    // Handle possible errors
    console.error("Error deleting variant mapping:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
