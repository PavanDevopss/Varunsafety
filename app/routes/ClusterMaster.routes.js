module.exports = (app) => {
  const clustermaster = require("../controllers/ClusterMaster.controller.js");

  var router = require("express").Router();

  // Create a new clustermaster
  router.post("/", clustermaster.create);

  // Retrieve all clustermaster
  router.get("/", clustermaster.findAll);

  // Retrieve a single clustermaster with id
  router.get("/:id", clustermaster.findOne);

  // Update a clustermaster with id
  router.put("/:id", clustermaster.updateByPk);

  // Delete a clustermaster with id
  router.delete("/:id", clustermaster.deleteById);

  app.use("/api/clustermaster", router);
};
