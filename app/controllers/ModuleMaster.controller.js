/* eslint-disable no-dupe-keys */
/* eslint-disable no-unused-vars */
const db = require("../models");
const ModuleMaster = db.modulemaster;
const Op = db.Sequelize.Op;
const fs = require("fs");
const path = require("path");
const sequelize = db.Sequelize;
const Seq = db.sequelize;
const FormMaster = db.formsmaster;
const { validationResult } = require("express-validator");
const { configureMulter } = require("../Utils/multerService");
const { transferImageToServer } = require("../Utils/sshService");
const { generateModuleCode } = require("../Utils/generateService");
const { generateFormCode } = require("../Utils/generateService");
const { genIconNameinForms } = require("../Utils/generateService");

// Configure Multer
const upload = configureMulter(
  // "C:/Users/varun/OneDrive/Desktop/uploads/", // Adjust the upload path as needed
  "/home/administrator/VARUNGROUP/IMAGES_VMS_MARUTI",
  // "C:\\Users\\itvsp\\Desktop\\Uploads",
  1000000, // File size limit (1MB)
  ["jpeg", "jpg", "png", "gif"], // Allowed file types
  "IconURL"
);
// Basic CRUD API
// Create and Save a new DivisionMaster
exports.create = async (req, res) => {
  console.log("ModuleName:", req.body.ModuleName);

  try {
    // Validate request
    if (!req.body.ModuleName) {
      return res.status(400).json({ message: "ModuleName cannot be empty" });
    }
    if (!/^[a-zA-Z ]*$/.test(req.body.ModuleName)) {
      console.log("Validation failed: ModuleName contains special characters.");
      return res.status(400).json({
        message: "ModuleName should contain only letters",
      });
    }

    // Check if ModuleName already exists
    const existingModule = await ModuleMaster.findOne({
      where: { ModuleName: req.body.ModuleName },
    });
    if (existingModule) {
      return res.status(400).json({ message: "ModuleName already exists" });
    }

    // Find the highest sequence number for the given ParentModuleID
    const highestSequence = await ModuleMaster.max("Sequence", {
      where: { ParentModuleID: req.body.ParentModuleID },
    });

    // Generate the next sequence number
    const newSequence = highestSequence ? highestSequence + 1 : 1;

    // Generate the unique ModuleCode
    const ModuleCode = await generateModuleCode();

    // Create a moduleMaster object
    const moduleMaster = {
      ModuleID: req.body.ModuleID, // Assuming this is auto-generated in DB if not provided
      ModuleCode: ModuleCode, // Automatically generated ModuleCode
      ModuleName: req.body.ModuleName.toUpperCase(),
      ParentModuleID: req.body.ParentModuleID,
      Sequence: newSequence, // Assigning the generated sequence
      IconURL: req.body.IconURL || null,
      WebAccess: req.body.WebAccess,
      MobileAccess: req.body.MobileAccess,
      IsActive: req.body.IsActive || true,
      Status: req.body.Status || "Active",
    };

    // Save the new module to the database
    const newModuleMaster = await ModuleMaster.create(moduleMaster);

    return res.status(201).json(newModuleMaster); // Send the newly created moduleMaster as response
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

    console.error("Error creating moduleMaster:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
// Retrieve all ModuleMaster from the database.
exports.findAll = async (req, res) => {
  try {
    // Fetch all module data
    const moduleData = await ModuleMaster.findAll({
      attributes: [
        "ModuleID",
        "ModuleCode",
        "ModuleName",
        "ParentModuleID",
        "Sequence",
        "IconURL",
        "WebAccess",
        "MobileAccess",
        "IsActive",
        "Status",
      ],
      order: [
        ["ModuleName", "ASC"], // Order by ModelDescription in ascending order
      ],
    });

    // Check if data is empty
    if (!moduleData || moduleData.length === 0) {
      return res.status(404).json({
        message: "No module data found.",
      });
    }

    // Map the data for response
    const combinedData = moduleData.map((item) => ({
      ModuleID: item.ModuleID,
      ModuleCode: item.ModuleCode,
      ModuleName: item.ModuleName,
      ParentModuleID: item.ParentModuleID,
      Sequence: item.Sequence,
      IconURL: item.IconURL,
      WebAccess: item.WebAccess,
      MobileAccess: item.MobileAccess,
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
        message: "Database error occurred while retrieving module data.",
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
    console.error("Error retrieving module data:", error);
    return res.status(500).json({
      message: "Failed to retrieve module data. Please try again later.",
    });
  }
};

// Find a single DivisionMaster with an id
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;

    // Validate the ID parameter
    if (!id) {
      return res.status(400).json({
        message: "ID parameter is required.",
      });
    }

    // Fetch the module data by primary key
    const moduleData = await ModuleMaster.findOne({
      where: {
        ModuleID: id,
      },
      attributes: [
        "ModuleID",
        "ModuleCode",
        "ModuleName",
        "ParentModuleID",
        "Sequence",
        "IconURL",
        "WebAccess",
        "MobileAccess",
        "IsActive",
        "Status",
      ],
    });

    // Check if data is found
    if (!moduleData) {
      return res.status(404).json({
        message: "Module data not found.",
      });
    }

    // Prepare the response data
    const responseData = {
      ModuleID: moduleData.ModuleID,
      ModuleCode: moduleData.ModuleCode,
      ModuleName: moduleData.ModuleName,
      ParentModuleID: moduleData.ParentModuleID,
      Sequence: moduleData.Sequence,
      IconURL: moduleData.IconURL,
      WebAccess: moduleData.WebAccess,
      MobileAccess: moduleData.MobileAccess,
      IsActive: moduleData.IsActive,
      Status: moduleData.Status,
    };

    // Send the response data
    res.json(responseData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while retrieving module data.",
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
    console.error("Error retrieving module data:", error);
    return res.status(500).json({
      message: "Failed to retrieve module data. Please try again later.",
    });
  }
};

// Update a ModuleMaster by the id in the request
exports.updateByPk = async (req, res) => {
  console.log("ModuleName:", req.body.ModuleName);

  try {
    // Validate request
    if (!req.body.ModuleName) {
      return res.status(400).json({ message: "ModuleName cannot be empty" });
    }
    if (!/^[a-zA-Z ]*$/.test(req.body.ModuleName)) {
      console.log("Validation failed: ModuleName contains special characters.");
      return res.status(400).json({
        message: "ModuleName should contain only letters",
      });
    }
    // Find the module by ID
    const moduleId = req.params.id;

    // Validate the ID parameter
    if (!moduleId) {
      return res.status(400).json({ message: "ID parameter is required." });
    }

    let moduleMaster = await ModuleMaster.findByPk(moduleId);

    if (!moduleMaster) {
      return res.status(404).json({ message: "ModuleMaster not found" });
    }

    // Update fields
    moduleMaster.ModuleCode = req.body.ModuleCode || moduleMaster.ModuleCode;
    moduleMaster.ModuleName = req.body.ModuleName;
    moduleMaster.ParentModuleID =
      req.body.ParentModuleID || moduleMaster.ParentModuleID;
    moduleMaster.Sequence = req.body.Sequence || moduleMaster.Sequence;
    moduleMaster.IconURL = req.body.IconURL || moduleMaster.IconURL;
    moduleMaster.WebAccess = req.body.WebAccess || moduleMaster.WebAccess;
    moduleMaster.MobileAccess =
      req.body.MobileAccess || moduleMaster.MobileAccess;
    moduleMaster.IsActive = req.body.IsActive || moduleMaster.IsActive;
    moduleMaster.Status = req.body.Status || moduleMaster.Status;
    moduleMaster.ModifiedDate = new Date();

    // Save updated ModuleMaster in the database
    const updatedModuleMaster = await moduleMaster.save();

    return res.status(200).json(updatedModuleMaster); // Send the updated ModuleMaster as response
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
        message: "Database error occurred while updating ModuleMaster.",
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
    console.error("Error updating ModuleMaster:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a DivisionMaster with the specified id in the request
exports.deleteById = async (req, res) => {
  const id = req.params.id;

  try {
    // Validate the ID parameter
    if (!id) {
      return res.status(400).json({ message: "ID parameter is required." });
    }

    // Find the model by ID
    const moduleMaster = await ModuleMaster.findByPk(id);

    // Check if the model exists
    if (!moduleMaster) {
      return res
        .status(404)
        .json({ message: "ModuleMaster not found with id: " + id });
    }

    // Delete the model
    await moduleMaster.destroy();

    // Send a success message
    res.status(200).json({
      message: "ModuleMaster with id: " + id + " deleted successfully",
    });
  } catch (err) {
    // Handle errors based on specific types
    if (err.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while deleting ModuleMaster.",
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
    console.error("Error deleting ModuleMaster:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.findAllwithSubModules = async (req, res) => {
  try {
    // Fetch all module data
    const moduleData = await ModuleMaster.findAll({
      attributes: [
        "ModuleID",
        "ModuleCode",
        "ModuleName",
        "ParentModuleID",
        "Sequence",
        "IconURL",
        "WebAccess",
        "MobileAccess",
        "IsActive",
        "Status",
      ],
      order: [["ModuleID", "ASC"]],
    });

    // Check if data is empty
    if (!moduleData || moduleData.length === 0) {
      return res.status(404).json({
        message: "No module data found.",
      });
    }

    // Convert the module data to a map for easy lookup of ParentModuleName
    const moduleMap = moduleData.reduce((map, item) => {
      map[item.ModuleID] = item; // Add each module to the map with ModuleID as the key
      return map;
    }, {});

    // Group modules by ParentModuleID
    const groupedModules = moduleData.reduce((acc, item) => {
      if (!acc[item.ParentModuleID]) {
        acc[item.ParentModuleID] = [];
      }
      acc[item.ParentModuleID].push(item);
      return acc;
    }, {});

    // Function to fetch forms related to a specific ModuleID and assign sequence to forms
    const getFormsForModule = async (moduleID) => {
      const formData = await FormMaster.findAll({
        where: { ModuleID: moduleID },
        attributes: [
          "FormID",
          "FormCode",
          "ModuleID",
          "FormName",
          "FormInterface",
          "FormType",
          "URLPath",
          "MenuListing",
          "IconURL",
        ],
      });

      let formSequenceCounter = 1; // Reset form sequence for each module

      return formData.map((form) => ({
        FormID: form.FormID,
        FormCode: form.FormCode,
        FormName: form.FormName,
        FormInterface: form.FormInterface,
        FormType: form.FormType,
        URLPath: form.URLPath,
        MenuListing: form.MenuListing,
        IconURL: form.IconURL,
        ModuleID: form.ModuleID,
        Sequence: formSequenceCounter++, // Assign sequence number to each form
      }));
    };

    // Assign sequence numbers and forms within each group, and add ParentModuleName
    const assignSequence = async (parentID) => {
      const modules = groupedModules[parentID] || [];
      let moduleSequenceCounter = 1; // Reset module sequence for each parent module
      const result = [];

      for (const module of modules) {
        // Fetch related forms for the current module and assign sequence
        const forms = await getFormsForModule(module.ModuleID);

        // Fetch the ParentModuleName based on ParentModuleID
        const parentModule = module.ParentModuleID
          ? moduleMap[module.ParentModuleID] // Lookup parent module in the map
          : null;
        const ParentModuleName = parentModule ? parentModule.ModuleName : null;

        const currentModule = {
          ModuleID: module.ModuleID,
          ModuleCode: module.ModuleCode,
          ModuleName: module.ModuleName,
          ParentModuleID: module.ParentModuleID,
          ParentModuleName: ParentModuleName, // Add ParentModuleName here
          Sequence: moduleSequenceCounter++, // Assign sequence number to each module
          IconURL: module.IconURL,
          WebAccess: module.WebAccess,
          MobileAccess: module.MobileAccess,
          IsActive: module.IsActive,
          Status: module.Status,
          FormCount: forms.length, // Add the form count here
          subModules: await assignSequence(module.ModuleID), // Recursive call for submodules
          forms, // Add related forms with sequence to the module
        };
        result.push(currentModule);
      }

      return result;
    };

    // Start with the top-level modules (ParentModuleID = 0)
    const moduleHierarchy = await assignSequence(0);

    // Send the hierarchy with sequences, forms, form count, and ParentModuleName as the response
    res.json(moduleHierarchy);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while retrieving module data.",
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
    console.error("Error retrieving module data:", error);
    return res.status(500).json({
      message: "Failed to retrieve module data. Please try again later.",
    });
  }
};

exports.findOnewithSubModules = async (req, res) => {
  try {
    // Extract ModuleID from request params
    const { ModuleID } = req.query;

    // Fetch the specific module by ModuleID
    const moduleData = await ModuleMaster.findOne({
      where: { ModuleID },
      attributes: [
        "ModuleID",
        "ModuleCode",
        "ModuleName",
        "ParentModuleID",
        "Sequence",
        "IconURL",
        "WebAccess",
        "MobileAccess",
        "IsActive",
        "Status",
      ],
      order: [["ModuleID", "ASC"]],
    });

    // Check if module data exists
    if (!moduleData) {
      return res.status(404).json({
        message: `No module data found for ModuleID: ${ModuleID}`,
      });
    }

    // Fetch the Parent Module Name if ParentModuleID exists
    let parentModuleName = null;
    if (moduleData.ParentModuleID) {
      const parentModule = await ModuleMaster.findOne({
        where: { ModuleID: moduleData.ParentModuleID },
        attributes: ["ModuleName"],
      });
      parentModuleName = parentModule ? parentModule.ModuleName : null;
    }

    // Function to fetch forms related to a specific ModuleID and assign sequence to forms
    const getFormsForModule = async (moduleID) => {
      const formData = await FormMaster.findAll({
        where: { ModuleID: moduleID },
        attributes: [
          "FormID",
          "FormCode",
          "ModuleID",
          "FormName",
          "FormInterface",
          "FormType",
          "URLPath",
          "MenuListing",
          "IconURL",
          "Status",
          "IsActive",
        ],
      });

      let formSequenceCounter = 1; // Reset form sequence for each module

      return formData.map((form) => ({
        FormID: form.FormID,
        FormCode: form.FormCode,
        FormName: form.FormName,
        FormInterface: form.FormInterface,
        FormType: form.FormType,
        URLPath: form.URLPath,
        MenuListing: form.MenuListing,
        IconURL: form.IconURL,
        ModuleID: form.ModuleID,
        Status: form.Status,
        IsActive: form.IsActive,
        Sequence: formSequenceCounter++, // Assign sequence number to each form
      }));
    };

    // Recursive function to fetch submodules, assign sequence numbers, and include ParentModuleName
    const assignSequence = async (parentID) => {
      const subModules = await ModuleMaster.findAll({
        where: { ParentModuleID: parentID },
        attributes: [
          "ModuleID",
          "ModuleCode",
          "ModuleName",
          "ParentModuleID",
          "Sequence",
          "IconURL",
          "WebAccess",
          "MobileAccess",
          "IsActive",
          "Status",
        ],
        order: [["ModuleID", "ASC"]],
      });

      let moduleSequenceCounter = 1; // Reset module sequence for each parent module
      const result = [];

      for (const module of subModules) {
        // Fetch the parent module name for the current submodule
        let parentModuleName = null;
        if (module.ParentModuleID) {
          const parentModule = await ModuleMaster.findOne({
            where: { ModuleID: module.ParentModuleID },
            attributes: ["ModuleName"],
          });
          parentModuleName = parentModule ? parentModule.ModuleName : null;
        }

        // Fetch related forms for the current submodule and assign sequence
        const forms = await getFormsForModule(module.ModuleID);

        const currentModule = {
          ModuleID: module.ModuleID,
          ModuleCode: module.ModuleCode,
          ModuleName: module.ModuleName,
          ParentModuleID: module.ParentModuleID,
          ParentModuleName: parentModuleName, // Add ParentModuleName for submodules
          Sequence: moduleSequenceCounter++, // Assign sequence number to each submodule
          IconURL: module.IconURL,
          WebAccess: module.WebAccess,
          MobileAccess: module.MobileAccess,
          IsActive: module.IsActive,
          Status: module.Status,
          subModules: await assignSequence(module.ModuleID), // Recursive call for submodules
          forms, // Add related forms with sequence to the submodule
        };
        result.push(currentModule);
      }

      return result;
    };

    // Fetch related forms for the top-level module
    const forms = await getFormsForModule(moduleData.ModuleID);

    // Fetch submodules for the top-level module
    const subModules = await assignSequence(moduleData.ModuleID);

    // Combine the module data with its forms, submodules, and ParentModuleName
    const moduleHierarchy = {
      ModuleID: moduleData.ModuleID,
      ModuleCode: moduleData.ModuleCode,
      ModuleName: moduleData.ModuleName,
      ParentModuleID: moduleData.ParentModuleID,
      ParentModuleName: parentModuleName, // Add the ParentModuleName here
      Sequence: moduleData.Sequence,
      IconURL: moduleData.IconURL,
      WebAccess: moduleData.WebAccess,
      MobileAccess: moduleData.MobileAccess,
      IsActive: moduleData.IsActive,
      Status: moduleData.Status,
      forms, // Add forms for the top-level module
      subModules, // Add submodules recursively, including ParentModuleName for each submodule
    };

    // Send the hierarchy with sequences and forms as the response
    res.json(moduleHierarchy);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while retrieving module data.",
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
    console.error("Error retrieving module data:", error);
    return res.status(500).json({
      message: "Failed to retrieve module data. Please try again later.",
    });
  }
};

// Create SubModule function with automatic ModuleCode generation
exports.createSubModule = async (req, res) => {
  try {
    const { ModuleID } = req.query; // Extract ModuleID from request query

    // Validate request
    if (!ModuleID) {
      return res.status(400).json({
        message: "ModuleID is required.",
      });
    }

    // Log the ModuleID from query
    console.log("ModuleID from query:", ModuleID);

    // Check if the parent module exists
    const parentModule = await ModuleMaster.findOne({
      where: { ModuleID: ModuleID }, // Trim to avoid whitespace issues
      attributes: ["ModuleID", "ModuleCode", "ModuleName"],
    });

    if (!parentModule) {
      return res.status(404).json({
        message: `Parent module with ID: ${ModuleID} not found.`,
      });
    }

    // Destructure new submodule data from the request body
    const {
      ParentModuleID,
      ModuleName,
      WebAccess,
      MobileAccess,
      IconURL,
      IsActive,
      Status,
    } = req.body;

    // Log the ParentModuleID from the body
    console.log("ParentModuleID from body:", ParentModuleID);

    // Validate required fields for new submodule
    if (!ModuleName) {
      return res.status(400).json({
        message: "ModuleName is required for a new submodule.",
      });
    }

    // Check if ParentModuleID matches ModuleID from the query
    if (String(ParentModuleID).trim() !== String(ModuleID).trim()) {
      console.log(
        `Mismatch: ParentModuleID (${ParentModuleID}) does not match ModuleID (${ModuleID})`
      );
      return res.status(400).json({
        message:
          "ParentModuleID must match the ModuleID provided in the query.",
      });
    }

    // Generate the unique ModuleCode
    const ModuleCode = await generateModuleCode();

    // Find the highest sequence number for the given ParentModuleID
    const highestSequence = await ModuleMaster.max("Sequence", {
      where: { ParentModuleID: ModuleID }, // Check against ModuleID
    });

    // Generate the next sequence number
    const newSequence = highestSequence ? highestSequence + 1 : 1;

    // Create a new submodule with ParentModuleID set to the provided ModuleID
    const newSubModule = await ModuleMaster.create({
      ModuleCode, // Automatically generated ModuleCode
      ModuleName,
      ParentModuleID: ModuleID, // Set the parent to the current module
      Sequence: newSequence, // Use the generated sequence
      IconURL: IconURL || null, // Optional fields
      WebAccess: WebAccess || false,
      MobileAccess: MobileAccess || false,
      IsActive: IsActive !== undefined ? IsActive : true, // Default to true
      Status: Status || "Active",
    });

    // Return response with the newly created submodule
    return res.status(201).json({
      message: "Submodule created successfully.",
      newSubModule, // Return the new submodule data
    });
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message: "Database error occurred while creating submodule.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    // General error handling
    console.error("Error creating submodule:", error);
    return res.status(500).json({
      message: "Failed to create submodule. Please try again later.",
    });
  }
};
exports.newFormCreate = async (req, res) => {
  // Handle file upload and other operations
  upload(req, res, async (err) => {
    // if (err) {
    //   console.error("Error uploading file:", err);
    //   return res.status(400).json({ message: err.message });
    // }

    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Extract ModuleID and ModuleName from req.body
      const { ModuleID } = req.body;

      // Ensure ModuleID in req.query matches ModuleID in req.body
      if (req.query.ModuleID !== ModuleID) {
        console.error("ModuleID mismatch between query and body");
        return res
          .status(400)
          .json({ message: "ModuleID in query and body must match" });
      }

      // Validate if both ModuleID and ModuleName are provided
      if (!ModuleID) {
        console.error("ModuleID is empty");
        return res.status(400).json({ message: "ModuleID cannot be empty" });
      }

      // Check if ModuleID exists in ModuleMaster
      const moduleExists = await ModuleMaster.findOne({
        where: { ModuleID },
      });

      if (!moduleExists) {
        return res.status(400).json({
          message: `ModuleID ${ModuleID} does not exist in ModuleMaster`,
        });
      }

      // // Ensure req.file exists
      // if (!req.file) {
      //   console.error("No file uploaded");
      //   return res.status(400).json({ message: "No file uploaded" });
      // }

      // // Generate a document name
      // const genName = await genIconNameinForms(
      //   req.file,
      //   ModuleID // Replace with ModuleID
      // );

      // console.log("genName: ", genName);

      // // Prepare data for document creation
      // const localFilePath = req.file.path;
      // const remoteFilePath = process.env.Finance_Documents_PATH + genName;
      // console.log("remoteFilePath", remoteFilePath);

      // // Upload file to server via SSH
      // const sshConfig = {
      //   host: process.env.SSH_HOST,
      //   port: process.env.SSH_PORT,
      //   username: process.env.SSH_USERNAME,
      //   privateKeyPath: process.env.SSH_PRIVATE_KEY_PATH,
      // };

      // await transferImageToServer(
      //   localFilePath,
      //   remoteFilePath,
      //   sshConfig,
      //   "upload"
      // );

      // Find the highest sequence number for the current ModuleID
      const maxSequence = await FormMaster.max("Sequence", {
        where: { ModuleID },
      });
      const FormCode = await generateFormCode();
      const newSequence = maxSequence ? maxSequence + 1 : 1; // Auto-increment Sequence

      // Save new form in the database
      const newForm = await FormMaster.create({
        FormCode: FormCode,
        FormName: req.body.FormName,
        ModuleID, // Matched ModuleID from body
        FormInterface: req.body.FormInterface,
        FormType: req.body.FormType,
        URLPath: req.body.URLPath,
        IconURL: req.body.IconURL,
        Sequence: newSequence, // Auto-incremented sequence
        MenuListing: req.body.MenuListing || false,
        // IconURL: remoteFilePath || null,
        IsActive: req.body.isActive !== undefined ? req.body.isActive : true,
        Status: req.body.isActive === undefined ? "Active" : "InActive",
      });

      console.log("New form created:", newForm);

      return res.status(201).json(newForm); // Send newly created form as response
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

      console.error("Error creating form:", err);
      return res.status(500).json({ message: "Internal server error" });
    } finally {
      // Clean up temporary file after processing
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    }
  });
};

exports.updateModule = async (req, res) => {
  try {
    const { ModuleID, ParentModuleID, Sequence } = req.body;

    // Validate the request
    if (!ModuleID || isNaN(ModuleID)) {
      return res.status(400).json({ message: "Valid ModuleID is required" });
    }

    // Check if ModuleID exists
    const existingModule = await ModuleMaster.findByPk(ModuleID);
    if (!existingModule) {
      return res
        .status(404)
        .json({ message: `Module with ID ${ModuleID} not found` });
    }

    const currentParentModuleID = existingModule.ParentModuleID;
    const currentPosition = existingModule.Sequence;

    // Adjust sequence if ParentModuleID is changing
    if (currentParentModuleID !== ParentModuleID) {
      // Decrease the sequence for the modules under the old ParentModuleID
      await ModuleMaster.update(
        { Sequence: Seq.literal('"Sequence" - 1') },
        {
          where: {
            ParentModuleID: currentParentModuleID,
            Sequence: { [Op.gt]: currentPosition },
          },
        }
      );

      // Adjust the sequence of the new parent modules
      const highestSequence = await ModuleMaster.max("Sequence", {
        where: { ParentModuleID: ParentModuleID },
      });

      const newSequence = highestSequence ? highestSequence + 1 : 1;

      // Update the current module's ParentModuleID and Sequence
      await ModuleMaster.update(
        {
          ParentModuleID: ParentModuleID,
          Sequence: newSequence,
        },
        {
          where: { ModuleID },
        }
      );
    } else if (currentPosition !== Sequence) {
      // Adjust the sequence only if the position is changing and ParentModuleID is unchanged
      if (currentPosition < Sequence) {
        await ModuleMaster.update(
          { Sequence: Seq.literal('"Sequence" - 1') },
          {
            where: {
              ParentModuleID: currentParentModuleID,
              Sequence: { [Op.gt]: currentPosition, [Op.lte]: Sequence },
            },
          }
        );
      } else if (currentPosition > Sequence) {
        await ModuleMaster.update(
          { Sequence: Seq.literal('"Sequence" + 1') },
          {
            where: {
              ParentModuleID: currentParentModuleID,
              Sequence: { [Op.lt]: currentPosition, [Op.gte]: Sequence },
            },
          }
        );
      }

      // Update the current module's Sequence
      await ModuleMaster.update(
        { Sequence: Sequence },
        {
          where: { ModuleID },
        }
      );
    }

    // Update other fields of the module
    await ModuleMaster.update(
      {
        ModuleName: req.body.ModuleName
          ? req.body.ModuleName.toUpperCase()
          : existingModule.ModuleName,
        IconURL: req.body.IconURL || existingModule.IconURL,
        WebAccess:
          req.body.WebAccess !== undefined
            ? req.body.WebAccess
            : existingModule.WebAccess,
        MobileAccess:
          req.body.MobileAccess !== undefined
            ? req.body.MobileAccess
            : existingModule.MobileAccess,
        IsActive:
          req.body.IsActive !== undefined
            ? req.body.IsActive
            : existingModule.IsActive,
        Status: req.body.Status || existingModule.Status,
      },
      {
        where: { ModuleID },
      }
    );

    return res.status(200).json({ message: "Module updated successfully" });
  } catch (error) {
    console.error("Error updating module:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateForms = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error("Error uploading file:", err);
      return res.status(400).json({ message: err.message });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (req.file && !req.body.ModuleID) {
      return res
        .status(400)
        .json({ message: "ModuleID is required when uploading a file." });
    }

    try {
      const { FormID } = req.body;
      let { ModuleID, Sequence } = req.body;

      // Ensure the values are correctly parsed as numbers (especially for form-data)
      ModuleID = ModuleID ? parseInt(ModuleID, 10) : null;
      Sequence = Sequence ? parseInt(Sequence, 10) : null;

      // Fetch the existing form
      let formMaster = await FormMaster.findOne({
        where: { FormID: FormID },
        include: [
          {
            model: ModuleMaster,
            as: "FMModuleID",
            attributes: ["ModuleName"],
          },
        ],
      });

      if (!formMaster) {
        return res.status(404).json({ message: "Form not found" });
      }

      const currentModuleID = formMaster.ModuleID;
      const currentPosition = formMaster.Sequence;

      // Adjust sequence if ModuleID is changing
      if (currentModuleID !== ModuleID) {
        await FormMaster.update(
          { Sequence: Seq.literal('"Sequence" - 1') },
          {
            where: {
              ModuleID: currentModuleID,
              Sequence: { [Op.gt]: currentPosition },
            },
          }
        );

        const highestSequence = await FormMaster.max("Sequence", {
          where: { ModuleID: ModuleID },
        });

        const newSequence = highestSequence ? highestSequence + 1 : 1;

        await FormMaster.update(
          {
            ModuleID: ModuleID,
            Sequence: newSequence,
          },
          {
            where: { FormID: FormID },
          }
        );
      } else if (currentPosition !== Sequence) {
        if (currentPosition < Sequence) {
          await FormMaster.update(
            { Sequence: Seq.literal('"Sequence" - 1') },
            {
              where: {
                ModuleID: currentModuleID,
                Sequence: { [Op.gt]: currentPosition, [Op.lte]: Sequence },
              },
            }
          );
        } else if (currentPosition > Sequence) {
          await FormMaster.update(
            { Sequence: Seq.literal('"Sequence" + 1') },
            {
              where: {
                ModuleID: currentModuleID,
                Sequence: { [Op.lt]: currentPosition, [Op.gte]: Sequence },
              },
            }
          );
        }

        await FormMaster.update(
          { Sequence: Sequence },
          {
            where: { FormID: FormID },
          }
        );
      }

      // Update other fields of the form
      formMaster.FormName = req.body.FormName || formMaster.FormName;
      formMaster.ModuleID = req.body.ModuleID || formMaster.ModuleID;
      formMaster.FormInterface =
        req.body.FormInterface || formMaster.FormInterface;
      formMaster.FormType = req.body.FormType || formMaster.FormType;
      formMaster.URLPath = req.body.URLPath || formMaster.URLPath;
      formMaster.IconURL = req.body.IconURL || formMaster.IconURL;
      formMaster.MenuListing =
        req.body.MenuListing !== undefined
          ? req.body.MenuListing
          : formMaster.MenuListing;
      formMaster.IsActive =
        req.body.IsActive !== undefined
          ? req.body.IsActive
          : formMaster.IsActive;
      formMaster.Status = req.body.Status || formMaster.Status;
      formMaster.ModifiedDate = new Date();

      // Update IconURL if a file was uploaded
      if (req.file) {
        formMaster.IconURL = req.file.path; // Use the path or URL of the uploaded file
      }

      const updatedFormMaster = await formMaster.save();

      return res.status(200).json({
        message: "Form updated successfully",
        data: updatedFormMaster,
      });
    } catch (err) {
      console.error("Error updating form:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
};

exports.updateSubModule = async (req, res) => {
  try {
    const { ModuleID } = req.query; // Main ModuleID from the query
    const { SubModuleID, ParentModuleID, Sequence } = req.body; // SubModuleID from body

    // Validate the request
    if (!ModuleID || isNaN(ModuleID)) {
      return res.status(400).json({ message: "Valid ModuleID is required" });
    }
    if (!SubModuleID || isNaN(SubModuleID)) {
      return res.status(400).json({ message: "Valid SubModuleID is required" });
    }

    // Check if the SubModuleID exists under the main ModuleID (if necessary, you can add an additional validation)
    const existingModule = await ModuleMaster.findByPk(SubModuleID);
    if (!existingModule) {
      return res
        .status(404)
        .json({ message: `SubModule with ID ${SubModuleID} not found` });
    }

    const currentParentModuleID = existingModule.ParentModuleID;
    const currentPosition = existingModule.Sequence;

    // Adjust sequence if ParentModuleID is changing
    if (currentParentModuleID !== ParentModuleID) {
      // Decrease the sequence for the modules under the old ParentModuleID
      await ModuleMaster.update(
        { Sequence: Seq.literal('"Sequence" - 1') },
        {
          where: {
            ParentModuleID: currentParentModuleID,
            Sequence: { [Op.gt]: currentPosition },
          },
        }
      );

      // Adjust the sequence of the new parent modules
      const highestSequence = await ModuleMaster.max("Sequence", {
        where: { ParentModuleID: ParentModuleID },
      });

      const newSequence = highestSequence ? highestSequence + 1 : 1;

      // Update the submodule's ParentModuleID and Sequence
      await ModuleMaster.update(
        {
          ParentModuleID: ParentModuleID,
          Sequence: newSequence,
        },
        {
          where: { ModuleID: SubModuleID },
        }
      );
    } else if (currentPosition !== Sequence) {
      // Adjust the sequence only if the position is changing and ParentModuleID is unchanged
      if (currentPosition < Sequence) {
        await ModuleMaster.update(
          { Sequence: Seq.literal('"Sequence" - 1') },
          {
            where: {
              ParentModuleID: currentParentModuleID,
              Sequence: { [Op.gt]: currentPosition, [Op.lte]: Sequence },
            },
          }
        );
      } else if (currentPosition > Sequence) {
        await ModuleMaster.update(
          { Sequence: Seq.literal('"Sequence" + 1') },
          {
            where: {
              ParentModuleID: currentParentModuleID,
              Sequence: { [Op.lt]: currentPosition, [Op.gte]: Sequence },
            },
          }
        );
      }

      // Update the submodule's Sequence
      await ModuleMaster.update(
        { Sequence: Sequence },
        {
          where: { ModuleID: SubModuleID },
        }
      );
    }

    // Update other fields of the submodule
    await ModuleMaster.update(
      {
        ModuleName: req.body.ModuleName
          ? req.body.ModuleName.toUpperCase()
          : existingModule.ModuleName,
        IconURL: req.body.IconURL || existingModule.IconURL,
        WebAccess:
          req.body.WebAccess !== undefined
            ? req.body.WebAccess
            : existingModule.WebAccess,
        MobileAccess:
          req.body.MobileAccess !== undefined
            ? req.body.MobileAccess
            : existingModule.MobileAccess,
        IsActive:
          req.body.IsActive !== undefined
            ? req.body.IsActive
            : existingModule.IsActive,
        Status: req.body.Status || existingModule.Status,
      },
      {
        where: { ModuleID: SubModuleID },
      }
    );

    return res.status(200).json({ message: "SubModule updated successfully" });
  } catch (error) {
    console.error("Error updating module:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
