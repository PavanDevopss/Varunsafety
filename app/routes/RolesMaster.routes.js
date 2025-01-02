module.exports = (app) => {
  const rolesmaster = require("../controllers/RolesMaster.controller.js");

  var router = require("express").Router();

  // Create a new rolesmaster
  router.post("/RoleAccessCreate", rolesmaster.RoleAccessCreate);

  // Retrieve all rolesmaster
  router.get("/findallaccess", rolesmaster.findAllAccess);
  router.get("/", rolesmaster.findAll);
  router.put("/", rolesmaster.bulkUpdateActionID);

  // Retrieve a single rolesmaster with id
  router.get("/:id", rolesmaster.findOne);
  // Update a rolesmaster with id
  router.put("/:id", rolesmaster.updateByPk);

  // Delete a rolesmaster with id
  router.delete("/:id", rolesmaster.deleteById);

  app.use("/api/rolesmaster", router);
};
