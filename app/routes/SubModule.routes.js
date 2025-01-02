module.exports = (app) => {
  const submodule = require("../controllers/SubModule.controller.js");

  var router = require("express").Router();

  // Create a new submodule
  router.post("/", submodule.create);

  // Retrieve all submodule
  router.get("/", submodule.findAll);

  // Retrieve a single submodule with id
  router.get("/:id", submodule.findOne);

  // Update a submodule with id
  router.put("/:id", submodule.updateByPk);

  // Delete a submodule with id
  router.delete("/:id", submodule.deleteById);

  app.use("/api/submodule", router);
};
