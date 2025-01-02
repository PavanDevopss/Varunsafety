/* eslint-disable no-unused-vars */
const db = require("../models");
const FinancePayments = db.financepayments;
const FinanceApplication = db.financeapplication;
const FinanceDocuments = db.financedocuments;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;
const BranchMaster = db.branchmaster;
const FinanceLoanapplication = db.financeloanapplication;
const FinAppApplicant = db.finappapplicant;
const FinAppCoApplicant = db.finappcoapplicant;
const NewCarBookings = db.NewCarBookings;
const UserMaster = db.usermaster;
const FinanceMaster = db.financemaster;
const PaymentRequest = db.PaymentRequests;
const CustomerMaster = db.customermaster;
const fs = require("fs");
const path = require("path");
const { validationResult } = require("express-validator");
const { configureMulter } = require("../Utils/multerService");
const { transferImageToServer } = require("../Utils/sshService");
const { finApprovedDocument } = require("../Utils/generateService");

// Configure Multer
const upload = configureMulter(
  // "C:/Users/varun/OneDrive/Desktop/uploads/", // Adjust the upload path as needed
  "/home/administrator/VARUNGROUP/IMAGES_VMS_MARUTI",
  1000000, // File size limit (1MB)
  ["jpeg", "jpg", "png", "gif"], // Allowed file types
  "DocURL"
);

// Basic CRUD API
// Create and Save a new FinancePayments

exports.create = async (req, res) => {
  // Handle file upload and other operations
  upload(req, res, async (err) => {
    if (err) {
      console.error("Error uploading file:", err);
      return res.status(400).json({ message: err.message });
    }

    console.log("Received request body:", req.body);

    // Start a transaction
    const transaction = await Seq.transaction();

    try {
      // Step 1: Check if FinanceApplication exists
      if (!req.body.FinAppID) {
        console.error("Finance application ID is missing.");
        return res
          .status(400)
          .json({ message: "Finance application ID cannot be empty" });
      }

      console.log(
        "Checking existence of FinanceApplication with ID:",
        req.body.FinAppID
      );
      const existingFinApplication = await FinanceApplication.findOne({
        where: { FinAppID: req.body.FinAppID },
        transaction,
      });

      if (!existingFinApplication) {
        console.error("Finance Application does not exist.");
        return res
          .status(400)
          .json({ message: "Finance Application doesn't exist" });
      }

      // Step 2: Create FinancePayments
      const financePaymentsData = {
        FinAppID: req.body.FinAppID || null,
        CustomerID: req.body.CustomerID || null,
        LoanAppCustID: req.body.LoanAppCustID || null,
        BookingID: req.body.BookingID || null,
        FinanceLoanID: req.body.FinanceLoanID || null,
        FinDocID: req.body.FinDocID || null,
        UserID: req.body.UserID || null,
        PaymentMode: req.body.PaymentMode || null,
        ApplicationCategory: req.body.ApplicationCategory || null,
        FinancerType: req.body.FinancerType || null,
        Financer: req.body.Financer || null,
        Branch: req.body.Branch || null,
        LoanAmt: req.body.LoanAmt || null,
        UTRNo: req.body.UTRNo || null,
        FinPaymentStatus: req.body.FinPaymentStatus || null,
        PayoutType: req.body.PayoutType || null,
        DealerPayout: req.body.DealerPayout || null,
        ExecutivePayout: req.body.ExecutivePayout || null,
        TotalPayout: req.body.TotalPayout || null,
        IsActive: req.body.IsActive || true,
        Status: req.body.Status || "Active",
      };

      console.log("Creating FinancePayments with data:", financePaymentsData);
      const newFinancePayments = await FinancePayments.create(
        financePaymentsData,
        { transaction }
      );

      console.log("FinancePayments created:", newFinancePayments);

      // Step 3: Handle file upload if present
      if (req.file) {
        try {
          const genName = `${req.body.FinAppID}_${req.body.PaymentMode}`;
          console.log("Generated file name:", genName);

          const localFilePath = req.file.path;
          const extension = path.extname(req.file.originalname);

          const remoteFilePath =
            process.env.Finance_Documents_PATH + genName + extension;

          const sshConfig = {
            host: process.env.SSH_HOST,
            port: process.env.SSH_PORT,
            username: process.env.SSH_USERNAME,
            privateKeyPath: process.env.SSH_PRIVATE_KEY_PATH,
          };

          console.log(
            "Transferring file to server:",
            localFilePath,
            "->",
            remoteFilePath
          );
          await transferImageToServer(
            localFilePath,
            remoteFilePath,
            sshConfig,
            "upload"
          );

          // Step 4: Create FinanceDocuments
          const financeDocumentData = {
            CustomerID: existingFinApplication.LoanAppCustID || null,
            CustomerType: "Applicant" || null,
            DocTypeID: 11 || null,
            DocURL: remoteFilePath || null,
            IsActive: req.body.IsActive || true,
            Status: req.body.Status || "Active",
          };

          console.log(
            "Creating FinanceDocuments with data:",
            financeDocumentData
          );
          const newFinanceDoc = await FinanceDocuments.create(
            financeDocumentData,
            { transaction }
          );
          console.log("FinanceDocuments created:", newFinanceDoc);

          // Step 5: Update FinancePayments with FinDocID
          await newFinancePayments.update(
            { FinDocID: newFinanceDoc.FinDocID },
            { transaction }
          );
          console.log(
            "Updated FinancePayments with FinDocID:",
            newFinanceDoc.FinDocID
          );
        } catch (genErr) {
          console.error("Error creating finance document:", genErr);
          await transaction.rollback(); // Rollback transaction if document generation fails
          return res.status(500).json({ message: "Error generating document" });
        }
      }

      // Step 6: Commit transaction
      await transaction.commit();
      console.log("Transaction committed successfully.");

      // Step 7: Send response
      return res.status(201).json(newFinancePayments);
    } catch (err) {
      // Rollback transaction on general errors
      await transaction.rollback();
      console.error("Error creating model:", err);

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

      return res.status(500).json({ message: "Internal server error" });
    } finally {
      // Clean up temporary file after processing
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
        console.log("Temporary file cleaned up:", req.file.path);
      }
    }
  });
};

