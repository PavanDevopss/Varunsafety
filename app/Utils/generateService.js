/* eslint-disable no-unused-vars */
const path = require("path");
const db = require("../models");
const Op = db.Sequelize.Op;
const Seq = db.sequelize;
const BranchIndent = db.branchindents;
const BranchTransfer = db.branchtransfers;
const DealerIndent = db.dealerindents;
const DealerTransfer = db.dealertransfers;
const CustomerMaster = db.customermaster;
const DocumentType = db.documenttypes;
const VehicleStock = db.vehiclestock;
const NewCarBookings = db.NewCarBookings;
const PartMaster = db.accpartmaster;
const FinanceDocuments = db.financedocuments;
const FinanceApplication = db.financeapplication;
const PaymentRequests = db.PaymentRequests;
const receipt = db.CustReceipt;
const ModuleMaster = db.modulemaster;
const FormMaster = db.formsmaster;
const VehicleAllotment = db.vehicleallotment;
const VehicleChangeRequest = db.vehiclechangereq;
const RoleMaster = db.rolesmaster;
const AccApprovalRequest = db.accapprovalreq;
const BranchApprovalsLimit = db.branchapprovalslimit;
const AccIssueReq = db.accissuereq;
const AccReturnReq = db.accreturnreq;
const AccJobOrder = db.accjoborder;
const TestDrive = db.testdrive;
const AccApprovalCartCancelReq = db.accapprovalcartcancelreq;
const Invoice = db.invoice;
const BookingTransfer = db.bookingtransfer;
const Bookingcancellation = db.bookingcancellation;
const DemoConversion = db.democonversion;
const { DateTime } = require("luxon");
const BranchApprovalsLimitModel = require("../models/BranchApprovalsLimit.model");

// Function to generate filename in Model Master
const generateModelMasterImgName = (file, modelCode, modelDescription) => {
  const extension = path.extname(file.originalname);
  const sanitizedModelCode = modelCode.replace(/\s+/g, "_").toUpperCase();
  const sanitizedModelDescription = modelDescription
    .replace(/\s+/g, "_")
    .toUpperCase();
  return `${sanitizedModelCode}_${sanitizedModelDescription}${extension}`;
};

// Function to generate filename in Model Master
const genChequeName = (file, ReceiptID, InstrumentNo) => {
  const extension = path.extname(file.originalname);
  const sanitizedReceiptID = ReceiptID;
  const sanitizedInstrumentNo = InstrumentNo.replace(/\s+/g, "_").toUpperCase();
  return `${sanitizedReceiptID}_${sanitizedInstrumentNo}${extension}`;
};

// function to generate Name for doc saved on upload
const genDocNameforCustomer = async (file, CustomerID, DocTypeID, GSTID) => {
  try {
    const extension = path.extname(file.originalname);

    // Fetch Customer details
    const customer = await CustomerMaster.findByPk(CustomerID);
    if (!customer) {
      throw new Error(`Customer with ID ${CustomerID} not found`);
    }
    const CustID = customer.CustID;

    // Fetch DocumentType details
    const documentType = await DocumentType.findByPk(DocTypeID);
    if (!documentType) {
      throw new Error(`DocumentType with ID ${DocTypeID} not found`);
    }
    const DocType = documentType.Doctype;
    // Clean up DocType by removing spaces and special characters
    const cleanedDocType = DocType.replace(/[^\w]/g, ""); // Remove non-word characters

    if (GSTID) {
      // Generate the name
      const name = `${CustID}_${cleanedDocType}_${GSTID}${extension}`;
      return name;
    } else {
      // Generate the name
      const name = `${CustID}_${cleanedDocType}${extension}`;
      return name;
    }
  } catch (err) {
    throw new Error(`Error generating name: ${err.message}`);
  }
};

// function to generate Name for doc saved on upload
const genDocNameforBooking = async (file, BookingID, DocTypeID) => {
  try {
    const extension = path.extname(file.originalname);

    // // Fetch Customer details
    // const customer = await CustomerMaster.findByPk(BookingID);
    // if (!customer) {
    //   throw new Error(`Customer with ID ${BookingID} not found`);
    // }
    // const CustID = customer.CustID;

    // Fetch DocumentType details
    const documentType = await DocumentType.findByPk(DocTypeID);
    if (!documentType) {
      throw new Error(`DocumentType with ID ${DocTypeID} not found`);
    }
    const DocType = documentType.Doctype;
    // Clean up DocType by removing spaces and special characters
    const cleanedDocType = DocType.replace(/[^\w]/g, ""); // Remove non-word characters

    // Generate the name
    const name = `ID_${BookingID}_${cleanedDocType}${extension}`;
    return name;
  } catch (err) {
    throw new Error(`Error generating name: ${err.message}`);
  }
};

// function to generate Doc Name in Finance
const genDocNameforFin = async (file, CustomerID, CustomerType, DocTypeID) => {
  try {
    const extension = path.extname(file.originalname);

    // Fetch DocumentType details
    const documentType = await DocumentType.findByPk(DocTypeID);
    if (!documentType) {
      return { error: `DocumentType with ID ${DocTypeID} not found` };
    }
    console.log("DocumentType:", documentType); // Debugging statement
    const DocumentAs = documentType.DocumentAs;

    // Clean up DocType by removing spaces and special characters
    const cleanedDocumentAs = DocumentAs.replace(/[^\w]/g, ""); // Remove non-word characters
    console.log("cleanedDocumentAs", cleanedDocumentAs);

    // Generate the name
    const name = `${CustomerID}_${CustomerType}_${cleanedDocumentAs}${extension}`;
    return name; // Return the generated name wrapped in an object
  } catch (err) {
    return { error: `Error generating name: ${err.message}` };
  }
};
const genDocNameforDriveMaster = async (file, TestDriveMasterID, DocTypeID) => {
  try {
    const extension = path.extname(file.originalname);

    // Fetch DocumentType details
    const documentType = await DocumentType.findByPk(DocTypeID);
    if (!documentType) {
      throw new Error(`DocumentType with ID ${DocTypeID} not found`);
    }

    const Doctype = documentType.Doctype;

    // Clean up DocType by removing spaces and special characters
    const cleanedDoctype = Doctype.replace(/[^\w]/g, ""); // Remove non-word characters

    // Generate the name
    const name = `${TestDriveMasterID}_${cleanedDoctype}${extension}`;
    return name;
  } catch (err) {
    console.error("Error generating document name:", err);
    return `Error_${TestDriveMasterID}_${DocTypeID}_${path.extname(
      file.originalname
    )}`;
  }
};
const genDocTestDriveDocName = async (file, TestDriveID, DocTypeID) => {
  try {
    const extension = path.extname(file.originalname);

    // Fetch DocumentType details
    const documentType = await DocumentType.findByPk(DocTypeID);
    if (!documentType) {
      throw new Error(`DocumentType with ID ${DocTypeID} not found`);
    }

    const Doctype = documentType.Doctype;

    // Clean up DocType by removing spaces and special characters
    const cleanedDoctype = Doctype.replace(/[^\w]/g, ""); // Remove non-word characters

    // Generate the name
    const name = `${TestDriveID}_${cleanedDoctype}${extension}`;
    return name;
  } catch (err) {
    console.error("Error generating document name:", err);
    return `Error_${TestDriveID}_${DocTypeID}_${path.extname(
      file.originalname
    )}`;
  }
};

const genIconNameinForms = async (file, ModuleID) => {
  try {
    const extension = path.extname(file.originalname);

    // Fetch DocumentType details
    const module = await ModuleMaster.findByPk(ModuleID);
    if (!module) {
      return { error: `ModuleMaster with ID ${ModuleID} not found` };
    }
    console.log("ModuleMaster:", module); // Debugging statement
    const ModuleName = module.ModuleName;

    // Clean up DocType by removing spaces and special characters
    const cleanedModuleName = ModuleName.replace(/[^\w]/g, ""); // Remove non-word characters
    console.log("cleanedModuleName", cleanedModuleName);

    // Generate the name
    const name = `${ModuleID}_${cleanedModuleName}${extension}`;
    return name; // Return the generated name wrapped in an object
  } catch (err) {
    return { error: `Error generating name: ${err.message}` };
  }
};

const genVendorDocuments = async (file, DocTypeID, VendorMasterID) => {
  try {
    const extension = path.extname(file.originalname);

    // Fetch DocumentType details
    const documentType = await DocumentType.findByPk(DocTypeID);
    console.log("??????????????????????????????:", documentType); // Debugging statement

    if (!documentType) {
      return { error: `DocumentType with ID ${DocTypeID} not found` };
    }
    const Doctype = documentType.Doctype;
    console.log("Doctype", Doctype);
    // Clean up DocType by removing spaces and special characters
    const cleanedDoctype = Doctype.replace(/[^\w]/g, ""); // Remove non-word characters
    console.log("cleanedDoctype", cleanedDoctype);

    // Generate the name
    const name = `${VendorMasterID}_${cleanedDoctype}${extension}`;
    return name; // Return the generated name wrapped in an object
  } catch (err) {
    return { error: `Error generating name: ${err.message}` };
  }
};
const genDocNameforFinLoan = async (file, FinanceLoanID, DocTypeID) => {
  try {
    const extension = path.extname(file.originalname);

    // Fetch DocumentType details
    const documentType = await DocumentType.findByPk(DocTypeID);
    if (!documentType) {
      return { error: `DocumentType with ID ${DocTypeID} not found` };
    }
    console.log("DocumentType:", documentType); // Debugging statement
    const DocumentAs = documentType.DocumentAs;

    // Clean up DocType by removing spaces and special characters
    const cleanedDocumentAs = DocumentAs.replace(/[^\w]/g, ""); // Remove non-word characters
    console.log("cleanedDocumentAs", cleanedDocumentAs);

    // Generate the name
    const name = `${FinanceLoanID}_${cleanedDocumentAs}${extension}`;
    return name; // Return the generated name wrapped in an object
  } catch (err) {
    return { error: `Error generating name: ${err.message}` };
  }
};

