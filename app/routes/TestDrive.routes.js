module.exports = (app) => {
  const testdrive = require("../controllers/TestDrive.controller.js");

  var router = require("express").Router();

  // Create a new testdrive
  router.post("/", testdrive.create);

  // Retrive all testdrive
  router.get("/", testdrive.findAll);
  router.get("/statuscheckfordoc", testdrive.StatusCheckforDoc);
  router.get("/findallbystatus", testdrive.findAllByStatus);

  // Retrieve a single testdrive with id
  router.get("/:id", testdrive.findOne);
  router.put("/:id", testdrive.updateByPk);

  // // Update a testdrive with id
  // router.put("/:id", testdrive.updateByPk);

  // // Delete a testdrive with id
  // router.delete("/:id", testdrive.deleteById);

  app.use("/api/testdrive", router);
};
