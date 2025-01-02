module.exports = (app) => {
  const offers = require("../controllers/Offers.controller");

  var router = require("express").Router();

  // Bulk Create Offers
  router.post("/bulkcreate", offers.bulkCreate);

  router.get("/offerssearch", offers.OffersSearch);

  // Create a new Offers
  router.post("/", offers.create);

  // Retrieve all Offers
  router.get("/", offers.findAll);

  // Retrieve a single Offers with id
  router.get("/:id", offers.findOne);

  // Update a Offers with id
  router.put("/:id", offers.updateByPk);

  // Delete a Offers with id
  router.delete("/:id", offers.deleteById);

  app.use("/api/offers", router);
};
