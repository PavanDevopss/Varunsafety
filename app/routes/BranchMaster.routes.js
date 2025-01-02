module.exports = (app) => {
  const branchmaster = require("../controllers/BranchMaster.controller.js");

  var router = require("express").Router();

  // Create a new branchmaster
  router.post("/", branchmaster.create);

  // Retrieve all branchmaster
  router.get("/", branchmaster.findAll);

  // Retrieve a single branchmaster with id
  router.get("/:id", branchmaster.findOne);

  // Update a branchmaster with id
  router.put("/:id", branchmaster.updateByPk);

  // Delete a branchmaster with id
  router.delete("/:id", branchmaster.deleteById);

  app.use("/api/branchmaster", router);
};
