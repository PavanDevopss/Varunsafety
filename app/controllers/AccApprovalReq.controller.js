/* eslint-disable no-unused-vars */
const db = require("../models");
const AccApprovalReq = db.accapprovalreq;
const UserMaster = db.usermaster;
const NewCarBookings = db.NewCarBookings;
const BranchMaster = db.branchmaster;
const AccCart = db.acccart;
const AccPartMaster = db.accpartmaster;
const AccApprovedCart = db.accapprovedcart;
const AccApprovalRefferal = db.accapprovalref;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;
const { genAccApprovalReqNo } = require("../Utils/generateService");

// Basic CRUD API

// Create and Save a new AccApprovalReq
exports.create = async (req, res) => {
  console.log("Creating Approval Request for Booking ID:", req.body.BookingID);

  const transaction = await Seq.transaction(); // Start a transaction

  try {
    // Check if an AccApprovalReq already exists with the given BookingID
    const existingModel = await AccApprovalReq.findOne({
      where: { BookingID: req.body.BookingID },
      transaction, // Include the transaction in the query
    });

    if (existingModel) {
      // Check if AccCartID values are the same
      const existingAccCartID = existingModel.AccCartID;
      const newAccCartID = req.body.AccCartID || [];

      // Compare arrays (considering order doesn't matter)
      const arraysAreEqual =
        existingAccCartID.length === newAccCartID.length &&
        existingAccCartID.every((value) => newAccCartID.includes(value));

      if (arraysAreEqual) {
        return res
          .status(400)
          .json({ message: "Request for this Booking already exists." });
      }

      // If they are not equal, update the AccCartID array
      const updatedAccCartID = Array.from(
        new Set([...existingAccCartID, ...newAccCartID])
      );

      // Update the existing model
      await existingModel.update(
        {
          AccCartID: updatedAccCartID,
          ReqDate: req.body.ReqDate || existingModel.ReqDate,
          Remarks: req.body.Remarks || existingModel.Remarks,
          TotalDiscount: req.body.TotalDiscount || null,
          AccOfferAmt: req.body.AccOfferAmt || null,
          ApprovalStatus:
            req.body.ApprovalStatus || existingModel.ApprovalStatus,
          ModifiedDate: new Date(), // Track when the record was last updated
        },
        { transaction } // Include the transaction in the update
      );

      // Commit the transaction and return the updated model
      await transaction.commit();
      return res.status(200).json(existingModel); // Send the updated model
    }

    const currentReqNo = await genAccApprovalReqNo();

    // Map fields from req.body to AccApprovalReq object
    const approvalRequestData = {
      ReqNo: currentReqNo || req.body.ReqNo,
      ReqDate: req.body.ReqDate || new Date(), // Default to current date if not provided
      ReqEmpID: req.body.ReqEmpID,
      BookingID: req.body.BookingID,
      BranchID: req.body.BranchID,
      AccCartID: req.body.AccCartID || [], // Default to empty array if not provided
      ApprovedEmpID: req.body.ApprovedEmpID || null,
      CancelledEmpID: req.body.CancelledEmpID || null,
      RefferedTo: req.body.RefferedTo || null,
      TotalDiscount: req.body.TotalDiscount || null,
      AccOfferAmt: req.body.AccOfferAmt || null,
      Remarks: req.body.Remarks || null,
      ApprovalStatus: req.body.ApprovalStatus || "Pending", // Default to "Pending"
      IsActive: req.body.IsActive || true,
      Status: req.body.Status || "Active",
      CreatedDate: new Date(),
    };

    // Save the AccApprovalReq in the database
    const newApprovalRequest = await AccApprovalReq.create(
      approvalRequestData,
      { transaction }
    );

    // Now update the CartStatus for the CartIDs in req.body.ApprovedCart
    if (req.body.ApprovedCart && Array.isArray(req.body.ApprovedCart)) {
      const approvedCartIds = req.body.ApprovedCart;

      // Update CartStatus to "Approved" for each CartID in the ApprovedCart array,
      // but only if the current CartStatus is not "Approved"
      await AccCart.update(
        {
          CartStatus: "Approved", // Set CartStatus to "Approved"
          ApprovedBy: req.body.ReqEmpID, // Set the ReqEmpID as ApprovedBy
          ModifiedDate: new Date(), // Track the modification date
        },
        {
          where: {
            AccCartID: approvedCartIds, // Match CartID in the ApprovedCart array
            CartStatus: { [Op.ne]: "Approved" }, // Only update if CartStatus is not already "Approved"
          },
          transaction, // Include the transaction in the update
        }
      );
    }

    // Commit the transaction after all operations
    await transaction.commit();

    // Send the newly created AccApprovalReq as response
    return res.status(201).json(newApprovalRequest);
  } catch (err) {
    // Rollback the transaction if there's an error
    await transaction.rollback();

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
        message: "Database error occurred while creating AccApprovalReq.",
        details: err.message,
      });
    }

    if (err.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: err.message,
      });
    }

    console.error("Error creating AccApprovalReq:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Retrieve all AccApprovalReqs from the database.
exports.findAll = async (req, res) => {
  try {
    // Fetch AccApprovalReqs
    const approvalRequests = await AccApprovalReq.findAll({
      attributes: [
        "AccApprovalReqID",
        "ReqNo",
        "ReqDate",
        "ReqEmpID",
        "BookingID",
        "BranchID",
        "AccCartID",
        "ApprovedEmpID",
        "CancelledEmpID",
        "RefferedTo",
        "TotalDiscount",
        "Remarks",
        "ApprovalStatus",
        "IsActive",
        "Status",
        "CreatedDate",
        "ModifiedDate",
      ],
      include: [
        {
          model: UserMaster,
          as: "AARReqEmpID",
          attributes: ["UserID", "UserName", "EmpID"],
        },
        {
          model: UserMaster,
          as: "AARApprovedEmpID",
          attributes: ["UserID", "UserName", "EmpID"],
        },
        {
          model: UserMaster,
          as: "AARCancelledEmpID",
          attributes: ["UserID", "UserName", "EmpID"],
        },
        {
          model: UserMaster,
          as: "AARRefferedTo",
          attributes: ["UserID", "UserName", "EmpID"],
        },
        {
          model: NewCarBookings,
          as: "AARBookingID",
          attributes: [
            "BookingID",
            "BookingNo",
            "BookingTime",
            "PhoneNo",
            "Email",
            "FirstName",
            "LastName",
            "ModelName",
            "VariantName",
            "ColourName",
            "Transmission",
            "Fuel",
          ],
        },
        {
          model: BranchMaster,
          as: "AARBranchID",
          attributes: ["BranchID", "BranchCode", "BranchName"],
        },
      ],
      order: [
        ["AccApprovalReqID", "ASC"], // Order by AccApprovalReqID in ascending order
      ],
    });

    if (approvalRequests.length === 0) {
      return res.status(404).json({ message: "No approval requests found" });
    }

    res.status(200).json(approvalRequests);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while retrieving approval requests.",
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

    console.error("Error fetching approval requests:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Find a single AccApprovalReq with an id
exports.findOne = async (req, res) => {
  const { id } = req.params; // Assuming the ID is passed as a URL parameter

  try {
    // Fetch the specific AccApprovalReq
    const approvalRequest = await AccApprovalReq.findOne({
      where: { AccApprovalReqID: id },
      attributes: [
        "AccApprovalReqID",
        "ReqNo",
        "ReqDate",
        "ReqEmpID",
        "BookingID",
        "BranchID",
        "AccCartID",
        "ApprovedEmpID",
        "CancelledEmpID",
        "RefferedTo",
        "TotalDiscount",
        "Remarks",
        "ApprovalStatus",
        "IsActive",
        "Status",
        "CreatedDate",
        "ModifiedDate",
      ],
      include: [
        {
          model: UserMaster,
          as: "AARReqEmpID",
          attributes: ["UserID", "UserName", "EmpID"],
        },
        {
          model: UserMaster,
          as: "AARApprovedEmpID",
          attributes: ["UserID", "UserName", "EmpID"],
        },
        {
          model: UserMaster,
          as: "AARCancelledEmpID",
          attributes: ["UserID", "UserName", "EmpID"],
        },
        {
          model: UserMaster,
          as: "AARRefferedTo",
          attributes: ["UserID", "UserName", "EmpID"],
        },
        {
          model: NewCarBookings,
          as: "AARBookingID",
          attributes: ["BookingID", "BookingNo", "BookingTime"],
        },
        {
          model: BranchMaster,
          as: "AARBranchID",
          attributes: ["BranchID", "BranchCode", "BranchName"],
        },
      ],
    });

    if (!approvalRequest) {
      return res.status(404).json({ message: "Approval request not found" });
    }

    res.status(200).json(approvalRequest);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message:
          "Database error occurred while retrieving the approval request.",
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

    console.error("Error fetching the approval request:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Update a AccApprovalReq by the id in the request
// Update an existing AccApprovalReq by ID
exports.update = async (req, res) => {
  const { id } = req.params; // Assuming the ID is passed as a URL parameter

  try {
    // Fetch the existing AccApprovalReq
    let approvalRequest = await AccApprovalReq.findByPk(id);

    console.log("Existing Approval Request: ", approvalRequest);

    if (!approvalRequest) {
      return res.status(404).json({ message: "Approval request not found" });
    }

    // Update fields with the request body data or retain existing values
    approvalRequest.ReqNo = req.body.ReqNo || approvalRequest.ReqNo;
    approvalRequest.ReqDate = req.body.ReqDate || approvalRequest.ReqDate;
    approvalRequest.ReqEmpID = req.body.ReqEmpID || approvalRequest.ReqEmpID;
    approvalRequest.BookingID = req.body.BookingID || approvalRequest.BookingID;
    approvalRequest.BranchID = req.body.BranchID || approvalRequest.BranchID;
    approvalRequest.AccCartID = req.body.AccCartID || approvalRequest.AccCartID;
    approvalRequest.ApprovedEmpID =
      req.body.ApprovedEmpID || approvalRequest.ApprovedEmpID;
    approvalRequest.CancelledEmpID =
      req.body.CancelledEmpID || approvalRequest.CancelledEmpID;
    approvalRequest.RefferedTo =
      req.body.RefferedTo || approvalRequest.RefferedTo;
    approvalRequest.TotalDiscount =
      req.body.TotalDiscount || approvalRequest.TotalDiscount;
    approvalRequest.Remarks = req.body.Remarks || approvalRequest.Remarks;
    approvalRequest.ApprovalStatus =
      req.body.ApprovalStatus || approvalRequest.ApprovalStatus;
    approvalRequest.IsActive =
      req.body.IsActive !== undefined
        ? req.body.IsActive
        : approvalRequest.IsActive;
    approvalRequest.Status = req.body.Status || approvalRequest.Status;
    approvalRequest.ModifiedDate = new Date(); // Update ModifiedDate to current date

    // Save the updated AccApprovalReq in the database
    await approvalRequest.save();

    res.status(200).json(approvalRequest); // Send the updated approval request as response
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message: "Database error occurred while updating the approval request.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    console.error("Error updating the approval request:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a AccApprovalReq with the specified id in the request
exports.delete = async (req, res) => {
  const { id } = req.params; // Assuming the ID is passed as a URL parameter

  try {
    // Fetch the existing AccApprovalReq
    const approvalRequest = await AccApprovalReq.findByPk(id);

    if (!approvalRequest) {
      return res.status(404).json({ message: "Approval request not found" });
    }

    // Delete the approval request
    await approvalRequest.destroy();

    res.status(200).json({ message: "Approval request deleted successfully" });
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message: "Database error occurred while deleting the approval request.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    console.error("Error deleting the approval request:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Dynamic API by Status
exports.findAllByStatus = async (req, res) => {
  try {
    const branchID = req.query.BranchID;
    const status = req.query.Status;

    // Define the status condition
    let statusCondition;
    if (status === "Pending") {
      statusCondition = {
        [Op.or]: [
          { ApprovalStatus: "Pending" },
          { ApprovalStatus: "Referred" },
        ],
      };
    } else {
      statusCondition = { ApprovalStatus: status };
    }

    // Fetch AccApprovalReqs
    const approvalRequests = await AccApprovalReq.findAll({
      where: { BranchID: branchID, ...statusCondition },
      attributes: [
        "AccApprovalReqID",
        "ReqNo",
        "ReqDate",
        "BookingID",
        "BranchID",
        "TotalDiscount",
        "ApprovalStatus",
        "CreatedDate",
      ],
      include: [
        {
          model: UserMaster,
          as: "AARReqEmpID",
          attributes: ["UserID", "UserName", "EmpID"],
        },
        {
          model: UserMaster,
          as: "AARApprovedEmpID",
          attributes: ["UserID", "UserName", "EmpID"],
        },
        {
          model: UserMaster,
          as: "AARCancelledEmpID",
          attributes: ["UserID", "UserName", "EmpID"],
        },
        {
          model: UserMaster,
          as: "AARRefferedTo",
          attributes: ["UserID", "UserName", "EmpID"],
        },
        {
          model: NewCarBookings,
          as: "AARBookingID",
          attributes: [
            "BookingID",
            "BookingNo",
            "BookingTime",
            "FirstName",
            "LastName",
            "ModelName",
            "VariantName",
            "ColourName",
          ],
        },
        {
          model: BranchMaster,
          as: "AARBranchID",
          attributes: ["BranchID", "BranchCode", "BranchName"],
        },
      ],
      order: [["AccApprovalReqID", "ASC"]],
    });

    if (approvalRequests.length === 0) {
      return res.status(404).json({ message: "No approval requests found" });
    }

    // Map to combined data structure
    const combinedData = approvalRequests.map((item) => ({
      AccApprovalReqID: item.AccApprovalReqID || null,
      ReqNo: item.ReqNo || null,
      ReqDate: item.ReqDate || null,
      BookingID: item.BookingID || null,
      BranchID: item.BranchID || null,
      TotalDiscount: item.TotalDiscount || null,
      ApprovalStatus: item.ApprovalStatus || null,
      CreatedDate: item.CreatedDate || null,
      ReqByUserName: item.AARReqEmpID ? item.AARReqEmpID.UserName : null,
      ReqByEmpID: item.AARReqEmpID ? item.AARReqEmpID.EmpID : null,
      AprByUserName: item.AARApprovedEmpID
        ? item.AARApprovedEmpID.UserName
        : null,
      AprByEmpID: item.AARApprovedEmpID ? item.AARApprovedEmpID.EmpID : null,
      CncldByUserName: item.AARCancelledEmpID
        ? item.AARCancelledEmpID.UserName
        : null,
      CncldByEmpID: item.AARCancelledEmpID
        ? item.AARCancelledEmpID.EmpID
        : null,
      RefToUserName: item.AARRefferedTo ? item.AARRefferedTo.UserName : null,
      RefToEmpID: item.AARRefferedTo ? item.AARRefferedTo.EmpID : null,
      BookingNo: item.AARBookingID ? item.AARBookingID.BookingNo : null,
      BookingTime: item.AARBookingID ? item.AARBookingID.BookingTime : null,
      FirstName: item.AARBookingID ? item.AARBookingID.FirstName : null,
      LastName: item.AARBookingID ? item.AARBookingID.LastName : null,
      ModelName: item.AARBookingID ? item.AARBookingID.ModelName : null,
      VariantName: item.AARBookingID ? item.AARBookingID.VariantName : null,
      ColourName: item.AARBookingID ? item.AARBookingID.ColourName : null,
      BranchCode: item.AARBranchID ? item.AARBranchID.BranchCode : null,
      BranchName: item.AARBranchID ? item.AARBranchID.BranchName : null,
    }));

    res.status(200).json(combinedData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message: "Database error occurred while retrieving approval requests.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    console.error("Error fetching approval requests:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Find a single AccApprovalReq with an id
exports.getDataForApproval = async (req, res) => {
  const { id } = req.params; // Assuming the ID is passed as a URL parameter

  try {
    // Fetch the specific AccApprovalReq
    const approvalRequest = await AccApprovalReq.findOne({
      where: { AccApprovalReqID: id },
      attributes: [
        "AccApprovalReqID",
        "ReqNo",
        "ReqDate",
        "ReqEmpID",
        "BookingID",
        "BranchID",
        "AccCartID",
        "ApprovedEmpID",
        "CancelledEmpID",
        "RefferedTo",
        "TotalDiscount",
        "AccOfferAmt",
        "Remarks",
        "ApprovalStatus",
        // "IsActive",
        // "Status",
        // "CreatedDate",
        // "ModifiedDate",
      ],
      include: [
        // {
        //   model: UserMaster,
        //   as: "AARReqEmpID",
        //   attributes: ["UserID", "UserName", "EmpID"],
        // },
        // {
        //   model: UserMaster,
        //   as: "AARApprovedEmpID",
        //   attributes: ["UserID", "UserName", "EmpID"],
        // },
        // {
        //   model: UserMaster,
        //   as: "AARCancelledEmpID",
        //   attributes: ["UserID", "UserName", "EmpID"],
        // },
        // {
        //   model: UserMaster,
        //   as: "AARRefferedTo",
        //   attributes: ["UserID", "UserName", "EmpID"],
        // },
        {
          model: NewCarBookings,
          as: "AARBookingID",
          attributes: [
            "BookingID",
            "BookingNo", // Adding BookingNo field
            "CustomerID",
            "Title",
            "FirstName",
            "LastName", // Adding LastName field
            "PhoneNo",
            "OfficeNo",
            "Email",
            "Gender",
            "DOB",
            "DateOfAnniversary",
            "Occupation",
            "Company",
            "Address",
            "PINCode",
            "District",
            "State",
            "ModelName", // Adding ModelName field
            "ColourName", // Adding ColourName field
            "VariantName", // Adding VariantName field
            "Transmission", // Adding VariantName field
            "Fuel", // Adding VariantName field
            "BranchName",
            "BookingTime",
            "BookingStatus",
            "Exchange",
          ],
        },
        // {
        //   model: BranchMaster,
        //   as: "AARBranchID",
        //   attributes: ["BranchID", "BranchCode", "BranchName"],
        // },
      ],
    });

    if (!approvalRequest) {
      return res.status(404).json({ message: "Approval request not found" });
    }

    const customerData = approvalRequest
      ? {
          AccApprovalReqID: approvalRequest.AccApprovalReqID || null,
          ReqNo: approvalRequest.ReqNo || null,
          ReqDate: approvalRequest.ReqDate || null,
          ReqEmpID: approvalRequest.ReqEmpID || null,
          BookingID: approvalRequest.BookingID || null,
          BranchID: approvalRequest.BranchID || null,
          AccCartID: approvalRequest.AccCartID || null,
          ApprovedEmpID: approvalRequest.ApprovedEmpID || null,
          CancelledEmpID: approvalRequest.CancelledEmpID || null,
          RefferedTo: approvalRequest.RefferedTo || null,
          TotalDiscount: approvalRequest.TotalDiscount || null,
          AccOfferAmt: approvalRequest.AccOfferAmt || null,
          Remarks: approvalRequest.Remarks || null,
          ApprovalStatus: approvalRequest.ApprovalStatus || null,
          CreatedDate: approvalRequest.CreatedDate || null,
          ModifiedDate: approvalRequest.ModifiedDate || null, // If you want to include it

          // Mapping for UserMaster associations
          ReqByUserName: approvalRequest.AARReqEmpID
            ? approvalRequest.AARReqEmpID.UserName
            : null,
          ReqByEmpID: approvalRequest.AARReqEmpID
            ? approvalRequest.AARReqEmpID.EmpID
            : null,
          AprByUserName: approvalRequest.AARApprovedEmpID
            ? approvalRequest.AARApprovedEmpID.UserName
            : null,
          AprByEmpID: approvalRequest.AARApprovedEmpID
            ? approvalRequest.AARApprovedEmpID.EmpID
            : null,
          CncldByUserName: approvalRequest.AARCancelledEmpID
            ? approvalRequest.AARCancelledEmpID.UserName
            : null,
          CncldByEmpID: approvalRequest.AARCancelledEmpID
            ? approvalRequest.AARCancelledEmpID.EmpID
            : null,
          RefToUserName: approvalRequest.AARRefferedTo
            ? approvalRequest.AARRefferedTo.UserName
            : null,
          RefToEmpID: approvalRequest.AARRefferedTo
            ? approvalRequest.AARRefferedTo.EmpID
            : null,

          // Mapping for NewCarBookings association
          BookingNo: approvalRequest.AARBookingID
            ? approvalRequest.AARBookingID.BookingNo
            : null,
          CustomerID: approvalRequest.AARBookingID
            ? approvalRequest.AARBookingID.CustomerID
            : null,
          Title: approvalRequest.AARBookingID
            ? approvalRequest.AARBookingID.Title
            : null,
          FirstName: approvalRequest.AARBookingID
            ? approvalRequest.AARBookingID.FirstName
            : null,
          LastName: approvalRequest.AARBookingID
            ? approvalRequest.AARBookingID.LastName
            : null,
          PhoneNo: approvalRequest.AARBookingID
            ? approvalRequest.AARBookingID.PhoneNo
            : null,
          OfficeNo: approvalRequest.AARBookingID
            ? approvalRequest.AARBookingID.OfficeNo
            : null,
          Email: approvalRequest.AARBookingID
            ? approvalRequest.AARBookingID.Email
            : null,
          Gender: approvalRequest.AARBookingID
            ? approvalRequest.AARBookingID.Gender
            : null,
          DOB: approvalRequest.AARBookingID
            ? approvalRequest.AARBookingID.DOB
            : null,
          DateOfAnniversary: approvalRequest.AARBookingID
            ? approvalRequest.AARBookingID.DateOfAnniversary
            : null,
          Occupation: approvalRequest.AARBookingID
            ? approvalRequest.AARBookingID.Occupation
            : null,
          Company: approvalRequest.AARBookingID
            ? approvalRequest.AARBookingID.Company
            : null,
          Address: approvalRequest.AARBookingID
            ? approvalRequest.AARBookingID.Address
            : null,
          PINCode: approvalRequest.AARBookingID
            ? approvalRequest.AARBookingID.PINCode
            : null,
          District: approvalRequest.AARBookingID
            ? approvalRequest.AARBookingID.District
            : null,
          State: approvalRequest.AARBookingID
            ? approvalRequest.AARBookingID.State
            : null,
          ModelName: approvalRequest.AARBookingID
            ? approvalRequest.AARBookingID.ModelName
            : null,
          ColourName: approvalRequest.AARBookingID
            ? approvalRequest.AARBookingID.ColourName
            : null,
          VariantName: approvalRequest.AARBookingID
            ? approvalRequest.AARBookingID.VariantName
            : null,
          Transmission: approvalRequest.AARBookingID
            ? approvalRequest.AARBookingID.Transmission
            : null,
          Fuel: approvalRequest.AARBookingID
            ? approvalRequest.AARBookingID.Fuel
            : null,
          BranchCode: approvalRequest.AARBranchID
            ? approvalRequest.AARBranchID.BranchCode
            : null,
          BranchName: approvalRequest.AARBranchID
            ? approvalRequest.AARBranchID.BranchName
            : null,
          BookingTime: approvalRequest.AARBookingID
            ? approvalRequest.AARBookingID.BookingTime
            : null,
          BookingStatus: approvalRequest.AARBookingID
            ? approvalRequest.AARBookingID.BookingStatus
            : null,
          Exchange: approvalRequest.AARBookingID
            ? approvalRequest.AARBookingID.Exchange
            : null,
        }
      : null; // or handle the case where approvalRequest is null

    const AccList = await AccCart.findAll({
      where: { AccCartID: approvalRequest.AccCartID },
      attributes: [
        "AccCartID",
        "DiscountType",
        "DiscountValue",
        "DiscountPercentage",
        "PartMasterID",
        "QTY",
        "CartStatus",
        [sequelize.col("AccPartmasterID.PartCode"), "PartCode"],
        [sequelize.col("AccPartmasterID.PartName"), "PartName"],
        [sequelize.col("AccPartmasterID.Price"), "Price"],
      ],
      include: [
        {
          model: AccPartMaster,
          as: "AccPartmasterID",
          attributes: [],
        },
      ],
    });

    const AccApprovalCartList = await AccApprovedCart.findOne({
      where: {
        AccApprovalReqID: approvalRequest.AccApprovalReqID,
        // BookingID: req.body.BookingID,
      },
      attributes: [
        "AccApprovedCartID",
        "AccApprovalReqID",
        "AccCartID",
        "TotalGrossValue",
        "Discount",
        "NetValue",
        "NewCarAccOffer",
        "TotalPayableAmt",
      ],
    });

    // After fetching AccApprovalCartList and before sending the response

    // Assuming AccCartID is an array in both approvalRequest and AccApprovalCartList
    const requestIds = approvalRequest.AccCartID || []; // Replace with actual way to get array
    const approvedIds = AccApprovalCartList
      ? AccApprovalCartList.AccCartID
      : []; // Adjust based on your data structure

    // Find unique request IDs not in approved IDs
    const uniqueRequestIds = requestIds.filter(
      (id) => !approvedIds.includes(id)
    );

    // Find common IDs in both arrays
    const commonIds = requestIds.filter((id) => approvedIds.includes(id));

    // Update CartStatus for common IDs
    AccList.forEach((item) => {
      if (commonIds.includes(item.AccCartID)) {
        item.CartStatus = "Approved"; // Change CartStatus to "Approved"
      }
    });

    // Send the response
    res.status(200).json({
      customerData,
      AccList,
      AccApprovalCartList,
      // uniqueRequestIds,
      // commonIds,
    });

    // Send the response
    // res.status(200).json({ customerData, AccList });
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message:
          "Database error occurred while retrieving the approval request.",
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

    console.error("Error fetching the approval request:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.approvalAction = async (req, res) => {
  const {
    AccApprovalReqID,
    AccCartID,
    Remarks,
    ApprovalStatus,
    RefferedTo,
    Discount,
    TotalGrossValue,
    NetValue,
    NewCarAccOffer,
    TotalPayableAmt,
    UserID,
    ReqDate,
  } = req.body;

  const transaction = await Seq.transaction(); // Start transaction
  const currentDate = new Date(); // Store current date

  try {
    // Validate incoming data
    if (!Array.isArray(AccCartID) || AccCartID.length === 0) {
      return res
        .status(400)
        .json({ message: "AccCartID must be a non-empty array." });
    }

    // Check if the approval request exists
    let approvalRequest = await AccApprovalReq.findByPk(AccApprovalReqID, {
      transaction,
    });
    if (!approvalRequest) {
      return res.status(404).json({ message: "Approval request not found" });
    }

    // Retrieve all records from AccCart based on approvalRequest.AccCartID
    const oldAccCart = await AccCart.findAll({
      where: {
        AccCartID: approvalRequest.AccCartID, // Assuming AccCartID is stored in approvalRequest
      },
      transaction,
    });

    // If ApprovalStatus is Approved
    if (ApprovalStatus === "Approved") {
      // Update oldAccCart records only for IDs that match AccCartID from the request
      const filteredAccCart = oldAccCart.filter((cart) =>
        AccCartID.includes(cart.AccCartID)
      );

      await Promise.all(
        filteredAccCart.map((cart) => {
          return cart.update(
            {
              CartStatus: ApprovalStatus,
              ApprovedBy: UserID,
              ModifiedDate: currentDate,
            },
            { transaction }
          );
        })
      );

      // Update relevant AccApprovalRefferal records for each AccCartID
      const approvalReferrals = await Promise.all(
        AccCartID.map(async (cartID) => {
          return await AccApprovalRefferal.findOne({
            where: {
              AccApprovalReqID,
              AccCartID: cartID,
              RequestStatus: "Requested",
            },
            transaction,
          });
        })
      );

      // Optionally log any missing referrals
      approvalReferrals.forEach((referral, index) => {
        if (!referral) {
          console.warn(`Referral not found for AccCartID: ${AccCartID[index]}`);
        }
      });

      // Update all relevant AccApprovalRefferal records
      await Promise.all(
        approvalReferrals.map((referral) => {
          if (referral) {
            // Only update if referral is found
            return referral.update(
              {
                ActionDate: currentDate,
                ActionStatus: "Approved",
                Remarks,
                ModifiedDate: currentDate,
              },
              { transaction }
            );
          }
        })
      );

      // Check if AccApprovedCart exists
      let approvedCart = await AccApprovedCart.findOne({
        where: { AccApprovalReqID },
        transaction,
      });

      if (approvedCart) {
        // Update fields if record exists
        const existingCartIDs = approvedCart.AccCartID
          ? approvedCart.AccCartID
          : [];

        // Combine and remove duplicates
        const updatedCartIDs = Array.from(
          new Set([...existingCartIDs, ...AccCartID])
        );
        approvedCart.AccCartID = updatedCartIDs; // Update the AccCartID field
        approvedCart.Discount = Discount;
        approvedCart.TotalGrossValue = TotalGrossValue;
        approvedCart.NetValue = NetValue;
        approvedCart.NewCarAccOffer = NewCarAccOffer;
        approvedCart.TotalPayableAmt = TotalPayableAmt;
        approvedCart.ModifiedDate = currentDate;

        await approvedCart.save({ transaction });
        // Check if existing AccCartID matches updated AccCartID
        if (
          approvedCart.AccCartID.length === updatedCartIDs.length &&
          approvedCart.AccCartID.every((id) => updatedCartIDs.includes(id))
        ) {
          approvalRequest.ApprovalStatus =
            ApprovalStatus || approvalRequest.ApprovalStatus;
        }
      } else {
        // Create a new record if it doesn't exist
        const newApprovedCart = {
          AccApprovalReqID: approvalRequest.AccApprovalReqID,
          AccCartID,
          BookingID: approvalRequest.BookingID, // Assuming this field is available in the approvalRequest
          BranchID: approvalRequest.BranchID, // Assuming this field is available in the approvalRequest
          TotalGrossValue,
          Discount,
          NetValue,
          NewCarAccOffer,
          TotalPayableAmt,
        };

        const createdCart = await AccApprovedCart.create(newApprovedCart, {
          transaction,
        });

        // Check if newly created AccCartID matches the request AccCartID
        if (
          createdCart.AccCartID.length === AccCartID.length &&
          createdCart.AccCartID.every((id) => AccCartID.includes(id))
        ) {
          approvalRequest.ApprovalStatus =
            ApprovalStatus || approvalRequest.ApprovalStatus;
        }
      }

      approvalRequest.ApprovedEmpID = UserID || approvalRequest.ApprovedEmpID;
    }

    // If ApprovalStatus is Referred
    if (ApprovalStatus === "Referred") {
      // Iterate through each AccCartID
      console.log("AccCartIDs: ", AccCartID);
      for (const cartID of AccCartID) {
        // Check if a record exists for the current AccCartID
        let approvalReferral = await AccApprovalRefferal.findOne({
          where: {
            AccApprovalReqID,
            AccCartID: cartID,
            RequestStatus: "Requested",
          },
          transaction,
        });

        // Create a new record object
        const newReferral = {
          AccApprovalReqID,
          AccCartID: cartID, // Use single cart ID
          ReqByEmpID: UserID,
          ReqDate: ReqDate || currentDate, // Use provided ReqDate or current date
          ReqToEmpID: RefferedTo,
          RequestStatus: "Requested",
          ActionStatus: "Requested",
          Remarks,
        };

        // If exists, update the existing record
        if (approvalReferral) {
          await approvalReferral.update(
            {
              ActionDate: currentDate,
              RequestStatus: "Referred",
              ActionStatus: "Referred",
              Remarks,
              ModifiedDate: currentDate,
            },
            { transaction }
          );
        }
        await AccApprovalRefferal.create(newReferral, { transaction });
      }
      approvalRequest.ApprovalStatus =
        ApprovalStatus || approvalRequest.ApprovalStatus;
    }

    // If ApprovalStatus is Rejected
    if (ApprovalStatus === "Rejected") {
      // // Update oldAccCart records
      // await Promise.all(
      //   oldAccCart.map((cart) => {
      //     return cart.update(
      //       {
      //         CartStatus: ApprovalStatus,
      //         ApprovedBy: UserID,
      //         ModifiedDate: currentDate,
      //       },
      //       { transaction }
      //     );
      //   })
      // );

      // Update oldAccCart records only for IDs that match AccCartID from the request
      const filteredAccCart = oldAccCart.filter((cart) =>
        AccCartID.includes(cart.AccCartID)
      );

      await Promise.all(
        filteredAccCart.map((cart) => {
          return cart.update(
            {
              CartStatus: ApprovalStatus,
              ApprovedBy: UserID,
              ModifiedDate: currentDate,
            },
            { transaction }
          );
        })
      );

      // Retrieve all relevant AccApprovalRefferal records for each AccCartID
      const approvalReferrals = await Promise.all(
        AccCartID.map(async (cartID) => {
          return await AccApprovalRefferal.findOne({
            where: {
              AccApprovalReqID,
              AccCartID: cartID,
              RequestStatus: "Requested",
            },
            transaction,
          });
        })
      );

      // Update all relevant AccApprovalRefferal records
      await Promise.all(
        approvalReferrals.map((referral) => {
          return referral.update(
            {
              ActionDate: currentDate,
              ActionStatus: "Rejected",
              Remarks,
              ModifiedDate: currentDate,
            },
            { transaction }
          );
        })
      );

      // // Check if AccApprovedCart exists
      // let approvedCart = await AccApprovedCart.findOne({
      //   where: { AccApprovalReqID },
      //   transaction,
      // });

      // if (approvedCart) {
      //   // Update fields if record exists
      //   approvedCart.IsActive = false;
      //   approvedCart.Status = "InActive"; // Corrected spelling from "InActive"
      //   approvedCart.ModifiedDate = currentDate;
      //   await approvedCart.save({ transaction });
      // }

      approvalRequest.RefferedTo = RefferedTo || approvalRequest.RefferedTo;
      approvalRequest.ApprovalStatus =
        ApprovalStatus || approvalRequest.ApprovalStatus;
    }

    // If ApprovalStatus is Cancelled
    if (ApprovalStatus === "Cancelled") {
      // // Update oldAccCart records
      await Promise.all(
        oldAccCart.map((cart) => {
          return cart.update(
            {
              ApprovedBy: UserID,
              CartStatus: ApprovalStatus,
              IsActive: false,
              Status: "InActive",
              ModifiedDate: currentDate,
            },
            { transaction }
          );
        })
      );

      // Update oldAccCart records only for IDs that match AccCartID from the request
      // const filteredAccCart = oldAccCart.filter((cart) =>
      //   AccCartID.includes(cart.AccCartID)
      // );

      // await Promise.all(
      //   filteredAccCart.map((cart) => {
      //     return cart.update(
      //       {
      //         CartStatus: ApprovalStatus,
      //         IsActive: false,
      //         Status: "InActive",
      //         ModifiedDate: currentDate,
      //       },
      //       { transaction }
      //     );
      //   })
      // );

      // const approvalReferrals = await Promise.all(
      //   AccCartID.map(async (cartID) => {
      //     return await AccApprovalRefferal.findOne({
      //       where: {
      //         AccApprovalReqID,
      //         // AccCartID: cartID,
      //         RequestStatus: "Requested",
      //       },
      //       transaction,
      //     });
      //   })
      // );
      // Retrieve all relevant AccApprovalRefferal records for the given AccApprovalReqID
      const approvalReferrals = await AccApprovalRefferal.findAll({
        where: {
          AccApprovalReqID,
          RequestStatus: "Requested",
        },
        transaction,
      });

      await Promise.all(
        approvalReferrals.map((referral) => {
          return referral.update(
            {
              ActionStatus: "Expired", // You can also keep it as "Expired" if that's the intended logic
              Remarks,
              ModifiedDate: currentDate,
              Status: "InActive", // Updating to "Expired"
              IsActive: false,
            },
            { transaction }
          );
        })
      );

      let approvedCart = await AccApprovedCart.findOne({
        where: { AccApprovalReqID },
        transaction,
      });

      if (approvedCart) {
        // Update fields if record exists
        approvedCart.IsActive = false;
        approvedCart.Status = "InActive"; // Corrected spelling from "InActive"
        approvedCart.ModifiedDate = currentDate;
        await approvedCart.save({ transaction });
      }

      approvalRequest.CancelledEmpID = UserID || approvalRequest.CancelledEmpID;
      approvalRequest.ApprovalStatus = "Expired";
      approvalRequest.IsActive = false;
      approvalRequest.Status = "InActive";
    }

    // Update Approval Request fields
    approvalRequest.Remarks = Remarks || approvalRequest.Remarks;
    approvalRequest.ModifiedDate = currentDate;

    // Save the updated AccApprovalReq in the database
    await approvalRequest.save({ transaction });

    // Commit the transaction
    await transaction.commit();

    res.status(200).json(approvalRequest); // Send the updated approval request as response
  } catch (error) {
    // Rollback the transaction in case of an error
    await transaction.rollback();

    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message: "Database error occurred while updating the approval request.",
        details: error.message,
      });
    }
    if (error.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }
    console.error("Error updating the approval request:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
