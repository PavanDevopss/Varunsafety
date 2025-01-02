/* eslint-disable no-dupe-keys */
/* eslint-disable no-unused-vars */
const db = require("../models");
const FormsMaster = db.formsmaster;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;
const ModuleMaster = db.modulemaster;

// Basic CRUD API
// Create and Save a new FormsMaster
exports.create = async (req, res) => {
  console.log("FormName:", req.body.FormName);

  try {
    // Validate request
    if (!req.body.FormName) {
      return res.status(400).json({ message: "FormName cannot be empty" });
    }
    if (!/^[a-zA-Z ]*$/.test(req.body.FormName)) {
      console.log("Validation failed: FormName contains special characters.");
      return res.status(400).json({
        message: "FormName should contain only letters",
      });
    }
    // Check if FormName already exists
    const existingModel = await FormsMaster.findOne({
      where: { FormName: req.body.FormName },
    });
    if (existingModel) {
      return res.status(400).json({ message: "FormName already exists" });
    }

    // Create a FormsMaster
    const formMaster = {
      ModuleID: req.body.ModuleID,
      FormCode: req.body.FormCode,
      FormName: req.body.FormName,
      FormInterface: req.body.FormInterface,
      FormType: req.body.FormType,
      URLPath: req.body.URLPath,
      Sequence: req.body.Sequence,
      MenuListing: req.body.MenuListing,
      IconURL: req.body.IconURL,
      IsActive: req.body.IsActive || true,
      Status: req.body.Status || "Active",
    };

    // Save FormsMaster in the database
    const newFormsMaster = await FormsMaster.create(formMaster);

    return res.status(201).json(newFormsMaster); // Send the newly created FormsMaster as response
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

    console.error("Error creating FormsMaster:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Retrieve all FormsMasters from the database.
exports.findAll = async (req, res) => {
  try {
    // Fetch all form data with included module data
    const formsData = await FormsMaster.findAll({
      attributes: [
        "FormID",
        "ModuleID",
        "FormCode",
        "FormName",
        "FormInterface",
        "FormType",
        "URLPath",
        "Sequence",
        "MenuListing",
        "IconURL",
        "IsActive",
        "Status",
      ],
      include: [
        {
          model: ModuleMaster,
          as: "FMModuleID",
          attributes: ["ModuleID", "ModuleName", "ModuleCode"],
        },
      ],
      order: [
        ["FormName", "ASC"], // Order by ModelDescription in ascending order
      ],
    });

    // Check if data is empty
    if (!formsData || formsData.length === 0) {
      return res.status(404).json({
        message: "No forms data found.",
      });
    }

    // Map the data for response
    const combinedData = formsData.map((item) => ({
      FormID: item.FormID,
      ModuleID: item.ModuleID,
      ModuleName: item.FMModuleID ? item.FMModuleID.ModuleName : null,
      ModuleCode: item.FMModuleID ? item.FMModuleID.ModuleCode : null,
      FormCode: item.FormCode,
      FormName: item.FormName,
      FormInterface: item.FormInterface,
      FormType: item.FormType,
      URLPath: item.URLPath,
      Sequence: item.Sequence,
      MenuListing: item.MenuListing,
      IconURL: item.IconURL,
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
        message: "Database error occurred while retrieving forms data.",
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
    console.error("Error retrieving forms data:", error);
    return res.status(500).json({
      message: "Failed to retrieve forms data. Please try again later.",
    });
  }
};

// Find a single FormsMaster with an id
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;

    // Validate the ID parameter
    if (!id) {
      return res.status(400).json({
        message: "ID parameter is required.",
      });
    }

    // Fetch the form data by primary key with included module data
    const formData = await FormsMaster.findOne({
      where: {
        FormID: id,
      },
      attributes: [
        "FormID",
        "ModuleID",
        "FormCode",
        "FormName",
        "FormInterface",
        "FormType",
        "URLPath",
        "Sequence",
        "MenuListing",
        "IconURL",
        "IsActive",
        "Status",
      ],
      include: [
        {
          model: ModuleMaster,
          as: "FMModuleID",
          attributes: ["ModuleID", "ModuleName", "ModuleCode"],
        },
      ],
    });

    // Check if data is found
    if (!formData) {
      return res.status(404).json({
        message: "Form data not found.",
      });
    }

    // Prepare the response data
    const responseData = {
      FormID: formData.FormID,
      ModuleID: formData.ModuleID,
      ModuleName: formData.FMModuleID ? formData.FMModuleID.ModuleName : null,
      ModuleCode: formData.FMModuleID ? formData.FMModuleID.ModuleCode : null,
      FormCode: formData.FormCode,
      FormName: formData.FormName,
      FormInterface: formData.FormInterface,
      FormType: formData.FormType,
      URLPath: formData.URLPath,
      Sequence: formData.Sequence,
      MenuListing: formData.MenuListing,
      IconURL: formData.IconURL,
      IsActive: formData.IsActive,
      Status: formData.Status,
    };

    // Send the response data
    res.json(responseData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while retrieving form data.",
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
    console.error("Error retrieving form data:", error);
    return res.status(500).json({
      message: "Failed to retrieve form data. Please try again later.",
    });
  }
};

// Update a FormsMaster by the id in the request
exports.updateByPk = async (req, res) => {
  console.log("FormName:", req.body.FormName);

  try {
    // Validate request
    if (!req.body.FormName) {
      return res.status(400).json({ message: "FormName cannot be empty" });
    }
    if (!/^[a-zA-Z ]*$/.test(req.body.FormName)) {
      console.log("Validation failed: FormName contains special characters.");
      return res.status(400).json({
        message: "FormName should contain only letters",
      });
    }
    // Find the form by ID
    const formId = req.params.id;

    // Validate the ID parameter
    if (!formId) {
      return res.status(400).json({ message: "ID parameter is required." });
    }

    let formsMaster = await FormsMaster.findByPk(formId);

    if (!formsMaster) {
      return res.status(404).json({ message: "FormsMaster not found" });
    }

    // Update fields
    formsMaster.FormName = req.body.FormName;
    formsMaster.FormCode = req.body.FormCode || formsMaster.FormCode;
    formsMaster.FormInterface =
      req.body.FormInterface || formsMaster.FormInterface;
    formsMaster.FormType = req.body.FormType || formsMaster.FormType;
    formsMaster.URLPath = req.body.URLPath || formsMaster.URLPath;
    formsMaster.Sequence = req.body.Sequence || formsMaster.Sequence;
    formsMaster.MenuListing = req.body.MenuListing || formsMaster.MenuListing;
    formsMaster.IconURL = req.body.IconURL || formsMaster.IconURL;
    formsMaster.IsActive = req.body.IsActive || formsMaster.IsActive;
    formsMaster.Status = req.body.Status || formsMaster.Status;
    formsMaster.ModuleID = req.body.ModuleID || formsMaster.ModuleID;
    formsMaster.ModifiedDate = new Date();

    // Save updated FormsMaster in the database
    const updatedFormsMaster = await formsMaster.save();

    return res.status(200).json(updatedFormsMaster); // Send the updated FormsMaster as response
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
        message: "Database error occurred while updating FormsMaster.",
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
    console.error("Error updating FormsMaster:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a FormsMaster with the specified id in the request
exports.deleteById = async (req, res) => {
  const id = req.params.id;

  try {
    // Validate the ID parameter
    if (!id) {
      return res.status(400).json({ message: "ID parameter is required." });
    }

    // Find the form by ID
    const formsMaster = await FormsMaster.findByPk(id);

    // Check if the form exists
    if (!formsMaster) {
      return res
        .status(404)
        .json({ message: "FormsMaster not found with id: " + id });
    }

    // Delete the form
    await formsMaster.destroy();

    // Send a success message
    res.status(200).json({
      message: "FormsMaster with id: " + id + " deleted successfully",
    });
  } catch (err) {
    // Handle errors based on specific types
    if (err.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while deleting FormsMaster.",
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
    console.error("Error deleting FormsMaster:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
