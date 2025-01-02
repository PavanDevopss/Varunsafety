module.exports = (app) => {
  const branchgatesmapping = require("../controllers/BranchGatesMapping.controller.js");

  var router = require("express").Router();

  // Create a new branchgatesmapping
  router.post("/", branchgatesmapping.create);

  router.put("/updateByPk", branchgatesmapping.updateByPk);

  // Retrieve all branchgatesmapping
  router.get("/", branchgatesmapping.findAll);

  // Retrieve a single branchgatesmapping with id
  router.get("/:id", branchgatesmapping.findOne);

  // Update a branchgatesmapping with id

  // Delete a branchgatesmapping with id
  router.delete("/:id", branchgatesmapping.deleteById);

  app.use("/api/branchgatesmapping", router);
};