const genDocNameforFinPayment = async (file, FinPaymentID, DocTypeID) => {
  try {
    const extension = path.extname(file.originalname);

    // Fetch DocumentType details
    const documentType = await DocumentType.findByPk(DocTypeID);
    if (!documentType) {
      return { error: `DocumentType with ID ${DocTypeID} not found` };
    }
    console.log("DocumentType:", documentType); // Debugging statement
    const DocumentAs = documentType.DocumentAs;

    // Clean up DocType by removing spaces and special characters
    const cleanedDocumentAs = DocumentAs.replace(/[^\w]/g, ""); // Remove non-word characters
    console.log("cleanedDocumentAs", cleanedDocumentAs);

    // Generate the name
    const name = `${FinPaymentID}_${cleanedDocumentAs}${extension}`;
    return name; // Return the generated name wrapped in an object
  } catch (err) {
    return { error: `Error generating name: ${err.message}` };
  }
};

const finApprovedDocument = async (file, FinAppID, CurrentStage) => {
  try {
    const extension = path.extname(file.originalname);

    // Fetch FinAppID details
    const finappid = await FinanceApplication.findByPk(FinAppID);
    if (!finappid) {
      throw new Error(`Fin APP with ID ${FinAppID} not found`);
    }
    console.log("FinAppID:", finappid); // Debugging statement
    const customerID = finappid.CustomerID;
    console.log("customerID", customerID);

    const cleanedCurrentStage = CurrentStage.replace(/[^\w]/g, "");

    // Generate the name
    const name = `${FinAppID}_${customerID}_${cleanedCurrentStage}${extension}`;
    return name;
  } catch (err) {
    throw new Error(`Error generating name: ${err.message}`);
  }
};

// function to generate Branch Indent Number
async function generateBIndentNo(branchCode) {
  // Step 1: Validate Branch Code
  // Check if the branch code is not longer than 5 characters
  if (branchCode.length > 5) {
    throw new Error("Branch code should not exceed 5 characters.");
  }
  console.log("branch Code: ", branchCode);

  try {
    // Step 2: Calculate Financial Year
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth(); // Get the current month (0-based)
    const currentDay = currentDate.getDate(); // Get the current day of the month
    const year =
      currentMonth >= 3
        ? String(currentDate.getFullYear()).slice(-2)
        : String(currentDate.getFullYear() - 1).slice(-2);
    console.log("current Date: ", currentDate);
    console.log("Year: ", year);
    console.log("Month: ", currentMonth);
    console.log("Day: ", currentDay);

    // Step 3: Retrieve Latest Sequence Number
    // Query the BranchIndents table to get the highest sequence number
    const latestIndent = await BranchIndent.findOne({
      attributes: [
        [
          Seq.fn(
            "MAX",
            Seq.cast(
              Seq.fn(
                "SUBSTRING",
                Seq.col("IndentNo"),
                Seq.fn("REGEXP_INSTR", Seq.col("IndentNo"), "[0-9]+$")
              ),
              "INTEGER"
            )
          ),
          "MaxIndentNumber",
        ],
      ],
      where: {
        IndentNo: {
          [Op.like]: `IND/${branchCode}/%`, // Filter by branchCode dynamically
        },
      },
    });
    console.log("latestIndent: ", latestIndent); // Add this line for debugging

    // Step 4: Check if Table is Empty
    // If no indents are found in the table, return the first sequence of the current financial year
    if (!latestIndent || !latestIndent.dataValues.MaxIndentNumber) {
      return `IND/${branchCode}/${year}00001`;
    }

    // Step 5: Determine the Current Sequence Number
    let currentSequenceNumber = parseInt(
      latestIndent.dataValues.MaxIndentNumber
    );
    console.log("highest sequence: ", currentSequenceNumber);

    // Step 6: Check for April 1st
    // If it is April 1st, ensure the sequence number starts at 1 for the new financial year
    if (currentMonth === 3 && currentDay === 1) {
      const firstNumberInSequence = parseInt(`${year}00001`);
      if (currentSequenceNumber < firstNumberInSequence) {
        return `IND/${branchCode}/${year}00001`;
      }
    }

    // Step 7: Increment the Sequence Number
    currentSequenceNumber += 1;

    // Step 8: Format the Sequence Number
    const formattedSequenceNumber = currentSequenceNumber
      .toString()
      .padStart(5, "0"); // Ensure the sequence number is properly zero-padded
    console.log("formatted sequence: ", formattedSequenceNumber);

    // Step 9: Format the Final Indent Number
    const generatedNumber = `IND/${branchCode}/${formattedSequenceNumber}`;
    console.log("current sequence: ", generatedNumber);

    return generatedNumber;
  } catch (error) {
    throw new Error("Failed to generate Indent number: " + error.message);
  }
}

// function to generate Dealer Indent Number
async function generateDIndentNo(branchCode) {
  // Step 1: Validate Branch Code
  // Check if the branch code is not longer than 5 characters
  if (branchCode.length > 5) {
    throw new Error("Branch code should not exceed 5 characters.");
  }
  console.log("branch Code: ", branchCode);

  try {
    // Step 2: Calculate Financial Year
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth(); // Get the current month (0-based)
    const currentDay = currentDate.getDate(); // Get the current day of the month
    const year =
      currentMonth >= 3
        ? String(currentDate.getFullYear()).slice(-2)
        : String(currentDate.getFullYear() - 1).slice(-2);
    console.log("current Date: ", currentDate);
    console.log("Year: ", year);
    console.log("Month: ", currentMonth);
    console.log("Day: ", currentDay);

    // Step 3: Retrieve Latest Sequence Number
    // Query the BranchIndents table to get the highest sequence number
    const latestIndent = await DealerIndent.findOne({
      attributes: [
        [
          Seq.fn(
            "MAX",
            Seq.cast(
              Seq.fn(
                "SUBSTRING",
                Seq.col("IndentNo"),
                Seq.fn("REGEXP_INSTR", Seq.col("IndentNo"), "[0-9]+$")
              ),
              "INTEGER"
            )
          ),
          "MaxIndentNumber",
        ],
      ],
      where: {
        IndentNo: {
          [Op.like]: `IND/${branchCode}/%`, // Filter by branchCode dynamically
        },
      },
    });
    console.log("latestIndent: ", latestIndent); // Add this line for debugging

    // Step 4: Check if Table is Empty
    // If no indents are found in the table, return the first sequence of the current financial year
    if (!latestIndent || !latestIndent.dataValues.MaxIndentNumber) {
      return `IND/${branchCode}/${year}00001`;
    }

    // Step 5: Determine the Current Sequence Number
    let currentSequenceNumber = parseInt(
      latestIndent.dataValues.MaxIndentNumber
    );
    console.log("highest sequence: ", currentSequenceNumber);

    // Step 6: Check for April 1st
    // If it is April 1st, ensure the sequence number starts at 1 for the new financial year
    if (currentMonth === 3 && currentDay === 1) {
      const firstNumberInSequence = parseInt(`${year}00001`);
      if (currentSequenceNumber < firstNumberInSequence) {
        return `IND/${branchCode}/${year}00001`;
      }
    }

    // Step 7: Increment the Sequence Number
    currentSequenceNumber += 1;

    // Step 8: Format the Sequence Number
    const formattedSequenceNumber = currentSequenceNumber
      .toString()
      .padStart(5, "0"); // Ensure the sequence number is properly zero-padded
    console.log("formatted sequence: ", formattedSequenceNumber);

    // Step 9: Format the Final Indent Number
    const generatedNumber = `IND/${branchCode}/${formattedSequenceNumber}`;
    console.log("current sequence: ", generatedNumber);

    return generatedNumber;
  } catch (error) {
    throw new Error("Failed to generate Indent number: " + error.message);
  }
}

