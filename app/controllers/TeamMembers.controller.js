/* eslint-disable no-dupe-keys */
/* eslint-disable no-unused-vars */
require("dotenv").config();
const db = require("../models");
const TeamMembers = db.teammembers;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;
const Teams = db.teams;
const UserMaster = db.usermaster;
const RoleMaster = db.rolesmaster;
const BranchMaster = db.branchmaster;
const DepartmentMaster = db.departmentmaster;

// Basic CRUD API
// Create and Save a new Team
exports.create = async (req, res) => {
  console.log("TeamID:", req.body.TeamID);

  try {
    // Validate request
    if (!req.body.TeamID) {
      return res.status(400).json({ message: "TeamID cannot be empty" });
    }
    // Check if the TeamID already exists in the Teams table
    const existingTeam = await Teams.findOne({
      where: { TeamID: req.body.TeamID },
    });

    if (!existingTeam) {
      return res.status(404).json({
        message: `Team with ID ${req.body.TeamID} does not exist. Please create the team first.`,
      });
    }

    // Create a TeamMember for the existing TeamID
    const teamMember = {
      TeamID: req.body.TeamID,
      UserID: req.body.UserID,
      EmpName: req.body.EmpName || null,
      EmpPosition: req.body.EmpPosition || null,
      IsActive: req.body.IsActive !== undefined ? req.body.IsActive : true,
      Status: req.body.Status || "Active",
    };

    // Save team member in the database
    const newTeamMember = await TeamMembers.create(teamMember);

    return res.status(201).json(newTeamMember); // Send the newly created team member as response
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

    console.error("Error creating team member:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Retrieve all team from the database.
exports.findAll = async (req, res) => {
  try {
    // Fetch all TeamMember data with included Teams and UserMaster data
    const teamData = await TeamMembers.findAll({
      attributes: [
        "TeamMemberID",
        "TeamID",
        "UserID",
        "EmpName",
        "EmpPosition",
        "IsActive",
        "Status",
      ],
      include: [
        {
          model: Teams,
          as: "TMTeamID",
          attributes: [
            "TeamName",
            "LeaderName",
            "BranchID",
            "DeptID",
            "TeamLeadID",
          ],
        },
        {
          model: UserMaster,
          as: "TMUserID",
          attributes: ["UserName", "EmpID", "RoleID"],
        },
      ],
      order: [["CreatedDate", "DESC"]],
    });

    // Check if data is empty
    if (!teamData || teamData.length === 0) {
      return res.status(404).json({
        message: "No team member data found.",
      });
    }

    // Map the data for response
    const combinedData = teamData.map((item) => ({
      TeamMemberID: item.TeamMemberID,
      TeamID: item.TeamID,
      TeamName: item.TMTeamID ? item.TMTeamID.TeamName : null,
      LeaderName: item.TMTeamID ? item.TMTeamID.LeaderName : null,
      BranchID: item.TMTeamID ? item.TMTeamID.BranchID : null,
      DeptID: item.TMTeamID ? item.TMTeamID.DeptID : null,
      TeamLeadID: item.TMTeamID ? item.TMTeamID.TeamLeadID : null,
      UserID: item.UserID,
      EmpName: item.EmpName,
      EmpPosition: item.EmpPosition,
      UserName: item.TMUserID ? item.TMUserID.UserName : null,
      EmpID: item.TMUserID ? item.TMUserID.EmpID : null,
      RoleID: item.TMUserID ? item.TMUserID.RoleID : null,
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
        message: "Database error occurred while retrieving team member data.",
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
    console.error("Error retrieving team member data:", error);
    return res.status(500).json({
      message: "Failed to retrieve team member data. Please try again later.",
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
          attributes: ["UserID", "UserName", "EmpID", "RoleID"],
        },
      ],
    });
    // Check if the team data is found
    if (!teamData) {
      return res.status(404).json({
        message: "Team not found.",
      });
    }
    // Fetch RoleName from RoleMaster using the RoleID
    const roleData = await RoleMaster.findOne({
      where: { RoleID: teamData.TTeamLeadID?.RoleID },
      attributes: ["RoleID", "RoleName"],
    });
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
    // Combine the team data with team members and role data
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
      RoleID: teamData.TTeamLeadID ? teamData.TTeamLeadID.RoleID : null,
      RoleName: roleData ? roleData.RoleName : null, // Add RoleName here
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
    // Validate request

    // Find the team member by ID
    const teamMemberID = req.params.TeamMemberID;

    // Validate the ID parameter
    if (!teamMemberID) {
      return res.status(400).json({ message: "ID parameter is required." });
    }

    let teamMember = await TeamMembers.findByPk(teamMemberID);

    if (!teamMember) {
      return res.status(404).json({ message: "teamMember not found" });
    }

    // Update fields
    teamMember.TeamID = req.body.TeamID || teamMember.TeamID;
    teamMember.UserID = req.body.UserID || teamMember.UserID;
    teamMember.EmpName = req.body.EmpName || teamMember.EmpName;
    teamMember.EmpPosition = req.body.EmpPosition || teamMember.EmpPosition;
    teamMember.IsActive = req.body.IsActive || teamMember.IsActive;
    teamMember.Status = req.body.Status || teamMember.Status;
    teamMember.ModifiedDate = new Date();

    // Save updated teamMember in the database
    const updatedTeamMember = await teamMember.save();

    return res.status(200).json(updatedTeamMember); // Send the updated teamMember as response
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
        message: "Database error occurred while updating teamMember.",
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
    console.error("Error updating teamMember:", err);
    return res.status(500).json({ message: "Internal server error" });
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

    // Find the teamMember by ID
    const teamMember = await TeamMembers.findByPk(id);

    // Check if the model exists
    if (!teamMember) {
      return res
        .status(404)
        .json({ message: "Team Member not found with id: " + id });
    }

    // Delete the model
    await teamMember.destroy();

    // Send a success message
    res.status(200).json({
      message: "Team Member with id: " + id + " deleted successfully",
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
    console.error("Error deleting Team Member:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
