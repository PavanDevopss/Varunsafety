const db = require("../models"); // Adjust model import based on your actual model setup♂
const DepartmentMaster = db.departmentmaster;
const APIActionMaster = db.apiactionmaster;
// Mapping function for offers table
function mapExcelToDatabaseForOffers(
  excelData,
  DiscountID,
  DiscountName,
  BranchID
) {
  return excelData.map((row) => ({
    OfferName: row["OfferName"] || null,
    DiscountID: DiscountID || null,
    DiscountName: DiscountName || null,
    ValidFrom: parseDateToJSDate(row["Valid From"]) || null,
    ValidUpto: parseDateToJSDate(row["Valid Upto"]) || null,
    BranchID: BranchID || null,
    BranchCode: row["BranchCode"] || null,
    ModelCode: row["ModelCode"] || null,
    VariantCode: row["VariantCode"] || null,
    ColourCode: row["ColourCode"] || null,
    TransmissionCode: row["TransmissionCode"] || null,
    FuelTypeCode: row["FuelCode"] || null,
    DealerShare: row["Dealer Share"] || null,
    MFGShare: row["MFG Share"] || null,
    TaxAmount: null,
    OfferAmount: null,
  }));
}

// Example mapping function for another table
function mapExcelToDatabaseForSKUMaster(excelData) {
  return excelData.map((row) => ({
    SKUCode: row["SKUCode"] || null,
    ModelCode: row["Model Code"] || null,
    VariantCode: row["Variant Code"] || null,
    VariantDescription: row["VariantDescription"] || null,
    IGSTRate: row["IGSTRate"] || null,
    CESSRate: row["CESSRate"] || null,
    HSNCode: row["HSNCode"] || null,
    DRF: row["DRF"] || null,
    FuelCode: row["Fuel Code"] || null,
    IsActive: true,
    Status: "Active",
    ModelMasterID: null, // Not available in the Excel data
    VariantID: null, // Not available in the Excel data
    FuelTypeID: null, // Not available in the Excel data
  }));
}

function mapExcelToDatabaseForVehicleStock(
  excelData,
  BranchCode,
  BranchID,
  VendorName,
  VendorMasterID
) {
  return excelData.map((row) => ({
    VendorName: VendorName || null,
    VendorID: VendorMasterID || null,
    CITY: row["CITY"] || null,
    INVOICETYPE: row["INVOICETYPE"] || null,
    FinNo: row["Fin No"] || null,
    ACCOUNTCODE: row["ACCOUNTCODE"] || null,
    CHASSISPREFIX: row["CHASSISPREFIX"] || null,
    INV_DATE_FOR_ROAD_PERMIT: row["INV_DATE_FOR_ROAD_PERMIT"] || null,
    BasicValue: parseFloat(row["Basic Value"]) || null,
    AssessableValue: row["Assessable Value"] || null,
    TCS: row["TCS"] || null,
    ORDERCATEGORY: row["ORDERCATEGORY"] || null,
    PLANT: row["PLANT"] || null,
    TIN: row["TIN"] || null,
    SENTBY: row["SENTBY"] || null,
    TRIPNO_CONSIGNMENTNO: row["TRIPNO/CONSIGNMENTNO"] || null,
    INDENT_ALLOTNO: row["INDENT / ALLOTNO"] || null,
    EMAILID: row["EMAILID"] || null,
    FINANCIER: row["FINANCIER"] || null,
    PurchasedFrom: null, // Assuming always null
    BranchID: BranchID || null,
    BranchCode: BranchCode || null,
    VariantCode: row["VarientCode"] || null,
    SKUCode: row["MODELCODE"] || null,
    ModelCode: row["ModelCode"] || null,
    ColourCode: row["COLOR"] || null,
    EngineNo: row["ENGINENO"] || null,
    // ChassisNo: (row["CHASSISPREFIX"] || "") + (row["CHASSISNO"] || ""), // Concatenate CHASSISPREFIX and CHASSISNO
    ChassisNo: row["CHASSISNO"] || null,
    KeyNo: null, // Assuming always null
    FuelType: row["FuelType"] || null,
    InvoiceNo: row["Invoice GP No"] || null,
    InvoiceDate: row["INVOICEDATE"] || null,
    GRNNo: row["GR No"] || null,
    GRNDate: null, // Assuming always null
    StockInDate: null, // Assuming always null
    EWayBillNo: null, // Assuming always null
    TruckNo: row["TRANSPORTREGNUMBER"] || null,
    TransporterName: row["TRANSNAME"] || null,
    Discount: parseFloat(row["Discount(Spot)"]) || null,
    DRF: parseFloat(row["DRF"]) || null,
    TaxableValue: parseFloat(row["TaxableValue"]) || null,
    IGSTRate: parseFloat(row["IGSTRate"]) || null, //from SKU Master
    CESSRate: parseFloat(row["CESSRate"]) || null, //from SKU Master
    IGSTAmt: parseFloat(row["IGST 28%"]) || null,
    CGSTAmt: row["CGSTAmt"] || null,
    SGSTAmt: row["SGSTAmt"] || null,
    CESSAmt: row["Cess"] || null,
    InvoiceValue: parseFloat(row["InvoiceAmt(Rs)"]) || null,
    // DispatchCode: (row["DELR"] || "") + (row["CITY"] || ""),
    DispatchCode: row["DELR"] || null,
    Remarks: null, // Assuming always null
    FundAccount: null, // Assuming always null
    Status: null, // Assuming always null
    CreatedDate: new Date(), // Assuming default creation date
    ModifiedDate: new Date(), // Assuming default modification date
  }));
}

