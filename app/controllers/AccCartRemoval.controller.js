/* eslint-disable no-unused-vars */
const db = require("../models");
const AccApprovalReq = db.accapprovalreq;
const AccApprovalCartCancelReq = db.accapprovalcartcancelreq;
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
const { genAccCartRemovalNo } = require("../Utils/generateService");

// Basic CRUD API

// Create and Save a new AccApprovalReq
exports.create = async (req, res) => {
  console.log(
    "Received request to create/update Approval Cart Cancel Request for Booking ID:",
    req.body.BookingID
  );

  const transaction = await Seq.transaction(); // Start a transaction
  console.log("Transaction started.");

  try {
    // Check if an AccApprovalCartCancelReq already exists with the given BookingID
    console.log(
      "Checking if an existing cancel request exists for Booking ID..."
    );
    const existingModel = await AccApprovalCartCancelReq.findOne({
      where: { BookingID: req.body.BookingID },
      transaction, // Include the transaction in the query
    });

    if (existingModel) {
      console.log(
        "Existing cancel request found. Validating AccCartID values..."
      );

      // Check if AccCartID values are the same
      const existingAccCartID = existingModel.AccCartID;
      const newAccCartID = req.body.AccCartID || [];

      // Compare arrays (considering order doesn't matter)
      const arraysAreEqual =
        existingAccCartID.length === newAccCartID.length &&
        existingAccCartID.every((value) => newAccCartID.includes(value));

      if (arraysAreEqual) {
        console.log(
          "AccCartID arrays are equal. Duplicate cancel request detected."
        );
        return res
          .status(400)
          .json({ message: "Cancel request for this Booking already exists." });
      }

      // If they are not equal, update the AccCartID array
      console.log("Updating AccCartID values...");
      const updatedAccCartID = Array.from(
        new Set([...existingAccCartID, ...newAccCartID])
      );

      console.log("Updating existing cancel request details...");
      await existingModel.update(
        {
          AccCartID: updatedAccCartID,
          ReqDate: req.body.ReqDate || existingModel.ReqDate,
          Remarks: req.body.Remarks || existingModel.Remarks,
          TotalGrossValue:
            req.body.TotalGrossValue || existingModel.TotalGrossValue || 0,
          TotalDiscount:
            req.body.TotalDiscount || existingModel.TotalDiscount || 0,
          NetValue: req.body.NetValue || existingModel.NetValue || 0,
          NewCarAccOffer:
            req.body.NewCarAccOffer || existingModel.NewCarAccOffer || 0,
          TotalPayableAmt:
            req.body.TotalPayableAmt || existingModel.TotalPayableAmt || 0,
          RemovalReason:
            req.body.RemovalReason || existingModel.RemovalReason || null,
          ApprovalStatus:
            req.body.ApprovalStatus || existingModel.ApprovalStatus,
          ModifiedDate: new Date(), // Track when the record was last updated
        },
        { transaction } // Include the transaction in the update
      );

      if (req.body.AccCartID && Array.isArray(req.body.AccCartID)) {
        console.log("Updating cart statuses for associated AccCartIDs...");
        const approvedCartIds = req.body.AccCartID;

        await AccCart.update(
          {
            CartStatus: "Cancel Requested", // Set CartStatus to "Cancel Requested"
            CancelledBy: req.body.ReqEmpID, // Set the ReqEmpID as CancelledBy
            ModifiedDate: new Date(), // Track the modification date
          },
          {
            where: {
              AccCartID: approvedCartIds, // Match CartID in the ApprovedCart array
              CartStatus: { [Op.eq]: "Approved" }, // Only update if CartStatus is not already "Approved"
            },
            transaction, // Include the transaction in the update
          }
        );
      }

      console.log("Committing transaction for updated cancel request...");
      await transaction.commit();
      return res.status(200).json(existingModel); // Send the updated model
    }

    console.log("No existing cancel request found. Creating a new request...");
    const currentReqNo = await genAccCartRemovalNo(); // Assuming this function generates a unique ReqNo

    const approvalCartCancelRequestData = {
      ReqNo: currentReqNo || req.body.ReqNo,
      ReqDate: req.body.ReqDate || new Date(), // Default to current date if not provided
      ReqEmpID: req.body.ReqEmpID,
      BookingID: req.body.BookingID,
      BranchID: req.body.BranchID,
      AccCartID: req.body.AccCartID || [], // Default to empty array if not provided
      ApprovedEmpID: req.body.ApprovedEmpID || null,
      CancelledEmpID: req.body.CancelledEmpID || null,
      TotalGrossValue: req.body.TotalGrossValue || 0,
      TotalDiscount: req.body.TotalDiscount || 0,
      NetValue: req.body.NetValue || 0,
      NewCarAccOffer: req.body.NewCarAccOffer || 0,
      TotalPayableAmt: req.body.TotalPayableAmt || 0,
      RemovalReason: req.body.RemovalReason || null,
      Remarks: req.body.Remarks || null,
      ApprovalStatus: req.body.ApprovalStatus || "Pending", // Default to "Pending"
      IsActive: req.body.IsActive || true,
      Status: req.body.Status || "Active",
      CreatedDate: new Date(),
    };

    const newApprovalCartCancelRequest = await AccApprovalCartCancelReq.create(
      approvalCartCancelRequestData,
      { transaction }
    );

    if (req.body.AccCartID && Array.isArray(req.body.AccCartID)) {
      console.log("Updating cart statuses for new cancel request...");
      const approvedCartIds = req.body.AccCartID;

      await AccCart.update(
        {
          CartStatus: "Cancel Requested",
          CancelledBy: req.body.ReqEmpID,
          ModifiedDate: new Date(),
        },
        {
          where: {
            AccCartID: approvedCartIds,
            CartStatus: { [Op.eq]: "Approved" },
          },
          transaction,
        }
      );
    }

    console.log("Committing transaction for new cancel request...");
    await transaction.commit();

    return res.status(201).json(newApprovalCartCancelRequest);
  } catch (err) {
    console.error("Error occurred. Rolling back transaction...");
    await transaction.rollback();

    console.error("Error details:", err);
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
        message:
          "Database error occurred while creating AccApprovalCartCancelReq.",
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

// Retrieve all AccApprovalReqs from the database.
exports.findAll = async (req, res) => {
  try {
    // Fetch AccApprovalCartCancelReqs
    const approvalCartCancelRequests = await AccApprovalCartCancelReq.findAll({
      attributes: [
        "AccApprovalCartCancelReqID",
        "ReqNo",
        "ReqDate",
        "ReqEmpID",
        "BookingID",
        "BranchID",
        "AccCartID",
        "ApprovedEmpID",
        "CancelledEmpID",
        "TotalGrossValue",
        "TotalDiscount",
        "NetValue",
        "NewCarAccOffer",
        "TotalPayableAmt",
        "RemovalReason",
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
          as: "AACCRReqEmpID", // Alias for ReqEmpID
          attributes: ["UserID", "UserName", "EmpID"],
        },
        {
          model: UserMaster,
          as: "AACCRApprovedEmpID", // Alias for ApprovedEmpID
          attributes: ["UserID", "UserName", "EmpID"],
        },
        {
          model: UserMaster,
          as: "AACCRCancelledEmpID", // Alias for CancelledEmpID
          attributes: ["UserID", "UserName", "EmpID"],
        },
        {
          model: NewCarBookings,
          as: "AACCRBookingID", // Alias for BookingID
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
          as: "AACCRBranchID", // Alias for BranchID
          attributes: ["BranchID", "BranchCode", "BranchName"],
        },
      ],
      order: [
        ["AccApprovalCartCancelReqID", "ASC"], // Order by AccApprovalCartCancelReqID in ascending order
      ],
    });

    if (approvalCartCancelRequests.length === 0) {
      return res
        .status(404)
        .json({ message: "No approval cart cancel requests found" });
    }
    const response = approvalCartCancelRequests.map((item) => ({
      AccApprovalCartCancelReqID: item.AccApprovalCartCancelReqID || null,
      ReqNo: item.ReqNo || null,
      ReqDate: item.ReqDate || null,
      ReqEmpID: item.ReqEmpID || null,
      BookingID: item.BookingID || null,
      BranchID: item.BranchID || null,
      AccCartID: item.AccCartID || null,
      ApprovedEmpID: item.ApprovedEmpID || null,
      CancelledEmpID: item.CancelledEmpID || null,
      TotalGrossValue: item.TotalGrossValue || null,
      TotalDiscount: item.TotalDiscount || null,
      NetValue: item.NetValue || null,
      NewCarAccOffer: item.NewCarAccOffer || null,
      TotalPayableAmt: item.TotalPayableAmt || null,
      RemovalReason: item.RemovalReason || null,
      Remarks: item.Remarks || null,
      ApprovalStatus: item.ApprovalStatus || null,
      IsActive: item.IsActive || null,
      Status: item.Status || null,
      CreatedDate: item.CreatedDate || null,
      ModifiedDate: item.ModifiedDate || null,
      // Flatten ReqEmp, ApprovedEmp, and CancelledEmp directly into the response object
      //   ReqEmpID: item.AACCRReqEmpID ? item.AACCRReqEmpID.UserID : null,
      ReqEmpName: item.AACCRReqEmpID ? item.AACCRReqEmpID.UserName : null,
      ReqEmpEmpID: item.AACCRReqEmpID ? item.AACCRReqEmpID.EmpID : null,

      //   ApprovedEmpID: item.AACCRApprovedEmpID
      //     ? item.AACCRApprovedEmpID.UserID
      //     : null,
      ApprovedEmpName: item.AACCRApprovedEmpID
        ? item.AACCRApprovedEmpID.UserName
        : null,
      ApprovedEmpEmpID: item.AACCRApprovedEmpID
        ? item.AACCRApprovedEmpID.EmpID
        : null,

      //   CancelledEmpID: item.AACCRCancelledEmpID
      //     ? item.AACCRCancelledEmpID.UserID
      //     : null,
      CancelledEmpName: item.AACCRCancelledEmpID
        ? item.AACCRCancelledEmpID.UserName
        : null,
      CancelledEmpEmpID: item.AACCRCancelledEmpID
        ? item.AACCRCancelledEmpID.EmpID
        : null,

      // Flatten Booking details into the response object
      //   BookingID: item.AACCRBookingID ? item.AACCRBookingID.BookingID : null,
      BookingNo: item.AACCRBookingID ? item.AACCRBookingID.BookingNo : null,
      BookingTime: item.AACCRBookingID ? item.AACCRBookingID.BookingTime : null,
      PhoneNo: item.AACCRBookingID ? item.AACCRBookingID.PhoneNo : null,
      Email: item.AACCRBookingID ? item.AACCRBookingID.Email : null,
      FirstName: item.AACCRBookingID ? item.AACCRBookingID.FirstName : null,
      LastName: item.AACCRBookingID ? item.AACCRBookingID.LastName : null,
      ModelName: item.AACCRBookingID ? item.AACCRBookingID.ModelName : null,
      VariantName: item.AACCRBookingID ? item.AACCRBookingID.VariantName : null,
      ColourName: item.AACCRBookingID ? item.AACCRBookingID.ColourName : null,
      Transmission: item.AACCRBookingID
        ? item.AACCRBookingID.Transmission
        : null,
      Fuel: item.AACCRBookingID ? item.AACCRBookingID.Fuel : null,

      // Flatten Branch details into the response object
      //   BranchID: item.AACCRBranchID ? item.AACCRBranchID.BranchID : null,
      BranchCode: item.AACCRBranchID ? item.AACCRBranchID.BranchCode : null,
      BranchName: item.AACCRBranchID ? item.AACCRBranchID.BranchName : null,
    }));

    const bookingIds = approvalCartCancelRequests.map((id) => id.BookingID);
    console.log("!!!!", bookingIds);

    const accApprovalReqData = await AccApprovalReq.findAll({
      where: { BookingID: bookingIds },
    });

    // Step 3: Create a mapping of BookingID to AccCartID array
    const bookingAccCartMap = accApprovalReqData.reduce((map, req) => {
      map[req.BookingID] = req.AccCartID;
      return map;
    }, {});
    console.log("@@@@", bookingAccCartMap);
    // Step 4: Initialize an array to hold combined discount values for each booking
    const bookingDiscountValues = {};

    // Step 5: For each AccCartID array, fetch AccCart data where CartStatus is Approved
    for (const [bookingID, accCartIDs] of Object.entries(bookingAccCartMap)) {
      // Retrieve all AccCart data for each AccCartID array where CartStatus is "Approved"
      const accCartData = await AccCart.findAll({
        where: {
          AccCartID: accCartIDs,
          CartStatus: "Approved", // Filter for "Approved" CartStatus
        },
      });

      // Step 6: Calculate the combined discount value for this booking
      const combinedDiscountValue = accCartData.reduce(
        (sum, cart) => sum + (cart.DiscountValue || 0),
        0
      );

      // Store the combined discount value for this booking
      bookingDiscountValues[bookingID] = combinedDiscountValue;
    }

    // Add the Combined DiscountValue to the response
    const finalResponse = response.map((request) => {
      const combinedDiscountValue =
        bookingDiscountValues[request.BookingID] || 0;
      return {
        ...request, // Spread the original request object
        ApprovedDiscount: combinedDiscountValue, // Add the combined discount value
      };
    });

    // Return the final response
    res.status(200).json(finalResponse);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message:
          "Database error occurred while retrieving approval cart cancel requests.",
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

    console.error("Error fetching approval cart cancel requests:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Find a single AccApprovalReq with an id
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id; // Assuming the ID is passed as a URL parameter

    // Fetch a single AccApprovalCartCancelReq by its ID
    const approvalCartCancelRequest = await AccApprovalCartCancelReq.findOne({
      where: { AccApprovalCartCancelReqID: id },
      attributes: [
        "AccApprovalCartCancelReqID",
        "ReqNo",
        "ReqDate",
        "ReqEmpID",
        "BookingID",
        "BranchID",
        "AccCartID",
        "ApprovedEmpID",
        "CancelledEmpID",
        "TotalGrossValue",
        "TotalDiscount",
        "NetValue",
        "NewCarAccOffer",
        "TotalPayableAmt",
        "RemovalReason",
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
          as: "AACCRReqEmpID", // Alias for ReqEmpID
          attributes: ["UserID", "UserName", "EmpID"],
        },
        {
          model: UserMaster,
          as: "AACCRApprovedEmpID", // Alias for ApprovedEmpID
          attributes: ["UserID", "UserName", "EmpID"],
        },
        {
          model: UserMaster,
          as: "AACCRCancelledEmpID", // Alias for CancelledEmpID
          attributes: ["UserID", "UserName", "EmpID"],
        },
        {
          model: NewCarBookings,
          as: "AACCRBookingID", // Alias for BookingID
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
          as: "AACCRBranchID", // Alias for BranchID
          attributes: ["BranchID", "BranchCode", "BranchName"],
        },
      ],
    });

    if (!approvalCartCancelRequest) {
      return res
        .status(404)
        .json({ message: "Approval cart cancel request not found" });
    }
    // Retrieve the combined discount value for this specific BookingID
    const accApprovalReqData = await AccApprovalReq.findOne({
      where: { BookingID: approvalCartCancelRequest.BookingID },
    });

    const accApprovedCartData = await AccApprovedCart.findOne({
      where: { BookingID: approvalCartCancelRequest.BookingID },
    });

    console.log("!!", accApprovalReqData);
    const response = {
      AccApprovalCartCancelReqID:
        approvalCartCancelRequest.AccApprovalCartCancelReqID || null,
      ReqNo: approvalCartCancelRequest.ReqNo || null,
      ReqDate: approvalCartCancelRequest.ReqDate || null,
      ReqEmpID: approvalCartCancelRequest.ReqEmpID || null,
      BookingID: approvalCartCancelRequest.BookingID || null,
      BranchID: approvalCartCancelRequest.BranchID || null,
      AccCartID: approvalCartCancelRequest.AccCartID || null,
      ApprovedEmpID: approvalCartCancelRequest.ApprovedEmpID || null,
      CancelledEmpID: approvalCartCancelRequest.CancelledEmpID || null,
      TotalGrossValue1: approvalCartCancelRequest.TotalGrossValue || null,
      TotalDiscount1: approvalCartCancelRequest.TotalDiscount || null,
      NetValue1: approvalCartCancelRequest.NetValue || null,
      NewCarAccOffer1: approvalCartCancelRequest.NewCarAccOffer || null,
      TotalPayableAmt1: approvalCartCancelRequest.TotalPayableAmt || null,
      RemovalReason: approvalCartCancelRequest.RemovalReason || null,
      Remarks: approvalCartCancelRequest.Remarks || null,
      ApprovalStatus: approvalCartCancelRequest.ApprovalStatus || null,
      IsActive: approvalCartCancelRequest.IsActive || null,
      Status: approvalCartCancelRequest.Status || null,
      CreatedDate: approvalCartCancelRequest.CreatedDate || null,
      ModifiedDate: approvalCartCancelRequest.ModifiedDate || null,

      // Flatten ReqEmp, ApprovedEmp, and CancelledEmp directly into the response object
      ReqEmpName: approvalCartCancelRequest.AACCRReqEmpID
        ? approvalCartCancelRequest.AACCRReqEmpID.UserName
        : null,
      ReqEmpEmpID: approvalCartCancelRequest.AACCRReqEmpID
        ? approvalCartCancelRequest.AACCRReqEmpID.EmpID
        : null,

      ApprovedEmpName: approvalCartCancelRequest.AACCRApprovedEmpID
        ? approvalCartCancelRequest.AACCRApprovedEmpID.UserName
        : null,
      ApprovedEmpEmpID: approvalCartCancelRequest.AACCRApprovedEmpID
        ? approvalCartCancelRequest.AACCRApprovedEmpID.EmpID
        : null,

      CancelledEmpName: approvalCartCancelRequest.AACCRCancelledEmpID
        ? approvalCartCancelRequest.AACCRCancelledEmpID.UserName
        : null,
      CancelledEmpEmpID: approvalCartCancelRequest.AACCRCancelledEmpID
        ? approvalCartCancelRequest.AACCRCancelledEmpID.EmpID
        : null,

      // Flatten Booking details into the response object
      BookingNo: approvalCartCancelRequest.AACCRBookingID
        ? approvalCartCancelRequest.AACCRBookingID.BookingNo
        : null,
      BookingTime: approvalCartCancelRequest.AACCRBookingID
        ? approvalCartCancelRequest.AACCRBookingID.BookingTime
        : null,
      PhoneNo: approvalCartCancelRequest.AACCRBookingID
        ? approvalCartCancelRequest.AACCRBookingID.PhoneNo
        : null,
      Email: approvalCartCancelRequest.AACCRBookingID
        ? approvalCartCancelRequest.AACCRBookingID.Email
        : null,
      FirstName: approvalCartCancelRequest.AACCRBookingID
        ? approvalCartCancelRequest.AACCRBookingID.FirstName
        : null,
      LastName: approvalCartCancelRequest.AACCRBookingID
        ? approvalCartCancelRequest.AACCRBookingID.LastName
        : null,
      ModelName: approvalCartCancelRequest.AACCRBookingID
        ? approvalCartCancelRequest.AACCRBookingID.ModelName
        : null,
      VariantName: approvalCartCancelRequest.AACCRBookingID
        ? approvalCartCancelRequest.AACCRBookingID.VariantName
        : null,
      ColourName: approvalCartCancelRequest.AACCRBookingID
        ? approvalCartCancelRequest.AACCRBookingID.ColourName
        : null,
      Transmission: approvalCartCancelRequest.AACCRBookingID
        ? approvalCartCancelRequest.AACCRBookingID.Transmission
        : null,
      Fuel: approvalCartCancelRequest.AACCRBookingID
        ? approvalCartCancelRequest.AACCRBookingID.Fuel
        : null,

      // Flatten Branch details into the response object
      BranchCode: approvalCartCancelRequest.AACCRBranchID
        ? approvalCartCancelRequest.AACCRBranchID.BranchCode
        : null,
      BranchName: approvalCartCancelRequest.AACCRBranchID
        ? approvalCartCancelRequest.AACCRBranchID.BranchName
        : null,
      TotalGrossValue: accApprovedCartData?.TotalGrossValue || null,
      TotalDiscount: accApprovalReqData?.TotalDiscount || null,
      NetValue: accApprovedCartData?.NetValue || null,
      NewCarAccOffer: accApprovedCartData?.NewCarAccOffer || null,
      TotalPayableAmt: accApprovalReqData?.AccOfferAmt || null,
    };

    let accCartData = null;
    if (accApprovalReqData && accApprovalReqData.AccCartID) {
      // Fetch AccCart data for this specific AccCartID
      accCartData = await AccCart.findAll({
        where: {
          AccCartID: accApprovalReqData.AccCartID,
        },
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

      // Update CartStatus to 'Cancel Requested' for items where AccCartID matches
      // accCartData.forEach((item) => {
      //   if (response.AccCartID.includes(item.AccCartID)) {
      //     // console.log("!!!", item.AccCartID);
      //     // console.log("!!!", response.AccCartID);
      //     item.CartStatus = "Cancel Requested"; // Set CartStatus to "Cancel Requested"
      //   }
      // });
    }

    // Return the final response
    res.status(200).json({ response, accCartData });
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message:
          "Database error occurred while retrieving approval cart cancel request.",
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

    console.error("Error fetching approval cart cancel request:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Update a AccApprovalReq by the id in the request
// Update an existing AccApprovalReq by ID
exports.update = async (req, res) => {
  const { id } = req.params; // Assuming the ID is passed as a URL parameter

  try {
    // Fetch the existing AccApprovalCartCancelReq by its primary key
    let approvalCartCancelRequest = await AccApprovalCartCancelReq.findByPk(id);

    console.log(
      "Existing Approval Cart Cancel Request: ",
      approvalCartCancelRequest
    );

    if (!approvalCartCancelRequest) {
      return res
        .status(404)
        .json({ message: "Approval cart cancel request not found" });
    }

    // Update fields with the request body data or retain existing values
    approvalCartCancelRequest.ReqNo =
      req.body.ReqNo || approvalCartCancelRequest.ReqNo;
    approvalCartCancelRequest.ReqDate =
      req.body.ReqDate || approvalCartCancelRequest.ReqDate;
    approvalCartCancelRequest.ReqEmpID =
      req.body.ReqEmpID || approvalCartCancelRequest.ReqEmpID;
    approvalCartCancelRequest.BookingID =
      req.body.BookingID || approvalCartCancelRequest.BookingID;
    approvalCartCancelRequest.BranchID =
      req.body.BranchID || approvalCartCancelRequest.BranchID;
    approvalCartCancelRequest.AccCartID =
      req.body.AccCartID || approvalCartCancelRequest.AccCartID;
    approvalCartCancelRequest.ApprovedEmpID =
      req.body.ApprovedEmpID || approvalCartCancelRequest.ApprovedEmpID;
    approvalCartCancelRequest.CancelledEmpID =
      req.body.CancelledEmpID || approvalCartCancelRequest.CancelledEmpID;
    approvalCartCancelRequest.TotalGrossValue =
      req.body.TotalGrossValue || approvalCartCancelRequest.TotalGrossValue;
    approvalCartCancelRequest.TotalDiscount =
      req.body.TotalDiscount || approvalCartCancelRequest.TotalDiscount;
    approvalCartCancelRequest.NetValue =
      req.body.NetValue || approvalCartCancelRequest.NetValue;
    approvalCartCancelRequest.NewCarAccOffer =
      req.body.NewCarAccOffer || approvalCartCancelRequest.NewCarAccOffer;
    approvalCartCancelRequest.TotalPayableAmt =
      req.body.TotalPayableAmt || approvalCartCancelRequest.TotalPayableAmt;
    approvalCartCancelRequest.RemovalReason =
      req.body.RemovalReason || approvalCartCancelRequest.RemovalReason;
    approvalCartCancelRequest.Remarks =
      req.body.Remarks || approvalCartCancelRequest.Remarks;
    approvalCartCancelRequest.ApprovalStatus =
      req.body.ApprovalStatus || approvalCartCancelRequest.ApprovalStatus;
    approvalCartCancelRequest.IsActive =
      req.body.IsActive !== undefined
        ? req.body.IsActive
        : approvalCartCancelRequest.IsActive;
    approvalCartCancelRequest.Status =
      req.body.Status || approvalCartCancelRequest.Status;
    approvalCartCancelRequest.ModifiedDate = new Date(); // Update ModifiedDate to current date

    // Save the updated AccApprovalCartCancelReq in the database
    await approvalCartCancelRequest.save();

    res.status(200).json(approvalCartCancelRequest); // Send the updated approval cart cancel request as response
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message:
          "Database error occurred while updating the approval cart cancel request.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    console.error("Error updating the approval cart cancel request:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a AccApprovalReq with the specified id in the request
exports.delete = async (req, res) => {
  const { id } = req.params; // Assuming the ID is passed as a URL parameter

  try {
    // Fetch the existing AccApprovalCartCancelReq by its primary key
    const approvalCartCancelRequest = await AccApprovalCartCancelReq.findByPk(
      id
    );

    if (!approvalCartCancelRequest) {
      return res
        .status(404)
        .json({ message: "Approval cart cancel request not found" });
    }

    // Delete the approval cart cancel request
    await approvalCartCancelRequest.destroy();

    res
      .status(200)
      .json({ message: "Approval cart cancel request deleted successfully" });
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message:
          "Database error occurred while deleting the approval cart cancel request.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    console.error("Error deleting the approval cart cancel request:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.cartCancelApprovalAction = async (req, res) => {
  const {
    AccApprovalCartCancelReqID,
    AccCartID,
    Remarks,
    ApprovalStatus,
    RemovalReason,
    TotalGrossValue,
    TotalDiscount,
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

    // Check if the cancellation request exists
    let cancelRequest = await AccApprovalCartCancelReq.findByPk(
      AccApprovalCartCancelReqID,
      {
        transaction,
      }
    );
    if (!cancelRequest) {
      return res
        .status(404)
        .json({ message: "Cancellation request not found" });
    }

    // Retrieve all records from AccCart based on AccCartID
    const oldAccCart = await AccCart.findAll({
      where: {
        AccCartID: cancelRequest.AccCartID, // Assuming AccCartID is stored in cancelRequest
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
              CartStatus: "Cancelled" || ApprovalStatus,
              ApprovedBy: UserID,
              IsActive: false,
              Status: "InActive",
              ModifiedDate: currentDate,
            },
            { transaction }
          );
        })
      );

      // Update relevant AccApprovalCartCancelReq fields
      cancelRequest.ApprovedEmpID = UserID || cancelRequest.ApprovedEmpID;
      cancelRequest.RemovalReason =
        RemovalReason || cancelRequest.RemovalReason;
      cancelRequest.Remarks = Remarks || cancelRequest.Remarks;
      cancelRequest.ApprovalStatus =
        ApprovalStatus || cancelRequest.ApprovalStatus;
      cancelRequest.ModifiedDate = currentDate;

      // Update the cancellation request with financial details
      cancelRequest.TotalGrossValue =
        TotalGrossValue || cancelRequest.TotalGrossValue;
      cancelRequest.TotalDiscount =
        TotalDiscount || cancelRequest.TotalDiscount;
      cancelRequest.NetValue = NetValue || cancelRequest.NetValue;
      cancelRequest.NewCarAccOffer =
        NewCarAccOffer || cancelRequest.NewCarAccOffer;
      cancelRequest.TotalPayableAmt =
        TotalPayableAmt || cancelRequest.TotalPayableAmt;

      await cancelRequest.save({ transaction });
    }

    // If ApprovalStatus is Rejected
    if (ApprovalStatus === "Rejected") {
      // Update oldAccCart records only for IDs that match AccCartID from the request
      const filteredAccCart = oldAccCart.filter((cart) =>
        AccCartID.includes(cart.AccCartID)
      );

      await Promise.all(
        filteredAccCart.map((cart) => {
          return cart.update(
            {
              CartStatus: "Cancel Rejected" || ApprovalStatus,
              ApprovedBy: UserID,
              ModifiedDate: currentDate,
            },
            { transaction }
          );
        })
      );

      // Update the cancellation request approval status
      cancelRequest.CancelledEmpID = UserID || cancelRequest.CancelledEmpID;
      cancelRequest.Remarks = Remarks || cancelRequest.Remarks;
      cancelRequest.ApprovalStatus =
        ApprovalStatus || cancelRequest.ApprovalStatus;
      cancelRequest.ModifiedDate = currentDate;

      await cancelRequest.save({ transaction });
    }

    // If ApprovalStatus is Cancelled (Expired)
    if (ApprovalStatus === "Expired") {
      // Update oldAccCart records to reflect cancellation
      const filteredAccCart = oldAccCart.filter((cart) =>
        AccCartID.includes(cart.AccCartID)
      );

      await Promise.all(
        filteredAccCart.map((cart) => {
          return cart.update(
            {
              CartStatus: "Cancelled", // Mark as cancelled
              IsActive: false,
              ModifiedDate: currentDate,
            },
            { transaction }
          );
        })
      );

      // Mark the cancellation request as expired
      cancelRequest.Remarks = Remarks || cancelRequest.Remarks;
      cancelRequest.ApprovalStatus = "Expired";
      cancelRequest.IsActive = false;
      cancelRequest.Status = "InActive";
      cancelRequest.ModifiedDate = currentDate;

      await cancelRequest.save({ transaction });
    }

    // Commit the transaction if everything is successful
    await transaction.commit();

    // Send the updated cancellation request as response
    res.status(200).json(cancelRequest);
  } catch (error) {
    // Rollback the transaction in case of an error
    await transaction.rollback();

    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message:
          "Database error occurred while updating the cancellation request.",
        details: error.message,
      });
    }
    if (error.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }
    console.error("Error updating the cancellation request:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
