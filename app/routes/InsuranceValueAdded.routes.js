module.exports = (app) => {
  const insurancevalueadded = require("../controllers/InsuranceValueAdded.controller.js");

  var router = require("express").Router();

  // Create a new insurancevalueadded
  router.post("/", insurancevalueadded.create);

  // Retrieve all insurancevalueadded
  router.get("/", insurancevalueadded.findAll);

  // Retrieve a single insurancevalueadded with id
  router.get("/:id", insurancevalueadded.findOne);

  // Update a insurancevalueadded with id
  router.put("/:id", insurancevalueadded.updateByPk);

  // Delete a insurancevalueadded with id
  router.delete("/:id", insurancevalueadded.deleteById);

  app.use("/api/insurancevalueadded", router);
};
