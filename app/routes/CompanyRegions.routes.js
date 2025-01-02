module.exports = (app) => {
  const companyregions = require("../controllers/CompanyRegions.controller.js");

  var router = require("express").Router();

  // Create a new companyregions
  router.post("/", companyregions.create);

  // Retrieve all companyregions
  router.get("/", companyregions.findAll);

  // Retrieve a single companyregions with id
  router.get("/:id", companyregions.findOne);

  // Update a companyregions with id
  router.put("/:id", companyregions.updateByPk);

  // Delete a companyregions with id
  router.delete("/:id", companyregions.deleteById);

  app.use("/api/companyregions", router);
};
