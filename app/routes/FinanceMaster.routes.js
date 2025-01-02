module.exports = (app) => {
  const financemaster = require("../controllers/FinanceMaster.controller.js");

  var router = require("express").Router();

  // Create a new financemaster
  router.post("/", financemaster.create);

  // Retrieve all financemaster
  router.get("/", financemaster.findAll);

  // Retrieve a single financemaster with id
  router.get("/:id", financemaster.findOne);

  // Update a financemaster with id
  router.put("/:id", financemaster.updateByPk);

  // Delete a financemaster with id
  router.delete("/:id", financemaster.deleteById);

  app.use("/api/financemaster", router);
};
