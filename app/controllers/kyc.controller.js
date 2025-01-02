/* eslint-disable no-unused-vars */
const { compareSync } = require("bcrypt");
const db = require("../models");
const Enquiry = db.enquirydms;
const multer = require("multer");
const path = require("path");
const BankMaster = db.bankmaster;
const Statemaster = db.statemaster;
const RegionMaster = db.regionmaster;
const Customer = db.customermaster;
const ColourMaster = db.colourmaster;
const VariantMaster = db.variantmaster;
const FuelType = db.fueltypes;
const Modelmaster = db.modelmaster;
const CustomerDocumentDetails = db.customerdocinfo;
const custdocverification = db.documentverification;
const custmerGSTdetails = db.customergstinfo;
const docverify = db.documentverification;
const custmap = db.CustEmpMaping;
const statepos = db.statepos;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;
const doctype = db.documenttypes;
const usermaster = db.usermaster;
const MSMEInfo = db.msmeInfo;
const NewCarBookings = db.NewCarBookings;
const PaymentRequest = db.PaymentRequests;
const Receipts = db.CustReceipt;
const ChequeTracking = db.chequetracking;
const CustomerGSTInfo = db.customergstinfo;
const CustomerDocInfo = db.customerdocinfo;
const DocumentVerification = db.documentverification;
const StateMaster = db.statemaster;
const { Client } = require("ssh2");
require("dotenv").config();
const fs = require("fs");
const { Console } = require("console");
const { configureMulter } = require("../Utils/multerService");
const { transferImageToServer } = require("../Utils/sshService");
const { genDocNameforCustomer } = require("../Utils/generateService");

// // Multer setup
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "/home/administrator/TempData"); // Ensure 'Images' directory exists
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname));
//   },
// });

// const upload = multer({
//   storage: storage,
//   limits: { fileSize: 1000000 },
//   fileFilter: (req, file, cb) => {
//     const fileTypes = /jpeg|jpg|png|gif/;
//     const mimeType = fileTypes.test(file.mimetype);
//     const extname = fileTypes.test(path.extname(file.originalname));

//     if (mimeType && extname) {
//       cb(null, true);
//     } else {
//       cb(new Error("Give proper files format to upload"));
//     }
//   },
// }).single("DocURL"); // Ensure 'image' matches the field name in your request

// Controller function to handle image upload
// exports.uploadImage = (req, res, next) => {
//   upload(req, res, (err) => {
//     if (err) {
//       return res.status(400).json({ error: err.message });
//     }
//     next(); // Call next middleware function (in this case, the 'create' function)
//   });
// };
// async function transferImageToServer(localFilePath, remoteFilePath, action) {
//   // const Client = require("ssh2").Client;
//   // const fs = require("fs");
//   // const path = require("path");

//   const sshClient = new Client();

//   return new Promise((resolve, reject) => {
//     sshClient.on("ready", () => {
//       sshClient.sftp(async (err, sftp) => {
//         if (err) {
//           sshClient.end();
//           reject(err);
//         }

//         if (action === "upload") {
//           sftp.fastPut(localFilePath, remoteFilePath, async (err) => {
//             if (err) {
//               sshClient.end();
//               reject(err);
//             }

//             sshClient.end();
//             resolve();
//           });
//         } else if (action === "remove") {
//           sftp.unlink(remoteFilePath, (err) => {
//             sshClient.end();
//             if (err) {
//               reject(err);
//             } else {
//               resolve();
//             }
//           });
//         } else {
//           reject("Invalid action specified");
//         }
//       });
//     });

//     sshClient.on("error", (err) => {
//       sshClient.end();
//       reject(err);
//     });

//     sshClient.on("end", () => {
//       // Handle end event if needed
//     });

//     // Connect to the SSH server
//     sshClient.connect({
//       host: process.env.SSH_HOST,
//       port: process.env.SSH_PORT,
//       username: process.env.SSH_USERNAME,
//       privateKey: fs.readFileSync(process.env.SSH_PRIVATE_KEY_PATH), // Use the provided private key path from environment variables
//     });
//   });
// }

// Configure Multer for file upload
const upload = configureMulter(
  // "C:/Users/varun/OneDrive/Desktop/uploads/", // Adjust upload path as needed
  "/home/administrator/VARUNGROUP/IMAGES_VMS_MARUTI",
  1000000, // File size limit (1MB)
  ["jpeg", "jpg", "png", "gif"], // Allowed file types
  "DocURL" // Field name in your request
);

// exports.CustDocsUpload = async (req, res) => {
//   // Call the upload middleware before processing the request
//   upload(req, res, async (err) => {
//     if (err) {
//       // Handle any errors from multer
//       return res.status(400).json({ message: err.message });
//     }

//     console.log("Request Body:", req.body);
//     console.log("Request File:", req.file);

//     try {
//       const localFilePath = req.file.path;
//       const remoteFilePath =
//         process.env.Customer_Documents_PATH + req.file.originalname;
//       // Upload file to server
//       console.log("///////////////", remoteFilePath);
//       await transferImageToServer(localFilePath, remoteFilePath, "upload");
//       // Validate request
//       const documents = {
//         CustomerID: req.body.CustomerID,
//         CustomerRelation: req.body.CustomerRelation,
//         DocTypeID: req.body.DocTypeID,
//         DocURL: remoteFilePath,
//         DocStatus: "Pending",
//       };

//       // Insert documents into the database
//       const createdDocuments = await CustomerDocumentDetails.create(documents);
//       // Prepare docverifications data
//       const docverifications = {
//         CustomerID: req.body.CustomerID,
//         DocID: createdDocuments.DocID,
//         GSTID: req.body.GSTID,
//         UploadBy: req.body.EMPID,
//         Status: "Pending",
//       };
//       // create docverifications
//       const createdDocVerifications = await docverify.create(docverifications);
//       return res.status(200).json({
//         message: "Document created successfully",
//         createdDocuments,
//         createdDocVerifications,
//       }); // Send the newly created modelmaster as response
//     } catch (err) {
//       console.error("Error creating modelmaster:", err);
//       return res.status(500).json({ message: "Internal server error" });
//     } finally {
//       // Clean up temporary file
//       if (req.file && fs.existsSync(req.file.path)) {
//         fs.unlinkSync(req.file.path);
//       }
//     }
//   });
// };

// exports.CustDocsUpload = async (req, res) => {
//   // Call the upload middleware before processing the request
//   upload(req, res, async (err) => {
//     if (err) {
//       // Handle any errors from multer
//       return res.status(400).json({ message: err.message });
//     }

//     console.log("Request Body:", req.body);
//     console.log("Request File:", req.file);

//     try {
//       const localFilePath = req.file.path;

//       // Generate filename dynamically
//       const filename = await genDocNameforCustomer(
//         req.file,
//         req.body.CustomerID,
//         req.body.DocTypeID
//       );
//       const remoteFilePath = process.env.Customer_Documents_PATH + filename;

//       // Upload file to server via SSH
//       const sshConfig = {
//         host: process.env.SSH_HOST,
//         port: process.env.SSH_PORT,
//         username: process.env.SSH_USERNAME,
//         privateKeyPath: process.env.SSH_PRIVATE_KEY_PATH,
//       };

//       await transferImageToServer(
//         localFilePath,
//         remoteFilePath,
//         sshConfig,
//         "upload"
//       );

//       // Validate request and prepare data
//       const documents = {
//         CustomerID: req.body.CustomerID,
//         CustomerRelation: req.body.CustomerRelation,
//         DocTypeID: req.body.DocTypeID,
//         DocURL: remoteFilePath,
//         DocStatus: "Pending",
//       };

//       // Insert documents into the database
//       const createdDocuments = await CustomerDocumentDetails.create(documents);

//       // Prepare docverifications data
//       const docverifications = {
//         CustomerID: req.body.CustomerID,
//         DocID: createdDocuments.DocID,
//         GSTID: req.body.GSTID,
//         UploadBy: req.body.EMPID,
//         Status: "Pending",
//       };

//       // Create docverifications
//       const createdDocVerifications = await docverify.create(docverifications);

//       return res.status(200).json({
//         message: "Document created successfully",
//         createdDocuments,
//         createdDocVerifications,
//       }); // Send the newly created documents as response
//     } catch (err) {
//       console.error("Error creating documents:", err);
//       return res.status(500).json({ message: "Internal server error" });
//     } finally {
//       // Clean up temporary file
//       if (req.file && fs.existsSync(req.file.path)) {
//         fs.unlinkSync(req.file.path);
//       }
//     }
//   });
// };
// exports.CustDocsUpload = async (req, res) => {
//   console.log("Starting CustDocsUpload");

//   // Call the upload middleware before processing the request
//   upload(req, res, async (err) => {
//     if (err) {
//       // Handle any errors from multer
//       console.error("Multer error:", err.message);
//       return res.status(400).json({ message: err.message });
//     }

//     console.log("Request Body:", req.body);
//     console.log("Request File:", req.file);

//     try {
//       const localFilePath = req.file.path;
//       console.log("Local file path:", localFilePath);

//       // Generate filename dynamically
//       const filename = await genDocNameforCustomer(
//         req.file,
//         req.body.CustomerID,
//         req.body.DocTypeID
//       );
//       console.log("Generated filename:", filename);

//       const remoteFilePath = process.env.Customer_Documents_PATH + filename;
//       console.log("Remote file path:", remoteFilePath);

//       // Upload file to server via SSH
//       const sshConfig = {
//         host: process.env.SSH_HOST,
//         port: process.env.SSH_PORT,
//         username: process.env.SSH_USERNAME,
//         privateKeyPath: process.env.SSH_PRIVATE_KEY_PATH,
//       };

//       console.log("Starting file transfer to server...");
//       await transferImageToServer(
//         localFilePath,
//         remoteFilePath,
//         sshConfig,
//         "upload"
//       );
//       console.log("File transfer completed.");

//       // Validate request and prepare data
//       const documents = {
//         CustomerID: req.body.CustomerID,
//         CustomerRelation: req.body.CustomerRelation,
//         DocTypeID: req.body.DocTypeID,
//         DocURL: remoteFilePath,
//         DocStatus: "Pending",
//       };
//       console.log("Documents data to be created/updated:", documents);

//       const docTypeID = parseInt(req.body.DocTypeID, 10);

//       let createdDocuments;
//       if (docTypeID === 3) {
//         // Always create a new document if DocTypeID is 3
//         console.log("DocTypeID is 3, creating new document...");
//         createdDocuments = await CustomerDocumentDetails.create(documents);
//       } else {
//         // Check if a document with the same CustomerID and DocTypeID already exists
//         const existingDocument = await CustomerDocumentDetails.findOne({
//           where: {
//             CustomerID: req.body.CustomerID,
//             DocTypeID: req.body.DocTypeID,
//           },
//         });

//         if (existingDocument) {
//           console.log("Document already exists, updating...");
//           await existingDocument.update({
//             ...documents,
//             ModifiedDate: new Date(), // Add this line to update the modification date
//           });
//           createdDocuments = existingDocument;
//         } else {
//           console.log("Document does not exist, creating new...");
//           createdDocuments = await CustomerDocumentDetails.create(documents);
//         }
//       }
//       console.log("Created/Updated document:", createdDocuments);

//       // Prepare docverifications data
//       const docverifications = {
//         CustomerID: req.body.CustomerID,
//         DocID: createdDocuments.DocID,
//         GSTID: req.body.GSTID,
//         UploadBy: req.body.EMPID,
//         Status: "Pending",
//       };
//       console.log("Docverifications data:", docverifications);

//       let createdDocVerifications;
//       // Check if a verification with the same CustomerID and DocID already exists
//       const existingDocVerification = await docverify.findOne({
//         where: {
//           CustomerID: req.body.CustomerID,
//           DocID: createdDocuments.DocID,
//         },
//       });

//       if (existingDocVerification) {
//         console.log("Doc verification already exists, updating...");
//         await existingDocVerification.update({
//           ...docverifications,
//           ModifiedDate: new Date(), // Add this line to update the modification date
//         });
//         createdDocVerifications = existingDocVerification;
//       } else {
//         console.log("Doc verification does not exist, creating new...");
//         createdDocVerifications = await docverify.create(docverifications);
//       }
//       console.log("Created/Updated doc verification:", createdDocVerifications);

//       // Update customerGSTdetails if DocTypeID is 3
//       if (docTypeID === 3) {
//         console.log("Checking if customer GST details need to be updated...");
//         const existingGSTDetails = await custmerGSTdetails.findOne({
//           where: {
//             CustomerID: req.body.CustomerID,
//             GSTID: createdDocVerifications.GSTID,
//           },
//         });

//         if (existingGSTDetails) {
//           console.log("Customer GST details found, updating...");
//           const updateCustGSTDetails = await custmerGSTdetails.update(
//             { DocID: createdDocuments.DocID, ModifiedDate: new Date() },
//             {
//               where: {
//                 CustomerID: req.body.CustomerID,
//                 GSTID: createdDocVerifications.GSTID,
//               },
//             }
//           );
//           console.log("Updated customer GST details:", updateCustGSTDetails);
//         } else {
//           console.log("Customer GST details not found, no update performed.");
//         }
//       }

//       return res.status(200).json({
//         message: "Document created/updated successfully",
//         createdDocuments,
//         createdDocVerifications,
//       }); // Send the newly created/updated documents as response
//     } catch (err) {
//       console.error("Error creating/updating documents:", err);
//       return res.status(500).json({ message: "Internal server error" });
//     } finally {
//       // Clean up temporary file
//       if (req.file && fs.existsSync(req.file.path)) {
//         console.log("Cleaning up temporary file:", req.file.path);
//         fs.unlinkSync(req.file.path);
//       }
//     }
//   });
// };

exports.CustDocsUpload = async (req, res) => {
  console.log("Starting CustDocsUpload");

  // SSH Configuration
  const sshConfig = {
    host: process.env.SSH_HOST,
    port: process.env.SSH_PORT,
    username: process.env.SSH_USERNAME,
    privateKeyPath: process.env.SSH_PRIVATE_KEY_PATH,
  };

  // Call the upload middleware before processing the request
  upload(req, res, async (err) => {
    if (err) {
      console.error("Multer error:", err.message);
      return res.status(400).json({ message: err.message });
    }

    console.log("Request Body:", req.body);
    console.log("Request File:", req.file);

    // Validate required fields
    if (!req.body.CustomerID || !req.body.DocTypeID) {
      return res
        .status(400)
        .json({ message: "CustomerID and DocTypeID are required." });
    }

    // If DocTypeID is 3, GSTID must be provided
    if (parseInt(req.body.DocTypeID, 10) === 3 && !req.body.GSTID) {
      return res
        .status(400)
        .json({ message: "GSTID is required for DocTypeID 3." });
    }

    try {
      const localFilePath = req.file.path;
      console.log("Local file path:", localFilePath);

      let filename = null;
      let createdDocuments;

      const docTypeID = parseInt(req.body.DocTypeID, 10);
      if (docTypeID === 3) {
        // Generate filename dynamically
        filename = await genDocNameforCustomer(
          req.file,
          req.body.CustomerID,
          req.body.DocTypeID,
          req.body.GSTID
        );
        console.log("Generated filename:", filename);
      } else {
        // Generate filename dynamically
        filename = await genDocNameforCustomer(
          req.file,
          req.body.CustomerID,
          req.body.DocTypeID
        );
        console.log("Generated filename:", filename);
      }

      const remoteFilePath = path.join(
        process.env.Customer_Documents_PATH,
        filename
      );
      console.log("Remote file path:", remoteFilePath);

      // Prepare data for document upload
      const documents = {
        CustomerID: req.body.CustomerID,
        CustomerRelation: req.body.CustomerRelation,
        DocTypeID: req.body.DocTypeID,
        DocURL: remoteFilePath,
        DocStatus: "Pending",
      };

      if (docTypeID === 3) {
        console.log(
          "DocTypeID is 3, checking for existing document with GSTID..."
        );

        // Find an entry in CustomerDocumentDetails with CustomerID and DocTypeID = 3
        const existingDocument = await CustomerDocumentDetails.findOne({
          where: {
            CustomerID: req.body.CustomerID,
            DocTypeID: 3,
          },
        });

        if (existingDocument) {
          console.log(
            "Found existing document with DocTypeID 3, DocID:",
            existingDocument.DocID
          );

          // Check for an entry in docverify with the same GSTID and DocID
          const docVerifyEntry = await docverify.findOne({
            where: {
              GSTID: req.body.GSTID,
              // DocID: existingDocument.DocID,
              CustomerID: existingDocument.CustomerID,
            },
          });

          if (docVerifyEntry) {
            console.log("Doc verification already exists, updating...");

            // Remove the old image if paths are different
            if (!existingDocument.DocURL) {
              console.log("Removing old file:", existingDocument.DocURL);
              await transferImageToServer(
                existingDocument.DocURL,
                existingDocument.DocURL,
                sshConfig,
                "remove"
              ).catch((err) => {
                console.error("Error removing old file:", err);
              });
            }

            // Upload the new image
            console.log("Uploading new file...");
            await transferImageToServer(
              localFilePath,
              remoteFilePath,
              sshConfig,
              "upload"
            ).catch((err) => {
              console.error("Error uploading new file:", err);
            });

            // Update the existing document
            await docVerifyEntry.update({
              UploadBy: req.body.EMPID,
              Status: "Pending",
              ModifiedDate: new Date(),
            });

            // Update the existing document
            await existingDocument.update({
              DocURL: remoteFilePath,
              ModifiedDate: new Date(),
            });

            createdDocuments = existingDocument;
          } else {
            console.log("Doc verification does not exist, creating new...");
            createdDocuments = await CustomerDocumentDetails.create(documents);

            // Upload the new image
            console.log("Uploading new file...");
            await transferImageToServer(
              localFilePath,
              remoteFilePath,
              sshConfig,
              "upload"
            ).catch((err) => {
              console.error("Error uploading new file:", err);
            });
          }
        } else {
          console.log(
            "No existing document found with DocTypeID 3, creating new..."
          );
          createdDocuments = await CustomerDocumentDetails.create(documents);

          // Upload the new image
          console.log("Uploading new file...");
          await transferImageToServer(
            localFilePath,
            remoteFilePath,
            sshConfig,
            "upload"
          ).catch((err) => {
            console.error("Error uploading new file:", err);
          });
        }
      } else {
        // For other DocTypeIDs, either create or update based on existence
        const existingDocument = await CustomerDocumentDetails.findOne({
          where: {
            CustomerID: req.body.CustomerID,
            DocTypeID: req.body.DocTypeID,
          },
        });

        if (existingDocument) {
          console.log("Document already exists, updating...");
          await existingDocument.update({
            ...documents,
            ModifiedDate: new Date(),
          });
          createdDocuments = existingDocument;
        } else {
          console.log("Document does not exist, creating new...");
          createdDocuments = await CustomerDocumentDetails.create(documents);
        }

        // Upload the new image (if applicable)
        if (docTypeID !== 3) {
          console.log("Uploading new file...");
          await transferImageToServer(
            localFilePath,
            remoteFilePath,
            sshConfig,
            "upload"
          ).catch((err) => {
            console.error("Error uploading new file:", err);
          });
        }
      }
      console.log("Created/Updated document:", createdDocuments);

      // Prepare docverifications data
      const docverifications = {
        CustomerID: req.body.CustomerID,
        DocID: createdDocuments.DocID,
        GSTID: req.body.GSTID,
        UploadBy: req.body.EMPID,
        Status: "Pending",
      };
      console.log("Docverifications data:", docverifications);

      let createdDocVerifications;
      const existingDocVerification = await docverify.findOne({
        where: {
          CustomerID: req.body.CustomerID,
          DocID: createdDocuments.DocID,
        },
      });

      if (existingDocVerification) {
        console.log("Doc verification already exists, updating...");
        await existingDocVerification.update({
          ...docverifications,
          ModifiedDate: new Date(),
        });
        createdDocVerifications = existingDocVerification;
      } else {
        console.log("Doc verification does not exist, creating new...");
        createdDocVerifications = await docverify.create(docverifications);
      }
      console.log("Created/Updated doc verification:", createdDocVerifications);

      // Update customerGSTdetails if DocTypeID is 3
      if (docTypeID === 3) {
        console.log("Checking if customer GST details need to be updated...");
        const existingGSTDetails = await custmerGSTdetails.findOne({
          where: {
            CustomerID: req.body.CustomerID,
            GSTID: createdDocVerifications.GSTID,
          },
        });

        if (existingGSTDetails) {
          console.log("Customer GST details found, updating...");
          await custmerGSTdetails.update(
            { DocID: createdDocuments.DocID, ModifiedDate: new Date() },
            {
              where: {
                CustomerID: req.body.CustomerID,
                GSTID: createdDocVerifications.GSTID,
              },
            }
          );
          console.log("Updated customer GST details.");
        } else {
          console.log("Customer GST details not found, no update performed.");
        }
      }

      const custData = await Customer.findOne({
        where: { CustomerID: req.body.CustomerID },
      });

      if (custData.DocStatus == "Approved") {
        custData.DocStatus = "Partial";
        await custData.save();
      }

      return res.status(200).json({
        message: "Document created/updated successfully",
        createdDocuments,
        createdDocVerifications,
      });
    } catch (err) {
      console.error("Error creating/updating documents:", err);
      return res.status(500).json({ message: "Internal server error" });
    } finally {
      // Clean up temporary file
      if (req.file && fs.existsSync(req.file.path)) {
        console.log("Cleaning up temporary file:", req.file.path);
        fs.unlinkSync(req.file.path);
      }
    }
  });
};

