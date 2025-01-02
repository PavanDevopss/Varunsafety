/* eslint-disable no-dupe-keys */
/* eslint-disable no-unused-vars */
const db = require("../models");
const FormAccessRightsModel = require("../models/FormAccessRights.model");
const RolesMaster = db.rolesmaster;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;
const DepartmentMaster = db.departmentmaster;
const FormAccess = db.formaccessrights;
const FormMaster = db.formsmaster;
const APIActionMaster = db.apiactionmaster;
const ModuleMaster = db.modulemaster;
const { generateRoleCode } = require("../Utils/generateService");
// Basic CRUD API
// Create and Save a new RolesMaster
// exports.RoleAccessCreate = async (req, res) => {
//   console.log("RoleID:", req.body.RoleID);

//   const t = await Seq.transaction(); // Start a transaction

//   try {
//     if (!req.body.RoleID) {
//       return res.status(400).json({ message: "RoleID cannot be empty" });
//     }

//     const { RoleID, FormInterface } = req.body;

//     let formAccessEntries = [];

//     // Loop through FormInterface array
//     for (const interfaceItem of FormInterface) {
//       const { InterfaceType, FormsList } = interfaceItem;

//       for (const form of FormsList) {
//         const { ModuleID, FormID, Actions } = form;

//         // Check the InterfaceType in FormMaster
//         const formMasterEntry = await FormMaster.findOne({
//           where: { FormID, ModuleID, FormInterface: InterfaceType },
//           transaction: t, // Use the transaction
//         });

//         if (!formMasterEntry) {
//           console.log(
//             `No FormMaster found for FormID: ${FormID}, ModuleID: ${ModuleID}, InterfaceType: ${InterfaceType}`
//           );
//           continue; // Skip to the next iteration if InterfaceType doesn't match
//         }

//         // Insert each action if validation passes
//         for (const ActionID of Actions) {
//           // Check if an entry already exists in FormAccess
//           const existingEntry = await FormAccess.findOne({
//             where: { RoleID, ModuleID, FormID, ActionID },
//             transaction: t, // Use the transaction
//           });

//           // Add to entries array only if it doesn't already exist
//           if (!existingEntry) {
//             formAccessEntries.push({
//               RoleID,
//               ModuleID,
//               FormID,
//               ActionID,
//               // Note: Do not include InterfaceType here
//             });
//           }
//         }
//       }
//     }

//     // Bulk insert all valid entries
//     if (formAccessEntries.length > 0) {
//       await FormAccess.bulkCreate(formAccessEntries, { transaction: t });
//     }

//     await t.commit(); // Commit the transaction
//     return res
//       .status(201)
//       .json({ message: "Role access created successfully" });
//   } catch (err) {
//     await t.rollback(); // Rollback the transaction on error
//     console.error("Error creating Role access:", err);

//     if (err.name === "SequelizeValidationError") {
//       return res.status(400).json({
//         message: "Validation error",
//         details: err.errors.map((e) => e.message),
//       });
//     }

//     if (err.name === "SequelizeUniqueConstraintError") {
//       return res.status(400).json({
//         message: "Unique constraint error",
//         details: err.errors.map((e) => e.message),
//       });
//     }

//     return res.status(500).json({ message: "Internal server error" });
//   }
// };

