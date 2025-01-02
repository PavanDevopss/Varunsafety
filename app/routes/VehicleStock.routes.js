module.exports = (app) => {
  const vehiclestock = require("../controllers/VehicleStock.controller.js");

  var router = require("express").Router();

  // Create a new vehiclestock
  router.post("/", vehiclestock.create);

  // Retrieve all vehiclestock
  router.get("/", vehiclestock.findAll);

  // // Retrieve a single vehiclestock with id
  router.get("/:id", vehiclestock.findOne);

  // // Update a vehiclestock with id
  router.put("/:id", vehiclestock.update);

  // // Delete a vehiclestock with id
  router.delete("/:id", vehiclestock.delete);

  // // Delete all vehiclestock
  // router.delete("/deleteAll", vehiclestock.deleteAll);

  app.use("/api/purchaseentries", router);
};
