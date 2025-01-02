module.exports = (app) => {
  const invoiceaddress = require("../controllers/InvoiceAddress.controller.js");

  var router = require("express").Router();

  // Create a new invoiceaddress
  router.post("/", invoiceaddress.create);

  // Retrieve all invoiceaddress
  router.get("/", invoiceaddress.findAll);

  // Retrieve a single invoiceaddress with id
  router.get("/:id", invoiceaddress.findOne);

  // Update a invoiceaddress with id
  router.put("/:id", invoiceaddress.updateByPk);

  // Delete a invoiceaddress with id
  router.delete("/:id", invoiceaddress.deleteById);

  app.use("/api/invoiceaddress", router);
};
