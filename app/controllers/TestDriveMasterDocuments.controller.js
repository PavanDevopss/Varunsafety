/* eslint-disable no-unused-vars */
require("dotenv").config(); // Load environment variables from .env file
const db = require("../models");
const TestDriveMasterDocuments = db.testdrivemasterdocuments;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;
const fs = require("fs");
const path = require("path");
const DocumentTypes = db.documenttypes;
const TestDriveMaster = db.testdrivemaster;
const { validationResult } = require("express-validator");
const { configureMulter } = require("../Utils/multerService");
const { transferImageToServer } = require("../Utils/sshService");
const { genDocNameforDriveMaster } = require("../Utils/generateService");

// Configure Multer
const upload = configureMulter(
  // "C:/Users/varun/OneDrive/Desktop/uploads/", // Adjust the upload path as needed
  "/home/administrator/VARUNGROUP/IMAGES_VMS_MARUTI",
  //   "C:\\Users\\itvsp\\Desktop\\Uploads",
  1000000, // File size limit (1MB)
  ["jpeg", "jpg", "png", "gif"], // Allowed file types
  "DocURL"
);

// Basic CRUD API

// Create and Save a new TestDriveMasterDocuments
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

      // Check if CustomerID and DocTypeID are provided
      const { TestDriveMasterID, DocTypeID } = req.body;
      if (!TestDriveMasterID) {
        console.error("TestDriveMasterID is empty");
        return res
          .status(400)
          .json({ message: "TestDriveMasterID cannot be empty" });
      }
      if (!DocTypeID) {
        console.error("DocTypeID is empty");
        return res.status(400).json({ message: "DocTypeID cannot be empty" });
      }

      // Ensure req.file exists
      if (!req.file) {
        console.error("No file uploaded");
        return res.status(400).json({ message: "No file uploaded" });
      }

      const genName = await genDocNameforDriveMaster(
        req.file,
        TestDriveMasterID,
        DocTypeID
      );

      console.log("genName: ", genName);

      // Prepare data for document creation
      const localFilePath = req.file.path;
      const remoteFilePath =
        process.env.Test_Drive_Master_Documents_PATH + genName;
      console.log("remoteFilePath", remoteFilePath);

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

      // Save new testDriveMasterDocument in the database
      const newTestDriveMasterDocuments = await TestDriveMasterDocuments.create(
        {
          TestDriveMasterID: req.body.TestDriveMasterID,
          DocTypeID: req.body.DocTypeID,
          DocURL: remoteFilePath,
          IsActive: req.body.isActive !== undefined ? req.body.isActive : true,
          Status: req.body.isActive === undefined ? "Active" : "InActive",
        }
      );

      console.log("Document created:", newTestDriveMasterDocuments);

      return res.status(201).json(newTestDriveMasterDocuments); // Send newly created document as response
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

      console.error("Error creating document:", err);
      return res.status(500).json({ message: "Internal server error" });
    } finally {
      // Clean up temporary file after processing
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    }
  });
};

