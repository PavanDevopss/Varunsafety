module.exports = (app) => {
  const vendormaster = require("../controllers/VendorMaster.controller.js");

  var router = require("express").Router();

  // Create a new vendormaster
  router.post("/", vendormaster.create);
  router.post("/createnewvendor", vendormaster.createnewvendor);

  // Retrieve all vendormaster
  router.get("/", vendormaster.findAll);
  router.get("/findallvendors", vendormaster.findAllVendors);
  router.get("/findonevendor", vendormaster.findOneVendor);

  // Retrieve a single vendormaster with id
  router.get("/:id", vendormaster.findOne);

  // Update a vendormaster with id
  router.put("/:id", vendormaster.updateforVendor);

  router.put("/:id", vendormaster.updateByPk);

  // Delete a vendormaster with id
  router.delete("/:id", vendormaster.deleteById);

  app.use("/api/vendormaster", router);
};
