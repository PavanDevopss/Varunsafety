module.exports = (app) => {
  const trprocess = require("../controllers/TRProcess.controller.js");

  var router = require("express").Router();

  // Create a new trprocess
  router.post("/", trprocess.create);

  // Retrieve all trprocess
  router.get("/", trprocess.findAll);

  // Retrieve a single trprocess with id
  router.get("/:id", trprocess.findOne);

  // Update a trprocess with id
  router.put("/:id", trprocess.updateByPk);

  // Delete a trprocess with id
  router.delete("/:id", trprocess.deleteById);

  app.use("/api/trprocess", router);
};
