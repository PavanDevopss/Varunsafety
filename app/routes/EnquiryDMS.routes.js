/* eslint-disable no-unused-vars */
const verifyToken = require("../Utils/Auth.js");
module.exports = (app) => {
  const enquirys = require("../controllers/EnquiryDMS.controller.js");

  var router = require("express").Router();

  router.post("/", enquirys.create);

  //router.get("/", verifyToken, enquirys.findAll);
  router.get("/", enquirys.findAll);

  //router.get("/:UserId", enquirys.findAll);
  router.get("/enquirybyusrrid", enquirys.findOne);

  router.put("/:id", enquirys.update);

  app.use("/api/enquirys", router);
};
