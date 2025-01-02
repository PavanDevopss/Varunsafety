module.exports = (app) => {
  const companygstmaster = require("../controllers/CompanyGSTMaster.controller.js");

  var router = require("express").Router();

  // Create a new companygstmaster
  router.post("/", companygstmaster.create);

  // Retrieve all companygstmaster
  router.get("/", companygstmaster.findAll);

  // Retrieve a single companygstmaster with id
  router.get("/:id", companygstmaster.findOne);

  // Update a companygstmaster with id
  router.put("/:id", companygstmaster.updateByPk);

  // Delete a companygstmaster with id
  router.delete("/:id", companygstmaster.deleteById);

  app.use("/api/companygstmaster", router);
};
