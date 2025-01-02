/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const db = require("../models");
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;
const NewCarBooking = db.NewCarBookings;
const BranchMaster = db.branchmaster;
const customer = db.customermaster;
const empolyeemapdata = db.CustEmpMaping;
const CustomerReceipt = db.CustReceipt;
const PaymentReq = db.PaymentRequests;
const CustDocInfo = db.customerdocinfo;
const DocumentType = db.documenttypes;
const userdata = db.usermaster;
const RegionMaster = db.regionmaster;
const StateMaster = db.statemaster;
const UserMaster = db.usermaster;
const BookingsDocInfo = db.bookingsdocinfo;
const DocVerification = db.documentverification;
const MSMEInfo = db.msmeInfo;
const doctype = db.documenttypes;
const CustGSTInfo = db.customergstinfo;
const FinanceDocs = db.financedocuments;
const FinanceApplication = db.financeapplication;
const VehicleAllotment = db.vehicleallotment;
const VehicleChangeRequest = db.vehiclechangereq;
const fs = require("fs");
const path = require("path");
const { configureMulter } = require("../Utils/multerService");
const { transferImageToServer } = require("../Utils/sshService");
const {
  generateBookingNo,
  genDocNameforBooking,
} = require("../Utils/generateService");

//Basic CRUD API for New Car Bookings

//Retrieve all booking list from the database
exports.findAll = async (req, res) => {
  const { EmpID } = req.query;

  // Validate input
  if (!EmpID) {
    return res.status(400).send({
      message: "EMPID is required in query parameters.",
    });
  }

  try {
    // Find employee data
    const empData = await empolyeemapdata.findAll({ where: { EmpID } });

    if (!empData || empData.length === 0) {
      return res.status(404).send({
        message: `Employee data not found for EMPID ${EmpID}`,
      });
    }

    // Extract CustomerIDs from empData
    const customerIDs = empData.map((item) => item.CustomerID);

    // Find NewCarBookings for extracted CustomerIDs
    const bookings = await NewCarBooking.findAll({
      where: { CustomerID: customerIDs },
      include: [
        {
          model: UserMaster,
          as: "NCBSPUserID", // Alias for the association
          attributes: ["UserID", "UserName", "EmpID"], // Select relevant fields
        },
        {
          model: UserMaster,
          as: "NCBTLUserID", // Alias for the association
          attributes: ["UserID", "UserName", "EmpID"], // Select relevant fields
        },
      ],
    });

    if (!bookings || bookings.length === 0) {
      return res.status(404).send({
        message: "No NewCarBookings data found.",
      });
    }

    const bookingIDs = bookings.map((ids) => ids.BookingID);

    // Fetch related vehicle allotment data
    const vehicleAllotmentData = await VehicleAllotment.findAll({
      where: { BookingID: bookingIDs },
      attributes: ["BookingID", "AllotmentStatus"],
    });

    // Fetch related vehicle allotment Change Request data
    const vehicleChangeReqData = await VehicleChangeRequest.findAll({
      where: { BookingID: bookingIDs },
      attributes: ["BookingID", "ChangeStatus"],
    });

    // Create allotment map for quick lookup
    const allotmentMap = vehicleAllotmentData.reduce((acc, allotment) => {
      acc[allotment.BookingID] = allotment.AllotmentStatus;
      return acc;
    }, {});

    // Create change request map for quick lookup
    const changeReqMap = vehicleChangeReqData.reduce((acc, changeReq) => {
      acc[changeReq.BookingID] = changeReq.ChangeStatus;
      return acc;
    }, {});

    // Map over the booking data and enrich with master data IDs
    const updatedBookingData = bookings.map((booking) => {
      let allotmentStatus;

      // Check for allotment status
      if (allotmentMap[booking.BookingID]) {
        allotmentStatus = allotmentMap[booking.BookingID]; // Use allotment status if it exists
      } else if (changeReqMap[booking.BookingID]) {
        allotmentStatus = "Approval Pending" || changeReqMap[booking.BookingID]; // Use change request status if allotment doesn't exist
      } else {
        allotmentStatus = "Not Requested"; // Set to "Not Requested" if neither exist
      }

      // Enrich booking data
      booking.dataValues.AllotmentStatus = allotmentStatus;

      return booking;
    });

    // Send the data
    res.send(updatedBookingData);
  } catch (err) {
    console.error("Error retrieving NewCarBookings:", err);

    // Centralized error handling
    if (err.name === "SequelizeDatabaseError") {
      res.status(500).send({
        message: "Database error occurred while retrieving data.",
        error: err.message,
      });
    } else {
      res.status(500).send({
        message: "Some error occurred while processing the request.",
        error: err.message,
      });
    }
  }
};

// Find a single booking with an id
// exports.findOne = async (req, res) => {
//   const id = req.params.id;

//   try {
//     // Perform database query to find the entry with the given ID
//     const data = await NewCarBooking.findOne({ where: { BookingID: id } });

//     // Check if data is empty
//     if (!data) {
//       return res
//         .status(404)
//         .send({ message: `NewCarBookings not found with id=${id}` });
//     }
//     // Send the data
//     res.send(data);
//   } catch (err) {
//     // Handle database errors
//     console.error("Error retrieving NewCarBookings", err);
//     res
//       .status(500)
//       .send({ message: `Error retrieving NewCarBookings with id=${id}` });
//   }
// };
// const { Op } = require("sequelize");

// exports.BookingSearch = async (req, res) => {
//   const { CustomerID, FirstName, PhoneNo, AadharNo, PANNo, EMPID } = req.query;

//   // Debug: Log the received query parameters
//   console.log("Received query parameters:", req.query);

//   // Constructing the where clause based on provided query parameters
//   const whereClause = {};
//   if (CustomerID) whereClause.CustomerID = CustomerID;
//   if (FirstName) whereClause.FirstName = FirstName;
//   if (PhoneNo) whereClause.PhoneNo = PhoneNo;
//   if (AadharNo) whereClause.AadharNo = AadharNo;
//   if (PANNo) whereClause.PANNo = PANNo;

//   // Check if at least one parameter is provided
//   if (Object.keys(whereClause).length === 0) {
//     return res.status(400).send({ message: "No query parameters provided" });
//   }
//   try {
//     const empdata = await empolyeemapdata.findOne({
//       where: { EMPID: EMPID },
//     });

//     const customerid = empdata.CustomerID;
//     if (!customerid) {
//       return res.status(404).send({
//         message: "CustomerId Not Found",
//       });
//     }
//     console.log(".....", empdata.CustomerID);
//     // Perform database query to find the entry with the given criteria
//     const data = await customer.findOne({
//       where: whereClause,
//       customerid,
//     });
//     // Check if data is empty
//     if (!data) {
//       return res.status(404).send({
//         message: `NewCarBookings not found with the provided criteria`,
//       });
//     }

//     // Send the data
//     res.send(data);
//   } catch (err) {
//     // Handle database errors
//     console.error("Error retrieving NewCarBookings", err);
//     res.status(500).send({
//       message: `Error retrieving NewCarBookings with the provided criteria`,
//     });
//   }
// };

exports.BookingSearch = async (req, res) => {
  const { EmpID, searchValue } = req.query;

  // Check if EMPID and searchValue are provided
  if (!EmpID || !searchValue) {
    return res
      .status(400)
      .send({ message: "EMPID and searchValue must be provided" });
  }

  try {
    // Fetch CustomerIDs associated with the EMPID
    const empData = await empolyeemapdata.findAll({ where: { EmpID } });

    if (!empData || empData.length === 0) {
      return res
        .status(404)
        .send({ message: "Employee Data Not Found for EMPID" });
    }

    // Extract CustomerIDs from empData
    const customerIDs = empData.map((item) => item.CustomerID);

    // Constructing the where clause based on the search value
    const whereClause = {
      [Op.or]: [
        { FirstName: { [Op.iLike]: `%${searchValue}%` } },
        { PhoneNo: { [Op.like]: `%${searchValue}%` } },
        { AadharNo: { [Op.like]: `%${searchValue}%` } },
        { PANNo: { [Op.like]: `%${searchValue}%` } },
      ],
      CustomerID: { [Op.in]: customerIDs }, // Include CustomerIDs from empData
    };

    // Perform database query to find entries with the given criteria
    const data = await customer.findAll({
      where: whereClause,
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
      ],
    });

    // Check if data is empty
    if (!data || data.length === 0) {
      return res.status(404).send({
        message: `No NewCarBookings found with the provided criteria`,
      });
    }

    const custIDs = data.map((mapData) => mapData.CustomerID);
    console.log("customers ids: ", custIDs);
    const bookingData = await NewCarBooking.findAll({
      where: { CustomerID: { [Op.in]: custIDs } },
      attributes: ["CustomerID", "BookingID"],
    });

    // console.log("booking Data: ", bookingData);
    const bookingMap = bookingData.reduce((acc, booking) => {
      acc[booking.CustomerID] = booking.BookingID;
      return acc;
    }, {});

    // Map fields to flatten the response with all attributes
    const flatData = data.map((item) => ({
      CustomerID: item.CustomerID,
      CustomerType: item.CustomerType,
      CustID: item.CustID,
      BookingID: bookingMap[item.CustomerID] || null, // Add BookingID or null
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
      DistrictID: item.DistrictID,
      DistrictName: item.CMRegionID ? item.CMRegionID.RegionName : null,
      StateID: item.StateID,
      StateName: item.CMStateID ? item.CMStateID.StateName : null,
      PINCode: item.PINCode,
      ModelName: item.ModelName,
      VariantName: item.VariantName,
      FuelType: item.FuelType,
      ColourName: item.ColourName,
      Transmission: item.Transmission,
      AadharNo: item.AadharNo,
      PANNo: item.PANNo,
      DrivingLicence: item.DrivingLicence,
      AccountHolderName: item.AccountHolderName,
      AccountNo: item.AccountNo,
      IFSCCode: item.IFSCCode,
      BankID: item.BankID,
      BranchDetails: item.BranchDetails,
      IsActive: item.IsActive,
      KycStatus: item.KycStatus,
      CustomerStatus: item.CustomerStatus,
      CreatedDate: item.CreatedDate,
      ModifiedDate: item.ModifiedDate,
      Gender: item.Gender,
      RelationType: item.RelationType,
      RelationName: item.RelationName,
      MSMEID: item.MSMEID,
    }));

    // Send the flattened data
    res.send(flatData);
  } catch (err) {
    // Handle database errors
    console.error("Error retrieving NewCarBookings:", err);
    res.status(500).send({
      message: `Error retrieving NewCarBookings with the provided criteria`,
    });
  }
};

