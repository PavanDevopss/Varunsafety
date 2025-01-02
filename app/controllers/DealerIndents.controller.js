/* eslint-disable no-unused-vars */
const db = require("../models");
const DealerIndents = db.dealerindents;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;
const BranchMaster = db.branchmaster;
const VendorMaster = db.vendormaster;
const DealerTransfer = db.dealertransfers;
const ModelMaster = db.modelmaster;
const ColourMaster = db.colourmaster;
const VariantMaster = db.variantmaster;
const Transmission = db.transmission;
const VehicleStock = db.vehiclestock;
const SKUMaster = db.skumaster;
const UserMaster = db.usermaster;
const {
  generateDIndentNo,
  generateDDCNo,

  convertTimestamp,
  generateRandomOTP,
  formatDate,
} = require("../Utils/generateService");
const { generateEwayBill } = require("./GST.controller");

//Basic CRUD API for Dealer Indents

//Retrieve all stock from the database
exports.findAll = async (req, res) => {
  try {
    const data = await DealerIndents.findAll({
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
        "FuelType",
        "Transmission",
        "DriverID",
        "EMPMobileNo",
        "Status",
        "CreatedDate",
        "ModifiedDate",
      ],
      include: [
        {
          model: BranchMaster,
          as: "DIBranchID",
          attributes: ["BranchID", "BranchCode", "BranchName"],
        },
        {
          model: VendorMaster,
          as: "DIRegionID",
          attributes: ["RegionID", "StateID", "RegionName"],
        },
      ],
      order: [
        ["IndentID", "ASC"], // Order by ModelDescription in ascending order
      ],
    });

    // Mapping the fetched data into a structured format
    const mappedData = data.map((indent) => ({
      IndentID: indent.IndentID,
      IndentNo: indent.IndentNo,
      IndentDate: indent.IndentDate,
      BranchID: indent.DIBranchID ? indent.DIBranchID.BranchID : null,
      BranchCode: indent.DIBranchID ? indent.DIBranchID.BranchCode : null,
      BranchName: indent.DIBranchID ? indent.DIBranchID.BranchName : null,
      RegionID: indent.DIRegionID ? indent.DIRegionID.RegionID : null,
      StateID: indent.DIRegionID ? indent.DIRegionID.StateID : null,
      RegionName: indent.DIRegionID ? indent.DIRegionID.RegionName : null,
      DealerType: indent.DealerType,
      ModelCode: indent.ModelCode,
      VariantCode: indent.VariantCode,
      ColourCode: indent.ColourCode,
      DriverID: indent.DriverID,
      EmpMobileNo: indent.EMPMobileNo,
      Status: indent.Status,
      CreatedDate: indent.CreatedDate,
      ModifiedDate: indent.ModifiedDate,
    }));

    // Sending mappedData in the response
    res.send(mappedData);
  } catch (err) {
    // Handle errors based on specific types
    if (err.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while retrieving dealer name data.",
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
    res.status(500).send({
      message:
        err.message || "Some error occurred while retrieving DealerIndent.",
    });
  }
};

// Find a single stock with an id
exports.findOne = async (req, res) => {
  const id = req.params.id;

  try {
    const indent = await DealerIndents.findOne({
      where: { IndentID: id },
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
        "FuelType",
        "Transmission",
        "DriverID",
        "EMPMobileNo",
        "Status",
        "CreatedDate",
        "ModifiedDate",
      ],
      include: [
        {
          model: BranchMaster,
          as: "DIBranchID",
          attributes: ["BranchID", "BranchCode", "BranchName"],
        },
        {
          model: VendorMaster,
          as: "DIRegionID",
          attributes: ["RegionID", "StateID", "RegionName"],
        },
      ],
      order: [
        ["IndentID", "ASC"], // Order by ModelDescription in ascending order
      ],
    });

    if (!indent) {
      return res
        .status(404)
        .send({ message: "DealerIndent not found with id=" + id });
    }

    // Mapping the fetched data into a structured format
    const mappedData = {
      IndentID: indent.IndentID,
      IndentNo: indent.IndentNo,
      IndentDate: indent.IndentDate,
      BranchID: indent.DIBranchID ? indent.DIBranchID.BranchID : null,
      BranchCode: indent.DIBranchID ? indent.DIBranchID.BranchCode : null,
      BranchName: indent.DIBranchID ? indent.DIBranchID.BranchName : null,
      RegionID: indent.DIRegionID ? indent.DIRegionID.RegionID : null,
      StateID: indent.DIRegionID ? indent.DIRegionID.StateID : null,
      RegionName: indent.DIRegionID ? indent.DIRegionID.RegionName : null,
      DealerType: indent.DealerType,
      ModelCode: indent.ModelCode,
      VariantCode: indent.VariantCode,
      ColourCode: indent.ColourCode,
      DriverID: indent.DriverID,
      EmpMobileNo: indent.EMPMobileNo,
      Status: indent.Status,
      CreatedDate: indent.CreatedDate,
      ModifiedDate: indent.ModifiedDate,
    };

    // Sending mappedData in the response
    res.send(mappedData);
  } catch (err) {
    // Handle errors based on specific types
    if (err.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while retrieving dealer data.",
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
    console.error("Error retrieving DealerIndent:", err);
    res
      .status(500)
      .send({ message: "Error retrieving DealerIndent with id=" + id });
  }
};