exports.GetCustImages = async (req, res) => {
  try {
    const { CustomerID } = req.query;
    if (!CustomerID) {
      return res.status(400).json({ message: "CustomerID is required" });
    }
    // Fetch all nation data
    const CustData = await CustomerDocumentDetails.findAll({
      where: { CustomerID },
    });

    // Check if data is empty
    if (!CustData || CustData.length === 0) {
      return res.status(404).json({
        message: "No customer data found.",
      });
    }

    // Send the combined data as response
    res.json(CustData);
  } catch (error) {
    // Handle errors
    console.error("Error retrieving nation data:", error);
    res.status(500).json({
      message: "Failed to retrieve nation data. Please try again later.",
    });
  }
};
// Rest of your code remains unchanged...

// exports.CreateNewCustomer = async (req, res) => {
//   const { AadharNo, PANNo, DrivingLicence, PhoneNo } = req.body;

//   // Start a transaction
//   const transaction = await Seq.transaction();

//   try {
//     // Validate that at least one detail is provided
//     if (!AadharNo && !PANNo && !DrivingLicence && !PhoneNo) {
//       return res.status(400).json({
//         message:
//           "At least one of Aadhar, PAN, Driving License, or Phone number is required.",
//       });
//     }

//     // Validate individual details
//     if (AadharNo && !/^\d{12}$/.test(AadharNo)) {
//       return res.status(400).json({ message: "Invalid Aadhar number format." });
//     }
//     if (PANNo && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(PANNo)) {
//       return res.status(400).json({ message: "Invalid PAN number format." });
//     }

//     // Construct the conditions array based on provided values
//     const conditions = [];
//     if (AadharNo) conditions.push({ AadharNo });
//     if (PANNo) conditions.push({ PANNo });
//     if (DrivingLicence) conditions.push({ DrivingLicence });
//     if (PhoneNo) conditions.push({ PhoneNo });

//     // Find existing customers based on the conditions
//     const existingCustomers = await Customer.findAll({
//       where: {
//         [sequelize.Op.or]: conditions,
//       },
//       transaction, // Include transaction in query
//     });

//     // If any existing customers are found, check which fields match
//     if (existingCustomers.length > 0) {
//       const existingFieldsArray = [];

//       // Identify conflicting fields with values
//       existingCustomers.forEach((customer) => {
//         if (customer.AadharNo === AadharNo) {
//           existingFieldsArray.push({ field: "AadharNo", value: AadharNo });
//         }
//         if (customer.PANNo === PANNo) {
//           existingFieldsArray.push({ field: "PANNo", value: PANNo });
//         }
//         if (customer.DrivingLicence === DrivingLicence) {
//           existingFieldsArray.push({
//             field: "DrivingLicence",
//             value: DrivingLicence,
//           });
//         }
//         if (customer.PhoneNo === PhoneNo) {
//           existingFieldsArray.push({ field: "PhoneNo", value: PhoneNo });
//         }
//       });

//       return res.status(400).json({
//         message: "Customer with provided details already exists.",
//         existingFields: existingFieldsArray,
//       });
//     }

//     // Validate mandatory fields
//     const mandatoryFields = [
//       "FirstName",
//       "Title",
//       "CustomerType",
//       "PhoneNo",
//       "Address",
//       "DistrictID",
//       "StateID",
//     ];
//     for (const field of mandatoryFields) {
//       if (!req.body[field]) {
//         return res.status(400).json({
//           message: `${field} is required.`,
//         });
//       }
//     }

//     // Validate integer type for specific fields
//     const integerOrNullFields = ["DistrictID", "StateID", "BankID"];
//     for (const field of integerOrNullFields) {
//       const value = req.body[field];
//       if (value !== null && value !== undefined && isNaN(parseInt(value))) {
//         return res.status(400).json({
//           message: `${field} must be a valid integer or null.`,
//         });
//       }
//     }

//     // Generate new CustID
//     const maxCustomer = await Customer.findOne({
//       attributes: [[sequelize.fn("MAX", sequelize.col("CustID")), "maxCustID"]],
//       transaction, // Include transaction in query
//     });
//     let maxCustID = 0;
//     if (maxCustomer && maxCustomer.get("maxCustID")) {
//       maxCustID = parseInt(maxCustomer.get("maxCustID").substring(4), 10);
//     }
//     maxCustID++;
//     const paddedCounter = maxCustID.toString().padStart(7, "0");
//     const generatedId = `CUST${paddedCounter}`;

//     // Create new customer
//     const createCustomer = {
//       CustomerType: req.body.CustomerType,
//       CustID: generatedId,
//       Title: req.body.Title,
//       FirstName: req.body.FirstName,
//       LastName: req.body.LastName,
//       Gender: req.body.Gender,
//       RelationName: req.body.RelationName,
//       RelationType: req.body.RelationType,
//       PhoneNo: req.body.PhoneNo,
//       OfficeNo: req.body.OfficeNo,
//       Email: req.body.Email,
//       Occupation: req.body.Occupation,
//       Company: req.body.Company,
//       DateOfBirth: req.body.DateOfBirth,
//       DateOfAnniversary: req.body.DateOfAnniversary,
//       Address: req.body.Address,
//       DistrictID: req.body.DistrictID,
//       StateID: req.body.StateID,
//       PINCode: req.body.PINCode,
//       ModelName: req.body.ModelName,
//       VariantName: req.body.VariantName,
//       FuelType: req.body.FuelType,
//       ColourName: req.body.ColourName,
//       Transmission: req.body.Transmission,
//       AadharNo: req.body.AadharNo,
//       PANNo: req.body.PANNo,
//       DrivingLicence: req.body.DrivingLicence,
//       AccountHolderName: req.body.AccountHolderName,
//       AccountNo: req.body.AccountNo,
//       IFSCCode: req.body.IFSCCode,
//       BankID: req.body.BankID,
//       MSMEID: req.body.MSMEID || null,
//       BranchDetails: req.body.BranchDetails,
//       IsActive: req.body.IsActive !== undefined ? req.body.IsActive : true,
//       KycStatus:
//         req.body.KycStatus !== undefined ? req.body.KycStatus : "Pending",
//       CustomerStatus:
//         req.body.CustomerStatus !== undefined
//           ? req.body.CustomerStatus
//           : "Active",
//     };

//     console.log("body data : ", createCustomer);

//     // Save new customer
//     const customerData = await Customer.create(createCustomer, { transaction });
//     if (!req.body.UserID) {
//       return res.status(400).json({
//         message: `User ID must be provided when creating customer.`,
//       });
//     }
//     // Create mappings
//     const CustEmpMappings = {
//       CustomerID: customerData.CustomerID,
//       EmpID: req.body.UserID, // Assuming EMPID is passed in req.body
//     };
//     console.log("cust emp map data: ", CustEmpMappings);
//     const CustEmpmappingdata = await custmap.create(CustEmpMappings, {
//       transaction,
//     });
//     const MSMEMappings = {
//       CustomerID: customerData.CustomerID,
//       RegistrationType: req.body.RegistrationType,
//       DateOfRegistration: req.body.DateOfRegistration || null,
//       NameOfEnterprise: req.body.NameOfEnterprise,
//       RegistrationNo: req.body.RegistrationNo,
//       IsActive: req.body.IsActive || true,
//       Status: req.body.Status || "Active",
//     };
//     const MSMEMappingdata = await MSMEInfo.create(MSMEMappings, {
//       transaction,
//     });
//     customerData.MSMEID = MSMEMappingdata.MSMEID;
//     await customerData.save({ transaction });
//     const bankData = await BankMaster.findOne(
//       { where: { BankID: customerData.BankID } },
//       {
//         transaction,
//       }
//     );
//     const stateData = await StateMaster.findOne(
//       { where: { StateID: customerData.StateID } },
//       {
//         transaction,
//       }
//     );
//     const districtData = await RegionMaster.findOne(
//       { where: { RegionID: customerData.DistrictID } },
//       {
//         transaction,
//       }
//     );
//     // Map the customer data with required fields
//     const custData = {
//       CustomerID: customerData.CustomerID,
//       CustomerType: customerData.CustomerType,
//       CustID: customerData.CustID,
//       Title: customerData.Title,
//       FirstName: customerData.FirstName,
//       LastName: customerData.LastName,
//       Gender: customerData.Gender,
//       RelationName: customerData.RelationName,
//       RelationType: customerData.RelationType,
//       PhoneNo: customerData.PhoneNo,
//       OfficeNo: customerData.OfficeNo,
//       Email: customerData.Email,
//       Occupation: customerData.Occupation,
//       Company: customerData.Company,
//       DateOfBirth: customerData.DateOfBirth,
//       DateOfAnniversary: customerData.DateOfAnniversary,
//       Address: customerData.Address,
//       DistrictID: customerData.DistrictID || null, // Null if no DistrictID
//       District: districtData ? districtData.RegionName : null, // Null if no DistrictID
//       StateID: customerData.StateID || null, // Null if no StateID
//       State: stateData ? stateData.StateName : null, // Null if no StateID
//       PINCode: customerData.PINCode,
//       ModelName: customerData.ModelName,
//       VariantName: customerData.VariantName,
//       FuelType: customerData.FuelType,
//       ColourName: customerData.ColourName,
//       Transmission: customerData.Transmission,
//       AadharNo: customerData.AadharNo,
//       PANNo: customerData.PANNo,
//       DrivingLicence: customerData.DrivingLicence,
//       AccountHolderName: customerData.AccountHolderName,
//       AccountNo: customerData.AccountNo,
//       IFSCCode: customerData.IFSCCode,
//       BankID: customerData.BankID || null, // Null if no BankID
//       BankName: bankData ? bankData.BankName : null, // Null if no BankID
//       MSMEID: customerData.MSMEID || null,
//       BranchDetails: customerData.BranchDetails,
//       IsActive: customerData.IsActive,
//       KycStatus: customerData.KycStatus,
//       CustomerStatus: customerData.CustomerStatus,
//     };
//     // Send the response
//     // return res.status(200).json(custData);
//     // Commit the transaction
//     await transaction.commit();
//     // Send success response
//     const responseData = {
//       ...custData,
//       ...CustEmpmappingdata.toJSON(),
//       ...MSMEMappingdata.toJSON(),
//     };
//     return res.status(200).json(responseData);
//   } catch (error) {
//     // Rollback the transaction in case of error
//     try {
//       await transaction.rollback();
//     } catch (rollbackError) {
//       console.error("Transaction rollback failed:", rollbackError);
//     }

//     console.error(error);
//     return res
//       .status(500)
//       .json({ message: error.message || "Internal server error" });
//   }
// };

exports.CreateNewCustomer = async (req, res) => {
  const { AadharNo, PANNo, DrivingLicence, PhoneNo } = req.body;
  // Start a transaction
  const transaction = await Seq.transaction();
  try {
    // Validate that at least one detail is provided
    if (!AadharNo && !PANNo && !DrivingLicence && !PhoneNo) {
      return res.status(400).json({
        message:
          "At least one of Aadhar, PAN, Driving License, or Phone number is required.",
      });
    }
    // Validate individual details
    if (AadharNo && !/^\d{12}$/.test(AadharNo)) {
      return res.status(400).json({ message: "Invalid Aadhar number format." });
    }
    if (PANNo && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(PANNo)) {
      return res.status(400).json({ message: "Invalid PAN number format." });
    }
    // Construct the conditions array based on provided values
    const conditions = [];
    if (AadharNo) conditions.push({ AadharNo });
    if (PANNo) conditions.push({ PANNo });
    if (DrivingLicence) conditions.push({ DrivingLicence });
    if (PhoneNo) conditions.push({ PhoneNo });
    // Find existing customers based on the conditions
    const existingCustomers = await Customer.findAll({
      where: {
        [sequelize.Op.or]: conditions,
      },
      transaction, // Include transaction in query
    });
    // If any existing customers are found, check which fields match
    // if (existingCustomers.length > 0) {
    //   const existingFields = new Set();
    //   existingCustomers.forEach((customer) => {
    //     if (customer.AadharNo === AadharNo) existingFields.add("AadharNo");
    //     if (customer.PANNo === PANNo) existingFields.add("PANNo");
    //     if (customer.DrivingLicence === DrivingLicence)
    //       existingFields.add("DrivingLicence");
    //     if (customer.PhoneNo === PhoneNo) existingFields.add("PhoneNo");
    //   });
    //   const existingFieldsArray = Array.from(existingFields);
    //   const message = `Customer with provided ${existingFieldsArray.join(
    //     " and "
    //   )} already exists`;
    //   console.log(message);
    //   return res.status(400).json({ message });
    // }
    if (existingCustomers.length > 0) {
      const existingFieldsArray = [];

      // Identify conflicting fields with values
      existingCustomers.forEach((customer) => {
        if (customer.AadharNo === AadharNo) {
          existingFieldsArray.push({ field: "AadharNo", value: AadharNo });
        }
        if (customer.PANNo === PANNo) {
          existingFieldsArray.push({ field: "PANNo", value: PANNo });
        }
        if (customer.DrivingLicence === DrivingLicence) {
          existingFieldsArray.push({
            field: "DrivingLicence",
            value: DrivingLicence,
          });
        }
        if (customer.PhoneNo === PhoneNo) {
          existingFieldsArray.push({ field: "PhoneNo", value: PhoneNo });
        }
      });

      return res.status(400).json({
        message: "Customer with provided details already exists.",
        existingFields: existingFieldsArray,
      });
    }
    // Validate mandatory fields
    const mandatoryFields = [
      "FirstName",
      "Title",
      "CustomerType",
      "PhoneNo",
      "Address",
      "DistrictID",
      "StateID",
    ];
    for (const field of mandatoryFields) {
      if (!req.body[field]) {
        return res.status(400).json({
          message: `${field} is required.`,
        });
      }
    }
    // Validate integer type for specific fields
    const integerOrNullFields = ["DistrictID", "StateID", "BankID"];
    for (const field of integerOrNullFields) {
      const value = req.body[field];
      if (value !== null && value !== undefined && isNaN(parseInt(value))) {
        return res.status(400).json({
          message: `${field} must be a valid integer or null.`,
        });
      }
    }
    // Generate new CustID
    const maxCustomer = await Customer.findOne({
      attributes: [[sequelize.fn("MAX", sequelize.col("CustID")), "maxCustID"]],
      transaction, // Include transaction in query
    });
    let maxCustID = 0;
    if (maxCustomer && maxCustomer.get("maxCustID")) {
      maxCustID = parseInt(maxCustomer.get("maxCustID").substring(4), 10);
    }
    maxCustID++;
    const paddedCounter = maxCustID.toString().padStart(7, "0");
    const generatedId = `CUST${paddedCounter}`;
    // Create new customer
    const createCustomer = {
      CustomerType: req.body.CustomerType,
      CustID: generatedId,
      Title: req.body.Title,
      FirstName: req.body.FirstName,
      LastName: req.body.LastName,
      Gender: req.body.Gender,
      RelationName: req.body.RelationName,
      RelationType: req.body.RelationType,
      PhoneNo: req.body.PhoneNo,
      OfficeNo: req.body.OfficeNo,
      Email: req.body.Email,
      Occupation: req.body.Occupation,
      Company: req.body.Company,
      DateOfBirth: req.body.DateOfBirth,
      DateOfAnniversary: req.body.DateOfAnniversary,
      Address: req.body.Address,
      DistrictID: req.body.DistrictID,
      StateID: req.body.StateID,
      PINCode: req.body.PINCode,
      ModelName: req.body.ModelName,
      VariantName: req.body.VariantName,
      FuelType: req.body.FuelType,
      ColourName: req.body.ColourName,
      Transmission: req.body.Transmission,
      AadharNo: req.body.AadharNo,
      PANNo: req.body.PANNo,
      DrivingLicence: req.body.DrivingLicence,
      AccountHolderName: req.body.AccountHolderName,
      AccountNo: req.body.AccountNo,
      IFSCCode: req.body.IFSCCode,
      BankID: req.body.BankID,
      MSMEID: req.body.MSMEID || null,
      BranchDetails: req.body.BranchDetails,
      IsActive: req.body.IsActive !== undefined ? req.body.IsActive : true,
      KycStatus:
        req.body.KycStatus !== undefined ? req.body.KycStatus : "Pending",
      CustomerStatus:
        req.body.CustomerStatus !== undefined
          ? req.body.CustomerStatus
          : "Active",
    };
    console.log("body data : ", createCustomer);
    // Save new customer
    const customerData = await Customer.create(createCustomer, { transaction });
    if (!req.body.UserID) {
      return res.status(400).json({
        message: `User ID must be provided when creating customer.`,
      });
    }
    // Create mappings
    const CustEmpMappings = {
      CustomerID: customerData.CustomerID,
      EmpID: req.body.UserID, // Assuming EMPID is passed in req.body
    };
    console.log("cust emp map data: ", CustEmpMappings);
    const CustEmpmappingdata = await custmap.create(CustEmpMappings, {
      transaction,
    });
    const MSMEMappings = {
      CustomerID: customerData.CustomerID,
      RegistrationType: req.body.RegistrationType,
      DateOfRegistration: req.body.DateOfRegistration || null,
      NameOfEnterprise: req.body.NameOfEnterprise,
      RegistrationNo: req.body.RegistrationNo,
      IsActive: req.body.IsActive || true,
      Status: req.body.Status || "Active",
    };
    const MSMEMappingdata = await MSMEInfo.create(MSMEMappings, {
      transaction,
    });
    customerData.MSMEID = MSMEMappingdata.MSMEID;
    await customerData.save({ transaction });
    const bankData = await BankMaster.findOne(
      { where: { BankID: customerData.BankID } },
      {
        transaction,
      }
    );
    const stateData = await StateMaster.findOne(
      { where: { StateID: customerData.StateID } },
      {
        transaction,
      }
    );
    const districtData = await RegionMaster.findOne(
      { where: { RegionID: customerData.DistrictID } },
      {
        transaction,
      }
    );
    // Map the customer data with required fields
    const custData = {
      CustomerID: customerData.CustomerID,
      CustomerType: customerData.CustomerType,
      CustID: customerData.CustID,
      Title: customerData.Title,
      FirstName: customerData.FirstName,
      LastName: customerData.LastName,
      Gender: customerData.Gender,
      RelationName: customerData.RelationName,
      RelationType: customerData.RelationType,
      PhoneNo: customerData.PhoneNo,
      OfficeNo: customerData.OfficeNo,
      Email: customerData.Email,
      Occupation: customerData.Occupation,
      Company: customerData.Company,
      DateOfBirth: customerData.DateOfBirth,
      DateOfAnniversary: customerData.DateOfAnniversary,
      Address: customerData.Address,
      DistrictID: customerData.DistrictID || null, // Null if no DistrictID
      District: districtData ? districtData.RegionName : null, // Null if no DistrictID
      StateID: customerData.StateID || null, // Null if no StateID
      State: stateData ? stateData.StateName : null, // Null if no StateID
      PINCode: customerData.PINCode,
      ModelName: customerData.ModelName,
      VariantName: customerData.VariantName,
      FuelType: customerData.FuelType,
      ColourName: customerData.ColourName,
      Transmission: customerData.Transmission,
      AadharNo: customerData.AadharNo,
      PANNo: customerData.PANNo,
      DrivingLicence: customerData.DrivingLicence,
      AccountHolderName: customerData.AccountHolderName,
      AccountNo: customerData.AccountNo,
      IFSCCode: customerData.IFSCCode,
      BankID: customerData.BankID || null, // Null if no BankID
      BankName: bankData ? bankData.BankName : null, // Null if no BankID
      MSMEID: customerData.MSMEID || null,
      BranchDetails: customerData.BranchDetails,
      IsActive: customerData.IsActive,
      KycStatus: customerData.KycStatus,
      CustomerStatus: customerData.CustomerStatus,
    };
    // Send the response
    // return res.status(200).json(custData);
    // Commit the transaction
    await transaction.commit();
    // Send success response
    const responseData = {
      ...custData,
      ...CustEmpmappingdata.toJSON(),
      ...MSMEMappingdata.toJSON(),
    };
    return res.status(200).json(responseData);
  } catch (error) {
    // Rollback the transaction in case of error
    try {
      await transaction.rollback();
    } catch (rollbackError) {
      console.error("Transaction rollback failed:", rollbackError);
    }
    console.error(error);
    return res
      .status(500)
      .json({ message: error.message || "Internal server error" });
  }
};
// exports.kycupdate = async (req, res) => {
//   try {
//     // Find the max CustID from the Customer table
//     const maxCustomer = await Customer.findOne({
//       attributes: [[sequelize.fn("MAX", sequelize.col("CustID")), "maxCustID"]],
//     });

//     // Determine the new CustID
//     let maxCustID = 0;
//     if (maxCustomer && maxCustomer.get("maxCustID")) {
//       maxCustID = parseInt(maxCustomer.get("maxCustID").substring(4), 10);
//     }
//     maxCustID++;
//     const paddedCounter = maxCustID.toString().padStart(7, "0");
//     const generatedId = `CUST${paddedCounter}`;

//     // Create a new customer object
//     const createCustomer = {
//       CustomerType: req.body.CustomerType,
//       Title: req.body.Title,
//       FirstName: req.body.FirstName,
//       LastName: req.body.LastName,
//       PhoneNo: req.body.PhoneNo,
//       OfficeNo: req.body.OfficeNo,
//       Email: req.body.Email,
//       Occupation: req.body.Occupation,
//       DateOfBirth: req.body.DateofBirth,
//       DateOfAnniversary: req.body.DateOfAnniversary,
//       Address: req.body.Address,
//       District: req.body.District,
//       State: req.body.StateDesc,
//       PINCode: req.body.PINCode,
//       ModelName: req.body.ModelName,
//       VariantName: req.body.VariantName,
//       FuelType: req.body.FuelType,
//       CustID: generatedId,
//       AadharNo: req.body.AadharNo,
//       PANNo: req.body.PANNo,
//       DrivingLicence: req.body.DrivingLicence,
//       GSTIN: req.body.GSTIN,
//       GstType: req.body.GstType,
//       AccountHolderName: req.body.AccountHolderName,
//       AccountNo: req.body.AccountNo,
//       IFSCCode: req.body.IFSCCode,
//       Bank: req.body.Bank,
//       Company: req.body.Company,
//       EMPID: req.body.EMPID,
//       BranchDetails: req.body.BranchDetails,
//       IsActive: req.body.IsActive ? req.body.IsActive : true,
//       KycStatus: req.body.KycStatus ? req.body.KycStatus : false,
//       CustomerStatus: req.body.CustomerStatus ? req.body.CustomerStatus : false,
//     };