// function to generate Branch DC Number
async function generateBDCNo(branchCode) {
  // Step 1: Validate Branch Code
  // Check if the branch code is not longer than 5 characters
  if (branchCode.length > 5) {
    throw new Error("Branch code should not exceed 5 characters.");
  }
  console.log("branch Code: ", branchCode);

  try {
    // Step 2: Calculate Financial Year
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth(); // Get the current month (0-based, January is 0)
    const currentDay = currentDate.getDate(); // Get the current day of the month
    const year =
      currentMonth >= 3
        ? String(currentDate.getFullYear()).slice(-2) // Use the last two digits of the current year if the month is March (3) or later
        : String(currentDate.getFullYear() - 1).slice(-2); // Otherwise, use the last two digits of the previous year
    console.log("current Date: ", currentDate);
    console.log("Year: ", year);
    console.log("Month: ", currentMonth);
    console.log("Day: ", currentDay);

    // Step 3: Retrieve Latest Sequence Number
    // Query the BranchTransfer table to get the highest sequence number
    const latestDC = await BranchTransfer.findOne({
      attributes: [
        [
          Seq.fn(
            "MAX",
            Seq.cast(
              Seq.fn(
                "SUBSTRING",
                Seq.col("DCNo"),
                Seq.literal(
                  `POSITION('DC/${branchCode}/' IN "DCNo") + LENGTH('DC/${branchCode}/')`
                ),
                7
              ),
              "INTEGER"
            )
          ),
          "MaxDCNumber",
        ],
      ],
      where: {
        DCNo: {
          [Op.like]: `DC/${branchCode}/%`,
        },
      },
    });
    console.log("latest DC : ", latestDC); // Add this line for debugging

    // Step 4: Check if Table is Empty
    // If no DC numbers are found in the table, return the first sequence of the current financial year
    if (!latestDC || !latestDC.dataValues.MaxDCNumber) {
      return `DC/${branchCode}/${year}00001`;
    }

    // Step 5: Determine the Current Sequence Number
    let currentSequenceNumber = parseInt(latestDC.dataValues.MaxDCNumber);
    console.log("highest sequence: ", currentSequenceNumber);
    console.log("Max number: ", latestDC.dataValues.MaxDCNumber);

    // Step 6: Check for April 1st
    // If it is April 1st, ensure the sequence number starts at 1 for the new financial year
    if (currentMonth === 3 && currentDay === 1) {
      const firstNumberInSequence = parseInt(`${year}00001`);
      if (currentSequenceNumber < firstNumberInSequence) {
        return `DC/${branchCode}/${year}00001`;
      }
    }

    // Step 7: Increment the Sequence Number
    currentSequenceNumber += 1;

    // Step 8: Format the Sequence Number
    const formattedSequenceNumber = currentSequenceNumber
      .toString()
      .padStart(5, "0"); // Ensure the sequence number is properly zero-padded
    console.log("formatted sequence: ", formattedSequenceNumber);

    // Step 9: Format the Final DC Number
    const generatedNumber = `DC/${branchCode}/${formattedSequenceNumber}`;
    console.log("current sequence: ", generatedNumber);

    return generatedNumber;
  } catch (error) {
    throw new Error("Failed to generate DC number: " + error.message);
  }
}

// function to generate Dealer DC Number
async function generateDDCNo(branchCode) {
  // Step 1: Validate Branch Code
  // Check if the branch code is not longer than 5 characters
  if (branchCode.length > 5) {
    throw new Error("Branch code should not exceed 5 characters.");
  }
  console.log("branch Code: ", branchCode);

  try {
    // Step 2: Calculate Financial Year
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth(); // Get the current month (0-based, January is 0)
    const currentDay = currentDate.getDate(); // Get the current day of the month
    const year =
      currentMonth >= 3
        ? String(currentDate.getFullYear()).slice(-2) // Use the last two digits of the current year if the month is March (3) or later
        : String(currentDate.getFullYear() - 1).slice(-2); // Otherwise, use the last two digits of the previous year
    console.log("current Date: ", currentDate);
    console.log("Year: ", year);
    console.log("Month: ", currentMonth);
    console.log("Day: ", currentDay);

    // Step 3: Retrieve Latest Sequence Number
    // Query the BranchTransfer table to get the highest sequence number
    const latestDC = await DealerTransfer.findOne({
      attributes: [
        [
          Seq.fn(
            "MAX",
            Seq.cast(
              Seq.fn(
                "SUBSTRING",
                Seq.col("DCNo"),
                Seq.literal(
                  `POSITION('DC/${branchCode}/' IN "DCNo") + LENGTH('DC/${branchCode}/')`
                ),
                7
              ),
              "INTEGER"
            )
          ),
          "MaxDCNumber",
        ],
      ],
      where: {
        DCNo: {
          [Op.like]: `DC/${branchCode}/%`,
        },
      },
    });
    console.log("latest DC : ", latestDC); // Add this line for debugging

    // Step 4: Check if Table is Empty
    // If no DC numbers are found in the table, return the first sequence of the current financial year
    if (!latestDC || !latestDC.dataValues.MaxDCNumber) {
      return `DC/${branchCode}/${year}00001`;
    }

    // Step 5: Determine the Current Sequence Number
    let currentSequenceNumber = parseInt(latestDC.dataValues.MaxDCNumber);
    console.log("highest sequence: ", currentSequenceNumber);
    console.log("Max number: ", latestDC.dataValues.MaxDCNumber);

    // Step 6: Check for April 1st
    // If it is April 1st, ensure the sequence number starts at 1 for the new financial year
    if (currentMonth === 3 && currentDay === 1) {
      const firstNumberInSequence = parseInt(`${year}00001`);
      if (currentSequenceNumber < firstNumberInSequence) {
        return `DC/${branchCode}/${year}00001`;
      }
    }

    // Step 7: Increment the Sequence Number
    currentSequenceNumber += 1;

    // Step 8: Format the Sequence Number
    const formattedSequenceNumber = currentSequenceNumber
      .toString()
      .padStart(5, "0"); // Ensure the sequence number is properly zero-padded
    console.log("formatted sequence: ", formattedSequenceNumber);

    // Step 9: Format the Final DC Number
    const generatedNumber = `DC/${branchCode}/${formattedSequenceNumber}`;
    console.log("current sequence: ", generatedNumber);

    return generatedNumber;
  } catch (error) {
    throw new Error("Failed to generate DC number: " + error.message);
  }
}

// function to generate GRN Number
async function generateGRNNo() {
  try {
    // Step 1: Calculate Financial Year
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth(); // Get the current month (0-based)
    const currentDay = currentDate.getDate(); // Get the current day of the month
    const year =
      currentMonth >= 3
        ? String(currentDate.getFullYear()).slice(-2)
        : String(currentDate.getFullYear() - 1).slice(-2);
    console.log("current Date: ", currentDate);
    console.log("Year: ", year);
    console.log("Month: ", currentMonth);
    console.log("Day: ", currentDay);

    // Step 2: Retrieve Latest Sequence Number
    // Query the BranchIndents table to get the highest sequence number
    const highestGRN = await VehicleStock.findOne({
      attributes: [
        [
          db.Sequelize.fn(
            "MAX",
            db.Sequelize.cast(
              db.Sequelize.literal('SUBSTRING("GRNNo", 4)'),
              "INTEGER"
            )
          ),
          "highestGRNNo",
        ],
      ],
    });

    console.log("Max GRN number: ", highestGRN); // Add this line for debugging
    console.log("Max GRN number value: ", highestGRN.dataValues.highestGRNNo);

    // Step 3: Check if Table is Empty
    // If no indents are found in the table, return the first sequence of the current financial year
    if (!highestGRN || !highestGRN.dataValues.highestGRNNo) {
      return `GRN${year}000001`;
    }

    // Step 4: Determine the Current Sequence Number
    let currentSequenceNumber = parseInt(highestGRN.dataValues.highestGRNNo);
    console.log("highest sequence: ", currentSequenceNumber);

    // Step 5: Check for April 1st
    // If it is April 1st, ensure the sequence number starts at 1 for the new financial year
    if (currentMonth === 3 && currentDay === 1) {
      const firstNumberInSequence = parseInt(`${year}000001`);
      if (currentSequenceNumber < firstNumberInSequence) {
        return `GRN${year}000001`;
      }
    }

    // Step 6: Increment the Sequence Number
    currentSequenceNumber += 1;

    // Step 7: Format the Sequence Number
    const formattedSequenceNumber = currentSequenceNumber
      .toString()
      .padStart(6, "0"); // Ensure the sequence number is properly zero-padded
    console.log("formatted sequence: ", formattedSequenceNumber);

    // Step 8: Format the Final Indent Number
    const generatedNumber = `GRN${formattedSequenceNumber}`;
    console.log("current sequence: ", generatedNumber);

    return generatedNumber;
  } catch (error) {
    throw new Error("Failed to generate GRN number: " + error.message);
  }
}