// Retrieve all OEMMasters from the database.
exports.findAll = async (req, res) => {
  try {
    // Fetch all finance payment data
    const finPaymentData = await FinancePayments.findAll({
      attributes: [
        "FinPaymentID",
        "FinAppID",
        "CustomerID",
        "LoanAppCustID",
        "BookingID",
        "FinanceLoanID",
        "FinDocID",
        "PaymentMode",
        "ApplicationCategory",
        "FinancerType",
        "Financer",
        "Branch",
        "LoanAmt",
        "UTRNo",
        "FinPaymentStatus",
        "PayoutType",
        "DealerPayout",
        "ExcutivePayout",
        "TotalPayout",
        "IsActive",
        "Status",
        "CreatedDate",
        "ModifiedDate",
      ],
      include: [
        {
          model: FinanceApplication,
          as: "FPFinAppID",
          // attributes: ["BranchID", "BranchName"], // Include BranchID and BranchName attributes
        },
        {
          model: FinanceDocuments,
          as: "FPFinDocID",
          // attributes: ["BranchID", "BranchName"], // Include BranchID and BranchName attributes
        },
      ],
      order: [
        ["FinPaymentID", "ASC"], // Order by ModelDescription in ascending order
      ],
    });

    // Check if data is empty
    if (!finPaymentData || finPaymentData.length === 0) {
      return res.status(404).json({
        message: "No finPayment data found.",
      });
    }

    // Map the data for response
    // const combinedData = clusterData.map((item) => ({
    //   ClusterID: item.ClusterID,
    //   ClusterName: item.ClusterName,
    //   ClusterType: item.ClusterType,
    //   BranchID: item.CMBranchID ? item.CMBranchID.BranchID : null, // Access BranchID from the branch association
    //   BranchName: item.CMBranchID ? item.CMBranchID.BranchName : null, // Access BranchName from the branch association
    //   IsActive: item.IsActive,
    //   Status: item.Status,
    // }));

    // Send the combined data as response
    res.json(finPaymentData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while retrieving cluster name data.",
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
    // Handle errors
    console.error("Error retrieving finPayment data:", error);
    res.status(500).json({
      message: "Failed to retrieve finPayment data. Please try again later.",
    });
  }
};

// Find a single OEMMaster with an id
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;

    // Fetch the finance payment data
    const finPaymentData = await FinancePayments.findOne({
      where: { FinPaymentID: id },
      attributes: [
        "FinPaymentID",
        "FinAppID",
        "CustomerID",
        "LoanAppCustID",
        "BookingID",
        "FinanceLoanID",
        "FinDocID",
        "PaymentMode",
        "ApplicationCategory",
        "FinancerType",
        "Financer",
        "Branch",
        "LoanAmt",
        "UTRNo",
        "FinPaymentStatus",
        "PayoutType",
        "DealerPayout",
        "ExcutivePayout",
        "TotalPayout",
        "IsActive",
        "Status",
        "CreatedDate",
        "ModifiedDate",
      ],
      include: [
        {
          model: FinanceApplication,
          as: "FPFinAppID",
          // attributes: ["BranchID", "BranchName"], // Include BranchID and BranchName attributes
        },
        {
          model: FinanceDocuments,
          as: "FPFinDocID",
          // attributes: ["BranchID", "BranchName"], // Include BranchID and BranchName attributes
        },
      ],
      order: [
        ["FinPaymentID", "ASC"], // Order by ModelDescription in ascending order
      ],
    });

    // Check if data is found
    if (!finPaymentData) {
      return res.status(404).json({
        message: "finPayment data not found.",
      });
    }

    // Prepare the response data
    // const responseData = {
    //   ClusterID: finPaymentData.ClusterID,
    //   ClusterName: finPaymentData.ClusterName,
    //   ClusterType: finPaymentData.ClusterType,
    //   BranchID: finPaymentData.CMBranchID ? finPaymentData.CMBranchID.BranchID : null, // Access BranchID from the branchMaster association
    //   BranchName: finPaymentData.CMBranchID
    //     ? finPaymentData.CMBranchID.BranchName
    //     : null, // Access BranchName from the branchMaster association
    //   IsActive: finPaymentData.IsActive,
    //   Status: finPaymentData.Status,
    // };

    // Send the response data
    res.json(finPaymentData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while retrieving cluster data.",
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
    // Handle errors
    console.error("Error retrieving finPayment data:", error);
    res.status(500).json({
      message: "Failed to retrieve finPayment data. Please try again later.",
    });
  }
};

