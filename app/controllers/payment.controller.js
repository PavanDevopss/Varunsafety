/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const db = require("../models");
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;
const payment = db.PaymentRequests;
const receipt = db.CustReceipt;
const BranchMaster = db.branchmaster;
const empolyeemapdata = db.CustEmpMaping;
const customer = db.customermaster;
const userdata = db.usermaster;
const bookingdata = db.NewCarBookings;
const ModelMaster = db.modelmaster;
const ColourMaster = db.colourmaster;
const VariantMaster = db.variantmaster;
const PaymentReference = db.paymentRef;
const ChequeTracking = db.chequetracking;
const FinanceDocuments = db.financedocuments;
const FuelType = db.fueltypes;
const Transmission = db.transmission;
const fs = require("fs");
const path = require("path");
const {
  generateBookingNo,
  genChequeName,
  genRequestNo,
  generateReceiptNo,
} = require("../Utils/generateService");
const { configureMulter } = require("../Utils/multerService");
const { transferImageToServer } = require("../Utils/sshService");

// //Retrieve all booking list from the database
// exports.findAll = async (req, res) => {
//   try {
//     const data = await NewCarBooking.findAll({});

//     // Check if data is empty
//     if (!data || data.length === 0) {
//       return res.status(404).send({ message: "No NewCarBookings data found." });
//     }

//     // Send the data
//     res.send(data);
//   } catch (err) {
//     // Handle errors
//     console.error("Error retrieving NewCarBookings:", err);

//     // Check if it's a database error
//     if (err instanceof DatabaseError) {
//       res.status(500).send({
//         message: "Database error occurred while retrieving NewCarBookings.",
//         error: err.message,
//       });
//     } else {
//       // For other errors
//       res.status(500).send({
//         message: "Some error occurred while retrieving NewCarBookings.",
//         error: err.message,
//       });
//     }
//   }
// };

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

// Save booking details in the database

// Configure Multer
const upload = configureMulter(
  // "C:/Users/varun/OneDrive/Desktop/uploads/", // Adjust the upload path as needed
  "/home/administrator/VARUNGROUP/IMAGES_VMS_MARUTI",
  1000000, // File size limit (1MB)
  ["jpeg", "jpg", "png", "gif"], // Allowed file types
  "ImgURL"
);

const upload1 = configureMulter(
  // "C:/Users/varun/OneDrive/Desktop/uploads/", // Adjust the upload path as needed
  "/home/administrator/VARUNGROUP/IMAGES_VMS_MARUTI",
  1000000, // File size limit (1MB)
  ["jpeg", "jpg", "png", "gif"], // Allowed file types
  "DocURL"
);

exports.create = async (req, res) => {
  const t = await Seq.transaction(); // Start a transaction

  try {
    await upload(req, res, async (err) => {
      if (err) {
        console.error("Error uploading file:", err);
        await t.rollback(); // Rollback transaction in case of error
        return res.status(400).json({ message: err.message });
      }

      const branchid = req.body.FromBranch;
      const branchCode = await BranchMaster.findOne({
        attributes: ["BranchCode"],
        where: { BranchID: branchid },
        transaction: t, // Add transaction here
      });

      const BookingNo = await generateBookingNo(branchCode.BranchCode);
      console.log("?????????????", BookingNo);

      console.log("data from branch master: ", branchCode);
      console.log("Branch Code: ", branchCode.BranchCode);

      const requestID = await genRequestNo();
      console.log("generated request number:", requestID);

      if (!req.body.TransactionID) {
        return res
          .status(400)
          .json({ message: "TransactionID cannot be empty" });
      }

      const CreatePayment = {
        RequestID: requestID || req.body.RequestID,
        CustomerID: req.body.CustomerID,
        TransactionID: req.body.TransactionID,
        FinanceLoanID: req.body.FinanceLoanID || null,
        RefTypeID: req.body.RefTypeID,
        RequestDate: req.body.RequestDate,
        PaymentPurpose: req.body.PaymentPurpose,
        PaymentMode: req.body.PaymentMode,
        Amount: req.body.Amount,
        UTRNo: req.body.UTRNo || null,
        InstrumentNo: req.body.InstrumentNo,
        InstrumentDate: req.body.InstrumentDate,
        BankName: req.body.BankName,
        BranchName: req.body.BranchName,
        BankCharges: req.body.BankCharges,
        CollectionBranchID: req.body.CollectionBranchID,
        RequestStatus: req.body.RequestStatus,
        RequestBy: req.body.RequestBy,
      };

      const paymentdata = await payment.create(CreatePayment, {
        transaction: t,
      });

      const Receiptdata = {
        BranchID: req.body.FromBranch,
        RequestID: paymentdata.ID,
        PaymentPurpose: req.body.PaymentPurpose,
        PaymentMode: req.body.PaymentMode,
        Amount: req.body.Amount,
        InstrumentNo: req.body.InstrumentNo,
        InstrumentDate: req.body.InstrumentDate,
        BankID: req.body.BankID,
        BranchName: req.body.BranchName,
        BankCharges: req.body.BankCharges,
        ImgURL: req.body.ImgURL,
        OnlineTransID: req.body.OnlineTransID,
        OnlineTransPartner: req.body.OnlineTransPartner,
        CustID: req.body.CustID,
        AuthorisedBy: req.body.AuthorisedBy,
      };

      const receipts = await receipt.create(Receiptdata, { transaction: t });

      if (paymentdata.PaymentMode === "Cheque") {
        if (req.file) {
          console.log("Cheque image uploaded:", req.file.path);
        } else {
          await t.rollback(); // Rollback transaction if cheque image is required but not provided
          return res.status(400).json({ message: "Cheque image is required" });
        }

        const localFilePath = req.file.path;
        const remoteFilePath =
          process.env.Cheque_Documents_PATH +
          genChequeName(req.file, receipts.ReceiptID, receipts.InstrumentNo);

        console.log("!!!!!!!!!!!!!!!!!:", remoteFilePath);

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

        receipts.ImgURL = remoteFilePath;
        console.log("cheque IMG url: ", receipts.ImgURL);
        await receipts.save({ transaction: t });

        const ChqTrackdata = {
          ReceiptID: receipts.ReceiptID,
          CustomerID: req.body.CustomerID,
          PaymentID: paymentdata.ID,
          CurrentStage: "Cheque Uploaded",
          StageDate: new Date(),
          IsActive: true,
          Status: "Pending",
        };

        await ChequeTracking.create(ChqTrackdata, { transaction: t });
        console.log("cheque track data: ", ChqTrackdata);
      }

      const updateBookingNo = await bookingdata.update(
        {
          BookingNo: BookingNo,
          BookingStatus: "Active",
          ModifiedDate: new Date(),
        },
        { where: { BookingID: req.body.TransactionID }, transaction: t }
      );

      await t.commit(); // Commit the transaction
      res.status(200).json({
        message: "Created Successfully",
        receipts,
        paymentdata,
        updateBookingNo,
      });
    });
  } catch (err) {
    console.error("Error creating paymentdata:", err);
    await t.rollback(); // Rollback transaction on error
    res.status(500).send({
      message:
        err.message || "Some error occurred while creating the paymentdata.",
    });
  } finally {
    // Clean up temporary file after processing
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
        console.log("Temporary file deleted successfully.");
      } catch (cleanupErr) {
        console.error("Error deleting temporary file:", cleanupErr);
      }
    }
  }
};