exports.CustomerSearch = async (req, res) => {
  const { searchValue } = req.query;

  try {
    // Constructing the where clause based on the search value
    const whereClause = {
      [Op.or]: [
        { FirstName: { [Op.iLike]: `%${searchValue}%` } },
        { PhoneNo: { [Op.like]: `%${searchValue}%` } },
        { AadharNo: { [Op.like]: `%${searchValue}%` } },
        { PANNo: { [Op.like]: `%${searchValue}%` } },
        { DrivingLicence: { [Op.like]: `%${searchValue}%` } },
      ],
      // CustomerID: { [Op.in]: customerIDs }, // Include CustomerIDs from empData
    };

    // Perform database query to find entries with the given criteria
    const data = await customer.findAll({
      where: whereClause,
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
      ],
    });

    // Check if data is empty
    if (!data || data.length === 0) {
      return res.status(404).send({
        message: `No NewCarBookings found with the provided criteria`,
      });
    }

    // Map fields to flatten the response with all attributes
    const flatData = data.map((item) => ({
      CustomerID: item.CustomerID,
      CustomerType: item.CustomerType,
      CustID: item.CustID,
      //  BookingID: bookingMap[item.CustomerID] || null, // Add BookingID or null
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
      DistrictID: item.DistrictID,
      DistrictName: item.CMRegionID ? item.CMRegionID.RegionName : null,
      StateID: item.StateID,
      StateName: item.CMStateID ? item.CMStateID.StateName : null,
      PINCode: item.PINCode,
      ModelName: item.ModelName,
      VariantName: item.VariantName,
      FuelType: item.FuelType,
      ColourName: item.ColourName,
      Transmission: item.Transmission,
      AadharNo: item.AadharNo,
      PANNo: item.PANNo,
      DrivingLicence: item.DrivingLicence,
      AccountHolderName: item.AccountHolderName,
      AccountNo: item.AccountNo,
      IFSCCode: item.IFSCCode,
      BankID: item.BankID,
      BranchDetails: item.BranchDetails,
      IsActive: item.IsActive,
      KycStatus: item.KycStatus,
      CustomerStatus: item.CustomerStatus,
      CreatedDate: item.CreatedDate,
      ModifiedDate: item.ModifiedDate,
      Gender: item.Gender,
      RelationType: item.RelationType,
      RelationName: item.RelationName,
      MSMEID: item.MSMEID,
    }));

    // Send the flattened data
    res.send(flatData);
  } catch (err) {
    // Handle database errors
    console.error("Error retrieving NewCarBookings:", err);
    res.status(500).send({
      message: `Error retrieving NewCarBookings with the provided criteria`,
    });
  }
};

exports.BookingSearchForTransfer = async (req, res) => {
  const { searchValue } = req.query;

  try {
    // Constructing the where clause based on the search value
    const whereClause = {
      [Op.or]: [
        { FirstName: { [Op.iLike]: `%${searchValue}%` } },
        { PhoneNo: { [Op.like]: `%${searchValue}%` } },
        // { CustomerID: { [Op.like]: `%${searchValue}%` } },
        { BookingNo: { [Op.like]: `%${searchValue}%` } },
      ],
      // CustomerID: { [Op.in]: customerIDs }, // Include CustomerIDs from empData
    };

    // Perform database query to find entries with the given criteria
    const data = await NewCarBooking.findAll({
      where: whereClause,
      // include: [
      //   {
      //     model: RegionMaster,
      //     as: "CMRegionID",
      //     attributes: ["RegionID", "RegionName"],
      //   },
      //   {
      //     model: StateMaster,
      //     as: "CMStateID",
      //     attributes: ["StateID", "StateName"],
      //   },
      // ],
    });

    // Check if data is empty
    if (!data || data.length === 0) {
      return res.status(404).send({
        message: `No NewCarBookings found with the provided criteria`,
      });
    }

    // Map fields to flatten the response with all attributes
    const flatData = data.map((item) => ({
      CustomerID: item.CustomerID,
      CustomerType: item.CustomerType,
      CustID: item.CustID,
      //BookingID: bookingMap[item.CustomerID] || null, // Add BookingID or null
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
      DistrictID: item.DistrictID,
      DistrictName: item.CMRegionID ? item.CMRegionID.RegionName : null,
      StateID: item.StateID,
      StateName: item.CMStateID ? item.CMStateID.StateName : null,
      PINCode: item.PINCode,
      ModelName: item.ModelName,
      VariantName: item.VariantName,
      FuelType: item.FuelType,
      ColourName: item.ColourName,
      Transmission: item.Transmission,
      AadharNo: item.AadharNo,
      PANNo: item.PANNo,
      DrivingLicence: item.DrivingLicence,
      AccountHolderName: item.AccountHolderName,
      AccountNo: item.AccountNo,
      IFSCCode: item.IFSCCode,
      BankID: item.BankID,
      BranchDetails: item.BranchDetails,
      IsActive: item.IsActive,
      KycStatus: item.KycStatus,
      CustomerStatus: item.CustomerStatus,
      CreatedDate: item.CreatedDate,
      ModifiedDate: item.ModifiedDate,
      Gender: item.Gender,
      RelationType: item.RelationType,
      RelationName: item.RelationName,
      MSMEID: item.MSMEID,
    }));

    // Send the flattened data
    res.send(data);
  } catch (err) {
    // Handle database errors
    console.error("Error retrieving NewCarBookings:", err);
    res.status(500).send({
      message: `Error retrieving NewCarBookings with the provided criteria`,
    });
  }
};
// Save booking details in the database
exports.create = async (req, res) => {
  const branchid = req.body.BranchID;
  // Validate if BranchID is provided
  if (!branchid) {
    return res.status(400).send({
      message: "BranchID is required in the request body.",
    });
  }
  const Docstatus = await customer.findOne({
    where: { CustomerID: req.body.CustomerID },
  });
  console.log("??????", Docstatus.KycStatus);
  if (Docstatus.KycStatus == "Pending") {
    return res.status(404).send({
      message: "Customer KYC not approved",
    });
  }

  const branchCode = await BranchMaster.findOne({
    attributes: ["BranchCode", "BranchName"],
    where: { BranchID: branchid },
  });
  console.log("data from branch master: ", branchCode);
  console.log("Branch Code: ", branchCode.BranchCode);
  // Generate the indent number using the branch code
  const BookingNo = await generateBookingNo(branchCode.BranchCode);
  console.log("generated receipt number:", BookingNo);
  try {
    // Extract data from request body
    const newCarBookingData = {
      //BookingID: req.body.BookingID,
      BookingNo: BookingNo || null,
      CustomerID: req.body.CustomerID,
      Title: req.body.Title,
      FirstName: req.body.FirstName,
      LastName: req.body.LastName,
      Gender: req.body.Gender,
      PhoneNo: req.body.PhoneNo,
      Email: req.body.Email,
      OfficeNo: req.body.OfficeNo,
      DOB: req.body.DOB,
      DateOfAnniversary: req.body.DateOfAnniversary || null,
      Occupation: req.body.Occupation,
      Company: req.body.Company,
      Address: req.body.Address,
      PINCode: req.body.PINCode,
      District: req.body.District,
      State: req.body.State,
      ModelName: req.body.ModelName,
      ColourName: req.body.ColourName,
      VariantName: req.body.VariantName,
      Transmission: req.body.Transmission,
      Fuel: req.body.Fuel,
      BranchName: branchCode.BranchName,
      CorporateSchema: req.body.CorporateSchema,
      TrueValueExchange: req.body.TrueValueExchange,
      RegistrationType: req.body.RegistrationType,
      Finance: req.body.Finance,
      Insurance: req.body.Insurance,
      Exchange: req.body.Exchange || false,
      SalesPersonID: req.body.SalesPersonID,
      TeamLeadID: req.body.TeamLeadID,
      BookingTime: req.body.BookingTime || new Date(),
      BookingStatus: req.body.BookingStatus || "Pending",
    };

    // Create the new car booking
    const createdBooking = await NewCarBooking.create(newCarBookingData);

    // Send the response
    res.send(createdBooking);
  } catch (err) {
    // Handle errors
    console.error("Error creating NewCarBooking:", err);
    res.status(500).send({
      message:
        err.message || "Some error occurred while creating the NewCarBooking.",
    });
  }
};

