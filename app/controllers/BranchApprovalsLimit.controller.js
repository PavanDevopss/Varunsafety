/* eslint-disable no-unused-vars */
const db = require("../models");
const BranchApprovalsLimit = db.branchapprovalslimit;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;
const RegionMaster = db.regionmaster;
const BranchMaster = db.branchmaster;
const DepartmentMaster = db.departmentmaster;
const UserMaster = db.usermaster;
const Teams = db.teams;
const { generateLevelID } = require("../Utils/generateService");
//Basic CRUD API for BranchApprovalsLimit
exports.create = async (req, res) => {
  try {
    const level = await generateLevelID();
    // Create a BranchApprovalsLimit without specifying BranchApprovalsID
    const branchApprovalsLimit = {
      RegionID: req.body.RegionID,
      BranchID: req.body.BranchID,
      DeptID: req.body.DeptID,
      UserID: req.body.UserID,
      TeamID: req.body.TeamID,
      LevelID: level,
      ThresholdLimit: req.body.ThresholdLimit,
      IsActive: req.body.IsActive || true,
      Status: req.body.Status || "Active",
    };
    console.log("mapped data: ", BranchApprovalsLimit);

    // Save BranchApprovalsLimit in the database
    const newBranchApprovalsLimit = await BranchApprovalsLimit.create(
      branchApprovalsLimit
    );
    console.log("saved data: ", newBranchApprovalsLimit);

    return res.status(201).json(newBranchApprovalsLimit); // Send the newly created BranchApprovalsLimit as response
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

    console.error("Error creating BranchApprovalsLimit:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.bulkCreate = async (req, res) => {
  try {
    const { RegionID, BranchID, DeptID, TeamID, UserLimits } = req.body;

    // Validate that UserLimits is an array and not empty
    if (!Array.isArray(UserLimits) || UserLimits.length === 0) {
      return res
        .status(400)
        .json({ message: "UserLimits must be a non-empty array" });
    }

    // Create an array to hold the new BranchApprovalsLimit entries
    const branchApprovalsLimits = [];

    // Start from LEVEL0001 for the current combination
    let levelCount = 1;

    for (const userLimit of UserLimits) {
      // Generate LevelID based on levelCount
      const levelID = `LEVEL${levelCount.toString().padStart(4, "0")}`;

      // Create a new entry for each UserLimit
      branchApprovalsLimits.push({
        RegionID,
        BranchID,
        DeptID,
        TeamID,
        UserID: userLimit.UserID,
        LevelID: levelID,
        ThresholdLimit: userLimit.ThresholdLimit,
        IsActive: true,
        Status: req.body.Status || "Active",
      });

      // Increment levelCount for the next entry
      levelCount++;
    }

    console.log("Mapped data for bulk creation: ", branchApprovalsLimits);

    // Bulk create BranchApprovalsLimits in the database
    const newBranchApprovalsLimits = await BranchApprovalsLimit.bulkCreate(
      branchApprovalsLimits
    );

    console.log("Saved data: ", newBranchApprovalsLimits);

    return res.status(201).json(newBranchApprovalsLimits); // Send the newly created BranchApprovalsLimits as response
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

    console.error("Error creating BranchApprovalsLimit:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//Retrieve all stock from the database
exports.findAll = async (req, res) => {
  try {
    const branchApprovalsData = await BranchApprovalsLimit.findAll({
      attributes: [
        "BranchApprovalsLimitID",
        "RegionID",
        "BranchID",
        "DeptID",
        "UserID",
        "TeamID",
        "LevelID",
        "ThresholdLimit",
        "IsActive",
        "Status",
      ],
      include: [
        {
          model: RegionMaster,
          as: "BALRegionID",
          attributes: ["RegionName"],
        },
        {
          model: BranchMaster,
          as: "BALBranchID",
          attributes: ["BranchName", "BranchCode"],
        },
        {
          model: DepartmentMaster,
          as: "BALDeptID",
          attributes: ["DeptName", "DeptCode"],
        },
        {
          model: UserMaster,
          as: "BALUserID",
          attributes: ["UserName", "EmpID", "Designation"],
        },
        {
          model: Teams,
          as: "BALTeamID",
          attributes: ["TeamName"],
        },
      ],
      order: [["CreatedDate", "DESC"]], // Order by BranchApprovalsLimitID in ascending order
    });

    // Check if data is empty
    if (!branchApprovalsData || branchApprovalsData.length === 0) {
      return res.status(404).json({
        message: "No branch approvals data found.",
      });
    }

    // Map the data for response
    const mappedData = branchApprovalsData.map((item) => ({
      BranchApprovalsLimitID: item.BranchApprovalsLimitID,
      RegionID: item.RegionID,
      BranchID: item.BranchID,
      DeptID: item.DeptID,
      UserID: item.UserID,
      TeamID: item.TeamID,
      LevelID: item.LevelID,
      ThresholdLimit: item.ThresholdLimit,
      IsActive: item.IsActive,
      Status: item.Status,
      RegionName: item.BALRegionID ? item.BALRegionID.RegionName : null,
      BranchName: item.BALBranchID ? item.BALBranchID.BranchName : null,
      BranchCode: item.BALBranchID ? item.BALBranchID.BranchCode : null,
      DeptName: item.BALDeptID ? item.BALDeptID.DeptName : null,
      DeptCode: item.BALDeptID ? item.BALDeptID.DeptCode : null,
      UserName: item.BALUserID ? item.BALUserID.UserName : null,
      EmpID: item.BALUserID ? item.BALUserID.EmpID : null,
      Designation: item.BALUserID ? item.BALUserID.Designation : null,
      TeamName: item.BALTeamID ? item.BALTeamID.TeamName : null,
    }));

    // Send the mapped data as response
    res.json(mappedData);
  } catch (error) {
    // Handle errors
    console.error("Error retrieving branch approvals data:", error);
    res.status(500).json({
      message:
        "Failed to retrieve branch approvals data. Please try again later.",
      error: error.message,
    });
  }
};

// Find a single stock with an id
exports.findOne = async (req, res) => {
  try {
    const { id } = req.params; // Assume 'id' is passed as a URL parameter to find the specific record

    const branchApproval = await BranchApprovalsLimit.findOne({
      where: { BranchApprovalsLimitID: id },
      attributes: [
        "BranchApprovalsLimitID",
        "RegionID",
        "BranchID",
        "DeptID",
        "UserID",
        "TeamID",
        "LevelID",
        "ThresholdLimit",
        "IsActive",
        "Status",
      ],
      include: [
        {
          model: RegionMaster,
          as: "BALRegionID",
          attributes: ["RegionName"],
        },
        {
          model: BranchMaster,
          as: "BALBranchID",
          attributes: ["BranchName", "BranchCode"],
        },
        {
          model: DepartmentMaster,
          as: "BALDeptID",
          attributes: ["DeptName", "DeptCode"],
        },
        {
          model: UserMaster,
          as: "BALUserID",
          attributes: ["UserName", "EmpID", "Designation"],
        },
        {
          model: Teams,
          as: "BALTeamID",
          attributes: ["TeamName"],
        },
      ],
    });

    // Check if the record is found
    if (!branchApproval) {
      return res.status(404).json({
        message: "Branch approval data not found.",
      });
    }

    // Map the data for response
    const mappedData = {
      BranchApprovalsLimitID: branchApproval.BranchApprovalsLimitID,
      RegionID: branchApproval.RegionID,
      BranchID: branchApproval.BranchID,
      DeptID: branchApproval.DeptID,
      UserID: branchApproval.UserID,
      TeamID: branchApproval.TeamID,
      LevelID: branchApproval.LevelID,
      ThresholdLimit: branchApproval.ThresholdLimit,
      IsActive: branchApproval.IsActive,
      Status: branchApproval.Status,
      RegionName: branchApproval.BALRegionID
        ? branchApproval.BALRegionID.RegionName
        : null,
      BranchName: branchApproval.BALBranchID
        ? branchApproval.BALBranchID.BranchName
        : null,
      BranchCode: branchApproval.BALBranchID
        ? branchApproval.BALBranchID.BranchCode
        : null,
      DeptName: branchApproval.BALDeptID
        ? branchApproval.BALDeptID.DeptName
        : null,
      DeptCode: branchApproval.BALDeptID
        ? branchApproval.BALDeptID.DeptCode
        : null,
      UserName: branchApproval.BALUserID
        ? branchApproval.BALUserID.UserName
        : null,
      EmpID: branchApproval.BALUserID ? branchApproval.BALUserID.EmpID : null,
      Designation: branchApproval.BALUserID
        ? branchApproval.BALUserID.Designation
        : null,
      TeamName: branchApproval.BALTeamID
        ? branchApproval.BALTeamID.TeamName
        : null,
    };

    // Send the mapped data as response
    res.json(mappedData);
  } catch (error) {
    // Handle errors
    console.error("Error retrieving branch approval data:", error);
    res.status(500).json({
      message:
        "Failed to retrieve branch approval data. Please try again later.",
      error: error.message,
    });
  }
};

// Update a BranchMaster by the id in the request
exports.updateByPk = async (req, res) => {
  try {
    // Find the bank by ID
    const branchapprovalsId = req.params.id;

    // Validate the ID parameter
    if (!branchapprovalsId) {
      return res.status(400).json({ message: "ID parameter is required." });
    }

    let branchApprovalsLimit = await BranchApprovalsLimit.findByPk(
      branchapprovalsId
    );

    if (!BranchApprovalsLimit) {
      return res
        .status(404)
        .json({ message: "BranchApprovalsLimit not found" });
    }

    // Update fields
    branchApprovalsLimit.RegionID =
      req.body.RegionID || branchApprovalsLimit.RegionID;
    branchApprovalsLimit.BranchID =
      req.body.BranchID || branchApprovalsLimit.BranchID;
    branchApprovalsLimit.DeptID =
      req.body.DeptID || branchApprovalsLimit.DeptID;
    branchApprovalsLimit.UserID =
      req.body.UserID || branchApprovalsLimit.UserID;
    branchApprovalsLimit.TeamID =
      req.body.TeamID || branchApprovalsLimit.TeamID;
    branchApprovalsLimit.LevelID =
      req.body.LevelID || branchApprovalsLimit.LevelID;
    branchApprovalsLimit.ThresholdLimit =
      req.body.ThresholdLimit || branchApprovalsLimit.ThresholdLimit;
    branchApprovalsLimit.IsActive =
      req.body.IsActive !== undefined
        ? req.body.IsActive
        : branchApprovalsLimit.IsActive;
    branchApprovalsLimit.Status =
      req.body.Status || branchApprovalsLimit.Status;
    branchApprovalsLimit.ModifiedDate = new Date();

    // Save updated BranchApprovalsLimit in the database
    const updatedBranchApprovalsLimit = await branchApprovalsLimit.save();

    return res.status(200).json(updatedBranchApprovalsLimit); // Send the updated BranchApprovalsLimit as response
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
        message: "Database error occurred while updating BranchApprovalsLimit.",
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
    console.error("Error updating BranchApprovalsLimit:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a BranchMaster with the specified id in the request
exports.deleteById = async (req, res) => {
  const id = req.params.id;

  try {
    // Validate the ID parameter
    if (!id) {
      return res.status(400).json({ message: "ID parameter is required." });
    }

    // Find the model by ID
    const branchApprovalsLimit = await BranchApprovalsLimit.findByPk(id);

    // Check if the model exists
    if (!branchApprovalsLimit) {
      return res
        .status(404)
        .json({ message: "BranchApprovalsLimit not found with id: " + id });
    }

    // Delete the model
    await branchApprovalsLimit.destroy();

    // Send a success message
    res.status(200).json({
      message: "BranchApprovalsLimit with id: " + id + " deleted successfully",
    });
  } catch (err) {
    // Handle errors based on specific types
    if (err.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while deleting BranchApprovalsLimit.",
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
    console.error("Error deleting BranchApprovalsLimit:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Controller to handle bulk create and update
// exports.bulkCreateinExisiting = async (req, res) => {
//   try {
//     const { BranchApprovalsLimitID, UserLimits } = req.body;

//     // Validate input
//     if (!Array.isArray(UserLimits) || UserLimits.length === 0) {
//       return res
//         .status(400)
//         .json({ message: "UserLimits must be a non-empty array" });
//     }

//     // Fetch the existing record to get RegionID, BranchID, DeptID, TeamID
//     const existingRecord = await BranchApprovalsLimit.findOne({
//       where: { BranchApprovalsLimitID },
//     });

//     if (!existingRecord) {
//       return res
//         .status(404)
//         .json({ message: "BranchApprovalsLimitID not found" });
//     }

//     const { RegionID, BranchID, DeptID, TeamID } = existingRecord;

//     const createdRecords = [];
//     const updatedRecords = [];
//     let levelCount = 1;

//     // Process UserLimits
//     for (const userLimit of UserLimits) {
//       if (userLimit.BranchApprovalsLimitID) {
//         // Update existing record
//         const existingRecord = await BranchApprovalsLimit.findOne({
//           where: { BranchApprovalsLimitID: userLimit.BranchApprovalsLimitID },
//         });

//         if (existingRecord) {
//           await existingRecord.update({
//             UserID: userLimit.UserID,
//             ThresholdLimit: userLimit.ThresholdLimit,
//             ModifiedDate: new Date(),
//           });

//           updatedRecords.push({
//             BranchApprovalsLimitID: userLimit.BranchApprovalsLimitID,
//             UserID: existingRecord.UserID,
//             ThresholdLimit: userLimit.ThresholdLimit,
//             ModifiedDate: new Date(),
//           });
//         }
//       } else {
//         // Create new record if BranchApprovalsLimitID is null
//         const levelID = `LEVEL${levelCount.toString().padStart(4, "0")}`;
//         const newRecord = await BranchApprovalsLimit.create({
//           RegionID,
//           BranchID,
//           DeptID,
//           TeamID,
//           UserID: userLimit.UserID,
//           LevelID: levelID,
//           ThresholdLimit: userLimit.ThresholdLimit,
//           IsActive: true,
//           Status: "Active",
//           CreatedDate: new Date(),
//         });

//         createdRecords.push(newRecord.toJSON());
//         levelCount++;
//       }
//     }

//     // Return success response with created and updated records
//     return res.status(200).json({
//       message: "Bulk create and update completed successfully.",
//       createdRecords,
//       updatedRecords,
//     });
//   } catch (err) {
//     // Handle Sequelize validation errors
//     if (err.name === "SequelizeValidationError") {
//       return res.status(400).json({
//         message: "Validation error",
//         details: err.errors.map((e) => e.message),
//       });
//     }

//     // Handle unique constraint errors
//     if (err.name === "SequelizeUniqueConstraintError") {
//       return res.status(400).json({
//         message: "Unique constraint error",
//         details: err.errors.map((e) => e.message),
//       });
//     }

//     // Log and return internal server errors
//     console.error(
//       "Error in bulk create or update for BranchApprovalsLimit:",
//       err
//     );
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };

exports.bulkCreateinExisiting = async (req, res) => {
  try {
    const { BranchApprovalsLimitID, UserLimits } = req.body;

    // Validate input
    if (!Array.isArray(UserLimits) || UserLimits.length === 0) {
      return res
        .status(400)
        .json({ message: "UserLimits must be a non-empty array" });
    }

    // Fetch the existing record to get RegionID, BranchID, DeptID, TeamID
    const existingRecord = await BranchApprovalsLimit.findOne({
      where: { BranchApprovalsLimitID },
    });

    if (!existingRecord) {
      return res
        .status(404)
        .json({ message: "BranchApprovalsLimitID not found" });
    }

    const { RegionID, BranchID, DeptID, TeamID } = existingRecord;

    const createdRecords = [];
    const updatedRecords = [];
    let levelCount = 1;

    // Process UserLimits
    for (const userLimit of UserLimits) {
      if (userLimit.BranchApprovalsLimitID) {
        // Update existing record (no uniqueness check for UserID during update)
        const existingRecord = await BranchApprovalsLimit.findOne({
          where: { BranchApprovalsLimitID: userLimit.BranchApprovalsLimitID },
        });

        if (existingRecord) {
          await existingRecord.update({
            UserID: userLimit.UserID,
            ThresholdLimit: userLimit.ThresholdLimit,
            ModifiedDate: new Date(),
          });

          updatedRecords.push({
            BranchApprovalsLimitID: userLimit.BranchApprovalsLimitID,
            UserID: existingRecord.UserID,
            ThresholdLimit: userLimit.ThresholdLimit,
            ModifiedDate: new Date(),
          });
        }
      } else {
        // Check if the UserID already exists for the given combination before creating a new record
        const existingUserForCombination = await BranchApprovalsLimit.findOne({
          where: {
            RegionID,
            BranchID,
            DeptID,
            TeamID,
            UserID: userLimit.UserID, // Check for uniqueness of UserID within the combination
          },
        });

        if (existingUserForCombination) {
          return res.status(400).json({
            message: `UserID ${userLimit.UserID} already exists for the given Region, Branch, Dept, and Team combination.`,
          });
        }

        // Create new record if BranchApprovalsLimitID is null
        const levelID = `LEVEL${levelCount.toString().padStart(4, "0")}`;
        const newRecord = await BranchApprovalsLimit.create({
          RegionID,
          BranchID,
          DeptID,
          TeamID,
          UserID: userLimit.UserID,
          LevelID: levelID,
          ThresholdLimit: userLimit.ThresholdLimit,
          IsActive: true,
          Status: "Active",
          CreatedDate: new Date(),
        });

        createdRecords.push(newRecord.toJSON());
        levelCount++;
      }
    }

    // Return success response with created and updated records
    return res.status(200).json({
      message: "Bulk create and update completed successfully.",
      createdRecords,
      updatedRecords,
    });
  } catch (err) {
    // Handle Sequelize validation errors
    if (err.name === "SequelizeValidationError") {
      return res.status(400).json({
        message: "Validation error",
        details: err.errors.map((e) => e.message),
      });
    }

    // Handle unique constraint errors
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        message: "Unique constraint error",
        details: err.errors.map((e) => e.message),
      });
    }

    // Log and return internal server errors
    console.error(
      "Error in bulk create or update for BranchApprovalsLimit:",
      err
    );
    return res.status(500).json({ message: "Internal server error" });
  }
};
