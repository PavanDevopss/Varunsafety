module.exports = (app) => {
  const bookingtransfer = require("../controllers/BookingTransfer.controller.js");

  var router = require("express").Router();

  // Create a new bookingtransfer
  router.post("/", bookingtransfer.create);
  router.get(
    "/BookingTransferSearchForMobile",
    bookingtransfer.BookingTransferSearchForMobile
  );

  router.post(
    "/BookingTransferRequest",
    bookingtransfer.BookingTransferRequest
  );
  router.get(
    "/BookingTransferDataForWeb",
    bookingtransfer.BookingTransferDataForWeb
  );
  router.put("/BookingTranferUpdate", bookingtransfer.BookingTranferUpdate);

  // Retrieve all bookingtransfer
  router.get(
    "/findAllBookingTransfers",
    bookingtransfer.findAllBookingTransfers
  );

  // Retrieve a single bookingtransfer with id

  // Update a bookingtransfer with id

  // Delete a bookingtransfer with id
  router.delete("/:id", bookingtransfer.deleteById);

  app.use("/api/bookingtransfer", router);
};
