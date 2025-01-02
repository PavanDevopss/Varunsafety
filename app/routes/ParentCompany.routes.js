module.exports = (app) => {
  const parentcompany = require("../controllers/ParentCompany.controller.js");

  var router = require("express").Router();

  // Create a new parentcompany
  router.post("/", parentcompany.create);

  // Retrieve all parentcompany
  router.get("/", parentcompany.findAll);

  // Retrieve a single parentcompany with id
  router.get("/:id", parentcompany.findOne);

  // Update a parentcompany with id
  router.put("/:id", parentcompany.updateByPk);

  // Delete a parentcompany with id
  router.delete("/:id", parentcompany.deleteById);

  app.use("/api/parentcompany", router);
};
