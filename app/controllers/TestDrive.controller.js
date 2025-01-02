/* eslint-disable no-dupe-keys */
/* eslint-disable no-unused-vars */
require("dotenv").config();
const db = require("../models");
const TestDrive = db.testdrive;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;
const BranchMaster = db.branchmaster;
const CustomerMaster = db.customermaster;
const UserMaster = db.usermaster;
const ModelMaster = db.modelmaster;
const FuelType = db.fueltypes;
const Transmission = db.transmission;
const RegionMaster = db.regionmaster;
const StateMaster = db.statemaster;
const TestDriveDocument = db.testdrivedocument;
const TestDriveAllot = db.testdriveallot;
const fs = require("fs");
const path = require("path");
const { validationResult } = require("express-validator");
const { configureMulter } = require("../Utils/multerService");
const { transferImageToServer } = require("../Utils/sshService");
const { generateRequestNo } = require("../Utils/generateService");
const { genDocTestDriveDocName } = require("../Utils/generateService");

// Configure Multer
const upload = configureMulter(
  // "C:/Users/varun/OneDrive/Desktop/uploads/", // Adjust the upload path as needed
  "/home/administrator/VARUNGROUP/IMAGES_VMS_MARUTI",
  // "C:\\Users\\itvsp\\Desktop\\Uploads",
  1000000, // File size limit (1MB)
  ["jpeg", "jpg", "png", "gif"], // Allowed file types
  "TestDriveDocURL"
);

// Basic CRUD API
// exports.create = async (req, res) => {
//   upload(req, res, async (err) => {
//     if (err) {
//       console.error("Error uploading file:", err);
//       return res.status(400).json({ message: err.message });
//     }

//     try {
//       // Validate request
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//         return res.status(400).json({ errors: errors.array() });
//       }

//       // Extract fields from the request
//       const {
//         CustomerID,
//         UserID,
//         BranchID,
//         TestDriveEmpID,
//         IsActive,
//         Status,
//         DocTypeID,
//         DemoEmpID, // Include DemoEmpID for validation
//       } = req.body;

//       if (!UserID || !BranchID || !DocTypeID) {
//         return res
//           .status(400)
//           .json({ message: "UserID, BranchID, and DocTypeID are required" });
//       }
//       let demoName = req.body.DemoName;
//       // Validate DemoEmpID in UserMaster
//       if (DemoEmpID) {
//         const user = await UserMaster.findOne({ where: { EmpID: DemoEmpID } });
//         if (!user) {
//           return res
//             .status(404)
//             .json({ message: "DemoEmpID does not exist in UserMaster" });
//         }
//         demoName = user.UserName || demoName;
//       }

//       // Generate RequestNo
//       const RequestNo = await generateRequestNo();

//       // Prepare TestDrive data
//       const testDriveData = {
//         RequestNo,
//         CustomerID: CustomerID || null,
//         UserID,
//         BranchID,
//         Title: req.body.Title,
//         FirstName: req.body.FirstName,
//         LastName: req.body.LastName,
//         PhoneNo: req.body.PhoneNo,
//         Email: req.body.Email,
//         Gender: req.body.Gender,
//         DateOfBirth: req.body.DateOfBirth,
//         Occupation: req.body.Occupation,
//         Address: req.body.Address,
//         OffAddress: req.body.OffAddress,
//         PINCode: req.body.PINCode,
//         DistrictID: req.body.DistrictID,
//         StateID: req.body.StateID,
//         AadharNumber: req.body.AadharNumber,
//         ModelMasterID: req.body.ModelMasterID,
//         FuelTypeID: req.body.FuelTypeID,
//         TransmissionID: req.body.TransmissionID,
//         DemoEmpID: DemoEmpID, // Assign DemoEmpID
//         DemoName: demoName,
//         TestDriveBy: req.body.TestDriveBy,
//         TestDriveEmpID: TestDriveEmpID || null,
//         TestDriveName: req.body.TestDriveName,
//         DrivingLicense: req.body.DrivingLicense,
//         RequestStatus: req.body.RequestStatus || "Pending",
//         RequestedBy: req.body.RequestedBy,
//         AssignedBy: req.body.AssignedBy || null,
//         IsActive: req.body.IsActive || true,
//         Status: req.body.Status || "Active",
//         DocTypeID: DocTypeID,
//       };

