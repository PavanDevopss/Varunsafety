module.exports = (app) => {
  const newcarpricelist = require("../controllers/NewCarPriceList.controller.js");

  var router = require("express").Router();

  // Create a new newcarpricelist
  router.post("/", newcarpricelist.create);

  // Retrieve all newcarpricelist
  router.get("/", newcarpricelist.findAll);

  // Retrieve a single newcarpricelist with id
  router.get("/:id", newcarpricelist.findOne);

  // Update a newcarpricelist with id
  router.put("/:id", newcarpricelist.updateByPk);

  // Delete a newcarpricelist with id
  router.delete("/:id", newcarpricelist.deleteById);

  app.use("/api/newcarpricelist", router);
};
