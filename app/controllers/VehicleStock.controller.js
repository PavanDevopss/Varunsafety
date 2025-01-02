/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const db = require("../models");
const VehicleStock = db.vehiclestock;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;
const VendorMaster = db.vendormaster;
const BranchMaster = db.branchmaster;
const ModelMaster = db.modelmaster;
const VariantMaster = db.variantmaster;
const ColourMaster = db.colourmaster;

//Basic CRUD API for Vehicle Stock

//Retrieve all stock from the database
exports.findAll = async (req, res) => {
  try {
    const branchId = req.query.BranchID;
    if (!branchId) {
      return res.status(400).json({
        message: "Branch ID is required",
      });
    }
    // Fetch all purchase entry data with included vendor and branch data
    const purchaseEntryData = await VehicleStock.findAll({
      where: { BranchID: branchId },
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
        "InvoiceNo",
        "InvoiceDate",
        "GRNNo",
        "GRNDate",
        "StockInDate",
        "EWayBillNo",
        "TruckNo",
        "TransporterName",
        "MFGDate",
        "BasicValue",
        "Discount",
        "DRF",
        "TaxableValue",
        "IGSTRate",
        "CESSRate",
        "IGSTAmt",
        "CGSTAmt",
        "SGSTAmt",
        "CESSAmt",
        "InvoiceValue",
        "DispatchCode",
        "Remarks",
        "FundAccount",
        "Status",
        "CreatedDate",
        "ModifiedDate",
      ],
      include: [
        {
          model: VendorMaster,
          as: "PEVendorID",
          attributes: ["VendorMasterID", "VendorName"],
        },
        {
          model: BranchMaster,
          as: "PEBranchID",
          attributes: ["BranchID", "BranchName"],
        },
      ],
      order: [
        ["CreatedDate", "DESC"], // Order by ModelDescription in ascending order
      ],
    });

    // Check if data is empty
    if (!purchaseEntryData || purchaseEntryData.length === 0) {
      return res.status(404).json({
        message: "No purchase entry data found.",
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

    // Map the data for response
    const combinedData = purchaseEntryData.map((item) => ({
      PurchaseID: item.PurchaseID,
      VendorID: item.PEVendorID ? item.PEVendorID.VendorMasterID : null,
      VendorName: item.PEVendorID ? item.PEVendorID.VendorName : null,
      BranchID: item.PEBranchID ? item.PEBranchID.BranchID : null,
      BranchName: item.PEBranchID ? item.PEBranchID.BranchName : null,
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
      InvoiceNo: item.InvoiceNo,
      InvoiceDate: item.InvoiceDate,
      GRNNo: item.GRNNo,
      GRNDate: item.GRNDate,
      StockInDate: item.StockInDate,
      EWayBillNo: item.EWayBillNo,
      TruckNo: item.TruckNo,
      TransporterName: item.TransporterName,
      MFGDate: item.MFGDate,
      BasicValue: item.BasicValue,
      Discount: item.Discount,
      DRFValue: item.DRF,
      TaxableValue: item.TaxableValue,
      IGSTRate: item.IGSTRate,
      CESSRate: item.CESSRate,
      IGSTAmt: item.IGSTAmt,
      CGSTAmt: item.CGSTAmt,
      SGSTAmt: item.SGSTAmt,
      CESSAmt: item.CESSAmt,
      InvoiceAmt: item.InvoiceValue,
      DispatchCode: item.DispatchCode,
      Remarks: item.Remarks,
      FundAccount: item.FundAccount,
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

// Find a single stock with an id
exports.findOne = async (req, res) => {
  try {
    // Get the PurchaseID from the request parameters
    const { id } = req.params; // Assuming ID is passed as a route parameter

    // Fetch the specific purchase entry data with included vendor and branch data
    const purchaseEntryData = await VehicleStock.findOne({
      where: { PurchaseID: id },
      attributes: [
        "PurchaseID",
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
        "InvoiceNo",
        "InvoiceDate",
        "GRNNo",
        "GRNDate",
        "StockInDate",
        "EWayBillNo",
        "TruckNo",
        "TransporterName",
        "MFGDate",
        "BasicValue",
        "Discount",
        "DRF",
        "TaxableValue",
        "IGSTRate",
        "CESSRate",
        "IGSTAmt",
        "CGSTAmt",
        "SGSTAmt",
        "CESSAmt",
        "InvoiceValue",
        "DispatchCode",
        "Remarks",
        "FundAccount",
        "Status",
        "CreatedDate",
        "ModifiedDate",
      ],
      include: [
        {
          model: VendorMaster,
          as: "PEVendorID",
          attributes: ["VendorMasterID", "VendorName"],
        },
        {
          model: BranchMaster,
          as: "PEBranchID",
          attributes: ["BranchID", "BranchName"],
        },
      ],
    });

    // Check if data is found
    if (!purchaseEntryData) {
      return res.status(404).json({
        message: "Purchase entry data not found.",
      });
    }

    // Fetch related details
    const [modelDetails, variantDetails, colourDetails] = await Promise.all([
      ModelMaster.findOne({
        where: { ModelCode: purchaseEntryData.ModelCode },
      }),
      VariantMaster.findOne({
        where: { VariantCode: purchaseEntryData.VariantCode },
      }),
      ColourMaster.findOne({
        where: { ColourCode: purchaseEntryData.ColourCode },
      }),
    ]);

    // Create lookups for descriptions
    const modelDescription = modelDetails
      ? modelDetails.ModelDescription
      : null;
    const variantDescription = variantDetails
      ? variantDetails.VariantDescription
      : null;
    const colourDescription = colourDetails
      ? colourDetails.ColourDescription
      : null;

    // Map the data for response
    const combinedData = {
      PurchaseID: purchaseEntryData.PurchaseID,
      VendorID: purchaseEntryData.PEVendorID
        ? purchaseEntryData.PEVendorID.VendorMasterID
        : null,
      VendorName: purchaseEntryData.PEVendorID
        ? purchaseEntryData.PEVendorID.VendorName
        : null,
      BranchID: purchaseEntryData.PEBranchID
        ? purchaseEntryData.PEBranchID.BranchID
        : null,
      BranchName: purchaseEntryData.PEBranchID
        ? purchaseEntryData.PEBranchID.BranchName
        : null,
      VariantCode: purchaseEntryData.VariantCode,
      VariantDescription: variantDescription,
      ModelCode: purchaseEntryData.ModelCode,
      ModelDescription: modelDescription,
      ColourCode: purchaseEntryData.ColourCode,
      ColourDescription: colourDescription,
      TransmissionCode: purchaseEntryData.TransmissionCode,
      SKUCode: purchaseEntryData.SKUCode,
      EngineNo: purchaseEntryData.EngineNo,
      ChassisNo: purchaseEntryData.ChassisNo,
      KeyNo: purchaseEntryData.KeyNo,
      FuelType: purchaseEntryData.FuelType,
      InvoiceNo: purchaseEntryData.InvoiceNo,
      InvoiceDate: purchaseEntryData.InvoiceDate,
      GRNNo: purchaseEntryData.GRNNo,
      GRNDate: purchaseEntryData.GRNDate,
      StockInDate: purchaseEntryData.StockInDate,
      EWayBillNo: purchaseEntryData.EWayBillNo,
      TruckNo: purchaseEntryData.TruckNo,
      TransporterName: purchaseEntryData.TransporterName,
      MFGDate: purchaseEntryData.MFGDate,
      BasicValue: purchaseEntryData.BasicValue,
      Discount: purchaseEntryData.Discount,
      DRFValue: purchaseEntryData.DRF,
      TaxableValue: purchaseEntryData.TaxableValue,
      IGSTRate: purchaseEntryData.IGSTRate,
      CESSRate: purchaseEntryData.CESSRate,
      IGSTAmt: purchaseEntryData.IGSTAmt,
      CGSTAmt: purchaseEntryData.CGSTAmt,
      SGSTAmt: purchaseEntryData.SGSTAmt,
      CESSAmt: purchaseEntryData.CESSAmt,
      InvoiceAmt: purchaseEntryData.InvoiceValue,
      DispatchCode: purchaseEntryData.DispatchCode,
      Remarks: purchaseEntryData.Remarks,
      FundAccount: purchaseEntryData.FundAccount,
      Status: purchaseEntryData.Status,
      CreatedDate: purchaseEntryData.CreatedDate,
      ModifiedDate: purchaseEntryData.ModifiedDate,
    };

    // Send the combined data as response
    res.json(combinedData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message:
          "Database error occurred while retrieving purchase entry data.",
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
    console.error("Error retrieving purchase entry data:", error);
    return res.status(500).json({
      message:
        "Failed to retrieve purchase entry data. Please try again later.",
    });
  }
};

// Save VehicleStock in the database
exports.create = async (req, res) => {
  try {
    // Create a VehicleStock object
    const vehicleStock = {
      PurchasedFrom: req.body.PurchasedFrom,
      VendorID: req.body.VendorID,
      BranchID: req.body.BranchID,
      VariantCode: req.body.VariantCode,
      ModelCode: req.body.ModelCode,
      ColourCode: req.body.ColourCode,
      FuelType: req.body.FuelType,
      TransmissionCode: req.body.TransmissionCode,
      EngineNo: req.body.EngineNo,
      ChassisNo: req.body.ChassisNo,
      KeyNo: req.body.KeyNo,
      InvoiceNo: req.body.InvoiceNo,
      InvoiceDate: req.body.InvoiceDate,
      GRNNo: req.body.GRNNo,
      GRNDate: req.body.GRNDate,
      StockInDate: req.body.StockInDate,
      EWayBillNo: req.body.EWayBillNo,
      TruckNo: req.body.TruckNo,
      TransporterName: req.body.TransporterName,
      MFGDate: req.body.MFGDate,
      BasicValue: req.body.BasicValue || 0,
      Discount: req.body.Discount || 0,
      DRF: req.body.DRF || 0,
      TaxableValue: req.body.TaxableValue || 0,
      IGSTRate: req.body.IGSTRate || 0,
      CESSRate: req.body.CESSRate || 0,
      IGSTAmt: req.body.IGSTAmt || 0,
      CGSTAmt: req.body.CGSTAmt || 0,
      SGSTAmt: req.body.SGSTAmt || 0,
      CESSAmt: req.body.CESSAmt || 0,
      InvoiceValue: req.body.InvoiceValue || 0,
      DispatchCode: req.body.DispatchCode,
      Remarks: req.body.Remarks,
      FundAccount: req.body.FundAccount,
      SKUCode: req.body.SKUCode,
      Status: req.body.Status ? req.body.Status : "In-Stock",
    };

    console.log(vehicleStock);

    // Create a new VehicleStock record
    const data = await VehicleStock.create(vehicleStock);

    // Send the newly created record as response
    res.status(201).json(data);
  } catch (err) {
    // Handle errors based on specific types
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

    if (err.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while creating VehicleStock.",
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

    console.error("Error occurred while creating VehicleStock:", err);
    res.status(500).send({
      message: "Some error occurred while creating the VehicleStock.",
      error: err.message,
    });
  }
};

// Update a VehicleStock by the id in the request
exports.update = async (req, res) => {
  const purchaseID = req.params.id;
  try {
    // Retrieve the existing data from the database
    const existingData = await VehicleStock.findByPk(purchaseID);
    if (!existingData) {
      return res
        .status(404)
        .send({ message: `VehicleStock with id=${purchaseID} not found.` });
    }

    // Map the fields from the request body to the existing data
    existingData.VendorID = req.body.VendorID || existingData.VendorID;
    existingData.BranchID = req.body.BranchID || existingData.BranchID;
    existingData.VariantCode = req.body.VariantCode || existingData.VariantCode;
    existingData.ModelCode = req.body.ModelCode || existingData.ModelCode;
    existingData.ColourCode = req.body.ColourCode || existingData.ColourCode;
    existingData.SKUCode = req.body.SKUCode || existingData.SKUCode;
    existingData.EngineNo = req.body.EngineNo || existingData.EngineNo;
    existingData.ChassisNo = req.body.ChassisNo || existingData.ChassisNo;
    existingData.KeyNo = req.body.KeyNo || existingData.KeyNo;
    existingData.FuelType = req.body.FuelType || existingData.FuelType;
    existingData.TransmissionCode =
      req.body.TransmissionCode || existingData.TransmissionCode;
    existingData.InvoiceNo = req.body.InvoiceNo || existingData.InvoiceNo;
    existingData.InvoiceDate = req.body.InvoiceDate || existingData.InvoiceDate;
    existingData.GRNNo = req.body.GRNNo || existingData.GRNNo;
    existingData.GRNDate = req.body.GRNDate || existingData.GRNDate;
    existingData.StockInDate = req.body.StockInDate || existingData.StockInDate;
    existingData.EWayBillNo = req.body.EWayBillNo || existingData.EWayBillNo;
    existingData.TruckNo = req.body.TruckNo || existingData.TruckNo;
    existingData.TransporterName =
      req.body.TransporterName || existingData.TransporterName;
    existingData.MFGDate = req.body.MFGDate || existingData.MFGDate;
    existingData.BasicValue =
      req.body.BasicValue || existingData.BasicValue || 0;
    existingData.Discount = req.body.Discount || existingData.Discount || 0;
    existingData.DRF = req.body.DRF || existingData.DRF || 0;
    existingData.TaxableValue =
      req.body.TaxableValue || existingData.TaxableValue;
    existingData.IGSTRate = req.body.IGSTRate || existingData.IGSTRate || 0;
    existingData.CESSRate = req.body.CESSRate || existingData.CESSRate || 0;
    existingData.IGSTAmt = req.body.IGSTAmt || existingData.IGSTAmt || 0;
    existingData.CGSTAmt = req.body.CGSTAmt || existingData.CGSTAmt || 0;
    existingData.SGSTAmt = req.body.SGSTAmt || existingData.SGSTAmt || 0;
    existingData.CESSAmt = req.body.CESSAmt || existingData.CESSAmt || 0;
    existingData.InvoiceValue =
      req.body.InvoiceValue || existingData.InvoiceValue || 0;
    existingData.DispatchCode =
      req.body.DispatchCode || existingData.DispatchCode;
    existingData.Remarks = req.body.Remarks || existingData.Remarks;
    existingData.FundAccount = req.body.FundAccount || existingData.FundAccount;
    existingData.Status = req.body.Status || "In-Stock";
    existingData.CreatedDate = req.body.CreatedDate || existingData.CreatedDate;
    existingData.ModifiedDate = new Date();

    // Save the updated data
    await existingData.save();

    // Send the updated data as response
    res.json({
      message: "Purchase entry updated successfully.",
      data: existingData,
    });
  } catch (err) {
    console.error("Error updating VehicleStock:", err);
    // Handle errors based on specific types

    if (err.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while updating VehicleStock.",
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
    if (err instanceof sequelize.ValidationError) {
      res
        .status(400)
        .send({ message: "Validation error occurred.", errors: err.errors });
    } else {
      res.status(500).send({
        message: `Error updating VehicleStock with id=${purchaseID}.`,
      });
    }
  }
};

// Delete a VehicleStock with the specified id in the request
exports.delete = async (req, res) => {
  const purchaseID = req.params.id;

  try {
    // Perform deletion operation
    const numAffectedRows = await VehicleStock.destroy({
      where: { PurchaseID: purchaseID },
    });

    // Check if any rows were affected
    if (numAffectedRows === 1) {
      // If one row was affected, send success message
      res.send({ message: "VehicleStock was deleted successfully!" });
    } else {
      // If no rows were affected, send 404 response with appropriate message
      res.status(404).send({
        message: `Cannot delete VehicleStock with id=${purchaseID}. VehicleStock not found.`,
      });
    }
  } catch (err) {
    // Handle errors based on specific types
    if (err.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while deleting VehicleStock.",
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
    // Handle database errors
    console.error("Error deleting VehicleStock:", err);
    res.status(500).send({
      message: `Could not delete VehicleStock with id=${purchaseID}. ${err.message}`,
    });
  }
};
