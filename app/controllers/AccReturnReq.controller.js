/* eslint-disable no-unused-vars */
const db = require("../models");
const { genAccReturnReqNo } = require("../Utils/generateService");
const AccReturnReq = db.accreturnreq;
const NewCarBookings = db.NewCarBookings;
const UserMaster = db.usermaster;
const AccIssueReq = db.accissuereq;
const AccPartsMap = db.accpartmap;
const VehicleAllotment = db.vehicleallotment;
const VehicleStock = db.vehiclestock;
const AccCart = db.acccart;
const AccPartMaster = db.accpartmaster;
const AccPartImages = db.accpartimages;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;

// Basic CRUD API

// Create and Save a new AccReturnReq
exports.create = async (req, res) => {
  // Start a transaction
  const transaction = await Seq.transaction();

  try {
    // Step 1: Validate required fields in req.body
    const { AccCartID, ReturnQty, AccIssueID } = req.body;

    if (!AccCartID) {
      return res.status(400).json({ message: "AccCartID is required." });
    }

    if (!ReturnQty) {
      return res.status(400).json({ message: "ReturnQty is required." });
    }

    if (!AccIssueID) {
      return res.status(400).json({ message: "AccIssueID is required." });
    }

    // Step 2: Create AccReturnReq record within the transaction
    const currentReturnReqNo = await genAccReturnReqNo();
    const accReturnReq = {
      ReturnNo: currentReturnReqNo || req.body.ReturnNo,
      ReturnDate: req.body.ReturnDate || new Date(),
      AccIssueID: AccIssueID || null,
      BookingID: req.body.BookingID || null,
      FitReturnEmpID: req.body.FitReturnEmpID || null,
      ApprovedEmpID: req.body.ApprovedEmpID || null,
      CancelledEmpID: req.body.CancelledEmpID || null,
      Remarks: req.body.Remarks || null,
      ReturnStatus: req.body.ReturnStatus || null,
      IsActive: req.body.IsActive !== undefined ? req.body.IsActive : true,
      Status: req.body.Status || "Active",
    };

    const newAccReturnReq = await AccReturnReq.create(accReturnReq, {
      transaction,
    });

    // Step 3: Query AccPartsMap table using AccIssueID and AccCartID
    const accPartsMap = await AccPartsMap.findOne({
      where: {
        AccIssueID: AccIssueID,
        AccCartID: AccCartID,
      },
      transaction, // Pass the transaction context here
    });

    if (!accPartsMap) {
      await transaction.rollback(); // Rollback the transaction if AccPartsMap not found
      return res.status(404).json({
        message:
          "AccPartsMap record not found for the given AccIssueID and AccCartID.",
      });
    }

    // Step 4: Update the AccPartsMap record with the new return data
    accPartsMap.AccReturnID = newAccReturnReq.AccReturnID;
    accPartsMap.ReturnDate = req.body.ReturnDate || new Date();
    accPartsMap.ReturnQty = req.body.ReturnQty || 0; // Defaulting to 0 if not provided
    accPartsMap.ReturnStatus = newAccReturnReq.ReturnStatus;

    await accPartsMap.save({ transaction }); // Save the updated record within the transaction

    // Commit the transaction if all operations are successful
    await transaction.commit();

    // Return the new AccReturnReq as a response
    return res.status(201).json(newAccReturnReq);
  } catch (err) {
    // If any error occurs, rollback the transaction
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
        message: "Database error occurred while creating AccReturnReq.",
        details: err.message,
      });
    }

    if (err.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: err.message,
      });
    }

    console.error("Error creating AccReturnReq:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Retrieve all AccReturnReqs from the database.
exports.findAll = async (req, res) => {
  try {
    const { UserID } = req.query;

    // Check if the UserID is provided
    if (!UserID) {
      return res.status(400).json({ message: "UserID is required." });
    }

    const userData = await UserMaster.findOne({ where: { UserID: UserID } });
    const searchCondition = UserID
      ? {
          "$ARRFitReturnEmpID.BranchID$": userData.BranchID,
          IsActive: true,
          ReturnStatus: { [Op.ne]: "Returned" },
        }
      : {
          IsActive: true,
          ReturnStatus: { [Op.ne]: "Returned" },
        };

    // Fetch AccReturnReqs
    const returnReqest = await AccReturnReq.findAll({
      where: {
        ...searchCondition, // Combine conditions
      },
      attributes: [
        "AccReturnID",
        "ReturnNo",
        "ReturnDate",
        "AccIssueID",
        "BookingID",
        "FitReturnEmpID",
        "ApprovedEmpID",
        "CancelledEmpID",
        "Remarks",
        "ReturnStatus",
        "IsActive",
        "Status",
        "CreatedDate",
        "ModifiedDate",
      ],
      include: [
        {
          model: AccCart,
          as: "ARRAccCartID", // Alias for the association
          attributes: ["AccCartID"],
          required: false, // Optional: This ensures it's a LEFT JOIN
          through: {
            attributes: ["ReturnQty", "IssueQty"],
          },
        },
        {
          model: AccIssueReq,
          as: "ARRAccIssueID",
          attributes: ["IssueNo", "IssueDate"],
          include: [
            {
              model: VehicleAllotment,
              as: "AIRAllotmentID",
              attributes: ["AllotmentReqID"],
              include: [
                {
                  model: VehicleStock,
                  as: "AllotPurchaseID",
                  attributes: ["ChassisNo"],
                },
              ],
            },
          ],
        },
        {
          model: UserMaster,
          as: "ARRFitReturnEmpID",
          attributes: ["UserID", "UserName", "EmpID"],
        },
        {
          model: UserMaster,
          as: "ARRApprovedEmpID",
          attributes: ["UserID", "UserName", "EmpID"],
        },
        {
          model: UserMaster,
          as: "ARRCancelledEmpID",
          attributes: ["UserID", "UserName", "EmpID"],
        },
        {
          model: NewCarBookings,
          as: "ARRBookingID",
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
      order: [["CreatedDate", "DESC"]],
    });

    if (returnReqest.length === 0) {
      return res.status(404).json({ message: "No return requests found" });
    }

    // Map the data to flatten the response
    const flattenedData = returnReqest.map((returnReq) => {
      const flattened = {
        AccReturnID: returnReq.AccReturnID,
        ReturnNo: returnReq.ReturnNo,
        ReturnDate: returnReq.ReturnDate,
        AccIssueID: returnReq.AccIssueID,
        BookingID: returnReq.BookingID,
        FitReturnEmpID: returnReq.FitReturnEmpID,
        ApprovedEmpID: returnReq.ApprovedEmpID,
        CancelledEmpID: returnReq.CancelledEmpID,
        Remarks: returnReq.Remarks,
        ReturnStatus: returnReq.ReturnStatus,
        IsActive: returnReq.IsActive,
        Status: returnReq.Status,
        CreatedDate: returnReq.CreatedDate,
        ModifiedDate: returnReq.ModifiedDate,

        // Flattening ARRAccCartID
        AccCartID:
          returnReq.ARRAccCartID.length > 0
            ? returnReq.ARRAccCartID[0].AccCartID
            : null,
        ReturnQty:
          returnReq.ARRAccCartID.length > 0
            ? returnReq.ARRAccCartID[0].AccPartsMap.ReturnQty
            : null,
        IssueQty:
          returnReq.ARRAccCartID.length > 0
            ? returnReq.ARRAccCartID[0].AccPartsMap.IssueQty
            : null,

        // Flattening ARRAccIssueID
        IssueNo: returnReq.ARRAccIssueID.IssueNo,
        IssueDate: returnReq.ARRAccIssueID.IssueDate,
        AllotmentReqID: returnReq.ARRAccIssueID.AIRAllotmentID
          ? returnReq.ARRAccIssueID.AIRAllotmentID.AllotmentReqID
          : null,
        ChassisNo:
          returnReq.ARRAccIssueID.AIRAllotmentID &&
          returnReq.ARRAccIssueID.AIRAllotmentID.AllotPurchaseID
            ? returnReq.ARRAccIssueID.AIRAllotmentID.AllotPurchaseID.ChassisNo
            : null,

        // Flattening ARRFitReturnEmpID
        FitReturnEmpUserID: returnReq.ARRFitReturnEmpID.UserID,
        FitReturnEmpUserName: returnReq.ARRFitReturnEmpID.UserName,
        FitReturnEmpEmpID: returnReq.ARRFitReturnEmpID.EmpID,

        // Flattening ARRApprovedEmpID
        ApprovedEmpUserID: returnReq.ARRApprovedEmpID
          ? returnReq.ARRApprovedEmpID.UserID
          : null,
        ApprovedEmpUserName: returnReq.ARRApprovedEmpID
          ? returnReq.ARRApprovedEmpID.UserName
          : null,
        ApprovedEmpEmpID: returnReq.ARRApprovedEmpID
          ? returnReq.ARRApprovedEmpID.EmpID
          : null,

        // Flattening ARRCancelledEmpID
        CancelledEmpUserID: returnReq.ARRCancelledEmpID
          ? returnReq.ARRCancelledEmpID.UserID
          : null,
        CancelledEmpUserName: returnReq.ARRCancelledEmpID
          ? returnReq.ARRCancelledEmpID.UserName
          : null,
        CancelledEmpEmpID: returnReq.ARRCancelledEmpID
          ? returnReq.ARRCancelledEmpID.EmpID
          : null,

        // Flattening ARRBookingID
        BookingNo: returnReq.ARRBookingID.BookingNo,
        BookingTime: returnReq.ARRBookingID.BookingTime,
        PhoneNo: returnReq.ARRBookingID.PhoneNo,
        Email: returnReq.ARRBookingID.Email,
        FirstName: returnReq.ARRBookingID.FirstName,
        LastName: returnReq.ARRBookingID.LastName,
        ModelName: returnReq.ARRBookingID.ModelName,
        VariantName: returnReq.ARRBookingID.VariantName,
        ColourName: returnReq.ARRBookingID.ColourName,
        Transmission: returnReq.ARRBookingID.Transmission,
        Fuel: returnReq.ARRBookingID.Fuel,
      };

      return flattened;
    });

    res.status(200).json(flattenedData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message: "Database error occurred while retrieving return requests.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    console.error("Error fetching return requests:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Find a single AccReturnReq with an id
exports.findOne = async (req, res) => {
  const { id } = req.params; // Assuming the ID is passed as a URL parameter

  try {
    // Fetch the specific AccReturnReq
    const returnReqest = await AccReturnReq.findOne({
      where: { AccReturnID: id },
      attributes: [
        "AccReturnID",
        "ReturnNo",
        "ReturnDate",
        "AccIssueID",
        "BookingID",
        "FitReturnEmpID",
        "ApprovedEmpID",
        "CancelledEmpID",
        "Remarks",
        "ReturnStatus",
        "IsActive",
        "Status",
        "CreatedDate",
        "ModifiedDate",
      ],
      include: [
        {
          model: AccIssueReq,
          as: "ARRAccIssueID",
          attributes: ["IssueNo", "IssueDate"],
        },
        {
          model: UserMaster,
          as: "ARRFitReturnEmpID",
          attributes: ["UserID", "UserName", "EmpID"],
        },
        {
          model: UserMaster,
          as: "ARRApprovedEmpID",
          attributes: ["UserID", "UserName", "EmpID"],
        },
        {
          model: UserMaster,
          as: "ARRCancelledEmpID",
          attributes: ["UserID", "UserName", "EmpID"],
        },
        {
          model: NewCarBookings,
          as: "ARRBookingID",
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
        ["CreatedDate", "DESC"], // Order by AccReturnReqID in decending order
      ],
    });

    if (returnReqest.length === 0) {
      return res.status(404).json({ message: "No return requests found" });
    }

    res.status(200).json(returnReqest);
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

    console.error("Error fetching the issue request:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.findOneWeb = async (req, res) => {
  try {
    const { AccReturnID, ReturnNo } = req.query;

    // Check if either AccIssueID or IssueNo is provided
    if (!AccReturnID && !ReturnNo) {
      return res
        .status(400)
        .json({ message: "Either AccIssueID or IssueNo is required." });
    }

    // Determine the search condition based on the provided query parameter
    const searchCondition = AccReturnID
      ? { AccReturnID: AccReturnID }
      : { ReturnNo: ReturnNo };

    // Fetch the issue request using the search condition
    const issueRequest = await AccReturnReq.findOne({
      where: searchCondition,
      attributes: [
        "AccReturnID",
        "ReturnNo",
        "ReturnDate",
        "AccIssueID",
        "BookingID",
        "FitReturnEmpID",
        "ApprovedEmpID",
        "CancelledEmpID",
        "Remarks",
        "ReturnStatus",
        "IsActive",
        "Status",
        "CreatedDate",
        "ModifiedDate",
      ],
      include: [
        {
          model: AccCart,
          as: "ARRAccCartID", // Alias for the association
          attributes: ["AccCartID"],
          required: false, // Optional: This ensures it's a LEFT JOIN
          through: {
            attributes: ["ReturnQty", "IssueQty"],
          },
          include: [
            {
              model: AccPartMaster,
              as: "AccPartmasterID",
              attributes: ["PartMasterID", "PartCode", "PartName", "Price"],
            },
          ],
        },
        // {
        //   model: VehicleAllotment,
        //   as: "AIRAllotmentID",
        //   attributes: ["AllotmentReqID", "PurchaseID", "Status"],
        //   include: [
        //     {
        //       model: VehicleStock,
        //       as: "AllotPurchaseID",
        //       attributes: ["PurchaseID", "ChassisNo", "EngineNo"],
        //     },
        //   ],
        // },
        // {
        //   model: UserMaster,
        //   as: "AIRReqEmpID",
        //   attributes: ["UserID", "UserName", "EmpID"],
        // },
        // {
        //   model: UserMaster,
        //   as: "AIRIssuedEmpID",
        //   attributes: ["UserID", "UserName", "EmpID"],
        // },
        // {
        //   model: UserMaster,
        //   as: "AIRFitmentEmpID",
        //   attributes: ["UserID", "UserName", "EmpID"],
        // },
        // {
        //   model: UserMaster,
        //   as: "AIRCancelledEmpID",
        //   attributes: ["UserID", "UserName", "EmpID"],
        // },
        {
          model: NewCarBookings,
          as: "ARRBookingID",
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

    // Flatten the first response with main fields
    const mainResponse = {
      AccReturnID: issueRequest.AccReturnID || null,
      ReturnNo: issueRequest.ReturnNo || null,
      ReturnDate: issueRequest.ReturnDate || null,
      AccIssueID: issueRequest.AccIssueID || null,
      BookingID: issueRequest.BookingID || null,
      FitReturnEmpID: issueRequest.FitReturnEmpID || null,
      ApprovedEmpID: issueRequest.ApprovedEmpID || null,
      CancelledEmpID: issueRequest.CancelledEmpID || null,
      Remarks: issueRequest.Remarks || null,
      ReturnStatus: issueRequest.ReturnStatus || null,
      IsActive: issueRequest.IsActive || null,
      Status: issueRequest.Status || null,
      CreatedDate: issueRequest.CreatedDate || null,
      ModifiedDate: issueRequest.ModifiedDate || null,

      // Flattening the ARRBookingID data
      BookingNo: issueRequest.ARRBookingID?.BookingNo || null,
      BookingTime: issueRequest.ARRBookingID?.BookingTime || null,
      PhoneNo: issueRequest.ARRBookingID?.PhoneNo || null,
      Email: issueRequest.ARRBookingID?.Email || null,
      FirstName: issueRequest.ARRBookingID?.FirstName || null,
      LastName: issueRequest.ARRBookingID?.LastName || null,
      ModelName: issueRequest.ARRBookingID?.ModelName || null,
      VariantName: issueRequest.ARRBookingID?.VariantName || null,
      ColourName: issueRequest.ARRBookingID?.ColourName || null,
      Transmission: issueRequest.ARRBookingID?.Transmission || null,
      Fuel: issueRequest.ARRBookingID?.Fuel || null,
    };

    // Flatten the second response with AccCart and AccPartMaster data
    const accCartResponse =
      issueRequest.ARRAccCartID?.map((cart) => ({
        AccCartID: cart.AccCartID || null,
        PartMasterID: cart.AccPartmasterID?.PartMasterID || null,
        PartCode: cart.AccPartmasterID?.PartCode || null,
        PartName: cart.AccPartmasterID?.PartName || null,
        Price: cart.AccPartmasterID?.Price || null,
        ReturnQty: cart.AccPartsMap?.ReturnQty || null,
        IssueQty: cart.AccPartsMap?.IssueQty || null,
        ReturnDate: issueRequest.ReturnDate || null,
      })) || [];

    // Return both JSON objects in the response
    res.status(200).json({
      mainResponse,
      accCartResponse,
    });
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

// Update a AccReturnReq by the id in the request
// Update an existing AccReturnReq by ID
exports.update = async (req, res) => {
  const { id } = req.params; // Assuming the ID is passed as a URL parameter

  try {
    // Fetch the existing AccReturnReq
    let returnRequest = await AccReturnReq.findByPk(id);

    console.log("Existing Approval Request: ", returnRequest);

    if (!returnRequest) {
      return res.status(404).json({ message: "return request not found" });
    }

    // Update fields with the request body data or retain existing values
    returnRequest.ReturnNo = req.body.ReturnNo || returnRequest.ReturnNo;
    returnRequest.ReturnDate = req.body.ReturnDate || returnRequest.ReturnDate;
    returnRequest.AccIssueID = req.body.AccIssueID || returnRequest.AccIssueID;
    returnRequest.BookingID = req.body.BookingID || returnRequest.BookingID;
    returnRequest.FitReturnEmpID =
      req.body.FitReturnEmpID || returnRequest.FitReturnEmpID;
    returnRequest.ApprovedEmpID =
      req.body.ApprovedEmpID || returnRequest.ApprovedEmpID;
    returnRequest.CancelledEmpID =
      req.body.CancelledEmpID || returnRequest.CancelledEmpID;
    returnRequest.Remarks = req.body.Remarks || returnRequest.Remarks;
    returnRequest.ReturnStatus =
      req.body.ReturnStatus || returnRequest.ReturnStatus;
    returnRequest.IsActive =
      req.body.IsActive !== undefined
        ? req.body.IsActive
        : returnRequest.IsActive;
    returnRequest.Status = req.body.Status || returnRequest.Status;
    returnRequest.ModifiedDate = new Date(); // Update ModifiedDate to current date

    // Save the updated AccReturnReq in the database
    await returnRequest.save();

    res.status(200).json(returnRequest); // Send the updated issue request as response
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message: "Database error occurred while updating the issue request.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    console.error("Error updating the issue request:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Return Approval API
exports.AccReturnUpdateWeb = async (req, res) => {
  const transaction = await Seq.transaction(); // Start a transaction
  const currentDate = new Date();
  const { AccReturnID, ApprovedEmpID, CancelledEmpID, Remarks, ReturnStatus } =
    req.body;

  if (!AccReturnID) {
    return res.status(400).json({
      message: "AccReturnID is required.",
    });
  }

  try {
    // Check if an AccReturnReq exists with the given AccReturnID
    const existingModel = await AccReturnReq.findOne({
      where: { AccReturnID },
      transaction,
    });

    if (!existingModel) {
      return res.status(404).json({
        message: "AccReturnReq not found for the given AccReturnID",
      });
    }

    // Check if an AccPartsMap exists with the given AccReturnID
    const existingPartsMap = await AccPartsMap.findOne({
      where: { AccReturnID },
      transaction,
    });

    if (!existingPartsMap) {
      return res.status(404).json({
        message: "AccPartsMap not found for the given AccReturnID",
      });
    }

    // Update the AccReturnReq details if there are changes
    const updatedAccReturnReq = await existingModel.update(
      {
        ApprovedEmpID: ApprovedEmpID || existingModel.ApprovedEmpID,
        CancelledEmpID: CancelledEmpID || existingModel.CancelledEmpID,
        Remarks: Remarks || existingModel.Remarks,
        ReturnStatus: ReturnStatus || existingModel.ReturnStatus,
        ModifiedDate: currentDate,
      },
      { transaction }
    );

    // Update the AccPartsMap details if there are changes
    const updatedAccPartsMaps = await existingPartsMap.update(
      {
        ReturnStatus: ReturnStatus || existingPartsMap.ReturnStatus,
        ModifiedDate: currentDate,
      },
      { transaction }
    );

    // Commit the transaction after all operations
    await transaction.commit();

    // Return the updated entities
    return res.status(200).json({
      message: "AccReturnReq and AccPartsMap updated successfully.",
      accReturnReq: updatedAccReturnReq,
      accPartsMap: updatedAccPartsMaps,
    });
  } catch (err) {
    // Rollback the transaction if any error occurs
    await transaction.rollback();

    // Handle different Sequelize errors with custom messages
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
        message: "Database error occurred while updating records.",
        details: err.message,
      });
    }

    if (err.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: err.message,
      });
    }

    console.error("Error updating records:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a AccReturnReq with the specified id in the request
exports.delete = async (req, res) => {
  const { id } = req.params; // Assuming the ID is passed as a URL parameter

  try {
    // Fetch the existing AccReturnReq
    const returnRequest = await AccReturnReq.findByPk(id);

    if (!returnRequest) {
      return res.status(404).json({ message: "Return request not found" });
    }

    // Delete the Return request
    await returnRequest.destroy();

    res.status(200).json({ message: "Return request deleted successfully" });
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message: "Database error occurred while deleting the Return request.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    console.error("Error deleting the Return request:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.findAllReturnedList = async (req, res) => {
  try {
    const { UserID } = req.query;

    // Check if the UserID is provided
    if (!UserID) {
      return res.status(400).json({ message: "UserID is required." });
    }

    const userData = await UserMaster.findOne({ where: { UserID: UserID } });
    const searchCondition = UserID
      ? {
          "$ARRFitReturnEmpID.BranchID$": userData.BranchID,
          IsActive: true,
          ReturnStatus: { [Op.ne]: "Pending" },
        }
      : {
          IsActive: true,
          ReturnStatus: { [Op.ne]: "Pending" },
        };

    // Fetch AccReturnReqs
    const returnReqest = await AccReturnReq.findAll({
      where: {
        ...searchCondition, // Combine conditions
      },
      attributes: [
        "AccReturnID",
        "ReturnNo",
        "ReturnDate",
        "AccIssueID",
        "BookingID",
        "FitReturnEmpID",
        "ApprovedEmpID",
        "CancelledEmpID",
        "Remarks",
        "ReturnStatus",
        "IsActive",
        "Status",
        "CreatedDate",
        "ModifiedDate",
      ],
      include: [
        {
          model: AccCart,
          as: "ARRAccCartID", // Alias for the association
          attributes: ["AccCartID"],
          required: false, // Optional: This ensures it's a LEFT JOIN
          through: {
            attributes: ["ReturnQty", "IssueQty"],
          },
        },
        {
          model: AccIssueReq,
          as: "ARRAccIssueID",
          attributes: ["IssueNo", "IssueDate"],
          include: [
            {
              model: VehicleAllotment,
              as: "AIRAllotmentID",
              attributes: ["AllotmentReqID"],
              include: [
                {
                  model: VehicleStock,
                  as: "AllotPurchaseID",
                  attributes: ["ChassisNo"],
                },
              ],
            },
          ],
        },
        {
          model: UserMaster,
          as: "ARRFitReturnEmpID",
          attributes: ["UserID", "UserName", "EmpID"],
        },
        {
          model: UserMaster,
          as: "ARRApprovedEmpID",
          attributes: ["UserID", "UserName", "EmpID"],
        },
        {
          model: UserMaster,
          as: "ARRCancelledEmpID",
          attributes: ["UserID", "UserName", "EmpID"],
        },
        {
          model: NewCarBookings,
          as: "ARRBookingID",
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
      order: [["CreatedDate", "DESC"]],
    });

    if (returnReqest.length === 0) {
      return res.status(404).json({ message: "No return requests found" });
    }

    // Map the data to flatten the response
    const flattenedData = returnReqest.map((returnReq) => {
      const flattened = {
        AccReturnID: returnReq.AccReturnID,
        ReturnNo: returnReq.ReturnNo,
        ReturnDate: returnReq.ReturnDate,
        AccIssueID: returnReq.AccIssueID,
        BookingID: returnReq.BookingID,
        FitReturnEmpID: returnReq.FitReturnEmpID,
        ApprovedEmpID: returnReq.ApprovedEmpID,
        CancelledEmpID: returnReq.CancelledEmpID,
        Remarks: returnReq.Remarks,
        ReturnStatus: returnReq.ReturnStatus,
        IsActive: returnReq.IsActive,
        Status: returnReq.Status,
        CreatedDate: returnReq.CreatedDate,
        ModifiedDate: returnReq.ModifiedDate,

        // Flattening ARRAccCartID
        AccCartID:
          returnReq.ARRAccCartID.length > 0
            ? returnReq.ARRAccCartID[0].AccCartID
            : null,
        ReturnQty:
          returnReq.ARRAccCartID.length > 0
            ? returnReq.ARRAccCartID[0].AccPartsMap.ReturnQty
            : null,
        IssueQty:
          returnReq.ARRAccCartID.length > 0
            ? returnReq.ARRAccCartID[0].AccPartsMap.IssueQty
            : null,

        // Flattening ARRAccIssueID
        IssueNo: returnReq.ARRAccIssueID.IssueNo,
        IssueDate: returnReq.ARRAccIssueID.IssueDate,
        AllotmentReqID: returnReq.ARRAccIssueID.AIRAllotmentID
          ? returnReq.ARRAccIssueID.AIRAllotmentID.AllotmentReqID
          : null,
        ChassisNo:
          returnReq.ARRAccIssueID.AIRAllotmentID &&
          returnReq.ARRAccIssueID.AIRAllotmentID.AllotPurchaseID
            ? returnReq.ARRAccIssueID.AIRAllotmentID.AllotPurchaseID.ChassisNo
            : null,

        // Flattening ARRFitReturnEmpID
        FitReturnEmpUserID: returnReq.ARRFitReturnEmpID.UserID,
        FitReturnEmpUserName: returnReq.ARRFitReturnEmpID.UserName,
        FitReturnEmpEmpID: returnReq.ARRFitReturnEmpID.EmpID,

        // Flattening ARRApprovedEmpID
        ApprovedEmpUserID: returnReq.ARRApprovedEmpID
          ? returnReq.ARRApprovedEmpID.UserID
          : null,
        ApprovedEmpUserName: returnReq.ARRApprovedEmpID
          ? returnReq.ARRApprovedEmpID.UserName
          : null,
        ApprovedEmpEmpID: returnReq.ARRApprovedEmpID
          ? returnReq.ARRApprovedEmpID.EmpID
          : null,

        // Flattening ARRCancelledEmpID
        CancelledEmpUserID: returnReq.ARRCancelledEmpID
          ? returnReq.ARRCancelledEmpID.UserID
          : null,
        CancelledEmpUserName: returnReq.ARRCancelledEmpID
          ? returnReq.ARRCancelledEmpID.UserName
          : null,
        CancelledEmpEmpID: returnReq.ARRCancelledEmpID
          ? returnReq.ARRCancelledEmpID.EmpID
          : null,

        // Flattening ARRBookingID
        BookingNo: returnReq.ARRBookingID.BookingNo,
        BookingTime: returnReq.ARRBookingID.BookingTime,
        PhoneNo: returnReq.ARRBookingID.PhoneNo,
        Email: returnReq.ARRBookingID.Email,
        FirstName: returnReq.ARRBookingID.FirstName,
        LastName: returnReq.ARRBookingID.LastName,
        ModelName: returnReq.ARRBookingID.ModelName,
        VariantName: returnReq.ARRBookingID.VariantName,
        ColourName: returnReq.ARRBookingID.ColourName,
        Transmission: returnReq.ARRBookingID.Transmission,
        Fuel: returnReq.ARRBookingID.Fuel,
      };

      return flattened;
    });

    res.status(200).json(flattenedData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message: "Database error occurred while retrieving return requests.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    console.error("Error fetching return requests:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
