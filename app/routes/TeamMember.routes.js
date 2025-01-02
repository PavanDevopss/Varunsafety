module.exports = (app) => {
  const teammembers = require("../controllers/TeamMembers.controller.js");

  var router = require("express").Router();

  // Create a new teammembers
  router.post("/", teammembers.create);

  // Retrive all teammembers
  router.get("/", teammembers.findAll);

  // Retrieve a single teammembers with id
  router.get("/:id", teammembers.findOne);

  // Update a teammembers with id
  router.put("/:TeamMemberID", teammembers.updateByPk);

  // Delete a teammembers with id
  router.delete("/:id", teammembers.deleteById);

  app.use("/api/teammembers", router);
};
