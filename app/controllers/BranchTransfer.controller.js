/* eslint-disable no-unused-vars */
const db = require("../models");
const BranchTransfer = db.branchtransfers;
const BranchMaster = db.branchmaster;
const BranchIndent = db.branchindents;
const UserMaster = db.usermaster;
const VehicleStock = db.vehiclestock;
const BTCheckList = db.btchecklist;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;
const { cancelEwayBill } = require("./GST.controller");
const { generateBDCNo } = require("../Utils/generateService");

//Basic CRUD API for Vehicle Stock

//Retrieve all stock from the database
exports.findAll = async (req, res) => {
  try {
    const data = await BranchTransfer.findAll({
      attributes: [
        "BranchTransferID",
        "IndentID",
        "DCNo",
        "DCDate",
        "IssuedBy",
        "FromBranch",
        "ToBranch",
        "ChassisNo",
        "EngineNo",
        "FuelQty",
        "KeyNo",
        "PurchaseID",
        "EWBNo",
        "EWBDate",
        "EWBValidUpto",
        "VehicleNo",
        "DriverID",
        "DriverOTP",
        "GateOutTime",
        "StartingKM",
        "GateInTime",
        "EndingKM",
        "GRNNo",
        "Status",
        "Remarks",
        "CreatedDate",
        "ModifiedDate",
        // Flattened fields from BTFromBranchID
        [sequelize.col("BTFromBranchID.BranchID"), "FromBranch_BranchID"],
        [sequelize.col("BTFromBranchID.BranchCode"), "FromBranch_BranchCode"],
        [sequelize.col("BTFromBranchID.BranchName"), "FromBranch_BranchName"],
        [sequelize.col("BTFromBranchID.GSTIN"), "FromBranch_GSTIN"],
        [sequelize.col("BTFromBranchID.State"), "FromBranch_State"],
        [sequelize.col("BTFromBranchID.District"), "FromBranch_District"],
        [sequelize.col("BTFromBranchID.Address"), "FromBranch_Address"],
        [sequelize.col("BTFromBranchID.PINCode"), "FromBranch_PINCode"],
        // Flattened fields from BTToBranchID
        [sequelize.col("BTToBranchID.BranchID"), "ToBranch_BranchID"],
        [sequelize.col("BTToBranchID.BranchCode"), "ToBranch_BranchCode"],
        [sequelize.col("BTToBranchID.BranchName"), "ToBranch_BranchName"],
        [sequelize.col("BTToBranchID.GSTIN"), "ToBranch_GSTIN"],
        [sequelize.col("BTToBranchID.State"), "ToBranch_State"],
        [sequelize.col("BTToBranchID.District"), "ToBranch_District"],
        [sequelize.col("BTToBranchID.Address"), "ToBranch_Address"],
        [sequelize.col("BTToBranchID.PINCode"), "ToBranch_PINCode"],
        // Flattened fields from BTDriverID
        [sequelize.col("BTDriverID.UserID"), "Driver_UserID"],
        [sequelize.col("BTDriverID.UserName"), "Driver_UserName"],
        [sequelize.col("BTDriverID.EmpID"), "Driver_EmpID"],
        [sequelize.col("BTDriverID.Mobile"), "Driver_MobileNo"],
      ],
      include: [
        {
          model: BranchMaster,
          as: "BTFromBranchID",
          attributes: [],
        },
        {
          model: BranchMaster,
          as: "BTToBranchID",
          attributes: [],
        },
        {
          model: UserMaster,
          as: "BTDriverID",
          attributes: [],
        },
      ],
    });
    if (!data || data.length === 0) {
      // If no data found, send a 404 response
      return res.status(404).send({ message: "No BranchTransfers found." });
    }
    // Send the data in the response
    res.send(data);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message:
          "Database error occurred while retrieving branch transfers data.",
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

    console.error("Error occurred while retrieving BranchTransfers:", error);
    res.status(500).send({
      message:
        "Internal server error occurred while retrieving BranchTransfers.",
      error: error.message, // Sending the error message for debugging purposes
    });
  }
};

