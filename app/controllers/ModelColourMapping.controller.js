/* eslint-disable no-unused-vars */
const db = require("../models");
const ModelColourMapping = db.modelcolourmapping;
const ModelMaster = db.modelmaster;
const VariantMaster = db.variantmaster;
const ColourMaster = db.colourmaster;
const Op = db.Sequelize.Op;

exports.create = async (req, res) => {
  try {
    const variantIDs = req.body.VariantID;
    const colourIDs = req.body.ColourID;

    if (!Array.isArray(variantIDs) || variantIDs.length === 0) {
      return res
        .status(400)
        .json({ message: "VariantID should be a non-empty array" });
    }

    if (!Array.isArray(colourIDs) || colourIDs.length === 0) {
      return res
        .status(400)
        .json({ message: "ColourID should be a non-empty array" });
    }

    const variantMapping = [];

    variantIDs.forEach((variantID) => {
      colourIDs.forEach((colourID) => {
        variantMapping.push({
          ModelMasterID: req.body.ModelMasterID,
          VariantID: variantID,
          ColourID: colourID,
          Status: req.body.Status || "Active",
          IsActive: req.body.IsActive !== undefined ? req.body.IsActive : true,
        });
      });
    });

    // Check for existing duplicate combinations in the database
    const existingMappings = await ModelColourMapping.findAll({
      where: {
        [Op.or]: variantMapping.map((entry) => ({
          ModelMasterID: entry.ModelMasterID,
          VariantID: entry.VariantID,
          ColourID: entry.ColourID,
        })),
      },
    });

    const existingCombinations = new Set(
      existingMappings.map(
        (mapping) =>
          `${mapping.ModelMasterID}-${mapping.VariantID}-${mapping.ColourID}`
      )
    );

    // Filter out duplicates
    const newMappings = variantMapping.filter(
      (entry) =>
        !existingCombinations.has(
          `${entry.ModelMasterID}-${entry.VariantID}-${entry.ColourID}`
        )
    );

    if (newMappings.length === 0) {
      return res.status(400).json({
        message: "All provided combinations already exist.",
      });
    }

    // Save all new mappings
    const createdMappings = await ModelColourMapping.bulkCreate(newMappings, {
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

    console.error("Error creating ModelColourMapping:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.findAll = async (req, res) => {
  try {
    // Fetch all Variant mappings from the database
    const variantMappings = await ModelColourMapping.findAll({
      attributes: [
        "ModelColourMappingID",
        "ModelMasterID",
        "VariantID",
        "ColourID",
        "Status",
        "IsActive",
      ],
      include: [
        {
          model: ModelMaster,
          as: "MCMModelMasterID",
          attributes: ["ModelCode", "ModelDescription"],
        },
        {
          model: VariantMaster,
          as: "MCMVariantID",
          attributes: ["VariantCode"],
        },
        {
          model: ColourMaster,
          as: "MCMColourID",
          attributes: ["ColourCode", "ColourDescription"],
        },
      ],
      order: [["CreatedDate", "DESC"]], // Optional: order by creation date
    });

    // Check if any records were found
    if (!variantMappings || variantMappings.length === 0) {
      return res.status(404).json({
        message: "No model colour mappings found.",
      });
    }
    // Map the data for response
    const combinedData = variantMappings.map((item) => ({
      ModelColourMappingID: item.ModelColourMappingID,
      ModelMasterID: item.ModelMasterID,
      VariantID: item.VariantID,
      ColourID: item.ColourID,
      ModelCode: item.MCMModelMasterID ? item.MCMModelMasterID.ModelCode : null,
      ModelDescription: item.MCMModelMasterID
        ? item.MCMModelMasterID.ModelDescription
        : null,
      VariantCode: item.MCMVariantID ? item.MCMVariantID.VariantCode : null,
      ColourCode: item.MCMColourID ? item.MCMColourID.ColourCode : null,
      ColourDescription: item.MCMColourID
        ? item.MCMColourID.ColourDescription
        : null,
      IsActive: item.IsActive,
      Status: item.Status,
    }));
    // Send the fetched model colour mappings as a response
    return res.status(200).json(combinedData);
  } catch (err) {
    // Handle possible errors
    if (err.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message:
          "Database error occurred while fetching model colour mappings.",
        details: err.message,
      });
    }

    console.error("Error fetching model colour mappings:", err);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
exports.findOne = async (req, res) => {
  try {
    // Extract the VariantMappingID from the request parameters
    const modelColourMappingID = req.params.ModelColourMappingID;

    // Fetch the Variant mapping by ID from the database
    const modelColourMapping = await ModelColourMapping.findOne({
      where: { ModelColourMappingID: modelColourMappingID },
      attributes: [
        "ModelColourMappingID",
        "ModelMasterID",
        "VariantID",
        "ColourID",
        "Status",
        "IsActive",
      ],
      include: [
        {
          model: ModelMaster,
          as: "MCMModelMasterID",
          attributes: ["ModelCode", "ModelDescription"],
        },
        {
          model: VariantMaster,
          as: "MCMVariantID",
          attributes: ["VariantCode"],
        },
        {
          model: ColourMaster,
          as: "MCMColourID",
          attributes: ["ColourCode", "ColourDescription"],
        },
      ],
    });

    // Check if the record was found
    if (!modelColourMapping) {
      return res.status(404).json({
        message: "model colour mapping not found.",
      });
    }
    const responseData = {
      ModelColourMappingID: modelColourMapping.ModelColourMappingID,
      ModelMasterID: modelColourMapping.ModelMasterID,
      VariantID: modelColourMapping.VariantID,
      ColourID: modelColourMapping.ColourID,
      ModelCode: modelColourMapping.MCMModelMasterID
        ? modelColourMapping.MCMModelMasterID.ModelCode
        : null, // Updated to use divisionMaster
      ModelDescription: modelColourMapping.MCMModelMasterID
        ? modelColourMapping.MCMModelMasterID.ModelDescription
        : null,
      VariantCode: modelColourMapping.MCMVariantID
        ? modelColourMapping.MCMVariantID.VariantCode
        : null,
      ColourCode: modelColourMapping.MCMColourID
        ? modelColourMapping.MCMColourID.ColourCode
        : null,
      ColourDescription: modelColourMapping.MCMColourID
        ? modelColourMapping.MCMColourID.ColourDescription
        : null,
      IsActive: modelColourMapping.IsActive,
      Status: modelColourMapping.Status,
    };
    // Send the fetched variant mapping as a response
    return res.status(200).json(responseData);
  } catch (err) {
    // Handle possible errors
    if (err.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message:
          "Database error occurred while fetching the model colour mapping.",
        details: err.message,
      });
    }

    console.error("Error fetching variant mapping:", err);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
exports.updateByPk = async (req, res) => {
  try {
    // Extract the modelColourMapping from the request parameters
    const modelColourMapping = req.params.ModelColourMappingID;
    const { ModelMasterID, VariantID, ColourID } = req.body;
    // Check if modelColourMapping is provided
    if (!modelColourMapping) {
      return res
        .status(400)
        .json({ message: "modelColourMapping is required." });
    }
    if (!ModelMasterID) {
      return res.status(400).json({ message: "ModelMasterID is required." });
    }
    if (!VariantID) {
      return res.status(400).json({ message: "VariantID is required." });
    }
    if (!ColourID) {
      return res.status(400).json({ message: "ColourID is required." });
    }
    // Check if the request body has values to update
    const updateData = {
      ModelMasterID: req.body.ModelMasterID,
      VariantID: req.body.VariantID,
      ColourID: req.body.ColourID,
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
    const variantMapping = await ModelColourMapping.findOne({
      where: { ModelColourMappingID: modelColourMapping },
    });

    // If the variant mapping is not found, return a 404 response
    if (!variantMapping) {
      return res.status(404).json({ message: "Variant mapping not found." });
    }

    // Perform the update on the found record
    await ModelColourMapping.update(updateData, {
      where: { ModelColourMappingID: modelColourMapping },
    });

    // Send a success response after updating
    return res
      .status(200)
      .json({ message: "Model Colour mapping updated successfully." });
  } catch (err) {
    // Handle possible errors
    if (err.name === "SequelizeValidationError") {
      return res.status(400).json({
        message: "Validation error",
        details: err.errors.map((e) => e.message),
      });
    }

    console.error("Error updating model colur mapping:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteById = async (req, res) => {
  try {
    // Extract the modelColourMapping from the request parameters
    const modelColourMappingID = req.params.ModelColourMappingID;

    // Check if modelColourMapping is provided
    if (!modelColourMappingID) {
      return res
        .status(400)
        .json({ message: "ModelColourMappingID is required." });
    }

    // Find the model colour mapping by ID to check if it exists
    const modelColourMapping = await ModelColourMapping.findOne({
      where: { ModelColourMappingID: modelColourMappingID },
    });

    // If the model colour mapping is not found, return a 404 response
    if (!modelColourMapping) {
      return res
        .status(404)
        .json({ message: "Model Colour Mapping not found." });
    }

    // Delete the model colour mapping
    await ModelColourMapping.destroy({
      where: { ModelColourMappingID: modelColourMappingID },
    });

    // Send a success response after deletion
    return res
      .status(200)
      .json({ message: "model colour mapping deleted successfully." });
  } catch (err) {
    // Handle possible errors
    console.error("Error deleting model colour mapping:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
