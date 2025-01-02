module.exports = (app) => {
  const DealerIndents = require("../controllers/DealerIndents.controller.js");

  var router = require("express").Router();

  // Get Dynamic Data by screen
  router.get(
    "/getdealerindentsbyscreen",
    DealerIndents.getDealerIndentsByScreen
  );

  // Get Allotment Data for indent
  router.get(
    "/getallotmentfordealerindents",
    DealerIndents.GetAllotmentForDealerIndents
  );

  // Get Data by Received screen
  router.get(
    "/getdealerindentreceivedpagedata",
    DealerIndents.getDealerIndentReceivedPageData
  );

  // Update Data by Transfer Action
  router.put("/updatebytransfer", DealerIndents.updateByTransfer);

  // Update Data by Gen EWB Action
  router.put("/updatebygenewb", DealerIndents.updateByGenEWB);

  // Transfer Data
  router.get("/getdealertransferdata", DealerIndents.getDealerTransferData);

  // Retrieve all DealerIndent for Purchase Home Page
  // router.get("/getSelectedData", DealerIndent.getSelectedData);
  router.get("/test", DealerIndents.Test);

  // CRUD API Routes
  // Create a new DealerIndent
  router.post("/", DealerIndents.create);

  // Retrieve all DealerIndent
  router.get("/", DealerIndents.findAll);

  // Retrieve all DealerIndent for Purchase Home Page
  // router.get("/getSelectedData", DealerIndent.getSelectedData);

  // // Retrieve a single DealerIndent with id
  router.get("/:id", DealerIndents.findOne);

  // Update a DealerIndent with id
  router.put("/:id", DealerIndents.updateByPk);

  // Delete a DealerIndent with id
  router.delete("/:id", DealerIndents.deleteByPk);

  // // Delete all DealerIndent
  // router.delete("/deleteAll", DealerIndent.deleteAll);

  app.use("/api/dealerindents", router);
};
