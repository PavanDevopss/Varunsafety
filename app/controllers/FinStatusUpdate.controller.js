/* eslint-disable no-dupe-keys */
/* eslint-disable no-unused-vars */
require("dotenv").config();
const db = require("../models");
const fs = require("fs");
const path = require("path");
const FinStatusUpdate = db.finstatusupdate;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;
const FinanceApplication = db.financeapplication;
const FinAppApplicant = db.finappapplicant;
const NewCarBookings = db.NewCarBookings;
const UserMaster = db.usermaster;
const CustomerMaster = db.customermaster;
const FinStatusTracking = db.finstatustracking;
const RegionMaster = db.regionmaster;
const StateMaster = db.statemaster;
const FinanceDocuments = db.financedocuments;
// const { validationResult } = require("express-validator");
const { configureMulter } = require("../Utils/multerService");
const { transferImageToServer } = require("../Utils/sshService");
const { finApprovedDocument } = require("../Utils/generateService");

const upload = configureMulter(
  // "C:/Users/varun/OneDrive/Desktop/uploads/", // Adjust the upload path as needed
  "/home/administrator/VARUNGROUP/IMAGES_VMS_MARUTI",
  // "C:\\Users\\itvsp\\Desktop\\Uploads",
  1000000, // File size limit (1MB)
  ["jpeg", "jpg", "png", "gif"], // Allowed file types
  "FinDocURL"
);
// Basic CRUD API
// Create and Save a new DivisionMaster
exports.create = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error("Error uploading file:", err);
      return res.status(400).json({ message: err.message });
    }

    console.log("FinAppID:", req.body.FinAppID);

    try {
      // Validate request
      if (!req.body.FinAppID) {
        return res.status(400).json({ message: "FinAppID cannot be empty" });
      }

      // Check if FinAppID and CurrentStage combination already exists
      const existingModel = await FinStatusUpdate.findOne({
        where: {
          FinAppID: req.body.FinAppID,
          CurrentStage: req.body.CurrentStage || null,
        },
      });

      let remoteFilePath = null;

      // Check if NextStage is 'Do-Released'
      if (req.body.NextStage === "Do-Released") {
        if (!req.file) {
          return res.status(400).json({
            message: "File is required when NextStage is 'Do-Released'",
          });
        }

        const { FinAppID } = req.body;
        const genName = await finApprovedDocument(req.file, FinAppID);
        console.log("genName: ", genName);

        // Prepare data for document creation
        const localFilePath = req.file.path;
        remoteFilePath = process.env.Finance_Documents_PATH + genName;
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
      }

      // Create a FinStatusUpdate
      const finStatusUpdate = {
        FinAppID: req.body.FinAppID,
        CurrentStage: req.body.CurrentStage || null,
        StatusDate: req.body.StatusDate || new Date(),
        NextStage: req.body.NextStage,
        Remarks: req.body.Remarks,
        DocURL: remoteFilePath, // This will be either the file path or null
        Status: req.body.Status || "Active",
        IsActive: req.body.isActive || false,
      };

      // Save FinStatusUpdate in the database
      const newFinStatusUpdate = await FinStatusUpdate.create(finStatusUpdate);

      return res.status(201).json(newFinStatusUpdate); // Send the newly created FinStatusUpdate as response
    } catch (err) {
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

      console.error("Error creating FinStatusUpdate:", err);
      return res.status(500).json({ message: "Internal server error" });
    } finally {
      // Clean up temporary file after processing
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    }
  });
};

