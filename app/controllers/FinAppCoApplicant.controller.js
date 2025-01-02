/* eslint-disable no-unused-vars */
const db = require("../models");
const FinAppCoApplicant = db.finappcoapplicant;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;
const FinAppApplicant = db.finappapplicant;

// Basic CRUD API

// Create and Save a new FinAppCoApplicant
exports.create = async (req, res) => {
  console.log("creating new co applicant: ", req.body);
  try {
    // Create a FinAppApplicant
    const finAppCoApplicantData = {
      FinAppID: req.body.FinAppID || null,
      LoanAppCustID: req.body.LoanAppCustID,
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
      PINCode: req.body.PINCode || null,
      IncomeSource: req.body.IncomeSource || null,
      AnnualIncome: req.body.AnnualIncome || null,
      EMIDeduction: req.body.EMIDeduction || null,
      MonthlyIncome: req.body.MonthlyIncome || null,
      MonthlyNetIncome: req.body.MonthlyNetIncome || null,
    };
    console.log("before created new co applicant: ", finAppCoApplicantData);

    // Save FinAppApplicant in the database
    const newFinAppCoApplicant = await FinAppCoApplicant.create(
      finAppCoApplicantData
    );
    console.log("created new co applicant: ", newFinAppCoApplicant);

    return res.status(201).json(newFinAppCoApplicant); // Send the newly created FinAppApplicant as response
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

    if (err.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while creating FinAppCoApplicant.",
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
    console.error("Error creating FinAppApplicant:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Retrieve all FinAppCoApplicant from the database.
exports.findAll = async (req, res) => {
  try {
    // Fetch FinAppCoApplicants
    const finAppCoApplicant = await FinAppCoApplicant.findAll({
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
        "CreatedDate",
        "ModifiedDate",
      ],
      include: [
        {
          model: FinAppApplicant,
          as: "FCALoanAppCustID",
          attributes: [
            "LoanAppCustID",
            "FinAppID",
            "BookingID",
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
            "EMIDeduction",
            "MonthlyIncome",
            "MonthlyNetIncome",
          ],
        },
      ],
      order: [
        ["LoanAppCustID", "ASC"], // Order by LoanAppCustID in ascending order
      ],
    });

    if (finAppCoApplicant.length === 0) {
      return res.status(404).json({ message: "No FinAppCoApplicants found" });
    }

    // Map the data for response
    const mappedData = finAppCoApplicant.map((item) => ({
      LoanAppCoCustID: item.LoanAppCoCustID,
      FinAppID: item.FinAppID,
      LoanAppCustID: item.LoanAppCustID,
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
      PINCode: item.PINCode,
      IncomeSource: item.IncomeSource,
      AnnualIncome: item.AnnualIncome,
      EMIDeduction: item.EMIDeduction,
      MonthlyIncome: item.MonthlyIncome,
      MonthlyNetIncome: item.MonthlyNetIncome,
      CreatedDate: item.CreatedDate,
      ModifiedDate: item.ModifiedDate,
      FCALoanAppCustID: item.FCALoanAppCustID
        ? {
            LoanAppCustID: item.FCALoanAppCustID.LoanAppCustID,
            FinAppID: item.FCALoanAppCustID.FinAppID,
            BookingID: item.FCALoanAppCustID.BookingID,
            Title: item.FCALoanAppCustID.Title,
            FirstName: item.FCALoanAppCustID.FirstName,
            LastName: item.FCALoanAppCustID.LastName,
            PhoneNo: item.FCALoanAppCustID.PhoneNo,
            Email: item.FCALoanAppCustID.Email,
            Gender: item.FCALoanAppCustID.Gender,
            DateOfBirth: item.FCALoanAppCustID.DateOfBirth,
            Occupation: item.FCALoanAppCustID.Occupation,
            Company: item.FCALoanAppCustID.Company,
            Address: item.FCALoanAppCustID.Address,
            District: item.FCALoanAppCustID.District,
            State: item.FCALoanAppCustID.State,
            PinCode: item.FCALoanAppCustID.PinCode,
            IncomeSource: item.FCALoanAppCustID.IncomeSource,
            AnnualIncome: item.FCALoanAppCustID.AnnualIncome,
            EMIDeduction: item.FCALoanAppCustID.EMIDeduction,
            MonthlyIncome: item.FCALoanAppCustID.MonthlyIncome,
            MonthlyNetIncome: item.FCALoanAppCustID.MonthlyNetIncome,
          }
        : null,
    }));

    res.status(200).json(mappedData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message:
          "Database error occurred while retrieving FinAppCoApplicant data.",
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

    console.error("Error fetching FinAppCoApplicant:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Find a single FinAppCoApplicant with an id
exports.findOne = async (req, res) => {
  const id = req.params.id;

  try {
    // Fetch the FinAppCoApplicant with the given ID
    const finAppCoApplicant = await FinAppCoApplicant.findByPk(id, {
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
        "CreatedDate",
        "ModifiedDate",
      ],
      include: [
        {
          model: FinAppApplicant,
          as: "FCALoanAppCustID",
          attributes: [
            "LoanAppCustID",
            "FinAppID",
            "BookingID",
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
            "EMIDeduction",
            "MonthlyIncome",
            "MonthlyNetIncome",
          ],
        },
      ],
      order: [
        ["LoanAppCustID", "ASC"], // Order by LoanAppCustID in ascending order
      ],
    });

    if (!finAppCoApplicant) {
      return res
        .status(404)
        .json({ message: "FinAppCoApplicant not found with id: " + id });
    }

    // Map the data for response
    const mappedData = {
      LoanAppCoCustID: finAppCoApplicant.LoanAppCoCustID,
      FinAppID: finAppCoApplicant.FinAppID,
      LoanAppCustID: finAppCoApplicant.LoanAppCustID,
      Title: finAppCoApplicant.Title,
      FirstName: finAppCoApplicant.FirstName,
      LastName: finAppCoApplicant.LastName,
      PhoneNo: finAppCoApplicant.PhoneNo,
      Email: finAppCoApplicant.Email,
      Gender: finAppCoApplicant.Gender,
      DateOfBirth: finAppCoApplicant.DateOfBirth,
      Occupation: finAppCoApplicant.Occupation,
      Company: finAppCoApplicant.Company,
      Address: finAppCoApplicant.Address,
      District: finAppCoApplicant.District,
      State: finAppCoApplicant.State,
      PINCode: finAppCoApplicant.PINCode,
      IncomeSource: finAppCoApplicant.IncomeSource,
      AnnualIncome: finAppCoApplicant.AnnualIncome,
      EMIDeduction: finAppCoApplicant.EMIDeduction,
      MonthlyIncome: finAppCoApplicant.MonthlyIncome,
      MonthlyNetIncome: finAppCoApplicant.MonthlyNetIncome,
      CreatedDate: finAppCoApplicant.CreatedDate,
      ModifiedDate: finAppCoApplicant.ModifiedDate,
      FCALoanAppCustID: finAppCoApplicant.FCALoanAppCustID
        ? {
            LoanAppCustID: finAppCoApplicant.FCALoanAppCustID.LoanAppCustID,
            FinAppID: finAppCoApplicant.FCALoanAppCustID.FinAppID,
            BookingID: finAppCoApplicant.FCALoanAppCustID.BookingID,
            Title: finAppCoApplicant.FCALoanAppCustID.Title,
            FirstName: finAppCoApplicant.FCALoanAppCustID.FirstName,
            LastName: finAppCoApplicant.FCALoanAppCustID.LastName,
            PhoneNo: finAppCoApplicant.FCALoanAppCustID.PhoneNo,
            Email: finAppCoApplicant.FCALoanAppCustID.Email,
            Gender: finAppCoApplicant.FCALoanAppCustID.Gender,
            DateOfBirth: finAppCoApplicant.FCALoanAppCustID.DateOfBirth,
            Occupation: finAppCoApplicant.FCALoanAppCustID.Occupation,
            Company: finAppCoApplicant.FCALoanAppCustID.Company,
            Address: finAppCoApplicant.FCALoanAppCustID.Address,
            District: finAppCoApplicant.FCALoanAppCustID.District,
            State: finAppCoApplicant.FCALoanAppCustID.State,
            PinCode: finAppCoApplicant.FCALoanAppCustID.PinCode,
            IncomeSource: finAppCoApplicant.FCALoanAppCustID.IncomeSource,
            AnnualIncome: finAppCoApplicant.FCALoanAppCustID.AnnualIncome,
            EMIDeduction: finAppCoApplicant.FCALoanAppCustID.EMIDeduction,
            MonthlyIncome: finAppCoApplicant.FCALoanAppCustID.MonthlyIncome,
            MonthlyNetIncome:
              finAppCoApplicant.FCALoanAppCustID.MonthlyNetIncome,
          }
        : null,
    };

    res.status(200).json(mappedData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message:
          "Database error occurred while retrieving FinAppCoApplicant data.",
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

    console.error("Error fetching FinAppCoApplicant:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Update a FinAppCoApplicant by the id in the request
exports.updateByPk = async (req, res) => {
  console.log("Financier ID:", req.body.FinancierID);

  try {
    // Validate request
    if (!req.params.id) {
      return res.status(400).json({ message: "Financier ID is required" });
    }

    // Find the model by ID
    const ID = req.params.id;
    let finAppCoApplicant = await FinAppCoApplicant.findByPk(ID);
    console.log("finAppCoApplicant data: ", finAppCoApplicant);

    if (!finAppCoApplicant) {
      return res.status(404).json({ message: "FinAppCoApplicant not found" });
    }

    // Update fields
    finAppCoApplicant.LoanAppCoCustID =
      req.body.LoanAppCoCustID || finAppCoApplicant.LoanAppCoCustID;
    finAppCoApplicant.FinAppID =
      req.body.FinAppID || finAppCoApplicant.FinAppID;
    finAppCoApplicant.LoanAppCustID =
      req.body.LoanAppCustID || finAppCoApplicant.LoanAppCustID;
    finAppCoApplicant.Title = req.body.Title || finAppCoApplicant.Title;
    finAppCoApplicant.FirstName =
      req.body.FirstName || finAppCoApplicant.FirstName;
    finAppCoApplicant.LastName =
      req.body.LastName || finAppCoApplicant.LastName;
    finAppCoApplicant.PhoneNo =
      req.body.PhoneNo || finAppCoApplicant.PhoneNo || null;
    finAppCoApplicant.Email = req.body.Email || finAppCoApplicant.Email || null;
    finAppCoApplicant.Gender = req.body.Gender || finAppCoApplicant.Gender;
    finAppCoApplicant.DateOfBirth =
      req.body.DateOfBirth || finAppCoApplicant.DateOfBirth;
    finAppCoApplicant.Occupation =
      req.body.Occupation || finAppCoApplicant.Occupation;
    finAppCoApplicant.Company = req.body.Company || finAppCoApplicant.Company;
    finAppCoApplicant.Address =
      req.body.Address || finAppCoApplicant.Address || null;
    finAppCoApplicant.District =
      req.body.District || finAppCoApplicant.District || null;
    finAppCoApplicant.State = req.body.State || finAppCoApplicant.State || null;
    finAppCoApplicant.PINCode =
      req.body.PINCode || finAppCoApplicant.PINCode || null;
    finAppCoApplicant.IncomeSource =
      req.body.IncomeSource || finAppCoApplicant.IncomeSource || null;
    finAppCoApplicant.AnnualIncome =
      req.body.AnnualIncome || finAppCoApplicant.AnnualIncome || null;
    finAppCoApplicant.MonthlyIncome =
      req.body.MonthlyIncome || finAppCoApplicant.MonthlyIncome || null;
    finAppCoApplicant.EMIDeduction =
      req.body.EMIDeduction || finAppCoApplicant.EMIDeduction || null;
    finAppCoApplicant.MonthlyNetIncome =
      req.body.MonthlyNetIncome || finAppCoApplicant.MonthlyNetIncome || null;

    // Set the modified date
    finAppCoApplicant.ModifiedDate = new Date();

    console.log("model:", finAppCoApplicant);

    // Save updated FinAppCoApplicant in the database
    const updatedFinAppCoApplicant = await finAppCoApplicant.save();

    return res.status(200).json(updatedFinAppCoApplicant); // Send the updated FinAppCoApplicant as response
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
        message: "Database error occurred while updating FinAppCoApplicant.",
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
    console.error("Error updating FinAppCoApplicant:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a FinAppCoApplicant with the specified id in the request
exports.deleteById = async (req, res) => {
  const id = req.params.id;

  try {
    // Find the model by ID
    const finAppCoApplicant = await FinAppCoApplicant.findByPk(id);

    // Check if the model exists
    if (!finAppCoApplicant) {
      return res
        .status(404)
        .json({ message: "FinAppCoApplicant not found with id: " + id });
    }

    // Delete the model
    await finAppCoApplicant.destroy();

    // Send a success message
    res.status(200).json({
      message: "FinAppCoApplicant with id: " + id + " deleted successfully",
    });
  } catch (err) {
    // Handle errors based on specific types
    if (err.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while deleting FinAppCoApplicant.",
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
    console.error("Error deleting FinAppCoApplicant:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
