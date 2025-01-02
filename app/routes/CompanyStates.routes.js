module.exports = (app) => {
  const companystates = require("../controllers/CompanyStates.controller");

  var router = require("express").Router();

  // Create a new companystates
  router.post("/", companystates.create);

  // Retrieve all companystates
  router.get("/", companystates.findAll);

  // Retrieve a single companystates with id
  router.get("/:id", companystates.findOne);

  // Update a companystates with id
  router.put("/:id", companystates.updateByPk);

  // Delete a companystates with id
  router.delete("/:id", companystates.deleteById);

  app.use("/api/companystates", router);
};
