// Importing configuration and dependencies
const dbConfig = require("../config/db.config.js"); // Import database configuration
// const associateModels = require("./AssociationsForModels.js"); // Import model association definitions
const Sequelize = require("sequelize"); // Import Sequelize ORM

// Initialize Sequelize with database configuration
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST, // Database host
  dialect: dbConfig.dialect, // Database dialect (e.g., 'mysql', 'postgres')

  // Connection pool configuration
  pool: {
    max: dbConfig.pool.max, // Maximum number of connections in the pool
    min: dbConfig.pool.min, // Minimum number of connections in the pool
    acquire: dbConfig.pool.acquire, // Maximum time in milliseconds that a connection can be idle before being released
    idle: dbConfig.pool.idle, // Maximum time in milliseconds that a connection can be idle before being released
  },
});

// // Initialize Sequelize with the connection string
// const sequelize = new Sequelize(dbConfig.CONNECTION_STRING, {
//   dialect: dbConfig.dialect, // Database dialect (e.g., 'mysql', 'postgres')

//   // Connection pool configuration
//   pool: {
//     max: dbConfig.pool.max, // Maximum number of connections in the pool
//     min: dbConfig.pool.min, // Minimum number of connections in the pool
//     acquire: dbConfig.pool.acquire, // Maximum time in milliseconds that a connection can be idle before being released
//     idle: dbConfig.pool.idle, // Maximum time in milliseconds that a connection can be idle before being released
//   },
// });

// Create an object to store Sequelize instance and models
const db = {};

// Add Sequelize and sequelize instance to db object
db.Sequelize = Sequelize; // Add Sequelize constructor
db.sequelize = sequelize; // Add Sequelize instance

// Define your models

// Master models
// API Action Master model
db.apiactionmaster = require("./APIActionMaster.model.js")(
  sequelize,
  Sequelize
);

// Purchase Entries model
db.vehiclestock = require("./VehicleStock.model.js")(sequelize, Sequelize);

// Purchase Entries Temporary model
db.vehiclestock_temp = require("./VehicleStock_Temp.model.js")(
  sequelize,
  Sequelize
);

// Branch Indents model
db.branchindents = require("./BranchIndents.model.js")(sequelize, Sequelize);

// Branch Master model
db.branchmaster = require("./BranchMaster.model.js")(sequelize, Sequelize);

// Branch Transfers Check List model
db.btchecklist = require("./BranchTransferCheckList.model.js")(
  sequelize,
  Sequelize
);

// Branch Types model
db.branchtypes = require("./BranchTypes.model.js")(sequelize, Sequelize);

// Channel Master model
db.channelmaster = require("./ChannelMaster.model.js")(sequelize, Sequelize);

// Company Level model
db.companylevel = require("./CompanyLevel.model.js")(sequelize, Sequelize);

// Customer models
// Customer Document Information model
db.customerdocinfo = require("./CustomerDocInfo.model.js")(
  sequelize,
  Sequelize
);

// Customer GST Information model
db.customergstinfo = require("./CustomerGSTInfo.model.js")(
  sequelize,
  Sequelize
);

// Customer Master model
db.customermaster = require("./CustomerMaster.model.js")(sequelize, Sequelize);

// Dealer Indents model
db.dealerindents = require("./DealerIndents.model.js")(sequelize, Sequelize);

// Document Types model
db.documenttypes = require("./DocumentTypes.model.js")(sequelize, Sequelize);

// Document Verification model
db.documentverification = require("./DocVerfication.model.js")(
  sequelize,
  Sequelize
);

// Employee Roles model
db.employeeroles = require("./EmployeeRoles.model.js")(sequelize, Sequelize);

// Enquiry DMS model
db.enquirydms = require("./EnquiryDMS.model.js")(sequelize, Sequelize);

// Fuel Types model
db.fueltypes = require("./FuelType.model.js")(sequelize, Sequelize);

// Model Master model
db.modelmaster = require("./ModelMaster.model.js")(sequelize, Sequelize);

