module.exports = (app) => {
  const branchstock = require("../controllers/BranchStock.controller");

  var router = require("express").Router();

  //   // Create a new branchstock
  //   router.post("/", branchstock.create);

  // Retrieve all branchstock
  router.get("/", branchstock.findAll);

  // Retrieve a single branchstock with id
  router.get("/:id", branchstock.findOne);

  //   // Update a branchstock with id
  //   router.put("/:id", branchstock.updateByPk);

  //   // Delete a branchstock with id
  //   router.delete("/:id", branchstock.deleteById);

  app.use("/api/branchstock", router);
};
