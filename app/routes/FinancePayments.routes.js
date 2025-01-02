module.exports = (app) => {
  const financepayments = require("../controllers/FinancePayments.controller.js");

  var router = require("express").Router();

  // Create a new financepayments
  router.post("/", financepayments.create);

  router.get("/paymentapprovedlist", financepayments.PaymentApprovedList);
  router.get("/finpaymentapprovedlist", financepayments.FinPaymentApprovedList);
  router.get("/paymentsearch", financepayments.PaymentSearch);
  // Retrieve all financepayments
  router.get("/", financepayments.findAll);

  // Retrieve a single financepayments with id
  router.get("/:id", financepayments.findOne);

  // router.get("/approvedfindone", financepayments.ApprovedfindOne);

  // Update a financepayments with id
  router.put("/:id", financepayments.update);

  // Delete a financepayments with id
  router.delete("/:id", financepayments.deleteById);

  app.use("/api/financepayments", router);
};
