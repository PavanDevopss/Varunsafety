module.exports = (app) => {
  const variantmaster = require("../controllers/VariantMaster.controller.js");

  var router = require("express").Router();

  // Create a new variantmaster
  router.post("/", variantmaster.create);

  // Retrieve all variantmaster
  router.get("/", variantmaster.findAll);

  // Retrieve a single variantmaster with id
  router.get("/:id", variantmaster.findOne);

  // Update a variantmaster with id
  router.put("/:id", variantmaster.updateByPk);

  // Delete a variantmaster with id
  router.delete("/:id", variantmaster.deleteById);

  app.use("/api/variantmaster", router);
};
