/* eslint-disable no-unused-vars */
const db = require("../models");
const DealerTransfer = db.dealertransfers;
const DealerIndent = db.dealerindents;
const BranchMaster = db.branchmaster;
const VendorMaster = db.vendormaster;
const UserMaster = db.usermaster;
const VehicleStock = db.vehiclestock;
const DTCheckList = db.dtCheckList;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;
const { cancelEwayBill } = require("./GST.controller");
const { generateBDCNo } = require("../Utils/generateService");

//Basic CRUD API for Dealer Transfer

//Retrieve all stock from the database
exports.findAll = async (req, res) => {
  try {
    const data = await DealerTransfer.findAll({
      attributes: [
        "DealerTransferID",
        "IndentID",
        "InvoiceNo",
        "DCNo",
        "DCDate",
        "FromBranch",
        "ToRegion",
        "EngineNo",
        "ChassisNo",
        "KeyNo",
        "FuelQty", // Changed from "FuelQuantity" to "FuelQty"
        "PurchaseID", // Changed from "VehicleID" to "PurchaseID"
        "EWBNo",
        "EWBDate",
        "EWBValidUpto",
        "DriverID",
        "DriverOTP",
        "GateOutTime",
        "StartingKM",
        "GateInTime",
        "EndingKM",
        "GRNNo",
        "TransferType",
        "DealerType",
        "TaxType",
        "ExShowRoom",
        "CostOfVehicle",
        "IGSTValue",
        "CESSValue",
        "Status",
        "Remarks",
        "CreatedDate",
        "ModifiedDate",
      ],
      order: [
        ["DealerTransferID", "ASC"], // Order by ModelDescription in ascending order
      ],
    });

    res.send(data);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while retrieving dealer name data.",
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

    res.status(500).send({
      message:
        error.message || "Some error occurred while retrieving DealerTransfer.",
    });
  }
};

// Find a single stock with an id
exports.findOne = async (req, res) => {
  const id = req.params.id;

  try {
    const data = await DealerTransfer.findOne({
      where: { DealerTransferID: id },
    });

    if (!data) {
      return res
        .status(404)
        .send({ message: "DealerTransfer not found with id=" + id });
    }

    res.send(data);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while retrieving dealer data.",
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

    console.error("Error retrieving DealerTransfer:", error);
    res
      .status(500)
      .send({ message: "Error retrieving DealerTransfer with id=" + id });
  }
};

// Save DealerTransfer in the database
exports.create = async (req, res) => {
  try {
    //Create a DealerTransfer
    const dealerTransferData = {
      IndentID: req.body.IndentID,
      InvoiceNo: req.body.InvoiceNo,
      DCNo: req.body.DCNo,
      DCDate: req.body.DCDate,
      FromBranch: req.body.FromBranch,
      ToRegion: req.body.ToRegion,
      EngineNo: req.body.EngineNo,
      ChassisNo: req.body.ChassisNo,
      KeyNo: req.body.KeyNo,
      FuelQty: req.body.FuelQty, // Changed from "FuelQuantity" to "FuelQty"
      PurchaseID: req.body.PurchaseID, // Changed from "VehicleID" to "PurchaseID"
      EWBNo: req.body.EWBNo,
      EWBDate: req.body.EWBDate,
      EWBValidUpto: req.body.EWBValidUpto,
      DriverID: req.body.DriverID,
      DriverOTP: req.body.DriverOTP,
      GateOutTime: req.body.GateOutTime,
      StartingKM: req.body.StartingKM,
      GateInTime: req.body.GateInTime,
      EndingKM: req.body.EndingKM,
      GRNNo: req.body.GRNNo,
      TransferType: req.body.TransferType,
      DealerType: req.body.DealerType,
      TaxType: req.body.TaxType,
      ExShowRoom: req.body.ExShowRoom,
      CostOfVehicle: req.body.CostOfVehicle,
      IGSTValue: req.body.IGSTValue,
      CESSValue: req.body.CESSValue,
      Status: req.body.Status ? req.body.Status : "Open",
      Remarks: req.body.Remarks,
    };

    console.log(dealerTransferData);

    // Create the record
    const data = await DealerTransfer.create(dealerTransferData);
    res.send(data);
  } catch (error) {
    console.error("Error occurred while creating DealerTransfer:", error);
    // Handle errors based on specific types

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
        message: "Database error occurred while creating DealerIndents.",
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

    // Determine error type and send appropriate response
    if (error.name === "SequelizeValidationError") {
      res.status(400).json({
        message: "Validation error occurred while creating DealerTransfer.",
        errors: error.errors,
      });
    } else {
      res.status(500).json({
        message:
          "Internal server error occurred while creating DealerTransfer.",
      });
    }
  }
};

