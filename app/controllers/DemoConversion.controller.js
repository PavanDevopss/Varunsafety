/* eslint-disable no-dupe-keys */
/* eslint-disable no-unused-vars */
require("dotenv").config();
const db = require("../models");
const BookingCancellation = db.bookingcancellation;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;
const VehicleStock = db.vehiclestock;
const UserMaster = db.usermaster;
const BranchMaster = db.branchmaster;
const DemoConversion = db.democonversion;
const VehicleAllotment = db.vehicleallotment;
const ModelMaster = db.modelmaster;
const VariantMaster = db.variantmaster;
const ColourMaster = db.colourmaster;
const {
  genBookingCancellationReqNo,
  genRequestNo,
  genDemoConvReqNo,
} = require("../Utils/generateService");

// Basic CRUD API
// Create a new Booking Cancellation
exports.create = async (req, res) => {
  try {
    // Check if a DemoConversion already exists with the given PurchaseID or other unique field
    if (req.body.PurchaseID) {
      const existingDemoConversion = await DemoConversion.findOne({
        where: {
          PurchaseID: req.body.PurchaseID,
          ApprovalStatus: { [Op.in]: ["Requested", "Approved"] }, // Include only "Requested" or "Approved"
        },
      });

      if (existingDemoConversion) {
        return res.status(400).json({
          message: "A demo conversion request already exists for this Stock.",
        });
      }
    }

    // Check if the branch exists for the provided FromBranch ID
    const branchExists = await BranchMaster.findOne({
      where: { BranchID: req.body.FromBranch },
    });

    if (!branchExists) {
      return res.status(400).json({
        message: "The specified branch does not exist.",
      });
    }

    // Check if the user exists for the provided RequestedBy and ApprovedBy IDs
    const requestedByExists = await UserMaster.findOne({
      where: { UserID: req.body.RequestedBy },
    });

    if (!requestedByExists) {
      return res.status(400).json({
        message: "The specified requesting user does not exist.",
      });
    }
    // Generate a request ID for DemoConversion
    const generatedRequestID = await genDemoConvReqNo();
    console.log("Generated Request ID: ", generatedRequestID);

    // Map the request body fields into the booking cancellation data object
    const demoConversionData = {
      ReqNo: generatedRequestID || req.body.ReqNo || null,
      ReqDate: req.body.ReqDate || new Date() || null,
      RequestedBy: req.body.RequestedBy || null,
      FromBranch: req.body.FromBranch || null,
      PurchaseID: req.body.PurchaseID || null,
      ChassisNo: req.body.ChassisNo || null,
      EngineNo: req.body.EngineNo || null,
      SKUCode: req.body.SKUCode || null,
      VariantDesc: req.body.VariantDesc || null,
      ColourCode: req.body.ColourCode || null,
      Transmission: req.body.Transmission || null,
      FuelType: req.body.FuelType || null,
      ApprovedBy: req.body.ApprovedBy || null,
      ApprovalStatus: req.body.ApprovalStatus || "Requested", // Default to "Requested" if not provided
      Remarks: req.body.Remarks || null,
      IsActive: req.body.IsActive || true, // Default to true if not provided
      Status: req.body.Status || "Active", // Default to "Active" if not provided
    };

    console.log("Demo Conversion Data: ", demoConversionData);

    // Create the DemoConversion record in the database
    const demoConversion = await DemoConversion.create(demoConversionData);

    // Respond with the created DemoConversion data
    res.status(201).json({
      message: "Demo conversion created successfully.",
      data: demoConversion,
    });
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message: "Database error occurred while creating demo conversion data.",
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
    console.error("Error creating demo conversion data:", error);
    return res.status(500).json({
      message: "Failed to create demo conversion data. Please try again later.",
    });
  }
};

