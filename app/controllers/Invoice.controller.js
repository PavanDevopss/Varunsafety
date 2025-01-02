/* eslint-disable no-unused-vars */
const db = require("../models");
const { genInvoiceNo } = require("../Utils/generateService");
const { generateIRN, GSTVerificationFunc } = require("./GST.controller");
const Invoice = db.invoice;
const UserMaster = db.usermaster;
const VehicleAllotment = db.vehicleallotment;
const VehicleStock = db.vehiclestock;
const CustomerMaster = db.customermaster;
const BranchMaster = db.branchmaster;
const PaymentReference = db.paymentRef;
const NewCarBookings = db.NewCarBookings;
const InvoiceAddress = db.invoiceaddress;
const InvoiceProductInfo = db.invoiceprodinfo;
const FinanceLoanApplication = db.financeloanapplication;
const MasterProducts = db.masterproducts;
const SKUMaster = db.skumaster;
const CustomerGSTInfo = db.customergstinfo;
const StatePOS = db.statepos;
const FinanceMaster = db.financemaster;
const OffersApprovals = db.offersapprovals;
const ApprovalRefferal = db.approvalrefferal;
const CompanyGSTMaster = db.companygstmaster;
const CompanyMaster = db.companymaster;
const ProductMaster = db.masterproducts;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;

// Basic CRUD API

