/* eslint-disable no-dupe-keys */
/* eslint-disable no-unused-vars */
require("dotenv").config();
const db = require("../models");
const TeamMembersModel = require("../models/TeamMembers.model");
const Teams = db.teams;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;
const BranchMaster = db.branchmaster;
const DepartmentMaster = db.departmentmaster;
const UserMaster = db.usermaster;
const TeamMembers = db.teammembers;

// Basic CRUD API
// Create and Save a new Team
exports.create = async (req, res) => {
  console.log("TeamName Name:", req.body.TeamName);

  try {
    // Validate request
    if (!req.body.TeamName) {
      return res.status(400).json({ message: "TeamName cannot be empty" });
    }
    if (!/^[a-zA-Z ]*$/.test(req.body.TeamName)) {
      console.log("Validation failed: TeamName contains special characters.");
      return res.status(400).json({
        message: "TeamName should contain only letters",
      });
    }
    // Check if SubModule already exists
    const existingModel = await Teams.findOne({
      where: { TeamName: req.body.TeamName },
    });
    if (existingModel) {
      return res.status(400).json({ message: "TeamName already exists" });
    }

    // Create a SubModule
    const team = {
      TeamName: req.body.TeamName,
      LeaderName: req.body.LeaderName,
      BranchID: req.body.BranchID,
      DeptID: req.body.DeptID,
      TeamLeadID: req.body.TeamLeadID,
      IsActive: req.body.IsActive || true,
      Status: req.body.Status || "Active",
    };

    // Save team in the database
    const newTeam = await Teams.create(team);

    return res.status(201).json(newTeam); // Send the newly created team as response
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

    console.error("Error creating team:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
// Retrieve all team from the database.
exports.findAll = async (req, res) => {
  try {
    // Fetch all Teams data with included related data
    const teamData = await Teams.findAll({
      attributes: ["TeamID", "TeamName", "LeaderName", "IsActive", "Status"],
      include: [
        {
          model: BranchMaster,
          as: "TBranchID",
          attributes: ["BranchID", "BranchCode", "BranchName"],
        },
        {
          model: DepartmentMaster,
          as: "TDeptID",
          attributes: ["DeptID", "DeptCode", "DeptName"],
        },
        {
          model: UserMaster,
          as: "TTeamLeadID",
          attributes: ["UserID", "UserName", "EmpID"],
        },
      ],
      order: [["CreatedDate", "DESC"]], // Order by CreatedDate in descending order
    });

    // Check if team data is empty
    if (!teamData || teamData.length === 0) {
      return res.status(404).json({
        message: "No team data found.",
      });
    }

    // Fetch all team members in one query
    const teamMembers = await TeamMembers.findAll({
      where: { TeamID: teamData.map((team) => team.TeamID) }, // Get all team members for the fetched teams
    });

    // Count members for each team
    const teamCount = teamMembers.reduce((acc, member) => {
      acc[member.TeamID] = (acc[member.TeamID] || 0) + 1;
      return acc;
    }, {});

    // Map the data for response
    const combinedData = teamData.map((item) => ({
      TeamID: item.TeamID,
      TeamName: item.TeamName,
      LeaderName: item.LeaderName,
      BranchID: item.TBranchID ? item.TBranchID.BranchID : null,
      BranchCode: item.TBranchID ? item.TBranchID.BranchCode : null,
      BranchName: item.TBranchID ? item.TBranchID.BranchName : null,
      DeptID: item.TDeptID ? item.TDeptID.DeptID : null,
      DeptCode: item.TDeptID ? item.TDeptID.DeptCode : null,
      DeptName: item.TDeptID ? item.TDeptID.DeptName : null,
      UserID: item.TTeamLeadID ? item.TTeamLeadID.UserID : null,
      UserName: item.TTeamLeadID ? item.TTeamLeadID.UserName : null,
      EmpID: item.TTeamLeadID ? item.TTeamLeadID.EmpID : null,
      IsActive: item.IsActive,
      Status: item.Status,
      TeamCount: teamCount[item.TeamID] || 0, // Add member count
    }));

    // Send the combined data as response
    res.json(combinedData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message: "Database error occurred while retrieving team data.",
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
    console.error("Error retrieving team data:", error);
    return res.status(500).json({
      message: "Failed to retrieve team data. Please try again later.",
    });
  }
};

exports.findOne = async (req, res) => {
  try {
    const { TeamID } = req.params; // Extract TeamID from request parameters

    // Fetch the specific Team data with included related data
    const teamData = await Teams.findOne({
      where: { TeamID: TeamID }, // Find the team by TeamID
      attributes: ["TeamID", "TeamName", "LeaderName", "IsActive", "Status"],
      include: [
        {
          model: BranchMaster,
          as: "TBranchID",
          attributes: ["BranchID", "BranchCode", "BranchName"],
        },
        {
          model: DepartmentMaster,
          as: "TDeptID",
          attributes: ["DeptID", "DeptCode", "DeptName"],
        },
        {
          model: UserMaster,
          as: "TTeamLeadID",
          attributes: ["UserID", "UserName", "EmpID"],
        },
      ],
    });

    // Check if the team data is found
    if (!teamData) {
      return res.status(404).json({
        message: "Team not found.",
      });
    }

    // Fetch team members for the found team
    const teamMembers = await TeamMembers.findAll({
      attributes: ["TeamID", "UserID"],
      include: [
        {
          model: UserMaster,
          as: "TMUserID",
          attributes: ["UserName", "EmpID"],
        },
      ],
      where: { TeamID: teamData.TeamID }, // Fetch team members for the specific team
    });

    const teammemberscombinedData = teamMembers.map((item) => ({
      TeamID: item.TeamID,
      UserID: item.UserID,
      UserName: item.TMUserID ? item.TMUserID.UserName : null,
      EmpID: item.TMUserID ? item.TMUserID.EmpID : null,
    }));

    // Combine the team data with team members
    const combinedData = {
      TeamID: teamData.TeamID,
      TeamName: teamData.TeamName,
      LeaderName: teamData.LeaderName,
      BranchID: teamData.TBranchID ? teamData.TBranchID.BranchID : null,
      BranchCode: teamData.TBranchID ? teamData.TBranchID.BranchCode : null,
      BranchName: teamData.TBranchID ? teamData.TBranchID.BranchName : null,
      DeptID: teamData.TDeptID ? teamData.TDeptID.DeptID : null,
      DeptCode: teamData.TDeptID ? teamData.TDeptID.DeptCode : null,
      DeptName: teamData.TDeptID ? teamData.TDeptID.DeptName : null,
      UserID: teamData.TTeamLeadID ? teamData.TTeamLeadID.UserID : null,
      UserName: teamData.TTeamLeadID ? teamData.TTeamLeadID.UserName : null,
      EmpID: teamData.TTeamLeadID ? teamData.TTeamLeadID.EmpID : null,
      IsActive: teamData.IsActive,
      Status: teamData.Status,
      TeamMembers: teammemberscombinedData, // Include team members
    };

    // Send the combined data as response
    res.json(combinedData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message: "Database error occurred while retrieving team data.",
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
    console.error("Error retrieving team data:", error);
    return res.status(500).json({
      message: "Failed to retrieve team data. Please try again later.",
    });
  }
};

exports.updateByPk = async (req, res) => {
  try {
    // Get TeamID from request parameters
    const { id } = req.params;

    // Extract fields to update from request body
    const { TeamName, LeaderName, BranchID, DeptID, UserID, IsActive, Status } =
      req.body;

    // Find the team record by TeamID
    const team = await Teams.findOne({
      where: { TeamID: id },
      include: [
        {
          model: BranchMaster,
          as: "TBranchID",
        },
        {
          model: DepartmentMaster,
          as: "TDeptID",
        },
        {
          model: UserMaster,
          as: "TTeamLeadID",
        },
      ],
    });

    // If no team found, return 404
    if (!team) {
      return res.status(404).json({
        message: `Team not found with ID ${id}.`,
      });
    }

    // Perform the update
    const updatedTeam = await team.update({
      TeamName: TeamName || team.TeamName,
      LeaderName: LeaderName || team.LeaderName,
      TBranchID: BranchID || team.TBranchID, // Update BranchID if provided
      TDeptID: DeptID || team.TDeptID, // Update DeptID if provided
      TTeamLeadID: UserID || team.TTeamLeadID, // Update TeamLeadID if provided
      IsActive: IsActive !== undefined ? IsActive : team.IsActive, // Ensure IsActive is updated even if it's a boolean
      Status: Status || team.Status,
    });

    // Send the updated team data as response
    res.json({
      message: "Team updated successfully.",
      data: {
        TeamID: updatedTeam.TeamID,
        TeamName: updatedTeam.TeamName,
        LeaderName: updatedTeam.LeaderName,
        BranchID: updatedTeam.TBranchID ? updatedTeam.TBranchID.BranchID : null,
        DeptID: updatedTeam.TDeptID ? updatedTeam.TDeptID.DeptID : null,
        UserID: updatedTeam.TTeamLeadID ? updatedTeam.TTeamLeadID.UserID : null,
        IsActive: updatedTeam.IsActive,
        Status: updatedTeam.Status,
      },
    });
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while updating team data.",
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
    console.error("Error updating team data:", error);
    return res.status(500).json({
      message: "Failed to update team data. Please try again later.",
    });
  }
};

// Delete a Team with the specified id in the request
exports.deleteById = async (req, res) => {
  const id = req.params.id;

  try {
    // Validate the ID parameter
    if (!id) {
      return res.status(400).json({ message: "ID parameter is required." });
    }

    // Find the model by ID
    const team = await Teams.findByPk(id);

    // Check if the model exists
    if (!team) {
      return res.status(404).json({ message: "Team not found with id: " + id });
    }

    // Delete the model
    await team.destroy();

    // Send a success message
    res.status(200).json({
      message: "Team with id: " + id + " deleted successfully",
    });
  } catch (err) {
    // Handle errors based on specific types
    if (err.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while deleting Team.",
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
    console.error("Error deleting Team:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
