module.exports = (app) => {
  const statemaster = require("../controllers/StateMaster.controller.js");

  var router = require("express").Router();

  // Create a new statemaster
  router.post("/", statemaster.create);

  // Retrieve all statemaster
  router.get("/", statemaster.findAll);

  // Retrieve a single statemaster with id
  router.get("/:id", statemaster.findOne);

  // Update a statemaster with id
  router.put("/:id", statemaster.updateByPk);

  // Delete a statemaster with id
  router.delete("/:id", statemaster.deleteById);

  app.use("/api/statemaster", router);
};
