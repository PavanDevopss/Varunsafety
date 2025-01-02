module.exports = (app) => {
  const dmsmaster = require("../controllers/Dms.controller");

  var router = require("express").Router();

  // Create a new divisionmaster
  router.get("/DmsAuth", dmsmaster.DmsAuth);
  router.get("/procedureCallWithDate", dmsmaster.procedureCallWithDate);

  app.use("/api/dms", router);
};