// Function to generate Booking Number
async function generateBookingNo(branchCode) {
  // Step 1: Validate Branch Code
  // Check if the branch code is not longer than 5 characters
  if (branchCode.length > 5) {
    throw new Error("Branch code should not exceed 5 characters.");
  }
  console.log("branch Code: ", branchCode);

  try {
    // Step 2: Calculate Financial Year
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth(); // Get the current month (0-based, January is 0)
    const currentDay = currentDate.getDate(); // Get the current day of the month
    const year =
      currentMonth >= 3
        ? String(currentDate.getFullYear()).slice(-2) // Use the last two digits of the current year if the month is March (3) or later
        : String(currentDate.getFullYear() - 1).slice(-2); // Otherwise, use the last two digits of the previous year
    console.log("current Date: ", currentDate);
    console.log("Year: ", year);
    console.log("Month: ", currentMonth);
    console.log("Day: ", currentDay);

    // Step 3: Retrieve Latest Sequence Number
    // Query the BranchTransfer table to get the highest sequence number
    const latestBooking = await NewCarBookings.findOne({
      attributes: [
        [
          Seq.fn(
            "MAX",
            Seq.cast(
              Seq.fn(
                "SUBSTRING",
                Seq.col("BookingNo"),
                Seq.fn("REGEXP_INSTR", Seq.col("BookingNo"), "[0-9]+$")
              ),
              "INTEGER"
            )
          ),
          "MaxBookingNumber",
        ],
      ],
      where: {
        BookingNo: {
          [Op.like]: `${branchCode}/SOB%`, // Filter by branchCode dynamically
        },
      },
    });
    console.log("latest Booking : ", latestBooking); // Add this line for debugging

    // Step 4: Check if Table is Empty
    // If no DC numbers are found in the table, return the first sequence of the current financial year
    if (!latestBooking || !latestBooking.dataValues.MaxBookingNumber) {
      return `${branchCode}/SOB${year}00001`;
    }

    // Step 5: Determine the Current Sequence Number
    let currentSequenceNumber = parseInt(
      latestBooking.dataValues.MaxBookingNumber
    );
    console.log("highest sequence: ", currentSequenceNumber);
    console.log("Max number: ", latestBooking.dataValues.MaxBookingNumber);

    // Step 6: Check for April 1st
    // If it is April 1st, ensure the sequence number starts at 1 for the new financial year
    if (currentMonth === 3 && currentDay === 1) {
      const firstNumberInSequence = parseInt(`${year}00001`);
      if (currentSequenceNumber < firstNumberInSequence) {
        return `${branchCode}/SOB${year}00001`;
      }
    }

    // Step 7: Increment the Sequence Number
    currentSequenceNumber += 1;

    // Step 8: Format the Sequence Number
    const formattedSequenceNumber = currentSequenceNumber
      .toString()
      .padStart(5, "0"); // Ensure the sequence number is properly zero-padded
    console.log("formatted sequence: ", formattedSequenceNumber);

    // Step 9: Format the Final DC Number
    const generatedNumber = `${branchCode}/SOB${formattedSequenceNumber}`;
    console.log("current sequence: ", generatedNumber);

    return generatedNumber;
  } catch (error) {
    throw new Error("Failed to generate Booking number: " + error.message);
  }
}

// Function to generate Part Name
const genPartName = async (file, PartMasterID, index) => {
  try {
    const extension = path.extname(file.originalname);

    // Fetch Customer details
    const partmaster = await PartMaster.findByPk(PartMasterID);
    if (!partmaster) {
      throw new Error(`Customer with ID ${PartMasterID} not found`);
    }
    const partcode = partmaster.PartCode;

    // Generate the name
    const name = `${partcode}_${index}${extension}`;
    return name;
  } catch (err) {
    throw new Error(`Error generating name: ${err.message}`);
  }
};

// Finance Application Number Generation
async function genFinApplicationNumber() {
  try {
    // Step 1: Retrieve the highest ApplicationNumber that starts with 'LA'
    const latestApplication = await FinanceApplication.findOne({
      attributes: [
        [
          Seq.fn(
            "MAX",
            Seq.cast(
              Seq.fn(
                "SUBSTRING",
                Seq.col("ApplicationNumber"),
                Seq.literal(
                  `POSITION('LA' IN "ApplicationNumber") + LENGTH('LA')`
                ),
                6 // Adjust this length as needed for your maximum expected number
              ),
              "INTEGER"
            )
          ),
          "MaxApplicationNumber",
        ],
      ],
      where: {
        ApplicationNumber: {
          [Op.like]: "LA%", // Only consider ApplicationNumbers starting with 'LA'
        },
      },
    });

    // Log the retrieved maximum ApplicationNumber
    console.log(
      "Retrieved maximum ApplicationNumber:",
      latestApplication ? latestApplication.get("MaxApplicationNumber") : "None"
    );

    // Step 2: Extract the current maximum number or default to 0 if none found
    let currentNumber = 0;
    if (
      latestApplication &&
      latestApplication.get("MaxApplicationNumber") !== null
    ) {
      currentNumber = latestApplication.get("MaxApplicationNumber");
    }

    // Log the current number
    console.log("Current number extracted:", currentNumber);

    // Step 3: Increment the sequence number
    const newNumber = currentNumber + 1;

    // Log the incremented number
    console.log("Incremented number:", newNumber);

    // Step 4: Format the new ApplicationNumber
    // Apply padding only if the number is less than 10
    const newApplicationNumber =
      newNumber < 10
        ? `LA0${newNumber}` // Add leading zero for numbers less than 10
        : `LA${newNumber}`; // No padding for numbers 10 and above

    // Log the new ApplicationNumber
    console.log("Generated ApplicationNumber:", newApplicationNumber);

    // Return the formatted ApplicationNumber
    return newApplicationNumber;
  } catch (error) {
    console.error("Failed to generate Application Number:", error.message);
    throw new Error("Failed to generate Application Number: " + error.message);
  }
}

// Convert Date time into DB Date time Format
function convertTimestamp(inputTimestamp) {
  // Parse the input timestamp with the given format
  const dt = DateTime.fromFormat(inputTimestamp, "dd/MM/yyyy hh:mm:ss a", {
    zone: "local",
  });

  // Define the desired output format
  const outputFormat = "yyyy-MM-dd HH:mm:ss.SSSZZ";

  // Convert to the desired format
  return dt.toFormat(outputFormat);
}

// Function to generate a 4-digit random number with leading zeros
const generateRandomOTP = () => {
  // Generate a number between 0 and 9999
  const randomNumber = Math.floor(Math.random() * 10000);
  // Format the number to always be 4 digits with leading zeros
  const formatRandomNumber = randomNumber.toString().padStart(4, "0");
  // Console Log the OTP
  console.log("Generated OTP", formatRandomNumber);

  return formatRandomNumber;
};

// function to generate Request Number in Payments
async function genRequestNo() {
  // Step 1: Validate Branch Code
  // Check if the branch code is not longer than 5 characters
  // if (branchCode.length > 5) {
  //   throw new Error("Branch code should not exceed 5 characters.");
  // }
  // console.log("branch Code: ", branchCode);

  try {
    // Step 2: Calculate Financial Year
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth(); // Get the current month (0-based)
    const currentDay = currentDate.getDate(); // Get the current day of the month
    const year =
      currentMonth >= 3
        ? String(currentDate.getFullYear()).slice(-2)
        : String(currentDate.getFullYear() - 1).slice(-2);
    console.log("current Date: ", currentDate);
    console.log("Year: ", year);
    console.log("Month: ", currentMonth);
    console.log("Day: ", currentDay);

    // Step 3: Retrieve Latest Sequence Number
    // Query the BranchIndents table to get the highest sequence number
    const latestRequestID = await PaymentRequests.findOne({
      attributes: [
        [
          Seq.fn(
            "MAX",
            Seq.cast(
              Seq.fn(
                "SUBSTRING",
                Seq.col("RequestID"),
                Seq.fn("REGEXP_INSTR", Seq.col("RequestID"), "[0-9]+$")
              ),
              "INTEGER"
            )
          ),
          "MaxRequestID",
        ],
      ],
      where: {
        RequestID: {
          [Op.like]: `PREQ%`, // Filter by branchCode dynamically
        },
      },
    });
    console.log("latestRequestID: ", latestRequestID); // Add this line for debugging

    // Step 4: Check if Table is Empty
    // If no indents are found in the table, return the first sequence of the current financial year
    if (!latestRequestID || !latestRequestID.dataValues.MaxRequestID) {
      return `PREQ${year}000001`;
    }

    // Step 5: Determine the Current Sequence Number
    let currentSequenceNumber = parseInt(
      latestRequestID.dataValues.MaxRequestID
    );
    console.log("highest sequence: ", currentSequenceNumber);

    // Step 6: Check for April 1st
    // If it is April 1st, ensure the sequence number starts at 1 for the new financial year
    if (currentMonth === 3 && currentDay === 1) {
      const firstNumberInSequence = parseInt(`${year}00001`);
      if (currentSequenceNumber < firstNumberInSequence) {
        return `PREQ${year}000001`;
      }
    }

    // Step 7: Increment the Sequence Number
    currentSequenceNumber += 1;

    // Step 8: Format the Sequence Number
    const formattedSequenceNumber = currentSequenceNumber
      .toString()
      .padStart(5, "0"); // Ensure the sequence number is properly zero-padded
    console.log("formatted sequence: ", formattedSequenceNumber);

    // Step 9: Format the Final Indent Number
    const generatedNumber = `PREQ${formattedSequenceNumber}`;
    console.log("current sequence: ", generatedNumber);

    return generatedNumber;
  } catch (error) {
    throw new Error("Failed to generate Request number: " + error.message);
  }
}

