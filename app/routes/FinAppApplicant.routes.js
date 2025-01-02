module.exports = (app) => {
  const finappapplicant = require("../controllers/FinAppApplicant.controller.js");

  var router = require("express").Router();

  // Create a new finappapplicant
  router.post("/createapplicant", finappapplicant.createApplicant);

  // Create a new finappapplicant for Web
  router.post("/createapplicantweb", finappapplicant.createApplicantWeb);

  // Update finappapplicant for Web
  router.put("/updateapplicantweb", finappapplicant.updateApplicantWeb);

  // CRUD APIs
  // Create a new finappapplicant
  router.post("/", finappapplicant.create);

  // Retrieve all finappapplicant
  router.get("/", finappapplicant.findAll);

  // Retrieve a single finappapplicant with id
  router.get("/:id", finappapplicant.findOne);

  // Update a finappapplicant with id
  router.put("/:id", finappapplicant.updateByPk);

  // Delete a finappapplicant with id
  router.delete("/:id", finappapplicant.deleteById);

  app.use("/api/finappapplicant", router);
};