//       // Save TestDrive record
//       const newTestDrive = await TestDrive.create(testDriveData);
//       const TestDriveID = newTestDrive.TestDriveID;

//       // If TestDriveEmpID already exists in TestDriveDocument, skip document upload
//       if (TestDriveEmpID) {
//         const existingDocument = await TestDriveDocument.findOne({
//           where: { TestDriveEmpID },
//         });

//         if (existingDocument) {
//           return res.status(409).json({
//             message: "Document with the provided TestDriveEmpID already exists",
//             existingDocument,
//             testDrive: newTestDrive,
//           });
//         }
//       }

//       // If file is uploaded, proceed with file handling and TestDriveDocument creation
//       if (req.file) {
//         // Generate document name
//         const genName = await genDocTestDriveDocName(
//           req.file,
//           TestDriveID,
//           DocTypeID
//         );

//         console.log("Generated name:", genName);

//         if (genName.error) {
//           return res.status(500).json({ message: genName.error });
//         }

//         const localFilePath = req.file.path;
//         const remoteFilePath = process.env.Test_Drive_Documents_PATH + genName;

//         // Upload file to server
//         const sshConfig = {
//           host: process.env.SSH_HOST,
//           port: process.env.SSH_PORT,
//           username: process.env.SSH_USERNAME,
//           privateKeyPath: process.env.SSH_PRIVATE_KEY_PATH,
//         };

//         await transferImageToServer(
//           localFilePath,
//           remoteFilePath,
//           sshConfig,
//           "upload"
//         );

//         // Save TestDriveDocument record
//         const newTestDriveDocument = await TestDriveDocument.create({
//           TestDriveID,
//           TestDriveEmpID: TestDriveEmpID || null,
//           DocTypeID: DocTypeID,
//           TestDriveDocURL: remoteFilePath,
//           IsActive: IsActive !== undefined ? IsActive : true,
//           Status: Status || "Active",
//         });

//         return res.status(201).json({
//           testDrive: newTestDrive,
//           testDriveDocument: newTestDriveDocument,
//         });
//       } else {
//         return res.status(201).json({
//           testDrive: newTestDrive,
//           message: "TestDrive record created without document upload",
//         });
//       }
//     } catch (err) {
//       if (
//         err.name === "SequelizeValidationError" ||
//         err.name === "SequelizeUniqueConstraintError"
//       ) {
//         return res.status(400).json({
//           message: "Validation error",
//           details: err.errors.map((e) => e.message),
//         });
//       }

//       if (err.name === "SequelizeDatabaseError") {
//         return res
//           .status(500)
//           .json({ message: "Database error", details: err.message });
//       }

//       console.error("Error creating TestDrive or TestDriveDocument:", err);
//       return res.status(500).json({ message: "Internal server error" });
//     } finally {
//       if (req.file && fs.existsSync(req.file.path)) {
//         fs.unlinkSync(req.file.path);
//       }
//     }
//   });
// };