// Update a OEMMaster by the id in the request
exports.update = async (req, res) => {
  upload(req, res, async (err) => {
    const { id } = req.params;
    console.log("Received update request for FinancePayment ID:", id);

    // Start a transaction
    const transaction = await Seq.transaction();

    try {
      // Step 1: Retrieve FinancePayments by ID
      console.log("Fetching FinancePayments with ID:", id);
      const existingFinancePayments = await FinancePayments.findOne({
        where: { FinPaymentID: id },
        include: [
          {
            model: FinanceApplication,
            as: "FPFinAppID",
          },
          {
            model: FinanceDocuments,
            as: "FPFinDocID",
          },
        ],
        transaction,
      });

      if (!existingFinancePayments) {
        console.error("FinancePayments with ID does not exist.");
        return res.status(404).json({ message: "FinancePayments not found" });
      }

      // Step 2: Update FinancePayments
      existingFinancePayments.FinAppID =
        req.body.FinAppID || existingFinancePayments.FinAppID;
      existingFinancePayments.CustomerID =
        req.body.CustomerID || existingFinancePayments.CustomerID;
      existingFinancePayments.LoanAppCustID =
        req.body.LoanAppCustID || existingFinancePayments.LoanAppCustID;
      existingFinancePayments.BookingID =
        req.body.BookingID || existingFinancePayments.BookingID;
      existingFinancePayments.FinanceLoanID =
        req.body.FinanceLoanID || existingFinancePayments.FinanceLoanID;
      existingFinancePayments.FinDocID =
        req.body.FinDocID || existingFinancePayments.FinDocID;
      existingFinancePayments.PaymentMode =
        req.body.PaymentMode || existingFinancePayments.PaymentMode;
      existingFinancePayments.ApplicationCategory =
        req.body.ApplicationCategory ||
        existingFinancePayments.ApplicationCategory;
      existingFinancePayments.FinancerType =
        req.body.FinancerType || existingFinancePayments.FinancerType;
      existingFinancePayments.Financer =
        req.body.Financer || existingFinancePayments.Financer;
      existingFinancePayments.Branch =
        req.body.Branch || existingFinancePayments.Branch;
      existingFinancePayments.LoanAmt =
        req.body.LoanAmt || existingFinancePayments.LoanAmt;
      existingFinancePayments.UTRNo =
        req.body.UTRNo || existingFinancePayments.UTRNo;
      existingFinancePayments.FinPaymentStatus =
        req.body.FinPaymentStatus || existingFinancePayments.FinPaymentStatus;
      existingFinancePayments.PayoutType =
        req.body.PayoutType || existingFinancePayments.PayoutType;
      existingFinancePayments.DealerPayout =
        req.body.DealerPayout || existingFinancePayments.DealerPayout;
      existingFinancePayments.ExecutivePayout =
        req.body.ExecutivePayout || existingFinancePayments.ExecutivePayout;
      existingFinancePayments.TotalPayout =
        req.body.TotalPayout || existingFinancePayments.TotalPayout;
      existingFinancePayments.IsActive =
        req.body.IsActive !== undefined
          ? req.body.IsActive
          : existingFinancePayments.IsActive;
      existingFinancePayments.Status =
        req.body.Status || existingFinancePayments.Status;
      existingFinancePayments.ModifiedDate = new Date();
      console.log(
        "Updating FinancePayments with data:",
        existingFinancePayments
      );
      await existingFinancePayments.save({ transaction });

      // Step 3: Handle file upload if present
      if (req.file) {
        console.log("Processing file upload.");
        try {
          const extension = path.extname(req.file.originalname);
          const genName = `${
            req.body.FinAppID || existingFinancePayments.FinAppID
          }_${
            req.body.PaymentMode || existingFinancePayments.PaymentMode
          }${extension}`;
          console.log("Generated file name:", genName);

          const localFilePath = req.file.path;
          const remoteFilePath = process.env.Finance_Documents_PATH + genName;

          const sshConfig = {
            host: process.env.SSH_HOST,
            port: process.env.SSH_PORT,
            username: process.env.SSH_USERNAME,
            privateKeyPath: process.env.SSH_PRIVATE_KEY_PATH,
          };

          console.log(
            "Transferring file to server:",
            localFilePath,
            "->",
            remoteFilePath
          );
          await transferImageToServer(
            localFilePath,
            remoteFilePath,
            sshConfig,
            "upload"
          );

          // Step 4: Create or Update FinanceDocuments
          let financeDocument;
          if (existingFinancePayments.FinDocID) {
            console.log(
              "Updating existing FinanceDocuments with ID:",
              existingFinancePayments.FinDocID
            );
            financeDocument = await FinanceDocuments.findOne({
              where: { FinDocID: existingFinancePayments.FinDocID },
              transaction,
            });
            if (financeDocument) {
              await financeDocument.update(
                {
                  DocURL: remoteFilePath,
                  IsActive:
                    req.body.IsActive !== undefined
                      ? req.body.IsActive
                      : financeDocument.IsActive,
                  Status: req.body.Status || financeDocument.Status,
                  ModifiedDate: new Date(),
                },
                { transaction }
              );
              console.log("FinanceDocuments updated:", financeDocument);
            } else {
              console.error("FinanceDocuments to update not found.");
            }
          } else {
            console.log("Creating new FinanceDocuments.");
            financeDocument = await FinanceDocuments.create(
              {
                CustomerID: existingFinancePayments.FPFinAppID.LoanAppCustID,
                CustomerType: "Applicant",
                DocTypeID: 11,
                DocURL: remoteFilePath,
                IsActive:
                  req.body.IsActive !== undefined ? req.body.IsActive : true,
                Status: req.body.Status || "Active",
              },
              { transaction }
            );
            console.log("FinanceDocuments created:", financeDocument);
          }

          // Step 5: Update FinancePayments with new or existing FinDocID
          await existingFinancePayments.update(
            {
              FinDocID: financeDocument.FinDocID,
              ModifiedDate: new Date(),
            },
            { transaction }
          );
          console.log(
            "Updated FinancePayments with new FinDocID:",
            financeDocument.FinDocID
          );
        } catch (err) {
          // Rollback transaction on file operation errors
          await transaction.rollback();
          console.error("Error processing file:", err);
          return res
            .status(500)
            .json({ message: "File processing error", details: err.message });
        }
      }

      // Step 6: Commit transaction
      await transaction.commit();
      console.log("Transaction committed successfully.");

      // Step 7: Send response
      return res.status(200).json(existingFinancePayments);
    } catch (err) {
      // Rollback transaction on general errors
      await transaction.rollback();
      console.error("Error updating FinancePayments:", err);

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

      return res.status(500).json({ message: "Internal server error" });
    } finally {
      // Clean up temporary file after processing
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
        console.log("Temporary file cleaned up:", req.file.path);
      }
    }
  });
};

