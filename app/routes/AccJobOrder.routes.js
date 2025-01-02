module.exports = (app) => {
  // eslint-disable-next-line no-unused-vars
  const accjoborder = require("../controllers/AccJobOrder.controller.js");

  var router = require("express").Router();

  // Retrieve all accjoborder request by User
  router.get("/jobreqbyuser", accjoborder.JobReqByUser);

  // Retrieve Accepted accjoborder by User
  router.get("/acceptedjoborders", accjoborder.AcceptedJobOrders);

  // Retrieve Accepted accjoborder Fitment List
  router.get("/jobfitmentlist", accjoborder.JobFitmentList);

  // Retrieve Accepted accjoborder Returns List
  router.get("/jobreturnlist", accjoborder.JobReturnList);

  // Update a accept joborder with id
  router.put("/acceptjob/:id", accjoborder.acceptJob);

  // Update a fitment with id
  router.put("/updatefitment/:id", accjoborder.updateFitment);

  // Basic CRUD
  // Create a new accjoborder
  router.post("/", accjoborder.create);

  // Retrieve all accjoborder
  router.get("/", accjoborder.findAll);

  // // Retrieve a single accjoborder with id
  router.get("/:id", accjoborder.findOne);

  // // Update a accjoborder with id
  router.put("/:id", accjoborder.update);

  // // Delete a accjoborder with id
  router.delete("/:id", accjoborder.delete);

  app.use("/api/accjoborder", router);
};