// Update a new car booking by the id in the request
exports.UpdateBooking = async (req, res) => {
  const { EMPID, CustomerID } = req.body;

  try {
    // Check if EMPID and CustomerID are provided
    if (!EMPID) {
      return res.status(400).send({ message: "EMPID must be provided" });
    }

    // Fetch CustomerID associated with the EMPID
    const empdata = await empolyeemapdata.findAll({
      where: { EMPID, CustomerID },
    });

    // Check if employee data is found
    if (!empdata || empdata.length === 0) {
      return res.status(404).send({
        message:
          "Employee data not found for the provided EMPID and CustomerID",
      });
    }

    // Perform database query to find customer data based on CustomerID
    const customerdata = await customer.findAll({
      where: { CustomerID },
    });

    // Check if customer data is found
    if (!customerdata || customerdata.length === 0) {
      return res.status(404).send({
        message: "Customer data not found with the provided CustomerID",
      });
    }

    // Send the found customer data
    res.send(customerdata);
  } catch (err) {
    // Handle database errors
    console.error("Error retrieving customer data:", err);
    res.status(500).send({
      message: "Failed to retrieve customer data. Please try again later.",
    });
  }
};

// Delete a booking with the specified id in the request
exports.delete = async (req, res) => {
  const bookingID = req.params.id;

  try {
    // Perform deletion operation
    const numAffectedRows = await NewCarBooking.destroy({
      where: { BookingID: bookingID },
    });

    // Check if any rows were affected
    if (numAffectedRows === 1) {
      // If one row was affected, send success message
      res.send({ message: "NewCarBookings was deleted successfully!" });
    } else {
      // If no rows were affected, send 404 response with appropriate message
      res.status(404).send({
        message: `Cannot delete NewCarBookings with id=${bookingID}. NewCarBookings not found.`,
      });
    }
  } catch (err) {
    // Handle database errors
    console.error("Error deleting NewCarBookings:", err);
    res.status(500).send({
      message: `Could not delete NewCarBookings with id=${bookingID}. ${err.message}`,
    });
  }
};

exports.BookingsList = async (req, res) => {
  const BookingStatus = req.query.BookingStatus;
  const BranchName = req.query.BranchName;
  // Validate branchID input
  if (!BranchName) {
    return res.status(400).send({ message: "Branch Name is required" });
  }
  try {
    const bookingData = await NewCarBooking.findAll({
      where: [{ BranchName: BranchName }, { BookingStatus: BookingStatus }],
      include: [
        {
          model: userdata,
          as: "NCBSPUserID",
          attributes: ["UserName", "Branch"],
        },
      ],
      attributes: [
        "BookingID",
        "BookingNo", // Adding BookingNo field
        "CustomerID",
        "Title",
        "FirstName",
        "LastName", // Adding LastName field
        "PhoneNo",
        "Email",
        "Gender",
        "DOB",
        "DateOfAnniversary",
        "Occupation",
        "Company",
        "Address",
        "PINCode",
        "District",
        "State",
        "ModelName", // Adding ModelName field
        "ColourName", // Adding ColourName field
        "VariantName", // Adding VariantName field
        "Transmission", // Adding VariantName field
        "Fuel", // Adding VariantName field
        "BranchName",
        "CorporateSchema",
        "RegistrationType",
        "Finance",
        "SalesPersonID",
        "TeamLeadID",
        "BookingTime",
        "BookingStatus",
        "Insurance",
        "OfficeNo",
        "Exchange",
        "CreatedDate",
        "BookingStatus",
      ],
      order: [["CreatedDate", "DESC"]],
    });
    console.log("Booking Data:", bookingData);
    // Check if booking data with given BranchID exists
    if (!bookingData || bookingData.length === 0) {
      console.log("Booking data not found");
      return res.status(404).send({ message: "Booking data not found" });
    }
    // Transform booking data to flatten the NCBSPUserID fields
    const transformedData = bookingData.map((booking) => ({
      BookingID: booking.BookingID,
      BookingNo: booking.BookingNo,
      CustomerID: booking.CustomerID,
      Title: booking.Title,
      FirstName: booking.FirstName,
      LastName: booking.LastName,
      PhoneNo: booking.PhoneNo,
      Email: booking.Email,
      Gender: booking.Gender,
      DOB: booking.DOB,
      DateOfAnniversary: booking.DateOfAnniversary,
      Occupation: booking.Occupation,
      Company: booking.Company,
      Address: booking.Address,
      PINCode: booking.PINCode,
      District: booking.District,
      State: booking.State,
      ModelName: booking.ModelName,
      ColourName: booking.ColourName,
      VariantName: booking.VariantName,
      Transmission: booking.Transmission,
      Fuel: booking.Fuel,
      BranchName: booking.BranchName,
      CorporateSchema: booking.CorporateSchema,
      RegistrationType: booking.RegistrationType,
      Finance: booking.Finance,
      SalesPersonID: booking.SalesPersonID,
      TeamLeadID: booking.TeamLeadID,
      BookingTime: booking.BookingTime,
      Insurance: booking.Insurance,
      OfficeNo: booking.OfficeNo,
      Exchange: booking.Exchange,
      CreatedDate: booking.CreatedDate,
      UserName: booking.NCBSPUserID?.UserName,
      Branch: booking.NCBSPUserID?.Branch,
      BookingStatus: booking.BookingStatus,
    }));
    console.log("Transformed Booking Data:", transformedData);
    res.json(transformedData);
  } catch (err) {
    console.error("Error retrieving NewCarBookings:", err);
    // Centralized error handling
    if (err.name === "SequelizeDatabaseError") {
      res.status(500).send({
        message: "Database error occurred while retrieving data.",
        error: err.message,
      });
    } else {
      res.status(500).send({
        message: "Some error occurred while processing the request.",
        error: err.message,
      });
    }
  }
};

exports.findAllByBookings = async (req, res) => {
  const { UserID } = req.query;
  const { EmpID } = req.query;
  const BookingID = req.query.BookingID;

  // Validate input
  if (!UserID) {
    return res.status(400).send({
      message: "UserID is required in query parameters.",
    });
  }

  // Validate input
  if (!BookingID) {
    return res.status(400).send({
      message: "BookingID is required in query parameters.",
    });
  }

  try {
    // Find employee data
    const empData = await empolyeemapdata.findAll({ where: { EmpID } });

    if (!empData || empData.length === 0) {
      return res.status(404).send({
        message: `Employee data not found for EMPID ${EmpID}`,
      });
    }

    // Extract CustomerIDs from empData
    const customerIDs = empData.map((item) => item.CustomerID);

    // Find NewCarBookings for extracted CustomerIDs
    const bookings = await NewCarBooking.findAll({
      where: { CustomerID: customerIDs, BookingID: BookingID },
      include: [
        {
          model: UserMaster,
          as: "NCBSPUserID", // Alias for the association
          attributes: ["UserID", "UserName", "EmpID"], // Select relevant fields
          where: { UserID },
        },

        {
          model: UserMaster,
          as: "NCBTLUserID", // Alias for the association
          attributes: ["UserID", "UserName", "EmpID"], // Select relevant fields
        },
      ],
    });

    if (!bookings || bookings.length === 0) {
      return res.status(404).send({
        message: "No NewCarBookings data found.",
      });
    }

    // Send the data
    res.send(bookings);
  } catch (err) {
    console.error("Error retrieving NewCarBookings:", err);

    // Centralized error handling
    if (err.name === "SequelizeDatabaseError") {
      res.status(500).send({
        message: "Database error occurred while retrieving data.",
        error: err.message,
      });
    } else {
      res.status(500).send({
        message: "Some error occurred while processing the request.",
        error: err.message,
      });
    }
  }
};

// exports.updateBookings = async (req, res) => {
//   const { UserID } = req.query;
//   const { EmpID } = req.query;
//   const { BookingID } = req.query;
//   // const { CustID } = req.query;
//   console.log("UserID", UserID);
//   console.log("EmpID", EmpID);
//   console.log("BookingID", BookingID);
//   // console.log("CustID", CustID);
//   try {
//     // Validate input
//     if (!UserID) {
//       return res
//         .status(400)
//         .json({ message: "UserID is required in query parameters." });
//     }
//     if (!BookingID) {
//       return res
//         .status(400)
//         .json({ message: "BookingID is required in query parameters." });
//     }

//     // Find employee data
//     const empData = await empolyeemapdata.findOne({ where: { EmpID } });

//     if (!empData) {
//       return res
//         .status(404)
//         .json({ message: `Employee data not found for EmpID ${EmpID}` });
//     }
//     console.log("empData", empData);
//     // Extract the CustomerID from empData
//     const customerID = empData.CustomerID;

//     // Find and update the NewCarBooking for the extracted CustomerID and BookingID
//     // const [updatedCount] = await NewCarBooking.update(req.body, {
//     //   where: { CustomerID: customerID, BookingID: BookingID },
//     //   returning: true, // Ensures returning the updated rows
//     // });

//     // if (updatedCount === 0) {
//     //   return res
//     //     .status(404)
//     //     .json({ message: "No matching NewCarBooking found to update." });
//     // }

//     // Retrieve the updated data
//     const updatingBooking = await NewCarBooking.findOne({
//       where: {
//         // CustomerID: CustID,
//         CustomerID: customerID,
//         BookingID: BookingID,
//       },
//       include: [
//         {
//           model: UserMaster,
//           as: "NCBSPUserID", // Alias for the association
//           attributes: ["UserID", "UserName", "EmpID"], // Select relevant fields
//           where: { UserID },
//         },
//         {
//           model: UserMaster,
//           as: "NCBTLUserID", // Alias for the association
//           attributes: ["UserID", "UserName", "EmpID"], // Select relevant fields
//         },
//       ],
//     });

