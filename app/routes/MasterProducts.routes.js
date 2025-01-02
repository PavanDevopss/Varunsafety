module.exports = (app) => {
  const masterproducts = require("../controllers/MasterProducts.controller");

  var router = require("express").Router();

  // Create a new masterproducts
  router.post("/", masterproducts.create);

  // Retrieve all masterproducts
  router.get("/", masterproducts.findAll);

  // Retrieve a single masterproducts with id
  router.get("/:id", masterproducts.findOne);

  // Update a masterproducts with id
  router.put("/:id", masterproducts.update);

  // Delete a masterproducts with id
  router.delete("/:id", masterproducts.delete);

  app.use("/api/masterproducts", router);
};