function mapExcelToDatabaseForEnquiryDMS(excelData) {
  return excelData.map((row) => ({
    Branch: row["Dealer Location"] || null,
    EnquiryNo: row["Enquiry No."] || null,
    Date: parseDateToJSDate(row["Enquiry Date"]) || null,
    TeamLeadName: row["Team Lead Name"] || null,
    DSECode: row["DSE Code"] || null,
    User: row["DSE Name"] || null,
    CustomerType: row["Customer Type"] || null,
    CompanyInstitution: row["Company/Institution"] || null,
    SubCompany: row["Sub_Company"] || null,
    Title: row["Title_Name"] || null,
    FirstName: row["Prospect Name"] || null,
    Address: row["Address"] || null,
    PINCode: row["Pin Code"] || null,
    PINDescription: row["Pin Desc"] || null,
    STDCodeResPhNo: row["STD Code Res. Phone"] || null,
    ResPhone: row["Res. Phone"] || null,
    STDCodeOfficePhone: row["STD Code Office Phone"] || null,
    OfficePhone: row["Office Phone"] || null,
    MobileNo: row["Mobile Number"] || null,
    STDCodeFAX: row["STD Code FAX"] || null,
    FAXNo: row["FAX Number"] || null,
    EmailID: row["Email-Id"] || null,
    ModelCode: row["Model Code"] || null,
    Model: row["Model Name"] || null,
    FuelType: row["Fuel Type"] || null,
    VariantCode: row["Variant Code"] || null,
    Variant: row["Variant Name"] || null,
    FinancierName: row["Financier Name"] || null,
    DSAName: row["DSA Name"] || null,
    EnquiryStatus: row["Enquiry Status"] || null,
    EnquiryStatusDate: parseDateToJSDate(row["Enquiry Status Date"]) || null,
    Source: row["Source"] || null,
    SubSource: row["Sub Source"] || null,
    BuyerType: row["Buyer Type"] || null,
    TradeIn: row["TradeIn"] || null,
    Mode: row["Mode"] || null,
    LostorDropReason: row["Lost or Drop Reason"] || null,
    FeedbackorRemarks: row["Feedback or Remarks"] || null,
    CustomerRequest: row["Customer Request"] || null,
    DateofBirth: row["Date of Birth"] || null,
    DateofAnniversary: row["Date of Wedding"] || null,
    TestDriveGiven: row["Test Drive Given"] || null,
    TestDriveDate: parseDateToJSDate(row["Test Drive Date"]) || null,
    FvisitDate: parseDateToJSDate(row["Fvisit Date"]) || null,
    Ageing: row["Ageing"] || null,
    DealerName: row["Dealer Name"] || null,
    BuyingNo: row["Buying No"] || null,
    EvaluatorName: row["Evaluator Name"] || null,
    EvaluatorMSPIN: row["Evaluator MSPIN"] || null,
    OldCarOwnerName: row["Old Car Owner Name"] || null,
    EvaluationDate: parseDateToJSDate(row["Evaluation Date"]) || null,
    OldVehStatus: row["Old Veh. Status"] || null,
    RefPrice: row["Ref Price"] || null,
    ReOfferedPrice: row["Re Offered Price"] || null,
    CustomerExpPrice: row["Customer Exp. Price"] || null,
    LatestOfferedPrice: row["Latest Offered Price"] || null,
    BoughtDate: row["Bought Date"] || null,
    LostToPOC: row["Lost To POC"] || null,
    ReferenceType: row["Reference Type"] || null,
    ReferredBy: row["Referred By"] || null,
    ReferenceNo: row["Reference No."] || null,
    RefVehicleRegnNo: row["Ref Vehicle Regn No."] || null,
    RefMobileNo: row["Ref Mobile No."] || null,
    StateDesc: row["State Desc"] || null,
    District: row["District"] || null,
    TehsilDesc: row["Tehsil Desc"] || null,
    VillageName: row["Village Name"] || null,
    EnquiryStrength: row["Enquiry Strength"] || null,
    Tenure: row["Tenure"] || null,
    Registrationtype: row["Registration type"] || null,
    Price: row["Price"] || null,
    Leasecompany: row["Lease company"] || null,
    Colour: row["Colour"] || null,
    Transmission: row["Transmission"] || null,
  }));
}

