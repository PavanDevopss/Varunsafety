module.exports = (app) => {
  const Doctype = require("../controllers/DocumentType.Controller.js");

  var router = require("express").Router();

  router.post("/", Doctype.create);

  router.get("/", Doctype.findAllData);

  app.use("/api/doctype", router);
};