//     // Update fields in the retrieved booking
//     updatingBooking.CustomerID =
//       req.body.CustomerID || updatingBooking.CustomerID;
//     updatingBooking.Title = req.body.Title || updatingBooking.Title;
//     updatingBooking.FirstName = req.body.FirstName || updatingBooking.FirstName;
//     updatingBooking.LastName = req.body.LastName || updatingBooking.LastName;
//     updatingBooking.PhoneNo = req.body.PhoneNo || updatingBooking.PhoneNo;
//     updatingBooking.OfficeNo = req.body.OfficeNo || updatingBooking.OfficeNo;
//     updatingBooking.Email = req.body.Email || updatingBooking.Email;
//     updatingBooking.Gender = req.body.Gender || updatingBooking.Gender;
//     updatingBooking.DOB = req.body.DOB || updatingBooking.DOB;
//     updatingBooking.DateOfAnniversary =
//       req.body.DateOfAnniversary || updatingBooking.DateOfAnniversary;
//     updatingBooking.Occupation =
//       req.body.Occupation || updatingBooking.Occupation;
//     updatingBooking.Company = req.body.Company || updatingBooking.Company;
//     updatingBooking.Address = req.body.Address || updatingBooking.Address;
//     updatingBooking.PINCode = req.body.PINCode || updatingBooking.PINCode;
//     updatingBooking.District = req.body.District || updatingBooking.District;
//     updatingBooking.State = req.body.State || updatingBooking.State;
//     updatingBooking.ModelName = req.body.ModelName || updatingBooking.ModelName;
//     updatingBooking.ColourName =
//       req.body.ColourName || updatingBooking.ColourName;
//     updatingBooking.VariantName =
//       req.body.VariantName || updatingBooking.VariantName;
//     updatingBooking.Transmission =
//       req.body.Transmission || updatingBooking.Transmission;
//     updatingBooking.BranchName = req.body.Fuel || updatingBooking.Fuel;
//     updatingBooking.Fuel = req.body.BranchName || updatingBooking.BranchName;
//     updatingBooking.CorporateSchema =
//       req.body.CorporateSchema || updatingBooking.CorporateSchema;
//     updatingBooking.RegistrationType =
//       req.body.RegistrationType || updatingBooking.RegistrationType;
//     updatingBooking.Finance = req.body.Finance || updatingBooking.Finance;
//     updatingBooking.Insurance = req.body.Insurance || updatingBooking.Insurance;
//     updatingBooking.Exchange = req.body.Exchange || updatingBooking.Exchange;
//     updatingBooking.SalesPersonID =
//       req.body.SalesPersonID || updatingBooking.SalesPersonID;
//     updatingBooking.TeamLeadID =
//       req.body.TeamLeadID || updatingBooking.TeamLeadID;
//     updatingBooking.BookingStatus =
//       req.body.BookingStatus || updatingBooking.BookingStatus;

//     // Save the updated booking
//     await updatingBooking.save();
//     console.log("updatingBooking", updatingBooking);
//     // Send the updated booking data
//     return res.status(200).json(updatingBooking);
//   } catch (err) {
//     console.error("Error updating NewCarBooking:", err);

//     // Centralized error handling
//     if (err.name === "SequelizeValidationError") {
//       return res.status(400).json({
//         message: "Validation error",
//         details: err.errors.map((e) => e.message),
//       });
//     }

//     if (err.name === "SequelizeDatabaseError") {
//       return res.status(500).json({
//         message: "Database error occurred while updating NewCarBooking.",
//         details: err.message,
//       });
//     }

//     if (err.name === "SequelizeConnectionError") {
//       return res.status(503).json({
//         message: "Service unavailable. Unable to connect to the database.",
//         details: err.message,
//       });
//     }

//     return res.status(500).json({ message: "Internal server error" });
//   }
// };

exports.updateBookings = async (req, res) => {
  const { UserID, EmpID, BookingID, CustomerID } = req.query;

  console.log("Received Query Parameters:");
  console.log("UserID:", UserID);
  console.log("EmpID:", EmpID);
  console.log("BookingID:", BookingID);
  console.log("CustomerID:", CustomerID);

  try {
    // Validate input
    if (!UserID) {
      return res
        .status(400)
        .json({ message: "UserID is required in query parameters." });
    }
    if (!BookingID) {
      return res
        .status(400)
        .json({ message: "BookingID is required in query parameters." });
    }

    // Check if EmpID or CustomerID is missing in the request
    if (!EmpID) {
      return res.status(400).json({ message: "EmpID is required." });
    }
    if (!CustomerID) {
      return res.status(400).json({ message: "CustomerID is required." });
    }

    // Find employee data based on EmpID and CustomerID
    const empData = await empolyeemapdata.findOne({
      where: {
        EmpID,
        CustomerID,
      },
    });

    console.log("Retrieved empData:", empData);

    // Check if empData was found
    if (!empData) {
      return res.status(404).json({
        message: `Employee data not found for EmpID ${EmpID} and CustomerID ${CustomerID}`,
      });
    }

    // Extract the CustomerID from empData
    const customerID = empData.CustomerID;

    console.log("Extracted customerID from empData:", customerID);

    // Find the booking to update
    const updatingBooking = await NewCarBooking.findOne({
      where: {
        CustomerID: customerID, // Use the extracted customerID
        BookingID: BookingID,
      },
      include: [
        {
          model: UserMaster,
          as: "NCBSPUserID", // Alias for the association
          attributes: ["UserID", "UserName", "EmpID"],
          where: { UserID },
        },
        {
          model: UserMaster,
          as: "NCBTLUserID", // Alias for the association
          attributes: ["UserID", "UserName", "EmpID"],
        },
      ],
    });

    console.log("Retrieved updatingBooking:", updatingBooking);

    // Check if booking is found
    if (!updatingBooking) {
      return res
        .status(404)
        .json({ message: "No matching NewCarBooking found to update." });
    }

    // Update fields in the retrieved booking
    updatingBooking.CustomerID =
      req.body.CustomerID || updatingBooking.CustomerID;
    updatingBooking.Title = req.body.Title || updatingBooking.Title;
    updatingBooking.FirstName = req.body.FirstName || updatingBooking.FirstName;
    updatingBooking.LastName = req.body.LastName || updatingBooking.LastName;
    updatingBooking.PhoneNo = req.body.PhoneNo || updatingBooking.PhoneNo;
    updatingBooking.OfficeNo = req.body.OfficeNo || updatingBooking.OfficeNo;
    updatingBooking.Email = req.body.Email || updatingBooking.Email;
    updatingBooking.Gender = req.body.Gender || updatingBooking.Gender;
    updatingBooking.DOB = req.body.DOB || updatingBooking.DOB;
    updatingBooking.DateOfAnniversary =
      req.body.DateOfAnniversary || updatingBooking.DateOfAnniversary;
    updatingBooking.Occupation =
      req.body.Occupation || updatingBooking.Occupation;
    updatingBooking.Company = req.body.Company || updatingBooking.Company;
    updatingBooking.Address = req.body.Address || updatingBooking.Address;
    updatingBooking.PINCode = req.body.PINCode || updatingBooking.PINCode;
    updatingBooking.District = req.body.District || updatingBooking.District;
    updatingBooking.State = req.body.State || updatingBooking.State;
    updatingBooking.ModelName = req.body.ModelName || updatingBooking.ModelName;
    updatingBooking.ColourName =
      req.body.ColourName || updatingBooking.ColourName;
    updatingBooking.VariantName =
      req.body.VariantName || updatingBooking.VariantName;
    updatingBooking.Transmission =
      req.body.Transmission || updatingBooking.Transmission;
    updatingBooking.BranchName =
      req.body.BranchName || updatingBooking.BranchName;
    updatingBooking.Fuel = req.body.Fuel || updatingBooking.Fuel;
    updatingBooking.CorporateSchema =
      req.body.CorporateSchema || updatingBooking.CorporateSchema;
    updatingBooking.RegistrationType =
      req.body.RegistrationType || updatingBooking.RegistrationType;
    updatingBooking.Finance = req.body.Finance || updatingBooking.Finance;
    updatingBooking.Insurance = req.body.Insurance || updatingBooking.Insurance;
    updatingBooking.Exchange = req.body.Exchange || updatingBooking.Exchange;
    updatingBooking.SalesPersonID =
      req.body.SalesPersonID || updatingBooking.SalesPersonID;
    updatingBooking.TeamLeadID =
      req.body.TeamLeadID || updatingBooking.TeamLeadID;
    updatingBooking.BookingStatus =
      req.body.BookingStatus || updatingBooking.BookingStatus;
    updatingBooking.ModifiedDate = new Date();

    // Save the updated booking
    await updatingBooking.save();
    console.log("Updated booking data:", updatingBooking);

    // Send the updated booking data
    return res.status(200).json(updatingBooking);
  } catch (err) {
    console.error("Error updating NewCarBooking:", err);

    // Centralized error handling
    if (err.name === "SequelizeValidationError") {
      return res.status(400).json({
        message: "Validation error",
        details: err.errors.map((e) => e.message),
      });
    }

    if (err.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message: "Database error occurred while updating NewCarBooking.",
        details: err.message,
      });
    }

    if (err.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: err.message,
      });
    }

    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.BookingDataByID = async (req, res) => {
  const bookingID = req.query.BookingID;

  // Validate bookingID input
  if (!bookingID) {
    return res.status(400).send({ message: "Booking ID is required" });
  }

  try {
    const bookingData = await NewCarBooking.findOne({
      where: { BookingID: bookingID },
      include: [
        {
          model: userdata,
          as: "NCBSPUserID",
          attributes: [],
        },
        {
          model: userdata,
          as: "NCBTLUserID",
          attributes: [],
        },
      ],
      attributes: [
        "BookingID",
        "BookingNo",
        "CustomerID",
        "Title",
        "FirstName",
        "LastName",
        "PhoneNo",
        "OfficeNo",
        "Email",
        "Gender",
        "DOB",
        "DateOfAnniversary",
        "Occupation",
        "Address",
        "PINCode",
        "District",
        "State",
        "ModelName",
        "ColourName",
        "VariantName",
        "Transmission",
        "Fuel",
        "BranchName",
        "CorporateSchema",
        "RegistrationType",
        "Exchange",
        "Finance",
        "Insurance",
        "SalesPersonID",
        [sequelize.col("NCBSPUserID.UserName"), "SalesPerson_Name"],
        [sequelize.col("NCBSPUserID.Branch"), "SalesPerson_Branch"],
        "TeamLeadID",
        [sequelize.col("NCBTLUserID.UserName"), "TeamLead_Name"],
        [sequelize.col("NCBTLUserID.Branch"), "TeamLead_Branch"],
        "BookingTime",
        "BookingStatus",
        "CreatedDate",
      ],
    });

    // Check if booking data exists
    if (!bookingData) {
      console.log("Booking data not found");
      return res.status(404).send({ message: "Booking data not found" });
    }

    // Fetch customer documents
    const custDocs = await CustDocInfo.findAll({
      where: { CustomerID: bookingData.CustomerID },
      include: [
        {
          model: DocumentType,
          as: "CDIDocTypeID",
          attributes: [],
        },
      ],
      attributes: [
        "DocID",
        "CustomerRelation",
        [sequelize.col("CDIDocTypeID.Doctype"), "DocumentType"],
        "DocURL",
        "Status",
      ],
    });

    // Fetch document verification data
    const custDocVerification = await DocVerification.findAll({
      where: { DocID: custDocs.map((doc) => doc.DocID) },
      attributes: ["DocID", "Status"],
    });

    // Map verification status
    const verificationStatusMap = custDocVerification.reduce((acc, item) => {
      acc[item.DocID] = item.Status;
      return acc;
    }, {});

    // Add verification status to custDocs
    const updatedCustDocs = custDocs.map((doc) => ({
      ...doc.toJSON(), // Convert doc to JSON
      VerificationStatus: verificationStatusMap[doc.DocID] || null, // Add verification status
    }));

    // Fetch payment request data
    const reqData = await PaymentReq.findAll({
      where: { TransactionID: bookingData.BookingID },
      attributes: ["ID"],
    });

    const requestIDs = reqData.map((req) => req.ID);

    // Fetch customer receipts
    const paymentData = await CustomerReceipt.findAll({
      where: { RequestID: { [sequelize.Op.in]: requestIDs } },
      // attributes: ["PaymentMode", "Amount", "ReceiptNo", "ReceiptDate"],
      attributes: [
        "ReceiptID",
        "ReceiptNo",
        "ReceiptDate",
        "BranchID",
        "RequestID",
        "PaymentPurpose",
        "PaymentMode",
        "Amount",
        "InstrumentNo",
        "InstrumentDate",
        "BankID",
        "BankBranch",
        "BankCharges",
        "ImgURL",
        "OnlineTransID",
        "OnlineTransType",
        "OnlineTransPartner",
        "CustID",
        "AuthorisedBy",
        [sequelize.col("CRAuthByID.UserName"), "AuthorizedPerson_Name"],
        [sequelize.col("CRAuthByID.Mobile"), "AuthorizedPerson_Mobile"],
        [sequelize.col("CRAuthByID.EmpID"), "AuthorizedPerson_EmpID"],
        "ReceiptStatus",
        "CreatedDate",
        "ModifiedDate",
      ],
      include: [
        {
          model: UserMaster,
          as: "CRAuthByID",
          attributes: [],
        },
        // {
        //   model: UserMaster,
        //   as: "CRReqID",
        //   attributes: ["UserName", "EmpID", "UserID", "Mobile"],
        // },
      ],
    });

    // Construct response object
    const responseData = {
      booking: bookingData,
      documents: updatedCustDocs.length > 0 ? updatedCustDocs : null,
      payments: paymentData.length > 0 ? paymentData : null,
    };

    // Send the combined data as JSON response
    res.json(responseData);
  } catch (err) {
    console.error("Error retrieving NewCarBookings:", err);
    // Centralized error handling
    if (err.name === "SequelizeDatabaseError") {
      res.status(500).send({
        message: "Database error occurred while retrieving data.",
        error: err.message,
      });
    } else {
      res.status(500).send({
        message: "Some error occurred while processing the request.",
        error: err.message,
      });
    }
  }
};