// Model Type model
db.modeltype = require("./ModelType.model.js")(sequelize, Sequelize);

// Module Master model
db.modulemaster = require("./ModuleMaster.model.js")(sequelize, Sequelize);

// State POS model
db.statepos = require("./StatePOS.model.js")(sequelize, Sequelize);

// Transmission model
db.transmission = require("./Transmission.model.js")(sequelize, Sequelize);

// User Master model
db.usermaster = require("./UserMaster.model.js")(sequelize, Sequelize);

// Variant Master model
db.variantmaster = require("./VariantMaster.model.js")(sequelize, Sequelize);

// Offer Temporary model
db.offer_temp = require("./Offer_Temp..model.js")(sequelize, Sequelize);

// Variant Mapping model
db.variantmapping = require("./VariantMapping.model.js")(sequelize, Sequelize);

// Vendor Master model
db.vendormaster = require("./VendorMaster.model.js")(sequelize, Sequelize);

// Customer Employee Mapping model
db.CustEmpMaping = require("./CustomerEmployeeMapping.model.js")(
  sequelize,
  Sequelize
);

// New Car Bookings model
db.NewCarBookings = require("./NewCarBookings.model.js")(sequelize, Sequelize);

// Payment Requests model
db.PaymentRequests = require("./PaymentRequests.model.js")(
  sequelize,
  Sequelize
);

// Customer Receipt model
db.CustReceipt = require("./Receipt.model.js")(sequelize, Sequelize);

// Payment Reference model
db.paymentRef = require("./PaymentReference.model.js")(sequelize, Sequelize);

// Parent Company model
db.parentcompany = require("./ParentCompany.model.js")(sequelize, Sequelize);

// // Division Master model
// db.divisionmaster = require("./DivisionMaster.model.js")(sequelize, Sequelize);

// Industry Master model
db.industrymaster = require("./IndustryMaster.model.js")(sequelize, Sequelize);

// OEM Master model
db.oemmaster = require("./OEMMaster.model.js")(sequelize, Sequelize);

// Company Master model
db.companymaster = require("./CompanyMaster.model.js")(sequelize, Sequelize);

// Company State Map model
db.cmpystatemap = require("./CmpyStateMap.model.js")(sequelize, Sequelize);

// Company GST Master model
db.companygstmaster = require("./CompanyGSTMaster.model.js")(
  sequelize,
  Sequelize
);

// Nation Master model
db.nationmaster = require("./NationMaster.model.js")(sequelize, Sequelize);

// Company States model
db.companystates = require("./CompanyStates.model.js")(sequelize, Sequelize);

// State Master model
db.statemaster = require("./StateMaster.model.js")(sequelize, Sequelize);

// Region Master model
db.regionmaster = require("./RegionMaster.model.js")(sequelize, Sequelize);

// Company Region model
db.companyregions = require("./CompanyRegions.model.js")(sequelize, Sequelize);

// Cluster Master model
db.clustermaster = require("./ClusterMaster.model.js")(sequelize, Sequelize);

// Employee Master model
db.employeemaster = require("./EmployeeMaster.model.js")(sequelize, Sequelize);

// Roles Master model
db.rolesmaster = require("./RolesMaster.model.js")(sequelize, Sequelize);

// Forms Master model
db.formsmaster = require("./FormsMaster.model.js")(sequelize, Sequelize);

// Department Master model
db.departmentmaster = require("./DepartmentMaster.model.js")(
  sequelize,
  Sequelize
);

// Form Access Rights model
db.formaccessrights = require("./FormAccessRights.model.js")(
  sequelize,
  Sequelize
);

// Teams model
db.teams = require("./Teams.model.js")(sequelize, Sequelize);

// Team Members model
db.teammembers = require("./TeamMembers.model.js")(sequelize, Sequelize);

// Bank Master model
db.bankmaster = require("./BankMaster.model.js")(sequelize, Sequelize);

// Company Bank Account model
db.cmpybankaccount = require("./CmpyBankAccount.model.js")(
  sequelize,
  Sequelize
);

