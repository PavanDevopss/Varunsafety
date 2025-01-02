module.exports = (app) => {
  const regionmaster = require("../controllers/RegionMaster.controller.js");

  var router = require("express").Router();

  // Create a new regionmaster
  router.post("/", regionmaster.create);

  // Retrieve all regionmaster
  router.get("/", regionmaster.findAll);

  // Retrieve a single regionmaster with id
  router.get("/:id", regionmaster.findOne);

  // Update a regionmaster with id
  router.put("/:id", regionmaster.updateByPk);

  // Delete a regionmaster with id
  router.delete("/:id", regionmaster.deleteById);

  app.use("/api/regionmaster", router);
};
