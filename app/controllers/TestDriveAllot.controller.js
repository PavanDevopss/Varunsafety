/* eslint-disable no-dupe-keys */
/* eslint-disable no-unused-vars */
require("dotenv").config();
const db = require("../models");
const TestDriveAllot = db.testdriveallot;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;
const TestDrive = db.testdrive;
const BranchMaster = db.branchmaster;
const UserMaster = db.usermaster;
const ModelMaster = db.modelmaster;
const FuelType = db.fueltypes;
const Transmission = db.transmission;

// Basic CRUD API
// Create and Save a new TestDriveAllot
exports.create = async (req, res) => {
  try {
    // Validate if TestDriveID is unique
    const existingTestDrive = await TestDriveAllot.findOne({
      where: { TestDriveID: req.body.TestDriveID },
    });

    if (existingTestDrive) {
      return res.status(400).json({
        message:
          "TestDriveID must be unique. A record with this TestDriveID already exists.",
      });
    }

    // Create a TestDriveAllot
    const testDriveAllot = {
      TestDriveID: req.body.TestDriveID,
      BranchID: req.body.BranchID,
      AssignedBy: req.body.AssignedBy || null,
      VehicleRegNo: req.body.VehicleRegNo,
      ScheduleDate: req.body.ScheduleDate,
      ScheduleTime: req.body.ScheduleTime,
      TripStartTime: req.body.TripStartTime || null,
      OdometerStartReading: req.body.OdometerStartReading || null,
      TripEndTime: req.body.TripEndTime || null,
      OdometerEndReading: req.body.OdometerEndReading || null,
      Remarks: req.body.Remarks,
      AllotStatus: req.body.AllotStatus,
      IsActive: req.body.IsActive || true,
      Status: req.body.Status || "Active",
    };

    // Save TestDriveAllot in the database
    const newTestDriveAllot = await TestDriveAllot.create(testDriveAllot);

    // Update corresponding TestDrive record
    if (req.body.AllotStatus) {
      const testDrive = await TestDrive.findByPk(req.body.TestDriveID);

      if (testDrive) {
        // Map AllotStatus to RequestStatus
        const statusMapping = {
          Assigned: "Assigned",
          Rejected: "Rejected",
          Cancelled: "Cancelled",
          Completed: "Completed",
        };

        const newRequestStatus = statusMapping[req.body.AllotStatus];

        if (newRequestStatus) {
          testDrive.RequestStatus = newRequestStatus;
          testDrive.ModifiedDate = new Date();

          // Save the updated TestDrive
          await testDrive.save();
        }
      }
    }

    return res.status(201).json(newTestDriveAllot); // Send the newly created TestDriveAllot as response
  } catch (err) {
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

    console.error("Error creating TestDriveAllot:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Retrieve all TestDriveAllots from the database.
exports.findAll = async (req, res) => {
  try {
    const { UserID, BranchID } = req.query;

    const testDriveCondition = {
      ...(UserID ? { UserID } : {}),
      ...(BranchID ? { BranchID } : {}),
    };

    const testDriveAllot = await TestDriveAllot.findAll({
      attributes: [
        "TestDriveAllotID",
        "TestDriveID",
        "BranchID",
        "AssignedBy",
        "VehicleRegNo",
        "ScheduleDate",
        "ScheduleTime",
        "TripStartTime",
        "OdometerStartReading",
        "TripEndTime",
        "OdometerEndReading",
        "Remarks",
        "AllotStatus",
        "IsActive",
        "Status",
        "CreatedDate",
      ],
      include: [
        {
          model: BranchMaster,
          as: "TDABranchID",
          attributes: ["BranchName"],
        },
        {
          model: TestDrive,
          as: "TDATestDriveID",
          attributes: [
            "RequestNo",
            "FirstName",
            "LastName",
            "PhoneNo",
            "Title",
            "ModelMasterID",
            "FuelTypeID",
            "TransmissionID",
            "UserID",
            "BranchID",
            "RequestStatus",
          ],
          where: testDriveCondition, // Apply query conditions here
          include: [
            {
              model: UserMaster,
              as: "TDUserID",
              attributes: ["UserID", "UserName", "EmpID"],
            },
            {
              model: BranchMaster,
              as: "TDBranchID",
              attributes: ["BranchID", "BranchName"],
            },
            {
              model: ModelMaster,
              as: "TDModelMasterID",
              attributes: ["ModelMasterID", "ModelCode", "ModelDescription"],
            },
            {
              model: FuelType,
              as: "TDFuelTypeID",
              attributes: ["FuelTypeID", "FuelTypeName", "FuelCode"],
            },
            {
              model: Transmission,
              as: "TDTransmissionID",
              attributes: [
                "TransmissionID",
                "TransmissionDescription",
                "TransmissionCode",
              ],
            },
          ],
        },
      ],
      order: [["CreatedDate", "DESC"]],
    });

    if (!testDriveAllot || testDriveAllot.length === 0) {
      return res
        .status(404)
        .json({ message: "No test drive allot data found." });
    }

    const combinedData = testDriveAllot.map((item) => ({
      TestDriveAllotID: item.TestDriveAllotID,
      TestDriveID: item.TestDriveID,
      AssignedBy: item.AssignedBy,
      BranchID: item.BranchID,
      BranchName: item.TDABranchID?.BranchName || null,
      VehicleRegNo: item.VehicleRegNo,
      ScheduleDate: item.ScheduleDate,
      ScheduleTime: item.ScheduleTime,
      TripStartTime: item.TripStartTime,
      OdometerStartReading: item.OdometerStartReading,
      TripEndTime: item.TripEndTime,
      OdometerEndReading: item.OdometerEndReading,
      Remarks: item.Remarks,
      AllotStatus: item.AllotStatus,
      IsActive: item.IsActive,
      Status: item.Status,
      CreatedDate: item.CreatedDate,

      // TestDrive Details
      RequestNo: item.TDATestDriveID?.RequestNo || null,
      FirstName: item.TDATestDriveID?.FirstName || null,
      LastName: item.TDATestDriveID?.LastName || null,
      PhoneNo: item.TDATestDriveID?.PhoneNo || null,
      Title: item.TDATestDriveID?.Title || null,
      RequestStatus: item.TDATestDriveID?.RequestStatus || null,

      // Branch Details
      TestDriveBranchName: item.TDATestDriveID?.TDBranchID?.BranchName || null,
      TestDriveBranchID: item.TDATestDriveID?.TDBranchID?.BranchID || null,

      // User Details
      UserID: item.TDATestDriveID?.TDUserID?.UserID || null,
      UserName: item.TDATestDriveID?.TDUserID?.UserName || null,
      EmpID: item.TDATestDriveID?.TDUserID?.EmpID || null,

      // ModelMaster Details
      ModelMasterID:
        item.TDATestDriveID?.TDModelMasterID?.ModelMasterID || null,
      ModelCode: item.TDATestDriveID?.TDModelMasterID?.ModelCode || null,
      ModelDescription:
        item.TDATestDriveID?.TDModelMasterID?.ModelDescription || null,

      // FuelType Details
      FuelTypeID: item.TDATestDriveID?.TDFuelTypeID?.FuelTypeID || null,
      FuelTypeName: item.TDATestDriveID?.TDFuelTypeID?.FuelTypeName || null,
      FuelCode: item.TDATestDriveID?.TDFuelTypeID?.FuelCode || null,

      // Transmission Details
      TransmissionID:
        item.TDATestDriveID?.TDTransmissionID?.TransmissionID || null,
      TransmissionDescription:
        item.TDATestDriveID?.TDTransmissionID?.TransmissionDescription || null,
      TransmissionCode:
        item.TDATestDriveID?.TDTransmissionID?.TransmissionCode || null,
    }));

    res.json(combinedData);
  } catch (error) {
    console.error("Error retrieving test drive allot data:", error);
    return res.status(500).json({
      message:
        "Failed to retrieve test drive allot data. Please try again later.",
    });
  }
};

// Find a single TestDriveAllot with an id
exports.findOne = async (req, res) => {
  try {
    const testDriveID = req.query.TestDriveID; // Fix parameter name

    // Validate the ID parameter
    if (!testDriveID) {
      return res.status(400).json({
        message: "TestDriveID parameter is required.",
      });
    }

    const testDriveAllot = await TestDriveAllot.findOne({
      where: { TestDriveID: testDriveID },
      attributes: [
        "TestDriveAllotID",
        "TestDriveID",
        "BranchID",
        "AssignedBy",
        "VehicleRegNo",
        "ScheduleDate",
        "ScheduleTime",
        "TripStartTime",
        "OdometerStartReading",
        "TripEndTime",
        "OdometerEndReading",
        "Remarks",
        "AllotStatus",
      ],
      include: [
        {
          model: BranchMaster,
          as: "TDABranchID",
          attributes: ["BranchName"],
        },
      ],
    });

    // Check if the record was found
    if (!testDriveAllot) {
      return res.status(404).json({
        message: "No test drive allot data found for the given TestDriveID.",
      });
    }

    // Send the single record as a response
    res.json(testDriveAllot);
  } catch (error) {
    // Handle specific database errors
    if (error.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message:
          "Database error occurred while retrieving test drive allot data.",
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
    console.error("Error retrieving test drive allot data:", error);
    return res.status(500).json({
      message:
        "Failed to retrieve test drive allot data. Please try again later.",
    });
  }
};

// Update a TestDriveAllot by the id in the request
exports.updateByPk = async (req, res) => {
  try {
    // Find the TestDriveAllot by ID
    const testDriveAllotID = req.params.id;

    // Validate the ID parameter
    if (!testDriveAllotID) {
      return res.status(400).json({ message: "ID parameter is required." });
    }

    let testDriveAllot = await TestDriveAllot.findByPk(testDriveAllotID);

    if (!testDriveAllot) {
      return res.status(404).json({ message: "TestDriveAllot not found" });
    }

    // Update fields in TestDriveAllot
    testDriveAllot.BranchID = req.body.BranchID || testDriveAllot.BranchID;
    testDriveAllot.AssignedBy =
      req.body.AssignedBy || testDriveAllot.AssignedBy;
    testDriveAllot.VehicleRegNo =
      req.body.VehicleRegNo || testDriveAllot.VehicleRegNo;
    testDriveAllot.ScheduleTime =
      req.body.ScheduleTime || testDriveAllot.ScheduleTime;
    testDriveAllot.ScheduleDate =
      req.body.ScheduleDate || testDriveAllot.ScheduleDate;
    testDriveAllot.TripStartTime =
      req.body.TripStartTime || testDriveAllot.TripStartTime;
    testDriveAllot.OdometerStartReading =
      req.body.OdometerStartReading || testDriveAllot.OdometerStartReading;
    testDriveAllot.TripEndTime =
      req.body.TripEndTime || testDriveAllot.TripEndTime;
    testDriveAllot.OdometerEndReading =
      req.body.OdometerEndReading || testDriveAllot.OdometerEndReading;
    testDriveAllot.Remarks = req.body.Remarks || testDriveAllot.Remarks;
    testDriveAllot.AllotStatus =
      req.body.AllotStatus || testDriveAllot.AllotStatus;
    testDriveAllot.IsActive = req.body.IsActive || testDriveAllot.IsActive;
    testDriveAllot.Status = req.body.Status || testDriveAllot.Status;
    testDriveAllot.ModifiedDate = new Date();

    // Save updated TestDriveAllot
    const updatedTestDriveAllot = await testDriveAllot.save();

    // Update corresponding TestDrive record
    if (req.body.AllotStatus) {
      const testDrive = await TestDrive.findByPk(testDriveAllot.TestDriveID);

      if (testDrive) {
        // Map AllotStatus to RequestStatus
        const statusMapping = {
          Assigned: "Assigned",
          Rejected: "Rejected",
          Cancelled: "Cancelled",
          Completed: "Completed",
        };

        const newRequestStatus = statusMapping[req.body.AllotStatus];

        if (newRequestStatus) {
          testDrive.RequestStatus = newRequestStatus;
          testDrive.ModifiedDate = new Date();

          // Save the updated TestDrive
          await testDrive.save();
        }
      }
    }

    return res.status(200).json(updatedTestDriveAllot);
  } catch (err) {
    // Handle errors based on specific types
    if (err.name === "SequelizeValidationError") {
      return res.status(400).json({
        message: "Validation error",
        details: err.errors.map((e) => e.message),
      });
    }

    if (err.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message: "Database error occurred while updating TestDriveAllot.",
        details: err.message,
      });
    }

    if (err.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: err.message,
      });
    }

    console.error("Error updating TestDriveAllot:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a TestDriveAllot with the specified id in the request
exports.deleteById = async (req, res) => {
  const id = req.params.id;

  try {
    // Validate the ID parameter
    if (!id) {
      return res.status(400).json({ message: "ID parameter is required." });
    }

    // Find the model by ID
    const testDriveAllot = await TestDriveAllot.findByPk(id);

    // Check if the model exists
    if (!testDriveAllot) {
      return res
        .status(404)
        .json({ message: "TestDriveAllot not found with id: " + id });
    }

    // Delete the model
    await testDriveAllot.destroy();

    // Send a success message
    res.status(200).json({
      message: "TestDriveAllot with id: " + id + " deleted successfully",
    });
  } catch (err) {
    // Handle errors based on specific types
    if (err.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while deleting TestDriveAllot.",
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
    console.error("Error deleting TestDriveAllot:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
