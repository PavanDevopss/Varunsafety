module.exports = (app) => {
  const vendoraddressdetails = require("../controllers/VendorAddressDetails.controller.js");

  var router = require("express").Router();

  // Create a new vendoraddressdetails
  router.post("/", vendoraddressdetails.createNewAddress);
  router.put("/", vendoraddressdetails.bulkUpdateVendorAddresses);

  app.use("/api/vendoraddressdetails", router);
};
