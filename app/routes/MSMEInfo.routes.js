module.exports = (app) => {
  const msmeinfo = require("../controllers/MSMEInfo.controller.js");

  var router = require("express").Router();

  // Create a new msmeinfo
  router.post("/", msmeinfo.create);

  // Retrieve all msmeinfo
  router.get("/", msmeinfo.findAll);

  // Retrieve a single msmeinfo with id
  router.get("/:id", msmeinfo.findOne);

  // Update a msmeinfo with id
  router.put("/:id", msmeinfo.updateByPk);

  // Delete a msmeinfo with id
  router.delete("/:id", msmeinfo.deleteById);

  app.use("/api/msmeinfo", router);
};