// Delete a OEMMaster with the specified id in the request
exports.deleteById = async (req, res) => {
  const id = req.params.id;

  try {
    // Find the model by ID
    const financePayments = await FinancePayments.findByPk(id);

    // Check if the model exists
    if (!financePayments) {
      return res
        .status(404)
        .json({ message: "FinancePayments not found with id: " + id });
    }

    // Delete the model
    await financePayments.destroy();

    // Send a success message
    res.status(200).json({
      message: "FinancePayments with id: " + id + " deleted successfully",
    });
  } catch (err) {
    // Handle errors based on specific types
    if (err.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while deleting FinancePayments.",
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
    console.error("Error deleting FinancePayments:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// exports.ApprovedfindOne = async (req, res) => {
//   try {
//     // Extract the FinPaymentID from req.params and the body parameters
//     const { FinPaymentID } = req.query;
//     const { ApplicationCategory } = req.query;

//     // // Validate LoanAppCustID - ensure it's an integer
//     // if (isNaN(parseInt(LoanAppCustID))) {
//     //   return res.status(400).json({
//     //     message: "Invalid LoanAppCustID. It should be an integer.",
//     //   });
//     // }

//     // Fetch finance payment data based on matching FinPaymentID
//     const finPaymentData = await FinancePayments.findOne({
//       where: { FinPaymentID },
//       attributes: [
//         "FinancePaymentID",
//         "FinAppID",
//         "PaymentMode",
//         "ApplicationCategory",
//         "FinancierType",
//         "Financier",
//         "Branch",
//         "LoanAmount",
//         "UTRNumber",
//         "FinPaymentStatus",
//         "FinDocID",
//         "PayoutType",
//         "DealerPayout",
//         "ExecutivePayout",
//         "TotalPayout",
//         "CustomerID",
//         "LoanAppCustID",
//         "BookingID",
//         "FinanceLoanID",
//         "IsActive",
//       ],
//       include: [
//         // Include data from FinanceApplication only if ApplicationCategory is "Inhouse"
//         ApplicationCategory === "Inhouse"
//           ? {
//               model: FinanceApplication,
//               as: "FPFinAppID",
//               attributes: [
//                 "CustomerID",
//                 "ApplicationNumber",
//                 "LoanAppCustID",
//                 "FinancierName",
//                 "Branch",
//                 "LoanAmt",
//                 "BookingID",
//                 "CreatedDate",
//               ],
//               include: [
//                 {
//                   model: NewCarBookings,
//                   as: "FAppBookingID",
//                   attributes: [
//                     "CorporateSchema",
//                     "RegistrationType",
//                     "Finance",
//                     "Insurance",
//                     "Exchange",
//                     "ModelName",
//                     "ColourName",
//                     "VariantName",
//                   ],
//                 },
//                 {
//                   model: FinAppApplicant,
//                   as: "FALoanAppCustID",
//                   attributes: [
//                     "LoanAppCustID",
//                     "Title",
//                     "FirstName",
//                     "LastName",
//                     "PhoneNo",
//                     "Email",
//                     "Gender",
//                     "DateOfBirth",
//                     "Occupation",
//                     "Address",
//                     "District",
//                     "State",
//                     "PinCode",
//                     "IncomeSource",
//                     "AnnualIncome",
//                     "MonthlyIncome",
//                     "IsCoApplicant",
//                   ],
//                   include: [
//                     {
//                       model: FinAppCoApplicant,
//                       as: "coApplicants",
//                       attributes: [
//                         "LoanAppCoCustID",
//                         "FinAppID",
//                         "LoanAppCustID",
//                         "Title",
//                         "FirstName",
//                         "LastName",
//                         "PhoneNo",
//                         "Email",
//                         "Gender",
//                         "DateOfBirth",
//                         "Occupation",
//                         "Company",
//                         "Address",
//                         "District",
//                         "State",
//                         "PINCode",
//                         "IncomeSource",
//                         "AnnualIncome",
//                         "EMIDeduction",
//                         "MonthlyIncome",
//                         "MonthlyNetIncome",
//                       ],
//                     },
//                   ],
//                 },
//               ],
//             }
//           : null,

//         // Include data from FinAppApplicant if ApplicationCategory is "Self"
//         ApplicationCategory === "Self"
//           ? {
//               model: FinAppApplicant,
//               as: "FALoanAppCustID",
//               // where: { LoanAppCustID: parseInt(LoanAppCustID) }, // Ensure LoanAppCustID is an integer
//               attributes: [
//                 "LoanAppCustID",
//                 "Title",
//                 "FirstName",
//                 "LastName",
//                 "PhoneNo",
//                 "Email",
//                 "Gender",
//                 "DateOfBirth",
//                 "Occupation",
//                 "Address",
//                 "District",
//                 "State",
//                 "PinCode",
//                 "IncomeSource",
//                 "AnnualIncome",
//                 "MonthlyIncome",
//                 "IsCoApplicant",
//               ],
//               include: [
//                 {
//                   model: FinAppCoApplicant,
//                   as: "coApplicants",
//                   attributes: [
//                     "LoanAppCoCustID",
//                     "FinAppID",
//                     "LoanAppCustID",
//                     "Title",
//                     "FirstName",
//                     "LastName",
//                     "PhoneNo",
//                     "Email",
//                     "Gender",
//                     "DateOfBirth",
//                     "Occupation",
//                     "Company",
//                     "Address",
//                     "District",
//                     "State",
//                     "PINCode",
//                     "IncomeSource",
//                     "AnnualIncome",
//                     "EMIDeduction",
//                     "MonthlyIncome",
//                     "MonthlyNetIncome",
//                   ],
//                 },
//               ],
//             }
//           : null,
//       ].filter(Boolean), // Filter out any null includes
//       order: [["CreatedDate", "DESC"]], // Order by CreatedDate in descending order
//     });

//     // Check if data is empty
//     if (!finPaymentData) {
//       return res.status(404).json({
//         message: "No finance payment data found.",
//       });
//     }

//     // Send the response with finance payment data
//     res.json(finPaymentData);
//   } catch (error) {
//     // Handle specific types of errors
//     if (error.name === "SequelizeDatabaseError") {
//       return res.status(500).json({
//         message:
//           "Database error occurred while retrieving finance payment data.",
//         details: error.message,
//       });
//     }

//     if (error.name === "SequelizeConnectionError") {
//       return res.status(503).json({
//         message: "Service unavailable. Unable to connect to the database.",
//         details: error.message,
//       });
//     }

//     // Log error and send a generic error response
//     console.error("Error retrieving finance payment data:", error);
//     res.status(500).json({
//       message:
//         "Failed to retrieve finance payment data. Please try again later.",
//     });
//   }
// };
exports.PaymentApprovedList = async (req, res) => {
  try {
    const { UserID } = req.query;

    // Check if the UserID is provided
    if (!UserID) {
      return res.status(400).json({ message: "UserID is required." });
    }

    let approvedFinInhouse, approvedFinSelf;

    // Fetch Inhouse and Self finance application payments with Approved/Pending status
    const statusConditions = ["Approved", "Pending"];

    // Fetch approved/pending Inhouse finance application payments
    approvedFinInhouse = await FinancePayments.findAll({
      where: {
        Status: statusConditions, // Fetch both Approved and Pending
        ApplicationCategory: "Inhouse",
        UserID: UserID,
      },
      include: [
        {
          model: FinanceLoanapplication,
          as: "FPFinanceLoanID",
          attributes: ["NetDisbursement"],
          include: [
            {
              model: FinanceApplication,
              as: "FinanceloanFinAppID",
              attributes: [
                "ApplicationNumber",
                "LoanAppCustID",
                "FinancierName",
                "LoanAmt",
                "BookingID",
                "CreatedDate",
              ],
              include: [
                {
                  model: NewCarBookings,
                  as: "FAppBookingID",
                  attributes: [
                    "BookingNo",
                    "ModelName",
                    "ColourName",
                    "VariantName",
                  ],
                },
                {
                  model: FinanceMaster,
                  as: "FAFinancierID",
                  attributes: [
                    "FinancierName",
                    "Category",
                    "Location",
                    "FinancierCode",
                  ],
                },
                {
                  model: FinAppApplicant,
                  as: "FALoanAppCustID",
                  attributes: ["Title", "FirstName", "LastName"],
                },
              ],
            },
          ],
        },
        {
          model: UserMaster,
          as: "FPFinUserID",
          attributes: ["UserID", "UserName"],
        },
      ],
      attributes: [
        "PaymentMode",
        "ApplicationCategory",
        "FinancerType",
        "Financer",
        "Branch",
        "LoanAmt",
        "UTRNo",
        "FinPaymentStatus",
        "PayoutType",
        "DealerPayout",
        "ExcutivePayout",
        "TotalPayout",
        "Status",
      ],
      order: [["CreatedDate", "DESC"]],
    });

    // Fetch approved/pending Self-finance application payments
    approvedFinSelf = await FinancePayments.findAll({
      where: {
        Status: statusConditions, // Fetch both Approved and Pending
        ApplicationCategory: "Self",
        UserID: UserID,
      },
      include: [
        {
          model: FinanceLoanapplication,
          as: "FPFinanceLoanID",
          attributes: ["NetDisbursement"],
          include: [
            {
              model: FinAppApplicant,
              as: "FinanceloanappID",
              attributes: [
                "FirstName",
                "LastName",
                "Model",
                "Variant",
                "FuelType",
                "Colour",
              ],
            },
            {
              model: FinanceMaster,
              as: "FLAFinancierID",
              attributes: [
                "FinancierName",
                "Category",
                "Location",
                "FinancierCode",
              ],
            },
          ],
        },
        {
          model: UserMaster,
          as: "FPFinUserID",
          attributes: ["UserID", "UserName"],
        },
      ],
      attributes: [
        "PaymentMode",
        "ApplicationCategory",
        "FinancerType",
        "Financer",
        "Branch",
        "LoanAmt",
        "UTRNo",
        "FinPaymentStatus",
        "PayoutType",
        "DealerPayout",
        "ExcutivePayout",
        "TotalPayout",
        "Status",
      ],
      order: [["CreatedDate", "DESC"]],
    });

    // Map data to the required format without prefixes
    const formattedInhouseData = approvedFinInhouse.map((payment) => ({
      PaymentMode: payment.PaymentMode,
      ApplicationCategory: payment.ApplicationCategory,
      FinancerType: payment.FinancerType,
      Financer: payment.Financer,
      Branch: payment.Branch,
      LoanAmt: payment.LoanAmt,
      UTRNo: payment.UTRNo,
      FinPaymentStatus: payment.FinPaymentStatus,
      PayoutType: payment.PayoutType,
      DealerPayout: payment.DealerPayout,
      ExcutivePayout: payment.ExcutivePayout,
      TotalPayout: payment.TotalPayout,
      Status: payment.Status,

      ApplicationNumber:
        payment.FPFinanceLoanID?.FinanceloanFinAppID?.ApplicationNumber || null,
      LoanAppCustID:
        payment.FPFinanceLoanID?.FinanceloanFinAppID?.LoanAppCustID || null,
      FinancierName:
        payment.FPFinanceLoanID?.FinanceloanFinAppID?.FinancierName || null,
      LoanAmtFinApp:
        payment.FPFinanceLoanID?.FinanceloanFinAppID?.LoanAmt || null,
      CreatedDate:
        payment.FPFinanceLoanID?.FinanceloanFinAppID?.CreatedDate || null,
      BookingNo:
        payment.FPFinanceLoanID?.FinanceloanFinAppID?.FAppBookingID
          ?.BookingNo || null,
      ModelName:
        payment.FPFinanceLoanID?.FinanceloanFinAppID?.FAppBookingID
          ?.ModelName || null,
      ColourName:
        payment.FPFinanceLoanID?.FinanceloanFinAppID?.FAppBookingID
          ?.ColourName || null,
      VariantName:
        payment.FPFinanceLoanID?.FinanceloanFinAppID?.FAppBookingID
          ?.VariantName || null,
      Title:
        payment.FPFinanceLoanID?.FinanceloanFinAppID?.FALoanAppCustID?.Title ||
        null,
      FirstName:
        payment.FPFinanceLoanID?.FinanceloanFinAppID?.FALoanAppCustID
          ?.FirstName || null,
      LastName:
        payment.FPFinanceLoanID?.FinanceloanFinAppID?.FALoanAppCustID
          ?.LastName || null,
      UserName: payment.FPFinUserID?.UserName || null,
    }));

    const formattedSelfData = approvedFinSelf.map((payment) => ({
      PaymentMode: payment.PaymentMode,
      ApplicationCategory: payment.ApplicationCategory,
      FinancerType: payment.FinancerType,
      Financer: payment.Financer,
      Branch: payment.Branch,
      LoanAmt: payment.LoanAmt,
      UTRNo: payment.UTRNo,
      FinPaymentStatus: payment.FinPaymentStatus,
      PayoutType: payment.PayoutType,
      DealerPayout: payment.DealerPayout,
      ExcutivePayout: payment.ExcutivePayout,
      TotalPayout: payment.TotalPayout,
      Status: payment.Status,
      FirstName: payment.FPFinanceLoanID?.FinanceloanappID?.FirstName || null,
      LastName: payment.FPFinanceLoanID?.FinanceloanappID?.LastName || null,
      Model: payment.FPFinanceLoanID?.FinanceloanappID?.Model || null,
      Variant: payment.FPFinanceLoanID?.FinanceloanappID?.Variant || null,
      FuelType: payment.FPFinanceLoanID?.FinanceloanappID?.FuelType || null,
      Colour: payment.FPFinanceLoanID?.FinanceloanappID?.Colour || null,
      UserName: payment.FPFinUserID?.UserName || null,
    }));

    // Combine data
    const combinedData = [...formattedInhouseData, ...formattedSelfData];

    // Return combined result
    return res.status(200).json(combinedData);
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching payment data",
      error: error.message,
    });
  }
};

exports.PaymentSearch = async (req, res) => {
  try {
    const { UserID, searchValue } = req.query;

    // Check if the UserID is provided
    if (!UserID) {
      return res.status(400).json({ message: "UserID is required." });
    }

    // Define a common search condition based on searchValue
    const searchCondition = searchValue
      ? {
          [Op.or]: [
            {
              "$FinanceloanFinAppID.FALoanAppCustID.FirstName$": {
                [Op.iLike]: `%${searchValue}%`,
              },
            },
            {
              "$FinanceloanFinAppID.FALoanAppCustID.PhoneNo$": {
                [Op.like]: `%${searchValue}%`,
              },
            },
            {
              "$FinanceloanFinAppID.ApplicationNumber$": {
                [Op.like]: `%${searchValue}%`,
              },
            },
            {
              RefAppNo: {
                [Op.like]: `%${searchValue}%`,
              },
            },
          ],
        }
      : {};

    // Fetch Inhouse finance application
    const approvedFinInhouse = await FinanceLoanapplication.findAll({
      where: {
        UserID: UserID,
        ...searchCondition, // Combine conditions
      },
      include: [
        {
          model: NewCarBookings,
          as: "FinanceloanBookingID",
          attributes: [
            "Title",
            "FirstName",
            "LastName",
            "PhoneNo",
            "ModelName",
            "VariantName",
            "Fuel",
            "ColourName",
          ],
        },
        {
          model: FinAppApplicant,
          as: "FinanceloanappID",
          attributes: [
            "Title",
            "FirstName",
            "LastName",
            "PhoneNo",
            "Model",
            "Variant",
            "FuelType",
            "Colour",
          ],
        },
        {
          model: FinanceApplication,
          as: "FinanceloanFinAppID",
          attributes: [
            "ApplicationNumber",
            "LoanAppCustID",
            "FinancierName",
            "LoanAmt",
            "BookingID",
            "CreatedDate",
          ],
          include: [
            {
              model: FinAppApplicant,
              as: "FALoanAppCustID",
              attributes: [
                "Title",
                "FirstName",
                "LastName",
                "PhoneNo",
                "Model",
                "Variant",
                "FuelType",
                "Colour",
              ],
            },
          ],
        },
        {
          model: FinanceMaster,
          as: "FLAFinancierID",
          attributes: [
            "FinancierName",
            "Category",
            "Location",
            "FinancierCode",
          ],
        },
        {
          model: UserMaster,
          as: "FinanceloanUserID",
          attributes: ["UserID", "UserName", "Branch"],
        },
        {
          model: CustomerMaster,
          as: "FinanceloanCustomerID",
          attributes: ["CustomerID", "CustID"],
        },
      ],
      attributes: [
        "FinanceLoanID",
        "RefAppNo",
        "Category",
        "BookingID",
        "CustomerID",
        "FinancierID",
        "FinAppID",
        "LoanAppCustID",
        "UserID",
        "SanctionAmount",
        "ApprovedDate",
        "ApplicationStatus",
        "TotalDeductions",
        "PaymentStatus",
        "CreatedDate",
      ],
      order: [["CreatedDate", "DESC"]],
    });

    // Map the results to include all necessary fields
    const mappedResults = approvedFinInhouse.map((item) => ({
      FinanceLoanID: item.FinanceLoanID,
      RefAppNo: item.RefAppNo,
      Category: item.Category,
      BookingNo: item.BookingNo,
      BookingDate: item.BookingDate,
      BookingID: item.BookingID,
      CustomerID: item.CustomerID,
      CustID: item.FinanceloanCustomerID
        ? item.FinanceloanCustomerID.CustID
        : null,
      FinAppID: item.FinAppID,
      UserID: item.UserID,
      ApprovedDate: item.ApprovedDate,
      ApplicationStatus: item.ApplicationStatus,
      FinancierType: item.FinancierType,
      Financier: item.Financier,
      TotalDeductions: item.TotalDeductions,
      Status: item.Status,
      CreatedDate: item.CreatedDate,
      // Include FinanceApplication fields
      ApplicationNumber:
        item.FinanceloanFinAppID?.ApplicationNumber || item.RefAppNo || null,
      LoanAppCustID:
        item.FinanceloanFinAppID?.LoanAppCustID || item?.LoanAppCustID || null,
      FinancierName:
        item.FinanceloanFinAppID?.FinancierName ||
        item.FLAFinancierID?.FinancierName ||
        null,
      // LoanAmt: item.FinanceloanFinAppID?.LoanAmt,
      LoanAmt: item.SanctionAmount,
      // BookingID: item.FinanceloanFinAppID?.BookingID,
      CreatedDateFinance: item.FinanceloanFinAppID?.CreatedDate || null,
      // Include FinAppApplicant fields
      FirstName:
        item.FinanceloanFinAppID?.FALoanAppCustID?.FirstName ||
        item.FinanceloanappID.FirstName ||
        null,
      LastName:
        item.FinanceloanFinAppID?.FALoanAppCustID?.LastName ||
        item.FinanceloanappID.LastName ||
        null,
      PhoneNo:
        item.FinanceloanFinAppID?.FALoanAppCustID?.PhoneNo ||
        item.FinanceloanappID.PhoneNo ||
        null,
      Model:
        item.FinanceloanFinAppID?.FALoanAppCustID?.Model ||
        item.FinanceloanappID.Model ||
        null,
      Variant:
        item.FinanceloanFinAppID?.FALoanAppCustID?.Variant ||
        item.FinanceloanappID.Variant ||
        null,
      FuelType:
        item.FinanceloanFinAppID?.FALoanAppCustID?.FuelType ||
        item.FinanceloanappID.FuelType ||
        null,
      Colour:
        item.FinanceloanFinAppID?.FALoanAppCustID?.Colour ||
        item.FinanceloanappID.Colour ||
        null,
      // Include UserMaster fields
      UserName: item.FinanceloanUserID?.UserName,
      UserBranch: item.FinanceloanUserID?.Branch,
      FinancierCategory: item.FLAFinancierID?.Category,
      FinancierLocation: item.FLAFinancierID?.Location,
      FinancierID: item.FinancierID,
    }));

    return res.status(200).json(mappedResults);
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching financial status update",
      error: error.message,
    });
  }
};

