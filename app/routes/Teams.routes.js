module.exports = (app) => {
  const teams = require("../controllers/Teams.controller.js");

  var router = require("express").Router();

  // Create a new Teams
  router.post("/", teams.create);

  // Retrive all Teams
  router.get("/", teams.findAll);

  // Retrieve a single Teams with id
  router.get("/:TeamID", teams.findOne);

  // Update a Teams with id
  router.put("/:id", teams.updateByPk);

  // Delete a Teams with id
  router.delete("/:id", teams.deleteById);

  app.use("/api/teams", router);
};
