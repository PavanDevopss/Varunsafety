module.exports = (app) => {
  const finappcoapplicant = require("../controllers/FinAppCoApplicant.controller.js");

  var router = require("express").Router();

  // Create a new finappcoapplicant
  router.post("/", finappcoapplicant.create);

  // Retrieve all finappcoapplicant
  router.get("/", finappcoapplicant.findAll);

  // Retrieve a single finappcoapplicant with id
  router.get("/:id", finappcoapplicant.findOne);

  // Update a finappcoapplicant with id
  router.put("/:id", finappcoapplicant.updateByPk);

  // Delete a finappcoapplicant with id
  router.delete("/:id", finappcoapplicant.deleteById);

  app.use("/api/finappcoapplicant", router);
};
