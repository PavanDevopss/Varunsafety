/* eslint-disable no-unused-vars */
const db = require("../models");
const FinanceApplication = db.financeapplication;
const CustomerMaster = db.customermaster;
const NewCarBookings = db.NewCarBookings;
const FinanceMaster = db.financemaster;
const CustEmpMap = db.CustEmpMaping;
const UserMaster = db.usermaster;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;
const FinAppApplicant = db.finappapplicant;
const FinAppCoApplicant = db.finappcoapplicant;
const FinanceDocuments = db.financedocuments;
const FinStatusUpdate = db.finstatusupdate;
const FinanceTrack = db.finstatustracking;
const DocumentType = db.documenttypes;
const NewCarBooking = db.NewCarBookings;
const { genFinApplicationNumber } = require("../Utils/generateService");

// Basic CRUD API

// Create and Save a new FinanceApplication
exports.create = async (req, res) => {
  const transaction = await Seq.transaction();

  try {
    if (!req.body.LoanAppCustID) {
      return res.status(400).json({ message: "LoanAppCustID cannot be empty" });
    }

    // Check if FinanceApplication already exists
    const loanAppCustomer = await FinAppApplicant.findOne({
      where: { LoanAppCustID: req.body.LoanAppCustID },
      transaction,
    });

    if (!loanAppCustomer) {
      await transaction.rollback();
      return res.status(400).json({ message: "Applicant not found" });
    }
    const bookingID = req.body.BookingID || loanAppCustomer.BookingID;
    const existingBooking = await NewCarBookings.findOne({
      where: { BookingID: bookingID },
      transaction, // Include the transaction
    });

    const appNo = await genFinApplicationNumber();
    console.log("Generated App No : ", appNo);

    // Map fields individually from req.body to FinanceApplication object
    const financeApplication = {
      CustomerID: req.body.CustomerID || loanAppCustomer.CustomerID || null,
      IsCoApplicant: req.body.IsCoApplicant || null,
      ApplicationNumber: req.body.ApplicationNumber || appNo,
      LoanAppCustID: req.body.LoanAppCustID || loanAppCustomer.LoanAppCustID,
      BookingID: req.body.BookingID || loanAppCustomer.BookingID || null,
      UserID: req.body.UserID || null,
      SalesPersonID: existingBooking.SalesPersonID || null, // new field
      QuotationNo: req.body.QuotationNo || null,
      QuotationDate: req.body.QuotationDate || null,
      QuotationAmt: req.body.QuotationAmt || null,
      ApplicantIncome: req.body.ApplicantIncome || null,
      FinancierID: req.body.FinancierID || null,
      FinancierName: req.body.FinancierName || null,
      Branch: req.body.Branch || null,
      ExShowRoom: req.body.ExShowRoom || null,
      LifeTax: req.body.LifeTax || null,
      Accessories: req.body.Accessories || null,
      Insurance: req.body.Insurance || null,
      OtherAmt: req.body.OtherAmt || null,
      OnRoadPrice: req.body.OnRoadPrice || null,
      RateOfInterest: req.body.RateOfInterest || null,
      Tenure: req.body.Tenure || null,
      LoanAmt: req.body.LoanAmt || null,
      Status: req.body.Status || "Active",
      Remarks: req.body.Remarks || null,
    };
    console.log("request body data: ", financeApplication);

    // Save FinanceApplications in the database
    const newFinanceApplication = await FinanceApplication.create(
      financeApplication,
      { transaction }
    );

    loanAppCustomer.FinAppID = newFinanceApplication.FinAppID;
    await loanAppCustomer.save({ transaction });

    const newFinStatusUpdate = await FinStatusUpdate.create(
      {
        FinAppID: newFinanceApplication.FinAppID,
        CurrentStage: "Application Created",
        StatusDate: new Date(),
        NextStage: "Documents Submitted",
        Remarks: null,
        FinDocURL: null,
        Status: "Active",
        IsActive: true,
      },
      { transaction }
    );

    await FinanceTrack.create(
      {
        FinStatusID: newFinStatusUpdate.FinStatusID,
        CurrentStage: newFinStatusUpdate.CurrentStage,
        StatusDate: newFinStatusUpdate.StatusDate,
        IsActive: newFinStatusUpdate.IsActive,
        Status: newFinStatusUpdate.Status,
      },
      { transaction }
    );

    await transaction.commit();
    return res.status(201).json(newFinanceApplication); // Send the newly created FinanceApplication as response
  } catch (err) {
    await transaction.rollback();

    // Handle errors based on specific types
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

    if (err.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while creating FinanceApplication.",
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

    console.error("Error creating FinanceApplication:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Retrieve all FinanceApplications from the database.
exports.findAll = async (req, res) => {
  try {
    // Fetch FinanceApplications
    const financeApplications = await FinanceApplication.findAll({
      attributes: [
        "FinAppID",
        "CustomerID",
        "LoanAppCustID",
        "ApplicationNumber",
        "BookingID",
        "QuotationNo",
        "QuotationDate",
        "QuotationAmt",
        "ApplicantIncome",
        "FinancierID",
        "FinancierName",
        "Branch",
        "ExShowRoom",
        "LifeTax",
        "Accessories",
        "Insurance",
        "OtherAmt",
        "OnRoadPrice",
        "RateOfInterest",
        "Tenure",
        "LoanAmt",
        "Status",
        "Remarks",
        "CreatedDate",
        "ModifiedDate",
      ],
      include: [
        {
          model: CustomerMaster,
          as: "FACustomerID",
          attributes: [
            "CustomerID",
            "CustomerType",
            "CustID",
            "Title",
            "FirstName",
            "LastName",
            "PhoneNo",
          ],
        },
        {
          model: NewCarBookings,
          as: "FAppBookingID",
          attributes: [
            "BookingID",
            "BookingNo",
            "CustomerID",
            "Title",
            "FirstName",
            "LastName",
            "ModelName",
            "ColourName",
            "VariantName",
            "BranchName",
          ],
        },
        {
          model: FinanceMaster,
          as: "FAFinancierID",
          attributes: [
            "FinancierID",
            "FinancierCode",
            "FinancierName",
            "Category",
          ],
        },
        {
          model: FinAppApplicant,
          as: "FALoanAppCustID",
          attributes: ["LoanAppCustID", "FinAppID", "FirstName"],
        },
      ],
      order: [
        ["CreatedDate", "ASC"], // Order by ModelDescription in ascending order
      ],
    });
    if (financeApplications.length === 0) {
      return res.status(404).json({ message: "No Financier Types found" });
    }
    // Extract Customer IDs from financeApplications
    const customerIDs = financeApplications.map(
      (data) => data.FACustomerID.CustomerID
    );
    console.log("Customer IDs:", customerIDs);
    const empData = await CustEmpMap.findAll({
      where: { CustomerID: { [Op.in]: customerIDs } },
      attributes: ["CustomerID"],
      include: [
        {
          model: UserMaster,
          as: "CEMEmpID",
          attributes: ["UserID", "UserName", "EmpID"],
        },
      ],
    });
    // console.log("Customer IDs:", empData);
    // Create a flat JSON response
    const flatJson = financeApplications.map((financeApp) => {
      // Find corresponding employee data for the current finance application
      const matchingEmpData = empData.find(
        (emp) => emp.CustomerID === financeApp.FACustomerID.CustomerID
      );
      return {
        FinAppID: financeApp.FinAppID,
        CustomerID: financeApp.CustomerID,
        LoanAppCustID: financeApp.LoanAppCustID,
        ApplicationNumber: financeApp.ApplicationNumber,
        BookingID: financeApp.BookingID,
        QuotationNo: financeApp.QuotationNo,
        QuotationDate: financeApp.QuotationDate,
        QuotationAmt: financeApp.QuotationAmt,
        ApplicantIncome: financeApp.ApplicantIncome,
        FinancierID: financeApp.FinancierID,
        FinancierName: financeApp.FinancierName,
        Branch: financeApp.Branch,
        ExShowRoom: financeApp.ExShowRoom,
        LifeTax: financeApp.LifeTax,
        Accessories: financeApp.Accessories,
        Insurance: financeApp.Insurance,
        OtherAmt: financeApp.OtherAmt,
        OnRoadPrice: financeApp.OnRoadPrice,
        RateOfInterest: financeApp.RateOfInterest,
        Tenure: financeApp.Tenure,
        LoanAmt: financeApp.LoanAmt,
        Remarks: financeApp.Remarks,
        CreatedDate: financeApp.CreatedDate,
        ModifiedDate: financeApp.ModifiedDate,
        // Additional fields from CustomerMaster
        CustomerType: financeApp.FACustomerID
          ? financeApp.FACustomerID.CustomerType
          : null,
        CustID: financeApp.FACustomerID
          ? financeApp.FACustomerID.CustomerID
          : null,
        Title: financeApp.FACustomerID ? financeApp.FACustomerID.Title : null,
        CustFirstName: financeApp.FACustomerID
          ? financeApp.FACustomerID.FirstName
          : null,
        CustLastName: financeApp.FACustomerID
          ? financeApp.FACustomerID.LastName
          : null,
        CustPhoneNo: financeApp.FACustomerID
          ? financeApp.FACustomerID.PhoneNo
          : null,
        // Additional fields from NewCarBookings
        BookingNo: financeApp.FAppBookingID
          ? financeApp.FAppBookingID.BookingNo
          : null,
        BookingTitle: financeApp.FAppBookingID
          ? financeApp.FAppBookingID.Title
          : null,
        BookingFirstName: financeApp.FAppBookingID
          ? financeApp.FAppBookingID.FirstName
          : null,
        BookingLastName: financeApp.FAppBookingID
          ? financeApp.FAppBookingID.LastName
          : null,
        ModelName: financeApp.FAppBookingID
          ? financeApp.FAppBookingID.ModelName
          : null,
        ColourName: financeApp.FAppBookingID
          ? financeApp.FAppBookingID.ColourName
          : null,
        VariantName: financeApp.FAppBookingID
          ? financeApp.FAppBookingID.VariantName
          : null,
        BranchName: financeApp.FAppBookingID
          ? financeApp.FAppBookingID.BranchName
          : null,
        // Additional fields from FinanceMaster
        FinancierCode: financeApp.FAFinancierID
          ? financeApp.FAFinancierID.FinancierCode
          : null,
        Category: financeApp.FAFinancierID
          ? financeApp.FAFinancierID.Category
          : null,
        // Additional fields from FinAppApplicant
        FinFirstName: financeApp.FALoanAppCustID
          ? financeApp.FALoanAppCustID.FirstName
          : null,

        // Employee data fields
        UserID: matchingEmpData ? matchingEmpData.CEMEmpID.UserID : null,
        UserName: matchingEmpData ? matchingEmpData.CEMEmpID.UserName : null,
        EmpID: matchingEmpData ? matchingEmpData.CEMEmpID.EmpID : null,
        Status: financeApp.Status,
      };
    });
    res.status(200).json(flatJson);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message:
          "Database error occurred while retrieving FinanceApplication name data.",
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
    console.error("Error fetching FinanceApplications:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// exports.findAllFin = async (req, res) => {
//   try {
//     const userID = req.query.UserID;
//     console.log("UserID is required: ", userID);

//     // Fetch FinanceApplications
//     const financeApplications = await FinanceApplication.findAll({
//       attributes: [
//         "ApplicationNumber",
//         "Status",
//         // "QuotationNo",
//         // "QuotationDate",
//         // "QuotationAmt",
//         // "ApplicantIncome",
//         // "FinancierID",
//         "FinancierName",
//         // "Branch",
//         // "ExShowRoom",
//         // "LifeTax",
//         // "Accessories",
//         // "Insurance",
//         // "OtherAmt",
//         // "OnRoadPrice",
//         // "RateOfInterest",
//         // "Tenure",
//         "LoanAmt",
//         // "Remarks",
//         // "FinAppID",
//         // "CustomerID",
//         // "LoanAppCustID",
//         // "BookingID",
//         // "UserID",
//         "CreatedDate",
//         "ModifiedDate",
//       ],
//       include: [
//         {
//           model: FinAppApplicant,
//           as: "FALoanAppCustID",
//           attributes: [
//             // "LoanAppCustID",
//             // "FinAppID",
//             "FirstName", // Added FirstName
//             "LastName", // Added FirstName
//             "PhoneNo",
//             "Email",
//             "Model",
//             "Variant",
//             "Colour",
//           ],
//         },
//         // {
//         //   model: CustomerMaster,
//         //   as: "FACustomerID",
//         //   attributes: [
//         //     "CustomerID",
//         //     "CustomerType",
//         //     "CustID",
//         //     "Title",
//         //     "FirstName",
//         //     "LastName",
//         //     "PhoneNo",
//         //   ],
//         // },
//         // {
//         //   model: NewCarBookings,
//         //   as: "FABookingID",
//         //   attributes: [
//         //     "BookingID",
//         //     "BookingNo",
//         //     "CustomerID",
//         //     "Title",
//         //     "FirstName",
//         //     "LastName",
//         //     "ModelName",
//         //     "ColourName",
//         //     "VariantName",
//         //     "BranchName",
//         //   ],
//         // },
//         // {
//         //   model: FinanceMaster,
//         //   as: "FAFinancierID",
//         //   attributes: [
//         //     // "FinancierID",
//         //     //"FinancierCode",
//         //     "FinancierName",
//         //     //"Category",
//         //   ],
//         // },
//         // {
//         //   model: UserMaster,
//         //   as: "FAUserID",
//         //   attributes: ["UserID", "UserName", "EmpID"],
//         // },
//       ],
//       where: { UserID: userID },
//       order: [
//         ["FinAppID", "ASC"], // Order by FinAppID in ascending order
//       ],
//     });

//     if (financeApplications.length === 0) {
//       return res.status(404).json({ message: "No FinanceApplications found" });
//     }

//     // // Create a flat JSON response
//     // const flatJson = financeApplications.map((financeApp) => {
//     //   return {
//     //     FinAppID: financeApp.FinAppID,
//     //     CustomerID: financeApp.CustomerID,
//     //     LoanAppCustID: financeApp.LoanAppCustID,
//     //     ApplicationNumber: financeApp.ApplicationNumber,
//     //     BookingID: financeApp.BookingID,
//     //     QuotationNo: financeApp.QuotationNo,
//     //     QuotationDate: financeApp.QuotationDate,
//     //     QuotationAmt: financeApp.QuotationAmt,
//     //     ApplicantIncome: financeApp.ApplicantIncome,
//     //     FinancierID: financeApp.FinancierID,
//     //     FinancierName: financeApp.FinancierName,
//     //     Branch: financeApp.Branch,
//     //     ExShowRoom: financeApp.ExShowRoom,
//     //     LifeTax: financeApp.LifeTax,
//     //     Accessories: financeApp.Accessories,
//     //     Insurance: financeApp.Insurance,
//     //     OtherAmt: financeApp.OtherAmt,
//     //     OnRoadPrice: financeApp.OnRoadPrice,
//     //     RateOfInterest: financeApp.RateOfInterest,
//     //     Tenure: financeApp.Tenure,
//     //     LoanAmt: financeApp.LoanAmt,
//     //     Status: financeApp.Status,
//     //     Remarks: financeApp.Remarks,
//     //     CreatedDate: financeApp.CreatedDate,
//     //     ModifiedDate: financeApp.ModifiedDate,

//     //     // Additional fields from CustomerMaster
//     //     CustomerType: financeApp.FACustomerID
//     //       ? financeApp.FACustomerID.CustomerType
//     //       : null,
//     //     CustID: financeApp.FACustomerID ? financeApp.FACustomerID.CustID : null,
//     //     Title: financeApp.FACustomerID ? financeApp.FACustomerID.Title : null,
//     //     FirstName: financeApp.FACustomerID
//     //       ? financeApp.FACustomerID.FirstName
//     //       : null,
//     //     LastName: financeApp.FACustomerID
//     //       ? financeApp.FACustomerID.LastName
//     //       : null,
//     //     PhoneNo: financeApp.FACustomerID
//     //       ? financeApp.FACustomerID.PhoneNo
//     //       : null,

//     //     // Additional fields from NewCarBookings
//     //     BookingNo: financeApp.FABookingID
//     //       ? financeApp.FABookingID.BookingNo
//     //       : null,
//     //     ModelName: financeApp.FABookingID
//     //       ? financeApp.FABookingID.ModelName
//     //       : null,
//     //     ColourName: financeApp.FABookingID
//     //       ? financeApp.FABookingID.ColourName
//     //       : null,
//     //     VariantName: financeApp.FABookingID
//     //       ? financeApp.FABookingID.VariantName
//     //       : null,
//     //     BranchName: financeApp.FABookingID
//     //       ? financeApp.FABookingID.BranchName
//     //       : null,

//     //     // Additional fields from FinanceMaster
//     //     FinancierCode: financeApp.FAFinancierID
//     //       ? financeApp.FAFinancierID.FinancierCode
//     //       : null,
//     //     Category: financeApp.FAFinancierID
//     //       ? financeApp.FAFinancierID.Category
//     //       : null,

//     //     // Additional fields from FinAppApplicant
//     //     FinAppApplicantFirstName: financeApp.FALoanAppCustID
//     //       ? financeApp.FALoanAppCustID.FirstName
//     //       : null,

//     //     // Additional fields from UserMaster
//     //     UserID: financeApp.FAUserID ? financeApp.FAUserID.UserID : null,
//     //     UserName: financeApp.FAUserID ? financeApp.FAUserID.UserName : null,
//     //     EmpID: financeApp.FAUserID ? financeApp.FAUserID.EmpID : null,
//     //   };
//     // });

//     res.status(200).json(financeApplications);
//   } catch (error) {
//     // Handle errors based on specific types
//     if (error.name === "SequelizeDatabaseError") {
//       // Handle database errors
//       return res.status(500).json({
//         message:
//           "Database error occurred while retrieving FinanceApplication data.",
//         details: error.message,
//       });
//     }

//     if (error.name === "SequelizeConnectionError") {
//       // Handle connection errors
//       return res.status(503).json({
//         message: "Service unavailable. Unable to connect to the database.",
//         details: error.message,
//       });
//     }

//     console.error("Error fetching FinanceApplications:", error);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };

// Find a single FinanceApplication with an id

exports.findAllFin = async (req, res) => {
  try {
    const userID = req.query.UserID;
    console.log("UserID is required: ", userID);

    // Fetch FinanceApplications
    const financeApplications = await FinanceApplication.findAll({
      attributes: [
        "ApplicationNumber",
        "Status",
        "FinancierName",
        "LoanAmt",
        "CreatedDate",
        "ModifiedDate",
        "CustomerID",
        "FinAppID",
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
            "Email",
            "Model",
            "Variant",
            "Colour",
          ],
        },
        {
          model: UserMaster,
          as: "FAUserID",
          attributes: ["UserName", "Branch"],
        },
      ],
      where: { UserID: userID },
      order: [
        ["FinAppID", "ASC"], // Order by FinAppID in ascending order
      ],
      raw: true, // Flatten the results to avoid nested objects
    });

    if (financeApplications.length === 0) {
      return res.status(404).json({ message: "No FinanceApplications found" });
    }

    const applicationsIDs = financeApplications.map((id) => id.FinAppID);

    const finStatusUpdateData = await FinStatusUpdate.findAll({
      where: { FinAppID: applicationsIDs },
      attributes: ["FinAppID", "CurrentStage"],
    });

    // console.log("status of update: ", finStatusUpdateData);
    // Create a mapping for CurrentStage using FinAppID
    const statusUpdateMap = finStatusUpdateData.reduce((acc, item) => {
      acc[item.FinAppID] = item.CurrentStage;
      return acc;
    }, {});

    // Merge the attributes from FinAppApplicant into the main object
    const mergedResults = financeApplications.map((app) => {
      const {
        "FALoanAppCustID.FirstName": FirstName,
        "FALoanAppCustID.LastName": LastName,
        "FALoanAppCustID.PhoneNo": PhoneNo,
        "FALoanAppCustID.Email": Email,
        "FALoanAppCustID.Model": Model,
        "FALoanAppCustID.Variant": Variant,
        "FALoanAppCustID.Colour": Colour,
        "FAUserID.UserName": SalesPersonName,
        "FAUserID.Branch": SalesPersonBranch,
        ...rest
      } = app;

      return {
        ...rest,
        FirstName,
        LastName,
        PhoneNo,
        Email,
        Model,
        Variant,
        Colour,
        SalesPersonName,
        SalesPersonBranch,
        CurrentStage: statusUpdateMap[app.FinAppID] || null, // Add CurrentStage to the result
      };
    });

    res.status(200).json(mergedResults);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message:
          "Database error occurred while retrieving FinanceApplication data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    console.error("Error fetching FinanceApplications:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.findOne = async (req, res) => {
  const applicationNumber = req.query.ApplicationNumber;
  try {
    // Fetch the FinanceApplication with the given ID
    const financeApplication = await FinanceApplication.findOne({
      where: { ApplicationNumber: applicationNumber },
      attributes: [
        "FinAppID",
        "QuotationNo",
        "QuotationDate",
        "QuotationAmt",
        "CustomerID",
        "LoanAppCustID",
        "UserID",
        "ApplicationNumber",
        "BookingID",
        "ApplicantIncome",
        "FinancierID",
        "FinancierName",
        "Branch",
        "ExShowRoom",
        "LifeTax",
        "Accessories",
        "Insurance",
        "OtherAmt",
        "OnRoadPrice",
        "RateOfInterest",
        "Tenure",
        "LoanAmt",
        "Status",
        "Remarks",
        "CreatedDate",
        "ModifiedDate",
      ],
      include: [
        {
          model: NewCarBookings,
          as: "FAppBookingID",
          attributes: [
            "BookingID",
            "BookingNo",
            "BookingTime",
            "CustomerID",
            "ModelName",
            "VariantName",
            "ColourName",
            "Transmission",
            "Fuel",
            "SalesPersonID",
          ],
          include: [
            {
              model: UserMaster,
              as: "NCBSPUserID",
              attributes: ["UserName", "EmpID"],
            },
          ],
        },
        {
          model: FinanceMaster,
          as: "FAFinancierID",
          attributes: ["FinancierID", "FinancierCode", "Category"],
        },
        {
          model: FinAppApplicant,
          as: "FALoanAppCustID",
          attributes: [
            "LoanAppCustID",
            "FinAppID",
            "Title",
            "FirstName",
            "LastName",
            "PhoneNo",
            "Email",
            "Gender",
            "DateOfBirth",
            "Occupation",
            "Company",
            "Address",
            "District",
            "State",
            "PinCode",
            "IncomeSource",
            "AnnualIncome",
            "MonthlyIncome",
            "EMIDeduction",
            "MonthlyNetIncome",
            "IsCoApplicant",
            "Model",
            "Variant",
            "Colour",
            "Transmission",
            "FuelType",
            "CreatedDate",
            "ModifiedDate",
          ],
        },
      ],
    });

    if (!financeApplication) {
      return res.status(404).json({ message: "FinanceApplication not found" });
    }

    // Initialize a flat response object
    const response = {};

    // Mapping fields from FinanceApplication
    const item = financeApplication.dataValues;
    const applicantData = item.FALoanAppCustID || {};
    const bookingData = item.FAppBookingID || {};
    const financeData = item.FAFinancierID || {};
    const coApplicant = applicantData.IsCoApplicant
      ? await FinAppCoApplicant.findOne({
          where: { LoanAppCustID: item.LoanAppCustID },
          attributes: [
            "LoanAppCoCustID",
            "FinAppID",
            "LoanAppCustID",
            "Title",
            "FirstName",
            "LastName",
            "PhoneNo",
            "Email",
            "Gender",
            "DateOfBirth",
            "Occupation",
            "Company",
            "Address",
            "District",
            "State",
            "PINCode",
            "IncomeSource",
            "AnnualIncome",
            "EMIDeduction",
            "MonthlyIncome",
            "MonthlyNetIncome",
          ],
        })
      : null;

    // Mappinf Application Fields
    response.FinAppID = financeApplication.FinAppID;
    response.QuotationNo = financeApplication.QuotationNo;
    response.QuotationDate = financeApplication.QuotationDate;
    response.QuotationAmt = financeApplication.QuotationAmt;
    response.CustomerID = financeApplication.CustomerID;
    response.LoanAppCustID = financeApplication.LoanAppCustID;
    response.UserID = financeApplication.UserID;
    response.ApplicationNumber = financeApplication.ApplicationNumber;
    response.BookingID = financeApplication.BookingID;
    response.ApplicantIncome = financeApplication.ApplicantIncome;
    response.FinancierID = financeApplication.FinancierID;
    response.FinancierName = financeApplication.FinancierName;
    response.Branch = financeApplication.Branch;
    response.ExShowRoom = financeApplication.ExShowRoom;
    response.LifeTax = financeApplication.LifeTax;
    response.Accessories = financeApplication.Accessories;
    response.Insurance = financeApplication.Insurance;
    response.OtherAmt = financeApplication.OtherAmt;
    response.OnRoadPrice = financeApplication.OnRoadPrice;
    response.RateOfInterest = financeApplication.RateOfInterest;
    response.Tenure = financeApplication.Tenure;
    response.LoanAmt = financeApplication.LoanAmt;
    response.Status = financeApplication.Status;
    response.Remarks = financeApplication.Remarks;
    response.CreatedDate = financeApplication.CreatedDate;
    response.ModifiedDate = financeApplication.ModifiedDate;

    // Mapping fields to the response
    // response.LoanAppCustID = applicantData.LoanAppCustID;
    // response.FinAppID = item.FinAppID;
    response.BookingID = item.BookingID;
    response.Title = applicantData.Title;
    response.FirstName = applicantData.FirstName;
    response.LastName = applicantData.LastName;
    response.PhoneNo = applicantData.PhoneNo;
    response.Email = applicantData.Email;
    response.Gender = applicantData.Gender;
    response.DateOfBirth = applicantData.DateOfBirth;
    response.Occupation = applicantData.Occupation;
    response.Company = applicantData.Company;
    response.Address = applicantData.Address;
    response.District = applicantData.District;
    response.State = applicantData.State;
    response.PinCode = applicantData.PinCode;
    response.IncomeSource = applicantData.IncomeSource;
    response.AnnualIncome = applicantData.AnnualIncome;
    response.MonthlyIncome = applicantData.MonthlyIncome;
    response.EMIDeduction = applicantData.EMIDeduction;
    response.MonthlyNetIncome = applicantData.MonthlyNetIncome;
    response.IsCoApplicant = applicantData.IsCoApplicant;
    response.Model = applicantData.Model;
    response.Variant = applicantData.Variant;
    response.Colour = applicantData.Colour;
    response.Transmission = applicantData.Transmission;
    response.FuelType = applicantData.FuelType;
    response.CreatedDate = applicantData.CreatedDate;
    response.ModifiedDate = applicantData.ModifiedDate;

    // Booking-related fields
    response.BookingNo = bookingData.BookingNo || null;
    response.BookingTime = bookingData.BookingTime || null;
    response.CustomerID = bookingData.CustomerID || null;
    response.SalesPersonID = bookingData.SalesPersonID || null;
    response.SalesPersonName = bookingData.NCBSPUserID
      ? bookingData.NCBSPUserID.UserName
      : null;
    response.SalesPersonEmpID = bookingData.NCBSPUserID
      ? bookingData.NCBSPUserID.EmpID
      : null;
    // response.VariantName = bookingData.VariantName || null;
    // response.ColourName = bookingData.ColourName || null;
    // response.Transmission = bookingData.Transmission || null;
    response.Category = financeData.Category || null;

    // Co-Applicant related fields
    if (coApplicant) {
      response.LoanAppCoCustID = coApplicant.LoanAppCoCustID || null;
      response.CoFinAppID = coApplicant.FinAppID || null;
      // response.CoLoanAppCustID = coApplicant.LoanAppCustID || null;
      response.CoTitle = coApplicant.Title || null;
      response.CoFirstName = coApplicant.FirstName || null;
      response.CoLastName = coApplicant.LastName || null;
      response.CoPhoneNo = coApplicant.PhoneNo || null;
      response.CoEmail = coApplicant.Email || null;
      response.CoGender = coApplicant.Gender || null;
      response.CoDateOfBirth = coApplicant.DateOfBirth || null;
      response.CoOccupation = coApplicant.Occupation || null;
      response.CoCompany = coApplicant.Company || null;
      response.CoAddress = coApplicant.Address || null;
      response.CoDistrict = coApplicant.District || null;
      response.CoState = coApplicant.State || null;
      response.CoPINCode = coApplicant.PINCode || null;
      response.CoIncomeSource = coApplicant.IncomeSource || null;
      response.CoAnnualIncome = coApplicant.AnnualIncome || null;
      response.CoEMIDeduction = coApplicant.EMIDeduction || null;
      response.CoMonthlyIncome = coApplicant.MonthlyIncome || null;
      response.CoMonthlyNetIncome = coApplicant.MonthlyNetIncome || null;
    }

    res.status(200).json(response);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message:
          "Database error occurred while retrieving FinanceApplication data.",
        details: error.message,
      });
    }
    if (error.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }
    console.error("Error fetching FinanceApplication:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.findOneFin = async (req, res) => {
  try {
    const userID = req.query.UserID;
    const applicationNo = req.query.ApplicationNo;

    if (!userID || !applicationNo) {
      return res
        .status(400)
        .json({ message: "UserID and FinAppID are required" });
    }

    // Step 1: Retrieve basic Finance Application data
    const financeApplication = await FinanceApplication.findOne({
      where: { UserID: userID, ApplicationNumber: applicationNo },
      attributes: [
        "FinAppID",
        "CustomerID",
        "LoanAppCustID",
        "ApplicationNumber",
        "BookingID",
        //"BookingNo",
        "UserID",
        "QuotationNo",
        "QuotationDate",
        "QuotationAmt",
        "ApplicantIncome",
        "FinancierID",
        "FinancierName",
        "Branch",
        "ExShowRoom",
        "LifeTax",
        "Accessories",
        "Insurance",
        "OtherAmt",
        "OnRoadPrice",
        "RateOfInterest",
        "Tenure",
        "LoanAmt",
        "Status",
        "Remarks",
        "CreatedDate",
        "ModifiedDate",
      ],
      include: [
        {
          model: FinanceMaster,
          as: "FAFinancierID",
          attributes: [
            "FinancierID",
            "FinancierCode",
            "FinancierName",
            "Category",
            "Location",
          ],
        },
        {
          model: NewCarBooking,
          as: "FAppBookingID",
          attributes: ["BookingNo", "BookingTime"],
        },
        {
          model: CustomerMaster,
          as: "FACustomerID",
          attributes: ["CustID"],
        },
        {
          model: FinAppApplicant,
          as: "FALoanAppCustID",
          attributes: [
            "LoanAppCustID",
            "FinAppID",
            "Title",
            "FirstName",
            "LastName",
            "PhoneNo",
            "Email",
            "Gender",
            "DateOfBirth",
            "Occupation",
            "Address",
            "District",
            "State",
            "PinCode",
            "Model",
            "Variant",
            "Transmission",
            "FuelType",
            "Colour",
            "RefferedEmp",
            "IncomeSource",
            "AnnualIncome",
            "MonthlyIncome",
            "EMIDeduction",
            "MonthlyNetIncome",
            "IsCoApplicant",
          ],
          include: [
            {
              model: FinAppCoApplicant,
              as: "coApplicants",
              attributes: [
                "LoanAppCoCustID",
                "FinAppID",
                "LoanAppCustID",
                "Title",
                "FirstName",
                "LastName",
                "PhoneNo",
                "Email",
                "Gender",
                "DateOfBirth",
                "Occupation",
                "Company",
                "Address",
                "District",
                "State",
                "PINCode",
                "IncomeSource",
                "AnnualIncome",
                "EMIDeduction",
                "MonthlyIncome",
                "MonthlyNetIncome",
              ],
            },
          ],
        },
        {
          model: UserMaster,
          as: "FAUserID",
          attributes: ["UserID", "UserName", "EmpID"],
        },
      ],
    });

    if (!financeApplication) {
      return res.status(404).json({ message: "FinanceApplication not found" });
    }
    // // // Step 2: Fetch Applicant Documents
    // const applicantDocs = await FinanceDocuments.findAll({
    //   where: {
    //     CustomerID: financeApplication.LoanAppCustID,
    //     CustomerType: "Applicant",
    //   },
    //   include: [
    //     {
    //       model: DocumentType,
    //       as: "DocumentType",
    //       attributes: ["DocumentAs", "Doctype"],
    //     },
    //   ],
    // });

    // // Step 3: Fetch Co-Applicant and Their Documents
    // const coApplicants = await FinAppCoApplicant.findAll({
    //   where: { LoanAppCustID: financeApplication.LoanAppCustID },
    //   include: [
    //     {
    //       model: FinanceDocuments,
    //       as: "FinCoApplicantDocs",
    //       where: { CustomerType: "CoApplicant" },
    //       required: false,
    //       include: [
    //         {
    //           model: DocumentType,
    //           as: "DocumentType",
    //           attributes: ["DocumentAs", "Doctype"],
    //         },
    //       ],
    //     },
    //   ],
    // });

    // // Step 4: Assemble the Final Result
    // const result = {
    //   ...financeApplication.toJSON(), // Convert Sequelize model instance to plain object
    //   FALoanAppCustID: {
    //     ...financeApplication.FALoanAppCustID.toJSON(),
    //     FinApplicantDocs: applicantDocs.map((doc) => doc.toJSON()), // Attach applicant documents
    //     coApplicant: coApplicants.map((coApplicant) => coApplicant.toJSON()), // Attach co-applicants and their documents
    //   },
    // };
    const finStatusData = await FinStatusUpdate.findOne({
      where: { FinAppID: financeApplication.FinAppID },
      attributes: ["StatusDate", "CurrentStage"],
    });
    // Merge finStatusData into financeApplication
    const responseData = {
      ...financeApplication.get({ plain: true }), // Convert to plain object
      StatusDate: finStatusData?.StatusDate,
      CurrentStage: finStatusData?.CurrentStage,
    };
    return res.status(200).json(responseData);
  } catch (error) {
    console.error("Error retrieving FinanceApplication:", error);
    return res.status(500).json({
      message: "An error occurred while retrieving the FinanceApplication",
    });
  }
};

// Update a FinanceApplication by the id in the request
exports.updateByPk = async (req, res) => {
  console.log("Financier ID:", req.body.FinancierID);

  try {
    // Validate request
    if (!req.params.id) {
      return res
        .status(400)
        .json({ message: "Finance Application ID is required" });
    }

    // Find the model by ID
    const ID = req.params.id;
    let financeApplication = await FinanceApplication.findByPk(ID);

    if (!financeApplication) {
      return res.status(404).json({ message: "FinanceApplication not found" });
    }

    // Update fields
    financeApplication.CustomerID =
      req.body.CustomerID || financeApplication.CustomerID;
    financeApplication.LoanAppCustID =
      req.body.LoanAppCustID || financeApplication.LoanAppCustID;
    financeApplication.ApplicationNumber =
      req.body.ApplicationNumber || financeApplication.ApplicationNumber;
    financeApplication.BookingID =
      req.body.BookingID || financeApplication.BookingID;
    financeApplication.UserID = req.body.UserID || financeApplication.UserID;
    financeApplication.QuotationNo =
      req.body.QuotationNo || financeApplication.QuotationNo;
    financeApplication.QuotationDate =
      req.body.QuotationDate || financeApplication.QuotationDate;
    financeApplication.QuotationAmt =
      req.body.QuotationAmt || financeApplication.QuotationAmt;
    financeApplication.ApplicantIncome =
      req.body.ApplicantIncome || financeApplication.ApplicantIncome;
    financeApplication.FinancierID =
      req.body.FinancierID || financeApplication.FinancierID;
    financeApplication.FinancierName =
      req.body.FinancierName || financeApplication.FinancierName;
    financeApplication.Branch = req.body.Branch || financeApplication.Branch;
    financeApplication.ExShowRoom =
      req.body.ExShowRoom || financeApplication.ExShowRoom;
    financeApplication.LifeTax = req.body.LifeTax || financeApplication.LifeTax;
    financeApplication.Accessories =
      req.body.Accessories || financeApplication.Accessories;
    financeApplication.Insurance =
      req.body.Insurance || financeApplication.Insurance;
    financeApplication.OtherAmt =
      req.body.OtherAmt || financeApplication.OtherAmt;
    financeApplication.OnRoadPrice =
      req.body.OnRoadPrice || financeApplication.OnRoadPrice;
    financeApplication.RateOfInterest =
      req.body.RateOfInterest || financeApplication.RateOfInterest;
    financeApplication.Tenure = req.body.Tenure || financeApplication.Tenure;
    financeApplication.LoanAmt = req.body.LoanAmt || financeApplication.LoanAmt;
    financeApplication.Status =
      req.body.Status || financeApplication.Status || "Active";
    financeApplication.Remarks = req.body.Remarks || financeApplication.Remarks;
    financeApplication.ModifiedDate = new Date();
    // Set ModifiedDate to current date if not provided

    console.log("Updated model:", financeApplication);

    // Save updated FinanceApplication in the database
    const updatedFinanceApplication = await financeApplication.save();

    return res.status(200).json(updatedFinanceApplication); // Send the updated FinanceApplication as response
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
        message: "Database error occurred while updating FinanceApplication.",
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

    console.error("Error updating FinanceApplication:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a FinanceApplication with the specified id in the request
exports.deleteById = async (req, res) => {
  const id = req.params.id;

  try {
    // Find the model by ID
    const financeApplication = await FinanceApplication.findByPk(id);

    // Check if the model exists
    if (!financeApplication) {
      return res
        .status(404)
        .json({ message: "FinanceApplication not found with id: " + id });
    }

    // Delete the model
    await financeApplication.destroy();

    // Send a success message
    res.status(200).json({
      message: "FinanceApplication with id: " + id + " deleted successfully",
    });
  } catch (err) {
    // Handle errors based on specific types
    if (err.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while deleting FinanceApplication.",
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
    console.error("Error deleting FinanceApplication:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Get list For Home Page

// exports.Test = async (req, res) => {
//   try {
//     const userID = req.query.UserID;
//     const { id } = req.params;

//     // if (!userID || !id) {
//     //   return res
//     //     .status(400)
//     //     .json({ message: "UserID and FinAppID are required" });
//     // }

//     const financeApplication = await FinAppApplicant.findOne({
//       where: { LoanAppCustID: 1 },
//       logging: console.log,
//       attributes: [
//         "LoanAppCustID",
//         "FinAppID",
//         "Title",
//         "FirstName",
//         "LastName",
//         "PhoneNo",
//         "Email",
//         "Gender",
//         "DateOfBirth",
//         "Occupation",
//         "Address",
//         "District",
//         "State",
//         "PinCode",
//         "Model",
//         "Variant",
//         "Transmission",
//         "FuelType",
//         "Colour",
//         "RefferedEmp",
//       ],
//       include: [
//         {
//           model: FinanceDocuments,
//           as: "FinApplicantDocs",
//           attributes: ["FinDocID", "CustomerType", "DocURL", "DocTypeID"],
//           where: { CustomerType: "Applicant" },
//           required: false,
//           include: [
//             {
//               model: DocumentType,
//               as: "DocumentType",
//               attributes: ["DocumentAs", "Doctype"],
//             },
//           ],
//         },
//         {
//           model: FinAppCoApplicant,
//           as: "coApplicants",
//           attributes: [
//             "LoanAppCoCustID",
//             "FinAppID",
//             "LoanAppCustID",
//             "Title",
//             "FirstName",
//             "LastName",
//             "PhoneNo",
//             "Email",
//             "Gender",
//             "DateOfBirth",
//             "Occupation",
//             "Company",
//             "Address",
//             "District",
//             "State",
//             "PINCode",
//             "IncomeSource",
//             "AnnualIncome",
//             "EMIDeduction",
//             "MonthlyIncome",
//             "MonthlyNetIncome",
//           ],
//           include: [
//             {
//               model: FinanceDocuments,
//               as: "FinCoApplicantDocs",
//               attributes: ["FinDocID", "CustomerType", "DocURL", "DocTypeID"],
//               where: { CustomerType: "CoApplicant" },
//               required: false,
//               include: [
//                 {
//                   model: DocumentType,
//                   as: "DocumentType",
//                   attributes: ["DocumentAs", "Doctype"],
//                 },
//               ],
//             },
//           ],
//         },
//       ],
//     });

//     if (!financeApplication) {
//       return res.status(404).json({ message: "FinanceApplication not found" });
//     }

//     // Debugging: Logging the retrieved data structure for review
//     console.log(
//       "Finance Application:",
//       JSON.stringify(financeApplication, null, 2)
//     );

//     console.log("Generated SQL:", financeApplication.sequelize.options.logging);

//     return res.status(200).json(financeApplication);
//   } catch (error) {
//     console.error("Error retrieving FinanceApplication:", error);
//     return res.status(500).json({
//       message: "An error occurred while retrieving the FinanceApplication",
//     });
//   }
// };