// Find a single stock with an id Can be Used for DC PRINT
exports.findOne = async (req, res) => {
  const id = req.params.id;

  try {
    const data = await BranchTransfer.findOne({
      attributes: [
        "BranchTransferID",
        "IndentID",
        "DCNo",
        "DCDate",
        "IssuedBy",
        "FromBranch",
        "ToBranch",
        "ChassisNo",
        "EngineNo",
        "FuelQty",
        "KeyNo",
        "PurchaseID",
        "EWBNo",
        "EWBDate",
        "EWBValidUpto",
        "VehicleNo",
        "DriverID",
        "DriverOTP",
        "GateOutTime",
        "StartingKM",
        "GateInTime",
        "EndingKM",
        "GRNNo",
        "Status",
        "Remarks",
        "CreatedDate",
        "ModifiedDate",
        // Flattened fields from BTFromBranchID
        [sequelize.col("BTFromBranchID.BranchID"), "FromBranch_BranchID"],
        [sequelize.col("BTFromBranchID.BranchCode"), "FromBranch_BranchCode"],
        [sequelize.col("BTFromBranchID.BranchName"), "FromBranch_BranchName"],
        [sequelize.col("BTFromBranchID.GSTIN"), "FromBranch_GSTIN"],
        [sequelize.col("BTFromBranchID.State"), "FromBranch_State"],
        [sequelize.col("BTFromBranchID.District"), "FromBranch_District"],
        [sequelize.col("BTFromBranchID.Address"), "FromBranch_Address"],
        [sequelize.col("BTFromBranchID.PINCode"), "FromBranch_PINCode"],
        // Flattened fields from BTToBranchID
        [sequelize.col("BTToBranchID.BranchID"), "ToBranch_BranchID"],
        [sequelize.col("BTToBranchID.BranchCode"), "ToBranch_BranchCode"],
        [sequelize.col("BTToBranchID.BranchName"), "ToBranch_BranchName"],
        [sequelize.col("BTToBranchID.GSTIN"), "ToBranch_GSTIN"],
        [sequelize.col("BTToBranchID.State"), "ToBranch_State"],
        [sequelize.col("BTToBranchID.District"), "ToBranch_District"],
        [sequelize.col("BTToBranchID.Address"), "ToBranch_Address"],
        [sequelize.col("BTToBranchID.PINCode"), "ToBranch_PINCode"],
        // Flattened fields from BTDriverID
        [sequelize.col("BTDriverID.UserID"), "Driver_UserID"],
        [sequelize.col("BTDriverID.UserName"), "Driver_UserName"],
        [sequelize.col("BTDriverID.EmpID"), "Driver_EmpID"],
        [sequelize.col("BTDriverID.Mobile"), "Driver_MobileNo"],
      ],
      where: { BranchTransferID: id },
      include: [
        {
          model: BranchMaster,
          as: "BTFromBranchID",
          attributes: [],
        },
        {
          model: BranchMaster,
          as: "BTToBranchID",
          attributes: [],
        },
        {
          model: UserMaster,
          as: "BTDriverID",
          attributes: [],
        },
      ],
    });

    if (!data) {
      return res
        .status(404)
        .send({ message: "BranchTransfer not found with id=" + id });
    }

    res.status(200).json(data);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message:
          "Database error occurred while retrieving branch transfers data.",
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
    console.error("Error retrieving BranchTransfer:", error);
    res
      .status(500)
      .send({ message: "Error retrieving BranchTransfer with id=" + id });
  }
};

// Save BranchTransfer in the database
exports.create = async (req, res) => {
  try {
    // Extract data from request body
    const branchTransferData = {
      IndentID: req.body.IndentID,
      DCNo: req.body.DCNo,
      DCDate: req.body.DCDate,
      IssuedBy: req.body.IssuedBy,
      FromBranch: req.body.FromBranch,
      ToBranch: req.body.ToBranch,
      ChassisNo: req.body.ChassisNo,
      EngineNo: req.body.EngineNo,
      FuelQty: req.body.Fuelty,
      KeyNo: req.body.KeyNo,
      PurchaseID: req.body.PurchaseID,
      EWBNo: req.body.EWBNo,
      DriverOTP: req.body.DriverOTP,
      GateOutTime: req.body.GateOutTime,
      StartingKM: req.body.StartingKM,
      GateInTime: req.body.GateInTime,
      EndingKM: req.body.EndingKM,
      GRNNo: req.body.GRNNo,
      Status: req.body.Status || "Open",
      Remarks: req.body.Remarks,
    };

    // Create a new BranchTransfer record
    const newRecord = await BranchTransfer.create(branchTransferData);

    // Send the newly created record as response
    res.status(201).json(newRecord);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeValidationError") {
      // Handle Sequelize validation errors
      return res.status(400).json({
        message: "Validation error",
        details: error.errors.map((e) => e.message),
      });
    }

    if (error.name === "SequelizeUniqueConstraintError") {
      // Handle unique constraint errors
      return res.status(400).json({
        message: "Unique constraint error",
        details: error.errors.map((e) => e.message),
      });
    }

    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while creating BranchTransfer.",
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

    // Handle error
    console.error("Error occurred while creating BranchTransfer:", error);
    res.status(500).json({
      message: "Internal server error occurred while creating BranchTransfer.",
      error: error.message,
    });
  }
};

// Update a BranchTransfer by the id in the request
exports.updateByPk = async (req, res) => {
  try {
    const { id } = req.params; // Extract the primary key from the request parameters

    // Find the existing record by its primary key
    const branchTransfer = await BranchTransfer.findByPk(id);
    if (!branchTransfer) {
      return res.status(404).json({ message: "BranchTransfer not found." });
    }

    // Map the fields from the request body or branchTransfer
    branchTransfer.IndentID = req.body.IndentID || branchTransfer.IndentID;
    branchTransfer.DCNo = req.body.DCNo || branchTransfer.DCNo;
    branchTransfer.DCDate = req.body.DCDate || branchTransfer.DCDate;
    branchTransfer.FromBranch =
      req.body.FromBranch || branchTransfer.FromBranch;
    branchTransfer.ToBranch = req.body.ToBranch || branchTransfer.ToBranch;
    branchTransfer.ChassisNo = req.body.ChassisNo || branchTransfer.ChassisNo;
    branchTransfer.EngineNo = req.body.EngineNo || branchTransfer.EngineNo;
    branchTransfer.FuelQty = req.body.FuelQty || branchTransfer.FuelQty;
    branchTransfer.KeyNo = req.body.KeyNo || branchTransfer.KeyNo;
    branchTransfer.PurchaseID =
      req.body.PurchaseID || branchTransfer.PurchaseID;
    branchTransfer.EWBNo = req.body.EWBNo || branchTransfer.EWBNo;
    branchTransfer.DriverOTP = req.body.DriverOTP || branchTransfer.DriverOTP;
    branchTransfer.GateOutTime =
      req.body.GateOutTime || branchTransfer.GateOutTime;
    branchTransfer.StartingKM =
      req.body.StartingKM || branchTransfer.StartingKM;
    branchTransfer.GateInTime =
      req.body.GateInTime || branchTransfer.GateInTime;
    branchTransfer.EndingKM = req.body.EndingKM || branchTransfer.EndingKM;
    branchTransfer.GRNNo = req.body.GRNNo || branchTransfer.GRNNo;
    branchTransfer.Status = req.body.Status || branchTransfer.Status;
    branchTransfer.Remarks = req.body.Remarks || branchTransfer.Remarks;
    branchTransfer.ModifiedDate = new Date();

    // Save the updated record
    const updatedBranchTransfer = await branchTransfer.save();

    // Send the updated record as response
    res.json(updatedBranchTransfer);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeValidationError") {
      // Handle Sequelize validation errors
      return res.status(400).json({
        message: "Validation error",
        details: error.errors.map((e) => e.message),
      });
    }

    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while updating BranchTransfers.",
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
    console.error("Error occurred while updating BranchTransfer:", error);
    res.status(500).json({
      message: "Internal server error occurred while updating BranchTransfer.",
      error: error.message,
    });
  }
};

