/* eslint-disable no-unused-vars */
const db = require("../models");
const AccJobOrder = db.accjoborder;
const NewCarBookings = db.NewCarBookings;
const UserMaster = db.usermaster;
const AccIssueReq = db.accissuereq;
const AccCart = db.acccart;
const AccPartMaster = db.accpartmaster;
const AccPartImages = db.accpartimages;
const VehicleAllotment = db.vehicleallotment;
const VehicleStock = db.vehiclestock;
const AccPartsMap = db.accpartmap;
const AccReturnReq = db.accreturnreq;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;

// Basic CRUD API

// Create and Save a new AccJobOrder
exports.create = async (req, res) => {
  try {
    // Create a model
    const accJobOrder = {
      JobOrderNo: req.body.JobOrderNo,
      JobOrderDate: req.body.JobOrderDate,
      BookingID: req.body.BookingID,
      FitmentEmpID: req.body.FitmentEmpID,
      CancelledEmpID: req.body.CancelledEmpID,
      AccIssueID: req.body.AccIssueID,
      Remarks: req.body.Remarks,
      IssueStatus: req.body.IssueStatus,
      JobStatus: req.body.JobStatus,
      IsActive: req.body.IsActive !== undefined ? req.body.IsActive : true,
      Status: req.body.Status || "Active",
    };

    // Save AccJobOrder in the database
    const newAccJobOrder = await AccJobOrder.create(accJobOrder);

    return res.status(201).json(newAccJobOrder); // Send the newly created AccJobOrder as response
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
        message: "Database error occurred while creating AccJobOrder.",
        details: err.message,
      });
    }

    if (err.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: err.message,
      });
    }

    console.error("Error creating AccJobOrder:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
// Retrieve all AccJobOrders from the database.
exports.findAll = async (req, res) => {
  try {
    // Fetch AccJobOrders
    const jobOrder = await AccJobOrder.findAll({
      attributes: [
        "AccJobOrderID",
        "JobOrderNo",
        "JobOrderDate",
        "BookingID",
        "FitmentEmpID",
        "CancelledEmpID",
        "AccIssueID",
        "Remarks",
        "IssueStatus",
        "JobStatus",
        "IsActive",
        "Status",
        "CreatedDate",
        "ModifiedDate",
      ],
      include: [
        {
          model: AccIssueReq,
          as: "AJOAccIssueID",
          attributes: ["IssueNo", "IssueDate"],
        },
        {
          model: UserMaster,
          as: "AJOFitmentEmpID",
          attributes: ["UserID", "UserName", "EmpID"],
        },
        {
          model: UserMaster,
          as: "AJOCancelledEmpID",
          attributes: ["UserID", "UserName", "EmpID"],
        },
        {
          model: NewCarBookings,
          as: "AJOBookingID",
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
        ["CreatedDate", "DESC"], // Order by AccJobOrderID in decending order
      ],
    });

    if (jobOrder.length === 0) {
      return res.status(404).json({ message: "No return requests found" });
    }

    res.status(200).json(jobOrder);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message:
          "Database error occurred while retrieving return acc job order.",
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

    console.error("Error fetching return acc job order:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Job Order Request List for a User
exports.JobReqByUser = async (req, res) => {
  try {
    const userID = req.query.UserID;

    if (!userID) {
      return res.status(400).json({ message: "UserID is required." });
    }
    // Fetch AccJobOrders
    const jobOrder = await AccJobOrder.findAll({
      where: { JobStatus: "Requested", FitmentEmpID: userID },
      attributes: [
        "AccJobOrderID",
        "JobOrderNo",
        "JobOrderDate",
        "BookingID",
        "FitmentEmpID",
        "CancelledEmpID",
        "AccIssueID",
        "Remarks",
        "IssueStatus",
        "JobStatus",
        "IsActive",
        "Status",
        "CreatedDate",
        "ModifiedDate",
      ],
      include: [
        {
          model: AccIssueReq,
          as: "AJOAccIssueID",
          attributes: ["IssueNo", "IssueDate"],
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
                  include: [
                    {
                      model: AccPartImages,
                      as: "PartMasterImages",
                      // attributes: ["PartImgUrl"],
                    },
                  ],
                },
              ],
            },
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
          as: "AJOFitmentEmpID",
          attributes: ["UserID", "UserName", "EmpID"],
        },
        {
          model: UserMaster,
          as: "AJOCancelledEmpID",
          attributes: ["UserID", "UserName", "EmpID"],
        },
        {
          model: NewCarBookings,
          as: "AJOBookingID",
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
        ["CreatedDate", "DESC"], // Order by AccJobOrderID in decending order
      ],
    });

    if (jobOrder.length === 0) {
      return res.status(404).json({ message: "No return requests found" });
    }

    // if (jobOrder && jobOrder.length > 0) {
    //   const firstJobOrder = jobOrder[0]; // Assuming there's at least one job order
    //   const accIssue = firstJobOrder.AJOAccIssueID;

    //   if (
    //     accIssue &&
    //     accIssue.AIRAccCartID &&
    //     accIssue.AIRAccCartID.length > 0
    //   ) {
    //     const firstAccCart = accIssue.AIRAccCartID[0]; // Accessing the first item safely
    //     const partMaster = firstAccCart?.AccPartmasterID;

    //     if (partMaster) {
    //       const partImages = partMaster.PartMasterImages;
    //       if (Array.isArray(partImages) && partImages.length > 0) {
    //         console.log("PartMasterImages: ", partImages[0]?.dataValues?.Par); // Access image path
    //       } else {
    //         console.log("No images found for the part.");
    //       }
    //     } else {
    //       console.log("No AccPartmasterID found in the first AccCart.");
    //     }
    //   } else {
    //     console.log("No AccCart found in the first AccIssue.");
    //   }
    // } else {
    //   console.log("No job orders found.");
    // }

    res.status(200).json(jobOrder);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message:
          "Database error occurred while retrieving return acc job order.",
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

    console.error("Error fetching return acc job order:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Find a single AccJobOrder with an id
exports.findOne = async (req, res) => {
  const { id } = req.params; // Assuming the ID is passed as a URL parameter

  try {
    // Fetch the specific AccJobOrder
    const jobOrder = await AccJobOrder.findOne({
      where: { AccJobOrderID: id },
      attributes: [
        "AccJobOrderID",
        "JobOrderNo",
        "JobOrderDate",
        "BookingID",
        "FitmentEmpID",
        "CancelledEmpID",
        "AccIssueID",
        "Remarks",
        "IssueStatus",
        "JobStatus",
        "IsActive",
        "Status",
        "CreatedDate",
        "ModifiedDate",
      ],
      include: [
        {
          model: AccIssueReq,
          as: "AJOAccIssueID",
          attributes: ["IssueNo", "IssueDate"],
        },
        {
          model: UserMaster,
          as: "AJOFitmentEmpID",
          attributes: ["UserID", "UserName", "EmpID"],
        },
        {
          model: UserMaster,
          as: "AJOCancelledEmpID",
          attributes: ["UserID", "UserName", "EmpID"],
        },
        {
          model: NewCarBookings,
          as: "AJOBookingID",
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
        ["CreatedDate", "DESC"], // Order by AccJobOrderID in decending order
      ],
    });

    if (jobOrder.length === 0) {
      return res.status(404).json({ message: "No return acc job order found" });
    }

    res.status(200).json(jobOrder);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while retrieving the jobOrder.",
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

    console.error("Error fetching the jobOrder:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Update a AccJobOrder by the id in the request
// Update an existing AccJobOrder by ID
exports.update = async (req, res) => {
  const { id } = req.params; // Assuming the ID is passed as a URL parameter

  try {
    // Fetch the existing AccJobOrder
    let jobOrder = await AccJobOrder.findByPk(id);

    console.log("Existing jobOrder: ", jobOrder);

    if (!jobOrder) {
      return res.status(404).json({ message: "return jobOrder not found" });
    }

    // Update fields with the request body data or retain existing values
    jobOrder.JobOrderNo = req.body.JobOrderNo || jobOrder.JobOrderNo;
    jobOrder.JobOrderDate = req.body.JobOrderDate || jobOrder.JobOrderDate;
    jobOrder.AccIssueID = req.body.AccIssueID || jobOrder.AccIssueID;
    jobOrder.BookingID = req.body.BookingID || jobOrder.BookingID;
    jobOrder.FitmentEmpID = req.body.FitmentEmpID || jobOrder.FitmentEmpID;
    jobOrder.CancelledEmpID =
      req.body.CancelledEmpID || jobOrder.CancelledEmpID;
    jobOrder.Remarks = req.body.Remarks || jobOrder.Remarks;
    jobOrder.IssueStatus = req.body.IssueStatus || jobOrder.IssueStatus;
    jobOrder.JobStatus = req.body.JobStatus || jobOrder.JobStatus;
    jobOrder.IsActive =
      req.body.IsActive !== undefined ? req.body.IsActive : jobOrder.IsActive;
    jobOrder.Status = req.body.Status || jobOrder.Status;
    jobOrder.ModifiedDate = new Date(); // Update ModifiedDate to current date

    // Save the updated AccJobOrder in the database
    await jobOrder.save();

    res.status(200).json(jobOrder); // Send the updated jobOrder as response
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message: "Database error occurred while updating the jobOrdert.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    console.error("Error updating the jobOrder:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Accept Job API
exports.acceptJob = async (req, res) => {
  const { id } = req.params; // Assuming the ID is passed as a URL parameter

  try {
    // Fetch the existing AccJobOrder
    let jobOrder = await AccJobOrder.findByPk(id);

    console.log("Existing jobOrder: ", jobOrder);

    if (!jobOrder) {
      return res.status(404).json({ message: "return jobOrder not found" });
    }

    // Update fields with the request body data or retain existing values
    // jobOrder.JobOrderNo = req.body.JobOrderNo || jobOrder.JobOrderNo;
    // jobOrder.JobOrderDate = req.body.JobOrderDate || jobOrder.JobOrderDate;
    // jobOrder.AccIssueID = req.body.AccIssueID || jobOrder.AccIssueID;
    // jobOrder.BookingID = req.body.BookingID || jobOrder.BookingID;
    // jobOrder.FitmentEmpID = req.body.FitmentEmpID || jobOrder.FitmentEmpID;
    // jobOrder.CancelledEmpID =
    //   req.body.CancelledEmpID || jobOrder.CancelledEmpID;
    // jobOrder.Remarks = req.body.Remarks || jobOrder.Remarks;
    // jobOrder.IssueStatus = req.body.IssueStatus || jobOrder.IssueStatus;
    jobOrder.JobStatus = req.body.JobStatus || jobOrder.JobStatus;
    // jobOrder.IsActive =
    //   req.body.IsActive !== undefined ? req.body.IsActive : jobOrder.IsActive;
    // jobOrder.Status = req.body.Status || jobOrder.Status;
    jobOrder.ModifiedDate = new Date(); // Update ModifiedDate to current date

    // Save the updated AccJobOrder in the database
    await jobOrder.save();

    res.status(200).json(jobOrder); // Send the updated jobOrder as response
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message: "Database error occurred while updating the jobOrdert.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    console.error("Error updating the jobOrder:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a AccJobOrder with the specified id in the request
exports.delete = async (req, res) => {
  const { id } = req.params; // Assuming the ID is passed as a URL parameter

  try {
    // Fetch the existing AccJobOrder
    const jobOrder = await AccJobOrder.findByPk(id);

    if (!jobOrder) {
      return res.status(404).json({ message: " jobOrder not found" });
    }

    // Delete the Return request
    await jobOrder.destroy();

    res.status(200).json({ message: "jobOrder deleted successfully" });
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message: "Database error occurred while deleting the jobOrder.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    console.error("Error deleting the jobOrder:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Job Order Request List for a User
exports.AcceptedJobOrders = async (req, res) => {
  try {
    const userID = req.query.UserID;
    const status = req.query.Status;

    if (!userID) {
      return res.status(400).json({ message: "UserID is required." });
    }
    // Fetch AccJobOrders
    const jobOrder = await AccJobOrder.findAll({
      where: { JobStatus: status, FitmentEmpID: userID },
      attributes: [
        "AccJobOrderID",
        "JobOrderNo",
        "JobOrderDate",
        "BookingID",
        "FitmentEmpID",
        "CancelledEmpID",
        "AccIssueID",
        "Remarks",
        "IssueStatus",
        "JobStatus",
        "IsActive",
        "Status",
        "CreatedDate",
        "ModifiedDate",
      ],
      include: [
        {
          model: AccIssueReq,
          as: "AJOAccIssueID",
          attributes: ["IssueNo", "IssueDate"],
          include: [
            {
              model: AccCart,
              as: "AIRAccCartID", // Alias for the association
              attributes: ["AccCartID"],
              required: false, // Optional: This ensures it's a LEFT JOIN
              through: {
                attributes: [
                  "ReqQty",
                  "IssueQty",
                  "FittedQty",
                  "FitmentStatus",
                ],
              },
            },
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
          as: "AJOFitmentEmpID",
          attributes: ["UserID", "UserName", "EmpID"],
        },
        {
          model: NewCarBookings,
          as: "AJOBookingID",
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
        ["CreatedDate", "DESC"], // Order by AccJobOrderID in decending order
      ],
    });

    if (jobOrder.length === 0) {
      return res.status(404).json({ message: "No return requests found" });
    }

    res.status(200).json(jobOrder);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message:
          "Database error occurred while retrieving return acc job order.",
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

    console.error("Error fetching return acc job order:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Job Order Fitment List for a User
exports.JobFitmentList = async (req, res) => {
  try {
    const accJobOrderID = req.query.AccJobOrderID;
    const Status = req.query.FitmentStatus;

    const searchCondition = {
      ...(Status
        ? { "$AJOAccIssueID.AIRAccCartID.AccPartsMap.FitmentStatus$": Status }
        : {}),
      ...(accJobOrderID ? { AccJobOrderID: accJobOrderID } : {}),
    };

    if (!accJobOrderID) {
      return res.status(400).json({ message: "accJobOrderID is required." });
    }
    // Fetch AccJobOrders
    const jobOrder = await AccJobOrder.findAll({
      where: { ...searchCondition },
      // where: { AccJobOrderID: accJobOrderID },
      attributes: [
        "AccJobOrderID",
        // "JobOrderNo",
        // "JobOrderDate",
        // "BookingID",
        // "FitmentEmpID",
        // "CancelledEmpID",
        "AccIssueID",
        "Remarks",
        "IssueStatus",
        "JobStatus",
        // "IsActive",
        // "Status",
        "CreatedDate",
        // "ModifiedDate",
      ],
      include: [
        {
          model: AccIssueReq,
          as: "AJOAccIssueID",
          attributes: ["IssueNo", "IssueDate"],
          include: [
            {
              model: AccCart,
              as: "AIRAccCartID", // Alias for the association
              attributes: ["AccCartID"],
              required: false, // Optional: This ensures it's a LEFT JOIN
              through: {
                attributes: [
                  "ReqQty",
                  "IssueQty",
                  "FittedQty",
                  "FitmentStatus",
                ],
              },
              include: [
                {
                  model: AccPartMaster,
                  as: "AccPartmasterID",
                  attributes: ["PartMasterID", "PartCode", "PartName", "Price"],
                  include: [
                    {
                      model: AccPartImages,
                      as: "PartMasterImages",
                      // attributes: ["PartImgUrl"],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
      order: [
        ["CreatedDate", "DESC"], // Order by AccJobOrderID in decending order
      ],
    });

    if (jobOrder.length === 0) {
      return res.status(404).json({ message: "No return requests found" });
    }

    res.status(200).json(jobOrder);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message:
          "Database error occurred while retrieving return acc job order.",
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

    console.error("Error fetching return acc job order:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Update fitment API
exports.updateFitment = async (req, res) => {
  const { id } = req.params; // Assuming the ID is passed as a URL parameter
  const transaction = await Seq.transaction(); // Start a transaction
  const currentDate = new Date();

  // console.log("Starting updateFitment with jobOrder ID:", id);

  try {
    // Fetch the existing AccJobOrder
    let jobOrder = await AccJobOrder.findByPk(id, { transaction });

    // console.log("Existing jobOrder: ", jobOrder);

    if (!jobOrder) {
      // console.log("Job order not found, returning 404");
      // If the job order is not found, rollback and return 404
      await transaction.rollback();
      return res.status(404).json({ message: "JobOrder not found" });
    }

    // Prepare a list to collect missing records
    const missingRecords = [];
    let fitmentStatus = "Pending"; // Default IssueStatus for the AccIssueReq
    let hasPartial = false; // Flag to check if there is at least one "Partial"
    // Loop through all the AccCartIDs in the request body to update AccPartsMap
    const updatedAccPartsMaps = [];

    for (let i = 0; i < req.body.AccCartID.length; i++) {
      const accCartID = req.body.AccCartID[i];

      const issueQty =
        req.body.IssueQty && req.body.IssueQty[i] !== undefined
          ? req.body.IssueQty[i]
          : null; // Ensure IssueQty is optional
      const fittedQty =
        req.body.FittedQty && req.body.FittedQty[i] !== undefined
          ? req.body.FittedQty[i]
          : null; // Ensure FittedQty is optional

      // console.log(
      //   `Processing AccCartID: ${accCartID}, IssueQty: ${issueQty}, FittedQty: ${fittedQty}`
      // );

      // Determine the status based on ReqQty and IssueQty
      let status = "Pending"; // Default status is "Pending"
      if (issueQty === fittedQty) {
        status = "Fitted"; // Fully issued
      } else if (fittedQty > 0 && fittedQty < issueQty) {
        status = "Partial"; // Partial issue
        hasPartial = true; // Mark that at least one part is Partial
      }

      // console.log(`Calculated status for AccCartID ${accCartID}: ${status}`);

      // Find the existing AccPartsMap entry for this AccCartID and AccIssueID
      const existingAccPartsMap = await AccPartsMap.findOne({
        where: {
          AccIssueID: jobOrder.AccIssueID,
          AccCartID: accCartID,
        },
        transaction, // Include transaction in query
      });

      if (existingAccPartsMap) {
        // If the entry exists, update it
        // console.log(
        //   `Found existing AccPartsMap for AccCartID ${accCartID}, updating...`
        // );

        const updatedAccPartsMap = await existingAccPartsMap.update(
          {
            FittedQty: fittedQty, // ReturnQty is optional, can be set to null if not provided
            FitmentStatus: status, // Set the status based on ReqQty and IssueQty
            ModifiedDate: currentDate,
          },

          { transaction } // Include transaction in update query
        );
        updatedAccPartsMaps.push(updatedAccPartsMap);
      } else {
        // If the entry doesn't exist, add to missingRecords list
        // console.log(`No existing AccPartsMap found for AccCartID ${accCartID}`);
        missingRecords.push({
          AccCartID: accCartID,
          message: `AccPartsMap with AccCartID ${accCartID} does not exist.`,
        });
      }
    }

    if (missingRecords.length > 0) {
      // console.log("Some AccPartsMap records are missing:", missingRecords);
      // If there are missing records, rollback the transaction
      await transaction.rollback();
      // Return the missing records in the response
      return res.status(404).json({
        message: "Some AccPartsMap records do not exist.",
        missingRecords: missingRecords,
      });
    }

    // Now, determine the IssueStatus of the existing AccIssueReq based on the `AccPartsMap` statuses
    if (hasPartial) {
      fitmentStatus = jobOrder.JobStatus; // If there is at least one "Partial", set the whole `AccIssueReq` status to "Partial"
      // console.log(
      //   "At least one part is partial, setting fitmentStatus to jobOrder JobStatus:",
      //   fitmentStatus
      // );
    } else if (
      updatedAccPartsMaps.every((map) => map.FitmentStatus === "Fitted")
    ) {
      fitmentStatus = "Completed"; // If all are "Issued", set `AccIssueReq` status to "Issued"
      // console.log("All parts are fitted, setting fitmentStatus to 'Completed'");
    } else {
      console.log("FitmentStatus remains as 'Pending'");
    }

    const updatedJobOrder = await jobOrder.update(
      {
        // Update fields with the request body data or retain existing values
        Remarks: req.body.Remarks || jobOrder.Remarks,
        JobStatus: fitmentStatus || jobOrder.JobStatus,
        ModifiedDate: currentDate, // Update ModifiedDate to current date
      },
      { transaction }
    );

    // console.log("Updated jobOrder: ", updatedJobOrder);

    // Save the updated AccJobOrder in the database
    await jobOrder.save();

    // Commit the transaction after all updates are done
    await transaction.commit();

    // console.log("Successfully updated jobOrder, returning response");
    res.status(200).json({ updatedJobOrder, updatedAccPartsMaps }); // Send the updated jobOrder as response
  } catch (error) {
    // In case of any error, rollback the transaction
    console.error("Error during jobOrder update:", error);

    try {
      // Attempt to rollback in case of any errors
      await transaction.rollback();
    } catch (rollbackError) {
      console.error("Error during transaction rollback:", rollbackError);
    }

    // Handle specific error types and return corresponding messages
    if (error.name === "SequelizeDatabaseError") {
      console.log("Database error occurred:", error.message);
      return res.status(500).json({
        message: "Database error occurred while updating the jobOrder.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      console.log("Database connection error occurred:", error.message);
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    // Rollback the transaction in case of any unexpected errors
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Job Order Return List for a User
exports.JobReturnList = async (req, res) => {
  try {
    const accJobOrderID = req.query.AccJobOrderID;
    const Status = req.query.ReturnStatus;

    const searchCondition = {
      ...(Status
        ? { "$AJOAccIssueID.AIRAccCartID.AccPartsMap.ReturnStatus$": Status }
        : {}),
      ...(accJobOrderID ? { AccJobOrderID: accJobOrderID } : {}),
    };

    if (!accJobOrderID) {
      return res.status(400).json({ message: "accJobOrderID is required." });
    }

    // Fetch AccJobOrder
    const returnRequests = await AccJobOrder.findAll({
      where: { ...searchCondition },
      attributes: [
        "AccJobOrderID",
        "AccIssueID",
        "Remarks",
        "IssueStatus",
        "JobStatus",
        "CreatedDate",
      ],
      include: [
        {
          model: AccIssueReq,
          as: "AJOAccIssueID",
          attributes: ["IssueNo", "IssueDate"],
          include: [
            {
              model: AccCart,
              as: "AIRAccCartID", // Alias for the association
              attributes: ["AccCartID"],
              required: false, // Ensures it's a LEFT JOIN
              through: {
                attributes: ["ReqQty", "IssueQty", "ReturnQty", "ReturnStatus"],
              },
              include: [
                {
                  model: AccPartsMap, // Ensure the correct model is referenced
                  as: "AccPartsMap", // Alias for the association (make sure it matches the association name)
                  attributes: ["AccPartMapID", "ReturnStatus"], // Include relevant fields
                },
                {
                  model: AccPartMaster,
                  as: "AccPartmasterID",
                  attributes: ["PartMasterID", "PartCode", "PartName", "Price"],
                  include: [
                    {
                      model: AccPartImages,
                      as: "PartMasterImages",
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
      order: [["CreatedDate", "DESC"]],
    });

    if (returnRequests.length === 0) {
      return res.status(404).json({ message: "No return requests found" });
    }

    res.status(200).json(returnRequests);
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
