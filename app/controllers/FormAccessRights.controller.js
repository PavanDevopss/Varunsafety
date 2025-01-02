/* eslint-disable no-dupe-keys */
/* eslint-disable no-unused-vars */
const db = require("../models");
const FormAccessRights = db.formaccessrights;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;
const RolesMaster = db.rolesmaster;
const FormsMaster = db.formsmaster;
const APIActionMaster = db.apiactionmaster;

// Basic CRUD API
// Create and Save a new FormAccessRights
exports.create = async (req, res) => {
  try {
    // Check if the foreign keys exist
    const formExists = await FormsMaster.findByPk(req.body.FormID);
    const roleExists = await RolesMaster.findByPk(req.body.RoleID);
    const actionExists = await APIActionMaster.findByPk(req.body.ActionID);

    if (!formExists) {
      return res.status(400).json({ message: "FormID does not exist" });
    }

    if (!roleExists) {
      return res.status(400).json({ message: "RoleID does not exist" });
    }

    if (!actionExists) {
      return res.status(400).json({ message: "ActionID does not exist" });
    }
    // Create FormAccessRights record
    const newFormAccessRights = await FormAccessRights.create({
      RoleID: req.body.RoleID,
      FormID: req.body.FormID,
      ActionID: req.body.ActionID,
      IsActive: req.body.IsActive || true,
      Status: req.body.Status || "Active",
    });

    return res.status(201).json(newFormAccessRights); // Send the newly created FormAccessRights as response
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

    console.error("Error creating FormAccessRights:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
// Retrieve all FormAccessRightss from the database.
exports.findAll = async (req, res) => {
  try {
    // Fetch all form data with included associations
    const formsData = await FormAccessRights.findAll({
      attributes: [
        "AccessID",
        "RoleID",
        "FormID",
        "ActionID",
        "IsActive",
        "Status",
      ],
      include: [
        {
          model: RolesMaster,
          as: "FARRoleID",
          attributes: ["RoleID", "RoleName"], // Adjust attributes as per your requirements
        },
        {
          model: FormsMaster,
          as: "FARFormID",
          attributes: ["FormID", "FormCode", "FormName"], // Adjust attributes as per your requirements
        },
        {
          model: APIActionMaster,
          as: "FARActionID",
          attributes: ["ActionID", "ActionName"], // Adjust attributes as per your requirements
        },
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
      AccessID: item.AccessID,
      RoleID: item.RoleID,
      RoleName: item.FARRoleID ? item.FARRoleID.RoleName : null,
      FormID: item.FormID,
      FormCode: item.FARFormID ? item.FARFormID.FormCode : null,
      FormName: item.FARFormID ? item.FARFormID.FormName : null,
      ActionID: item.ActionID,
      ActionName: item.FARActionID ? item.FARActionID.ActionName : null,
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

// Find a single FormAccessRights with an id
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;

    // Validate the ID parameter
    if (!id) {
      return res.status(400).json({
        message: "ID parameter is required.",
      });
    }

    // Fetch the form data by primary key with included associations
    const formData = await FormAccessRights.findOne({
      where: {
        AccessID: id,
      },
      attributes: [
        "AccessID",
        "RoleID",
        "FormID",
        "ActionID",
        "IsActive",
        "Status",
      ],
      include: [
        {
          model: RolesMaster,
          as: "FARRoleID",
          attributes: ["RoleID", "RoleName"], // Adjust attributes as per your requirements
        },
        {
          model: FormsMaster,
          as: "FARFormID",
          attributes: ["FormID", "FormCode", "FormName"], // Adjust attributes as per your requirements
        },
        {
          model: APIActionMaster,
          as: "FARActionID",
          attributes: ["ActionID", "ActionName"], // Adjust attributes as per your requirements
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
      AccessID: formData.AccessID,
      RoleID: formData.RoleID,
      RoleName: formData.FARRoleID ? formData.FARRoleID.RoleName : null,
      FormID: formData.FormID,
      FormCode: formData.FARFormID ? formData.FARFormID.FormCode : null,
      FormName: formData.FARFormID ? formData.FARFormID.FormName : null,
      ActionID: formData.ActionID,
      ActionName: formData.FARActionID ? formData.FARActionID.ActionName : null,
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

// Update a FormAccessRights by the id in the request

exports.updateByPk = async (req, res) => {
  try {
    // Find the form by ID
    const accessID = req.params.id;

    // Validate the ID parameter
    if (!accessID) {
      return res.status(400).json({ message: "ID parameter is required." });
    }

    let formAccessRights = await FormAccessRights.findByPk(accessID);

    if (!formAccessRights) {
      return res.status(404).json({ message: "FormAccessRights not found" });
    }

    // Update fields (excluding those specified)

    formAccessRights.AccessID = req.body.AccessID || formAccessRights.AccessID;
    formAccessRights.RoleID = req.body.RoleID || formAccessRights.RoleID;
    formAccessRights.FormID = req.body.FormID || formAccessRights.FormID;
    formAccessRights.ActionID = req.body.ActionID || formAccessRights.ActionID;
    formAccessRights.IsActive = req.body.IsActive || formAccessRights.IsActive;
    formAccessRights.Status = req.body.Status || formAccessRights.Status;
    formAccessRights.ModifiedDate = new Date();

    // Save updated FormAccessRights in the database
    const updatedFormAccessRights = await formAccessRights.save();

    return res.status(200).json(updatedFormAccessRights); // Send the updated FormAccessRights as response
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
        message: "Database error occurred while updating FormAccessRights.",
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
    console.error("Error updating FormAccessRights:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a FormAccessRights with the specified id in the request
exports.deleteById = async (req, res) => {
  const id = req.params.id;

  try {
    // Validate the ID parameter
    if (!id) {
      return res.status(400).json({ message: "ID parameter is required." });
    }

    // Find the form by ID
    const formAccessRights = await FormAccessRights.findByPk(id);

    // Check if the form exists
    if (!formAccessRights) {
      return res
        .status(404)
        .json({ message: `FormAccessRights not found with id: ${id}` });
    }

    // Delete the form
    await formAccessRights.destroy();

    // Send a success message
    res.status(200).json({
      message: `FormAccessRights with id: ${id} deleted successfully`,
    });
  } catch (err) {
    // Handle errors based on specific types
    if (err.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while deleting FormAccessRights.",
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
    console.error("Error deleting FormAccessRights:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