// Configure Multer for file upload
const upload = configureMulter(
  // "C:/Users/varun/OneDrive/Desktop/uploads/", // Adjust upload path as needed
  "/home/administrator/VARUNGROUP/IMAGES_VMS_MARUTI",
  1000000, // File size limit (1MB)
  ["jpeg", "jpg", "png", "gif"], // Allowed file types
  "BookingDocURL" // Field name in your request
);

exports.BookingUploadImage = async (req, res) => {
  try {
    // Handle file upload first
    upload(req, res, async (err) => {
      if (err) {
        console.error("Error uploading file:", err.message);
        return res.status(400).json({ message: err.message });
      }

      // Check for validation errors (if applicable)
      // const errors = validationResult(req);
      // if (!errors.isEmpty()) {
      //   return res.status(400).json({ errors: errors.array() });
      // }

      console.log("Request Body:", req.body);
      console.log("Request File:", req.file);

      const localFilePath = req.file?.path;
      const filename = await genDocNameforBooking(
        req.file,
        req.body.BookingID,
        req.body.DocTypeID
      );
      const remoteFilePath = path.join(
        process.env.Customer_Documents_PATH,
        filename
      );

      const sshConfig = {
        host: process.env.SSH_HOST,
        port: process.env.SSH_PORT,
        username: process.env.SSH_USERNAME,
        privateKeyPath: process.env.SSH_PRIVATE_KEY_PATH,
      };

      // Check if a document with the same BookingID and DocTypeID already exists
      const existingDocument = await BookingsDocInfo.findOne({
        where: {
          BookingID: req.body.BookingID,
          DocTypeID: req.body.DocTypeID,
        },
      });

      if (existingDocument) {
        // Remove existing file from the server if a file path exists and is different
        const existingFilePath = existingDocument.BookingDocURL;
        if (existingFilePath && existingFilePath !== remoteFilePath) {
          try {
            await transferImageToServer(
              existingFilePath,
              existingFilePath,
              sshConfig,
              "remove"
            );
          } catch (removeError) {
            console.error("Error removing file:", removeError);
            return res.status(500).json({ message: "Error removing old file" });
          }
        }

        // Update existing document with fields from req.body
        existingDocument.BookingID =
          req.body.BookingID || existingDocument.BookingID;
        existingDocument.CustomerRelation =
          req.body.CustomerRelation || existingDocument.CustomerRelation;
        existingDocument.DocTypeID =
          req.body.DocTypeID || existingDocument.DocTypeID;
        existingDocument.CustomerID =
          req.body.CustomerID || existingDocument.CustomerID;
        existingDocument.UploadBy =
          req.body.UploadBy || existingDocument.UploadBy;
        existingDocument.BookingDocURL = remoteFilePath;
        existingDocument.DocStatus =
          req.body.DocStatus || existingDocument.DocStatus;
        existingDocument.ModifiedDate = new Date(); // Add a modified date if needed

        // Save updated document
        await existingDocument.save();

        // Upload new file to server if a new file is provided
        if (localFilePath) {
          try {
            await transferImageToServer(
              localFilePath,
              remoteFilePath,
              sshConfig,
              "upload"
            );
          } catch (uploadError) {
            console.error("Error uploading file:", uploadError);
            return res.status(500).json({ message: "Error uploading file" });
          }
        }

        return res.status(200).json({
          message: "Document updated successfully",
          updatedDocument: existingDocument,
        });
      } else {
        // Insert new document with fields from req.body
        const newDocument = await BookingsDocInfo.create({
          BookingID: req.body.BookingID,
          CustomerRelation: req.body.CustomerRelation,
          DocTypeID: req.body.DocTypeID,
          CustomerID: req.body.CustomerID,
          UploadBy: req.body.UploadBy,
          BookingDocURL: remoteFilePath,
          DocStatus: req.body.DocStatus || "Pending", // Default status if not provided
          CreatedDate: new Date(), // Add a created date if needed
        });

        // Upload new file to server if a new file is provided
        if (localFilePath) {
          try {
            await transferImageToServer(
              localFilePath,
              remoteFilePath,
              sshConfig,
              "upload"
            );
          } catch (uploadError) {
            console.error("Error uploading file:", uploadError);
            return res.status(500).json({ message: "Error uploading file" });
          }
        }

        return res.status(200).json({
          message: "Document created successfully",
          createdDocument: newDocument,
        });
      }
    });
  } catch (err) {
    console.error("Error in BookingUploadImage:", err.message);
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
  }
};

