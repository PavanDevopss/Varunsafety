module.exports = (app) => {
  const modelcolourmapping = require("../controllers/ModelColourMapping.controller.js");

  var router = require("express").Router();

  // Create a new modelcolourmapping
  router.post("/", modelcolourmapping.create);

  // Retrieve all modelcolourmapping
  router.get("/", modelcolourmapping.findAll);

  // Retrieve a single modelcolourmapping with id
  router.get("/:ModelColourMappingID", modelcolourmapping.findOne);

  // // Update a modelcolourmapping with id
  router.put("/:ModelColourMappingID", modelcolourmapping.updateByPk);

  // // Delete a modelcolourmapping with id
  router.delete("/:ModelColourMappingID", modelcolourmapping.deleteById);

  app.use("/api/modelcolourmapping", router);
};
