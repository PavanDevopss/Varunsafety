module.exports = (app) => {
  const industrymaster = require("../controllers/IndustryMaster.controller.js");

  var router = require("express").Router();

  // Create a new industrymaster
  router.post("/", industrymaster.create);

  // Retrieve all industrymaster
  router.get("/", industrymaster.findAll);

  // Retrieve a single industrymaster with id
  router.get("/:id", industrymaster.findOne);

  // Update a industrymaster with id
  router.put("/:id", industrymaster.updateByPk);

  // Delete a industrymaster with id
  router.delete("/:id", industrymaster.deleteById);

  app.use("/api/industrymaster", router);
};
