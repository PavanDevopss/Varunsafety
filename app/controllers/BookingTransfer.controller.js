/* eslint-disable no-dupe-keys */
/* eslint-disable no-unused-vars */
require("dotenv").config();
const db = require("../models");
const BookingTransfer = db.bookingtransfer;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;
const NewCarBookings = db.NewCarBookings;
const UserMaster = db.usermaster;
const BranchMaster = db.branchmaster;
const FinStatusTracking = db.finstatustracking;
const FinanceApplication = db.financeapplication;
const FinanceLoanApplication = db.financeloanapplication;
const FinAppApplicant = db.finappapplicant;
const FinStatusUpdate = db.finstatusupdate;
const PaymentRequests = db.PaymentRequests;
const CustomerReceipts = db.CustReceipt;
const VehicleAllotment = db.vehicleallotment;
const {
  generateRequestIDForBookingTransfer,
  generateBookingNo,
  genRequestNo,
} = require("../Utils/generateService");

// Basic CRUD API
// Create and Save a new BookingTransfer
exports.create = async (req, res) => {
  try {
    // Await the RequestID generation to ensure it resolves before using it
    const generatedRequestID = await generateRequestIDForBookingTransfer();

    if (req.body.BookingID) {
      // Check if a booking transfer already exists for the given BookingID
      const existingTransfer = await BookingTransfer.findOne({
        where: {
          BookingID: req.body.BookingID,
          CancelStatus: { [Op.ne]: "Rejected" }, // Ensure we're not checking rejected transfer
        },
      });

      // If a transfer request already exists for the BookingID, return an error
      if (existingTransfer) {
        return res.status(400).json({
          message:
            "A booking transfer request already exists for this Booking ID.",
        });
      }

      const paymentsPending = await PaymentRequests.findOne({
        where: {
          TransactionID: req.body.BookingID,
          RefTypeID: 1,
          RequestStatus: { [Op.eq]: "Pending" },
        },
      });

      if (paymentsPending) {
        return res
          .status(400)
          .json({ message: "Transfer is not allowed when payment is Pending" });
      }

      const allotmentPending = await VehicleAllotment.findOne({
        where: {
          BookingID: req.body.BookingID,
          AllotmentStatus: { [Op.eq]: "Allotted" },
        },
      });

      if (allotmentPending) {
        return res
          .status(400)
          .json({ message: "Transfer is not allowed when allotment is Done" });
      }
    }
    // Create a BookingTransfer
    const bookingTransfer = {
      RequestID: generatedRequestID, // Use the generated RequestID
      BookingID: req.body.BookingID,
      AcceptedBy: req.body.AcceptedBy,
      ToBranch: req.body.ToBranch,
      FromBranch: req.body.FromBranch,
      RequestType: req.body.RequestType,
      Reason: req.body.Reason,
      Remarks: req.body.Remarks,
      TransferStatus: req.body.TransferStatus,
      IsActive: req.body.IsActive || true,
      Status: req.body.Status || "Active",
    };

    // Save BookingTransfer in the database
    const newBookingTransfer = await BookingTransfer.create(bookingTransfer);

    return res.status(201).json(newBookingTransfer); // Send the newly created BookingTransfer as response
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

    console.error("Error creating BookingTransfer:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Retrieve all BookingTransfers from the database.
exports.findAllBookingTransfers = async (req, res) => {
  try {
    const RequestType = req.query.RequestType;
    const branchID = req.query.BranchID;

    // Construct the where condition based on RequestType
    let whereCondition = {};

    if (RequestType === "Received") {
      whereCondition.ToBranch = branchID;
    } else if (RequestType === "Raised") {
      whereCondition.FromBranch = branchID;
    }

    // Fetch all booking transfer data with included related data
    const bookingTransferData = await BookingTransfer.findAll({
      where: whereCondition,
      attributes: [
        "BookingTransferID",
        "RequestID",
        "BookingID",
        "RequestBy",
        "AcceptedBy",
        "ToBranch",
        "FromBranch",
        "RequestType",
        "Reason",
        "Remarks",
        "TransferStatus",
        "IsActive",
        "Status",
        "CreatedDate",
      ],
      include: [
        {
          model: NewCarBookings,
          as: "BTSBookingID",
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
          as: "BTSAcceptedBy",
          attributes: ["UserID", "UserName", "EmpID"],
        },
        {
          model: UserMaster,
          as: "BTSRequestBy",
          attributes: ["UserID", "UserName", "EmpID"],
        },
        {
          model: BranchMaster,
          as: "BTSToBranch",
          attributes: ["BranchID", "BranchName"],
        },
        {
          model: BranchMaster,
          as: "BTSFromBranch",
          attributes: ["BranchID", "BranchName"],
        },
      ],
      order: [["BookingTransferID", "ASC"]], // Order by BookingTransferID in ascending order
    });

    // Check if data is empty
    if (!bookingTransferData || bookingTransferData.length === 0) {
      return res.status(404).json({
        message: "No booking transfer data found.",
      });
    }

    const combinedData = bookingTransferData.map((item) => ({
      BookingTransferID: item.BookingTransferID,
      RequestID: item.RequestID,
      BookingID: item.BookingID,
      AcceptedBy: item.AcceptedBy,
      ToBranch: item.ToBranch,
      FromBranch: item.FromBranch,
      RequestType: item.RequestType,
      Reason: item.Reason,
      Remarks: item.Remarks,
      TransferStatus: item.TransferStatus,
      IsActive: item.IsActive,
      Status: item.Status,
      CreatedDate: item.CreatedDate,

      // Flattened: Related NewCarBookings (BTSBookingID)
      BookingNo: item.BTSBookingID ? item.BTSBookingID.BookingNo : null,
      FirstName: item.BTSBookingID ? item.BTSBookingID.FirstName : null,
      LastName: item.BTSBookingID ? item.BTSBookingID.LastName : null,
      ModelName: item.BTSBookingID ? item.BTSBookingID.ModelName : null,
      ColourName: item.BTSBookingID ? item.BTSBookingID.ColourName : null,
      VariantName: item.BTSBookingID ? item.BTSBookingID.VariantName : null,

      // Flattened: Related BranchMaster (BTSToBranch)
      ToBranch_BranchID: item.BTSToBranch ? item.BTSToBranch.BranchID : null,
      ToBranch_Name: item.BTSToBranch ? item.BTSToBranch.BranchName : null,

      // Flattened: Related BranchMaster (BTSFromBranch)
      FromBranch_BranchID: item.BTSFromBranch
        ? item.BTSFromBranch.BranchID
        : null,
      FromBranch_Name: item.BTSFromBranch
        ? item.BTSFromBranch.BranchName
        : null,

      // Flattened: Related AcceptedBy Employee (BTSAcceptedBy)
      Accepted_UserID: item.BTSAcceptedBy ? item.BTSAcceptedBy.UserID : null,
      Accepted_UserName: item.BTSAcceptedBy
        ? item.BTSAcceptedBy.UserName
        : null,
      Accepted_EmpID: item.BTSAcceptedBy ? item.BTSAcceptedBy.EmpID : null,

      // Flattened: Related AcceptedBy Employee (BTSRequestBy)
      Req_UserID: item.BTSRequestBy ? item.BTSRequestBy.UserID : null,
      Req_UserName: item.BTSRequestBy ? item.BTSRequestBy.UserName : null,
      ReqEmpID: item.BTSRequestBy ? item.BTSRequestBy.EmpID : null,
    }));

    // Send the combined data as response
    res.json(combinedData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message:
          "Database error occurred while retrieving booking transfer data.",
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
    console.error("Error retrieving booking transfer data:", error);
    return res.status(500).json({
      message:
        "Failed to retrieve booking transfer data. Please try again later.",
    });
  }
};

// Find a single BookingTransfer with an id
exports.BookingTransferDataForWeb = async (req, res) => {
  try {
    const BookingTransferID = req.query.BookingTransferID;

    // Step 1: Fetch BookingTransfer data
    const bookingTransfer = await BookingTransfer.findOne({
      where: { BookingTransferID: BookingTransferID },
      include: [
        {
          model: BranchMaster,
          as: "BTSToBranch",
          attributes: ["BranchID", "BranchName"], // Including attributes for ToBranch
        },
        {
          model: BranchMaster,
          as: "BTSFromBranch",
          attributes: ["BranchID", "BranchName"], // Including attributes for FromBranch
        },
        {
          model: NewCarBookings,
          as: "BTSBookingID",
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
          as: "BTSAcceptedBy",
          attributes: ["UserID", "UserName", "EmpID"], // Including attributes for the AcceptedBy user
        },
        {
          model: UserMaster,
          as: "BTSRequestBy",
          attributes: ["UserID", "UserName", "EmpID"],
        },
      ],
    });

    if (!bookingTransfer) {
      return res.status(404).json({ message: "BookingTransfer not found" });
    }

    // Step 2: Fetch FinanceApplications related to the BookingID from the BookingTransfer
    const financeApplications = await FinanceApplication.findAll({
      where: { BookingID: bookingTransfer.BookingID },
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
        TransactionID: bookingTransfer.BookingID, // Match TransactionID to BookingID
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
      // Direct BookingTransfer fields
      BookingTransferID: bookingTransfer.BookingTransferID,
      BookingID: bookingTransfer.BookingID,
      RequestBy: bookingTransfer.RequestBy,
      AcceptedBy: bookingTransfer.AcceptedBy,
      RequestType: bookingTransfer.RequestType,
      Reason: bookingTransfer.Reason,
      Remarks: bookingTransfer.Remarks,
      TransferStatus: bookingTransfer.TransferStatus,
      IsActive: bookingTransfer.IsActive,
      Status: bookingTransfer.Status,

      // Flattened ToBranch details
      ToBranchID: bookingTransfer?.BTSToBranch?.BranchID || null,
      ToBranchName: bookingTransfer?.BTSToBranch?.BranchName || null,

      // Flattened FromBranch details
      FromBranchID: bookingTransfer?.BTSFromBranch?.BranchID || null,
      FromBranchName: bookingTransfer?.BTSFromBranch?.BranchName || null,

      // Flattened AcceptedBy user details
      AcceptedByUserID: bookingTransfer?.BTSAcceptedBy?.UserID || null,
      AcceptedByUserName: bookingTransfer?.BTSAcceptedBy?.UserName || null,
      AcceptedByEmpID: bookingTransfer?.BTSAcceptedBy?.EmpID || null,

      // Flattened RequestBy user details
      RequestByUserID: bookingTransfer?.BTSRequestBy?.UserID || null,
      RequestByUserName: bookingTransfer?.BTSRequestBy?.UserName || null,
      RequestByEmpID: bookingTransfer?.BTSRequestBy?.EmpID || null,

      // Flattened NewCarBookings details
      BookingNo: bookingTransfer?.BTSBookingID?.BookingNo || null,
      CustomerID: bookingTransfer?.BTSBookingID?.CustomerID || null,
      Title: bookingTransfer?.BTSBookingID?.Title || null,
      FirstName: bookingTransfer?.BTSBookingID?.FirstName || null,
      LastName: bookingTransfer?.BTSBookingID?.LastName || null,
      PhoneNo: bookingTransfer?.BTSBookingID?.PhoneNo || null,
      Email: bookingTransfer?.BTSBookingID?.Email || null,
      Gender: bookingTransfer?.BTSBookingID?.Gender || null,
      DOB: bookingTransfer?.BTSBookingID?.DOB || null,
      DateOfAnniversary:
        bookingTransfer?.BTSBookingID?.DateOfAnniversary || null,
      Occupation: bookingTransfer?.BTSBookingID?.Occupation || null,
      Company: bookingTransfer?.BTSBookingID?.Company || null,
      Address: bookingTransfer?.BTSBookingID?.Address || null,
      PINCode: bookingTransfer?.BTSBookingID?.PINCode || null,
      District: bookingTransfer?.BTSBookingID?.District || null,
      State: bookingTransfer?.BTSBookingID?.State || null,
      ModelName: bookingTransfer?.BTSBookingID?.ModelName || null,
      ColourName: bookingTransfer?.BTSBookingID?.ColourName || null,
      VariantName: bookingTransfer?.BTSBookingID?.VariantName || null,
      Transmission: bookingTransfer?.BTSBookingID?.Transmission || null,
      Fuel: bookingTransfer?.BTSBookingID?.Fuel || null,
      BranchName: bookingTransfer?.BTSBookingID?.BranchName || null,
      SalesPersonID: bookingTransfer?.BTSBookingID?.SalesPersonID || null,
      BookingTime: bookingTransfer?.BTSBookingID?.BookingTime || null,
      BookingStatus: bookingTransfer?.BTSBookingID?.BookingStatus || null,
      OfficeNo: bookingTransfer?.BTSBookingID?.OfficeNo || null,
      Exchange: bookingTransfer?.BTSBookingID?.Exchange || null,
      CreatedDate: bookingTransfer?.BTSBookingID?.CreatedDate || null,

      // Flattened Salesperson details
      SalesPersonUserID:
        bookingTransfer?.BTSBookingID?.NCBSPUserID?.UserID || null,
      SalesPersonUserName:
        bookingTransfer?.BTSBookingID?.NCBSPUserID?.UserName || null,
      SalesPersonEmpID:
        bookingTransfer?.BTSBookingID?.NCBSPUserID?.EmpID || null,

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

// Update a BookingTransfer by the id in the request
exports.BookingTranferUpdate = async (req, res) => {
  const transaction = await Seq.transaction(); // Start a transaction

  try {
    // Validate request body
    if (!req.body) {
      return res.status(400).json({ message: "Request body cannot be empty." });
    }

    // Extract the ID parameter
    const bookingTransferId = req.body.BookingTransferID;

    // Validate the ID parameter
    if (!bookingTransferId) {
      return res.status(400).json({ message: "ID parameter is required." });
    }

    // Find the BookingTransfer record by primary key within the transaction
    let bookingTransfer = await BookingTransfer.findByPk(bookingTransferId, {
      include: [
        {
          model: BranchMaster,
          as: "BTSToBranch",
        },
      ],
      transaction, // Include the transaction
    });

    if (!bookingTransfer) {
      return res.status(404).json({ message: "BookingTransfer not found." });
    }

    // Perform update only if Status is "Transferred"
    if (req.body.TransferStatus === "Transferred") {
      // Retrieve the record from NewCarBookings based on BookingID within the transaction
      const existingBooking = await NewCarBookings.findOne({
        where: { BookingID: bookingTransfer.BookingID },
        transaction, // Include the transaction
      });

      if (!existingBooking) {
        return res.status(404).json({
          message: "Associated booking not found in NewCarBookings.",
        });
      }

      // Update the BookingTransfer record fields
      bookingTransfer.BookingID =
        req.body.BookingID || bookingTransfer.BookingID;
      bookingTransfer.AcceptedBy =
        req.body.AcceptedBy || bookingTransfer.AcceptedBy;
      bookingTransfer.ToBranch = req.body.ToBranch || bookingTransfer.ToBranch;
      bookingTransfer.RequestType =
        req.body.RequestType || bookingTransfer.RequestType;
      bookingTransfer.Reason = req.body.Reason || bookingTransfer.Reason;
      bookingTransfer.TransferStatus =
        req.body.TransferStatus == "Transferred"
          ? "Approved"
          : bookingTransfer.TransferStatus;
      bookingTransfer.FromBranch =
        req.body.FromBranch || bookingTransfer.FromBranch;
      bookingTransfer.Remarks = req.body.Remarks || bookingTransfer.Remarks;
      bookingTransfer.Status = req.body.Status || bookingTransfer.Status;
      bookingTransfer.IsActive =
        req.body.IsActive !== undefined
          ? req.body.IsActive
          : bookingTransfer.IsActive;
      bookingTransfer.ModifiedDate = new Date();

      // Save the updated BookingTransfer record in the database
      const updatedBookingTransfer = await bookingTransfer.save({
        transaction,
      });

      // Generate the new BookingNo (assuming it's a helper function)
      const BookingNo = await generateBookingNo(
        bookingTransfer.BTSToBranch.BranchCode
      );

      // Create a new record in NewCarBookings with updated fields within the transaction
      const newBookingData = {
        ...existingBooking.toJSON(), // Copy all fields from existingBooking
        BookingNo: BookingNo || null, // Add the new BookingNo
        SalesPersonID: bookingTransfer.RequestBy,
      };
      // Remove the primary key (BookingID) from the spread object
      delete newBookingData.BookingID;

      const newBooking = await NewCarBookings.create(newBookingData, {
        transaction,
      });

      // Update the existing NewCarBookings record to set IsActive = false and Status = 'InActive'
      await NewCarBookings.update(
        {
          IsActive: false,
          Status: "InActive",
          BookingStatus: "Transferred",
          ModifiedDate: new Date(),
        },
        {
          where: {
            BookingID: bookingTransfer.BookingID, // Update the record with the same BookingID
          },
          transaction, // Include the transaction
        }
      );
      // Store old to new ID mapping
      const paymentIdMapping = {};

      const existingPayments = await PaymentRequests.findAll({
        where: { TransactionID: bookingTransfer.BookingID, RefTypeID: 1 },
        transaction, // Include the transaction
      });

      // If no payments exist, log a message or handle accordingly
      if (existingPayments.length === 0) {
        console.log(
          `No payments found for TransactionID: ${bookingTransfer.BookingID}`
        );
      } else {
        for (const oldPayment of existingPayments) {
          // Generate a new RequestID for each payment
          const requestID = await genRequestNo();

          // Remove the primary key (ID) from the old payment object
          const oldPaymentData = { ...oldPayment.toJSON() };
          delete oldPaymentData.ID;

          // Create a new PaymentRequest with the updated RequestID
          const newPayment = await PaymentRequests.create(
            {
              ...oldPaymentData, // Copy all fields from oldPayment (excluding ID)
              RequestID: requestID, // Replace RequestID with the new one
              TransactionID: newBooking.BookingID, // Update the record with the new BookingID
            },
            { transaction } // Ensure the operation is part of the transaction
          );

          // Map old ID to new ID
          paymentIdMapping[oldPayment.ID] = newPayment.ID;

          // Update the existing PaymentRequest record to set RequestStatus to "Transferred"
          await PaymentRequests.update(
            {
              RequestStatus: "Transferred", // Update the status to "Transferred"
              ModifiedDate: new Date(), // Update the modified date
            },
            {
              where: {
                ID: oldPayment.ID, // Ensure we update the correct record
              },
              transaction, // Ensure the update is part of the transaction
            }
          );
        }
      }

      // Example of mapping structure after loop:
      // paymentIdMapping = { 1: 3, 2: 4 };
      // Use the mapping object as needed
      console.log("Payment ID Mapping:", paymentIdMapping);
      // Iterate through each mapping in paymentIdMapping
      for (const [oldPaymentID, newPaymentID] of Object.entries(
        paymentIdMapping
      )) {
        // Check if CustomerReceipts exist for the old PaymentRequestID
        const existingReceipts = await CustomerReceipts.findAll({
          where: { RequestID: oldPaymentID }, // Match the old PaymentRequestID
          transaction, // Include the transaction
        });

        // If there are receipts, update them
        if (existingReceipts.length > 0) {
          await CustomerReceipts.update(
            {
              RequestID: newPaymentID, // Set RequestID to the new ID from the mapping
              ModifiedDate: new Date(), // Set the ModifiedDate to the current date
            },
            {
              where: {
                RequestID: oldPaymentID, // Match the old PaymentRequestID
              },
              transaction, // Ensure this is part of the transaction
            }
          );
        } else {
          // Optionally log or handle the case where no receipts were found for the oldPaymentID
          console.log(`No receipts found for PaymentRequestID ${oldPaymentID}`);
        }
      }

      // const existingFinanceApplication = await FinanceApplication.findAll({
      //   where: { BookingID: bookingTransfer.BookingID },
      //   transaction, // Include the transaction
      // });
      // for (let financeApp of existingFinanceApplication) {
      //   await financeApp.update({ BookingID: newBooking.BookingID }, { transaction });
      // }

      // Check if the record exists before updating FinanceApplication
      const existingFinanceApplications = await FinanceApplication.findAll({
        where: { BookingID: bookingTransfer.BookingID },
        transaction, // Include the transaction
      });
      for (let financeApp of existingFinanceApplications) {
        await financeApp.update(
          { BookingID: newBooking.BookingID }, // New BookingID to set
          {
            transaction, // Include the transaction
          }
        );
      }

      // Check if the record exists before updating FinAppApplicant
      const existingFinAppApplicants = await FinAppApplicant.findAll({
        where: { BookingID: bookingTransfer.BookingID },
        transaction, // Include the transaction
      });
      for (let finAppApplicant of existingFinAppApplicants) {
        await finAppApplicant.update(
          { BookingID: newBooking.BookingID }, // New BookingID to set
          {
            transaction, // Include the transaction
          }
        );
      }

      // Check if the record exists before updating FinanceLoanApplication
      const existingFinanceLoanApplications =
        await FinanceLoanApplication.findAll({
          where: { BookingID: bookingTransfer.BookingID },
          transaction, // Include the transaction
        });
      for (let financeLoanApp of existingFinanceLoanApplications) {
        await financeLoanApp.update(
          { BookingID: newBooking.BookingID }, // New BookingID to set
          {
            transaction, // Include the transaction
          }
        );
      }

      // Commit the transaction if everything was successful
      await transaction.commit();

      // Respond with success message
      return res.status(200).json({
        message: "BookingTransfer updated and new booking created.",
        updatedBookingTransfer,
        newBooking,
      });
    } else if (req.body.TransferStatus === "Rejected") {
      // Update the BookingTransfer record fields

      bookingTransfer.Reason = req.body.Reason || bookingTransfer.Reason;
      bookingTransfer.TransferStatus =
        req.body.TransferStatus || bookingTransfer.TransferStatus;
      bookingTransfer.Remarks = req.body.Remarks || bookingTransfer.Remarks;
      bookingTransfer.Status = req.body.Status || bookingTransfer.Status;
      bookingTransfer.IsActive =
        req.body.IsActive !== undefined
          ? req.body.IsActive
          : bookingTransfer.IsActive;
      bookingTransfer.ModifiedDate = new Date();

      // Save the updated BookingTransfer record in the database
      const updatedBookingTransfer = await bookingTransfer.save({
        transaction,
      });

      return res.status(400).json({
        message: "BookingTransfer updated",
        updatedBookingTransfer,
      });
    } else {
      return res.status(400).json({
        message:
          "Status must be 'Transferred' or 'Rejected' to perform this operation.",
      });
    }
  } catch (err) {
    // Rollback the transaction if there's an error
    await transaction.rollback();

    // Handle specific Sequelize errors
    if (err.name === "SequelizeValidationError") {
      return res.status(400).json({
        message: "Validation error",
        details: err.errors.map((e) => e.message),
      });
    }

    if (err.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message: "Database error occurred while updating BookingTransfer.",
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
    console.error("Error updating BookingTransfer:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a BookingTransfer with the specified id in the request
exports.deleteById = async (req, res) => {
  const id = req.params.id;

  try {
    // Validate the ID parameter
    if (!id) {
      return res.status(400).json({ message: "ID parameter is required." });
    }

    // Find the model by ID
    const bookingTransfer = await BookingTransfer.findByPk(id);

    // Check if the model exists
    if (!bookingTransfer) {
      return res
        .status(404)
        .json({ message: "BookingTransfer not found with id: " + id });
    }

    // Delete the model
    await bookingTransfer.destroy();

    // Send a success message
    res.status(200).json({
      message: "BookingTransfer with id: " + id + " deleted successfully",
    });
  } catch (err) {
    // Handle errors based on specific types
    if (err.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while deleting BookingTransfer.",
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
    console.error("Error deleting BookingTransfer:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.BookingTransferSearchForMobile = async (req, res) => {
  try {
    const { CustomerID, BookingID } = req.query;

    // Validate parameters
    if (!CustomerID || !BookingID) {
      return res.status(400).json({
        message:
          "Both CustomerID and EmpID are required in the URL parameters.",
      });
    }

    console.log("Request Parameters:", req.params);

    // Fetch the booking transfer data
    const bookingTransferData = await NewCarBookings.findOne({
      where: {
        CustomerID: CustomerID,
        BookingID: BookingID,
      },
    });

    // Check if booking transfer data exists
    if (!bookingTransferData) {
      return res.status(404).json({
        message: "Booking transfer data not found.",
      });
    }

    // Fetch all PaymentRequests for the given BookingID where RefTypeID = 1
    const paymentRequests = await PaymentRequests.findAll({
      where: {
        // BookingID: id, // Match BookingID from query
        CustomerID: CustomerID, // Filter by RefTypeID = 1
        TransactionID: BookingID, // Match TransactionID to BookingID
      },
    });

    // If no matching payment requests are found
    // if (!paymentRequests || paymentRequests.length === 0) {
    //   return res.status(404).json({
    //     message:
    //       "No payment requests found for the given BookingID with RefTypeID 1.",
    //   });
    // }

    // Map PaymentRequests to only include specific fields
    const filteredPaymentRequests = paymentRequests.map((request) => ({
      RequestID: request.RequestID,
      RequestDate: request.RequestDate,
      PaymentMode: request.PaymentMode,
      Amount: request.Amount,
    }));

    // Prepare the response data
    const responseData = {
      CustomerID: bookingTransferData.CustomerID,
      BookingID: bookingTransferData.BookingID,
      BookingNo: bookingTransferData.BookingNo,
      Title: bookingTransferData.Title,
      FirstName: bookingTransferData.FirstName,
      LastName: bookingTransferData.LastName,
      PhoneNo: bookingTransferData.PhoneNo,
      OfficeNo: bookingTransferData.OfficeNo,
      Email: bookingTransferData.Email,
      Gender: bookingTransferData.Gender,
      DOB: bookingTransferData.DOB,
      DateOfAnniversary: bookingTransferData.DateOfAnniversary,
      Occupation: bookingTransferData.Occupation,
      Company: bookingTransferData.Company,
      Address: bookingTransferData.Address,
      PINCode: bookingTransferData.PINCode,
      District: bookingTransferData.District,
      State: bookingTransferData.State,
      ModelName: bookingTransferData.ModelName,
      ColourName: bookingTransferData.ColourName,
      VariantName: bookingTransferData.VariantName,
      Transmission: bookingTransferData.Transmission,
      Fuel: bookingTransferData.Fuel,
      BranchName: bookingTransferData.BranchName,
      PaymentRequests: filteredPaymentRequests, // All matched payments
    };

    // Send the response
    res.json(responseData);
  } catch (error) {
    // Handle errors
    console.error("Error retrieving booking transfer data:", error);

    if (error.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message:
          "Database error occurred while retrieving booking transfer data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    // General error response
    return res.status(500).json({
      message:
        "Failed to retrieve booking transfer data. Please try again later.",
    });
  }
};

exports.BookingTransferRequest = async (req, res) => {
  try {
    const generatedRequestID = await generateRequestIDForBookingTransfer();
    // Create a BookingTransfer
    const bookingTransfer = {
      RequestID: generatedRequestID,
      BookingID: req.body.BookingID,
      ToBranch: req.body.ToBranch,
      Reason: req.body.Reason,
      RequestType: req.body.RequestType,
      IsActive: req.body.IsActive || true,
      Status: req.body.Status || "Active",
    };

    // Save BookingTransfer in the database
    const newBookingTransfer = await BookingTransfer.create(bookingTransfer);

    return res.status(201).json(newBookingTransfer); // Send the newly created BookingTransfer as response
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

    console.error("Error creating BookingTransfer:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
