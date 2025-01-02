module.exports = (app) => {
  const vendordocuments = require("../controllers/VendorDocuments.controller.js");

  var router = require("express").Router();

  // Create a new vendordocuments
  router.post("/", vendordocuments.create);
  // Retrive all Vendor documents list
  router.get("/", vendordocuments.findAll);
  router.put("/:id", vendordocuments.updateById);
  router.delete("/:id", vendordocuments.deleteById);

  app.use("/api/vendordocuments", router);
};