async function generateReceiptNo(branchCode) {
  // Step 1: Validate Branch Code
  // Check if the branch code is not longer than 5 characters
  if (branchCode.length > 5) {
    throw new Error("Branch code should not exceed 5 characters.");
  }
  console.log("branch Code: ", branchCode);

  try {
    // Step 2: Calculate Financial Year
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth(); // Get the current month (0-based)
    const currentDay = currentDate.getDate(); // Get the current day of the month
    const year =
      currentMonth >= 3
        ? String(currentDate.getFullYear()).slice(-2)
        : String(currentDate.getFullYear() - 1).slice(-2);
    console.log("current Date: ", currentDate);
    console.log("Year: ", year);
    console.log("Month: ", currentMonth);
    console.log("Day: ", currentDay);

    // Step 3: Retrieve Latest Sequence Number
    // Query the CustomerReceipt table to get the highest sequence number
    const latestReceipt = await receipt.findOne({
      attributes: [
        [
          Seq.fn(
            "MAX",
            Seq.cast(
              Seq.fn(
                "SUBSTRING",
                Seq.col("ReceiptNo"),
                Seq.fn("REGEXP_INSTR", Seq.col("ReceiptNo"), "[0-9]+$")
              ),
              "INTEGER"
            )
          ),
          "MaxReceiptNumber",
        ],
      ],
      where: {
        ReceiptNo: {
          [Op.like]: `VMS/RCPT/${branchCode}/%`, // Filter by branchCode dynamically
        },
      },
    });
    console.log("latestReceipt: ", latestReceipt); // Add this line for debugging

    // Step 4: Check if Table is Empty
    // If no indents are found in the table, return the first sequence of the current financial year
    if (!latestReceipt || !latestReceipt.dataValues.MaxReceiptNumber) {
      return `VMS/RCPT/${branchCode}/${year}00001`;
    }

    // Step 5: Determine the Current Sequence Number
    let currentSequenceNumber = parseInt(
      latestReceipt.dataValues.MaxReceiptNumber
    );
    console.log("highest sequence: ", currentSequenceNumber);

    // Step 6: Check for April 1st
    // If it is April 1st, ensure the sequence number starts at 1 for the new financial year
    if (currentMonth === 3 && currentDay === 1) {
      const firstNumberInSequence = parseInt(`${year}00001`);
      if (currentSequenceNumber < firstNumberInSequence) {
        return `VMS/RCPT/${branchCode}/${year}00001`;
      }
    }

    // Step 7: Increment the Sequence Number
    currentSequenceNumber += 1;

    // Step 8: Format the Sequence Number
    const formattedSequenceNumber = currentSequenceNumber
      .toString()
      .padStart(5, "0"); // Ensure the sequence number is properly zero-padded
    console.log("formatted sequence: ", formattedSequenceNumber);

    // Step 9: Format the Final Indent Number
    const generatedNumber = `VMS/RCPT/${branchCode}/${formattedSequenceNumber}`;
    console.log("current sequence: ", generatedNumber);

    return generatedNumber;
  } catch (error) {
    throw new Error("Failed to generate Receipt number: " + error.message);
  }
}

// Function to Convert the Date type from DB into type required by GST Portal
function formatDate(isoString) {
  // Create a Date object from the ISO string
  const date = new Date(isoString);

  // Extract the day, month, and year
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const year = date.getUTCFullYear();

  // Return the formatted date in DD/MM/YYYY format
  return `${day}/${month}/${year}`;
}

const generateModuleCode = async () => {
  // Get the current maximum ModuleCode from the table
  const maxModule = await ModuleMaster.findOne({
    attributes: [[Seq.fn("MAX", Seq.col("ModuleCode")), "maxModuleCode"]],
    raw: true, // Returns plain data instead of Sequelize model instance
  });

  let newModuleCode;

  // If a ModuleCode already exists, increment its numeric part
  if (maxModule.maxModuleCode) {
    // Extract the numeric part (e.g., '0001' from 'MD0001')
    const maxNumber = parseInt(maxModule.maxModuleCode.slice(2)); // Remove 'MD' prefix and convert to integer
    const nextNumber = maxNumber + 1;
    // Format the new ModuleCode with leading zeros (e.g., '0002')
    newModuleCode = `MD${nextNumber.toString().padStart(4, "0")}`;
  } else {
    // If no ModuleCode exists, start from MD0001
    newModuleCode = "MD0001";
  }

  return newModuleCode;
};
const generateRequestNo = async () => {
  // Get the current maximum RequestNo from the table
  const RequestNo = await TestDrive.findOne({
    attributes: [[Seq.fn("MAX", Seq.col("RequestNo")), "maxRequestNo"]],
    raw: true, // Returns plain data instead of Sequelize instance
  });

  let maxRequestNo;

  if (RequestNo && RequestNo.maxRequestNo) {
    // Extract the numeric part (e.g., '0001' from 'RQ0001')
    const maxNumber = parseInt(RequestNo.maxRequestNo.slice(2), 10); // Remove 'RQ' prefix and convert to integer
    const nextNumber = maxNumber + 1;
    // Format the new RequestNo with leading zeros (e.g., '0002')
    maxRequestNo = `RQ${nextNumber.toString().padStart(4, "0")}`;
  } else {
    // If no maxRequestNo exists, start from RQ0001
    maxRequestNo = "RQ0001";
  }

  return maxRequestNo;
};

const generateRequestIDForBookingTransfer = async () => {
  // Get the current maximum RequestNo from the table
  const RequestID = await BookingTransfer.findOne({
    attributes: [[Seq.fn("MAX", Seq.col("RequestID")), "maxRequestID"]],
    raw: true, // Returns plain data instead of Sequelize instance
  });

  let maxRequestID;

  if (RequestID && RequestID.maxRequestID) {
    // Extract the numeric part (e.g., '0001' from 'RQ0001')
    const maxNumber = parseInt(RequestID.maxRequestID.slice(2), 10); // Remove 'RQ' prefix and convert to integer
    const nextNumber = maxNumber + 1;
    // Format the new RequestNo with leading zeros (e.g., '0002')
    maxRequestID = `RQ${nextNumber.toString().padStart(4, "0")}`;
  } else {
    // If no maxRequestNo exists, start from RQ0001
    maxRequestID = "RQ0001";
  }

  return maxRequestID;
};

const genBookingCancellationReqNo = async () => {
  // Get the current maximum RequestNo from the table
  const RequestID = await Bookingcancellation.findOne({
    attributes: [[Seq.fn("MAX", Seq.col("RequestID")), "maxRequestID"]],
    raw: true, // Returns plain data instead of Sequelize instance
  });

  let maxRequestID;

  if (RequestID && RequestID.maxRequestID) {
    // Extract the numeric part (e.g., '0001' from 'RQ0001')
    const maxNumber = parseInt(RequestID.maxRequestID.slice(2), 10); // Remove 'RQ' prefix and convert to integer
    const nextNumber = maxNumber + 1;
    // Format the new RequestNo with leading zeros (e.g., '0002')
    maxRequestID = `RQ${nextNumber.toString().padStart(4, "0")}`;
  } else {
    // If no maxRequestNo exists, start from RQ0001
    maxRequestID = "RQ0001";
  }

  return maxRequestID;
};
const generateLevelID = async () => {
  try {
    // Get the current maximum LevelID from the table
    const maxLevelID = await BranchApprovalsLimit.findOne({
      attributes: [[Seq.fn("MAX", Seq.col("LevelID")), "maxLevelID"]],
      raw: true, // Returns plain data instead of Sequelize instance
    });

    let newLevelID;

    // Check if maxLevelID exists
    if (maxLevelID && maxLevelID.maxLevelID) {
      // Extract the numeric part (e.g., '0001' from 'LEVEL0001')
      const maxNumber = parseInt(maxLevelID.maxLevelID.slice(5), 10); // Remove 'LEVEL' prefix and convert to integer
      const nextNumber = maxNumber + 1;
      // Format the new LevelID with leading zeros (e.g., '0002')
      newLevelID = `LEVEL${nextNumber.toString().padStart(4, "0")}`;
    } else {
      // If no LevelID exists, start from LEVEL0001
      newLevelID = "LEVEL0001";
    }

    return newLevelID;
  } catch (error) {
    console.error("Error generating LevelID:", error);
    throw new Error("Could not generate LevelID");
  }
};

const generateFormCode = async () => {
  // Get the current maximum FormCode from the table
  const maxForm = await FormMaster.findOne({
    attributes: [[Seq.fn("MAX", Seq.col("FormCode")), "maxFormCode"]],
    raw: true, // Returns plain data instead of Sequelize model instance
  });

  let maxFormCode;

  // Log the current maxFormCode for debugging
  console.log("maxForm.maxFormCode:", maxForm.maxFormCode);

  // If a FormCode already exists, increment its numeric part
  if (maxForm.maxFormCode) {
    // Extract the numeric part (e.g., '0001' from 'FRM0001')
    const numericPart = maxForm.maxFormCode.slice(3); // Remove 'FRM' prefix and get the numeric part
    const maxNumber = parseInt(numericPart, 10); // Convert the numeric part to an integer

    // Handle cases where parseInt fails (returns NaN)
    if (!isNaN(maxNumber)) {
      const nextNumber = maxNumber + 1;
      // Format the new FormCode with leading zeros (e.g., 'FRM0002')
      maxFormCode = `FRM${nextNumber.toString().padStart(4, "0")}`;
    } else {
      // If the numeric part is invalid, reset to 'FRM0001'
      console.warn("Invalid FormCode format. Resetting to 'FRM0001'.");
      maxFormCode = "FRM0001";
    }
  } else {
    // If no FormCode exists, start from 'FRM0001'
    maxFormCode = "FRM0001";
  }

  return maxFormCode;
};

