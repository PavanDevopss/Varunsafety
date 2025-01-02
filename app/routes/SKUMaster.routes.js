module.exports = (app) => {
  const skumaster = require("../controllers/SKUMaster.controller");

  var router = require("express").Router();

  // Create a new skumaster
  router.post("/", skumaster.create);

  // Retrieve all skumaster
  router.get("/", skumaster.findAll);

  // Retrieve a single skumaster with id
  router.get("/:id", skumaster.findOne);

  // Update a skumaster with id
  router.put("/:id", skumaster.updateByPk);

  // Delete a skumaster with id
  router.delete("/:id", skumaster.deleteById);

  app.use("/api/skumaster", router);
};
