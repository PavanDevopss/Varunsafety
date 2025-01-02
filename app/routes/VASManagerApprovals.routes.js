module.exports = (app) => {
  const vasmanagerapprovals = require("../controllers/VASManagerApprovals.controller.js");

  var router = require("express").Router();

  // Create a new vasmanagerapprovals
  router.post("/", vasmanagerapprovals.create);

  router.post(
    "/AddVasProductToBooking",
    vasmanagerapprovals.AddVasProductToBooking
  );
  router.get(
    "/GetVasProductsByBookingID",
    vasmanagerapprovals.GetVasProductsByBookingID
  );
  router.get(
    "/findAllVASManagerApprovals",
    vasmanagerapprovals.findAllVASManagerApprovals
  );
  router.get("/findonedetails", vasmanagerapprovals.findOneDetails);

  // Retrieve a single vasmanagerapprovals with id
  router.get("/", vasmanagerapprovals.findOne);

  // Update a vasmanagerapprovals with id
  router.put("/:id", vasmanagerapprovals.updateByPk);

  // Delete a vasmanagerapprovals with id
  router.delete("/:id", vasmanagerapprovals.deleteById);

  app.use("/api/vasmanagerapprovals", router);
};