const generateRoleCode = async () => {
  // Get the current maximum RoleCode from the table
  const maxRole = await RoleMaster.findOne({
    attributes: [[Seq.fn("MAX", Seq.col("RoleCode")), "maxRoleCode"]],
    raw: true, // Returns plain data instead of Sequelize instance
  });

  let maxRoleCode;

  // Log the current maxRoleCode for debugging
  console.log("maxRole.maxRoleCode:", maxRole.maxRoleCode);

  // If a RoleCode already exists, increment its numeric part
  if (maxRole.maxRoleCode) {
    // Extract the numeric part (e.g., '0001' from 'ROLE0001')
    const numericPart = maxRole.maxRoleCode.slice(4); // Remove 'ROLE' prefix and get the numeric part
    const maxNumber = parseInt(numericPart, 10); // Convert the numeric part to an integer

    // Handle cases where parseInt fails (returns NaN)
    if (!isNaN(maxNumber)) {
      const nextNumber = maxNumber + 1;
      // Format the new RoleCode with leading zeros (e.g., 'ROLE0002')
      maxRoleCode = `ROLE${nextNumber.toString().padStart(4, "0")}`;
    } else {
      // If the numeric part is invalid, reset to 'ROLE0001'
      console.warn("Invalid RoleCode format. Resetting to 'ROLE0001'.");
      maxRoleCode = "ROLE0001";
    }
  } else {
    // If no RoleCode exists, start from 'ROLE0001'
    maxRoleCode = "ROLE0001";
  }

  return maxRoleCode;
};

// function to generate Allotment Request Number
async function generateAllotReqNo() {
  try {
    // Step 1: Calculate Financial Year
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth(); // Get the current month (0-based)
    const currentDay = currentDate.getDate(); // Get the current day of the month
    const year =
      currentMonth >= 3
        ? String(currentDate.getFullYear()).slice(-2)
        : String(currentDate.getFullYear() - 1).slice(-2);
    console.log("current Date: ", currentDate);
    console.log("Year: ", year);
    console.log("Month: ", currentMonth);
    console.log("Day: ", currentDay);

    // Step 2: Retrieve Latest Sequence Number
    // Query the BranchIndents table to get the highest sequence number
    const highestReqNo = await VehicleAllotment.findOne({
      attributes: [
        [
          db.Sequelize.fn(
            "MAX",
            db.Sequelize.cast(
              db.Sequelize.literal('SUBSTRING("ReqNo", 4)'),
              "INTEGER"
            )
          ),
          "highestReqNo",
        ],
      ],
    });

    console.log("Max Req number: ", highestReqNo); // Add this line for debugging
    console.log("Max Req number value: ", highestReqNo.dataValues.highestReqNo);

    // Step 3: Check if Table is Empty
    // If no indents are found in the table, return the first sequence of the current financial year
    if (!highestReqNo || !highestReqNo.dataValues.highestReqNo) {
      return `REQ${year}000001`;
    }

    // Step 4: Determine the Current Sequence Number
    let currentSequenceNumber = parseInt(highestReqNo.dataValues.highestReqNo);
    console.log("highest sequence: ", currentSequenceNumber);

    // Step 5: Check for April 1st
    // If it is April 1st, ensure the sequence number starts at 1 for the new financial year
    if (currentMonth === 3 && currentDay === 1) {
      const firstNumberInSequence = parseInt(`${year}000001`);
      if (currentSequenceNumber < firstNumberInSequence) {
        return `REQ${year}000001`;
      }
    }

    // Step 6: Increment the Sequence Number
    currentSequenceNumber += 1;

    // Step 7: Format the Sequence Number
    const formattedSequenceNumber = currentSequenceNumber
      .toString()
      .padStart(6, "0"); // Ensure the sequence number is properly zero-padded
    console.log("formatted sequence: ", formattedSequenceNumber);

    // Step 8: Format the Final Indent Number
    const generatedNumber = `REQ${formattedSequenceNumber}`;
    console.log("current sequence: ", generatedNumber);

    return generatedNumber;
  } catch (error) {
    throw new Error("Failed to generate GRN number: " + error.message);
  }
}

async function genVehicleChangeReqNo() {
  try {
    // Step 1: Calculate Financial Year
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth(); // Get the current month (0-based)
    const currentDay = currentDate.getDate(); // Get the current day of the month
    const year =
      currentMonth >= 3
        ? String(currentDate.getFullYear()).slice(-2)
        : String(currentDate.getFullYear() - 1).slice(-2);
    console.log("current Date: ", currentDate);
    console.log("Year: ", year);
    console.log("Month: ", currentMonth);
    console.log("Day: ", currentDay);

    // Step 2: Retrieve Latest Sequence Number
    // Query the BranchIndents table to get the highest sequence number
    const highestReqNo = await VehicleChangeRequest.findOne({
      attributes: [
        [
          db.Sequelize.fn(
            "MAX",
            db.Sequelize.cast(
              db.Sequelize.literal('SUBSTRING("ReqNo", 4)'),
              "INTEGER"
            )
          ),
          "highestReqNo",
        ],
      ],
    });

    console.log("Max Req number: ", highestReqNo); // Add this line for debugging
    console.log("Max Req number value: ", highestReqNo.dataValues.highestReqNo);

    // Step 3: Check if Table is Empty
    // If no indents are found in the table, return the first sequence of the current financial year
    if (!highestReqNo || !highestReqNo.dataValues.highestReqNo) {
      return `VCR${year}000001`;
    }

    // Step 4: Determine the Current Sequence Number
    let currentSequenceNumber = parseInt(highestReqNo.dataValues.highestReqNo);
    console.log("highest sequence: ", currentSequenceNumber);

    // Step 5: Check for April 1st
    // If it is April 1st, ensure the sequence number starts at 1 for the new financial year
    if (currentMonth === 3 && currentDay === 1) {
      const firstNumberInSequence = parseInt(`${year}000001`);
      if (currentSequenceNumber < firstNumberInSequence) {
        return `VCR${year}000001`;
      }
    }

    // Step 6: Increment the Sequence Number
    currentSequenceNumber += 1;

    // Step 7: Format the Sequence Number
    const formattedSequenceNumber = currentSequenceNumber
      .toString()
      .padStart(6, "0"); // Ensure the sequence number is properly zero-padded
    console.log("formatted sequence: ", formattedSequenceNumber);

    // Step 8: Format the Final Indent Number
    const generatedNumber = `VCR${formattedSequenceNumber}`;
    console.log("current sequence: ", generatedNumber);

    return generatedNumber;
  } catch (error) {
    throw new Error("Failed to generate GRN number: " + error.message);
  }
}

async function genAccApprovalReqNo() {
  try {
    // Step 1: Calculate Financial Year
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth(); // Get the current month (0-based)
    const currentDay = currentDate.getDate(); // Get the current day of the month
    const year =
      currentMonth >= 3
        ? String(currentDate.getFullYear()).slice(-2)
        : String(currentDate.getFullYear() - 1).slice(-2);
    console.log("current Date: ", currentDate);
    console.log("Year: ", year);
    console.log("Month: ", currentMonth);
    console.log("Day: ", currentDay);

    // Step 2: Retrieve Latest Sequence Number
    // Query the BranchIndents table to get the highest sequence number
    const highestReqNo = await AccApprovalRequest.findOne({
      attributes: [
        [
          db.Sequelize.fn(
            "MAX",
            db.Sequelize.cast(
              db.Sequelize.literal('SUBSTRING("ReqNo", 5)'),
              "INTEGER"
            )
          ),
          "highestReqNo",
        ],
      ],
      where: {
        ReqNo: {
          [db.Sequelize.Op.like]: `ACRQ${year}%`, // Modify the query to search for ACRQ
        },
      },
    });

    console.log("Max Req number: ", highestReqNo); // Add this line for debugging
    console.log("Max Req number value: ", highestReqNo.dataValues.highestReqNo);

    // Step 3: Check if Table is Empty
    // If no indents are found in the table, return the first sequence of the current financial year
    if (!highestReqNo || !highestReqNo.dataValues.highestReqNo) {
      return `ACRQ${year}000001`;
    }

    // Step 4: Determine the Current Sequence Number
    let currentSequenceNumber = parseInt(highestReqNo.dataValues.highestReqNo);
    console.log("highest sequence: ", currentSequenceNumber);

    // Step 5: Check for April 1st
    // If it is April 1st, ensure the sequence number starts at 1 for the new financial year
    if (currentMonth === 3 && currentDay === 1) {
      const firstNumberInSequence = parseInt(`${year}000001`);
      if (currentSequenceNumber < firstNumberInSequence) {
        return `ACRQ${year}000001`;
      }
    }

    // Step 6: Increment the Sequence Number
    currentSequenceNumber += 1;

    // Step 7: Format the Sequence Number
    const formattedSequenceNumber = currentSequenceNumber
      .toString()
      .padStart(6, "0"); // Ensure the sequence number is properly zero-padded
    console.log("formatted sequence: ", formattedSequenceNumber);

    // Step 8: Format the Final Indent Number
    const generatedNumber = `ACRQ${formattedSequenceNumber}`;
    console.log("current sequence: ", generatedNumber);

    return generatedNumber;
  } catch (error) {
    throw new Error("Failed to generate GRN number: " + error.message);
  }
}

