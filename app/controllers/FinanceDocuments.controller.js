/* eslint-disable no-unused-vars */
require("dotenv").config(); // Load environment variables from .env file
const db = require("../models");
const FinanceDocuments = db.financedocuments;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;
const fs = require("fs");
const path = require("path");
const DocumentTypes = db.documenttypes;
const { validationResult } = require("express-validator");
const { configureMulter } = require("../Utils/multerService");
const { transferImageToServer } = require("../Utils/sshService");
const { genDocNameforFin } = require("../Utils/generateService");
const { genDocNameforFinLoan } = require("../Utils/generateService");
const { genDocNameforFinPayment } = require("../Utils/generateService");

// Configure Multer
const upload = configureMulter(
  // "C:/Users/varun/OneDrive/Desktop/uploads/", // Adjust the upload path as needed
  "/home/administrator/VARUNGROUP/IMAGES_VMS_MARUTI",
  // "C:\\Users\\itvsp\\Desktop\\Uploads",
  1000000, // File size limit (1MB)
  ["jpeg", "jpg", "png", "gif"], // Allowed file types
  "DocURL"
);

// Basic CRUD API

// Create and Save a new FinanceDocuments
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

      // Validate CustomerType
      if (!["Applicant", "CoApplicant"].includes(req.body.CustomerType)) {
        console.error("Invalid CustomerType:", req.body.CustomerType);
        return res.status(400).json({ message: "Invalid CustomerType" });
      }

      // Check if CustomerID and DocTypeID are provided
      const { CustomerID, CustomerType, DocTypeID } = req.body;
      if (!CustomerID) {
        console.error("CustomerID is empty");
        return res.status(400).json({ message: "CustomerID cannot be empty" });
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

      const genName = await genDocNameforFin(
        req.file,
        CustomerID,
        CustomerType,
        DocTypeID
      );

      console.log("genName: ", genName);

      // Prepare data for document creation
      const localFilePath = req.file.path;
      const remoteFilePath = process.env.Finance_Documents_PATH + genName;
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

      // Save new FinanceDocument in the database
      const newFinanceDocument = await FinanceDocuments.create({
        CustomerID: req.body.CustomerID,
        CustomerType: req.body.CustomerType,
        DocTypeID: req.body.DocTypeID,
        DocURL: remoteFilePath,
        Remarks: req.body.Remarks || null,
        DocStatus: "Approved",
        IsActive: req.body.isActive !== undefined ? req.body.isActive : true,
        Status: req.body.isActive === undefined ? "Active" : "InActive",
      });

      console.log("Document created:", newFinanceDocument);

      return res.status(201).json(newFinanceDocument); // Send newly created document as response
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

// Retrieve all FinanceDocuments from the database.
exports.findAll = async (req, res) => {
  try {
    // Fetch FinanceDocuments data with included associations
    const documentData = await FinanceDocuments.findAll({
      attributes: [
        "FinDocID",
        "CustomerID",
        "CustomerType",
        "DocTypeID",
        "DocURL",
        "Remarks",
        "DocStatus",
        "IsActive",
        "Status",
      ],
      include: [
        {
          model: DocumentTypes, // Using the imported alias directly
          as: "DocumentType", // Specify the alias for DocumentTypes
          attributes: ["DocumentAs", "Doctype"],
        },
      ],
      order: [
        ["FinDocID", "ASC"], // Order by FinDocID in ascending order
      ],
    });

    // Check if data is empty
    if (!documentData || documentData.length === 0) {
      return res.status(404).json({
        message: "No document data found.",
      });
    }

    // Map the data for response
    const combinedData = documentData.map((item) => ({
      FinDocID: item.FinDocID,
      CustomerID: item.CustomerID,
      CustomerType: item.CustomerType,
      DocTypeID: item.DocTypeID,
      DocumentAs: item.DocumentType ? item.DocumentType.DocumentAs : null,
      Doctype: item.DocumentType ? item.DocumentType.Doctype : null,
      DocURL: item.DocURL,
      Remarks: item.Remarks,
      DocStatus: item.DocStatus,
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

// Find a single FinanceDocuments with an id
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;

    // Fetch FinanceDocuments data by primary key with included associations
    const documentData = await FinanceDocuments.findOne({
      where: {
        FinDocID: id,
      },
      attributes: [
        "FinDocID",
        "CustomerID",
        "CustomerType",
        "DocTypeID",
        "DocURL",
        "Remarks",
        "DocStatus",
        "IsActive",
        "Status",
      ],
      include: [
        {
          model: DocumentTypes,
          as: "DocumentType", // Specify the alias for DocumentTypes
          attributes: ["DocumentAs", "Doctype"],
        },
      ],
    });

    // Check if data is found
    if (!documentData) {
      return res.status(404).json({
        message: "Document data not found.",
      });
    }

    // Prepare the response data
    const responseData = {
      FinDocID: documentData.FinDocID,
      CustomerID: documentData.CustomerID,
      CustomerType: documentData.CustomerType,
      DocTypeID: documentData.DocTypeID,
      DocumentAs: documentData.DocumentType
        ? documentData.DocumentType.DocumentAs
        : null,
      Doctype: documentData.DocumentType
        ? documentData.DocumentType.Doctype
        : null,
      DocURL: documentData.DocURL,
      Remarks: documentData.Remarks,
      DocStatus: documentData.DocStatus,
      IsActive: documentData.IsActive,
      Status: documentData.Status,
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

// Update a FinanceDocuments by the id in the request
// API endpoint to update model by primary key
exports.updateById = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error("Error uploading file:", err);
      return res.status(400).json({ message: err.message });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (req.file && !req.body.DocTypeID) {
      return res
        .status(400)
        .json({ message: "DocTypeID is required when uploading a file." });
    }

    try {
      const customerID = req.params.id;
      let financeDocument = await FinanceDocuments.findOne({
        where: { CustomerID: customerID },
        include: [
          {
            model: DocumentTypes,
            as: "DocumentType",
            attributes: ["DocumentAs"],
          },
        ],
      });

      if (!financeDocument) {
        return res.status(404).json({ message: "FinanceDocuments not found" });
      }

      financeDocument.CustomerID =
        req.body.CustomerID || financeDocument.CustomerID;
      financeDocument.CustomerType =
        req.body.CustomerType || financeDocument.CustomerType;
      financeDocument.DocTypeID =
        req.body.DocTypeID || financeDocument.DocTypeID;
      financeDocument.Remarks = req.body.Remarks || financeDocument.Remarks;
      financeDocument.IsActive =
        req.body.IsActive !== undefined
          ? req.body.IsActive
          : financeDocument.IsActive;
      financeDocument.DocStatus = "Approved";
      financeDocument.Status =
        req.body.IsActive === true ? "Active" : "In-Active";
      financeDocument.ModifiedDate = new Date();

      if (req.file) {
        const localFilePath = req.file.path; // Ensure this is correct
        console.log("Local file path:", localFilePath);

        const customerID = req.body.CustomerID || financeDocument.CustomerID;
        const customerType =
          req.body.CustomerType || financeDocument.CustomerType;
        const docTypeID = req.body.DocTypeID || financeDocument.DocTypeID;

        const remoteFilenameResult = await genDocNameforFin(
          req.file,
          customerID,
          customerType,
          docTypeID
        );

        if (remoteFilenameResult.error) {
          return res.status(400).json({ message: remoteFilenameResult.error });
        }

        const remoteFilename = remoteFilenameResult;
        const remoteFilePath = path.join(
          process.env.Finance_Documents_PATH,
          remoteFilename
        );
        console.log("Remote file path:", remoteFilePath);

        const sshConfig = {
          host: process.env.SSH_HOST,
          port: process.env.SSH_PORT,
          username: process.env.SSH_USERNAME,
          privateKeyPath: process.env.SSH_PRIVATE_KEY_PATH,
        };

        try {
          await transferImageToServer(
            localFilePath,
            remoteFilePath,
            sshConfig,
            "upload"
          );

          if (remoteFilePath !== financeDocument.DocURL) {
            await transferImageToServer(
              financeDocument.DocURL,
              financeDocument.DocURL,
              sshConfig,
              "remove"
            ).catch((err) => {
              console.error("Error removing file:", err);
            });
          }

          financeDocument.DocURL = remoteFilePath;
        } catch (uploadError) {
          console.error("Error uploading file:", uploadError);
          return res.status(500).json({ message: "Error uploading file" });
        }
      }

      const updatedFinanceDocument = await financeDocument.save();
      return res.status(200).json(updatedFinanceDocument);
    } catch (err) {
      console.error("Error updating finance documents:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
};

// Delete a FinanceDocuments with the specified id in the request
exports.deleteById = async (req, res) => {
  const id = req.params.id;

  try {
    // Find the document by ID
    const documentData = await FinanceDocuments.findByPk(id);

    // Check if the document exists
    if (!documentData) {
      return res
        .status(404)
        .json({ message: "FinanceDocuments not found with id: " + id });
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
      message: "FinanceDocuments with id: " + id + " deleted successfully",
    });
  } catch (err) {
    // Handle errors based on specific types
    if (err.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while deleting FinanceDocuments.",
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

exports.FinLoanDoccreate = async (req, res) => {
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
      const { FinanceLoanID, DocTypeID } = req.body;
      if (!FinanceLoanID) {
        console.error("FinanceLoanID is empty");
        return res
          .status(400)
          .json({ message: "FinanceLoanID cannot be empty" });
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

      const genName = await genDocNameforFinLoan(
        req.file,
        FinanceLoanID,
        DocTypeID
      );

      console.log("genName: ", genName);

      // Prepare data for document creation
      const localFilePath = req.file.path;
      const remoteFilePath = process.env.Finance_Documents_PATH + genName;
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

      // Save new FinanceDocument in the database
      const newFinanceDocument = await FinanceDocuments.create({
        // CustomerID: req.body.CustomerID || null,
        // CustomerType: req.body.CustomerType || null,
        DocTypeID: req.body.DocTypeID,
        FinanceLoanID: req.body.FinanceLoanID,
        // FinancePaymentID: req.body.FinancePaymentID || null,
        DocURL: remoteFilePath,
        DocStatus: "Approved",
        // Remarks: req.body.Remarks || null,
        IsActive: req.body.isActive !== undefined ? req.body.isActive : true,
        Status: req.body.isActive === undefined ? "Active" : "InActive",
      });

      console.log("Document created:", newFinanceDocument);

      return res.status(201).json(newFinanceDocument); // Send newly created document as response
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
exports.FinPaymentDoccreate = async (req, res) => {
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
      const { FinPaymentID, DocTypeID } = req.body;
      if (!FinPaymentID) {
        console.error("FinPaymentID is empty");
        return res
          .status(400)
          .json({ message: "FinPaymentID cannot be empty" });
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

      const genName = await genDocNameforFinPayment(
        req.file,
        FinPaymentID,
        DocTypeID
      );

      console.log("genName: ", genName);

      // Prepare data for document creation
      const localFilePath = req.file.path;
      const remoteFilePath = process.env.Finance_Documents_PATH + genName;
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

      // Save new FinanceDocument in the database
      const newFinanceDocument = await FinanceDocuments.create({
        // CustomerID: req.body.CustomerID || null,
        // CustomerType: req.body.CustomerType || null,
        DocTypeID: req.body.DocTypeID,
        FinPaymentID: req.body.FinPaymentID,
        // FinancePaymentID: req.body.FinancePaymentID || null,
        DocURL: remoteFilePath,
        DocStatus: "Approved",
        // Remarks: req.body.Remarks || null,
        IsActive: req.body.isActive !== undefined ? req.body.isActive : true,
        Status: req.body.isActive === undefined ? "Active" : "InActive",
      });

      console.log("Document created:", newFinanceDocument);

      return res.status(201).json(newFinanceDocument); // Send newly created document as response
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
