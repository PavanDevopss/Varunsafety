/* eslint-disable no-unused-vars */
const db = require("../models");
const FinanceApplication = db.financeapplication;
const FinAppApplicant = db.finappapplicant;
const NewCarBooking = db.NewCarBookings;
const FinanceMaster = db.financemaster;
const FinanceLoanApplication = db.financeloanapplication;
const FinAppCoApplicant = db.finappcoapplicant;
const CustomerMaster = db.customermaster;
const StateMaster = db.statemaster;
const RegionMaster = db.regionmaster;
const UserMaster = db.usermaster;
const FinanceDocuments = db.financedocuments;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;
const fs = require("fs");
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

// seeach Financeapplication with BookingID&LoanAppid
exports.findAll = async (req, res) => {
  try {
    // Validate if BookingID and ApplicationNumber are provided in req.query
    if (!req.query.BookingID || !req.query.ApplicationNumber) {
      return res.status(400).json({
        message:
          "BookingID and ApplicationNumber are required query parameters.",
      });
    }
    // Fetch FinanceApplications
    const financeApplications = await FinanceApplication.findAll({
      where: {
        BookingID: req.query.BookingID,
        ApplicationNumber: req.query.ApplicationNumber,
      },
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
          model: FinAppApplicant,
          as: "FALoanAppCustID",
          attributes: [
            "LoanAppCustID",
            "FinAppID",
            "BookingID",
            "CustomerID",
            "UserID",
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
            "Transmission",
            "FuelType",
            "CreatedDate",
            "ModifiedDate",
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
          model: NewCarBooking,
          as: "FAppBookingID",
        },
        {
          model: FinanceMaster,
          as: "FAFinancierID",
        },
        {
          model: FinAppApplicant,
          as: "FALoanAppCustID",
        },
        //],
        //   order: [
        //     ["CreatedDate", "ASC"], // Order by ModelDescription in ascending order
      ],
    });
    if (financeApplications.length === 0) {
      return res.status(404).json({ message: "No Financier Types found" });
    }
    res.status(200).json(financeApplications);
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

exports.create = async (req, res) => {
  try {
    // Check if FinanceLoanappication already exists
    // const existingModel = await FinanceLoanApplication.findOne({
    //   where: { RefAppNo: req.body.RefAppNo },
    // });
    // if (existingModel) {
    //   return res.status(400).json({ message: "Finance Code already exists" });
    // }
    // Map fields individually from req.body to financeMaster object
    const financeLoanApplication = {
      Category: req.body.Category,
      LoanAppCustID: req.body.LoanAppCustID,
      RefAppNo: req.body.RefAppNo || null,
      BookingID: req.body.BookingID,
      CustomerID: req.body.CustomerID,
      FinAppID: req.body.FinAppID,
      UserID: req.body.UserID,
      FinancierID: req.body.FinancierID,
      SanctionAmount: req.body.SanctionAmount,
      ROI: req.body.ROI,
      Tenure: req.body.Tenure,
      DocumentCharge: req.body.DocumentCharge,
      StampDuties: req.body.StampDuties,
      ServiceCharges: req.body.ServiceCharges,
      ProcessingFee: req.body.ProcessingFee,
      Insurance: req.body.Insurance,
      Others: req.body.Others,
      TotalDeductions: req.body.TotalDeductions,
      MarginAmount: req.body.MarginAmount,
      NetDisbursement: req.body.NetDisbursement,
      DealerPayoutType: req.body.DealerPayoutType,
      DealerPayoutPercentage: req.body.DealerPayoutPercentage,
      DealerPayoutValue: req.body.DealerPayoutValue,
      ExecPayoutType: req.body.ExecPayoutType,
      ExecPayoutPercentage: req.body.ExecPayoutPercentage,
      ExecPayoutValue: req.body.ExecPayoutValue,
      ApprovedDate: req.body.ApprovedDate,
      ApplicationStatus: req.body.ApplicationStatus,
      IsActive: req.body.IsActive || true,
      PaymentStatus: req.body.PaymentStatus || "Pending",
      CreatedDate: req.body.CreatedDate || new Date(),
    };

    // Save FinanceMasters in the database
    const newFinanceloanapp = await FinanceLoanApplication.create(
      financeLoanApplication
    );

    return res.status(201).json(newFinanceloanapp); // Send the newly created FinanceMaster as response
  } catch (err) {
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
        message: "Database error occurred while creating FinanceMaster.",
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

    console.error("Error creating FinanceMaster:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// exports.LoanApprovedOne = async (req, res) => {
//   try {
//     const { FinanceLoanID } = req.query; // Keep only FinanceLoanID

//     // Check if the FinanceLoanID is provided
//     if (!FinanceLoanID) {
//       return res.status(400).json({ message: "FinanceLoanID is required." });
//     }

//     let approvedFinIn-House, approvedFinDirect;

//     // Fetch data based on the FinanceLoanID
//     approvedFinIn-House = await FinanceLoanApplication.findOne({
//       where: { FinanceLoanID, Category: "In-House" }, // Filter by FinanceLoanID and In-House category
//       include: [
//         {
//           model: FinanceApplication,
//           as: "FinanceloanFinAppID",
//           attributes: [
//             "CustomerID",
//             "ApplicationNumber",
//             "LoanAppCustID",
//             "FinancierName",
//             "Branch",
//             "LoanAmt",
//             "BookingID",
//             "CreatedDate",
//           ],
//           include: [
//             {
//               model: NewCarBooking,
//               as: "FAppBookingID",
//               attributes: [
//                 "CorporateSchema",
//                 "RegistrationType",
//                 "Finance",
//                 "Insurance",
//                 "Exchange",
//                 "ModelName",
//                 "ColourName",
//                 "VariantName",
//               ],
//             },
//             {
//               model: FinAppApplicant,
//               as: "FALoanAppCustID",
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
//                 "Model",
//                 "Variant",
//                 "FuelType",
//                 "Colour",
//                 "Transmission",
//                 "IncomeSource",
//                 "AnnualIncome",
//                 "MonthlyIncome",
//                 "IsCoApplicant",
//               ],
//             },
//           ],
//         },
//       ],
//       attributes: [
//         "FinanceLoanID",
//         "LoanAppCustID",
//         "RefAppNo",
//         "Category",
//         "BookingNo",
//         "BookingDate",
//         "BookingID",
//         "CustomerID",
//         "FinAppID",
//         "ApprovedDate",
//         "ApplicationStatus",
//         "FinancierType",
//         "Financier",
//         "Branch",
//         "SanctionAmount",
//         "MarginAmount",
//         "ROI",
//         "Tenure",
//         "DocumentCharge",
//         "StampDuties",
//         "ProcessingFee",
//         "PayoutType",
//         "PayoutPercentage",
//         "Insurance",
//         "ExecutivePayout",
//         "TotalDeductions",
//         "NetDisbursement",
//         "RegistrationType",
//         "Finance",
//         "CarInsurance",
//         "Exchange",
//         "IsActive",
//         "Status",
//         "CreatedDate",
//         "ModifiedDate",
//       ],
//     });

//     approvedFinDirect = await FinanceLoanApplication.findOne({
//       where: { FinanceLoanID, Category: "Direct" }, // Filter by FinanceLoanID and Direct category
//       include: [
//         {
//           model: FinAppApplicant,
//           as: "FinanceloanappID",
//           attributes: [
//             "LoanAppCustID",
//             "Title",
//             "FirstName",
//             "LastName",
//             "PhoneNo",
//             "Email",
//             "Gender",
//             "DateOfBirth",
//             "Occupation",
//             "Address",
//             "District",
//             "State",
//             "PinCode",
//             "IncomeSource",
//             "Model",
//             "Variant",
//             "FuelType",
//             "Colour",
//             "Transmission",
//             "AnnualIncome",
//             "MonthlyIncome",
//             "IsCoApplicant",
//           ],
//           include: [
//             {
//               model: FinAppCoApplicant,
//               as: "coApplicants",
//               attributes: [
//                 "LoanAppCoCustID",
//                 "FinAppID",
//                 "LoanAppCustID",
//                 "Title",
//                 "FirstName",
//                 "LastName",
//                 "PhoneNo",
//                 "Email",
//                 "Gender",
//                 "DateOfBirth",
//                 "Occupation",
//                 "Company",
//                 "Address",
//                 "District",
//                 "State",
//                 "PINCode",
//                 "IncomeSource",
//                 "AnnualIncome",
//                 "EMIDeduction",
//                 "MonthlyIncome",
//                 "MonthlyNetIncome",
//               ],
//             },
//           ],
//         },
//       ],
//       attributes: [
//         "FinanceLoanID",
//         "LoanAppCustID",
//         "RefAppNo",
//         "Category",
//         "BookingNo",
//         "BookingDate",
//         "BookingID",
//         "CustomerID",
//         "FinAppID",
//         "ApprovedDate",
//         "ApplicationStatus",
//         "FinancierType",
//         "Financier",
//         "Branch",
//         "SanctionAmount",
//         "MarginAmount",
//         "ROI",
//         "Tenure",
//         "DocumentCharge",
//         "StampDuties",
//         "ProcessingFee",
//         "PayoutType",
//         "PayoutPercentage",
//         "Insurance",
//         "ExecutivePayout",
//         "TotalDeductions",
//         "NetDisbursement",
//         "RegistrationType",
//         "Finance",
//         "CarInsurance",
//         "Exchange",
//         "IsActive",
//         "Status",
//         "CreatedDate",
//         "ModifiedDate",
//       ],
//     });

//     // Combine data
//     const combinedData = {
//       In-House: approvedFinIn-House,
//       Direct: approvedFinDirect,
//     };

//     return res.status(200).json(combinedData);
//   } catch (error) {
//     return res.status(500).json({
//       message: "Error fetching financial status update",
//       error: error.message,
//     });
//   }
// };

exports.LoanApprovedOne = async (req, res) => {
  try {
    const { UserID, FinanceLoanID } = req.query;

    // Validate required parameters
    // if (!Status) {
    //   return res.status(400).json({ message: "Status is required." });
    // }
    if (!UserID) {
      return res.status(400).json({ message: "UserID is required." });
    }
    if (!FinanceLoanID) {
      return res.status(400).json({ message: "FinanceLoanID is required." });
    }

    let financeLoanData;

    // Fetch data for In-House finance application based on FinanceLoanID
    financeLoanData = await FinanceLoanApplication.findOne({
      where: { FinanceLoanID, Category: "In-House", UserID },
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
              model: NewCarBooking,
              as: "FAppBookingID",
              attributes: [
                "BookingNo",
                "CorporateSchema",
                "RegistrationType",
                "Finance",
                "Insurance",
                "Exchange",
              ],
            },
            {
              model: FinAppApplicant,
              as: "FALoanAppCustID",
              attributes: [
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
                "Model",
                "Variant",
                "FuelType",
                "Colour",
                "Transmission",
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
          attributes: ["UserID", "UserName"],
        },
      ],
      attributes: [
        "FinanceLoanID",
        "RefAppNo",
        "Category",
        "BookingID",
        "CustomerID",
        "FinAppID",
        "UserID",
        "ApprovedDate",
        "ApplicationStatus",
        "TotalDeductions",
        "NetDisbursement",
        "PaymentStatus",
        "CreatedDate",
      ],
      order: [["CreatedDate", "DESC"]],
    });

    // If no In-House finance loan is found, fetch data for Direct finance application
    if (!financeLoanData) {
      financeLoanData = await FinanceLoanApplication.findOne({
        where: { FinanceLoanID, Category: "Direct", UserID },
        include: [
          {
            model: FinAppApplicant,
            as: "FinanceloanappID",
            attributes: [
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
              "Model",
              "Variant",
              "FuelType",
              "Colour",
              "Transmission",
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
            attributes: ["UserID", "UserName"],
          },
        ],
        attributes: [
          "FinanceLoanID",
          "RefAppNo",
          "Category",
          "BookingID",
          "CustomerID",
          "FinAppID",
          "UserID",
          "ApprovedDate",
          "ApplicationStatus",
          "TotalDeductions",
          "NetDisbursement",
          "PaymentStatus",
          "CreatedDate",
        ],
        order: [["CreatedDate", "DESC"]],
      });
    }

    // If no records found, return an error response
    if (!financeLoanData) {
      return res.status(404).json({ message: "No record found." });
    }

    return res.status(200).json(financeLoanData);
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching financial status update",
      error: error.message,
    });
  }
};

exports.CreateSelfLoanApp = async (req, res) => {
  const transaction = await Seq.transaction();

  try {
    // Extract applicant and co-applicant data from req.body
    const { Applicant, CoApplicant, Finaloan } = req.body;

    // Validate that Applicant exists
    if (!Applicant) {
      return res.status(400).json({ message: "Applicant data is required." });
    }

    let finAppApplicantData = null;
    let newFinAppCoApplicant = null;

    // Check if the applicant already exists
    const existingApplicant = await FinAppApplicant.findOne({
      where: { LoanAppCustID: Finaloan.LoanAppCustID },
      transaction,
    });

    if (existingApplicant) {
      // Check if the existing applicant has a co-applicant
      if (existingApplicant.IsCoApplicant) {
        console.log("Applicant exists with a co-applicant. Skipping creation.");
        // Skip creating a new applicant
      } else if (Applicant.IsCoApplicant === true && CoApplicant) {
        // Create a new co-applicant
        const finAppCoApplicantData = {
          FinAppID: CoApplicant.FinAppID || null,
          LoanAppCustID: existingApplicant.LoanAppCustID,
          Title: CoApplicant.Title,
          FirstName: CoApplicant.FirstName,
          LastName: CoApplicant.LastName || null,
          PhoneNo: CoApplicant.PhoneNo || null,
          Email: CoApplicant.Email || null,
          Gender: CoApplicant.Gender || null,
          DateOfBirth: CoApplicant.DateOfBirth || null,
          Occupation: CoApplicant.Occupation || null,
          Company: CoApplicant.Company || null,
          Address: CoApplicant.Address || null,
          District: CoApplicant.District || null,
          State: CoApplicant.State || null,
          PINCode: CoApplicant.PINCode || null,
          IncomeSource: CoApplicant.IncomeSource || null,
          AnnualIncome: CoApplicant.AnnualIncome || null,
          EMIDeduction: CoApplicant.EMIDeduction || null,
          MonthlyIncome: CoApplicant.MonthlyIncome || null,
          MonthlyNetIncome: CoApplicant.MonthlyNetIncome || null,
          CreatedDate: CoApplicant.CreatedDate || new Date(),
        };
        console.log("Creating new co-applicant:", finAppCoApplicantData);

        // Save FinAppCoApplicant in the database
        newFinAppCoApplicant = await FinAppCoApplicant.create(
          finAppCoApplicantData,
          { transaction }
        );
      }
    } else {
      // Create a new applicant
      finAppApplicantData = {
        BookingID: Applicant.BookingID || null,
        CustomerID: Applicant.CustomerID || null,
        UserID: Applicant.UserID,
        Title: Applicant.Title,
        FirstName: Applicant.FirstName,
        LastName: Applicant.LastName || null,
        PhoneNo: Applicant.PhoneNo || null,
        Email: Applicant.Email || null,
        Gender: Applicant.Gender || null,
        DateOfBirth: Applicant.DateOfBirth || null,
        Occupation: Applicant.Occupation || null,
        Company: Applicant.Company || null,
        Address: Applicant.Address || null,
        District: Applicant.District || null,
        State: Applicant.State || null,
        PinCode: Applicant.PinCode || null,
        IncomeSource: Applicant.IncomeSource || null,
        AnnualIncome: Applicant.AnnualIncome || null,
        MonthlyIncome: Applicant.MonthlyIncome || null,
        EMIDeduction: Applicant.EMIDeduction || null,
        MonthlyNetIncome: Applicant.MonthlyNetIncome || null,
        IsCoApplicant: Applicant.IsCoApplicant,
        RefferedEmp: Applicant.RefferedEmp || null,
        Model: Applicant.Model || null,
        Variant: Applicant.Variant || null,
        Transmission: Applicant.Transmission || null,
        FuelType: Applicant.FuelType || null,
        Colour: Applicant.Colour || null,
        CreatedDate: Applicant.CreatedDate || new Date(),
      };

      console.log("Creating new applicant:", finAppApplicantData);

      // Save FinAppApplicant in the database
      await FinAppApplicant.create(finAppApplicantData, { transaction });

      // If a co-applicant exists, create the co-applicant
      if (Applicant.IsCoApplicant === true && CoApplicant) {
        const finAppCoApplicantData = {
          FinAppID: CoApplicant.FinAppID || null,
          LoanAppCustID: existingApplicant.LoanAppCustID,
          Title: CoApplicant.Title,
          FirstName: CoApplicant.FirstName,
          LastName: CoApplicant.LastName || null,
          PhoneNo: CoApplicant.PhoneNo || null,
          Email: CoApplicant.Email || null,
          Gender: CoApplicant.Gender || null,
          DateOfBirth: CoApplicant.DateOfBirth || null,
          Occupation: CoApplicant.Occupation || null,
          Company: CoApplicant.Company || null,
          Address: CoApplicant.Address || null,
          District: CoApplicant.District || null,
          State: CoApplicant.State || null,
          PINCode: CoApplicant.PINCode || null,
          IncomeSource: CoApplicant.IncomeSource || null,
          AnnualIncome: CoApplicant.AnnualIncome || null,
          EMIDeduction: CoApplicant.EMIDeduction || null,
          MonthlyIncome: CoApplicant.MonthlyIncome || null,
          MonthlyNetIncome: CoApplicant.MonthlyNetIncome || null,
          CreatedDate: CoApplicant.CreatedDate || new Date(),
        };
        console.log("Creating new co-applicant:", finAppCoApplicantData);

        // Save FinAppCoApplicant in the database
        newFinAppCoApplicant = await FinAppCoApplicant.create(
          finAppCoApplicantData,
          { transaction }
        );
      }
    }

    // Check if the loan application already exists
    const existingLoanApp = await FinanceLoanApplication.findOne({
      where: { RefAppNo: Finaloan.RefAppNo },
      transaction,
    });

    if (existingLoanApp) {
      return res.status(400).json({ message: "Application already exists." });
    }

    // Prepare loan application data
    const finLoanApplication = {
      Category: Finaloan.Category,
      LoanAppCustID: Finaloan.LoanAppCustID,
      RefAppNo: Finaloan.RefAppNo,
      BookingID: Finaloan.BookingID,
      CustomerID: Finaloan.CustomerID,
      FinAppID: Finaloan.FinAppID,
      UserID: Finaloan.UserID,
      FinancierID: Finaloan.FinancierID,
      SanctionAmount: Finaloan.SanctionAmount,
      ROI: Finaloan.ROI,
      Tenure: Finaloan.Tenure,
      DocumentCharge: Finaloan.DocumentCharge,
      StampDuties: Finaloan.StampDuties,
      ServiceCharges: Finaloan.ServiceCharges,
      ProcessingFee: Finaloan.ProcessingFee,
      Insurance: Finaloan.Insurance,
      Others: Finaloan.Others,
      TotalDeductions: Finaloan.TotalDeductions,
      MarginAmount: Finaloan.MarginAmount,
      NetDisbursement: Finaloan.NetDisbursement,
      DealerPayoutType: Finaloan.DealerPayoutType,
      DealerPayoutPercentage: Finaloan.DealerPayoutPercentage,
      DealerPayoutValue: Finaloan.DealerPayoutValue,
      ExecPayoutType: Finaloan.ExecPayoutType,
      ExecPayoutPercentage: Finaloan.ExecPayoutPercentage,
      ExecPayoutValue: Finaloan.ExecPayoutValue,
      TotalPayout: Finaloan.TotalPayout,
      ApprovedDate: Finaloan.ApprovedDate,
      ApplicationStatus: Finaloan.ApplicationStatus,
      IsActive: Finaloan.IsActive || true,
      PaymentStatus: Finaloan.PaymentStatus,
      CreatedDate: Finaloan.CreatedDate || new Date(),
    };

    // Save FinanceMasters in the database
    const newFinLoanApp = await FinanceLoanApplication.create(
      finLoanApplication,
      { transaction }
    );

    // Commit transaction
    await transaction.commit();

    // Send both applicants in the response
    return res.status(200).json({
      Applicant: existingApplicant || finAppApplicantData,
      CoApplicant:
        Applicant.IsCoApplicant === true ? newFinAppCoApplicant : null,
      FinanceLoan: newFinLoanApp,
    });
  } catch (err) {
    // Rollback transaction in case of error
    await transaction.rollback();

    // Handle errors based on specific types
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
    if (err.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message: "Database error occurred while creating FinAppApplicant.",
        details: err.message,
      });
    }
    if (err.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: err.message,
      });
    }
    console.error("Error creating FinAppApplicant:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
exports.LoanApprovedList = async (req, res) => {
  try {
    const { Status, UserID } = req.query;

    // Check if the Status is provided
    if (!Status) {
      return res.status(400).json({ message: "Status is required." });
    }
    if (!UserID) {
      return res.status(400).json({ message: "UserID is required." });
    }

    let approvedFinInhouse, approvedFinDirect;

    // Fetch data based on the Status and Category (In-House or Direct)
    if (Status === "Approved" || Status === "Pending") {
      // Fetch approved/pending In-House finance application
      approvedFinInhouse = await FinanceLoanApplication.findAll({
        where: {
          ApplicationStatus: Status,
          Category: "In-House",
          UserID: UserID,
        },
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
                model: NewCarBooking,
                as: "FAppBookingID",
                attributes: [
                  "BookingNo",
                  "ModelName",
                  "ColourName",
                  "VariantName",
                  "Fuel",
                  "Transmission",
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
          {
            model: UserMaster,
            as: "FinanceloanUserID",
            attributes: ["UserID", "UserName"],
          },
        ],
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
          // "SanctionAmount",
          // "ROI",
          // "Tenure",
          // "DocumentCharge",
          // "StampDuties",
          // "ServiceCharges",
          // "ProcessingFee",
          // "Insurance",
          // "Others",
          "TotalDeductions",
          // "MarginAmount",
          // "NetDisbursement",
          // "DealerPayoutType",
          // "DealerPayoutPercentage",
          // "DealerPayoutValue",
          // "ExecPayoutType",
          // "ExecPayoutPercentage",
          // "ExecPayoutValue",
          "ApprovedDate",
          "ApplicationStatus",
          "IsActive",
          "PaymentStatus",
          "CreatedDate",
        ],
        order: [["CreatedDate", "DESC"]],
      });

      // Fetch approved/pending Direct-finance application
      approvedFinDirect = await FinanceLoanApplication.findAll({
        where: {
          ApplicationStatus: Status,
          Category: "Direct",
          UserID: UserID,
        },
        include: [
          {
            model: FinAppApplicant,
            as: "FinanceloanappID",
            attributes: [
              "Title",
              "FirstName",
              "LastName",
              "Model",
              "Variant",
              "FuelType",
              "Colour",
              "Transmission",
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
            attributes: ["UserID", "UserName"],
          },
        ],
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
          // "SanctionAmount",
          // "ROI",
          // "Tenure",
          // "DocumentCharge",
          // "StampDuties",
          // "ServiceCharges",
          // "ProcessingFee",
          // "Insurance",
          // "Others",
          "TotalDeductions",
          // "MarginAmount",
          // "NetDisbursement",
          // "DealerPayoutType",
          // "DealerPayoutPercentage",
          // "DealerPayoutValue",
          // "ExecPayoutType",
          // "ExecPayoutPercentage",
          // "ExecPayoutValue",
          "ApprovedDate",
          "ApplicationStatus",
          // "IsActive",
          "PaymentStatus",
          "CreatedDate",
        ],
        order: [["CreatedDate", "DESC"]],
      });
    } else {
      return res.status(400).json({ message: "Invalid status provided" });
    }

    // Map data to the required format without prefixes
    const formattedInhouseData = approvedFinInhouse.map((loan) => ({
      FinanceLoanID: loan.FinanceLoanID,
      RefAppNo: loan.RefAppNo,
      ALCategory: loan.Category,
      BookingID: loan.BookingID,
      LoanAppCustID: loan.LoanAppCustID,
      CustomerID: loan.CustomerID,
      FinAppID: loan.FinAppID,
      UserID: loan.UserID,
      ApprovedDate: loan.ApprovedDate,
      ApplicationStatus: loan.ApplicationStatus,
      CreatedDateLoan: loan.CreatedDate,
      // FinancierType: loan.FinancierType,
      FinancierID: loan.FinancierID,
      TotalDeductions: loan.TotalDeductions,
      PaymentStatus: loan.PaymentStatus,
      ApplicationNumber: loan.FinanceloanFinAppID?.ApplicationNumber || null,
      // LoanAppCustID: loan.FinanceloanFinAppID?.LoanAppCustID || null,
      FAFinancierName: loan.FinanceloanFinAppID?.FinancierName || null,
      LoanAmt: loan.FinanceloanFinAppID?.LoanAmt || null,
      CreatedDate: loan.FinanceloanFinAppID?.CreatedDate || null,
      FinancierName: loan.FLAFinancierID?.FinancierName || null,
      Category: loan.FLAFinancierID?.Category || null,
      Location: loan.FLAFinancierID?.Location || null,
      FinancierCode: loan.FLAFinancierID?.FinancierCode || null,
      ModelName: loan.FinanceloanFinAppID?.FAppBookingID?.ModelName || null,
      ColourName: loan.FinanceloanFinAppID?.FAppBookingID?.ColourName || null,
      VariantName: loan.FinanceloanFinAppID?.FAppBookingID?.VariantName || null,
      FuelType: loan?.FinanceloanFinAppID?.FAppBookingID?.Fuel || null,
      Transmission:
        loan?.FinanceloanFinAppID?.FAppBookingID?.Transmission || null,
      Title: loan.FinanceloanFinAppID?.FALoanAppCustID?.Title || null,
      FirstName: loan.FinanceloanFinAppID?.FALoanAppCustID?.FirstName || null,
      LastName: loan.FinanceloanFinAppID?.FALoanAppCustID?.LastName || null,
      UserName: loan.FinanceloanUserID?.UserName || null,
    }));

    const formattedDirectData = approvedFinDirect.map((loan) => ({
      FinanceLoanID: loan.FinanceLoanID,
      RefAppNo: loan.RefAppNo,
      ALCategory: loan.Category,
      BookingID: loan.BookingID,
      LoanAppCustID: loan.LoanAppCustID,
      CustomerID: loan.CustomerID,
      FinAppID: loan.FinAppID,
      UserID: loan.UserID,
      ApprovedDate: loan.ApprovedDate,
      ApplicationStatus: loan.ApplicationStatus,
      CreatedDateLoan: loan.CreatedDate,
      FinancierID: loan.FinancierID,
      TotalDeductions: loan.TotalDeductions,
      PaymentStatus: loan.PaymentStatus,
      ApplicationNumber: loan?.RefAppNo || null,
      FinancierName: loan.FLAFinancierID?.FinancierName || null,
      Category: loan.FLAFinancierID?.Category || null,
      Location: loan.FLAFinancierID?.Location || null,
      FinancierCode: loan.FLAFinancierID?.FinancierCode || null,
      ModelName: loan.FinanceloanappID?.Model || null,
      ColourName: loan.FinanceloanappID?.Colour || null,
      VariantName: loan.FinanceloanappID?.Variant || null,
      FuelType: loan.FinanceloanappID?.FuelType || null,
      Transmission: loan.FinanceloanappID?.Transmission || null,
      Title: loan?.FinanceloanappID?.Title || null,
      FirstName: loan.FinanceloanappID?.FirstName || null,
      LastName: loan.FinanceloanappID?.LastName || null,
      UserName: loan.FinanceloanUserID?.UserName || null,
    }));

    // Combine data
    const combinedData = [...formattedInhouseData, ...formattedDirectData];
    // Sort combinedData by CreatedDate in descending order
    combinedData.sort(
      (a, b) => new Date(b.CreatedDateLoan) - new Date(a.CreatedDateLoan)
    );

    return res.status(200).json(combinedData);
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching financial status update",
      error: error.message,
    });
  }
};

