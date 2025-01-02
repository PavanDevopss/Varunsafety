/* eslint-disable no-unused-vars */
module.exports = (app) => {
  const valueaddedservice = require("../controllers/ValueAddedService.controller.js");

  var router = require("express").Router();

  // Create a new valueaddedservice
  router.post("/", valueaddedservice.create);

  // Retrieve all valueaddedservice

  router.get("/", valueaddedservice.findAll);

  // Retrieve a single valueaddedservice with id
  router.get("/:id", valueaddedservice.findOne);

  // Update a valueaddedservice with id
  router.put("/:id", valueaddedservice.updateByPk);

  // Delete a valueaddedservice with id
  router.delete("/:id", valueaddedservice.deleteById);

  app.use("/api/valueaddedservice", router);
};
