module.exports = (app) => {
  const formsmaster = require("../controllers/FormsMaster.controller.js");

  var router = require("express").Router();

  // Create a new formsmaster
  router.post("/", formsmaster.create);

  // Retrieve all formsmaster
  router.get("/", formsmaster.findAll);

  // Retrieve a single formsmaster with id
  router.get("/:id", formsmaster.findOne);

  // Update a formsmaster with id
  router.put("/:id", formsmaster.updateByPk);

  // Delete a formsmaster with id
  router.delete("/:id", formsmaster.deleteById);

  app.use("/api/formsmaster", router);
};