exports.LoanApprovedDetails = async (req, res) => {
  try {
    const { UserID, FinanceLoanID } = req.query;

    // Validate required parameters
    // if (!Status) {
    //   return res.status(400).json({ message: "Status is required." });
    // }
    if (!UserID) {
      return res.status(400).json({ message: "UserID is required." });
    }
    if (!FinanceLoanID) {
      return res.status(400).json({ message: "FinanceLoanID is required." });
    }

    let financeLoanData;

    // Fetch data for In-House finance application based on FinanceLoanID
    financeLoanData = await FinanceLoanApplication.findOne({
      where: { FinanceLoanID, Category: "In-House", UserID },
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
              model: NewCarBooking,
              as: "FAppBookingID",
              attributes: [
                "BookingNo",
                "CorporateSchema",
                "RegistrationType",
                "Finance",
                "Insurance",
                "Exchange",
              ],
            },
            {
              model: FinAppApplicant,
              as: "FALoanAppCustID",
              attributes: [
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
                "Model",
                "Variant",
                "FuelType",
                "Colour",
                "Transmission",
                "IncomeSource",
                "AnnualIncome",
                "MonthlyIncome",
                "EMIDeduction",
                "MonthlyNetIncome",
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
          attributes: ["UserID", "UserName"],
        },
      ],
      attributes: [
        "FinanceLoanID",
        "RefAppNo",
        "Category",
        "BookingID",
        "CustomerID",
        "FinAppID",
        "UserID",
        "FinancierID",
        "ApprovedDate",
        "ApplicationStatus",
        "SanctionAmount",
        "MarginAmount",
        "ROI",
        "Tenure",
        "DocumentCharge",
        "StampDuties",
        "ServiceCharges",
        "ProcessingFee",
        "DealerPayoutType",
        "DealerPayoutPercentage",
        "DealerPayoutValue",
        "ExecPayoutType",
        "ExecPayoutPercentage",
        "ExecPayoutValue",
        "Insurance",
        "TotalDeductions",
        "NetDisbursement",
        "PaymentStatus",
        "CreatedDate",
      ],
      order: [["CreatedDate", "DESC"]],
    });

    // If no In-House finance loan is found, fetch data for Direct finance application
    if (!financeLoanData) {
      financeLoanData = await FinanceLoanApplication.findOne({
        where: { FinanceLoanID, Category: "Direct", UserID },
        include: [
          {
            model: FinAppApplicant,
            as: "FinanceloanappID",
            attributes: [
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
              "Model",
              "Variant",
              "FuelType",
              "Colour",
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
            attributes: ["UserID", "UserName"],
          },
        ],
        attributes: [
          "FinanceLoanID",
          "RefAppNo",
          "Category",
          "BookingID",
          "CustomerID",
          "FinAppID",
          "UserID",
          "FinancierID",
          "ApprovedDate",
          "ApplicationStatus",
          "SanctionAmount",
          "MarginAmount",
          "ROI",
          "Tenure",
          "DocumentCharge",
          "StampDuties",
          "ServiceCharges",
          "ProcessingFee",
          "Insurance",
          "DealerPayoutType",
          "DealerPayoutPercentage",
          "DealerPayoutValue",
          "ExecPayoutType",
          "ExecPayoutPercentage",
          "ExecPayoutValue",
          "TotalDeductions",
          "NetDisbursement",
          "PaymentStatus",
          "CreatedDate",
        ],
        order: [["CreatedDate", "DESC"]],
      });
    }

    // If no records found, return an error response
    if (!financeLoanData) {
      return res.status(404).json({ message: "No record found." });
    }

    return res.status(200).json(financeLoanData);
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching financial status update",
      error: error.message,
    });
  }
};

