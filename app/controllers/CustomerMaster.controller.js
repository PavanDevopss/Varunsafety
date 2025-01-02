/* eslint-disable no-unused-vars */
const db = require("../models");
const CustomerMaster = db.customermaster;
const Op = db.Sequelize.Op;
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const MSMEInfoModel = require("../models/MSMEInfo.model");
const RegionMaster = db.regionmaster;
const StateMaster = db.statemaster;
const ModelMaster = db.modelmaster;
const VariantMaster = db.variantmaster;
const FuelTypeMaster = db.fueltypes;
const ColourMaster = db.colourmaster;
const BankMaster = db.bankmaster;
const Statemaster = db.statemaster;
const empmapimg = db.CustEmpMaping;
const usermaster = db.usermaster;
const MSMEInfo = db.msmeInfo;
const custemp = db.CustEmpMaping;
//  exports.create = (req, res) => {

//   // Create a Customer
//   const modelmaster = {

//     CustomerType: req.body.CustomerType,
//     Tittle: req.body.Tittle,
//     FirstName: req.body.FirstName,
//     LastName: req.body.LastName,
//     PhoneNumber: req.body.PhoneNumber,
//     OfficeNumber: req.body.OfficeNumber,
//     Email:req.body.Email,
//     Occupation: req.body.Occupation,
//     Company: req.body,Company,
//     DateOfBirth: req.body.DateOfBirth,
//     DateOfAnnversary: req.body.DateOfAnnversary,
//     Address: req.body.Address,
//     District: req.body.District,
//     State: req.body.State,
//     Pincode: req.body.Pincode,
//     status: req.body.status ? req.body.status : false,
//     isActive:req.body.isActive ? req.body.isActive : true,
//    // image: req.file.path

//   };

//   // Save Customer in the database
//   Customer.create(modelmaster)
//     .then(data => {
//       res.send(data);
//     })
//     .catch(err => {
//       res.status(500).send({
//         message:
//           err.message || "Some error occurred while creating the Customer."
//       });
//     });
// };

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "Images");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 },
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif/;
    const mimeType = fileTypes.test(file.mimetype);
    const extname = fileTypes.test(path.extname(file.originalname));

    if (mimeType && extname) {
      return cb(null, true);
    }
    cb(new Error("Give proper files format to upload"));
  },
}).single("image");

// Middleware function to handle image upload
exports.uploadImage = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    next(); // Call next middleware function (in this case, the 'create' function)
  });
};

// Controller function to handle creating customer
// exports.create = async (req, res) => {
//   try {
//     // Assuming 'req.file' contains the uploaded file information
//     if (!req.file) {
//       return res.status(400).json({ error: "No file uploaded" });
//     }

//     // Create a Customer
//     const modelmaster = {
//       CustomerType: req.body.CustomerType,
//       Title: req.body.Title,
//       FirstName: req.body.FirstName,
//       LastName: req.body.LastName,
//       PhoneNumber: req.body.PhoneNumber,
//       OfficeNumber: req.body.OfficeNumber,
//       Email: req.body.Email,
//       Occupation: req.body.Occupation,
//       Company: req.body.Company,
//       DateOfBirth: req.body.DateOfBirth,
//       DateOfAnniversary: req.body.DateOfAnniversary,
//       Address: req.body.Address,
//       District: req.body.District,
//       State: req.body.State,
//       Pincode: req.body.Pincode,
//       status: req.body.status ? req.body.status : false,
//       isActive: req.body.isActive ? req.body.isActive : true,
//       image: req.file.path,
//     };

//     // Save Customer in the database
//     const data = await Customer.create(modelmaster);
//     res.status(200).json(data);
//   } catch (err) {
//     res.status(500).json({
//       message:
//         err.message || "Some error occurred while creating the Customer.",
//     });
//   }
// };

// //Retrieve all Customer from the database.

exports.GetCustomersList = async (req, res) => {
  try {
    // Fetching data from the database
    const customers = await CustomerMaster.findAll({
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
      ],
      order: [["CreatedDate", "DESC"]],
    });

    // Check if data is empty
    if (!customers || customers.length === 0) {
      return res.status(404).send({
        message: "No data found",
      });
    }

    // Fetching Empid for each customer
    const customersWithEmpid = customers.res // Send the response
      .json(customersWithEmpid);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: error.message || "Internal server error" });
  }
};

