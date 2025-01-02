module.exports = (app) => {
  const BranchIndent = require("../controllers/BranchIndents.controller.js");

  var router = require("express").Router();

  // Retrieve all BranchIndent for Purchase Home Page
  router.get(
    "/getallotmentforbranchindent",
    BranchIndent.GetAllotmentForBranchIndent
  );

  // Retrieve all BranchIndent for Received Home Page
  router.get(
    "/getindentreceivedpagedata",
    BranchIndent.getIndentReceivedPageData
  );

  // Retrieve all BranchIndent for Received Home Page
  router.get("/getbranchtransferdata", BranchIndent.getBranchTransferData);

  // Transfer Action API
  router.put("/updatebytransfer", BranchIndent.updateByTransfer);

  // Generate EWB Action API
  router.put("/updatebygenewb", BranchIndent.updateByGenEWB);

  // Get Dynamic Data by screen
  router.get(
    "/getbranchindentsbyscreen",
    BranchIndent.getBranchIndentsByScreen
  );

  // Basic CRUD API Routes

  // Retrieve all BranchIndent
  router.get("/", BranchIndent.findAll);

  // Retrieve a single BranchIndent with id
  router.get("/:id", BranchIndent.findOne);

  // Create a new BranchIndent
  router.post("/", BranchIndent.create);

  // Update a BranchIndent with id
  router.put("/:id", BranchIndent.update);

  // Delete a BranchIndent with id
  router.delete("/:id", BranchIndent.delete);

  // Delete all BranchIndent
  // router.delete("/deleteAll", BranchIndent.deleteAll);

  app.use("/api/branchindent", router);
};
