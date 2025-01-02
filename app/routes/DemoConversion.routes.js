module.exports = (app) => {
  const democonversion = require("../controllers/DemoConversion.controller");

  var router = require("express").Router();

  // Retrieve all stock for demo
  router.get(
    "/getavailablestockfordemo",
    democonversion.getAvailableStockforDemo
  );

  // Update Demo Conversion
  router.put(
    "/updatedemoconvapproval/:id",
    democonversion.updateDemoConvApproval
  );

  // BASIC CRUD
  // Create a new democonversion
  router.post("/", democonversion.create);

  // Retrieve all democonversion
  router.get("/", democonversion.findAll);

  // Retrieve a single democonversion with id
  router.get("/:id", democonversion.findOne);

  // Update a democonversion with id
  router.put("/:id", democonversion.updateByPk);

  // Delete a democonversion with id
  router.delete("/:id", democonversion.deleteById);

  app.use("/api/democonversion", router);
};