// Delete a BranchTransfer with the specified id in the request
exports.deleteByPk = async (req, res) => {
  try {
    const { id } = req.params; // Extract the ID from the request parameters

    // Find the record by its ID
    const recordToDelete = await BranchTransfer.findByPk(id);

    // Check if the record exists
    if (!recordToDelete) {
      return res.status(404).json({ message: "BranchTransfer not found." });
    }

    // Delete the record
    await recordToDelete.destroy();

    // Send success response
    res.status(200).json({ message: "BranchTransfer deleted successfully." });
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while deleting BranchTransfers.",
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
    console.error("Error occurred while deleting BranchTransfer:", error);
    res.status(500).json({
      message: "Internal server error occurred while deleting BranchTransfer.",
      dedtails: error.message,
    });
  }
};

// Get list of raised indents which is received to home branch
exports.findAllReceivedTransfers = async (req, res) => {
  try {
    const toBranch = req.body.ToBranch;
    const data = await BranchTransfer.findAll({
      attributes: [
        "BranchTransferID",
        "IndentID",
        "DCNo",
        "DCDate",
        "IssuedBy",
        "FromBranch",
        "ToBranch",
        "ChassisNo",
        "EngineNo",
        "FuelQty",
        "KeyNo",
        "PurchaseID",
        "EWBNo",
        "DriverOTP",
        "GateOutTime",
        "StartingKM",
        "GateInTime",
        "EndingKM",
        "GRNNo",
        "Status",
        "Remarks",
      ],
      where: {
        ToBranch: { [Op.eq]: toBranch },
      },
      order: [
        ["BranchTransferID", "ASC"], // Order by ModelDescription in ascending order
      ],
    });
    if (!data || data.length === 0) {
      // If no data found, send a 404 response
      return res.status(404).send({ message: "No BranchTransfers found." });
    }
    // Send the data in the response
    res.send(data);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      console.error("Database error:", error);
      return res.status(500).json({
        message:
          "Database error occurred while retrieving received transfers data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      // Handle connection errors
      console.error("Connection error:", error);
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeValidationError") {
      // Handle validation errors
      console.error("Validation error:", error);
      return res.status(400).json({
        message:
          "Validation error occurred while retrieving received transfers data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeTimeoutError") {
      // Handle timeout errors
      console.error("Timeout error:", error);
      return res.status(504).json({
        message: "Request timeout while retrieving received transfers data.",
        details: error.message,
      });
    }
    console.error("Error occurred while retrieving BranchTransfers:", error);
    res.status(500).send({
      message:
        "Internal server error occurred while retrieving BranchTransfers.",
      error: error.message, // Sending the error message for debugging purposes
    });
  }
};

// Get list of issued indents which is sent from home branch
exports.findAllSentTransfers = async (req, res) => {
  try {
    const fromBranch = req.body.FromBranch;
    const data = await BranchTransfer.findAll({
      attributes: [
        "BranchTransferID",
        "IndentID",
        "DCNo",
        "DCDate",
        "IssuedBy",
        "FromBranch",
        "ToBranch",
        "ChassisNo",
        "EngineNo",
        "KeyNo",
        "FuelQty",
        "PurchaseID",
        "EWBNo",
        "DriverOTP",
        "GateOutTime",
        "StartingKM",
        "GateInTime",
        "EndingKM",
        "GRNNo",
        "Status",
        "Remarks",
      ],
      where: {
        FromBranch: { [Op.eq]: fromBranch },
      },
      order: [
        ["BranchTransferID", "ASC"], // Order by ModelDescription in ascending order
      ],
    });
    if (!data || data.length === 0) {
      // If no data found, send a 404 response
      return res.status(404).send({ message: "No BranchTransfers found." });
    }
    // Send the data in the response
    res.send(data);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      console.error("Database error:", error);
      return res.status(500).json({
        message:
          "Database error occurred while retrieving sent transfers data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      // Handle connection errors
      console.error("Connection error:", error);
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeValidationError") {
      // Handle validation errors
      console.error("Validation error:", error);
      return res.status(400).json({
        message:
          "Validation error occurred while retrieving sent transfers data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeTimeoutError") {
      // Handle timeout errors
      console.error("Timeout error:", error);
      return res.status(504).json({
        message: "Request timeout while retrieving sent transfers data.",
        details: error.message,
      });
    }
    console.error("Error occurred while retrieving BranchTransfers:", error);
    res.status(500).send({
      message:
        "Internal server error occurred while retrieving BranchTransfers.",
      error: error.message, // Sending the error message for debugging purposes
    });
  }
};

// Get list of Transfers by screen dynamically
exports.getBranchTransferByScreen = async (req, res) => {
  try {
    const branch = req.query.BranchID;
    const screen = req.query.ScreenName;

    let whereCondition = {}; // Define an empty object to hold the dynamic WHERE condition

    if (screen === "Sent") {
      whereCondition = { FromBranch: branch };
    } else if (screen === "Received") {
      whereCondition = { ToBranch: branch };
    } else {
      // Handle unexpected values of screen if needed
      return res.status(400).json({ message: "Invalid value for ScreenName." });
    }
    const data = await BranchTransfer.findAll({
      where: whereCondition,
      attributes: [
        "BranchTransferID",
        "IndentID",
        "DCNo",
        "DCDate",
        "IssuedBy",
        "FromBranch",
        "ToBranch",
        "ChassisNo",
        "EngineNo",
        "KeyNo",
        "FuelQty",
        "PurchaseID",
        "EWBNo",
        "DriverOTP",
        "GateOutTime",
        "StartingKM",
        "GateInTime",
        "EndingKM",
        "GRNNo",
        "Status",
        "Remarks",
      ],
      include: [
        {
          model: BranchIndent,
          as: "BTIndentID",
          attributes: [
            "IndentID",
            "IndentNo",
            "IndentDate",
            "FromBranch",
            "ToBranch",
            "ModelCode",
            "VariantCode",
            "ColourCode",
            "Transmission",
            "FuelType",
            "DriverID",
            "DriverName",
            "EMPMobileNo",
          ],
          include: [
            {
              model: BranchMaster,
              as: "BIFromBranchID",
              attributes: ["BranchID", "BranchCode", "BranchName"],
            },
            {
              model: BranchMaster,
              as: "BIToBranchID",
              attributes: ["BranchID", "BranchCode", "BranchName"],
            },
          ],
        },
      ],
      order: [
        ["BranchTransferID", "ASC"], // Order by ModelDescription in ascending order
      ],
    });
    if (!data || data.length === 0) {
      // If no data found, send a 404 response
      return res.status(404).send({ message: "No BranchTransfers found." });
    }
    const status = data.map((transfer) => transfer.dataValues.Status);
    console.log("Transfer status: ", status);

    // Map each row to a flat structure
    const mappedData = data.map((row) => ({
      BranchTransferID: row.dataValues.BranchTransferID,
      IndentID: row.dataValues.IndentID,
      IndentNo: row.BTIndentID.IndentNo,
      IndentDate: row.BTIndentID.IndentDate,
      ModelCode: row.BTIndentID.ModelCode || null,
      VariantCode: row.BTIndentID.VariantCode || null,
      ColourCode: row.BTIndentID.ColourCode || null,
      Transmission: row.BTIndentID.Transmission || null,
      FuelType: row.BTIndentID.FuelType || null,
      DriverID: row.BTIndentID.DriverID || null,
      DriverName: row.BTIndentID.DriverName || null,
      EMPMobileNo: row.BTIndentID.EMPMobileNo || null,
      FromBranch: row.BTIndentID.BIFromBranchID
        ? row.BTIndentID.BIFromBranchID.BranchID || null
        : null,
      FromBranchCode: row.BTIndentID.BIFromBranchID
        ? row.BTIndentID.BIFromBranchID.BranchCode || null
        : null,
      FromBranchName: row.BTIndentID.BIFromBranchID
        ? row.BTIndentID.BIFromBranchID.BranchName || null
        : null,
      ToBranch: row.BTIndentID.BIToBranchID
        ? row.BTIndentID.BIToBranchID.ID || null
        : null,
      ToBranchCode: row.BTIndentID.BIToBranchID
        ? row.BTIndentID.BIToBranchID.BranchCode || null
        : null,
      ToBranchName: row.BTIndentID.BIToBranchID
        ? row.BTIndentID.BIToBranchID.BranchName || null
        : null,
      DCNo: row.dataValues.DCNo || null,
      DCDate: row.dataValues.DCDate || null,
      IssuedBy: row.dataValues.IssuedBy || null,
      ChassisNo: row.dataValues.ChassisNo || null,
      EngineNo: row.dataValues.EngineNo || null,
      FuelQty: row.dataValues.FuelQty || null,
      KeyNo: row.dataValues.KeyNo || null,
      PurchaseID: row.dataValues.PurchaseID || null,
      EWBNo: row.dataValues.EWBNo || null,
      DriverOTP: row.dataValues.DriverOTP || null,
      GateOutTime: row.dataValues.GateOutTime || null,
      StartingKM: row.dataValues.StartingKM || null,
      GateInTime: row.dataValues.GateInTime || null,
      EndingKM: row.dataValues.EndingKM || null,
      GRNNo: row.dataValues.GRNNo || null,
      Status: row.dataValues.Status || null,
      Remarks: row.dataValues.Remarks || null,
    }));

    res.send(mappedData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      console.error("Database error:", error);
      return res.status(500).json({
        message:
          "Database error occurred while retrieving received transfers data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      // Handle connection errors
      console.error("Connection error:", error);
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeValidationError") {
      // Handle validation errors
      console.error("Validation error:", error);
      return res.status(400).json({
        message:
          "Validation error occurred while retrieving received transfers data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeTimeoutError") {
      // Handle timeout errors
      console.error("Timeout error:", error);
      return res.status(504).json({
        message: "Request timeout while retrieving received transfers data.",
        details: error.message,
      });
    }
    console.error("Error occurred while retrieving BranchTransfers:", error);
    res.status(500).send({
      message:
        "Internal server error occurred while retrieving BranchTransfers.",
      error: error.message, // Sending the error message for debugging purposes
    });
  }
};

// Find a single Transfer BY QR Code
exports.findOneByQRCode = async (req, res) => {
  const dcNo = req.query.DCNo;

  try {
    const data = await BranchTransfer.findOne({
      attributes: [
        "BranchTransferID",
        "IndentID",
        "DCNo",
        "DCDate",
        "IssuedBy",
        // Flattened fields from BTIssuerID
        [sequelize.col("BTIssuerID.UserID"), "Issuer_UserID"],
        [sequelize.col("BTIssuerID.UserName"), "Issuer_UserName"],
        [sequelize.col("BTIssuerID.EmpID"), "Issuer_EmpID"],
        [sequelize.col("BTIssuerID.Mobile"), "Issuer_MobileNo"],
        "FromBranch",
        // Flattened fields from BTFromBranchID
        [sequelize.col("BTFromBranchID.BranchID"), "FromBranch_BranchID"],
        [sequelize.col("BTFromBranchID.BranchCode"), "FromBranch_BranchCode"],
        [sequelize.col("BTFromBranchID.BranchName"), "FromBranch_BranchName"],
        [sequelize.col("BTFromBranchID.GSTIN"), "FromBranch_GSTIN"],
        [sequelize.col("BTFromBranchID.State"), "FromBranch_State"],
        [sequelize.col("BTFromBranchID.District"), "FromBranch_District"],
        [sequelize.col("BTFromBranchID.Address"), "FromBranch_Address"],
        [sequelize.col("BTFromBranchID.PINCode"), "FromBranch_PINCode"],
        "ToBranch",
        // Flattened fields from BTToBranchID
        [sequelize.col("BTToBranchID.BranchID"), "ToBranch_BranchID"],
        [sequelize.col("BTToBranchID.BranchCode"), "ToBranch_BranchCode"],
        [sequelize.col("BTToBranchID.BranchName"), "ToBranch_BranchName"],
        [sequelize.col("BTToBranchID.GSTIN"), "ToBranch_GSTIN"],
        [sequelize.col("BTToBranchID.State"), "ToBranch_State"],
        [sequelize.col("BTToBranchID.District"), "ToBranch_District"],
        [sequelize.col("BTToBranchID.Address"), "ToBranch_Address"],
        [sequelize.col("BTToBranchID.PINCode"), "ToBranch_PINCode"],
        // Flattened fields from BTPurchaseID
        [sequelize.col("BTPurchaseID.ModelCode"), "ModelCode"],
        [sequelize.col("BTPurchaseID.VariantCode"), "VariantCode"],
        [sequelize.col("BTPurchaseID.ColourCode"), "ColourCode"],
        [sequelize.col("BTPurchaseID.TransmissionCode"), "TransmissionCode"],
        [sequelize.col("BTPurchaseID.FuelType"), "FuelType"],
        "ChassisNo",
        "EngineNo",
        "FuelQty",
        "KeyNo",
        "PurchaseID",
        "EWBNo",
        "EWBDate",
        "EWBValidUpto",
        "VehicleNo",
        "DriverID",
        // Flattened fields from BTDriverID
        [sequelize.col("BTDriverID.UserID"), "Driver_UserID"],
        [sequelize.col("BTDriverID.UserName"), "Driver_UserName"],
        [sequelize.col("BTDriverID.EmpID"), "Driver_EmpID"],
        [sequelize.col("BTDriverID.Mobile"), "Driver_MobileNo"],
        "DriverOTP",
        "GateOutTime",
        "StartingKM",
        "GateInTime",
        "EndingKM",
        "GRNNo",
        "Status",
        "Remarks",
        "CreatedDate",
        "ModifiedDate",
      ],
      include: [
        {
          model: BranchMaster,
          as: "BTFromBranchID",
          attributes: [],
        },
        {
          model: BranchMaster,
          as: "BTToBranchID",
          attributes: [],
        },
        {
          model: UserMaster,
          as: "BTDriverID",
          attributes: [],
        },
        {
          model: UserMaster,
          as: "BTIssuerID",
          attributes: [],
        },
        {
          model: VehicleStock,
          as: "BTPurchaseID",
          attributes: [],
        },
      ],
      where: { DCNo: dcNo },
    });

    if (!data) {
      return res
        .status(404)
        .send({ message: "BranchTransfer not found with DC=" + dcNo });
    }

    res.status(200).json(data);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message:
          "Database error occurred while retrieving branch transfers data.",
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
    console.error("Error retrieving BranchTransfer:", error);
    res
      .status(500)
      .send({ message: "Error retrieving BranchTransfer with DC=" + dcNo });
  }
};

// Update a BranchTransfer by the id using Gate APP
exports.updateByGateApp = async (req, res) => {
  const transaction = await Seq.transaction(); // Start a transaction
  try {
    const { DCNo, CheckListType } = req.query; // Extract parameters from query

    if (!DCNo || !CheckListType) {
      return res
        .status(400)
        .json({ message: "DCNo and CheckListType are required." });
    }

    // Find the existing BranchTransfer and BTCheckList records in parallel
    const [branchTransferData, checkData] = await Promise.all([
      BranchTransfer.findOne({ where: { DCNo }, transaction }),
      BTCheckList.findOne({ where: { DCNo, CheckListType }, transaction }),
    ]);

    if (!branchTransferData) {
      return res.status(404).json({ message: "BranchTransfer not found." });
    }
    if (!checkData) {
      return res.status(404).json({ message: "BTCheckList not found." });
    }

    // Update branchTransferData with values from req.body
    if (CheckListType === "Out") {
      branchTransferData.GateOutTime =
        req.body.GateOutTime || branchTransferData.GateOutTime;
      branchTransferData.StartingKM =
        req.body.StartingKM || branchTransferData.StartingKM;
      branchTransferData.Remarks =
        req.body.Remarks || branchTransferData.Remarks;
      branchTransferData.Status = "In-Transit";
      branchTransferData.ModifiedDate = new Date();
    } else if (CheckListType === "In") {
      branchTransferData.GateInTime =
        req.body.GateInTime || branchTransferData.GateInTime;
      branchTransferData.EndingKM =
        req.body.EndingKM || branchTransferData.EndingKM;
      branchTransferData.Remarks =
        req.body.Remarks || branchTransferData.Remarks;
      branchTransferData.ModifiedDate = new Date();

      if (req.body.Status === "Returned") {
        await VehicleStock.update(
          {
            Status: "In-Stock",
            BranchID: branchTransferData.FromBranch,
            ModifiedDate: new Date(),
          },
          { where: { PurchaseID: branchTransferData.PurchaseID }, transaction }
        );
        await BranchIndent.update(
          { Status: "Returned", ModifiedDate: new Date() },
          { where: { IndentID: branchTransferData.IndentID }, transaction }
        );
        branchTransferData.Status = "Returned";
        branchTransferData.ModifiedDate = new Date();
      } else {
        branchTransferData.Status = "Received";
        branchTransferData.ModifiedDate = new Date();
      }
    }

    // Update checkData with values from req.body
    Object.assign(checkData, {
      Model: req.body.Model ?? checkData.Model,
      Variant: req.body.Variant ?? checkData.Variant,
      Colour: req.body.Colour ?? checkData.Colour,
      FuelType: req.body.FuelType ?? checkData.FuelType,
      Transmission: req.body.Transmission ?? checkData.Transmission,
      ChassisNo: req.body.ChassisNo ?? checkData.ChassisNo,
      EngineNo: req.body.EngineNo ?? checkData.EngineNo,
      KeyNo: req.body.KeyNo ?? checkData.KeyNo,
      DCPrint: req.body.DCPrint ?? checkData.DCPrint,
      RearBumper: req.body.RearBumper ?? checkData.RearBumper,
      QuarterPanel: req.body.QuarterPanel ?? checkData.QuarterPanel,
      ManualGuided: req.body.ManualGuided ?? checkData.ManualGuided,
      DRL: req.body.DRL ?? checkData.DRL,
      BTCheckID: req.body.BTCheckID ?? checkData.BTCheckID,
      DCNo: req.body.DCNo ?? checkData.DCNo,
      CheckListType: req.body.CheckListType ?? checkData.CheckListType,
      Remarks: req.body.Remarks ?? checkData.Remarks,
      ModifiedDate: new Date(),
    });

    // Handle status updates based on CheckListType
    if (CheckListType === "Out") {
      await BranchIndent.update(
        { Status: "In-Transit", ModifiedDate: new Date() },
        { where: { IndentID: branchTransferData.IndentID }, transaction }
      );
      await VehicleStock.update(
        { Status: "In-Transit", ModifiedDate: new Date() },
        { where: { PurchaseID: branchTransferData.PurchaseID }, transaction }
      );
    } else if (CheckListType === "In" && req.body.Status !== "Returned") {
      await BranchIndent.update(
        { Status: "Received", ModifiedDate: new Date() },
        { where: { IndentID: branchTransferData.IndentID }, transaction }
      );
      await VehicleStock.update(
        {
          Status: "In-Stock",
          BranchID: branchTransferData.ToBranch,
          ModifiedDate: new Date(),
        },
        { where: { PurchaseID: branchTransferData.PurchaseID }, transaction }
      );
    }

    // Save the updated records
    await branchTransferData.save({ transaction });
    await checkData.save({ transaction });

    // Commit the transaction
    await transaction.commit();

    res.status(200).json({
      updatedBranchTransfer: branchTransferData,
      updatedBTCheckList: checkData,
    });
  } catch (error) {
    // Rollback the transaction in case of error
    await transaction.rollback();

    // Centralized error handling
    const errorResponse = {
      400: {
        message: "Validation error",
        details: error.errors?.map((e) => e.message),
      },
      500: {
        message: "Database error occurred while updating BranchTransfers.",
        details: error.message,
      },
      503: {
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      },
      default: {
        message:
          "Internal server error occurred while updating BranchTransfer.",
        error: error.message,
      },
    };

    const statusCode =
      error.name === "SequelizeValidationError"
        ? 400
        : error.name === "SequelizeDatabaseError"
        ? 500
        : error.name === "SequelizeConnectionError"
        ? 503
        : 500;

    res
      .status(statusCode)
      .json(errorResponse[statusCode] || errorResponse.default);
  }
};

// exports.updateByGateApp = async (req, res) => {
//   const transaction = await sequelize.transaction(); // Start a transaction
//   try {
//     const { DCNo, CheckListType } = req.query; // Extract parameters from query
//     console.log("DCNo:", DCNo);
//     console.log("CheckListType:", CheckListType);

//     // Find the existing BranchTransfer record
//     const branchTransferData = await BranchTransfer.findOne({
//       where: { DCNo },
//       transaction, // Use the transaction
//     });
//     if (!branchTransferData) {
//       console.log("BranchTransfer not found.");
//       return res.status(404).json({ message: "BranchTransfer not found." });
//     }

//     console.log("Found branchTransferData:", branchTransferData);

//     // Find the existing BTCheckList record
//     const checkData = await BTCheckList.findOne({
//       where: { DCNo, CheckListType },
//       transaction, // Use the transaction
//     });
//     if (!checkData) {
//       console.log("BTCheckList not found.");
//       return res.status(404).json({ message: "BTCheckList not found." });
//     }

//     console.log("Found checkData:", checkData);

//     // Update branchTransferData with values from req.body
//     if (CheckListType === "Out") {
//       branchTransferData.GateOutTime =
//         req.body.GateOutTime || branchTransferData.GateOutTime;
//       branchTransferData.StartingKM =
//         req.body.StartingKM || branchTransferData.StartingKM;
//       branchTransferData.Remarks =
//         req.body.Remarks || branchTransferData.Remarks;
//       branchTransferData.Status = "In-Transit";
//     } else if (CheckListType === "In") {
//       branchTransferData.GateInTime =
//         req.body.GateInTime || branchTransferData.GateInTime;
//       branchTransferData.EndingKM =
//         req.body.EndingKM || branchTransferData.EndingKM;
//       branchTransferData.Remarks =
//         req.body.Remarks || branchTransferData.Remarks;
//       branchTransferData.Status = "Received";
//     }

//     console.log("Updated branchTransferData:", branchTransferData);

//     // Update checkData with values from req.body
//     Object.assign(checkData, {
//       Model: req.body.Model ?? checkData.Model,
//       Variant: req.body.Variant ?? checkData.Variant,
//       Colour: req.body.Colour ?? checkData.Colour,
//       FuelType: req.body.FuelType ?? checkData.FuelType,
//       Transmission: req.body.Transmission ?? checkData.Transmission,
//       ChassisNo: req.body.ChassisNo ?? checkData.ChassisNo,
//       EngineNo: req.body.EngineNo ?? checkData.EngineNo,
//       KeyNo: req.body.KeyNo ?? checkData.KeyNo,
//       DCPrint: req.body.DCPrint ?? checkData.DCPrint,
//       RearBumper: req.body.RearBumper ?? checkData.RearBumper,
//       QuarterPanel: req.body.QuarterPanel ?? checkData.QuarterPanel,
//       ManualGuided: req.body.ManualGuided ?? checkData.ManualGuided,
//       DRL: req.body.DRL ?? checkData.DRL,
//       BTCheckID: req.body.BTCheckID ?? checkData.BTCheckID,
//       DCNo: req.body.DCNo ?? checkData.DCNo,
//       CheckListType: req.body.CheckListType ?? checkData.CheckListType,
//       Remarks: req.body.Remarks ?? checkData.Remarks,
//     });

//     console.log("Updated checkData:", checkData);

//     // Handle status updates based on CheckListType
//     if (CheckListType === "Out") {
//       await BranchIndent.update(
//         { Status: "In-Transit" },
//         { where: { IndentID: branchTransferData.IndentID }, transaction }
//       );
//       await VehicleStock.update(
//         { Status: "In-Transit" },
//         { where: { PurchaseID: branchTransferData.PurchaseID }, transaction }
//       );
//     } else if (CheckListType === "In") {
//       await BranchIndent.update(
//         { Status: "Received" },
//         { where: { IndentID: branchTransferData.IndentID }, transaction }
//       );
//       await VehicleStock.update(
//         { Status: "In-Stock", BranchID: branchTransferData.ToBranch },
//         { where: { PurchaseID: branchTransferData.PurchaseID }, transaction }
//       );
//     }

//     // Save the updated records
//     await branchTransferData.save({ transaction });
//     await checkData.save({ transaction });

//     // Commit the transaction
//     await transaction.commit();

//     console.log("Saved updatedBranchTransfer:", branchTransferData);
//     console.log("Saved updatedBTCheckList:", checkData);

//     // Send the updated records as response
//     res.json({
//       updatedBranchTransfer: branchTransferData,
//       updatedBTCheckList: checkData,
//     });
//   } catch (error) {
//     // Rollback the transaction in case of error
//     await transaction.rollback();

//     console.error("Error occurred while updating BranchTransfer:", error);

//     if (error.name === "SequelizeValidationError") {
//       console.log("SequelizeValidationError:", error);
//       return res.status(400).json({
//         message: "Validation error",
//         details: error.errors.map((e) => e.message),
//       });
//     }

//     if (error.name === "SequelizeDatabaseError") {
//       console.log("SequelizeDatabaseError:", error);
//       return res.status(500).json({
//         message: "Database error occurred while updating BranchTransfers.",
//         details: error.message,
//       });
//     }

//     if (error.name === "SequelizeConnectionError") {
//       console.log("SequelizeConnectionError:", error);
//       return res.status(503).json({
//         message: "Service unavailable. Unable to connect to the database.",
//         details: error.message,
//       });
//     }

//     // Handle unexpected errors
//     res.status(500).json({
//       message: "Internal server error occurred while updating BranchTransfer.",
//       error: error.message,
//     });
//   }
// };

// Save BranchTransfer Check List in the database
exports.createCheckListEntries = async (req, res) => {
  try {
    // Extract DCNo from request body
    const dcNo = req.body.DCNo;
    console.log("DC No is : ", dcNo);

    // Validate that DCNo is provided
    if (!dcNo) {
      return res.status(400).json({
        message: "DCNo is required.",
      });
    }

    const existingRecords = await BTCheckList.findAll({
      where: {
        DCNo: dcNo,
        CheckListType: {
          [Op.in]: ["Out", "In"], // Use an array for the values
        },
      },
    });

    if (existingRecords.length > 0) {
      // Correctly checks for existing records
      return res.status(409).json({
        message: "CheckList already Created.",
      });
    }

    // Prepare data for bulk creation
    const checkLists = [
      {
        DCNo: dcNo,
        CheckListType: "Out",
      },
      {
        DCNo: dcNo,
        CheckListType: "In",
      },
    ];
    // Create a new BranchTransfer record
    const newRecords = await BTCheckList.bulkCreate(checkLists);

    // Send the newly created record as response
    res.status(201).json(newRecords);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeValidationError") {
      // Handle Sequelize validation errors
      return res.status(400).json({
        message: "Validation error",
        details: error.errors.map((e) => e.message),
      });
    }

    if (error.name === "SequelizeUniqueConstraintError") {
      // Handle unique constraint errors
      return res.status(400).json({
        message: "Unique constraint error",
        details: error.errors.map((e) => e.message),
      });
    }

    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while creating BranchTransfer.",
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

    // Handle error
    console.error("Error occurred while creating BranchTransfer:", error);
    res.status(500).json({
      message: "Internal server error occurred while creating BranchTransfer.",
      error: error.message,
    });
  }
};

// Update a BranchTransfer by the Cancel Action
exports.updateByCancelled = async (req, res) => {
  const transaction = await Seq.transaction(); // Start a transaction
  try {
    const indentID = req.query.IndentID; // Extract parameters from query

    if (!indentID) {
      return res.status(400).json({ message: "IndentID is required." });
    }

    // Find the existing record by its primary key
    const branchTransfer = await BranchTransfer.findOne({
      where: { IndentID: indentID },
      transaction,
    });

    if (!branchTransfer) {
      return res.status(404).json({ message: "BranchTransfer not found." });
    }

    // Prepare data for external service
    const cancelEWBJsonData = {
      ewbNo: branchTransfer.EWBNo,
      cancelRsnCode: 2,
      cancelRmrk: req.body.Remarks,
    };
    const ewbResponseData = await cancelEwayBill(cancelEWBJsonData);
    console.log("Cancelled EWB.", ewbResponseData.ErrorMessage);

    if (ewbResponseData.Status == 1) {
      // Update branchTransfer with new values
      // branchTransfer.DCNo = generateBDCNo(req.body.BranchCode);
      // branchTransfer.DCDate = new Date();
      branchTransfer.Status = "Cancelled";
      branchTransfer.Remarks = req.body.Remarks;
      branchTransfer.ModifiedDate = new Date();

      // Update related BranchIndent record
      await BranchIndent.update(
        { Status: "Cancelled", ModifiedDate: new Date() },
        { where: { IndentID: branchTransfer.IndentID }, transaction }
      );

      // Save the updated BranchTransfer record
      await branchTransfer.save({ transaction });

      // Commit the transaction
      await transaction.commit();

      // Send the updated record as response
      res.json(branchTransfer);
    } else {
      res.json(ewbResponseData);
    }
  } catch (error) {
    // Rollback the transaction in case of error
    try {
      await transaction.rollback();
    } catch (rollbackError) {
      console.error("Transaction rollback failed:", rollbackError);
    }

    // Handle errors based on specific types
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        message: "Validation error",
        details: error.errors.map((e) => e.message),
      });
    }

    if (error.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message: "Database error occurred while updating BranchTransfers.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    console.error("Error occurred while updating BranchTransfer:", error);
    res.status(500).json({
      message: "Internal server error occurred while updating BranchTransfer.",
      error: error.message,
    });
  }
};

// Update a BranchTransfer by the Returned Action
exports.updateByReturned = async (req, res) => {
  const transaction = await Seq.transaction(); // Start a transaction
  try {
    const indentID = req.query.IndentID; // Extract parameters from query

    if (!indentID) {
      return res.status(400).json({ message: "IndentID is required." });
    }

    // Find the existing record by its primary key
    const branchTransfer = await BranchTransfer.findOne({
      where: { IndentID: indentID },
      transaction,
    });

    if (!branchTransfer) {
      return res.status(404).json({ message: "BranchTransfer not found." });
    }

    // Prepare data for external service
    // const cancelEWBJsonData = {
    //   ewbNo: branchTransfer.EWBNo,
    //   cancelRsnCode: 2,
    //   cancelRmrk: req.body.Remarks,
    // };
    // const ewbResponseData = await cancelEwayBill(cancelEWBJsonData);
    // console.log("Cancelled EWB.", ewbResponseData.ErrorMessage);

    // Update branchTransfer with new values
    // branchTransfer.DCNo = generateBDCNo(req.body.BranchCode);
    // branchTransfer.DCDate = new Date();
    branchTransfer.Status = "Returned";
    branchTransfer.Remarks = req.body.Remarks;
    branchTransfer.ModifiedDate = new Date();

    // Update related BranchIndent record
    await BranchIndent.update(
      { Status: "Returned", ModifiedDate: new Date() },
      { where: { IndentID: branchTransfer.IndentID }, transaction }
    );

    // Save the updated BranchTransfer record
    await branchTransfer.save({ transaction });

    // Commit the transaction
    await transaction.commit();

    // Send the updated record as response
    res.json(branchTransfer);
  } catch (error) {
    // Rollback the transaction in case of error
    try {
      await transaction.rollback();
    } catch (rollbackError) {
      console.error("Transaction rollback failed:", rollbackError);
    }

    // Handle errors based on specific types
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        message: "Validation error",
        details: error.errors.map((e) => e.message),
      });
    }

    if (error.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message: "Database error occurred while updating BranchTransfers.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    console.error("Error occurred while updating BranchTransfer:", error);
    res.status(500).json({
      message: "Internal server error occurred while updating BranchTransfer.",
      error: error.message,
    });
  }
};