exports.CreateApprovedAppWeb = async (req, res) => {
  const transaction = await Seq.transaction();

  upload(req, res, async (err) => {
    if (err) {
      console.error("Error uploading file:", err);
      return res.status(400).json({ message: err.message });
    }

    try {
      // Extract applicant and co-applicant data from req.body
      const { Applicant, CoApplicant, Finaloan, finDocument } = req.body;

      // Validate that Applicant exists
      // if (Applicant == null) {
      //   return res.status(400).json({ message: "Applicant data is required." });
      // }

      let finAppApplicantData = null;
      let newFinAppCoApplicant = null;
      let newApplicant = null;

      // Check if the applicant already exists
      const existingApplicant = await FinAppApplicant.findOne({
        where: { LoanAppCustID: Finaloan.LoanAppCustID },
        transaction,
      });

      if (existingApplicant) {
        // Check if the existing applicant has a co-applicant
        if (existingApplicant.IsCoApplicant) {
          console.log(
            "Applicant exists with a co-applicant. Skipping creation."
          );
          // Skip creating a new applicant
        } else if (Applicant.IsCoApplicant === true && CoApplicant) {
          // Create a new co-applicant
          const finAppCoApplicantData = {
            FinAppID: CoApplicant.FinAppID || null,
            LoanAppCustID: existingApplicant.LoanAppCustID,
            Title: CoApplicant.Title,
            FirstName: CoApplicant.FirstName,
            LastName: CoApplicant.LastName || null,
            PhoneNo: CoApplicant.PhoneNo || null,
            Email: CoApplicant.Email || null,
            Gender: CoApplicant.Gender || null,
            DateOfBirth: CoApplicant.DateOfBirth || null,
            Occupation: CoApplicant.Occupation || null,
            Company: CoApplicant.Company || null,
            Address: CoApplicant.Address || null,
            District: CoApplicant.District || null,
            State: CoApplicant.State || null,
            PINCode: CoApplicant.PINCode || null,
            IncomeSource: CoApplicant.IncomeSource || null,
            AnnualIncome: CoApplicant.AnnualIncome || null,
            EMIDeduction: CoApplicant.EMIDeduction || null,
            MonthlyIncome: CoApplicant.MonthlyIncome || null,
            MonthlyNetIncome: CoApplicant.MonthlyNetIncome || null,
            CreatedDate: CoApplicant.CreatedDate || new Date(),
          };
          console.log("Creating new co-applicant:", finAppCoApplicantData);

          // Save FinAppCoApplicant in the database
          newFinAppCoApplicant = await FinAppCoApplicant.create(
            finAppCoApplicantData,
            { transaction }
          );
        }
      } else {
        // Create a new applicant
        finAppApplicantData = {
          BookingID: Applicant.BookingID || null,
          CustomerID: Applicant.CustomerID || null,
          UserID: Applicant.UserID,
          Title: Applicant.Title,
          FirstName: Applicant.FirstName,
          LastName: Applicant.LastName || null,
          PhoneNo: Applicant.PhoneNo || null,
          Email: Applicant.Email || null,
          Gender: Applicant.Gender || null,
          DateOfBirth: Applicant.DateOfBirth || null,
          Occupation: Applicant.Occupation || null,
          Company: Applicant.Company || null,
          Address: Applicant.Address || null,
          District: Applicant.District || null,
          State: Applicant.State || null,
          PinCode: Applicant.PinCode || null,
          IncomeSource: Applicant.IncomeSource || null,
          AnnualIncome: Applicant.AnnualIncome || null,
          MonthlyIncome: Applicant.MonthlyIncome || null,
          EMIDeduction: Applicant.EMIDeduction || null,
          MonthlyNetIncome: Applicant.MonthlyNetIncome || null,
          IsCoApplicant: Applicant.IsCoApplicant,
          RefferedEmp: Applicant.RefferedEmp || null,
          Model: Applicant.Model || null,
          Variant: Applicant.Variant || null,
          Transmission: Applicant.Transmission || null,
          FuelType: Applicant.FuelType || null,
          Colour: Applicant.Colour || null,
          CreatedDate: Applicant.CreatedDate || new Date(),
        };

        console.log("Creating new applicant:", finAppApplicantData);

        // Save FinAppApplicant in the database
        newApplicant = await FinAppApplicant.create(finAppApplicantData, {
          transaction,
        });

        // If a co-applicant exists, create the co-applicant
        if (Applicant.IsCoApplicant === true && CoApplicant) {
          const finAppCoApplicantData = {
            FinAppID: CoApplicant.FinAppID || null,
            LoanAppCustID: newApplicant.LoanAppCustID,
            Title: CoApplicant.Title,
            FirstName: CoApplicant.FirstName,
            LastName: CoApplicant.LastName || null,
            PhoneNo: CoApplicant.PhoneNo || null,
            Email: CoApplicant.Email || null,
            Gender: CoApplicant.Gender || null,
            DateOfBirth: CoApplicant.DateOfBirth || null,
            Occupation: CoApplicant.Occupation || null,
            Company: CoApplicant.Company || null,
            Address: CoApplicant.Address || null,
            District: CoApplicant.District || null,
            State: CoApplicant.State || null,
            PINCode: CoApplicant.PINCode || null,
            IncomeSource: CoApplicant.IncomeSource || null,
            AnnualIncome: CoApplicant.AnnualIncome || null,
            EMIDeduction: CoApplicant.EMIDeduction || null,
            MonthlyIncome: CoApplicant.MonthlyIncome || null,
            MonthlyNetIncome: CoApplicant.MonthlyNetIncome || null,
            CreatedDate: CoApplicant.CreatedDate || new Date(),
          };
          console.log("Creating new co-applicant:", finAppCoApplicantData);

          // Save FinAppCoApplicant in the database
          newFinAppCoApplicant = await FinAppCoApplicant.create(
            finAppCoApplicantData,
            { transaction }
          );
        }
      }

      // Check if the loan application already exists
      const existingLoanApp = await FinanceLoanApplication.findOne({
        where: { RefAppNo: Finaloan.RefAppNo },
        transaction,
      });

      if (existingLoanApp) {
        return res.status(400).json({ message: "Application already exists." });
      }

      // Prepare loan application data
      const finLoanApplication = {
        Category: Finaloan.Category,
        LoanAppCustID: Finaloan.LoanAppCustID
          ? Finaloan.LoanAppCustID
          : newApplicant.LoanAppCustID,
        RefAppNo: Finaloan.RefAppNo,
        BookingID: Finaloan.BookingID,
        CustomerID: Finaloan.CustomerID,
        FinAppID: Finaloan.FinAppID,
        UserID: Finaloan.UserID,
        FinancierID: Finaloan.FinancierID,
        SanctionAmount: Finaloan.SanctionAmount,
        ROI: Finaloan.ROI,
        Tenure: Finaloan.Tenure,
        DocumentCharge: Finaloan.DocumentCharge,
        StampDuties: Finaloan.StampDuties,
        ServiceCharges: Finaloan.ServiceCharges,
        ProcessingFee: Finaloan.ProcessingFee,
        Insurance: Finaloan.Insurance,
        Others: Finaloan.Others,
        TotalDeductions: Finaloan.TotalDeductions,
        MarginAmount: Finaloan.MarginAmount,
        NetDisbursement: Finaloan.NetDisbursement,
        DealerPayoutType: Finaloan.DealerPayoutType,
        DealerPayoutPercentage: Finaloan.DealerPayoutPercentage,
        DealerPayoutValue: Finaloan.DealerPayoutValue,
        ExecPayoutType: Finaloan.ExecPayoutType,
        ExecPayoutPercentage: Finaloan.ExecPayoutPercentage,
        ExecPayoutValue: Finaloan.ExecPayoutValue,
        TotalPayout: Finaloan.TotalPayout,
        ApprovedDate: Finaloan.ApprovedDate,
        ApplicationStatus: Finaloan.ApplicationStatus,
        IsActive: Finaloan.IsActive || true,
        PaymentStatus: Finaloan.PaymentStatus,
        CreatedDate: Finaloan.CreatedDate || new Date(),
      };

      // Save FinanceMasters in the database
      const newFinLoanApp = await FinanceLoanApplication.create(
        finLoanApplication,
        { transaction }
      );

      // Handle document creation if a file is uploaded
      if (req.file) {
        const { CustomerID, CustomerType, DocTypeID } = finDocument || {};

        // Validate required fields for document creation
        if (!finDocument || !CustomerID || !CustomerType || !DocTypeID) {
          await transaction.rollback();
          return res.status(400).json({
            message:
              "finDocument must be provided with CustomerID, CustomerType, and DocTypeID.",
          });
        }

        // Generate document name and transfer
        let docUrl = null;
        try {
          const genName = await finApprovedDocument(
            req.file,
            newFinLoanApp.FinAppID,
            Finaloan.CurrentStage
          );
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
        } catch (error) {
          console.error("Error uploading document:", error);
          await transaction.rollback();
          return res.status(500).json({ message: "Error uploading document." });
        }

        // Create the finance document record
        await FinanceDocuments.create(
          {
            CustomerID,
            CustomerType,
            DocTypeID,
            DocURL: docUrl,
            Remarks: finDocument.Remarks || null,
            DocStatus: "Approved",
            IsActive: true,
            Status: "Active",
          },
          { transaction }
        );
      }

      // Commit transaction
      await transaction.commit();

      // Send response
      return res.status(201).json({
        Applicant: existingApplicant || finAppApplicantData,
        CoApplicant:
          Applicant.IsCoApplicant === true ? newFinAppCoApplicant : null,
        FinanceLoan: newFinLoanApp,
      });
    } catch (err) {
      // Rollback transaction in case of error
      try {
        await transaction.rollback();
      } catch (rollbackError) {
        console.error("Transaction rollback failed:", rollbackError);
      }

      // Handle specific error types
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

      if (err.name === "SequelizeDatabaseError") {
        return res.status(500).json({
          message: "Database error occurred while creating FinLoanApplication.",
          details: err.message,
        });
      }

      if (err.name === "SequelizeConnectionError") {
        return res.status(503).json({
          message: "Service unavailable. Unable to connect to the database.",
          details: err.message,
        });
      }

      console.error("Error creating FinLoanApplication:", err);
      return res.status(500).json({ message: "Internal server error" });
    } finally {
      // Clean up temporary file after processing
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    }
  });
};