exports.FinCustSearch = async (req, res) => {
  const { EmpID, searchValue } = req.query;
  console.log("@@@@@@@@@@@@@@@@");

  // Check if EMPID and searchValue are provided
  if (!EmpID || !searchValue) {
    return res
      .status(400)
      .send({ message: "EMPID and searchValue must be provided" });
  }

  try {
    // Fetch CustomerIDs associated with the EMPID
    const empData = await empolyeemapdata.findAll({ where: { EmpID } });

    // console.log("??????????", empData);

    if (!empData || empData.length === 0) {
      return res
        .status(404)
        .send({ message: "Employee Data Not Found for EMPID" });
    }

    // Extract CustomerIDs from empData
    const customerIDs = empData.map((item) => item.CustomerID);
    console.log("////////////", customerIDs);

    // Constructing the where clause based on the search value
    const whereClause = {
      [Op.or]: [
        { FirstName: { [Op.iLike]: `%${searchValue}%` } },
        { PhoneNo: { [Op.like]: `%${searchValue}%` } },
        { AadharNo: { [Op.like]: `%${searchValue}%` } },
        { PANNo: { [Op.like]: `%${searchValue}%` } },
      ],
      CustomerID: { [Op.in]: customerIDs }, // Include CustomerIDs from empData
    };

    // Perform database query to find entries with the given criteria
    const data = await customer.findAll({
      where: whereClause,
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
      ],
    });
    console.log("??????????", data);

    // Check if data is empty
    if (!data || data.length === 0) {
      return res.status(404).send({
        message: `No NewCarBookings found with the provided criteria`,
      });
    }

    // Fetch Booking data for the found customers
    const custIDs = data.map((mapData) => mapData.CustomerID);
    const bookingData = await NewCarBooking.findAll({
      where: { CustomerID: { [Op.in]: custIDs } },
      attributes: [
        "BookingID",
        "BookingNo",
        "CustomerID",
        "Title",
        "FirstName",
        "LastName",
        "PhoneNo",
        "OfficeNo",
        "Email",
        "Gender",
        "DOB",
        "DateOfAnniversary",
        "Occupation",
        "Company",
        "Address",
        "PINCode",
        "District",
        "State",
        "ModelName",
        "ColourName",
        "VariantName",
        "Transmission",
        "Fuel",
        "BranchName",
        "CorporateSchema",
        "Exchange",
        "RegistrationType",
        "Finance",
        "Insurance",
        "SalesPersonID",
        "TeamLeadID",
        "BookingTime",
        "BookingStatus",
      ],
      include: [
        {
          model: UserMaster,
          as: "NCBSPUserID",
          attributes: ["UserID", "UserName", "EmpID", "Mobile"],
        },
        {
          model: UserMaster,
          as: "NCBTLUserID",
          attributes: ["UserID", "UserName", "EmpID", "Mobile"],
        },
      ],
    });

    const allotmentData = await VehicleAllotment.findAll({
      where: {
        BookingID: { [Op.in]: bookingData.map((booking) => booking.BookingID) },
      },
      attributes: ["BookingID", "AllotmentStatus"], // Only fetch BookingID and AllotmentStatus
    });

    // Step 3: Create a map of BookingID to AllotmentStatus
    const allotmentStatusMap = allotmentData.reduce((acc, item) => {
      acc[item.BookingID] = item.AllotmentStatus;
      return acc;
    }, {});

    // Create a map of CustomerID to array of Booking details
    const bookingMap = bookingData.reduce((acc, booking) => {
      if (!acc[booking.CustomerID]) {
        acc[booking.CustomerID] = [];
      }
      acc[booking.CustomerID].push({
        BookingID: booking.BookingID,
        CustomerID: booking.CustomerID,
        BookingNo: booking.BookingNo,
        Title: booking.Title,
        FirstName: booking.FirstName,
        LastName: booking.LastName,
        PhoneNo: booking.PhoneNo,
        OfficeNo: booking.OfficeNo,
        Email: booking.Email,
        Gender: booking.Gender,
        DOB: booking.DOB,
        DateOfAnniversary: booking.DateOfAnniversary,
        Occupation: booking.Occupation,
        Company: booking.Company,
        Address: booking.Address,
        PINCode: booking.PINCode,
        District: booking.District,
        State: booking.State,
        ModelName: booking.ModelName,
        ColourName: booking.ColourName,
        VariantName: booking.VariantName,
        Transmission: booking.Transmission,
        Fuel: booking.Fuel,
        BranchName: booking.BranchName,
        CorporateSchema: booking.CorporateSchema,
        Exchange: booking.Exchange,
        RegistrationType: booking.RegistrationType,
        Finance: booking.Finance,
        Insurance: booking.Insurance,
        SalesPersonID: booking.SalesPersonID,
        SalesPersonName: booking.NCBSPUserID
          ? booking.NCBSPUserID.UserName
          : null,
        SalesPersonEmpID: booking.NCBSPUserID
          ? booking.NCBSPUserID.EmpID
          : null,
        TeamLeadID: booking.TeamLeadID,
        TeamLeadName: booking.NCBTLUserID ? booking.NCBTLUserID.UserName : null,
        TeamLeadEmpID: booking.NCBTLUserID ? booking.NCBTLUserID.EmpID : null,
        BookingTime: booking.BookingTime,
        BookingStatus: booking.BookingStatus,
        // Add the AllotmentStatus from the map here
        AllotmentStatus: allotmentStatusMap[booking.BookingID] || null,
      }); // Add all fields from Booking table
      return acc;
    }, {});

    // Map fields to flatten the response with all attributes, including Bookings
    const flatData = data.map((item) => ({
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
      DistrictID: item.DistrictID,
      DistrictName: item.CMRegionID ? item.CMRegionID.RegionName : null,
      StateID: item.StateID,
      StateName: item.CMStateID ? item.CMStateID.StateName : null,
      PINCode: item.PINCode,
      ModelName: item.ModelName,
      VariantName: item.VariantName,
      FuelType: item.FuelType,
      ColourName: item.ColourName,
      Transmission: item.Transmission,
      AadharNo: item.AadharNo,
      PANNo: item.PANNo,
      DrivingLicence: item.DrivingLicence,
      AccountHolderName: item.AccountHolderName,
      AccountNo: item.AccountNo,
      IFSCCode: item.IFSCCode,
      BankID: item.BankID,
      BranchDetails: item.BranchDetails,
      IsActive: item.IsActive,
      KycStatus: item.KycStatus,
      CustomerStatus: item.CustomerStatus,
      CreatedDate: item.CreatedDate,
      ModifiedDate: item.ModifiedDate,
      Gender: item.Gender,
      RelationType: item.RelationType,
      RelationName: item.RelationName,
      MSMEID: item.MSMEID,
      Bookings: bookingMap[item.CustomerID] || [], // Include all booking details as an array
    }));

    // Send the flattened data
    res.send(flatData);
  } catch (err) {
    // Handle database errors
    console.error("Error retrieving NewCarBookings:", err);
    res.status(500).send({
      message: `Error retrieving NewCarBookings with the provided criteria`,
    });
  }
};

// exports.BookingSearch = async (req, res) => {
//   const { EmpID, searchValue } = req.query;

//   // Check if EMPID and searchValue are provided
//   if (!EmpID || !searchValue) {
//     return res
//       .status(400)
//       .send({ message: "EMPID and searchValue must be provided" });
//   }

//   try {
//     // Fetch CustomerIDs associated with the EMPID
//     const empData = await empolyeemapdata.findAll({ where: { EmpID } });

//     if (!empData || empData.length === 0) {
//       return res
//         .status(404)
//         .send({ message: "Employee Data Not Found for EMPID" });
//     }

//     // Extract CustomerIDs from empData
//     const customerIDs = empData.map((item) => item.CustomerID);

//     // Constructing the where clause based on the search value
//     const whereClause = {
//       [Op.or]: [
//         { FirstName: { [Op.like]: `%${searchValue}%` } },
//         { PhoneNo: { [Op.like]: `%${searchValue}%` } },
//         { AadharNo: { [Op.like]: `%${searchValue}%` } },
//         { PANNo: { [Op.like]: `%${searchValue}%` } },
//       ],
//       CustomerID: { [Op.in]: customerIDs }, // Include CustomerIDs from empData
//     };

//     // Perform database query to find entries with the given criteria
//     const data = await customer.findAll({
//       where: whereClause,
//       include: [
//         {
//           model: RegionMaster,
//           as: "CMRegionID",
//           attributes: ["RegionID", "RegionName"],
//         },
//         {
//           model: StateMaster,
//           as: "CMStateID",
//           attributes: ["StateID", "StateName"],
//         },
//       ],
//     });

//     // Check if data is empty
//     if (!data || data.length === 0) {
//       return res.status(404).send({
//         message: `No NewCarBookings found with the provided criteria`,
//       });
//     }

//     // Fetch Booking data for the found customers
//     const custIDs = data.map((mapData) => mapData.CustomerID);
//     const bookingData = await NewCarBooking.findAll({
//       where: { CustomerID: { [Op.in]: custIDs } },
//       attributes: ["CustomerID", "BookingID"],
//     });

//     // Create a map of CustomerID to array of BookingIDs
//     const bookingMap = bookingData.reduce((acc, booking) => {
//       if (!acc[booking.CustomerID]) {
//         acc[booking.CustomerID] = []; // Initialize as an array if it doesn't exist
//       }
//       acc[booking.CustomerID].push(booking.BookingID); // Add BookingID to the array
//       return acc;
//     }, {});
//     console.log("!!!!!!!!!!!!!!!", bookingMap);
//     // Map fields to flatten the response with all attributes
//     const flatData = data.map((item) => ({
//       CustomerID: item.CustomerID,
//       CustomerType: item.CustomerType,
//       CustID: item.CustID,
//       BookingIDs: bookingMap[item.CustomerID] || [], // Include all BookingIDs as an array
//       Title: item.Title,
//       FirstName: item.FirstName,
//       LastName: item.LastName,
//       PhoneNo: item.PhoneNo,
//       OfficeNo: item.OfficeNo,
//       Email: item.Email,
//       Occupation: item.Occupation,
//       Company: item.Company,
//       DateOfBirth: item.DateOfBirth,
//       DateOfAnniversary: item.DateOfAnniversary,
//       Address: item.Address,
//       DistrictID: item.DistrictID,
//       DistrictName: item.CMRegionID ? item.CMRegionID.RegionName : null,
//       StateID: item.StateID,
//       StateName: item.CMStateID ? item.CMStateID.StateName : null,
//       PINCode: item.PINCode,
//       ModelName: item.ModelName,
//       VariantName: item.VariantName,
//       FuelType: item.FuelType,
//       ColourName: item.ColourName,
//       Transmission: item.Transmission,
//       AadharNo: item.AadharNo,
//       PANNo: item.PANNo,
//       DrivingLicence: item.DrivingLicence,
//       AccountHolderName: item.AccountHolderName,
//       AccountNo: item.AccountNo,
//       IFSCCode: item.IFSCCode,
//       BankID: item.BankID,
//       BranchDetails: item.BranchDetails,
//       IsActive: item.IsActive,
//       KycStatus: item.KycStatus,
//       CustomerStatus: item.CustomerStatus,
//       CreatedDate: item.CreatedDate,
//       ModifiedDate: item.ModifiedDate,
//       Gender: item.Gender,
//       RelationType: item.RelationType,
//       RelationName: item.RelationName,
//       MSMEID: item.MSMEID,
//     }));