//     // Create a new customer record in the database
//     const customerData = await Customer.create(createCustomer);
//     const customerid = customerData.CustomerID;
//     console.log(customerid);

//     const CustEmpMappings = {
//       CustomerID: customerData.CustomerID,
//       EMPID: req.body.EMPID,
//     };
//     const CustEmpmappingdata = await custmap.create(CustEmpMappings);

//     // Send a success response
//     return res.status(200).json({
//       message: "Customer created successfully",
//       customerData,
//       CustEmpmappingdata,
//     });
//   } catch (error) {
//     console.error(error);
//     return res
//       .status(500)
//       .json({ message: error.message || "Internal server error" });
//   }
// };

// exports.kycupdate = async (req, res) => {
//   const { AadharNo, PANNo, DrivingLicence, PhoneNo } = req.body;

//   // Validate that at least one detail is provided
//   if (!AadharNo && !PANNo && !DrivingLicence && !PhoneNo) {
//     return res.status(400).json({
//       message:
//         "At least one of Aadhar, PAN, Driving License, or Phone number is required.",
//     });
//   }

//   // Validate individual details
//   if (AadharNo && !/^\d{12}$/.test(AadharNo)) {
//     return res.status(400).json({ message: "Invalid Aadhar number format." });
//   }
//   if (PANNo && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(PANNo)) {
//     return res.status(400).json({ message: "Invalid PAN number format." });
//   }

//   // Construct the conditions array based on provided values
//   const conditions = [];
//   if (AadharNo) conditions.push({ AadharNo });
//   if (PANNo) conditions.push({ PANNo });
//   if (DrivingLicence) conditions.push({ DrivingLicence });
//   if (PhoneNo) conditions.push({ PhoneNo });

//   try {
//     // Find existing customers based on the conditions
//     const existingCustomers = await Customer.findAll({
//       where: {
//         [sequelize.Op.or]: conditions,
//       },
//     });

//     // If any existing customers are found, check which fields match
//     if (existingCustomers.length > 0) {
//       const existingFields = new Set();

//       existingCustomers.forEach((customer) => {
//         if (customer.AadharNo === AadharNo) existingFields.add("AadharNo");
//         if (customer.PANNo === PANNo) existingFields.add("PANNo");
//         if (customer.DrivingLicence === DrivingLicence)
//           existingFields.add("DrivingLicence");
//         if (customer.PhoneNo === PhoneNo) existingFields.add("PhoneNo");
//       });

//       const existingFieldsArray = Array.from(existingFields);
//       const message = `Customer with provided ${existingFieldsArray.join(
//         " and "
//       )} already exists`;

//       console.log(message);
//       return res.status(400).json({ message });
//     }

//     // Validate mandatory fields
//     const mandatoryFields = [
//       "FirstName",
//       "Title",
//       "CustomerType",
//       "PhoneNo",
//       "Address",
//       "DistrictID",
//       "StateID",
//     ];
//     for (const field of mandatoryFields) {
//       if (!req.body[field]) {
//         return res.status(400).json({
//           message: `${field} is required.`,
//         });
//       }
//     }

//     // Validate integer type for specific fields
//     const integerOrNullFields = ["DistrictID", "StateID", "BankID"];
//     for (const field of integerOrNullFields) {
//       const value = req.body[field];
//       if (value !== null && value !== undefined && isNaN(parseInt(value))) {
//         return res.status(400).json({
//           message: `${field} must be a valid integer or null.`,
//         });
//       }
//     }

//     // Generate new CustID
//     const maxCustomer = await Customer.findOne({
//       attributes: [[sequelize.fn("MAX", sequelize.col("CustID")), "maxCustID"]],
//     });
//     let maxCustID = 0;
//     if (maxCustomer && maxCustomer.get("maxCustID")) {
//       maxCustID = parseInt(maxCustomer.get("maxCustID").substring(4), 10);
//     }
//     maxCustID++;
//     const paddedCounter = maxCustID.toString().padStart(7, "0");
//     const generatedId = `CUST${paddedCounter}`;

//     // Create new customer
//     const createCustomer = {
//       CustomerType: req.body.CustomerType,
//       CustID: generatedId,
//       Title: req.body.Title,
//       FirstName: req.body.FirstName,
//       LastName: req.body.LastName,
//       Gender: req.body.Gender,
//       RelationName: req.body.RelationName,
//       RelationType: req.body.RelationType,
//       PhoneNo: req.body.PhoneNo,
//       OfficeNo: req.body.OfficeNo,
//       Email: req.body.Email,
//       Occupation: req.body.Occupation,
//       Company: req.body.Company,
//       DateOfBirth: req.body.DateOfBirth,
//       DateOfAnniversary: req.body.DateOfAnniversary,
//       Address: req.body.Address,
//       DistrictID: req.body.DistrictID,
//       StateID: req.body.StateID,
//       PINCode: req.body.PINCode,
//       ModelName: req.body.ModelName,
//       VariantName: req.body.VariantName,
//       FuelType: req.body.FuelType,
//       ColourName: req.body.ColourName,
//       Transmission: req.body.Transmission,
//       AadharNo: req.body.AadharNo,
//       PANNo: req.body.PANNo,
//       DrivingLicence: req.body.DrivingLicence,
//       AccountHolderName: req.body.AccountHolderName,
//       AccountNo: req.body.AccountNo,
//       IFSCCode: req.body.IFSCCode,
//       BankID: req.body.BankID,
//       MSMEID: req.body.MSMEID || null,
//       BranchDetails: req.body.BranchDetails,
//       IsActive: req.body.IsActive !== undefined ? req.body.IsActive : true,
//       KycStatus:
//         req.body.KycStatus !== undefined ? req.body.KycStatus : "Pending",
//       CustomerStatus:
//         req.body.CustomerStatus !== undefined
//           ? req.body.CustomerStatus
//           : "Active",
//     };

//     console.log("body data : ", createCustomer);

//     // Save new customer
//     const customerData = await Customer.create(createCustomer);

//     // Create mappings
//     const CustEmpMappings = {
//       CustomerID: customerData.CustomerID,
//       EmpID: req.body.UserID, // Assuming EMPID is passed in req.body
//     };
//     const CustEmpmappingdata = await custmap.create(CustEmpMappings);

//     const MSMEMappings = {
//       CustomerID: customerData.CustomerID,
//       RegistrationType: req.body.RegistrationType,
//       DateOfRegistration: req.body.DateOfRegistration || new Date(),
//       NameOfEnterprise: req.body.NameOfEnterprise,
//       RegistrationNo: req.body.RegistrationNo,
//       IsActive: req.body.IsActive || true,
//       Status: req.body.Status || "Active",
//     };
//     const MSMEMappingdata = await MSMEInfo.create(MSMEMappings);

//     customerData.MSMEID = MSMEMappingdata.MSMEID;
//     await customerData.save();

//     // Send success response
//     const responseData = {
//       ...customerData.toJSON(),
//       ...CustEmpmappingdata.toJSON(),
//       ...MSMEMappingdata.toJSON(),
//     };
//     return res.status(200).json(responseData);
//   } catch (error) {
//     console.error(error);
//     return res
//       .status(500)
//       .json({ message: error.message || "Internal server error" });
//   }
// };

exports.createGST = async (req, res) => {
  try {
    const {
      CustomerID,
      GSTIN,
      RegistrationType,
      LegalName,
      TradeName,
      DOR,
      EntityType,
      Address,
      StateID,
      PINCode,
      DocID,
      Status,
    } = req.body;

    // Check if GSTIN is provided
    if (!GSTIN) {
      return res.status(400).json({
        message: "GSTIN is required",
      });
    }

    // Check if GSTIN is unique
    const existingGST = await CustomerGSTInfo.findOne({
      where: { GSTIN: GSTIN },
    });

    if (existingGST) {
      return res.status(400).json({
        message: "GSTIN already exists",
      });
    }

    // Check if GSTIN is unique
    const existingStateData = await statepos.findOne({
      where: { POSID: String(StateID) },
    });

    if (!existingStateData) {
      return res.status(400).json({
        message: "State POS doesn't exists",
      });
    }

    // Continue with creating the GST details
    const gstDetailsData = {
      CustomerID: CustomerID,
      GSTIN: GSTIN,
      RegistrationType: RegistrationType,
      LegalName: LegalName,
      TradeName: TradeName,
      DOR: DOR,
      EntityType: EntityType,
      Address: Address,
      StateID: existingStateData ? existingStateData.StatePOSID : null,
      PINCode: PINCode,
      DocID: DocID,
      Status: Status,
    };

    const Gstdata = await CustomerGSTInfo.create(gstDetailsData);

    return res.status(200).json({
      message: "GST created successfully",
      Gstdata,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: error.message || "Internal server error" });
  }
};

exports.updateGST = async (req, res) => {
  const GSTID = req.body.GSTID;
  console.log(GSTID);
  try {
    const gstDetails = await custmerGSTdetails.findByPk(GSTID);
    if (!gstDetails) {
      return res
        .status(404)
        .json({ message: `GST record with id=${GSTID} not found` });
    }
    // Update GST attributes based on request body
    const {
      CustomerID,
      GSTIN,
      RegistrationType,
      LegalName,
      TradeName,
      DOR,
      EntityType,
      Address,
      StateID,
      PINCode,
      DocID,
      Status,
      IsActive,
    } = req.body;
    gstDetails.CustomerID = CustomerID || gstDetails.CustomerID;
    gstDetails.GSTIN = GSTIN || gstDetails.GSTIN;
    gstDetails.RegistrationType =
      RegistrationType || gstDetails.RegistrationType;
    gstDetails.LegalName = LegalName || gstDetails.LegalName;
    gstDetails.TradeName = TradeName || gstDetails.TradeName;
    gstDetails.DOR = DOR || gstDetails.DOR;
    gstDetails.EntityType = EntityType || gstDetails.EntityType;
    gstDetails.Address = Address || gstDetails.Address;
    gstDetails.StateID = StateID || gstDetails.StateID;
    gstDetails.PINCode = PINCode || gstDetails.PINCode;
    gstDetails.DocID = DocID || gstDetails.DocID;
    gstDetails.Status = Status !== undefined ? Status : gstDetails.Status;
    gstDetails.IsActive =
      IsActive !== undefined ? IsActive : gstDetails.IsActive;
    gstDetails.ModifiedDate = new Date();
    // Save the updated GST record
    await gstDetails.save();
    res.status(200).json({
      message: `GST record with id=${GSTID} was updated successfully`,
      gstDetails,
    });
  } catch (err) {
    res.status(500).json({
      message: `Error updating GST record with id=${GSTID}`,
      error: err.message,
    });
  }
};

exports.GetGstdata = async (req, res) => {
  try {
    const { CustomerID } = req.query;

    // Validate the CustomerID in the request body
    if (!CustomerID) {
      return res.status(400).json({ message: "CustomerID is required" });
    }

    // Fetch the data based on CustomerID
    const data = await custmerGSTdetails.findAll({
      where: { CustomerID },
      include: [
        {
          model: statepos,
          as: "CGIStatePOSID",
          //attributes: ["ModelCode", "ModelDescription"],
        },
      ],
    });
    // Check if no data found
    if (!data || data.length === 0) {
      return res
        .status(404)
        .json({ message: "No data found for the given CustomerID" });
    }
    // Transform the data to the required format
    const transformedData = data.map((item) => ({
      GSTID: item.GSTID,
      CustomerID: item.CustomerID,
      GSTIN: item.GSTIN,
      RegistrationType: item.RegistrationType,
      LegalName: item.LegalName,
      TradeName: item.TradeName,
      DOR: item.DOR,
      EntityType: item.EntityType,
      Address: item.Address,
      StateID: item.StateID,
      PINCode: item.PINCode,
      DocID: item.DocID,
      IsActive: item.IsActive,
      Status: item.Status,
      CreatedDate: item.CreatedDate,
      ModifiedDate: item.ModifiedDate,
      StateName: item.CGIStatePOSID.StateName, // Add StateName
      POSID: item.CGIStatePOSID.POSID, // Add POSID
    }));

    // Send the transformed data as the response
    res.status(200).json(transformedData);
    // Send the fetched data as the response
  } catch (error) {
    console.error(error);
    // Return error response
    return res
      .status(500)
      .json({ message: error.message || "Internal server error" });
  }
};

exports.GetStatePOS = async (req, res) => {
  try {
    const data = await statepos.findAll({});
    res.send(data);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: error.message || "Internal server error" });
  }
};

// exports.CustDocsUpload = async (req, res) => {
//   try {
//     // create documnets
//     const documents = {
//       CustomerID: req.body.CustomerID,
//       CustomerRelation: req.body.CustomerRelation,
//       DocTypeID: req.body.DocTypeID,
//       DocURL: req.file.path,
//       DocStatus: "Pending",
//     };

//     // Insert documents into the database
//     const createdDocuments = await CustomerDocumentDetails.create(documents);
//     // Prepare docverifications data
//     const docverifications = {
//       CustomerID: req.body.CustomerID,
//       DocID: createdDocuments.DocID,
//       UploadBy: req.body.EMPID,
//       Status: "Pending",
//     };
//     // create docverifications
//     const createdDocVerifications = await docverify.create(docverifications);
//     return res.status(200).json({
//       message: "Document created successfully",
//       createdDocuments,
//       createdDocVerifications,
//     });
//   } catch (error) {
//     console.error(error);
//     return res
//       .status(500)
//       .json({ message: error.message || "Internal server error" });
//   }
// };

exports.GetCustomerDetailsWithEmpid = async (req, res) => {
  try {
    const EmpID = req.query.EmpID;
    console.log("Employee ID: ", EmpID);
    if (!EmpID) {
      return res.status(400).json({
        status: "error",
        message: "EmpID is required in the query parameters.",
      });
    }

    // Finding the customer data
    const customerMapdata = await custmap.findAll({
      include: [
        {
          model: Customer,
          as: "CEMCustID",
          attributes: [
            "CustomerID",
            "CustomerType",
            "CustID",
            "Title",
            "FirstName",
            "LastName",
            "Gender",
            "RelationType",
            "RelationName",
            "PhoneNo",
            "OfficeNo",
            "Email",
            "Occupation",
            "Company",
            "DateOfBirth",
            "DateOfAnniversary",
            "Address",
            "DistrictID",
            "StateID",
            "PINCode",
            "ModelName",
            "VariantName",
            "FuelType",
            "ColourName",
            "Transmission",
            "AadharNo",
            "PANNo",
            "DrivingLicence",
            "AccountHolderName",
            "AccountNo",
            "IFSCCode",
            "BankID",
            "MSMEID",
            "BranchDetails",
            "IsActive",
            "KycStatus",
            "CustomerStatus",
            "CreatedDate",
            "ModifiedDate",
          ],
          include: [
            {
              model: RegionMaster,
              as: "CMRegionID",
              attributes: ["RegionID", "RegionName"],
            },
            {
              model: Statemaster,
              as: "CMStateID",
              attributes: ["StateID", "StateName"],
            },
            {
              model: MSMEInfo,
              as: "CMMSMEID",
              attributes: [
                "MSMEID",
                "RegistrationType",
                "DateOfRegistration",
                "NameOfEnterprise",
                "RegistrationNo",
              ],
            },
          ],
        },
      ],
      order: [["CreatedDate", "DESC"]], // Ordering by CreatedDate in descending order
      where: {
        EmpID: EmpID,
      },
    });

    console.log("Customer Data: ", customerMapdata);

    if (!customerMapdata) {
      return res.status(404).send({ message: "Customer not found" });
    }

    // Extract BankIDs from the customerMapdata
    const customerBankIDs = customerMapdata
      .map((mapData) => mapData.CEMCustID.BankID)
      .filter((bankID) => bankID); // Filter out any undefined or null values

    let customerBankData = [];
    if (customerBankIDs.length > 0) {
      customerBankData = await BankMaster.findAll({
        where: {
          BankID: customerBankIDs,
        },
      });
    }

    // Create a map for quick bank lookup
    const bankMap = customerBankData.reduce((acc, bank) => {
      acc[bank.BankID] = bank.BankName;
      return acc;
    }, {});

    // Process the data to flatten the structure
    const flattenedCustomerData = customerMapdata.map((mapData) => {
      const customer = mapData.CEMCustID;
      return {
        CustomerID: customer.CustomerID,
        CustomerType: customer.CustomerType,
        CustID: customer.CustID,
        Title: customer.Title,
        FirstName: customer.FirstName,
        LastName: customer.LastName,
        Gender: customer.Gender,
        RelationType: customer.RelationType,
        RelationName: customer.RelationName,
        PhoneNo: customer.PhoneNo,
        OfficeNo: customer.OfficeNo,
        Email: customer.Email,
        Occupation: customer.Occupation,
        Company: customer.Company,
        DateOfBirth: customer.DateOfBirth,
        DateOfAnniversary: customer.DateOfAnniversary,
        Address: customer.Address,
        DistrictID: customer.DistrictID,
        DistrictName: customer.CMRegionID
          ? customer.CMRegionID.RegionName
          : null,
        StateID: customer.StateID,
        StateName: customer.CMStateID ? customer.CMStateID.StateName : null,
        PINCode: customer.PINCode,
        ModelName: customer.ModelName,
        VariantName: customer.VariantName,
        FuelType: customer.FuelType,
        ColourName: customer.ColourName,
        Transmission: customer.Transmission,
        AadharNo: customer.AadharNo,
        PANNo: customer.PANNo,
        DrivingLicence: customer.DrivingLicence,
        AccountHolderName: customer.AccountHolderName,
        AccountNo: customer.AccountNo,
        IFSCCode: customer.IFSCCode,
        BankID: customer.BankID,
        MSMEID: customer.MSMEID,
        RegistrationType: customer.CMMSMEID
          ? customer.CMMSMEID.RegistrationType
          : null,
        DateOfRegistration: customer.CMMSMEID
          ? customer.CMMSMEID.DateOfRegistration
          : null,
        NameOfEnterprise: customer.CMMSMEID
          ? customer.CMMSMEID.NameOfEnterprise
          : null,
        RegistrationNo: customer.CMMSMEID
          ? customer.CMMSMEID.RegistrationNo
          : null,
        BankName: bankMap[customer.BankID] || null, // Use map to get BankName
        BranchDetails: customer.BranchDetails,
        IsActive: customer.IsActive,
        KycStatus: customer.KycStatus,
        CustomerStatus: customer.CustomerStatus,
        CreatedDate: customer.CreatedDate,
        ModifiedDate: customer.ModifiedDate,
      };
    });

    // Return the response with flattened data in descending order of CreatedDate
    return res.status(200).json({
      customerData: flattenedCustomerData,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: error.message || "Internal server error",
    });
  }
};

exports.GetCustomersweb = async (req, res) => {
  try {
    const EmpID = req.query.EmpID;
    console.log("Employee ID: ", EmpID);

    if (!EmpID) {
      return res.status(400).json({
        status: "error",
        message: "EmpID is required in the query parameters.",
      });
    }
    // Finding the customer
    const customerMapdata = await custmap.findAll({
      include: [
        {
          model: Customer,
          as: "CEMCustID",
          attributes: { exclude: ["CustEmpMappingID"] }, // Include this if you want to exclude certain attributes
        },
      ],

      where: {
        EmpID: EmpID,
      },
    });

    console.log("????", customerMapdata);

    if (!customerMapdata) {
      return res.status(404).send({ message: "Customer not found" });
    }
    const customerData = customerMapdata.map((mapData) => mapData.CEMCustID);

    return res.status(200).json({
      customerData,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: error.message || "Internal server error" });
  }
};