// Retrieve all FinStatusUpdate from the database.
exports.findAll = async (req, res) => {
  try {
    console.log("UserName", process.env.USERNAME);

    // Fetch all FinStatusUpdate data with included FinanceApplication and FinAppApplicant data
    const finStatusUpdateData = await FinStatusUpdate.findAll({
      attributes: [
        "FinStatusID",
        "FinAppID",
        "CurrentStage",
        "StatusDate",
        "NextStage",
        "Remarks",
        "FinDocURL",
        "Status",
        "IsActive",
      ],
      include: [
        {
          model: FinanceApplication,
          as: "FSUFinAppID", // Alias for FinanceApplication
          attributes: [
            "CustomerID",
            "ApplicationNumber",
            "LoanAppCustID",
            "FinancierName",
            "Branch",
            "LoanAmt",
          ],
          include: [
            {
              model: FinAppApplicant,
              as: "FALoanAppCustID", // Alias for FinAppApplicant
              attributes: ["BookingID", "FirstName", "PhoneNo"],
              include: [
                {
                  model: NewCarBookings,
                  as: "FABookingID",
                  attributes: [
                    "BookingNo",
                    "CustomerID",
                    "ModelName",
                    "ColourName",
                    "VariantName",
                    "BranchName",
                    "SalesPersonID",
                  ],
                  include: [
                    {
                      model: UserMaster,
                      as: "NCBSPUserID",
                      attributes: ["UserID", "UserName", "EmpID"],
                    },
                    {
                      model: CustomerMaster,
                      as: "NCBCustID",
                      attributes: ["FuelType", "Transmission"],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
      order: [["StatusDate", "ASC"]], // Order by StatusDate in ascending order
    });

    // Check if data is empty
    if (!finStatusUpdateData || finStatusUpdateData.length === 0) {
      return res.status(404).json({
        message: "No financial status update data found.",
      });
    }

    // Map the data for response
    const combinedData = finStatusUpdateData.map((item) => ({
      FinStatusID: item.FinStatusID,
      FinAppID: item.FinAppID,
      CurrentStage: item.CurrentStage,
      StatusDate: item.StatusDate,
      NextStage: item.NextStage,
      Remarks: item.Remarks,
      DocURL: item.DocURL,
      Status: item.Status,
      IsActive: item.IsActive,
      CustomerID: item.FSUFinAppID ? item.FSUFinAppID.CustomerID : null,
      ApplicationNumber: item.FSUFinAppID
        ? item.FSUFinAppID.ApplicationNumber
        : null,
      LoanAppCustID: item.FSUFinAppID ? item.FSUFinAppID.LoanAppCustID : null,
      FinancierName: item.FSUFinAppID ? item.FSUFinAppID.FinancierName : null,
      Branch: item.FSUFinAppID ? item.FSUFinAppID.Branch : null,
      LoanAmt: item.FSUFinAppID ? item.FSUFinAppID.LoanAmt : null,
      ApplicantFirstName:
        item.FSUFinAppID && item.FSUFinAppID.FALoanAppCustID
          ? item.FSUFinAppID.FALoanAppCustID.FirstName
          : null,
      ApplicantPhoneNo:
        item.FSUFinAppID && item.FSUFinAppID.FALoanAppCustID
          ? item.FSUFinAppID.FALoanAppCustID.PhoneNo
          : null,
      BookingID:
        item.FSUFinAppID &&
        item.FSUFinAppID.FALoanAppCustID &&
        item.FSUFinAppID.FALoanAppCustID.FABookingID
          ? item.FSUFinAppID.FALoanAppCustID.FABookingID.BookingID
          : null,
      BookingNo:
        item.FSUFinAppID &&
        item.FSUFinAppID.FALoanAppCustID &&
        item.FSUFinAppID.FALoanAppCustID.FABookingID
          ? item.FSUFinAppID.FALoanAppCustID.FABookingID.BookingNo
          : null,
      ModelName:
        item.FSUFinAppID &&
        item.FSUFinAppID.FALoanAppCustID &&
        item.FSUFinAppID.FALoanAppCustID.FABookingID
          ? item.FSUFinAppID.FALoanAppCustID.FABookingID.ModelName
          : null,
      ColourName:
        item.FSUFinAppID &&
        item.FSUFinAppID.FALoanAppCustID &&
        item.FSUFinAppID.FALoanAppCustID.FABookingID
          ? item.FSUFinAppID.FALoanAppCustID.FABookingID.ColourName
          : null,
      VariantName:
        item.FSUFinAppID &&
        item.FSUFinAppID.FALoanAppCustID &&
        item.FSUFinAppID.FALoanAppCustID.FABookingID
          ? item.FSUFinAppID.FALoanAppCustID.FABookingID.VariantName
          : null,

      FuelType:
        item.FSUFinAppID &&
        item.FSUFinAppID.FALoanAppCustID &&
        item.FSUFinAppID.FALoanAppCustID.FABookingID &&
        item.FSUFinAppID.FALoanAppCustID.FABookingID.NCBCustID
          ? item.FSUFinAppID.FALoanAppCustID.FABookingID.NCBCustID.FuelType
          : null,
      Transmission:
        item.FSUFinAppID &&
        item.FSUFinAppID.FALoanAppCustID &&
        item.FSUFinAppID.FALoanAppCustID.FABookingID &&
        item.FSUFinAppID.FALoanAppCustID.FABookingID.NCBCustID
          ? item.FSUFinAppID.FALoanAppCustID.FABookingID.NCBCustID.Transmission
          : null,

      BranchName:
        item.FSUFinAppID &&
        item.FSUFinAppID.FALoanAppCustID &&
        item.FSUFinAppID.FALoanAppCustID.FABookingID
          ? item.FSUFinAppID.FALoanAppCustID.FABookingID.BranchName
          : null,
      SalesPersonID:
        item.FSUFinAppID &&
        item.FSUFinAppID.FALoanAppCustID &&
        item.FSUFinAppID.FALoanAppCustID.FABookingID
          ? item.FSUFinAppID.FALoanAppCustID.FABookingID.SalesPersonID
          : null,

      UserID:
        item.FSUFinAppID &&
        item.FSUFinAppID.FALoanAppCustID &&
        item.FSUFinAppID.FALoanAppCustID.FABookingID &&
        item.FSUFinAppID.FALoanAppCustID.FABookingID.NCBSPUserID
          ? item.FSUFinAppID.FALoanAppCustID.FABookingID.NCBSPUserID.UserID
          : null,
      UserName:
        item.FSUFinAppID &&
        item.FSUFinAppID.FALoanAppCustID &&
        item.FSUFinAppID.FALoanAppCustID.FABookingID &&
        item.FSUFinAppID.FALoanAppCustID.FABookingID.NCBSPUserID
          ? item.FSUFinAppID.FALoanAppCustID.FABookingID.NCBSPUserID.UserName
          : null,
      EmpID:
        item.FSUFinAppID &&
        item.FSUFinAppID.FALoanAppCustID &&
        item.FSUFinAppID.FALoanAppCustID.FABookingID &&
        item.FSUFinAppID.FALoanAppCustID.FABookingID.NCBSPUserID
          ? item.FSUFinAppID.FALoanAppCustID.FABookingID.NCBSPUserID.EmpID
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
          "Database error occurred while retrieving financial status update data.",
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
    console.error("Error retrieving financial status update data:", error);
    return res.status(500).json({
      message:
        "Failed to retrieve financial status update data. Please try again later.",
    });
  }
};

// Find a single FinStatusUpdate with an id
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;

    // Validate the ID parameter
    if (!id) {
      return res.status(400).json({ message: "ID parameter is required." });
    }

    // Fetch the financial status update data by primary key with included related data
    const finStatusUpdateData = await FinStatusUpdate.findOne({
      where: { FinStatusID: id },
      attributes: [
        // Fields from FinStatusUpdate table
        "FinStatusID",
        "FinAppID",
        "CurrentStage",
        "StatusDate",
        "NextStage",
        "Remarks",
        "FinDocURL",
        "Status",
        "IsActive",

        // Flattened fields from FinanceApplication (FSUFinAppID)
        [sequelize.col("FSUFinAppID.CustomerID"), "FinApp_CustomerID"],
        [
          sequelize.col("FSUFinAppID.ApplicationNumber"),
          "FinApp_ApplicationNumber",
        ],
        [sequelize.col("FSUFinAppID.LoanAppCustID"), "FinApp_LoanAppCustID"],
        [sequelize.col("FSUFinAppID.FinancierName"), "FinApp_FinancierName"],
        [sequelize.col("FSUFinAppID.Branch"), "FinApp_Branch"],
        [sequelize.col("FSUFinAppID.LoanAmt"), "FinApp_LoanAmt"],

        // Flattened fields from FinAppApplicant (FALoanAppCustID)
        [
          sequelize.col("FSUFinAppID.FALoanAppCustID.BookingID"),
          "FinAppApplicant_BookingID",
        ],
        [
          sequelize.col("FSUFinAppID.FALoanAppCustID.FirstName"),
          "FinAppApplicant_FirstName",
        ],
        [
          sequelize.col("FSUFinAppID.FALoanAppCustID.PhoneNo"),
          "FinAppApplicant_PhoneNo",
        ],

        // Flattened fields from NewCarBookings (FABookingID)
        [
          sequelize.col("FSUFinAppID.FALoanAppCustID.FABookingID.BookingNo"),
          "NewCarBookings_BookingNo",
        ],
        [
          sequelize.col("FSUFinAppID.FALoanAppCustID.FABookingID.CustomerID"),
          "NewCarBookings_CustomerID",
        ],
        [
          sequelize.col("FSUFinAppID.FALoanAppCustID.FABookingID.ModelName"),
          "NewCarBookings_ModelName",
        ],
        [
          sequelize.col("FSUFinAppID.FALoanAppCustID.FABookingID.ColourName"),
          "NewCarBookings_ColourName",
        ],
        [
          sequelize.col("FSUFinAppID.FALoanAppCustID.FABookingID.VariantName"),
          "NewCarBookings_VariantName",
        ],
        [
          sequelize.col("FSUFinAppID.FALoanAppCustID.FABookingID.BranchName"),
          "NewCarBookings_BranchName",
        ],
        [
          sequelize.col(
            "FSUFinAppID.FALoanAppCustID.FABookingID.SalesPersonID"
          ),
          "NewCarBookings_SalesPersonID",
        ],

        // Flattened fields from UserMaster (NCBSPUserID)
        [
          sequelize.col(
            "FSUFinAppID.FALoanAppCustID.FABookingID.NCBSPUserID.UserID"
          ),
          "UserMaster_UserID",
        ],
        [
          sequelize.col(
            "FSUFinAppID.FALoanAppCustID.FABookingID.NCBSPUserID.UserName"
          ),
          "UserMaster_UserName",
        ],
        [
          sequelize.col(
            "FSUFinAppID.FALoanAppCustID.FABookingID.NCBSPUserID.EmpID"
          ),
          "UserMaster_EmpID",
        ],

        // Flattened fields from CustomerMaster (NCBCustID)
        [
          sequelize.col(
            "FSUFinAppID.FALoanAppCustID.FABookingID.NCBCustID.FuelType"
          ),
          "CustomerMaster_FuelType",
        ],
        [
          sequelize.col(
            "FSUFinAppID.FALoanAppCustID.FABookingID.NCBCustID.Transmission"
          ),
          "CustomerMaster_Transmission",
        ],
      ],
      include: [
        {
          model: FinanceApplication,
          as: "FSUFinAppID",
          attributes: [], // No direct attributes from this model, but fields are flattened above
          include: [
            {
              model: FinAppApplicant,
              as: "FALoanAppCustID",
              attributes: [], // No direct attributes from this model, but fields are flattened above
              include: [
                {
                  model: NewCarBookings,
                  as: "FABookingID",
                  attributes: [], // No direct attributes from this model, but fields are flattened above
                  include: [
                    {
                      model: UserMaster,
                      as: "NCBSPUserID",
                      attributes: [], // No direct attributes from this model, but fields are flattened above
                    },
                    {
                      model: CustomerMaster,
                      as: "NCBCustID",
                      attributes: [], // No direct attributes from this model, but fields are flattened above
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!finStatusUpdateData) {
      return res
        .status(404)
        .json({ message: "No financial status update data found." });
    }

    // Map the data for response as a flat JSON
    // const combinedData = {
    //   FinStatusID: finStatusUpdateData.FinStatusID,
    //   FinAppID: finStatusUpdateData.FinAppID,
    //   CurrentStage: finStatusUpdateData.CurrentStage,
    //   StatusDate: finStatusUpdateData.StatusDate,
    //   NextStage: finStatusUpdateData.NextStage,
    //   Remarks: finStatusUpdateData.Remarks,
    //   DocURL: finStatusUpdateData.DocURL,
    //   Status: finStatusUpdateData.Status,
    //   IsActive: finStatusUpdateData.IsActive,
    //   // FinanceApplication
    //   CustomerID: finStatusUpdateData.FSUFinAppID?.CustomerID ?? null,
    //   ApplicationNumber:
    //     finStatusUpdateData.FSUFinAppID?.ApplicationNumber ?? null,
    //   LoanAppCustID: finStatusUpdateData.FSUFinAppID?.LoanAppCustID ?? null,
    //   FinancierName: finStatusUpdateData.FSUFinAppID?.FinancierName ?? null,
    //   Branch: finStatusUpdateData.FSUFinAppID?.Branch ?? null,
    //   LoanAmt: finStatusUpdateData.FSUFinAppID?.LoanAmt ?? null,
    //   // FinAppApplicant
    //   ApplicantFirstName:
    //     finStatusUpdateData.FSUFinAppID?.FALoanAppCustID?.FirstName ?? null,
    //   ApplicantPhoneNo:
    //     finStatusUpdateData.FSUFinAppID?.FALoanAppCustID?.PhoneNo ?? null,
    //   // NewCarBookings
    //   BookingID:
    //     finStatusUpdateData.FSUFinAppID?.FALoanAppCustID?.FABookingID
    //       ?.BookingID ?? null,
    //   BookingNo:
    //     finStatusUpdateData.FSUFinAppID?.FALoanAppCustID?.FABookingID
    //       ?.BookingNo ?? null,
    //   ModelName:
    //     finStatusUpdateData.FSUFinAppID?.FALoanAppCustID?.FABookingID
    //       ?.ModelName ?? null,
    //   ColourName:
    //     finStatusUpdateData.FSUFinAppID?.FALoanAppCustID?.FABookingID
    //       ?.ColourName ?? null,
    //   VariantName:
    //     finStatusUpdateData.FSUFinAppID?.FALoanAppCustID?.FABookingID
    //       ?.VariantName ?? null,
    //   FuelType:
    //     finStatusUpdateData.FSUFinAppID?.FALoanAppCustID?.FABookingID?.NCBCustID
    //       ?.FuelType ?? null,
    //   Transmission:
    //     finStatusUpdateData.FSUFinAppID?.FALoanAppCustID?.FABookingID?.NCBCustID
    //       ?.Transmission ?? null,
    //   BranchName:
    //     finStatusUpdateData.FSUFinAppID?.FALoanAppCustID?.FABookingID
    //       ?.BranchName ?? null,
    //   SalesPersonID:
    //     finStatusUpdateData.FSUFinAppID?.FALoanAppCustID?.FABookingID
    //       ?.SalesPersonID ?? null,
    //   // UserMaster
    //   UserID:
    //     finStatusUpdateData.FSUFinAppID?.FALoanAppCustID?.FABookingID
    //       ?.NCBSPUserID?.UserID ?? null,
    //   UserName:
    //     finStatusUpdateData.FSUFinAppID?.FALoanAppCustID?.FABookingID
    //       ?.NCBSPUserID?.UserName ?? null,
    //   EmpID:
    //     finStatusUpdateData.FSUFinAppID?.FALoanAppCustID?.FABookingID
    //       ?.NCBSPUserID?.EmpID ?? null,
    // };

    // Send the combined data as response
    res.json(finStatusUpdateData);
  } catch (error) {
    // Handle errors based on specific types
    switch (error.name) {
      case "SequelizeDatabaseError":
        return res.status(500).json({
          message:
            "Database error occurred while retrieving financial status update data.",
          details: error.message,
        });
      case "SequelizeConnectionError":
        return res.status(503).json({
          message: "Service unavailable. Could not connect to the database.",
          details: error.message,
        });
      case "SequelizeValidationError":
        return res.status(400).json({
          message: "Validation error occurred.",
          details: error.errors.map((e) => e.message),
        });
      default:
        return res.status(500).json({
          message: "An unexpected error occurred.",
          details: error.message,
        });
    }
  }
};

// Update a FinStatusUpdate by the id in the request
exports.updateByPk = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error("Error uploading file:", err);
      return res.status(400).json({ message: err.message });
    }

    console.log("FinStatusID:", req.body.FinStatusID);

    try {
      // Validate request
      // if (!req.body.FinStatusID) {
      //   return res.status(400).json({ message: "FinStatusID cannot be empty" });
      // }
      // if (!req.body.FinAppID) {
      //   return res.status(400).json({ message: "FinAppID cannot be empty" });
      // }
      // if (
      //   req.body.CurrentStage &&
      //   !/^[a-zA-Z ]*$/.test(req.body.CurrentStage)
      // ) {
      //   console.log(
      //     "Validation failed: CurrentStage contains special characters."
      //   );
      //   return res.status(400).json({
      //     message: "CurrentStage should contain only letters",
      //   });
      // }
      if (req.body.StatusDate && isNaN(Date.parse(req.body.StatusDate))) {
        return res.status(400).json({
          message: "Invalid StatusDate format",
        });
      }
      // if (req.body.NextStage && !/^[a-zA-Z ]*$/.test(req.body.NextStage)) {
      //   console.log(
      //     "Validation failed: NextStage contains special characters."
      //   );
      //   return res.status(400).json({
      //     message: "NextStage should contain only letters",
      //   });
      // }

      // Find the FinStatusUpdate by ID
      const finStatusId = req.params.id;

      if (!finStatusId) {
        return res.status(400).json({ message: "ID parameter is required." });
      }

      let finStatusUpdate = await FinStatusUpdate.findByPk(finStatusId);

      if (!finStatusUpdate) {
        return res.status(404).json({ message: "FinStatusUpdate not found" });
      }

      // Update fields
      finStatusUpdate.FinStatusID =
        req.body.FinStatusID || finStatusUpdate.FinStatusID;
      finStatusUpdate.FinAppID = req.body.FinAppID || finStatusUpdate.FinAppID;
      finStatusUpdate.CurrentStage =
        req.body.CurrentStage || finStatusUpdate.CurrentStage;
      finStatusUpdate.StatusDate =
        req.body.StatusDate || finStatusUpdate.StatusDate;
      finStatusUpdate.NextStage =
        req.body.NextStage || finStatusUpdate.NextStage;
      finStatusUpdate.Remarks = req.body.Remarks || finStatusUpdate.Remarks;
      finStatusUpdate.FinDocURL =
        req.body.FinDocURL || finStatusUpdate.FinDocURL;
      finStatusUpdate.Status = req.body.Status || finStatusUpdate.Status;
      finStatusUpdate.IsActive = req.body.IsActive || finStatusUpdate.IsActive;
      finStatusUpdate.CreatedDate =
        req.body.CreatedDate || finStatusUpdate.CreatedDate;
      finStatusUpdate.ModifiedDate = new Date();

      // Handle file upload
      if (req.file) {
        const localFilePath = req.file.path;
        const finAppID = req.body.FinAppID || finStatusUpdate.FinAppID;

        // Generate remote filename
        const remoteFilename = await finApprovedDocument(req.file, finAppID);
        const remoteFilePath = path.join(
          process.env.Finance_Documents_PATH,
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
          if (
            finStatusUpdate.DocURL &&
            remoteFilePath !== finStatusUpdate.DocURL
          ) {
            await transferImageToServer(
              finStatusUpdate.DocURL,
              finStatusUpdate.DocURL,
              sshConfig,
              "remove"
            ).catch((err) => {
              console.error("Error removing file:", err);
            });
          }

          // Update DocURL with the new file path
          finStatusUpdate.DocURL = remoteFilePath;
        } catch (uploadError) {
          console.error("Error uploading file:", uploadError);
          return res.status(500).json({ message: "Error uploading file" });
        }
      }

      // Save updated FinStatusUpdate in the database
      const updatedFinStatusUpdate = await finStatusUpdate.save();

      return res.status(200).json(updatedFinStatusUpdate); // Send the updated FinStatusUpdate as response
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
          message: "Database error occurred while updating FinStatusUpdate.",
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
      console.error("Error updating FinStatusUpdate:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
};
// Delete a FinStatusUpdate with the specified id in the request
exports.deleteById = async (req, res) => {
  const id = req.params.id;

  try {
    // Validate the ID parameter
    if (!id) {
      return res.status(400).json({ message: "ID parameter is required." });
    }

    // Find the model by ID
    const finStatusUpdate = await FinStatusUpdate.findByPk(id);

    // Check if the model exists
    if (!finStatusUpdate) {
      return res
        .status(404)
        .json({ message: "FinStatusUpdate not found with id: " + id });
    }

    // Delete the model
    console.log("retriced data:", finStatusUpdate);
    console.log("retriced doc url:", finStatusUpdate.DocURL);
    const path = finStatusUpdate.DocURL;
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
    if (finStatusUpdate.DocURL && fs.existsSync(finStatusUpdate.DocURL)) {
      fs.unlinkSync(finStatusUpdate.DocURL);
    }

    // Delete the document from the database
    await finStatusUpdate.destroy();

    // Send a success message
    res.status(200).json({
      message: "FinStatusUpdate with id: " + id + " deleted successfully",
    });
  } catch (err) {
    // Handle errors based on specific types
    if (err.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while deleting FinStatusUpdate.",
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
    console.error("Error deleting FinStatusUpdate:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
// Handles the creation or updating of FinStatusUpdate, including file upload, validation, and status tracking.
// exports.statuscreate = async (req, res) => {
//   upload(req, res, async (err) => {
//     if (err) {
//       console.error("Error uploading file:", err);
//       return res.status(400).json({ message: err.message });
//     }
//     // const finAppID = req.query.FinAppID;
//     const finStatusID = req.query.FinStatusID;
//     const { finAppID, CurrentStage, StatusDate, NextStage, Remarks, isActive } =
//       req.body;

//     try {
//       // Validate request
//       if (!finAppID) {
//         return res.status(400).json({ message: "FinAppID cannot be empty" });
//       }

//       // Check if FinAppID exists in the database
//       const finApp = await FinanceApplication.findByPk(finAppID);
//       if (!finApp) {
//         return res
//           .status(404)
//           .json({ message: `FinAppID ${finAppID} not found` });
//       }

//       // Check if FinAppID and CurrentStage combination already exists
//       let existingModel = await FinStatusUpdate.findOne({
//         // where: { FinAppID, CurrentStage },
//         where: { finAppID },
//       });

//       let docUrl = null;

//       // Handle file upload only if NextStage is 'Do-Released'
//       if (CurrentStage === "Do-Released") {
//         if (!req.file) {
//           return res.status(400).json({
//             message: "File is required when CurrentStage is 'Do-Released'",
//           });
//         }

//         // Attempt to generate the file name
//         try {
//           const genName = await finApprovedDocument(
//             req.file,
//             finAppID,
//             CurrentStage
//           );
//           console.log("Generated file name: ", genName);

//           const localFilePath = req.file.path;
//           const remoteFilePath = process.env.Finance_Documents_PATH + genName;

//           // Upload file to server via SSH
//           const sshConfig = {
//             host: process.env.SSH_HOST,
//             port: process.env.SSH_PORT,
//             username: process.env.SSH_USERNAME,
//             privateKeyPath: process.env.SSH_PRIVATE_KEY_PATH,
//           };

//           await transferImageToServer(
//             localFilePath,
//             remoteFilePath,
//             sshConfig,
//             "upload"
//           );
//           docUrl = remoteFilePath;
//         } catch (genErr) {
//           console.error("Error generating document name:", genErr);
//           return res
//             .status(500)
//             .json({ message: "Error generating document name" });
//         }
//       }

//       if (existingModel) {
//         // Update existing FinStatusUpdate
//         // existingModel.CurrentStage = CurrentStage || "Application Created";
//         existingModel.CurrentStage = CurrentStage;
//         existingModel.StatusDate = StatusDate || new Date();
//         existingModel.NextStage = NextStage;
//         existingModel.Remarks = Remarks || existingModel.Remarks;
//         existingModel.DocURL = docUrl ? docUrl : existingModel.DocURL;

//         const updatedFinStatusUpdate = await existingModel.save();

//         // Add entry to FinStatusTracking
//         await FinStatusTracking.create({
//           FinStatusID: updatedFinStatusUpdate.FinStatusID, // Use the ID from the updated FinStatusUpdate
//           CurrentStage: updatedFinStatusUpdate.CurrentStage,
//           StatusDate: updatedFinStatusUpdate.StatusDate,
//           IsActive: updatedFinStatusUpdate.IsActive,
//           Status: updatedFinStatusUpdate.Status,
//         });

//         return res.status(200).json(updatedFinStatusUpdate);
//       } else {
//         // Create a new FinStatusUpdate
//         const newFinStatusUpdate = await FinStatusUpdate.create({
//           FinAppID: finAppID,
//           CurrentStage: CurrentStage || "Application Created",
//           StatusDate: StatusDate || new Date(),
//           NextStage,
//           Remarks,
//           DocURL: docUrl || null,
//           Status: isActive || "Active",
//           IsActive: isActive || true,
//         });

//         // Add entry to FinStatusTracking
//         await FinStatusTracking.create({
//           FinStatusID: newFinStatusUpdate.FinStatusID, // Use the ID from the new FinStatusUpdate
//           CurrentStage: newFinStatusUpdate.CurrentStage,
//           StatusDate: newFinStatusUpdate.StatusDate,
//           IsActive: newFinStatusUpdate.IsActive,
//           Status: newFinStatusUpdate.Status,
//         });

//         return res.status(201).json(newFinStatusUpdate);
//       }
//     } catch (err) {
//       if (err.name === "SequelizeValidationError") {
//         return res.status(400).json({
//           message: "Validation error",
//           details: err.errors.map((e) => e.message),
//         });
//       }

//       if (err.name === "SequelizeUniqueConstraintError") {
//         return res.status(400).json({
//           message: "Unique constraint error",
//           details: err.errors.map((e) => e.message),
//         });
//       }

//       console.error("Error creating or updating FinStatusUpdate:", err);
//       return res.status(500).json({ message: "Internal server error" });
//     } finally {
//       // Clean up temporary file after processing
//       if (req.file && fs.existsSync(req.file.path)) {
//         fs.unlinkSync(req.file.path);
//       }
//     }
//   });
// };

exports.statuscreate = async (req, res) => {
  const transaction = await Seq.transaction(); // Start a transaction

  upload(req, res, async (err) => {
    if (err) {
      console.error("Error uploading file:", err);
      return res.status(400).json({ message: err.message });
    }

    const finStatusID = req.query.FinStatusID;
    const { finAppID, CurrentStage, StatusDate, NextStage, Remarks, isActive } =
      req.body;

    try {
      // Validate finAppID
      if (!finAppID) {
        return res.status(400).json({ message: "FinAppID cannot be empty" });
      }

      // Check if FinanceApplication exists
      const finApp = await FinanceApplication.findByPk(finAppID, {
        transaction,
      });
      if (!finApp) {
        return res
          .status(404)
          .json({ message: `FinAppID ${finAppID} not found` });
      }

      // Check if FinStatusUpdate exists
      let existingModel;
      if (finStatusID) {
        existingModel = await FinStatusUpdate.findByPk(finStatusID, {
          transaction,
        });
      } else {
        existingModel = await FinStatusUpdate.findOne({
          where: { FinAppID: finAppID },
          transaction,
        });
      }

      let docUrl = null;

      if (existingModel) {
        // Existing FinStatusUpdate found
        if (CurrentStage === "Do-Released" && req.file) {
          try {
            const genName = await finApprovedDocument(
              req.file,
              finAppID,
              CurrentStage
            );
            console.log("Generated file name: ", genName);

            const localFilePath = req.file.path;
            const remoteFilePath = process.env.Finance_Documents_PATH + genName;

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
            docUrl = remoteFilePath;
          } catch (genErr) {
            console.error("Error generating document name:", genErr);
            await transaction.rollback(); // Rollback transaction if document generation fails
            return res
              .status(500)
              .json({ message: "Error generating document name" });
          }
        }

        // Check if the stage has changed
        const stageChanged = existingModel.CurrentStage !== CurrentStage;

        if (stageChanged) {
          await FinStatusTracking.create(
            {
              FinStatusID: existingModel.FinStatusID,
              CurrentStage: CurrentStage,
              StatusDate: StatusDate || new Date(),
              IsActive: isActive || existingModel.IsActive,
              Status: existingModel.Status,
            },
            { transaction }
          );
        }

        // Update existing FinStatusUpdate
        existingModel.CurrentStage = CurrentStage;
        existingModel.StatusDate = StatusDate || new Date();
        existingModel.NextStage = NextStage;
        existingModel.Remarks = Remarks || existingModel.Remarks;
        existingModel.FinDocURL = docUrl ? docUrl : existingModel.FinDocURL;
        existingModel.IsActive =
          isActive !== undefined ? isActive : existingModel.IsActive;
        existingModel.ModifiedDate = new Date();

        const updatedFinStatusUpdate = await existingModel.save({
          transaction,
        });

        await transaction.commit(); // Commit transaction if all operations succeed
        return res.status(200).json(updatedFinStatusUpdate);
      } else {
        // No existing FinStatusUpdate, create a new one
        const newFinStatusUpdate = await FinStatusUpdate.create(
          {
            FinAppID: finAppID,
            CurrentStage: CurrentStage || "Application Created",
            StatusDate: StatusDate || new Date(),
            NextStage,
            Remarks,
            FinDocURL: docUrl || null,
            Status: isActive || "Active",
            IsActive: isActive || true,
          },
          { transaction }
        );

        await FinStatusTracking.create(
          {
            FinStatusID: newFinStatusUpdate.FinStatusID,
            CurrentStage: newFinStatusUpdate.CurrentStage,
            StatusDate: newFinStatusUpdate.StatusDate,
            IsActive: newFinStatusUpdate.IsActive,
            Status: newFinStatusUpdate.Status,
          },
          { transaction }
        );

        await transaction.commit(); // Commit transaction if all operations succeed
        return res.status(201).json(newFinStatusUpdate);
      }
    } catch (err) {
      // Rollback the transaction in case of error
      try {
        await transaction.rollback();
      } catch (rollbackError) {
        console.error("Transaction rollback failed:", rollbackError);
      }

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

      console.error("Error creating or updating FinStatusUpdate:", err);
      return res.status(500).json({ message: "Internal server error" });
    } finally {
      // Clean up temporary file after processing
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    }
  });
};

// exports.statuscreate = async (req, res) => {
//   upload(req, res, async (err) => {
//     if (err) {
//       console.error("Error uploading file:", err);
//       return res.status(400).json({ message: err.message });
//     }

//     const finStatusID = req.query.FinStatusID;
//     const { finAppID, CurrentStage, StatusDate, NextStage, Remarks, isActive } =
//       req.body;

//     try {
//       // Validate finAppID
//       if (!finAppID) {
//         return res.status(400).json({ message: "FinAppID cannot be empty" });
//       }

//       // Check if FinanceApplication exists
//       const finApp = await FinanceApplication.findByPk(finAppID);
//       if (!finApp) {
//         return res
//           .status(404)
//           .json({ message: `FinAppID ${finAppID} not found` });
//       }

//       // Check if FinStatusUpdate exists
//       let existingModel;
//       if (finStatusID) {
//         existingModel = await FinStatusUpdate.findByPk(finStatusID);
//       } else {
//         existingModel = await FinStatusUpdate.findOne({
//           where: { FinAppID: finAppID },
//         });
//       }

//       let docUrl = null;

//       if (existingModel) {
//         // Existing FinStatusUpdate found
//         if (CurrentStage === "Do-Released" && req.file) {
//           try {
//             const genName = await finApprovedDocument(
//               req.file,
//               finAppID,
//               CurrentStage
//             );
//             console.log("Generated file name: ", genName);

//             const localFilePath = req.file.path;
//             const remoteFilePath = process.env.Finance_Documents_PATH + genName;

//             const sshConfig = {
//               host: process.env.SSH_HOST,
//               port: process.env.SSH_PORT,
//               username: process.env.SSH_USERNAME,
//               privateKeyPath: process.env.SSH_PRIVATE_KEY_PATH,
//             };

//             await transferImageToServer(
//               localFilePath,
//               remoteFilePath,
//               sshConfig,
//               "upload"
//             );
//             docUrl = remoteFilePath;
//           } catch (genErr) {
//             console.error("Error generating document name:", genErr);
//             return res
//               .status(500)
//               .json({ message: "Error generating document name" });
//           }
//         }

//         // Check if the stage has changed
//         const stageChanged = existingModel.CurrentStage !== CurrentStage;

//         if (stageChanged) {
//           await FinStatusTracking.create({
//             FinStatusID: existingModel.FinStatusID,
//             CurrentStage: CurrentStage,
//             StatusDate: StatusDate || new Date(),
//             IsActive: isActive || existingModel.IsActive,
//             Status: existingModel.Status,
//           });
//         }

//         // Update existing FinStatusUpdate
//         existingModel.CurrentStage = CurrentStage;
//         existingModel.StatusDate = StatusDate || new Date();
//         existingModel.NextStage = NextStage;
//         existingModel.Remarks = Remarks || existingModel.Remarks;
//         existingModel.FinDocURL = docUrl ? docUrl : existingModel.FinDocURL;
//         existingModel.IsActive =
//           isActive !== undefined ? isActive : existingModel.IsActive;
//         existingModel.ModifiedDate = new Date();

//         const updatedFinStatusUpdate = await existingModel.save();

//         return res.status(200).json(updatedFinStatusUpdate);
//       } else {
//         // No existing FinStatusUpdate, create a new one
//         const newFinStatusUpdate = await FinStatusUpdate.create({
//           FinAppID: finAppID,
//           CurrentStage: CurrentStage || "Application Created",
//           StatusDate: StatusDate || new Date(),
//           NextStage,
//           Remarks,
//           FinDocURL: docUrl || null,
//           Status: isActive || "Active",
//           IsActive: isActive || true,
//         });

//         await FinStatusTracking.create({
//           FinStatusID: newFinStatusUpdate.FinStatusID,
//           CurrentStage: newFinStatusUpdate.CurrentStage,
//           StatusDate: newFinStatusUpdate.StatusDate,
//           IsActive: newFinStatusUpdate.IsActive,
//           Status: newFinStatusUpdate.Status,
//         });

//         return res.status(201).json(newFinStatusUpdate);
//       }
//     } catch (err) {
//       if (err.name === "SequelizeValidationError") {
//         return res.status(400).json({
//           message: "Validation error",
//           details: err.errors.map((e) => e.message),
//         });
//       }

//       if (err.name === "SequelizeUniqueConstraintError") {
//         return res.status(400).json({
//           message: "Unique constraint error",
//           details: err.errors.map((e) => e.message),
//         });
//       }

//       console.error("Error creating or updating FinStatusUpdate:", err);
//       return res.status(500).json({ message: "Internal server error" });
//     } finally {
//       // Clean up temporary file after processing
//       if (req.file && fs.existsSync(req.file.path)) {
//         fs.unlinkSync(req.file.path);
//       }
//     }
//   });
// };

exports.GetStatusData = async (req, res) => {
  try {
    const applicationNo = req.query.ApplicationNo;

    // Initialize response data and messages
    let ApplicationInfo = {};
    let finStatusUpdate = null;
    let finTracking = [];
    let errorMessages = [];

    // Fetch FinanceApplication with related data
    const financeApplication = await FinanceApplication.findOne({
      where: { ApplicationNumber: applicationNo },
      attributes: [
        "FinAppID",
        "ApplicationNumber",
        "CreatedDate",
        "FinancierName",
        "LoanAmt",
        [sequelize.col("FAppBookingID.BookingNo"), "BookingID"],
        [sequelize.col("FAppBookingID.BookingTime"), "BookingDate"],
        "LoanAppCustID",
      ],
      include: [
        {
          model: FinAppApplicant,
          as: "FALoanAppCustID",
          attributes: [
            "FirstName",
            "LastName",
            "PhoneNo",
            "Model",
            "Variant",
            "Transmission",
            "FuelType",
            "Colour",
          ],
          include: [
            {
              model: UserMaster,
              as: "FAAUserID",
              attributes: ["UserName", "Branch"],
            },
          ],
        },
        {
          model: NewCarBookings,
          as: "FAppBookingID",
          attributes: [],
        },
      ],
    });

    if (financeApplication) {
      // Flatten the response
      ApplicationInfo = {
        FinAppID: financeApplication.FinAppID,
        LoanAppCustID: financeApplication.LoanAppCustID,
        ApplicationNumber: financeApplication.ApplicationNumber,
        CreatedDate: financeApplication.CreatedDate,
        FinancierName: financeApplication.FinancierName,
        LoanAmt: financeApplication.LoanAmt,
        BookingID: financeApplication.dataValues.BookingID || null,
        BookingDate: financeApplication.dataValues.BookingDate || null,
        FirstName: financeApplication.FALoanAppCustID.FirstName || null,
        LastName: financeApplication.FALoanAppCustID.LastName || null,
        PhoneNo: financeApplication.FALoanAppCustID.PhoneNo || null,
        Model: financeApplication.FALoanAppCustID.Model || null,
        Variant: financeApplication.FALoanAppCustID.Variant || null,
        Transmission: financeApplication.FALoanAppCustID.Transmission || null,
        FuelType: financeApplication.FALoanAppCustID.FuelType || null,
        Colour: financeApplication.FALoanAppCustID.Colour || null,
        SalesPersonName:
          financeApplication.FALoanAppCustID.FAAUserID.UserName || null,
        Branch: financeApplication.FALoanAppCustID.FAAUserID.Branch || null,
      };
    } else {
      errorMessages.push(
        `No finance application found with Application Number: ${applicationNo}`
      );
    }

    // Fetch FinStatusUpdate and FinStatusTracking data
    if (financeApplication) {
      const finStatusUpdate = await FinStatusUpdate.findOne({
        where: { FinAppID: financeApplication.FinAppID },
        attributes: [
          "FinStatusID",
          "CurrentStage",
          "NextStage",
          "StatusDate",
          "Remarks",
          "FinDocURL",
        ],
      });

      if (finStatusUpdate) {
        const finTracking = await FinStatusTracking.findAll({
          where: { FinStatusID: finStatusUpdate.FinStatusID },
          attributes: ["CurrentStage", "StatusDate"],
          order: [["FinStatusTrackID", "ASC"]],
        });

        res.json({
          ApplicationInfo,
          finTracking,
          finStatusUpdate,
          errorMessages,
        });
      } else {
        errorMessages.push(
          `No status update found for Finance Application ID: ${financeApplication.FinAppID}`
        );
        res.json({
          ApplicationInfo,
          finTracking,
          finStatusUpdate: null,
          errorMessages,
        });
      }
    } else {
      // If financeApplication is not found, send the response with errorMessages only
      res.json({
        ApplicationInfo: null,
        finTracking: [],
        finStatusUpdate: null,
        errorMessages,
      });
    }
  } catch (error) {
    // Handle errors based on specific types
    switch (error.name) {
      case "SequelizeDatabaseError":
        res.status(500).json({
          message:
            "Database error occurred while retrieving financial status update data.",
          details: error.message,
        });
        break;
      case "SequelizeConnectionError":
        res.status(503).json({
          message: "Service unavailable. Could not connect to the database.",
          details: error.message,
        });
        break;
      case "SequelizeValidationError":
        res.status(400).json({
          message: "Validation error occurred.",
          details: error.errors.map((e) => e.message),
        });
        break;
      default:
        res.status(500).json({
          message: "An unexpected error occurred.",
          details: error.message,
        });
        break;
    }
  }
};

exports.ApprovedList = async (req, res) => {
  try {
    const { UserID } = req.query;

    // Fetch all FinanceApplication data for the given UserID
    const financeApplications = await FinanceApplication.findAll({
      where: {
        UserID: UserID, // Match with the UserID from req.body
      },
      attributes: [
        "FinAppID", // Include FinAppID to match with FinStatusUpdate
        "CustomerID",
        "ApplicationNumber",
        "LoanAppCustID",
        "FinancierName",
        "Branch",
        "LoanAmt",
        "BookingID", // Include BookingID
        "UserID", // Include UserID from FinanceApplication
      ],
    });

    // If no finance applications are found for the given UserID
    if (!financeApplications || financeApplications.length === 0) {
      return res.status(404).json({
        message: "No finance applications found for the given UserID.",
      });
    }

    // Extract FinAppID values from the financeApplications
    const finAppIDs = financeApplications.map((fa) => fa.FinAppID);

    // Fetch all FinStatusUpdate records where FinAppID matches, Status is 'Approved', and NextStage is 'Approved'
    const approvedFinStatusUpdates = await FinStatusUpdate.findAll({
      where: {
        FinAppID: finAppIDs, // Filter by FinAppID from financeApplications
        CurrentStage: {
          [Op.or]: ["Approved", "Do-Released"], // Include both "Approved" and "Do-Released"
        },
      },
      attributes: [
        "FinStatusID",
        "FinAppID",
        "CurrentStage",
        "NextStage",
        "StatusDate",
      ],
      include: [
        {
          model: FinanceApplication,
          as: "FSUFinAppID", // Alias for FinanceApplication
          attributes: [
            "CustomerID",
            "ApplicationNumber",
            "LoanAppCustID",
            "FinancierName",
            "Branch",
            "LoanAmt",
            "CreatedDate",
          ],
          include: [
            {
              model: NewCarBookings,
              as: "FAppBookingID", // Alias for NewCarBookings
              attributes: [
                "BookingID",
                "BookingNo",
                "CustomerID",
                "ModelName",
                "ColourName",
                "VariantName",
              ],
            },
            {
              model: CustomerMaster,
              as: "FACustomerID", // Alias for NewCarBookings
              attributes: ["FirstName", "PhoneNo"],
            },
            {
              model: UserMaster,
              as: "FAUserID", // Alias for UserMaster
              attributes: ["UserID", "UserName"],
            },
          ],
        },
      ],
      order: [["StatusDate", "ASC"]], // Order by StatusDate in ascending order
    });

    // Check if there are any approved records
    if (!approvedFinStatusUpdates || approvedFinStatusUpdates.length === 0) {
      return res.status(404).json({
        message: "No approved financial status updates found.",
      });
    }

    // Map the data for response
    const combinedData = approvedFinStatusUpdates.map((item) => ({
      FinStatusID: item.FinStatusID,
      FinAppID: item.FinAppID,
      CurrentStage: item.CurrentStage,
      StatusDate: item.StatusDate,
      NextStage: item.NextStage,

      ApplicationNumber: item.FSUFinAppID
        ? item.FSUFinAppID.ApplicationNumber
        : null,
      LoanAppCustID: item.FSUFinAppID ? item.FSUFinAppID.LoanAppCustID : null,
      FinancierName: item.FSUFinAppID ? item.FSUFinAppID.FinancierName : null,
      Branch: item.FSUFinAppID ? item.FSUFinAppID.Branch : null,
      LoanAmt: item.FSUFinAppID ? item.FSUFinAppID.LoanAmt : null,
      // BookingID: item.FSUFinAppID ? item.FSUFinAppID.BookingID : null,

      // Booking related details from NewCarBookings
      BookingID:
        item.FSUFinAppID && item.FSUFinAppID.FAppBookingID
          ? item.FSUFinAppID.FAppBookingID.BookingID
          : null,
      BookingNo:
        item.FSUFinAppID && item.FSUFinAppID.FAppBookingID
          ? item.FSUFinAppID.FAppBookingID.BookingNo
          : null,
      BookingCustomerID:
        item.FSUFinAppID && item.FSUFinAppID.FAppBookingID
          ? item.FSUFinAppID.FAppBookingID.CustomerID
          : null,
      ModelName:
        item.FSUFinAppID && item.FSUFinAppID.FAppBookingID
          ? item.FSUFinAppID.FAppBookingID.ModelName
          : null,
      ColourName:
        item.FSUFinAppID && item.FSUFinAppID.FAppBookingID
          ? item.FSUFinAppID.FAppBookingID.ColourName
          : null,
      VariantName:
        item.FSUFinAppID && item.FSUFinAppID.FAppBookingID
          ? item.FSUFinAppID.FAppBookingID.VariantName
          : null,
      BranchName:
        item.FSUFinAppID && item.FSUFinAppID.FAppBookingID
          ? item.FSUFinAppID.FAppBookingID.BranchName
          : null,

      // User related details from UserMaster
      FAUserID:
        item.FSUFinAppID && item.FSUFinAppID.FAUserID
          ? item.FSUFinAppID.FAUserID.UserID
          : null,
      FAUserName:
        item.FSUFinAppID && item.FSUFinAppID.FAUserID
          ? item.FSUFinAppID.FAUserID.UserName
          : null,
      CustomerID: item.FSUFinAppID ? item.FSUFinAppID.CustomerID : null,
      FAFirstName:
        item.FSUFinAppID && item.FSUFinAppID.FACustomerID
          ? item.FSUFinAppID.FACustomerID.FirstName
          : null,
      FAPhoneNo:
        item.FSUFinAppID && item.FSUFinAppID.FACustomerID
          ? item.FSUFinAppID.FACustomerID.PhoneNo
          : null,
      ApprovedDate: item.StatusDate,
    }));

    // Return the mapped data
    return res.status(200).json(combinedData);
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching financial status updates",
      error: error.message,
    });
  }
};

exports.ApprovedDetails = async (req, res) => {
  try {
    const { BookingID, FinAppID } = req.query;

    // Fetch the FinanceApplication data for the given BookingID
    const financeApplication = await FinanceApplication.findOne({
      where: {
        BookingID,
        FinAppID, // Adding FinAppID to the where condition
      },
      attributes: ["FinAppID"],
    });

    if (!financeApplication) {
      return res.status(404).json({
        message: "No finance application found for the given BookingID.",
      });
    }

    // Fetch FinStatusUpdate record where FinAppID matches, Status is 'Approved', and NextStage is 'Approved'
    const approvedFinStatusUpdate = await FinStatusUpdate.findOne({
      where: {
        FinAppID: financeApplication.FinAppID,
        NextStage: "Approved",
      },
      attributes: [
        "FinStatusID",
        "FinAppID",
        "CurrentStage",
        "NextStage",
        "StatusDate",
      ],
      include: [
        {
          model: FinanceApplication,
          as: "FSUFinAppID",
          attributes: [
            "CustomerID",
            "ApplicationNumber",
            "LoanAppCustID",
            "FinancierName",
            "Branch",
            "LoanAmt",
            "BookingID",
            "CreatedDate",
          ],
          include: [
            {
              model: NewCarBookings,
              as: "FAppBookingID",
              attributes: [
                "CorporateSchema",
                "RegistrationType",
                "Finance",
                "Insurance",
                "Exchange",
              ],
            },
            {
              model: CustomerMaster,
              as: "FACustomerID",
              attributes: [
                "Title",
                "FirstName",
                "LastName",
                "PhoneNo",
                "Email",
                "DateOfBirth",
                "Occupation",
                "Address",
                "PINCode",
                "DistrictID",
                "StateID",
                "ModelName",
                "VariantName",
                "ColourName",
              ],
              include: [
                {
                  model: RegionMaster,
                  as: "CMRegionID",
                  attributes: ["RegionName"],
                },
                {
                  model: StateMaster,
                  as: "CMStateID",
                  attributes: ["StateName"],
                },
              ],
            },
            {
              model: UserMaster,
              as: "FAUserID",
              attributes: ["UserID", "UserName"],
            },
          ],
        },
      ],
    });

    if (!approvedFinStatusUpdate) {
      return res.status(404).json({
        message:
          "No approved financial status update found for the given BookingID.",
      });
    }

    // Map the data for response
    const combinedData = {
      FinStatusID: approvedFinStatusUpdate.FinStatusID,
      FinAppID: approvedFinStatusUpdate.FinAppID,
      CurrentStage: approvedFinStatusUpdate.CurrentStage,
      StatusDate: approvedFinStatusUpdate.StatusDate,
      NextStage: approvedFinStatusUpdate.NextStage,

      // FinanceApplication data
      ApplicationNumber: approvedFinStatusUpdate.FSUFinAppID.ApplicationNumber,
      LoanAppCustID: approvedFinStatusUpdate.FSUFinAppID.LoanAppCustID,
      FinancierName: approvedFinStatusUpdate.FSUFinAppID.FinancierName,
      Branch: approvedFinStatusUpdate.FSUFinAppID.Branch,
      LoanAmt: approvedFinStatusUpdate.FSUFinAppID.LoanAmt,
      BookingID: approvedFinStatusUpdate.FSUFinAppID.BookingID,

      //Booking data
      CorporateSchema:
        approvedFinStatusUpdate.FSUFinAppID.FAppBookingID.CorporateSchema,
      RegistrationType:
        approvedFinStatusUpdate.FSUFinAppID.FAppBookingID.RegistrationType,
      Finance: approvedFinStatusUpdate.FSUFinAppID.FAppBookingID.Finance,
      Insurance: approvedFinStatusUpdate.FSUFinAppID.FAppBookingID.Insurance,
      Exchange: approvedFinStatusUpdate.FSUFinAppID.FAppBookingID.Exchange,
      // CustomerMaster data
      CustomerID: approvedFinStatusUpdate.FSUFinAppID.CustomerID,
      Title: approvedFinStatusUpdate.FSUFinAppID.FACustomerID.Title,
      FirstName: approvedFinStatusUpdate.FSUFinAppID.FACustomerID.FirstName,
      LastName: approvedFinStatusUpdate.FSUFinAppID.FACustomerID.LastName,
      PhoneNo: approvedFinStatusUpdate.FSUFinAppID.FACustomerID.PhoneNo,
      Email: approvedFinStatusUpdate.FSUFinAppID.FACustomerID.Email,
      DateOfBirth: approvedFinStatusUpdate.FSUFinAppID.FACustomerID.DateOfBirth,
      Occupation: approvedFinStatusUpdate.FSUFinAppID.FACustomerID.Occupation,
      Address: approvedFinStatusUpdate.FSUFinAppID.FACustomerID.Address,
      PINCode: approvedFinStatusUpdate.FSUFinAppID.FACustomerID.PINCode,
      DistrictID: approvedFinStatusUpdate.FSUFinAppID.FACustomerID.DistrictID,
      StateID: approvedFinStatusUpdate.FSUFinAppID.FACustomerID.StateID,
      ModelName: approvedFinStatusUpdate.FSUFinAppID.FACustomerID.ModelName,
      VariantName: approvedFinStatusUpdate.FSUFinAppID.FACustomerID.VariantName,
      ColourName: approvedFinStatusUpdate.FSUFinAppID.FACustomerID.ColourName,

      // RegionMaster and StateMaster data
      RegionName:
        approvedFinStatusUpdate.FSUFinAppID.FACustomerID.CMRegionID
          ?.RegionName || null,
      StateName:
        approvedFinStatusUpdate.FSUFinAppID.FACustomerID.CMStateID?.StateName ||
        null,

      // UserMaster data
      FAUserID: approvedFinStatusUpdate.FSUFinAppID.FAUserID.UserID,
      FAUserName: approvedFinStatusUpdate.FSUFinAppID.FAUserID.UserName,
    };

    return res.status(200).json(combinedData);
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching financial status update",
      error: error.message,
    });
  }
};

exports.StatusCreateWeb = async (req, res) => {
  const transaction = await Seq.transaction(); // Start a transaction

  upload(req, res, async (err) => {
    if (err) {
      console.error("Error uploading file:", err);
      return res.status(400).json({ message: err.message });
    }

    const finStatusID = req.query.FinStatusID;
    const {
      finAppID,
      CurrentStage,
      StatusDate,
      NextStage,
      Remarks,
      isActive,
      CustomerID,
      CustomerType,
      DocTypeID,
    } = req.body;

    // Check if an image is uploaded
    const isImageUploaded = req.file !== undefined;

    // Validate required fields based on image upload
    if (isImageUploaded) {
      if (!CustomerID || !CustomerType || !DocTypeID) {
        return res.status(400).json({
          message:
            "CustomerID, CustomerType, and DocTypeID are required when an image is uploaded.",
        });
      }
    }

    try {
      // Validate finAppID
      if (!finAppID) {
        return res.status(400).json({ message: "FinAppID cannot be empty" });
      }

      // Check if FinanceApplication exists
      const finApp = await FinanceApplication.findByPk(finAppID, {
        transaction,
      });
      if (!finApp) {
        return res
          .status(404)
          .json({ message: `FinAppID ${finAppID} not found` });
      }

      // Check if FinStatusUpdate exists
      let existingModel;
      if (finStatusID) {
        existingModel = await FinStatusUpdate.findByPk(finStatusID, {
          transaction,
        });
      } else {
        existingModel = await FinStatusUpdate.findOne({
          where: { FinAppID: finAppID },
          transaction,
        });
      }

      let docUrl = null;

      if (existingModel) {
        // Existing FinStatusUpdate found
        if (req.file) {
          try {
            const genName = await finApprovedDocument(
              req.file,
              finAppID,
              CurrentStage
            );
            console.log("Generated file name: ", genName);

            const localFilePath = req.file.path;
            const remoteFilePath = process.env.Finance_Documents_PATH + genName;

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
            docUrl = remoteFilePath;
          } catch (genErr) {
            console.error("Error generating document name:", genErr);
            await transaction.rollback(); // Rollback transaction if document generation fails
            return res
              .status(500)
              .json({ message: "Error generating document name" });
          }
        }

        // Check if the stage has changed
        const stageChanged = existingModel.CurrentStage !== CurrentStage;

        if (stageChanged) {
          await FinStatusTracking.create(
            {
              FinStatusID: existingModel.FinStatusID,
              CurrentStage: CurrentStage,
              StatusDate: StatusDate || new Date(),
              IsActive: isActive || existingModel.IsActive,
              Status: existingModel.Status,
            },
            { transaction }
          );
        }
        let newFinanceDocument = null;
        if (docUrl) {
          // Save new FinanceDocument in the database
          newFinanceDocument = await FinanceDocuments.create({
            CustomerID: CustomerID,
            CustomerType: CustomerType,
            DocTypeID: DocTypeID,
            DocURL: docUrl,
            Remarks: Remarks || null,
            DocStatus: "Approved",
            IsActive: isActive !== undefined ? isActive : true,
            Status: isActive === undefined ? "Active" : "InActive",
          });
        }

        // Update existing FinStatusUpdate
        existingModel.CurrentStage = CurrentStage;
        existingModel.StatusDate = StatusDate || new Date();
        existingModel.NextStage = NextStage || null;
        existingModel.Remarks = Remarks || existingModel.Remarks;
        existingModel.IsActive =
          isActive !== undefined ? isActive : existingModel.IsActive;
        existingModel.ModifiedDate = new Date();
        if (CurrentStage === "Do-Released") {
          existingModel.FinDocURL = docUrl ? docUrl : existingModel.FinDocURL;
        }

        const updatedFinStatusUpdate = await existingModel.save({
          transaction,
        });

        await transaction.commit(); // Commit transaction if all operations succeed
        return res
          .status(200)
          .json({ updatedFinStatusUpdate, newFinanceDocument });
      } else {
        let newFinanceDocument = null;

        // No existing FinStatusUpdate, create a new one
        const newFinStatusUpdate = await FinStatusUpdate.create(
          {
            FinAppID: finAppID,
            CurrentStage: CurrentStage || "Application Created",
            StatusDate: StatusDate || new Date(),
            NextStage: NextStage || null,
            Remarks: Remarks || null,
            FinDocURL: docUrl || null,
            Status: isActive || "Active",
            IsActive: isActive || true,
          },
          { transaction }
        );

        await FinStatusTracking.create(
          {
            FinStatusID: newFinStatusUpdate.FinStatusID,
            CurrentStage: newFinStatusUpdate.CurrentStage,
            StatusDate: newFinStatusUpdate.StatusDate,
            IsActive: newFinStatusUpdate.IsActive,
            Status: newFinStatusUpdate.Status,
          },
          { transaction }
        );
        if (docUrl) {
          // Save new FinanceDocument in the database
          newFinanceDocument = await FinanceDocuments.create({
            CustomerID: CustomerID,
            CustomerType: CustomerType,
            DocTypeID: DocTypeID,
            DocURL: docUrl,
            Remarks: Remarks || null,
            DocStatus: "Approved",
            IsActive: isActive !== undefined ? isActive : true,
            Status: isActive === undefined ? "Active" : "InActive",
          });
        }

        await transaction.commit(); // Commit transaction if all operations succeed
        return res.status(201).json(newFinStatusUpdate);
      }
    } catch (err) {
      // Rollback the transaction in case of error
      try {
        await transaction.rollback();
      } catch (rollbackError) {
        console.error("Transaction rollback failed:", rollbackError);
      }

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

      console.error("Error creating or updating FinStatusUpdate:", err);
      return res.status(500).json({ message: "Internal server error" });
    } finally {
      // Clean up temporary file after processing
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    }
  });
};
