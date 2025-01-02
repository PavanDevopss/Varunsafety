module.exports = (app) => {
  const vendorgstdetails = require("../controllers/VendorGSTDetails.controller.js");

  var router = require("express").Router();

  // Create a new vendorgstdetails
  router.post("/", vendorgstdetails.createNewGST);
  router.get("/findallgsts", vendorgstdetails.findAllGSTs);
  router.put("/:id", vendorgstdetails.updateGSTDetails);

  app.use("/api/vendorgstdetails", router);
};