// Save DealerIndent in the database
exports.create = async (req, res) => {
  const branchid = req.body.FromBranch;
  try {
    // Find the branch code based on the branch name
    const branchCode = await BranchMaster.findOne({
      attributes: ["BranchCode"],
      where: { BranchID: branchid },
    });
    console.log("data from branch master: ", branchCode);
    console.log("Branch Code: ", branchCode.BranchCode);
    // Generate the indent number using the branch code
    const indentNum = await generateDIndentNo(branchCode.BranchCode);
    console.log("generated indent number:", indentNum);

    // Create a DealerIndent
    const dealerIndentData = {
      IndentNo: indentNum,
      IndentDate: req.body.IndentDate || new Date(),
      FromBranch: req.body.FromBranch,
      ToRegion: req.body.ToRegion,
      DealerType: req.body.DealerType,
      ModelCode: req.body.ModelCode,
      VariantCode: req.body.VariantCode,
      FuelType: req.body.FuelType,
      Transmission: req.body.Transmission,
      ColourCode: req.body.ColourCode,
      DriverID: req.body.DriverID,
      DriverName: req.body.DriverName,
      EMPMobileNo: req.body.EMPMobileNo,
      Status: "Open", // Using a default value if Status is not provided
    };

    console.log(dealerIndentData);

    // Create the record
    const data = await DealerIndents.create(dealerIndentData);

    res.send(data);
  } catch (error) {
    console.error("Error occurred while creating DealerIndent:", error);

    // Determine error type and send appropriate response
    if (error.name === "SequelizeValidationError") {
      res.status(400).json({
        message: "Validation error occurred while creating DealerIndent.",
        errors: error.errors,
      });
    } else {
      res.status(500).json({
        message: "Internal server error occurred while creating DealerIndent.",
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
        message: "Database error occurred while creating CompanyMaster.",
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
  }
};

// Update a DealerIndent by the id in the request
exports.updateByPk = async (req, res) => {
  try {
    // Extract the ID from request parameters
    const { id } = req.params;

    // Check if ID is provided
    if (!id) {
      return res.status(400).json({ message: "ID parameter is missing." });
    }

    // Find the DealerIndent by ID
    const dealerIndent = await DealerIndents.findByPk(id);

    // Check if DealerIndent exists
    if (!dealerIndent) {
      return res.status(404).json({ message: "DealerIndent not found." });
    }

    // Map the fields from the request body to existing dealerIndent object
    dealerIndent.IndentNo = req.body.IndentNo || dealerIndent.IndentNo;
    dealerIndent.IndentDate = req.body.IndentDate || dealerIndent.IndentDate;
    dealerIndent.FromBranch = req.body.FromBranch || dealerIndent.FromBranch;
    dealerIndent.ToRegion = req.body.ToRegion || dealerIndent.ToRegion;
    dealerIndent.DealerType = req.body.DealerType || dealerIndent.DealerType;
    dealerIndent.ModelCode = req.body.ModelCode || dealerIndent.ModelCode;
    dealerIndent.VariantCode = req.body.VariantCode || dealerIndent.VariantCode;
    dealerIndent.ColourCode = req.body.ColourCode || dealerIndent.ColourCode;
    dealerIndent.FuelType = req.body.FuelType || dealerIndent.FuelType;
    dealerIndent.Transmission =
      req.body.Transmission || dealerIndent.Transmission;
    dealerIndent.DriverID = req.body.DriverID || dealerIndent.DriverID;
    dealerIndent.EMPMobileNo = req.body.EMPMobileNo || dealerIndent.EMPMobileNo;
    dealerIndent.Status = req.body.Status || dealerIndent.Status;
    dealerIndent.ModifiedDate = new Date();

    // Save the updated dealerIndent object
    await dealerIndent.save();

    // Send success response
    res.status(200).json({ message: "DealerIndent updated successfully." });
  } catch (error) {
    // Handle errors based on specific types
    console.error("Error occurred while updating DealerIndent:", error);
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while updating DealerIndents.",
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
        message: "Validation error occurred while updating DealerIndent.",
        errors: error.errors,
      });
    } else {
      res.status(500).json({
        message: "Internal server error occurred while updating DealerIndent.",
      });
    }
  }
};

// Delete a DealerIndent with the specified id in the request
exports.deleteByPk = async (req, res) => {
  try {
    // Extract the ID from request parameters
    const { id } = req.params;

    // Check if ID is provided
    if (!id) {
      return res.status(400).json({ message: "ID parameter is missing." });
    }

    // Delete the DealerIndent by ID
    const numDeleted = await DealerIndents.destroy({
      where: {
        IndentID: id,
      },
    });

    // Check if any record was deleted
    if (numDeleted === 0) {
      return res.status(404).json({ message: "DealerIndent not found." });
    }

    // Send success response
    res.status(200).json({ message: "DealerIndent deleted successfully." });
  } catch (error) {
    console.error("Error occurred while deleting DealerIndent:", error);
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
    // Send error response
    res.status(500).json({
      message: "Internal server error occurred while deleting DealerIndent.",
    });
  }
};

