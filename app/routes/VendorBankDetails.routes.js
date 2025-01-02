module.exports = (app) => {
  const vendorbankdetails = require("../controllers/VendorBankDetails.controller.js");

  var router = require("express").Router();

  // Create a new vendorbankdetails
  router.post("/createnewbank", vendorbankdetails.createNewBank);
  router.put("/", vendorbankdetails.bulkUpdateVendorBank);

  app.use("/api/vendorbankdetails", router);
};