// Function to parse Excel date numeric values
function excelDateToJSDate(excelDate) {
  // Excel dates are serialized days since 1900-01-01 (Excel's epoch)
  // JavaScript dates are milliseconds since 1970-01-01 (Unix epoch)
  const unixEpochInExcelDays = 25569; // 1970-01-01 in Excel days

  // Calculate the Unix timestamp in milliseconds
  const msPerDay = 24 * 60 * 60 * 1000; // Number of milliseconds in a day
  const unixTimestamp = (excelDate - unixEpochInExcelDays) * msPerDay;

  // Create a new Date object
  const dateObj = new Date(unixTimestamp);

  return dateObj;
}

// Function to parse Excel date numeric values
function parseDateToJSDate(value) {
  // Check if the value is a number (Excel date format)
  if (typeof value === "number") {
    // Convert Excel date to JavaScript Date object
    return excelDateToJSDate(value);
  } else {
    // If it's not a number, return the value as-is (assuming it's already a Date object or string)
    return value;
  }
}

async function findAllDepartments() {
  try {
    const departments = await DepartmentMaster.findAll({
      attributes: ["DeptID", "DeptCode", "DeptName", "IsActive", "Status"],
    });

    return departments.map((dept) => ({
      DeptID: dept.DeptID,
      DeptCode: dept.DeptCode,
      DeptName: dept.DeptName,
      IsActive: dept.IsActive,
      Status: dept.Status,
    }));
  } catch (error) {
    throw new Error(`Error fetching departments: ${error.message}`);
  }
}

async function findAllActions() {
  try {
    const actions = await APIActionMaster.findAll({
      attributes: ["ActionID", "ActionName", "IsActive", "Status"],
    });

    return actions.map((action) => ({
      ActionID: action.ActionID,
      ActionName: action.ActionName,
      IsActive: action.IsActive,
      Status: action.Status,
    }));
  } catch (error) {
    throw new Error(`Error fetching actions: ${error.message}`);
  }
}

module.exports = {
  mapExcelToDatabaseForOffers,
  mapExcelToDatabaseForSKUMaster,
  mapExcelToDatabaseForVehicleStock,
  mapExcelToDatabaseForEnquiryDMS,
  findAllDepartments,
  findAllActions,
};
