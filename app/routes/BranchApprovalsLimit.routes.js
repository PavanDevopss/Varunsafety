module.exports = (app) => {
  const branchapprovalslimit = require("../controllers/BranchApprovalsLimit.controller.js");

  var router = require("express").Router();
  router.post("/bulkCreate", branchapprovalslimit.bulkCreate);
  router.post(
    "/bulkcreateinexisiting",
    branchapprovalslimit.bulkCreateinExisiting
  );

  // Create a new branchapprovalslimit
  router.post("/", branchapprovalslimit.create);

  // Retrieve all branchapprovalslimit
  router.get("/", branchapprovalslimit.findAll);

  // Retrieve a single branchapprovalslimit with id
  router.get("/:id", branchapprovalslimit.findOne);

  // Update a branchapprovalslimit with id
  router.put("/:id", branchapprovalslimit.updateByPk);

  // Delete a branchapprovalslimit with id
  router.delete("/:id", branchapprovalslimit.deleteById);

  app.use("/api/branchapprovalslimit", router);
};
