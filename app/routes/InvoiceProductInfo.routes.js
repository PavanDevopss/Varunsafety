module.exports = (app) => {
  const invoiceproductinfo = require("../controllers/InvoiceProductInfo.controller.js");

  var router = require("express").Router();

  // Create a new invoiceproductinfo
  router.post("/", invoiceproductinfo.create);

  // Retrieve all invoiceproductinfo
  router.get("/", invoiceproductinfo.findAll);

  // Retrieve a single invoiceproductinfo with id
  router.get("/:id", invoiceproductinfo.findOne);

  // Update a invoiceproductinfo with id
  router.put("/:id", invoiceproductinfo.updateByPk);

  // Delete a invoiceproductinfo with id
  router.delete("/:id", invoiceproductinfo.deleteById);

  app.use("/api/invoiceproductinfo", router);
};
