module.exports = (app) => {
  const services = require("../Utils/importService");

  var router = require("express").Router();

  // import excel temp table data
  router.post("/importExcel", services.importExcel);

  router.get("/findall", services.findAll);

  app.use("/api/services", router);
};