exports.FinPaymentApprovedList = async (req, res) => {
  try {
    const { UserID } = req.query;

    // Check if the UserID is provided
    if (!UserID) {
      return res.status(400).json({ message: "UserID is required." });
    }

    // let approvedFinInhouse, approvedFinSelf;

    // // Fetch Inhouse and Self finance application payments with Approved/Pending status
    // const statusConditions = ["Approved", "Pending"];

    // Fetch approved/pending Inhouse finance application payments
    const paymentData = await PaymentRequest.findAll({
      where: {
        RequestBy: UserID,
        FinanceLoanID: { [Op.ne]: null },
      },
      include: [
        {
          model: FinanceLoanapplication,
          as: "PRFinanceLoanID",
          attributes: [
            "FinanceLoanID",
            "Category",
            "LoanAppCustID",
            "RefAppNo",
            "BookingID",
            "CustomerID",
            "FinAppID",
            "UserID",
            "FinancierID",
            "SanctionAmount",
            // "ROI",
            // "Tenure",
            // "DocumentCharge",
            // "StampDuties",
            // "ServiceCharges",
            // "ProcessingFee",
            // "Insurance",
            // "Others",
            // "TotalDeductions",
            // "MarginAmount",
            // "NetDisbursement",
            "DealerPayoutType",
            "DealerPayoutPercentage",
            "DealerPayoutValue",
            "ExecPayoutType",
            "ExecPayoutPercentage",
            "ExecPayoutValue",
            "TotalPayout",
            "ApprovedDate",
            // "ApplicationStatus",
            // "IsActive",
            "PaymentStatus",
            "CreatedDate",
            // "ModifiedDate",
          ],
          include: [
            {
              model: NewCarBookings,
              as: "FinanceloanBookingID",
              attributes: [
                "BookingID",
                "BookingNo",
                "ModelName",
                "ColourName",
                "VariantName",
                "Title",
                "FirstName",
                "LastName",
              ],
            },
            {
              model: FinanceApplication,
              as: "FinanceloanFinAppID",
              attributes: [
                "ApplicationNumber",
                "LoanAppCustID",
                "FinancierName",
                "LoanAmt",
                "BookingID",
                "CreatedDate",
              ],
              include: [
                {
                  model: NewCarBookings,
                  as: "FAppBookingID",
                  attributes: [
                    "BookingID",
                    "BookingNo",
                    "ModelName",
                    "ColourName",
                    "VariantName",
                    "Title",
                    "FirstName",
                    "LastName",
                  ],
                },
                {
                  model: FinAppApplicant,
                  as: "FALoanAppCustID",
                  attributes: ["Title", "FirstName", "LastName"],
                },
              ],
            },
            {
              model: FinanceMaster,
              as: "FLAFinancierID",
              attributes: [
                "FinancierName",
                "Category",
                "Location",
                "FinancierCode",
              ],
            },
          ],
        },
        {
          model: UserMaster,
          as: "PRqUserID",
          attributes: ["UserID", "UserName", "Branch"],
        },
      ],
      attributes: [
        "ID",
        "RequestID",
        "CustomerID",
        "TransactionID",
        "RefTypeID",
        "RequestDate",
        "PaymentMode",
        "PaymentPurpose",
        "Amount",
        "FinanceLoanID",
        "BankCharges",
        "UTRNo",
        "RequestStatus",
        "RequestBy",
        "Remarks",
        "CollectionBranchID",
      ],
      order: [["RequestDate", "DESC"]],
    });
    console.log("Data retrieved: ");
    const flatJsonArray = paymentData.map((item) => ({
      PaymentID: item.ID || null,
      PaymentMode: item.PaymentMode || null,
      RequestID: item.RequestID || null,
      ApplicationCategory: item.PRFinanceLoanID
        ? item.PRFinanceLoanID.Category
        : null,
      FinancerType:
        item.PRFinanceLoanID && item.PRFinanceLoanID.FLAFinancierID
          ? item.PRFinanceLoanID.FLAFinancierID.Category
          : null, // assuming this is not provided in the data
      Financer:
        item.PRFinanceLoanID && item.PRFinanceLoanID.FLAFinancierID
          ? item.PRFinanceLoanID.FLAFinancierID.FinancierName
          : null,
      Branch:
        item.PRFinanceLoanID && item.PRFinanceLoanID.FLAFinancierID
          ? item.PRFinanceLoanID.FLAFinancierID.Location
          : null,
      // LoanAmt:
      //   item.PRFinanceLoanID && item.PRFinanceLoanID.FinanceloanFinAppID
      //     ? item.PRFinanceLoanID.FinanceloanFinAppID.LoanAmt
      //     : null,
      LoanAmt:
        item?.PRFinanceLoanID?.SanctionAmount ||
        item?.PRFinanceLoanID?.FinanceloanFinAppID?.LoanAmt ||
        null,
      UTRNo: item.UTRNo || null,
      // FinPaymentStatus: item.RequestStatus || null,
      DealerPayoutType: item.PRFinanceLoanID
        ? item.PRFinanceLoanID.DealerPayoutType
        : null,
      DealerPayoutValue: item.PRFinanceLoanID
        ? item.PRFinanceLoanID.DealerPayoutValue
        : null,
      ExcutivePayoutType: item.PRFinanceLoanID
        ? item.PRFinanceLoanID.ExecPayoutType
        : null,
      ExcutivePayoutValue: item.PRFinanceLoanID
        ? item.PRFinanceLoanID.ExecPayoutValue
        : null,
      TotalPayout: item.PRFinanceLoanID
        ? item.PRFinanceLoanID.TotalPayout
        : null, // assuming this is not provided in the data
      Status: item.RequestStatus || null,
      ApplicationNumber: item.PRFinanceLoanID
        ? item.PRFinanceLoanID.RefAppNo
        : null,
      ApprovedDate: item.PRFinanceLoanID
        ? item.PRFinanceLoanID.ApprovedDate
        : null,
      LoanAppCustID: item.PRFinanceLoanID
        ? item.PRFinanceLoanID.LoanAppCustID
        : null,
      // CreatedDate: item.PRFinanceLoanID
      //   ? item.PRFinanceLoanID.FinanceloanFinAppID.CreatedDate
      //   : null,
      // BookingNo:
      //   item.PRFinanceLoanID &&
      //   item.PRFinanceLoanID.FinanceloanFinAppID &&
      //   item.PRFinanceLoanID.FinanceloanFinAppID.FAppBookingID
      //     ? item.PRFinanceLoanID.FinanceloanFinAppID.FAppBookingID.BookingNo
      //     : null,
      // ModelName:
      //   item.PRFinanceLoanID &&
      //   item.PRFinanceLoanID.FinanceloanFinAppID &&
      //   item.PRFinanceLoanID.FinanceloanFinAppID.FAppBookingID
      //     ? item.PRFinanceLoanID.FinanceloanFinAppID.FAppBookingID.ModelName
      //     : null,
      // ColourName:
      //   item.PRFinanceLoanID &&
      //   item.PRFinanceLoanID.FinanceloanFinAppID &&
      //   item.PRFinanceLoanID.FinanceloanFinAppID.FAppBookingID
      //     ? item.PRFinanceLoanID.FinanceloanFinAppID.FAppBookingID.ColourName
      //     : null,
      // VariantName:
      //   item.PRFinanceLoanID &&
      //   item.PRFinanceLoanID.FinanceloanFinAppID &&
      //   item.PRFinanceLoanID.FinanceloanFinAppID.FAppBookingID
      //     ? item.PRFinanceLoanID.FinanceloanFinAppID.FAppBookingID.VariantName
      //     : null,
      // Title:
      //   item.PRFinanceLoanID &&
      //   item.PRFinanceLoanID.FinanceloanFinAppID &&
      //   item.PRFinanceLoanID.FinanceloanFinAppID.FAppBookingID
      //     ? item.PRFinanceLoanID.FinanceloanFinAppID.FALoanAppCustID.Title
      //     : null,
      // FirstName:
      //   item.PRFinanceLoanID &&
      //   item.PRFinanceLoanID.FinanceloanFinAppID &&
      //   item.PRFinanceLoanID.FinanceloanFinAppID.FAppBookingID
      //     ? item.PRFinanceLoanID.FinanceloanFinAppID.FALoanAppCustID.FirstName
      //     : null,
      // LastName:
      //   item.PRFinanceLoanID &&
      //   item.PRFinanceLoanID.FinanceloanFinAppID &&
      //   item.PRFinanceLoanID.FinanceloanFinAppID.FAppBookingID
      //     ? item.PRFinanceLoanID.FinanceloanFinAppID.FALoanAppCustID.LastName
      //     : null,
      BookingID:
        item.PRFinanceLoanID?.FinanceloanFinAppID?.FALoanAppCustID?.BookingID ||
        item.PRFinanceLoanID?.FinanceloanBookingID?.BookingID ||
        null,
      BookingNo:
        item.PRFinanceLoanID &&
        (item.PRFinanceLoanID.FinanceloanFinAppID &&
        item.PRFinanceLoanID.FinanceloanFinAppID.FAppBookingID
          ? item.PRFinanceLoanID.FinanceloanFinAppID.FAppBookingID.BookingNo
          : item.PRFinanceLoanID.FinanceloanBookingID
          ? item.PRFinanceLoanID.FinanceloanBookingID.BookingNo
          : null),
      FirstName:
        item.PRFinanceLoanID?.FinanceloanFinAppID?.FALoanAppCustID?.FirstName ||
        item.PRFinanceLoanID?.FinanceloanBookingID?.FirstName ||
        null,

      LastName:
        item.PRFinanceLoanID?.FinanceloanFinAppID?.FALoanAppCustID?.LastName ||
        item.PRFinanceLoanID?.FinanceloanBookingID?.LastName ||
        null,

      ModelName:
        item.PRFinanceLoanID?.FinanceloanFinAppID?.FAppBookingID?.ModelName ||
        item.PRFinanceLoanID?.FinanceloanBookingID?.ModelName ||
        null,

      ColourName:
        item.PRFinanceLoanID?.FinanceloanFinAppID?.FAppBookingID?.ColourName ||
        item.PRFinanceLoanID?.FinanceloanBookingID?.ColourName ||
        null,

      VariantName:
        item.PRFinanceLoanID?.FinanceloanFinAppID?.FAppBookingID?.VariantName ||
        item.PRFinanceLoanID?.FinanceloanBookingID?.VariantName ||
        null,

      Title:
        item.PRFinanceLoanID?.FinanceloanFinAppID?.FALoanAppCustID?.Title ||
        item.PRFinanceLoanID?.FinanceloanBookingID?.Title ||
        null,

      UserName: item.PRqUserID ? item.PRqUserID.UserName : null,
      UserBranch: item.PRqUserID ? item.PRqUserID.Branch : null,
    }));

    // flatJsonArray now contains the flattened objects

    // Return combined result
    return res.status(200).json(flatJsonArray);
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching payment data",
      error: error.message,
    });
  }
};
