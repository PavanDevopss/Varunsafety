module.exports = (app) => {
  // eslint-disable-next-line no-unused-vars
  const accissuereq = require("../controllers/AccIssueReq.controller.js");

  var router = require("express").Router();

  // Update a accissuereq with id
  router.post("/accissueupdateweb", accissuereq.AccIssueUpdateWeb);

  // FindOne for web
  router.get("/findone", accissuereq.findOne);

  // FindAll for mobile
  router.get("/findonemobile", accissuereq.findOneMobile);

  // Cancel Order
  router.put("/cancelorder", accissuereq.cancelOrder);

  // Create a new accissuereq
  router.post("/", accissuereq.create);

  // Retrieve all accissuereq
  router.get("/", accissuereq.findAll);

  // // Retrieve a single accissuereq with id

  // router.get("/:id", accissuereq.findOne);

  // // Update a accissuereq with id
  // router.put("/:id", accissuereq.update);

  // // Delete a accissuereq with id
  router.delete("/:id", accissuereq.delete);

  app.use("/api/accissuereq", router);
};
