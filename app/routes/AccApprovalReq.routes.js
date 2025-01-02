module.exports = (app) => {
  // eslint-disable-next-line no-unused-vars
  const accapprovalreq = require("../controllers/AccApprovalReq.controller");

  var router = require("express").Router();

  // Retrieve all accapprovalreq by screen
  router.get("/findallbystatus", accapprovalreq.findAllByStatus);

  // Retrieve accapprovalreq for approval
  router.get("/getdataforapproval/:id", accapprovalreq.getDataForApproval);

  // Update accapprovalreq for approval
  router.post("/approvalaction", accapprovalreq.approvalAction);

  // CRUD APIs
  // Create a new accapprovalreq
  router.post("/", accapprovalreq.create);

  // Retrieve all accapprovalreq
  router.get("/", accapprovalreq.findAll);

  // // Retrieve a single accapprovalreq with id
  router.get("/:id", accapprovalreq.findOne);

  // // Update a accapprovalreq with id
  router.put("/:id", accapprovalreq.update);

  // // Delete a accapprovalreq with id
  router.delete("/:id", accapprovalreq.delete);

  // Delete all accapprovalreq
  //   router.delete("/deleteAll", accapprovalreq.deleteAll);

  app.use("/api/accapprovalreq", router);
};