async function genAccIssueReqNo() {
  try {
    // Step 1: Calculate Financial Year
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth(); // Get the current month (0-based)
    const currentDay = currentDate.getDate(); // Get the current day of the month
    const year =
      currentMonth >= 3
        ? String(currentDate.getFullYear()).slice(-2)
        : String(currentDate.getFullYear() - 1).slice(-2);
    console.log("current Date: ", currentDate);
    console.log("Year: ", year);
    console.log("Month: ", currentMonth);
    console.log("Day: ", currentDay);

    // Step 2: Retrieve Latest Sequence Number
    // Query the BranchIndents table to get the highest sequence number
    const highestReqNo = await AccIssueReq.findOne({
      attributes: [
        [
          db.Sequelize.fn(
            "MAX",
            db.Sequelize.cast(
              db.Sequelize.literal('SUBSTRING("IssueNo", 5)'),
              "INTEGER"
            )
          ),
          "highestReqNo",
        ],
      ],
      where: {
        IssueNo: {
          [db.Sequelize.Op.like]: `AIRQ${year}%`, // Modify the query to search for ACRQ
        },
      },
    });

    console.log("Max Req number: ", highestReqNo); // Add this line for debugging
    console.log("Max Req number value: ", highestReqNo.dataValues.highestReqNo);

    // Step 3: Check if Table is Empty
    // If no indents are found in the table, return the first sequence of the current financial year
    if (!highestReqNo || !highestReqNo.dataValues.highestReqNo) {
      return `AIRQ${year}000001`;
    }

    // Step 4: Determine the Current Sequence Number
    let currentSequenceNumber = parseInt(highestReqNo.dataValues.highestReqNo);
    console.log("highest sequence: ", currentSequenceNumber);

    // Step 5: Check for April 1st
    // If it is April 1st, ensure the sequence number starts at 1 for the new financial year
    if (currentMonth === 3 && currentDay === 1) {
      const firstNumberInSequence = parseInt(`${year}000001`);
      if (currentSequenceNumber < firstNumberInSequence) {
        return `AIRQ${year}000001`;
      }
    }

    // Step 6: Increment the Sequence Number
    currentSequenceNumber += 1;

    // Step 7: Format the Sequence Number
    const formattedSequenceNumber = currentSequenceNumber
      .toString()
      .padStart(6, "0"); // Ensure the sequence number is properly zero-padded
    console.log("formatted sequence: ", formattedSequenceNumber);

    // Step 8: Format the Final Indent Number
    const generatedNumber = `AIRQ${formattedSequenceNumber}`;
    console.log("current sequence: ", generatedNumber);

    return generatedNumber;
  } catch (error) {
    throw new Error("Failed to generate GRN number: " + error.message);
  }
}

async function genAccReturnReqNo() {
  try {
    // Step 1: Calculate Financial Year
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth(); // Get the current month (0-based)
    const currentDay = currentDate.getDate(); // Get the current day of the month
    const year =
      currentMonth >= 3
        ? String(currentDate.getFullYear()).slice(-2)
        : String(currentDate.getFullYear() - 1).slice(-2);
    console.log("current Date: ", currentDate);
    console.log("Year: ", year);
    console.log("Month: ", currentMonth);
    console.log("Day: ", currentDay);

    // Step 2: Retrieve Latest Sequence Number
    // Query the BranchIndents table to get the highest sequence number
    const highestReqNo = await AccReturnReq.findOne({
      attributes: [
        [
          db.Sequelize.fn(
            "MAX",
            db.Sequelize.cast(
              db.Sequelize.literal('SUBSTRING("ReturnNo", 5)'),
              "INTEGER"
            )
          ),
          "highestReqNo",
        ],
      ],
      where: {
        ReturnNo: {
          [db.Sequelize.Op.like]: `ARRQ${year}%`, // Modify the query to search for ACRQ
        },
      },
    });

    console.log("Max Req number: ", highestReqNo); // Add this line for debugging
    console.log("Max Req number value: ", highestReqNo.dataValues.highestReqNo);

    // Step 3: Check if Table is Empty
    // If no indents are found in the table, return the first sequence of the current financial year
    if (!highestReqNo || !highestReqNo.dataValues.highestReqNo) {
      return `ARRQ${year}000001`;
    }

    // Step 4: Determine the Current Sequence Number
    let currentSequenceNumber = parseInt(highestReqNo.dataValues.highestReqNo);
    console.log("highest sequence: ", currentSequenceNumber);

    // Step 5: Check for April 1st
    // If it is April 1st, ensure the sequence number starts at 1 for the new financial year
    if (currentMonth === 3 && currentDay === 1) {
      const firstNumberInSequence = parseInt(`${year}000001`);
      if (currentSequenceNumber < firstNumberInSequence) {
        return `ARRQ${year}000001`;
      }
    }

    // Step 6: Increment the Sequence Number
    currentSequenceNumber += 1;

    // Step 7: Format the Sequence Number
    const formattedSequenceNumber = currentSequenceNumber
      .toString()
      .padStart(6, "0"); // Ensure the sequence number is properly zero-padded
    console.log("formatted sequence: ", formattedSequenceNumber);

    // Step 8: Format the Final Indent Number
    const generatedNumber = `ARRQ${formattedSequenceNumber}`;
    console.log("current sequence: ", generatedNumber);

    return generatedNumber;
  } catch (error) {
    throw new Error("Failed to generate GRN number: " + error.message);
  }
}

async function genAccJobOrderNo() {
  try {
    // Step 1: Calculate Financial Year
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth(); // Get the current month (0-based)
    const currentDay = currentDate.getDate(); // Get the current day of the month
    const year =
      currentMonth >= 3
        ? String(currentDate.getFullYear()).slice(-2)
        : String(currentDate.getFullYear() - 1).slice(-2);
    console.log("current Date: ", currentDate);
    console.log("Year: ", year);
    console.log("Month: ", currentMonth);
    console.log("Day: ", currentDay);

    // Step 2: Retrieve Latest Sequence Number
    // Query the BranchIndents table to get the highest sequence number
    const highestReqNo = await AccJobOrder.findOne({
      attributes: [
        [
          db.Sequelize.fn(
            "MAX",
            db.Sequelize.cast(
              db.Sequelize.literal('SUBSTRING("JobOrderNo", 4)'),
              "INTEGER"
            )
          ),
          "highestReqNo",
        ],
      ],
      where: {
        JobOrderNo: {
          [db.Sequelize.Op.like]: `AJO${year}%`, // Modify the query to search for ACRQ
        },
      },
    });

    console.log("Max Req number: ", highestReqNo); // Add this line for debugging
    console.log("Max Req number value: ", highestReqNo.dataValues.highestReqNo);

    // Step 3: Check if Table is Empty
    // If no indents are found in the table, return the first sequence of the current financial year
    if (!highestReqNo || !highestReqNo.dataValues.highestReqNo) {
      return `AJO${year}000001`;
    }

    // Step 4: Determine the Current Sequence Number
    let currentSequenceNumber = parseInt(highestReqNo.dataValues.highestReqNo);
    console.log("highest sequence: ", currentSequenceNumber);

    // Step 5: Check for April 1st
    // If it is April 1st, ensure the sequence number starts at 1 for the new financial year
    if (currentMonth === 3 && currentDay === 1) {
      const firstNumberInSequence = parseInt(`${year}000001`);
      if (currentSequenceNumber < firstNumberInSequence) {
        return `AJO${year}000001`;
      }
    }

    // Step 6: Increment the Sequence Number
    currentSequenceNumber += 1;

    // Step 7: Format the Sequence Number
    const formattedSequenceNumber = currentSequenceNumber
      .toString()
      .padStart(6, "0"); // Ensure the sequence number is properly zero-padded
    console.log("formatted sequence: ", formattedSequenceNumber);

    // Step 8: Format the Final Indent Number
    const generatedNumber = `AJO${formattedSequenceNumber}`;
    console.log("current sequence: ", generatedNumber);

    return generatedNumber;
  } catch (error) {
    throw new Error("Failed to generate GRN number: " + error.message);
  }
}