//     // Send the flattened data
//     res.send(flatData);
//   } catch (err) {
//     // Handle database errors
//     console.error("Error retrieving NewCarBookings:", err);
//     res.status(500).send({
//       message: `Error retrieving NewCarBookings with the provided criteria`,
//     });
//   }
// };

// Sending List of all documents weather they are added or not
exports.GetAllDocsByCustID = async (req, res) => {
  const customerID = req.params.id;

  // Check if customerID is provided
  if (!customerID) {
    return res.status(400).send({ message: "customerID must be provided" });
  }

  try {
    // Fetch customer data
    const custData = await customer.findOne({
      where: { CustomerID: customerID },
    });

    if (!custData) {
      return res.status(404).send({
        message: `Customer Data Not Found with customer ID ${customerID}`,
      });
    }

    // Fetch Cust Doc Info data
    const custDocInfoData = await CustDocInfo.findAll({
      where: { CustomerID: customerID },
    });

    // Fetch Cust GST Doc Info data
    const custGSTDocData = await CustGSTInfo.findAll({
      where: { CustomerID: customerID },
    });

    // Fetch Doc Verification data
    const DocVerifyData = await DocVerification.findAll({
      where: { CustomerID: customerID },
    });

    // Fetch MSME data
    const msmeData = await MSMEInfo.findOne({
      where: { CustomerID: customerID },
    });

    if (!msmeData) {
      return res.status(404).send({
        message: `MSME Data Not Found with customer ID ${customerID}`,
      });
    }

    // Fetch Bookings Docs data
    const bookingsDocs = await BookingsDocInfo.findAll({
      where: { CustomerID: customerID },
      include: [
        {
          model: DocumentType,
          as: "BDIDocTypeID",
          attributes: ["DocumentAs", "Doctype"],
        },
      ],
    });

    if (!bookingsDocs) {
      return res.status(404).send({
        message: `Bookings Doc Data Not Found with customer ID ${customerID}`,
      });
    }

    // Fetch Finance App with existing Cust Docs data
    const finApp = await FinanceApplication.findAll({
      where: { CustomerID: customerID },
    });
    // console.log("Finance Application data: ", finApp);
    if (!finApp) {
      return res.status(404).send({
        message: `Finance App Data Not Found with customer ID ${customerID}`,
      });
    }

    const finCustIds = finApp.map((custID) => custID.LoanAppCustID);
    // console.log(
    //   "extracted Finance Application customer Id's data: ",
    //   finCustIds
    // );

    if (!finCustIds) {
      return res.status(404).send({
        message: `Finance App customers not found for give customerID`,
      });
    }

    // Fetch Finance Docs data
    const finDocs = await FinanceDocs.findAll({
      where: { CustomerID: finCustIds },
      include: [
        {
          model: DocumentType,
          as: "DocumentType",
          attributes: ["DocumentAs", "Doctype"],
        },
      ],
    });

    // console.log("Finance document data: ", FinDocs);

    if (!finDocs) {
      return res.status(404).send({
        message: `Finance Docs Data Not Found with customer ID ${customerID}`,
      });
    }

    // Document types from the source
    // const defaultDocTypes = [
    //   { DocTypeID: 1, DocumentAs: "Address Proof", Doctype: "Aadhar Front" },
    //   { DocTypeID: 2, DocumentAs: "ID Proof", Doctype: "PAN Card" },
    //   { DocTypeID: 3, DocumentAs: "GST", Doctype: "GST Document" },
    //   { DocTypeID: 4, DocumentAs: "ID Proof", Doctype: "Bank Passbook/Cheque" },
    //   { DocTypeID: 5, DocumentAs: "Address Proof", Doctype: "Driving License" },
    //   { DocTypeID: 6, DocumentAs: "Income Proof", Doctype: "Form-16" },
    //   { DocTypeID: 7, DocumentAs: "Address Proof", Doctype: "Ration Card" },
    //   { DocTypeID: 8, DocumentAs: "Address Proof", Doctype: "Aadhar Back" },
    //   { DocTypeID: 9, DocumentAs: "MSME", Doctype: "MSME Document" },
    //   { DocTypeID: 10, DocumentAs: "Sanction Letter", Doctype: "Do-Release" },
    //   {
    //     DocTypeID: 11,
    //     DocumentAs: "Finance Payment Mode",
    //     Doctype: "Online/Cheque",
    //   },
    // ];
    // Fetch Document Types from the database
    const defaultDocTypes = await DocumentType.findAll({
      attributes: ["DocTypeID", "DocumentAs", "Doctype"],
    });

    // Map default documents with possible values
    const docInfoMapped = defaultDocTypes.map((docType) => {
      // Find corresponding document in custDocInfoData
      const custDoc = custDocInfoData.find(
        (doc) => doc.DocTypeID === docType.DocTypeID
      );

      // Find corresponding GST document in custGSTDocData if needed
      const gstDoc = custGSTDocData.find(
        (doc) => custDoc && doc.GSTID === custDoc.GSTID
      );

      // Initialize default values
      let documentNumber = null;
      let docURL = null;
      let verificationStatus = null;
      let remarks = null;
      const customerRelation = custDoc ? custDoc.CustomerRelation : null;

      // Determine the document number based on DocTypeID
      switch (docType.DocTypeID) {
        case 1:
        case 8:
          documentNumber = custData.AadharNo || null;
          break;
        case 2:
          documentNumber = custData.PANNo || null;
          break;
        case 5:
          documentNumber = custData.DrivingLicence || null;
          break;
        case 9:
          documentNumber = msmeData.RegistrationNo || null;
          break;
        case 3:
          documentNumber = gstDoc ? gstDoc.GSTIN : null;
          break;
        default:
          // Handle default document number assignment
          break;
      }

      // Check if there's a corresponding document in custDocInfoData
      if (custDoc) {
        docURL = custDoc.DocURL || "";
        // Check for verification status from DocVerifyData
        const matchedVerification = DocVerifyData.find(
          (d) => d.DocID === custDoc.DocID
        );
        verificationStatus = matchedVerification
          ? matchedVerification.Status
          : null;
        remarks = matchedVerification ? matchedVerification.Remarks : null;
      } else if (gstDoc) {
        // Find related CustDocInfo for GST
        const relatedCustDoc = custDocInfoData.find(
          (doc) => doc.DocID === gstDoc.DocID
        );
        docURL = relatedCustDoc ? relatedCustDoc.DocURL || "" : "";
        // Check for verification status from DocVerifyData
        const matchedVerification = DocVerifyData.find(
          (d) => d.GSTID === gstDoc.GSTID
        );
        verificationStatus = matchedVerification
          ? matchedVerification.Status
          : null;
        remarks = matchedVerification ? matchedVerification.Remarks : null;
      }

      return {
        DocTypeID: docType.DocTypeID,
        DocumentAs: docType.DocumentAs,
        Doctype: docType.Doctype,
        DocID: custDoc ? custDoc.DocID : gstDoc ? gstDoc.DocID : null,
        DocURL: docURL,
        VerificationStatus: verificationStatus,
        Remarks: remarks,
        DocumentNumber: documentNumber,
        CustomerRelation: customerRelation, // New field
      };
    });

    // Add GST documents even if not present in custDocInfoData
    const gstDocsOnly = custGSTDocData.map((gstDoc) => {
      // Find related CustDocInfo for GST
      const relatedCustDoc = custDocInfoData.find(
        (doc) => doc.DocID === gstDoc.DocID
      );
      return {
        DocTypeID: 3,
        DocumentAs: "GST",
        Doctype: "GST Document",
        DocID: gstDoc.DocID,
        DocURL: relatedCustDoc ? relatedCustDoc.DocURL || null : null,
        VerificationStatus:
          DocVerifyData.find((d) => d.GSTID === gstDoc.GSTID)?.Status || null,
        Remarks:
          DocVerifyData.find((d) => d.GSTID === gstDoc.GSTID)?.Remarks || null,
        DocumentNumber: gstDoc.GSTIN,
        CustomerRelation: relatedCustDoc
          ? relatedCustDoc.CustomerRelation
          : null, // New field
      };
    });

    // Map retrieved booking documents
    const BookingDocuments = bookingsDocs.map((item) => ({
      DocTypeID: item.DocTypeID || null,
      DocumentAs: item.BDIDocTypeID ? item.BDIDocTypeID.DocumentAs : null,
      Doctype: item.BDIDocTypeID ? item.BDIDocTypeID.Doctype : null,
      DocID: item.BDocID || null,
      DocURL: item.BookingDocURL || null,
      VerificationStatus: item.verificationStatus || null,
      Remarks: item.remarks || null,
      DocumentNumber: item.documentNumber || null,
      CustomerRelation: item.CustomerRelation || null, // New field
    }));

    // Map retrieved booking documents
    const FinanceDocuments = finDocs.map((item) => ({
      DocTypeID: item.DocTypeID || null,
      DocumentAs: item.DocumentType ? item.DocumentType.DocumentAs : null,
      Doctype: item.DocumentType ? item.DocumentType.Doctype : null,
      DocID: item.FinDocID || null,
      DocURL: item.DocURL || null,
      VerificationStatus: item.DocStatus || null,
      Remarks: item.Remarks || null,
      DocumentNumber: item.documentNumber || null,
      CustomerRelation: item.CustomerType || null, // New field
    }));

    // Send the flattened data
    res.status(200).send({
      docInfoMapped,
      gstDocsOnly,
      BookingDocuments,
      FinanceDocuments,
    });
  } catch (err) {
    // Handle unexpected errors
    console.error("Error retrieving documents:", err);
    res.status(500).send({
      message: "Error retrieving documents with the provided criteria",
    });
  }
};

