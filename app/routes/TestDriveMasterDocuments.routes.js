module.exports = (app) => {
  const testdrivemasterdocuments = require("../controllers/TestDriveMasterDocuments.controller.js");

  var router = require("express").Router();

  // Create a new testdrivemasterdocuments
  router.post("/", testdrivemasterdocuments.create);
  router.get("/findOne", testdrivemasterdocuments.findOne);

  // Retrieve all testdrivemasterdocuments
  router.get("/", testdrivemasterdocuments.findAll);

  // Retrieve a single testdrivemasterdocuments with id

  // Update a testdrivemasterdocuments with id
  router.put("/:id", testdrivemasterdocuments.updateById);

  // Delete a testdrivemasterdocuments with id
  router.delete("/:id", testdrivemasterdocuments.deleteById);

  app.use("/api/testdrivemasterdocuments", router);
};
