/* eslint-disable no-unused-vars */
const db = require("../models");
const BranchIndent = db.branchindents;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;
const ModelMaster = db.modelmaster;
const ColourMaster = db.colourmaster;
const UserMaster = db.usermaster;
const BranchMaster = db.branchmaster;
const BranchTransfer = db.branchtransfers;
const VariantMaster = db.variantmaster;
const Transmission = db.transmission;
const VehicleStock = db.vehiclestock;
const SKUMaster = db.skumaster;
const {
  generateBIndentNo,
  generateBDCNo,
  convertTimestamp,
  generateRandomOTP,
  formatDate,
} = require("../Utils/generateService");
const { generateEwayBill } = require("./GST.controller");

//Basic CRUD API for Branch Indent

//Retrieve all stock from the database
exports.findAll = async (req, res) => {
  try {
    const data = await BranchIndent.findAll({
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
        "Status",
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
      order: [
        ["IndentID", "ASC"], // Order by ModelDescription in ascending order
      ],
    });
    if (!data || data.length === 0) {
      // If no data found, send a 404 response
      return res.status(404).send({ message: "No BranchIndents found." });
    }

    // Map each row to a flat structure
    const mappedData = data.map((row) => ({
      IndentID: row.IndentID,
      IndentNo: row.IndentNo,
      IndentDate: row.IndentDate,
      ModelCode: row.ModelCode,
      VariantCode: row.VariantCode,
      ColourCode: row.ColourCode,
      Transmission: row.Transmission,
      FuelType: row.FuelType,
      DriverID: row.DriverID,
      DriverName: row.DriverName,
      EMPMobileNo: row.EMPMobileNo,
      Status: row.Status,
      FromBranch: row.FromBranch,
      FromBranchCode: row.BIFromBranchID.BranchCode,
      FromBranchName: row.BIFromBranchID.BranchName,
      ToBranch: row.ToBranch,
      ToBranchCode: row.BIToBranchID.BranchCode,
      ToBranchName: row.BIToBranchID.BranchName,
    }));

    // Send the mapped data in the response
    res.send(mappedData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message:
          "Database error occurred while retrieving branch indents data.",
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

    console.error("Error occurred while retrieving BranchIndents:", error);
    res.status(500).send({
      message: "Internal server error occurred while retrieving BranchIndents.",
      error: error.message, // Sending the error message for debugging purposes
    });
  }
};

// Find a single stock with an id
exports.findOne = async (req, res) => {
  const id = req.params.id;

  try {
    const data = await BranchIndent.findOne({
      where: { IndentID: id },
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
    });

    if (!data) {
      // If no data found, send a 404 response
      return res
        .status(404)
        .send({ message: "BranchIndent not found with id=" + id });
    }

    // Map the data to a flat structure
    const mappedData = {
      IndentID: data.IndentID,
      IndentNo: data.IndentNo,
      IndentDate: data.IndentDate,
      ModelCode: data.ModelCode,
      VariantCode: data.VariantCode,
      ColourCode: data.ColourCode,
      Transmission: data.Transmission,
      FuelType: data.FuelType,
      DriverID: data.DriverID,
      DriverName: data.DriverName,
      EMPMobileNo: data.EMPMobileNo,
      Status: data.Status,
      FromBranch: data.FromBranch,
      FromBranchCode: data.BIFromBranchID.BranchCode,
      FromBranchName: data.BIFromBranchID.BranchName,
      ToBranch: data.ToBranch,
      ToBranchCode: data.BIToBranchID.BranchCode,
      ToBranchName: data.BIToBranchID.BranchName,
    };

    // Send the mapped data in the response
    res.send(mappedData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message:
          "Database error occurred while retrieving branch indents data.",
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
    console.error("Error retrieving BranchIndent:", error);
    res
      .status(500)
      .send({ message: "Error retrieving BranchIndent with id=" + id });
  }
};

// Save BranchIndent in the database
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
    const indentNum = await generateBIndentNo(branchCode.BranchCode);
    console.log("generated indent number:", indentNum);

    // Create a BranchIndent
    const branchIndentData = {
      IndentNo: indentNum,
      IndentDate: req.body.IndentDate || new Date(),
      FromBranch: req.body.FromBranch,
      ToBranch: req.body.ToBranch,
      ModelCode: req.body.ModelCode,
      VariantCode: req.body.VariantCode,
      ColourCode: req.body.ColourCode,
      Transmission: req.body.Transmission,
      FuelType: req.body.FuelType,
      DriverID: req.body.DriverID,
      DriverName: req.body.DriverName,
      EMPMobileNo: req.body.EMPMobileNo,
      Status: "Open", // Using a default value if Status is not provided
    };

    // Create the BranchIndent
    const data = await BranchIndent.create(branchIndentData);

    // Send the created data in the response
    res.send(data);
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
        message: "Database error occurred while creating BranchIndent.",
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
    console.error("Error occurred while creating BranchIndent:", err);
    res.status(500).send({
      message: "Some error occurred while creating the BranchIndent.",
      error: err.message, // Sending the error message for debugging purposes
    });
  }
};

