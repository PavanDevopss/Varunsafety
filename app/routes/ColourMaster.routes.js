module.exports = (app) => {
  const colourmaster = require("../controllers/ColourMaster.controller.js");

  var router = require("express").Router();

  // Create a new colourmaster
  router.post("/", colourmaster.create);

  // Retrieve all colourmaster
  router.get("/", colourmaster.findAll);

  // Retrieve a single colourmaster with id
  router.get("/:id", colourmaster.findOne);

  // Update a colourmaster with id
  router.put("/:id", colourmaster.updateByPk);

  // Delete a colourmaster with id
  router.delete("/:id", colourmaster.deleteById);

  app.use("/api/colourmaster", router);
};
