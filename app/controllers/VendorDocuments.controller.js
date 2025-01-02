require("dotenv").config(); // Load environment variables from .env file
const db = require("../models");
const VendorDocuments = db.vendordocuments;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;
const fs = require("fs");
const path = require("path");
const VendorMaster = db.vendormaster;
const DocumentTypes = db.documenttypes;
const { validationResult } = require("express-validator");
const { configureMulter } = require("../Utils/multerService");
const { transferImageToServer } = require("../Utils/sshService");
const { genVendorDocuments } = require("../Utils/generateService");

// Configure Multer
const upload = configureMulter(
  // "C:/Users/varun/OneDrive/Desktop/uploads/", // Adjust the upload path as needed
  "/home/administrator/VARUNGROUP/IMAGES_VMS_MARUTI",
  // "C:\\Users\\itvsp\\Desktop\\Uploads",
  1000000, // File size limit (1MB)
  ["jpeg", "jpg", "png", "gif"], // Allowed file types
  "DocURL"
);
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
      const { DocTypeID, VendorMasterID } = req.body;
      console.log(req.body);
      if (!DocTypeID) {
        console.error("DocTypeID is empty");
        return res.status(400).json({ message: "DocTypeID cannot be empty" });
      }

      // Ensure req.file exists
      if (!req.file) {
        console.error("No file uploaded");
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Check if VendorMasterID exists in VendorMaster table
      const vendorExists = await VendorMaster.findByPk(VendorMasterID);
      if (!vendorExists) {
        return res
          .status(400)
          .json({ message: "VendorMasterID does not exist" });
      }

      const genName = await genVendorDocuments(
        req.file,
        DocTypeID,
        VendorMasterID
      );

      console.log("genName: ", genName);

      // Prepare data for document creation
      const localFilePath = req.file.path;
      const remoteFilePath = process.env.Vendor_Master_Documents_PATH + genName;
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
      const newVendorDocument = await VendorDocuments.create({
        DocTypeID,
        VendorMasterID,
        DocURL: remoteFilePath,
        IsActive: req.body.isActive !== undefined ? req.body.isActive : true,
        Status: req.body.isActive === undefined ? "Active" : "InActive",
      });

      console.log("Document created:", newVendorDocument);

      return res.status(201).json(newVendorDocument); // Send newly created document as response
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
exports.findAll = async (req, res) => {
  try {
    const { VendorMasterID } = req.query;
    // Fetch FinanceDocuments data with included associations
    const documentData = await VendorDocuments.findAll({
      where: { VendorMasterID },
      attributes: [
        "VendorDocumentsID",
        "VendorMasterID",
        "DocTypeID",
        "DocURL",
        "IsActive",
        "Status",
      ],
      include: [
        {
          model: DocumentTypes, // Using the imported alias directly
          as: "VDDocTypeID", // Specify the alias for DocumentTypes
          attributes: ["DocumentAs", "Doctype"],
        },
      ],
      order: [
        ["CreatedDate", "DESC"], // Order by CreatedDate in decending order
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
      VendorDocumentsID: item.VendorDocumentsID,
      VendorMasterID: item.VendorMasterID,
      DocTypeID: item.DocTypeID,
      DocURL: item.DocURL,
      DocumentAs: item.VDDocTypeID ? item.VDDocTypeID.DocumentAs : null,
      Doctype: item.VDDocTypeID ? item.VDDocTypeID.Doctype : null,
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

      const { id } = req.params; // VendorDocuments ID
      const { DocTypeID, VendorMasterID } = req.body;

      // Ensure VendorDocuments record exists
      const vendorDocument = await VendorDocuments.findByPk(id);
      if (!vendorDocument) {
        return res.status(404).json({ message: "Vendor document not found" });
      }

      // Validate VendorMasterID exists
      if (VendorMasterID) {
        const vendorExists = await VendorMaster.findByPk(VendorMasterID);
        if (!vendorExists) {
          return res
            .status(400)
            .json({ message: "VendorMasterID does not exist" });
        }
      }

      // Handle file upload and updating document URL
      if (req.file) {
        const localFilePath = req.file.path;

        // Generate a new file name based on provided data
        const genName = await genVendorDocuments(
          req.file,
          DocTypeID || vendorDocument.DocTypeID,
          VendorMasterID || vendorDocument.VendorMasterID
        );
        const remoteFilePath =
          process.env.Vendor_Master_Documents_PATH + genName;

        // Upload new file to the server
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

        // Delete the old file if URLs differ
        if (vendorDocument.DocURL !== remoteFilePath) {
          await transferImageToServer(
            vendorDocument.DocURL,
            vendorDocument.DocURL,
            sshConfig,
            "remove"
          ).catch((err) => {
            console.error("Error removing old file:", err);
          });
        }

        // Update document URL
        vendorDocument.DocURL = remoteFilePath;
      }

      // Update other fields
      vendorDocument.DocTypeID = DocTypeID || vendorDocument.DocTypeID;
      vendorDocument.VendorMasterID =
        VendorMasterID || vendorDocument.VendorMasterID;
      vendorDocument.IsActive =
        req.body.IsActive !== undefined
          ? req.body.IsActive
          : vendorDocument.IsActive;
      vendorDocument.Status =
        req.body.IsActive === true ? "Active" : "InActive";
      vendorDocument.ModifiedDate = new Date();

      // Save updated record
      const updatedVendorDocument = await vendorDocument.save();
      return res.status(200).json(updatedVendorDocument);
    } catch (err) {
      console.error("Error updating vendor document:", err);
      return res.status(500).json({ message: "Internal server error" });
    } finally {
      // Clean up temporary file after processing
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    }
  });
};

exports.deleteById = async (req, res) => {
  const id = req.params.id;

  try {
    // Find the model by ID
    const vendorDoc = await VendorDocuments.findByPk(id);

    // Check if the model exists
    if (!vendorDoc) {
      return res
        .status(404)
        .json({ message: "vendorDoc not found with id: " + id });
    }

    // Delete the model
    await vendorDoc.destroy();

    // Send a success message
    res.status(200).json({
      message: "vendorDoc with id: " + id + " deleted successfully",
    });
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
        message: "Database error occurred while updating vendorDoc.",
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
    console.error("Error deleting vendorDoc:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
