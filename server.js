/* eslint-disable no-unused-vars */

// Importing necessary modules
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
// const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();

// use helmet
app.use(helmet());
// Apply to all requests
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Limit each IP to 100 requests per windowMs
});

app.use(limiter);

// Define CORS options
var corsOptions = {
  origin: [
    "http://localhost:3000", // Local development
    "http://192.168.10.67:3000", // Local network IP
    "http://192.168.10.81:3000", // Local network IP
    "http://192.168.10.68:3000", // Local network IP
    "http://uatvms.varungroup.com/", // Production domain
    "http://192.168.2.73:3000", // Local network IP
    "http://192.168.10.70:8080", // Add the IP if accessing from the same server
  ],
};

// Alternative way to define allowed origins
// const allowedOrigin = (origin) => {
//   // Check if the origin matches your allowed domain
//   return origin === "http://uatvms.varungroup.com";
// };

// const corsOptions = {
//   origin: (origin, callback) => {
//     if (!origin || allowedOrigin(origin)) {
//       callback(null, true); // Allow the request
//     } else {
//       callback(new Error("Not allowed by CORS")); // Deny the request
//     }
//   },
// };

// Enable CORS with specified options
app.use(cors(corsOptions));

// Global CORS middleware to allow requests from all origins
// app.use(cors());

// // Proxy requests to the backend server
// app.use(
//   "/api",
//   createProxyMiddleware({
//     target: "http://192.168.10.70:8080", // Backend server URL
//     changeOrigin: true, // Change the origin header to the target URL
//     pathRewrite: {
//       "^/api": "", // Remove '/api' from the request path if necessary
//     },
//   })
// );

// Middleware to set response headers for CORS
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");
  res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
  next();
});

// Error handling middleware for logging errors
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ error: 'Internal Server Error' });
// });

// Middleware to parse requests of content-type - application/json
app.use(express.json());

// Serve static files from the Images directory
app.use("/Images", express.static("./Images"));

// Middleware to parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// Import database models
const db = require("./app/models");

// Synchronize database
db.sequelize
  .sync()
  .then(() => {
    console.log("Connected to the database."); // Log successful connection
  })
  .catch((err) => {
    console.log("Failed to sync database: " + err.message); // Log error message
  });

// // Drop the table if it already exists and resync
// db.sequelize.sync({ force: true }).then(() => {
//   console.log("Drop and re-sync the database.");
// });

// Define a simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Varun Groups...." }); // Send a welcome message
});

