/* eslint-disable no-dupe-keys */
/* eslint-disable no-unused-vars */
const db = require("../models");
const ApprovalRefferal = db.approvalrefferal;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;
const OffersApprovals = db.offersapprovals;
const UserMaster = db.usermaster;

// Basic CRUD API
// Create and Save a new ApprovalRefferal
exports.create = async (req, res) => {
  console.log("RefferalID:", req.body.RefferalID);
  console.log("CustOfferID:", req.body.CustOfferID);
  console.log("RequestedBy:", req.body.RequestedBy);

  try {
    //   // Validate request
    //   const requiredFields = [
    //     "RefferalID",
    //     "CustOfferID",
    //     "RequestedBy",
    //     "RequestDate",
    //     "RequestedTo",
    //     "ActionDate",
    //     "RequestStatus",
    //     "ActionStatus",
    //     "Status",
    //   ];

    //   for (const field of requiredFields) {
    //     if (req.body[field] === undefined || req.body[field] === null) {
    //       return res.status(400).json({ message: `${field} cannot be empty` });
    //     }
    //   }

    //   // Check if RequestedBy and RequestedTo are valid
    //   const requestedByExists = await UserMaster.findByPk(req.body.RequestedBy);
    //   if (!requestedByExists) {
    //     return res.status(400).json({ message: "Invalid RequestedBy" });
    //   }

    //   const requestedToExists = await UserMaster.findByPk(req.body.RequestedTo);
    //   if (!requestedToExists) {
    //     return res.status(400).json({ message: "Invalid RequestedTo" });
    //   }

    // Create an ApprovalRefferal
    const approvalRefferal = {
      RefferalID: req.body.RefferalID,
      CustOfferID: req.body.CustOfferID,
      RequestedBy: req.body.RequestedBy,
      RequestDate: req.body.RequestDate,
      RequestedTo: req.body.RequestedTo,
      ActionDate: req.body.ActionDate,
      RequestStatus: req.body.RequestStatus,
      ActionStatus: req.body.ActionStatus || "Requested",
    };

    // Save ApprovalRefferal in the database
    const newApprovalRefferal = await ApprovalRefferal.create(approvalRefferal);

    return res.status(201).json(newApprovalRefferal); // Send the newly created ApprovalRefferal as response
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

    console.error("Error creating ApprovalRefferal:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Retrieve all ApprovalRefferal from the database.
exports.findAll = async (req, res) => {
  try {
    // Fetch all ApprovalRefferal data with included UserMaster data
    const approvalRefferalData = await ApprovalRefferal.findAll({
      attributes: [
        "RefferalID",
        "CustOfferID",
        "RequestedBy",
        "RequestDate",
        "RequestedTo",
        "ActionDate",
        "RequestStatus",
        "ActionStatus",
      ],
      include: [
        {
          model: OffersApprovals,
          as: "ARCustOfferID",
          attributes: [
            "BookingID",
            "OfferID",
            "MFGShare",
            "DealerShare",
            "TaxAmount",
            "IGSTRate",
            "CESSRate",
            "OfferAmount",
            "Reffered",
            "Remarks",
            "Status",
          ],
        },
        {
          model: UserMaster,
          as: "ARRequestBy",
          attributes: ["UserName"],
        },
        {
          model: UserMaster,
          as: "ARRequestTo",
          attributes: ["UserName"],
        },
      ],
      order: [["RefferalID", "ASC"]], // Order by RefferalID in ascending order
    });

    // Check if data is empty
    if (!approvalRefferalData || approvalRefferalData.length === 0) {
      return res.status(404).json({
        message: "No ApprovalRefferal data found.",
      });
    }

    // Map the data for response
    const combinedData = approvalRefferalData.map((item) => ({
      RefferalID: item.RefferalID,
      CustOfferID: item.CustOfferID,
      RequestedBy: item.RequestedBy,
      RequestDate: item.RequestDate,
      RequestedTo: item.RequestedTo,
      ActionDate: item.ActionDate,
      RequestStatus: item.RequestStatus,
      ActionStatus: item.ActionStatus,
      BookingID: item.ARCustOfferID ? item.ARCustOfferID.BookingID : null,
      OfferID: item.ARCustOfferID ? item.ARCustOfferID.OfferID : null,
      MFGShare: item.ARCustOfferID ? item.ARCustOfferID.MFGShare : null,
      DealerShare: item.ARCustOfferID ? item.ARCustOfferID.DealerShare : null,
      TaxAmount: item.ARCustOfferID ? item.ARCustOfferID.TaxAmount : null,
      IGSTRate: item.ARCustOfferID ? item.ARCustOfferID.IGSTRate : null,
      CESSRate: item.ARCustOfferID ? item.ARCustOfferID.CESSRate : null,
      OfferAmount: item.ARCustOfferID ? item.ARCustOfferID.OfferAmount : null,
      Reffered: item.ARCustOfferID ? item.ARCustOfferID.Reffered : null,
      Remarks: item.ARCustOfferID ? item.ARCustOfferID.Remarks : null,
      CustOfferStatus: item.ARCustOfferID ? item.ARCustOfferID.Status : null,
      RequestedByUserName: item.ARRequestBy ? item.ARRequestBy.UserName : null,
      RequestedToUserName: item.ARRequestTo ? item.ARRequestTo.UserName : null,
    }));

    // Send the combined data as response
    res.json(combinedData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message:
          "Database error occurred while retrieving ApprovalRefferal data.",
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
    console.error("Error retrieving ApprovalRefferal data:", error);
    return res.status(500).json({
      message:
        "Failed to retrieve ApprovalRefferal data. Please try again later.",
    });
  }
};

// Find a single ApprovalRefferal with an id
// Find a single ApprovalRefferal with an id
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;

    // Validate the ID parameter
    if (!id) {
      return res.status(400).json({
        message: "ID parameter is required.",
      });
    }

    // Fetch the ApprovalRefferal data by primary key with included UserMaster and OffersApprovals data
    const approvalRefferalData = await ApprovalRefferal.findOne({
      where: {
        RefferalID: id,
      },
      attributes: [
        "RefferalID",
        "CustOfferID",
        "RequestedBy",
        "RequestDate",
        "RequestedTo",
        "ActionDate",
        "RequestStatus",
        "ActionStatus",
      ],
      include: [
        {
          model: OffersApprovals,
          as: "ARCustOfferID",
          attributes: [
            "BookingID",
            "OfferID",
            "MFGShare",
            "DealerShare",
            "TaxAmount",
            "IGSTRate",
            "CESSRate",
            "OfferAmount",
            "Reffered",
            "Remarks",
            "Status",
          ],
        },
        {
          model: UserMaster,
          as: "ARRequestBy",
          attributes: ["UserName"],
        },
        {
          model: UserMaster,
          as: "ARRequestTo",
          attributes: ["UserName"],
        },
      ],
    });

    // Check if data is found
    if (!approvalRefferalData) {
      return res.status(404).json({
        message: "ApprovalRefferal data not found.",
      });
    }

    // Prepare the response data
    const responseData = {
      RefferalID: approvalRefferalData.RefferalID,
      CustOfferID: approvalRefferalData.CustOfferID,
      RequestedBy: approvalRefferalData.RequestedBy,
      RequestDate: approvalRefferalData.RequestDate,
      RequestedTo: approvalRefferalData.RequestedTo,
      ActionDate: approvalRefferalData.ActionDate,
      RequestStatus: approvalRefferalData.RequestStatus,
      ActionStatus: approvalRefferalData.ActionStatus,

      BookingID: approvalRefferalData.ARCustOfferID
        ? approvalRefferalData.ARCustOfferID.BookingID
        : null,
      OfferID: approvalRefferalData.ARCustOfferID
        ? approvalRefferalData.ARCustOfferID.OfferID
        : null,
      MFGShare: approvalRefferalData.ARCustOfferID
        ? approvalRefferalData.ARCustOfferID.MFGShare
        : null,
      DealerShare: approvalRefferalData.ARCustOfferID
        ? approvalRefferalData.ARCustOfferID.DealerShare
        : null,
      TaxAmount: approvalRefferalData.ARCustOfferID
        ? approvalRefferalData.ARCustOfferID.TaxAmount
        : null,
      IGSTRate: approvalRefferalData.ARCustOfferID
        ? approvalRefferalData.ARCustOfferID.IGSTRate
        : null,
      CESSRate: approvalRefferalData.ARCustOfferID
        ? approvalRefferalData.ARCustOfferID.CESSRate
        : null,
      OfferAmount: approvalRefferalData.ARCustOfferID
        ? approvalRefferalData.ARCustOfferID.OfferAmount
        : null,
      Reffered: approvalRefferalData.ARCustOfferID
        ? approvalRefferalData.ARCustOfferID.Reffered
        : null,
      Remarks: approvalRefferalData.ARCustOfferID
        ? approvalRefferalData.ARCustOfferID.Remarks
        : null,
      CustOfferStatus: approvalRefferalData.ARCustOfferID
        ? approvalRefferalData.ARCustOfferID.Status
        : null,
      RequestedByUserName: approvalRefferalData.ARRequestBy
        ? approvalRefferalData.ARRequestBy.UserName
        : null,
      RequestedToUserName: approvalRefferalData.ARRequestTo
        ? approvalRefferalData.ARRequestTo.UserName
        : null,
    };

    // Send the response data
    res.json(responseData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message:
          "Database error occurred while retrieving ApprovalRefferal data.",
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
    console.error("Error retrieving ApprovalRefferal data:", error);
    return res.status(500).json({
      message:
        "Failed to retrieve ApprovalRefferal data. Please try again later.",
    });
  }
};

// Update a ApprovalRefferal by the id in the request
exports.updateByPk = async (req, res) => {
  console.log("RefferalID:", req.body.RefferalID);

  try {
    // Validate request
    // if (
    //   !req.body.CustOfferID ||
    //   !req.body.RequestedBy ||
    //   !req.body.RequestedTo
    // ) {
    //   return res
    //     .status(400)
    //     .json({
    //       message: "CustOfferID, RequestedBy, and RequestedTo are required",
    //     });
    // }

    // Validate the ID parameter
    const refferalId = req.params.id;
    if (!refferalId) {
      return res.status(400).json({ message: "ID parameter is required." });
    }

    // Find the ApprovalRefferal by ID
    let approvalRefferal = await ApprovalRefferal.findByPk(refferalId);

    if (!approvalRefferal) {
      return res.status(404).json({ message: "ApprovalRefferal not found" });
    }

    // Update fields
    approvalRefferal.CustOfferID =
      req.body.CustOfferID || approvalRefferal.CustOfferID;
    approvalRefferal.RequestedBy =
      req.body.RequestedBy || approvalRefferal.RequestedBy;
    approvalRefferal.RequestDate =
      req.body.RequestDate || approvalRefferal.RequestDate;
    approvalRefferal.RequestedTo =
      req.body.RequestedTo || approvalRefferal.RequestedTo;
    approvalRefferal.ActionDate =
      req.body.ActionDate || approvalRefferal.ActionDate;
    approvalRefferal.RequestStatus =
      req.body.RequestStatus || approvalRefferal.RequestStatus;
    approvalRefferal.ActionStatus =
      req.body.ActionStatus || approvalRefferal.ActionStatus;
    approvalRefferal.ModifiedDate = new Date();

    // Save updated ApprovalRefferal in the database
    const updatedApprovalRefferal = await approvalRefferal.save();

    return res.status(200).json(updatedApprovalRefferal); // Send the updated ApprovalRefferal as response
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
        message: "Database error occurred while updating ApprovalRefferal.",
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
    console.error("Error updating ApprovalRefferal:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a ApprovalRefferal with the specified id in the request
exports.deleteById = async (req, res) => {
  const id = req.params.id;

  try {
    // Validate the ID parameter
    if (!id) {
      return res.status(400).json({ message: "ID parameter is required." });
    }

    // Find the ApprovalRefferal by ID
    const approvalRefferal = await ApprovalRefferal.findByPk(id);

    // Check if the model exists
    if (!approvalRefferal) {
      return res
        .status(404)
        .json({ message: "ApprovalRefferal not found with id: " + id });
    }

    // Delete the model
    await approvalRefferal.destroy();

    // Send a success message
    res.status(200).json({
      message: "ApprovalRefferal with id: " + id + " deleted successfully",
    });
  } catch (err) {
    // Handle errors based on specific types
    if (err.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while deleting ApprovalRefferal.",
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
    console.error("Error deleting ApprovalRefferal:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