// // Find a single Customer with an id
// exports.findOne = (req, res) => {
//   const id = req.params.id;

//   Customer.findByPk(id)
//     .then((data) => {
//       res.send(data);
//     })
//     .catch((err) => {
//       res.status(500).send({
//         message: "Error retrieving Customer with id=" + id,
//       });
//     });
// };

// // Controller function to handle updating customer
// exports.update = (req, res) => {
//   // const id = req.params.CustomerId; // Assuming CustomerId is the parameter for identifying the customer to update
//   const id = req.params.id;
//   console.log(id);
//   // Update the customer record
//   Customer.findByPk(id)
//     .then((customer) => {
//       if (!customer) {
//         return res
//           .status(404)
//           .json({ message: `Customer with id=${id} not found` });
//       }

//       // Update customer attributes based on request body
//       customer.CustomerType = req.body.CustomerType || customer.CustomerType;
//       customer.Tittle = req.body.Tittle || customer.Tittle;
//       customer.FirstName = req.body.FirstName || customer.FirstName;
//       customer.LastName = req.body.LastName || customer.LastName;
//       customer.PhoneNumber = req.body.PhoneNumber || customer.PhoneNumber;
//       customer.OfficeNumber = req.body.OfficeNumber || customer.OfficeNumber;
//       customer.Email = req.body.Email || customer.Email;
//       customer.Occupation = req.body.Occupation || customer.Occupation;
//       customer.Company = req.body.Company || customer.Company;
//       customer.DateOfBirth = req.body.DateOfBirth || customer.DateOfBirth;
//       customer.DateOfAnnversary =
//         req.body.DateOfAnnversary || customer.DateOfAnnversary;
//       customer.Address = req.body.Address || customer.Address;
//       customer.District = req.body.District || customer.District;
//       customer.State = req.body.State || customer.State;
//       customer.Pincode = req.body.Pincode || customer.Pincode;
//       customer.status =
//         req.body.status !== undefined ? req.body.status : customer.status;
//       customer.isActive =
//         req.body.isActive !== undefined ? req.body.isActive : customer.isActive;

