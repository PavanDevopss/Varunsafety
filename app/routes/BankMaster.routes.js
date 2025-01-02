module.exports = (app) => {
  const bankmaster = require("../controllers/BankMaster.controller.js");

  var router = require("express").Router();

  // Create a new bankmaster
  router.post("/", bankmaster.create);

  // Retrieve all bankmaster
  router.get("/", bankmaster.findAll);

  // Retrieve a single bankmaster with id
  router.get("/:id", bankmaster.findOne);

  // Update a bankmaster with id
  router.put("/:id", bankmaster.updateByPk);

  // Delete a bankmaster with id
  router.delete("/:id", bankmaster.deleteById);

  app.use("/api/bankmaster", router);
};
