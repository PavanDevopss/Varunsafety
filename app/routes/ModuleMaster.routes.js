module.exports = (app) => {
  const modulemaster = require("../controllers/ModuleMaster.controller.js");

  var router = require("express").Router();

  // Create a new modulemaster
  router.post("/", modulemaster.create);
  router.post("/createsubmodule", modulemaster.createSubModule);
  router.post("/newformcreate", modulemaster.newFormCreate);
  router.get("/findallwithsubmodules", modulemaster.findAllwithSubModules);

  router.get("/findonewithsubmodules", modulemaster.findOnewithSubModules);
  // Retrieve all modulemaster
  router.get("/", modulemaster.findAll);
  router.put("/", modulemaster.updateModule);
  router.put("/updateforms", modulemaster.updateForms);
  router.put("/updatesubmodule", modulemaster.updateSubModule);

  // Retrieve a single modulemaster with id
  router.get("/:id", modulemaster.findOne);
  router.put("/:id", modulemaster.updateByPk);

  // Delete a modulemaster with id
  router.delete("/:id", modulemaster.deleteById);

  app.use("/api/modulemaster", router);
};