/*
// Getting list of only uploaded documents
exports.GetAllDocsByCustID = async (req, res) => {
  const customerID = req.params.id;

  // Check if EMPID and searchValue are provided
  if (!customerID) {
    return res.status(400).send({ message: "customerID must be provided" });
  }

  try {
    // Fetch Cust Docs in cust doc info table for provided customer id
    const custData = await customer.findOne({
      where: { CustomerID: customerID },
    });

    // console.log("??????????", empData);

    if (!custData || custData.length === 0) {
      return res.status(404).send({
        message: `customer Data Not Found with customer ID ${customerID}`,
      });
    }

    // Fetch Cust Docs in cust doc info table for provided customer id
    const custDocInfoData = await CustDocInfo.findAll({
      where: { CustomerID: customerID },
    });

    // console.log("??????????", empData);

    if (!custDocInfoData || custDocInfoData.length === 0) {
      return res.status(404).send({
        message: `custDocInfo Data Not Found with customer ID ${customerID}`,
      });
    }

    // Extract data where DocTypeID is 3
    const filteredData = custDocInfoData.filter((doc) => doc.DocTypeID === 3);

    // if (filteredData.length === 0) {
    //   return res.status(404).send({
    //     message: `No documents found with DocTypeID 3 for customer ID ${customerID}`,
    //   });
    // }

    // Fetch Cust Docs in cust doc info table for provided customer id
    const custGSTDocData = await CustGSTInfo.findAll({
      where: { CustomerID: customerID },
    });

    // console.log("??????????", empData);

    if (!custGSTDocData || custGSTDocData.length === 0) {
      return res.status(404).send({
        message: `custGSTDoc Data Not Found with customer ID ${customerID}`,
      });
    }

    // Fetch Cust Docs in cust doc info table for provided customer id
    const DocVerifyData = await DocVerification.findAll({
      where: { CustomerID: customerID },
    });

    // console.log("??????????", empData);

    if (!DocVerifyData || DocVerifyData.length === 0) {
      return res.status(404).send({
        message: `DocVerify Data Not Found with customer ID ${customerID}`,
      });
    }

    // Fetch Cust Docs in cust doc info table for provided customer id
    const msmeData = await MSMEInfo.findOne({
      where: { CustomerID: customerID },
    });

    // console.log("??????????", empData);

    if (!msmeData || msmeData.length === 0) {
      return res.status(404).send({
        message: `msme Data Not Found with customer ID ${customerID}`,
      });
    }

    // const msmeDataIDs = msmeData.map((doc) => doc.DocTypeID);
    const docTypeIds = custDocInfoData.map((doc) => doc.DocTypeID);

    const doctypeData = await doctype.findAll({
      where: { DocTypeID: { [Op.in]: docTypeIds } },
    });

    const docInfoMapped = custDocInfoData.map((doc) => {
      const matchedVerification = DocVerifyData.find(
        (d) => d.DocID === doc.DocID
      );
      // Determine the document number to include based on DocTypeID
      let documentNumber = null;
      switch (doc.DocTypeID) {
        case 1:
        case 8:
          documentNumber = custData.AadharNo;
          break;
        case 2:
          documentNumber = custData.PANNo;
          break;
        case 5:
          documentNumber = custData.DrivingLicence;
          break;
        case 9:
          documentNumber = msmeData.RegistrationNo;
          break;
        case 3:
          if (matchedVerification && matchedVerification.GSTID) {
            const gstDoc = custGSTDocData.find(
              (doc) => doc.GSTID === matchedVerification.GSTID
            );
            documentNumber = gstDoc ? gstDoc.GSTIN : null;
          }
          break;
        default:
          documentNumber = null;
      }

      return {
        DocTypeID: doc.DocTypeID,
        DocID: doc.DocID,
        DocURL: doc.DocURL,
        DocumentAs: doctypeData.find((d) => d.DocTypeID === doc.DocTypeID)
          .DocumentAs,
        Doctype: doctypeData.find((d) => d.DocTypeID === doc.DocTypeID).Doctype,
        VerificationStatus: matchedVerification
          ? matchedVerification.Status
          : null, // Check if matchedVerification is not undefined
        Remarks: matchedVerification ? matchedVerification.Remarks : null, // Check if matchedVerification is not undefined
        DocumentNumber: documentNumber, // Add the document number based on DocTypeID
      };
    });

    // Split docInfoMapped based on CustomerRelation
    const selfDocs = docInfoMapped.filter(
      (doc) =>
        custDocInfoData.find((d) => d.DocID === doc.DocID).CustomerRelation ===
        "Self"
    );
    const coApplicantDocs = docInfoMapped.filter(
      (doc) =>
        custDocInfoData.find((d) => d.DocID === doc.DocID).CustomerRelation ===
        "Co-Applicant"
    );

    // Send the flattened data
    res.status(200).send({ selfDocs, coApplicantDocs });
  } catch (err) {
    // Handle database errors
    console.error("Error retrieving NewCarBookings:", err);
    res.status(500).send({
      message: `Error retrieving NewCarBookings with the provided criteria`,
    });
  }
};
*/
exports.UniversalBookingSearch = async (req, res) => {
  const { searchValue } = req.query;

  if (!searchValue) {
    return res
      .status(400)
      .send({ message: "EMPID and searchValue must be provided" });
  }

  try {
    const whereClause = {
      [Op.or]: [
        { FirstName: { [Op.iLike]: `%${searchValue}%` } },
        { PhoneNo: { [Op.like]: `%${searchValue}%` } },
        { BookingNo: { [Op.like]: `%${searchValue}%` } },
      ],
    };

    const bookingData = await NewCarBooking.findAll({
      where: whereClause,
      attributes: [
        "BookingID",
        "BookingNo",
        "CustomerID",
        "Title",
        "FirstName",
        "LastName",
        "PhoneNo",
        "OfficeNo",
        "Email",
        "Gender",
        "DOB",
        "DateOfAnniversary",
        "Occupation",
        "Company",
        "Address",
        "PINCode",
        "District",
        "State",
        "ModelName",
        "ColourName",
        "VariantName",
        "Transmission",
        "Fuel",
        "BranchName",
        "CorporateSchema",
        "Exchange",
        "RegistrationType",
        "Finance",
        "Insurance",
        "SalesPersonID",
        "TeamLeadID",
        "BookingTime",
        "BookingStatus",
      ],
    });

    if (!bookingData || bookingData.length === 0) {
      return res.status(404).send({ message: "No data found" });
    }

    // Transform the data into the desired structure
    const customerDetails = {
      CustomerID: bookingData[0].CustomerID,
      Title: bookingData[0].Title,
      FirstName: bookingData[0].FirstName,
      LastName: bookingData[0].LastName,
      PhoneNo: bookingData[0].PhoneNo,
      OfficeNo: bookingData[0].OfficeNo,
      Email: bookingData[0].Email,
      Gender: bookingData[0].Gender,
      DOB: bookingData[0].DOB,
      DateOfAnniversary: bookingData[0].DateOfAnniversary,
      Occupation: bookingData[0].Occupation,
      Company: bookingData[0].Company,
      Address: bookingData[0].Address,
      PINCode: bookingData[0].PINCode,
      District: bookingData[0].District,
      State: bookingData[0].State,
      BranchName: bookingData[0].BranchName,
      CorporateSchema: bookingData[0].CorporateSchema,
      Exchange: bookingData[0].Exchange,
      RegistrationType: bookingData[0].RegistrationType,
      Finance: bookingData[0].Finance,
      Insurance: bookingData[0].Insurance,
      SalesPersonID: bookingData[0].SalesPersonID,
      TeamLeadID: bookingData[0].TeamLeadID,
    };

    const bookingDetails = bookingData.map((booking) => ({
      BookingID: booking.BookingID,
      BookingNo: booking.BookingNo,
      BookingTime: booking.BookingTime,
      BookingStatus: booking.BookingStatus,
      ModelName: booking.ModelName,
      ColourName: booking.ColourName,
      VariantName: booking.VariantName,
      Transmission: booking.Transmission,
      Fuel: booking.Fuel,
    }));

    const response = {
      customerDetails: {
        ...customerDetails,
        BookingDetails: bookingDetails,
      },
    };

    res.send(response);
  } catch (err) {
    console.error("Error retrieving NewCarBookings:", err);
    res.status(500).send({
      message: `Error retrieving NewCarBookings with the provided criteria`,
    });
  }
};
