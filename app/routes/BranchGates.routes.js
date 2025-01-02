module.exports = (app) => {
  const branchgates = require("../controllers/BranchGates.controller.js");

  var router = require("express").Router();

  // Create a new branchgates
  router.post("/", branchgates.create);

  // Retrieve all branchgates
  router.get("/", branchgates.findAll);

  // Retrieve a single branchgates with id
  router.get("/:id", branchgates.findOne);

  // Update a branchgates with id
  router.put("/:id", branchgates.updateByPk);

  // Delete a branchgates with id
  router.delete("/:id", branchgates.deleteById);

  app.use("/api/branchgates", router);
};