// Dynamic Fetch API as per Screen
exports.getDealerIndentsByScreen = async (req, res) => {
  try {
    const id = req.query.BranchID;
    const screen = req.query.ScreenName;

    console.log("BranchID: ", id);
    console.log("BranchID: ", screen);

    let whereCondition = {}; // Define an empty object to hold the dynamic WHERE condition

    if (screen === "Raised") {
      whereCondition = { FromBranch: id };
    } else if (screen === "Received") {
      whereCondition = { ToRegion: id };
    } else {
      // Handle unexpected values of screen if needed
      return res.status(400).json({ message: "Invalid value for ScreenName." });
    }

    const data = await DealerIndents.findAll({
      where: whereCondition,
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
        "FuelType",
        "Transmission",
        "DriverID",
        "EMPMobileNo",
        "Status",
        "CreatedDate",
        "ModifiedDate",
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
      order: [
        ["IndentID", "DESC"], // Order by ModelDescription in ascending order
      ],
    });

    // Mapping the fetched data into a structured format
    const mappedData = data.map((indent) => ({
      IndentID: indent.IndentID,
      IndentNo: indent.IndentNo,
      IndentDate: indent.IndentDate,
      BranchID: indent.DIFromBranchID ? indent.DIFromBranchID.BranchID : null,
      BranchCode: indent.DIFromBranchID
        ? indent.DIFromBranchID.BranchCode
        : null,
      BranchName: indent.DIFromBranchID
        ? indent.DIFromBranchID.BranchName
        : null,
      RegionID: indent.DIToRegionID ? indent.DIToRegionID.VendorMasterID : null,
      StateID: indent.DIToRegionID ? indent.DIToRegionID.VendorCode : null,
      RegionName: indent.DIToRegionID ? indent.DIToRegionID.VendorName : null,
      DealerType: indent.DealerType,
      ModelCode: indent.ModelCode,
      VariantCode: indent.VariantCode,
      ColourCode: indent.ColourCode,
      FuelType: indent.FuelType,
      Transmission: indent.Transmission,
      DriverID: indent.DriverID,
      EmpMobileNo: indent.EMPMobileNo,
      Status: indent.Status,
      CreatedDate: indent.CreatedDate,
      ModifiedDate: indent.ModifiedDate,
    }));

    // Sending mappedData in the response
    res.send(mappedData);
  } catch (err) {
    // Handle errors based on specific types
    if (err.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while retrieving dealer name data.",
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
    res.status(500).send({
      message:
        err.message || "Some error occurred while retrieving DealerIndent.",
    });
  }
};

// Get Dealer Indents Received Page Data
exports.getDealerIndentReceivedPageData = async (req, res) => {
  try {
    const branch = req.query.BranchID;
    const statusOrder = [
      "Issued",
      "In-Transit",
      "Received",
      "Cancelled",
      "Returned",
    ];
    // Fetch all Dealer Indents first
    const dealerIndentsData = await DealerIndents.findAll({
      where: { Status: "Open", ToRegion: branch },
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
    });
    // Fetch all Dealer Transfers with included Dealer Indents
    const dealerTransfersData = await DealerTransfer.findAll({
      attributes: [
        "DealerTransferID",
        "IndentID",
        "InvoiceNo",
        "DCNo",
        "DCDate",
        "FromBranch",
        "ToRegion",
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
        "TransferType",
        "DealerType",
        "TaxType",
        "ExShowRoom",
        "CostOfVehicle",
        "IGSTValue",
        "CESSValue",
        "Status",
        "Remarks",
      ],
      where: {
        Status: {
          [Op.in]: statusOrder,
        },
        ToRegion: branch,
      },
      include: [
        {
          model: DealerIndents,
          as: "DTIndentID",
          attributes: [
            "IndentID",
            "IndentNo",
            "IndentDate",
            "FromBranch",
            "ToRegion",
            "DealerType",
            "ModelCode",
            "VariantCode",
            "ColourCode",
            "FuelType",
            "Transmission",
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
        {
          model: VehicleStock,
          as: "DTPurchaseID",
          attributes: ["PurchaseID", "ChassisNo"],
        },
      ],
    });
    // Combine dealerIndentsData and dealerTransfersData into a single array
    const combinedData = dealerIndentsData
      .map((indent) => ({
        type: "Indent",
        data: indent.toJSON(),
      }))
      .concat(
        dealerTransfersData.map((transfer) => ({
          type: "Transfer",
          data: transfer.toJSON(),
        }))
      );
    // Check if any combined data found
    if (!combinedData || combinedData.length === 0) {
      return res.status(404).send({ message: "No combined data found." });
    }
    // Map each row to a flat structure
    const mappedData = [];
    // Mapping dealer indents
    dealerIndentsData.forEach((indent) => {
      mappedData.push({
        type: "Indent",
        DealerTransferID: indent.dataValues.DealerTransferID || null,
        IndentID: indent.dataValues.IndentID || null,
        IndentNo: indent.dataValues.IndentNo || null,
        IndentDate: indent.dataValues.IndentDate || null,
        DCNo: indent.dataValues.DCNo || null,
        DCDate: indent.dataValues.DCDate || null,
        IssuedBy: indent.dataValues.IssuedBy || null,
        FromBranch: indent.DIFromBranchID
          ? indent.DIFromBranchID.BranchID || null
          : null,
        BranchCode: indent.DIFromBranchID
          ? indent.DIFromBranchID.BranchCode || null
          : null,
        BranchName: indent.DIFromBranchID
          ? indent.DIFromBranchID.BranchName || null
          : null,
        ToRegion: indent.DIToRegionID
          ? indent.DIToRegionID.VendorMasterID || null
          : null,
        DealerType: indent.DealerType || null,
        VendorName: indent.DIToRegionID
          ? indent.DIToRegionID.VendorName || null
          : null,
        StateID: indent.DIToRegionID
          ? indent.DIToRegionID.StateID || null
          : null,
        ModelCode: indent.dataValues.ModelCode || null,
        VariantCode: indent.dataValues.VariantCode || null,
        ColourCode: indent.dataValues.ColourCode || null,
        DriverID: indent.dataValues.DriverID || null,
        EMPMobileNo: indent.dataValues.EMPMobileNo || null,
        KeyNo: indent.dataValues.KeyNo || null,
        FuelQty: indent.dataValues.FuelQty || null,
        PurchaseID: indent.dataValues.PurchaseID || null,
        EWBNo: indent.dataValues.EWBNo || null,
        ChassisNo: indent.dataValues.ChassisNo || null,
        DriverOTP: indent.dataValues.DriverOTP || null,
        GateOutTime: indent.dataValues.GateOutTime || null,
        StartingKM: indent.dataValues.StartingKM || null,
        GateInTime: indent.dataValues.GateInTime || null,
        EndingKM: indent.dataValues.EndingKM || null,
        GRNNo: indent.dataValues.GRNNo || null,
        TransferType: indent.dataValues.TransferType || null,
        TaxType: indent.dataValues.TaxType || null,
        ExShowRoom: indent.dataValues.ExShowRoom || null,
        CostOfVehicle: indent.dataValues.CostOfVehicle || null,
        IGSTValue: indent.dataValues.IGSTValue || null,
        CESSValue: indent.dataValues.CESSValue || null,
        Remarks: indent.dataValues.Remarks || null,
        Status: indent.dataValues.Status || null,
      });
    });
    // Mapping dealer transfers
    dealerTransfersData.forEach((transfer) => {
      mappedData.push({
        type: "Transfer",
        DealerTransferID: transfer.dataValues.DealerTransferID || null,
        IndentID: transfer.dataValues.IndentID || null,
        IndentNo: transfer.DTIndentID
          ? transfer.DTIndentID.IndentNo || null
          : null,
        IndentDate: transfer.DTIndentID
          ? transfer.DTIndentID.IndentDate || null
          : null,
        InvoiceNo: transfer.dataValues.InvoiceNo || null,
        DCNo: transfer.dataValues.DCNo || null,
        DCDate: transfer.dataValues.DCDate || null,
        IssuedBy: transfer.dataValues.IssuedBy || null,
        FromBranch:
          transfer.DTIndentID && transfer.DTIndentID.DIFromBranchID
            ? transfer.DTIndentID.DIFromBranchID.BranchID || null
            : null,
        BranchCode:
          transfer.DTIndentID && transfer.DTIndentID.DIFromBranchID
            ? transfer.DTIndentID.DIFromBranchID.BranchCode || null
            : null,
        BranchName:
          transfer.DTIndentID && transfer.DTIndentID.DIFromBranchID
            ? transfer.DTIndentID.DIFromBranchID.BranchName || null
            : null,
        ToRegion:
          transfer.DTIndentID && transfer.DTIndentID.DIToRegionID
            ? transfer.DTIndentID.DIToRegionID.VendorMasterID || null
            : null,
        VendorName:
          transfer.DTIndentID && transfer.DTIndentID.DIToRegionID
            ? transfer.DTIndentID.DIToRegionID.VendorName || null
            : null,
        StateID:
          transfer.DTIndentID && transfer.DTIndentID.DIToRegionID
            ? transfer.DTIndentID.DIToRegionID.StateID || null
            : null,
        ModelCode: transfer.DTIndentID
          ? transfer.DTIndentID.ModelCode || null
          : null,
        VariantCode: transfer.DTIndentID
          ? transfer.DTIndentID.VariantCode || null
          : null,
        ColourCode: transfer.DTIndentID
          ? transfer.DTIndentID.ColourCode || null
          : null,
        FuelType: transfer.DTIndentID
          ? transfer.DTIndentID.FuelType || null
          : null,
        Transmission: transfer.DTIndentID
          ? transfer.DTIndentID.Transmission || null
          : null,
        DriverID: transfer.DTIndentID
          ? transfer.DTIndentID.DriverID || null
          : null,
        EMPMobileNo: transfer.DTIndentID
          ? transfer.DTIndentID.EMPMobileNo || null
          : null,
        KeyNo: transfer.dataValues.KeyNo || null,
        FuelQty: transfer.dataValues.FuelQty || null,
        PurchaseID: transfer.dataValues.PurchaseID || null,
        EWBNo: transfer.dataValues.EWBNo || null,
        ChassisNo: transfer.DTPurchaseID
          ? transfer.DTPurchaseID.ChassisNo
          : null,
        DriverOTP: transfer.dataValues.DriverOTP || null,
        GateOutTime: transfer.dataValues.GateOutTime || null,
        StartingKM: transfer.dataValues.StartingKM || null,
        GateInTime: transfer.dataValues.GateInTime || null,
        EndingKM: transfer.dataValues.EndingKM || null,
        GRNNo: transfer.dataValues.GRNNo || null,
        TransferType: transfer.dataValues.TransferType || null,
        DealerType: transfer.dataValues.DealerType || null,
        TaxType: transfer.dataValues.TaxType || null,
        ExShowRoom: transfer.dataValues.ExShowRoom || null,
        CostOfVehicle: transfer.dataValues.CostOfVehicle || null,
        IGSTValue: transfer.dataValues.IGSTValue || null,
        CESSValue: transfer.dataValues.CESSValue || null,
        Remarks: transfer.dataValues.Remarks || null,
        Status: transfer.dataValues.Status || null,
      });
    });
    // Check if any mapped data found
    if (mappedData.length === 0) {
      return res.status(404).send({ message: "No mapped data found." });
    }

    // Convert IndentDate to a Date object for accurate sorting
    mappedData.forEach((item) => {
      item.IndentDate = new Date(item.IndentDate);
    });

    // Sort mappedData by IndentDate in descending order
    mappedData.sort((a, b) => {
      return b.IndentDate - a.IndentDate; // Sort in descending order
    });
    // Return mapped data in the response
    return res.status(200).json(mappedData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      console.error("Database error:", error);
      return res.status(500).send({
        message: "Internal server error",
        error: error.message,
      });
    } else if (error.name === "SequelizeConnectionError") {
      console.error("Connection error:", error);
      return res.status(500).send({
        message: "Database connection error",
        error: error.message,
      });
    } else if (error.name === "SequelizeValidationError") {
      console.error("Validation error:", error);
      return res.status(400).send({
        message: "Validation error",
        error: error.message,
      });
    } else {
      console.error("Unexpected error:", error);
      return res.status(500).send({
        message: "An unexpected error occurred",
        error: error.message,
      });
    }
  }
};

// Get DealerIndents by the id by action transfer and for Vehicle Allotment.
exports.GetAllotmentForDealerIndents = async (req, res) => {
  const branchCode = req.query.BranchCode;
  const indentNo = req.query.IndentID;

  try {
    // Log the BranchCode for debugging purposes
    console.log("Branch Code: ", branchCode);

    // Fetch the branch indent data with flattened fields for branch details
    const DealerIndentsData = await DealerIndents.findOne({
      attributes: [
        "IndentID",
        "IndentNo",
        "IndentDate",
        "FromBranch",
        "ToRegion",
        "DealerType",
        "ModelCode",
        "VariantCode",
        "ColourCode",
        "FuelType",
        "Transmission",
        "DriverID",
        "DriverName",
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
          attributes: [
            "VendorMasterID",
            "VendorCode",
            "VendorName",
            "Address",
            "PINCode",
            "State",
          ],
        },
      ],
      where: {
        Status: { [Op.eq]: "Open" },
        IndentID: indentNo,
      },
    });

    // If no branch indent data is found, respond with a 404 error
    if (!DealerIndentsData) {
      return res.status(404).send({ message: "No DealerIndentss found." });
    }

    // Log the retrieved Branch Indent Data for debugging
    console.log("Retrieved Branch Indent Data: ", DealerIndentsData.dataValues);

    // Fetch the model data based on ModelCode from the branch indent data
    const modelMasterData = await ModelMaster.findOne({
      attributes: ["ModelMasterID", "ModelDescription"],
      where: { ModelCode: DealerIndentsData.ModelCode },
    });

    // If no model data is found, respond with a 404 error
    if (!modelMasterData) {
      return res
        .status(404)
        .json({ error: "No Model data found for the retrieved ModelCode" });
    }

    // Fetch the variant data based on VariantCode from the branch indent data
    const variantMasterData = await VariantMaster.findOne({
      attributes: ["VariantID", "VariantCode", "TransmissionID"],
      where: { VariantCode: DealerIndentsData.VariantCode },
      include: [
        {
          model: Transmission,
          as: "VMTransmissionID",
          attributes: [
            "TransmissionID",
            "TransmissionCode",
            "TransmissionDescription",
          ],
        },
      ],
    });

    // If no variant data is found, respond with a 404 error
    if (!variantMasterData) {
      return res
        .status(404)
        .json({ error: "No Variant data found for the retrieved VariantCode" });
    }

    // Fetch the colour data based on ColourCode from the branch indent data
    const colourMasterData = await ColourMaster.findOne({
      attributes: ["ColourID", "ColourDescription"],
      where: { ColourCode: DealerIndentsData.ColourCode },
    });

    // If no colour data is found, respond with a 404 error
    if (!colourMasterData) {
      return res
        .status(404)
        .json({ error: "No Colour data found for the retrieved ColourCode" });
    }

    // Fetch stock data based on VariantCode, ColourCode, and ModelCode from the branch indent data
    const stockData = await VehicleStock.findAll({
      where: {
        VariantCode: DealerIndentsData.VariantCode,
        ColourCode: DealerIndentsData.ColourCode,
        ModelCode: DealerIndentsData.ModelCode,
        Status: "In-Stock",
      },
      order: [["CreatedDate", "DESC"]], // Order stock data by CreatedDate in descending order
    });

    // Generate a DC Number using the BranchCode
    const dcNumber = await generateDDCNo(branchCode);
    console.log("DC Number: ", dcNumber); // Log the DC Number for debugging

    // Combine and flatten all data
    const enrichedDealerIndentsData = {
      IndentID: DealerIndentsData.IndentID || "N/A",
      IndentNo: DealerIndentsData.IndentNo || "N/A",
      IndentDate: DealerIndentsData.IndentDate || "N/A",
      FromBranch: DealerIndentsData.FromBranch || "N/A",
      ToRegion: DealerIndentsData.ToRegion || "N/A",
      DealerType: DealerIndentsData.DealerType || "N/A",
      ModelCode: DealerIndentsData.ModelCode || "N/A",
      VariantCode: DealerIndentsData.VariantCode || "N/A",
      ColourCode: DealerIndentsData.ColourCode || "N/A",
      FuelType: DealerIndentsData.FuelType || "N/A",
      Transmission: DealerIndentsData.Transmission || "N/A",
      DriverID: DealerIndentsData.DriverID || "N/A",
      DriverName: DealerIndentsData.DriverName || "N/A",
      EMPMobileNo: DealerIndentsData.EMPMobileNo || "N/A",
      Status: DealerIndentsData.Status || "N/A",

      // From Branch details
      FromBranchID: DealerIndentsData.DIFromBranchID?.BranchID || "N/A",
      FromBranchCode: DealerIndentsData.DIFromBranchID?.BranchCode || "N/A",
      FromBranchName: DealerIndentsData.DIFromBranchID?.BranchName || "N/A",

      // To Branch details
      ToRegionID: DealerIndentsData.DIToRegionID?.VendorID || "N/A",
      VendorCode: DealerIndentsData.DIToRegionID?.VendorCode || "N/A",
      VendorName: DealerIndentsData.DIToRegionID?.VendorName || "N/A",
      VendorAddress: DealerIndentsData.DIToRegionID?.Address || "N/A",
      VendorState: DealerIndentsData.DIToRegionID?.State || "N/A",
      VendorPINCode: DealerIndentsData.DIToRegionID?.PINCode || "N/A",

      // Model Master details
      ModelMasterID: modelMasterData ? modelMasterData.ModelMasterID : "N/A",
      ModelDescription: modelMasterData
        ? modelMasterData.ModelDescription
        : "N/A",

      // Variant Master details
      VariantID: variantMasterData ? variantMasterData.VariantID : "N/A",
      VariantMasterCode: variantMasterData
        ? variantMasterData.VariantCode
        : "N/A",
      TransmissionID: variantMasterData
        ? variantMasterData.TransmissionID
        : "N/A",

      // Transmission details
      TransmissionMasterID:
        variantMasterData && variantMasterData.VMTransmissionID
          ? variantMasterData.VMTransmissionID.TransmissionID
          : "N/A",
      TransmissionCode:
        variantMasterData && variantMasterData.VMTransmissionID
          ? variantMasterData.VMTransmissionID.TransmissionCode
          : "N/A",
      TransmissionDescription:
        variantMasterData && variantMasterData.VMTransmissionID
          ? variantMasterData.VMTransmissionID.TransmissionDescription
          : "N/A",

      // Colour Master details
      ColourID: colourMasterData ? colourMasterData.ColourID : "N/A",
      ColourDescription: colourMasterData
        ? colourMasterData.ColourDescription
        : "N/A",
    };

    // Send the response with combined data
    res.send({
      IndentData: enrichedDealerIndentsData,
      StockData: stockData,
      DCNumber: dcNumber,
    });
  } catch (error) {
    // Log the error for debugging
    console.error("Error occurred while retrieving DealerIndentss:", error);

    // Handle different types of Sequelize errors and send appropriate responses
    if (error.name === "SequelizeDatabaseError") {
      return res
        .status(500)
        .json({ message: "Database error occurred.", details: error.message });
    }

    if (error.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Database connection error.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        message: "Validation error occurred.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeTimeoutError") {
      return res
        .status(504)
        .json({ message: "Request timeout.", details: error.message });
    }

    // Default error response for unexpected errors
    return res
      .status(500)
      .send({ message: "Internal server error.", details: error.message });
  }
};

// Update a DealerIndents by the id by action transfer and add an entry into BranchTransfer table using the same id.
exports.updateByTransfer = async (req, res) => {
  const transaction = await Seq.transaction(); // Start a transaction

  const indentID = req.body.IndentID;
  const purchaseID = req.body.PurchaseID;
  const branchCode = req.body.BranchCode;

  console.log("Received body parameters:", req.body);
  console.log("Indent ID:", indentID);
  console.log("Purchase ID:", purchaseID);

  try {
    // Update DealerIndents
    console.log("Updating DealerIndents...");
    const [numAffectedRows] = await DealerIndents.update(
      { Status: "Issued", ModifiedDate: new Date() },
      { where: { IndentID: indentID }, transaction }
    );

    if (numAffectedRows === 0) {
      console.log(`Cannot update status to 'Issued' for the indent.`);
      await transaction.rollback(); // Rollback transaction if update fails
      return res.status(404).send({
        message: `Cannot update status to 'Issued' for the indent.`,
      });
    }
    console.log(`Status updated successfully to 'Issued'.`);

    // Find and update VehicleStock
    console.log("Finding VehicleStock entry...");
    let stockData = await VehicleStock.findOne({
      where: { PurchaseID: purchaseID },
      transaction,
    });

    if (!stockData) {
      console.log(
        `Cannot find VehicleStock entry for PurchaseID=${purchaseID}.`
      );
      await transaction.rollback(); // Rollback transaction if stock data not found
      return res.status(404).send({
        message: `Cannot find VehicleStock entry for PurchaseID=${purchaseID}.`,
      });
    }
    console.log("Stock data found:", stockData.dataValues);

    // Update VehicleStock
    console.log("Updating VehicleStock...");
    // stockData.Status = "In-Transit"; // Update status when vehicle exits the branch
    stockData.KeyNo = req.body.KeyNo;
    // stockData.BranchID = req.body.BranchID; // Update BranchID when vehicle enters the new branch

    await stockData.save({ transaction });
    console.log("VehicleStock updated successfully.");

    const generatedDCNumber = await generateDDCNo(branchCode);
    console.log("Generated DC Number successfully:", generatedDCNumber);

    // Update BranchTransfer Data
    console.log("Updating DealerTransfers...");
    const transferData = {
      DCNo: req.body.DCNumber || generatedDCNumber,
      DCDate: new Date(),
      ChassisNo: req.body.ChassisNo || stockData.ChassisNo,
      EngineNo: req.body.EngineNo || stockData.EngineNo,
      InvoiceNo: req.body.InvoiceNo || stockData.InvoiceNo,
      FuelQty: req.body.FuelQty,
      PurchaseID: purchaseID,
      KeyNo: req.body.KeyNo || stockData.KeyNo,
      GRNNo: req.body.GRNNo || stockData.GRNNo,
      DealerType: req.body.DealerType,
      IssuedBy: req.body.EmpID,
      Remarks: req.body.Remarks,
      ModifiedDate: new Date(),
    };

    const [numUpdatedRows] = await DealerTransfer.update(transferData, {
      where: { IndentID: indentID },
      transaction,
    });

    if (numUpdatedRows === 0) {
      console.log(`Cannot update BranchTransfer data for the indent.`);
      await transaction.rollback(); // Rollback transaction if update fails
      return res.status(404).send({
        message: `Cannot update BranchTransfer data for the indent.`,
      });
    }
    console.log("BranchTransfer data updated successfully.");

    // Commit the transaction if all operations succeed
    await transaction.commit();
    console.log("All data updated successfully.");
    res.send({
      message: "Data updated for all tables successfully.",
      TransferData: numUpdatedRows,
    });
  } catch (error) {
    // Rollback the transaction in case of error
    try {
      await transaction.rollback();
    } catch (rollbackError) {
      console.error("Transaction rollback failed:", rollbackError);
    }

    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      console.error("Database error:", error);
      return res.status(500).json({
        message: "Database error occurred while updating data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      console.error("Connection error:", error);
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeValidationError") {
      console.error("Validation error:", error);
      return res.status(400).json({
        message: "Validation error occurred while updating data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeTimeoutError") {
      console.error("Timeout error:", error);
      return res.status(504).json({
        message: "Request timeout while updating data.",
        details: error.message,
      });
    }

    // Handle generic errors
    console.error("Error updating data:", error);
    res.status(500).send({ message: `Error updating data: ${error.message}` });
  }
};
/*
// exports.updateByTransfer = async (req, res) => {
//   const indentID = req.body.IndentID;
//   const purchaseID = req.body.PurchaseID;
//   const branchCode = req.body.BranchCode;

//   console.log("Received body parameters:", req.body);
//   console.log("Indent ID:", indentID);
//   console.log("Purchase ID:", purchaseID);

//   try {
//     // Update DealerIndents
//     console.log("Updating DealerIndents...");
//     const [numAffectedRows] = await DealerIndents.update(
//       { Status: "Issued", ModifiedDate: new Date() },
//       { where: { IndentID: indentID } }
//     );

//     if (numAffectedRows === 0) {
//       console.log(`Cannot update status to 'Issued' for the indent.`);
//       return res.status(404).send({
//         message: `Cannot update status to 'Issued' for the indent.`,
//       });
//     }
//     console.log(`Status updated successfully to 'Issued'.`);

//     // Find and update VehicleStock
//     console.log("Finding VehicleStock entry...");
//     let stockData = await VehicleStock.findOne({
//       where: { PurchaseID: purchaseID },
//     });

//     if (!stockData) {
//       console.log(
//         `Cannot find VehicleStock entry for PurchaseID=${purchaseID}.`
//       );
//       return res.status(404).send({
//         message: `Cannot find VehicleStock entry for PurchaseID=${purchaseID}.`,
//       });
//     }
//     console.log("Stock data found:", stockData.dataValues);

//     // Update VehicleStock
//     console.log("Updating VehicleStock...");
//     // stockData.Status = "In-Transit"; // will change status when vehicle exists the branch
//     stockData.KeyNo = req.body.KeyNo;
//     // stockData.BranchID = req.body.BranchID; // will change status when vehicle enters the new branch

//     await stockData.save();
//     console.log("VehicleStock updated successfully.");
//     const generatedDCNumber = await generateDDCNo(branchCode);
//     console.log("generatedDCNumber successfully:", generatedDCNumber);

//     // Update BranchTransfer Data
//     console.log("Updating DealerTransfers...");
//     const transferData = {
//       DCNo: req.body.DCNumber || generatedDCNumber,
//       DCDate: new Date(),
//       ChassisNo: req.body.ChassisNo || stockData.ChassisNo,
//       EngineNo: req.body.EngineNo || stockData.EngineNo,
//       InvoiceNo: req.body.InvoiceNo || stockData.InvoiceNo,
//       FuelQty: req.body.FuelQty,
//       PurchaseID: purchaseID,
//       KeyNo: req.body.KeyNo || stockData.KeyNo,
//       GRNNo: req.body.GRNNo || stockData.GRNNo,
//       DealerType: req.body.DealerType,
//       IssuedBy: req.body.EmpID,
//       Remarks: req.body.Remarks,
//       ModifiedDate: new Date(),
//     };

//     const [numUpdatedRows] = await DealerTransfer.update(transferData, {
//       where: { IndentID: indentID },
//     });

//     if (numUpdatedRows === 0) {
//       console.log(`Cannot update BranchTransfer data for the indent.`);
//       return res.status(404).send({
//         message: `Cannot update BranchTransfer data for the indent.`,
//       });
//     }
//     console.log("BranchTransfer data updated successfully.");

//     // If all updates were successful, send a success response
//     console.log("All data updated successfully.");
//     res.send({
//       message: "Data updated for all tables successfully.",
//       TransferData: numUpdatedRows,
//     });
//   } catch (error) {
//     // Handle errors based on specific types
//     if (error.name === "SequelizeDatabaseError") {
//       console.error("Database error:", error);
//       return res.status(500).json({
//         message: "Database error occurred while updating data.",
//         details: error.message,
//       });
//     }

//     if (error.name === "SequelizeConnectionError") {
//       console.error("Connection error:", error);
//       return res.status(503).json({
//         message: "Service unavailable. Unable to connect to the database.",
//         details: error.message,
//       });
//     }

//     if (error.name === "SequelizeValidationError") {
//       console.error("Validation error:", error);
//       return res.status(400).json({
//         message: "Validation error occurred while updating data.",
//         details: error.message,
//       });
//     }

//     if (error.name === "SequelizeTimeoutError") {
//       console.error("Timeout error:", error);
//       return res.status(504).json({
//         message: "Request timeout while updating data.",
//         details: error.message,
//       });
//     }

//     // Handle errors
//     console.error("Error updating data:", error);
//     res.status(500).send({ message: `Error updating data: ${error.message}` });
//   }
// }; */

//Update Branch Transfer Data when EWB is generated
exports.updateByGenEWB = async (req, res) => {
  const t = await Seq.transaction(); // Start a new transaction
  try {
    const { IndentID, TravelDist, VehicleNo } = req.body;

    if (!IndentID || !TravelDist || !VehicleNo) {
      return res.status(400).send({ message: "Missing required fields." });
    }

    console.log("Indent ID: ", IndentID);

    const dealerTransferData = await DealerTransfer.findOne({
      where: { IndentID: IndentID },
      include: [
        { model: BranchMaster, as: "DTFromBranchID" },
        { model: VendorMaster, as: "DTToRegionID" },
        { model: UserMaster, as: "DTDriverID" },
        { model: UserMaster, as: "DTIssuerID" },
        { model: VehicleStock, as: "DTPurchaseID" },
      ],
      transaction: t, // Use the transaction
    });

    if (!dealerTransferData) {
      return res
        .status(404)
        .send({ message: `No Branch Transfer found with ID = ${IndentID}.` });
    }

    const ewbJson = {
      supplyType: "O",
      subSupplyType: "1",
      DocType: "CHL",
      docNo: dealerTransferData.DCNo || "",
      docDate: formatDate(dealerTransferData.DCDate) || "",
      fromGstin: dealerTransferData.DTFromBranchID.GSTIN || "",
      actFromStateCode:
        dealerTransferData.DTFromBranchID.GSTIN?.substring(0, 2) || "",
      actToStateCode:
        dealerTransferData.DTToRegionID.GSTID?.substring(0, 2) || "",
      totInvValue: "",
      fromTrdName: "VARUN MOTORS PVT LTD",
      fromAddr1: dealerTransferData.DTFromBranchID.Address || "",
      fromAddr2: dealerTransferData.DTFromBranchID.District || "",
      fromPlace: dealerTransferData.DTFromBranchID.District || "",
      fromPincode: dealerTransferData.DTFromBranchID.PINCode || "",
      fromStateCode:
        parseInt(
          dealerTransferData.DTFromBranchID.GSTIN?.substring(0, 2),
          10
        ) || 0,
      toGstin: dealerTransferData.DTToRegionID.GSTID || "",
      toTrdName: dealerTransferData.DTToRegionID.VendorName,
      toAddr1: dealerTransferData.DTToRegionID.Address || "",
      toAddr2: dealerTransferData.DTToRegionID.State || "",
      toPlace: dealerTransferData.DTToRegionID.City || "",
      toPincode: dealerTransferData.DTToRegionID.PINCode || "",
      toStateCode:
        parseInt(dealerTransferData.DTToRegionID.GSTID?.substring(0, 2), 10) ||
        0,
      transactionType: "1",
      totalValue: "",
      cgstValue: "",
      sgstValue: "",
      igstValue: "",
      cessValue: "",
      transporterName: "",
      transporterId: "",
      transDocNo: "",
      transMode: "1",
      transDocDate: "",
      transDistance: TravelDist || "",
      vehicleType: "r",
      vehicleNo: VehicleNo || "",
      ItemList: [
        {
          productName: "VEHICLE",
          hsnCode: "",
          qtyUnit: "NOS",
          quantity: 1,
          cgstRate: "",
          sgstRate: "",
          igstRate: "",
          cessRate: "",
          cessAdvol: 0,
        },
      ],
    };

    if (ewbJson.actFromStateCode === ewbJson.actToStateCode) {
      ewbJson.cgstValue = 0;
      ewbJson.sgstValue = 0;
      ewbJson.igstValue = 0;
      ewbJson.cessValue = 0;
      ewbJson.ItemList[0].igstRate = 0;
    }

    ewbJson.totInvValue = dealerTransferData.DTPurchaseID.TaxableValue;
    ewbJson.totalValue = dealerTransferData.DTPurchaseID.TaxableValue;

    const skuData = await SKUMaster.findOne({
      where: { SKUCode: dealerTransferData.DTPurchaseID.SKUCode },
      transaction: t, // Use the transaction
    });

    if (skuData && ewbJson.actFromStateCode === ewbJson.actToStateCode) {
      const igstRate = skuData.IGSTRate;
      ewbJson.ItemList[0].cgstRate = igstRate / 2;
      ewbJson.ItemList[0].sgstRate = igstRate / 2;
      ewbJson.ItemList[0].cessRate = skuData.CESSRate;
      ewbJson.ItemList[0].hsnCode = skuData.HSNCode;
      dealerTransferData.TransferType = "Intra-State Transfer";
      ewbJson.DocType = "CHL";
    } else if (skuData && ewbJson.actFromStateCode !== ewbJson.actToStateCode) {
      const igstRate = skuData.IGSTRate;
      const taxableValue = dealerTransferData.DTPurchaseID.TaxableValue;
      ewbJson.ItemList[0].cgstRate = 0;
      ewbJson.ItemList[0].sgstRate = 0;
      ewbJson.ItemList[0].igstRate = igstRate;
      ewbJson.ItemList[0].cessRate = skuData.CESSRate;
      ewbJson.cgstValue = 0;
      ewbJson.sgstValue = 0;
      ewbJson.igstValue = (taxableValue * igstRate) / 100;
      ewbJson.cessValue = (taxableValue * skuData.CESSRate) / 100;
      ewbJson.ItemList[0].hsnCode = skuData.HSNCode;
      ewbJson.DocType = "INV";
      dealerTransferData.TransferType = "Inter-State Transfer";
      ewbJson.totInvValue =
        ewbJson.totalValue + ewbJson.igstValue + ewbJson.cessValue;
    }

    console.log("EWB JSON Data: ", ewbJson);

    const ewbResponseData = await generateEwayBill(ewbJson);
    console.log("EWB Response Details: ", ewbResponseData);

    if (ewbResponseData.Status == 1) {
      dealerTransferData.DriverOTP = generateRandomOTP();
      dealerTransferData.EWBNo = ewbResponseData.Data.ewayBillNo || null;
      dealerTransferData.EWBDate =
        convertTimestamp(ewbResponseData.Data.ewayBillDate) || null;
      dealerTransferData.EWBValidUpto =
        convertTimestamp(ewbResponseData.Data.validUpto) || null;
      dealerTransferData.VehicleNo = VehicleNo || null;
      dealerTransferData.ModifiedDate = new Date();

      const updatedDealerTransferData = await dealerTransferData.save({
        transaction: t,
      }); // Save within transaction
      console.log(
        "Generated EWB has been updated in Branch Transfer Table successfully"
      );

      // Create a flat response object
      const flatResponse = {
        // Flattening logic remains the same as before...
      };

      await t.commit(); // Commit the transaction
      return res.status(200).json(flatResponse);
    } else {
      await t.rollback(); // Rollback on failure to generate EWB
      return res.json(ewbResponseData);
    }
  } catch (error) {
    await t.rollback(); // Rollback on any error
    console.error("Error occurred while updating Branch Transfer Data:", error);

    if (error.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message: "Database error occurred while updating Branch Transfer Data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        message:
          "Validation error occurred while updating Branch Transfer Data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeTimeoutError") {
      return res.status(504).json({
        message: "Request timeout while updating Branch Transfer Data.",
        details: error.message,
      });
    }

    return res.status(500).send({
      message:
        "Internal server error occurred while updating Branch Transfer Data.",
      error: error.message,
    });
  }
};

//Get Dealer Transfer Data for DC Print - Test API Currently Not in Use
exports.getDealerTransferData = async (req, res) => {
  try {
    const indentID = req.query.IndentID;
    console.log("Indent ID: ", indentID);
    const dealerTransferData = await DealerTransfer.findOne({
      where: { IndentID: indentID },
    });
    console.log("dealer Transfer Data:", dealerTransferData);
    if (!dealerTransferData || dealerTransferData.length === 0) {
      // If no data found, send a 404 response
      return res
        .status(404)
        .send({ message: `No Branch Transfer found with ID = ${indentID}.` });
    }

    // Map the fields from request body to Transfer Data
    // dealerTransferData.EWBNo = req.body.EWBNo;

    // save the Transfer list with the updated fields
    // const updatedDealerTransferData = await dealerTransferData.save();
    console.log(
      "Generated EWB has been updated in Dealer Transfer Table successfully"
    );

    // Send the enriched data in the response
    return res.status(200).json(dealerTransferData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      console.error("Database error:", error);
      return res.status(500).json({
        message: "Database error occurred while retrieving DealerTransfer.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      console.error("Connection error:", error);
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeValidationError") {
      console.error("Validation error:", error);
      return res.status(400).json({
        message: "Validation error occurred while retrieving DealerTransfer.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeTimeoutError") {
      console.error("Timeout error:", error);
      return res.status(504).json({
        message: "Request timeout while retrieving DealerTransfer.",
        details: error.message,
      });
    }
    console.error("Error occurred while updating Dealer Transfer Data:", error);
    res.status(500).send({
      message:
        "Internal server error occurred while updating Dealer Transfer Data.",
      details: error.message, // Sending the error message for debugging purposes
    });
  }
};

// Find a single stock with an id
exports.Test = async (req, res) => {
  const id = req.params.id;

  try {
    const genOTP = await generateRandomOTP();

    // Sending mappedData in the response
    res.send(genOTP);
  } catch (err) {
    // Handle errors based on specific types
    if (err.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while retrieving dealer data.",
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
    console.error("Error retrieving DealerIndent:", err);
    res
      .status(500)
      .send({ message: "Error retrieving DealerIndent with id=" + id });
  }
};
