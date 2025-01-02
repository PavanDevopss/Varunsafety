/* eslint-disable no-unused-vars */
const db = require("../models");
const AccIssueReq = db.accissuereq;
const NewCarBookings = db.NewCarBookings;
const UserMaster = db.usermaster;
const AccCart = db.acccart;
const AccPartMap = db.accpartmap;
const VehicleAllotment = db.vehicleallotment;
const VehicleStock = db.vehiclestock;
const AccPartMaster = db.accpartmaster;
const AccPartsMap = db.accpartmap;
const AccJobOrder = db.accjoborder;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;
const {
  genAccIssueReqNo,
  genAccJobOrderNo,
} = require("../Utils/generateService");

// Basic CRUD API

// Create and Save a new AccIssueReq
exports.create = async (req, res) => {
  const transaction = await Seq.transaction(); // Start a transaction

  try {
    // Check if an AccIssueReq already exists with the given BookingID
    const existingModel = await AccIssueReq.findOne({
      where: { BookingID: req.body.BookingID },
      transaction, // Include transaction in query
    });

    // If the AccIssueReq already exists, check AccPartsMap for each AccCartID
    if (existingModel) {
      const existingAccIssueID = existingModel.AccIssueID;

      // Loop over the AccCartID array from the request body
      for (let i = 0; i < req.body.AccCartID.length; i++) {
        const accCartID = req.body.AccCartID[i];
        const reqQty = req.body.ReqQty[i]; // Get the specific ReqQty for this AccCartID

        // Check if there is already an AccPartsMap with the same AccIssueID and AccCartID
        const existingAccPartsMap = await AccPartsMap.findOne({
          where: {
            AccIssueID: existingAccIssueID,
            AccCartID: accCartID,
          },
          transaction, // Include transaction in query
        });

        // If no existing AccPartsMap is found, create a new AccPartsMap entry
        if (!existingAccPartsMap) {
          const accPartsMap = {
            AccCartID: accCartID,
            AccIssueID: existingAccIssueID,
            IssueDate: req.body.IssueDate || null,
            AccReturnID: req.body.AccReturnID || null,
            ReturnDate: req.body.ReturnDate || null,
            ReqQty: reqQty, // Use the corresponding ReqQty for this AccCartID
            IssueQty:
              req.body.IssueQty && req.body.IssueQty[i] !== undefined
                ? req.body.IssueQty[i]
                : null, // Check if IssueQty is provided
            FittedQty:
              req.body.FittedQty && req.body.FittedQty[i] !== undefined
                ? req.body.FittedQty[i]
                : null, // Check if FittedQty is provided
            RetunQty:
              req.body.ReturnQty && req.body.ReturnQty[i] !== undefined
                ? req.body.ReturnQty[i]
                : null, // Check if ReturnQty is provided
            FitmentStatus: req.body.FitmentStatus || "Pending",
            ReturnStatus: req.body.ReturnStatus || null,
            IsActive:
              req.body.IsActive !== undefined ? req.body.IsActive : true,
            Status: req.body.Status || "Active",
          };

          // Create the new AccPartsMap entry
          const newAccPartsMap = await AccPartsMap.create(accPartsMap, {
            transaction,
          });

          // Commit transaction and return the response with newly created AccPartsMap
          await transaction.commit();
          return res.status(201).json({
            accIssueReq: existingModel,
            createdAccPartsMap: newAccPartsMap, // Return the created AccPartsMap immediately
          });
        }
      }

      // If all the AccPartsMap entries already exist, return a message indicating no new records were created
      return res.status(200).json({
        message: "No new entries were created. All combinations already exist.",
      });
    }

    // If no existing AccIssueReq, proceed with creating a new AccIssueReq
    const currentReqNo = await genAccIssueReqNo();

    // Create the new AccIssueReq object
    const accIssueReq = {
      IssueNo: currentReqNo || req.body.IssueNo,
      IssueDate: req.body.IssueDate,
      BookingID: req.body.BookingID,
      FitmentEmpID: req.body.FitmentEmpID || null,
      ReqEmpID: req.body.UserID,
      IssuedEmpID: req.body.IssuedEmpID || null,
      AllotmentID: req.body.AllotmentID || null,
      CancelledEmpID: req.body.CancelledEmpID || null,
      Remarks: req.body.Remarks || null,
      IssueStatus: req.body.IssueStatus || null,
      IsActive: req.body.IsActive !== undefined ? req.body.IsActive : true,
      Status: req.body.Status || "Active",
    };

    // Save the new AccIssueReq in the database
    const newAccIssueReq = await AccIssueReq.create(accIssueReq, {
      transaction,
    });

    // Now create AccPartsMap entries for each AccCartID in the request body
    const createdAccPartsMaps = [];
    for (let i = 0; i < req.body.AccCartID.length; i++) {
      const accCartID = req.body.AccCartID[i];
      const reqQty = req.body.ReqQty[i]; // Get the specific ReqQty for this AccCartID
      const issueQty =
        req.body.IssueQty && req.body.IssueQty[i] !== undefined
          ? req.body.IssueQty[i]
          : null; // Check if IssueQty is provided
      const fittedQty =
        req.body.FittedQty && req.body.FittedQty[i] !== undefined
          ? req.body.FittedQty[i]
          : null; // Check if FittedQty is provided
      const returnQty =
        req.body.ReturnQty && req.body.ReturnQty[i] !== undefined
          ? req.body.ReturnQty[i]
          : null; // Check if ReturnQty is provided

      const accPartsMap = {
        AccCartID: accCartID,
        AccIssueID: newAccIssueReq.AccIssueID,
        IssueDate: req.body.IssueDate || null,
        AccReturnID: req.body.AccReturnID || null,
        ReturnDate: req.body.ReturnDate || null,
        ReqQty: reqQty, // Use the corresponding ReqQty for this AccCartID
        IssueQty: issueQty,
        FittedQty: fittedQty,
        RetunQty: returnQty,
        FitmentStatus: req.body.FitmentStatus || "Pending",
        IssuedStatus: req.body.IssuedStatus || "Pending",
        ReturnStatus: req.body.ReturnStatus || null,
        IsActive: req.body.IsActive !== undefined ? req.body.IsActive : true,
        Status: req.body.Status || "Active",
      };

      // Create each AccPartsMap entry
      const newAccPartsMap = await AccPartsMap.create(accPartsMap, {
        transaction,
      });
      createdAccPartsMaps.push(newAccPartsMap);
    }

    // Commit the transaction after all operations
    await transaction.commit();

    // Return the newly created AccIssueReq and AccPartsMap entries
    return res.status(201).json({
      accIssueReq: newAccIssueReq,
      createdAccPartsMaps: createdAccPartsMaps,
    });
  } catch (err) {
    // Rollback the transaction if any error occurs
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
        message: "Database error occurred while creating AccIssueReq.",
        details: err.message,
      });
    }

    if (err.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: err.message,
      });
    }

    console.error("Error creating AccIssueReq:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Retrieve all AccIssueReqs from the database.
exports.findAll = async (req, res) => {
  try {
    const { UserID } = req.query;

    // Check if the UserID is provided
    if (!UserID) {
      return res.status(400).json({ message: "UserID is required." });
    }

    const userData = await UserMaster.findOne({ where: { UserID: UserID } });
    const searchCondition = UserID
      ? { "$AIRReqEmpID.BranchID$": userData.BranchID, IsActive: true }
      : { IsActive: true };

    // Fetch AccIssueReqs
    const issueReqest = await AccIssueReq.findAll({
      where: {
        ...searchCondition, // Combine conditions
      },
      attributes: [
        "AccIssueID",
        "IssueNo",
        "IssueDate",
        "BookingID",
        "ReqEmpID",
        "IssuedEmpID",
        "FitmentEmpID",
        "CancelledEmpID",
        "Remarks",
        "IssueStatus",
        "IsActive",
        "Status",
        "CreatedDate",
        "ModifiedDate",
      ],
      include: [
        {
          model: AccCart,
          as: "AIRAccCartID", // Alias for the association
          attributes: ["AccCartID"],

          required: false, // Optional: This ensures it's a LEFT JOIN
          through: {
            attributes: ["ReqQty", "IssueQty"],
          },
        },
        {
          model: VehicleAllotment,
          as: "AIRAllotmentID",
          attributes: ["AllotmentReqID", "PurchaseID", "Status"],
          include: [
            {
              model: VehicleStock,
              as: "AllotPurchaseID",
              attributes: ["PurchaseID", "ChassisNo", "EngineNo"],
            },
          ],
        },
        {
          model: UserMaster,
          as: "AIRReqEmpID",
          attributes: ["UserID", "UserName", "EmpID"],
        },
        {
          model: UserMaster,
          as: "AIRIssuedEmpID",
          attributes: ["UserID", "UserName", "EmpID"],
        },
        {
          model: UserMaster,
          as: "AIRFitmentEmpID",
          attributes: ["UserID", "UserName", "EmpID"],
        },
        {
          model: UserMaster,
          as: "AIRCancelledEmpID",
          attributes: ["UserID", "UserName", "EmpID"],
        },
        {
          model: NewCarBookings,
          as: "AIRBookingID",
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
      ],
      order: [
        ["CreatedDate", "DESC"], // Order by AccIssueReqID in decending order
      ],
    });

    if (issueReqest.length === 0) {
      return res.status(404).json({ message: "No issue requests found" });
    }

    // Flatten the response and add || null after each value
    const flattenedIssueReqs = issueReqest.map((issue) => {
      // Check if there are parts in AccPartsMapData, and calculate totals if present
      const totalReqQty =
        issue.AIRAccCartID?.reduce(
          (sum, cart) => sum + (cart.AccPartsMap?.ReqQty || 0),
          0
        ) || null;

      const totalIssueQty =
        issue.AIRAccCartID?.reduce(
          (sum, cart) => sum + (cart.AccPartsMap?.IssueQty || 0),
          0
        ) || null;
      return {
        AccIssueID: issue.AccIssueID || null,
        IssueNo: issue.IssueNo || null,
        IssueDate: issue.IssueDate || null,
        BookingID: issue.BookingID || null,
        ReqEmpID: issue.ReqEmpID || null,
        IssuedEmpID: issue.IssuedEmpID || null,
        FitmentEmpID: issue.FitmentEmpID || null,
        CancelledEmpID: issue.CancelledEmpID || null,
        Remarks: issue.Remarks || null,
        IssueStatus: issue.IssueStatus || null,
        IsActive: issue.IsActive || null,
        Status: issue.Status || null,
        CreatedDate: issue.CreatedDate || null,
        ModifiedDate: issue.ModifiedDate || null,

        // Flatten the AllotPurchaseID data
        ChassisNo: issue?.AIRAllotmentID?.AllotPurchaseID?.ChassisNo || null,
        EngineNo: issue?.AIRAllotmentID?.AllotPurchaseID?.EngineNo || null,

        // Include total ReqQty and IssueQty instead of AccPartsMapData array
        ReqQty: totalReqQty,
        IssueQty: totalIssueQty,

        // Flatten the AIRReqEmpID data
        ReqEmpUserID: issue.AIRReqEmpID?.UserID || null,
        ReqEmpUserName: issue.AIRReqEmpID?.UserName || null,
        ReqEmpEmpID: issue.AIRReqEmpID?.EmpID || null,

        // // Flatten the AIRIssuedEmpID data
        // IssuedEmpUserID: issue.AIRIssuedEmpID?.UserID || null,
        // IssuedEmpUserName: issue.AIRIssuedEmpID?.UserName || null,
        // IssuedEmpEmpID: issue.AIRIssuedEmpID?.EmpID || null,

        // // Flatten the AIRFitmentEmpID data
        // FitmentEmpUserID: issue.AIRFitmentEmpID?.UserID || null,
        // FitmentEmpUserName: issue.AIRFitmentEmpID?.UserName || null,
        // FitmentEmpEmpID: issue.AIRFitmentEmpID?.EmpID || null,

        // // Flatten the AIRCancelledEmpID data
        // CancelledEmpUserID: issue.AIRCancelledEmpID?.UserID || null,
        // CancelledEmpUserName: issue.AIRCancelledEmpID?.UserName || null,
        // CancelledEmpEmpID: issue.AIRCancelledEmpID?.EmpID || null,

        // Flatten the AIRBookingID data
        BookingNo: issue.AIRBookingID?.BookingNo || null,
        BookingTime: issue.AIRBookingID?.BookingTime || null,
        PhoneNo: issue.AIRBookingID?.PhoneNo || null,
        Email: issue.AIRBookingID?.Email || null,
        FirstName: issue.AIRBookingID?.FirstName || null,
        LastName: issue.AIRBookingID?.LastName || null,
        ModelName: issue.AIRBookingID?.ModelName || null,
        VariantName: issue.AIRBookingID?.VariantName || null,
        ColourName: issue.AIRBookingID?.ColourName || null,
        Transmission: issue.AIRBookingID?.Transmission || null,
        Fuel: issue.AIRBookingID?.Fuel || null,
      };
    });

    res.status(200).json(flattenedIssueReqs);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while retrieving issue requests.",
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

    console.error("Error fetching issue requests:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// find All mobile
exports.findOneMobile = async (req, res) => {
  try {
    // Extract UserID and BookingID from the request query
    const { UserID, BookingID } = req.query;

    // Validate required fields
    if (!UserID || !BookingID) {
      return res
        .status(400)
        .json({ message: "Both UserID and BookingID are required." });
    }

    // Build the search condition for the issue request
    const searchCondition = {
      ReqEmpID: UserID, // Filter based on UserID
      BookingID: BookingID, // Filter based on BookingID
      IsActive: true,
    };

    // Fetch the AccIssueReq matching the search condition (using findOne to fetch one record)
    const issueRequest = await AccIssueReq.findOne({
      where: searchCondition, // Apply the search condition
      attributes: [
        "AccIssueID",
        "IssueNo",
        "IssueDate",
        "BookingID",
        "ReqEmpID",
        "IssuedEmpID",
        "FitmentEmpID",
        "CancelledEmpID",
        "Remarks",
        "IssueStatus",
        "IsActive",
        "Status",
        "CreatedDate",
        "ModifiedDate",
      ],
      include: [
        {
          model: AccCart,
          as: "AIRAccCartID", // Alias for the association
          required: false, // LEFT JOIN
          through: { attributes: ["ReqQty", "IssueQty"] },
          include: [
            {
              model: db.accpartmaster,
              as: "AccPartmasterID",
              include: [
                {
                  model: db.accpartimages,
                  as: "PartMasterImages",
                },
              ],
            },
          ],
        },
        {
          model: VehicleAllotment,
          as: "AIRAllotmentID",
          attributes: ["AllotmentReqID", "PurchaseID", "Status"],
          include: [
            {
              model: VehicleStock,
              as: "AllotPurchaseID",
              attributes: ["PurchaseID", "ChassisNo", "EngineNo"],
            },
          ],
        },
        {
          model: UserMaster,
          as: "AIRReqEmpID",
          attributes: ["UserID", "UserName", "EmpID"],
        },
        {
          model: UserMaster,
          as: "AIRIssuedEmpID",
          attributes: ["UserID", "UserName", "EmpID"],
        },
        {
          model: UserMaster,
          as: "AIRFitmentEmpID",
          attributes: ["UserID", "UserName", "EmpID"],
        },
        {
          model: UserMaster,
          as: "AIRCancelledEmpID",
          attributes: ["UserID", "UserName", "EmpID"],
        },
        {
          model: NewCarBookings,
          as: "AIRBookingID",
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
      ],
      order: [["CreatedDate", "DESC"]], // Order by CreatedDate (descending)
    });

    // If no issue request is found, return a 404 response
    if (!issueRequest) {
      return res.status(404).json({ message: "No issue request found" });
    }

    // Return the flattened response
    res.status(200).json(issueRequest);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message: "Database error occurred while retrieving issue request.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    console.error("Error fetching issue request:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// exports.findAll = async (req, res) => {
//   try {
//     const { UserID } = req.query;

//     // Check if the UserID is provided
//     if (!UserID) {
//       return res.status(400).json({ message: "UserID is required." });
//     }

//     const userData = await UserMaster.findOne({ where: { UserID } });

//     // Check if userData exists to prevent errors
//     if (!userData) {
//       return res.status(404).json({ message: "User not found." });
//     }

//     const searchCondition = UserID
//       ? { "$AIRReqEmpID.BranchID$": userData.BranchID } // Assuming you have the proper association
//       : {};

//     // Fetch AccIssueReqs
//     const issueReqest = await AccIssueReq.findAll({
//       where: {
//         ...searchCondition, // Combine conditions
//       },
//       attributes: [
//         "AccIssueID",
//         "IssueNo",
//         "IssueDate",
//         "BookingID",
//         "ReqEmpID",
//         "IssuedEmpID",
//         "FitmentEmpID",
//         "CancelledEmpID",
//         "Remarks",
//         "IssueStatus",
//         "IsActive",
//         "Status",
//         "CreatedDate",
//         "ModifiedDate",
//       ],
//       include: [
//         {
//           model: AccCart,
//           as: "AIRAccCartID", // Alias for the association
//           required: false, // Optional: This ensures it's a LEFT JOIN
//           through: {
//             attributes: [],
//           },
//         },
//         {
//           model: UserMaster,
//           as: "AIRReqEmpID",
//           attributes: ["UserID", "UserName", "EmpID"],
//         },
//       ],
//       order: [
//         ["CreatedDate", "DESC"], // Order by CreatedDate in descending order
//       ],
//     });

//     if (issueReqest.length === 0) {
//       return res.status(404).json({ message: "No issue requests found" });
//     }

//     res.status(200).json(issueReqest);
//   } catch (error) {
//     // Handle errors based on specific types
//     if (error.name === "SequelizeDatabaseError") {
//       return res.status(500).json({
//         message: "Database error occurred while retrieving issue requests.",
//         details: error.message,
//       });
//     }

//     if (error.name === "SequelizeConnectionError") {
//       return res.status(503).json({
//         message: "Service unavailable. Unable to connect to the database.",
//         details: error.message,
//       });
//     }

//     console.error("Error fetching issue requests:", error);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };

// Find a single AccIssueReq with an id
exports.findOne = async (req, res) => {
  try {
    const { AccIssueID, IssueNo } = req.query;

    // Check if either AccIssueID or IssueNo is provided
    if (!AccIssueID && !IssueNo) {
      return res
        .status(400)
        .json({ message: "Either AccIssueID or IssueNo is required." });
    }

    // Determine the search condition based on the provided query parameter
    const searchCondition = AccIssueID
      ? { AccIssueID: AccIssueID }
      : { IssueNo: IssueNo };

    // Fetch the issue request using the search condition
    const issueRequest = await AccIssueReq.findOne({
      where: searchCondition,
      attributes: [
        "AccIssueID",
        "IssueNo",
        "IssueDate",
        "BookingID",
        "ReqEmpID",
        "IssuedEmpID",
        "FitmentEmpID",
        "CancelledEmpID",
        "Remarks",
        "IssueStatus",
        "IsActive",
        "Status",
        "CreatedDate",
        "ModifiedDate",
      ],
      include: [
        {
          model: AccCart,
          as: "AIRAccCartID", // Alias for the association
          attributes: ["AccCartID"],
          required: false, // Optional: This ensures it's a LEFT JOIN
          through: {
            attributes: ["ReqQty", "IssueQty"],
          },
          include: [
            {
              model: AccPartMaster,
              as: "AccPartmasterID",
              attributes: ["PartMasterID", "PartCode", "PartName", "Price"],
            },
          ],
        },
        {
          model: VehicleAllotment,
          as: "AIRAllotmentID",
          attributes: ["AllotmentReqID", "PurchaseID", "Status"],
          include: [
            {
              model: VehicleStock,
              as: "AllotPurchaseID",
              attributes: ["PurchaseID", "ChassisNo", "EngineNo"],
            },
          ],
        },
        {
          model: UserMaster,
          as: "AIRReqEmpID",
          attributes: ["UserID", "UserName", "EmpID"],
        },
        {
          model: UserMaster,
          as: "AIRIssuedEmpID",
          attributes: ["UserID", "UserName", "EmpID"],
        },
        {
          model: UserMaster,
          as: "AIRFitmentEmpID",
          attributes: ["UserID", "UserName", "EmpID"],
        },
        {
          model: UserMaster,
          as: "AIRCancelledEmpID",
          attributes: ["UserID", "UserName", "EmpID"],
        },
        {
          model: NewCarBookings,
          as: "AIRBookingID",
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
      ],
    });

    if (!issueRequest) {
      return res.status(404).json({ message: "Issue request not found." });
    }

    // Flatten the response and add || null after each value
    const CustomerData = {
      AccIssueID: issueRequest.AccIssueID || null,
      IssueNo: issueRequest.IssueNo || null,
      IssueDate: issueRequest.IssueDate || null,
      BookingID: issueRequest.BookingID || null,
      ReqEmpID: issueRequest.ReqEmpID || null,
      IssuedEmpID: issueRequest.IssuedEmpID || null,
      FitmentEmpID: issueRequest.FitmentEmpID || null,
      FitmentUserName: issueRequest?.AIRFitmentEmpID?.UserName || null,
      // FitmentUser    ID: issueRequest.AIRReqEmpID?.EmpID || null,
      CancelledEmpID: issueRequest.CancelledEmpID || null,
      Remarks: issueRequest.Remarks || null,
      IssueStatus: issueRequest.IssueStatus || null,
      IsActive: issueRequest.IsActive || null,
      Status: issueRequest.Status || null,
      CreatedDate: issueRequest.CreatedDate || null,
      ModifiedDate: issueRequest.ModifiedDate || null,

      // Flatten the AllotPurchaseID data
      ChassisNo:
        issueRequest?.AIRAllotmentID?.AllotPurchaseID?.ChassisNo || null,
      EngineNo: issueRequest?.AIRAllotmentID?.AllotPurchaseID?.EngineNo || null,

      // Flatten the AIRReqEmpID data
      ReqEmpUserID: issueRequest.AIRReqEmpID?.UserID || null,
      ReqEmpUserName: issueRequest.AIRReqEmpID?.UserName || null,
      ReqEmpEmpID: issueRequest.AIRReqEmpID?.EmpID || null,

      // Flatten the AIRBookingID data
      BookingNo: issueRequest.AIRBookingID?.BookingNo || null,
      BookingTime: issueRequest.AIRBookingID?.BookingTime || null,
      PhoneNo: issueRequest.AIRBookingID?.PhoneNo || null,
      Email: issueRequest.AIRBookingID?.Email || null,
      FirstName: issueRequest.AIRBookingID?.FirstName || null,
      LastName: issueRequest.AIRBookingID?.LastName || null,
      ModelName: issueRequest.AIRBookingID?.ModelName || null,
      VariantName: issueRequest.AIRBookingID?.VariantName || null,
      ColourName: issueRequest.AIRBookingID?.ColourName || null,
      Transmission: issueRequest.AIRBookingID?.Transmission || null,
      Fuel: issueRequest.AIRBookingID?.Fuel || null,
    };

    // Extract the AccCart data and store it as AccIssueList
    const AccIssueList =
      issueRequest.AIRAccCartID?.map((cart) => ({
        AccCartID: cart.AccCartID || null,
        PartMasterID: cart.AccPartmasterID?.PartMasterID || null,
        PartCode: cart.AccPartmasterID?.PartCode || null,
        PartName: cart.AccPartmasterID?.PartName || null,
        Price: cart.AccPartmasterID?.Price || null,
        ReqQty: cart.AccPartsMap?.ReqQty || null,
        IssueQty: cart.AccPartsMap?.IssueQty || null,
      })) || [];

    res.status(200).json({ CustomerData, AccIssueList });
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while retrieving the issue request.",
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

    console.error("Error fetching issue request:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// exports.findOne = async (req, res) => {
//   const { id } = req.params; // Assuming the ID is passed as a URL parameter

//   try {
//     // Fetch the specific AccIssueReq
//     const issueReqest = await AccIssueReq.findOne({
//       where: { AccIssueID: id },
//       attributes: [
//         "AccIssueID",
//         "IssueNo",
//         "IssueDate",
//         "BookingID",
//         "FitmentEmpID",
//         "CancelledEmpID",
//         "Remarks",
//         "IssueStatus",
//         "IsActive",
//         "Status",
//         "CreatedDate",
//         "ModifiedDate",
//       ],
//       include: [
//         {
//           model: UserMaster,
//           as: "AIRFitmentEmpID",
//           attributes: ["UserID", "UserName", "EmpID"],
//         },
//         {
//           model: UserMaster,
//           as: "AIRCancelledEmpID",
//           attributes: ["UserID", "UserName", "EmpID"],
//         },
//         {
//           model: NewCarBookings,
//           as: "AIRBookingID",
//           attributes: [
//             "BookingID",
//             "BookingNo",
//             "BookingTime",
//             "PhoneNo",
//             "Email",
//             "FirstName",
//             "LastName",
//             "ModelName",
//             "VariantName",
//             "ColourName",
//             "Transmission",
//             "Fuel",
//           ],
//         },
//       ],
//       order: [
//         ["CreatedDate", "DESC"], // Order by AccIssueReqID in decending order
//       ],
//     });

//     if (issueReqest.length === 0) {
//       return res.status(404).json({ message: "No issue requests found" });
//     }

//     res.status(200).json(issueReqest);
//   } catch (error) {
//     // Handle errors based on specific types
//     if (error.name === "SequelizeDatabaseError") {
//       // Handle database errors
//       return res.status(500).json({
//         message: "Database error occurred while retrieving the issue request.",
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

//     console.error("Error fetching the issue request:", error);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };

// Update a AccIssueReq by the id in the request
// Update an existing AccIssueReq by ID
exports.AccIssueUpdateWeb = async (req, res) => {
  const transaction = await Seq.transaction(); // Start a transaction
  const currentDate = new Date();
  try {
    // Check if an AccIssueReq exists with the given AccIssueID
    const existingModel = await AccIssueReq.findOne({
      where: { AccIssueID: req.body.AccIssueID },
      transaction, // Include transaction in query
    });

    if (!existingModel) {
      return res.status(404).json({
        message: "AccIssueReq not found for the given AccIssueID",
      });
    }

    // Prepare a list to collect missing records
    const missingRecords = [];
    let issueStatus = "Pending"; // Default IssueStatus for the AccIssueReq
    let hasPartial = false; // Flag to check if there is at least one "Partial"
    // Loop through all the AccCartIDs in the request body to update AccPartsMap
    const updatedAccPartsMaps = [];
    for (let i = 0; i < req.body.AccCartID.length; i++) {
      const accCartID = req.body.AccCartID[i];

      // Make ReqQty, IssueQty, and ReturnQty optional
      const reqQty =
        req.body.ReqQty && req.body.ReqQty[i] !== undefined
          ? req.body.ReqQty[i]
          : null; // Ensure ReqQty is optional
      const issueQty =
        req.body.IssueQty && req.body.IssueQty[i] !== undefined
          ? req.body.IssueQty[i]
          : null; // Ensure IssueQty is optional
      const returnQty =
        req.body.ReturnQty && req.body.ReturnQty[i] !== undefined
          ? req.body.ReturnQty[i]
          : null; // Ensure ReturnQty is optional

      // Determine the status based on ReqQty and IssueQty
      let status = "Pending"; // Default status is "Pending"
      if (reqQty === issueQty) {
        status = "Issued"; // Fully issued
      } else if (issueQty > 0 && issueQty < reqQty) {
        status = "Partial"; // Partial issue
        hasPartial = true; // Mark that at least one part is Partial
      }

      // Find the existing AccPartsMap entry for this AccCartID and AccIssueID
      const existingAccPartsMap = await AccPartsMap.findOne({
        where: {
          AccIssueID: existingModel.AccIssueID,
          AccCartID: accCartID,
        },
        transaction, // Include transaction in query
      });

      if (existingAccPartsMap) {
        // If the entry exists, update it
        const updatedAccPartsMap = await existingAccPartsMap.update(
          {
            IssueDate:
              req.body.IssueDate ||
              existingAccPartsMap.IssueDate ||
              currentDate,
            // ReqQty: reqQty,
            IssueQty: issueQty,
            ReturnQty: returnQty, // ReturnQty is optional, can be set to null if not provided
            IssuedStatus: status, // Set the status based on ReqQty and IssueQty
            IsActive:
              req.body.IsActive !== undefined
                ? req.body.IsActive
                : existingAccPartsMap.IsActive,
            // Status: req.body.Status || existingAccPartsMap.Status,
            ModifiedDate: currentDate,
          },
          { transaction } // Include transaction in update query
        );
        updatedAccPartsMaps.push(updatedAccPartsMap);
      } else {
        // If the entry doesn't exist, add to missingRecords list
        missingRecords.push({
          AccCartID: accCartID,
          message: `AccPartsMap with AccCartID ${accCartID} does not exist.`,
        });
      }
    }

    if (missingRecords.length > 0) {
      // If there are missing records, return the missing records in the response
      return res.status(404).json({
        message: "Some AccPartsMap records do not exist.",
        missingRecords: missingRecords,
      });
    }

    // Now, determine the IssueStatus of the existing AccIssueReq based on the `AccPartsMap` statuses
    if (hasPartial) {
      issueStatus = "Partial"; // If there is at least one "Partial", set the whole `AccIssueReq` status to "Partial"
    } else if (
      updatedAccPartsMaps.every((map) => map.IssuedStatus === "Issued")
    ) {
      issueStatus = "Issued"; // If all are "Issued", set `AccIssueReq` status to "Issued"
    }

    // Update the AccIssueReq details
    const updatedAccIssueReq = await existingModel.update(
      {
        FitmentEmpID: req.body.FitmentEmpID || existingModel.FitmentEmpID,
        IssuedEmpID: req.body.UserID || existingModel.IssuedEmpID,
        CancelledEmpID: req.body.CancelledEmpID || existingModel.CancelledEmpID,
        Remarks: req.body.Remarks || existingModel.Remarks,
        IssueStatus: issueStatus || existingModel.IssueStatus,
        IsActive:
          req.body.IsActive !== undefined
            ? req.body.IsActive
            : existingModel.IsActive,
        // Status: req.body.Status || existingModel.Status,
        ModifiedDate: currentDate,
      },
      { transaction } // Include transaction in update query
    );

    // ------------- AccJobOrder Creation/Update Logic -------------
    // Check if an AccJobOrder already exists for the given AccIssueID
    const existingAccJobOrder = await AccJobOrder.findOne({
      where: { AccIssueID: existingModel.AccIssueID },
      transaction, // Include transaction in query
    });

    let accJobOrder;

    if (!existingAccJobOrder) {
      const currentJobNo = await genAccJobOrderNo();

      // Create a new AccJobOrder if it does not exist
      accJobOrder = await AccJobOrder.create(
        {
          JobOrderNo: currentJobNo || req.body.JobOrderNo,
          JobOrderDate: currentDate,
          BookingID: existingModel.BookingID,
          FitmentEmpID: existingModel.FitmentEmpID,
          CancelledEmpID: req.body.CancelledEmpID || null,
          AccIssueID: existingModel.AccIssueID,
          Remarks: req.body.Remarks || null,
          IssueStatus: existingModel.IssueStatus,
          JobStatus: req.body.JobStatus || "Requested",
          IsActive: req.body.IsActive !== undefined ? req.body.IsActive : true,
          Status: "Active",
        },
        {
          transaction, // Include transaction in query
        }
      );
    } else {
      // If AccJobOrder exists, update the necessary fields
      accJobOrder = await existingAccJobOrder.update(
        {
          IssueStatus: existingModel.IssueStatus,
          FitmentEmpID:
            req.body.FitmentEmpID || existingAccJobOrder.FitmentEmpID,
          ModifiedDate: currentDate,
        },
        { transaction } // Include transaction in update query
      );
    }
    // Find the FitmentEmpID from UserMaster, handle errors if no user is found
    let userName = null;
    try {
      const fitUser = await UserMaster.findOne({
        where: { UserID: accJobOrder?.FitmentEmpID },
      });
      if (fitUser) {
        userName = fitUser.UserName;
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      // If an error occurs, we just return userName as null
      userName = null;
    }

    // Add userName to the accJobOrder object
    accJobOrder = accJobOrder.toJSON();
    accJobOrder.UserName = userName;

    // Commit the transaction after all operations
    await transaction.commit();

    // Return the updated AccIssueReq, AccPartsMap entries, and AccJobOrder
    return res.status(200).json({
      accIssueReq: updatedAccIssueReq,
      updatedAccPartsMaps: updatedAccPartsMaps,
      accJobOrder: accJobOrder, // Return the created or updated AccJobOrder
    });
  } catch (err) {
    // Rollback the transaction if any error occurs
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
        message: "Database error occurred while updating AccIssueReq.",
        details: err.message,
      });
    }

    if (err.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: err.message,
      });
    }

    console.error("Error updating AccIssueReq:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// exports.update = async (req, res) => {
//   const { id } = req.params; // Assuming the ID is passed as a URL parameter

//   try {
//     // Fetch the existing AccIssueReq
//     let issueRequest = await AccIssueReq.findByPk(id);

//     console.log("Existing Approval Request: ", issueRequest);

//     if (!issueRequest) {
//       return res.status(404).json({ message: "issue request not found" });
//     }

//     // Update fields with the request body data or retain existing values
//     issueRequest.IssueNo = req.body.IssueNo || issueRequest.IssueNo;
//     issueRequest.IssueDate = req.body.IssueDate || issueRequest.IssueDate;
//     issueRequest.BookingID = req.body.BookingID || issueRequest.BookingID;
//     issueRequest.FitmentEmpID =
//       req.body.FitmentEmpID || issueRequest.FitmentEmpID;
//     issueRequest.CancelledEmpID =
//       req.body.CancelledEmpID || issueRequest.CancelledEmpID;
//     issueRequest.Remarks = req.body.Remarks || issueRequest.Remarks;
//     issueRequest.IssueStatus = req.body.IssueStatus || issueRequest.IssueStatus;
//     issueRequest.IsActive =
//       req.body.IsActive !== undefined
//         ? req.body.IsActive
//         : issueRequest.IsActive;
//     issueRequest.Status = req.body.Status || issueRequest.Status;
//     issueRequest.ModifiedDate = new Date(); // Update ModifiedDate to current date

//     // Save the updated AccIssueReq in the database
//     await issueRequest.save();

//     res.status(200).json(issueRequest); // Send the updated issue request as response
//   } catch (error) {
//     // Handle errors based on specific types
//     if (error.name === "SequelizeDatabaseError") {
//       return res.status(500).json({
//         message: "Database error occurred while updating the issue request.",
//         details: error.message,
//       });
//     }

//     if (error.name === "SequelizeConnectionError") {
//       return res.status(503).json({
//         message: "Service unavailable. Unable to connect to the database.",
//         details: error.message,
//       });
//     }

//     console.error("Error updating the issue request:", error);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };

// Delete a AccIssueReq with the specified id in the request
exports.delete = async (req, res) => {
  const { id } = req.params; // Assuming the ID is passed as a URL parameter

  try {
    // Fetch the existing AccIssueReq
    const issueRequest = await AccIssueReq.findByPk(id);

    if (!issueRequest) {
      return res.status(404).json({ message: "Issue request not found" });
    }

    // Delete the approval request
    await issueRequest.destroy();

    res.status(200).json({ message: "Issue request deleted successfully" });
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message: "Database error occurred while deleting the issue request.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    console.error("Error deleting the issue request:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.cancelOrder = async (req, res) => {
  const transaction = await Seq.transaction(); // Start a transaction
  const currentDate = new Date();

  // console.log("Transaction started at:", currentDate);

  try {
    // Retrieve AccIssueReq and include related AccCart and AccPartsMap
    // console.log(
    //   "Checking if AccIssueReq exists for AccIssueID:",
    //   req.body.AccIssueID
    // );

    const existingModel = await AccIssueReq.findOne({
      where: { AccIssueID: req.body.AccIssueID },
      include: [
        {
          model: AccCart,
          as: "AIRAccCartID", // Alias for the association
          attributes: ["AccCartID"],
          required: false, // Optional: This ensures it's a LEFT JOIN
          through: {
            attributes: ["ReqQty", "IssueQty"], // Include ReqQty and IssueQty in the join table
          },
          include: [
            {
              model: AccPartMaster,
              as: "AccPartmasterID", // Access the parts information
              attributes: ["PartMasterID", "PartCode", "PartName", "Price"],
            },
          ],
        },
      ],
      transaction, // Include transaction in query
    });

    if (!existingModel) {
      // console.log(
      //   "AccIssueReq not found for the given AccIssueID:",
      //   req.body.AccIssueID
      // );
      return res.status(404).json({
        message: "AccIssueReq not found for the given AccIssueID",
      });
    }

    // console.log("Found AccIssueReq:", existingModel);

    // Check if any AccCart has IssueQty > 0
    let isAnyProductIssued = false;

    // Loop through the AIRAccCartID array (which is the array of associated AccCart records)
    for (const cart of existingModel.AIRAccCartID) {
      // console.log("Checking AccCartID:", cart.AccCartID);

      // Check the IssueQty for each AccPartsMap in the AccCart
      if (cart.AccPartsMap && cart.AccPartsMap.IssueQty > 0) {
        isAnyProductIssued = true;
        // console.log("Found issued product in AccCartID:", cart.AccCartID);
        break; // No need to check further if any product has IssueQty > 0
      } else {
        console.log("No issued products in AccCartID:", cart.AccCartID);
      }
    }

    // If any product is already issued, abort cancellation
    if (isAnyProductIssued) {
      // console.log("Cancellation aborted due to issued product(s).");
      return res.status(400).json({
        message: "Cannot cancel products that have already been issued.",
      });
    }

    // Proceed with cancellation: Update the AccIssueReq status
    // console.log("Proceeding with order cancellation, updating AccIssueReq...");

    const updatedAccIssueReq = await existingModel.update(
      {
        CancelledEmpID: req.body.CancelledEmpID || existingModel.CancelledEmpID,
        Remarks: req.body.Remarks || existingModel.Remarks,
        IssueStatus: req.body.Status || existingModel.IssueStatus,
        IsActive: false,
        Status: "InActive",
        ModifiedDate: currentDate,
      },
      { transaction } // Include transaction in update query
    );

    // console.log("AccIssueReq updated successfully:", updatedAccIssueReq);

    // Commit the transaction after all operations
    await transaction.commit();
    // console.log("Transaction committed successfully.");

    // Return the updated AccIssueReq
    return res.status(200).json({
      accIssueReq: updatedAccIssueReq,
    });
  } catch (err) {
    // Rollback the transaction if any error occurs
    await transaction.rollback();
    console.log("Transaction rolled back due to error:", err);

    // Handle errors based on specific types
    if (err.name === "SequelizeValidationError") {
      console.log("SequelizeValidationError:", err.errors);
      return res.status(400).json({
        message: "Validation error",
        details: err.errors.map((e) => e.message),
      });
    }

    if (err.name === "SequelizeUniqueConstraintError") {
      console.log("SequelizeUniqueConstraintError:", err.errors);
      return res.status(400).json({
        message: "Unique constraint error",
        details: err.errors.map((e) => e.message),
      });
    }

    if (err.name === "SequelizeDatabaseError") {
      console.log("SequelizeDatabaseError:", err.message);
      return res.status(500).json({
        message: "Database error occurred while updating AccIssueReq.",
        details: err.message,
      });
    }

    if (err.name === "SequelizeConnectionError") {
      console.log("SequelizeConnectionError:", err.message);
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: err.message,
      });
    }

    console.error("Error updating AccIssueReq:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
