module.exports = (app) => {
  // eslint-disable-next-line no-unused-vars
  const acccartremoval = require("../controllers/AccCartRemoval.controller");

  var router = require("express").Router();

  // Create a new acccartremoval
  router.put("/cartcancelapproval", acccartremoval.cartCancelApprovalAction);

  // CRUD APIs
  // Create a new acccartremoval
  router.post("/", acccartremoval.create);

  // // Retrieve a single acccartremoval with id
  router.get("/:id", acccartremoval.findOne);

  // Retrieve all acccartremoval
  router.get("/", acccartremoval.findAll);

  // // Update a acccartremoval with id
  router.put("/:id", acccartremoval.update);

  // // Delete a acccartremoval with id
  router.delete("/:id", acccartremoval.delete);

  // Delete all acccartremoval
  //   router.delete("/deleteAll", acccartremoval.deleteAll);

  app.use("/api/acccartremoval", router);
};