// Cheque Tracking model
db.chequetracking = require("./ChequeTracking.model.js")(sequelize, Sequelize);

// Discount Models
// Discount Master model
db.discountmaster = require("./DiscountMaster.model.js")(sequelize, Sequelize);

// Offers model
db.offers = require("./Offers.model.js")(sequelize, Sequelize);

// Offers Approvals model
db.offersapprovals = require("./OffersApprovals.model.js")(
  sequelize,
  Sequelize
);

// Approval Referral model
db.approvalrefferal = require("./ApprovalRefferal.model.js")(
  sequelize,
  Sequelize
);

// Accessories models
// Accessory Part Master model
db.accpartmaster = require("./AccPartMaster.model.js")(sequelize, Sequelize);

// Accessory Part Map with Model model
db.accpartmapwithmodel = require("./AccPartMapWithModel.model.js")(
  sequelize,
  Sequelize
);

// Accessory Part Images model
db.accpartimages = require("./AccPartImage.model.js")(sequelize, Sequelize);

// accesories category
db.acccategory = require("./AccCategory.model.js")(sequelize, Sequelize);

//accesorries subcategory
db.accsubcategory = require("./AccSubCategory.model.js")(sequelize, Sequelize);

db.accwishlist = require("./AccWishListmodel.js")(sequelize, Sequelize);
db.acccart = require("./AccCart.model.js")(sequelize, Sequelize);

// Finance models
// Finance Master model
db.financemaster = require("./FinanceMaster.model.js")(sequelize, Sequelize);

// Finance Application model
db.financeapplication = require("./FinanceApplication.model.js")(
  sequelize,
  Sequelize
);

// Finance Application Applicant model
db.finappapplicant = require("./FinAppApplicant.model.js")(
  sequelize,
  Sequelize
);

// Finance Application Co-Applicant model
db.finappcoapplicant = require("./FinAppCoApplicant.model.js")(
  sequelize,
  Sequelize
);

// Finance Application Documents model
db.financedocuments = require("./FinanceDocuments.model.js")(
  sequelize,
  Sequelize
);

// Finance Application Status model
db.finstatusupdate = require("./FinStatusUpdate.model.js")(
  sequelize,
  Sequelize
);

// Finance Application Status Tracking model
db.finstatustracking = require("./FinStatusTracking.model.js")(
  sequelize,
  Sequelize
);

// FinanceLoanApplication
db.financeloanapplication = require("./FinanceLoanApplication.model.js")(
  sequelize,
  Sequelize
);

// Dealer Transfer Check List model
db.dtCheckList = require("./DealerTrasferCheckList.model.js")(
  sequelize,
  Sequelize
);

// GST Error Codes and Master Codes
db.gstewberrorcodes = require("./GSTEWBErrorCodes.model.js")(
  sequelize,
  Sequelize
);

db.gstirnerrorcodes = require("./GSTIRNErrorCodes.model.js")(
  sequelize,
  Sequelize
);

db.gstewbmastercodes = require("./GSTEWBMasterCodes.model.js")(
  sequelize,
  Sequelize
);

// MSME Info Model
db.msmeInfo = require("./MSMEInfo.model.js")(sequelize, Sequelize);

// Accessory Part Images model
db.accpartimages = require("./AccPartImage.model.js")(sequelize, Sequelize);

// Bookings Documents model
db.bookingsdocinfo = require("./BookingsDocInfo.model.js")(
  sequelize,
  Sequelize
);

// Finance Payments model
db.financepayments = require("./FinancePayments.model.js")(
  sequelize,
  Sequelize
);

db.authreq = require("./AuthReq.model.js")(sequelize, Sequelize);
db.authresponse = require("./AuthResponse.model.js")(sequelize, Sequelize);
db.ewbreq = require("./EWBReq.model.js")(sequelize, Sequelize);
db.ewbres = require("./EWBRes.model.js")(sequelize, Sequelize);
db.vasproductpricing = require("./VASProductPricing.model.js")(
  sequelize,
  Sequelize
);
db.valueaddedservice = require("./ValueAddedService.model.js")(
  sequelize,
  Sequelize
);
db.submodule = require("./SubModule.module.js")(sequelize, Sequelize);

