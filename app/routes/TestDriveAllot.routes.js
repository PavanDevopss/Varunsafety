module.exports = (app) => {
  const testdriveallot = require("../controllers/TestDriveAllot.controller.js");

  var router = require("express").Router();

  router.get("/findone", testdriveallot.findOne);
  // Create a new testdriveallot
  router.post("/", testdriveallot.create);

  // Retrive all testdriveallot
  router.get("/", testdriveallot.findAll);

  // Retrieve a single testdriveallot with id

  // Update a testdriveallot with id
  router.put("/:id", testdriveallot.updateByPk);

  // Delete a testdriveallot with id
  router.delete("/:id", testdriveallot.deleteById);

  app.use("/api/testdriveallot", router);
};
