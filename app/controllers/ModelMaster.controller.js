/* eslint-disable no-unused-vars */
require("dotenv").config(); // Load environment variables from .env file
const db = require("../models");
const ModelMaster = db.modelmaster;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;
const fs = require("fs");
const path = require("path");
const ModelType = db.modeltype;
const ChannelMaster = db.channelmaster;
const { validationResult } = require("express-validator");
const { configureMulter } = require("../Utils/multerService");
const { transferImageToServer } = require("../Utils/sshService");
const { generateModelMasterImgName } = require("../Utils/generateService");

// Configure Multer
const upload = configureMulter(
  // "C:/Users/varun/OneDrive/Desktop/uploads/", // Adjust the upload path as needed
  "/home/administrator/VARUNGROUP/IMAGES_VMS_MARUTI",
  // "C:\\Users\\itvsp\\Desktop\\Uploads",
  1000000, // File size limit (1MB)
  ["jpeg", "jpg", "png", "gif"], // Allowed file types
  "ModelImageURL"
);

// Basic CRUD API

// Create and Save a new ModelMaster
exports.create = async (req, res) => {
  // Handle file upload and other operations
  upload(req, res, async (err) => {
    if (err) {
      console.error("Error uploading file:", err);
      return res.status(400).json({ message: err.message });
    }

    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Validate ModelCode
      if (!/^[a-zA-Z0-9]*$/.test(req.body.ModelCode)) {
        console.error("Invalid ModelCode:", req.body.ModelCode);
        return res
          .status(400)
          .json({ message: "ModelCode can only contain letters and spaces" });
      }

      // Validate ModelDescription
      if (!/^[a-zA-Z0-9 ]*$/.test(req.body.ModelDescription)) {
        console.error("Invalid ModelDescription:", req.body.ModelDescription);
        return res.status(400).json({
          message:
            "ModelDescription can only contain letters, numbers, and spaces",
        });
      }

      // Check if ModelTypeID is provided
      if (!req.body.ModelTypeID) {
        console.error("ModelTypeID is empty");
        return res.status(400).json({ message: "ModelTypeID cannot be empty" });
      }

      // Check if ChannelID is provided
      if (!req.body.ChannelID) {
        console.error("ChannelID is empty");
        return res.status(400).json({ message: "ChannelID cannot be empty" });
      }

      // Check if ModelCode already exists
      const existingModel = await ModelMaster.findOne({
        where: { ModelCode: req.body.ModelCode },
      });

      if (existingModel) {
        console.error("ModelCode already exists");
        return res.status(400).json({ message: "ModelCode already exists" });
      }

      // Ensure req.file exists
      if (!req.file) {
        console.error("No file uploaded");
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Prepare data for model creation
      const localFilePath = req.file.path;
      const modelCode = req.body.ModelCode.toUpperCase();
      const modelDescription = req.body.ModelDescription.toUpperCase();
      const remoteFilePath =
        process.env.Model_Master_Images_PATH +
        generateModelMasterImgName(req.file, modelCode, modelDescription);

      // Upload file to server via SSH
      const sshConfig = {
        host: process.env.SSH_HOST,
        port: process.env.SSH_PORT,
        username: process.env.SSH_USERNAME,
        privateKeyPath: process.env.SSH_PRIVATE_KEY_PATH,
      };

      await transferImageToServer(
        localFilePath,
        remoteFilePath,
        sshConfig,
        "upload"
      );

      // Save new ModelMaster in the database
      const newModelMaster = await ModelMaster.create({
        ModelCode: modelCode,
        ModelDescription: modelDescription,
        ModelTypeID: req.body.ModelTypeID,
        ChannelID: req.body.ChannelID,
        ModelImageURL: remoteFilePath,
        IsActive: req.body.IsActive || true,
        Status: req.body.Status || "Active",
      });

      console.log("Model created:", newModelMaster);

      return res.status(201).json(newModelMaster); // Send newly created model as response
    } catch (err) {
      // Handle specific error types
      if (
        err.name === "SequelizeValidationError" ||
        err.name === "SequelizeUniqueConstraintError"
      ) {
        return res.status(400).json({
          message: "Validation error",
          details: err.errors.map((e) => e.message),
        });
      }

      if (err.name === "SequelizeDatabaseError") {
        return res
          .status(500)
          .json({ message: "Database error", details: err.message });
      }

      if (err.name === "SequelizeConnectionError") {
        return res
          .status(503)
          .json({ message: "Service unavailable", details: err.message });
      }

      console.error("Error creating model:", err);
      return res.status(500).json({ message: "Internal server error" });
    } finally {
      // Clean up temporary file after processing
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    }
  });
};