// Utility function to return null if value is undefined or null
const coalesce = (value) => {
  return value === undefined ||
    value === null ||
    value === "undefined" ||
    value === ""
    ? null
    : value;
};

exports.AddPaymentForWeb = async (req, res) => {
  const transaction = await Seq.transaction(); // Start a transaction

  try {
    await new Promise((resolve, reject) => {
      upload1(req, res, (err) => {
        if (err) {
          console.error("Error uploading file:", err);
          reject(err); // Reject the promise to handle error
        } else {
          resolve(); // Resolve the promise to continue
        }
      });
    });

    const branchid = coalesce(req.body.FromBranch);
    if (!branchid) {
      await transaction.rollback(); // Rollback if branch ID is not provided
      return res.status(400).json({ message: "Branch ID is required" });
    }

    const branchCode = await BranchMaster.findOne({
      attributes: ["BranchCode"],
      where: { BranchID: branchid },
      transaction, // Pass transaction
    });

    if (!branchCode) {
      await transaction.rollback(); // Rollback if branch code not found
      return res.status(404).json({ message: "Branch not found" });
    }

    const BookingNo = await generateBookingNo(branchCode.BranchCode);
    console.log("Generated Booking Number:", BookingNo);
    let receiptNo = null;
    if (req.body.Type !== "Finance") {
      receiptNo = await generateReceiptNo(branchCode.BranchCode);
      console.log("Generated Receipt Number:", receiptNo);
    }

    const requestID = await genRequestNo();
    console.log("Generated Request Number:", requestID);

    const CreatePayment = {
      RequestID: coalesce(req.body.RequestID) || requestID || null,
      CustomerID: coalesce(req.body.CustomerID),
      TransactionID: coalesce(req.body.TransactionID),
      FinanceLoanID: coalesce(req.body.FinanceLoanID),
      RefTypeID: coalesce(req.body.RefTypeID),
      RequestDate: coalesce(req.body.RequestDate) || new Date(),
      PaymentPurpose: coalesce(req.body.PaymentPurpose),
      PaymentMode: coalesce(req.body.PaymentMode),
      Amount: coalesce(req.body.Amount),
      UTRNo: coalesce(req.body.UTRNo) || null,
      InstrumentNo: coalesce(req.body.InstrumentNo),
      InstrumentDate: coalesce(req.body.InstrumentDate) || new Date(),
      BankName: coalesce(req.body.BankName),
      BranchName: coalesce(req.body.BranchName),
      BankCharges: coalesce(req.body.BankCharges),
      CollectionBranchID: coalesce(req.body.CollectionBranchID),
      RequestStatus:
        coalesce(req.body.RequestStatus) === "Accepted"
          ? "Accepted"
          : "Pending",
      RequestBy: coalesce(req.body.RequestBy),
      Remarks: coalesce(req.body.Remarks),
    };
    console.log("CreatePayment:", CreatePayment);

    const paymentdata = await payment.create(CreatePayment, { transaction });

    const Receiptdata = {
      ReceiptNo: receiptNo || null,
      ReceiptDate: coalesce(req.body.ReceiptDate) || new Date(),
      BranchID: branchid,
      RequestID: paymentdata.ID,
      PaymentPurpose: coalesce(req.body.PaymentPurpose),
      PaymentMode: coalesce(req.body.PaymentMode),
      Amount: coalesce(req.body.Amount),
      InstrumentNo: coalesce(req.body.InstrumentNo),
      InstrumentDate: coalesce(req.body.InstrumentDate),
      BankID: coalesce(req.body.BankID),
      BankBranch: coalesce(req.body.BranchName),
      BankCharges: coalesce(req.body.BankCharges),
      ImgURL: coalesce(req.body.ImgURL),
      OnlineTransID: coalesce(req.body.OnlineTransID),
      OnlineTransPartner: coalesce(req.body.OnlineTransPartner),
      CustID: coalesce(req.body.CustID),
      AuthorisedBy: coalesce(req.body.AuthorisedBy),
      ReceiptStatus:
        coalesce(req.body.RequestStatus) === "Accepted"
          ? "Accepted"
          : "Pending",
    };

    console.log("Receiptdata:", Receiptdata);
    const receipts = await receipt.create(Receiptdata, { transaction });

    // Uncomment and use cheque-related logic if necessary

    if (req.body.Type === "Finance" && receipts.PaymentMode === "Cheque") {
      if (req.file) {
        console.log("Cheque image uploaded:", req.file.path);
      } else {
        await transaction.rollback(); // Rollback transaction if cheque image is missing
        return res.status(400).json({ message: "Cheque image is required" });
      }

      const localFilePath = req.file.path;
      const remoteFilePath =
        process.env.Finance_Documents_PATH +
        genChequeName(req.file, receipts.ReceiptID, receipts.InstrumentNo);

      console.log("Remote File Path:", remoteFilePath);

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

      receipts.ImgURL = remoteFilePath;
      console.log("Cheque Image URL:", receipts.ImgURL);
      await receipts.save({ transaction });

      const finDocdata = {
        CustomerID: req.body.FinCustomerID,
        CustomerType: req.body.CustomerType,
        DocTypeID: req.body.DocTypeID,
        FinanceLoanID: coalesce(req.body.FinanceLoanID),
        DocURL: remoteFilePath,
        Remarks: req.body.Remarks || null,
        DocStatus: "Approved",
        IsActive: req.body.isActive !== undefined ? req.body.isActive : true,
        Status: req.body.isActive === undefined ? "Active" : "InActive",
      };

      const DocData = await FinanceDocuments.create(finDocdata, {
        transaction,
      });
      console.log("Finance Document Data:", DocData);
    } else {
      console.log(
        "No cheque image upload required. (Either Type is not 'Finance' or PaymentMode is not 'Cheque')."
      );
    }

    // Fetch the current booking data to check existing BookingNo
    const currentBooking = await bookingdata.findOne({
      attributes: ["BookingNo"],
      where: { BookingID: coalesce(req.body.TransactionID) },
      transaction,
    });

    // Determine the new BookingNo value
    const newBookingNo =
      currentBooking.BookingNo === null ? BookingNo : currentBooking.BookingNo;

    const updateBookingNo = await bookingdata.update(
      {
        BookingNo: newBookingNo,
        BookingStatus: "Active",
        ModifiedDate: new Date(),
      },
      { where: { BookingID: coalesce(req.body.TransactionID) }, transaction }
    );

    await transaction.commit(); // Commit transaction if all operations succeed

    res.status(200).json({
      message: "Created Successfully",
      receipts,
      // chqTrackData,
      paymentdata,
      updateBookingNo,
    });
  } catch (err) {
    console.error("Error creating paymentdata:", err);
    await transaction.rollback(); // Rollback transaction on error
    res.status(500).send({
      message:
        err.message || "Some error occurred while creating the paymentdata.",
    });
  } finally {
    // Clean up temporary file after processing
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
        console.log("Temporary file deleted successfully.");
      } catch (cleanupErr) {
        console.error("Error deleting temporary file:", cleanupErr);
      }
    }
  }
};

