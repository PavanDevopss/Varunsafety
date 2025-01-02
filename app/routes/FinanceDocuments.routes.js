module.exports = (app) => {
  const financedocuments = require("../controllers/FinanceDocuments.controller.js");

  var router = require("express").Router();

  // Create a new financedocuments
  router.post("/", financedocuments.create);
  router.post("/finloandoccreate", financedocuments.FinLoanDoccreate);
  router.post("/finpaymentdoccreate", financedocuments.FinPaymentDoccreate);

  // Retrieve all financedocuments
  router.get("/", financedocuments.findAll);

  // Retrieve a single financedocuments with id
  router.get("/:id", financedocuments.findOne);

  // Update a financedocuments with id
  router.put("/:id", financedocuments.updateById);

  // Delete a financedocuments with id
  router.delete("/:id", financedocuments.deleteById);

  app.use("/api/financedocuments", router);
};