// Branch Transfers model
db.branchtransfers = require("./BranchTransfers.model.js")(
  sequelize,
  Sequelize
);

// Dealer Transfers model
db.dealertransfers = require("./DealerTransfers.model.js")(
  sequelize,
  Sequelize
);

// Colour Category model
db.colourcategory = require("./ColourCategory.model.js")(sequelize, Sequelize);

// Colour Master model
db.colourmaster = require("./ColourMaster.model.js")(sequelize, Sequelize);

// SKU Master model
db.skumaster = require("./SKUMaster.model.js")(sequelize, Sequelize);

// SKU Master Temporary model
db.skumaster_temp = require("./SKUMaster_Temp.model.js")(sequelize, Sequelize);

// Colour Mapping model
db.colourmapping = require("./ColourMapping.model.js")(sequelize, Sequelize);

// Vehicle Allotment model
db.vehicleallotment = require("./VehicleAllotment.model.js")(
  sequelize,
  Sequelize
);

// Allotment Vehicle Change model
db.vehiclechangereq = require("./VehicleChangeRequest.model.js")(
  sequelize,
  Sequelize
);
//Model Colour Mapping model
db.modelcolourmapping = require("./ModelColourMapping.model.js")(
  sequelize,
  Sequelize
);

// Acc Approval Request
db.accapprovalreq = require("./AccApprovalReq.model.js")(sequelize, Sequelize);

// Acc Approval Refferal
db.accapprovalref = require("./AccApprovalRefferal.model.js")(
  sequelize,
  Sequelize
);

// Acc Approved Cart
db.accapprovedcart = require("./AccApprovedCart.model.js")(
  sequelize,
  Sequelize
);

// Acc Approved Cart
db.accapprovedcart = require("./AccApprovedCart.model.js")(
  sequelize,
  Sequelize
);

// Acc Approval Refferal
db.accapprovalref = require("./AccApprovalRefferal.model.js")(
  sequelize,
  Sequelize
);

db.vendoraddressdetails = require("./VendorAddressDetails.model.js")(
  sequelize,
  Sequelize
);

db.vendorgstdetails = require("./VendorGSTDetails.model.js")(
  sequelize,
  Sequelize
);
db.vendorbankdetails = require("./VendorBankDetails.model.js")(
  sequelize,
  Sequelize
);
db.vendordocuments = require("./VendorDocuments.model.js")(
  sequelize,
  Sequelize
);
db.userspecialrights = require("./UserSpecialRights.model.js")(
  sequelize,
  Sequelize
);
db.branchapprovalslimit = require("./BranchApprovalsLimit.model.js")(
  sequelize,
  Sequelize
);

db.accissuereq = require("./AccIssueReq.model.js")(sequelize, Sequelize);
db.accreturnreq = require("./AccReturnReq.model.js")(sequelize, Sequelize);
db.accpartmap = require("./AccPartsMap.model.js")(sequelize, Sequelize);

