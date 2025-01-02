module.exports = (app) => {
  const departmentmaster = require("../controllers/DepartmentMaster.controller.js");

  var router = require("express").Router();

  // Create a new departmentmaster
  router.post("/", departmentmaster.create);

  // Retrieve all departmentmaster
  router.get("/", departmentmaster.findAll);

  // Retrieve a single departmentmaster with id
  router.get("/:id", departmentmaster.findOne);

  // Update a departmentmaster with id
  router.put("/:id", departmentmaster.updateByPk);

  // Delete a departmentmaster with id
  router.delete("/:id", departmentmaster.deleteById);

  app.use("/api/departmentmaster", router);
};
