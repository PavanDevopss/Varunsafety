module.exports = (app) => {
  const bookingcancellation = require("../controllers/BookingCancellation.controller.js");

  var router = require("express").Router();

  // Create a new bookingcancellation

  router.post(
    "/BookingCancellationRequest",
    bookingcancellation.BookingCancellationRequest
  );

  //   // Retrieve a single bookingcancellation with id
  // router.get(
  //   "/bookingcancellationDataForWeb",
  //   bookingcancellation.BookingCancellationDataForWeb
  // );
  // Booking Cancellation Data for Web
  router.get(
    "/BookingCancelDataForWeb",
    bookingcancellation.BookingCancelDataForWeb
  );

  // Booking Cancellation Data for Web
  router.put("/bookingcancelupdate", bookingcancellation.BookingCancelUpdate);

  //   // Update a bookingcancellation with id
  router.put(
    "/BookingCancellationrUpdate",
    bookingcancellation.BookingCancellationrUpdate
  );

  // Retrieve all bookingcancellation
  router.get("/", bookingcancellation.findAll);

  // Retrieve bookingcancellation by Id
  router.get("/:id", bookingcancellation.findOne);

  router.post("/", bookingcancellation.create);

  //   // Delete a bookingcancellation with id
  router.delete("/:id", bookingcancellation.deleteById);

  app.use("/api/bookingcancellation", router);
};