// Update a DealerTransfer by the id in the request
exports.updateByPk = async (req, res) => {
  try {
    // Extract the ID from request parameters
    const { id } = req.params;

    // Check if ID is provided
    if (!id) {
      return res.status(400).json({ message: "ID parameter is missing." });
    }
    // Find the DealerTransfer by ID
    const dealerTransfer = await DealerTransfer.findByPk(id);
    // Check if DealerTransfer exists
    if (!dealerTransfer) {
      return res.status(404).json({ message: "DealerTransfer not found." });
    }
    // Map the fields from the request body to existing dealerTransfer object
    dealerTransfer.IndentID = req.body.IndentID || dealerTransfer.IndentID;
    dealerTransfer.DCNo = req.body.DCNo || dealerTransfer.DCNo;
    dealerTransfer.DCDate = req.body.DCDate || dealerTransfer.DCDate;
    dealerTransfer.FromBranch =
      req.body.FromBranch || dealerTransfer.FromBranch;
    dealerTransfer.ToRegion = req.body.ToRegion || dealerTransfer.ToRegion;
    dealerTransfer.EngineNo = req.body.EngineNo || dealerTransfer.EngineNo;
    dealerTransfer.ChassisNo = req.body.ChassisNo || dealerTransfer.ChassisNo;
    dealerTransfer.KeyNo = req.body.KeyNo || dealerTransfer.KeyNo;
    dealerTransfer.FuelQty = req.body.FuelQty || dealerTransfer.FuelQty;
    dealerTransfer.PurchaseID =
      req.body.PurchaseID || dealerTransfer.PurchaseID;
    dealerTransfer.EWBNo = req.body.EWBNo || dealerTransfer.EWBNo;
    dealerTransfer.EWBDate = req.body.EWBDate || dealerTransfer.EWBDate;
    dealerTransfer.EWBValidUpto =
      req.body.EWBValidUpto || dealerTransfer.EWBValidUpto;
    dealerTransfer.DriverID = req.body.DriverID || dealerTransfer.DriverID;
    dealerTransfer.DriverOTP = req.body.DriverOTP || dealerTransfer.DriverOTP;
    dealerTransfer.GateOutTime =
      req.body.GateOutTime || dealerTransfer.GateOutTime;
    dealerTransfer.StartingKM =
      req.body.StartingKM || dealerTransfer.StartingKM;
    dealerTransfer.GateInTime =
      req.body.GateInTime || dealerTransfer.GateInTime;
    dealerTransfer.EndingKM = req.body.EndingKM || dealerTransfer.EndingKM;
    dealerTransfer.GRNNo = req.body.GRNNo || dealerTransfer.GRNNo;
    dealerTransfer.TransferType =
      req.body.TransferType || dealerTransfer.TransferType;
    dealerTransfer.DealerType =
      req.body.DealerType || dealerTransfer.DealerType;
    dealerTransfer.TaxType = req.body.TaxType || dealerTransfer.TaxType;
    dealerTransfer.ExShowRoom =
      req.body.ExShowRoom || dealerTransfer.ExShowRoom;
    dealerTransfer.CostOfVehicle =
      req.body.CostOfVehicle || dealerTransfer.CostOfVehicle;
    dealerTransfer.IGSTValue = req.body.IGSTValue || dealerTransfer.IGSTValue;
    dealerTransfer.CESSValue = req.body.CESSValue || dealerTransfer.CESSValue;
    dealerTransfer.Status = req.body.Status || dealerTransfer.Status;
    dealerTransfer.Remarks = req.body.Remarks || dealerTransfer.Remarks;
    dealerTransfer.ModifiedDate = new Date();

    // Save the updated dealerTransfer object
    await dealerTransfer.save();

    // Send success response
    res.status(200).json({ message: "DealerTransfer updated successfully." });
  } catch (err) {
    console.error("Error occurred while updating DealerTransfer:", err);

    // Determine error type and send appropriate response
    // Handle errors based on specific types

    if (err.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while updating DealerIndents.",
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

    if (err.name === "SequelizeValidationError") {
      res.status(400).json({
        message: "Validation error occurred while updating DealerTransfer.",
        errors: err.errors,
      });
    } else {
      res.status(500).json({
        message:
          "Internal server error occurred while updating DealerTransfer.",
      });
    }
  }
};

// Delete a DealerTransfer with the specified id in the request
exports.deleteByPk = async (req, res) => {
  const branchID = req.params.id;

  try {
    // Extract the ID from request parameters
    const { id } = req.params;

    // Check if ID is provided
    if (!id) {
      return res.status(400).json({ message: "ID parameter is missing." });
    }

    // Delete the DealerIndent by ID
    const numDeleted = await DealerTransfer.destroy({
      where: {
        DealerTransferID: id,
      },
    });

    // Check if any record was deleted
    if (numDeleted === 0) {
      return res.status(404).json({ message: "DealerTransfer not found." });
    }

    // Send success response
    res.status(200).json({ message: "DealerTransfer deleted successfully." });
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while deleting DealerIndents.",
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
    console.error("Error occurred while deleting DealerTransfer:", error);

    // Send error response
    res.status(500).json({
      message: "Internal server error occurred while deleting DealerTransfer.",
    });
  }
};

// Get list of raised indents which is received to home branch
exports.findAllCoDealerTransfers = async (req, res) => {
  try {
    const toRegion = req.body.ToRegion;
    const data = await DealerTransfer.findAll({
      attributes: [
        "DealerTransferID",
        "IndentID",
        "InvoiceNo",
        "DCNo",
        "DCDate",
        "FromBranch",
        "ToRegion",
        "EngineNo",
        "ChassisNo",
        "KeyNo",
        "FuelQty", // Changed from "FuelQuantity" to "FuelQty"
        "PurchaseID", // Changed from "VehicleID" to "PurchaseID"
        "EWBNo",
        "EWBDate",
        "EWBValidUpto",
        "DriverID",
        "DriverOTP",
        "GateOutTime",
        "StartingKM",
        "GateInTime",
        "EndingKM",
        "GRNNo",
        "TransferType",
        "DealerType",
        "TaxType",
        "ExShowRoom",
        "CostOfVehicle",
        "IGSTValue",
        "CESSValue",
        "Status",
        "Remarks",
        "CreatedDate",
        "ModifiedDate",
      ],
      where: {
        ToRegion: { [Op.eq]: toRegion },
      },
      order: [
        ["DealerTransferID", "ASC"], // Order by ModelDescription in ascending order
      ],
    });
    if (!data || data.length === 0) {
      // If no data found, send a 404 response
      return res.status(404).send({ message: "No DealerTransfer found." });
    }
    // Send the data in the response
    res.send(data);
  } catch (err) {
    console.error("Error occurred while retrieving DealerTransfer:", err);
    res.status(500).send({
      message:
        "Internal server error occurred while retrieving DealerTransfer.",
      error: err.message, // Sending the error message for debugging purposes
    });
  }
};

// Get list of issued indents which is sent from home branch
exports.findAllOwnDealerTransfers = async (req, res) => {
  try {
    const fromBranch = req.body.FromBranch;
    const data = await DealerTransfer.findAll({
      attributes: [
        "DealerTransferID",
        "IndentID",
        "InvoiceNo",
        "DCNo",
        "DCDate",
        "FromBranch",
        "ToRegion",
        "EngineNo",
        "ChassisNo",
        "KeyNo",
        "FuelQty", // Changed from "FuelQuantity" to "FuelQty"
        "PurchaseID", // Changed from "VehicleID" to "PurchaseID"
        "EWBNo",
        "EWBDate",
        "EWBValidUpto",
        "DriverID",
        "DriverOTP",
        "GateOutTime",
        "StartingKM",
        "GateInTime",
        "EndingKM",
        "GRNNo",
        "TransferType",
        "DealerType",
        "TaxType",
        "ExShowRoom",
        "CostOfVehicle",
        "IGSTValue",
        "CESSValue",
        "Status",
        "Remarks",
        "CreatedDate",
        "ModifiedDate",
      ],
      where: {
        FromBranch: { [Op.eq]: fromBranch },
      },
      order: [
        ["DealerTransferID", "ASC"], // Order by ModelDescription in ascending order
      ],
    });
    if (!data || data.length === 0) {
      // If no data found, send a 404 response
      return res.status(404).send({ message: "No DealerTransfer found." });
    }
    // Send the data in the response
    res.send(data);
  } catch (err) {
    console.error("Error occurred while retrieving DealerTransfer:", err);
    res.status(500).send({
      message:
        "Internal server error occurred while retrieving DealerTransfer.",
      error: err.message, // Sending the error message for debugging purposes
    });
  }
};

// Get list of Transfers by screen dynamically
exports.getDealerTransferByScreen = async (req, res) => {
  try {
    const id = req.query.BranchID;
    const screen = req.query.ScreenName;
    console.log("id: ", id);
    console.log("screen: ", screen);

    let whereCondition = {}; // Define an empty object to hold the dynamic WHERE condition

    if (screen === "Own-Dealer") {
      whereCondition = { FromBranch: id, DealerType: "Own-Dealer" };
    } else if (screen === "Co-Dealer") {
      whereCondition = { FromBranch: id, DealerType: "Co-Dealer" };
    } else {
      // Handle unexpected values of screen if needed
      return res.status(400).json({ message: "Invalid value for ScreenName." });
    }
    const data = await DealerTransfer.findAll({
      where: whereCondition,
      attributes: [
        "DealerTransferID",
        "IndentID",
        "InvoiceNo",
        "DCNo",
        "DCDate",
        "FromBranch",
        "ToRegion",
        "EngineNo",
        "ChassisNo",
        "KeyNo",
        "FuelQty", // Changed from "FuelQuantity" to "FuelQty"
        "PurchaseID", // Changed from "VehicleID" to "PurchaseID"
        "EWBNo",
        "EWBDate",
        "EWBValidUpto",
        "DriverID",
        "DriverOTP",
        "GateOutTime",
        "StartingKM",
        "GateInTime",
        "EndingKM",
        "GRNNo",
        "DealerType",
        "TransferType",
        "TaxType",
        "ExShowRoom",
        "CostOfVehicle",
        "IGSTValue",
        "CESSValue",
        "Status",
        "Remarks",
      ],
      include: [
        {
          model: DealerIndent,
          as: "DTIndentID",
          attributes: [
            "IndentID",
            "IndentNo",
            "IndentDate",
            "FromBranch", //foreign key refering to branch master
            "ToRegion", //foreign key refering to branch master
            "DealerType",
            "ModelCode",
            "VariantCode",
            "ColourCode",
            "DriverID",
            "EMPMobileNo",
            "Status",
          ],
          include: [
            {
              model: BranchMaster,
              as: "DIFromBranchID",
              attributes: ["BranchID", "BranchCode", "BranchName"],
            },
            {
              model: VendorMaster,
              as: "DIToRegionID",
              attributes: ["VendorMasterID", "VendorCode", "VendorName"],
            },
          ],
        },
      ],
      order: [
        ["DealerTransferID", "ASC"], // Order by ModelDescription in ascending order
      ],
    });
    if (!data || data.length === 0) {
      // If no data found, send a 404 response
      return res.status(404).send({ message: "No DealerTransfers found." });
    }
    console.log("fetched data: ", data);

    const status = data.map((transfer) => {
      // Ensure DTIndentID and FromBranch are accessible and not null
      if (transfer.DTIndentID && transfer.DTIndentID.DIFromBranchID) {
        return transfer.DTIndentID.DIFromBranchID.BranchName;
      } else {
        return null; // or handle the case where the data may be missing
      }
    });

    console.log("Transfer status: ", status);
    // Map each row to a flat structure
    const mappedData = data.map((row) => ({
      DealerTransferID: row.DealerTransferID,
      IndentID: row.dataValues.IndentID,
      IndentNo: row.DTIndentID.IndentNo,
      IndentDate: row.DTIndentID.IndentDate,
      ModelCode: row.DTIndentID.ModelCode || null,
      VariantCode: row.DTIndentID.VariantCode || null,
      ColourCode: row.DTIndentID.ColourCode || null,
      DriverID: row.DTIndentID.DriverID || null,
      EmpMobileNo: row.DTIndentID.EMPMobileNo || null,
      FromBranchID: row.dataValues.FromBranch || null,
      FromBranchCode: row.DTIndentID.DIFromBranchID
        ? row.DTIndentID.DIFromBranchID.BranchCode
        : null,
      FromBranchName: row.DTIndentID.DIFromBranchID
        ? row.DTIndentID.DIFromBranchID.BranchName
        : null,
      ToRegionID: row.dataValues.ToRegion || null,
      ToRegionStateID: row.DTIndentID.DIToRegionID
        ? row.DTIndentID.DIToRegionID.VendorMasterID
        : null,
      ToRegionName: row.DTIndentID.DIToRegionID
        ? row.DTIndentID.DIToRegionID.VendorName
        : null,
      EngineNo: row.dataValues.EngineNo || null,
      ChassisNo: row.dataValues.ChassisNo || null,
      KeyNo: row.dataValues.KeyNo || null,
      DCNo: row.dataValues.DCNo || null,
      DCDate: row.dataValues.DCDate || null,
      GateOutTime: row.dataValues.GateOutTime || null,
      StartingKM: row.dataValues.StartingKM || null,
      GateInTime: row.dataValues.GateInTime || null,
      EndingKM: row.dataValues.EndingKM || null,
      GRNNo: row.dataValues.GRNNo || null,
      FuelQty: row.dataValues.FuelQty || null,
      PurchaseID: row.dataValues.PurchaseID || null,
      EWBNo: row.dataValues.EWBNo || null,
      EWBDate: row.dataValues.EWBDate || null,
      EWBValidUpto: row.dataValues.EWBValidUpto || null,
      DriverOTP: row.dataValues.DriverOTP || null,
      TransferType: row.dataValues.TransferType || null,
      DealerType: row.dataValues.DealerType || null,
      TaxType: row.dataValues.TaxType || null,
      ExShowRoom: row.dataValues.ExShowRoom || null,
      CostOfVehicle: row.dataValues.CostOfVehicle || null,
      IGSTValue: row.dataValues.IGSTValue || null,
      CESSValue: row.dataValues.CESSValue || null,
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
    console.error("Error occurred while retrieving DealerTransfers:", error);
    res.status(500).send({
      message:
        "Internal server error occurred while retrieving DealerTransfers.",
      error: error.message, // Sending the error message for debugging purposes
    });
  }
};

/* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! */
// Find a single Transfer BY QR Code
exports.findOneByQRCode = async (req, res) => {
  const dcNo = req.query.DCNo;

  try {
    const data = await DealerTransfer.findOne({
      attributes: [
        "DealerTransferID",
        "IndentID",
        "DCNo",
        "DCDate",
        "IssuedBy",
        // Flattened fields from BTIssuerID
        [sequelize.col("DTIssuerID.UserID"), "Issuer_UserID"],
        [sequelize.col("DTIssuerID.UserName"), "Issuer_UserName"],
        [sequelize.col("DTIssuerID.EmpID"), "Issuer_EmpID"],
        [sequelize.col("DTIssuerID.Mobile"), "Issuer_MobileNo"],
        "FromBranch",
        // Flattened fields from BTFromBranchID
        [sequelize.col("DTFromBranchID.BranchID"), "FromBranch_BranchID"],
        [sequelize.col("DTFromBranchID.BranchCode"), "FromBranch_BranchCode"],
        [sequelize.col("DTFromBranchID.BranchName"), "FromBranch_BranchName"],
        [sequelize.col("DTFromBranchID.GSTIN"), "FromBranch_GSTIN"],
        [sequelize.col("DTFromBranchID.State"), "FromBranch_State"],
        [sequelize.col("DTFromBranchID.District"), "FromBranch_District"],
        [sequelize.col("DTFromBranchID.Address"), "FromBranch_Address"],
        [sequelize.col("DTFromBranchID.PINCode"), "FromBranch_PINCode"],
        "ToRegion",
        // Flattened fields from BTToRegionID
        [
          sequelize.col("DTToRegionID.VendorMasterID"),
          "ToRegion_VendorMasterID",
        ],
        [sequelize.col("DTToRegionID.VendorCode"), "ToRegion_VendorCode"],
        [sequelize.col("DTToRegionID.VendorName"), "ToRegion_VendorName"],
        [sequelize.col("DTToRegionID.GSTID"), "ToRegion_GSTID"],
        [sequelize.col("DTToRegionID.State"), "ToRegion_State"],
        [sequelize.col("DTToRegionID.City"), "ToRegion_City"],
        [sequelize.col("DTToRegionID.Address"), "ToRegion_Address"],
        [sequelize.col("DTToRegionID.PINCode"), "ToRegion_PINCode"],
        // Flattened fields from BTPurchaseID
        [sequelize.col("DTPurchaseID.ModelCode"), "ModelCode"],
        [sequelize.col("DTPurchaseID.VariantCode"), "VariantCode"],
        [sequelize.col("DTPurchaseID.ColourCode"), "ColourCode"],
        [sequelize.col("DTPurchaseID.TransmissionCode"), "TransmissionCode"],
        [sequelize.col("DTPurchaseID.FuelType"), "FuelType"],
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
        [sequelize.col("DTDriverID.UserID"), "Driver_UserID"],
        [sequelize.col("DTDriverID.UserName"), "Driver_UserName"],
        [sequelize.col("DTDriverID.EmpID"), "Driver_EmpID"],
        [sequelize.col("DTDriverID.Mobile"), "Driver_MobileNo"],
        "DriverOTP",
        "GateOutTime",
        "StartingKM",
        "GateInTime",
        "EndingKM",
        "GRNNo",
        "TransferType",
        "DealerType",
        "TaxType",
        "ExShowRoom",
        "CostOfVehicle",
        "IGSTValue",
        "CESSValue",
        "Status",
        "Remarks",
        "CreatedDate",
        "ModifiedDate",
      ],
      include: [
        {
          model: BranchMaster,
          as: "DTFromBranchID",
          attributes: [],
        },
        {
          model: VendorMaster,
          as: "DTToRegionID",
          attributes: [],
        },
        {
          model: UserMaster,
          as: "DTDriverID",
          attributes: [],
        },
        {
          model: UserMaster,
          as: "DTIssuerID",
          attributes: [],
        },
        {
          model: VehicleStock,
          as: "DTPurchaseID",
          attributes: [],
        },
      ],
      where: { DCNo: dcNo },
    });

    if (!data) {
      return res
        .status(404)
        .send({ message: "DealerTransfer not found with DC=" + dcNo });
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
    console.error("Error retrieving DealerTransfer:", error);
    res
      .status(500)
      .send({ message: "Error retrieving DealerTransfer with DC=" + dcNo });
  }
};

// Update a DealerTransfer by the id using Gate APP
exports.updateByGateApp = async (req, res) => {
  const transaction = await Seq.transaction(); // Start a transaction
  try {
    const { DCNo, CheckListType } = req.query; // Extract parameters from query

    if (!DCNo || !CheckListType) {
      return res
        .status(400)
        .json({ message: "DCNo and CheckListType are required." });
    }

    // Find the existing DealerTransfer and BTCheckList records in parallel
    const [DealerTransferData, checkData] = await Promise.all([
      DealerTransfer.findOne({ where: { DCNo }, transaction }),
      DTCheckList.findOne({ where: { DCNo, CheckListType }, transaction }),
    ]);

    if (!DealerTransferData) {
      return res.status(404).json({ message: "DealerTransfer not found." });
    }
    if (!checkData) {
      return res.status(404).json({ message: "BTCheckList not found." });
    }

    // Update DealerTransferData with values from req.body
    if (CheckListType === "Out") {
      DealerTransferData.GateOutTime =
        req.body.GateOutTime || DealerTransferData.GateOutTime;
      DealerTransferData.StartingKM =
        req.body.StartingKM || DealerTransferData.StartingKM;
      DealerTransferData.Remarks =
        req.body.Remarks || DealerTransferData.Remarks;
      DealerTransferData.Status = "In-Transit";
    } else if (CheckListType === "In") {
      DealerTransferData.GateInTime =
        req.body.GateInTime || DealerTransferData.GateInTime;
      DealerTransferData.EndingKM =
        req.body.EndingKM || DealerTransferData.EndingKM;
      DealerTransferData.Remarks =
        req.body.Remarks || DealerTransferData.Remarks;
      if (req.body.Status === "Returned") {
        await VehicleStock.update(
          {
            Status: "In-Stock",
            BranchID: DealerTransferData.FromBranch,
            ModifiedDate: new Date(),
          },
          { where: { PurchaseID: DealerTransferData.PurchaseID }, transaction }
        );
        await DealerIndent.update(
          { Status: "Returned", ModifiedDate: new Date() },
          { where: { IndentID: DealerTransferData.IndentID }, transaction }
        );
        DealerTransferData.Status = "Returned";
      } else {
        DealerTransferData.Status = "Received";
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
      await DealerIndent.update(
        { Status: "In-Transit", ModifiedDate: new Date() },
        { where: { IndentID: DealerTransferData.IndentID }, transaction }
      );
      await VehicleStock.update(
        { Status: "In-Transit", ModifiedDate: new Date() },
        { where: { PurchaseID: DealerTransferData.PurchaseID }, transaction }
      );
    } else if (CheckListType === "In" && req.body.Status !== "Returned") {
      await DealerIndent.update(
        { Status: "Received", ModifiedDate: new Date() },
        { where: { IndentID: DealerTransferData.IndentID }, transaction }
      );
      await VehicleStock.update(
        {
          Status: "In-Stock",
          BranchID: DealerTransferData.ToBranch,
          ModifiedDate: new Date(),
        },
        { where: { PurchaseID: DealerTransferData.PurchaseID }, transaction }
      );
    }

    // Save the updated records
    await DealerTransferData.save({ transaction });
    await checkData.save({ transaction });

    // Commit the transaction
    await transaction.commit();

    res.status(200).json({
      updatedDealerTransfer: DealerTransferData,
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
        message: "Database error occurred while updating DealerTransfers.",
        details: error.message,
      },
      503: {
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      },
      default: {
        message:
          "Internal server error occurred while updating DealerTransfer.",
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

//     // Find the existing DealerTransfer record
//     const DealerTransferData = await DealerTransfer.findOne({
//       where: { DCNo },
//       transaction, // Use the transaction
//     });
//     if (!DealerTransferData) {
//       console.log("DealerTransfer not found.");
//       return res.status(404).json({ message: "DealerTransfer not found." });
//     }

//     console.log("Found DealerTransferData:", DealerTransferData);

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

//     // Update DealerTransferData with values from req.body
//     if (CheckListType === "Out") {
//       DealerTransferData.GateOutTime =
//         req.body.GateOutTime || DealerTransferData.GateOutTime;
//       DealerTransferData.StartingKM =
//         req.body.StartingKM || DealerTransferData.StartingKM;
//       DealerTransferData.Remarks =
//         req.body.Remarks || DealerTransferData.Remarks;
//       DealerTransferData.Status = "In-Transit";
//     } else if (CheckListType === "In") {
//       DealerTransferData.GateInTime =
//         req.body.GateInTime || DealerTransferData.GateInTime;
//       DealerTransferData.EndingKM =
//         req.body.EndingKM || DealerTransferData.EndingKM;
//       DealerTransferData.Remarks =
//         req.body.Remarks || DealerTransferData.Remarks;
//       DealerTransferData.Status = "Received";
//     }

//     console.log("Updated DealerTransferData:", DealerTransferData);

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
//       await DealerIndent.update(
//         { Status: "In-Transit" },
//         { where: { IndentID: DealerTransferData.IndentID }, transaction }
//       );
//       await VehicleStock.update(
//         { Status: "In-Transit" },
//         { where: { PurchaseID: DealerTransferData.PurchaseID }, transaction }
//       );
//     } else if (CheckListType === "In") {
//       await DealerIndent.update(
//         { Status: "Received" },
//         { where: { IndentID: DealerTransferData.IndentID }, transaction }
//       );
//       await VehicleStock.update(
//         { Status: "In-Stock", BranchID: DealerTransferData.ToBranch },
//         { where: { PurchaseID: DealerTransferData.PurchaseID }, transaction }
//       );
//     }

//     // Save the updated records
//     await DealerTransferData.save({ transaction });
//     await checkData.save({ transaction });

//     // Commit the transaction
//     await transaction.commit();

//     console.log("Saved updatedDealerTransfer:", DealerTransferData);
//     console.log("Saved updatedBTCheckList:", checkData);

//     // Send the updated records as response
//     res.json({
//       updatedDealerTransfer: DealerTransferData,
//       updatedBTCheckList: checkData,
//     });
//   } catch (error) {
//     // Rollback the transaction in case of error
//     await transaction.rollback();

//     console.error("Error occurred while updating DealerTransfer:", error);

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
//         message: "Database error occurred while updating DealerTransfers.",
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
//       message: "Internal server error occurred while updating DealerTransfer.",
//       error: error.message,
//     });
//   }
// };

// Save DealerTransfer Check List in the database
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
    const existingRecords = await DTCheckList.findAll({
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
    // Create a new DealerTransfer record
    const newRecords = await DTCheckList.bulkCreate(checkLists);

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
        message: "Database error occurred while creating DealerTransfer.",
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
    console.error("Error occurred while creating DealerTransfer:", error);
    res.status(500).json({
      message: "Internal server error occurred while creating DealerTransfer.",
      error: error.message,
    });
  }
};

// Update a DealerTransfer by the Cancel Action
exports.updateByCancelled = async (req, res) => {
  const transaction = await Seq.transaction(); // Start a transaction
  try {
    const indentID = req.query.IndentID; // Extract parameters from query

    if (!indentID) {
      return res.status(400).json({ message: "IndentID is required." });
    }

    // Find the existing record by its primary key
    const dealerTransfer = await DealerTransfer.findOne({
      where: { IndentID: indentID },
      transaction,
    });

    if (!dealerTransfer) {
      return res.status(404).json({ message: "DealerTransfer not found." });
    }

    // Prepare data for external service
    const cancelEWBJsonData = {
      ewbNo: dealerTransfer.EWBNo,
      cancelRsnCode: 2,
      cancelRmrk: req.body.Remarks,
    };
    const ewbResponseData = await cancelEwayBill(cancelEWBJsonData);
    console.log("Cancelled EWB.", ewbResponseData.ErrorMessage);

    if (ewbResponseData.Status == 1) {
      // Update DealerTransfer with new values
      // DealerTransfer.DCNo = generateBDCNo(req.body.BranchCode);
      // DealerTransfer.DCDate = new Date();
      dealerTransfer.Status = "Cancelled";
      dealerTransfer.Remarks = req.body.Remarks;
      dealerTransfer.ModifiedDate = new Date();

      // Update related DealerIndent record
      await DealerIndent.update(
        { Status: "Cancelled", ModifiedDate: new Date() },
        { where: { IndentID: dealerTransfer.IndentID }, transaction }
      );

      // Save the updated DealerTransfer record
      await dealerTransfer.save({ transaction });

      // Commit the transaction
      await transaction.commit();

      // Send the updated record as response
      res.json(dealerTransfer);
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
        message: "Database error occurred while updating DealerTransfers.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    console.error("Error occurred while updating DealerTransfer:", error);
    res.status(500).json({
      message: "Internal server error occurred while updating DealerTransfer.",
      error: error.message,
    });
  }
};

// Update a DealerTransfer by the Returned Action
exports.updateByReturned = async (req, res) => {
  const transaction = await Seq.transaction(); // Start a transaction
  try {
    const indentID = req.query.IndentID; // Extract parameters from query

    if (!indentID) {
      return res.status(400).json({ message: "IndentID is required." });
    }

    // Find the existing record by its primary key
    const dealerTransfer = await DealerTransfer.findOne({
      where: { IndentID: indentID },
      transaction,
    });

    if (!dealerTransfer) {
      return res.status(404).json({ message: "DealerTransfer not found." });
    }

    // Prepare data for external service
    // const cancelEWBJsonData = {
    //   ewbNo: dealerTransfer.EWBNo,
    //   cancelRsnCode: 2,
    //   cancelRmrk: req.body.Remarks,
    // };
    // const ewbResponseData = await cancelEwayBill(cancelEWBJsonData);
    // console.log("Cancelled EWB.", ewbResponseData.ErrorMessage);

    // Update DealerTransfer with new values
    // dealerTransfer.DCNo = generateBDCNo(req.body.BranchCode);
    // dealerTransfer.DCDate = new Date();
    dealerTransfer.Status = "Returned";
    dealerTransfer.Remarks = req.body.Remarks;
    dealerTransfer.ModifiedDate = new Date();

    // Update related DealerIndent record
    await DealerIndent.update(
      { Status: "Returned", ModifiedDate: new Date() },
      { where: { IndentID: dealerTransfer.IndentID }, transaction }
    );

    // Save the updated DealerTransfer record
    await dealerTransfer.save({ transaction });

    // Commit the transaction
    await transaction.commit();

    // Send the updated record as response
    res.json(dealerTransfer);
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
        message: "Database error occurred while updating DealerTransfers.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    console.error("Error occurred while updating DealerTransfer:", error);
    res.status(500).json({
      message: "Internal server error occurred while updating DealerTransfer.",
      error: error.message,
    });
  }
};
