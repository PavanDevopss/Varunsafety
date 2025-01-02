module.exports = (app) => {
  const finstatustracking = require("../controllers/FinStatusTracking.controller.js");

  var router = require("express").Router();

  // Create a new finstatustracking
  router.post("/", finstatustracking.create);

  // Retrieve all finstatustracking
  router.get("/", finstatustracking.findAll);

  // Retrieve a single finstatustracking with id
  router.get("/:id", finstatustracking.findOne);

  // Update a finstatustracking with id
  router.put("/:id", finstatustracking.updateByPk);

  // Delete a finstatustracking with id
  router.delete("/:id", finstatustracking.deleteById);

  app.use("/api/finstatustracking", router);
};