// Create and Save a new Invoice
exports.create = async (req, res) => {
  const transaction = await Seq.transaction(); // Start the transaction

  try {
    // Check if an invoice already exists with the same InvoiceID or other relevant unique constraints
    const existingInvoice = await Invoice.findOne({
      where: {
        TransactionID: req.body.TransactionID, // or any unique identifier to prevent duplication
        TransactionType: req.body.TransactionType, // or any unique identifier to prevent duplication
      },
      transaction, // Pass the transaction to the query
    });

    if (existingInvoice) {
      // If the existing invoice has IsActive = true, return an error
      if (existingInvoice.IsActive === true) {
        return res
          .status(400)
          .json({ message: "Invoice already exists and is active." });
      }
    }

    const existingBranch = await BranchMaster.findOne({
      where: {
        BranchID: req.body.SaleBranchID, // or any unique identifier to prevent duplication
      },
      transaction, // Pass the transaction to the query
    });

    if (!existingBranch) {
      return res.status(400).json({
        message: "Branch doesn't exist for the provided SaleBranchID",
      });
    }

    const currentInvoiceNo = await genInvoiceNo(
      existingBranch.BranchCode,
      req.body.SaleType
    );

    // Map fields from req.body to Invoice object
    const invoiceData = {
      InvoiceNo: currentInvoiceNo || req.body.InvoiceNo,
      InvoiceDate: req.body.InvoiceDate || new Date(),
      TransactionID: req.body.TransactionID,
      TransactionType: req.body.TransactionType,
      AllotmentID: req.body.AllotmentID,
      CustomerID: req.body.CustomerID,
      CustomerName: req.body.CustomerName,
      SaleBranchID: req.body.SaleBranchID,
      SalesPersonID: req.body.SalesPersonID,
      SalesPersonName: req.body.SalesPersonName,
      TeamLeadID: req.body.TeamLeadID,
      TeamLeadName: req.body.TeamLeadName,
      AadharNo: req.body.AadharNo,
      ChassisNo: req.body.ChassisNo,
      EngineNo: req.body.EngineNo,
      FinanceID: req.body.FinanceID,
      FinancierName: req.body.FinancierName,
      FinancierAmt: req.body.FinancierAmt,
      FinAddress: req.body.FinAddress,
      FinStatus: req.body.FinStatus,
      InvoiceType: req.body.InvoiceType,
      CustomerType: req.body.CustomerType,
      BillType: req.body.BillType,
      RCM: req.body.RCM,
      DiscountValue: req.body.DiscountValue,
      TotalAmt: req.body.TotalAmt,
      TCSRate: req.body.TCSRate,
      TCSValue: req.body.TCSValue,
      InvoiceAmt: req.body.InvoiceAmt,
      IsActive: req.body.IsActive !== undefined ? req.body.IsActive : true,
      Status: req.body.Status || "Active",
      CreatedDate: new Date(), // Current timestamp when creating
    };

    // Save the new invoice in the database
    const newInvoice = await Invoice.create(invoiceData, { transaction });

    // Create a base invoice address object
    const invoiceAddress = {
      InvoiceID: newInvoice.InvoiceID,
      GSTStatus: req.body.GSTStatus,
      GSTNo: req.body.GSTNo,
      GSTName: req.body.GSTName,
      GSTType: req.body.GSTType,
      PANNo: req.body.PANNo,
      IsSameAddress: req.body.IsSameAddress,
      Address1: req.body.Address1,
      Address2: req.body.Address2,
      City: req.body.City,
      State: req.body.State,
      PINCode: req.body.PINCode,
      PlaceOfSupply: req.body.PlaceOfSupply,
    };

    // Create Billing address with AddressType = 'Billing'
    const billingAddress = { ...invoiceAddress, AddressType: "Billing" };
    await InvoiceAddress.create(billingAddress, { transaction });

    // If IsSameAddress is true, create Shipping address with the same details
    if (req.body.IsSameAddress) {
      const shippingAddress = { ...invoiceAddress, AddressType: "Shipping" };
      await InvoiceAddress.create(shippingAddress, { transaction });
    } else {
      // If IsSameAddress is false, create Shipping address with different address fields (SAddress1, SAddress2, etc.)
      const shippingAddress = {
        InvoiceID: newInvoice.InvoiceID,
        GSTStatus: req.body.GSTStatus,
        GSTNo: req.body.GSTNo,
        GSTName: req.body.GSTName,
        GSTType: req.body.GSTType,
        PANNo: req.body.PANNo,
        AddressType: "Shipping",
        IsSameAddress: req.body.IsSameAddress,
        Address1: req.body.SAddress1, // Shipping address details
        Address2: req.body.SAddress2,
        City: req.body.SCity,
        State: req.body.SState,
        PINCode: req.body.SPINCode,
        PlaceOfSupply: req.body.SPlaceOfSupply,
      };
      await InvoiceAddress.create(shippingAddress, { transaction });
    }

    const invoiceProductInfo = {
      InvoiceID: newInvoice.InvoiceID,
      ProductID: req.body.ProductID,
      ProductName: req.body.ProductName,
      ProductCost: req.body.ProductCost,
      DiscountPercentage: req.body.DiscountPercentage,
      DiscountValue: req.body.DiscountValue,
      TaxableValue: req.body.TaxableValue,
      GSTRate: req.body.GSTRate,
      IGSTRate: req.body.IGSTRate,
      IGSTValue: req.body.IGSTValue,
      CESSRate: req.body.CESSRate,
      CESSValue: req.body.CESSValue,
      SGSTValue: req.body.SGSTValue,
    };
    const newInvoiceProdInfo = await InvoiceProductInfo.create(
      invoiceProductInfo,
      { transaction }
    );

    // Update the VehicleAllotment table to set Status = 'Invoiced' for the related AllotmentID
    if (req.body.AllotmentID) {
      const allotmentUpdate = await VehicleAllotment.update(
        { AllotmentStatus: "Invoiced", ModifiedDate: new Date() }, // Set the Status field to 'Invoiced'
        {
          where: {
            AllotmentReqID: req.body.AllotmentID, // Use the provided AllotmentID to update the record
          },
          transaction, // Pass the transaction to the query
        }
      );

      if (allotmentUpdate[0] === 0) {
        // If no records are updated, rollback the transaction
        await transaction.rollback();
        return res
          .status(400)
          .json({ message: "Failed to update VehicleAllotment status." });
      }
    }

    // Commit the transaction if all queries are successful
    await transaction.commit();

    // Return the newly created invoice as a response
    return res.status(201).json(newInvoice);
  } catch (err) {
    // If any error occurs, rollback the transaction
    await transaction.rollback();

    // Handle errors based on specific types
    if (err.name === "SequelizeValidationError") {
      return res.status(400).json({
        message: "Validation error",
        details: err.errors.map((e) => e.message),
      });
    }

    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        message: "Unique constraint error",
        details: err.errors.map((e) => e.message),
      });
    }

    if (err.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message: "Database error occurred while creating Invoice.",
        details: err.message,
      });
    }

    if (err.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: err.message,
      });
    }

    console.error("Error creating Invoice:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Retrieve all Invoices from the database.
exports.findAll = async (req, res) => {
  try {
    // Fetch all invoices with associated models
    const invoices = await Invoice.findAll({
      attributes: [
        "InvoiceID",
        "InvoiceNo",
        "InvoiceDate",
        "TransactionID",
        "TransactionType",
        "AllotmentID",
        "CustomerID",
        "CustomerName",
        "SaleBranchID",
        "SalesPersonID",
        "SalesPersonName",
        "TeamLeadID",
        "TeamLeadName",
        "AadharNo",
        "ChassisNo",
        "EngineNo",
        "FinanceID",
        "FinancierName",
        "FinancierAmt",
        "FinAddress",
        "FinStatus",
        "InvoiceType",
        "CustomerType",
        "BillType",
        "RCM",
        "DiscountValue",
        "TotalAmt",
        "TCSRate",
        "TCSValue",
        "InvoiceAmt",
        "IsActive",
        "Status",
        "CreatedDate",
        "ModifiedDate",
      ],
      include: [
        {
          model: UserMaster,
          as: "ISalesPersonID",
          attributes: ["UserID", "UserName", "EmpID"], // Include sales person details
        },
        {
          model: UserMaster,
          as: "ITeamLeadID",
          attributes: ["UserID", "UserName", "EmpID"], // Include team lead details
        },
        {
          model: CustomerMaster,
          as: "ICustomerID",
          attributes: ["CustomerID", "FirstName", "LastName", "CustomerType"], // Include customer details
        },
        {
          model: BranchMaster,
          as: "ISaleBranchID",
          attributes: ["BranchID", "BranchName", "BranchCode"], // Include branch details
        },
        {
          model: PaymentReference,
          as: "ITransactionTypeID",
          attributes: ["ID", "PaymentRefName"], // Include transaction type details
        },
        {
          model: VehicleAllotment,
          as: "IAllotmentID",
          attributes: ["AllotmentReqID", "ReqNo", "ReqDate", "PurchaseID"], // Include vehicle allotment details
        },
        {
          model: FinanceLoanApplication,
          as: "IFinanceID",
          attributes: [
            "FinanceLoanID",
            "RefAppNo",
            "NetDisbursement",
            "ApplicationStatus",
          ], // Include vehicle allotment details
        },
      ],
      order: [["InvoiceID", "DESC"]], // Order by InvoiceID in ascending order
    });

    if (invoices.length === 0) {
      return res.status(404).json({ message: "No invoices found" });
    }

    res.status(200).json(invoices);
  } catch (error) {
    // Handle specific Sequelize errors
    if (error.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message: "Database error occurred while retrieving invoices.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    console.error("Error fetching invoices:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Find a single Invoice with an id
exports.findOne = async (req, res) => {
  try {
    const invoiceId = req.params.id; // Get InvoiceID from URL parameter

    // Fetch the invoice by InvoiceID with associated models
    const invoice = await Invoice.findOne({
      where: { InvoiceID: invoiceId }, // Find the invoice by its ID
      attributes: [
        "InvoiceID",
        "InvoiceNo",
        "InvoiceDate",
        "TransactionID",
        "TransactionType",
        "AllotmentID",
        "CustomerID",
        "CustomerName",
        "SaleBranchID",
        "SalesPersonID",
        "SalesPersonName",
        "TeamLeadID",
        "TeamLeadName",
        "AadharNo",
        "ChassisNo",
        "EngineNo",
        "FinanceID",
        "FinancierName",
        "FinancierAmt",
        "FinAddress",
        "FinStatus",
        "InvoiceType",
        "CustomerType",
        "BillType",
        "RCM",
        "DiscountValue",
        "TotalAmt",
        "TCSRate",
        "TCSValue",
        "InvoiceAmt",
        "IsActive",
        "Status",
        "CreatedDate",
        "ModifiedDate",
      ],
      include: [
        {
          model: UserMaster,
          as: "ISalesPersonID",
          attributes: ["UserID", "UserName", "EmpID"], // Include sales person details
        },
        {
          model: UserMaster,
          as: "ITeamLeadID",
          attributes: ["UserID", "UserName", "EmpID"], // Include team lead details
        },
        {
          model: CustomerMaster,
          as: "ICustomerID",
          attributes: ["CustomerID", "FirstName", "LastName", "CustomerType"], // Include customer details
        },
        {
          model: BranchMaster,
          as: "ISaleBranchID",
          attributes: ["BranchID", "BranchName", "BranchCode"], // Include branch details
        },
        {
          model: PaymentReference,
          as: "ITransactionTypeID",
          attributes: ["ID", "PaymentRefName"], // Include transaction type details
        },
        {
          model: VehicleAllotment,
          as: "IAllotmentID",
          attributes: ["AllotmentReqID", "ReqNo", "ReqDate", "PurchaseID"], // Include vehicle allotment details
          include: [
            {
              model: VehicleStock,
              as: "AllotPurchaseID",
            },
          ],
        },
        {
          model: FinanceLoanApplication,
          as: "IFinanceID",
          attributes: [
            "FinanceLoanID",
            "RefAppNo",
            "NetDisbursement",
            "ApplicationStatus",
          ], // Include vehicle allotment details
        },
        { model: InvoiceAddress, as: "InvoiceAddresses" },
        {
          model: InvoiceProductInfo,
          as: "InvoiceProductInfo",
          include: [{ model: ProductMaster, as: "IPIMasterProdID" }],
        },
      ],
    });

    // If no invoice is found, return a 404 error
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }
    // console.log(invoice?.InvoiceProductInfo[0]?.IPIMasterProdID?.HSNValue);
    // Return the found invoice
    res.status(200).json(invoice);
  } catch (error) {
    // Handle specific Sequelize errors
    if (error.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message: "Database error occurred while retrieving the invoice.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    console.error("Error fetching invoice:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Update a Invoice by the id in the request
exports.update = async (req, res) => {
  console.log("Invoice ID:", req.params.id); // Log the Invoice ID

  try {
    // Validate request - Check if Invoice ID is provided in the URL params
    if (!req.params.id) {
      return res.status(400).json({ message: "Invoice ID is required" });
    }

    const invoiceId = req.params.id;

    // Find the invoice by ID
    let invoice = await Invoice.findByPk(invoiceId);
    console.log("Invoice data: ", invoice);

    // If the invoice doesn't exist, return a 404 error
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    // Update fields based on the request body
    invoice.TransactionID = req.body.TransactionID || invoice.TransactionID;
    invoice.TransactionType =
      req.body.TransactionType || invoice.TransactionType;
    invoice.AllotmentID = req.body.AllotmentID || invoice.AllotmentID;
    invoice.CustomerID = req.body.CustomerID || invoice.CustomerID;
    invoice.CustomerName = req.body.CustomerName || invoice.CustomerName;
    invoice.SaleBranchID = req.body.SaleBranchID || invoice.SaleBranchID;
    invoice.SalesPersonID = req.body.SalesPersonID || invoice.SalesPersonID;
    invoice.SalesPersonName =
      req.body.SalesPersonName || invoice.SalesPersonName;
    invoice.TeamLeadID = req.body.TeamLeadID || invoice.TeamLeadID;
    invoice.TeamLeadName = req.body.TeamLeadName || invoice.TeamLeadName;
    invoice.AadharNo = req.body.AadharNo || invoice.AadharNo;
    invoice.ChassisNo = req.body.ChassisNo || invoice.ChassisNo;
    invoice.EngineNo = req.body.EngineNo || invoice.EngineNo;
    invoice.FinanceID = req.body.FinancierName || invoice.FinanceID;
    invoice.FinancierName = req.body.FinancierName || invoice.FinancierName;
    invoice.FinancierAmt = req.body.FinancierAmt || invoice.FinancierAmt;
    invoice.FinAddress = req.body.FinAddress || invoice.FinAddress;
    invoice.FinStatus = req.body.FinStatus || invoice.FinStatus;
    invoice.InvoiceType = req.body.InvoiceType || invoice.InvoiceType;
    invoice.CustomerType = req.body.CustomerType || invoice.CustomerType;
    invoice.BillType = req.body.BillType || invoice.BillType;
    invoice.RCM = req.body.RCM || invoice.RCM;
    invoice.DiscountValue = req.body.DiscountValue || invoice.DiscountValue;
    invoice.TotalAmt = req.body.TotalAmt || invoice.TotalAmt;
    invoice.TCSRate = req.body.TCSRate || invoice.TCSRate;
    invoice.TCSValue = req.body.TCSValue || invoice.TCSValue;
    invoice.InvoiceAmt = req.body.InvoiceAmt || invoice.InvoiceAmt;
    invoice.IsActive =
      req.body.IsActive !== undefined ? req.body.IsActive : invoice.IsActive;
    invoice.Status = req.body.Status || invoice.Status || "Active";
    invoice.ModifiedDate = new Date();

    console.log("Updated invoice:", invoice);

    // Save updated invoice in the database
    const updatedInvoice = await invoice.save();

    // Return the updated invoice as a response
    return res.status(200).json(updatedInvoice);
  } catch (err) {
    // Handle Sequelize validation error
    if (err.name === "SequelizeValidationError") {
      return res.status(400).json({
        message: "Validation error",
        details: err.errors.map((e) => e.message),
      });
    }

    // Handle database-related errors
    if (err.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message: "Database error occurred while updating invoice.",
        details: err.message,
      });
    }

    // Handle connection errors
    if (err.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: err.message,
      });
    }

    // Catch-all for unexpected errors
    console.error("Error updating invoice:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a Invoice with the specified id in the request
exports.delete = async (req, res) => {
  const id = req.params.id; // Extract the Invoice ID from the URL parameters

  try {
    // Find the invoice by its ID
    const invoice = await Invoice.findByPk(id);

    // Check if the invoice exists
    if (!invoice) {
      return res
        .status(404)
        .json({ message: `Invoice not found with id: ${id}` });
    }

    // Delete the invoice
    await invoice.destroy();

    // Send a success response with a message
    res.status(200).json({
      message: `Invoice with id: ${id} deleted successfully`,
    });
  } catch (err) {
    // Handle specific Sequelize errors
    if (err.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message: "Database error occurred while deleting the invoice.",
        details: err.message,
      });
    }

    if (err.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: err.message,
      });
    }

    // Log and handle any other unexpected errors
    console.error("Error deleting invoice:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Retrieve all Invoices for WEB from the database.
exports.findAllInvoiceWeb = async (req, res) => {
  try {
    const { BranchID } = req.query;

    // Check if the UserID is provided
    if (!BranchID) {
      return res.status(400).json({ message: "BranchID is required." });
    }

    // const userData = await UserMaster.findOne({ where: { UserID: UserID } });
    // Fetch all invoices with associated models
    const invoices = await Invoice.findAll({
      where: { SaleBranchID: BranchID },
      attributes: [
        "InvoiceID",
        "InvoiceNo",
        "InvoiceDate",
        "TransactionID",
        "TransactionType",
        "AllotmentID",
        "CustomerID",
        "CustomerName",
        "SaleBranchID",
        "SalesPersonID",
        "SalesPersonName",
        "TeamLeadID",
        "TeamLeadName",
        "AadharNo",
        "ChassisNo",
        "EngineNo",
        "FinanceID",
        "FinancierName",
        "FinancierAmt",
        "FinAddress",
        "FinStatus",
        "InvoiceType",
        "CustomerType",
        "BillType",
        "RCM",
        "DiscountValue",
        "TotalAmt",
        "TCSRate",
        "TCSValue",
        "InvoiceAmt",
        "IsActive",
        "Status",
        "CreatedDate",
        "ModifiedDate",
      ],
      include: [
        {
          model: UserMaster,
          as: "ISalesPersonID",
          attributes: ["UserID", "UserName", "EmpID"], // Include sales person details
        },
        {
          model: UserMaster,
          as: "ITeamLeadID",
          attributes: ["UserID", "UserName", "EmpID"], // Include team lead details
        },
        {
          model: CustomerMaster,
          as: "ICustomerID",
          attributes: ["CustomerID", "FirstName", "LastName", "CustomerType"], // Include customer details
        },
        {
          model: BranchMaster,
          as: "ISaleBranchID",
          attributes: ["BranchID", "BranchName", "BranchCode"], // Include branch details
        },
        {
          model: PaymentReference,
          as: "ITransactionTypeID",
          attributes: ["ID", "PaymentRefName"], // Include transaction type details
        },
        {
          model: VehicleAllotment,
          as: "IAllotmentID",
          attributes: ["AllotmentReqID", "ReqNo", "ReqDate", "PurchaseID"], // Include vehicle allotment details
        },
        {
          model: FinanceLoanApplication,
          as: "IFinanceID",
          attributes: [
            "FinanceLoanID",
            "RefAppNo",
            "NetDisbursement",
            "ApplicationStatus",
          ], // Include vehicle allotment details
        },
      ],
      order: [["InvoiceID", "DESC"]], // Order by InvoiceID in ascending order
    });

    if (invoices.length === 0) {
      return res.status(404).json({ message: "No invoices found" });
    }

    // Initialize arrays to hold just TransactionIDs for each group
    let newCarBookingTransactionIDs = [];
    let usedCarBookingTransactionIDs = [];

    // Group only the TransactionID by TransactionType
    invoices.forEach((invoice) => {
      if (invoice.TransactionType === 1) {
        newCarBookingTransactionIDs.push(invoice.TransactionID);
      } else if (invoice.TransactionType === 2) {
        usedCarBookingTransactionIDs.push(invoice.TransactionID);
      }
    });

    // Now, for each group, we run specific queries.
    // Prepare response data
    let finalResponse = [];

    // For TransactionType = 1 (NewCarBookings)
    if (newCarBookingTransactionIDs.length > 0) {
      // Fetch data from NewCarBookings model using TransactionID
      const newCarBookingsData = await NewCarBookings.findAll({
        where: {
          BookingID: {
            [Op.in]: newCarBookingTransactionIDs, // Use Sequelize's Op.in to filter by multiple TransactionIDs
          },
        },
        attributes: [
          "BookingID",
          "BookingNo",
          "ModelName",
          // "VariantName", // You can uncomment this if needed
          // "ColourName",
        ],
      });

      console.log("New Car Bookings Data:", newCarBookingsData);
      // Iterate through invoices and match with NewCarBookings data
      invoices.forEach((invoice) => {
        if (invoice.TransactionType === 1) {
          const bookingData = newCarBookingsData.find(
            (booking) => booking.BookingID === invoice.TransactionID
          );
          if (bookingData) {
            finalResponse.push({
              InvoiceID: invoice.InvoiceID,
              InvoiceNo: invoice.InvoiceNo,
              InvoiceDate: invoice.InvoiceDate,
              BookingNo: bookingData.BookingNo, // Get BookingNo from NewCarBookings
              CustomerName: invoice.CustomerName,
              Model: bookingData.ModelName, // Get BookingNo from NewCarBookings
              ChassisNo: invoice.ChassisNo,
              EngineNo: invoice.EngineNo,
              InvoiceValue: invoice.InvoiceAmt,
              SalesPersonName: invoice.SalesPersonName,
              TeamLeadName: invoice.TeamLeadName,
              BranchName: invoice.ISaleBranchID
                ? invoice.ISaleBranchID.BranchName
                : null,
            });
          }
        }
      });
    }

    //  // For UsedCarBookings (TransactionType = 2)
    //  if (usedCarBookingTransactionIDs.length > 0) {
    //   const usedCarBookingsData = await UsedCarBookings.findAll({
    //     where: {
    //       TransactionID: {
    //         [Op.in]: usedCarBookingTransactionIDs,  // Filter by multiple TransactionIDs
    //       },
    //     },
    //     attributes: [
    //       "BookingID",
    //       "BookingNo",
    //       "ModelName",
    //       "VariantName", // You can uncomment this if needed
    //       "ColourName",
    //     ],
    //   });

    //   console.log("Used Car Bookings Data:", usedCarBookingsData);
    // Iterate through invoices and match with UsedCarBookings data
    // invoices.forEach((invoice) => {
    //   if (invoice.TransactionType === 2) {
    //     const bookingData = usedCarBookingsData.find(
    //       (booking) => booking.BookingID === invoice.TransactionID
    //     );
    //     if (bookingData) {
    //       finalResponse.push({
    //         InvoiceID: invoice.InvoiceID,
    //         InvoiceNo: invoice.InvoiceNo,
    //         InvoiceDate: invoice.InvoiceDate,
    //         CustomerName: invoice.CustomerName,
    //         SalesPersonName: invoice.SalesPersonName,
    //         TeamLeadName: invoice.TeamLeadName,
    //         ChassisNo: invoice.ChassisNo,
    //         EngineNo: invoice.EngineNo,
    //         BookingNo: bookingData.BookingNo,  // Get BookingNo from UsedCarBookings
    //       });
    //     }
    //   }
    // });
    // }

    // Return the constructed response data
    res.status(200).json(finalResponse);
  } catch (error) {
    // Handle specific Sequelize errors
    if (error.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message: "Database error occurred while retrieving invoices.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    console.error("Error fetching invoices:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Find a single Invoice with an id for Web
exports.findOneWeb = async (req, res) => {
  try {
    const invoiceId = req.params.id; // Get InvoiceID from URL parameter

    // Fetch the invoice by InvoiceID with associated models
    const invoice = await Invoice.findOne({
      where: { InvoiceID: invoiceId }, // Find the invoice by its ID
      attributes: [
        "InvoiceID",
        "InvoiceNo",
        "InvoiceDate",
        "TransactionID",
        "TransactionType",
        "AllotmentID",
        "CustomerID",
        "CustomerName",
        "SaleBranchID",
        "SalesPersonID",
        "SalesPersonName",
        "TeamLeadID",
        "TeamLeadName",
        "AadharNo",
        "ChassisNo",
        "EngineNo",
        "FinanceID",
        "FinancierName",
        "FinancierAmt",
        "FinAddress",
        "FinStatus",
        "InvoiceType",
        "CustomerType",
        "BillType",
        "RCM",
        "DiscountValue",
        "TotalAmt",
        "TCSRate",
        "TCSValue",
        "InvoiceAmt",
        "IsActive",
        "Status",
        "CreatedDate",
        "ModifiedDate",
      ],
      include: [
        {
          model: UserMaster,
          as: "ISalesPersonID",
          attributes: ["UserID", "UserName", "EmpID"], // Include sales person details
        },
        {
          model: UserMaster,
          as: "ITeamLeadID",
          attributes: ["UserID", "UserName", "EmpID"], // Include team lead details
        },
        {
          model: CustomerMaster,
          as: "ICustomerID",
          attributes: [
            "CustomerID",
            "CustID",
            "FirstName",
            "LastName",
            "CustomerType",
          ], // Include customer details
        },
        {
          model: BranchMaster,
          as: "ISaleBranchID",
          attributes: ["BranchID", "BranchName", "BranchCode"], // Include branch details
        },
        {
          model: PaymentReference,
          as: "ITransactionTypeID",
          attributes: ["ID", "PaymentRefName"], // Include transaction type details
        },
        {
          model: VehicleAllotment,
          as: "IAllotmentID",
          attributes: ["AllotmentReqID", "ReqNo", "ReqDate", "PurchaseID"], // Include vehicle allotment details
          include: [
            {
              model: VehicleStock,
              as: "AllotPurchaseID",
              attributes: ["PurchaseID", "KeyNo", "SKUCode"], // Example fields
            },
          ],
        },
        {
          model: FinanceLoanApplication,
          as: "IFinanceID",
          attributes: [
            "FinanceLoanID",
            "RefAppNo",
            "NetDisbursement",
            "ApplicationStatus",
          ], // Include vehicle allotment details
        },
        {
          model: InvoiceAddress,
          as: "InvoiceAddresses",
          attributes: [
            "InvoiceAddressID",
            "InvoiceID",
            "GSTStatus",
            "GSTNo",
            "GSTName",
            "GSTType",
            "AddressType",
            "PANNo",
            "IsSameAddress",
            "Address1",
            "Address2",
            "City",
            "State",
            "PINCode",
            "PlaceOfSupply",
          ], // Include vehicle allotment details
        },
        {
          model: InvoiceProductInfo,
          as: "InvoiceProductInfo",
          attributes: [
            "InvoiceProdInfoID",
            "InvoiceID",
            "ProductID",
            "ProductName",
            "ProductCost",
            "DiscountPercentage",
            "DiscountValue",
            "TaxableValue",
            "GSTRate",
            "IGSTRate",
            "IGSTValue",
            "CESSRate",
            "CESSValue",
            "CGSTValue",
            "SGSTValue",
            "IsActive",
            "Status",
            "CreatedDate",
          ], // Include vehicle allotment details
          include: [
            {
              model: MasterProducts,
              as: "IPIMasterProdID", // Alias for MasterProducts association
              attributes: ["MasterProdID", "HSNValue"], // Add other fields if required
            },
          ],
        },
      ],
    });

    // If no invoice is found, return a 404 error
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    // Check TransactionType and fetch NewCarBookings if TransactionType is 1
    let additionalData = {};
    if (invoice.TransactionType === 1) {
      const newCarBooking = await NewCarBookings.findOne({
        where: { BookingID: invoice.TransactionID },
        attributes: [
          "ModelName",
          "VariantName",
          "ColourName",
          "Transmission",
          "Fuel",
          "PhoneNo",
          "Email",
          "BookingNo",
        ],
      });

      // Add new car booking data to the response
      additionalData = newCarBooking ? newCarBooking.toJSON() : {};
    }

    const skuCode = invoice?.IAllotmentID?.AllotPurchaseID?.SKUCode;
    let skuData = {};
    if (skuCode) {
      skuData = await SKUMaster.findOne({
        where: { SKUCode: skuCode },
        attributes: ["SKUCode", "EmissionNorm"],
      });
      // Add EmissionNorm to additionalData if available
      if (skuData) {
        additionalData.EmissionNorm = skuData.EmissionNorm || null;
      }
    }
    const InvoiceData = {
      InvoiceID: invoice.InvoiceID || null,
      InvoiceNo: invoice.InvoiceNo || null,
      InvoiceDate: invoice.InvoiceDate || null,
      TransactionID: invoice.TransactionID || null,
      TransactionType: invoice.TransactionType || null,
      AllotmentID: invoice.AllotmentID || null,
      CustomerID: invoice.CustomerID || null,
      CustomerName: invoice.CustomerName || null,
      SaleBranchID: invoice.SaleBranchID || null,
      SalesPersonID: invoice.ISalesPersonID
        ? invoice.ISalesPersonID.UserID
        : null,
      SalesPersonName: invoice.ISalesPersonID
        ? invoice.ISalesPersonID.UserName
        : null,
      SalesPersonEmpID: invoice.ISalesPersonID
        ? invoice.ISalesPersonID.EmpID
        : null,
      TeamLeadID: invoice.ITeamLeadID ? invoice.ITeamLeadID.UserID : null,
      TeamLeadName: invoice.ITeamLeadID ? invoice.ITeamLeadID.UserName : null,
      TeamLeadEmpID: invoice.ITeamLeadID ? invoice.ITeamLeadID.EmpID : null,
      AadharNo: invoice.AadharNo || null,
      ChassisNo: invoice.ChassisNo || null,
      EngineNo: invoice.EngineNo || null,
      FinanceLoanID: invoice.IFinanceID
        ? invoice.IFinanceID.FinanceLoanID
        : null,
      FinancierName: invoice.FinancierName || null,
      FinancierAmt: invoice.FinancierAmt || null,
      FinAddress: invoice.FinAddress || null,
      FinStatus: invoice.FinStatus || null,
      RefAppNo: invoice.IFinanceID ? invoice.IFinanceID.RefAppNo : null,
      NetDisbursement: invoice.IFinanceID
        ? invoice.IFinanceID.NetDisbursement
        : null,
      ApplicationStatus: invoice.IFinanceID
        ? invoice.IFinanceID.ApplicationStatus
        : null,
      BranchID: invoice.ISaleBranchID ? invoice.ISaleBranchID.BranchID : null,
      BranchName: invoice.ISaleBranchID
        ? invoice.ISaleBranchID.BranchName
        : null,
      BranchCode: invoice.ISaleBranchID
        ? invoice.ISaleBranchID.BranchCode
        : null,
      CustomerCustID: invoice.ICustomerID ? invoice.ICustomerID.CustID : null,
      CustomerFirstName: invoice.ICustomerID
        ? invoice.ICustomerID.FirstName
        : null,
      CustomerLastName: invoice.ICustomerID
        ? invoice.ICustomerID.LastName
        : null,
      // CustomerType: invoice.ICustomerID ? invoice.ICustomerID.CustomerType : null,
      TransactionTypeID: invoice.ITransactionTypeID
        ? invoice.ITransactionTypeID.ID
        : null,
      PaymentRefName: invoice.ITransactionTypeID
        ? invoice.ITransactionTypeID.PaymentRefName
        : null,
      VehicleAllotmentReqID: invoice.IAllotmentID
        ? invoice.IAllotmentID.AllotmentReqID
        : null,
      VehicleAllotmentReqNo: invoice.IAllotmentID
        ? invoice.IAllotmentID.ReqNo
        : null,
      VehicleAllotmentReqDate: invoice.IAllotmentID
        ? invoice.IAllotmentID.ReqDate
        : null,
      VehicleAllotmentPurchaseID: invoice.IAllotmentID
        ? invoice.IAllotmentID.PurchaseID
        : null,
      VehicleStockPurchaseID:
        invoice.IAllotmentID && invoice.IAllotmentID.AllotPurchaseID
          ? invoice.IAllotmentID.AllotPurchaseID.PurchaseID
          : null,
      VehicleStockKeyNo:
        invoice.IAllotmentID && invoice.IAllotmentID.AllotPurchaseID
          ? invoice.IAllotmentID.AllotPurchaseID.KeyNo
          : null,
      VehicleStockSKUCode:
        invoice.IAllotmentID && invoice.IAllotmentID.AllotPurchaseID
          ? invoice.IAllotmentID.AllotPurchaseID.SKUCode
          : null,
      InvoiceType: invoice.InvoiceType || null,
      CustomerType: invoice.CustomerType || null,
      BillType: invoice.BillType || null,
      RCM: invoice.RCM || null,
      DiscountValue: invoice.DiscountValue || null,
      TotalAmt: invoice.TotalAmt || null,
      TCSRate: invoice.TCSRate || null,
      TCSValue: invoice.TCSValue || null,
      InvoiceAmt: invoice.InvoiceAmt || null,
      IsActive: invoice.IsActive || null,
      Status: invoice.Status || null,
      CreatedDate: invoice.CreatedDate || null,
      ModifiedDate: invoice.ModifiedDate || null,
      // Additional Data
      ModelName: additionalData.ModelName || null,
      VariantName: additionalData.VariantName || null,
      ColourName: additionalData.ColourName || null,
      Transmission: additionalData.Transmission || null,
      Fuel: additionalData.Fuel || null,
      PhoneNo: additionalData.PhoneNo || null,
      EmailID: additionalData.Email || null,
      BookingNo: additionalData.BookingNo || null,
      EmissionNorm: additionalData.EmissionNorm || null,
      // IsSameAddress: Use the value of the first address entry
      IsSameAddress:
        invoice.InvoiceAddresses && invoice.InvoiceAddresses[0]
          ? invoice.InvoiceAddresses[0].IsSameAddress
          : null,
    };

    // Assuming there are exactly 2 addresses (Billing and Shipping)
    const addressData = invoice.InvoiceAddresses || [];

    addressData.forEach((address, index) => {
      const prefix = address.AddressType === "Billing" ? "B_" : "S_";

      InvoiceData[`${prefix}InvoiceAddressID`] =
        address.InvoiceAddressID || null;
      InvoiceData[`${prefix}InvoiceID`] = address.InvoiceID || null;
      InvoiceData[`${prefix}GSTStatus`] = address.GSTStatus || null;
      InvoiceData[`${prefix}GSTNo`] = address.GSTNo || null;
      InvoiceData[`${prefix}GSTName`] = address.GSTName || null;
      InvoiceData[`${prefix}GSTType`] = address.GSTType || null;
      InvoiceData[`${prefix}AddressType`] = address.AddressType || null;
      InvoiceData[`${prefix}PANNo`] = address.PANNo || null;
      InvoiceData[`${prefix}Address1`] = address.Address1 || null;
      InvoiceData[`${prefix}Address2`] = address.Address2 || null;
      InvoiceData[`${prefix}City`] = address.City || null;
      InvoiceData[`${prefix}State`] = address.State || null;
      InvoiceData[`${prefix}PINCode`] = address.PINCode || null;
      InvoiceData[`${prefix}PlaceOfSupply`] = address.PlaceOfSupply || null;
    });

    // Initialize an empty array to hold the product data
    let ProductData = [];

    // Check if invoice.InvoiceProductInfo exists and is an array
    if (
      invoice.InvoiceProductInfo &&
      Array.isArray(invoice.InvoiceProductInfo)
    ) {
      // Loop through the InvoiceProductInfo array
      invoice.InvoiceProductInfo.forEach((product) => {
        // Create an object for each product and map its fields
        const productObj = {
          InvoiceProdInfoID: product.InvoiceProdInfoID || null,
          InvoiceID: product.InvoiceID || null,
          ProductID: product.ProductID || null,
          ProductName: product.ProductName || null,
          HSNValue: product.IPIMasterProdID
            ? product.IPIMasterProdID.HSNValue
            : null,
          ProductCost: product.ProductCost || null,
          DiscountPercentage: product.DiscountPercentage || null,
          DiscountValue: product.DiscountValue || null,
          TaxableValue: product.TaxableValue || null,
          GSTRate: product.GSTRate || null,
          IGSTRate: product.IGSTRate || null,
          IGSTValue: product.IGSTValue || null,
          CESSRate: product.CESSRate || null,
          CESSValue: product.CESSValue || null,
          CGSTValue: product.CGSTValue || null,
          SGSTValue: product.SGSTValue || null,
          IsActive: product.IsActive || null,
          Status: product.Status || null,
          CreatedDate: product.CreatedDate || null,
        };

        // Add the product object to the ProductData array
        ProductData.push(productObj);
      });
    }

    // Return the found invoice
    res.status(200).json({ InvoiceData, ProductData });
  } catch (error) {
    // Handle specific Sequelize errors
    if (error.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message: "Database error occurred while retrieving the invoice.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    console.error("Error fetching invoice:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.findAllowInvoice = async (req, res) => {
  try {
    const bookingId = req.query.BookingID; // Get InvoiceID from URL parameter
    const customerId = req.query.CustomerID;
    if (!bookingId) {
      return res.status(400).json({ message: "BookingID is required" });
    }

    // Check VehicleAllotment table first
    const allotmentRecord = await VehicleAllotment.findOne({
      where: {
        BookingID: bookingId,
        AllotmentStatus: "Allotted", // Check for Allotted status
      },
      attributes: [
        "AllotmentReqID",
        "ReqNo",
        "ReqDate",
        "OnRoadPrice",
        "BookingID",
        "CustomerID",
        "ModelMasterID",
        "VariantID",
        "ColourID",
        "FuelTypeID",
        "TransmissionID",
        "BranchID",
        "SalesPersonID",
        "TeamLeadID",
        "PurchaseID",
        "ExchangeID",
        "FinanceLoanID",
        "AllotmentValidFrom",
        "AllotmentValidTill",
        "FIFOPosition",
        "PaymentReceived",
        "Remarks",
        "AllotmentStatus",
        "IsActive",
        "Status",
        "CreatedDate",
        "ModifiedDate",
      ],
      include: [
        {
          model: VehicleStock,
          as: "AllotPurchaseID",
          attributes: ["SKUCode", "KeyNo", "ChassisNo", "EngineNo"],
        },
      ],
    });

    if (!allotmentRecord) {
      return res.status(404).json({
        message:
          "No allotment record found with Allotted status for this BookingID.",
      });
    }

    const skuData = await SKUMaster.findOne({
      where: { SKUCode: allotmentRecord.AllotPurchaseID.SKUCode },
    });

    // Retrieve fields from VehicleAllotment if found
    // Initialize the allotmentData with values from allotmentRecord
    let allotmentData = {
      AllotmentReqID: allotmentRecord.AllotmentReqID,
      ReqNo: allotmentRecord.ReqNo,
      ReqDate: allotmentRecord.ReqDate,
      OnRoadPrice: allotmentRecord.OnRoadPrice,
      BookingID: allotmentRecord.BookingID,
      CustomerID: allotmentRecord.CustomerID,
      ModelMasterID: allotmentRecord.ModelMasterID,
      VariantID: allotmentRecord.VariantID,
      ColourID: allotmentRecord.ColourID,
      FuelTypeID: allotmentRecord.FuelTypeID,
      TransmissionID: allotmentRecord.TransmissionID,
      BranchID: allotmentRecord.BranchID,
      SalesPersonID: allotmentRecord.SalesPersonID,
      TeamLeadID: allotmentRecord.TeamLeadID,
      PurchaseID: allotmentRecord.PurchaseID,
      ExchangeID: allotmentRecord.ExchangeID,
      FinanceLoanID: allotmentRecord.FinanceLoanID,
      AllotmentValidFrom: allotmentRecord.AllotmentValidFrom,
      AllotmentValidTill: allotmentRecord.AllotmentValidTill,
      FIFOPosition: allotmentRecord.FIFOPosition,
      PaymentReceived: allotmentRecord.PaymentReceived,
      Remarks: allotmentRecord.Remarks,
      AllotmentStatus: allotmentRecord.AllotmentStatus,
      IsActive: allotmentRecord.IsActive,
      Status: allotmentRecord.Status,
      CreatedDate: allotmentRecord.CreatedDate,
      ModifiedDate: allotmentRecord.ModifiedDate,
      KeyNo: allotmentRecord.AllotPurchaseID
        ? allotmentRecord.AllotPurchaseID.KeyNo
        : null,
      ChassisNo: allotmentRecord.AllotPurchaseID
        ? allotmentRecord.AllotPurchaseID.ChassisNo
        : null,
      EngineNo: allotmentRecord.AllotPurchaseID
        ? allotmentRecord.AllotPurchaseID.EngineNo
        : null,
      EmissionNorm: skuData?.EmissionNorm || null, // Add the EmissionNorm from skuData
      HSNCode: skuData?.HSNCode || null, // Add the HSNCode from skuData
      IGSTRate: skuData?.IGSTRate || null, // Add the IGSTRate from skuData
      CESSRate: skuData?.CESSRate || null, // Add the CESSRate from skuData
    };

    const gstRecords = await CustomerGSTInfo.findAll({
      where: {
        CustomerID: customerId,
        IsActive: true,
      },
      attributes: [
        "GSTID",
        "CustomerID",
        "GSTIN",
        "RegistrationType",
        "LegalName",
        "TradeName",
        "DOR",
        "EntityType",
        "Address",
        "StateID",
        "PINCode",
        "DocID",
        "IsActive",
        "Status",
        "CreatedDate",
        "ModifiedDate",
        [sequelize.col("CGIStatePOSID.StateName"), "StateName"],
        [sequelize.col("CGIStatePOSID.StatePOSID"), "StatePOSID"],
      ],
      include: [
        {
          model: StatePOS,
          as: "CGIStatePOSID",
          attributes: [],
        },
      ],
    });

    // Check FinanceLoanApplication table
    const financeRecord = await FinanceLoanApplication.findAll({
      where: {
        BookingID: bookingId,
        ApplicationStatus: "Approved", // Check for Approved status
      },
      attributes: [
        "FinanceLoanID",
        "Category",
        "LoanAppCustID",
        "RefAppNo",
        "BookingID",
        "CustomerID",
        "FinAppID",
        "UserID",
        "FinancierID",
        "SanctionAmount",
        "ROI",
        "Tenure",
        "DocumentCharge",
        "StampDuties",
        "ServiceCharges",
        "ProcessingFee",
        "Insurance",
        "Others",
        "TotalDeductions",
        "MarginAmount",
        "NetDisbursement",
        "DealerPayoutType",
        "DealerPayoutPercentage",
        "DealerPayoutValue",
        "ExecPayoutType",
        "ExecPayoutPercentage",
        "ExecPayoutValue",
        "TotalPayout",
        "ApprovedDate",
        "ApplicationStatus",
        "IsActive",
        "PaymentStatus",
        "CreatedDate",
        "ModifiedDate",
        [sequelize.col("FLAFinancierID.FinancierName"), "FinancierName"],
        [sequelize.col("FLAFinancierID.Category"), "FinanceMasterCategory"],
        [sequelize.col("FLAFinancierID.Location"), "Location"],
        [sequelize.col("FLAFinancierID.FinancierCode"), "FinancierCode"],
      ],
      include: [
        {
          model: FinanceMaster,
          as: "FLAFinancierID",
          attributes: [],
        },
      ],
    });

    const discountData = await OffersApprovals.findAll({
      where: { BookingID: bookingId },
    });
    // Return the found invoice
    // Return both allotment and finance data
    return res.status(200).json({
      message: "Records retrieved successfully",
      allotmentData,
      financeRecord,
      gstRecords,
      discountData,
    });
  } catch (error) {
    // Handle specific Sequelize errors
    if (error.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message: "Database error occurred while retrieving the invoice.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    console.error("Error fetching invoice:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateByGenIRN = async (req, res) => {
  try {
    const { InvoiceID, TravelDist, VehicleNo } = req.body;

    if (!InvoiceID || !TravelDist || !VehicleNo) {
      return res.status(400).send({ message: "Missing required fields." });
    }

    console.log("Indent ID: ", InvoiceID);

    const invoiceData = await Invoice.findOne({
      where: { InvoiceID: InvoiceID },
      include: [
        { model: PaymentReference, as: "ITransactionTypeID" },
        { model: CustomerMaster, as: "ICustomerID" },
        {
          model: BranchMaster,
          as: "ISaleBranchID",
          include: [
            {
              model: StatePOS,
              as: "BMStatePOSID",
            },
            {
              model: CompanyMaster,
              as: "BMCompanyID",
            },
            {
              model: CompanyGSTMaster,
              as: "BMCmpyGSTID",
              include: [
                {
                  model: StatePOS,
                  as: "CmpyGSTMStatePOSID",
                },
                {
                  model: CompanyMaster,
                  as: "CmpyGSTMCompanyID",
                },
              ],
            },
          ],
        },
        { model: UserMaster, as: "ISalesPersonID" },
        { model: UserMaster, as: "ITeamLeadID" },
        {
          model: VehicleAllotment,
          as: "IAllotmentID",
          include: [
            {
              model: VehicleStock,
              as: "AllotPurchaseID",
            },
          ],
        },
        { model: FinanceLoanApplication, as: "IFinanceID" },
        { model: InvoiceAddress, as: "InvoiceAddresses" },
        { model: InvoiceProductInfo, as: "InvoiceProductInfo" },
      ],
    });

    if (!invoiceData) {
      return res
        .status(404)
        .send({ message: `No Branch Transfer found with ID = ${InvoiceID}.` });
    }

    const irnJson = {
      Version: "1.1",
      TranDtls: {
        TaxSch: "GST",
        SupTyp: "B2B",
        RegRev: "N",
        EcmGstin: null,
        IgstOnIntra: "N",
      },
      DocDtls: {
        Typ: "INV",
        No: "DOCA005",
        Dt: "14/12/2024",
      },
      SellerDtls: {
        Gstin: "37AABCV2471Q1ZR",
        LglNm: "VARUN MOTORS PRIVATE LIMITED",
        TrdNm: "VARUN MOTORS PRIVATE LIMITED",
        Addr1: "7-8-1/1, KASTURBA MARG",
        Addr2: "SIRIPURAM",
        Loc: "SIRIPURAM",
        Pin: 530003,
        Stcd: "37",
      },
      BuyerDtls: {
        Gstin: "37AACCJ5167E1ZK",
        LglNm: "JAYABHERI AUTOMOTIVES PRIVATE LIMITED",
        TrdNm: "M/S JAYABHERI AUTOMOTIVES PRIVATE LIMITED",
        Pos: "37",
        Addr1: "51-17-2, NH-5,NEAR SATYAMJUNCTION",
        Addr2: "KRANTHINAGAR",
        Loc: "KRANTHINAGAR",
        Pin: 530013,
        Stcd: "37",
      },
      DispDtls: {
        Nm: "VARUN MOTORS PRIVATE LIMITED",
        Addr1: "7-8-1/1, KASTURBA MARG",
        Addr2: "SIRIPURAM",
        Loc: "Visakhapatnam",
        Pin: 530003,
        Stcd: "37",
      },
      ShipDtls: {
        Gstin: "37AACCJ5167E1ZK",
        LglNm: "JAYABHERI AUTOMOTIVES PRIVATE LIMITED",
        TrdNm: "M/S JAYABHERI AUTOMOTIVES PRIVATE LIMITED",
        Addr1: "51-17-2, NH-5,NEAR SATYAMJUNCTION",
        Addr2: "KRANTHINAGAR",
        Loc: "KRANTHINAGAR",
        Pin: 530013,
        Stcd: "37",
      },
      ItemList: [
        {
          SlNo: "1",
          PrdDesc: "",
          IsServc: "N",
          HsnCd: "",
          Qty: 1,
          Unit: "NOS",
          UnitPrice: 0,
          TotAmt: 0,
          Discount: 0,
          PreTaxVal: 0,
          AssAmt: 0,
          GstRt: 0,
          IgstAmt: 0,
          CgstAmt: 0,
          SgstAmt: 0,
          CesRt: 0,
          CesAmt: 0,
          OthChrg: 0,
          TotItemVal: 0,
        },
      ],
      ValDtls: {
        AssVal: 0,
        // CgstVal: 0,
        // SgstVal: 0,
        // IgstVal: 0,
        // CesVal: 0,
        // StCesVal: 0,
        // Discount: 0,
        // OthChrg: 0,
        // RndOffAmt: 0,
        TotInvVal: 0,
        // TotInvValFc: 1654100,
      },
    };
    /*
    // {
    //   Version: "1.1",
    //   TranDtls: {
    //     TaxSch: "GST",
    //     SupTyp: "B2B",
    //     RegRev: "Y",
    //     EcmGstin: null,
    //     IgstOnIntra: "N",
    //   },
    //   DocDtls: {
    //     Typ: "INV",
    //     No: "DOC/001",
    //     Dt: "18/08/2020",
    //   },
    //   SellerDtls: {
    //     Gstin: invoiceData.ISaleBranchID.GSTIN, //retrived from branch master table
    //     LglNm: invoiceData.ISaleBranchID.BMCmpyGSTID.LegalName, //retrived from company gst master
    //     TrdNm: invoiceData.ISaleBranchID.BMCmpyGSTID.TradeName, // retrived from company gst master
    //     Addr1: invoiceData.ISaleBranchID.Address, //retrived from branch master table
    //     Addr2: invoiceData.ISaleBranchID.District, //retrived from branch master table
    //     Loc: invoiceData.ISaleBranchID.CityCode, //retrived from branch master table
    //     Pin: invoiceData.ISaleBranchID.PINCode, //retrived from branch master table
    //     Stcd: invoiceData.ISaleBranchID.BMStatePOSID.POSID, //retrived from branch master table
    //     Ph: invoiceData.ISaleBranchID.Contact, //retrived from branch master table
    //     Em: invoiceData.ISaleBranchID.Email, //retrived from branch master table
    //   },
    //   BuyerDtls: {
    //     Gstin: invoiceData.ISaleBranchID.BMCmpyGSTID.GSTIN, //retrived from company gst master table
    //     LglNm: invoiceData.ISaleBranchID.BMCmpyGSTID.LegalName, //retrived from company gst master table
    //     TrdNm: invoiceData.ISaleBranchID.BMCmpyGSTID.TradeName, //retrived from company gst master table
    //     Pos: invoiceData.ISaleBranchID.BMCmpyGSTID.CmpyGSTMStatePOSID.POSID, //retrived from  state pos table
    //     Addr1: invoiceData.ISaleBranchID.BMCmpyGSTID.Address,
    //     Addr2:
    //       invoiceData.ISaleBranchID.BMCmpyGSTID.CmpyGSTMCompanyID.RegAddress, //retrived from company master table
    //     Loc: invoiceData.ISaleBranchID.BMCmpyGSTID.CmpyGSTMCompanyID.City, //retrived from company master table
    //     Pin: invoiceData.ISaleBranchID.BMCmpyGSTID.CmpyGSTMCompanyID.PINCode, //retrived from company master table
    //     Stcd: invoiceData.ISaleBranchID.BMCmpyGSTID.StatePOSID, //retrived from company gst master table
    //     Ph: invoiceData.ISaleBranchID.BMCmpyGSTID.CmpyGSTMCompanyID.Contact, //retrived from company master table
    //     Em: invoiceData.ISaleBranchID.BMCmpyGSTID.CmpyGSTMCompanyID.Email, //retrived from company master table
    //   },
    //   DispDtls: {
    //     Nm: invoiceData.ISaleBranchID.BMCompanyID.CompanyName, // retrived from branch master table
    //     Addr1: invoiceData.ISaleBranchID.Address1, //retrived from branch master table
    //     Addr2: invoiceData.ISaleBranchID.District, //retrived from branch master table
    //     Loc: invoiceData.ISaleBranchID.CityCode, //retrived from branch master table
    //     Pin: invoiceData.ISaleBranchID.PINCode, //retrived from branch master table
    //     Stcd: invoiceData.ISaleBranchID.BMStatePOSID.POSID, //retrived from branch master to statepos to posid
    //   },
    //   ShipDtls: () => {
    //     // Filter InvoiceAddresses for Shipping type
    //     const shippingAddress = invoiceData.InvoiceAddresses.find(
    //       (address) => address.AddressType === "Shipping"
    //     );

    //     if (shippingAddress) {
    //       return {
    //         Gstin: invoiceData.ISaleBranchID.GSTIN, // retrieved from branch master table
    //         LglNm: invoiceData.ISaleBranchID.BMCmpyGSTID.LegalName, // retrieved from company GST master table
    //         TrdNm: invoiceData.ISaleBranchID.BMCmpyGSTID.TradeName, // retrieved from company GST master table
    //         Addr1: shippingAddress.Address1, // retrieved from invoice address table
    //         Addr2: shippingAddress.Address2, // retrieved from invoice address table
    //         Loc: shippingAddress.City, // retrieved from invoice address table
    //         Pin: shippingAddress.PINCode, // retrieved from invoice address table
    //         Stcd: invoiceData.ISaleBranchID.BMStatePOSID.POSID, // retrieved from branch master to statepos to posid
    //       };
    //     }

    //     // Return null or empty object if no Shipping address is found
    //     return null;
    //   },
    //   ItemList: [
    //     {
    //       SlNo: "1",
    //       PrdDesc: "Rice",
    //       IsServc: "N",
    //       HsnCd: "1001",
    //       Barcde: "123456",
    //       Qty: 100.345,
    //       FreeQty: 10,
    //       Unit: "BAG",
    //       UnitPrice: 99.545,
    //       TotAmt: invoiceData.IAllotmentID.AllotPurchaseID.InvoiceValue, //retrived from purchase table
    //       Discount: invoiceData.IAllotmentID.AllotPurchaseID.Discount, //retrived from purchase table
    //       PreTaxVal: invoiceData.IAllotmentID.AllotPurchaseID.TaxableValue, //retrived from purchase table
    //       AssAmt: 9978.84,
    //       GstRt: 12.0,
    //       IgstAmt: invoiceData.IAllotmentID.AllotPurchaseID.IGSTAmt, //retrived from purchase table
    //       CgstAmt: invoiceData.IAllotmentID.AllotPurchaseID.CGSTAmt, //retrived from purchase table
    //       SgstAmt: invoiceData.IAllotmentID.AllotPurchaseID.SGSTAmt, //retrived from purchase table
    //       CesRt: invoiceData.IAllotmentID.AllotPurchaseID.CESSRate, //retrived from purchase table
    //       CesAmt: invoiceData.IAllotmentID.AllotPurchaseID.CESSAmt, //retrived from purchase table
    //       CesNonAdvlAmt: 10,
    //       StateCesRt: 12,
    //       StateCesAmt: 1197.46,
    //       StateCesNonAdvlAmt: 5,
    //       OthChrg: 10,
    //       TotItemVal: 12897.7,
    //       OrdLineRef: "3256",
    //       OrgCntry: "AG",
    //       PrdSlNo: "12345",
    //       BchDtls: {
    //         Nm: "123456",
    //         ExpDt: "01/08/2020",
    //         WrDt: "01/09/2020",
    //       },
    //       AttribDtls: [
    //         {
    //           Nm: "Rice",
    //           Val: "10000",
    //         },
    //       ],
    //     },
    //   ],
    //   ValDtls: {
    //     AssVal: 9978.84,
    //     CgstVal: 0,
    //     SgstVal: 0,
    //     IgstVal: 1197.46,
    //     CesVal: 508.94,
    //     StCesVal: 1202.46,
    //     Discount: 10,
    //     OthChrg: 20,
    //     RndOffAmt: 0.3,
    //     TotInvVal: 12908,
    //     TotInvValFc: 12897.7,
    //   },
    //   PayDtls: {
    //     Nm: "ABCDE",
    //     AccDet: "5697389713210",
    //     Mode: "Cash",
    //     FinInsBr: "SBIN11000",
    //     PayTerm: "100",
    //     PayInstr: "Gift",
    //     CrTrn: "test",
    //     DirDr: "test",
    //     CrDay: 100,
    //     PaidAmt: 10000,
    //     PaymtDue: 5000,
    //   },
    //   RefDtls: {
    //     InvRm: "TEST",
    //     DocPerdDtls: {
    //       InvStDt: "01/08/2020",
    //       InvEndDt: "01/09/2020",
    //     },
    //     PrecDocDtls: [
    //       {
    //         InvNo: "DOC/002",
    //         InvDt: "01/08/2020",
    //         OthRefNo: "123456",
    //       },
    //     ],
    //     ContrDtls: [
    //       {
    //         RecAdvRefr: "Doc/003",
    //         RecAdvDt: "01/08/2020",
    //         TendRefr: "Abc001",
    //         ContrRefr: "Co123",
    //         ExtRefr: "Yo456",
    //         ProjRefr: "Doc-456",
    //         PORefr: "Doc-789",
    //         PORefDt: "01/08/2020",
    //       },
    //     ],
    //   },
    //   AddlDocDtls: [
    //     {
    //       Url: "https://einv-apisandbox.nic.in",
    //       Docs: "Test Doc",
    //       Info: "Document Test",
    //     },
    //   ],
    //   ExpDtls: {
    //     ShipBNo: "A-248",
    //     ShipBDt: "01/08/2020",
    //     Port: "INABG1",
    //     RefClm: "N",
    //     ForCur: "AED",
    //     CntCode: "AE",
    //     ExpDuty: null,
    //   },
    //   EwbDtls: {
    //     TransId: "12AWGPV7107B1Z1",
    //     TransName: "XYZ EXPORTS",
    //     Distance: 100,
    //     TransDocNo: "DOC01",
    //     TransDocDt: "18/08/2020",
    //     VehNo: "ka123456",
    //     VehType: "R",
    //     TransMode: "1",
    //   },
    // };*/

    // First field set for IRN RegRev
    if (invoiceData.BillType == "Regular") {
      irnJson.TranDtls.SupTyp = "B2B";
    } else if (invoiceData.BillType == "SEZ") {
      irnJson.TranDtls.SupTyp = "SEZWP";
    } else if (invoiceData.BillType == "Without SEZ") {
      irnJson.TranDtls.SupTyp = "SEZWOP";
    }

    if (invoiceData.RCM == "Yes") {
      irnJson.TranDtls.RegRev = "Y";
    } else {
      irnJson.TranDtls.RegRev = "N";
    }
    irnJson.DocDtls.No = invoiceData.InvoiceNo;
    // Create a new Date object from the InvoiceDate field
    const invoiceDate = new Date(invoiceData.InvoiceDate);

    // Use Intl.DateTimeFormat to format the date as dd/mm/yyyy
    const formatter = new Intl.DateTimeFormat("en-GB"); // 'en-GB' gives you dd/mm/yyyy format
    const formattedDate = formatter.format(invoiceDate);
    irnJson.DocDtls.Dt = formattedDate;

    // Initialize separate objects for Billing and Shipping
    let billingAddress = {};
    let shippingAddress = {};

    // Check if InvoiceAddresses exists
    if (
      invoiceData?.InvoiceAddresses &&
      Array.isArray(invoiceData.InvoiceAddresses)
    ) {
      // Loop through the addresses and find Billing and Shipping addresses
      invoiceData.InvoiceAddresses.forEach((address) => {
        if (address.AddressType === "Billing") {
          billingAddress = address;
        }
        if (address.AddressType === "Shipping") {
          shippingAddress = address;
        }
      });
    }
    // Now you have separate objects for Billing and Shipping addresses
    console.log("Billing Address: ", billingAddress);
    console.log("Shipping Address: ", shippingAddress);

    let sellerDetails = {};
    let buyerBillDetails = {};
    let buyerShipDetails = {};

    if (invoiceData && invoiceData?.ISaleBranchID?.GSTIN) {
      sellerDetails = await GSTVerificationFunc(
        invoiceData?.ISaleBranchID?.GSTIN
      );
    }

    if (billingAddress && billingAddress?.GSTNo) {
      buyerBillDetails = await GSTVerificationFunc(billingAddress?.GSTNo);
    }
    if (shippingAddress && shippingAddress?.GSTNo) {
      buyerShipDetails = await GSTVerificationFunc(shippingAddress?.GSTNo);
    }

    // // Seller Details
    irnJson.SellerDtls.Gstin = sellerDetails.Data.Gstin;
    irnJson.SellerDtls.LglNm = sellerDetails.Data.LegalName;
    irnJson.SellerDtls.TrdNm = sellerDetails.Data.TradeName;
    irnJson.SellerDtls.Addr1 = `${sellerDetails.Data.AddrBno}, ${sellerDetails.Data.AddrSt}`;
    irnJson.SellerDtls.Addr2 = sellerDetails.Data.Addr2;
    irnJson.SellerDtls.Loc = sellerDetails.Data.AddrLoc;
    irnJson.SellerDtls.Pin = sellerDetails.Data.AddrPncd;
    irnJson.SellerDtls.Stcd = `${sellerDetails.Data.StateCode}`;

    // // Buyer Details
    irnJson.BuyerDtls.Gstin = buyerBillDetails.Data.Gstin;
    irnJson.BuyerDtls.LglNm = buyerBillDetails.Data.LegalName;
    irnJson.BuyerDtls.TrdNm = buyerBillDetails.Data.TradeName;
    irnJson.BuyerDtls.Pos = `${buyerBillDetails.Data.StateCode}`;
    irnJson.BuyerDtls.Addr1 = `${buyerBillDetails.Data.AddrBno}, ${buyerBillDetails.Data.AddrSt}`;
    irnJson.BuyerDtls.Addr2 = buyerBillDetails.Data.Addr2;
    irnJson.BuyerDtls.Loc = buyerBillDetails.Data.AddrLoc;
    irnJson.BuyerDtls.Pin = buyerBillDetails.Data.AddrPncd;
    irnJson.BuyerDtls.Stcd = `${buyerBillDetails.Data.StateCode}`;

    //     // Dispatch Details
    irnJson.DispDtls.Nm = sellerDetails.Data.LegalName;
    irnJson.DispDtls.Addr1 = invoiceData?.ISaleBranchID?.Address;
    irnJson.DispDtls.Addr2 = invoiceData?.ISaleBranchID?.District;
    irnJson.DispDtls.Loc = invoiceData?.ISaleBranchID?.District;
    irnJson.DispDtls.Pin = parseInt(invoiceData?.ISaleBranchID?.PINCode, 10);
    console.log("@@@@@@@@@@", invoiceData?.ISaleBranchID?.BMStatePOSID?.POSID);
    // const posID = await StatePOS.findOne({where:{StatePOSID: invoiceData?.ISaleBranchID}})
    irnJson.DispDtls.Stcd = `${invoiceData?.ISaleBranchID?.BMStatePOSID?.POSID}`;

    // // Shipment Details
    irnJson.ShipDtls.Gstin = buyerShipDetails.Data.Gstin;
    irnJson.ShipDtls.LglNm = buyerShipDetails.Data.LegalName;
    irnJson.ShipDtls.TrdNm = buyerShipDetails.Data.TradeName;
    irnJson.ShipDtls.Addr1 = `${buyerShipDetails.Data.AddrBno}, ${buyerShipDetails.Data.AddrSt}`;
    irnJson.ShipDtls.Addr2 = buyerShipDetails.Data.Addr2;
    irnJson.ShipDtls.Loc = buyerShipDetails.Data.AddrLoc;
    irnJson.ShipDtls.Pin = buyerShipDetails.Data.AddrPncd;
    irnJson.ShipDtls.Stcd = `${buyerShipDetails.Data.StateCode}`;

    const bookingData = await NewCarBookings.findOne({
      where: { BookingID: invoiceData.TransactionID },
    });
    //     // Car Details
    irnJson.ItemList[0].SlNo = "1";
    irnJson.ItemList[0].PrdDesc = `${bookingData?.ModelName}, ${bookingData.VariantName}`;
    // irnJson.ItemList[0].IsServc = invoiceData.IsServc;
    console.log(
      "!!!!!!!!!!!!!!",
      invoiceData?.InvoiceProductInfo[0]?.IPIMasterProdID?.HSNValue
    );
    const hsnCode = await MasterProducts.findOne({
      where: { MasterProdID: invoiceData?.InvoiceProductInfo[0]?.ProductID },
    });
    console.log("##########", hsnCode);
    irnJson.ItemList[0].HsnCd = `${hsnCode?.HSNValue}` || "";
    irnJson.ItemList[0].Qty = 1;
    irnJson.ItemList[0].Unit = "NOS";
    irnJson.ItemList[0].UnitPrice =
      invoiceData?.InvoiceProductInfo[0]?.ProductCost;
    irnJson.ItemList[0].TotAmt =
      invoiceData?.InvoiceProductInfo[0]?.ProductCost;
    irnJson.ItemList[0].Discount = invoiceData?.DiscountValue;
    // irnJson.ItemList[0].PreTaxVal = invoiceData.TaxableValue;
    irnJson.ItemList[0].AssAmt =
      invoiceData?.InvoiceProductInfo[0]?.TaxableValue;
    irnJson.ItemList[0].GstRt = invoiceData?.InvoiceProductInfo[0]?.GSTRate;
    irnJson.ItemList[0].IgstAmt = invoiceData?.InvoiceProductInfo[0]?.IGSTValue;
    irnJson.ItemList[0].CgstAmt = invoiceData?.InvoiceProductInfo[0]?.CGSTValue;
    irnJson.ItemList[0].SgstAmt = invoiceData?.InvoiceProductInfo[0]?.SGSTValue;
    irnJson.ItemList[0].CesRt = invoiceData?.InvoiceProductInfo[0]?.CESSRate;
    irnJson.ItemList[0].CesAmt = invoiceData?.InvoiceProductInfo[0]?.CESSValue;
    irnJson.ItemList[0].OthChrg = invoiceData.TCSValue;
    // Calculate the value
    // const totalvalue =
    //   irnJson.ItemList[0].AssAmt +
    //   irnJson.ItemList[0].IgstAmt +
    //   irnJson.ItemList[0].CgstAmt +
    //   irnJson.ItemList[0].SgstAmt +
    //   irnJson.ItemList[0].CesAmt +
    //   irnJson.ItemList[0].OthChrg;

    // irnJson.ItemList[0].TotItemVal = totalvalue;

    // // invoiceData.InvoiceAmt;

    // //     // Values Total Details
    // irnJson.ValDtls.AssVal = invoiceData?.InvoiceProductInfo[0]?.TaxableValue;
    // irnJson.ValDtls.CgstVal = irnJson.ItemList[0].CgstAmt;
    // irnJson.ValDtls.SgstVal = irnJson.ItemList[0].SgstAmt;
    // irnJson.ValDtls.IgstVal = irnJson.ItemList[0].IgstAmt;
    // irnJson.ValDtls.CesVal = irnJson.ItemList[0].CesAmt;
    // irnJson.ValDtls.StCesVal = 0;
    // irnJson.ValDtls.Discount = irnJson.ItemList[0].Discount;
    // irnJson.ValDtls.OthChrg = invoiceData.TCSValue;

    // // Calculate total invoice value before rounding
    // const totalvalue2 =
    //   irnJson.ValDtls.AssVal +
    //   irnJson.ValDtls.CgstVal +
    //   irnJson.ValDtls.SgstVal +
    //   irnJson.ValDtls.IgstVal +
    //   irnJson.ValDtls.CesVal -
    //   irnJson.ValDtls.Discount +
    //   irnJson.ValDtls.OthChrg;

    // // Call the roundOff function
    // let result1 = roundOff(totalvalue2);
    // // Parse the difference (rounding adjustment) to an integer
    // const parsedDifference = parseFloat(result1.difference.toFixed(2));
    // // Assign rounded values to `irnJson`
    // irnJson.ValDtls.RndOffAmt = parsedDifference; // Rounding adjustment
    // irnJson.ValDtls.TotInvVal = parseFloat(
    //   (totalvalue - irnJson.ValDtls.RndOffAmt).toFixed(2)
    // );
    // irnJson.ValDtls.RndOffAmt; // Final invoice value in foreign currency (if applicable); // Rounded total value
    // irnJson.ValDtls.TotInvValFc = result1.roundedValue; // Final invoice value in foreign currency (if applicable)

    const totalValue =
      irnJson.ItemList[0].AssAmt +
      irnJson.ItemList[0].IgstAmt +
      irnJson.ItemList[0].CgstAmt +
      irnJson.ItemList[0].SgstAmt +
      irnJson.ItemList[0].CesAmt +
      irnJson.ItemList[0].OthChrg;

    irnJson.ItemList[0].TotItemVal = invoiceData?.InvoiceAmt;

    irnJson.ValDtls.AssVal = irnJson.ItemList[0].AssAmt;
    irnJson.ValDtls.CgstVal = irnJson.ItemList[0].CgstAmt;
    irnJson.ValDtls.SgstVal = irnJson.ItemList[0].SgstAmt;
    irnJson.ValDtls.IgstVal = irnJson.ItemList[0].IgstAmt;
    irnJson.ValDtls.CesVal = irnJson.ItemList[0].CesAmt;
    irnJson.ValDtls.StCesVal = 0;
    irnJson.ValDtls.Discount = 0;
    irnJson.ValDtls.OthChrg = 0;

    const totalInvoiceValue =
      irnJson.ValDtls.AssVal +
      irnJson.ValDtls.CgstVal +
      irnJson.ValDtls.SgstVal +
      irnJson.ValDtls.IgstVal +
      irnJson.ValDtls.CesVal -
      irnJson.ValDtls.Discount +
      irnJson.ValDtls.OthChrg;

    irnJson.ValDtls.RndOffAmt = parseFloat(
      (
        Math.round(irnJson.ItemList[0].TotItemVal) -
        irnJson.ItemList[0].TotItemVal
      ).toFixed(2)
    );
    irnJson.ValDtls.TotInvVal =
      parseFloat(irnJson.ItemList[0].TotItemVal.toFixed(2)) +
      irnJson.ValDtls.RndOffAmt;

    // console.log("IRN JSON Data:", irnJson);

    console.log("IRN JSON Data: ", irnJson);

    const irnResponseData = await generateIRN(irnJson);
    console.log("IRN Response Details: ", irnResponseData);

    if (irnResponseData.Status == 1) {
      return res.status(200).json(irnResponseData);
    } else {
      return res.json(irnResponseData);
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

function roundOff(value) {
  let intPart = Math.floor(value); // Integer part
  let lastTwoDigits = intPart % 100; // Last two digits
  let decimalPart = value - intPart; // Decimal part
  let difference = 0;

  if (lastTwoDigits < 50) {
    difference = -(lastTwoDigits + decimalPart); // Round down
    value = intPart - lastTwoDigits;
  } else {
    difference = 100 - lastTwoDigits + decimalPart; // Round up
    value = intPart - lastTwoDigits + 100;
  }

  // Return numerical difference (not a string)
  return {
    roundedValue: value,
    difference: parseFloat(difference.toFixed(1)), // Convert back to a number
  };
}

// // Test cases
// let result1 = roundOff(1721130.9);
// console.log(`Rounded Value: ${result1.roundedValue}, Difference: ${result1.difference}`);  // Should print 1721100, Difference: 30.9

// let result2 = roundOff(1721150.9);
// console.log(`Rounded Value: ${result2.roundedValue}, Difference: ${result2.difference}`);  // Should print 1721200, Difference: 49.1