exports.RoleAccessCreate = async (req, res) => {
  console.log("RoleID:", req.body.RoleID);

  const t = await Seq.transaction(); // Start a transaction

  try {
    // Validate input
    if (!req.body.RoleName || !req.body.DeptID) {
      return res
        .status(400)
        .json({ message: "RoleName and DeptID cannot be empty" });
    }

    const { RoleName, DeptID, WebAccess, MobileAccess, FormInterface } =
      req.body;

    // Await the RoleCode if it's a promise
    const RoleCode = await generateRoleCode(); // Make sure to await it

    console.log("RoleCode:", RoleCode); // Debugging line

    // Step 1: Create the role in RoleMaster table
    const newRole = await RolesMaster.create(
      {
        RoleName,
        DeptID,
        WebAccess,
        MobileAccess,
        RoleCode,
      },
      { transaction: t } // Use the transaction
    );

    // Use the newly created RoleID
    const RoleID = newRole.RoleID;

    let formAccessEntries = [];

    // Step 2: Loop through FormInterface array
    for (const interfaceItem of FormInterface) {
      const { InterfaceType, FormsList } = interfaceItem;

      for (const form of FormsList) {
        const { ModuleID, FormID, Actions } = form;

        // Check the InterfaceType in FormMaster
        const formMasterEntry = await FormMaster.findOne({
          where: { FormID, ModuleID, FormInterface: InterfaceType },
          transaction: t, // Use the transaction
        });

        if (!formMasterEntry) {
          console.log(
            `No FormMaster found for FormID: ${FormID}, ModuleID: ${ModuleID}, InterfaceType: ${InterfaceType}`
          );
          continue; // Skip to the next iteration if InterfaceType doesn't match
        }

        // Insert each action if validation passes
        for (const ActionID of Actions) {
          // Check if an entry already exists in FormAccess
          const existingEntry = await FormAccess.findOne({
            where: { RoleID, ModuleID, FormID, ActionID },
            transaction: t, // Use the transaction
          });

          // Add to entries array only if it doesn't already exist
          if (!existingEntry) {
            formAccessEntries.push({
              RoleID,
              ModuleID,
              FormID,
              ActionID,
              // Note: Do not include InterfaceType here
            });
          }
        }
      }
    }

    // Step 3: Bulk insert all valid entries
    if (formAccessEntries.length > 0) {
      await FormAccess.bulkCreate(formAccessEntries, { transaction: t });
    }

    await t.commit(); // Commit the transaction
    return res
      .status(201)
      .json({ message: "Role access created successfully" });
  } catch (err) {
    await t.rollback(); // Rollback the transaction on error
    console.error("Error creating Role access:", err);

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

// Retrieve all RolesMasters from the database.
exports.findAll = async (req, res) => {
  try {
    // Fetch all roles data with included department data
    const rolesData = await RolesMaster.findAll({
      attributes: [
        "RoleID",
        "RoleName",
        "RoleCode",
        "DeptID",
        "WebAccess",
        "MobileAccess",
        "Status",
        "IsActive",
      ],
      include: [
        {
          model: DepartmentMaster,
          as: "RMDeptID",
          attributes: ["DeptID", "DeptCode", "DeptName"],
        },
      ],
      order: [
        ["RoleName", "ASC"], // Order by ModelDescription in ascending order
      ],
    });

    // Check if data is empty
    if (!rolesData || rolesData.length === 0) {
      return res.status(404).json({
        message: "No roles data found.",
      });
    }

    // Map the data for response
    const combinedData = rolesData.map((item) => ({
      RoleID: item.RoleID,
      RoleCode: item.RoleCode,
      RoleName: item.RoleName,
      DeptID: item.DeptID,
      DeptCode: item.RMDeptID ? item.RMDeptID.DeptCode : null,
      DeptName: item.RMDeptID ? item.RMDeptID.DeptName : null,
      WebAccess: item.WebAccess,
      MobileAccess: item.MobileAccess,
      Status: item.Status,
      IsActive: item.IsActive,
    }));

    // Send the combined data as response
    res.json(combinedData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while retrieving roles data.",
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
    console.error("Error retrieving roles data:", error);
    return res.status(500).json({
      message: "Failed to retrieve roles data. Please try again later.",
    });
  }
};

// Find a single RolesMaster with an id
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;

    // Validate the ID parameter
    if (!id) {
      return res.status(400).json({
        message: "ID parameter is required.",
      });
    }

    // Fetch the role data by primary key with included department data
    const roleData = await RolesMaster.findOne({
      where: {
        RoleID: id,
      },
      attributes: [
        "RoleID",
        "RoleCode",
        "RoleName",
        "DeptID",
        "WebAccess",
        "MobileAccess",
        "Status",
        "IsActive",
      ],
      include: [
        {
          model: DepartmentMaster,
          as: "RMDeptID",
          attributes: ["DeptID", "DeptCode", "DeptName"],
        },
      ],
    });

    // Check if data is found
    if (!roleData) {
      return res.status(404).json({
        message: "Role data not found.",
      });
    }

    // Prepare the response data
    const responseData = {
      RoleID: roleData.RoleID,
      RoleCode: roleData.RoleCode,
      RoleName: roleData.RoleName,
      DeptID: roleData.DeptID,
      DeptCode: roleData.RMDeptID ? roleData.RMDeptID.DeptCode : null,
      DeptName: roleData.RMDeptID ? roleData.RMDeptID.DeptName : null,
      WebAccess: roleData.WebAccess,
      MobileAccess: roleData.MobileAccess,
      Status: roleData.Status,
      IsActive: roleData.IsActive,
    };

    // Send the response data
    res.json(responseData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while retrieving role data.",
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
    console.error("Error retrieving role data:", error);
    return res.status(500).json({
      message: "Failed to retrieve role data. Please try again later.",
    });
  }
};

// Update a RolesMaster by the id in the request
exports.updateByPk = async (req, res) => {
  console.log("RoleName:", req.body.RoleName);

  try {
    // Validate request
    if (!req.body.RoleName) {
      return res.status(400).json({ message: "RoleName cannot be empty" });
    }
    if (!/^[a-zA-Z ]*$/.test(req.body.RoleName)) {
      console.log("Validation failed: RoleName contains special characters.");
      return res.status(400).json({
        message: "RoleName should contain only letters",
      });
    }
    // Find the role by ID
    const RoleId = req.params.id;

    // Validate the ID parameter
    if (!RoleId) {
      return res.status(400).json({ message: "ID parameter is required." });
    }

    let rolesMaster = await RolesMaster.findByPk(RoleId);

    if (!rolesMaster) {
      return res.status(404).json({ message: "RolesMaster not found" });
    }

    // Update fields
    rolesMaster.RoleName = req.body.RoleName;
    rolesMaster.FormCode = req.body.FormCode || rolesMaster.FormCode;
    rolesMaster.FormInterface =
      req.body.FormInterface || rolesMaster.FormInterface;
    rolesMaster.FormType = req.body.FormType || rolesMaster.FormType;
    rolesMaster.URLPath = req.body.URLPath || rolesMaster.URLPath;
    rolesMaster.Sequence = req.body.Sequence || rolesMaster.Sequence;
    rolesMaster.MenuListing = req.body.MenuListing || rolesMaster.MenuListing;
    rolesMaster.IconURL = req.body.IconURL || rolesMaster.IconURL;
    rolesMaster.IsActive = req.body.IsActive || rolesMaster.IsActive;
    rolesMaster.Status = req.body.Status || rolesMaster.Status;
    rolesMaster.ModuleID = req.body.ModuleID || rolesMaster.ModuleID;
    rolesMaster.ModifiedDate = new Date();

    // Save updated RolesMaster in the database
    const updatedRolesMaster = await rolesMaster.save();

    return res.status(200).json(updatedRolesMaster); // Send the updated RolesMaster as response
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
        message: "Database error occurred while updating RolesMaster.",
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
    console.error("Error updating RolesMaster:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a RolesMaster with the specified id in the request
exports.deleteById = async (req, res) => {
  const id = req.params.id;

  try {
    // Validate the ID parameter
    if (!id) {
      return res.status(400).json({ message: "ID parameter is required." });
    }

    // Find the RolesMaster by ID
    const rolesMaster = await RolesMaster.findByPk(id);

    // Check if the RolesMaster exists
    if (!rolesMaster) {
      return res
        .status(404)
        .json({ message: "RolesMaster not found with id: " + id });
    }

    // Delete the RolesMaster
    await rolesMaster.destroy();

    // Send a success message
    res.status(200).json({
      message: "RolesMaster with id: " + id + " deleted successfully",
    });
  } catch (err) {
    // Handle errors based on specific types
    if (err.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while deleting RolesMaster.",
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
    console.error("Error deleting RolesMaster:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// exports.bulkUpdateActionID = async (req, res) => {
//   const { updates } = req.body; // Assuming `updates` is an array of objects with RoleID, FormID, ActionID, ModuleID

//   if (!Array.isArray(updates) || updates.length === 0) {
//     return res
//       .status(400)
//       .json({ message: "Updates must be a non-empty array" });
//   }

//   const t = await Seq.transaction(); // Start a transaction

//   try {
//     const updatePromises = []; // To hold update promises
//     const newEntries = []; // To hold new entries for ActionIDs

//     for (const update of updates) {
//       const { RoleID, FormID, ActionID, ModuleID, AccessID } = update;

//       // Update existing ActionID
//       if (ActionID !== undefined) {
//         // Update ActionID in the FormAccess table
//         updatePromises.push(
//           FormAccess.update(
//             { ActionID },
//             { where: { RoleID, FormID, ModuleID, AccessID }, transaction: t }
//           )
//         );
//       }

//       // If a new ActionID needs to be added, create an entry
//       if (
//         ActionID &&
//         !newEntries.some(
//           (entry) =>
//             entry.RoleID === RoleID &&
//             entry.FormID === FormID &&
//             entry.ActionID === ActionID &&
//             entry.ModuleID === ModuleID
//         )
//       ) {
//         newEntries.push({
//           RoleID,
//           FormID,
//           ActionID,
//           ModuleID,
//         });
//       }
//     }

//     // Execute all updates
//     await Promise.all(updatePromises);

//     // Insert new ActionID entries if any
//     if (newEntries.length > 0) {
//       await FormAccess.bulkCreate(newEntries, { transaction: t });
//     }

//     await t.commit(); // Commit the transaction
//     return res.status(200).json({ message: "Action IDs updated successfully" });
//   } catch (err) {
//     await t.rollback(); // Rollback the transaction on error
//     console.error("Error updating Action IDs:", err);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };

exports.bulkUpdateActionID = async (req, res) => {
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
      const { RoleID, FormID, ActionID, ModuleID, AccessID } = update;

      // Validate required fields
      if (
        RoleID === undefined ||
        FormID === undefined ||
        ActionID === undefined ||
        ModuleID === undefined
      ) {
        return res.status(400).json({
          message: "RoleID, FormID, ActionID, and ModuleID are required",
        });
      }

      // Construct the base query object
      const baseQuery = { RoleID, FormID, ModuleID };

      if (AccessID) {
        baseQuery.AccessID = AccessID; // Only add AccessID if it's provided
      }

      if (AccessID) {
        // If AccessID is provided, first handle the update logic for ActionID
        updatePromises.push(
          FormAccess.update({ ActionID }, { where: baseQuery, transaction: t })
        );
      }

      // Handle deletions: Delete actions that are no longer part of the update
      const existingRecords = await FormAccess.findAll({
        where: baseQuery,
        transaction: t,
      });

      for (const existingRecord of existingRecords) {
        const currentActionID = existingRecord.ActionID;
        if (!ActionID.includes(currentActionID)) {
          // If the ActionID is not part of the update, mark it for deletion
          deletePromises.push(
            FormAccess.destroy({
              where: { ...baseQuery, ActionID: currentActionID },
              transaction: t,
            })
          );
        }
      }

      // Handle creation of new ActionID combinations
      for (const actionID of ActionID) {
        const existingRecord = await FormAccess.findOne({
          where: { ...baseQuery, ActionID: actionID },
          transaction: t,
        });

        if (!existingRecord) {
          // If the ActionID does not exist, create a new entry
          newEntries.push({
            RoleID,
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
      await FormAccess.bulkCreate(newEntries, { transaction: t });
    }

    await t.commit(); // Commit the transaction
    return res
      .status(200)
      .json({ message: "Action IDs processed successfully" });
  } catch (err) {
    await t.rollback(); // Rollback the transaction on error
    console.error("Error processing Action IDs:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.findAllAccess = async (req, res) => {
  try {
    const { RoleID } = req.query;

    // Fetch all roles data with included department data
    const rolesData = await RolesMaster.findAll({
      where: { RoleID },
      attributes: [
        "RoleID",
        "RoleName",
        "RoleCode",
        "DeptID",
        "WebAccess",
        "MobileAccess",
        "Status",
        "IsActive",
      ],
      include: [
        {
          model: DepartmentMaster,
          as: "RMDeptID",
          attributes: ["DeptID", "DeptCode", "DeptName"],
        },
      ],
      order: [["RoleName", "ASC"]], // Order by RoleName in ascending order
    });

    if (!rolesData || rolesData.length === 0) {
      return res.status(404).json({ message: "No roles data found." });
    }

    const rolesWithAccessRights = await Promise.all(
      rolesData.map(async (role) => {
        const accessRights = await FormAccess.findAll({
          where: { RoleID: role.RoleID },
          attributes: ["AccessID", "FormID", "ActionID", "ModuleID"],
          include: [
            {
              model: FormMaster,
              as: "FARFormID",
              attributes: ["FormID", "FormName", "FormCode", "FormInterface"],
            },
            {
              model: APIActionMaster,
              as: "FARActionID",
              attributes: ["ActionID", "ActionName"],
            },
            {
              model: ModuleMaster,
              as: "FARModuleID",
              attributes: ["ModuleID", "ModuleName"],
            },
          ],
        });

        // Organize data by Modules, Forms, and Actions
        const modules = {};
        accessRights.forEach((access) => {
          const accessId = access.AccessID;
          const moduleId = access.ModuleID;
          const moduleName = access.FARModuleID
            ? access.FARModuleID.ModuleName
            : null;
          const formId = access.FormID;
          const formName = access.FARFormID ? access.FARFormID.FormName : null;
          const formCode = access.FARFormID ? access.FARFormID.FormCode : null;
          const formInterface = access.FARFormID
            ? access.FARFormID.FormInterface
            : null;
          const actionId = access.ActionID;
          const actionName = access.FARActionID
            ? access.FARActionID.ActionName
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
            AccessID: accessId, // Map AccessID here
            ActionID: actionId,
            ActionName: actionName,
          });
        });

        // Convert nested object structure to arrays
        const modulesArray = Object.values(modules).map((module) => ({
          ModuleID: module.ModuleID,
          ModuleName: module.ModuleName,
          Forms: Object.values(module.Forms),
        }));

        return {
          RoleID: role.RoleID,
          RoleCode: role.RoleCode,
          RoleName: role.RoleName,
          DeptID: role.DeptID,
          DeptCode: role.RMDeptID ? role.RMDeptID.DeptCode : null,
          DeptName: role.RMDeptID ? role.RMDeptID.DeptName : null,
          WebAccess: role.WebAccess,
          MobileAccess: role.MobileAccess,
          Status: role.Status,
          IsActive: role.IsActive,
          Modules: modulesArray,
        };
      })
    );

    res.json(rolesWithAccessRights);
  } catch (error) {
    if (error.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message: "Database error occurred while retrieving roles data.",
        details: error.message,
      });
    }
    if (error.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }
    console.error("Error retrieving roles data:", error);
    return res.status(500).json({
      message: "Failed to retrieve roles data. Please try again later.",
    });
  }
};
