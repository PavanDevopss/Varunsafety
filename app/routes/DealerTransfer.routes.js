module.exports = (app) => {
  const DealerTransfer = require("../controllers/DealerTransfer.controller.js");

  var router = require("express").Router();

  // Bulk Create Check list
  router.post("/createchecklistentries", DealerTransfer.createCheckListEntries);

  // Retrieve all CoDealers list  DealerTransfer
  router.get(
    "/findallcodealertransfers",
    DealerTransfer.findAllCoDealerTransfers
  );

  // Retrieve all OwnDealers list DealerTransfer
  router.get(
    "/findallowndealertransfers/",
    DealerTransfer.findAllOwnDealerTransfers
  );

  // Retrieve all BranchTransfer by screen
  router.get(
    "/getdealerrransferbyscreen",
    DealerTransfer.getDealerTransferByScreen
  );
  // Retrieve BranchTransfer by QRCode
  router.get("/getdtdatabyqr", DealerTransfer.findOneByQRCode);

  // Retrieve BranchTransfer by QRCode
  router.put("/updatebygateapp", DealerTransfer.updateByGateApp);

  // Update by Cancel Action
  router.put("/updatebycancelled", DealerTransfer.updateByCancelled);

  // Update by Return Action
  router.put("/updatebyreturned", DealerTransfer.updateByReturned);

  // CRUD API
  // Create a new DealerTransfer
  router.post("/", DealerTransfer.create);

  // Retrieve all DealerTransfer
  router.get("/", DealerTransfer.findAll);

  // Retrieve a single DealerTransfer with id
  router.get("/:id", DealerTransfer.findOne);

  // Update a DealerTransfer with id
  router.put("/:id", DealerTransfer.updateByPk);

  // Delete a DealerTransfer with id
  router.delete("/:id", DealerTransfer.deleteByPk);

  app.use("/api/dealertransfer", router);
};