exports.newcustomer = async (req, res) => {
  const transaction = await Seq.transaction(); // Start a transaction

  try {
    // Fetch the maximum existing CustID from the database
    const maxCustomer = await Customer.findOne({
      attributes: [[sequelize.fn("MAX", sequelize.col("CustID")), "maxCustID"]],
      transaction, // Include transaction
    });

    let maxCustID = 0;
    if (maxCustomer && maxCustomer.get("maxCustID")) {
      maxCustID = parseInt(maxCustomer.get("maxCustID").substring(4), 10);
    }
    // Increment the maximum CustID to generate the next ID
    maxCustID++;
    const paddedCounter = maxCustID.toString().padStart(7, "0");
    const generatedId = `CUST${paddedCounter}`;

    if (!req.body.AadharNumber) {
      return res.status(400).json({
        message: "Aadhar Number is required.",
      });
    }

    // Create new customer record
    const createCustomer = {
      EnquiryDate: req.body.EnquiryDate,
      EnquiryStatus: req.body.EnquiryStatus,
      EnquiryNo: req.body.EnquiryNo,
      Source: req.body.Source,
      CustomerType: req.body.CustomerType,
      Tittle: req.body.TitleName,
      FirstName: req.body.FirstName,
      LastName: req.body.LastName,
      PhoneNumber: req.body.PhoneNumber,
      OfficeNumber: req.body.OfficePhone,
      Email: req.body.EmailId,
      Occupation: req.body.SubCompany,
      DateOfBirth: req.body.DateofBirth,
      DateOfAnnversary: req.body.DateofWedding,
      Address: req.body.Address,
      District: req.body.District,
      State: req.body.StateDesc,
      Pincode: req.body.PinCode,
      ModelName: req.body.ModelName,
      VariantName: req.body.VariantName,
      FuelType: req.body.FuelType,
      CustID: generatedId,
      AadharNumber: req.body.AadharNumber,
      PANNumber: req.body.PANNumber,
      DrivingLicence: req.body.DrivingLicence,
      GSTIN: req.body.GSTIN,
      GstType: req.body.GstType,
      AccountHolderName: req.body.AccountHolderName,
      AccountNumber: req.body.AccountNumber,
      IFSCCode: req.body.IFSCCode,
      Bank: req.body.Bank,
      BranchDetails: req.body.BranchDetails,
      IsActive: req.body.IsActive !== undefined ? req.body.IsActive : true,
      KycStatus: req.body.KycStatus !== undefined ? req.body.KycStatus : false,
      CustomerStatus:
        req.body.CustomerStatus !== undefined ? req.body.CustomerStatus : false,
      Company: req.body.Company,
    };

    const Customerdata = await Customer.create(createCustomer, { transaction });

    // Add documents in doctable
    const documents = req.body.documents.map((doc) => ({
      CustomerID: Customerdata.CustomerId,
      CustRelation: doc.CustRelation,
      DocType: doc.DocType,
      DocURL: doc.DocURL,
      DocStatus: "Pending",
    }));

    const createdDocuments = await CustomerDocumentDetails.bulkCreate(
      documents,
      { transaction }
    );

    // Create GST details
    const gstDetailsData = {
      CustomerID: Customerdata.CustomerId,
      GSTIN: req.body.GSTDetails.GSTIN,
      RegistrationType: req.body.GSTDetails.RegistrationType,
      LegalName: req.body.GSTDetails.LegalName,
      TradeName: req.body.GSTDetails.TradeName,
      DOR: req.body.GSTDetails.DOR,
      EntityType: req.body.GSTDetails.EntityType,
      Address: req.body.GSTDetails.Address,
      StateID: req.body.GSTDetails.StateID,
      PinCode: req.body.GSTDetails.PinCode,
      DocID: req.body.GSTDetails.DocID,
    };

    const cstGSTdetail = await custmerGSTdetails.create(gstDetailsData, {
      transaction,
    });

    // Create document verification records
    const docverifications = createdDocuments.map((document) => ({
      CustomerID: Customerdata.CustomerId,
      DocID: document.DocID,
      UploadBy: req.body.UploadBy,
      GSTID: cstGSTdetail.GSTID,
      Status: "Pending",
    }));

    const createdDocVerifications = await docverify.bulkCreate(
      docverifications,
      { transaction }
    );

    // Commit the transaction
    await transaction.commit();

    // Send success response
    return res.status(200).json({
      message: "Customer created successfully",
      Customerdata,
      createdDocuments,
      cstGSTdetail,
      createdDocVerifications,
    });
  } catch (error) {
    // Rollback the transaction in case of error
    try {
      await transaction.rollback();
    } catch (rollbackError) {
      console.error("Transaction rollback failed:", rollbackError);
    }

    console.error(error);
    return res
      .status(500)
      .json({ message: error.message || "Internal server error" });
  }
};

// exports.newcustomer = async (req, res) => {
//   try {
//     // Fetch the maximum existing CustID from the database
//     const maxCustomer = await Customer.findOne({
//       attributes: [[sequelize.fn("MAX", sequelize.col("CustID")), "maxCustID"]],
//     });
//     let maxCustID = 0;
//     if (maxCustomer && maxCustomer.get("maxCustID")) {
//       maxCustID = parseInt(maxCustomer.get("maxCustID").substring(4), 10);
//     }
//     // Increment the maximum CustID to generate the next ID
//     maxCustID++;
//     const paddedCounter = maxCustID.toString().padStart(7, "0");
//     const generatedId = `CUST${paddedCounter}`;

//     if (!req.body.AadharNumber) {
//       res.status(400).send({
//         message: "Content can not be empty!",
//       });
//       return;
//     }
//     // create customers in customertable and generate custid
//     const createCustomer = {
//       EnquiryDate: req.body.EnquiryDate,
//       EnquiryStatus: req.body.EnquiryStatus,
//       EnquiryNo: req.body.EnquiryNo,
//       Source: req.body.Source,
//       CustomerType: req.body.CustomerType,
//       Tittle: req.body.TitleName,
//       FirstName: req.body.FirstName,
//       LastName: req.body.LastName,
//       PhoneNumber: req.body.PhoneNumber,
//       OfficeNumber: req.body.OfficePhone,
//       Email: req.body.EmailId,
//       Occupation: req.body.SubCompany,
//       DateOfBirth: req.body.DateofBirth,
//       DateOfAnnversary: req.body.DateofWedding,
//       Address: req.body.Address,
//       District: req.body.District,
//       State: req.body.StateDesc,
//       Pincode: req.body.PinCode,
//       ModelName: req.body.ModelName,
//       VariantName: req.body.VariantName,
//       FuelType: req.body.FuelType,
//       CustID: generatedId,
//       AadharNumber: req.body.AadharNumber,
//       PANNumber: req.body.PANNumber,
//       DrivingLicence: req.body.DrivingLicence,
//       GSTIN: req.body.GSTIN,
//       GstType: req.body.GstType,
//       AccountHolderName: req.body.AccountHolderName,
//       AccountNumber: req.body.AccountNumber,
//       IFSCCode: req.body.IFSCCode,
//       Bank: req.body.Bank,
//       BranchDetails: req.body.BranchDetails,
//       IsActive: req.body.IsActive ? req.body.IsActive : true,
//       KycStatus: req.body.KycStatus ? req.body.KycStatus : false,
//       CustomerStatus: req.body.CustomerStatus ? req.body.CustomerStatus : false,
//       Company: req.body.Company, // Ensure this field is handled
//     };

//     const Customerdata = await Customer.create(createCustomer);

//     // Add documents in doctable
//     const documents = req.body.documents.map((doc) => ({
//       CustomerID: Customerdata.CustomerId,
//       CustRelation: doc.CustRelation,
//       DocType: doc.DocType,
//       DocURL: doc.DocURL,
//       DocStatus: "Pending",
//     }));

//     const createdDocuments = await CustomerDocumentDetails.bulkCreate(
//       documents
//     );

//     // create Gst Table
//     const gstDetailsData = {
//       CustomerID: Customerdata.CustomerId,
//       GSTIN: req.body.GSTDetails.GSTIN, // Use correct field from request body
//       RegistrationType: req.body.GSTDetails.RegistrationType,
//       LegalName: req.body.GSTDetails.LegalName,
//       TradeName: req.body.GSTDetails.TradeName,
//       DOR: req.body.GSTDetails.DOR,
//       EntityType: req.body.GSTDetails.EntityType,
//       Address: req.body.GSTDetails.Address,
//       StateID: req.body.GSTDetails.StateID,
//       PinCode: req.body.GSTDetails.PinCode,
//       DocID: req.body.GSTDetails.DocID,
//     };

//     const cstGSTdetail = await custmerGSTdetails.create(gstDetailsData);

//     // create document verification
//     const docverifications = [];
//     // Iterate over each created document and create corresponding docverfication record
//     createdDocuments.forEach((document) => {
//       const docverfication = {
//         CustomerID: Customerdata.CustomerId,
//         DocID: document.DocID, // Assuming DocID is the primary key or unique identifier for documents
//         UploadBy: req.body.UploadBy,
//         GSTID: cstGSTdetail.GSTID,
//         Status: "Pending",
//       };
//       docverifications.push(docverfication);
//     });

//     // Bulk create docverifications
//     const createdDocVerifications = await docverify.bulkCreate(
//       docverifications
//     );

//     return res.status(200).json({
//       message: "Customer created successfully",
//       Customerdata,
//       createdDocuments,
//       cstGSTdetail,
//       createdDocVerifications,
//     });
//   } catch (error) {
//     console.error(error);
//     return res
//       .status(500)
//       .json({ message: error.message || "Internal server error" });
//   }
// };

exports.updatecustomer = async (req, res) => {
  const CustomerID = req.body.CustomerID;
  console.log("CustomerID:", CustomerID);

  try {
    if (!CustomerID) {
      return res.status(400).json({ message: "CustomerID is required." });
    }

    // Find the customer
    const customerDetails = await Customer.findByPk(CustomerID);
    if (!customerDetails) {
      return res
        .status(404)
        .json({ message: `Customer record with id=${CustomerID} not found` });
    }

    let msmeDetails = null;

    // Check for MSME details if MSMEID is provided
    if (customerDetails.MSMEID) {
      msmeDetails = await MSMEInfo.findByPk(customerDetails.MSMEID);
      if (!msmeDetails) {
        return res.status(404).json({
          message: `MSME record with id=${customerDetails.MSMEID} not found`,
        });
      }

      // Update MSME details
      const {
        RegistrationType,
        DateOfRegistration,
        NameOfEnterprise,
        RegistrationNo,
      } = req.body;

      if (
        RegistrationType ||
        DateOfRegistration ||
        NameOfEnterprise ||
        RegistrationNo
      ) {
        msmeDetails.RegistrationType =
          RegistrationType || msmeDetails.RegistrationType;
        msmeDetails.DateOfRegistration =
          DateOfRegistration || msmeDetails.DateOfRegistration;
        msmeDetails.NameOfEnterprise =
          NameOfEnterprise || msmeDetails.NameOfEnterprise;
        msmeDetails.RegistrationNo =
          RegistrationNo || msmeDetails.RegistrationNo;
        msmeDetails.ModifiedDate = new Date();

        await msmeDetails.save();
      }
    }

    // Update customer attributes
    const {
      CustomerType,
      Title,
      FirstName,
      LastName,
      PhoneNo,
      OfficeNo,
      Email,
      Gender,
      RelationName,
      RelationType,
      Occupation,
      Company,
      DateOfBirth,
      DateOfAnniversary,
      Address,
      DistrictID,
      StateID,
      PINCode,
      ModelName,
      VariantName,
      ColourName,
      FuelType,
      AadharNo,
      Transmission,
      PANNo,
      DrivingLicence,
      GSTIN,
      GstType,
      AccountHolderName,
      AccountNo,
      IFSCCode,
      BankID,
      BranchDetails,
      IsActive,
      KycStatus,
      CustomerStatus,
    } = req.body;

    customerDetails.CustomerType = CustomerType || customerDetails.CustomerType;
    customerDetails.Title = Title || customerDetails.Title;
    customerDetails.FirstName = FirstName || customerDetails.FirstName;
    customerDetails.LastName = LastName || customerDetails.LastName;
    customerDetails.PhoneNo = PhoneNo || customerDetails.PhoneNo;
    customerDetails.OfficeNo = OfficeNo || customerDetails.OfficeNo;
    customerDetails.Email = Email || customerDetails.Email;
    customerDetails.Occupation = Occupation || customerDetails.Occupation;
    customerDetails.Company = Company || customerDetails.Company;
    customerDetails.DateOfBirth = DateOfBirth || customerDetails.DateOfBirth;
    customerDetails.DateOfAnniversary =
      DateOfAnniversary || customerDetails.DateOfAnniversary;
    customerDetails.Address = Address || customerDetails.Address;
    customerDetails.Gender = Gender || customerDetails.Gender;
    customerDetails.RelationName = RelationName || customerDetails.RelationName;
    customerDetails.RelationType = RelationType || customerDetails.RelationType;
    customerDetails.DistrictID = DistrictID || customerDetails.DistrictID;
    customerDetails.StateID = StateID || customerDetails.StateID;
    customerDetails.PINCode = PINCode || customerDetails.PINCode;
    customerDetails.ModelName = ModelName || customerDetails.ModelName;
    customerDetails.VariantName = VariantName || customerDetails.VariantName;
    customerDetails.ColourName = ColourName || customerDetails.ColourName;
    customerDetails.FuelType = FuelType || customerDetails.FuelType;
    customerDetails.Transmission = Transmission || customerDetails.Transmission;
    customerDetails.AadharNo = AadharNo || customerDetails.AadharNo;
    customerDetails.PANNo = PANNo || customerDetails.PANNo;
    customerDetails.DrivingLicence =
      DrivingLicence || customerDetails.DrivingLicence;
    customerDetails.GSTIN = GSTIN || customerDetails.GSTIN;
    customerDetails.GstType = GstType || customerDetails.GstType;
    customerDetails.AccountHolderName =
      AccountHolderName || customerDetails.AccountHolderName;
    customerDetails.AccountNo = AccountNo || customerDetails.AccountNo;
    customerDetails.IFSCCode = IFSCCode || customerDetails.IFSCCode;
    customerDetails.BankID = BankID || customerDetails.BankID;
    customerDetails.BranchDetails =
      BranchDetails || customerDetails.BranchDetails;
    customerDetails.IsActive =
      IsActive !== undefined ? IsActive : customerDetails.IsActive;
    customerDetails.KycStatus =
      KycStatus !== undefined ? KycStatus : customerDetails.KycStatus;
    customerDetails.CustomerStatus =
      CustomerStatus !== undefined
        ? CustomerStatus
        : customerDetails.CustomerStatus;

    customerDetails.ModifiedDate = new Date();

    // Save the updated customer record
    await customerDetails.save();

    // Prepare the response object
    const response = {
      message: `Customer record with id=${CustomerID} was updated successfully`,
      customerDetails: {
        CustomerID: customerDetails.CustomerID,
        CustomerType: customerDetails.CustomerType,
        CustID: customerDetails.CustID,
        Title: customerDetails.Title,
        FirstName: customerDetails.FirstName,
        LastName: customerDetails.LastName,
        PhoneNo: customerDetails.PhoneNo,
        OfficeNo: customerDetails.OfficeNo,
        Email: customerDetails.Email,
        Occupation: customerDetails.Occupation,
        Company: customerDetails.Company,
        DateOfBirth: customerDetails.DateOfBirth,
        DateOfAnniversary: customerDetails.DateOfAnniversary,
        Address: customerDetails.Address,
        Gender: customerDetails.Gender,
        RelationName: customerDetails.RelationName,
        RelationType: customerDetails.RelationType,
        DistrictID: customerDetails.DistrictID,
        StateID: customerDetails.StateID,
        PINCode: customerDetails.PINCode,
        ModelName: customerDetails.ModelName,
        VariantName: customerDetails.VariantName,
        FuelType: customerDetails.FuelType,
        AadharNo: customerDetails.AadharNo,
        PANNo: customerDetails.PANNo,
        DrivingLicence: customerDetails.DrivingLicence,
        GSTIN: customerDetails.GSTIN,
        GstType: customerDetails.GstType,
        AccountHolderName: customerDetails.AccountHolderName,
        AccountNo: customerDetails.AccountNo,
        IFSCCode: customerDetails.IFSCCode,
        BankID: customerDetails.BankID,
        BranchDetails: customerDetails.BranchDetails,
        IsActive: customerDetails.IsActive,
        KycStatus: customerDetails.KycStatus,
        CustomerStatus: customerDetails.CustomerStatus,
        CreatedDate: customerDetails.CreatedDate,
        ModifiedDate: customerDetails.ModifiedDate,
        MSMEID: customerDetails.MSMEID,
        RegistrationType: msmeDetails ? msmeDetails.RegistrationType : null,
        DateOfRegistration: msmeDetails ? msmeDetails.DateOfRegistration : null,
        NameOfEnterprise: msmeDetails ? msmeDetails.NameOfEnterprise : null,
        RegistrationNo: msmeDetails ? msmeDetails.RegistrationNo : null,
      },
    };

    res.status(200).json(response);
  } catch (err) {
    console.error("Error updating customer record:", err);
    res.status(500).json({
      message: `Error updating customer record with id=${CustomerID}`,
      error: err.message,
    });
  }
};

exports.GetCustomerByID = async (req, res) => {
  const CustomerID = req.body.CustomerID;
  try {
    const customerDetails = await Customer.findByPk(CustomerID, {
      include: [
        {
          model: MSMEInfo,
          as: "CMMSMEID", // Use the correct alias for the association
          attributes: [
            "CustomerID",
            "RegistrationType",
            "DateOfRegistration",
            "NameOfEnterprise",
            "RegistrationNo",
            "IsActive",
            "Status",
          ],
          required: false, // Include MSMEInfo even if there is no matching record
        },
      ],
    });

    console.log(customerDetails);
    if (!customerDetails) {
      return res
        .status(404)
        .json({ message: `Customer record with id=${CustomerID} not found` });
    }
    return res.status(200).json({ customerDetails });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: error.message || "Internal server error" });
  }
};

// exports.newcustomer = async (req, res) => {
//   try {
//     // Fetch the maximum existing CustID from the database
//     const maxCustomer = await Customer.findOne({
//       attributes: [[sequelize.fn("MAX", sequelize.col("CustID")), "maxCustID"]],
//     });
//     let maxCustID = 0;
//     if (maxCustomer && maxCustomer.get("maxCustID")) {
//       maxCustID = parseInt(maxCustomer.get("maxCustID").substring(4), 10);
//     }
//     // Increment the maximum CustID to generate the next ID
//     maxCustID++;
//     const paddedCounter = maxCustID.toString().padStart(7, "0");
//     const generatedId = `CUST${paddedCounter}`;

//     if (!req.body.AadharNumber) {
//       res.status(400).send({
//         message: "Content can not be empty!"
//       });
//       return;
//     }
//     // create customers in customertable and generate custid
//     const createCutsomer = {
//       EnquiryDate: req.body.EnquiryDate,
//       EnquiryStatus: req.body.EnquiryStatus,
//       EnquiryNo: req.body.EnquiryNo,
//       Source: req.body.Source,
//       CustomerType: req.body.CustomerType,
//       Tittle: req.body.TitleName,
//       FirstName: req.body.FirstName,
//       LastName: req.body.LastName,
//       PhoneNumber: req.body.PhoneNumber,
//       OfficeNumber: req.body.OfficePhone,
//       Email: req.body.EmailId,
//       Occupation: req.body.SubCompany,
//       DateOfBirth: req.body.DateofBirth,
//       DateOfAnnversary: req.body.DateofWedding,
//       Address: req.body.Address,
//       District: req.body.District,
//       State: req.body.StateDesc,
//       Pincode: req.body.PinCode,
//       ModelName: req.body.ModelName,
//       VariantName: req.body.VariantName,
//       FuelType: req.body.FuelType,
//       CustID: generatedId,
//       AadharNumber: req.body.AadharNumber,
//       PANNumber: req.body.PANNumber,
//       DrivingLicence: req.body.DrivingLicence,
//       GSTIN: req.body.GSTIN,
//       GstType: req.body.GstType,
//       AccountHolderName: req.body.AccountHolderName,
//       AccountNumber: req.body.AccountNumber,
//       IFSCCode: req.body.IFSCCode,
//       Bank: req.body.Bank,
//       BranchDetails: req.body.BranchDetails,
//       IsActive: req.body.IsActive ? req.body.IsActive : true,
//       KycStatus: req.body.KycStatus ? req.body.KycStatus : false,
//       CustomerStatus: req.body.CustomerStatus ? req.body.CustomerStatus : false,
//     };
//     const Customerdata = await Customer.create(createCutsomer);

//      // Add documents in doctable
//      const documents = req.body.documents.map(doc => ({
//       CustomerID: Customerdata.CustomerId,
//       CustRelation: doc.CustRelation,
//       DocType: doc.DocType,
//       DocURL: doc.DocURL,
//       DocStatus: "Pending",
//     }));

//     const createdDocuments = await CustomerDocumentDetails.bulkCreate(
//       documents
//     );
// // create Gst Table
//     const gstDetailsData = {
//       CustomerID: Customerdata.CustomerId,
//       GSTIN: req.body.GSTIN,
//       RegistrationType: req.body.RegistrationType,
//       LegalName: req.body.LegalName,
//       TradeName: req.body.TradeName,
//       DOR: req.body.DOR,
//       EntityType: req.body.EntityType,
//       Address: req.body.Address,
//       StateID: req.body.StateID,
//       PinCode: req.body.PinCode,
//       DocID: req.body.DocID,
//     };
//     const cstGSTdetail = await custmerGSTdetails.create(gstDetailsData);

// // create document verfication

// const docverfication = req.body.docverfication.map(doc1 => ({
//   CustomerID: Customerdata.CustomerId,
//   DocID: doc1.DocID,
//   UploadBy: req.body.UploadBy,
//   GSTID: cstGSTdetail.GSTID,
//   Status: "Pending",
// }));

// const createdDocVerifications = await docverify.bulkCreate(
//   docverfication
// );

//     return res.status(200).json({
//       message: "Customer created successfully",
//       Customerdata,
//       createdDocuments,
//       cstGSTdetail,
//       createdDocVerifications

//     });
//   } catch (error) {
//     console.error(error);
//     return res
//       .status(500)
//       .json({ message: error.message || "Internal server error" });
//   }
// };

// const db = require("../models");
// const Enquiry = db.enquirys;
// const Customer = db.customers;
// const CustomerDocumentDetails = db.customerdocumentdetails;
// const GstDetails = db.gstdetails;
// const DocVerification = db.DocVerfication;
// const { Sequelize, sequelize } = db;
// const multer = require('multer');
// const path = require('path');

// // Multer setup
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'C:\\Users\\varun\\OneDrive\\Desktop\\photo'); // Ensure 'Images' directory exists
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname));
//   }
// });

// const upload = multer({
//   storage: storage,
//   limits: { fileSize: 1000000 },
//   fileFilter: (req, file, cb) => {
//     const fileTypes = /jpeg|jpg|png|gif/;
//     const mimeType = fileTypes.test(file.mimetype);
//     const extname = fileTypes.test(path.extname(file.originalname));

//     if (mimeType && extname) {
//       cb(null, true);
//     } else {
//       cb(new Error('Give proper files format to upload'));
//     }
//   }
// }).array('DocURL'); // Ensure 'image' matches the field name in your request

// // Middleware to handle image upload
// exports.uploadImage = (req, res, next) => {
//   upload(req, res, (err) => {
//     if (err) {
//       return res.status(400).json({ error: err.message });
//     }
//     next(); // Call next middleware function (in this case, the 'create' function)
//   });
// };

// // Create customer
// exports.create = async (req, res) => {
//   try {
//     const { userId: UserId, EnquiryID: EnquiryID } = req.body;

