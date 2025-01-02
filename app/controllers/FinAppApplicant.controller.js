/* eslint-disable no-unused-vars */
const db = require("../models");
const FinAppApplicant = db.finappapplicant;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;
const NewCarBookings = db.NewCarBookings;
const FinanceApplication = db.financeapplication;
const UserMaster = db.usermaster;
const FinAppCoApplicant = db.finappcoapplicant;
const FinStatusUpdate = db.finstatusupdate;
const FinanceTrack = db.finstatustracking;
const { genFinApplicationNumber } = require("../Utils/generateService");

// Basic CRUD API

// Create and Save a new FinAppApplicant

exports.create = async (req, res) => {
  try {
    // Map fields directly from req.body
    const finAppApplicantData = {
      FinAppID: req.body.FinAppID || null,
      BookingID: req.body.BookingID || null,
      CustomerID: req.body.CustomerID || null,
      UserID: req.body.UserID,
      Title: req.body.Title,
      FirstName: req.body.FirstName,
      LastName: req.body.LastName || null,
      PhoneNo: req.body.PhoneNo || null,
      Email: req.body.Email || null,
      Gender: req.body.Gender || null,
      DateOfBirth: req.body.DateOfBirth || null,
      Occupation: req.body.Occupation || null,
      Company: req.body.Company || null,
      Address: req.body.Address || null,
      District: req.body.District || null,
      State: req.body.State || null,
      PinCode: req.body.PinCode || null,
      IncomeSource: req.body.IncomeSource || null,
      AnnualIncome: req.body.AnnualIncome || null,
      MonthlyIncome: req.body.MonthlyIncome || null,
      EMIDeduction: req.body.EMIDeduction || null,
      MonthlyNetIncome: req.body.MonthlyNetIncome || null,
      IsCoApplicant: req.body.IsCoApplicant,
      Model: req.body.Model || null,
      Variant: req.body.Variant || null,
      Transmission: req.body.Transmission || null,
      FuelType: req.body.FuelType || null,
    };

    // Save FinAppApplicant in the database
    const newFinAppApplicant = await FinAppApplicant.create(
      finAppApplicantData
    );

    return res.status(201).json(newFinAppApplicant); // Send the newly created FinAppApplicant as response
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
        message: "Database error occurred while creating FinAppApplicant.",
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
    console.error("Error creating FinAppApplicant:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Retrieve all FinAppApplicant from the database.
exports.findAll = async (req, res) => {
  try {
    const userID = req.query.UserID;
    if (!userID) {
      return res.status(400).json({ message: "UserID is required" });
    }

    console.log("UserID received:", userID);

    const finAppApplicants = await FinAppApplicant.findAll({
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
          model: NewCarBookings,
          as: "FABookingID",
          attributes: [
            "BookingNo",
            "CustomerID",
            "SalesPersonID",
            "ModelName",
            "VariantName",
            "ColourName",
          ],
          include: [
            {
              model: UserMaster,
              as: "NCBSPUserID",
              attributes: ["UserName", "UserID", "EmpID"],
            },
          ],
        },
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
        {
          model: UserMaster,
          as: "FAAUserID",
          attributes: ["UserName", "UserID", "EmpID"],
        },
      ],
      where: { UserID: userID },
      order: [["CreatedDate", "ASC"]],
    });

    if (finAppApplicants.length === 0) {
      return res.status(404).json({ message: "No FinAppApplicants found" });
    }

    // Modify the mappedData to include coApplicant details in the same object
    const mappedData = finAppApplicants.map((item) => {
      // Check if there are any coApplicants
      const coApplicant =
        item.coApplicants.length > 0 ? item.coApplicants[0] : null;

      return {
        LoanAppCustID: item.LoanAppCustID,
        FinAppID: item.FinAppID,
        BookingID: item.BookingID,
        Title: item.Title,
        FirstName: item.FirstName,
        LastName: item.LastName,
        PhoneNo: item.PhoneNo,
        Email: item.Email,
        Gender: item.Gender,
        DateOfBirth: item.DateOfBirth,
        Occupation: item.Occupation,
        Company: item.Company,
        Address: item.Address,
        District: item.District,
        State: item.State,
        PinCode: item.PinCode,
        IncomeSource: item.IncomeSource,
        AnnualIncome: item.AnnualIncome,
        MonthlyIncome: item.MonthlyIncome,
        EMIDeduction: item.EMIDeduction,
        MonthlyNetIncome: item.MonthlyNetIncome,
        IsCoApplicant: item.IsCoApplicant,
        Model: item.Model,
        Variant: item.Variant,
        Transmission: item.Transmission,
        FuelType: item.FuelType,
        CreatedDate: item.CreatedDate,
        ModifiedDate: item.ModifiedDate,
        BookingNo: item.FABookingID ? item.FABookingID.BookingNo : null,
        CustomerID: item.FABookingID ? item.FABookingID.CustomerID : null,
        SalesPersonID: item.FABookingID ? item.FABookingID.SalesPersonID : null,
        ModelName: item.FABookingID ? item.FABookingID.ModelName : null,
        VariantName: item.FABookingID ? item.FABookingID.VariantName : null,
        ColourName: item.FABookingID ? item.FABookingID.ColourName : null,
        NCBSPUserName:
          item.FABookingID && item.FABookingID.NCBSPUserID
            ? item.FABookingID.NCBSPUserID.UserName
            : null,
        NCBSPUserID:
          item.FABookingID && item.FABookingID.NCBSPUserID
            ? item.FABookingID.NCBSPUserID.UserID
            : null,
        NCBSPUserEmpID:
          item.FABookingID && item.FABookingID.NCBSPUserID
            ? item.FABookingID.NCBSPUserID.EmpID
            : null,
        FAAUserName: item.FAAUserID ? item.FAAUserID.UserName : null,
        FAAUserID: item.FAAUserID ? item.FAAUserID.UserID : null,
        FAAUserEmpID: item.FAAUserID ? item.FAAUserID.EmpID : null,
        LoanAppCoCustID: coApplicant ? coApplicant.LoanAppCoCustID : null,
        CoApplicantFinAppID: coApplicant ? coApplicant.FinAppID : null,
        CoApplicantLoanAppCustID: coApplicant
          ? coApplicant.LoanAppCustID
          : null,
        CoApplicantTitle: coApplicant ? coApplicant.Title : null,
        CoApplicantFirstName: coApplicant ? coApplicant.FirstName : null,
        CoApplicantLastName: coApplicant ? coApplicant.LastName : null,
        CoApplicantPhoneNo: coApplicant ? coApplicant.PhoneNo : null,
        CoApplicantEmail: coApplicant ? coApplicant.Email : null,
        CoApplicantGender: coApplicant ? coApplicant.Gender : null,
        CoApplicantDateOfBirth: coApplicant ? coApplicant.DateOfBirth : null,
        CoApplicantOccupation: coApplicant ? coApplicant.Occupation : null,
        CoApplicantCompany: coApplicant ? coApplicant.Company : null,
        CoApplicantAddress: coApplicant ? coApplicant.Address : null,
        CoApplicantDistrict: coApplicant ? coApplicant.District : null,
        CoApplicantState: coApplicant ? coApplicant.State : null,
        CoApplicantPINCode: coApplicant ? coApplicant.PINCode : null,
        CoApplicantIncomeSource: coApplicant ? coApplicant.IncomeSource : null,
        CoApplicantAnnualIncome: coApplicant ? coApplicant.AnnualIncome : null,
        CoApplicantEMIDeduction: coApplicant ? coApplicant.EMIDeduction : null,
        CoApplicantMonthlyIncome: coApplicant
          ? coApplicant.MonthlyIncome
          : null,
        CoApplicantMonthlyNetIncome: coApplicant
          ? coApplicant.MonthlyNetIncome
          : null,
      };
    });

    res.status(200).json(mappedData);
  } catch (error) {
    if (error.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message:
          "Database error occurred while retrieving FinAppApplicant data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    console.error("Error fetching FinAppApplicant:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", details: error.message });
  }
};

// Find a single FinAppApplicant with an id
exports.findOne = async (req, res) => {
  const id = req.params.id;

  try {
    const userID = req.query.UserID;
    console.log("UserID required:", userID);

    // Fetch the FinAppApplicant with the given ID
    const finAppApplicant = await FinAppApplicant.findOne({
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
          model: NewCarBookings,
          as: "FABookingID",
          attributes: [
            "BookingNo",
            "CustomerID",
            "SalesPersonID",
            "ModelName",
            "VariantName",
            "ColourName",
          ],
          include: [
            {
              model: UserMaster,
              as: "NCBSPUserID",
              attributes: ["UserName", "UserID", "EmpID"],
            },
          ],
        },
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
        {
          model: UserMaster,
          as: "FAAUserID",
          attributes: ["UserName", "UserID", "EmpID"],
        },
      ],
      where: {
        UserID: userID,
        LoanAppCustID: id,
      },
    });

    if (!finAppApplicant) {
      return res.status(404).json({ message: "FinAppApplicant not found" });
    }

    // Extract coApplicant details if available
    const coApplicants = finAppApplicant.coApplicants || [];
    const coApplicant = coApplicants.length > 0 ? coApplicants[0] : null;

    // Modify the mappedData to include coApplicant details in the same object
    const mappedData = {
      LoanAppCustID: finAppApplicant.LoanAppCustID,
      FinAppID: finAppApplicant.FinAppID,
      BookingID: finAppApplicant.BookingID,
      Title: finAppApplicant.Title,
      FirstName: finAppApplicant.FirstName,
      LastName: finAppApplicant.LastName,
      PhoneNo: finAppApplicant.PhoneNo,
      Email: finAppApplicant.Email,
      Gender: finAppApplicant.Gender,
      DateOfBirth: finAppApplicant.DateOfBirth,
      Occupation: finAppApplicant.Occupation,
      Company: finAppApplicant.Company,
      Address: finAppApplicant.Address,
      District: finAppApplicant.District,
      State: finAppApplicant.State,
      PinCode: finAppApplicant.PinCode,
      IncomeSource: finAppApplicant.IncomeSource,
      AnnualIncome: finAppApplicant.AnnualIncome,
      MonthlyIncome: finAppApplicant.MonthlyIncome,
      EMIDeduction: finAppApplicant.EMIDeduction,
      MonthlyNetIncome: finAppApplicant.MonthlyNetIncome,
      IsCoApplicant: finAppApplicant.IsCoApplicant,
      Model: finAppApplicant.Model,
      Variant: finAppApplicant.Variant,
      Transmission: finAppApplicant.Transmission,
      FuelType: finAppApplicant.FuelType,
      CreatedDate: finAppApplicant.CreatedDate,
      ModifiedDate: finAppApplicant.ModifiedDate,
      BookingNo: finAppApplicant.FABookingID
        ? finAppApplicant.FABookingID.BookingNo
        : null,
      CustomerID: finAppApplicant.FABookingID
        ? finAppApplicant.FABookingID.CustomerID
        : null,
      SalesPersonID: finAppApplicant.FABookingID
        ? finAppApplicant.FABookingID.SalesPersonID
        : null,
      ModelName: finAppApplicant.FABookingID
        ? finAppApplicant.FABookingID.ModelName
        : null,
      VariantName: finAppApplicant.FABookingID
        ? finAppApplicant.FABookingID.VariantName
        : null,
      ColourName: finAppApplicant.FABookingID
        ? finAppApplicant.FABookingID.ColourName
        : null,
      NCBSPUserName:
        finAppApplicant.FABookingID && finAppApplicant.FABookingID.NCBSPUserID
          ? finAppApplicant.FABookingID.NCBSPUserID.UserName
          : null,
      NCBSPUserID:
        finAppApplicant.FABookingID && finAppApplicant.FABookingID.NCBSPUserID
          ? finAppApplicant.FABookingID.NCBSPUserID.UserID
          : null,
      NCBSPUserEmpID:
        finAppApplicant.FABookingID && finAppApplicant.FABookingID.NCBSPUserID
          ? finAppApplicant.FABookingID.NCBSPUserID.EmpID
          : null,
      FAAUserName: finAppApplicant.FAAUserID
        ? finAppApplicant.FAAUserID.UserName
        : null,
      FAAUserID: finAppApplicant.FAAUserID
        ? finAppApplicant.FAAUserID.UserID
        : null,
      FAAUserEmpID: finAppApplicant.FAAUserID
        ? finAppApplicant.FAAUserID.EmpID
        : null,
      LoanAppCoCustID: coApplicant ? coApplicant.LoanAppCoCustID : null,
      CoApplicantFinAppID: coApplicant ? coApplicant.FinAppID : null,
      CoApplicantLoanAppCustID: coApplicant ? coApplicant.LoanAppCustID : null,
      CoApplicantTitle: coApplicant ? coApplicant.Title : null,
      CoApplicantFirstName: coApplicant ? coApplicant.FirstName : null,
      CoApplicantLastName: coApplicant ? coApplicant.LastName : null,
      CoApplicantPhoneNo: coApplicant ? coApplicant.PhoneNo : null,
      CoApplicantEmail: coApplicant ? coApplicant.Email : null,
      CoApplicantGender: coApplicant ? coApplicant.Gender : null,
      CoApplicantDateOfBirth: coApplicant ? coApplicant.DateOfBirth : null,
      CoApplicantOccupation: coApplicant ? coApplicant.Occupation : null,
      CoApplicantCompany: coApplicant ? coApplicant.Company : null,
      CoApplicantAddress: coApplicant ? coApplicant.Address : null,
      CoApplicantDistrict: coApplicant ? coApplicant.District : null,
      CoApplicantState: coApplicant ? coApplicant.State : null,
      CoApplicantPINCode: coApplicant ? coApplicant.PINCode : null,
      CoApplicantIncomeSource: coApplicant ? coApplicant.IncomeSource : null,
      CoApplicantAnnualIncome: coApplicant ? coApplicant.AnnualIncome : null,
      CoApplicantEMIDeduction: coApplicant ? coApplicant.EMIDeduction : null,
      CoApplicantMonthlyIncome: coApplicant ? coApplicant.MonthlyIncome : null,
      CoApplicantMonthlyNetIncome: coApplicant
        ? coApplicant.MonthlyNetIncome
        : null,
    };

    res.status(200).json(mappedData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message:
          "Database error occurred while retrieving FinAppApplicant data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    console.error("Error fetching FinAppApplicant:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Update a FinAppApplicant by the id in the request

exports.updateByPk = async (req, res) => {
  console.log("Updating applicant with ID:", req.params.id);

  try {
    // Validate request
    // if (!req.body.FinAppID) {
    //   return res.status(400).json({ message: "FinAppID cannot be empty" });
    // }
    // if (!/^[a-zA-Z ]*$/.test(req.body.FirstName)) {
    //   console.log("Validation failed: FirstName contains special characters.");
    //   return res.status(400).json({
    //     message: "FirstName should contain only letters",
    //   });
    // }
    // if (!/^[a-zA-Z ]*$/.test(req.body.LastName)) {
    //   console.log("Validation failed: LastName contains special characters.");
    //   return res.status(400).json({
    //     message: "LastName should contain only letters",
    //   });
    // }

    // Find the applicant by ID
    const applicantId = req.params.id;

    // Validate the ID parameter
    if (!applicantId) {
      return res.status(400).json({ message: "ID parameter is required." });
    }

    let finAppApplicant = await FinAppApplicant.findByPk(applicantId);

    if (!finAppApplicant) {
      return res.status(404).json({ message: "FinAppApplicant not found" });
    }

    // Update fields
    finAppApplicant.LoanAppCustID =
      req.body.LoanAppCustID || finAppApplicant.LoanAppCustID;
    finAppApplicant.FinAppID = req.body.FinAppID || finAppApplicant.FinAppID;
    finAppApplicant.BookingID = req.body.BookingID || finAppApplicant.BookingID;
    finAppApplicant.CustomerID =
      req.body.CustomerID || finAppApplicant.CustomerID;
    finAppApplicant.UserID = req.body.UserID || finAppApplicant.UserID;
    finAppApplicant.Title = req.body.Title || finAppApplicant.Title;
    finAppApplicant.FirstName = req.body.FirstName || finAppApplicant.FirstName;
    finAppApplicant.LastName = req.body.LastName || finAppApplicant.LastName;
    finAppApplicant.PhoneNo = req.body.PhoneNo || finAppApplicant.PhoneNo;
    finAppApplicant.Email = req.body.Email || finAppApplicant.Email;
    finAppApplicant.Gender = req.body.Gender || finAppApplicant.Gender;
    finAppApplicant.DateOfBirth =
      req.body.DateOfBirth || finAppApplicant.DateOfBirth;
    finAppApplicant.Occupation =
      req.body.Occupation || finAppApplicant.Occupation;
    finAppApplicant.Company = req.body.Company || finAppApplicant.Company;
    finAppApplicant.Address = req.body.Address || finAppApplicant.Address;
    finAppApplicant.District = req.body.District || finAppApplicant.District;
    finAppApplicant.State = req.body.State || finAppApplicant.State;
    finAppApplicant.PinCode = req.body.PinCode || finAppApplicant.PinCode;
    finAppApplicant.IncomeSource =
      req.body.IncomeSource || finAppApplicant.IncomeSource;
    finAppApplicant.AnnualIncome =
      req.body.AnnualIncome || finAppApplicant.AnnualIncome;
    finAppApplicant.MonthlyIncome =
      req.body.MonthlyIncome || finAppApplicant.MonthlyIncome;
    finAppApplicant.EMIDeduction =
      req.body.EMIDeduction || finAppApplicant.EMIDeduction;
    finAppApplicant.MonthlyNetIncome =
      req.body.MonthlyNetIncome || finAppApplicant.MonthlyNetIncome;
    finAppApplicant.IsCoApplicant =
      req.body.IsCoApplicant || finAppApplicant.IsCoApplicant;
    finAppApplicant.Model = req.body.Model || finAppApplicant.Model;
    finAppApplicant.Variant = req.body.Variant || finAppApplicant.Variant;
    finAppApplicant.Transmission =
      req.body.Transmission || finAppApplicant.Transmission;
    finAppApplicant.FuelType = req.body.FuelType || finAppApplicant.FuelType;
    finAppApplicant.Colour = req.body.Colour || finAppApplicant.Colour;
    finAppApplicant.RefferedEmp =
      req.body.RefferedEmp || finAppApplicant.RefferedEmp;
    finAppApplicant.ModifiedDate = new Date();

    // Save updated FinAppApplicant in the database
    const updatedFinAppApplicant = await finAppApplicant.save();

    return res.status(200).json(updatedFinAppApplicant); // Send the updated FinAppApplicant as response
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
        message: "Database error occurred while updating FinAppApplicant.",
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
    console.error("Error updating FinAppApplicant:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a FinAppApplicant with the specified id in the request
exports.deleteById = async (req, res) => {
  const id = req.params.id;

  try {
    // Find the model by ID
    const finAppApplicant = await FinAppApplicant.findByPk(id);

    // Check if the model exists
    if (!finAppApplicant) {
      return res
        .status(404)
        .json({ message: "FinAppApplicant not found with id: " + id });
    }

    // Delete the model
    await finAppApplicant.destroy();

    // Send a success message
    res.status(200).json({
      message: "FinAppApplicant with id: " + id + " deleted successfully",
    });
  } catch (err) {
    // Handle errors based on specific types
    if (err.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while deleting FinAppApplicant.",
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
    console.error("Error deleting FinAppApplicant:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Single API for Creating both Applicant and Co Applicant
exports.createApplicant = async (req, res) => {
  const transaction = await Seq.transaction();

  try {
    // Extract applicant and co-applicant data from req.body
    const { Applicant, CoApplicant } = req.body;

    // Validate that Applicant exists
    if (!Applicant) {
      return res.status(400).json({ message: "Applicant data is required." });
    }

    // Map fields from Applicant
    const finAppApplicantData = {
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
    const newFinAppApplicant = await FinAppApplicant.create(
      finAppApplicantData,
      { transaction }
    );

    let newFinAppCoApplicant = null;

    if (Applicant.IsCoApplicant === true && CoApplicant) {
      // Map fields from CoApplicant
      const finAppCoApplicantData = {
        FinAppID: CoApplicant.FinAppID || null,
        LoanAppCustID: newFinAppApplicant.LoanAppCustID,
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

    // Commit transaction
    await transaction.commit();

    // Send both applicants in the response
    return res.status(201).json({
      Applicant: newFinAppApplicant,
      CoApplicant: newFinAppCoApplicant,
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

// Single API for Creating both Applicant and Co Applicant
exports.createApplicantWeb = async (req, res) => {
  const transaction = await Seq.transaction();
  console.log("!!!!!!");
  try {
    // Extract applicant and co-applicant data from req.body
    const { Applicant, CoApplicant, Application } = req.body;

    // Validate that Applicant exists
    if (!Applicant) {
      return res.status(400).json({ message: "Applicant data is required." });
    }
    const bookingID = Applicant.BookingID;
    const existingBooking = await NewCarBookings.findOne({
      where: { BookingID: bookingID },
      transaction, // Include the transaction
    });
    // Map fields from Applicant
    const finAppApplicantData = {
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
    const newFinAppApplicant = await FinAppApplicant.create(
      finAppApplicantData,
      { transaction }
    );

    let newFinAppCoApplicant = null;

    if (Applicant.IsCoApplicant === true && CoApplicant) {
      // Map fields from CoApplicant
      const finAppCoApplicantData = {
        FinAppID: CoApplicant.FinAppID || null,
        LoanAppCustID: newFinAppApplicant.LoanAppCustID,
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

    const appNo = await genFinApplicationNumber();
    console.log("Generated App No : ", appNo);

    // Use Application from req.body instead of req.body
    const financeApplication = {
      CustomerID: newFinAppApplicant.CustomerID || null,
      IsCoApplicant: Applicant.IsCoApplicant || null,
      ApplicationNumber: appNo || Application.ApplicationNumber,
      LoanAppCustID: newFinAppApplicant.LoanAppCustID,
      BookingID: newFinAppApplicant.BookingID || null,
      UserID: Application.UserID || null,
      SalesPersonID: existingBooking?.SalesPersonID || null, // new field
      QuotationNo: Application.QuotationNo || null,
      QuotationDate: Application.QuotationDate || null,
      QuotationAmt: Application.QuotationAmt || null,
      ApplicantIncome: Application.ApplicantIncome || null,
      FinancierID: Application.FinancierID || null,
      FinancierName: Application.FinancierName || null,
      Branch: Application.Branch || null,
      ExShowRoom: Application.ExShowRoom || null,
      LifeTax: Application.LifeTax || null,
      Accessories: Application.Accessories || null,
      Insurance: Application.Insurance || null,
      OtherAmt: Application.OtherAmt || null,
      OnRoadPrice: Application.OnRoadPrice || null,
      RateOfInterest: Application.RateOfInterest || null,
      Tenure: Application.Tenure || null,
      LoanAmt: Application.LoanAmt || null,
      Status: Application.Status || "Active",
      Remarks: Application.Remarks || null,
    };
    console.log("request body data: ", financeApplication);

    const newFinanceApplication = await FinanceApplication.create(
      financeApplication,
      { transaction }
    );

    newFinAppApplicant.FinAppID = newFinanceApplication.FinAppID;
    await newFinAppApplicant.save({ transaction });

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

    return res.status(201).json({
      Applicant: newFinAppApplicant,
      CoApplicant: newFinAppCoApplicant,
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

exports.updateApplicantWeb = async (req, res) => {
  const transaction = await Seq.transaction();

  try {
    // Extract applicant and co-applicant data from req.body
    const { Applicant, CoApplicant, Application } = req.body;

    // Validate that Applicant ID exists
    if (!Applicant) {
      return res
        .status(400)
        .json({ message: "Applicant is required for update." });
    }
    if (!Applicant.LoanAppCustID) {
      return res
        .status(400)
        .json({ message: "Applicant ID is required for update." });
    }

    // Fetch existing applicant data
    const existingApplicant = await FinAppApplicant.findByPk(
      Applicant.LoanAppCustID,
      { transaction }
    );
    if (!existingApplicant) {
      return res.status(404).json({ message: "Applicant not found." });
    }

    // Map fields from Applicant
    const finAppApplicantData = {
      BookingID: Applicant.BookingID || existingApplicant.BookingID,
      CustomerID: Applicant.CustomerID || existingApplicant.CustomerID,
      UserID: Applicant.UserID || existingApplicant.UserID,
      Title: Applicant.Title || existingApplicant.Title,
      FirstName: Applicant.FirstName || existingApplicant.FirstName,
      LastName: Applicant.LastName || existingApplicant.LastName,
      PhoneNo: Applicant.PhoneNo || existingApplicant.PhoneNo,
      Email: Applicant.Email || existingApplicant.Email,
      Gender: Applicant.Gender || existingApplicant.Gender,
      DateOfBirth: Applicant.DateOfBirth || existingApplicant.DateOfBirth,
      Occupation: Applicant.Occupation || existingApplicant.Occupation,
      Company: Applicant.Company || existingApplicant.Company,
      Address: Applicant.Address || existingApplicant.Address,
      District: Applicant.District || existingApplicant.District,
      State: Applicant.State || existingApplicant.State,
      PinCode: Applicant.PinCode || existingApplicant.PinCode,
      IncomeSource: Applicant.IncomeSource || existingApplicant.IncomeSource,
      AnnualIncome: Applicant.AnnualIncome || existingApplicant.AnnualIncome,
      MonthlyIncome: Applicant.MonthlyIncome || existingApplicant.MonthlyIncome,
      EMIDeduction: Applicant.EMIDeduction || existingApplicant.EMIDeduction,
      MonthlyNetIncome:
        Applicant.MonthlyNetIncome || existingApplicant.MonthlyNetIncome,
      IsCoApplicant: Applicant.IsCoApplicant,
      RefferedEmp: Applicant.RefferedEmp || existingApplicant.RefferedEmp,
      Model: Applicant.Model || existingApplicant.Model,
      Variant: Applicant.Variant || existingApplicant.Variant,
      Transmission: Applicant.Transmission || existingApplicant.Transmission,
      FuelType: Applicant.FuelType || existingApplicant.FuelType,
      Colour: Applicant.Colour || existingApplicant.Colour,
      ModifiedDate: new Date(),
    };

    console.log("Updating applicant:", finAppApplicantData);

    // Update FinAppApplicant in the database
    await existingApplicant.update(finAppApplicantData, { transaction });

    let existingCoApplicant = null;
    if (Applicant.IsCoApplicant === true && CoApplicant) {
      // Fetch existing co-applicant if it exists
      existingCoApplicant = await FinAppCoApplicant.findOne({
        where: { LoanAppCustID: existingApplicant.LoanAppCustID },
        transaction,
      });

      if (!existingCoApplicant) {
        // Create new co-applicant if not found
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
          CreatedDate: new Date(),
        };

        console.log("Creating new co-applicant:", finAppCoApplicantData);
        existingCoApplicant = await FinAppCoApplicant.create(
          finAppCoApplicantData,
          { transaction }
        );
      } else {
        // Update existing co-applicant
        const finAppCoApplicantData = {
          Title: CoApplicant.Title || existingCoApplicant.Title,
          FirstName: CoApplicant.FirstName || existingCoApplicant.FirstName,
          LastName: CoApplicant.LastName || existingCoApplicant.LastName,
          PhoneNo: CoApplicant.PhoneNo || existingCoApplicant.PhoneNo,
          Email: CoApplicant.Email || existingCoApplicant.Email,
          Gender: CoApplicant.Gender || existingCoApplicant.Gender,
          DateOfBirth:
            CoApplicant.DateOfBirth || existingCoApplicant.DateOfBirth,
          Occupation: CoApplicant.Occupation || existingCoApplicant.Occupation,
          Company: CoApplicant.Company || existingCoApplicant.Company,
          Address: CoApplicant.Address || existingCoApplicant.Address,
          District: CoApplicant.District || existingCoApplicant.District,
          State: CoApplicant.State || existingCoApplicant.State,
          PINCode: CoApplicant.PINCode || existingCoApplicant.PINCode,
          IncomeSource:
            CoApplicant.IncomeSource || existingCoApplicant.IncomeSource,
          AnnualIncome:
            CoApplicant.AnnualIncome || existingCoApplicant.AnnualIncome,
          EMIDeduction:
            CoApplicant.EMIDeduction || existingCoApplicant.EMIDeduction,
          MonthlyIncome:
            CoApplicant.MonthlyIncome || existingCoApplicant.MonthlyIncome,
          MonthlyNetIncome:
            CoApplicant.MonthlyNetIncome ||
            existingCoApplicant.MonthlyNetIncome,
          ModifiedDate: new Date(),
        };

        console.log("Updating co-applicant:", finAppCoApplicantData);
        await existingCoApplicant.update(finAppCoApplicantData, {
          transaction,
        });
      }
    }

    // Update Application data
    if (Application) {
      const existingApplication = await FinanceApplication.findOne({
        where: { LoanAppCustID: existingApplicant.LoanAppCustID },
        transaction,
      });
      if (existingApplication) {
        const financeApplication = {
          QuotationNo:
            Application.QuotationNo || existingApplication.QuotationNo,
          QuotationDate:
            Application.QuotationDate || existingApplication.QuotationDate,
          QuotationAmt:
            Application.QuotationAmt || existingApplication.QuotationAmt,
          ApplicantIncome:
            Application.ApplicantIncome || existingApplication.ApplicantIncome,
          FinancierID:
            Application.FinancierID || existingApplication.FinancierID,
          FinancierName:
            Application.FinancierName || existingApplication.FinancierName,
          Branch: Application.Branch || existingApplication.Branch,
          ExShowRoom: Application.ExShowRoom || existingApplication.ExShowRoom,
          LifeTax: Application.LifeTax || existingApplication.LifeTax,
          Accessories:
            Application.Accessories || existingApplication.Accessories,
          Insurance: Application.Insurance || existingApplication.Insurance,
          OtherAmt: Application.OtherAmt || existingApplication.OtherAmt,
          OnRoadPrice:
            Application.OnRoadPrice || existingApplication.OnRoadPrice,
          RateOfInterest:
            Application.RateOfInterest || existingApplication.RateOfInterest,
          Tenure: Application.Tenure || existingApplication.Tenure,
          LoanAmt: Application.LoanAmt || existingApplication.LoanAmt,
          Status: Application.Status || existingApplication.Status,
          Remarks: Application.Remarks || existingApplication.Remarks,
          ModifiedDate: new Date(),
        };

        console.log("Updating finance application:", financeApplication);
        await existingApplication.update(financeApplication, { transaction });
      }
    }

    await transaction.commit();

    return res.status(200).json({
      Applicant: existingApplicant,
      CoApplicant: existingCoApplicant,
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
        message: "Database error occurred while updating FinAppApplicant.",
        details: err.message,
      });
    }
    if (err.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: err.message,
      });
    }
    console.error("Error updating FinAppApplicant:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
