module.exports = (app) => {
  // eslint-disable-next-line no-unused-vars
  const accapprovalref = require("../controllers/AccApprovalRefferal.controller");

  var router = require("express").Router();

  // Create a new accapprovalref
  router.post("/", accapprovalref.create);

  // Retrieve all accapprovalref
  router.get("/", accapprovalref.findAll);

  // // Retrieve a single accapprovalref with id
  router.get("/:id", accapprovalref.findOne);

  // // Update a accapprovalref with id
  router.put("/:id", accapprovalref.update);

  // // Delete a accapprovalref with id
  router.delete("/:id", accapprovalref.delete);

  // Delete all accapprovalref
  // router.delete("/deleteAll", accapprovalref.deleteAll);

  app.use("/api/accapprovalref", router);
};