// Retrieve all ModelMasters from the database.
exports.findAll = async (req, res) => {
  try {
    // Fetch model data with included associations
    const modelData = await ModelMaster.findAll({
      attributes: [
        "ModelMasterID",
        "ModelCode",
        "ModelDescription",
        "ModelTypeID",
        "ChannelID",
        "ModelImageURL",
        "IsActive",
        "Status",
      ],
      include: [
        {
          model: ModelType, // Using the imported alias directly
          as: "MMModelTypeID", // Specify the alias for ModelType
          attributes: ["ModelTypeName"],
        },
        {
          model: ChannelMaster, // Using the imported alias directly
          as: "MMChannelID", // Specify the alias for ChannelMaster
          attributes: ["ChannelName"],
        },
      ],
      order: [
        ["CreatedDate", "DESC"], // Order by CreatedDate in decending order
      ],
    });

    // Check if data is empty
    if (!modelData || modelData.length === 0) {
      return res.status(404).json({
        message: "No model data found.",
      });
    }

    // Map the data for response
    const combinedData = modelData.map((item) => ({
      ModelMasterID: item.ModelMasterID,
      ModelCode: item.ModelCode,
      ModelDescription: item.ModelDescription,
      ModelTypeID: item.ModelTypeID,
      ModelTypeName: item.MMModelTypeID
        ? item.MMModelTypeID.ModelTypeName
        : null,
      ChannelID: item.ChannelID,
      ChannelName: item.MMChannelID ? item.MMChannelID.ChannelName : null,
      ModelImageURL: item.ModelImageURL,
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
        message: "Database error occurred while retrieving model name data.",
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
    console.error("Error retrieving model data:", error);
    res.status(500).json({
      message: "Failed to retrieve model data. Please try again later.",
    });
  }
};

// Find a single ModelMaster with an id
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;

    // Fetch the model data by primary key with included associations
    const modelData = await ModelMaster.findOne({
      where: {
        ModelMasterID: id,
      },
      attributes: [
        "ModelMasterID",
        "ModelCode",
        "ModelDescription",
        "ModelTypeID",
        "ChannelID",
        "ModelImageURL",
        "IsActive",
        "Status",
      ],
      include: [
        {
          model: ModelType,
          as: "MMModelTypeID",
          attributes: ["ModelTypeName"],
        },
        {
          model: ChannelMaster,
          as: "MMChannelID",
          attributes: ["ChannelName"],
        },
      ],
    });

    // Check if data is found
    if (!modelData) {
      return res.status(404).json({
        message: "Model data not found.",
      });
    }

    // Prepare the response data
    const responseData = {
      ModelMasterID: modelData.ModelMasterID,
      ModelCode: modelData.ModelCode,
      ModelDescription: modelData.ModelDescription,
      ModelTypeID: modelData.ModelTypeID,
      ModelTypeName: modelData.MMModelTypeID
        ? modelData.MMModelTypeID.ModelTypeName
        : null,
      ChannelID: modelData.ChannelID,
      ChannelName: modelData.MMChannelID
        ? modelData.MMChannelID.ChannelName
        : null,
      ModelImageURL: modelData.ModelImageURL,
      IsActive: modelData.IsActive,
      Status: modelData.Status,
    };

    // Send the response data
    res.json(responseData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while retrieving model data.",
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
    console.error("Error retrieving model data:", error);
    res.status(500).json({
      message: "Failed to retrieve model data. Please try again later.",
    });
  }
};

// Update a ModelMaster by the id in the request
// API endpoint to update model by primary key
exports.updateByPk = async (req, res) => {
  // Handle file upload first
  upload(req, res, async (err) => {
    if (err) {
      console.error("Error uploading file:", err);
      return res.status(400).json({ message: err.message });
    }

    // Check for validation errors from express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const modelId = req.params.id;
      let modelmaster = await ModelMaster.findByPk(modelId);

      if (!modelmaster) {
        return res.status(404).json({ message: "ModelMaster not found" });
      }

      // Update model details based on request body
      modelmaster.ModelCode = req.body.ModelCode
        ? req.body.ModelCode.toUpperCase()
        : modelmaster.ModelCode;
      modelmaster.ModelDescription = req.body.ModelDescription
        ? req.body.ModelDescription.toUpperCase()
        : modelmaster.ModelDescription;
      modelmaster.ModelTypeID = req.body.ModelTypeID
        ? req.body.ModelTypeID
        : modelmaster.ModelTypeID;
      modelmaster.ChannelID = req.body.ChannelID
        ? req.body.ChannelID
        : modelmaster.ChannelID;
      modelmaster.IsActive =
        req.body.IsActive !== undefined
          ? req.body.IsActive
          : modelmaster.IsActive;
      modelmaster.ModifiedDate = new Date();

      // Set Status field based on IsActive
      modelmaster.Status = req.body.Status
        ? req.body.Status
        : modelmaster.Status;
      modelmaster.ModifiedDate = new Date();

      // Handle file upload
      if (req.file) {
        const localFilePath = req.file.path;
        const modelCode = req.body.ModelCode
          ? req.body.ModelCode.toUpperCase()
          : modelmaster.ModelCode;
        const modelDescription = req.body.ModelDescription
          ? req.body.ModelDescription.toUpperCase()
          : modelmaster.ModelDescription;

        // Generate remote filename
        const remoteFilename = generateModelMasterImgName(
          req.file,
          modelCode,
          modelDescription
        );
        const remoteFilePath = path.join(
          process.env.Model_Master_Images_PATH,
          remoteFilename
        );

        const sshConfig = {
          host: process.env.SSH_HOST,
          port: process.env.SSH_PORT,
          username: process.env.SSH_USERNAME,
          privateKeyPath: process.env.SSH_PRIVATE_KEY_PATH,
        };

        try {
          // Upload the new image
          await transferImageToServer(
            localFilePath,
            remoteFilePath,
            sshConfig,
            "upload"
          );

          // Remove previous file if it exists and is different
          if (remoteFilePath !== modelmaster.ModelImageURL) {
            await transferImageToServer(
              modelmaster.ModelImageURL,
              modelmaster.ModelImageURL,
              sshConfig,
              "remove"
            ).catch((err) => {
              console.error("Error removing file:", err);
            });
          }

          // Update ModelImageURL with the new file path
          modelmaster.ModelImageURL = remoteFilePath;
        } catch (uploadError) {
          console.error("Error uploading file:", uploadError);
          return res.status(500).json({ message: "Error uploading file" });
        }
      }

      // Save updated ModelMaster in the database
      const updatedModelMaster = await modelmaster.save();

      return res.status(200).json(updatedModelMaster); // Send the updated modelmaster as response
    } catch (err) {
      console.error("Error updating modelmaster:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
};

// Delete a ModelMaster with the specified id in the request
exports.deleteById = async (req, res) => {
  const id = req.params.id;

  try {
    // Find the model by ID
    const modelMaster = await ModelMaster.findByPk(id);

    // Check if the model exists
    if (!modelMaster) {
      return res
        .status(404)
        .json({ message: "ModelMaster not found with id: " + id });
    }
    const sshConfig = {
      host: process.env.SSH_HOST,
      port: process.env.SSH_PORT,
      username: process.env.SSH_USERNAME,
      privateKeyPath: process.env.SSH_PRIVATE_KEY_PATH,
    };

    // Check if ModelImageURL exists and is not null
    if (modelMaster.ModelImageURL) {
      // Remove the image from the remote server first
      await transferImageToServer(
        modelMaster.ModelImageURL,
        modelMaster.ModelImageURL, // Use ModelImageURL as the remote file path
        sshConfig,
        "remove"
      );
    }

    // Check if the file exists locally and delete it
    if (modelMaster.ModelImageURL && fs.existsSync(modelMaster.ModelImageURL)) {
      fs.unlinkSync(modelMaster.ModelImageURL);
    }

    // Delete the model from the database
    await modelMaster.destroy();

    // Send a success message
    res.status(200).json({
      message: "ModelMaster with id: " + id + " deleted successfully",
    });
  } catch (err) {
    // Handle errors based on specific types
    if (err.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while deleting ModelMaster.",
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
    console.error("Error deleting ModelMaster:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
