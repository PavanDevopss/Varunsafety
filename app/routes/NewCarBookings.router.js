module.exports = (app) => {
  const NewCarBooking = require("../controllers/NewCarBookings.controller");

  var router = require("express").Router();

  // Retrieve all NewCarBooking
  router.get("/UniversalBookingSearch", NewCarBooking.UniversalBookingSearch);

  router.get("/findallbybookings", NewCarBooking.findAllByBookings);
  router.put("/updatebookings", NewCarBooking.updateBookings);

  // // Retrieve a single BranchTransfer with id
  router.get("/bookingsearch", NewCarBooking.BookingSearch);
  router.get("/CustomerSearch", NewCarBooking.CustomerSearch);
  router.get(
    "/BookingSearchForTransfer",
    NewCarBooking.BookingSearchForTransfer
  );
  router.get("/fincustsearch", NewCarBooking.FinCustSearch);

  router.get("/BookingsList", NewCarBooking.BookingsList);

  // Get Booking Data by ID for Screen
  router.get("/bookingdatabyid", NewCarBooking.BookingDataByID);

  // Post Booking Documents
  router.post("/BookingUploadImage", NewCarBooking.BookingUploadImage);

  // GET Documents
  router.get("/getalldocsbycustid/:id", NewCarBooking.GetAllDocsByCustID);

  // Create a new NewCarBooking
  router.post("/", NewCarBooking.create);

  router.get("/", NewCarBooking.findAll);
  // // Update a NewCarBooking with id
  router.post("/:id", NewCarBooking.UpdateBooking);

  // // Delete a NewCarBooking with id
  router.delete("/:id", NewCarBooking.delete);

  app.use("/api/newcarbooking", router);
};
