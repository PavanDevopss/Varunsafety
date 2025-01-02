module.exports = (app) => {
  const insurancevaluemapping = require("../controllers/InsuranceValueMapping.controller.js");

  var router = require("express").Router();

  // Create a new insurancevaluemapping
  router.post("/", insurancevaluemapping.create);
  router.get("/findOne", insurancevaluemapping.findOne);

  router.put("/bulkupdate", insurancevaluemapping.bulkUpdate);

  // Retrieve all insurancevaluemapping
  router.get("/", insurancevaluemapping.findAll);

  // Retrieve a single insurancevaluemapping with id

  // Update a insurancevaluemapping with id

  // Delete a insurancevaluemapping with id
  router.delete("/:id", insurancevaluemapping.deleteById);

  app.use("/api/insurancevaluemapping", router);
};
