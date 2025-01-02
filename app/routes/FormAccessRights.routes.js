module.exports = (app) => {
  const formaccessrights = require("../controllers/FormAccessRights.controller.js");

  var router = require("express").Router();

  // Create a new formaccessrights
  router.post("/", formaccessrights.create);

  // Retrieve all formaccessrights
  router.get("/", formaccessrights.findAll);

  // Retrieve a single formaccessrights with id
  router.get("/:id", formaccessrights.findOne);

  // Update a formaccessrights with id
  router.put("/:id", formaccessrights.updateByPk);

  // Delete a formaccessrights with id
  router.delete("/:id", formaccessrights.deleteById);

  app.use("/api/formaccessrights", router);
};
