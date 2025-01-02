module.exports = (app) => {
  const newcarpricemapping = require("../controllers/NewCarPriceMapping.controller.js");

  var router = require("express").Router();

  // Create a new newcarpricemapping
  router.post("/", newcarpricemapping.bulkCreate);

  // Retrieve all newcarpricemapping
  router.get("/findall/", newcarpricemapping.findAll);
  router.get("/findallpricinglist", newcarpricemapping.findAllPricingList);
  router.put("/updateByPk", newcarpricemapping.updateByPk);

  // Retrieve a single newcarpricemapping with id
  router.get("/:id", newcarpricemapping.findOne);

  // Update a newcarpricemapping with id

  // Delete a newcarpricemapping with id
  router.delete("/:id", newcarpricemapping.deleteById);

  app.use("/api/newcarpricemapping", router);
};
