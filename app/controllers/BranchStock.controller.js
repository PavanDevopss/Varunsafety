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
const VehicleAllotment = db.vehicleallotment;
const NewCarBookings = db.NewCarBookings;
const UserMaster = db.usermaster;

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
    // Extract PurchaseIDs from the purchaseEntryData
    const purchaseIds = purchaseEntryData.map((entry) => entry.PurchaseID);

    // Fetch VehicleAllotment data corresponding to the PurchaseIDs
    const vehicleAllotmentData = await VehicleAllotment.findAll({
      where: {
        PurchaseID: purchaseIds, // Only fetch allotment data related to the selected PurchaseIDs
        AllotmentStatus: "Allotted",
      },
      attributes: ["PurchaseID", "AllotmentReqID", "ReqNo"], // Including the AllotmentNo
    });
    // Create a lookup for AllotmentNo using PurchaseID
    const allotmentLookup = vehicleAllotmentData.reduce((acc, allotment) => {
      acc[allotment.PurchaseID] = allotment.ReqNo || null;
      return acc;
    }, {});

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
      AllotmentNo: allotmentLookup[item.PurchaseID] || null, // Add AllotmentNo if available, otherwise null
    }));

    // Calculate Ageing after fetching data
    const formattedStockData = combinedData.map((record) => {
      const mfgDate = new Date(record.MFGDate); // Parse MFGDate
      const now = new Date(); // Current date
      const diffTime = Math.abs(now - mfgDate); // Difference in milliseconds
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Convert to days

      return {
        ...record,
        Ageing: `${diffDays} days`, // Add Ageing field
      };
    });

    // Send the combined data as response
    res.json(formattedStockData);
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

exports.findOne = async (req, res) => {
  try {
    const purchaseId = req.params.id;
    if (!purchaseId) {
      return res.status(400).json({
        message: "Purchase ID is required",
      });
    }

    // Fetch the purchase entry record
    const purchaseEntryData = await VehicleStock.findOne({
      where: { PurchaseID: purchaseId },
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

    // Check if the purchase entry exists
    if (!purchaseEntryData) {
      return res.status(404).json({
        message: "Purchase entry data not found.",
      });
    }

    // Fetch related details using ModelCode, VariantCode, and ColourCode
    const [modelDetail, variantDetail, colourDetail] = await Promise.all([
      ModelMaster.findOne({
        where: { ModelCode: purchaseEntryData.ModelCode },
        attributes: ["ModelCode", "ModelDescription"], // Ensure only valid columns are queried
      }).catch(() => null), // Return null if not found
      VariantMaster.findOne({
        where: { VariantCode: purchaseEntryData.VariantCode },
        attributes: ["VariantCode", "VariantDescription"], // Ensure only valid columns are queried
      }).catch(() => null), // Return null if not found
      ColourMaster.findOne({
        where: { ColourCode: purchaseEntryData.ColourCode },
        attributes: ["ColourCode", "ColourDescription"], // Ensure only valid columns are queried
      }).catch(() => null), // Return null if not found
    ]);

    // Prepare response data
    const responseData = {
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
      VariantDescription: variantDetail
        ? variantDetail.VariantDescription
        : null,
      ModelCode: purchaseEntryData.ModelCode,
      ModelDescription: modelDetail ? modelDetail.ModelDescription : null,
      ColourCode: purchaseEntryData.ColourCode,
      ColourDescription: colourDetail ? colourDetail.ColourDescription : null,
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
      Ageing: `${Math.ceil(
        (new Date() - new Date(purchaseEntryData.MFGDate)) /
          (1000 * 60 * 60 * 24)
      )} days`, // Calculate Ageing
    };

    const vehicleAllotmentData = await VehicleAllotment.findOne({
      where: { PurchaseID: purchaseId, AllotmentStatus: "Allotted" },
      attributes: [
        "AllotmentReqID",
        "ReqNo",
        "ReqDate",
        "BranchID",
        "SalesPersonID",
        "TeamLeadID",
        "AllotmentValidFrom",
        "AllotmentValidTill",
        "AllotmentStatus",
        "IsActive",
        "Status",
        "CreatedDate",
        "ModifiedDate",
      ],
      include: [
        {
          model: NewCarBookings, // Related model for Booking
          as: "AllotBookingID",
          attributes: [
            "BookingNo",
            "SalesPersonID",
            "TeamLeadID",
            "BranchName",
          ], // Include relevant fields from Booking
        },
        {
          model: UserMaster,
          as: "AllotSPID",
          attributes: ["UserName", "EmpID"], // Include relevant fields from SalesPerson
        },
        {
          model: UserMaster,
          as: "AllotTLID",
          attributes: ["UserName", "EmpID"], // Include relevant fields from TeamLead
        },
        {
          model: BranchMaster,
          as: "AllotBranchID",
          attributes: ["BranchName"], // Include relevant fields from BranchMaster
        },
      ],
    });
    let allotCombinedData = {};
    if (vehicleAllotmentData) {
      allotCombinedData = {
        AllotmentReqID: vehicleAllotmentData.AllotmentReqID,
        ReqNo: vehicleAllotmentData.ReqNo,
        ReqDate: vehicleAllotmentData.ReqDate,
        BranchID: vehicleAllotmentData.BranchID,
        SalesPersonID: vehicleAllotmentData.SalesPersonID,
        TeamLeadID: vehicleAllotmentData.TeamLeadID,
        AllotmentValidFrom: vehicleAllotmentData.AllotmentValidFrom,
        AllotmentValidTill: vehicleAllotmentData.AllotmentValidTill,
        AllotmentStatus: vehicleAllotmentData.AllotmentStatus,
        CreatedDate: vehicleAllotmentData.CreatedDate,
        ModifiedDate: vehicleAllotmentData.ModifiedDate,
        // Combine relevant data from the included models
        BookingNo: vehicleAllotmentData.AllotBookingID
          ? vehicleAllotmentData.AllotBookingID.BookingNo
          : null,
        BookingBranch: vehicleAllotmentData.AllotBookingID
          ? vehicleAllotmentData.AllotBookingID.BranchName
          : null,
        BranchName: vehicleAllotmentData.AllotBranchID
          ? vehicleAllotmentData.AllotBranchID.BranchName
          : null,
        SalesPersonName: vehicleAllotmentData.AllotSPID
          ? vehicleAllotmentData.AllotSPID.UserName
          : null,
        SalesPersonEmpID: vehicleAllotmentData.AllotSPID
          ? vehicleAllotmentData.AllotSPID.EmpID
          : null,
        TeamLeadName: vehicleAllotmentData.AllotTLID
          ? vehicleAllotmentData.AllotTLID.UserName
          : null,
        TeamLeadEmpID: vehicleAllotmentData.AllotTLID
          ? vehicleAllotmentData.AllotTLID.EmpID
          : null,
      };
    }

    // Send the response
    res.json({ StockData: responseData, AllotmentData: allotCombinedData });
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

    console.error("Error retrieving purchase entry data:", error);
    return res.status(500).json({
      message:
        "Failed to retrieve purchase entry data. Please try again later.",
    });
  }
};