db.vasmanagerapprovals = require("./VASManagerApprovals.model.js")(
  sequelize,
  Sequelize
);
db.managerapprovalsmap = require("./ManagerApprovalsMap.model.js")(
  sequelize,
  Sequelize
);
db.accjoborder = require("./AccJobOrder.model.js")(sequelize, Sequelize);
db.testdrive = require("./TestDrive.model.js")(sequelize, Sequelize);
db.testdrivedocument = require("./TestDriveDocument.model.js")(
  sequelize,
  Sequelize
);
db.testdriveallot = require("./TestDriveAllot.model.js")(sequelize, Sequelize);
db.testdrivemaster = require("./TestDriveMaster.model.js")(
  sequelize,
  Sequelize
);
db.testdrivemasterdocuments = require("./TestDriveMasterDocuments.model.js")(
  sequelize,
  Sequelize
);
db.dmsTempTransaction = require("./gd_fdi_temp_trans.model.js")(
  sequelize,
  Sequelize
);
db.dmsTransaction = require("./gd_fdi_trans.model.js")(sequelize, Sequelize);
db.dmstranscustomer = require("./gd_fdi_trans_customer.model.js")(
  sequelize,
  Sequelize
);
db.dmstranscharges = require("./gd_fdi_trans_charges.model.js")(
  sequelize,
  Sequelize
);
db.dmsHsnMaster = require("./hsn_details_master.model.js")(
  sequelize,
  Sequelize
);
db.dmsModelVarinatMaster = require("./model_variant_master.model.js")(
  sequelize,
  Sequelize
);
db.newcarpricelist = require("./NewCarPriceList.model.js")(
  sequelize,
  Sequelize
);
db.newcarpricemapping = require("./NewCarPriceMapping.model.js")(
  sequelize,
  Sequelize
);
db.insurancepolicytype = require("./InsurancePolicyType.model.js")(
  sequelize,
  Sequelize
);
db.insurancevalueadded = require("./InsuranceValueAdded.model.js")(
  sequelize,
  Sequelize
);
db.branchgates = require("./BranchGates.model.js")(sequelize, Sequelize);
db.branchgatesmapping = require("./BranchGatesMapping.model.js")(
  sequelize,
  Sequelize
);

db.accapprovalcartcancelreq = require("./AccApprovelCartCancelReq.model.js")(
  sequelize,
  Sequelize
);

// Invoice
db.invoice = require("./Invoice.model.js")(sequelize, Sequelize);

db.invoiceaddress = require("./InvoiceAddress.model.js")(sequelize, Sequelize);

db.invoiceprodinfo = require("./InvoiceProductInfo.model.js")(
  sequelize,
  Sequelize
);

db.masterproducts = require("./MasterProducts.model.js")(sequelize, Sequelize);

db.bookingcancellation = require("./BookingCancellation.model.js")(
  sequelize,
  Sequelize
);

db.bookingtransfer = require("./BookingTransfer.model.js")(
  sequelize,
  Sequelize
);

db.trprocess = require("./TRProcess.model.js")(sequelize, Sequelize);
db.insurancepolicymapping = require("./InsurancePolicyMapping.model.js")(
  sequelize,
  Sequelize
);
db.insurancevaluemapping = require("./InsuranceValueMapping.model.js")(
  sequelize,
  Sequelize
);

db.democonversion = require("./DemoConversion.model.js")(sequelize, Sequelize);

// Define model associations
const associateModels = require("./AssociationsForModels.js"); // Assuming you have an associations file
associateModels(db);

// Sync all models with the database
const syncDatabase = async () => {
  try {
    await sequelize.sync({ force: false }); // Use { force: true } in development
    console.log("Database & tables synced successfully!");
  } catch (error) {
    console.error("Error syncing tables:", error);
  }
};

// Execute the sync function
syncDatabase();

// Export the db object containing models and Sequelize instance
module.exports = db;

/*
// // Sync individual models with the database (creating tables if they don't exist)
// db.skumaster
//   .sync()
//   .then(() => {
//     console.log("SKUMaster table created successfully."); // Log success message for SKUMaster
//   })
//   .catch((error) => console.log("Error creating SKUMaster table:", error)); // Log error if table creation fails

// db.vehiclestock
//   .sync()
//   .then(() => {
//     console.log("vehiclestock table created successfully."); // Log success message for vehiclestock
//   })
//   .catch((error) => console.log("Error creating vehiclestock table:", error)); // Log error if table creation fails

// // Sync all models with the database
// sequelize
//   .sync({ force: false }) // Set force: false to avoid dropping existing tables
//   .then(() => {
//     console.log("Database & tables synced!"); // Log success message for database synchronization
//   })
//   .then(() => {
//     console.log("SKUMaster and vehiclestock tables synced successfully."); // Log success message for specific tables
//   })
//   .catch((error) => {
//     console.error("Error syncing tables:", error); // Log error if synchronization fails
//   });

// // Export the db object containing models and Sequelize instance
// module.exports = db; // Export db object for use in other modules
*/
