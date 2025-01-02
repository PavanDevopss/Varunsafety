module.exports = (app) => {
  // eslint-disable-next-line no-unused-vars
  const accreturnreq = require("../controllers/AccReturnReq.controller.js");

  var router = require("express").Router();

  // Retrieve a single accreturnreq with id
  router.get("/findoneweb", accreturnreq.findOneWeb);
  router.get("/findallreturnedlist", accreturnreq.findAllReturnedList);
  // put a single accreturnreq with id web
  router.put("/accreturnupdateweb", accreturnreq.AccReturnUpdateWeb);

  // Create a new accreturnreq
  router.post("/", accreturnreq.create);

  // Retrieve all accreturnreq
  router.get("/", accreturnreq.findAll);

  // // Retrieve a single accreturnreq with id
  router.get("/:id", accreturnreq.findOne);

  // // Update a accreturnreq with id
  router.put("/:id", accreturnreq.update);

  // // Delete a accreturnreq with id
  router.delete("/:id", accreturnreq.delete);

  app.use("/api/accreturnreq", router);
};
