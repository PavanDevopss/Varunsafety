module.exports = (app) => {
  const payment = require("../controllers/payment.controller");

  var router = require("express").Router();

  // Create a new NewCarBooking
  router.post("/", payment.create);

  router.get("/acceptedpaymentList", payment.AcceptedPaymentList);
  router.get("/paymenttrack", payment.PaymentTrack);
  router.get("/cancelledpaymentList", payment.CancelledPaymentList);
  router.get("/pendingpaymentList", payment.PendingPaymentList);
  router.get("/newpaymentgetlist", payment.NewPaymentGetList);
  router.post("/savenewpaymentdata", payment.SaveNewPaymentData);
  router.put("/paymentstatuschange", payment.PaymentStatusChange);

  // Retrieve all NewCarBooking
  router.get("/", payment.findAll);
  router.get("/getpaymentbycustomnerid", payment.GetPaymentByCustomerID);
  router.get("/paymentdatabystatus", payment.PaymentDataByStatus);
  router.post("/AddPaymentForWeb", payment.AddPaymentForWeb);

  // // // Retrieve a single BranchTransfer with id
  // router.get("/:id", NewCarBooking.findOne);

  // // // Update a NewCarBooking with id
  // router.put("/:id", NewCarBooking.update);

  // // // Delete a NewCarBooking with id
  // router.delete("/:id", NewCarBooking.delete);

  app.use("/api/payments", router);
};
