module.exports = (app) => {
  const finstatusupdate = require("../controllers/FinStatusUpdate.controller.js");

  var router = require("express").Router();

  // Status Post API
  router.post("/statuscreate", finstatusupdate.statuscreate);
  router.post("/statuscreateweb", finstatusupdate.StatusCreateWeb);

  router.get("/approvedlist", finstatusupdate.ApprovedList);

  router.get("/approveddetails", finstatusupdate.ApprovedDetails);

  // Status Get API
  router.get("/getstatusdata", finstatusupdate.GetStatusData);

  // Create a new finstatusupdate
  router.post("/", finstatusupdate.create);

  // Retrieve all finstatusupdate
  router.get("/", finstatusupdate.findAll);

  // Retrieve a single finstatusupdate with id
  router.get("/:id", finstatusupdate.findOne);

  // Update a finstatusupdate with id
  router.put("/:id", finstatusupdate.updateByPk);

  // Delete a finstatusupdate with id
  router.delete("/:id", finstatusupdate.deleteById);

  app.use("/api/finstatusupdate", router);
};
