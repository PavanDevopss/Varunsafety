module.exports = (app) => {
  const companymaster = require("../controllers/CompanyMaster.controller.js");

  var router = require("express").Router();

  // Create a new companymaster
  router.post("/", companymaster.create);
  router.post("/creatennewoem", companymaster.createNewOEMs);
  router.post("/createnewgst", companymaster.createNewGST);
  router.post("/createnewregions", companymaster.createNewRegions);
  router.post("/creatennewchannel", companymaster.createnNewChannel);
  router.put("/bulkUpdateCompanyOEM", companymaster.bulkUpdateCompanyOEM);
  router.put(
    "/bulkUpdateCompanyRegions",
    companymaster.bulkUpdateCompanyRegions
  );
  router.put("/bulkUpdatePOSNames", companymaster.bulkUpdatePOSNames);
  router.put(
    "/bulkUpdateCompanyChannels",
    companymaster.bulkUpdateCompanyChannels
  );

  // Retrieve all companymaster
  router.get("/", companymaster.findAll);
  router.get("/findallbranches", companymaster.findAllBranches);

  // Retrieve a single companymaster with id
  router.get("/findone", companymaster.findOne);

  // Update a companymaster with id
  router.put("/:id", companymaster.updateByPk);

  // Delete a companymaster with id
  router.delete("/:id", companymaster.deleteById);

  app.use("/api/companymaster", router);
};
