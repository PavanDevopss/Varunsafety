/* eslint-disable no-dupe-keys */
/* eslint-disable no-unused-vars */
require("dotenv").config();
const db = require("../models");
const BookingCancellation = db.bookingcancellation;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;
const NewCarBookings = db.NewCarBookings;
const UserMaster = db.usermaster;
const BranchMaster = db.branchmaster;
const FinStatusTracking = db.finstatustracking;
const FinanceApplication = db.financeapplication;
const FinStatusUpdate = db.finstatusupdate;
const PaymentRequests = db.PaymentRequests;
const FinanceLoanApplication = db.financeloanapplication;
const FinAppApplicant = db.finappapplicant;
const CustomerReceipts = db.CustReceipt;
const VehicleAllotment = db.vehicleallotment;
const {
  genBookingCancellationReqNo,
  genRequestNo,
} = require("../Utils/generateService");

// Basic CRUD API
// Create a new Booking Cancellation
exports.create = async (req, res) => {
  try {
    const generatedRequestID = await genBookingCancellationReqNo();
    console.log("!!!!", generatedRequestID);
    if (req.body.BookingID) {
      // Check if a booking cancellation already exists for the given BookingID
      const existingCancellation = await BookingCancellation.findOne({
        where: {
          BookingID: req.body.BookingID,
          CancelStatus: { [Op.ne]: "Rejected" }, // Ensure we're not checking rejected cancellations
        },
      });

      // If a cancellation request already exists for the BookingID, return an error
      if (existingCancellation) {
        return res.status(400).json({
          message:
            "A booking cancellation request already exists for this Booking ID.",
        });
      }

      const allotmentPending = await VehicleAllotment.findOne({
        where: {
          BookingID: req.body.BookingID,
          AllotmentStatus: { [Op.eq]: "Allotted" },
        },
      });

      if (allotmentPending) {
        return res.status(400).json({
          message: "Cancellation is not allowed when allotment is Done",
        });
      }
    }

    // Map the request body fields into a separate object
    const bookingCancellationData = {
      RequestID: generatedRequestID || req.body.RequestID || null,
      BookingID: req.body.BookingID || null,
      ReqEmpID: req.body.ReqEmpID || null,
      TLEmpID: req.body.TLEmpID || null,
      TLApprovalStatus: req.body.TLApprovalStatus || null,
      ApprovedBy: req.body.ApprovedBy || null,
      ReqBranch: req.body.ReqBranch || null,
      Reason: req.body.Reason || null,
      Remarks: req.body.Remarks || null,
      CancelStatus: req.body.CancelStatus || null,
      IsActive: req.body.IsActive || true, // Default to true if not provided
      Status: req.body.Status || "Active", // Default to "Active" if not provided
    };

    console.log("Data: ", bookingCancellationData);
    // Create the booking cancellation record
    const bookingCancellation = await BookingCancellation.create(
      bookingCancellationData
    );

    // Respond with the created booking cancellation data
    res.status(201).json({
      message: "Booking cancellation created successfully.",
      data: bookingCancellation,
    });
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message:
          "Database error occurred while creating booking cancellation data.",
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
    console.error("Error creating booking cancellation data:", error);
    return res.status(500).json({
      message:
        "Failed to create booking cancellation data. Please try again later.",
    });
  }
};

