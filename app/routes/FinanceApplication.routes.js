module.exports = (app) => {
  const financeapplication = require("../controllers/FinanceApplication.controller.js");

  var router = require("express").Router();

  // Get Application Data for mobile home page list
  router.get("/findallfin", financeapplication.findAllFin);

  // Get Complete Data for an application mobile
  router.get("/findOnefin", financeapplication.findOneFin);

  // router.get("/test", financeapplication.Test);

  // Retrieve a single financeapplication with id
  router.get("/findone", financeapplication.findOne);
  // CRUD APIs
  // Create a new financeapplication
  router.post("/", financeapplication.create);

  // Retrieve all financeapplication
  router.get("/", financeapplication.findAll);

  // Update a financeapplication with id
  router.put("/:id", financeapplication.updateByPk);

  // Delete a financeapplication with id
  router.delete("/:id", financeapplication.deleteById);

  app.use("/api/financeapplication", router);
};