async function genAccCartRemovalNo() {
  try {
    // Step 1: Calculate Financial Year
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth(); // Get the current month (0-based)
    const currentDay = currentDate.getDate(); // Get the current day of the month
    const year =
      currentMonth >= 3
        ? String(currentDate.getFullYear()).slice(-2)
        : String(currentDate.getFullYear() - 1).slice(-2);
    console.log("current Date: ", currentDate);
    console.log("Year: ", year);
    console.log("Month: ", currentMonth);
    console.log("Day: ", currentDay);

    // Step 2: Retrieve Latest Sequence Number
    // Query the BranchIndents table to get the highest sequence number
    const highestReqNo = await AccApprovalCartCancelReq.findOne({
      attributes: [
        [
          db.Sequelize.fn(
            "MAX",
            db.Sequelize.cast(
              db.Sequelize.literal('SUBSTRING("ReqNo", 5)'),
              "INTEGER"
            )
          ),
          "highestReqNo",
        ],
      ],
      where: {
        ReqNo: {
          [db.Sequelize.Op.like]: `ACCR${year}%`, // Modify the query to search for ACRQ
        },
      },
    });

    console.log("Max Req number: ", highestReqNo); // Add this line for debugging
    console.log("Max Req number value: ", highestReqNo.dataValues.highestReqNo);

    // Step 3: Check if Table is Empty
    // If no indents are found in the table, return the first sequence of the current financial year
    if (!highestReqNo || !highestReqNo.dataValues.highestReqNo) {
      return `ACCR${year}000001`;
    }

    // Step 4: Determine the Current Sequence Number
    let currentSequenceNumber = parseInt(highestReqNo.dataValues.highestReqNo);
    console.log("highest sequence: ", currentSequenceNumber);

    // Step 5: Check for April 1st
    // If it is April 1st, ensure the sequence number starts at 1 for the new financial year
    if (currentMonth === 3 && currentDay === 1) {
      const firstNumberInSequence = parseInt(`${year}000001`);
      if (currentSequenceNumber < firstNumberInSequence) {
        return `ACCR${year}000001`;
      }
    }

    // Step 6: Increment the Sequence Number
    currentSequenceNumber += 1;

    // Step 7: Format the Sequence Number
    const formattedSequenceNumber = currentSequenceNumber
      .toString()
      .padStart(6, "0"); // Ensure the sequence number is properly zero-padded
    console.log("formatted sequence: ", formattedSequenceNumber);

    // Step 8: Format the Final Indent Number
    const generatedNumber = `ACCR${formattedSequenceNumber}`;
    console.log("current sequence: ", generatedNumber);

    return generatedNumber;
  } catch (error) {
    throw new Error("Failed to generate GRN number: " + error.message);
  }
}

async function genInvoiceNo(BranchCode, PurchaseType) {
  try {
    // Step 1: Calculate Financial Year
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth(); // Get the current month (0-based)
    const currentDay = currentDate.getDate(); // Get the current day of the month
    const year =
      currentMonth >= 3
        ? String(currentDate.getFullYear()).slice(-2)
        : String(currentDate.getFullYear() - 1).slice(-2);
    console.log("current Date: ", currentDate);
    console.log("Year: ", year);
    console.log("Month: ", currentMonth);
    console.log("Day: ", currentDay);

    // Step 2: Retrieve Latest Sequence Number
    // Query the BranchIndents table to get the highest sequence number
    const highestInvoiceNo = await Invoice.findOne({
      attributes: [
        [
          Seq.fn(
            "MAX",
            Seq.cast(
              Seq.fn(
                "SUBSTRING",
                Seq.col("InvoiceNo"),
                Seq.fn("REGEXP_INSTR", Seq.col("InvoiceNo"), "[0-9]+$")
              ),
              "INTEGER"
            )
          ),
          "MaxInvoiceNumber",
        ],
      ],
      where: {
        InvoiceNo: {
          [Op.like]: `${BranchCode}/${PurchaseType}/%`, // Filter by branchCode dynamically
        },
      },
    });

    console.log("Max Req number: ", highestInvoiceNo); // Add this line for debugging
    console.log(
      "Max Req number value: ",
      highestInvoiceNo.dataValues.MaxInvoiceNumber
    );

    // Step 3: Check if Table is Empty
    // If no indents are found in the table, return the first sequence of the current financial year
    if (!highestInvoiceNo || !highestInvoiceNo.dataValues.MaxInvoiceNumber) {
      return `${BranchCode}/${PurchaseType}/${year}00001`;
    }

    // Step 4: Determine the Current Sequence Number
    let currentSequenceNumber = parseInt(
      highestInvoiceNo.dataValues.MaxInvoiceNumber
    );
    console.log("highest sequence: ", currentSequenceNumber);

    // Step 5: Check for April 1st
    // If it is April 1st, ensure the sequence number starts at 1 for the new financial year
    if (currentMonth === 3 && currentDay === 1) {
      const firstNumberInSequence = parseInt(`${year}00001`);
      if (currentSequenceNumber < firstNumberInSequence) {
        return `${BranchCode}/${PurchaseType}/${year}00001`;
      }
    }

    // Step 6: Increment the Sequence Number
    currentSequenceNumber += 1;

    // Step 7: Format the Sequence Number
    const formattedSequenceNumber = currentSequenceNumber
      .toString()
      .padStart(5, "0"); // Ensure the sequence number is properly zero-padded
    console.log("formatted sequence: ", formattedSequenceNumber);

    // Step 8: Format the Final Indent Number
    const generatedNumber = `${BranchCode}/${PurchaseType}/${formattedSequenceNumber}`;
    console.log("current sequence: ", generatedNumber);

    return generatedNumber;
  } catch (error) {
    throw new Error("Failed to generate GRN number: " + error.message);
  }
}

async function genDemoConvReqNo() {
  try {
    // Step 1: Calculate Financial Year
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth(); // Get the current month (0-based)
    const currentDay = currentDate.getDate(); // Get the current day of the month
    const year =
      currentMonth >= 3
        ? String(currentDate.getFullYear()).slice(-2)
        : String(currentDate.getFullYear() - 1).slice(-2);
    console.log("current Date: ", currentDate);
    console.log("Year: ", year);
    console.log("Month: ", currentMonth);
    console.log("Day: ", currentDay);

    // Step 2: Retrieve Latest Sequence Number
    // Query the DemoConversion table to get the highest sequence number
    const highestReqNo = await DemoConversion.findOne({
      attributes: [
        [
          db.Sequelize.fn(
            "MAX",
            db.Sequelize.cast(
              db.Sequelize.literal('SUBSTRING("ReqNo", 5)'), // Start from the 5th character to remove "DMCV"
              "INTEGER"
            )
          ),
          "highestReqNo",
        ],
      ],
      where: {
        ReqNo: {
          [db.Sequelize.Op.like]: `DMCV${year}%`, // Modify the query to search for DMCV
        },
      },
    });

    console.log("Max Req number: ", highestReqNo); // Add this line for debugging
    const highestReqNoValue = highestReqNo
      ? highestReqNo.dataValues.highestReqNo
      : null;

    // Step 3: Check if Table is Empty
    if (!highestReqNoValue) {
      return `DMCV${year}00001`;
    }

    // Step 4: Determine the Current Sequence Number
    let currentSequenceNumber = parseInt(highestReqNoValue, 10);
    console.log("highest sequence: ", currentSequenceNumber);

    // Step 5: Check for April 1st
    if (currentMonth === 3 && currentDay === 1) {
      const firstNumberInSequence = parseInt(`${year}00001`);
      if (currentSequenceNumber < firstNumberInSequence) {
        return `DMCV${year}00001`;
      }
    }

    // Step 6: Increment the Sequence Number
    currentSequenceNumber += 1;

    // Step 7: Format the Sequence Number (Remove year prefix from currentSequenceNumber)
    const sequenceWithoutYear = currentSequenceNumber % 100000; // Remove year prefix
    const formattedSequenceNumber = sequenceWithoutYear
      .toString()
      .padStart(5, "0");
    console.log("formatted sequence: ", formattedSequenceNumber);

    // Step 8: Format the Final Request Number
    const generatedNumber = `DMCV${year}${formattedSequenceNumber}`;
    console.log("current sequence: ", generatedNumber);

    return generatedNumber;
  } catch (error) {
    throw new Error(
      "Failed to generate DemoConversion Request No: " + error.message
    );
  }
}

module.exports = {
  generateModelMasterImgName,
  genDocNameforCustomer,
  generateBIndentNo,
  generateDIndentNo,
  generateBDCNo,
  generateDDCNo,
  generateGRNNo,
  generateBookingNo,
  genPartName,
  genDocNameforFin,
  generateRandomOTP,
  convertTimestamp,
  finApprovedDocument,
  formatDate,
  genFinApplicationNumber,
  genChequeName,
  genDocNameforBooking,
  genRequestNo,
  generateReceiptNo,
  genDocNameforFinLoan,
  genDocNameforFinPayment,
  generateModuleCode,
  genIconNameinForms,
  generateFormCode,
  generateAllotReqNo,
  genVehicleChangeReqNo,
  generateRoleCode,
  genVendorDocuments,
  genAccApprovalReqNo,
  generateLevelID,
  genAccIssueReqNo,
  genAccReturnReqNo,
  genAccJobOrderNo,
  generateRequestNo,
  genDocTestDriveDocName,
  genDocNameforDriveMaster,
  genAccCartRemovalNo,
  genInvoiceNo,
  generateRequestIDForBookingTransfer,
  genBookingCancellationReqNo,
  genDemoConvReqNo,
};
