module.exports = (app) => {
  const vehiclealltoment = require("../controllers/VehicleAllotment.controller.js");

  var router = require("express").Router();

  // get bookings list for allotment
  router.get("/bookingsforallotment", vehiclealltoment.BookingsForAllotment);

  // get available stock list for allotment
  router.get("/availablestocksearch", vehiclealltoment.AvailableStockSearch);

  // get available stock list for allotment WEB
  router.get("/getdataforallotment/:id", vehiclealltoment.getDataforAllotment);

  // get FIFO order for allotment WEB
  router.get("/fifoorderforweb/:id", vehiclealltoment.FIFOOrderforWeb);

  // get All Payments For Booking
  router.get(
    "/getallpaymentsforbooking/:id",
    vehiclealltoment.getAllPaymentsForBooking
  );

  // Get Allottment Data by Booking ID Mobile
  router.get("/allotdatabybookingid", vehiclealltoment.AllotDataByBookingID);

  // Update a vehiclealltoment with id for mobile and web
  router.put("/allotrequpdate", vehiclealltoment.AllotReqUpdate);

  // CRUD APIs
  // Create a new vehiclealltoment
  router.post("/", vehiclealltoment.create);

  // Retrieve all vehiclealltoment
  router.get("/", vehiclealltoment.findAll);

  // Retrieve a single vehiclealltoment with id
  router.get("/:id", vehiclealltoment.findOne);

  // Update a vehiclealltoment with id
  router.put("/:id", vehiclealltoment.updateByPk);

  // Delete a vehiclealltoment with id
  router.delete("/:id", vehiclealltoment.deleteById);

  app.use("/api/vehiclealltoment", router);
};
