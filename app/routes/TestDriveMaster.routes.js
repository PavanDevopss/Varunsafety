module.exports = (app) => {
  const testdrivemaster = require("../controllers/TestDriveMaster.controller.js");

  var router = require("express").Router();

  // Create a new testdrivemaster
  router.post("/", testdrivemaster.create);

  // Retrieve all testdrivemaster
  router.get("/", testdrivemaster.findAll);

  // Retrieve a single testdrivemaster with id
  router.get("/:id", testdrivemaster.findOne);

  // Update a testdrivemaster with id
  router.put("/:id", testdrivemaster.updateByPk);

  // Delete a testdrivemaster with id
  router.delete("/:id", testdrivemaster.deleteById);

  app.use("/api/testdrivemaster", router);
};
