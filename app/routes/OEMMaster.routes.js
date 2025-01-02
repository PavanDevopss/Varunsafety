module.exports = (app) => {
  const oemmaster = require("../controllers/OEMMaster.controller.js");

  var router = require("express").Router();

  // Create a new oemmaster
  router.post("/", oemmaster.create);

  // Retrieve all oemmaster
  router.get("/", oemmaster.findAll);

  // Retrieve a single oemmaster with id
  router.get("/:id", oemmaster.findOne);

  // Update a oemmaster with id
  router.put("/:id", oemmaster.updateByPk);

  // Delete a oemmaster with id
  router.delete("/:id", oemmaster.deleteById);

  app.use("/api/oemmaster", router);
};
