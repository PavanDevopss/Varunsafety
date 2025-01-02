module.exports = (app) => {
  const insurancepolicytype = require("../controllers/InsurancePolicyType.controller.js");

  var router = require("express").Router();

  // Create a new insurancepolicytype
  router.post("/", insurancepolicytype.create);

  // Retrieve all insurancepolicytype
  router.get("/", insurancepolicytype.findAll);

  // Retrieve a single insurancepolicytype with id
  router.get("/:id", insurancepolicytype.findOne);

  // Update a insurancepolicytype with id
  router.put("/:id", insurancepolicytype.updateByPk);

  // Delete a insurancepolicytype with id
  router.delete("/:id", insurancepolicytype.deleteById);

  app.use("/api/insurancepolicytype", router);
};