//     if (!UserId || !EnquiryID) {
//       return res.status(400).json({ status: 'error', message: 'UserId and EnquiryId are required in the request body.' });
//     }

//     // Fetch enquiry data by ID
//     const getEnquiryByIdQuery = `
//       SELECT public."EnquiryDMS".*, "Users"."UserId"
//       FROM public."EnquiryDMS"
//       INNER JOIN public."Users" ON "Users"."OEMID" = "EnquiryDMS"."DSECode"
//       WHERE "Users"."UserId" = ${UserId} and "EnquiryDMS"."EnquiryID"= ${EnquiryID};
//     `;

//     const enquiryData = await sequelize.query(getEnquiryByIdQuery, {
//       replacements: { UserId, EnquiryID },
//       type: Sequelize.QueryTypes.SELECT
//     });

//     // Extract desired fields from enquiry data
//     const desiredFields = ["EnquiryID","Date","EnquiryStatus","EnquiryNo", "Source", "CustomerType","Title","FirstName","MobileNumber","OfficePhone",
//     "EmailID","SubCompany","DateofBirth","DateofAnniversary","Address","District","StateDesc","PinCode","Model","Variant","FuelType","Branch","User"]; // Replace with your desired fields

//     const filteredEnquiryData = enquiryData.map(enquiry => {
//       return desiredFields.reduce((acc, field) => {
//         acc[field] = enquiry[field];
//         return acc;
//       }, {});
//     });

//     // Generate new customer ID
//     const maxCustomer = await Customer.findOne({
//       attributes: [
//         [sequelize.fn('MAX', sequelize.col('CustID')), 'maxCustID']
//       ]
//     });
//     let maxCustID = 0;
//     if (maxCustomer && maxCustomer.get('maxCustID')) {
//       maxCustID = parseInt(maxCustomer.get('maxCustID').substring(4), 10);
//     }
//     maxCustID++;
//     const paddedCounter = maxCustID.toString().padStart(7, '0');
//     const generatedId = `CUST${paddedCounter}`;

//     console.log("///////////",filteredEnquiryData);
//     // Create customer
//     const createCustomerData = {
//       ...filteredEnquiryData[0],
//       CustID: generatedId,
//       AadharNumber: req.body.AadharNumber,
//       PANNumber: req.body.PANNumber,
//       DrivingLicence: req.body.DrivingLicence,
//       GSTIN: req.body.GSTIN,
//       GstType: req.body.GstType,
//       AccountHolderName: req.body.AccountHolderName,
//       AccountNumber: req.body.AccountNumber,
//       IFSCCode: req.body.IFSCCode,
//       Bank: req.body.Bank,
//       BranchDetails: req.body.BranchDetails,
//       IsActive: req.body.IsActive ? req.body.IsActive : true,
//       KycStatus: req.body.KycStatus ? req.body.KycStatus : false,
//       CustomerStatus: req.body.CustomerStatus ? req.body.CustomerStatus : false,
//     };

//     const customerData = await Customer.create(createCustomerData);

//     // Create customer documents
//     const documents = req.files.map(file => ({
//       CustomerID: customerData.CustomerId,
//       CustRelation: req.body.CustRelation,
//       DocType: req.body.DocType,
//       DocURL: file.path,
//       DocStatus: "Pending"
//     }));

//     const createdDocuments = await CustomerDocumentDetails.bulkCreate(documents);

//     // Create GST details
//     const gstDetailsData = {
//       CustomerID: customerData.CustomerId,
//       GSTIN: req.body.GSTIN,
//       RegistrationType: req.body.RegistrationType,
//       LegalName: req.body.LegalName,
//       TradeName: req.body.TradeName,
//       DOR: req.body.DOR,
//       EntityType: req.body.EntityType,
//       Address: req.body.Address,
//       StateID: req.body.StateID,
//       PinCode: req.body.PinCode,
//       DocID: req.body.DocID
//     };

//     const createdGstDetails = await GstDetails.create(gstDetailsData);

//     // Create document verifications
//     const docVerifications = createdDocuments.map(document => ({
//       CustomerID: customerData.CustomerId,
//       DocID: document.DocID,
//       UploadBy: req.body.UploadBy,
//       GSTID: createdGstDetails.GSTID,
//       Status: "Pending",
//     }));

//     const createdDocVerifications = await DocVerification.bulkCreate(docVerifications);

//     return res.status(200).json({
//       message: 'Customer created successfully',
//       customerData,
//       createdDocuments,
//       createdGstDetails,
//       createdDocVerifications
//     });

//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: error.message || 'Internal server error' });
//   }
// };

// function getStatus(documentList) {
//   let status = "Pending"; // Default status

//   // Iterate over each document in the list
//   for (const document of documentList) {
//     // Extract DocumentAs and Doctype from the document dataValues
//     const { DocumentAs, Doctype } = document.dataValues;

//     // Write conditions based on the document attributes
//     if (DocumentAs === "ID Proof" && Doctype === "Pan Card") {
//       if (DocumentAs === "Address Proof") status = "Approved";
//       // No need to check further, as 'Approved' status found
//       break;
//     } else if (DocumentAs === "ID Proof" || DocumentAs === "Address Proof") {
//       status = "Partial";
//     } else {
//       status = "Pending";
//     }
//     // Add more conditions if needed for other document types
//   }

//   return status;
// }

//Retrieve all stock from the database
exports.findAllKYCData = async (req, res) => {
  try {
    const data = await db.customermaster.findAll({
      attributes: [
        "CustomerID",
        "FirstName",
        "PhoneNo",
        "District",
        "KycStatus",
      ],
    });
    const customerIds = data.map((customer) => customer.CustomerID);
    console.log("***********", customerIds);

    // Retrieve EmpID from custmap table using the customerIds array
    const mapData = await custmap.findAll({
      attributes: ["EMPID"],
      where: {
        CustomerID: customerIds, // Filter custmap table based on CustomerID from customerIds array
      },
    });
    console.log("***********", mapData);

    const empIds = mapData.map((emp) => emp.EMPID);
    console.log("***********", empIds);

    // Retrieve UserName and Branch from UserMaster table using empIds array
    const userData = await usermaster.findAll({
      attributes: ["UserName", "Branch"],
      where: {
        EmpID: empIds, // Filter UserMaster table based on EmpID from empIds array
      },
    });
    console.log("***********", userData);

    if (!data || data.length === 0) {
      // If no data found, send a 404 response
      return res.status(404).send({ message: "No BranchIndents found." });
    }
    // Send the data in the response
    res.send(userData);
  } catch (err) {
    console.error("Error occurred while retrieving BranchIndents:", err);
    res.status(500).send({
      message: "Internal server error occurred while retrieving BranchIndents.",
      error: err.message, // Sending the error message for debugging purposes
    });
  }
};

exports.GetCustDocStatus = async (req, res) => {
  const condition = {
    CustomerID: req.query.CustomerID,
  };
  console.log(condition);
  try {
    // Perform database query to find all entries with the given CustomerID
    const data = await docverify.findAll({ where: condition });

    // Check if data is empty
    if (!data || data.length === 0) {
      return res.status(404).send({
        message: "docverify not found with CustomerID=" + req.query.CustomerID,
      });
    }
    // Send the data
    res.json(data);
  } catch (err) {
    // Handle database errors
    console.error("Error retrieving docverify:", err);
    res.status(500).send({
      message:
        "Error retrieving docverify with CustomerID=" + req.query.CustomerID,
    });
  }
};

exports.GetCustDocSt = async (req, res) => {
  const condition = {
    CustomerID: req.query.CustomerID,
  };
  console.log(condition);
  try {
    // Perform database query to find all entries with the given CustomerID
    const data = await custmerGSTdetails.findAll({ where: condition });

    // Check if data is empty
    if (!data || data.length === 0) {
      return res.status(404).send({
        message: "docverify not found with CustomerID=" + req.query.CustomerID,
      });
    }
    // Send the data
    res.json(data);
  } catch (err) {
    // Handle database errors
    console.error("Error retrieving docverify:", err);
    res.status(500).send({
      message:
        "Error retrieving docverify with CustomerID=" + req.query.CustomerID,
    });
  }
};

// exports.PendingkycList = async (req, res) => {
//   const condition = {
//     KycStatus: "Pending",
//   };
//   console.log(condition);
//   try {
//     const data = await Customer.findAll({ where: condition });
//     // Check if data is empty
//     if (!data || data.length === 0) {
//       return res.status(404).send({
//         message: "no data found",
//       });
//     }
//     // Send the data
//     res.json(data);
//   } catch (error) {
//     console.error(error);
//     return res
//       .status(500)
//       .json({ message: error.message || "Internal server error" });
//   }
// };

exports.PendingkycList = async (req, res) => {
  const condition = {
    KycStatus: {
      [Op.in]: ["Pending", "Partial"],
    },
  };

  try {
    const data = await Customer.findAll({
      where: condition,
      attributes: [
        "CustomerID",
        "CustomerType",
        "CustID",
        "Title",
        "FirstName",
        "LastName",
        "PhoneNo",
        "OfficeNo",
        "Email",
        "Occupation",
        "Company",
        "DateOfBirth",
        "DateOfAnniversary",
        "Address",
        "PINCode",
        "AadharNo",
        "PANNo",
        "DrivingLicence",
        "AccountHolderName",
        "AccountNo",
        "IFSCCode",
        "BranchDetails",
        "IsActive",
        "KycStatus",
        "CustomerStatus",
        "CreatedDate",
        "ModifiedDate",
        "ModelName",
        "VariantName",
        "FuelType",
        "ColourName",
        "Transmission",
        "BankID", // Ensure BankID is selected if needed
      ],
      include: [
        {
          model: RegionMaster,
          as: "CMRegionID",
          attributes: ["RegionName"],
        },
        {
          model: Statemaster,
          as: "CMStateID",
          attributes: ["StateName"],
        },
        {
          model: usermaster,
          as: "CMEmployees",
          attributes: ["UserName", "Branch"],
          required: false, // Optional: This ensures it's a LEFT JOIN
          through: {
            attributes: [],
          },
        },
      ],
      order: [
        ["CreatedDate", "DESC"], // Order by ModelDescription in ascending order
      ],
    });

    // Check if data is empty
    if (!data || data.length === 0) {
      return res.status(404).send({
        message: "No data found",
      });
    }

    console.log("Customer data:", data);

    // Extract BankIDs from the customers data
    const bankIDs = data
      .map((customer) => customer.BankID)
      .filter((bankID) => bankID);

    // Fetch bank data based on the extracted BankIDs
    let bankData = [];
    if (bankIDs.length > 0) {
      bankData = await BankMaster.findAll({
        where: {
          BankID: bankIDs,
        },
      });
    }

    // Create a map for quick bank name lookup
    const bankMap = bankData.reduce((acc, bank) => {
      acc[bank.BankID] = bank.BankName;
      return acc;
    }, {});

    // // Log UserName and Branch for each Customer before mapping
    // data.forEach((item) => {
    //   if (item.CMEmployees) {
    //     console.log("UserName:", item.CMEmployees.UserName);
    //     console.log("Branch:", item.CMEmployees.Branch);
    //   } else {
    //     console.log(
    //       "No CMEmployees data found for CustomerID:",
    //       item.CustomerID
    //     );
    //   }
    // });

    // Map customer data to include bank names and employee details
    const response = data.map((item) => ({
      CustomerID: item.CustomerID,
      CustomerType: item.CustomerType,
      CustID: item.CustID,
      Title: item.Title,
      FirstName: item.FirstName,
      LastName: item.LastName,
      PhoneNo: item.PhoneNo,
      OfficeNo: item.OfficeNo,
      Email: item.Email,
      Occupation: item.Occupation,
      Company: item.Company,
      DateOfBirth: item.DateOfBirth,
      DateOfAnniversary: item.DateOfAnniversary,
      Address: item.Address,
      PINCode: item.PINCode,
      AadharNo: item.AadharNo,
      PANNo: item.PANNo,
      DrivingLicence: item.DrivingLicence,
      AccountHolderName: item.AccountHolderName,
      AccountNo: item.AccountNo,
      IFSCCode: item.IFSCCode,
      BranchDetails: item.BranchDetails,
      IsActive: item.IsActive,
      KycStatus: item.KycStatus,
      CustomerStatus: item.CustomerStatus,
      CreatedDate: item.CreatedDate,
      ModifiedDate: item.ModifiedDate,
      ModelName: item.ModelName,
      VariantName: item.VariantName,
      FuelType: item.FuelType,
      ColourName: item.ColourName,
      Transmission: item.Transmission,
      District: item.CMRegionID ? item.CMRegionID.RegionName : null,
      State: item.CMStateID ? item.CMStateID.StateName : null,
      BankName: bankMap[item.BankID] || null,
      ExecutiveName:
        item.CMEmployees.length > 0 ? item.CMEmployees[0].UserName : null,
      EmpBranch:
        item.CMEmployees.length > 0 ? item.CMEmployees[0].Branch : null,
    }));

    // Send the response
    res.json(response);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: error.message || "Internal server error" });
  }
};

// exports.ApprovedkycList = async (req, res) => {
//   const condition = {
//     KycStatus: "Approved",
//   };

//   console.log("Condition:", condition);
//   try {
//     const data = await Customer.findAll(
//       {
//         order: [
//           ["CreatedDate", "DESC"], // Order by ModelDescription in ascending order
//         ],
//       },
//       { where: condition }
//     );

//     // Check if data is empty
//     if (!data || data.length === 0) {
//       return res.status(404).send({
//         message: "No data found",
//       });
//     }

//     // Send the data
//     res.json(data);
//   } catch (error) {
//     console.error(error);
//     return res
//       .status(500)
//       .json({ message: error.message || "Internal server error" });
//   }
// };

exports.ApprovedkycList = async (req, res) => {
  const condition = {
    KycStatus: "Full-KYC",
  };

  try {
    const data = await Customer.findAll({
      where: condition,
      attributes: [
        "CustomerID",
        "CustomerType",
        "CustID",
        "Title",
        "FirstName",
        "LastName",
        "PhoneNo",
        "OfficeNo",
        "Email",
        "Occupation",
        "Company",
        "DateOfBirth",
        "DateOfAnniversary",
        "Address",
        "PINCode",
        "AadharNo",
        "PANNo",
        "DrivingLicence",
        "AccountHolderName",
        "AccountNo",
        "IFSCCode",
        "BranchDetails",
        "IsActive",
        "KycStatus",
        "CustomerStatus",
        "CreatedDate",
        "ModifiedDate",
        "ModelName",
        "VariantName",
        "FuelType",
        "ColourName",
        "Transmission",
        "BankID", // Ensure BankID is selected if needed
      ],
      include: [
        {
          model: RegionMaster,
          as: "CMRegionID",
          attributes: ["RegionName"],
        },
        {
          model: Statemaster,
          as: "CMStateID",
          attributes: ["StateName"],
        },
        {
          model: usermaster,
          as: "CMEmployees",
          attributes: ["UserName", "Branch"],
          required: false, // Optional: This ensures it's a LEFT JOIN
          through: {
            attributes: [],
          },
        },
      ],
      order: [
        ["CreatedDate", "DESC"], // Order by CreatedDate in descending order
      ],
    });

    // Check if data is empty
    if (!data || data.length === 0) {
      return res.status(404).send({
        message: "No data found",
      });
    }

    console.log("Approved Customer data:", data);

    // Extract BankIDs from the customers data
    const bankIDs = data
      .map((customer) => customer.BankID)
      .filter((bankID) => bankID);

    // Fetch bank data based on the extracted BankIDs
    let bankData = [];
    if (bankIDs.length > 0) {
      bankData = await BankMaster.findAll({
        where: {
          BankID: bankIDs,
        },
      });
    }

    // Create a map for quick bank name lookup
    const bankMap = bankData.reduce((acc, bank) => {
      acc[bank.BankID] = bank.BankName;
      return acc;
    }, {});

    // Map customer data to include bank names and employee details
    const response = data.map((item) => ({
      CustomerID: item.CustomerID,
      CustomerType: item.CustomerType,
      CustID: item.CustID,
      Title: item.Title,
      FirstName: item.FirstName,
      LastName: item.LastName,
      PhoneNo: item.PhoneNo,
      OfficeNo: item.OfficeNo,
      Email: item.Email,
      Occupation: item.Occupation,
      Company: item.Company,
      DateOfBirth: item.DateOfBirth,
      DateOfAnniversary: item.DateOfAnniversary,
      Address: item.Address,
      PINCode: item.PINCode,
      AadharNo: item.AadharNo,
      PANNo: item.PANNo,
      DrivingLicence: item.DrivingLicence,
      AccountHolderName: item.AccountHolderName,
      AccountNo: item.AccountNo,
      IFSCCode: item.IFSCCode,
      BranchDetails: item.BranchDetails,
      IsActive: item.IsActive,
      KycStatus: item.KycStatus,
      CustomerStatus: item.CustomerStatus,
      CreatedDate: item.CreatedDate,
      ModifiedDate: item.ModifiedDate,
      ModelName: item.ModelName,
      VariantName: item.VariantName,
      FuelType: item.FuelType,
      ColourName: item.ColourName,
      Transmission: item.Transmission,
      District: item.CMRegionID ? item.CMRegionID.RegionName : null,
      State: item.CMStateID ? item.CMStateID.StateName : null,
      BankName: bankMap[item.BankID] || null,
      ExecutiveName:
        item.CMEmployees.length > 0 ? item.CMEmployees[0].UserName : null,
      EmpBranch:
        item.CMEmployees.length > 0 ? item.CMEmployees[0].Branch : null,
    }));

    // Send the response
    res.json(response);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: error.message || "Internal server error" });
  }
};

exports.acceptKyc = async (req, res) => {
  const { CustomerID, DocID, Status, Remarks, EmpID } = req.body;

  console.log("CustomerID:", CustomerID);
  console.log("DocID:", DocID);
  console.log("Status:", Status);
  console.log("Remarks:", Remarks);
  console.log("EmpID:", EmpID);

  try {
    // Perform database query to find all entries with the given CustomerID and DocID
    const custDocVerification = await custdocverification.findAll({
      where: {
        CustomerID: CustomerID,
        DocID: DocID,
      },
    });

    // Check if data is empty
    if (!custDocVerification || custDocVerification.length === 0) {
      return res.status(404).send({
        message: `Customer not found with CustomerID=${CustomerID} and DocID=${DocID}`,
      });
    }

    // Update each customer's KycStatus
    for (const docVerify of custDocVerification) {
      docVerify.Status = Status || docVerify.Status;
      docVerify.Remarks = Remarks || docVerify.Remarks;
      docVerify.ApprovedBy = EmpID || docVerify.ApprovedBy;
      docVerify.ModifiedDate = new Date();
      await docVerify.save();
    }

    // Fetch all documents for the customer
    const allDocs = await custdocverification.findAll({
      where: {
        CustomerID: CustomerID,
      },
    });

    // Determine the overall document status
    let docStatus = "Pending";
    let hasApproved = false;
    let allApproved = true;

    for (const doc of allDocs) {
      if (doc.Status === "Approved") {
        hasApproved = true;
      }
      if (doc.Status !== "Approved") {
        allApproved = false;
      }
    }

    if (allApproved) {
      docStatus = "Approved";
    } else if (hasApproved) {
      docStatus = "Partial";
    }

    // Update the CustomerMaster with the final DocStatus
    await Customer.update(
      { DocStatus: docStatus, ModifiedDate: new Date() },
      { where: { CustomerID: CustomerID } }
    );

    // Send the data
    res.status(200).send({
      message: "Accepted Successfully",
    });
  } catch (err) {
    // Handle database errors
    console.error("Error updating customer status:", err);
    res.status(500).send({
      message: `Error updating customer status with CustomerID=${CustomerID} and DocID=${DocID}`,
    });
  }
};

