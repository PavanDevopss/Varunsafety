module.exports = (app) => {
  const nationmaster = require("../controllers/NationMaster.controller.js");

  var router = require("express").Router();

  // Create a new nationmaster
  router.post("/", nationmaster.create);

  // Retrieve all nationmaster
  router.get("/", nationmaster.findAll);

  // Retrieve a single nationmaster with id
  router.get("/:id", nationmaster.findOne);

  // Update a nationmaster with id
  router.put("/:id", nationmaster.updateByPk);

  // Delete a nationmaster with id
  router.delete("/:id", nationmaster.deleteById);

  app.use("/api/nationmaster", router);
};
