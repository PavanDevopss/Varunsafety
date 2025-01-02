/* eslint-disable no-unused-vars */
module.exports = (app) => {
  const fueltype = require("../controllers/FuelType.controller.js");
  const checkRole = require("../Utils/CheckRoles.js");

  var router = require("express").Router();

  // Create a new fueltype
  router.post("/", fueltype.create);

  // Retrieve all fueltype
  // router.get("/", checkRole("FuelType View", "VIEW"), fueltype.findAll);
  router.get("/", fueltype.findAll);

  // Retrieve a single fueltype with id
  router.get("/:id", fueltype.findOne);

  // Update a fueltype with id
  router.put("/:id", fueltype.updateByPk);

  // Delete a fueltype with id
  router.delete("/:id", fueltype.deleteById);

  app.use("/api/fueltype", router);
};
