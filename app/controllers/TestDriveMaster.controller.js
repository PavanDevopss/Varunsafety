/* eslint-disable no-unused-vars */
const db = require("../models");
const TestDriveMaster = db.testdrivemaster;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;
const ModelMaster = db.modelmaster;
const VariantMaster = db.variantmaster;
const FuelType = db.fueltypes;
const Transmission = db.transmission;
const ColourMaster = db.colourmaster;
const BranchMaster = db.branchmaster;
const TestDriveMasterDocments = db.testdrivemasterdocuments;
const DocumentTypes = db.documenttypes;

// Basic CRUD API
// Create and Save a new TestDriveMaster
exports.create = async (req, res) => {
  try {
    // Validate if TestDriveID is unique
    const existingTestDrive = await TestDriveMaster.findOne({
      where: { VehicleRegNo: req.body.VehicleRegNo },
    });

    if (existingTestDrive) {
      return res.status(400).json({
        message:
          "VehicleRegNo must be unique. A record with this VehicleRegNo already exists.",
      });
    }
    // Create a new TestDriveMaster
    const newTestDriveMaster = await TestDriveMaster.create({
      BranchID: req.body.BranchID,
      VehicleRegNo: req.body.VehicleRegNo,
      ModelMasterID: req.body.ModelMasterID,
      ModelDescription: req.body.ModelDescription,
      VariantID: req.body.VariantID,
      FuelTypeID: req.body.FuelTypeID,
      KeyNumber: req.body.KeyNumber,
      TransmissionID: req.body.TransmissionID,
      ColourID: req.body.ColourID,
      ColourDescription: req.body.ColourDescription,
      ChassisNumber: req.body.ChassisNumber,
      EngineNumber: req.body.EngineNumber,
      InsuranceID: req.body.InsuranceID,
      ValidFrom: req.body.ValidFrom,
      ValidTo: req.body.ValidTo,
      PollutionValidFrom: req.body.PollutionValidFrom,
      PollutionValidTo: req.body.PollutionValidTo,
      IsActive: req.body.IsActive || true,
      Status: req.body.Status || "Active",
    });

    // Save TestDriveMaster in database
    console.log("New TestDriveMaster created:", newTestDriveMaster);

    return res.status(201).json(newTestDriveMaster); // Send the newly created TestDriveMaster as response
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
        message: "Database error occurred while creating TestDriveMaster.",
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

    console.error("Error creating TestDriveMaster:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Retrieve all OEMMasters from the database.
exports.findAll = async (req, res) => {
  try {
    const testDriveMasterData = await TestDriveMaster.findAll({
      attributes: [
        "TestDriveMasterID",
        "BranchID",
        "VehicleRegNo",
        "ModelMasterID",
        "ModelDescription",
        "VariantID",
        "FuelTypeID",
        "KeyNumber",
        "TransmissionID",
        "ColourID",
        "ColourDescription",
        "ChassisNumber",
        "EngineNumber",
        "InsuranceID",
        "ValidFrom",
        "ValidTo",
        "PollutionValidFrom",
        "PollutionValidTo",
        "IsActive",
        "Status",
      ],
      include: [
        {
          model: BranchMaster,
          as: "TDMBranchID",
          attributes: ["BranchName"],
        },
        {
          model: VariantMaster,
          as: "TDMVariantID",
          attributes: ["VariantCode"],
        },
        {
          model: Transmission,
          as: "TDMTransmissionID",
          attributes: ["TransmissionCode", "TransmissionDescription"],
        },
        {
          model: FuelType,
          as: "TDMFuelTypeID",
          attributes: ["FuelTypeName"],
        },
        {
          model: ModelMaster,
          as: "TDMModelMasterID",
          attributes: ["ModelCode"],
        },
        {
          model: ColourMaster,
          as: "TDMColourID",
          attributes: ["ColourCode"],
        },
      ],
      order: [["CreatedDate", "DESC"]],
    });

    // Check if data is empty
    if (!testDriveMasterData || testDriveMasterData.length === 0) {
      return res.status(404).json({
        message: "No testDriveMasterData data found.",
      });
    }

    // Map the data for response
    const combinedData = testDriveMasterData.map((item) => ({
      TestDriveMasterID: item.TestDriveMasterID,
      BranchID: item.BranchID,
      BranchName: item.TDMBranchID ? item.TDMBranchID.BranchName : null,
      VehicleRegNo: item.VehicleRegNo,
      ModelMasterID: item.ModelMasterID,
      ModelCode: item.TDMModelMasterID ? item.TDMModelMasterID.ModelCode : null,

      ModelDescription: item.ModelDescription,
      VariantID: item.VariantID,
      VariantCode: item.TDMVariantID ? item.TDMVariantID.VariantCode : null,

      FuelTypeID: item.FuelTypeID,
      FuelTypeName: item.TDMFuelTypeID ? item.TDMFuelTypeID.FuelTypeName : null,

      KeyNumber: item.KeyNumber,
      TransmissionID: item.TransmissionID,
      TransmissionCode: item.TDMTransmissionID
        ? item.TDMTransmissionID.TransmissionCode
        : null,
      TransmissionDescription: item.TDMTransmissionID
        ? item.TDMTransmissionID.TransmissionDescription
        : null,

      ColourID: item.ColourID,
      ColourCode: item.TDMColourID ? item.TDMColourID.ColourCode : null,

      ColourDescription: item.ColourDescription,
      ChassisNumber: item.ChassisNumber,
      EngineNumber: item.EngineNumber,
      InsuranceID: item.InsuranceID,
      ValidFrom: item.ValidFrom,
      ValidTo: item.ValidTo,
      PollutionValidFrom: item.PollutionValidFrom,
      PollutionValidTo: item.PollutionValidTo,
      IsActive: item.IsActive,
      Status: item.Status,
    }));

    // Send the combined data as response
    res.json(combinedData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message:
          "Database error occurred while retrieving test drive master  data.",
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
    console.error("Error retrieving test drive master  data:", error);
    res.status(500).json({
      message:
        "Failed to retrieve test drive master  data. Please try again later.",
    });
  }
};

// Find a single TestDriveMaster with an id
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;

    // Fetch TestDriveMaster data
    const testDriveMasterData = await TestDriveMaster.findOne({
      where: { TestDriveMasterID: id },
      attributes: [
        "TestDriveMasterID",
        "BranchID",
        "VehicleRegNo",
        "ModelMasterID",
        "ModelDescription",
        "VariantID",
        "FuelTypeID",
        "KeyNumber",
        "TransmissionID",
        "ColourID",
        "ColourDescription",
        "ChassisNumber",
        "EngineNumber",
        "InsuranceID",
        "ValidFrom",
        "ValidTo",
        "PollutionValidFrom",
        "PollutionValidTo",
        "IsActive",
        "Status",
      ],
      include: [
        {
          model: BranchMaster,
          as: "TDMBranchID",
          attributes: ["BranchName"],
        },
        {
          model: VariantMaster,
          as: "TDMVariantID",
          attributes: ["VariantCode"],
        },
        {
          model: Transmission,
          as: "TDMTransmissionID",
          attributes: ["TransmissionCode", "TransmissionDescription"],
        },
        {
          model: FuelType,
          as: "TDMFuelTypeID",
          attributes: ["FuelTypeName"],
        },
        {
          model: ModelMaster,
          as: "TDMModelMasterID",
          attributes: ["ModelCode"],
        },
        {
          model: ColourMaster,
          as: "TDMColourID",
          attributes: ["ColourCode"],
        },
      ],
    });

    // Check if TestDriveMaster data is found
    if (!testDriveMasterData) {
      return res.status(404).json({
        message: "No TestDriveMaster data found.",
      });
    }

    // Fetch related documents
    const testDriveMasterDocuments = await TestDriveMasterDocments.findAll({
      where: { TestDriveMasterID: id },
      attributes: ["DocTypeID", "DocURL"],
      include: [
        {
          model: DocumentTypes,
          as: "TDMDDocTypeID",
          attributes: ["DocumentAs", "Doctype"],
        },
      ],
    });

    // Map the documents data
    const documentData = testDriveMasterDocuments.map((doc) => ({
      DocTypeID: doc.DocTypeID,
      DocURL: doc.DocURL,
      DocumentAs: doc.TDMDDocTypeID ? doc.TDMDDocTypeID.DocumentAs : null,
      Doctype: doc.TDMDDocTypeID ? doc.TDMDDocTypeID.Doctype : null,
    }));

    // Prepare the response data
    const responseData = {
      TestDriveMasterID: testDriveMasterData.TestDriveMasterID,
      BranchID: testDriveMasterData.BranchID,
      BranchName: testDriveMasterData.TDMBranchID
        ? testDriveMasterData.TDMBranchID.BranchName
        : null,
      VehicleRegNo: testDriveMasterData.VehicleRegNo,
      ModelMasterID: testDriveMasterData.ModelMasterID,
      ModelDescription: testDriveMasterData.ModelDescription,
      ModelCode: testDriveMasterData.TDMModelMasterID
        ? testDriveMasterData.TDMModelMasterID.ModelCode
        : null,
      VariantID: testDriveMasterData.VariantID,
      VariantCode: testDriveMasterData.TDMVariantID
        ? testDriveMasterData.TDMVariantID.VariantCode
        : null,
      FuelTypeID: testDriveMasterData.FuelTypeID,
      FuelTypeName: testDriveMasterData.TDMFuelTypeID
        ? testDriveMasterData.TDMFuelTypeID.FuelTypeName
        : null,
      KeyNumber: testDriveMasterData.KeyNumber,
      TransmissionID: testDriveMasterData.TransmissionID,
      TransmissionCode: testDriveMasterData.TDMTransmissionID
        ? testDriveMasterData.TDMTransmissionID.TransmissionCode
        : null,
      TransmissionDescription: testDriveMasterData.TDMTransmissionID
        ? testDriveMasterData.TDMTransmissionID.TransmissionDescription
        : null,
      ColourID: testDriveMasterData.ColourID,
      ColourCode: testDriveMasterData.TDMColourID
        ? testDriveMasterData.TDMColourID.ColourCode
        : null,
      ColourDescription: testDriveMasterData.ColourDescription,
      ChassisNumber: testDriveMasterData.ChassisNumber,
      EngineNumber: testDriveMasterData.EngineNumber,
      InsuranceID: testDriveMasterData.InsuranceID,
      ValidFrom: testDriveMasterData.ValidFrom,
      ValidTo: testDriveMasterData.ValidTo,
      PollutionValidFrom: testDriveMasterData.PollutionValidFrom,
      PollutionValidTo: testDriveMasterData.PollutionValidTo,
      IsActive: testDriveMasterData.IsActive,
      Status: testDriveMasterData.Status,
      Documents: documentData, // Use mapped document data
    };

    // Send the response data
    res.json(responseData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message:
          "Database error occurred while retrieving TestDriveMaster data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    console.error("Error retrieving TestDriveMaster data:", error);
    res.status(500).json({
      message:
        "Failed to retrieve TestDriveMaster data. Please try again later.",
    });
  }
};

// Update a TestDriveMaster by the id in the request
exports.updateByPk = async (req, res) => {
  try {
    const id = req.params.id; // Get TestDriveMasterID from request params
    // Fetch the TestDriveMaster by ID
    const testDriveMaster = await TestDriveMaster.findByPk(id);

    if (!testDriveMaster) {
      return res.status(404).json({ message: "TestDriveMaster not found" });
    }

    // Update fields based on request body
    const updatedFields = {
      BranchID: req.body.BranchID || testDriveMaster.BranchID,
      VehicleRegNo: req.body.VehicleRegNo || testDriveMaster.VehicleRegNo,
      ModelMasterID: req.body.ModelMasterID || testDriveMaster.ModelMasterID,
      ModelDescription:
        req.body.ModelDescription || testDriveMaster.ModelDescription,
      VariantID: req.body.VariantID || testDriveMaster.VariantID,
      FuelTypeID: req.body.FuelTypeID || testDriveMaster.FuelTypeID,
      KeyNumber: req.body.KeyNumber || testDriveMaster.KeyNumber,
      TransmissionID: req.body.TransmissionID || testDriveMaster.TransmissionID,
      ColourID: req.body.ColourID || testDriveMaster.ColourID,
      ColourDescription:
        req.body.ColourDescription || testDriveMaster.ColourDescription,
      ChassisNumber: req.body.ChassisNumber || testDriveMaster.ChassisNumber,
      EngineNumber: req.body.EngineNumber || testDriveMaster.EngineNumber,
      InsuranceID: req.body.InsuranceID || testDriveMaster.InsuranceID,
      ValidFrom: req.body.ValidFrom || testDriveMaster.ValidFrom,
      ValidTo: req.body.ValidTo || testDriveMaster.ValidTo,
      PollutionValidFrom:
        req.body.PollutionValidFrom || testDriveMaster.PollutionValidFrom,
      PollutionValidTo:
        req.body.PollutionValidTo || testDriveMaster.PollutionValidTo,
      IsActive:
        req.body.IsActive !== undefined
          ? req.body.IsActive
          : testDriveMaster.IsActive,
      Status: req.body.Status || testDriveMaster.Status,
    };

    // Update the TestDriveMaster record
    await testDriveMaster.update(updatedFields);

    return res.status(200).json({
      message: "TestDriveMaster updated successfully",
      data: testDriveMaster,
    });
  } catch (error) {
    console.error("Error updating TestDriveMaster:", error);

    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        message: "Validation error occurred",
        details: error.errors.map((err) => err.message),
      });
    }

    return res.status(500).json({
      message: "Internal server error",
      details: error.message,
    });
  }
};

// Delete a TestDriveMaster with the specified id in the request
exports.deleteById = async (req, res) => {
  const id = req.params.id;

  try {
    // Find the model by ID
    const testDriveMaster = await TestDriveMaster.findByPk(id);

    // Check if the model exists
    if (!testDriveMaster) {
      return res
        .status(404)
        .json({ message: "TestDriveMaster not found with id: " + id });
    }

    // Delete the model
    await testDriveMaster.destroy();

    // Send a success message
    res.status(200).json({
      message: "TestDriveMaster with id: " + id + " deleted successfully",
    });
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
        message: "Database error occurred while updating TestDriveMaster.",
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
    console.error("Error deleting TestDriveMaster:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
