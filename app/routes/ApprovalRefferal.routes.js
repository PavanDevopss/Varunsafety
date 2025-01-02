module.exports = (app) => {
  const approvalrefferal = require("../controllers/ApprovalRefferal.controller.js");

  var router = require("express").Router();

  // Create a new approvalrefferal
  router.post("/", approvalrefferal.create);

  // Retrieve all approvalrefferal
  router.get("/", approvalrefferal.findAll);

  // Retrieve a single approvalrefferal with id
  router.get("/:id", approvalrefferal.findOne);

  // Update a approvalrefferal with id
  router.put("/:id", approvalrefferal.updateByPk);

  // Delete a approvalrefferal with id
  router.delete("/:id", approvalrefferal.deleteById);

  app.use("/api/approvalrefferal", router);
};