// Retrieve all bookingCancellation from the database.
exports.findAll = async (req, res) => {
  try {
    const branchId = req.query.BranchID;

    // Validate the ID parameter
    if (!branchId) {
      return res
        .status(400)
        .json({ message: "branchId parameter is required." });
    }
    // Fetch all demo conversion data with included related data
    const demoConversionData = await DemoConversion.findAll({
      where: { FromBranch: branchId },
      attributes: [
        "DemoConvID",
        "ReqNo",
        "ReqDate",
        "RequestedBy",
        "FromBranch",
        "PurchaseID",
        "ChassisNo",
        "EngineNo",
        "SKUCode",
        "VariantDesc",
        "ColourCode",
        "Transmission",
        "FuelType",
        "ApprovedBy",
        "ApprovalStatus",
        "Remarks",
        "IsActive",
        "Status",
        "CreatedDate",
        "ModifiedDate",
      ],
      include: [
        {
          model: UserMaster,
          as: "DCRequestedBy", // Alias for RequestedBy field in the DemoConversion model
          attributes: ["UserID", "UserName", "EmpID"],
        },
        {
          model: UserMaster,
          as: "DCApprovedBy", // Alias for ApprovedBy field in the DemoConversion model
          attributes: ["UserID", "UserName", "EmpID"],
        },
        {
          model: BranchMaster,
          as: "DCFromBranch", // Alias for FromBranch field in the DemoConversion model
          attributes: ["BranchID", "BranchName", "BranchCode"],
        },
        {
          model: VehicleStock,
          as: "DCPurchaseID", // Alias for FromBranch field in the DemoConversion model
          attributes: ["PurchaseID", "Status"],
        },
      ],
      order: [["DemoConvID", "DESC"]], // Order by DemoConvID in DESC order
    });

    // Check if data is empty
    if (!demoConversionData || demoConversionData.length === 0) {
      return res.status(404).json({
        message: "No demo conversion data found.",
      });
    }

    // Map each demo conversion data to a flat structure
    const flatDemoConversionData = demoConversionData.map((item) => ({
      DemoConvID: item.DemoConvID,
      ReqNo: item.ReqNo,
      ReqDate: item.ReqDate,
      RequestedBy: item.RequestedBy,
      FromBranch: item.FromBranch,
      ChassisNo: item.ChassisNo,
      EngineNo: item.EngineNo,
      SKUCode: item.SKUCode,
      VariantDesc: item.VariantDesc,
      ColourCode: item.ColourCode,
      Transmission: item.Transmission,
      FuelType: item.FuelType,
      ApprovedBy: item.ApprovedBy,
      ApprovalStatus: item.ApprovalStatus,
      Remarks: item.Remarks,
      IsActive: item.IsActive,
      Status: item.Status,
      CreatedDate: item.CreatedDate,
      ModifiedDate: item.ModifiedDate,

      // Flattened: Related RequestedBy User (DCRequestedBy)
      RequestedBy_UserID: item.DCRequestedBy ? item.DCRequestedBy.UserID : null,
      RequestedBy_UserName: item.DCRequestedBy
        ? item.DCRequestedBy.UserName
        : null,
      RequestedBy_EmpID: item.DCRequestedBy ? item.DCRequestedBy.EmpID : null,

      // Flattened: Related ApprovedBy User (DCApprovedBy)
      ApprovedBy_UserID: item.DCApprovedBy ? item.DCApprovedBy.UserID : null,
      ApprovedBy_UserName: item.DCApprovedBy
        ? item.DCApprovedBy.UserName
        : null,
      ApprovedBy_EmpID: item.DCApprovedBy ? item.DCApprovedBy.EmpID : null,

      // Flattened: Related From Branch (DCFromBranch)
      FromBranch_BranchID: item.DCFromBranch
        ? item.DCFromBranch.BranchID
        : null,
      FromBranch_BranchName: item.DCFromBranch
        ? item.DCFromBranch.BranchName
        : null,
      FromBranch_BranchCode: item.DCFromBranch
        ? item.DCFromBranch.BranchCode
        : null,

      // Flattened: Related PurchaseID (DCPurchaseID)
      Stock_PurchaseID: item.DCPurchaseID ? item.DCPurchaseID.PurchaseID : null,
      Stock_Status: item.DCPurchaseID ? item.DCPurchaseID.Status : null,
    }));

    // Send the flattened data as response
    res.json(flatDemoConversionData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message:
          "Database error occurred while retrieving demo conversion data.",
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
    console.error("Error retrieving demo conversion data:", error);
    return res.status(500).json({
      message:
        "Failed to retrieve demo conversion data. Please try again later.",
    });
  }
};

// Retrieve single calcellation by ID
exports.findOne = async (req, res) => {
  try {
    // Fetch a single demo conversion data with included related data
    const demoConversionData = await DemoConversion.findOne({
      where: { DemoConvID: req.params.id }, // Search by DemoConvID
      attributes: [
        "DemoConvID",
        "ReqNo",
        "ReqDate",
        "RequestedBy",
        "FromBranch",
        "PurchaseID",
        "ChassisNo",
        "EngineNo",
        "SKUCode",
        "VariantDesc",
        "ColourCode",
        "Transmission",
        "FuelType",
        "ApprovedBy",
        "ApprovalStatus",
        "Remarks",
        "IsActive",
        "Status",
        "CreatedDate",
        "ModifiedDate",
      ],
      include: [
        {
          model: UserMaster,
          as: "DCRequestedBy", // Alias for RequestedBy field in the DemoConversion model
          attributes: ["UserID", "UserName", "EmpID"],
        },
        {
          model: UserMaster,
          as: "DCApprovedBy", // Alias for ApprovedBy field in the DemoConversion model
          attributes: ["UserID", "UserName", "EmpID"],
        },
        {
          model: BranchMaster,
          as: "DCFromBranch", // Alias for FromBranch field in the DemoConversion model
          attributes: ["BranchID", "BranchName"],
        },
        {
          model: VehicleStock,
          as: "DCPurchaseID", // Alias for FromBranch field in the DemoConversion model
          attributes: ["PurchaseID", "Status"],
        },
      ],
    });

    // If no data found, return 404
    if (!demoConversionData) {
      return res.status(404).json({
        message: "Demo conversion data not found.",
      });
    }

    // Flatten the demo conversion data
    const flattenedDemoConversionData = {
      DemoConvID: demoConversionData.DemoConvID,
      ReqNo: demoConversionData.ReqNo,
      ReqDate: demoConversionData.ReqDate,
      RequestedBy: demoConversionData.RequestedBy,
      FromBranch: demoConversionData.FromBranch,
      ChassisNo: demoConversionData.ChassisNo,
      EngineNo: demoConversionData.EngineNo,
      SKUCode: demoConversionData.SKUCode,
      VariantDesc: demoConversionData.VariantDesc,
      ColourCode: demoConversionData.ColourCode,
      Transmission: demoConversionData.Transmission,
      FuelType: demoConversionData.FuelType,
      ApprovedBy: demoConversionData.ApprovedBy,
      ApprovalStatus: demoConversionData.ApprovalStatus,
      Remarks: demoConversionData.Remarks,
      IsActive: demoConversionData.IsActive,
      Status: demoConversionData.Status,
      CreatedDate: demoConversionData.CreatedDate,
      ModifiedDate: demoConversionData.ModifiedDate,

      // Flattened: Related RequestedBy User (DCRequestedBy)
      RequestedBy_UserID: demoConversionData.DCRequestedBy
        ? demoConversionData.DCRequestedBy.UserID
        : null,
      RequestedBy_UserName: demoConversionData.DCRequestedBy
        ? demoConversionData.DCRequestedBy.UserName
        : null,
      RequestedBy_EmpID: demoConversionData.DCRequestedBy
        ? demoConversionData.DCRequestedBy.EmpID
        : null,

      // Flattened: Related ApprovedBy User (DCApprovedBy)
      ApprovedBy_UserID: demoConversionData.DCApprovedBy
        ? demoConversionData.DCApprovedBy.UserID
        : null,
      ApprovedBy_UserName: demoConversionData.DCApprovedBy
        ? demoConversionData.DCApprovedBy.UserName
        : null,
      ApprovedBy_EmpID: demoConversionData.DCApprovedBy
        ? demoConversionData.DCApprovedBy.EmpID
        : null,

      // Flattened: Related From Branch (DCFromBranch)
      FromBranch_BranchID: demoConversionData.DCFromBranch
        ? demoConversionData.DCFromBranch.BranchID
        : null,
      FromBranch_BranchName: demoConversionData.DCFromBranch
        ? demoConversionData.DCFromBranch.BranchName
        : null,
      FromBranch_BranchCode: demoConversionData.DCFromBranch
        ? demoConversionData.DCFromBranch.BranchCode
        : null,

      // Flattened: Related PurchaseID (DCPurchaseID)
      Stock_PurchaseID: demoConversionData.DCPurchaseID
        ? demoConversionData.DCPurchaseID.PurchaseID
        : null,
      Stock_Status: demoConversionData.DCPurchaseID
        ? demoConversionData.DCPurchaseID.Status
        : null,
    };

    // Send the flattened data as response
    res.json(flattenedDemoConversionData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message:
          "Database error occurred while retrieving demo conversion data.",
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
    console.error("Error retrieving demo conversion data:", error);
    return res.status(500).json({
      message:
        "Failed to retrieve demo conversion data. Please try again later.",
    });
  }
};

// Update api
exports.updateByPk = async (req, res) => {
  const id = req.params.id;

  try {
    // Validate the ID parameter
    if (!id) {
      return res.status(400).json({ message: "ID parameter is required." });
    }

    // Find the DemoConversion model by ID
    const demoConversion = await DemoConversion.findByPk(id);

    // Check if the DemoConversion exists
    if (!demoConversion) {
      return res
        .status(404)
        .json({ message: "DemoConversion not found with id: " + id });
    }

    // Prepare data for update based on the request body
    const updatedData = {
      ReqNo: req.body.ReqNo || demoConversion.ReqNo,
      ReqDate: req.body.ReqDate || demoConversion.ReqDate,
      RequestedBy: req.body.RequestedBy || demoConversion.RequestedBy,
      FromBranch: req.body.FromBranch || demoConversion.FromBranch,
      PurchaseID: req.body.PurchaseID || demoConversion.PurchaseID,
      ChassisNo: req.body.ChassisNo || demoConversion.ChassisNo,
      EngineNo: req.body.EngineNo || demoConversion.EngineNo,
      SKUCode: req.body.SKUCode || demoConversion.SKUCode,
      VariantDesc: req.body.VariantDesc || demoConversion.VariantDesc,
      ColourCode: req.body.ColourCode || demoConversion.ColourCode,
      Transmission: req.body.Transmission || demoConversion.Transmission,
      FuelType: req.body.FuelType || demoConversion.FuelType,
      ApprovedBy: req.body.ApprovedBy || demoConversion.ApprovedBy,
      Remarks: req.body.Remarks || demoConversion.Remarks,
      ApprovalStatus: req.body.ApprovalStatus || demoConversion.ApprovalStatus,
      IsActive:
        req.body.IsActive !== undefined
          ? req.body.IsActive
          : demoConversion.IsActive,
      Status: req.body.Status || demoConversion.Status,
      ModifiedDate: new Date(), // Set ModifiedDate to the current timestamp
    };

    // Update the record
    await demoConversion.update(updatedData);

    // Respond with the updated demo conversion data
    res.status(200).json({
      message: "DemoConversion updated successfully.",
      data: updatedData,
    });
  } catch (err) {
    // Handle errors based on specific types
    if (err.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message: "Database error occurred while updating demo conversion.",
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
    console.error("Error updating demo conversion:", err);
    return res.status(500).json({ message: "Internal server error" });
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

    // Find the DemoConversion model by ID
    const demoConversion = await DemoConversion.findByPk(id);

    // Check if the model exists
    if (!demoConversion) {
      return res
        .status(404)
        .json({ message: "DemoConversion not found with id: " + id });
    }

    // Delete the model
    await demoConversion.destroy();

    // Send a success message
    res.status(200).json({
      message: "DemoConversion with id: " + id + " deleted successfully",
    });
  } catch (err) {
    // Handle errors based on specific types
    if (err.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while deleting demo conversion.",
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
    console.error("Error deleting demo conversion:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Dropdown for Conversion
exports.getAvailableStockforDemo = async (req, res) => {
  try {
    const branchId = req.query.BranchID;
    if (!branchId) {
      return res.status(400).json({
        message: "Branch ID is required",
      });
    }
    // Fetch a single demo conversion data with included related data
    const purchaseEntryData = await VehicleStock.findAll({
      where: { BranchID: branchId, Status: "In-Stock" },
      attributes: [
        "PurchaseID",
        // "VendorName",
        "VendorID",
        "BranchID",
        "VariantCode",
        "ModelCode",
        "ColourCode",
        "SKUCode",
        "EngineNo",
        "ChassisNo",
        "KeyNo",
        "TransmissionCode",
        "FuelType",
        "Status",
        "CreatedDate",
        "ModifiedDate",
      ],
      order: [
        ["CreatedDate", "DESC"], // Order by ModelDescription in ascending order
      ],
    });
    // If no data found, return 404
    if (!purchaseEntryData) {
      return res.status(404).json({
        message: "Demo conversion data not found.",
      });
    }
    const modelCodes = purchaseEntryData.map((codes) => codes.ModelCode);
    const variantCodes = purchaseEntryData.map((codes) => codes.VariantCode);
    const colourCodes = purchaseEntryData.map((codes) => codes.ColourCode);

    const modelDetails = await ModelMaster.findAll({
      where: { ModelCode: modelCodes },
    });

    const variantDetails = await VariantMaster.findAll({
      where: { VariantCode: variantCodes },
    });

    const colourDetails = await ColourMaster.findAll({
      where: { ColourCode: colourCodes },
    });

    // Create lookup objects for quick access
    const modelLookup = modelDetails.reduce((acc, model) => {
      acc[model.ModelCode] = model.ModelDescription;
      return acc;
    }, {});

    const variantLookup = variantDetails.reduce((acc, variant) => {
      acc[variant.VariantCode] = variant.VariantDescription;
      return acc;
    }, {});

    const colourLookup = colourDetails.reduce((acc, colour) => {
      acc[colour.ColourCode] = colour.ColourDescription;
      return acc;
    }, {});

    // Flatten the demo conversion data
    // Map the data for response
    const combinedData = purchaseEntryData.map((item) => ({
      PurchaseID: item.PurchaseID,
      VendorID: item.PEVendorID ? item.PEVendorID.VendorMasterID : null,
      VendorName: item.PEVendorID ? item.PEVendorID.VendorName : null,
      BranchID: item.BranchID || null,
      VariantCode: item.VariantCode,
      VariantDescription: variantLookup[item.VariantCode] || null,
      ModelCode: item.ModelCode,
      ModelDescription: modelLookup[item.ModelCode] || null,
      ColourCode: item.ColourCode,
      ColourDescription: colourLookup[item.ColourCode] || null,
      TransmissionCode: item.TransmissionCode,
      SKUCode: item.SKUCode,
      EngineNo: item.EngineNo,
      ChassisNo: item.ChassisNo,
      KeyNo: item.KeyNo,
      FuelType: item.FuelType,
      Status: item.Status,
      CreatedDate: item.CreatedDate,
      ModifiedDate: item.ModifiedDate,
    }));

    // Send the combined data as response
    res.json(combinedData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message:
          "Database error occurred while retrieving purchase entry data.",
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

    // General error handling
    console.error("Error retrieving purchase entry data:", error);
    return res.status(500).json({
      message:
        "Failed to retrieve purchase entry data. Please try again later.",
    });
  }
};

// Democonversion approval api
exports.updateDemoConvApproval = async (req, res) => {
  const id = req.params.id;

  // Start a transaction
  const transaction = await Seq.transaction();

  try {
    // Validate the ID parameter
    if (!id) {
      return res.status(400).json({ message: "ID parameter is required." });
    }

    // Find the DemoConversion model by ID
    const demoConversion = await DemoConversion.findByPk(id, { transaction });

    // Check if the DemoConversion exists
    if (!demoConversion) {
      return res
        .status(404)
        .json({ message: "DemoConversion not found with id: " + id });
    }

    // Check if the user exists for the provided ApprovedBy ID
    const approvedByExists = await UserMaster.findOne({
      where: { UserID: req.body.ApprovedBy },
      transaction,
    });

    if (!approvedByExists) {
      return res.status(400).json({
        message: "The specified approving user does not exist.",
      });
    }

    // Initialize updatedData variable
    let updatedData = {};

    // Handle ApprovalStatus-specific logic
    if (req.body.ApprovalStatus === "Approved") {
      updatedData = {
        Remarks: req.body.Remarks || demoConversion.Remarks, // Include Remarks
        ApprovedBy: req.body.ApprovedBy || demoConversion.ApprovedBy,
        ApprovalStatus: "Approved",
        ModifiedDate: new Date(),
      };

      // Update VehicleStock table
      await VehicleStock.update(
        {
          Status: "Transferred",
          ModifiedDate: new Date(),
        },
        { where: { PurchaseID: demoConversion.PurchaseID }, transaction }
      );
    } else if (req.body.ApprovalStatus === "Rejected") {
      updatedData = {
        ApprovedBy: req.body.ApprovedBy || demoConversion.ApprovedBy,
        ApprovalStatus: "Rejected",
        ModifiedDate: new Date(),
        Remarks: req.body.Remarks || demoConversion.Remarks, // Include Remarks
        IsActive: false, // Example: Activate the record
        Status: "InActive", // Example: Set status to Approved
      };
    } else {
      return res.status(400).json({
        message: "Invalid ApprovalStatus. Must be 'Approved' or 'Rejected'.",
      });
    }

    // Update the DemoConversion record
    await demoConversion.update(updatedData, { transaction });

    // Commit the transaction if all operations succeed
    await transaction.commit();

    // Respond with the updated demo conversion data
    res.status(200).json({
      message: "DemoConversion updated successfully.",
      data: updatedData,
    });
  } catch (err) {
    // Rollback the transaction on error
    if (transaction) await transaction.rollback();

    // Handle errors based on specific types
    if (err.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message: "Database error occurred while updating demo conversion.",
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
    console.error("Error updating demo conversion:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
