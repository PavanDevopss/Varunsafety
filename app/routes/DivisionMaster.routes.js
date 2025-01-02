module.exports = (app) => {
  const divisionmaster = require("../controllers/DivisionMaster.controller.js");

  var router = require("express").Router();

  // Create a new divisionmaster
  router.post("/", divisionmaster.create);

  // Retrieve all divisionmaster
  router.get("/", divisionmaster.findAll);

  // Retrieve a single divisionmaster with id
  router.get("/:id", divisionmaster.findOne);

  // Update a divisionmaster with id
  router.put("/:id", divisionmaster.updateByPk);

  // Delete a divisionmaster with id
  router.delete("/:id", divisionmaster.deleteById);

  app.use("/api/divisionmaster", router);
};