exports.ViewCustData = async (req, res) => {
  const customerID = req.params.id;
  console.log("Customer ID is:", customerID);

  try {
    // Fetch customer data by CustomerID
    const customerData = await Customer.findOne({
      where: { CustomerID: customerID },
      include: [
        {
          model: RegionMaster,
          as: "CMRegionID",
          attributes: ["RegionID", "RegionName"],
        },
        {
          model: Statemaster,
          as: "CMStateID",
          attributes: ["StateID", "StateName"],
        },
        {
          model: MSMEInfo,
          as: "CMMSMEID",
          attributes: [
            "CustomerID",
            "RegistrationType",
            "DateOfRegistration",
            "NameOfEnterprise",
            "RegistrationNo",
          ],
        },
      ],
    });

    if (!customerData) {
      return res.status(404).send({ message: "No customer data found" });
    }

    const docInfoData = await CustomerDocumentDetails.findAll({
      where: { CustomerID: customerData.CustomerID },
    });

    const docTypeIds = docInfoData.map((doc) => doc.DocTypeID);
    const docIDs = docInfoData.map((doc) => doc.DocID);

    const doctypeData = await doctype.findAll({
      where: { DocTypeID: { [Op.in]: docTypeIds } },
    });

    const docVerificationData = await custdocverification.findAll({
      where: { [Op.and]: [{ CustomerID: customerID }, { DocID: docIDs }] },
    });

    const custGSTData = await custmerGSTdetails.findAll({
      where: { CustomerID: customerID },
      include: [
        {
          model: statepos,
          as: "CGIStatePOSID",
          attributes: ["StateName"],
        },
      ],
    });

    const gstIdToGstinMap = {};
    custGSTData.forEach((gst) => {
      gstIdToGstinMap[gst.GSTID] = gst.GSTIN;
    });

    const docInfoMapped = docInfoData.map((doc) => {
      const matchedVerification = docVerificationData.find(
        (d) => d.DocID === doc.DocID
      );

      let docNo = null;
      let gstID = null;

      switch (doc.DocTypeID) {
        case 1:
        case 8:
          docNo = customerData.AadharNo;
          break;
        case 2:
          docNo = customerData.PANNo;
          break;
        case 5:
          docNo = customerData.DrivingLicence;
          break;
        case 9:
          docNo = customerData.CMMSMEID
            ? customerData.CMMSMEID.RegistrationNo
            : null;
          break;
        case 3:
          if (matchedVerification) {
            gstID = matchedVerification.GSTID;
            docNo = gstIdToGstinMap[gstID] || null;
          }
          break;
        default:
          docNo = null;
      }

      const matchedDoctype = doctypeData.find(
        (d) => d.DocTypeID === doc.DocTypeID
      );

      return {
        DocTypeID: doc.DocTypeID,
        DocID: doc.DocID,
        DocURL: doc.DocURL,
        DocumentAs: matchedDoctype ? matchedDoctype.DocumentAs : null,
        Doctype: matchedDoctype ? matchedDoctype.Doctype : null,
        VerificationStatus: matchedVerification
          ? matchedVerification.Status
          : null,
        Remarks: matchedVerification ? matchedVerification.Remarks : null,
        DocNo: docNo,
        GSTID: doc.DocTypeID === 3 ? gstID : null,
        MSMEInfo:
          doc.DocTypeID === 9
            ? {
                RegistrationType:
                  customerData.CMMSMEID?.RegistrationType || null,
                DateOfRegistration:
                  customerData.CMMSMEID?.DateOfRegistration || null,
                NameOfEnterprise:
                  customerData.CMMSMEID?.NameOfEnterprise || null,
                RegistrationNo: customerData.CMMSMEID?.RegistrationNo || null,
              }
            : null,
      };
    });

    const bankID = customerData.BankID;
    let bankName = null;

    if (bankID) {
      const bankData = await BankMaster.findOne({ where: { BankID: bankID } });
      if (bankData) {
        bankName = bankData.BankName;
      }
    }

    const custGSTDataWithVerification = custGSTData.map((gst) => ({
      GSTID: gst.GSTID,
      CustomerID: gst.CustomerID,
      GSTIN: gst.GSTIN,
      RegistrationType: gst.RegistrationType,
      LegalName: gst.LegalName,
      TradeName: gst.TradeName,
      DOR: gst.DOR,
      EntityType: gst.EntityType,
      Address: gst.Address,
      StateID: gst.StateID,
      PINCode: gst.PINCode,
      DocID: gst.DocID,
      IsActive: gst.IsActive,
      Status: gst.Status,
      CreatedDate: gst.CreatedDate,
      ModifiedDate: gst.ModifiedDate,
      StateName: gst.CGIStatePOSID ? gst.CGIStatePOSID.StateName : null,
      VerificationStatus:
        docVerificationData.find((doc) => doc.DocID === gst.DocID)?.Status ||
        null,
    }));

    const combinedCustomerData = {
      CustomerID: customerData.CustomerID,
      FirstName: customerData.FirstName,
      LastName: customerData.LastName,
      Email: customerData.Email,
      MobileNo: customerData.MobileNo,
      Address: customerData.Address,
      City: customerData.City,
      Pincode: customerData.Pincode,
      ModelName: customerData.ModelName,
      VariantName: customerData.VariantName,
      FuelType: customerData.FuelType,
      ColourName: customerData.ColourName,
      Transmission: customerData.Transmission,
      RegionID: customerData.CMRegionID
        ? customerData.CMRegionID.RegionID
        : null,
      RegionName: customerData.CMRegionID
        ? customerData.CMRegionID.RegionName
        : null,
      StateID: customerData.CMStateID ? customerData.CMStateID.StateID : null,
      StateName: customerData.CMStateID
        ? customerData.CMStateID.StateName
        : null,
      AadharNo: customerData.AadharNo,
      PANNo: customerData.PANNo,
      DrivingLicence: customerData.DrivingLicence,
      BankID: customerData.BankID,
      BankName: bankName,

      RegistrationType: customerData.CMMSMEID.RegistrationType,
      DateOfRegistration: customerData.CMMSMEID.DateOfRegistration,
      NameOfEnterprise: customerData.CMMSMEID.NameOfEnterprise,
      RegistrationNo: customerData.CMMSMEID.RegistrationNo,

      IsActive: customerData.IsActive,
      Status: customerData.Status,
      CreatedDate: customerData.CreatedDate,
      ModifiedDate: customerData.ModifiedDate,
    };

    const responseData = {
      customerData: combinedCustomerData,
      docInfoMapped: docInfoMapped,
      custGSTData: custGSTDataWithVerification,
    };

    res.json(responseData);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

function getStatus(documentList) {
  let status = "Pending"; // Default status
  let idProofFound = false;
  let addressProofFound = false;

  // Iterate over each document in the list
  for (const document of documentList) {
    const { DocumentAs, Doctype } = document.dataValues;

    // Check for ID Proof with Pan Card
    if (DocumentAs === "ID Proof" && Doctype === "Pan Card") {
      idProofFound = true;
    }

    // Check for Address Proof
    if (DocumentAs === "Address Proof") {
      addressProofFound = true;
    }

    // If exactly one ID Proof or Address Proof is found
    if (
      (idProofFound && !addressProofFound) ||
      (!idProofFound && addressProofFound)
    ) {
      status = "Partial";
    }

    // If one ID Proof with Pan Card and one Address Proof are found
    if (idProofFound && addressProofFound) {
      status = "Approved";
      break; // No need to check further, as 'Approved' status is found
    }
  }

  return status;
}

// exports.getCustDataForEmp = async (req, res) => {
//   const condition = {
//     UserID: {
//       [Op.in]: [5],
//     },
//   };

//   try {
//     const data = await usermaster.findByPk(5, {
//       include: [
//         {
//           model: Customer,
//           through: {
//             attributes: [],
//           },
//           as: "CMCustomers", // This matches the 'as' defined in the association
//         },
//       ],
//     });

//     // Check if data is empty
//     if (!data || data.length === 0) {
//       return res.status(404).send({
//         message: "No data found",
//       });
//     }

//     console.log("Customer data:", data);

//     // Send the response
//     res.json(data);
//   } catch (error) {
//     console.error(error);
//     return res
//       .status(500)
//       .json({ message: error.message || "Internal server error" });
//   }
// };

// Dynamic KYC API

exports.KycDataByDocStatus = async (req, res) => {
  const requestStatus = req.query.RequestStatus;
  const branchName = req.query.BranchName;

  if (!branchName) {
    return res.status(400).send({ message: "Branch Name is required" });
  }

  try {
    console.log("Fetching KYC data...");
    const usersWithCustomers = await usermaster.findAll({
      where: { Branch: branchName },
      attributes: ["UserName", "EmpID"],
      include: [
        {
          model: Customer,
          as: "CMCustomers",
          required: false,
          through: { attributes: [] },
          include: [
            {
              model: Statemaster,
              as: "CMStateID",
              attributes: ["StateName"],
            },
            {
              model: RegionMaster,
              as: "CMRegionID",
              attributes: ["RegionName"],
            },
          ],
        },
      ],
    });

    if (!usersWithCustomers || usersWithCustomers.length === 0) {
      console.log("No users found for the branch");
      return res.status(404).send({ message: "No users found for the branch" });
    }

    const customerIDs = usersWithCustomers.reduce((acc, user) => {
      user.CMCustomers.forEach((customer) => {
        acc.push(customer.CustomerID);
      });
      return acc;
    }, []);

    const docVerificationData = await custdocverification.findAll({
      where: { CustomerID: { [Op.in]: customerIDs } },
      attributes: [
        "CustomerID",
        "DocID",
        "Status",
        "CreatedDate",
        "ModifiedDate",
      ],
      include: [{ model: Customer, as: "DVCustID" }],
    });

    const customerStatusMap = {};
    const oldestPendingDocumentDateMap = {};
    const oldestApprovedDocumentDateMap = {};
    const latestApprovedDocumentDateMap = {};

    docVerificationData.forEach((doc) => {
      const { CustomerID, Status, CreatedDate, ModifiedDate } = doc;
      if (!customerStatusMap[CustomerID]) {
        customerStatusMap[CustomerID] = [];
      }
      customerStatusMap[CustomerID].push({ Status, CreatedDate, ModifiedDate });

      if (Status === "Pending" || Status === "Partial") {
        if (
          !oldestPendingDocumentDateMap[CustomerID] ||
          CreatedDate < oldestPendingDocumentDateMap[CustomerID]
        ) {
          oldestPendingDocumentDateMap[CustomerID] = CreatedDate;
        }
      }
      if (Status === "Approved") {
        if (
          !oldestApprovedDocumentDateMap[CustomerID] ||
          CreatedDate < oldestApprovedDocumentDateMap[CustomerID]
        ) {
          oldestApprovedDocumentDateMap[CustomerID] = CreatedDate;
        }
        if (
          !latestApprovedDocumentDateMap[CustomerID] ||
          ModifiedDate > latestApprovedDocumentDateMap[CustomerID]
        ) {
          latestApprovedDocumentDateMap[CustomerID] = ModifiedDate;
        }
      }
    });

    const pendingCustomers = [];
    const approvedCustomers = [];

    const getCompleteCustomerData = (customerID) => {
      for (let i = 0; i < usersWithCustomers.length; i++) {
        const user = usersWithCustomers[i];
        const { CMCustomers } = user;
        const foundCustomer = CMCustomers.find(
          (customer) => customer.CustomerID === customerID
        );
        if (foundCustomer) {
          return foundCustomer.toJSON();
        }
      }
      return null;
    };

    for (let i = 0; i < usersWithCustomers.length; i++) {
      const user = usersWithCustomers[i];
      const { CMCustomers } = user;
      for (let j = 0; j < CMCustomers.length; j++) {
        const customer = CMCustomers[j];
        const { CustomerID, BankID } = customer;
        const documentData = customerStatusMap[CustomerID];

        if (documentData) {
          const allDocumentsApproved = documentData.every(
            (doc) => doc.Status === "Approved"
          );

          const completeCustomerData = getCompleteCustomerData(CustomerID);
          if (completeCustomerData) {
            const { CMStateID, CMRegionID, ...restCustomerData } =
              completeCustomerData;
            let bankName = null;
            if (BankID) {
              const bankDetails = await BankMaster.findOne({
                where: { BankID },
                attributes: ["BankName"],
              });
              bankName = bankDetails ? bankDetails.BankName : null;
            }

            const customerData = {
              UserName: user.UserName,
              EmpID: user.EmpID,
              BranchName: branchName,
              CustomerID,
              BankName: bankName,
              StateName: CMStateID.StateName,
              DistrictName: CMRegionID.RegionName,
              ...restCustomerData,
            };

            if (requestStatus === "Pending" || requestStatus === "Partial") {
              const pendingDocuments = documentData.filter(
                (doc) =>
                  doc.Status === "Pending" ||
                  doc.Status === "Partial" ||
                  doc.Status === "Re-Upload"
              );
              if (pendingDocuments.length > 0) {
                customerData.RequestedDate =
                  oldestPendingDocumentDateMap[CustomerID];
                pendingCustomers.push(customerData);
              }
            } else if (requestStatus === "Approved") {
              if (allDocumentsApproved) {
                customerData.RequestedDate =
                  oldestApprovedDocumentDateMap[CustomerID];
                customerData.ApprovedDate =
                  latestApprovedDocumentDateMap[CustomerID];
                approvedCustomers.push(customerData);
              }
            }
          }
        }
      }
    }

    // Sort the respective lists
    const parseDate = (date) => new Date(date || 0).getTime();

    if (requestStatus === "Pending" || requestStatus === "Partial") {
      pendingCustomers.sort(
        (a, b) => parseDate(b.RequestedDate) - parseDate(a.RequestedDate)
      );
      return res.json({ pendingCustomers });
    } else if (requestStatus === "Approved") {
      approvedCustomers.sort((a, b) => {
        const dateA = parseDate(b.RequestedDate || b.ApprovedDate);
        const dateB = parseDate(a.RequestedDate || a.ApprovedDate);
        return dateA - dateB;
      });
      return res.json({ approvedCustomers });
    } else {
      return res.status(400).send({ message: "Invalid RequestStatus" });
    }
  } catch (error) {
    console.error("Error fetching KYC data:", error);
    res.status(500).send({
      message: "Failed to retrieve KYC data. Please try again later.",
    });
  }
};

/*exports.KycDataByDocStatus = async (req, res) => {
  
  const requestStatus = req.query.RequestStatus;
  const branchName = req.query.BranchName;
  if (!branchName) {
    return res.status(400).send({ message: "Branch Name is required" });
  }
  try {
    console.log("Fetching KYC data...");
    // Fetch users (employees) and their associated customers for the given branch
    const usersWithCustomers = await usermaster.findAll({
      where: { Branch: branchName },
      attributes: ["UserName", "EmpID"],
      include: [
        {
          model: Customer,
          as: "CMCustomers",
          required: false,
          through: {
            attributes: [],
          },
          include: [
            {
              model: Statemaster,
              as: "CMStateID",
              attributes: ["StateName"],
            },
            {
              model: RegionMaster,
              as: "CMRegionID",
              attributes: ["RegionName"],
            },
          ],
        },
      ],
    });
    if (!usersWithCustomers || usersWithCustomers.length === 0) {
      console.log("No users found for the branch");
      return res.status(404).send({ message: "No users found for the branch" });
    }
    const customerIDs = usersWithCustomers.reduce((acc, user) => {
      user.CMCustomers.forEach((customer) => {
        acc.push(customer.CustomerID);
      });
      return acc;
    }, []);
    const docVerificationData = await custdocverification.findAll({
      where: {
        CustomerID: { [Op.in]: customerIDs },
      },
      attributes: [
        "CustomerID",
        "DocID",
        "Status",
        "CreatedDate",
        "ModifiedDate",
      ],
      include: [
        {
          model: Customer,
          as: "DVCustID",
        },
      ],
    });
    const customerStatusMap = {};
    const oldestPendingDocumentDateMap = {};
    const oldestApprovedDocumentDateMap = {};
    const latestApprovedDocumentDateMap = {};
    docVerificationData.forEach((doc) => {
      const { CustomerID, Status, CreatedDate, ModifiedDate } = doc;
      if (!customerStatusMap[CustomerID]) {
        customerStatusMap[CustomerID] = [];
      }
      customerStatusMap[CustomerID].push({ Status, CreatedDate, ModifiedDate });
      if (Status === "Pending" || Status === "Partial") {
        if (
          !oldestPendingDocumentDateMap[CustomerID] ||
          CreatedDate < oldestPendingDocumentDateMap[CustomerID]
        ) {
          oldestPendingDocumentDateMap[CustomerID] = CreatedDate;
        }
      }
      if (Status === "Approved") {
        if (
          !oldestApprovedDocumentDateMap[CustomerID] ||
          CreatedDate < oldestApprovedDocumentDateMap[CustomerID]
        ) {
          oldestApprovedDocumentDateMap[CustomerID] = CreatedDate;
        }
        if (
          !latestApprovedDocumentDateMap[CustomerID] ||
          ModifiedDate > latestApprovedDocumentDateMap[CustomerID]
        ) {
          latestApprovedDocumentDateMap[CustomerID] = ModifiedDate;
        }
      }
    });
    const pendingCustomers = [];
    const approvedCustomers = [];
    const getCompleteCustomerData = (customerID) => {
      for (let i = 0; i < usersWithCustomers.length; i++) {
        const user = usersWithCustomers[i];
        const { CMCustomers } = user;
        const foundCustomer = CMCustomers.find(
          (customer) => customer.CustomerID === customerID
        );
        if (foundCustomer) {
          return foundCustomer.toJSON();
        }
      }
      return null;
    };
    for (let i = 0; i < usersWithCustomers.length; i++) {
      const user = usersWithCustomers[i];
      const { CMCustomers } = user;
      for (let j = 0; j < CMCustomers.length; j++) {
        const customer = CMCustomers[j];
        const { CustomerID, BankID } = customer;
        const documentData = customerStatusMap[CustomerID];
        if (documentData) {
          const pendingDocuments = documentData.filter(
            (doc) => doc.Status === "Pending" || doc.Status === "Partial"
          );
          const approvedDocuments = documentData.filter(
            (doc) => doc.Status === "Approved"
          );
          const allDocumentsApproved =
            approvedDocuments.length > 0 && pendingDocuments.length === 0;
          const completeCustomerData = getCompleteCustomerData(CustomerID);
          if (completeCustomerData) {
            const { CMStateID, CMRegionID, ...restCustomerData } =
              completeCustomerData;
            let bankName = null;
            if (BankID) {
              const bankDetails = await BankMaster.findOne({
                where: { BankID },
                attributes: ["BankName"],
              });
              bankName = bankDetails ? bankDetails.BankName : null;
            }
            const customerData = {
              UserName: user.UserName,
              EmpID: user.EmpID,
              BranchName: branchName,
              CustomerID,
              BankName: bankName,
              VerificationStatus: allDocumentsApproved ? "Approved" : "Pending",
              StateName: CMStateID.StateName,
              RegionName: CMRegionID.RegionName,
              ...restCustomerData,
            };
            if (requestStatus === "Pending" && !allDocumentsApproved) {
              customerData.RequestedDate =
                oldestPendingDocumentDateMap[CustomerID];
              pendingCustomers.push(customerData);
            } else if (requestStatus === "Approved" && allDocumentsApproved) {
              customerData.RequestedDate =
                oldestApprovedDocumentDateMap[CustomerID];
              customerData.ApprovedDate =
                latestApprovedDocumentDateMap[CustomerID];
              approvedCustomers.push(customerData);
            }
          }
        }
      }
    }
    // Function to safely parse dates
    const parseDate = (date) => new Date(date || 0).getTime();
    // Sort pendingCustomers by RequestedDate in descending order
    pendingCustomers.sort(
      (a, b) => parseDate(b.RequestedDate) - parseDate(a.RequestedDate)
    );
    // Sort approvedCustomers by RequestedDate or ApprovedDate in descending order
    approvedCustomers.sort((a, b) => {
      const dateA = parseDate(b.RequestedDate || b.ApprovedDate);
      const dateB = parseDate(a.RequestedDate || a.ApprovedDate);
      return dateA - dateB;
    });
    res.json({
      pendingCustomers,
      approvedCustomers,
    });
  } catch (error) {
    console.error("Error fetching KYC data:", error);
    res.status(500).send({
      message: "Failed to retrieve KYC data. Please try again later.",
    });
  }
}; */

// Kyc Dynamic API by KycStatus and Branch name
exports.KycDataByStatus = async (req, res) => {
  const requestStatus = req.query.RequestStatus; // Capture the status from query params
  const branchName = req.query.BranchName;

  // Validate branchName input
  if (!branchName) {
    return res.status(400).send({ message: "Branch Name is required" });
  }

  const whereCondition =
    requestStatus === "Approved"
      ? { KycStatus: "Approved" }
      : { KycStatus: ["Pending", "Partial"] };

  try {
    console.log("Fetching KYC data...");

    // Fetch users (employees) and their associated customers for the given branch
    const usersWithCustomers = await usermaster.findAll({
      where: { Branch: branchName },
      attributes: ["UserName", "EmpID"],
      include: [
        {
          model: Customer,
          as: "CMCustomers", // Make sure this matches the 'as' defined in the model association
          required: false, // Optional: This ensures it's a LEFT JOIN
          through: {
            attributes: [],
          },
        },
      ],
    });

    // Check if any users (employees) were found for the branch
    if (!usersWithCustomers || usersWithCustomers.length === 0) {
      console.log("No users found for the branch");
      return res.status(404).send({ message: "No users found for the branch" });
    }

    // Extract all Customer IDs from the data
    const customerIDs = usersWithCustomers.reduce((acc, user) => {
      user.CMCustomers.forEach((customer) => {
        acc.push(customer.CustomerID);
      });
      return acc;
    }, []);

    const data = await Customer.findAll({
      where: {
        ...whereCondition,
        ...(customerIDs.length > 0 && { CustomerID: customerIDs }),
      },
      attributes: [
        "CustomerID",
        "CustomerType",
        "CustID",
        "Title",
        "FirstName",
        "LastName",
        "PhoneNo",
        "OfficeNo",
        "Email",
        "Occupation",
        "Company",
        "DateOfBirth",
        "DateOfAnniversary",
        "Address",
        "PINCode",
        "AadharNo",
        "PANNo",
        "DrivingLicence",
        "AccountHolderName",
        "AccountNo",
        "IFSCCode",
        "BranchDetails",
        "IsActive",
        "KycStatus",
        "CustomerStatus",
        "CreatedDate",
        "ModifiedDate",
        "ModelName",
        "VariantName",
        "FuelType",
        "ColourName",
        "Transmission",
        "BankID", // Ensure BankID is selected if needed
      ],
      include: [
        {
          model: RegionMaster,
          as: "CMRegionID",
          attributes: ["RegionName"],
        },
        {
          model: Statemaster,
          as: "CMStateID",
          attributes: ["StateName"],
        },
        {
          model: usermaster,
          as: "CMEmployees",
          attributes: ["UserName", "Branch"],
          required: false, // Optional: This ensures it's a LEFT JOIN
          through: {
            attributes: [],
          },
        },
      ],
      order: [
        ["CreatedDate", "DESC"], // Order by ModelDescription in ascending order
      ],
    });

    // Check if data is empty
    if (!data || data.length === 0) {
      return res.status(404).send({
        message: "No data found",
      });
    }

    console.log("Customer data:", data);

    // Extract BankIDs from the customers data
    const bankIDs = data
      .map((customer) => customer.BankID)
      .filter((bankID) => bankID);

    // Fetch bank data based on the extracted BankIDs
    let bankData = [];
    if (bankIDs.length > 0) {
      bankData = await BankMaster.findAll({
        where: {
          BankID: bankIDs,
        },
      });
    }

    // Create a map for quick bank name lookup
    const bankMap = bankData.reduce((acc, bank) => {
      acc[bank.BankID] = bank.BankName;
      return acc;
    }, {});

    // // Log UserName and Branch for each Customer before mapping
    // data.forEach((item) => {
    //   if (item.CMEmployees) {
    //     console.log("UserName:", item.CMEmployees.UserName);
    //     console.log("Branch:", item.CMEmployees.Branch);
    //   } else {
    //     console.log(
    //       "No CMEmployees data found for CustomerID:",
    //       item.CustomerID
    //     );
    //   }
    // });

    // Map customer data to include bank names and employee details
    const response = data.map((item) => ({
      CustomerID: item.CustomerID,
      CustomerType: item.CustomerType,
      CustID: item.CustID,
      Title: item.Title,
      FirstName: item.FirstName,
      LastName: item.LastName,
      PhoneNo: item.PhoneNo,
      OfficeNo: item.OfficeNo,
      Email: item.Email,
      Occupation: item.Occupation,
      Company: item.Company,
      DateOfBirth: item.DateOfBirth,
      DateOfAnniversary: item.DateOfAnniversary,
      Address: item.Address,
      PINCode: item.PINCode,
      AadharNo: item.AadharNo,
      PANNo: item.PANNo,
      DrivingLicence: item.DrivingLicence,
      AccountHolderName: item.AccountHolderName,
      AccountNo: item.AccountNo,
      IFSCCode: item.IFSCCode,
      BranchDetails: item.BranchDetails,
      IsActive: item.IsActive,
      CustomerStatus: item.CustomerStatus,
      CreatedDate: item.CreatedDate,
      ModifiedDate: item.ModifiedDate,
      ModelName: item.ModelName,
      VariantName: item.VariantName,
      FuelType: item.FuelType,
      ColourName: item.ColourName,
      Transmission: item.Transmission,
      District: item.CMRegionID ? item.CMRegionID.RegionName : null,
      State: item.CMStateID ? item.CMStateID.StateName : null,
      BankName: bankMap[item.BankID] || null,
      ExecutiveName:
        item.CMEmployees.length > 0 ? item.CMEmployees[0].UserName : null,
      EmpBranch:
        item.CMEmployees.length > 0 ? item.CMEmployees[0].Branch : null,
      KycStatus: item.KycStatus,
    }));

    // Send the response
    res.json(response);
  } catch (error) {
    console.error("Error fetching KYC data:", error);
    res.status(500).send({
      message: "Failed to retrieve KYC data. Please try again later.",
    });
  }
};

// Customer will repeat since he mapped twice so the below code is for single return
// exports.KycDataByStatus = async (req, res) => {
//   const requestStatus = req.query.RequestStatus; // Capture the status from query params
//   const branchName = req.query.BranchName;

//   // Validate branchName input
//   if (!branchName) {
//     return res.status(400).send({ message: "Branch Name is required" });
//   }

//   try {
//     console.log("Fetching KYC data...");

//     // Fetch users (employees) and their associated customers for the given branch
//     const usersWithCustomers = await usermaster.findAll({
//       where: { Branch: branchName },
//       attributes: ["UserName", "EmpID"],
//       include: [
//         {
//           model: Customer,
//           as: "CMCustomers", // Make sure this matches the 'as' defined in the model association
//           required: false, // Optional: This ensures it's a LEFT JOIN
//           through: {
//             attributes: [],
//           },
//         },
//       ],
//     });

//     // Check if any users (employees) were found for the branch
//     if (!usersWithCustomers || usersWithCustomers.length === 0) {
//       console.log("No users found for the branch");
//       return res.status(404).send({ message: "No users found for the branch" });
//     }

//     // Extract all Customer IDs from the data
//     const customerIDs = usersWithCustomers.reduce((acc, user) => {
//       user.CMCustomers.forEach((customer) => {
//         acc.push(customer.CustomerID);
//       });
//       return acc;
//     }, []);

//     // Fetch document verification data for the customers in the branch
//     const docVerificationData = await custdocverification.findAll({
//       where: {
//         CustomerID: { [Op.in]: customerIDs },
//       },
//       attributes: [
//         "CustomerID",
//         "DocID",
//         "Status",
//         "CreatedDate",
//         "ModifiedDate",
//       ],
//       include: [
//         {
//           model: Customer,
//           as: "DVCustID",
//         },
//       ],
//     });

//     // Map to store customer IDs with their document verification statuses and dates
//     const customerStatusMap = {};
//     const oldestPendingDocumentDateMap = {}; // Map to store the oldest Pending document date for each customer
//     const oldestApprovedDocumentDateMap = {}; // Map to store the oldest Approved document date for each customer
//     const latestApprovedDocumentDateMap = {}; // Map to store the latest Approved document date for each customer

//     // Populate customerStatusMap, oldestPendingDocumentDateMap, oldestApprovedDocumentDateMap, and latestApprovedDocumentDateMap
//     docVerificationData.forEach((doc) => {
//       const { CustomerID, Status, CreatedDate, ModifiedDate } = doc;
//       if (!customerStatusMap[CustomerID]) {
//         customerStatusMap[CustomerID] = [];
//       }
//       customerStatusMap[CustomerID].push({ Status, CreatedDate, ModifiedDate });

//       // Capture the oldest Pending document date for customers
//       if (Status === "Pending") {
//         if (
//           !oldestPendingDocumentDateMap[CustomerID] ||
//           CreatedDate < oldestPendingDocumentDateMap[CustomerID]
//         ) {
//           oldestPendingDocumentDateMap[CustomerID] = CreatedDate;
//         }
//       }

//       // Capture the oldest Approved document date for customers
//       if (Status === "Approved") {
//         if (
//           !oldestApprovedDocumentDateMap[CustomerID] ||
//           CreatedDate < oldestApprovedDocumentDateMap[CustomerID]
//         ) {
//           oldestApprovedDocumentDateMap[CustomerID] = CreatedDate;
//         }

//         // Capture the latest Approved document date for customers
//         if (
//           !latestApprovedDocumentDateMap[CustomerID] ||
//           ModifiedDate > latestApprovedDocumentDateMap[CustomerID]
//         ) {
//           latestApprovedDocumentDateMap[CustomerID] = ModifiedDate;
//         }
//       }
//     });

//     // Determine pending and approved customers based on status
//     const pendingCustomers = [];
//     const approvedCustomers = [];

//     // Map to track processed customers
//     const processedCustomers = new Map(); // Map CustomerID -> Employee

//     // Function to get latest mapped employee for the customer
//     const getLatestEmployee = (customerID) => {
//       let latestEmployee = null;
//       for (let i = usersWithCustomers.length - 1; i >= 0; i--) {
//         const user = usersWithCustomers[i];
//         const { CMCustomers } = user;
//         const foundCustomer = CMCustomers.find(
//           (customer) => customer.CustomerID === customerID
//         );
//         if (foundCustomer) {
//           latestEmployee = user;
//           break;
//         }
//       }
//       return latestEmployee ? {
//         UserName: latestEmployee.UserName,
//         EmpID: latestEmployee.EmpID
//       } : null;
//     };

//     // Process users and their customers
//     for (let i = 0; i < usersWithCustomers.length; i++) {
//       const user = usersWithCustomers[i];
//       const { CMCustomers } = user;

//       for (let j = 0; j < CMCustomers.length; j++) {
//         const customer = CMCustomers[j];
//         const { CustomerID } = customer;
//         const documentData = customerStatusMap[CustomerID];

//         if (documentData) {
//           // Separate pending and approved documents
//           const pendingDocuments = documentData.filter(
//             (doc) => doc.Status === "Pending"
//           );
//           const approvedDocuments = documentData.filter(
//             (doc) => doc.Status === "Approved"
//           );

//           // Determine overall customer status based on their documents
//           const allDocumentsApproved =
//             approvedDocuments.length > 0 && pendingDocuments.length === 0;

//           // Get latest mapped employee for the customer
//           const latestEmployee = getLatestEmployee(CustomerID);

//           if (latestEmployee) {
//             // Check if customer has already been added
//             if (!processedCustomers.has(CustomerID)) {
//               processedCustomers.set(CustomerID, true); // Mark customer as processed

//               // Construct customer data with verification status and latest mapped employee data
//               const customerData = {
//                 UserName: latestEmployee.UserName,
//                 EmpID: latestEmployee.EmpID,
//                 BranchName: branchName,
//                 CustomerID,
//                 VerificationStatus: allDocumentsApproved ? "Approved" : "Pending",
//                 ...customer.toJSON(), // Convert customer instance to JSON
//               };

//               // Add RequestedDate and ApprovedDate for respective customers
//               if (requestStatus === "Pending" && !allDocumentsApproved) {
//                 customerData.RequestedDate = oldestPendingDocumentDateMap[CustomerID];
//                 pendingCustomers.push(customerData);
//               } else if (requestStatus === "Approved" && allDocumentsApproved) {
//                 customerData.RequestedDate = oldestApprovedDocumentDateMap[CustomerID];
//                 customerData.ApprovedDate = latestApprovedDocumentDateMap[CustomerID];
//                 approvedCustomers.push(customerData);
//               }
//             }
//           }
//         }
//       }
//     }

//     // Return the formatted data as response
//     res.json({
//       pendingCustomers,
//       approvedCustomers,
//     });
//   } catch (error) {
//     console.error("Error fetching KYC data:", error);
//     res.status(500).send({
//       message: "Failed to retrieve KYC data. Please try again later.",
//     });
//   }
// };

/* API with nested in same hirarchy from bookings part without doc change for all customers */
// exports.GetFullCustData = async (req, res) => {
//   try {
//     // Fetch all customers with their related data
//     const customers = await Customer.findAll({
//       include: [
//         {
//           model: RegionMaster,
//           as: "CMRegionID",
//           attributes: ["RegionID", "RegionName"],
//         },
//         {
//           model: Statemaster,
//           as: "CMStateID",
//           attributes: ["StateID", "StateName"],
//         },
//         {
//           model: MSMEInfo,
//           as: "CMMSMEID",
//           attributes: [
//             "CustomerID",
//             "RegistrationType",
//             "DateOfRegistration",
//             "NameOfEnterprise",
//             "RegistrationNo",
//           ],
//         },
//       ],
//     });

//     // Extract all customer IDs
//     const customerIDs = customers.map((customer) => customer.CustomerID);

//     // Fetch all document info data for these customers
//     const docInfoData = await CustomerDocumentDetails.findAll({
//       where: { CustomerID: { [Op.in]: customerIDs } },
//     });

//     // Extract DocTypeIDs and DocIDs
//     const docTypeIds = docInfoData.map((doc) => doc.DocTypeID);
//     const docIDs = docInfoData.map((doc) => doc.DocID);

//     // Fetch doctype data and document verification data
//     const doctypeData = await doctype.findAll({
//       where: { DocTypeID: { [Op.in]: docTypeIds } },
//     });
//     const docVerificationData = await custdocverification.findAll({
//       where: {
//         CustomerID: { [Op.in]: customerIDs },
//         DocID: { [Op.in]: docIDs },
//       },
//     });

//     // Create mappings for document types and verification statuses
//     const doctypeMap = doctypeData.reduce((acc, doc) => {
//       acc[doc.DocTypeID] = doc;
//       return acc;
//     }, {});
//     const docVerificationMap = docVerificationData.reduce((acc, doc) => {
//       acc[doc.DocID] = doc.Status;
//       return acc;
//     }, {});

//     // Fetch GST data for all customers
//     const custGSTData = await custmerGSTdetails.findAll({
//       where: { CustomerID: { [Op.in]: customerIDs } },
//     });

//     // Map GST data with verification status
//     const custGSTMap = custGSTData.reduce((acc, gst) => {
//       acc[gst.DocID] = {
//         ...gst.toJSON(),
//         VerificationStatus: docVerificationMap[gst.DocID] || null,
//       };
//       return acc;
//     }, {});

//     // Initialize response array
//     const responseData = [];

//     for (const customer of customers) {
//       const customerID = customer.CustomerID;

//       // Filter document info for the current customer
//       const customerDocs = docInfoData.filter(
//         (doc) => doc.CustomerID === customerID
//       );

//       // Separate GST and MSME docs
//       const gstDocs = customerDocs.filter((doc) => doc.DocTypeID === 3);
//       const msmDocs = customerDocs.filter((doc) => doc.DocTypeID === 9);
//       const otherDocs = customerDocs.filter(
//         (doc) => doc.DocTypeID !== 3 && doc.DocTypeID !== 9
//       );

//       // Prepare documents for the current customer
//       const docInfoMapped = [
//         ...gstDocs.map((doc) => ({
//           ...doc.toJSON(),
//           VerificationStatus: custGSTMap[doc.DocID]?.VerificationStatus || null,
//         })),
//         ...msmDocs,
//         ...otherDocs.map((doc) => ({
//           ...doc.toJSON(),
//           VerificationStatus: docVerificationMap[doc.DocID] || null,
//         })),
//       ];

//       // Fetch bookings for the current customer
//       const custBookings = await NewCarBookings.findAll({
//         where: { CustomerID: customerID },
//       });

//       const bookingDetails = [];

//       for (const booking of custBookings) {
//         // Fetch payments related to the booking
//         const payments = await PaymentRequest.findAll({
//           where: { TransactionID: booking.BookingID },
//         });

//         const bookingPayments = [];

//         for (const payment of payments) {
//           // Fetch receipt related to the payment
//           const receipt = await Receipts.findOne({
//             where: { RequestID: payment.ID },
//           });

//           // Fetch cheque tracks related to the payment
//           const chequeTracks = await ChequeTracking.findAll({
//             where: {
//               CustomerID: customerID,
//               PaymentID: payment.ID,
//             },
//             order: [["ChqTrackID", "ASC"]],
//           });

//           bookingPayments.push({
//             ...payment.toJSON(),
//             receipt: receipt ? receipt.toJSON() : null,
//             chequeTracks: chequeTracks.map((track) => track.toJSON()),
//           });
//         }

//         bookingDetails.push({
//           ...booking.toJSON(),
//           payments: bookingPayments,
//         });
//       }

//       // Add the current customer's data to the response array
//       responseData.push({
//         customerData: {
//           CustomerID: customer.CustomerID,
//           CustomerType: customer.CustomerType,
//           CustID: customer.CustID,
//           Title: customer.Title,
//           FirstName: customer.FirstName,
//           LastName: customer.LastName,
//           PhoneNo: customer.PhoneNo,
//           OfficeNo: customer.OfficeNo,
//           Email: customer.Email,
//           Occupation: customer.Occupation,
//           Company: customer.Company,
//           DateOfBirth: customer.DateOfBirth,
//           DateOfAnniversary: customer.DateOfAnniversary,
//           Address: customer.Address,
//           District: customer.District,
//           State: customer.State,
//           PINCode: customer.PINCode,
//           ModelName: customer.ModelName,
//           VariantName: customer.VariantName,
//           FuelType: customer.FuelType,
//           AadharNo: customer.AadharNo,
//           PANNo: customer.PANNo,
//           DrivingLicence: customer.DrivingLicence,
//           GSTIN: customer.GSTIN,
//           GstType: customer.GstType,
//           AccountHolderName: customer.AccountHolderName,
//           AccountNo: customer.AccountNo,
//           IFSCCode: customer.IFSCCode,
//           BankName: customer.BankID
//             ? (
//                 await BankMaster.findOne({
//                   where: { BankID: customer.BankID },
//                 })
//               ).BankName
//             : null,
//           BranchDetails: customer.BranchDetails,
//           IsActive: customer.IsActive,
//           KycStatus: customer.KycStatus,
//           CustomerStatus: customer.CustomerStatus,
//           CreatedDate: customer.CreatedDate,
//           ModifiedDate: customer.ModifiedDate,
//           DistrictID: customer.CMRegionID ? customer.CMRegionID.RegionID : null,
//           DistrictName: customer.CMRegionID
//             ? customer.CMRegionID.RegionName
//             : null,
//           StateID: customer.CMStateID ? customer.CMStateID.StateID : null,
//           StateName: customer.CMStateID ? customer.CMStateID.StateName : null,
//           MSMEID: customer.MSMEID,
//           RegistrationType: customer.CMMSMEID
//             ? customer.CMMSMEID.RegistrationType
//             : null,
//           DateOfRegistration: customer.CMMSMEID
//             ? customer.CMMSMEID.DateOfRegistration
//             : null,
//           NameOfEnterprise: customer.CMMSMEID
//             ? customer.CMMSMEID.NameOfEnterprise
//             : null,
//           RegistrationNo: customer.CMMSMEID
//             ? customer.CMMSMEID.RegistrationNo
//             : null,
//         },
//         CustdocInfo: docInfoMapped,
//         CustGSTData: custGSTData
//           .filter((gst) => gst.CustomerID === customerID)
//           .map((gst) => ({
//             ...gst.toJSON(),
//             VerificationStatus:
//               custGSTMap[gst.DocID]?.VerificationStatus || null,
//           })),
//         CustBookings: bookingDetails,
//       });
//     }

//     // Send the response
//     res.json(responseData);
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };

/* API with nested in same hirarchy from bookings part without doc change for single Customer*/
exports.GetFullCustData = async (req, res) => {
  const customerID = req.params.id;
  console.log("customer ID is: ", customerID);

  try {
    // Fetch customer data
    const customerData = await Customer.findOne({
      where: { CustomerID: customerID },
      include: [
        {
          model: RegionMaster,
          as: "CMRegionID",
          attributes: ["RegionID", "RegionName"],
        },
        {
          model: Statemaster,
          as: "CMStateID",
          attributes: ["StateID", "StateName"],
        },
        {
          model: MSMEInfo,
          as: "CMMSMEID",
          attributes: [
            "CustomerID",
            "RegistrationType",
            "DateOfRegistration",
            "NameOfEnterprise",
            "RegistrationNo",
          ],
        },
      ],
    });

    if (!customerData) {
      return res.status(404).send({ message: "No customer data found" });
    }

    // Fetch document info and types
    const docInfoData = await CustomerDocumentDetails.findAll({
      where: { CustomerID: customerID },
    });
    const docTypeIds = docInfoData.map((doc) => doc.DocTypeID);
    const docIDs = docInfoData.map((doc) => doc.DocID);

    const doctypeData = await doctype.findAll({
      where: { DocTypeID: { [Op.in]: docTypeIds } },
    });
    const docVerificationData = await custdocverification.findAll({
      where: { [Op.and]: [{ CustomerID: customerID }, { DocID: docIDs }] },
    });

    const docInfoMapped = docInfoData.map((doc) => {
      const matchedVerification = docVerificationData.find(
        (d) => d.DocID === doc.DocID
      );
      const docType = doctypeData.find((d) => d.DocTypeID === doc.DocTypeID);
      return {
        DocTypeID: doc.DocTypeID,
        DocID: doc.DocID,
        DocURL: doc.DocURL,
        DocumentAs: docType?.DocumentAs || null,
        Doctype: docType?.Doctype || null,
        VerificationStatus: matchedVerification?.Status || null,
        Remarks: matchedVerification?.Remarks || null,
      };
    });

    // Separate and combine documents
    const gstDocs = docInfoMapped.filter((doc) => doc.DocTypeID === 3);
    const custGSTData = await custmerGSTdetails.findAll({
      where: { CustomerID: customerID },
    });

    const custGSTDataWithDocs = custGSTData.map((gst) => {
      const gstDoc = gstDocs.find((doc) => doc.DocID === gst.DocID);
      return { ...gst.toJSON(), DocInfo: gstDoc || null };
    });

    const otherDocs = docInfoMapped.filter(
      (doc) => doc.DocTypeID !== 3 && doc.DocTypeID !== 9
    );

    // Fetch bank data if BankID exists
    let bankName = null;
    if (customerData.BankID) {
      const bank = await BankMaster.findOne({
        where: { BankID: customerData.BankID },
      });
      bankName = bank ? bank.BankName : null;
    }

    // Prepare response
    const responseData = {
      customerData: {
        CustomerID: customerData.CustomerID,
        CustomerType: customerData.CustomerType,
        CustID: customerData.CustID,
        Title: customerData.Title,
        FirstName: customerData.FirstName,
        LastName: customerData.LastName,
        PhoneNo: customerData.PhoneNo,
        OfficeNo: customerData.OfficeNo,
        Email: customerData.Email,
        Occupation: customerData.Occupation,
        Company: customerData.Company,
        DateOfBirth: customerData.DateOfBirth,
        DateOfAnniversary: customerData.DateOfAnniversary,
        Address: customerData.Address,
        District: customerData.District,
        State: customerData.State,
        PINCode: customerData.PINCode,
        ModelName: customerData.ModelName,
        VariantName: customerData.VariantName,
        FuelType: customerData.FuelType,
        AadharNo: customerData.AadharNo,
        PANNo: customerData.PANNo,
        DrivingLicence: customerData.DrivingLicence,
        GSTIN: customerData.GSTIN,
        GstType: customerData.GstType,
        AccountHolderName: customerData.AccountHolderName,
        AccountNo: customerData.AccountNo,
        IFSCCode: customerData.IFSCCode,
        BankName: bankName,
        BranchDetails: customerData.BranchDetails,
        IsActive: customerData.IsActive,
        KycStatus: customerData.KycStatus,
        CustomerStatus: customerData.CustomerStatus,
        CreatedDate: customerData.CreatedDate,
        ModifiedDate: customerData.ModifiedDate,
        DistrictID: customerData.CMRegionID?.RegionID || null,
        DistrictName: customerData.CMRegionID?.RegionName || null,
        StateID: customerData.CMStateID?.StateID || null,
        StateName: customerData.CMStateID?.StateName || null,
        MSMEID: customerData.MSMEID,
        RegistrationType: customerData.CMMSMEID?.RegistrationType || null,
        DateOfRegistration: customerData.CMMSMEID?.DateOfRegistration || null,
        NameOfEnterprise: customerData.CMMSMEID?.NameOfEnterprise || null,
        RegistrationNo: customerData.CMMSMEID?.RegistrationNo || null,
      },
      CustGSTData: custGSTDataWithDocs,
      CustDocInfo: otherDocs,
      CustBookings: [],
    };

    // Fetch and organize bookings, payments, receipts, and cheque tracking data
    const custBookings = await NewCarBookings.findAll({
      where: { CustomerID: customerID },
    });

    responseData.CustBookings = await Promise.all(
      custBookings.map(async (booking) => {
        const payments = await PaymentRequest.findAll({
          where: { TransactionID: booking.BookingID },
        });

        const bookingPayments = await Promise.all(
          payments.map(async (payment) => {
            const receipt = await Receipts.findOne({
              where: { RequestID: payment.ID },
            });
            const chequeTracks = await ChequeTracking.findAll({
              where: { CustomerID: customerID, PaymentID: payment.ID },
              order: [["ChqTrackID", "ASC"]],
            });

            return {
              ...payment.toJSON(),
              receipt: receipt ? receipt.toJSON() : null,
              chequeTracks: chequeTracks.map((track) => track.toJSON()),
            };
          })
        );

        return {
          ...booking.toJSON(),
          payments: bookingPayments,
        };
      })
    );

    // Send the response
    res.json(responseData);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/* API with nested from bookings part without doc change */
// exports.GetFullCustData = async (req, res) => {
//   const customerID = req.params.id;
//   console.log("customer ID is : ", customerID);
//   try {
//     // Fetch customer data by customerID
//     const customerData = await Customer.findOne({
//       where: { CustomerID: customerID },
//       include: [
//         {
//           model: RegionMaster,
//           as: "CMRegionID",
//           attributes: ["RegionID", "RegionName"],
//         },
//         {
//           model: Statemaster,
//           as: "CMStateID",
//           attributes: ["StateID", "StateName"],
//         },
//         {
//           model: MSMEInfo,
//           as: "CMMSMEID",
//           attributes: [
//             "CustomerID",
//             "RegistrationType",
//             "DateOfRegistration",
//             "NameOfEnterprise",
//             "RegistrationNo",
//           ],
//         },
//         // {
//         //   model: BankMaster,
//         //   as: "CMBankID",
//         //   attributes: ["BankID", "BankName"],
//         // },
//       ],
//     });

//     // Check if customer data is empty
//     if (!customerData) {
//       return res.status(404).send({
//         message: "No customer data found",
//       });
//     }

//     // Fetch document info data by customerID
//     const docInfoData = await CustomerDocumentDetails.findAll({
//       where: { CustomerID: customerData.CustomerID },
//     });

//     // Extract unique DocTypeID values
//     const docTypeIds = docInfoData.map((doc) => doc.DocTypeID);
//     const docIDs = docInfoData.map((doc) => doc.DocID);

//     // Fetch doctype data for the extracted DocTypeID values
//     const doctypeData = await doctype.findAll({
//       where: { DocTypeID: { [Op.in]: docTypeIds } },
//     });

//     const docVerificationData = await custdocverification.findAll({
//       where: { [Op.and]: [{ CustomerID: customerID }, { DocID: docIDs }] },
//     });

//     // Map DocURLs and Doctypes with their respective DocTypeID
//     const docInfoMapped = docInfoData.map((doc) => {
//       const matchedVerification = docVerificationData.find(
//         (d) => d.DocID === doc.DocID
//       );
//       return {
//         DocTypeID: doc.DocTypeID,
//         DocID: doc.DocID,
//         DocURL: doc.DocURL,
//         DocumentAs: doctypeData.find((d) => d.DocTypeID === doc.DocTypeID)
//           .DocumentAs,
//         Doctype: doctypeData.find((d) => d.DocTypeID === doc.DocTypeID).Doctype,
//         VerificationStatus: matchedVerification
//           ? matchedVerification.Status
//           : null, // Check if matchedVerification is not undefined
//       };
//     });

//     // Extract GST and MSME documents
//     const gstDocs = docInfoMapped.filter((doc) => doc.DocTypeID === 3);
//     const msmDocs = docInfoMapped.filter((doc) => doc.DocTypeID === 9);
//     const otherDocs = docInfoMapped.filter(
//       (doc) => doc.DocTypeID !== 3 && doc.DocTypeID !== 9
//     );

//     // Add GST and MSME data to the customer data
//     const custGSTData = await custmerGSTdetails.findAll({
//       where: { CustomerID: customerID },
//     });

//     const custGSTDataWithVerification = custGSTData.map((gst) => ({
//       ...gst.toJSON(), // Convert sequelize object to plain JSON
//       VerificationStatus:
//         gstDocs.find((doc) => doc.DocID === gst.DocID)?.VerificationStatus ||
//         null,
//     }));

//     const responseData = {
//       customerData: {
//         CustomerID: customerData.CustomerID,
//         CustomerType: customerData.CustomerType,
//         CustID: customerData.CustID,
//         Title: customerData.Title,
//         FirstName: customerData.FirstName,
//         LastName: customerData.LastName,
//         PhoneNo: customerData.PhoneNo,
//         OfficeNo: customerData.OfficeNo,
//         Email: customerData.Email,
//         Occupation: customerData.Occupation,
//         Company: customerData.Company,
//         DateOfBirth: customerData.DateOfBirth,
//         DateOfAnniversary: customerData.DateOfAnniversary,
//         Address: customerData.Address,
//         District: customerData.District,
//         State: customerData.State,
//         PINCode: customerData.PINCode,
//         ModelName: customerData.ModelName,
//         VariantName: customerData.VariantName,
//         FuelType: customerData.FuelType,
//         AadharNo: customerData.AadharNo,
//         PANNo: customerData.PANNo,
//         DrivingLicence: customerData.DrivingLicence,
//         GSTIN: customerData.GSTIN,
//         GstType: customerData.GstType,
//         AccountHolderName: customerData.AccountHolderName,
//         AccountNo: customerData.AccountNo,
//         IFSCCode: customerData.IFSCCode,
//         Bank: customerData.BankID
//           ? (
//               await BankMaster.findOne({
//                 where: { BankID: customerData.BankID },
//               })
//             ).BankName
//           : null,
//         BranchDetails: customerData.BranchDetails,
//         IsActive: customerData.IsActive,
//         KycStatus: customerData.KycStatus,
//         CustomerStatus: customerData.CustomerStatus,
//         CreatedDate: customerData.CreatedDate,
//         ModifiedDate: customerData.ModifiedDate,
//         DistrictID: customerData.CMRegionID
//           ? customerData.CMRegionID.RegionID
//           : null,
//         DistrictName: customerData.CMRegionID
//           ? customerData.CMRegionID.RegionName
//           : null,
//         StateID: customerData.CMStateID ? customerData.CMStateID.StateID : null,
//         StateName: customerData.CMStateID
//           ? customerData.CMStateID.StateName
//           : null,
//         MSMEID: customerData.MSMEID,
//         RegistrationType: customerData.CMMSMEID
//           ? customerData.CMMSMEID.RegistrationType
//           : null,
//         DateOfRegistration: customerData.CMMSMEID
//           ? customerData.CMMSMEID.DateOfRegistration
//           : null,
//         NameOfEnterprise: customerData.CMMSMEID
//           ? customerData.CMMSMEID.NameOfEnterprise
//           : null,
//         RegistrationNo: customerData.CMMSMEID
//           ? customerData.CMMSMEID.RegistrationNo
//           : null,
//         BankID: customerData.BankID,
//         BankName: customerData.BankID
//           ? (
//               await BankMaster.findOne({
//                 where: { BankID: customerData.BankID },
//               })
//             ).BankName
//           : null,
//       },
//       CustdocInfo: [
//         ...gstDocs.map((doc) => ({
//           DocTypeID: doc.DocTypeID,
//           DocID: doc.DocID,
//           DocURL: doc.DocURL,
//           DocumentAs: doc.DocumentAs,
//           Doctype: doc.Doctype,
//           VerificationStatus: doc.VerificationStatus,
//         })),
//         ...msmDocs.map((doc) => ({
//           DocTypeID: doc.DocTypeID,
//           DocID: doc.DocID,
//           DocURL: doc.DocURL,
//           DocumentAs: doc.DocumentAs,
//           Doctype: doc.Doctype,
//           VerificationStatus: doc.VerificationStatus,
//         })),
//         ...otherDocs,
//       ],
//       custGSTData: custGSTDataWithVerification,
//       CustBookings: [],
//     };

//     // Fetch and organize bookings, payments, receipts, and cheque tracking data
//     const custBookings = await NewCarBookings.findAll({
//       where: { CustomerID: customerID },
//     });

//     for (const booking of custBookings) {
//       const payments = await PaymentRequest.findAll({
//         where: { TransactionID: booking.BookingID },
//       });

//       const paymentDetails = [];
//       for (const payment of payments) {
//         const receipt = await Receipts.findOne({
//           where: { RequestID: payment.ID },
//         });

//         const chequeTracks = await ChequeTracking.findAll({
//           where: {
//             CustomerID: customerID,
//             PaymentID: payment.ID,
//           },
//           order: [["ChqTrackID", "ASC"]],
//         });

//         paymentDetails.push({
//           ...payment.toJSON(),
//           receipt: receipt ? receipt.toJSON() : null,
//           chequeTracks: chequeTracks.map((track) => track.toJSON()),
//         });
//       }

//       responseData.CustBookings.push({
//         ...booking.toJSON(),
//         payments: paymentDetails,
//       });
//     }

//     // Send the response
//     res.json(responseData);
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };

/* Basic API to get all data */
// exports.GetFullCustData = async (req, res) => {
//   const customerID = req.params.id;
//   console.log("customer ID is : ", customerID);
//   try {
//     // Fetch customer data by customerID
//     const customerData = await Customer.findOne({
//       where: { CustomerID: customerID },
//       include: [
//         {
//           model: RegionMaster,
//           as: "CMRegionID",
//           attributes: ["RegionID", "RegionName"],
//         },
//         {
//           model: Statemaster,
//           as: "CMStateID",
//           attributes: ["StateID", "StateName"],
//         },
//         {
//           model: MSMEInfo,
//           as: "CMMSMEID",
//           attributes: [
//             "CustomerID",
//             "RegistrationType",
//             "DateOfRegistration",
//             "NameOfEnterprise",
//             "RegistrationNo",
//           ],
//         },
//         // {
//         //   model: BankMaster,
//         //   as: "CMBankID",
//         //   attributes: ["BankID", "BankName"],
//         // },
//       ],
//     });
//     // Check if customer data is empty
//     if (!customerData) {
//       return res.status(404).send({
//         message: "No customer data found",
//       });
//     }
//     console.log("Retrieved customer data: ", customerData);
//     // Fetch document info data by customerID
//     const docInfoData = await CustomerDocumentDetails.findAll({
//       where: { CustomerID: customerData.CustomerID },
//     });
//     // Check if document info data is empty
//     // if (!docInfoData || docInfoData.length === 0) {
//     //   return res.status(404).send({
//     //     message: "No document info found",
//     //   });
//     // }
//     console.log("Retrieved customer doc info data: ", docInfoData);
//     // Extract unique DocTypeID values
//     const docTypeIds = docInfoData.map((doc) => doc.DocTypeID);
//     const docIDs = docInfoData.map((doc) => doc.DocID);
//     console.log("doc Id's: ", docIDs);
//     // Fetch doctype data for the extracted DocTypeID values
//     const doctypeData = await doctype.findAll({
//       where: { DocTypeID: { [Op.in]: docTypeIds } },
//     });
//     // Check if doctype data is empty
//     // if (!doctypeData || doctypeData.length === 0) {
//     //   return res.status(404).send({
//     //     message: "No doctype data found",
//     //   });
//     // }
//     console.log("Retrieved doctype data: ", doctypeData);
//     const docVerificationData = await custdocverification.findAll({
//       where: { [Op.and]: [{ CustomerID: customerID }, { DocID: docIDs }] },
//     });
//     console.log("docVerificationData: ", docVerificationData);
//     // Map DocURLs and Doctypes with their respective DocTypeID
//     const docInfoMapped = docInfoData.map((doc) => {
//       const matchedVerification = docVerificationData.find(
//         (d) => d.DocID === doc.DocID
//       );
//       return {
//         DocTypeID: doc.DocTypeID,
//         DocID: doc.DocID,
//         DocURL: doc.DocURL,
//         DocumentAs: doctypeData.find((d) => d.DocTypeID === doc.DocTypeID)
//           .DocumentAs,
//         Doctype: doctypeData.find((d) => d.DocTypeID === doc.DocTypeID).Doctype,
//         VerificationStatus: matchedVerification
//           ? matchedVerification.Status
//           : null, // Check if matchedVerification is not undefined
//       };
//     });
//     console.log("docInfoMapped: ", docInfoMapped);
//     // Map VerificationStatus to custGSTData based on DocID
//     const docInfoMap = docInfoMapped.reduce((acc, doc) => {
//       acc[doc.DocID] = doc.VerificationStatus;
//       return acc;
//     }, {});
//     // Extract BankID from customer data
//     const bankID = customerData.BankID;
//     let bankName = null;

//     // Step 5: Fetch bank data if BankID is available
//     if (bankID) {
//       const bankData = await BankMaster.findOne({
//         where: { BankID: bankID },
//       });

//       if (bankData) {
//         bankName = bankData.BankName;
//       }
//     }
//     // customer GSTDATA
//     const custGSTData = await custmerGSTdetails.findAll({
//       where: { CustomerID: customerID },
//     });

//     // Add VerificationStatus to custGSTData
//     const custGSTDataWithVerification = custGSTData.map((gst) => ({
//       ...gst.toJSON(), // Convert sequelize object to plain JSON
//       VerificationStatus: docInfoMap[gst.DocID] || null,
//     }));

//     // Fetching All customer Bookings
//     const custBookings = await NewCarBookings.findAll({
//       where: { CustomerID: customerID },
//     });

//     const bookingIDs = custBookings.map((id) => id.BookingID);

//     // Fetching all payment data based on each booking
//     const custPayments = await PaymentRequest.findAll({
//       where: { TransactionID: bookingIDs },
//     });

//     const paymentReqIDs = custPayments.map((id) => id.ID);

//     // Fetching all receipt data based on each payment
//     const custReceipts = await Receipts.findAll({
//       where: { RequestID: paymentReqIDs },
//     });

//     const checkTrack = await ChequeTracking.findAll({
//       where: {
//         CustomerID: customerID,
//         PaymentID: paymentReqIDs,
//       },
//       order: [["ChqTrackID", "ASC"]],
//     });

//     // Step 6: Construct the response data with flattened structure
//     const responseData = {
//       customerData: {
//         CustomerID: customerData.CustomerID,
//         CustomerType: customerData.CustomerType,
//         CustID: customerData.CustID,
//         Title: customerData.Title,
//         FirstName: customerData.FirstName,
//         LastName: customerData.LastName,
//         PhoneNo: customerData.PhoneNo,
//         OfficeNo: customerData.OfficeNo,
//         Email: customerData.Email,
//         Occupation: customerData.Occupation,
//         Company: customerData.Company,
//         DateOfBirth: customerData.DateOfBirth,
//         DateOfAnniversary: customerData.DateOfAnniversary,
//         Address: customerData.Address,
//         District: customerData.District,
//         State: customerData.State,
//         PINCode: customerData.PINCode,
//         ModelName: customerData.ModelName,
//         VariantName: customerData.VariantName,
//         FuelType: customerData.FuelType,
//         AadharNo: customerData.AadharNo,
//         PANNo: customerData.PANNo,
//         DrivingLicence: customerData.DrivingLicence,
//         GSTIN: customerData.GSTIN,
//         GstType: customerData.GstType,
//         AccountHolderName: customerData.AccountHolderName,
//         AccountNo: customerData.AccountNo,
//         IFSCCode: customerData.IFSCCode,
//         Bank: bankName, // Use the fetched bank name
//         BranchDetails: customerData.BranchDetails,
//         IsActive: customerData.IsActive,
//         KycStatus: customerData.KycStatus,
//         CustomerStatus: customerData.CustomerStatus,
//         CreatedDate: customerData.CreatedDate,
//         ModifiedDate: customerData.ModifiedDate,
//         DistrictID: customerData.CMRegionID
//           ? customerData.CMRegionID.RegionID
//           : null,
//         DistrictName: customerData.CMRegionID
//           ? customerData.CMRegionID.RegionName
//           : null,
//         StateID: customerData.CMStateID ? customerData.CMStateID.StateID : null,
//         StateName: customerData.CMStateID
//           ? customerData.CMStateID.StateName
//           : null,
//         // CustomerID: customerData.CMMSMEID
//         // ? customerData.CMMSMEID.CustomerID
//         // : null,
//         MSMEID: customerData.MSMEID,
//         RegistrationType: customerData.CMMSMEID
//           ? customerData.CMMSMEID.RegistrationType
//           : null,
//         DateOfRegistration: customerData.CMMSMEID
//           ? customerData.CMMSMEID.DateOfRegistration
//           : null,
//         NameOfEnterprise: customerData.CMMSMEID
//           ? customerData.CMMSMEID.NameOfEnterprise
//           : null,
//         RegistrationNo: customerData.CMMSMEID
//           ? customerData.CMMSMEID.RegistrationNo
//           : null,
//         BankID: bankID,
//         BankName: bankName,
//       },
//       CustdocInfo: docInfoMapped,
//       custGSTData: custGSTDataWithVerification,
//       CustBookings: custBookings,
//       CustPayments: custPayments,
//       CustReceipts: custReceipts,
//       CustCheckTrack: checkTrack,
//     };

//     // Send the response
//     res.json(responseData);
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };
/* Basic API to get all data ends here */

exports.GSTStatus = async (req, res) => {
  const { CustomerID, GSTID } = req.body;

  // Check if CustomerID and GSTID are provided
  if (!CustomerID || !GSTID) {
    return res.status(400).send({
      message: "CustomerID and GSTID must be provided",
    });
  }

  try {
    // Determine IsActive and Status dynamically based on your custom logic
    let IsActive, Status;

    // Example logic for determining IsActive and Status
    // You can replace this logic with your own conditions
    const gstInfo = await CustomerGSTInfo.findOne({
      where: { CustomerID: CustomerID, GSTID: GSTID },
    });

    if (gstInfo) {
      // Example: If existing GST entry is active, set new values to inactive
      if (gstInfo.IsActive === true) {
        IsActive = false;
        Status = "In-Active";
      } else {
        IsActive = true;
        Status = "Active";
      }
    } else {
      return res.status(404).send({
        message: "No matching records found in CustomerGSTInfo",
      });
    }

    // Update CustomerGSTInfo table
    const updateGSTInfo = await CustomerGSTInfo.update(
      {
        IsActive: IsActive,
        Status: Status,
      },
      {
        where: {
          CustomerID: CustomerID,
          GSTID: GSTID,
        },
      }
    );

    // Update related tables based on the dynamic IsActive and Status values
    if (IsActive === true && Status === "Active") {
      // Update CustomerDocInfo table where DocTypeID is 3
      const updateDocInfo = await CustomerDocInfo.update(
        {
          IsActive: true,
          Status: "Active",
        },
        {
          where: {
            CustomerID: CustomerID,
            DocTypeID: 3, // Fixed DocTypeID as 3
          },
        }
      );

      // Update DocumentVerification table
      const updateDocVerification = await DocumentVerification.update(
        {
          IsActive: true,
        },
        {
          where: {
            CustomerID: CustomerID,
            GSTID: GSTID,
          },
        }
      );
    } else if (IsActive === false && Status === "In-Active") {
      // Update CustomerDocInfo table where DocTypeID is 3
      const updateDocInfo = await CustomerDocInfo.update(
        {
          IsActive: false,
          Status: "In-Active",
        },
        {
          where: {
            CustomerID: CustomerID,
            DocTypeID: 3, // Fixed DocTypeID as 3
          },
        }
      );

      // Update DocumentVerification table
      const updateDocVerification = await DocumentVerification.update(
        {
          IsActive: false,
        },
        {
          where: {
            CustomerID: CustomerID,
            GSTID: GSTID,
          },
        }
      );
    }

    // Check if the main table (CustomerGSTInfo) was updated
    if (updateGSTInfo[0] === 0) {
      return res.status(404).send({
        message: "No matching records found to update in CustomerGSTInfo",
      });
    }

    // Send success response
    res.status(200).send({
      message: `Records updated successfully to ${Status}`,
    });
  } catch (err) {
    // Handle errors
    console.error("Error updating records:", err);
    res.status(500).send({
      message: "An error occurred while updating records",
    });
  }
};
exports.GetGstbyId = async (req, res) => {
  try {
    const { GSTID } = req.query;

    // Validate the GSTID in the request
    if (!GSTID) {
      return res.status(400).json({ message: "GSTID is required" });
    }

    // Fetch the data based on GSTID
    const data = await custmerGSTdetails.findOne({
      where: { GSTID },
      include: [
        {
          model: statepos,
          as: "CGIStatePOSID",
        },
      ],
    });

    // Check if no data found
    if (!data) {
      return res
        .status(404)
        .json({ message: "No data found for the given GSTID" });
    }

    // Transform the data to the required format
    const transformedData = {
      GSTID: data.GSTID,
      CustomerID: data.CustomerID,
      GSTIN: data.GSTIN,
      RegistrationType: data.RegistrationType,
      LegalName: data.LegalName,
      TradeName: data.TradeName,
      DOR: data.DOR,
      EntityType: data.EntityType,
      Address: data.Address,
      StateID: data.StateID,
      PINCode: data.PINCode,
      DocID: data.DocID,
      IsActive: data.IsActive,
      Status: data.Status,
      CreatedDate: data.CreatedDate,
      ModifiedDate: data.ModifiedDate,
      StateName: data.CGIStatePOSID.StateName, // Add StateName
      POSID: data.CGIStatePOSID.POSID, // Add POSID
    };

    // Send the transformed data as the response
    res.status(200).json(transformedData);
  } catch (error) {
    console.error(error);
    // Return error response
    return res
      .status(500)
      .json({ message: error.message || "Internal server error" });
  }
};