//       // Save the updated customer record
//       customer
//         .save()
//         .then(() => {
//           res.status(200).json({
//             message: `Customer with id=${id} was updated successfully`,
//           });
//         })
//         .catch((err) => {
//           res.status(500).json({
//             message: `Error updating Customer with id=${id}`,
//             error: err.message,
//           });
//         });
//     })
//     .catch((err) => {
//       res.status(500).json({
//         message: `Error finding Customer with id=${id}`,
//         error: err.message,
//       });
//     });
// };
exports.create = async (req, res) => {
  console.log("CustomerID:", req.body.CustomerID);

  try {
    // Validate request
    if (!req.body.FirstName || !req.body.LastName) {
      return res
        .status(400)
        .json({ message: "FirstName and LastName cannot be empty" });
    }
    if (
      !/^[a-zA-Z ]*$/.test(req.body.FirstName) ||
      !/^[a-zA-Z ]*$/.test(req.body.LastName)
    ) {
      console.log(
        "Validation failed: FirstName or LastName contains invalid characters."
      );
      return res.status(400).json({
        message:
          "FirstName and LastName should contain only letters and spaces",
      });
    }

    // Check if Email already exists
    const existingModel = await CustomerMaster.findOne({
      where: { Email: req.body.Email },
    });
    if (existingModel) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Create a CustomerMaster
    const customerMaster = {
      CustomerID: req.body.CustomerID,
      CustomerType: req.body.CustomerType,
      CustID: req.body.CustID,
      Title: req.body.Title,
      Gender: req.body.Gender,
      RelationName: req.body.RelationName,
      RelationType: req.body.RelationType,
      FirstName: req.body.FirstName,
      LastName: req.body.LastName,
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
      ModelID: req.body.ModelID,
      VariantID: req.body.VariantID,
      FuelTypeID: req.body.FuelTypeID,
      ColourID: req.body.ColourID,
      AadharNo: req.body.AadharNo,
      PANNo: req.body.PANNo,
      DrivingLicence: req.body.DrivingLicence,
      AccountHolderName: req.body.AccountHolderName,
      AccountNo: req.body.AccountNo,
      IFSCCode: req.body.IFSCCode,
      BankID: req.body.BankID,
      BranchDetails: req.body.BranchDetails,
      IsActive: req.body.IsActive || true,
      KycStatus: req.body.KycStatus || "Pending",
      CustomerStatus: req.body.CustomerStatus || "Active",
    };

    // Save CustomerMaster in the database
    const newCustomerMaster = await CustomerMaster.create(customerMaster);

    return res.status(201).json(newCustomerMaster); // Send the newly created CustomerMaster as response
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

    console.error("Error creating CustomerMaster:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
exports.findAll = async (req, res) => {
  try {
    // Fetch all customer data with included foreign key data
    const customerData = await CustomerMaster.findAll({
      attributes: [
        "CustomerID",
        "CustomerType",
        "CustID",
        "Title",
        "Gender",
        "RelationName",
        "RelationType",
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
        "DistrictID",
        "StateID",
        "PINCode",
        "ModelID",
        "VariantID",
        "FuelTypeID",
        "ColourID",
        "AadharNo",
        "PANNo",
        "DrivingLicence",
        "AccountHolderName",
        "AccountNo",
        "IFSCCode",
        "BankID",
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
          model: StateMaster,
          as: "CMStateID",
          attributes: ["StateID", "StateName"],
        },
        {
          model: ModelMaster,
          as: "CMModelID",
          attributes: ["ModelMasterID", "ModelCode", "ModelDescription"],
        },
        {
          model: VariantMaster,
          as: "CMVariantID",
          attributes: ["VariantID", "VariantCode"],
        },
        {
          model: FuelTypeMaster,
          as: "CMFuelTypeID",
          attributes: ["FuelTypeID", "FuelTypeName"],
        },
        {
          model: ColourMaster,
          as: "CMColourID",
          attributes: ["ColourID", "ColourCode", "ColourDescription"],
        },
        {
          model: BankMaster,
          as: "CMBankID",
          attributes: ["BankID", "BankName"],
        },
      ],
      order: [
        ["CustID", "ASC"], // Order by ModelDescription in ascending order
      ],
    });

    // Check if data is empty
    if (!customerData || customerData.length === 0) {
      return res.status(404).json({
        message: "No customer data found.",
      });
    }

    // Map the data for response
    const combinedData = customerData.map((item) => ({
      CustomerID: item.CustomerID,
      CustomerType: item.CustomerType,
      CustID: item.CustID,
      Title: item.Title,
      Gender: item.Gender,
      RelationName: item.RelationName,
      RelationType: item.RelationType,

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
      DistrictID: item.DistrictID,
      DistrictName: item.CMRegionID ? item.CMRegionID.RegionName : null,
      StateID: item.StateID,
      StateName: item.CMStateID ? item.CMStateID.StateName : null,
      PINCode: item.PINCode,
      ModelID: item.ModelID,
      ModelCode: item.CMModelID ? item.CMModelID.ModelCode : null,
      ModelDescription: item.CMModelID ? item.CMModelID.ModelDescription : null,
      VariantID: item.VariantID,
      VariantCode: item.CMVariantID ? item.CMVariantID.VariantCode : null,
      FuelTypeID: item.FuelTypeID,
      FuelTypeName: item.CMFuelTypeID ? item.CMFuelTypeID.FuelTypeName : null,
      ColourID: item.ColourID,
      ColourCode: item.CMColourID ? item.CMColourID.ColourCode : null,
      ColourDescription: item.CMColourID
        ? item.CMColourID.ColourDescription
        : null,
      AadharNo: item.AadharNo,
      PANNo: item.PANNo,
      DrivingLicence: item.DrivingLicence,
      AccountHolderName: item.AccountHolderName,
      AccountNo: item.AccountNo,
      IFSCCode: item.IFSCCode,
      BankID: item.BankID,
      BankName: item.CMBankID ? item.CMBankID.BankName : null,
      BranchDetails: item.BranchDetails,
      IsActive: item.IsActive,
      KycStatus: item.KycStatus,
      CustomerStatus: item.CustomerStatus,
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
        message: "Database error occurred while retrieving customer data.",
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
    console.error("Error retrieving customer data:", error);
    return res.status(500).json({
      message: "Failed to retrieve customer data. Please try again later.",
    });
  }
};
exports.findCustomerByID = async (req, res) => {
  try {
    const id = req.params.id;

    // Validate the ID parameter
    if (!id) {
      return res.status(400).json({
        message: "ID parameter is required.",
      });
    }

    // Fetch the customer data by primary key with included foreign key data
    const customerData = await CustomerMaster.findOne({
      where: {
        CustomerID: id,
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
        "Gender",
        "RelationName",
        "RelationType",
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
        "DocStatus",
        "CreatedDate",
        "ModifiedDate",
      ],
      include: [
        {
          model: RegionMaster,
          as: "CMRegionID",
          attributes: ["RegionName"],
        },
        {
          model: StateMaster,
          as: "CMStateID",
          attributes: ["StateName"],
        },
        {
          model: MSMEInfo,
          as: "CMMSMEID",
          attributes: [
            "RegistrationType",
            "DateOfRegistration",
            "NameOfEnterprise",
            "RegistrationNo",
            "Status",
          ],
        },
        {
          model: BankMaster,
          as: "CMBankID",
          attributes: ["BankID", "BankName"],
        },
      ],
    });

    // Check if data is found
    if (!customerData) {
      return res.status(404).json({
        message: "Customer data not found.",
      });
    }

    // Prepare the response data
    const responseData = {
      CustomerID: customerData.CustomerID,
      CustomerType: customerData.CustomerType,
      CustID: customerData.CustID,
      Title: customerData.Title,
      Gender: customerData.Gender,
      RelationName: customerData.RelationName,
      RelationType: customerData.RelationType,
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
      DistrictID: customerData.DistrictID,
      DistrictName: customerData.CMRegionID
        ? customerData.CMRegionID.RegionName
        : null,
      StateID: customerData.StateID,
      StateName: customerData.CMStateID
        ? customerData.CMStateID.StateName
        : null,
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
      BankID: customerData.BankID,
      BankName: customerData.CMBankID ? customerData.CMBankID.BankName : null,
      MSMEID: customerData.MSMEID,
      RegistrationType: customerData.CMMSMEID
        ? customerData.CMMSMEID.RegistrationType
        : null,
      DateOfRegistration: customerData.CMMSMEID
        ? customerData.CMMSMEID.DateOfRegistration
        : null,
      NameOfEnterprise: customerData.CMMSMEID
        ? customerData.CMMSMEID.NameOfEnterprise
        : null,
      RegistrationNo: customerData.CMMSMEID
        ? customerData.CMMSMEID.RegistrationNo
        : null,
      MSMEStatus: customerData.CMMSMEID ? customerData.CMMSMEID.Status : null,
      BranchDetails: customerData.BranchDetails,
      IsActive: customerData.IsActive,
      KycStatus: customerData.KycStatus,
      CustomerStatus: customerData.CustomerStatus,
      CreatedDate: customerData.CreatedDate,
      ModifiedDate: customerData.ModifiedDate,
    };

    // Send the response data
    res.json(responseData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while retrieving customer data.",
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
    console.error("Error retrieving customer data:", error);
    return res.status(500).json({
      message: "Failed to retrieve customer data. Please try again later.",
    });
  }
};
exports.updateByPk = async (req, res) => {
  console.log("FirstName:", req.body.FirstName);
  console.log("LastName:", req.body.LastName);

  try {
    if (!req.body.FirstName || !req.body.LastName) {
      return res
        .status(400)
        .json({ message: "FirstName or LastName cannot be empty" });
    }
    if (
      !/^[a-zA-Z ]*$/.test(req.body.FirstName) ||
      !/^[a-zA-Z ]*$/.test(req.body.LastName)
    ) {
      console.log(
        "Validation failed: FirstName or LastName contains invalid characters."
      );
      return res.status(400).json({
        message:
          "FirstName and LastName should contain only letters and spaces",
      });
    }
    const customerId = req.params.id;

    // Validate the ID parameter
    if (!customerId) {
      return res.status(400).json({ message: "ID parameter is required." });
    }

    // Find the customer by ID
    let customer = await CustomerMaster.findByPk(customerId);

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    customer.CustomerType = req.body.CustomerType || customer.CustomerType;
    customer.CustID = req.body.CustID || customer.CustID;
    customer.Title = req.body.Title || customer.Title;
    customer.Gender = req.body.Title || customer.Gender;
    customer.RelationType = req.body.Title || customer.RelationType;
    customer.RelationName = req.body.Title || customer.RelationName;
    customer.FirstName = req.body.FirstName;
    customer.LastName = req.body.LastName || customer.LastName;
    customer.PhoneNo = req.body.PhoneNo || customer.PhoneNo;
    customer.OfficeNo = req.body.OfficeNo || customer.OfficeNo;
    customer.Email = req.body.Email || customer.Email;
    customer.Occupation = req.body.Occupation || customer.Occupation;
    customer.Company = req.body.Company || customer.Company;
    customer.DateOfBirth = req.body.DateOfBirth || customer.DateOfBirth;
    customer.DateOfAnniversary =
      req.body.DateOfAnniversary || customer.DateOfAnniversary;
    customer.Address = req.body.Address || customer.Address;
    customer.DistrictID = req.body.DistrictID || customer.DistrictID;
    customer.StateID = req.body.StateID || customer.StateID;
    customer.PINCode = req.body.PINCode || customer.PINCode;
    customer.ModelID = req.body.ModelID || customer.ModelID;
    customer.VariantID = req.body.VariantID || customer.VariantID;
    customer.FuelTypeID = req.body.FuelTypeID || customer.FuelTypeID;
    customer.ColourID = req.body.ColourID || customer.ColourID;
    customer.AadharNo = req.body.AadharNo || customer.AadharNo;
    customer.PANNo = req.body.PANNo || customer.PANNo;
    customer.DrivingLicence =
      req.body.DrivingLicence || customer.DrivingLicence;
    customer.AccountHolderName =
      req.body.AccountHolderName || customer.AccountHolderName;
    customer.AccountNo = req.body.AccountNo || customer.AccountNo;
    customer.IFSCCode = req.body.IFSCCode || customer.IFSCCode;
    customer.BankID = req.body.BankID || customer.BankID;
    customer.BranchDetails = req.body.BranchDetails || customer.BranchDetails;
    customer.IsActive = req.body.IsActive || customer.IsActive;
    customer.KycStatus = req.body.KycStatus || customer.KycStatus;
    customer.CustomerStatus =
      req.body.CustomerStatus || customer.CustomerStatus;
    customer.ModifiedDate = new Date(); // Update modified date

    // Save updated customer in the database
    const updatedCustomer = await customer.save();
    console.log("Updated Successfully", updatedCustomer);

    // Send the updated customer as response
    // return res.status(200).json(responseData);
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
        message: "Database error occurred while updating customer.",
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
    console.error("Error updating customer:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
exports.deleteById = async (req, res) => {
  const id = req.params.id;

  try {
    // Validate the ID parameter
    if (!id) {
      return res.status(400).json({ message: "ID parameter is required." });
    }

    // Find the customer by ID
    const customer = await CustomerMaster.findByPk(id);

    // Check if the customer exists
    if (!customer) {
      return res
        .status(404)
        .json({ message: "Customer not found with id: " + id });
    }

    // Delete the customer
    await customer.destroy();

    // Send a success message
    res.status(200).json({
      message: "Customer with id: " + id + " deleted successfully",
    });
  } catch (err) {
    // Handle errors based on specific types
    if (err.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while deleting customer.",
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
    console.error("Error deleting customer:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.GetCustomerList = async (req, res) => {
  try {
    const data = await CustomerMaster.findAll({
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
        "MSMEID",
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
          model: MSMEInfo,
          as: "CMMSMEID",
          attributes: [
            "RegistrationType",
            "DateOfRegistration",
            "NameOfEnterprise",
            "RegistrationNo",
          ],
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
      Gender: item.Gender,
      PhoneNo: item.PhoneNo,
      OfficeNo: item.OfficeNo,
      Email: item.Email,
      Occupation: item.Occupation,
      Company: item.Company,
      DateOfBirth: item.DateOfBirth,
      DateOfAnniversary: item.DateOfAnniversary,
      RelationType: item.RelationType,
      RelationName: item.RelationName,
      Address: item.Address,
      DistrictID: item.DistrictID,
      StateID: item.StateID,
      PINCode: item.PINCode,
      AadharNo: item.AadharNo,
      PANNo: item.PANNo,
      DrivingLicence: item.DrivingLicence,
      AccountHolderName: item.AccountHolderName,
      AccountNo: item.AccountNo,
      IFSCCode: item.IFSCCode,
      BranchDetails: item.BranchDetails,
      IsActive: item.IsActive,
      ModelName: item.ModelName,
      VariantName: item.VariantName,
      FuelType: item.FuelType,
      ColourName: item.ColourName,
      Transmission: item.Transmission,
      MSMEID: item.MSMEID,
      District: item.CMRegionID ? item.CMRegionID.RegionName : null,
      State: item.CMStateID ? item.CMStateID.StateName : null,
      RegistrationType: item.CMMSMEID ? item.CMMSMEID.RegistrationType : null,
      DateOfRegistration: item.CMMSMEID
        ? item.CMMSMEID.DateOfRegistration
        : null,
      NameOfEnterprise: item.CMMSMEID ? item.CMMSMEID.NameOfEnterprise : null,
      RegistrationNo: item.CMMSMEID ? item.CMMSMEID.RegistrationNo : null,
      BankName: bankMap[item.BankID] || null,
      ExecutiveName:
        item.CMEmployees.length > 0 ? item.CMEmployees[0].UserName : null,
      EmpBranch:
        item.CMEmployees.length > 0 ? item.CMEmployees[0].Branch : null,
      KycStatus: item.KycStatus,
      CustomerStatus: item.CustomerStatus,
      CreatedDate: item.CreatedDate,
      ModifiedDate: item.ModifiedDate,
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

// exports.updateCustomerMapping = async (req, res) => {
//   try {
//     const { CustomerID, EmpID } = req.body;
//     console.log("Request Body:", req.body);

//     // Fetch the CustEmp record using EmpID and CustomerID
//     let custEmp = await custemp.findOne({
//       where: {
//         CustomerID: CustomerID,
//         // EmpID: EmpID,
//       },
//     });

//     // Check if CustEmp exists
//     if (!custEmp) {
//       return res.status(404).json({ message: "CustEmp not found" });
//     }

//     // Update fields
//     custEmp.CustomerID = CustomerID || custEmp.CustomerID;
//     custEmp.IsActive = EmpID || custEmp.EmpID;
//     custEmp.ModifiedDate = new Date();

//     // Save updated CustEmp in the database
//     const updatedCustEmp = await custemp.save();

//     // Send the updated CustEmp as response
//     return res.status(200).json(updatedCustEmp);
//   } catch (err) {
//     // Handle errors based on specific types
//     if (err.name === "SequelizeValidationError") {
//       return res.status(400).json({
//         message: "Validation error",
//         details: err.errors.map((e) => e.message),
//       });
//     }

//     if (err.name === "SequelizeDatabaseError") {
//       return res.status(500).json({
//         message: "Database error occurred while updating CustEmp.",
//         details: err.message,
//       });
//     }

//     if (err.name === "SequelizeConnectionError") {
//       return res.status(503).json({
//         message: "Service unavailable. Unable to connect to the database.",
//         details: err.message,
//       });
//     }

//     // General error handling
//     console.error("Error updating CustEmp:", err);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };

exports.updateCustomerMapping = async (req, res) => {
  try {
    const { CustomerID, EmpID } = req.body;

    // Validate request body
    if (!CustomerID || !EmpID) {
      return res.status(400).json({
        message: "Both CustomerID and EmpID are required.",
      });
    }

    console.log("Request Body:", req.body);

    // Fetch the CustEmp record using CustomerID and EmpID
    const custEmp = await custemp.findOne({
      where: {
        CustomerID: CustomerID,
        // EmpID: EmpID,
      },
    });

    // Check if CustEmp exists
    if (!custEmp) {
      return res.status(404).json({ message: "CustEmp not found" });
    }

    // Update fields: CustomerID and EmpID
    custEmp.CustomerID = CustomerID;
    custEmp.EmpID = EmpID;
    custEmp.ModifiedDate = new Date();

    // Save updated CustEmp in the database
    const updatedCustEmp = await custEmp.save();

    // Send the updated CustEmp as response
    return res.status(200).json(updatedCustEmp);
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
        message: "Database error occurred while updating CustEmp.",
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
    console.error("Error updating CustEmp:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
