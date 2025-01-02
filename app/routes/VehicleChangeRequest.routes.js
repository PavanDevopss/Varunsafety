module.exports = (app) => {
  const vehiclechngreq = require("../controllers/VehicleChangeRequest.controller.js");

  var router = require("express").Router();

  // Update Change Request for Web
  router.post("/chngrequpdateweb", vehiclechngreq.ChngReqUpdateWeb);

  // Get data for approval
  router.get(
    "/getdataforchangeapproval/:id",
    vehiclechngreq.getDataforChangeApproval
  );

  // Get FIFO order for approval
  router.get("/fifoorderforvcrweb/:id", vehiclechngreq.FIFOOrderforVCRWeb);

  // CRUD APIs
  // Create a new vehiclechngreq
  router.post("/", vehiclechngreq.create);

  // Retrieve all vehiclechngreq
  router.get("/", vehiclechngreq.findAll);

  // Retrieve a single vehiclechngreq with id
  router.get("/:id", vehiclechngreq.findOne);

  // Update a vehiclechngreq with id
  router.put("/:id", vehiclechngreq.updateByPk);

  // Delete a vehiclechngreq with id
  router.delete("/:id", vehiclechngreq.deleteById);

  app.use("/api/vehiclechangereq", router);
};