exports.findOne = async (req, res) => {
  try {
    const testDriveID = req.params.id;
    const { TestDriveID, TestDriveEmpID } = req.query; // Extract TestDriveID and TestDriveEmpID from request body

    // Fetch the specific TestDrive data with included related data
    const testDriveData = await TestDrive.findOne({
      where: { TestDriveID: testDriveID }, // Find the test drive by TestDriveID
      attributes: [
        "TestDriveID",
        "RequestNo",
        "CustomerID",
        "UserID",
        "BranchID",
        "Title",
        "FirstName",
        "LastName",
        "PhoneNo",
        "Email",
        "Gender",
        "DateOfBirth", // Assuming it's DateOfBirth in the database, change if needed
        "Occupation",
        "Address",
        "OffAddress",
        "PINCode",
        "DistrictID",
        "StateID",
        "AadharNumber",
        "ModelMasterID",
        "FuelTypeID",
        "TransmissionID",
        "DemoEmpID",
        "DemoName",
        "TestDriveBy",
        "TestDriveEmpID",
        "TestDriveName",
        "DrivingLicense",
        "RequestStatus",
        "RequestedBy",
        "AssignedBy",
        "IsActive",
        "Status",
      ],
      include: [
        {
          model: RegionMaster,
          as: "TDDistrictID",
          attributes: ["RegionID", "RegionName"], // Include RegionID and RegionName
        },
        {
          model: StateMaster,
          as: "TDStateID",
          attributes: ["StateID", "StateName"], // Include StateID and StateName
        },
        {
          model: ModelMaster,
          as: "TDModelMasterID",
          attributes: ["ModelMasterID", "ModelCode", "ModelDescription"], // Include ModelMasterID, ModelCode, ModelDescription
        },
        {
          model: FuelType,
          as: "TDFuelTypeID",
          attributes: ["FuelTypeID", "FuelTypeName", "FuelCode"], // Include FuelTypeID, FuelTypeName, FuelCode
        },
        {
          model: UserMaster,
          as: "TDTestDriveEmpID",
          attributes: ["EmpID"], // Include FuelTypeID, FuelTypeName, FuelCode
        },
        {
          model: Transmission,
          as: "TDTransmissionID",
          attributes: [
            "TransmissionID",
            "TransmissionDescription",
            "TransmissionCode",
          ], // Include TransmissionID, TransmissionDescription, TransmissionCode
        },
      ],
    });

    // Check if the test drive data is found
    if (!testDriveData) {
      return res.status(404).json({
        message: "Test Drive not found.",
      });
    }

    // Check if TestDriveEmpID is provided in the request body
    if (TestDriveEmpID) {
      // Check if the TestDriveEmpID exists in the TestDriveDocuments table and retrieve TestDriveDocURL
      const testDriveDocumentEmpCheck = await TestDriveDocument.findOne({
        where: { TestDriveEmpID },
        attributes: ["TestDriveDocURL"], // Retrieve TestDriveDocURL
      });

      // If the TestDriveEmpID does not exist in TestDriveDocuments
      if (!testDriveDocumentEmpCheck) {
        return res.status(404).json({
          message: "TestDriveEmpID not found in TestDriveDocuments.",
        });
      }
    }

    // Check if TestDriveID is provided and needs to be checked in TestDriveDocuments
    if (req.query.TestDriveID) {
      // Check if the TestDriveID exists in the TestDriveDocuments table and retrieve TestDriveDocURL
      const testDriveDocumentCheck = await TestDriveDocument.findOne({
        where: { TestDriveID },
        attributes: ["TestDriveDocURL"], // Retrieve TestDriveDocURL
      });

      // If the TestDriveID does not exist in TestDriveDocuments
      if (!testDriveDocumentCheck) {
        return res.status(404).json({
          message: "TestDriveID not found in TestDriveDocuments.",
        });
      }
    }

    // Prepare the response data with mapped fields
    const combinedData = {
      TestDriveID: testDriveData.TestDriveID,
      RequestNo: testDriveData.RequestNo,
      CustomerID: testDriveData.CustomerID,
      UserID: testDriveData.UserID,
      BranchID: testDriveData.BranchID,
      Title: testDriveData.Title,
      FirstName: testDriveData.FirstName,
      LastName: testDriveData.LastName,
      PhoneNo: testDriveData.PhoneNo,
      Email: testDriveData.Email,
      Gender: testDriveData.Gender,
      DateOfBirth: testDriveData.DateOfBirth,
      Occupation: testDriveData.Occupation,
      Address: testDriveData.Address,
      OffAddress: testDriveData.OffAddress,
      PINCode: testDriveData.PINCode,
      DistrictID: testDriveData.DistrictID,
      StateID: testDriveData.StateID,
      AadharNumber: testDriveData.AadharNumber,
      ModelMasterID: testDriveData.ModelMasterID,
      FuelTypeID: testDriveData.FuelTypeID,
      TransmissionID: testDriveData.TransmissionID,
      DemoEmpID: testDriveData.DemoEmpID,
      DemoName: testDriveData.DemoName,
      TestDriveBy: testDriveData.TestDriveBy,
      TestDriveEmpID: testDriveData.TestDriveEmpID,
      TestDriveName: testDriveData.TestDriveName,
      TestDriveEmployeeID: testDriveData.TDTestDriveEmpID
        ? testDriveData.TDTestDriveEmpID.EmpID
        : null,

      DrivingLicense: testDriveData.DrivingLicense,
      RequestStatus: testDriveData.RequestStatus,
      RequestedBy: testDriveData.RequestedBy,
      AssignedBy: testDriveData.AssignedBy,
      IsActive: testDriveData.IsActive,
      Status: testDriveData.Status,
      DistrictDetails: testDriveData.TDDistrictID, // testDrive details
      StateDetails: testDriveData.TDStateID, // StateMaster details
      ModelMasterDetails: testDriveData.TDModelMasterID, // ModelMaster details
      FuelTypeDetails: testDriveData.TDFuelTypeID, // FuelType details
      TransmissionDetails: testDriveData.TDTransmissionID, // Transmission details
    };

    // If TestDriveEmpID was provided and data exists in TestDriveDocuments
    if (TestDriveEmpID) {
      const testDriveDocEmp = await TestDriveDocument.findOne({
        where: { TestDriveEmpID },
        attributes: ["TestDriveDocURL"], // Retrieve TestDriveDocURL
      });
      if (testDriveDocEmp) {
        combinedData.TestDriveDocURL = testDriveDocEmp.TestDriveDocURL; // Add TestDriveDocURL to the response
      }
    }

    // If TestDriveID was provided and data exists in TestDriveDocuments
    if (TestDriveID) {
      const testDriveDoc = await TestDriveDocument.findOne({
        where: { TestDriveID },
        attributes: ["TestDriveDocURL"], // Retrieve TestDriveDocURL
      });
      if (testDriveDoc) {
        combinedData.TestDriveDocURL = testDriveDoc.TestDriveDocURL; // Add TestDriveDocURL to the response
      }
    }

    // Send the combined data as a response
    res.json(combinedData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message: "Database error occurred while retrieving test drive data.",
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
    console.error("Error retrieving test drive data:", error);
    return res.status(500).json({
      message: "Failed to retrieve test drive data. Please try again later.",
    });
  }
};

exports.findAll = async (req, res) => {
  try {
    const { UserID, BranchID } = req.query;
    // Fetch all TestDrive data with included related data
    const testDriveData = await TestDrive.findAll({
      where: { UserID, BranchID },
      attributes: [
        "TestDriveID",
        "RequestNo",
        "UserID",
        "BranchID",
        "Title",
        "FirstName",
        "LastName",
        "PhoneNo",
        "StateID",
        "DistrictID",
        "Email",
        "ModelMasterID",
        "FuelTypeID",
        "TransmissionID",
        "RequestStatus",
        "Status",
        "CreatedDate",
      ],
      include: [
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
        {
          model: UserMaster,
          as: "TDUserID",
          attributes: ["UserName", "EmpID"],
        },
        {
          model: BranchMaster,
          as: "TDBranchID",
          attributes: ["BranchName"],
        },
        {
          model: StateMaster,
          as: "TDStateID",
          attributes: ["StateName"],
        },
        {
          model: RegionMaster,
          as: "TDDistrictID",
          attributes: ["RegionName"],
        },
      ],
    });

    // Check if test drive data is found
    if (!testDriveData || testDriveData.length === 0) {
      return res.status(404).json({
        message: "No Test Drive data found.",
      });
    }

    // Map all the fields from the related models with null checks
    const mappedData = testDriveData.map((testDrive) => ({
      TestDriveID: testDrive.TestDriveID,
      RequestNo: testDrive.RequestNo,
      UserID: testDrive.UserID,
      BranchID: testDrive.BranchID,
      Title: testDrive.Title,
      FirstName: testDrive.FirstName,
      LastName: testDrive.LastName,
      PhoneNo: testDrive.PhoneNo,
      Email: testDrive.Email,
      ModelMasterID: testDrive.ModelMasterID,
      FuelTypeID: testDrive.FuelTypeID,
      TransmissionID: testDrive.TransmissionID,
      CreatedDate: testDrive.CreatedDate,
      ModelCode: testDrive.TDModelMasterID?.ModelCode || null,
      ModelDescription: testDrive.TDModelMasterID?.ModelDescription || null,
      FuelTypeName: testDrive.TDFuelTypeID?.FuelTypeName || null,
      FuelCode: testDrive.TDFuelTypeID?.FuelCode || null,
      TransmissionDescription:
        testDrive.TDTransmissionID?.TransmissionDescription || null,
      TransmissionCode: testDrive.TDTransmissionID?.TransmissionCode || null,
      UserName: testDrive.TDUserID?.UserName || null,
      EmpID: testDrive.TDUserID?.EmpID || null,
      BranchName: testDrive.TDBranchID?.BranchName || null,
      StateID: testDrive.StateID,
      StateName: testDrive.TDStateID?.StateName || null,
      DistrictID: testDrive.DistrictID,
      DistrictName: testDrive.TDDistrictID?.RegionName || null,
      RequestStatus: testDrive.RequestStatus,
    }));

    // Send the mapped data as a response
    res.json(mappedData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message: "Database error occurred while retrieving test drive data.",
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
    console.error("Error retrieving test drive data:", error);
    return res.status(500).json({
      message: "Failed to retrieve test drive data. Please try again later.",
    });
  }
};

exports.StatusCheckforDoc = async (req, res) => {
  const { EmpID } = req.query; // Correct extraction
  try {
    // Fetch the specific user by EmpID
    const userData = await UserMaster.findOne({
      where: { EmpID: EmpID },
      attributes: ["UserName", "EmpID", "UserID", "DrivingLicense"], // Include UserName, EmpID, and UserID
    });

    if (!userData) {
      return res
        .status(404)
        .json({ message: "No user found with the given EmpID" });
    }

    // Check if userData.UserID exists before proceeding
    if (!userData.UserID) {
      return res
        .status(400)
        .json({ message: "UserID not found for the given EmpID" });
    }

    // Fetch the document associated with the user
    const DocData = await TestDriveDocument.findOne({
      where: { TestDriveEmpID: userData.UserID }, // Use userData.UserID for the query
    });

    let Docstatus = false;
    if (DocData && DocData.TestDriveDocURL) {
      Docstatus = true;
    }

    res.status(200).json({ userData, Docstatus }); // Return the status as Docstatus
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message: "Database error occurred while retrieving the document.",
        details: error.message,
      });
    }
    if (error.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    console.error("Error fetching the document:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.create = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error("Error uploading file:", err);
      return res.status(400).json({ message: err.message });
    }

    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Extract fields from the request
      const {
        CustomerID,
        UserID,
        BranchID,
        TestDriveEmpID,
        IsActive,
        Status,
        DocTypeID,
        DemoEmpID,
        TestDriveBy,
      } = req.body;

      if (!UserID || !BranchID || !DocTypeID) {
        return res
          .status(400)
          .json({ message: "UserID, BranchID, and DocTypeID are required" });
      }

      let demoName = req.body.DemoName;

      // Validate DemoEmpID in UserMaster
      if (DemoEmpID) {
        const user = await UserMaster.findOne({ where: { EmpID: DemoEmpID } });
        if (!user) {
          return res
            .status(404)
            .json({ message: "DemoEmpID does not exist in UserMaster" });
        }
        demoName = user.UserName || demoName;
      }

      // Generate RequestNo
      const RequestNo = await generateRequestNo();

      // Prepare TestDrive data
      const testDriveData = {
        RequestNo,
        CustomerID: CustomerID || null,
        UserID,
        BranchID,
        Title: req.body.Title,
        FirstName: req.body.FirstName,
        LastName: req.body.LastName,
        PhoneNo: req.body.PhoneNo,
        Email: req.body.Email,
        Gender: req.body.Gender,
        DateOfBirth: req.body.DateOfBirth,
        Occupation: req.body.Occupation,
        Address: req.body.Address,
        OffAddress: req.body.OffAddress,
        PINCode: req.body.PINCode,
        DistrictID: req.body.DistrictID,
        StateID: req.body.StateID,
        AadharNumber: req.body.AadharNumber,
        ModelMasterID: req.body.ModelMasterID,
        FuelTypeID: req.body.FuelTypeID,
        TransmissionID: req.body.TransmissionID,
        DemoEmpID: DemoEmpID,
        DemoName: demoName,
        TestDriveBy,
        TestDriveEmpID: TestDriveEmpID || null,
        TestDriveName: req.body.TestDriveName,
        DrivingLicense: req.body.DrivingLicense,
        RequestStatus: req.body.RequestStatus || "Pending",
        RequestedBy: req.body.RequestedBy,
        AssignedBy: req.body.AssignedBy || null,
        IsActive: req.body.IsActive || true,
        Status: req.body.Status || "Active",
        DocTypeID: DocTypeID,
      };

      // Check if document already exists for TestDriveEmpID
      if (TestDriveEmpID) {
        const existingDocument = await TestDriveDocument.findOne({
          where: { TestDriveEmpID },
        });

        if (existingDocument) {
          // If document already exists, create TestDrive without uploading a document
          const newTestDrive = await TestDrive.create(testDriveData);

          return res.status(201).json({
            status: true,
            testDrive: newTestDrive,
            message:
              "TestDrive record created without document upload (document already exists)",
          });
        }
      }

      // Save TestDrive record
      const newTestDrive = await TestDrive.create(testDriveData);
      const TestDriveID = newTestDrive.TestDriveID;

      // Handle file upload if no existing document
      if (req.file) {
        const genName = await genDocTestDriveDocName(
          req.file,
          TestDriveID,
          DocTypeID
        );

        if (genName.error) {
          return res.status(500).json({ message: genName.error });
        }

        const localFilePath = req.file.path;
        const remoteFilePath = process.env.Test_Drive_Documents_PATH + genName;

        const sshConfig = {
          host: process.env.SSH_HOST,
          port: process.env.SSH_PORT,
          username: process.env.SSH_USERNAME,
          privateKeyPath: process.env.SSH_PRIVATE_KEY_PATH,
        };

        await transferImageToServer(
          localFilePath,
          remoteFilePath,
          sshConfig,
          "upload"
        );

        const newTestDriveDocument = await TestDriveDocument.create({
          TestDriveID,
          TestDriveEmpID: TestDriveEmpID || null,
          DocTypeID: DocTypeID,
          TestDriveDocURL: remoteFilePath,
          IsActive: IsActive !== undefined ? IsActive : true,
          Status: Status || "Active",
        });

        return res.status(201).json({
          status: true,
          testDrive: newTestDrive,
          testDriveDocument: newTestDriveDocument,
        });
      } else {
        return res.status(201).json({
          status: true,
          testDrive: newTestDrive,
          message: "TestDrive record created without document upload",
        });
      }
    } catch (err) {
      if (
        err.name === "SequelizeValidationError" ||
        err.name === "SequelizeUniqueConstraintError"
      ) {
        return res.status(400).json({
          message: "Validation error",
          details: err.errors.map((e) => e.message),
        });
      }

      if (err.name === "SequelizeDatabaseError") {
        return res
          .status(500)
          .json({ message: "Database error", details: err.message });
      }

      console.error("Error creating TestDrive or TestDriveDocument:", err);
      return res.status(500).json({ message: "Internal server error" });
    } finally {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    }
  });
};