// Update a BranchIndent by the id in the request
exports.update = async (req, res) => {
  const IndentId = req.params.id;
  const updatedData = req.body;

  try {
    if (!updatedData || Object.keys(updatedData).length === 0) {
      return res.status(400).send({ message: "Updated data cannot be empty." });
    }

    // Update the BranchIndent
    const [numAffectedRows] = await BranchIndent.update(
      { ...updatedData, ModifiedDate: new Date() },
      {
        where: { IndentID: IndentId },
      }
    );

    if (numAffectedRows === 1) {
      // If one row was affected, send success message
      res.send({ message: "BranchIndent was updated successfully." });
    } else {
      // If no rows were affected, send 404
      res.status(404).send({
        message: `Cannot update BranchIndent with id=${IndentId}. BranchIndent not found.`,
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
        message: "Database error occurred while updating BranchIndent.",
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

    console.error("Error updating BranchIndent:", err);
    res
      .status(500)
      .send({ message: `Error updating BranchIndent with id=${IndentId}.` });
  }
};

// Delete a BranchIndent with the specified id in the request
exports.delete = async (req, res) => {
  const IndentId = req.params.id;

  try {
    const numAffectedRows = await BranchIndent.destroy({
      where: { IndentID: IndentId },
    });

    if (numAffectedRows === 1) {
      // If one row was affected, send success message
      res.send({ message: "BranchIndent was deleted successfully!" });
    } else {
      // If no rows were affected, send 404
      res.status(404).send({
        message: `Cannot delete BranchIndent with id=${IndentId}. BranchIndent not found.`,
      });
    }
  } catch (err) {
    // Handle errors based on specific types
    if (err.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while deleting BranchIndent.",
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
    console.error("Error deleting BranchIndent:", err);
    res.status(500).send({
      message: `Could not delete BranchIndent with id=${IndentId}. ${err.message}`,
      details: err.message,
    });
  }
};

// Get BranchIndent by the id by action transfer and for Vehicle Allotment.
exports.GetAllotmentForBranchIndent = async (req, res) => {
  const branchCode = req.query.BranchCode;
  const indentNo = req.query.IndentID;

  try {
    // Log the BranchCode for debugging purposes
    console.log("Branch Code: ", branchCode);

    // Fetch the branch indent data with flattened fields for branch details
    const branchIndentData = await BranchIndent.findOne({
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
        "Status",
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
      where: {
        Status: { [Op.eq]: "Open" },
        IndentID: indentNo,
      },
    });

    // If no branch indent data is found, respond with a 404 error
    if (!branchIndentData) {
      return res.status(404).send({ message: "No BranchIndents found." });
    }

    // Log the retrieved Branch Indent Data for debugging
    console.log("Retrieved Branch Indent Data: ", branchIndentData.dataValues);

    // Fetch the model data based on ModelCode from the branch indent data
    const modelMasterData = await ModelMaster.findOne({
      attributes: ["ModelMasterID", "ModelDescription"],
      where: { ModelCode: branchIndentData.ModelCode },
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
      where: { VariantCode: branchIndentData.VariantCode },
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
      where: { ColourCode: branchIndentData.ColourCode },
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
        VariantCode: branchIndentData.VariantCode,
        ColourCode: branchIndentData.ColourCode,
        ModelCode: branchIndentData.ModelCode,
        BranchID: branchIndentData.ToBranch,
        Status: "In-Stock",
      },
      order: [["CreatedDate", "DESC"]], // Order stock data by CreatedDate in descending order
    });

    console.log("Branch Code: ", branchCode);
    // Generate a DC Number using the BranchCode
    const dcNumber = await generateBDCNo(branchCode);
    console.log("DC Number: ", dcNumber); // Log the DC Number for debugging

    // Combine and flatten all data
    const enrichedBranchIndentData = {
      IndentID: branchIndentData.IndentID || "N/A",
      IndentNo: branchIndentData.IndentNo || "N/A",
      IndentDate: branchIndentData.IndentDate || "N/A",
      FromBranch: branchIndentData.FromBranch || "N/A",
      ToBranch: branchIndentData.ToBranch || "N/A",
      ModelCode: branchIndentData.ModelCode || "N/A",
      VariantCode: branchIndentData.VariantCode || "N/A",
      ColourCode: branchIndentData.ColourCode || "N/A",
      Transmission: branchIndentData.Transmission || "N/A",
      FuelType: branchIndentData.FuelType || "N/A",
      DriverID: branchIndentData.DriverID || "N/A",
      DriverName: branchIndentData.DriverName || "N/A",
      EMPMobileNo: branchIndentData.EMPMobileNo || "N/A",
      Status: branchIndentData.Status || "N/A",

      // From Branch details
      FromBranchID: branchIndentData.BIFromBranchID?.BranchID || "N/A",
      FromBranchCode: branchIndentData.BIFromBranchID?.BranchCode || "N/A",
      FromBranchName: branchIndentData.BIFromBranchID?.BranchName || "N/A",

      // To Branch details
      ToBranchID: branchIndentData.BIToBranchID?.BranchID || "N/A",
      ToBranchCode: branchIndentData.BIToBranchID?.BranchCode || "N/A",
      ToBranchName: branchIndentData.BIToBranchID?.BranchName || "N/A",

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
      IndentData: enrichedBranchIndentData,
      StockData: stockData,
      DCNumber: dcNumber,
    });
  } catch (error) {
    // Log the error for debugging
    console.error("Error occurred while retrieving BranchIndents:", error);

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

// Update a BranchIndent by the id by action transfer and add an entry into BranchTransfer table using the same id.
exports.updateByTransfer = async (req, res) => {
  const transaction = await Seq.transaction(); // Start a transaction

  const indentID = req.body.IndentID;
  const purchaseID = req.body.PurchaseID;
  const branchCode = req.body.BranchCode;

  console.log("Received body parameters:", req.body);
  console.log("Indent ID:", indentID);
  console.log("Purchase ID:", purchaseID);

  try {
    // Update BranchIndent
    console.log("Updating BranchIndent...");
    const [numAffectedRows] = await BranchIndent.update(
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
    stockData.ModifiedDate = new Date();
    // stockData.BranchID = req.body.BranchID; // Update BranchID when vehicle enters the new branch

    await stockData.save({ transaction });
    console.log("VehicleStock updated successfully.");

    const generatedDCNumber = await generateBDCNo(branchCode);
    console.log("Generated DC Number successfully:", generatedDCNumber);

    // Update BranchTransfer Data
    console.log("Updating BranchTransfer...");
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
      TransferType: req.body.TransferType,
      TaxType: req.body.TaxType,
      ExShowRoom: req.body.ExShowRoom,
      CostOfVehicle: req.body.CostOfVehicle,
      IGSTValue: req.body.IGSTValue || stockData.IGSTAmt,
      SGSTValue: req.body.SGSTValue || stockData.SGSTAmt,
      CGSTValue: req.body.CGSTValue || stockData.CGSTAmt,
      CESSValue: req.body.CESSValue || stockData.CESSAmt,
      IssuedBy: req.body.EmpID,
      Remarks: req.body.Remarks,
      ModifiedDate: new Date(),
    };

    const [numUpdatedRows] = await BranchTransfer.update(transferData, {
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
exports.updateByTransfer = async (req, res) => {
  const indentID = req.body.IndentID;
  const purchaseID = req.body.PurchaseID;
  const branchCode = req.body.BranchCode;

  console.log("Received body parameters:", req.body);
  console.log("Indent ID:", indentID);
  console.log("Purchase ID:", purchaseID);

  try {
    // Update BranchIndent
    console.log("Updating BranchIndent...");
    const [numAffectedRows] = await BranchIndent.update(
      { Status: "Issued", ModifiedDate: new Date() },
      { where: { IndentID: indentID } }
    );

    if (numAffectedRows === 0) {
      console.log(`Cannot update status to 'Issued' for the indent.`);
      return res.status(404).send({
        message: `Cannot update status to 'Issued' for the indent.`,
      });
    }
    console.log(`Status updated successfully to 'Issued'.`);

    // Find and update VehicleStock
    console.log("Finding VehicleStock entry...");
    let stockData = await VehicleStock.findOne({
      where: { PurchaseID: purchaseID },
    });

    if (!stockData) {
      console.log(
        `Cannot find VehicleStock entry for PurchaseID=${purchaseID}.`
      );
      return res.status(404).send({
        message: `Cannot find VehicleStock entry for PurchaseID=${purchaseID}.`,
      });
    }
    console.log("Stock data found:", stockData.dataValues);

    // Update VehicleStock
    console.log("Updating VehicleStock...");
    // stockData.Status = "In-Transit"; // will change status when vehicle exists the branch
    stockData.KeyNo = req.body.KeyNo;
    stockData.ModifiedDate = new Date();
    // stockData.BranchID = req.body.BranchID; // will change status when vehicle enters the new branch

    await stockData.save();
    console.log("VehicleStock updated successfully.");
    const generatedDCNumber = await generateBDCNo(branchCode);
    console.log("generatedDCNumber successfully:", generatedDCNumber);

    // Update BranchTransfer Data
    console.log("Updating BranchTransfer...");
    const transferData = {
      DCNo: req.body.DCNumber || generatedDCNumber,
      DCDate: new Date(),
      ChassisNo: req.body.ChassisNo || stockData.ChassisNo,
      EngineNo: req.body.EngineNo || stockData.EngineNo,
      InvoiceNo: req.body.EngineNo || stockData.InvoiceNo,
      FuelQty: req.body.FuelQty,
      PurchaseID: purchaseID,
      KeyNo: req.body.KeyNo || stockData.KeyNo,
      GRNNo: req.body.GRNNo || stockData.GRNNo,
      TransferType: req.body.TransferType,
      TaxType: req.body.TaxType,
      ExShowRoom: req.body.ExShowRoom,
      CostOfVehicle: req.body.CostOfVehicle,
      IGSTValue: req.body.IGSTValue || stockData.IGSTAmt,
      SGSTValue: req.body.SGSTValue || stockData.SGSTAmt,
      CGSTValue: req.body.CGSTValue || stockData.CGSTAmt,
      CESSValue: req.body.CESSValue || stockData.CESSAmt,
      IssuedBy: req.body.EmpID,
      Remarks: req.body.Remarks,
      ModifiedDate: new Date(),
    };

    const [numUpdatedRows] = await BranchTransfer.update(transferData, {
      where: { IndentID: indentID },
    });

    if (numUpdatedRows === 0) {
      console.log(`Cannot update BranchTransfer data for the indent.`);
      return res.status(404).send({
        message: `Cannot update BranchTransfer data for the indent.`,
      });
    }
    console.log("BranchTransfer data updated successfully.");

    // If all updates were successful, send a success response
    console.log("All data updated successfully.");
    res.send({
      message: "Data updated for all tables successfully.",
      TransferData: numUpdatedRows,
    });
  } catch (error) {
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

    // Handle errors
    console.error("Error updating data:", error);
    res.status(500).send({ message: `Error updating data: ${error.message}` });
  }
};
*/

//Update Branch Transfer Data when EWB is generated
exports.updateByGenEWB = async (req, res) => {
  try {
    const { IndentID, TravelDist, VehicleNo } = req.body;

    if (!IndentID || !TravelDist || !VehicleNo) {
      return res.status(400).send({ message: "Missing required fields." });
    }

    console.log("Indent ID: ", IndentID);

    const branchTransferData = await BranchTransfer.findOne({
      where: { IndentID },
      include: [
        { model: BranchMaster, as: "BTFromBranchID" },
        { model: BranchMaster, as: "BTToBranchID" },
        { model: UserMaster, as: "BTDriverID" },
      ],
    });

    if (!branchTransferData) {
      return res
        .status(404)
        .send({ message: `No Branch Transfer found with ID = ${IndentID}.` });
    }

    const ewbJson = {
      supplyType: "O",
      subSupplyType: "5",
      DocType: "CHL",
      docNo: branchTransferData.DCNo || "",
      docDate: formatDate(branchTransferData.DCDate) || "",
      fromGstin: branchTransferData.BTFromBranchID.GSTIN || "",
      actFromStateCode:
        branchTransferData.BTFromBranchID.GSTIN?.substring(0, 2) || "",
      actToStateCode:
        branchTransferData.BTToBranchID.GSTIN?.substring(0, 2) || "",
      totInvValue: "",
      fromTrdName: "VARUN MOTORS PVT LTD",
      fromAddr1: branchTransferData.BTFromBranchID.Address || "",
      fromAddr2: branchTransferData.BTFromBranchID.District || "",
      fromPlace: branchTransferData.BTFromBranchID.District || "",
      fromPincode: branchTransferData.BTFromBranchID.PINCode || "",
      fromStateCode:
        parseInt(
          branchTransferData.BTFromBranchID.GSTIN?.substring(0, 2),
          10
        ) || 0,
      toGstin: branchTransferData.BTToBranchID.GSTIN || "",
      toTrdName: "VARUN MOTORS PVT LTD",
      toAddr1: branchTransferData.BTToBranchID.Address || "",
      toAddr2: branchTransferData.BTToBranchID.District || "",
      toPlace: branchTransferData.BTToBranchID.District || "",
      toPincode: branchTransferData.BTToBranchID.PINCode || "",
      toStateCode:
        parseInt(branchTransferData.BTToBranchID.GSTIN?.substring(0, 2), 10) ||
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

    const vehicleStockData = await VehicleStock.findOne({
      where: { PurchaseID: branchTransferData.PurchaseID },
    });

    if (!vehicleStockData) {
      return res.status(404).send({ message: "Vehicle stock data not found." });
    }

    ewbJson.totInvValue = vehicleStockData.TaxableValue;
    ewbJson.totalValue = vehicleStockData.TaxableValue;

    const skuData = await SKUMaster.findOne({
      where: { SKUCode: vehicleStockData.SKUCode },
    });
    console.log("SKU Data: ", skuData);
    if (skuData && ewbJson.actFromStateCode === ewbJson.actToStateCode) {
      const igstRate = skuData.IGSTRate;
      ewbJson.ItemList[0].cgstRate = igstRate / 2;
      ewbJson.ItemList[0].sgstRate = igstRate / 2;
      ewbJson.ItemList[0].cessRate = skuData.CESSRate;
      ewbJson.ItemList[0].hsnCode = skuData.HSNCode;
    }

    console.log("EWB JSON Data: ", ewbJson);

    const ewbResponseData = await generateEwayBill(ewbJson);
    console.log("EWB Response Details: ", ewbResponseData);

    if (ewbResponseData.Status == 1) {
      // Generate a 4-digit random number for DriverOTP
      branchTransferData.DriverOTP = generateRandomOTP();

      branchTransferData.EWBNo = ewbResponseData.Data.ewayBillNo || null;
      branchTransferData.EWBDate =
        convertTimestamp(ewbResponseData.Data.ewayBillDate) || null;
      branchTransferData.EWBValidUpto =
        convertTimestamp(ewbResponseData.Data.validUpto) || null;
      branchTransferData.VehicleNo = VehicleNo || null;
      branchTransferData.ModifiedDate = new Date();

      const updatedBranchTransferData = await branchTransferData.save();
      console.log(
        "Generated EWB has been updated in Branch Transfer Table successfully"
      );
      // Flatten the updatedBranchTransferData
      const flatResponse = {
        BranchTransferID: updatedBranchTransferData.BranchTransferID,
        IndentID: updatedBranchTransferData.IndentID,
        DCNo: updatedBranchTransferData.DCNo,
        DCDate: updatedBranchTransferData.DCDate,
        IssuedBy: updatedBranchTransferData.IssuedBy,
        FromBranch: updatedBranchTransferData.FromBranch,
        ToBranch: updatedBranchTransferData.ToBranch,
        ChassisNo: updatedBranchTransferData.ChassisNo,
        EngineNo: updatedBranchTransferData.EngineNo,
        FuelQty: updatedBranchTransferData.FuelQty,
        PurchaseID: updatedBranchTransferData.PurchaseID,
        EWBNo: updatedBranchTransferData.EWBNo,
        EWBDate: updatedBranchTransferData.EWBDate,
        EWBValidUpto: updatedBranchTransferData.EWBValidUpto,
        VehicleNo: updatedBranchTransferData.VehicleNo,
        DriverID: updatedBranchTransferData.DriverID,
        DriverOTP: updatedBranchTransferData.DriverOTP,
        GateOutTime: updatedBranchTransferData.GateOutTime,
        StartingKM: updatedBranchTransferData.StartingKM,
        GateInTime: updatedBranchTransferData.GateInTime,
        EndingKM: updatedBranchTransferData.EndingKM,
        GRNNo: updatedBranchTransferData.GRNNo,
        Status: updatedBranchTransferData.Status,
        Remarks: updatedBranchTransferData.Remarks,
        CreatedDate: updatedBranchTransferData.CreatedDate,
        ModifiedDate: updatedBranchTransferData.ModifiedDate,

        // Flatten BTFromBranchID
        BTFromBranch_BranchID:
          updatedBranchTransferData.BTFromBranchID.BranchID,
        BTFromBranch_BranchCode:
          updatedBranchTransferData.BTFromBranchID.BranchCode,
        BTFromBranch_BranchName:
          updatedBranchTransferData.BTFromBranchID.BranchName,
        // BTFromBranch_OEMStoreName:
        //   updatedBranchTransferData.BTFromBranchID.OEMStoreName,
        // BTFromBranch_CompanyID:
        //   updatedBranchTransferData.BTFromBranchID.CompanyID,
        // BTFromBranch_BranchTypeID:
        //   updatedBranchTransferData.BTFromBranchID.BranchTypeID,
        // BTFromBranch_RegionID: updatedBranchTransferData.BTFromBranchID.RegionID,
        // BTFromBranch_ChannelID:
        //   updatedBranchTransferData.BTFromBranchID.ChannelID,
        // BTFromBranch_Contact: updatedBranchTransferData.BTFromBranchID.Contact,
        // BTFromBranch_Email: updatedBranchTransferData.BTFromBranchID.Email,
        // BTFromBranch_DealerCode:
        //   updatedBranchTransferData.BTFromBranchID.DealerCode,
        // BTFromBranch_CityCode: updatedBranchTransferData.BTFromBranchID.CityCode,
        // BTFromBranch_StoreID: updatedBranchTransferData.BTFromBranchID.StoreID,
        // BTFromBranch_StoreCode:
        //   updatedBranchTransferData.BTFromBranchID.StoreCode,
        // BTFromBranch_LocationCode:
        //   updatedBranchTransferData.BTFromBranchID.LocationCode,
        // BTFromBranch_SubLedger:
        //   updatedBranchTransferData.BTFromBranchID.SubLedger,
        BTFromBranch_GSTIN: updatedBranchTransferData.BTFromBranchID.GSTIN,
        BTFromBranch_State: updatedBranchTransferData.BTFromBranchID.State,
        BTFromBranch_District:
          updatedBranchTransferData.BTFromBranchID.District,
        BTFromBranch_Address: updatedBranchTransferData.BTFromBranchID.Address,
        BTFromBranch_PINCode: updatedBranchTransferData.BTFromBranchID.PINCode,
        // BTFromBranch_IsActive: updatedBranchTransferData.BTFromBranchID.IsActive,
        // BTFromBranch_Status: updatedBranchTransferData.BTFromBranchID.Status,
        // BTFromBranch_CreatedDate:
        //   updatedBranchTransferData.BTFromBranchID.CreatedDate,
        // BTFromBranch_ModifiedDate:
        //   updatedBranchTransferData.BTFromBranchID.ModifiedDate,

        // Flatten BTToBranchID
        BTToBranch_BranchID: updatedBranchTransferData.BTToBranchID.BranchID,
        BTToBranch_BranchCode:
          updatedBranchTransferData.BTToBranchID.BranchCode,
        BTToBranch_BranchName:
          updatedBranchTransferData.BTToBranchID.BranchName,
        // BTToBranch_OEMStoreName:
        //   updatedBranchTransferData.BTToBranchID.OEMStoreName,
        // BTToBranch_CompanyID: updatedBranchTransferData.BTToBranchID.CompanyID,
        // BTToBranch_BranchTypeID:
        //   updatedBranchTransferData.BTToBranchID.BranchTypeID,
        // BTToBranch_RegionID: updatedBranchTransferData.BTToBranchID.RegionID,
        // BTToBranch_ChannelID: updatedBranchTransferData.BTToBranchID.ChannelID,
        // BTToBranch_Contact: updatedBranchTransferData.BTToBranchID.Contact,
        // BTToBranch_Email: updatedBranchTransferData.BTToBranchID.Email,
        // BTToBranch_DealerCode: updatedBranchTransferData.BTToBranchID.DealerCode,
        // BTToBranch_CityCode: updatedBranchTransferData.BTToBranchID.CityCode,
        // BTToBranch_StoreID: updatedBranchTransferData.BTToBranchID.StoreID,
        // BTToBranch_StoreCode: updatedBranchTransferData.BTToBranchID.StoreCode,
        // BTToBranch_LocationCode:
        //   updatedBranchTransferData.BTToBranchID.LocationCode,
        // BTToBranch_SubLedger: updatedBranchTransferData.BTToBranchID.SubLedger,
        BTToBranch_GSTIN: updatedBranchTransferData.BTToBranchID.GSTIN,
        BTToBranch_State: updatedBranchTransferData.BTToBranchID.State,
        BTToBranch_District: updatedBranchTransferData.BTToBranchID.District,
        BTToBranch_Address: updatedBranchTransferData.BTToBranchID.Address,
        BTToBranch_PINCode: updatedBranchTransferData.BTToBranchID.PINCode,
        // BTToBranch_IsActive: updatedBranchTransferData.BTToBranchID.IsActive,
        // BTToBranch_Status: updatedBranchTransferData.BTToBranchID.Status,
        // BTToBranch_CreatedDate:
        //   updatedBranchTransferData.BTToBranchID.CreatedDate,
        // BTToBranch_ModifiedDate:
        //   updatedBranchTransferData.BTToBranchID.ModifiedDate,

        // Flatten BTDriverID
        BTDriver_UserID: updatedBranchTransferData.BTDriverID.UserID,
        BTDriver_UserName: updatedBranchTransferData.BTDriverID.UserName,
        BTDriver_EmpID: updatedBranchTransferData.BTDriverID.EmpID,
        BTDriver_Mobile: updatedBranchTransferData.BTDriverID.Mobile,
        // BTDriver_Email: updatedBranchTransferData.BTDriverID.Email,
        // BTDriver_Designation: updatedBranchTransferData.BTDriverID.Designation,
        // BTDriver_MPIN: updatedBranchTransferData.BTDriverID.MPIN,
        // BTDriver_Password: updatedBranchTransferData.BTDriverID.Password,
        // BTDriver_UserStatus: updatedBranchTransferData.BTDriverID.UserStatus,
        // BTDriver_RoleID: updatedBranchTransferData.BTDriverID.RoleID,
        // BTDriver_State: updatedBranchTransferData.BTDriverID.State,
        // BTDriver_Region: updatedBranchTransferData.BTDriverID.Region,
        // BTDriver_City: updatedBranchTransferData.BTDriverID.City,
        // BTDriver_Branch: updatedBranchTransferData.BTDriverID.Branch,
        // BTDriver_BranchID: updatedBranchTransferData.BTDriverID.BranchID,
        // BTDriver_RegionID: updatedBranchTransferData.BTDriverID.RegionID,
        // BTDriver_OEMID: updatedBranchTransferData.BTDriverID.OEMID,
        // BTDriver_Status: updatedBranchTransferData.BTDriverID.Status,
        // BTDriver_IsActive: updatedBranchTransferData.BTDriverID.IsActive,
        // BTDriver_CreatedDate: updatedBranchTransferData.BTDriverID.CreatedDate,
        // BTDriver_ModifiedDate: updatedBranchTransferData.BTDriverID.ModifiedDate,
      };
      return res.status(200).json(flatResponse);
    } else {
      return res.json(ewbResponseData);
    }
  } catch (error) {
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

//Get Branch Transfer Data for DC Print - Test API Currently Not in Use
exports.getBranchTransferData = async (req, res) => {
  try {
    const indentID = req.query.IndentID;
    console.log("Indent ID: ", indentID);
    const branchTransferData = await BranchTransfer.findOne({
      where: { IndentID: indentID },
    });
    console.log("branch Transfer Data:", branchTransferData);
    if (!branchTransferData || branchTransferData.length === 0) {
      // If no data found, send a 404 response
      return res
        .status(404)
        .send({ message: `No Branch Transfer found with ID = ${indentID}.` });
    }

    // Map the fields from request body to Transfer Data
    // branchTransferData.EWBNo = req.body.EWBNo;

    // save the Transfer list with the updated fields
    // const updatedBranchTransferData = await branchTransferData.save();
    console.log(
      "Generated EWB has been updated in Branch Transfer Table successfully"
    );

    // Send the enriched data in the response
    return res.status(200).json(branchTransferData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      console.error("Database error:", error);
      return res.status(500).json({
        message: "Database error occurred while retrieving BranchTransfers.",
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
        message: "Validation error occurred while retrieving BranchTransfers.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeTimeoutError") {
      console.error("Timeout error:", error);
      return res.status(504).json({
        message: "Request timeout while retrieving BranchTransfers.",
        details: error.message,
      });
    }
    console.error("Error occurred while updating Branch Transfer Data:", error);
    res.status(500).send({
      message:
        "Internal server error occurred while updating Branch Transfer Data.",
      details: error.message, // Sending the error message for debugging purposes
    });
  }
};

// Dynamic Indents data by screen
exports.getBranchIndentsByScreen = async (req, res) => {
  try {
    const branch = req.query.BranchID;
    const screen = req.query.ScreenName;

    let whereCondition = {}; // Define an empty object to hold the dynamic WHERE condition

    if (screen === "Raised") {
      whereCondition = { FromBranch: branch };
    } else if (screen === "Received") {
      whereCondition = { ToBranch: branch };
    } else {
      // Handle unexpected values of screen if needed
      return res.status(400).json({ message: "Invalid value for ScreenName." });
    }

    const data = await BranchIndent.findAll({
      where: whereCondition,
      attributes: [
        "IndentID",
        "IndentNo",
        "IndentDate",
        "FromBranch",
        "ToBranch",
        "ModelCode",
        "VariantCode",
        "ColourCode",
        "DriverID",
        "DriverName",
        "EMPMobileNo",
        "Status",
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
      order: [
        ["IndentID", "DESC"], // Order by IndentID in ascending order
      ],
    });

    if (!data || data.length === 0) {
      return res.status(404).send({ message: "No BranchIndents found." });
    }

    // Map each row to a flat structure
    const mappedData = data.map((row) => ({
      IndentID: row.IndentID,
      IndentNo: row.IndentNo,
      IndentDate: row.IndentDate,
      ModelCode: row.ModelCode,
      VariantCode: row.VariantCode,
      ColourCode: row.ColourCode,
      DriverID: row.DriverID,
      DriverName: row.DriverName,
      EMPMobileNo: row.EMPMobileNo,
      FromBranch: row.FromBranch,
      FromBranchCode: row.BIFromBranchID.BranchCode,
      FromBranchName: row.BIFromBranchID.BranchName,
      ToBranch: row.ToBranch,
      ToBranchCode: row.BIToBranchID.BranchCode,
      ToBranchName: row.BIToBranchID.BranchName,
      Status: row.Status,
    }));

    res.send(mappedData);
  } catch (error) {
    // Handle Sequelize errors
    console.error("Error occurred while retrieving BranchIndents:", error);

    let status = 500;
    let errorMessage =
      "Internal server error occurred while retrieving BranchIndents.";

    if (error.name === "SequelizeDatabaseError") {
      errorMessage =
        "Database error occurred while retrieving branch indents data.";
    } else if (error.name === "SequelizeConnectionError") {
      status = 503;
      errorMessage = "Service unavailable. Unable to connect to the database.";
    }

    res.status(status).json({ message: errorMessage, details: error.message });
  }
};

// Get Branch Indents Received Page Data
exports.getIndentReceivedPageData = async (req, res) => {
  try {
    const branch = req.query.BranchID;
    const statusOrder = [
      "Issued",
      "In-Transit",
      "Received",
      "Cancelled",
      "Returned",
    ];

    // Fetch all Branch Indents first
    const branchIndentsData = await BranchIndent.findAll({
      where: { Status: "Open", ToBranch: branch },
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
    });

    // Fetch all Branch Transfers with included Branch Indents
    const branchTransfersData = await BranchTransfer.findAll({
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
        Status: {
          [Op.in]: statusOrder,
        },
        ToBranch: branch,
      },
      // order: [
      //   [
      //     sequelize.literal(
      //       `FIELD("BranchTransfer"."Status", '${statusOrder.join("','")}')`
      //     ),
      //   ],
      // ],
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
    });

    // // Grouping the fetched data by Status manually
    // const groupedData = {};
    // branchTransfersData.forEach((transfer) => {
    //   const status = transfer.Status;
    //   if (!groupedData[status]) {
    //     groupedData[status] = [];
    //   }
    //   groupedData[status].push(transfer);
    // });

    // // Now groupedData object will contain arrays of transfers grouped by Status
    // console.log("Grouped Data: ", groupedData);
    // Combine branchIndentsData and branchTransfersData into a single array
    const combinedData = branchIndentsData
      .map((indent) => ({
        type: "Indent",
        data: indent.toJSON(),
      }))
      .concat(
        branchTransfersData.map((transfer) => ({
          type: "Transfer",
          data: transfer.toJSON(),
        }))
      );

    // console.log("Transfer status: ", branchTransfersData);
    const status = branchTransfersData.map(
      (transfer) => transfer.dataValues.Status
    );
    // console.log("Transfer status: ", status);
    // Check if any combined data found
    if (!combinedData || combinedData.length === 0) {
      return res.status(404).send({ message: "No combined data found." });
    }

    // Map each row to a flat structure
    const mappedData = [];

    // Mapping branch indents
    branchIndentsData.forEach((indent) => {
      mappedData.push({
        type: "Indent",
        IndentID: indent.IndentID || null,
        IndentNo: indent.IndentNo || null,
        IndentDate: indent.IndentDate || null,
        DCNo: indent.DCNo || null,
        DCDate: indent.DCDate || null,
        IssuedBy: indent.IssuedBy || null,
        ModelCode: indent.ModelCode || null,
        VariantCode: indent.VariantCode || null,
        ColourCode: indent.ColourCode || null,
        Transmission: indent.Transmission || null,
        FuelType: indent.FuelType || null,
        ChassisNo: indent.ChassisNo || null,
        EngineNo: indent.EngineNo || null,
        FuelQty: indent.FuelQty || null,
        PurchaseID: indent.PurchaseID || null,
        EWBNo: indent.EWBNo || null,
        GateOutTime: indent.GateOutTime || null,
        StartingKM: indent.StartingKM || null,
        GateInTime: indent.GateInTime || null,
        EndingKM: indent.EndingKM || null,
        GRNNo: indent.GRNNo || null,
        DriverID: indent.DriverID || null,
        DriverName: indent.DriverName || null,
        DriverOTP: indent.DriverOTP || null,
        EMPMobileNo: indent.EMPMobileNo || null,
        FromBranchID: indent.BIFromBranchID
          ? indent.BIFromBranchID.BranchID || null
          : null,
        FromBranchCode: indent.BIFromBranchID
          ? indent.BIFromBranchID.BranchCode || null
          : null,
        FromBranchName: indent.BIFromBranchID
          ? indent.BIFromBranchID.BranchName || null
          : null,
        ToBranchID: indent.BIToBranchID
          ? indent.BIToBranchID.BranchID || null
          : null,
        ToBranchCode: indent.BIToBranchID
          ? indent.BIToBranchID.BranchCode || null
          : null,
        ToBranchName: indent.BIToBranchID
          ? indent.BIToBranchID.BranchName || null
          : null,
        Remarks: indent.Remarks || null,

        Status: indent.Status || null,
      });
    });

    // Mapping branch transfers
    branchTransfersData.forEach((transfer) => {
      mappedData.push({
        type: "Transfer",
        BranchTransferID: transfer.dataValues.BranchTransferID || null,
        IndentID: transfer.dataValues.IndentID || null,
        IndentNo: transfer.BTIndentID
          ? transfer.BTIndentID.IndentNo || null
          : null,
        IndentDate: transfer.BTIndentID
          ? transfer.BTIndentID.IndentDate || null
          : null,
        DCNo: transfer.dataValues.DCNo || null,
        DCDate: transfer.dataValues.DCDate || null,
        IssuedBy: transfer.dataValues.IssuedBy || null,
        ModelCode: transfer.BTIndentID
          ? transfer.BTIndentID.ModelCode || null
          : null,
        VariantCode: transfer.BTIndentID
          ? transfer.BTIndentID.VariantCode || null
          : null,
        ColourCode: transfer.BTIndentID
          ? transfer.BTIndentID.ColourCode || null
          : null,
        Transmission: transfer.BTIndentID
          ? transfer.BTIndentID.Transmission || null
          : null,
        FuelType: transfer.BTIndentID
          ? transfer.BTIndentID.FuelType || null
          : null,
        ChassisNo: transfer.dataValues.ChassisNo || null,
        EngineNo: transfer.dataValues.EngineNo || null,
        FuelQty: transfer.dataValues.FuelQty || null,
        PurchaseID: transfer.dataValues.PurchaseID || null,
        EWBNo: transfer.dataValues.EWBNo || null,
        GateOutTime: transfer.dataValues.GateOutTime || null,
        StartingKM: transfer.dataValues.StartingKM || null,
        GateInTime: transfer.dataValues.GateInTime || null,
        EndingKM: transfer.dataValues.EndingKM || null,
        GRNNo: transfer.dataValues.GRNNo || null,
        DriverID: transfer.BTIndentID
          ? transfer.BTIndentID.DriverID || null
          : null,
        DriverName: transfer.BTIndentID
          ? transfer.BTIndentID.DriverName || null
          : null,
        DriverOTP: transfer.dataValues.DriverOTP || null,
        EMPMobileNo: transfer.BTIndentID
          ? transfer.BTIndentID.EMPMobileNo || null
          : null,

        FromBranchID:
          transfer.BTIndentID && transfer.BTIndentID.BIFromBranchID
            ? transfer.BTIndentID.BIFromBranchID.BranchID || null
            : null,
        FromBranchCode:
          transfer.BTIndentID && transfer.BTIndentID.BIFromBranchID
            ? transfer.BTIndentID.BIFromBranchID.BranchCode || null
            : null,
        FromBranchName:
          transfer.BTIndentID && transfer.BTIndentID.BIFromBranchID
            ? transfer.BTIndentID.BIFromBranchID.BranchName || null
            : null,
        ToBranchID:
          transfer.BTIndentID && transfer.BTIndentID.BIToBranchID
            ? transfer.BTIndentID.BIToBranchID.BranchID || null
            : null,
        ToBranchCode:
          transfer.BTIndentID && transfer.BTIndentID.BIToBranchID
            ? transfer.BTIndentID.BIToBranchID.BranchCode || null
            : null,
        ToBranchName:
          transfer.BTIndentID && transfer.BTIndentID.BIToBranchID
            ? transfer.BTIndentID.BIToBranchID.BranchName || null
            : null,
        // FromBranch: transfer.FromBranch || null,
        // ToBranch: transfer.ToBranch || null,
        Remarks: transfer.dataValues.Remarks || null,

        Status: transfer.dataValues.Status || null,
      });
    });

    // After mapping the data
    mappedData.forEach((item) => {
      // Convert IndentDate to a Date object for accurate sorting
      item.IndentDate = new Date(item.IndentDate);
    });

    // Sort mappedData by IndentDate in descending order
    mappedData.sort((a, b) => {
      return b.IndentDate - a.IndentDate; // Sort in descending order
    });

    // Check if any mapped data found
    if (mappedData.length === 0) {
      return res.status(404).send({ message: "No mapped data found." });
    }

    // Check if any mapped data found
    if (mappedData.length === 0) {
      return res.status(404).send({ message: "No mapped data found." });
    }

    // Return mapped data in the response
    return res.status(200).json(mappedData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      console.error("Database error:", error);
      return res.status(500).json({
        message: "Database error occurred while retrieving BranchTransfers.",
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
        message: "Validation error occurred while retrieving BranchTransfers.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeTimeoutError") {
      console.error("Timeout error:", error);
      return res.status(504).json({
        message: "Request timeout while retrieving BranchTransfers.",
        details: error.message,
      });
    }
    console.error("Error occurred while updating Branch Transfer Data:", error);
    res.status(500).send({
      message:
        "Internal server error occurred while updating Branch Transfer Data.",
      details: error.message, // Sending the error message for debugging purposes
    });
  }
};

// Old Working Gen EWB Number without otp GEN
// exports.updateByGenEWB = async (req, res) => {
//   try {
//     const indentID = req.body.IndentID;
//     console.log("Indent ID: ", indentID);
//     const branchTransferData = await BranchTransfer.findOne({
//       where: { IndentID: indentID },
//       include: [
//         {
//           model: BranchMaster,
//           as: "BTFromBranchID",
//         },
//         {
//           model: BranchMaster,
//           as: "BTToBranchID",
//         },
//       ],
//     });
//     console.log("branch Transfer Data:", branchTransferData);
//     if (!branchTransferData || branchTransferData.length === 0) {
//       // If no data found, send a 404 response
//       return res
//         .status(404)
//         .send({ message: `No Branch Transfer found with ID = ${indentID}.` });
//     }

//     // Create an empty JSON object with the specified structure
//     const ewbJson = {
//       supplyType: "O",
//       subSupplyType: "5",
//       DocType: "CHL",
//       docNo: "",
//       docDate: "",
//       fromGstin: "",
//       actFromStateCode: "",
//       actToStateCode: "",
//       totInvValue: "",
//       fromTrdName: "VARUN MOTORS PVT LTD",
//       fromAddr1: "",
//       fromAddr2: "",
//       fromPlace: "",
//       fromPincode: "",
//       fromStateCode: "",
//       toGstin: "",
//       toTrdName: "VARUN MOTORS PVT LTD",
//       toAddr1: "",
//       toAddr2: "",
//       toPlace: "",
//       toPincode: "",
//       toStateCode: "",
//       transactionType: "1",
//       totalValue: "",
//       cgstValue: "",
//       sgstValue: "",
//       igstValue: "",
//       cessValue: "",
//       transporterName: "",
//       transporterId: "",
//       transDocNo: "",
//       transMode: "1",
//       transDocDate: "",
//       transDistance: "",
//       vehicleType: "r",
//       vehicleNo: "",
//       ItemList: [
//         {
//           productName: "VEHICLE",
//           hsnCode: "",
//           qtyUnit: "NOS",
//           quantity: 1,
//           cgstRate: "",
//           sgstRate: "",
//           igstRate: "",
//           cessRate: "",
//           cessAdvol: 0,
//         },
//       ],
//     };

//     ewbJson.docNo = branchTransferData.DCNo;
//     ewbJson.docDate = formatDate(branchTransferData.DCDate);
//     ewbJson.fromGstin = branchTransferData.BTFromBranchID.GSTIN;
//     ewbJson.toGstin = branchTransferData.BTToBranchID.GSTIN;
//     ewbJson.actFromStateCode =
//       branchTransferData.BTFromBranchID.GSTIN.substring(0, 2);
//     ewbJson.actToStateCode = branchTransferData.BTToBranchID.GSTIN.substring(
//       0,
//       2
//     );
//     ewbJson.fromAddr1 = branchTransferData.BTFromBranchID.Address;
//     ewbJson.fromAddr2 = branchTransferData.BTFromBranchID.District;
//     ewbJson.fromPlace = branchTransferData.BTFromBranchID.District;
//     ewbJson.fromPincode = branchTransferData.BTFromBranchID.PINCode;
//     ewbJson.toAddr1 = branchTransferData.BTToBranchID.Address;
//     ewbJson.toAddr2 = branchTransferData.BTToBranchID.District;
//     ewbJson.toPlace = branchTransferData.BTToBranchID.District;
//     ewbJson.toPincode = branchTransferData.BTToBranchID.PINCode;
//     ewbJson.fromStateCode = parseInt(
//       branchTransferData.BTFromBranchID.GSTIN.substring(0, 2),
//       10
//     );
//     ewbJson.toStateCode = parseInt(
//       branchTransferData.BTToBranchID.GSTIN.substring(0, 2),
//       10
//     );
//     ewbJson.transDistance = req.body.TravelDist;
//     ewbJson.vehicleNo = req.body.VehicleNo;
//     if (ewbJson.actFromStateCode == ewbJson.actToStateCode) {
//       ewbJson.cgstValue = 0;
//       ewbJson.sgstValue = 0;
//       ewbJson.igstValue = 0;
//       ewbJson.cessValue = 0;
//       ewbJson.ItemList[0].igstRate = 0;
//     }
//     const vehicleStockData = await VehicleStock.findOne({
//       where: { PurchaseID: branchTransferData.PurchaseID },
//     });
//     ewbJson.totInvValue = vehicleStockData.TaxableValue;
//     ewbJson.totalValue = vehicleStockData.TaxableValue;
//     const skuData = await SKUMaster.findOne({
//       where: { SKUCode: vehicleStockData.SKUCode },
//     });
//     const igstRate = skuData.IGSTRate;
//     if (ewbJson.actFromStateCode == ewbJson.actToStateCode) {
//       ewbJson.ItemList[0].cgstRate = igstRate / 2;
//       ewbJson.ItemList[0].sgstRate = igstRate / 2;
//       // ewbJson.ItemList.igstRate = 0;
//       ewbJson.ItemList[0].cessRate = skuData.CESSRate;
//       ewbJson.ItemList[0].hsnCode = skuData.HSNCode;
//     }

//     // ewbJson.quantity = ;
//     console.log("ewb json data: ", ewbJson);

//     const ewbResponseData = await generateEwayBill(ewbJson);
//     console.log("response EWB details: ", ewbResponseData);

//     // Map the fields from request body to Transfer Data
//     branchTransferData.EWBNo = ewbResponseData.Data.ewayBillNo || null;
//     branchTransferData.EWBDate =
//       convertTimestamp(ewbResponseData.Data.ewayBillDate) || null;
//     branchTransferData.EWBValidUpto =
//       convertTimestamp(ewbResponseData.Data.validUpto) || null;

//     branchTransferData.VehicleNo = req.body.VehicleNo || null;

//     // const formattedEWBDate = convertTimestamp(ewbResponseData.ewayBillDate);
//     // branchTransferData.EWBDate = formattedEWBDate || null;
//     // const formattedEWBValidUpto = convertTimestamp(ewbResponseData.validUpto);
//     // branchTransferData.EWBValidUpto = formattedEWBValidUpto || null;

//     // save the Transfer list with the updated fields
//     const updatedBranchTransferData = await branchTransferData.save();
//     console.log(
//       "Generated EWB has been updated in Branch Transfer Table successfully"
//     );

//     // Send the enriched data in the response
//     return res.status(200).json(updatedBranchTransferData);
//   } catch (error) {
//     // Handle errors based on specific types
//     if (error.name === "SequelizeDatabaseError") {
//       console.error("Database error:", error);
//       return res.status(500).json({
//         message: "Database error occurred while updating Branch Transfer Data.",
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
//         message:
//           "Validation error occurred while updating Branch Transfer Data.",
//         details: error.message,
//       });
//     }

//     if (error.name === "SequelizeTimeoutError") {
//       console.error("Timeout error:", error);
//       return res.status(504).json({
//         message: "Request timeout while updating Branch Transfer Data.",
//         details: error.message,
//       });
//     }

//     console.error("Error occurred while updating Branch Transfer Data:", error);
//     res.status(500).send({
//       message:
//         "Internal server error occurred while updating Branch Transfer Data.",
//       error: error.message, // Sending the error message for debugging purposes
//     });
//   }
// };
