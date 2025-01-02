/* eslint-disable no-unused-vars */
const db = require("../models");
const AccPartsMap = db.accpartmap;
const AccCart = db.acccart;
const AccIssueReq = db.accissuereq;
const AccReturnReq = db.accreturnreq;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;

// Basic CRUD API

// Create and Save a new AccPartsMap
exports.create = async (req, res) => {
  try {
    // Create a model
    const accPartsMap = {
      AccCartID: req.body.AccCartID,
      AccIssueID: req.body.AccIssueID,
      IssueDate: req.body.IssueDate,
      AccReturnID: req.body.AccReturnID,
      ReturnDate: req.body.ReturnDate,
      ReqQty: req.body.ReqQty,
      IssueQty: req.body.IssueQty,
      FittedQty: req.body.FittedQty,
      RetunQty: req.body.RetunQty,
      IssuedStatus: req.body.IssuedStatus,
      FitmentStatus: req.body.FitmentStatus,
      ReturnStatus: req.body.ReturnStatus,
      IsActive: req.body.IsActive !== undefined ? req.body.IsActive : true,
      Status: req.body.Status || "Active",
    };

    // Save AccPartsMap in the database
    const newAccPartsMap = await AccPartsMap.create(accPartsMap);

    return res.status(201).json(newAccPartsMap); // Send the newly created AccPartsMap as response
  } catch (err) {
    // Handle errors based on specific types
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

    if (err.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message: "Database error occurred while creating AccPartsMap.",
        details: err.message,
      });
    }

    if (err.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: err.message,
      });
    }

    console.error("Error creating AccPartsMap:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
// Retrieve all AccPartsMaps from the database.
exports.findAll = async (req, res) => {
  try {
    // Fetch AccPartsMaps with associated AccIssueReq and AccReturnReq
    const accPartsMap = await AccPartsMap.findAll({
      attributes: [
        "AccPartMapID",
        "AccCartID",
        "AccIssueID",
        "IssueDate",
        "AccReturnID",
        "ReturnDate",
        "ReqQty",
        "IssueQty",
        "FittedQty",
        "RetunQty",
        "IssuedStatus",
        "FitmentStatus",
        "ReturnStatus",
        "IsActive",
        "Status",
        "CreatedDate",
        "ModifiedDate",
      ],
      include: [
        {
          model: AccIssueReq,
          as: "APMAccIssueID", // Alias must match the one defined in associations
          attributes: ["IssueNo", "IssueDate"],
        },
        {
          model: AccReturnReq,
          as: "APMAccReturnID", // Alias must match the one defined in associations
          attributes: ["ReturnNo", "ReturnDate"],
        },
      ],
      order: [["CreatedDate", "DESC"]], // Order by CreatedDate in descending order
    });

    if (accPartsMap.length === 0) {
      return res.status(404).json({ message: "No AccPartsMap found" });
    }

    res.status(200).json(accPartsMap);
  } catch (error) {
    // Handle Sequelize errors
    if (error.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message: "Database error occurred while retrieving AccPartsMap.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    console.error("Error fetching AccPartsMap:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Find a single AccPartsMap with an id
exports.findOne = async (req, res) => {
  const { id } = req.params; // Assuming the ID is passed as a URL parameter

  try {
    // Fetch the specific AccPartsMap
    const accPartsMap = await AccPartsMap.findOne({
      where: { AccPartMapID: id },
      attributes: [
        "AccPartMapID",
        "AccCartID",
        "AccIssueID",
        "IssueDate",
        "AccReturnID",
        "ReturnDate",
        "ReqQty",
        "IssueQty",
        "FittedQty",
        "RetunQty",
        "IssuedStatus",
        "FitmentStatus",
        "ReturnStatus",
        "IsActive",
        "Status",
        "CreatedDate",
        "ModifiedDate",
      ],
      include: [
        {
          model: AccIssueReq,
          as: "APMAccIssueID", // Alias must match the one defined in associations
          attributes: ["IssueNo", "IssueDate"],
        },
        {
          model: AccReturnReq,
          as: "APMAccReturnID", // Alias must match the one defined in associations
          attributes: ["ReturnNo", "ReturnDate"],
        },
      ],
      order: [["CreatedDate", "DESC"]], // Order by CreatedDate in descending order
    });

    if (accPartsMap.length === 0) {
      return res.status(404).json({ message: "No AccPartsMap found" });
    }

    res.status(200).json(accPartsMap);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while retrieving the acc parts map.",
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

    console.error("Error fetching the acc parts map:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Update a AccPartsMap by the id in the request
// Update an existing AccPartsMap by ID
exports.update = async (req, res) => {
  const { id } = req.params; // Assuming the ID is passed as a URL parameter

  try {
    // Fetch the existing AccPartsMap
    let accPartsMap = await AccPartsMap.findByPk(id);

    console.log("Existing Approval Request: ", accPartsMap);

    if (!accPartsMap) {
      return res.status(404).json({ message: "return request not found" });
    }

    // Update fields with the request body data or retain existing values
    accPartsMap.AccCartID = req.body.AccCartID || accPartsMap.AccCartID;
    accPartsMap.AccIssueID = req.body.AccIssueID || accPartsMap.AccIssueID;
    accPartsMap.IssueDate = req.body.IssueDate || accPartsMap.IssueDate;
    accPartsMap.AccReturnID = req.body.AccReturnID || accPartsMap.AccReturnID;
    accPartsMap.ReturnDate = req.body.ReturnDate || accPartsMap.ReturnDate;
    accPartsMap.ReqQty = req.body.ReqQty || accPartsMap.ReqQty;
    accPartsMap.IssueQty = req.body.IssueQty || accPartsMap.IssueQty;
    accPartsMap.FittedQty = req.body.FittedQty || accPartsMap.FittedQty;
    accPartsMap.RetunQty = req.body.RetunQty || accPartsMap.RetunQty;
    accPartsMap.IssuedStatus =
      req.body.IssuedStatus || accPartsMap.IssuedStatus;
    accPartsMap.FitmentStatus =
      req.body.FitmentStatus || accPartsMap.FitmentStatus;
    accPartsMap.ReturnStatus =
      req.body.ReturnStatus || accPartsMap.ReturnStatus;
    accPartsMap.IsActive =
      req.body.IsActive !== undefined
        ? req.body.IsActive
        : accPartsMap.IsActive;
    accPartsMap.Status = req.body.Status || accPartsMap.Status;
    accPartsMap.ModifiedDate = new Date(); // Update ModifiedDate to current date

    // Save the updated AccPartsMap in the database
    await accPartsMap.save();

    res.status(200).json(accPartsMap); // Send the updated issue request as response
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message: "Database error occurred while updating the accPartsMap.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    console.error("Error updating the accPartsMap:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a AccPartsMap with the specified id in the request
exports.delete = async (req, res) => {
  const { id } = req.params; // Assuming the ID is passed as a URL parameter

  try {
    // Fetch the existing AccPartsMap
    const accPartsMap = await AccPartsMap.findByPk(id);

    if (!accPartsMap) {
      return res.status(404).json({ message: "Return request not found" });
    }

    // Delete the Return request
    await accPartsMap.destroy();

    res.status(200).json({ message: "Return request deleted successfully" });
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message: "Database error occurred while deleting the accPartsMap.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    console.error("Error deleting the accPartsMap:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
