module.exports = (app) => {
  const discountmaster = require("../controllers/DiscountMaster.controller");

  var router = require("express").Router();

  // Create a new discountmaster
  router.post("/", discountmaster.create);

  // Retrieve all discountmaster
  router.get("/", discountmaster.findAll);

  // Retrieve a single discountmaster with id
  router.get("/:id", discountmaster.findOne);

  // Update a discountmaster with id
  router.put("/:id", discountmaster.updateByPk);

  // Delete a discountmaster with id
  router.delete("/:id", discountmaster.deleteById);

  app.use("/api/discountmaster", router);
};
