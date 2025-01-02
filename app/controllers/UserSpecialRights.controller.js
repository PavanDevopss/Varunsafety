/* eslint-disable no-dupe-keys */
/* eslint-disable no-unused-vars */
const db = require("../models");
const UserSpecialRights = db.userspecialrights;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;
const UserMaster = db.usermaster;
const FormsMaster = db.formsmaster;
const APIActionMaster = db.apiactionmaster;
const ModuleMaster = db.modulemaster;
const DepartmentMaster = db.departmentmaster;
const FormMaster = db.formsmaster;
const RoleMaster = db.rolesmaster;
// Basic CRUD API
// Create and Save a new UserSpecialRights.
exports.create = async (req, res) => {
  try {
    // Check if the foreign keys exist
    const formExists = await FormsMaster.findByPk(req.body.FormID);
    const userExists = await UserMaster.findByPk(req.body.UserID);
    const actionExists = await APIActionMaster.findByPk(req.body.ActionID);
    const moduleExists = await ModuleMaster.findByPk(req.body.ModuleID);

    if (!formExists) {
      return res.status(400).json({ message: "FormID does not exist" });
    }

    if (!userExists) {
      return res.status(400).json({ message: "UserID does not exist" });
    }

    if (!actionExists) {
      return res.status(400).json({ message: "ActionID does not exist" });
    }

    if (!moduleExists) {
      return res.status(400).json({ message: "ModuleID does not exist" });
    }
    // Create UserSpecialRights record
    const newUserSpecialRights = await UserSpecialRights.create({
      UserID: req.body.UserID,
      FormID: req.body.FormID,
      ModuleID: req.body.ModuleID,
      ActionID: req.body.ActionID,
      IsActive: req.body.IsActive || true,
      Status: req.body.Status || "Active",
    });

    return res.status(201).json(newUserSpecialRights); // Send the newly created newUserSpecialRights as response
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

    console.error("Error creating UserSpecialRights:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
// Retrieve all UserSpecialRights. from the database.
exports.findAll = async (req, res) => {
  try {
    // Fetch all form data with included associations
    const userData = await UserSpecialRights.findAll({
      attributes: [
        "SpecialID",
        "UserID",
        "FormID",
        "ActionID",
        "ModuleID",
        "IsActive",
        "Status",
      ],
      include: [
        {
          model: UserMaster,
          as: "USRUserID",
          attributes: ["UserID", "UserName"], // Adjust attributes as per your requirements
        },
        {
          model: FormsMaster,
          as: "USRFormID",
          attributes: ["FormID", "FormCode", "FormName"], // Adjust attributes as per your requirements
        },
        {
          model: APIActionMaster,
          as: "USRActionID",
          attributes: ["ActionID", "ActionName"], // Adjust attributes as per your requirements
        },
        {
          model: ModuleMaster,
          as: "USRModuleID",
          attributes: ["ModuleID", "ModuleName"], // Adjust attributes as per your requirements
        },
      ],
    });

    // Check if data is empty
    if (!userData || userData.length === 0) {
      return res.status(404).json({
        message: "No forms data found.",
      });
    }

    // Map the data for response
    const combinedData = userData.map((item) => ({
      AccessID: item.AccessID,
      UserID: item.UserID,
      UserName: item.USRUserID ? item.USRUserID.UserName : null,
      FormID: item.FormID,
      FormCode: item.USRFormID ? item.USRFormID.FormCode : null,
      FormName: item.USRFormID ? item.USRFormID.FormName : null,
      ActionID: item.ActionID,
      ActionName: item.USRActionID ? item.USRActionID.ActionName : null,
      ModuleID: item.ModuleID,
      ModuleName: item.USRModuleIDD ? item.USRModuleID.ModuleName : null,
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
        message: "Database error occurred while retrieving user data.",
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
    console.error("Error retrieving user data:", error);
    return res.status(500).json({
      message: "Failed to retrieve user data. Please try again later.",
    });
  }
};

// Find a single UserSpecialRights. with an id
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
    const userData = await UserSpecialRights.findOne({
      where: { SpecialID: id },
      attributes: [
        "SpecialID",
        "UserID",
        "FormID",
        "ActionID",
        "ModuleID",
        "IsActive",
        "Status",
      ],
      include: [
        {
          model: UserMaster,
          as: "USRUserID",
          attributes: ["UserID", "UserName"],
        },
        {
          model: FormsMaster,
          as: "USRFormID",
          attributes: ["FormID", "FormCode", "FormName"],
        },
        {
          model: APIActionMaster,
          as: "USRActionID",
          attributes: ["ActionID", "ActionName"],
        },
        {
          model: ModuleMaster,
          as: "USRModuleID",
          attributes: ["ModuleID", "ModuleName"],
        },
      ],
    });

    // Check if data is found
    if (!userData) {
      return res.status(404).json({
        message: "User special rights data not found.",
      });
    }

    // Prepare the response data
    const responseData = {
      SpecialID: userData.SpecialID,
      UserID: userData.UserID,
      UserName: userData.USRUserID ? userData.USRUserID.UserName : null,
      FormID: userData.FormID,
      FormCode: userData.USRFormID ? userData.USRFormID.FormCode : null,
      FormName: userData.USRFormID ? userData.USRFormID.FormName : null,
      ActionID: userData.ActionID,
      ActionName: userData.USRActionID ? userData.USRActionID.ActionName : null,
      ModuleID: userData.ModuleID,
      ModuleName: userData.USRModuleID ? userData.USRModuleID.ModuleName : null,
      IsActive: userData.IsActive,
      Status: userData.Status,
    };

    // Send the response data
    res.json(responseData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message: "Database error occurred while retrieving user data.",
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
    console.error("Error retrieving user data:", error);
    return res.status(500).json({
      message: "Failed to retrieve user data. Please try again later.",
    });
  }
};

// Update a UserSpecialRights. by the id in the request

exports.updateByPk = async (req, res) => {
  try {
    // Find the form by ID
    const specialID = req.params.id;

    // Validate the ID parameter
    if (!specialID) {
      return res.status(400).json({ message: "ID parameter is required." });
    }

    let userSpecialRights = await UserSpecialRights.findByPk(specialID);

    if (!userSpecialRights) {
      return res.status(404).json({ message: " UserSpecialRights  not found" });
    }

    // Update fields (excluding those specified)

    userSpecialRights.SpecialID =
      req.body.SpecialID || userSpecialRights.SpecialID;
    userSpecialRights.UserID = req.body.UserID || userSpecialRights.UserID;
    userSpecialRights.FormID = req.body.FormID || userSpecialRights.FormID;
    userSpecialRights.ActionID =
      req.body.ActionID || userSpecialRights.ActionID;
    userSpecialRights.ModuleID =
      req.body.ModuleID || userSpecialRights.ModuleID;
    userSpecialRights.IsActive =
      req.body.IsActive || userSpecialRights.IsActive;
    userSpecialRights.Status = req.body.Status || userSpecialRights.Status;
    userSpecialRights.ModifiedDate = new Date();

    // Save updated UserSpecialRights in the database
    const updatedUserSpecialRights = await userSpecialRights.save();

    return res.status(200).json(updatedUserSpecialRights); // Send the updated UserSpecialRights as response
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
        message: "Database error occurred while updating UserSpecialRights.",
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
    console.error("Error updating UserSpecialRights:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a UserSpecialRights. with the specified id in the request
exports.deleteById = async (req, res) => {
  const id = req.params.id;

  try {
    // Validate the ID parameter
    if (!id) {
      return res.status(400).json({ message: "ID parameter is required." });
    }

    // Find the user by ID
    const userSpecialRights = await UserSpecialRights.findByPk(id);

    // Check if the user exists
    if (!userSpecialRights) {
      return res
        .status(404)
        .json({ message: `UserSpecialRights not found with id: ${id}` });
    }

    // Delete the form
    await userSpecialRights.destroy();

    // Send a success message
    res.status(200).json({
      message: `UserSpecialRights with id: ${id} deleted successfully`,
    });
  } catch (err) {
    // Handle errors based on specific types
    if (err.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while deleting UserSpecialRights.",
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
    console.error("Error deleting UserSpecialRights:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.UserAccessCreate = async (req, res) => {
  console.log("UserID:", req.body.UserID);

  const t = await Seq.transaction(); // Start a transaction

  try {
    if (!req.body.UserID) {
      return res.status(400).json({ message: "UserID cannot be empty" });
    }

    const { UserID, FormInterface } = req.body;

    // Check if the user exists in UserMaster
    const userExists = await UserMaster.findOne({
      where: { UserID },
    });

    if (!userExists) {
      await t.rollback(); // Rollback the transaction if user doesn't exist
      return res.status(404).json({ message: "User not found" });
    }

    let userSpecialEntries = [];

    // Loop through FormInterface array
    for (const interfaceItem of FormInterface) {
      const { InterfaceType, FormsList } = interfaceItem;

      for (const form of FormsList) {
        const { ModuleID, FormID, Actions, WebAccess, MobileAccess } = form;

        // Check if the form exists in FormsMaster
        const formMasterEntry = await FormsMaster.findOne({
          where: { FormID, ModuleID, FormInterface: InterfaceType },
          transaction: t, // Use the transaction
        });

        if (!formMasterEntry) {
          console.log(
            `No FormMaster found for FormID: ${FormID}, ModuleID: ${ModuleID}, InterfaceType: ${InterfaceType}`
          );
          continue; // Skip to the next iteration if form doesn't exist
        }

        // Insert each action if validation passes
        for (const ActionID of Actions) {
          // Check if an entry already exists in UserSpecialRights
          const existingEntry = await UserSpecialRights.findOne({
            where: { UserID, ModuleID, FormID, ActionID },
            transaction: t, // Use the transaction
          });

          // Add to entries array only if it doesn't already exist
          if (!existingEntry) {
            userSpecialEntries.push({
              UserID,
              ModuleID,
              FormID,
              ActionID,
              WebAccess,
              MobileAccess,
            });
          }
        }
      }
    }

    // Bulk insert all valid entries
    if (userSpecialEntries.length > 0) {
      await UserSpecialRights.bulkCreate(userSpecialEntries, {
        transaction: t,
      });
    }

    await t.commit(); // Commit the transaction
    return res
      .status(201)
      .json({ message: "User access created successfully" });
  } catch (err) {
    await t.rollback(); // Rollback the transaction on error
    console.error("Error creating User access:", err);

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

    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.findAllUserAccess = async (req, res) => {
  try {
    const { UserID } = req.query;

    if (!UserID) {
      return res.status(400).json({ message: "UserID is required" });
    }

    // Fetch user data with included department data
    const userData = await UserMaster.findAll({
      where: { UserID },
      attributes: [
        "UserID",
        "UserName",
        "EmpID",
        "Email",
        "Mobile",
        "RoleID",
        "DeptID",
        "Designation",
        "UserStatus",
        "DateOfJoining",
        "DrivingLicense",
        "State",
        "Region",
        "City",
        "Branch",
        "OEMID",
        "Status",
      ],
      include: [
        {
          model: DepartmentMaster,
          as: "UMDeptID",
          attributes: ["DeptID", "DeptCode", "DeptName"],
        },
      ],
      order: [["UserName", "ASC"]], // Order by UserName in ascending order
    });

    if (!userData || userData.length === 0) {
      return res.status(404).json({ message: "No user data found." });
    }

    const usersWithAccessRights = await Promise.all(
      userData.map(async (user) => {
        // Fetch RoleName from RoleMaster separately
        const role = await RoleMaster.findOne({
          where: { RoleID: user.RoleID },
          attributes: ["RoleID", "RoleName"],
        });

        const accessRights = await UserSpecialRights.findAll({
          where: { UserID: user.UserID },
          attributes: [
            "FormID",
            "ActionID",
            "ModuleID",
            "WebAccess",
            "MobileAccess",
          ],
          include: [
            {
              model: FormMaster,
              as: "USRFormID",
              attributes: ["FormID", "FormName", "FormCode", "FormInterface"],
            },
            {
              model: APIActionMaster,
              as: "USRActionID",
              attributes: ["ActionID", "ActionName"],
            },
            {
              model: ModuleMaster,
              as: "USRModuleID",
              attributes: ["ModuleID", "ModuleName"],
            },
          ],
        });

        // Organize data by Modules, Forms, and Actions
        const modules = {};
        accessRights.forEach((access) => {
          const moduleId = access.ModuleID;
          const moduleName = access.USRModuleID
            ? access.USRModuleID.ModuleName
            : null;
          const formId = access.FormID;
          const formName = access.USRFormID ? access.USRFormID.FormName : null;
          const formCode = access.USRFormID ? access.USRFormID.FormCode : null;
          const formInterface = access.USRFormID
            ? access.USRFormID.FormInterface
            : null;
          const actionId = access.ActionID;
          const actionName = access.USRActionID
            ? access.USRActionID.ActionName
            : null;

          if (!modules[moduleId]) {
            modules[moduleId] = {
              ModuleID: moduleId,
              ModuleName: moduleName,
              Forms: {},
            };
          }

          if (!modules[moduleId].Forms[formId]) {
            modules[moduleId].Forms[formId] = {
              FormID: formId,
              FormName: formName,
              FormCode: formCode,
              FormInterface: formInterface,
              Actions: [],
            };
          }

          modules[moduleId].Forms[formId].Actions.push({
            ActionID: actionId,
            ActionName: actionName,
            WebAccess: access.WebAccess,
            MobileAccess: access.MobileAccess,
          });
        });

        // Convert nested object structure to arrays
        const modulesArray = Object.values(modules).map((module) => ({
          ModuleID: module.ModuleID,
          ModuleName: module.ModuleName,
          Forms: Object.values(module.Forms),
        }));

        return {
          UserID: user.UserID,
          UserName: user.UserName,
          EmpID: user.EmpID,
          Email: user.Email,
          Mobile: user.Mobile,
          RoleID: user.RoleID,
          RoleName: role ? role.RoleName : null, // Add RoleName from RoleMaster
          Designation: user.Designation,
          UserStatus: user.UserStatus,
          DateOfJoining: user.DateOfJoining, // Include DateOfJoining
          DeptID: user.DeptID,
          DrivingLicense: user.DrivingLicense,
          DeptName: user.UMDeptID ? user.UMDeptID.DeptName : null, // Add DeptName
          DeptCode: user.UMDeptID ? user.UMDeptID.DeptCode : null, // Add DeptCode
          State: user.State,
          Region: user.Region,
          City: user.City,
          Branch: user.Branch,
          OEMID: user.OEMID,
          Status: user.Status,
          Modules: modulesArray,
        };
      })
    );

    res.json(usersWithAccessRights);
  } catch (error) {
    console.error("Error retrieving user data:", error);

    if (error.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message: "Database error occurred while retrieving user data.",
        details: error.message,
      });
    }
    if (error.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    return res.status(500).json({
      message: "Failed to retrieve user data. Please try again later.",
    });
  }
};

exports.bulkUpdateUserActions = async (req, res) => {
  const { updates } = req.body;

  // Check if updates is an array and not empty
  if (!Array.isArray(updates) || updates.length === 0) {
    return res
      .status(400)
      .json({ message: "Updates must be a non-empty array" });
  }

  const t = await Seq.transaction(); // Start a transaction

  try {
    const updatePromises = []; // To hold update promises
    const newEntries = []; // To hold new entries for ActionIDs
    const deletePromises = []; // To hold delete promises

    for (const update of updates) {
      const { UserID, FormID, ActionID, ModuleID, AccessID } = update;

      // Validate required fields
      if (
        UserID === undefined ||
        FormID === undefined ||
        ActionID === undefined ||
        ModuleID === undefined
      ) {
        return res.status(400).json({
          message: "UserID, FormID, ActionID, and ModuleID are required",
        });
      }

      // Construct the base query object
      const baseQuery = { UserID, FormID, ModuleID };

      if (AccessID) {
        baseQuery.AccessID = AccessID; // Only add AccessID if it's provided
      }

      if (AccessID) {
        // If AccessID is provided, first handle the update logic for ActionID
        updatePromises.push(
          UserSpecialRights.update(
            { ActionID },
            { where: baseQuery, transaction: t }
          )
        );
      }

      // Handle deletions: Delete actions that are no longer part of the update
      const existingRecords = await UserSpecialRights.findAll({
        where: baseQuery,
        transaction: t,
      });

      for (const existingRecord of existingRecords) {
        const currentActionID = existingRecord.ActionID;
        if (!ActionID.includes(currentActionID)) {
          // If the ActionID is not part of the update, mark it for deletion
          deletePromises.push(
            UserSpecialRights.destroy({
              where: { ...baseQuery, ActionID: currentActionID },
              transaction: t,
            })
          );
        }
      }

      // Handle creation of new ActionID combinations
      for (const actionID of ActionID) {
        const existingRecord = await UserSpecialRights.findOne({
          where: { ...baseQuery, ActionID: actionID },
          transaction: t,
        });

        if (!existingRecord) {
          // If the ActionID does not exist, create a new entry
          newEntries.push({
            UserID,
            FormID,
            ActionID: actionID,
            ModuleID,
            AccessID,
          });
        }
      }
    }

    // Execute all update promises
    await Promise.all(updatePromises);

    // Execute delete promises if any records need to be deleted
    if (deletePromises.length > 0) {
      await Promise.all(deletePromises);
    }

    // Insert new ActionID entries if any
    if (newEntries.length > 0) {
      await UserSpecialRights.bulkCreate(newEntries, { transaction: t });
    }

    await t.commit(); // Commit the transaction
    return res
      .status(200)
      .json({ message: "Action IDs processed successfully" });
  } catch (err) {
    await t.rollback(); // Rollback the transaction on error
    console.error("Error processing Action IDs for UserMasterUpdate:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