exports.findAll = async (req, res) => {
  const { EmpID } = req.query;

  try {
    // Step 1: Retrieve employee data based on EMPID
    const empData = await empolyeemapdata.findAll({ where: { EmpID } });

    if (!empData || empData.length === 0) {
      return res.status(404).send({
        message: "Employee Data Not Found for EmpID",
      });
    }

    // Extract customer IDs from employee data
    const customerIDs = empData.map((item) => item.CustomerID);

    // Step 2: Retrieve payments data based on customer IDs
    const payments = await payment.findAll({
      where: {
        CustomerID: {
          [Op.in]: customerIDs,
        },
      },
      include: [
        {
          model: BranchMaster,
          as: "PRqBranchID",
          attributes: ["BranchID", "BranchCode", "BranchName"],
        },
        {
          model: PaymentReference,
          as: "PRqRefTypeID",
          attributes: ["ID", "PaymentRefName"],
        },
        {
          model: userdata,
          as: "PRqUserID",
          attributes: ["UserID", "EmpID", "UserName"],
        },
      ],
    });

    if (!payments || payments.length === 0) {
      return res.status(404).send({
        message: "No payments found for the provided EMPID",
      });
    }

    // Step 3: Map and flatten the data to remove nested structures
    // Step 3: Map and flatten the data to remove nested structures
    const flattenedPayments = payments.map((payment) => ({
      ID: payment.ID,
      RequestID: payment.RequestID,
      CustomerID: payment.CustomerID,
      TransactionID: payment.TransactionID,
      RefTypeID: payment.RefTypeID,
      RequestDate: payment.RequestDate,
      PaymentPurpose: payment.PaymentPurpose,
      PaymentMode: payment.PaymentMode,
      Amount: payment.Amount,
      InstrumentNo: payment.InstrumentNo,
      InstrumentDate: payment.InstrumentDate,
      BankName: payment.BankName,
      BranchName: payment.BranchName,
      BankCharges: payment.BankCharges,
      CollectionBranchID: payment.CollectionBranchID,
      RequestStatus: payment.RequestStatus,
      RequestBy: payment.RequestBy,
      CreatedDate: payment.CreatedDate,
      ModifiedDate: payment.ModifiedDate,
      // Flatten nested objects
      BranchID: payment.PRqBranchID ? payment.PRqBranchID.BranchID : null,
      BranchCode: payment.PRqBranchID ? payment.PRqBranchID.BranchCode : null,
      UserBranchName: payment.PRqBranchID
        ? payment.PRqBranchID.BranchName
        : null,
      PaymentRefTypeID: payment.PRqRefTypeID ? payment.PRqRefTypeID.ID : null,
      PaymentRefName: payment.PRqRefTypeID
        ? payment.PRqRefTypeID.PaymentRefName
        : null,
      UserID: payment.PRqUserID ? payment.PRqUserID.UserID : null,
      EmpID: payment.PRqUserID ? payment.PRqUserID.EmpID : null,
      UserName: payment.PRqUserID ? payment.PRqUserID.UserName : null,
    }));

    // Step 4: Send the flattened data as response
    res.send(flattenedPayments);
  } catch (err) {
    console.error("Error retrieving payments:", err);

    // Handle Sequelize DatabaseError
    if (err instanceof sequelize.DatabaseError) {
      return res.status(500).send({
        message: "Database error occurred while retrieving payments.",
        error: err.message,
      });
    }

    // For other errors
    res.status(500).send({
      message: "Some error occurred while retrieving payments.",
      error: err.message,
    });
  }
};

exports.GetPaymentByCustomerID = async (req, res) => {
  const { TransactionID } = req.query;
  console.log(req.query);

  try {
    // Find payments by TransacationID
    const payments = await payment.findAll({ where: { TransactionID } });

    // Check if payments exist
    if (!payments || payments.length === 0) {
      return res.status(404).send({ message: "No Customer found." });
    }

    // Send the data
    res.send(payments);
  } catch (err) {
    // Handle errors
    console.error("Error retrieving NewCarBookings:", err);

    // For other errors
    res.status(500).send({
      message: "Some error occurred while retrieving NewCarBookings.",
      error: err.message,
    });
  }
};

// // Update a new car booking by the id in the request
// exports.update = async (req, res) => {
//   const bookingID = req.params.id;
//   const updatedData = req.body;

//   if (!updatedData || Object.keys(updatedData).length === 0) {
//     return res.status(400).send({ message: "Updated data cannot be empty." });
//   }

//   try {
//     const [numAffectedRows] = await NewCarBooking.update(updatedData, {
//       where: { BookingID: bookingID },
//     });

//     if (numAffectedRows === 1) {
//       res.send({ message: "NewCarBookings was updated successfully." });
//     } else {
//       res.status(404).send({
//         message: `Cannot update NewCarBookings with id=${bookingID}. NewCarBookings not found.`,
//       });
//     }
//   } catch (err) {
//     console.error("Error updating NewCarBookings:", err);
//     res
//       .status(500)
//       .send({ message: `Error updating NewCarBookings with id=${bookingID}.` });
//   }
// };

// // Delete a booking with the specified id in the request
// exports.delete = async (req, res) => {
//   const bookingID = req.params.id;

//   try {
//     // Perform deletion operation
//     const numAffectedRows = await NewCarBooking.destroy({
//       where: { BookingID: bookingID },
//     });

//     // Check if any rows were affected
//     if (numAffectedRows === 1) {
//       // If one row was affected, send success message
//       res.send({ message: "NewCarBookings was deleted successfully!" });
//     } else {
//       // If no rows were affected, send 404 response with appropriate message
//       res.status(404).send({
//         message: `Cannot delete NewCarBookings with id=${bookingID}. NewCarBookings not found.`,
//       });
//     }
//   } catch (err) {
//     // Handle database errors
//     console.error("Error deleting NewCarBookings:", err);
//     res.status(500).send({
//       message: `Could not delete NewCarBookings with id=${bookingID}. ${err.message}`,
//     });
//   }
// };

// exports.AcceptedPaymentList = async (req, res) => {
//   const { EMPID } = req.query;
//   const condition = {
//     RequestStatus: "Accepted",
//   };

//   console.log("Condition:", condition);
//   try {
//     // Find employee data using EMPID
//     const empdata = await empolyeemapdata.findOne({ where: { EMPID } });
//     if (!empdata || !empdata.CustomerID) {
//       return res.status(404).send({ message: "CustomerId Not Found" });
//     }
//     const customerid = empdata.CustomerID;
//     payment.customerid = empdata.CustomerID;
//     const data = await payment.findAll({ where: condition && customerid });

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

// exports.AcceptedPaymentList = async (req, res) => {
//   const { EMPID } = req.query;
//   const condition = {
//     RequestStatus: "Accepted",
//   };

//   // Find employee data using EMPID
//   const empdata = await empolyeemapdata.findOne({ where: { EMPID: EMPID } });

//   // Check if employee data with given EMPID exists
//   if (!empdata || !empdata.CustomerID) {
//     return res.status(404).send({ message: "Customer ID Not Found" });
//   }

//   const customerid = empdata.CustomerID;

//   try {
//     // Fetch payments based on conditions
//     const data = await payment.findAll({ where: condition, customerid });

//     // Check if data is empty
//     if (!data || data.length === 0) {
//       return res.status(404).send({
//         message: "No data found",
//       });
//     }

