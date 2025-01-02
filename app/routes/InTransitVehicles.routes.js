module.exports = (app) => {
  const InTransitVehicles = require("../controllers/InTransitVehicles.controller.js");

  var router = require("express").Router();

  // Retrieve all pending records for InTransitVehicles
  router.get("/getpendingdata", InTransitVehicles.getPendingData);

  // Retrieve all delivered records for InTransitVehicles
  router.get("/getdelivereddata", InTransitVehicles.getDeliveredData);

  router.put("/updatereceiveddata", InTransitVehicles.updateReceivedData);

  app.use("/api/intransitvehicles", router);
};
