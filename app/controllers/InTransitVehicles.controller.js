/* eslint-disable no-unused-vars */
const db = require("../models");
const VehicleStock = db.vehiclestock;
const VendorMaster = db.vendormaster;
const BranchMaster = db.branchmaster;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;
const { generateGRNNo } = require("../Utils/generateService");

//Retrieve all pending stock from the database to In Transit Home Page.
exports.getPendingData = async (req, res) => {
  try {
    const branchID = req.query.BranchID;
    // Step 1: Retrieve CmpyRegionID for the given BranchID with BranchTypeID = 5
    const branchData = await BranchMaster.findOne({
      where: {
        BranchID: branchID,
        BranchTypeID: 5, // Filter by BranchTypeID = 5
      },
      attributes: ["CmpyRegionID"], // Only retrieve CmpyRegionID
    });

    // If no branch data is found, return a 404 error
    if (!branchData) {
      return res.status(404).json({
        success: false,
        message:
          "No branch found with the specified BranchID and BranchTypeID = 5.",
      });
    }

    // Step 2: Use the CmpyRegionID to retrieve all BranchIDs for that region
    const regionID = branchData.CmpyRegionID;
    console.log("!!!!", regionID);
    const branchesInRegion = await BranchMaster.findAll({
      where: {
        CmpyRegionID: regionID, // Filter by CmpyRegionID
        BranchTypeID: 6,
      },
      attributes: ["BranchID"], // Only retrieve BranchID
    });

    // If no branches are found for that region, return a 404 error
    if (!branchesInRegion || branchesInRegion.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No branches found for CmpyRegionID: ${regionID}.`,
      });
    }

    // Step 3: Return the list of BranchIDs for that region
    const branchIDs = branchesInRegion.map((branch) => branch.BranchID);

    console.log("!!!!", branchIDs);

    if (!branchData || branchData.length === 0) {
      // If no data is found, send a 404 response
      return res.status(404).json({
        success: false,
        message: "User doesn't have access to Stock.",
      });
    }

    // // Define the additional search condition
    // const searchCondition = {
    //   ...(branchID ? { "$PEBranchID.BranchTypeID$": 6 } : {}),
    // };

    // Using Sequelize's findAll method with selected fields
    const data = await VehicleStock.findAll({
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
        "FuelType",
        "InvoiceNo",
        "InvoiceDate",
        "GRNNo",
        "GRNDate",
        "StockInDate",
        "EWayBillNo",
        "TruckNo",
        "TransporterName",
        "BasicValue",
        "Discount",
        "DRF",
        "TaxableValue",
        "MFGDate",
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
      where: {
        Status: { [Op.eq]: "In-Transit" },
        BranchID: branchIDs, // Added condition to filter by BranchID
        // ...searchCondition, // Apply the conditional filter
      },
      order: [
        ["PurchaseID", "DESC"], // Order by ModelDescription in ascending order
      ],
    });

    if (!data || data.length === 0) {
      // If no data is found, send a 404 response
      return res.status(404).json({
        success: false,
        message: "No Pending in-transit data found.",
      });
    }

    // Map the data for response
    const combinedData = data.map((item) => ({
      PurchaseID: item.PurchaseID,
      VendorID: item.PEVendorID ? item.PEVendorID.VendorMasterID : null,
      VendorName: item.PEVendorID ? item.PEVendorID.VendorName : null,
      BranchID: item.PEBranchID ? item.PEBranchID.BranchID : null,
      BranchName: item.PEBranchID ? item.PEBranchID.BranchName : null,
      VariantCode: item.VariantCode,
      ModelCode: item.ModelCode,
      ColourCode: item.ColourCode,
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
      DRF: item.DRF,
      TaxableValue: item.TaxableValue,
      IGSTRate: item.IGSTRate,
      CESSRate: item.CESSRate,
      IGSTAmt: item.IGSTAmt,
      CGSTAmt: item.CGSTAmt,
      SGSTAmt: item.SGSTAmt,
      CESSAmt: item.CESSAmt,
      InvoiceValue: item.InvoiceValue,
      DispatchCode: item.DispatchCode,
      Remarks: item.Remarks,
      FundAccount: item.FundAccount,
      Status: item.Status,
      CreatedDate: item.CreatedDate,
      ModifiedDate: item.ModifiedDate,
    }));

    // Send the retrieved data
    res.status(200).json({
      success: true,
      combinedData,
    });
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message:
          "Database error occurred while retrieving pending Vehicle data.",
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
    // Handle Sequelize errors
    console.error("Error retrieving in-transit data:", error);
    res.status(500).json({
      success: false,
      message:
        error.message ||
        "Some error occurred while retrieving in-transit data.",
      details: error.message,
    });
  }
};

//Retrieve all delivered stock from the database to In Transit Home Page.
exports.getDeliveredData = async (req, res) => {
  try {
    const branchID = req.query.BranchID;
    // // Step 1: Retrieve CmpyRegionID for the given BranchID with BranchTypeID = 5
    // const branchData = await BranchMaster.findOne({
    //   where: {
    //     BranchID: branchID,
    //     BranchTypeID: 5, // Filter by BranchTypeID = 5
    //   },
    //   attributes: ["CmpyRegionID"], // Only retrieve CmpyRegionID
    // });

    // // If no branch data is found, return a 404 error
    // if (!branchData) {
    //   return res.status(404).json({
    //     success: false,
    //     message:
    //       "No branch found with the specified BranchID and BranchTypeID = 5.",
    //   });
    // }

    // // Step 2: Use the CmpyRegionID to retrieve all BranchIDs for that region
    // const regionID = branchData.CmpyRegionID;
    // console.log("!!!!", regionID);
    // const branchesInRegion = await BranchMaster.findAll({
    //   where: {
    //     CmpyRegionID: regionID, // Filter by CmpyRegionID
    //     BranchTypeID: 6,
    //   },
    //   attributes: ["BranchID"], // Only retrieve BranchID
    // });

    // // If no branches are found for that region, return a 404 error
    // if (!branchesInRegion || branchesInRegion.length === 0) {
    //   return res.status(404).json({
    //     success: false,
    //     message: `No branches found for CmpyRegionID: ${regionID}.`,
    //   });
    // }

    // // Step 3: Return the list of BranchIDs for that region
    // const branchIDs = branchesInRegion.map((branch) => branch.BranchID);

    // console.log("!!!!", branchIDs);

    // if (!branchData || branchData.length === 0) {
    //   // If no data is found, send a 404 response
    //   return res.status(404).json({
    //     success: false,
    //     message: "User doesn't have access to Stock.",
    //   });
    // }
    // Using Sequelize's findAll method with selected fields
    const data = await VehicleStock.findAll({
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
      where: {
        Status: { [Op.eq]: "In-Stock" },
        BranchID: branchID, // Added condition to filter by BranchID
      },
      order: [
        ["PurchaseID", "DESC"], // Order by ModelDescription in ascending order
      ],
    });

    if (!data || data.length === 0) {
      // If no data is found, send a 404 response
      return res.status(404).send({ message: "No delivered data found." });
    }

    // Map the data for response
    const combinedData = data.map((item) => ({
      PurchaseID: item.PurchaseID,
      VendorID: item.PEVendorID ? item.PEVendorID.VendorMasterID : null,
      VendorName: item.PEVendorID ? item.PEVendorID.VendorName : null,
      BranchID: item.PEBranchID ? item.PEBranchID.BranchID : null,
      BranchName: item.PEBranchID ? item.PEBranchID.BranchName : null,
      VariantCode: item.VariantCode,
      ModelCode: item.ModelCode,
      ColourCode: item.ColourCode,
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
      DRF: item.DRF,
      TaxableValue: item.TaxableValue,
      IGSTRate: item.IGSTRate,
      CESSRate: item.CESSRate,
      IGSTAmt: item.IGSTAmt,
      CGSTAmt: item.CGSTAmt,
      SGSTAmt: item.SGSTAmt,
      CESSAmt: item.CESSAmt,
      InvoiceValue: item.InvoiceValue,
      DispatchCode: item.DispatchCode,
      Remarks: item.Remarks,
      FundAccount: item.FundAccount,
      Status: item.Status,
      CreatedDate: item.CreatedDate,
      ModifiedDate: item.ModifiedDate,
    }));

    // Send the retrieved data
    res.status(200).json({
      success: true,
      combinedData,
    });
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while retrieving delivered data.",
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
    // Handle Sequelize errors
    console.error("Error retrieving delivered data:", error);
    res.status(500).send({
      message:
        error.message || "Some error occurred while retrieving delivered data.",
      details: error.message,
    });
  }
};

//Update all records which are received by id's
exports.updateReceivedData = async (req, res) => {
  const branchID = req.body.BranchID;
  const purchaseIDs = req.body.PurchaseID;
  const grnDate = Date.now();

  try {
    // Ensure PurchaseIDs is valid and not empty
    if (
      !purchaseIDs ||
      !Array.isArray(purchaseIDs) ||
      purchaseIDs.length === 0
    ) {
      return res.status(400).send({ message: "Invalid or empty IDs array." });
    }

    const grnNo = await generateGRNNo(); // Generate GRNNumber
    console.log(grnNo);
    // Update VehicleStock records with the generated GRNNumber
    const [numAffectedRows] = await VehicleStock.update(
      {
        BranchID: branchID,
        GRNNo: grnNo,
        GRNDate: grnDate,
        Status: "In-Stock",
        ModifiedDate: new Date(),
      },
      { where: { PurchaseID: { [Op.in]: purchaseIDs } } }
    );

    if (numAffectedRows > 0) {
      res.send({ message: "VehicleStock was updated successfully." });
    } else {
      res.status(404).send({
        message: `Cannot update VehicleStock with id=${purchaseIDs}. VehicleStock not found.`,
      });
    }
  } catch (err) {
    // Handle errors based on specific types
    if (err.name === "SequelizeValidationError") {
      // Handle Sequelize validation errors
      return res.status(400).json({
        message: "Validation error",
        details: err.errors.map((e) => e.message),
      });
    }

    if (err.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while updating InTansitVehicles.",
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
    console.error("Error updating VehicleStock:", err);
    res.status(500).send({
      message: `Error updating VehicleStock with id=${purchaseIDs}.`,
      details: err.message,
    });
  }
};