//     // Send the data
//     res.json(data);
//   } catch (error) {
//     console.error("Error in AcceptedPaymentList:", error);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };
// exports.AcceptedPaymentList = async (req, res) => {
//   const { EMPID } = req.query;
//   // Validate EMPID input
//   if (!EMPID) {
//     return res.status(400).send({ message: "EMPID is required" });
//   }
//   try {
//     // Find employee data using EMPID
//     const empdata = await empolyeemapdata.findOne({ where: { EMPID: EMPID } });
//     // Check if employee data with given EMPID exists
//     if (!empdata || !empdata.CustomerID) {
//       return res.status(404).send({ message: "employee ID Not Found" });
//     }
//     const employeedata = await userdata.findOne({ where: { EmpID: EMPID } });
//     if (!employeedata || employeedata.length === 0) {
//       return res.status(404).send({ message: "No data found" });
//     }
//     const customerid = empdata.CustomerID;
//     const Bookingdata = await bookingdata.findAll({
//       where: { CustomerID: customerid },
//     });
//     if (!Bookingdata || Bookingdata.length === 0) {
//       return res.status(404).send({ message: "Booking No data found" });
//     }
//     const customerdata = await customer.findAll({
//       where: { CustomerID: customerid },
//     });
//     if (!customerdata || customerdata.length === 0) {
//       return res.status(404).send({ message: "customer data found" });
//     }
//     // Fetch payments based on conditions
//     const data = await payment.findAll({
//       where: {
//         RequestStatus: "Accepted",
//         CustomerID: customerid, // Make sure this field name matches your database schema
//       },
//     });
//     // Check if data is empty
//     if (!data || data.length === 0) {
//       return res.status(404).send({ message: "payment data found" });
//     }
//     // Send the data
//     return res.status(200).json({
//       message: "successfully",
//       employeedata,
//       customerdata,
//       data,
//       Bookingdata,
//     });
//   } catch (error) {
//     console.error("Error in AcceptedPaymentList:", error);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };
// exports.AcceptedPaymentList = async (req, res) => {
//   const { EMPID } = req.query;
//   // Validate EMPID input
//   if (!EMPID) {
//     return res.status(400).send({ message: "EMPID is required" });
//   }
//   try {
//     // Find employee data using EMPID
//     const empdata = await empolyeemapdata.findOne({ where: { EMPID: EMPID } });
//     // Check if employee data with given EMPID exists
//     if (!empdata || !empdata.CustomerID) {
//       return res.status(404).send({ message: "Employee ID Not Found" });
//     }
//     const employeedata = await userdata.findOne({ where: { EmpID: EMPID } });
//     if (!employeedata) {
//       return res.status(404).send({ message: "No employee data found" });
//     }
//     const customerid = empdata.CustomerID;

//     // Fetch Booking data
//     const Bookingdata = await bookingdata.findAll({
//       where: { CustomerID: customerid },
//     });
//     if (!Bookingdata || Bookingdata.length === 0) {
//       return res.status(404).send({ message: "Booking data not found" });
//     }

//     // Fetch Customer data
//     const customerdata = await customer.findAll({
//       where: { CustomerID: customerid },
//     });
//     if (!customerdata || customerdata.length === 0) {
//       return res.status(404).send({ message: "Customer data not found" });
//     }

//     // Fetch Payment data
//     const paymentdata = await payment.findAll({
//       where: {
//         RequestStatus: "Accepted",
//         CustomerID: customerid,
//       },
//     });
//     if (!paymentdata || paymentdata.length === 0) {
//       return res.status(404).send({ message: "Payment data not found" });
//     }

//     // Map the required fields for response formatting
//     const formattedData = {
//       message: "successfully",
//       employeedata: {
//         location: employeedata.City,
//         Branch: employeedata.Branch,
//         Executive: employeedata.UserName,
//       },
//       customerdata: customerdata.map((item) => ({
//         CustomerName: item.FirstName,
//         ContactNo: item.PhoneNo,
//         lastname: item.LastName,
//         Email: item.Email,
//         Occupation: item.Occupation,
//         CustAddress: item.Address,
//         model: item.ModelName,
//         variant: item.VariantName,
//         Location: item.District,
//       })),
//       paymentdata: paymentdata.map((item) => ({
//         RequestID: item.RequestID,
//         status: item.RequestStatus,
//         paymentmode: item.PaymentMode,
//         PaymentType: item.PaymentPurpose,
//       })),
//       Bookingdata: Bookingdata.map((item) => ({
//         BookingID: item.BookingNo,
//       })),
//     };

//     // Send the formatted data in response
//     return res.status(200).json(formattedData);
//   } catch (error) {
//     console.error("Error in AcceptedPaymentList:", error);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };
// exports.AcceptedPaymentList = async (req, res) => {
//   const { EMPID } = req.query;
//   // Validate EMPID input
//   if (!EMPID) {
//     return res.status(400).send({ message: "EMPID is required" });
//   }
//   try {
//     // Find employee data using EMPID
//     const empdata = await empolyeemapdata.findOne({ where: { EMPID: EMPID } });
//     // Check if employee data with given EMPID exists
//     if (!empdata || !empdata.CustomerID) {
//       return res.status(404).send({ message: "Employee ID Not Found" });
//     }
//     const employeedata = await userdata.findOne({ where: { EmpID: EMPID } });
//     if (!employeedata) {
//       return res.status(404).send({ message: "No employee data found" });
//     }
//     const customerid = empdata.CustomerID;

//     // Fetch Booking data
//     const Bookingdata = await bookingdata.findAll({
//       where: { CustomerID: customerid },
//     });
//     if (!Bookingdata || Bookingdata.length === 0) {
//       return res.status(404).send({ message: "Booking data not found" });
//     }
//     // Fetch Customer data
//     const customerdata = await customer.findAll({
//       where: { CustomerID: customerid },
//     });
//     if (!customerdata || customerdata.length === 0) {
//       return res.status(404).send({ message: "Customer data not found" });
//     }

//     // Fetch Payment data
//     const paymentdata = await payment.findAll({
//       where: {
//         RequestStatus: "Accepted",
//         CustomerID: customerid,
//       },
//     });
//     if (!paymentdata || paymentdata.length === 0) {
//       return res.status(404).send({ message: "Payment data not found" });
//     }

//     console.log(">>>>>>>>>>>>>>>", paymentdata);
//     // Extracting the first element of each array
//     const formattedData = {
//       message: "successfully",
//       location: employeedata.City,
//       Branch: employeedata.Branch,
//       Executive: employeedata.UserName,
//       CustomerName: customerdata[0]?.FirstName || "",
//       ContactNo: customerdata[0]?.PhoneNo || "",
//       lastname: customerdata[0]?.LastName || "",
//       Email: customerdata[0]?.Email || "",
//       Occupation: customerdata[0]?.Occupation || "",
//       CustAddress: customerdata[0]?.Address || "",
//       model: customerdata[0]?.ModelName || "",
//       variant: customerdata[0]?.VariantName || "",
//       Location: customerdata[0]?.District || "",
//       RequestID: paymentdata[0]?.RequestID || "",
//       status: paymentdata[0]?.RequestStatus || "",
//       paymentmode: paymentdata[0]?.PaymentMode || "",
//       PaymentType: paymentdata[0]?.PaymentPurpose || "",
//       BookingID: Bookingdata[0]?.BookingNo || "",
//     };

//     // Send the formatted data in response
//     return res.status(200).json(formattedData);
//   } catch (error) {
//     console.error("Error in AcceptedPaymentList:", error);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };

// exports.AcceptedPaymentList = async (req, res) => {
//   const { EMPID } = req.query;
//   // Validate EMPID input
//   if (!EMPID) {
//     return res.status(400).send({ message: "EMPID is required" });
//   }
//   try {
//     // Find employee data using EMPID
//     const empdata = await empolyeemapdata.findOne({ where: { EMPID: EMPID } });
//     // Check if employee data with given EMPID exists
//     if (!empdata || !empdata.CustomerID) {
//       return res.status(404).send({ message: "Employee ID Not Found" });
//     }
//     const employeedata = await userdata.findOne({ where: { EmpID: EMPID } });
//     if (!employeedata) {
//       return res.status(404).send({ message: "No employee data found" });
//     }
//     const customerid = empdata.CustomerID;