// Retrieve all bookingCancellation from the database.
exports.findAll = async (req, res) => {
  try {
    // Fetch all bookingCancellationData with included related data
    const bookingCancellationData = await BookingCancellation.findAll({
      attributes: [
        "BookingCancellationID",
        "RequestID",
        "BookingID",
        "ReqEmpID",
        "TLEmpID",
        "TLApprovalStatus",
        "ApprovedBy",
        "ReqBranch",
        "Reason",
        "Remarks",
        "CancelStatus",
        "IsActive",
        "Status",
        "CreatedDate",
        "ModifiedDate",
      ],
      include: [
        {
          model: NewCarBookings,
          as: "BCBookingID",
          attributes: [
            "Title",
            "FirstName",
            "LastName",
            "ModelName",
            "VariantName",
            "BookingNo",
          ],
        },
        {
          model: UserMaster,
          as: "BCReqEmpID",
          attributes: ["UserID", "UserName", "EmpID"],
        },
        {
          model: UserMaster,
          as: "BCTLEmpID",
          attributes: ["UserID", "UserName", "EmpID"],
        },
        {
          model: UserMaster,
          as: "BCApprovedBy",
          attributes: ["UserID", "UserName", "EmpID"],
        },
        {
          model: BranchMaster,
          as: "BCReqBranch",
          attributes: ["BranchID", "BranchName"],
        },
      ],
      order: [["BookingCancellationID", "DESC"]], // Order by BookingcancellationID in DESC order
    });

    // Check if data is empty
    if (!bookingCancellationData || bookingCancellationData.length === 0) {
      return res.status(404).json({
        message: "No booking transfer data found.",
      });
    }
    // Map each bookingCancellationData to a flat structure
    const flatBookingCancellationData = bookingCancellationData.map((item) => ({
      BookingCancellationID: item.BookingCancellationID,
      RequestID: item.RequestID,
      BookingID: item.BookingID,
      ReqEmpID: item.ReqEmpID,
      TLEmpID: item.TLEmpID,
      TLApprovalStatus: item.TLApprovalStatus,
      ApprovedBy: item.ApprovedBy,
      ReqBranch: item.ReqBranch,
      Reason: item.Reason,
      Remarks: item.Remarks,
      CancelStatus: item.CancelStatus,
      IsActive: item.IsActive,
      Status: item.Status,
      CreatedDate: item.CreatedDate,
      ModifiedDate: item.ModifiedDate,

      // Flattened: Related NewCarBookings (BCBookingID)
      BookingNo: item.BCBookingID ? item.BCBookingID.BookingNo : null,
      Title: item.BCBookingID ? item.BCBookingID.Title : null,
      FirstName: item.BCBookingID ? item.BCBookingID.FirstName : null,
      LastName: item.BCBookingID ? item.BCBookingID.LastName : null,
      ModelName: item.BCBookingID ? item.BCBookingID.ModelName : null,
      VariantName: item.BCBookingID ? item.BCBookingID.VariantName : null,

      // Flattened: Related Requesting Employee (BCReqEmpID)
      ReqEmp_UserID: item.BCReqEmpID ? item.BCReqEmpID.UserID : null,
      ReqEmp_UserName: item.BCReqEmpID ? item.BCReqEmpID.UserName : null,
      ReqEmp_EmpID: item.BCReqEmpID ? item.BCReqEmpID.EmpID : null,

      // Flattened: Related Team Lead Employee (BCTLEmpID)
      TLEmp_UserID: item.BCTLEmpID ? item.BCTLEmpID.UserID : null,
      TLEmp_UserName: item.BCTLEmpID ? item.BCTLEmpID.UserName : null,
      TLEmp_EmpID: item.BCTLEmpID ? item.BCTLEmpID.EmpID : null,

      // Flattened: Related Approving Employee (BCApprovedBy)
      ApprovedBy_UserID: item.BCApprovedBy ? item.BCApprovedBy.UserID : null,
      ApprovedBy_UserName: item.BCApprovedBy
        ? item.BCApprovedBy.UserName
        : null,
      ApprovedBy_EmpID: item.BCApprovedBy ? item.BCApprovedBy.EmpID : null,

      // Flattened: Related Branch (BCReqBranch)
      ReqBranch_BranchID: item.BCReqBranch ? item.BCReqBranch.BranchID : null,
      ReqBranch_BranchName: item.BCReqBranch
        ? item.BCReqBranch.BranchName
        : null,
    }));

    // Send the flattened data as response
    res.json(flatBookingCancellationData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message:
          "Database error occurred while retrieving booking cancellation data.",
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
    console.error("Error retrieving booking cancellation data:", error);
    return res.status(500).json({
      message:
        "Failed to retrieve booking cancellation data. Please try again later.",
    });
  }
};

// Retrieve single calcellation by ID
exports.findOne = async (req, res) => {
  try {
    // Fetch a single bookingCancellation data with included related data
    const bookingCancellationData = await BookingCancellation.findOne({
      where: { BookingCancellationID: req.params.id }, // Search by BookingCancellationID
      attributes: [
        "BookingCancellationID",
        "RequestID",
        "BookingID",
        "ReqEmpID",
        "TLEmpID",
        "TLApprovalStatus",
        "ApprovedBy",
        "ReqBranch",
        "Reason",
        "Remarks",
        "CancelStatus",
        "IsActive",
        "Status",
        "CreatedDate",
        "ModifiedDate",
      ],
      include: [
        {
          model: NewCarBookings,
          as: "BCBookingID",
          attributes: [
            "Title",
            "FirstName",
            "LastName",
            "ModelName",
            "VariantName",
            "BookingNo",
          ],
        },
        {
          model: UserMaster,
          as: "BCReqEmpID",
          attributes: ["UserID", "UserName", "EmpID"],
        },
        {
          model: UserMaster,
          as: "BCTLEmpID",
          attributes: ["UserID", "UserName", "EmpID"],
        },
        {
          model: UserMaster,
          as: "BCApprovedBy",
          attributes: ["UserID", "UserName", "EmpID"],
        },
        {
          model: BranchMaster,
          as: "BCReqBranch",
          attributes: ["BranchID", "BranchName"],
        },
      ],
    });

    // If no data found, return 404
    if (!bookingCancellationData) {
      return res.status(404).json({
        message: "Booking cancellation data not found.",
      });
    }

    const flattenedBookingCancellationData = {
      BookingCancellationID: bookingCancellationData.BookingCancellationID,
      RequestID: bookingCancellationData.RequestID,
      BookingID: bookingCancellationData.BookingID,
      ReqEmpID: bookingCancellationData.ReqEmpID,
      TLEmpID: bookingCancellationData.TLEmpID,
      TLApprovalStatus: bookingCancellationData.TLApprovalStatus,
      ApprovedBy: bookingCancellationData.ApprovedBy,
      ReqBranch: bookingCancellationData.ReqBranch,
      Reason: bookingCancellationData.Reason,
      Remarks: bookingCancellationData.Remarks,
      CancelStatus: bookingCancellationData.CancelStatus,
      IsActive: bookingCancellationData.IsActive,
      Status: bookingCancellationData.Status,
      CreatedDate: bookingCancellationData.CreatedDate,
      ModifiedDate: bookingCancellationData.ModifiedDate,

      // Flattened: Related NewCarBookings (BCBookingID)
      BookingNo: bookingCancellationData.BCBookingID
        ? bookingCancellationData.BCBookingID.BookingNo
        : null,
      Title: bookingCancellationData.BCBookingID
        ? bookingCancellationData.BCBookingID.Title
        : null,
      FirstName: bookingCancellationData.BCBookingID
        ? bookingCancellationData.BCBookingID.FirstName
        : null,
      LastName: bookingCancellationData.BCBookingID
        ? bookingCancellationData.BCBookingID.LastName
        : null,
      ModelName: bookingCancellationData.BCBookingID
        ? bookingCancellationData.BCBookingID.ModelName
        : null,
      VariantName: bookingCancellationData.BCBookingID
        ? bookingCancellationData.BCBookingID.VariantName
        : null,

      // Flattened: Related Requesting Employee (BCReqEmpID)
      ReqEmp_UserID: bookingCancellationData.BCReqEmpID
        ? bookingCancellationData.BCReqEmpID.UserID
        : null,
      ReqEmp_UserName: bookingCancellationData.BCReqEmpID
        ? bookingCancellationData.BCReqEmpID.UserName
        : null,
      ReqEmp_EmpID: bookingCancellationData.BCReqEmpID
        ? bookingCancellationData.BCReqEmpID.EmpID
        : null,

      // Flattened: Related Team Lead Employee (BCTLEmpID)
      TLEmp_UserID: bookingCancellationData.BCTLEmpID
        ? bookingCancellationData.BCTLEmpID.UserID
        : null,
      TLEmp_UserName: bookingCancellationData.BCTLEmpID
        ? bookingCancellationData.BCTLEmpID.UserName
        : null,
      TLEmp_EmpID: bookingCancellationData.BCTLEmpID
        ? bookingCancellationData.BCTLEmpID.EmpID
        : null,

      // Flattened: Related Approving Employee (BCApprovedBy)
      ApprovedBy_UserID: bookingCancellationData.BCApprovedBy
        ? bookingCancellationData.BCApprovedBy.UserID
        : null,
      ApprovedBy_UserName: bookingCancellationData.BCApprovedBy
        ? bookingCancellationData.BCApprovedBy.UserName
        : null,
      ApprovedBy_EmpID: bookingCancellationData.BCApprovedBy
        ? bookingCancellationData.BCApprovedBy.EmpID
        : null,

      // Flattened: Related Branch (BCReqBranch)
      ReqBranch_BranchID: bookingCancellationData.BCReqBranch
        ? bookingCancellationData.BCReqBranch.BranchID
        : null,
      ReqBranch_BranchName: bookingCancellationData.BCReqBranch
        ? bookingCancellationData.BCReqBranch.BranchName
        : null,
    };

    // Send the flattened data as response
    res.json(flattenedBookingCancellationData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message:
          "Database error occurred while retrieving booking cancellation data.",
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
    console.error("Error retrieving booking cancellation data:", error);
    return res.status(500).json({
      message:
        "Failed to retrieve booking cancellation data. Please try again later.",
    });
  }
};

// Delete a bookingCancellation with the specified id in the request
exports.deleteById = async (req, res) => {
  const id = req.params.id;

  try {
    // Validate the ID parameter
    if (!id) {
      return res.status(400).json({ message: "ID parameter is required." });
    }

    // Find the model by ID
    const bookingCancellation = await BookingCancellation.findByPk(id);

    // Check if the model exists
    if (!bookingCancellation) {
      return res
        .status(404)
        .json({ message: "bookingCancellation not found with id: " + id });
    }

    // Delete the model
    await bookingCancellation.destroy();

    // Send a success message
    res.status(200).json({
      message: "bookingCancellation with id: " + id + " deleted successfully",
    });
  } catch (err) {
    // Handle errors based on specific types
    if (err.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while deleting bookingCancellation.",
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
    console.error("Error deleting bookingCancellation:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// // Find a single bookingCancellation with an id
exports.BookingCancelDataForWeb = async (req, res) => {
  try {
    const bookingCancellationID = req.query.BookingCancellationID;

    // Step 1: Fetch bookingCancellation data
    const bookingCancellation = await BookingCancellation.findOne({
      where: { BookingCancellationID: bookingCancellationID },
      attributes: [
        "BookingCancellationID",
        "RequestID",
        "BookingID",
        "ReqEmpID",
        "TLEmpID",
        "TLApprovalStatus",
        "ApprovedBy",
        "ReqBranch",
        "Reason",
        "Remarks",
        "CancelStatus",
        "IsActive",
        "Status",
        "CreatedDate",
        "ModifiedDate",
      ],
      include: [
        {
          model: NewCarBookings,
          as: "BCBookingID",
          attributes: [
            "BookingNo",
            "CustomerID",
            "Title",
            "FirstName",
            "LastName",
            "PhoneNo",
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
            "ModelName",
            "ColourName",
            "VariantName",
            "Transmission",
            "Fuel",
            "BranchName",
            "SalesPersonID",
            "TeamLeadID",
            "BookingTime",
            "BookingStatus",
            "OfficeNo",
            "Exchange",
            "CreatedDate",
          ],
          include: [
            {
              model: UserMaster,
              as: "NCBSPUserID",
              attributes: ["UserID", "UserName", "EmpID"],
            },
          ], // Including all the specified attributes for NewCarBookings
        },
        {
          model: UserMaster,
          as: "BCReqEmpID",
          attributes: ["UserID", "UserName", "EmpID"],
        },
        {
          model: UserMaster,
          as: "BCTLEmpID",
          attributes: ["UserID", "UserName", "EmpID"],
        },
        {
          model: UserMaster,
          as: "BCApprovedBy",
          attributes: ["UserID", "UserName", "EmpID"],
        },
        {
          model: BranchMaster,
          as: "BCReqBranch",
          attributes: ["BranchID", "BranchName"],
        },
      ],
    });

    if (!bookingCancellation) {
      return res.status(404).json({ message: "bookingCancellation not found" });
    }

    // Step 2: Fetch FinanceApplications related to the BookingID from the bookingCancellation
    const financeApplications = await FinanceApplication.findAll({
      where: { BookingID: bookingCancellation.BookingID },
      attributes: [
        "FinAppID",
        "ApplicationNumber",
        "FinancierName",
        "LoanAmt",
        "Status",
      ],
    });

    // Step 3: Fetch all FinStatusUpdates related to the retrieved FinanceApplications
    const finAppIDs = financeApplications.map((app) => app.FinAppID);
    const finStatusUpdates = await FinStatusUpdate.findAll({
      where: { FinAppID: finAppIDs },
      attributes: ["FinStatusID", "CurrentStage", "FinAppID"],
    });

    // Step 4: Fetch all FinStatusTracking related to the retrieved FinStatusUpdates
    const finStatusIDs = finStatusUpdates.map((status) => status.FinStatusID);
    const finStatusTracking = await FinStatusTracking.findAll({
      where: { FinStatusID: finStatusIDs },
      attributes: [
        "FinStatusTrackID",
        "FinStatusID",
        "CurrentStage",
        "StatusDate",
      ],
    });

    // Step 5: Fetch PaymentRequests for the BookingID with RefTypeID = 1
    // Fetch all PaymentRequests for the given BookingID where RefTypeID = 1
    const paymentRequests = await PaymentRequests.findAll({
      where: {
        RefTypeID: 1, // Filter by RefTypeID = 1
        TransactionID: bookingCancellation.BookingID, // Match TransactionID to BookingID
      },
    });
    // If no matching payment requests are found
    if (!paymentRequests || paymentRequests.length === 0) {
      return res.status(404).json({
        message:
          "No payment requests found for the given BookingID with RefTypeID 1.",
      });
    }

    // Step 6: Map the relationships manually
    const financeApplicationsWithDetails = financeApplications.map((app) => {
      const relatedUpdates = finStatusUpdates.filter(
        (update) => update.FinAppID === app.FinAppID
      );

      const updatesWithTracking = relatedUpdates.map((update) => ({
        CurrentStage: update.CurrentStage, // Include only the CurrentStage from the update
        StatusDate: update.StatusDate, // Include only the StatusDate from the update
        FinStatusTracking: finStatusTracking
          .filter((track) => track.FinStatusID === update.FinStatusID)
          .map((track) => ({
            CurrentStage: track.CurrentStage, // Include only CurrentStage from tracking
            StatusDate: track.StatusDate, // Include only StatusDate from tracking
          })),
      }));

      return {
        ...app.toJSON(),
        FinStatusUpdates: updatesWithTracking, // Include the simplified updates
      };
    });

    // Step 7: Structure the final response
    const response = {
      // Direct bookingCancellation fields
      BookingCancellationID: bookingCancellation.BookingCancellationID,
      RequestID: bookingCancellation.RequestID,
      BookingID: bookingCancellation.BookingID,
      ReqEmpID: bookingCancellation.ReqEmpID,
      TLEmpID: bookingCancellation.TLEmpID,
      TLApprovalStatus: bookingCancellation.TLApprovalStatus,
      ApprovedBy: bookingCancellation.ApprovedBy,
      ReqBranch: bookingCancellation.ReqBranch,
      Reason: bookingCancellation.Reason,
      Remarks: bookingCancellation.Remarks,
      CancelStatus: bookingCancellation.CancelStatus,
      IsActive: bookingCancellation.IsActive,
      Status: bookingCancellation.Status,
      CreatedDate: bookingCancellation.CreatedDate,
      ModifiedDate: bookingCancellation.ModifiedDate,

      // Flattened ReqBranch details
      FromBranchID: bookingCancellation?.BCReqBranch?.BranchID || null,
      FromBranchName: bookingCancellation?.BCReqBranch?.BranchName || null,

      // Flattened AcceptedBy user details
      AcceptedByUserID: bookingCancellation?.BCApprovedBy?.UserID || null,
      AcceptedByUserName: bookingCancellation?.BCApprovedBy?.UserName || null,
      AcceptedByEmpID: bookingCancellation?.BCApprovedBy?.EmpID || null,

      // Flattened RequestBy user details
      RequestByUserID: bookingCancellation?.BCReqEmpID?.UserID || null,
      RequestByUserName: bookingCancellation?.BCReqEmpID?.UserName || null,
      RequestByEmpID: bookingCancellation?.BCReqEmpID?.EmpID || null,

      // Flattened NewCarBookings details
      BookingNo: bookingCancellation?.BCBookingID?.BookingNo || null,
      CustomerID: bookingCancellation?.BCBookingID?.CustomerID || null,
      Title: bookingCancellation?.BCBookingID?.Title || null,
      FirstName: bookingCancellation?.BCBookingID?.FirstName || null,
      LastName: bookingCancellation?.BCBookingID?.LastName || null,
      PhoneNo: bookingCancellation?.BCBookingID?.PhoneNo || null,
      Email: bookingCancellation?.BCBookingID?.Email || null,
      Gender: bookingCancellation?.BCBookingID?.Gender || null,
      DOB: bookingCancellation?.BCBookingID?.DOB || null,
      DateOfAnniversary:
        bookingCancellation?.BCBookingID?.DateOfAnniversary || null,
      Occupation: bookingCancellation?.BCBookingID?.Occupation || null,
      Company: bookingCancellation?.BCBookingID?.Company || null,
      Address: bookingCancellation?.BCBookingID?.Address || null,
      PINCode: bookingCancellation?.BCBookingID?.PINCode || null,
      District: bookingCancellation?.BCBookingID?.District || null,
      State: bookingCancellation?.BCBookingID?.State || null,
      ModelName: bookingCancellation?.BCBookingID?.ModelName || null,
      ColourName: bookingCancellation?.BCBookingID?.ColourName || null,
      VariantName: bookingCancellation?.BCBookingID?.VariantName || null,
      Transmission: bookingCancellation?.BCBookingID?.Transmission || null,
      Fuel: bookingCancellation?.BCBookingID?.Fuel || null,
      BranchName: bookingCancellation?.BCBookingID?.BranchName || null,
      SalesPersonID: bookingCancellation?.BCBookingID?.SalesPersonID || null,
      BookingTime: bookingCancellation?.BCBookingID?.BookingTime || null,
      BookingStatus: bookingCancellation?.BCBookingID?.BookingStatus || null,
      OfficeNo: bookingCancellation?.BCBookingID?.OfficeNo || null,
      Exchange: bookingCancellation?.BCBookingID?.Exchange || null,
      CreatedDate: bookingCancellation?.BCBookingID?.CreatedDate || null,

      // Flattened Salesperson details
      TLUserID: bookingCancellation?.BCTLEmpID?.UserID || null,
      TLUserName: bookingCancellation?.BCTLEmpID?.UserName || null,
      TLEmpID: bookingCancellation?.BCTLEmpID?.EmpID || null,

      // Rest of the data
      FinanceApplications: financeApplicationsWithDetails,
      PaymentRequests: paymentRequests || [],
    };

    // Step 8: Send the response
    res.status(200).json(response);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message:
          "Database error occurred while retrieving the Booking Transfer.",
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

    console.error("Error fetching the Booking Transfer:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Update a bookingCancel by the id in the request
exports.BookingCancelUpdate = async (req, res) => {
  const transaction = await Seq.transaction(); // Start a transaction

  try {
    // Validate request body
    if (!req.body) {
      return res.status(400).json({ message: "Request body cannot be empty." });
    }

    const { BookingCancellationID, Status, UserID, Reason, Remarks } = req.body;

    // Validate required parameters
    if (!BookingCancellationID) {
      return res
        .status(400)
        .json({ message: "BookingCancellationID is required." });
    }

    // Find the bookingCancel record by primary key within the transaction
    let bookingCancel = await BookingCancellation.findByPk(
      BookingCancellationID,
      {
        include: [{ model: BranchMaster, as: "BCReqBranch" }],
        transaction,
      }
    );

    if (!bookingCancel) {
      return res.status(404).json({ message: "BookingCancel not found." });
    }

    if (Status === "Approved" || Status === "Rejected") {
      // Logic for TL Approval
      if (UserID === bookingCancel.TLEmpID) {
        bookingCancel.TLApprovalStatus = Status;
        bookingCancel.CancelStatus =
          Status === "Approved" ? "Pending" : "Rejected";
        bookingCancel.ModifiedDate = new Date();

        await bookingCancel.save({ transaction });
        await transaction.commit();

        return res.status(200).json({
          message: `TL ${Status.toLowerCase()} updated successfully.`,
          bookingCancel,
        });
      } else {
        // Check if TL approval is valid
        if (bookingCancel.TLApprovalStatus === "Pending") {
          await transaction.rollback();
          return res.status(400).json({
            message: "TL approval is required before proceeding.",
          });
        }

        if (bookingCancel.TLApprovalStatus === "Rejected") {
          await transaction.rollback();
          return res.status(400).json({
            message: "TL has rejected the cancellation request.",
          });
        }

        // Update for non-TL user
        if (bookingCancel.TLApprovalStatus === "Approved") {
          bookingCancel.CancelStatus = Status;
          bookingCancel.ApprovedBy = UserID;
          bookingCancel.Reason = Reason || bookingCancel.Reason;
          bookingCancel.Remarks = Remarks || bookingCancel.Remarks;
          bookingCancel.ModifiedDate = new Date();

          await bookingCancel.save({ transaction });
          await transaction.commit();

          return res.status(200).json({
            message: `Cancellation request has been ${Status.toLowerCase()} successfully.`,
            bookingCancel,
          });
        }
      }
    } else {
      await transaction.rollback();
      return res.status(400).json({
        message: "Invalid status. Only 'Approved' or 'Rejected' are allowed.",
      });
    }
  } catch (err) {
    await transaction.rollback();

    console.error("Error updating BookingCancel:", err);

    // Handle specific Sequelize errors
    if (err.name === "SequelizeValidationError") {
      return res.status(400).json({
        message: "Validation error",
        details: err.errors.map((e) => e.message),
      });
    }

    if (err.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message: "Database error occurred while updating BookingCancel.",
        details: err.message,
      });
    }

    if (err.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: err.message,
      });
    }

    return res.status(500).json({ message: "Internal server error" });
  }
};

// exports.BookingTransferSearchForMobile = async (req, res) => {
//   try {
//     const { CustomerID, BookingID } = req.query;

//     // Validate parameters
//     if (!CustomerID || !BookingID) {
//       return res.status(400).json({
//         message:
//           "Both CustomerID and EmpID are required in the URL parameters.",
//       });
//     }

//     console.log("Request Parameters:", req.params);

//     // Fetch the booking transfer data
//     const bookingTransferData = await NewCarBookings.findOne({
//       where: {
//         CustomerID: CustomerID,
//         BookingID: BookingID,
//       },
//     });

//     // Check if booking transfer data exists
//     if (!bookingTransferData) {
//       return res.status(404).json({
//         message: "Booking transfer data not found.",
//       });
//     }

//     // Fetch all PaymentRequests for the given BookingID where RefTypeID = 1
//     const paymentRequests = await PaymentRequests.findAll({
//       where: {
//         // BookingID: id, // Match BookingID from query
//         CustomerID: CustomerID, // Filter by RefTypeID = 1
//         TransactionID: BookingID, // Match TransactionID to BookingID
//       },
//     });

//     // If no matching payment requests are found
//     // if (!paymentRequests || paymentRequests.length === 0) {
//     //   return res.status(404).json({
//     //     message:
//     //       "No payment requests found for the given BookingID with RefTypeID 1.",
//     //   });
//     // }

//     // Map PaymentRequests to only include specific fields
//     const filteredPaymentRequests = paymentRequests.map((request) => ({
//       RequestID: request.RequestID,
//       RequestDate: request.RequestDate,
//       PaymentMode: request.PaymentMode,
//       Amount: request.Amount,
//     }));

//     // Prepare the response data
//     const responseData = {
//       CustomerID: bookingTransferData.CustomerID,
//       BookingID: bookingTransferData.BookingID,
//       BookingNo: bookingTransferData.BookingNo,
//       Title: bookingTransferData.Title,
//       FirstName: bookingTransferData.FirstName,
//       LastName: bookingTransferData.LastName,
//       PhoneNo: bookingTransferData.PhoneNo,
//       OfficeNo: bookingTransferData.OfficeNo,
//       Email: bookingTransferData.Email,
//       Gender: bookingTransferData.Gender,
//       DOB: bookingTransferData.DOB,
//       DateOfAnniversary: bookingTransferData.DateOfAnniversary,
//       Occupation: bookingTransferData.Occupation,
//       Company: bookingTransferData.Company,
//       Address: bookingTransferData.Address,
//       PINCode: bookingTransferData.PINCode,
//       District: bookingTransferData.District,
//       State: bookingTransferData.State,
//       ModelName: bookingTransferData.ModelName,
//       ColourName: bookingTransferData.ColourName,
//       VariantName: bookingTransferData.VariantName,
//       Transmission: bookingTransferData.Transmission,
//       Fuel: bookingTransferData.Fuel,
//       BranchName: bookingTransferData.BranchName,
//       PaymentRequests: filteredPaymentRequests, // All matched payments
//     };

//     // Send the response
//     res.json(responseData);
//   } catch (error) {
//     // Handle errors
//     console.error("Error retrieving booking transfer data:", error);

//     if (error.name === "SequelizeDatabaseError") {
//       return res.status(500).json({
//         message:
//           "Database error occurred while retrieving booking transfer data.",
//         details: error.message,
//       });
//     }

//     if (error.name === "SequelizeConnectionError") {
//       return res.status(503).json({
//         message: "Service unavailable. Unable to connect to the database.",
//         details: error.message,
//       });
//     }

//     // General error response
//     return res.status(500).json({
//       message:
//         "Failed to retrieve booking transfer data. Please try again later.",
//     });
//   }
// };

exports.BookingCancellationRequest = async (req, res) => {
  try {
    const existingModel = await BookingCancellation.findOne({
      where: { BookingID: req.body.BookingID },
    });
    if (existingModel) {
      return res.status(400).json({ message: "BookingID already exists" });
    }

    const generatedRequestID = await genBookingCancellationReqNo();
    // Create a BookingTransfer
    const bookingCancellation = {
      RequestID: generatedRequestID,
      BookingID: req.body.BookingID,
      ToBranch: req.body.ToBranch,
      Reason: req.body.Reason,
      CancelStatus: req.body.CancelStatus,
      IsActive: req.body.IsActive || true,
      Status: req.body.Status || "Active",
    };

    // Save BookingTransfer in the database
    const newBookingCancellation = await BookingCancellation.create(
      bookingCancellation
    );

    return res.status(201).json(newBookingCancellation); // Send the newly created BookingTransfer as response
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

    console.error("Error creating BookingCancellation:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// // Find a single bookingCancellation with an id
// exports.BookingCancellationDataForWeb = async (req, res) => {
//   try {
//     const BookingcancellationID = req.params.id;

//     // Step 1: Fetch BookingTransfer data
//     const bookingCancellation = await BookingCancellation.findOne({
//       where: { BookingcancellationID: BookingcancellationID },
//       include: [
//         {
//           model: BranchMaster,
//           as: "BCToBranch",
//           attributes: ["BranchID", "BranchName"], // Including attributes for ToBranch
//         },
//         {
//           model: BranchMaster,
//           as: "BCFromBranch",
//           attributes: ["BranchID", "BranchName"], // Including attributes for FromBranch
//         },
//         {
//           model: NewCarBookings,
//           as: "BCBookingID",
//           attributes: [
//             "BookingNo",
//             "CustomerID",
//             "Title",
//             "FirstName",
//             "LastName",
//             "PhoneNo",
//             "Email",
//             "Gender",
//             "DOB",
//             "DateOfAnniversary",
//             "Occupation",
//             "Company",
//             "Address",
//             "PINCode",
//             "District",
//             "State",
//             "ModelName",
//             "ColourName",
//             "VariantName",
//             "Transmission",
//             "Fuel",
//             "BranchName",
//             "SalesPersonID",
//             "BookingTime",
//             "BookingStatus",
//             "OfficeNo",
//             "Exchange",
//             "CreatedDate",
//           ],
//           include: [
//             {
//               model: UserMaster,
//               as: "NCBSPUserID",
//               attributes: ["UserID", "UserName", "EmpID"],
//             },
//           ], // Including all the specified attributes for NewCarBookings
//         },
//         {
//           model: UserMaster,
//           as: "BCAcceptedBy",
//           attributes: ["UserID", "UserName", "EmpID"], // Including attributes for the AcceptedBy user
//         },
//       ],
//     });
//     console.log("@@@@@@@@@@@@@@@@@@@@@@@", bookingCancellation);
//     if (!bookingCancellation) {
//       return res.status(404).json({ message: "bookingCancellation not found" });
//     }

//     // Step 2: Fetch FinanceApplications related to the BookingID from the BookingTransfer
//     const financeApplications = await FinanceApplication.findAll({
//       where: { BookingID: bookingCancellation.BookingID },
//       attributes: [
//         "FinAppID",
//         "BookingID",
//         "ApplicationNumber",
//         "FinancierName",
//         "LoanAmt",
//       ],
//     });
//     console.log("!!!!!!!!!!!!!!!!!!", financeApplications);
//     // Step 3: Fetch all FinStatusUpdates related to the retrieved FinanceApplications
//     const finAppIDs = financeApplications.map((app) => app.FinAppID);
//     const finStatusUpdates = await FinStatusUpdate.findAll({
//       where: { FinAppID: finAppIDs },
//       attributes: ["FinStatusID", "CurrentStage", "FinAppID"],
//     });

//     // Step 4: Fetch all FinStatusTracking related to the retrieved FinStatusUpdates
//     const finStatusIDs = finStatusUpdates.map((status) => status.FinStatusID);
//     const finStatusTracking = await FinStatusTracking.findAll({
//       where: { FinStatusID: finStatusIDs },
//       attributes: [
//         "FinStatusTrackID",
//         "FinStatusID",
//         "CurrentStage",
//         "StatusDate",
//       ],
//     });

//     // Step 5: Fetch PaymentRequests for the BookingID with RefTypeID = 1
//     // Fetch all PaymentRequests for the given BookingID where RefTypeID = 1
//     const paymentRequests = await PaymentRequests.findAll({
//       where: {
//         RefTypeID: 1, // Filter by RefTypeID = 1
//         TransactionID: bookingCancellation.BookingID, // Match TransactionID to BookingID
//       },
//     });
//     // If no matching payment requests are found
//     if (!paymentRequests || paymentRequests.length === 0) {
//       return res.status(404).json({
//         message:
//           "No payment requests found for the given BookingID with RefTypeID 1.",
//       });
//     }

//     // Step 6: Map the relationships manually
//     const financeApplicationsWithDetails = financeApplications.map((app) => {
//       const relatedUpdates = finStatusUpdates.filter(
//         (update) => update.FinAppID === app.FinAppID
//       );
//       const updatesWithTracking = relatedUpdates.map((update) => ({
//         ...update.toJSON(),
//         FinStatusTracking: finStatusTracking.filter(
//           (track) => track.FinStatusID === update.FinStatusID
//         ),
//       }));
//       return {
//         ...app.toJSON(),
//         FinStatusUpdates: updatesWithTracking,
//       };
//     });

//     // Step 7: Structure the final response
//     const response = {
//       BookingcancellationID: bookingCancellation.BookingcancellationID,
//       BookingID: bookingCancellation.BookingID,
//       AcceptedBy: bookingCancellation.AcceptedBy,
//       ToBranch: bookingCancellation.ToBranch,
//       ToBranchName: bookingCancellation.BCToBranch
//         ? bookingCancellation.BCToBranch.BranchName
//         : null,

//       FromBranch: bookingCancellation.FromBranch,
//       FromBranchName: bookingCancellation.BCFromBranch
//         ? bookingCancellation.BCFromBranch.BranchName
//         : null,
//       Reason: bookingCancellation.Reason,
//       Remarks: bookingCancellation.Remarks,
//       CancelStatus: bookingCancellation.CancelStatus,
//       IsActive: bookingCancellation.IsActive,
//       Status: bookingCancellation.Status,
//       NewCarBookings: {
//         ...(bookingCancellation.BCBookingID?.toJSON() || {}), // Safely handle undefined NewCarBookings
//       },
//       AcceptedByUserID: bookingCancellation.AcceptedBy,
//       AcceptedByUserName: bookingCancellation.BCAcceptedBy
//         ? bookingCancellation.BCAcceptedBy.UserName
//         : null,
//       FinanceApplications: financeApplicationsWithDetails,
//       PaymentRequests: paymentRequests || [],
//     };

//     // Step 8: Send the response
//     res.status(200).json(response);
//   } catch (error) {
//     // Handle errors based on specific types
//     if (error.name === "SequelizeDatabaseError") {
//       // Handle database errors
//       return res.status(500).json({
//         message:
//           "Database error occurred while retrieving the Booking Transfer.",
//         details: error.message,
//       });
//     }

//     if (error.name === "SequelizeConnectionError") {
//       // Handle connection errors
//       return res.status(503).json({
//         message: "Service unavailable. Unable to connect to the database.",
//         details: error.message,
//       });
//     }

//     console.error("Error fetching the Booking Transfer:", error);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };

// Update a bookingCancellation by the id in the request
exports.BookingCancellationrUpdate = async (req, res) => {
  try {
    // Validate request body
    if (!req.body) {
      return res.status(400).json({ message: "Request body cannot be empty." });
    }

    // Extract the ID parameter
    const bookingCancellationId = req.body.BookingcancellationID;

    // Validate the ID parameter
    if (!bookingCancellationId) {
      return res.status(400).json({ message: "ID parameter is required." });
    }

    // Find the bookingCancellation record by primary key
    let bookingCancellation = await BookingCancellation.findByPk(
      bookingCancellationId
    );

    if (!bookingCancellation) {
      return res
        .status(404)
        .json({ message: "bookingCancellation not found." });
    }

    // Update the fields
    bookingCancellation.BookingID =
      req.body.BookingID || bookingCancellation.BookingID;
    bookingCancellation.AcceptedBy =
      req.body.AcceptedBy || bookingCancellation.AcceptedBy;
    bookingCancellation.ToBranch =
      req.body.ToBranch || bookingCancellation.ToBranch;
    bookingCancellation.Reason = req.body.Reason || bookingCancellation.Reason;
    bookingCancellation.CancelStatus =
      req.body.CancelStatus || bookingCancellation.CancelStatus;
    bookingCancellation.RequestType =
      req.body.RequestType || bookingCancellation.RequestType;
    bookingCancellation.FromBranch =
      req.body.FromBranch || bookingCancellation.FromBranch;
    bookingCancellation.Remarks =
      req.body.Remarks || bookingCancellation.Remarks;
    bookingCancellation.Status = req.body.Status || bookingCancellation.Status;
    bookingCancellation.IsActive =
      req.body.IsActive !== undefined
        ? req.body.IsActive
        : bookingCancellation.IsActive;
    bookingCancellation.ModifiedDate = new Date();

    // Save the updated bookingCancellation in the database
    const updatedbookingCancellation = await bookingCancellation.save();

    return res.status(200).json(updatedbookingCancellation); // Send the updated record as response
  } catch (err) {
    // Handle specific Sequelize errors
    if (err.name === "SequelizeValidationError") {
      return res.status(400).json({
        message: "Validation error",
        details: err.errors.map((e) => e.message),
      });
    }

    if (err.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message: "Database error occurred while updating bookingCancellation.",
        details: err.message,
      });
    }

    if (err.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: err.message,
      });
    }

    // General error handling
    console.error("Error updating bookingCancellation:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
