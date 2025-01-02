/* eslint-disable no-unused-vars */
const db = require("../models");
const ClusterMaster = db.clustermaster;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;
const BranchMaster = db.branchmaster;

// Basic CRUD API
// Create and Save a new ClusterMaster

exports.create = async (req, res) => {
  console.log("ClusterName:", req.body.ClusterName);

  try {
    // Validate request
    if (!req.body.ClusterName) {
      return res.status(400).json({ message: "ClusterName cannot be empty" });
    }
    if (!/^[a-zA-Z ]*$/.test(req.body.ClusterName)) {
      console.log(
        "Validation failed: ClusterName contains special characters."
      );
      return res.status(400).json({
        message: "ClusterName should contain only letters",
      });
    }
    // Check if ClusterName already exists
    const existingCluster = await ClusterMaster.findOne({
      where: { ClusterName: req.body.ClusterName },
    });
    if (existingCluster) {
      return res.status(400).json({ message: "ClusterName already exists" });
    }

    // Create a ClusterMaster
    const clusterMaster = {
      ClusterName: req.body.ClusterName,
      ClusterType: req.body.ClusterType,
      BranchID: req.body.BranchID,
      IsActive: req.body.IsActive || true,
      Status: req.body.Status || "Active",
    };

    // Save ClusterMaster in the database
    const newClusterMaster = await ClusterMaster.create(clusterMaster);

    console.log("New ClusterMaster created:", newClusterMaster);

    return res.status(201).json(newClusterMaster); // Send the newly created ClusterMaster as response
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

    console.error("Error creating ClusterMaster:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Retrieve all OEMMasters from the database.
exports.findAll = async (req, res) => {
  try {
    // Fetch all cluster data with included branch data
    const clusterData = await ClusterMaster.findAll({
      attributes: [
        "ClusterID",
        "ClusterName",
        "ClusterType",
        "IsActive",
        "Status",
      ],
      include: [
        {
          model: BranchMaster,
          as: "CMBranchID",
          attributes: ["BranchID", "BranchName"], // Include BranchID and BranchName attributes
        },
      ],
      order: [
        ["ClusterName", "ASC"], // Order by ModelDescription in ascending order
      ],
    });

    // Check if data is empty
    if (!clusterData || clusterData.length === 0) {
      return res.status(404).json({
        message: "No cluster data found.",
      });
    }

    // Map the data for response
    const combinedData = clusterData.map((item) => ({
      ClusterID: item.ClusterID,
      ClusterName: item.ClusterName,
      ClusterType: item.ClusterType,
      BranchID: item.CMBranchID ? item.CMBranchID.BranchID : null, // Access BranchID from the branch association
      BranchName: item.CMBranchID ? item.CMBranchID.BranchName : null, // Access BranchName from the branch association
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
        message: "Database error occurred while retrieving cluster name data.",
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
    // Handle errors
    console.error("Error retrieving cluster data:", error);
    res.status(500).json({
      message: "Failed to retrieve cluster data. Please try again later.",
    });
  }
};

// Find a single OEMMaster with an id
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;

    // Fetch the cluster data by primary key with included branch data
    const clusterData = await ClusterMaster.findOne({
      where: {
        ClusterID: id, // Use ClusterID for fetching specific cluster
      },
      attributes: [
        "ClusterID",
        "ClusterName",
        "ClusterType",
        "IsActive",
        "Status",
      ], // Updated attributes
      include: [
        {
          model: BranchMaster, // Include BranchMaster model
          as: "CMBranchID",
          attributes: ["BranchID", "BranchName"], // Include BranchID and BranchName attributes
        },
      ],
    });

    // Check if data is found
    if (!clusterData) {
      return res.status(404).json({
        message: "Cluster data not found.",
      });
    }

    // Prepare the response data
    const responseData = {
      ClusterID: clusterData.ClusterID,
      ClusterName: clusterData.ClusterName,
      ClusterType: clusterData.ClusterType,
      BranchID: clusterData.CMBranchID ? clusterData.CMBranchID.BranchID : null, // Access BranchID from the branchMaster association
      BranchName: clusterData.CMBranchID
        ? clusterData.CMBranchID.BranchName
        : null, // Access BranchName from the branchMaster association
      IsActive: clusterData.IsActive,
      Status: clusterData.Status,
    };

    // Send the response data
    res.json(responseData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while retrieving cluster data.",
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
    // Handle errors
    console.error("Error retrieving cluster data:", error);
    res.status(500).json({
      message: "Failed to retrieve cluster data. Please try again later.",
    });
  }
};

// Update a OEMMaster by the id in the request
exports.updateByPk = async (req, res) => {
  console.log("ClusterName:", req.body.ClusterName);

  try {
    // Validate request
    if (!req.body.ClusterName) {
      return res.status(400).json({ message: "ClusterName cannot be empty" });
    }
    if (!/^[a-zA-Z ]*$/.test(req.body.ClusterName)) {
      console.log(
        "Validation failed: ClusterName contains special characters."
      );
      return res.status(400).json({
        message: "ClusterName should contain only letters",
      });
    }
    // Find the ClusterMaster by ID
    const clusterID = req.params.id;
    let clusterMaster = await ClusterMaster.findByPk(clusterID);

    if (!clusterMaster) {
      return res.status(404).json({ message: "ClusterMaster not found" });
    }

    // Update fields
    clusterMaster.ClusterName = req.body.ClusterName;
    clusterMaster.ClusterType =
      req.body.ClusterType || clusterMaster.ClusterType;
    clusterMaster.BranchID = req.body.BranchID || clusterMaster.BranchID; // BranchID as a foreign key
    clusterMaster.IsActive = req.body.IsActive || clusterMaster.IsActive;
    clusterMaster.Status = req.body.Status || clusterMaster.Status;
    clusterMaster.ModifiedDate = new Date();

    // Save updated ClusterMaster in the database
    const updatedClusterMaster = await clusterMaster.save();

    return res.status(200).json(updatedClusterMaster); // Send the updated ClusterMaster as response
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
        message: "Database error occurred while updating ClusterMaster.",
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

    console.error("Error updating ClusterMaster:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a OEMMaster with the specified id in the request
exports.deleteById = async (req, res) => {
  const id = req.params.id;

  try {
    // Find the model by ID
    const clusterMaster = await ClusterMaster.findByPk(id);

    // Check if the model exists
    if (!clusterMaster) {
      return res
        .status(404)
        .json({ message: "ClusterMaster not found with id: " + id });
    }

    // Delete the model
    await clusterMaster.destroy();

    // Send a success message
    res.status(200).json({
      message: "ClusterMaster with id: " + id + " deleted successfully",
    });
  } catch (err) {
    // Handle errors based on specific types
    if (err.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while deleting ClusterMaster.",
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
    console.error("Error deleting ClusterMaster:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