//     // Fetch Booking data
//     const Bookingdata = await bookingdata.findOne({
//       where: { CustomerID: customerid },
//     });
//     if (!Bookingdata) {
//       return res.status(404).send({ message: "Booking data not found" });
//     }

//     // Fetch Customer data
//     const customerdata = await customer.findOne({
//       where: { CustomerID: customerid },
//     });
//     if (!customerdata) {
//       return res.status(404).send({ message: "Customer data not found" });
//     }

//     // Fetch Payment data
//     const paymentdata = await payment.findOne({
//       where: {
//         RequestStatus: "Accepted",
//         CustomerID: customerid,
//       },
//     });
//     if (!paymentdata) {
//       return res.status(404).send({ message: "Payment data not found" });
//     }

//     // Map the required fields for response formatting into a single object
//     const formattedData = {
//       location: employeedata.City,
//       Branch: employeedata.Branch,
//       Executive: employeedata.UserName,
//       CustomerName: customerdata.FirstName,
//       ContactNo: customerdata.PhoneNo,
//       RequestID: paymentdata.RequestID,
//       status: paymentdata.RequestStatus,
//       BookingID: Bookingdata.BookingNo,
//     };

//     // Send the formatted data in response
//     return res.status(200).json({
//       message: "Payment details",
//       formattedData,
//     });
//   } catch (error) {
//     console.error("Error in AcceptedPaymentList:", error);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };

exports.AcceptedPaymentList = async (req, res) => {
  const { EmpID } = req.query;

  // Validate EMPID input
  if (!EmpID) {
    return res.status(400).send({ message: "EMPID is required" });
  }

  try {
    // Find employee data using EMPID
    const empdata = await empolyeemapdata.findOne({ where: { EmpID } });

    // Check if employee data with given EMPID exists
    if (!empdata || !empdata.CustomerID) {
      return res.status(404).send({ message: "Employee ID Not Found" });
    }

    // Find employee user data using EMPID
    const employeedata = await userdata.findOne({ where: { EmpID: EmpID } });

    // Check if employee user data with given EMPID exists
    if (!employeedata) {
      return res.status(404).send({ message: "No employee data found" });
    }

    const customerid = empdata.CustomerID;

    // Fetch Booking data
    const Bookingdata = await bookingdata.findAll({
      // where: { CustomerID: customerid },
    });

    if (!Bookingdata || Bookingdata.length === 0) {
      return res.status(404).send({ message: "Booking data not found" });
    }

    // Fetch Payment data
    const paymentdata = await payment.findAll({
      where: {
        RequestStatus: "Accepted",
        // CustomerID: customerid,
      },
    });

    if (!paymentdata || paymentdata.length === 0) {
      return res.status(404).send({ message: "Payment data not found" });
    }

    // Create an array to hold the formatted payment data
    let formattedPayments = [];

    // Loop through each payment item to map the required fields
    for (const paymentItem of paymentdata) {
      // Fetch Customer data for the specific payment item
      const customerdata = await customer.findOne({
        where: { CustomerID: paymentItem.CustomerID },
      });

      if (!customerdata) {
        return res.status(404).send({
          message: `Customer data not found for CustomerID ${paymentItem.CustomerID}`,
        });
      }

      // Map the required fields for response formatting
      const formattedPayment = {
        RequestID: paymentItem.RequestID,
        status: paymentItem.RequestStatus,
        paymentID: paymentItem.ID,
        paymentmode: paymentItem.PaymentMode,
        PaymentType: paymentItem.PaymentPurpose,
        Amount: paymentItem.Amount,
        location: employeedata.City,
        Branch: employeedata.Branch,
        Executive: employeedata.UserName,
        CustomerID: customerdata.CustomerID,
        CustomerName: customerdata.FirstName,
        ContactNo: customerdata.PhoneNo,
        lastname: customerdata.LastName,
        Email: customerdata.Email,
        Occupation: customerdata.Occupation,
        CustAddress: customerdata.Address,
        model: customerdata.ModelName,
        variant: customerdata.VariantName,
        Location: customerdata.District,
        BookingID: Bookingdata.length > 0 ? Bookingdata[0].BookingNo : null,
      };

      formattedPayments.push(formattedPayment);
    }

    // Send the formatted data in response
    return res.status(200).json({
      message: "Successfully fetched accepted payments.",
      paymentdata: formattedPayments,
    });
  } catch (error) {
    console.error("Error in AcceptedPaymentList:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.CancelledPaymentList = async (req, res) => {
  const { EMPID } = req.query;
  // Validate EMPID input
  if (!EMPID) {
    return res.status(400).send({ message: "EMPID is required" });
  }
  try {
    // Find employee data using EMPID
    const empdata = await empolyeemapdata.findOne({ where: { EMPID: EMPID } });
    // Check if employee data with given EMPID exists
    if (!empdata || !empdata.CustomerID) {
      return res.status(404).send({ message: "Employee ID Not Found" });
    }
    const employeedata = await userdata.findOne({ where: { EmpID: EMPID } });
    if (!employeedata) {
      return res.status(404).send({ message: "No employee data found" });
    }
    const customerid = empdata.CustomerID;

    // Fetch Booking data
    const Bookingdata = await bookingdata.findAll({
      // where: { CustomerID: customerid },
    });
    if (!Bookingdata || Bookingdata.length === 0) {
      return res.status(404).send({ message: "Booking data not found" });
    }

    // Fetch Customer data
    const customerdata = await customer.findAll({
      where: { CustomerID: customerid },
    });
    if (!customerdata || customerdata.length === 0) {
      return res.status(404).send({ message: "Customer data not found" });
    }

    // Fetch Payment data
    const paymentdata = await payment.findAll({
      where: {
        RequestStatus: "Cancelled",
        //CustomerID: customerid,
      },
    });
    if (!paymentdata || paymentdata.length === 0) {
      return res.status(404).send({ message: "Payment data not found" });
    }

    // Extract single objects from arrays
    const employeeInfo = {
      location: employeedata.City,
      Branch: employeedata.Branch,
      Executive: employeedata.UserName,
    };

    const customerInfo = customerdata[0]
      ? {
          CustomerName: customerdata[0].FirstName,
          ContactNo: customerdata[0].PhoneNo,
          lastname: customerdata[0].LastName,
          Email: customerdata[0].Email,
          Occupation: customerdata[0].Occupation,
          CustAddress: customerdata[0].Address,
          model: customerdata[0].ModelName,
          variant: customerdata[0].VariantName,
          Location: customerdata[0].District,
        }
      : {};

    const bookingInfo = Bookingdata[0]
      ? {
          BookingID: Bookingdata[0].BookingNo,
        }
      : {};

    // Map the required fields for response formatting
    const formattedData = {
      message: "successfully",
      paymentdata: paymentdata.map((item) => ({
        RequestID: item.RequestID,
        status: item.RequestStatus,
        paymentID: item.ID,
        paymentmode: item.PaymentMode,
        PaymentType: item.PaymentPurpose,
        Amount: item.Amount,
        location: employeeInfo.location,
        Branch: employeeInfo.Branch,
        Executive: employeeInfo.Executive,
        CustomerName: customerInfo.CustomerName,
        ContactNo: customerInfo.ContactNo,
        lastname: customerInfo.lastname,
        Email: customerInfo.Email,
        Occupation: customerInfo.Occupation,
        CustAddress: customerInfo.CustAddress,
        model: customerInfo.model,
        variant: customerInfo.variant,
        Location: customerInfo.Location,
        BookingID: bookingInfo.BookingID,
      })),
    };

    // Send the formatted data in response
    return res.status(200).json(formattedData);
  } catch (error) {
    console.error("Error in AcceptedPaymentList:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.PendingPaymentList = async (req, res) => {
  const { EMPID } = req.query;
  // Validate EMPID input
  if (!EMPID) {
    return res.status(400).send({ message: "EMPID is required" });
  }
  try {
    // Find employee data using EMPID
    const empdata = await empolyeemapdata.findOne({ where: { EMPID: EMPID } });
    // Check if employee data with given EMPID exists
    if (!empdata || !empdata.CustomerID) {
      return res.status(404).send({ message: "Employee ID Not Found" });
    }
    const employeedata = await userdata.findOne({ where: { EmpID: EMPID } });
    if (!employeedata) {
      return res.status(404).send({ message: "No employee data found" });
    }
    const customerid = empdata.CustomerID;

    // Fetch Booking data
    const Bookingdata = await bookingdata.findAll({
      // where: { CustomerID: customerid },
    });
    if (!Bookingdata || Bookingdata.length === 0) {
      return res.status(404).send({ message: "Booking data not found" });
    }

    // Fetch Customer data
    const customerdata = await customer.findAll({
      where: { CustomerID: customerid },
    });
    if (!customerdata || customerdata.length === 0) {
      return res.status(404).send({ message: "Customer data not found" });
    }

    // Fetch Payment data
    const paymentdata = await payment.findAll({
      where: {
        RequestStatus: "Pending",
        //CustomerID: customerid,
      },
    });
    if (!paymentdata || paymentdata.length === 0) {
      return res.status(404).send({ message: "Payment data not found" });
    }

    // Extract single objects from arrays
    const employeeInfo = {
      location: employeedata.City,
      Branch: employeedata.Branch,
      Executive: employeedata.UserName,
    };

    const customerInfo = customerdata[0]
      ? {
          CustomerName: customerdata[0].FirstName,
          ContactNo: customerdata[0].PhoneNo,
          lastname: customerdata[0].LastName,
          Email: customerdata[0].Email,
          Occupation: customerdata[0].Occupation,
          CustAddress: customerdata[0].Address,
          model: customerdata[0].ModelName,
          variant: customerdata[0].VariantName,
          Location: customerdata[0].District,
        }
      : {};

    const bookingInfo = Bookingdata[0]
      ? {
          BookingID: Bookingdata[0].BookingNo,
        }
      : {};

    // Map the required fields for response formatting
    const formattedData = {
      message: "successfully",
      paymentdata: paymentdata.map((item) => ({
        RequestID: item.RequestID,
        status: item.RequestStatus,
        paymentID: item.ID,
        paymentmode: item.PaymentMode,
        PaymentType: item.PaymentPurpose,
        Amount: item.Amount,
        location: employeeInfo.location,
        Branch: employeeInfo.Branch,
        Executive: employeeInfo.Executive,
        CustomerName: customerInfo.CustomerName,
        ContactNo: customerInfo.ContactNo,
        lastname: customerInfo.lastname,
        Email: customerInfo.Email,
        Occupation: customerInfo.Occupation,
        CustAddress: customerInfo.CustAddress,
        model: customerInfo.model,
        variant: customerInfo.variant,
        Location: customerInfo.Location,
        BookingID: bookingInfo.BookingID,
      })),
    };

    // Send the formatted data in response
    return res.status(200).json(formattedData);
  } catch (error) {
    console.error("Error in AcceptedPaymentList:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.NewPaymentGetList = async (req, res) => {
  const { searchValue } = req.query;

  // Debug: Log the received query parameters
  console.log("Received query parameters:", req.query);

  // Check if searchValue is provided
  if (!searchValue) {
    return res.status(400).send({ message: "searchValue must be provided" });
  }

  try {
    // Constructing the where clause based on the search value
    const whereClause = {
      [Op.or]: [
        { BookingNo: { [Op.like]: `%${searchValue}%` } },
        { PhoneNo: { [Op.like]: `%${searchValue}%` } },
        { FirstName: { [Op.iLike]: `%${searchValue}%` } },
      ],
    };

    // Perform database query to find the entries with the given criteria
    const data = await bookingdata.findAll({
      where: whereClause,
    });

    // Check if data is empty
    if (!data.length) {
      return res.status(404).send({
        message: `NewCarBookings not found with the provided criteria`,
      });
    }

    // Fetch associated data from other tables using IDs
    const modelIds = data.map((booking) => booking.ModelID);
    const variantIds = data.map((booking) => booking.VariantID);
    const colourIds = data.map((booking) => booking.ColourID);
    const transmissionIds = data.map((booking) => booking.TransmissionID);

    const [modeldata, variantdata, colourdata, transmissiondata] =
      await Promise.all([
        ModelMaster.findAll({
          where: { ModelMasterID: { [Op.in]: modelIds } },
        }),
        VariantMaster.findAll({
          where: { VariantID: { [Op.in]: variantIds } },
        }),
        ColourMaster.findAll({ where: { ColourID: { [Op.in]: colourIds } } }),
        Transmission.findAll({
          where: { TransmissionID: { [Op.in]: transmissionIds } },
        }),
      ]);

    // Map data to create the desired structure with flattened nested objects
    const mappeddata = data.map((booking) => {
      const model = modeldata.find(
        (model) => model.ModelMasterID === booking.ModelID
      );
      const variant = variantdata.find(
        (variant) => variant.VariantID === booking.VariantID
      );
      const colour = colourdata.find(
        (colour) => colour.ColourID === booking.ColourID
      );
      const transmission = transmissiondata.find(
        (transmission) => transmission.TransmissionID === booking.TransmissionID
      );

      return {
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
        Occupation: booking.Occupation,
        Address: booking.Address,
        PINCode: booking.PINCode,
        District: booking.District,
        State: booking.State,
        ModelID: booking.ModelID,
        ModelMasterID: model ? model.ModelMasterID : null,
        ModelCode: model ? model.ModelCode : null,
        ModelDescription: model ? model.ModelDescription : null,
        ColourID: booking.ColourID,
        ColourMasterID: colour ? colour.ColourID : null,
        ColourCode: colour ? colour.ColourCode : null,
        ColourDescription: colour ? colour.ColourDescription : null,
        VariantID: booking.VariantID,
        VariantMasterID: variant ? variant.VariantID : null,
        VariantCode: variant ? variant.VariantCode : null,
        TransmissionID: transmission ? transmission.TransmissionID : null,
        TransmissionCode: transmission ? transmission.TransmissionCode : null,
        ModelName: booking.ModelName,
        ColourName: booking.ColourName,
        VariantName: booking.VariantName,
        Transmission: booking.Transmission,

        BranchID: booking.BranchID,
        CorporateSchema: booking.CorporateSchema,
        TrueValueExchange: booking.TrueValueExchange,
        RegistrationType: booking.RegistrationType,
        Finance: booking.Finance,
        Insurance: booking.Insurance,
        SalesPersonID: booking.SalesPersonID,
        TeamLeadID: booking.TeamLeadID,
        BookingTime: booking.BookingTime,
        CreatedDate: booking.CreatedDate,
        ModifiedDate: booking.ModifiedDate,
      };
    });

    // Send the mapped data in response
    res.send(mappeddata);
  } catch (err) {
    // Handle database errors
    console.error("Error retrieving NewCarBookings", err);
    res.status(500).send({
      message: `Error retrieving NewCarBookings with the provided criteria`,
    });
  }
};

exports.SaveNewPaymentData = async (req, res) => {
  const { BookingID } = req.body; // Assuming BookingID is required for validation
  const refTypeID = req.body.RefTypeID; // Assuming BookingID is required for validation

  // Debug: Log the received body parameters
  console.log("Received body parameters:", req.body);

  // Check if BookingID is provided
  if (!BookingID && !refTypeID) {
    return res.status(400).send({
      message: "Booking data must be provided or RefTypeID must be provided ",
    });
  }

  try {
    // Map all fields from req.body to a single object
    const paymentRequestData = {
      RequestID: req.body.RequestID,
      CustomerID: req.body.CustomerID,
      TransactionID: req.body.TransactionID,
      RefTypeID: req.body.RefTypeID,
      RequestDate: req.body.RequestDate,
      PaymentPurpose: req.body.PaymentPurpose,
      PaymentMode: req.body.PaymentMode,
      Amount: req.body.Amount,
      InstrumentNo: req.body.InstrumentNo,
      InstrumentDate: req.body.InstrumentDate,
      BankName: req.body.BankName,
      BranchName: req.body.BranchName,
      BankCharges: req.body.BankCharges,
      CollectionBranchID: req.body.CollectionBranchID,
      RequestStatus: req.body.RequestStatus,
      RequestBy: req.body.RequestBy,
      CreatedDate: req.body.CreatedDate,
      // ModifiedDate: req.body.ModifiedDate,
    };

    // Create payment request using Sequelize model
    const paymentRequest = await payment.create(paymentRequestData);

    res.status(201).json(paymentRequest); // Respond with the created payment request
  } catch (err) {
    // Handle database errors
    console.error("Error creating payment request:", err);
    res.status(500).send({
      message: "Error creating payment request",
      error: err.message, // Optionally, you can send the error message for debugging
    });
  }
};

// Payment request status is being updated
exports.PaymentStatusChange = async (req, res) => {
  const requestID = req.body.RequestID; // Extract RequestID from request body

  // Debug: Log the received body parameters
  console.log("Received body parameters:", req.body);

  const transaction = await Seq.transaction(); // Start a transaction

  try {
    // Check if RequestID is provided
    if (!requestID) {
      await transaction.rollback(); // Rollback transaction on early exit
      return res.status(400).json({ message: "RequestID must be provided" });
    }

    // Find the payment request using Sequelize model
    const paymentRequest = await payment.findOne({
      where: { RequestID: requestID },
      transaction,
    });

    if (!paymentRequest) {
      await transaction.rollback(); // Rollback transaction if payment request not found
      return res.status(404).json({ message: "Payment request not found" });
    }

    // Find the payment receipt associated with the payment request
    const paymentReceipt = await receipt.findOne({
      where: { RequestID: paymentRequest.ID },
      transaction,
    });

    if (!paymentReceipt) {
      await transaction.rollback(); // Rollback transaction if payment receipt not found
      return res.status(404).json({ message: "Payment receipt not found" });
    }

    let chqTrackData;

    // Handle cheque-specific logic
    if (paymentRequest.PaymentMode === "Cheque") {
      const chequeTrackingData = {
        ReceiptID: paymentReceipt.ReceiptID,
        CustomerID: paymentRequest.CustomerID,
        PaymentID: paymentRequest.ID,
        CurrentStage: req.body.Status || "Cheque Uploaded",
        StageDate: new Date(),
        IsActive: true,
        Status: req.body.Status,
      };

      chqTrackData = await ChequeTracking.create(chequeTrackingData, {
        transaction,
      });
      console.log("Cheque tracking data: ", chqTrackData);
    }

    console.log("Request body status: ", req.body.Status);

    // Update payment request and receipt status
    const validStatuses = ["Accepted", "Cancelled", "Rejected"];
    // console.log("!!!!!!!!!!!!!!!!!");

    if (validStatuses.includes(req.body.Status)) {
      // console.log("@@@@@@@@@@@@@@@@@@@@@@@@@");

      paymentRequest.RequestStatus =
        req.body.Status || paymentRequest.RequestStatus;
      paymentRequest.ModifiedDate = new Date();

      paymentReceipt.AuthorisedBy =
        req.body.AuthorisedBy || paymentReceipt.AuthorisedBy;
      paymentReceipt.ModifiedDate = req.body.AuthorisedBy
        ? new Date()
        : paymentReceipt.ModifiedDate;

      // Only generate and update receipt number if status is 'Accepted'
      if (req.body.Status === "Accepted") {
        // Assuming `branchCode.BranchCode` is available from somewhere in your code
        // const branchCode = await getBranchCode(); // Fetch the branch code as required
        const receiptNo = await generateReceiptNo(req.body.BranchCode);
        console.log("Generated receipt number:", receiptNo);

        paymentReceipt.ReceiptNo =
          paymentReceipt.ReceiptNo === null
            ? receiptNo
            : paymentReceipt.ReceiptNo;
        paymentReceipt.ReceiptDate = new Date();
        paymentReceipt.ReceiptStatus = req.body.Status;
      }

      // Only generate and update receipt number if status is 'Accepted'
      if (req.body.Status === "Cancelled" || req.body.Status === "Rejected") {
        // Assuming `branchCode.BranchCode` is available from somewhere in your code
        paymentReceipt.ReceiptStatus = req.body.Status;
        paymentReceipt.ModifiedDate = new Date();

        paymentRequest.Remarks = req.body.Remarks;
        paymentRequest.ModifiedDate = new Date();
      }

      // Save the updated records
      await paymentRequest.save({ transaction });
      await paymentReceipt.save({ transaction });
    }

    // Commit the transaction
    await transaction.commit();

    // Send a success response
    res.status(200).json({
      message: "Payment request updated successfully",
      paymentRequest,
      paymentReceipt,
      chqTrackData,
    });
  } catch (err) {
    // Rollback the transaction in case of error
    try {
      await transaction.rollback();
    } catch (rollbackError) {
      console.error("Transaction rollback failed:", rollbackError);
    }

    // Handle errors
    if (err.name === "SequelizeDatabaseError") {
      console.error("Database error:", err);
      return res.status(500).json({
        message: "Database error occurred",
        error: err.message,
      });
    } else if (err.name === "SequelizeValidationError") {
      console.error("Validation error:", err);
      return res.status(400).json({
        message: "Validation error occurred",
        error: err.message,
      });
    } else if (err.name === "TypeError") {
      console.error("Type error:", err);
      return res.status(400).json({
        message: "Type error occurred",
        error: err.message,
      });
    } else {
      console.error("Unexpected error:", err);
      return res.status(500).json({
        message: "Unexpected error occurred",
        error: err.message,
      });
    }
  }
};

exports.PaymentDataByStatus = async (req, res) => {
  const requestStatus = req.query.RequestStatus;
  const branchName = req.query.BranchName;

  // Validate branchID input
  if (!branchName) {
    return res.status(400).send({ message: "BranchName is required" });
  }

  // Validate requestStatus input
  if (
    !["Pending", "Accepted", "Cancelled", "Rejected"].includes(requestStatus)
  ) {
    return res.status(400).json({
      message:
        "Please provide correct status name ('Pending', 'Accepted', 'Cancelled','Rejected')",
    });
  }
  try {
    console.log("Fetching booking data...");

    // Find booking data using BranchID and include related models
    const bookingData = await bookingdata.findAll({
      where: { BranchName: branchName },
      include: [
        {
          model: userdata,
          as: "NCBSPUserID",
          attributes: ["UserID", "UserName", "EmpID"],
        },
      ],
      attributes: [
        "Title",
        "BookingID",
        "BookingNo", // Adding BookingNo field
        "FirstName",
        "LastName", // Adding LastName field
        "PhoneNo",
        "OfficeNo",
        "Gender",
        "DOB",
        "DateOfAnniversary",
        "Email", // Adding Email field
        "District",
        "State", // Adding State field
        "Occupation",
        "Address",
        "Company",
        "PINCode",
        "CustomerID",
        "ModelName", // Adding ModelName field
        "ColourName", // Adding ColourName field
        "VariantName", // Adding VariantName field
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
        "CreatedDate",
        "ModifiedDate",
      ],
      order: [["CreatedDate", "DESC"]],
    });
    console.log("Booking Data:", bookingData);

    // Check if booking data with given BranchID exists
    if (!bookingData || bookingData.length === 0) {
      console.log("Booking data not found");
      return res.status(404).send({
        message: "Booking data not found for the provided BranchName",
      });
    }

    // Extract CustomerID and BookingID arrays from bookingData
    const custIDs = bookingData.map((booking) => booking.CustomerID);
    const bookingIDs = bookingData.map((booking) => booking.BookingID);

    console.log("Customer IDs:", custIDs);
    console.log("Booking IDs:", bookingIDs);

    // Find payment data matching CustomerID, BookingID, and RequestStatus
    console.log("Fetching payment data...");

    const paymentData = await payment.findAll({
      where: {
        CustomerID: {
          [Op.in]: custIDs,
        },
        TransactionID: {
          [Op.in]: bookingIDs,
        },
        RequestStatus: requestStatus,
      },
      // attributes: [
      //   "TransactionID",
      //   "RequestID",
      //   "RequestStatus",
      //   "PaymentPurpose",
      //   "PaymentMode",
      //   "Amount",
      //   ""
      // ],
    });

    console.log("Payment Data:", paymentData);

    // Check if paymentData is empty
    if (!paymentData || paymentData.length === 0) {
      console.log("No payment data found");
      return res.status(404).json({
        message: "No payment data found for the provided RequestStatus",
      });
    }

    // Prepare formatted data with payments grouped under each booking
    const formattedData = bookingData.map((booking) => {
      // Filter payments for the current booking and requestStatus
      const paymentsForBooking = paymentData.filter(
        (payment) => payment.TransactionID === booking.BookingID
      );

      // Prepare payments array for the current booking
      const payments = paymentsForBooking.map((payment) => ({
        BookingID: booking.BookingID,
        BookingNo: booking.BookingNo,
        Title: booking.Title,
        FirstName: booking.FirstName,
        LastName: booking.LastName,
        PhoneNo: booking.PhoneNo,
        Email: booking.Email,
        District: booking.District,
        State: booking.State,
        CustomerID: booking.CustomerID,
        Occupation: booking.Occupation,
        Address: booking.Address,
        ModelName: booking.ModelName,
        ColourName: booking.ColourName,
        VariantName: booking.VariantName,
        Transmission: booking.Transmission,
        BranchName: booking.BranchName,
        CorporateSchema: booking.CorporateSchema,
        TrueValueExchange: booking.TrueValueExchange,
        RegistrationType: booking.RegistrationType,
        Finance: booking.Finance,
        Insurance: booking.Insurance,
        SalesPersonID: booking.SalesPersonID,
        UserName: booking.NCBSPUserID.UserName, // Include UserName
        EmpID: booking.NCBSPUserID.EmpID, // Include EmpID
        TeamLeadID: booking.TeamLeadID,
        BookingTime: booking.BookingTime,
        CreatedDate: booking.CreatedDate,
        // PaymentCreatedDate: payment.CreatedDate,
        ModifiedDate: booking.ModifiedDate,
        RequestID: payment.RequestID,
        RequestDate: payment.RequestDate,
        RequestStatus: payment.RequestStatus,
        PaymentMode: payment.PaymentMode,
        PaymentPurpose: payment.PaymentPurpose,
        Amount: payment.Amount,
        InstrumentNo: payment.InstrumentNo,
        InstrumentDate: payment.InstrumentDate,
        BankName: payment.BankName,
        BankCharges: payment.BankCharges,
        Remarks: payment.Remarks,
      }));

      return payments;
    });

    // Flatten the array of arrays into a single array of payments
    const flattenedData = formattedData.flat();

    // console.log("Formatted Data:", flattenedData);

    // Sort the flattened data by CreatedDate in descending order
    const sortedData = flattenedData.sort((a, b) => {
      return new Date(b.RequestDate) - new Date(a.RequestDate);
    });

    // console.log("Sorted Data:", sortedData);

    // Send the sorted data as response
    res.json(sortedData);
  } catch (error) {
    console.error("Error fetching pending payment data:", error);
    res.status(500).send({
      message:
        "Failed to retrieve pending payment data. Please try again later.",
    });
  }
};

// get payment data
exports.PaymentTrack = async (req, res) => {
  const requestID = req.query.RequestID; // Assuming RequestID is required for validation

  // Debug: Log the received body parameters
  console.log("Received request parameters:", requestID);

  try {
    // Check if RequestID is provided
    if (!requestID) {
      return res.status(400).send({ message: "RequestID must be provided" });
    }

    // Initialize response data
    let paymentRequest = null;
    let paymentReceipt = null;
    let checkTrack = null;

    // Find the payment request using Sequelize model
    paymentRequest = await payment.findOne({
      where: { RequestID: requestID },
    });

    // Check if paymentRequest is found
    if (!paymentRequest) {
      console.warn("Payment request not found");
    }

    // Find the payment receipt using Sequelize model
    if (paymentRequest) {
      paymentReceipt = await receipt.findOne({
        where: { RequestID: paymentRequest.ID },
      });
    }

    // Check if paymentReceipt is found
    if (!paymentReceipt) {
      console.warn("Payment receipt not found");
    }

    // Find the cheque tracking records using Sequelize model
    if (paymentRequest) {
      checkTrack = await ChequeTracking.findAll({
        where: {
          CustomerID: paymentRequest.CustomerID,
          PaymentID: paymentRequest.ID,
        },
        order: [["ChqTrackID", "ASC"]],
      });
      // Check if checkTrack is empty
      if (checkTrack.length === 0) {
        checkTrack = null;
        console.warn("Cheque tracking data not found");
      }
    }

    // Respond with the data including nulls for missing items
    res.status(200).json({
      message: "Payment request fetched successfully",
      paymentRequest,
      paymentReceipt,
      checkTrack,
    });
  } catch (err) {
    // Handle errors
    console.error("Error occurred:", err);
    if (err.name === "SequelizeDatabaseError") {
      return res.status(500).send({
        message: "Database error occurred",
        error: err.message,
      });
    } else if (err.name === "SequelizeValidationError") {
      return res.status(400).send({
        message: "Validation error occurred",
        error: err.message,
      });
    } else if (err.name === "TypeError") {
      return res.status(400).send({
        message: "Type error occurred",
        error: err.message,
      });
    } else {
      return res.status(500).send({
        message: "Unexpected error occurred",
        error: err.message,
      });
    }
  }
};
