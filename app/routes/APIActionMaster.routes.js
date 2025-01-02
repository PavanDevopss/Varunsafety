module.exports = (app) => {
  const apiactionmaster = require("../controllers/APIActionMaster.controller.js");

  var router = require("express").Router();

  // Create a new apiactionmaster
  router.post("/", apiactionmaster.create);

  // Retrieve all apiactionmaster
  router.get("/", apiactionmaster.findAll);

  // Retrieve a single apiactionmaster with id
  router.get("/:id", apiactionmaster.findOne);

  // Update a apiactionmaster with id
  router.put("/:id", apiactionmaster.updateByPk);

  // Delete a apiactionmaster with id
  router.delete("/:id", apiactionmaster.deleteById);

  app.use("/api/apiactionmaster", router);
};