// Retrieve all TestDriveMasterDocuments from the database.
exports.findAll = async (req, res) => {
  try {
    // Fetch TestDriveMasterDocuments data with included associations
    const documentData = await TestDriveMasterDocuments.findAll({
      attributes: [
        "TestDriveMasterDocumentID",
        "TestDriveMasterID",
        "DocTypeID",
        "DocURL",
        "IsActive",
        "Status",
      ],
      include: [
        {
          model: DocumentTypes, // Using the imported alias directly
          as: "TDMDDocTypeID", // Specify the alias for DocumentTypes
          attributes: ["DocumentAs", "Doctype"],
        },
      ],
      order: [["CreatedDate", "DESC"]],
    });

    // Check if data is empty
    if (!documentData || documentData.length === 0) {
      return res.status(404).json({
        message: "No document data found.",
      });
    }

    // Map the data for response
    const combinedData = documentData.map((item) => ({
      TestDriveMasterDocumentID: item.TestDriveMasterDocumentID,
      TestDriveMasterID: item.TestDriveMasterID,
      DocTypeID: item.DocTypeID,
      DocumentAs: item.TDMDDocTypeID ? item.TDMDDocTypeID.DocumentAs : null,
      Doctype: item.TDMDDocTypeID ? item.TDMDDocTypeID.Doctype : null,
      DocURL: item.DocURL,
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
        message: "Database error occurred while retrieving document data.",
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
    console.error("Error retrieving document data:", error);
    res.status(500).json({
      message: "Failed to retrieve document data. Please try again later.",
    });
  }
};

// Find a single TestDriveMasterDocuments with an id
exports.findOne = async (req, res) => {
  try {
    const { TestDriveMasterID } = req.query; // Get TestDriveMasterID from query params

    // Validate TestDriveMasterID
    if (!TestDriveMasterID) {
      return res.status(400).json({
        message: "TestDriveMasterID is required in the query parameters.",
      });
    }

    // Fetch TestDriveMasterDocuments data where TestDriveMasterID matches
    const documentData = await TestDriveMasterDocuments.findOne({
      where: {
        TestDriveMasterID: TestDriveMasterID, // Match the TestDriveMasterID
      },
      attributes: [
        "TestDriveMasterDocumentID",
        "TestDriveMasterID",
        "DocTypeID",
        "DocURL",
        "IsActive",
        "Status",
      ],
      include: [
        {
          model: DocumentTypes,
          as: "TDMDDocTypeID", // Specify the alias for DocumentTypes
          attributes: ["DocumentAs", "Doctype"],
        },
        {
          model: TestDriveMaster,
          as: "TDMDTestDriveMasterID", // Specify the alias for TestDriveMaster
          attributes: [
            "TestDriveMasterID",
            "BranchID",
            "VehicleRegNo",
            "ModelMasterID",
            "ModelDescription",
            "VariantID",
            "FuelTypeID",
            "KeyNumber",
            "TransmissionID",
            "ColourID",
            "ColourDescription",
            "ChassisNumber",
            "EngineNumber",
            "InsuranceID",
            "ValidFrom",
            "ValidTo",
            "PollutionValidFrom",
            "PollutionValidTo",
            "IsActive",
            "Status",
          ],
        },
      ],
    });

    // Check if data is found
    if (!documentData) {
      return res.status(404).json({
        message: "Document data not found for the provided TestDriveMasterID.",
      });
    }

    // Prepare the response data, including all mapped fields from TestDriveMaster
    const responseData = {
      TestDriveMasterDocumentID: documentData.TestDriveMasterDocumentID,
      TestDriveMasterID: documentData.TestDriveMasterID,
      DocTypeID: documentData.DocTypeID,
      DocumentAs: documentData.TDMDDocTypeID
        ? documentData.TDMDDocTypeID.DocumentAs
        : null,
      Doctype: documentData.TDMDDocTypeID
        ? documentData.TDMDDocTypeID.Doctype
        : null,
      DocURL: documentData.DocURL,
      IsActive: documentData.IsActive,
      Status: documentData.Status,
      TestDriveMasterDetails: {
        TestDriveMasterID:
          documentData.TDMDTestDriveMasterID?.TestDriveMasterID || null,
        BranchID: documentData.TDMDTestDriveMasterID?.BranchID || null,
        VehicleRegNo: documentData.TDMDTestDriveMasterID?.VehicleRegNo || null,
        ModelMasterID:
          documentData.TDMDTestDriveMasterID?.ModelMasterID || null,
        ModelDescription:
          documentData.TDMDTestDriveMasterID?.ModelDescription || null,
        VariantID: documentData.TDMDTestDriveMasterID?.VariantID || null,
        FuelTypeID: documentData.TDMDTestDriveMasterID?.FuelTypeID || null,
        KeyNumber: documentData.TDMDTestDriveMasterID?.KeyNumber || null,
        TransmissionID:
          documentData.TDMDTestDriveMasterID?.TransmissionID || null,
        ColourID: documentData.TDMDTestDriveMasterID?.ColourID || null,
        ColourDescription:
          documentData.TDMDTestDriveMasterID?.ColourDescription || null,
        ChassisNumber:
          documentData.TDMDTestDriveMasterID?.ChassisNumber || null,
        EngineNumber: documentData.TDMDTestDriveMasterID?.EngineNumber || null,
        InsuranceID: documentData.TDMDTestDriveMasterID?.InsuranceID || null,
        ValidFrom: documentData.TDMDTestDriveMasterID?.ValidFrom || null,
        ValidTo: documentData.TDMDTestDriveMasterID?.ValidTo || null,
        PollutionValidFrom:
          documentData.TDMDTestDriveMasterID?.PollutionValidFrom || null,
        PollutionValidTo:
          documentData.TDMDTestDriveMasterID?.PollutionValidTo || null,
        IsActive: documentData.TDMDTestDriveMasterID?.IsActive || null,
        Status: documentData.TDMDTestDriveMasterID?.Status || null,
      },
    };

    // Send the response data
    res.json(responseData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while retrieving document data.",
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
    console.error("Error retrieving document data:", error);
    res.status(500).json({
      message: "Failed to retrieve document data. Please try again later.",
    });
  }
};

// Update a TestDriveMasterDocuments by the id in the request
// API endpoint to update model by primary key
exports.updateById = async (req, res) => {
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

      const testDriveMasterDocumentID = req.params.id;

      // Fetch the document record
      let testDriveMasterDocument = await TestDriveMasterDocuments.findByPk(
        testDriveMasterDocumentID
      );
      if (!testDriveMasterDocument) {
        return res
          .status(404)
          .json({ message: "TestDriveMasterDocuments not found" });
      }

      // Check for required fields
      const { TestDriveMasterID, DocTypeID, isActive } = req.body;

      if (req.file && !DocTypeID) {
        return res
          .status(400)
          .json({ message: "DocTypeID is required when uploading a file." });
      }

      if (req.file) {
        // Generate the new document name
        const genName = await genDocNameforDriveMaster(
          req.file,
          TestDriveMasterID,
          DocTypeID
        );
        if (genName.error) {
          return res.status(400).json({ message: genName.error });
        }

        const localFilePath = req.file.path;
        const remoteFilePath = path.join(
          process.env.Test_Drive_Master_Documents_PATH,
          genName
        );

        // Upload new file to the server via SSH
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

        // Check if the old file path exists before attempting to remove it
        if (
          testDriveMasterDocument.DocURL &&
          testDriveMasterDocument.DocURL !== remoteFilePath
        ) {
          // Remove old file from the server if the URL has changed
          await transferImageToServer(
            testDriveMasterDocument.DocURL,
            null,
            sshConfig,
            "remove"
          ).catch((err) => {
            console.error("Error removing old file:", err);
          });
        }

        // Update the document URL
        testDriveMasterDocument.DocURL = remoteFilePath;
      }

      // Update other fields
      testDriveMasterDocument.TestDriveMasterID =
        TestDriveMasterID || testDriveMasterDocument.TestDriveMasterID;
      testDriveMasterDocument.DocTypeID =
        DocTypeID || testDriveMasterDocument.DocTypeID;
      testDriveMasterDocument.IsActive =
        isActive !== undefined ? isActive : testDriveMasterDocument.IsActive;
      testDriveMasterDocument.Status =
        isActive === undefined || isActive ? "Active" : "InActive";
      testDriveMasterDocument.ModifiedDate = new Date();

      // Save updated document record
      const updatedDocument = await testDriveMasterDocument.save();
      return res.status(200).json(updatedDocument);
    } catch (err) {
      console.error("Error updating TestDriveMasterDocuments:", err);

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

      return res.status(500).json({ message: "Internal server error" });
    } finally {
      // Clean up temporary file after processing
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    }
  });
};

// Delete a TestDriveMasterDocuments with the specified id in the request
exports.deleteById = async (req, res) => {
  const id = req.params.id;

  try {
    // Find the document by ID
    const documentData = await TestDriveMasterDocuments.findByPk(id);

    // Check if the document exists
    if (!documentData) {
      return res
        .status(404)
        .json({ message: "TestDriveMasterDocuments not found with id: " + id });
    }
    console.log("retriced data:", documentData);
    console.log("retriced doc url:", documentData.DocURL);
    const path = documentData.DocURL;
    const sshConfig = {
      host: process.env.SSH_HOST,
      port: process.env.SSH_PORT,
      username: process.env.SSH_USERNAME,
      privateKeyPath: process.env.SSH_PRIVATE_KEY_PATH,
    };

    // Check if DocURL exists and is not null
    if (path) {
      // Remove the image from the remote server first
      await transferImageToServer(
        path,
        path, // Use DocURL as the remote file path
        sshConfig,
        "remove"
      );

      console.log("file removed successfully.");
    }

    // Check if the file exists locally and delete it
    if (documentData.DocURL && fs.existsSync(documentData.DocURL)) {
      fs.unlinkSync(documentData.DocURL);
    }

    // Delete the document from the database
    await documentData.destroy();

    // Send a success message
    res.status(200).json({
      message:
        "TestDriveMasterDocuments with id: " + id + " deleted successfully",
    });
  } catch (err) {
    // Handle errors based on specific types
    if (err.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message:
          "Database error occurred while deleting TestDriveMasterDocuments.",
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
