module.exports = (app) => {
  // eslint-disable-next-line no-unused-vars
  const accpartsmap = require("../controllers/AccPartsMap.controller.js");

  var router = require("express").Router();

  // Create a new accpartsmap
  router.post("/", accpartsmap.create);

  // Retrieve all accpartsmap
  router.get("/", accpartsmap.findAll);

  // // Retrieve a single accpartsmap with id
  router.get("/:id", accpartsmap.findOne);

  // // Update a accpartsmap with id
  router.put("/:id", accpartsmap.update);

  // // Delete a accpartsmap with id
  router.delete("/:id", accpartsmap.delete);

  app.use("/api/accpartsmap", router);
};
