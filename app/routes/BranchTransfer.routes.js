module.exports = (app) => {
  const BranchTransfer = require("../controllers/BranchTransfer.controller.js");

  var router = require("express").Router();

  // Create a new BranchTransfer
  router.post("/", BranchTransfer.create);

  // Retrieve all received BranchTransfer
  router.get(
    "/findallreceivedtransfers",
    BranchTransfer.findAllReceivedTransfers
  );

  // Retrieve all sent BranchTransfer
  router.get("/findallsenttransfers", BranchTransfer.findAllSentTransfers);

  // Retrieve all BranchTransfer by screen
  router.get(
    "/getbranchtransferbyscreen",
    BranchTransfer.getBranchTransferByScreen
  );

  // Retrieve BranchTransfer by QRCode
  router.get("/getbtdatabyqr", BranchTransfer.findOneByQRCode);

  // Post BranchTransfer check list
  router.post("/createchecklistentries", BranchTransfer.createCheckListEntries);

  // Put BranchTransfer and check list data
  router.put("/updatebygateapp", BranchTransfer.updateByGateApp);

  // Cancel BranchTransfer by Action
  router.put("/updatebycancelled", BranchTransfer.updateByCancelled);

  // Return BranchTransfer by Action
  router.put("/updatebyreturned", BranchTransfer.updateByReturned);

  // Retrieve all BranchTransfer
  router.get("/", BranchTransfer.findAll);

  // // Retrieve a single BranchTransfer with id
  router.get("/:id", BranchTransfer.findOne);

  // // Update a BranchTransfer with id
  router.put("/:id", BranchTransfer.updateByPk);

  // // Delete a BranchTransfer with id
  router.delete("/:id", BranchTransfer.deleteByPk);

  app.use("/api/branchtransfer", router);
};
