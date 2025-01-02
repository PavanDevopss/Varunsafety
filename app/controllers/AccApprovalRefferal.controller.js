/* eslint-disable no-unused-vars */
const db = require("../models");
const AccAaprovalRefferal = db.accapprovalref;
const UserMaster = db.usermaster;
const AccApprovalReq = db.accapprovalreq;
const AccCart = db.acccart;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;

// Basic CRUD API

// Create and Save a new accAaprovalRefferal
exports.create = async (req, res) => {
  try {
    // Check if AccApprovalRefferal already exists
    const existingModel = await AccAaprovalRefferal.findOne({
      where: {
        AccApprovalReqID: req.body.AccApprovalReqID,
        ReqByEmpID: req.body.ReqByEmpID,
      },
    });

    if (existingModel) {
      return res
        .status(400)
        .json({ message: "Approval referral already exists" });
    }

    // Map fields from req.body to AccApprovalRefferal object
    const accApprovalRefferalData = {
      AccApprovalReqID: req.body.AccApprovalReqID,
      AccCartID: req.body.AccCartID,
      ReqByEmpID: req.body.ReqByEmpID,
      ReqDate: req.body.ReqDate || new Date(),
      ReqToEmpID: req.body.ReqToEmpID || null,
      ActionDate: req.body.ActionDate || new Date() || null,
      RequestStatus: req.body.RequestStatus || "Requested",
      ActionStatus: req.body.ActionStatus || "Requested",
      Remarks: req.body.Remarks || null,
      IsActive: req.body.IsActive !== undefined ? req.body.IsActive : true,
      Status: req.body.Status || "Active",
      CreatedDate: new Date(),
    };

    // Save AccApprovalRefferal in the database
    const newAccApprovalRefferal = await AccAaprovalRefferal.create(
      accApprovalRefferalData
    );

    return res.status(201).json(newAccApprovalRefferal); // Send the newly created AccApprovalRefferal as response
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
        message: "Database error occurred while creating AccApprovalRefferal.",
        details: err.message,
      });
    }

    if (err.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: err.message,
      });
    }

    console.error("Error creating AccApprovalRefferal:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Retrieve all accAaprovalRefferals from the database.
exports.findAll = async (req, res) => {
  try {
    // Fetch AccApprovalRefferals
    const accApprovalRefferals = await AccAaprovalRefferal.findAll({
      attributes: [
        "AccApprovalRefID",
        "AccApprovalReqID",
        "AccCartID",
        "ReqByEmpID",
        "ReqDate",
        "ReqToEmpID",
        "ActionDate",
        "RequestStatus",
        "ActionStatus",
        "Remarks",
        "IsActive",
        "Status",
        "CreatedDate",
        "ModifiedDate",
      ],
      include: [
        {
          model: UserMaster,
          as: "AARReqByEmpID",
          attributes: ["UserID", "UserName", "EmpID"],
        },
        {
          model: UserMaster,
          as: "AARReqToEmpID",
          attributes: ["UserID", "UserName", "EmpID"],
        },
        {
          model: AccApprovalReq,
          as: "AARAccApprovalReqID",
          // attributes:["UserID", "UserName", "EmpID"]
        },
        {
          model: AccCart,
          as: "AARefAccCartID",
          // attributes:["UserID", "UserName", "EmpID"]
        },
      ],
      order: [["AccApprovalRefID", "ASC"]], // Order by AccApprovalRefID in ascending order
    });

    if (accApprovalRefferals.length === 0) {
      return res.status(404).json({ message: "No AccApprovalRefferals found" });
    }

    res.status(200).json(accApprovalRefferals);
  } catch (error) {
    // Handle specific Sequelize errors
    if (error.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message: "Database error occurred while retrieving referrals.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    console.error("Error fetching AccApprovalRefferals:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Find a single accAaprovalRefferal with an id
exports.findOne = async (req, res) => {
  const id = req.params.id;

  try {
    // Fetch the AccApprovalRefferal with the given ID
    const accApprovalRefferal = await AccAaprovalRefferal.findByPk(id, {
      attributes: [
        "AccApprovalRefID",
        "AccApprovalReqID",
        "AccCartID",
        "ReqByEmpID",
        "ReqDate",
        "ReqToEmpID",
        "ActionDate",
        "RequestStatus",
        "ActionStatus",
        "Remarks",
        "IsActive",
        "Status",
        "CreatedDate",
        "ModifiedDate",
      ],
      include: [
        {
          model: UserMaster,
          as: "AARReqByEmpID",
          attributes: ["UserID", "UserName", "EmpID"],
        },
        {
          model: UserMaster,
          as: "AARReqToEmpID",
          attributes: ["UserID", "UserName", "EmpID"],
        },
        {
          model: AccApprovalReq,
          as: "AARAccApprovalReqID",
          // attributes:["UserID", "UserName", "EmpID"]
        },
        {
          model: AccCart,
          as: "AARefAccCartID",
          // attributes:["UserID", "UserName", "EmpID"]
        },
      ],
    });

    if (!accApprovalRefferal) {
      return res
        .status(404)
        .json({ message: `AccApprovalRefferal not found with id: ${id}` });
    }

    res.status(200).json(accApprovalRefferal);
  } catch (error) {
    // Handle specific Sequelize errors
    if (error.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message: "Database error occurred while retrieving referral data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    console.error("Error fetching AccApprovalRefferal:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Update a accAaprovalRefferal by the id in the request
exports.update = async (req, res) => {
  console.log("Referral ID:", req.params.id);

  try {
    // Validate request
    if (!req.params.id) {
      return res.status(400).json({ message: "Referral ID is required" });
    }

    // Find the referral by ID
    const ID = req.params.id;
    let accApprovalRefferal = await AccAaprovalRefferal.findByPk(ID);
    console.log("Referral data: ", accApprovalRefferal);

    if (!accApprovalRefferal) {
      return res.status(404).json({ message: "Referral not found" });
    }

    // Update fields
    accApprovalRefferal.AccApprovalReqID =
      req.body.AccApprovalReqID || accApprovalRefferal.AccApprovalReqID;
    accApprovalRefferal.AccCartID =
      req.body.AccCartID || accApprovalRefferal.AccCartID;
    accApprovalRefferal.ReqByEmpID =
      req.body.ReqByEmpID || accApprovalRefferal.ReqByEmpID;
    accApprovalRefferal.ReqDate =
      req.body.ReqDate || accApprovalRefferal.ReqDate || null;
    accApprovalRefferal.ReqToEmpID =
      req.body.ReqToEmpID || accApprovalRefferal.ReqToEmpID;
    accApprovalRefferal.ActionDate =
      req.body.ActionDate || accApprovalRefferal.ActionDate || null;
    accApprovalRefferal.RequestStatus =
      req.body.RequestStatus || accApprovalRefferal.RequestStatus;
    accApprovalRefferal.ActionStatus =
      req.body.ActionStatus || accApprovalRefferal.ActionStatus;
    accApprovalRefferal.Remarks =
      req.body.Remarks || accApprovalRefferal.Remarks || null;
    accApprovalRefferal.IsActive =
      req.body.IsActive !== undefined
        ? req.body.IsActive
        : accApprovalRefferal.IsActive;
    accApprovalRefferal.Status =
      req.body.Status || accApprovalRefferal.Status || "Active";
    accApprovalRefferal.ModifiedDate = new Date();

    console.log("Updated model:", accApprovalRefferal);

    // Save updated referral in the database
    const updatedAccApprovalRefferal = await accApprovalRefferal.save();

    return res.status(200).json(updatedAccApprovalRefferal);
  } catch (err) {
    // Handle errors based on specific types
    if (err.name === "SequelizeValidationError") {
      return res.status(400).json({
        message: "Validation error",
        details: err.errors.map((e) => e.message),
      });
    }

    if (err.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message: "Database error occurred while updating referral.",
        details: err.message,
      });
    }

    if (err.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: err.message,
      });
    }

    console.error("Error updating referral:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a accAaprovalRefferal with the specified id in the request
exports.delete = async (req, res) => {
  const id = req.params.id;

  try {
    // Find the referral by ID
    const accApprovalRefferal = await AccAaprovalRefferal.findByPk(id);

    // Check if the referral exists
    if (!accApprovalRefferal) {
      return res
        .status(404)
        .json({ message: `Referral not found with id: ${id}` });
    }

    // Delete the referral
    await accApprovalRefferal.destroy();

    // Send a success message
    res.status(200).json({
      message: `Referral with id: ${id} deleted successfully`,
    });
  } catch (err) {
    // Handle specific Sequelize errors
    if (err.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message: "Database error occurred while deleting the referral.",
        details: err.message,
      });
    }

    if (err.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: err.message,
      });
    }

    console.error("Error deleting referral:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
