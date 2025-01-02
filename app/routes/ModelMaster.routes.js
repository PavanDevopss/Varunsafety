module.exports = (app) => {
  const modelmaster = require("../controllers/ModelMaster.controller.js");

  var router = require("express").Router();

  // Create a new modelmaster
  router.post("/", modelmaster.create);

  // Retrieve all modelmaster
  router.get("/", modelmaster.findAll);

  // Retrieve a single modelmaster with id
  router.get("/:id", modelmaster.findOne);

  // Update a modelmaster with id
  router.put("/:id", modelmaster.updateByPk);

  // Delete a modelmaster with id
  router.delete("/:id", modelmaster.deleteById);

  app.use("/api/modelmaster", router);
};
