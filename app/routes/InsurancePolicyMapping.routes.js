module.exports = (app) => {
  const insurancepolicymapping = require("../controllers/InsurancePolicyMapping.controller.js");

  var router = require("express").Router();

  // Create a new insurancepolicymapping
  router.post("/", insurancepolicymapping.create);

  // Retrieve all insurancepolicymapping
  router.get("/", insurancepolicymapping.findAll);

  // Retrieve a single insurancepolicymapping with id
  router.get("/:id", insurancepolicymapping.findOne);

  // Update a insurancepolicymapping with id
  router.put("/:id", insurancepolicymapping.updateByPk);

  // Delete a insurancepolicymapping with id
  router.delete("/:id", insurancepolicymapping.deleteById);

  app.use("/api/insurancepolicymapping", router);
};