// Import routes for different models
require("./app/routes/ModelMaster.routes")(app);
require("./app/routes/UserMaster.routes")(app);
require("./app/routes/CustomerMaster.routes")(app);
require("./app/routes/EnquiryDMS.routes")(app);
require("./app/routes/kyc.routes")(app);
require("./app/routes/DocumentType.routes")(app);
require("./app/routes/ModuleMaster.routes")(app);
require("./app/routes/VehicleStock.routes")(app);
// require("./app/routes/newkyc.routes")(app);
require("./app/routes/InTransitVehicles.routes")(app);
// require("./app/routes/DivisionMaster.routes")(app);
require("./app/routes/Inventory.routes")(app);
require("./app/routes/BranchIndent.routes")(app);
require("./app/routes/BranchTransfer.routes")(app);
require("./app/routes/BranchMaster.routes")(app);
require("./app/routes/DealerIndent.routes")(app);
require("./app/routes/DealerTransfer.routes")(app);
require("./app/routes/NewCarBookings.router")(app);
require("./app/routes/VariantMaster.routes")(app);
require("./app/routes/ColourMaster.routes")(app);
require("./app/routes/FuelType.routes")(app);
require("./app/routes/payment.routes")(app);
require("./app/routes/SKUMaster.routes")(app);
require("./app/routes/ParentCompany.routes")(app);
require("./app/routes/DivisionMaster.routes")(app);
require("./app/routes/OEMMaster.routes")(app);
require("./app/routes/CompanyMaster.routes")(app);
require("./app/routes/NationMaster.routes")(app);
require("./app/routes/StateMaster.routes")(app);
require("./app/routes/RegionMaster.routes")(app);
require("./app/routes/ClusterMaster.routes")(app);
require("./app/routes/DiscountMaster.routes")(app);
require("./app/routes/Offers.routes")(app);
require("./app/routes/services.routes")(app);
require("./app/routes/FormsMaster.routes")(app);
require("./app/routes/DepartmentMaster.routes")(app);
require("./app/routes/RolesMaster.routes")(app);
require("./app/routes/APIActionMaster.routes")(app);
require("./app/routes/FormAccessRights.routes")(app);
require("./app/routes/OffersApprovals.routes")(app);
require("./app/routes/ApprovalRefferal.routes")(app);
require("./app/routes/FinanceMaster.routes")(app);
require("./app/routes/FinanceApplication.routes")(app);
require("./app/routes/FinAppApplicant.routes")(app);
require("./app/routes/FinAppCoApplicant.routes")(app);
// require("./app/routes/Teams.routes")(app);
// require("./app/routes/TeamMembers.routes")(app);
require("./app/routes/Accessories.routes")(app);
require("./app/routes/GST.routes")(app);
require("./app/routes/FinanceDocuments.routes")(app);
require("./app/routes/FinStatusUpdate.routes")(app);
require("./app/routes/FinStatusTracking.routes")(app);
require("./app/routes/MSMEInfo.routes")(app);
require("./app/routes/CompanyStates.routes")(app);
require("./app/routes/CompanyRegions.routes")(app);
require("./app/routes/CompanyGSTMaster.routes")(app);
require("./app/routes/IndustryMaster.routes")(app);
require("./app/routes/FinancePayments.routes")(app);
require("./app/routes/BankMaster.routes")(app);
require("./app/routes/FinanceLoan.routes")(app);
require("./app/routes/VASProductPricing.routes")(app);
require("./app/routes/ValueAddedService.routes")(app);
require("./app/routes/SubModule.routes")(app);
require("./app/routes/VendorMaster.routes")(app);
require("./app/routes/VehicleAllotment.routes")(app);
require("./app/routes/VariantMapping.routes")(app);
require("./app/routes/ModelColourMapping.routes")(app);
require("./app/routes/Teams.routes")(app);
require("./app/routes/TeamMember.routes")(app);
require("./app/routes/VehicleChangeRequest.routes")(app);
require("./app/routes/VendorAddressDetails.routes")(app);
require("./app/routes/VendorGSTDetails.routes")(app);
require("./app/routes/VendorBankDetails.routes")(app);
require("./app/routes/VendorDocuments.routes")(app);
require("./app/routes/AccApprovalReq.routes")(app);
require("./app/routes/AccApprovalRefferal.routes")(app);
require("./app/routes/AccApprovedCart.routes")(app);
require("./app/routes/UserSpecialRights.routes")(app);
require("./app/routes/BranchApprovalsLimit.routes")(app);
require("./app/routes/VASManagerApprovals.routes")(app);
require("./app/routes/AccIssueReq.routes")(app);
require("./app/routes/AccReturnReq.routes")(app);
require("./app/routes/AccPartsMap.routes")(app);
require("./app/routes/AccJobOrder.routes")(app);
require("./app/routes/TestDrive.routes")(app);
require("./app/routes/TestDriveAllot.routes")(app);
require("./app/routes/Dms.routes")(app);
require("./app/routes/TestDriveMaster.routes")(app);
require("./app/routes/TestDriveMasterDocuments.routes")(app);
require("./app/routes/NewCarPriceList.routes")(app);
require("./app/routes/NewCarPriceMapping.routes")(app);
require("./app/routes/InsurancePolicyType.routes")(app);
require("./app/routes/InsuranceValueAdded.routes")(app);
require("./app/routes/BranchGates.routes")(app);
require("./app/routes/BranchGatesMapping.routes")(app);
require("./app/routes/AccCartRemoval.routes")(app);
require("./app/routes/Invoice.routes")(app);
require("./app/routes/InvoiceAddress.routes")(app);
require("./app/routes/InvoiceProductInfo.routes")(app);
require("./app/routes/MasterProducts.routes")(app);
require("./app/routes/BookingTransfer.routes")(app);
require("./app/routes/BookingCancellation.routes")(app);
require("./app/routes/TRProcess.routes")(app);
require("./app/routes/InsurancePolicyMapping.routes")(app);
require("./app/routes/InsuranceValueMapping.routes")(app);
require("./app/routes/DemoConversion.routes")(app);
require("./app/routes/BranchStock.routes")(app);

// Set port and listen for requests
const PORT = process.env.PORT || 8080; // Set the port to environment variable or default to 8080
app.listen(8080, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}.`);
});
