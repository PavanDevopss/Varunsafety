module.exports = (app) => {
  const branchlevel = require("../controllers/BranchLevel.Controller.js");

  var router = require("express").Router();

  // Create a new hirarachy
  router.post("/", branchlevel.create);

  router.get("/", branchlevel.findAll);

  app.use("/api/branchlevel", router);
};
