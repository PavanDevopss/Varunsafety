module.exports = (app) => {
  const vasproductpricing = require("../controllers/VASProductPricing.controller.js");

  var router = require("express").Router();

  // Create a new vasproductpricing
  router.post("/", vasproductpricing.create);

  // Retrieve all vasproductpricing
  router.get("/", vasproductpricing.findAll);
  router.get("/findallformobile", vasproductpricing.findAllForMobile);
  router.get("/findoneforapproval", vasproductpricing.findOneForApproval);

  // Retrieve a single vasproductpricing with id
  router.get("/:id", vasproductpricing.findOne);

  // Update a vasproductpricing with id
  router.put("/:id", vasproductpricing.updateByPk);

  // Delete a vasproductpricing with id
  router.delete("/", vasproductpricing.deleteById);

  app.use("/api/vasproductpricing", router);
};
