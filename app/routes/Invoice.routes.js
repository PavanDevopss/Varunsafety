module.exports = (app) => {
  const invoice = require("../controllers/Invoice.controller");

  var router = require("express").Router();

  // Retrieve all invoice for WEB
  router.get("/findallinvoiceweb", invoice.findAllInvoiceWeb);

  // Retrieve all invoice by ID for WEB
  router.get("/findoneweb/:id", invoice.findOneWeb);

  // Retrieve allowed invoice for WEB
  router.get("/findallowinvoice", invoice.findAllowInvoice);
  router.post("/updatebygenirn", invoice.updateByGenIRN);

  // CRUD
  // Create a new invoice
  router.post("/", invoice.create);

  // Retrieve all invoice
  router.get("/", invoice.findAll);

  // Retrieve a single invoice with id
  router.get("/:id", invoice.findOne);

  // Update a invoice with id
  router.put("/:id", invoice.update);

  // Delete a invoice with id
  router.delete("/:id", invoice.delete);

  app.use("/api/invoice", router);
};