exports.updateByPk = async (req, res) => {
  try {
    // Validate request

    // Find the testDrive by ID
    const testDriveID = req.params.id;
    let testDrive = await TestDrive.findByPk(testDriveID);

    if (!testDrive) {
      return res.status(404).json({ message: "TestDrive not found" });
    }

    // Check AllotStatus in TestDriveAllot table
    const testDriveAllot = await TestDriveAllot.findOne({
      where: { TestDriveID: testDriveID },
    });

    if (testDriveAllot && testDriveAllot.AllotStatus === "Assigned") {
      return res.status(400).json({
        message:
          "TestDrive cannot be updated as AllotStatus is 'Assigned' in TestDriveAllot",
      });
    }

    // Update fields
    testDrive.RequestNo = req.body.RequestNo;
    testDrive.UserID = req.body.UserID || testDrive.UserID; // UserID as a foreign key
    testDrive.BranchID = req.body.BranchID || testDrive.BranchID; // CompanyID as a foreign key
    testDrive.Title = req.body.Title || testDrive.Title;
    testDrive.FirstName = req.body.FirstName || testDrive.FirstName;
    testDrive.LastName = req.body.LastName || testDrive.LastName;
    testDrive.PhoneNo = req.body.PhoneNo || testDrive.PhoneNo;
    testDrive.StateID = req.body.StateID || testDrive.StateID;
    testDrive.DistrictID = req.body.DistrictID || testDrive.DistrictID;
    testDrive.Email = req.body.Email || testDrive.Email;
    testDrive.ModelMasterID = req.body.ModelMasterID || testDrive.ModelMasterID;
    testDrive.FuelTypeID = req.body.FuelTypeID || testDrive.FuelTypeID;
    testDrive.TransmissionID =
      req.body.TransmissionID || testDrive.TransmissionID;
    testDrive.RequestStatus = req.body.RequestStatus || testDrive.RequestStatus;
    testDrive.IsActive = req.body.IsActive || testDrive.IsActive;
    testDrive.Status = req.body.Status || testDrive.Status;
    testDrive.ModifiedDate = new Date();

    // Save updated testDrive in the database
    const updatedTestDrive = await testDrive.save();

    return res.status(200).json(updatedTestDrive); // Send the updated testDrive as response
  } catch (err) {
    console.error("Error updating testDrive:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.findAllByStatus = async (req, res) => {
  try {
    const { UserID, BranchID, RequestStatus } = req.query;
    // Fetch all TestDrive data with included related data
    const testDriveData = await TestDrive.findAll({
      where: { UserID, BranchID, RequestStatus },
      attributes: [
        "TestDriveID",
        "RequestNo",
        "UserID",
        "BranchID",
        "Title",
        "FirstName",
        "LastName",
        "PhoneNo",
        "StateID",
        "DistrictID",
        "Email",
        "ModelMasterID",
        "FuelTypeID",
        "TransmissionID",
        "RequestStatus",
        "Status",
        "CreatedDate",
      ],
      include: [
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
        {
          model: UserMaster,
          as: "TDUserID",
          attributes: ["UserName", "EmpID"],
        },
        {
          model: BranchMaster,
          as: "TDBranchID",
          attributes: ["BranchName"],
        },
        {
          model: StateMaster,
          as: "TDStateID",
          attributes: ["StateName"],
        },
        {
          model: RegionMaster,
          as: "TDDistrictID",
          attributes: ["RegionName"],
        },
      ],
    });

    // Check if test drive data is found
    if (!testDriveData || testDriveData.length === 0) {
      return res.status(404).json({
        message: "No Test Drive data found.",
      });
    }

    // Map all the fields from the related models with null checks
    const mappedData = testDriveData.map((testDrive) => ({
      TestDriveID: testDrive.TestDriveID,
      RequestNo: testDrive.RequestNo,
      UserID: testDrive.UserID,
      BranchID: testDrive.BranchID,
      Title: testDrive.Title,
      FirstName: testDrive.FirstName,
      LastName: testDrive.LastName,
      PhoneNo: testDrive.PhoneNo,
      Email: testDrive.Email,
      ModelMasterID: testDrive.ModelMasterID,
      FuelTypeID: testDrive.FuelTypeID,
      TransmissionID: testDrive.TransmissionID,
      CreatedDate: testDrive.CreatedDate,
      ModelCode: testDrive.TDModelMasterID?.ModelCode || null,
      ModelDescription: testDrive.TDModelMasterID?.ModelDescription || null,
      FuelTypeName: testDrive.TDFuelTypeID?.FuelTypeName || null,
      FuelCode: testDrive.TDFuelTypeID?.FuelCode || null,
      TransmissionDescription:
        testDrive.TDTransmissionID?.TransmissionDescription || null,
      TransmissionCode: testDrive.TDTransmissionID?.TransmissionCode || null,
      UserName: testDrive.TDUserID?.UserName || null,
      EmpID: testDrive.TDUserID?.EmpID || null,
      BranchName: testDrive.TDBranchID?.BranchName || null,
      StateID: testDrive.StateID,
      StateName: testDrive.TDStateID?.StateName || null,
      DistrictID: testDrive.DistrictID,
      DistrictName: testDrive.TDDistrictID?.RegionName || null,
      RequestStatus: testDrive.RequestStatus,
    }));

    // Send the mapped data as a response
    res.json(mappedData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message: "Database error occurred while retrieving test drive data.",
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
    console.error("Error retrieving test drive data:", error);
    return res.status(500).json({
      message: "Failed to retrieve test drive data. Please try again later.",
    });
  }
};