exports.FindOne = async (req, res) => {
  try {
    const { UserID, FinanceLoanID } = req.query;

    // Validate required parameters
    if (!UserID) {
      return res.status(400).json({ message: "UserID is required." });
    }
    if (!FinanceLoanID) {
      return res.status(400).json({ message: "FinanceLoanID is required." });
    }

    // Fetch data for finance applications based on FinanceLoanID
    const financeLoanData = await FinanceLoanApplication.findOne({
      where: { FinanceLoanID, UserID },
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
          attributes: ["UserID", "UserName"],
        },
        {
          model: CustomerMaster,
          as: "FinanceloanCustomerID",
          attributes: ["CustomerID", "CustID"],
        },
        {
          model: NewCarBooking,
          as: "FinanceloanBookingID",
          attributes: [
            "BookingNo",
            "BookingTime",
            "CorporateSchema",
            "RegistrationType",
            "Finance",
            "Insurance",
            "Exchange",
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
            "Email",
            "Gender",
            "DateOfBirth",
            "Occupation",
            "Company",
            "Address",
            "District",
            "State",
            "PinCode",
            "Model",
            "Variant",
            "FuelType",
            "Colour",
            "Transmission",
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
                "AnnualIncome",
                "MonthlyIncome",
                "EMIDeduction",
                "MonthlyNetIncome",
              ],
            },
          ],
        },
      ],
      attributes: [
        "FinanceLoanID",
        "RefAppNo",
        "BookingID",
        "CustomerID",
        "FinAppID",
        "UserID",
        "FinancierID",
        "Category",
        "SanctionAmount",
        "ROI",
        "Tenure",
        "DocumentCharge",
        "StampDuties",
        "ServiceCharges",
        "ProcessingFee",
        "Insurance",
        "Others",
        "TotalDeductions",
        "MarginAmount",
        "NetDisbursement",
        "DealerPayoutType",
        "DealerPayoutPercentage",
        "DealerPayoutValue",
        "ExecPayoutType",
        "ExecPayoutPercentage",
        "ExecPayoutValue",
        "TotalPayout",
        "ApprovedDate",
        "ApplicationStatus",
        // "TotalDeductions",
        // "NetDisbursement",
        "PaymentStatus",
        "CreatedDate",
      ],
      order: [["CreatedDate", "DESC"]],
    });

    // If no records found, return an error response
    if (!financeLoanData) {
      return res.status(404).json({ message: "No record found." });
    }

    return res.status(200).json(financeLoanData);
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching financial status update",
      error: error.message,
    });
  }
};
