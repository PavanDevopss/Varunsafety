module.exports = (app) => {
  const userspecialrights = require("../controllers/UserSpecialRights.controller.js");

  var router = require("express").Router();

  // Create a new userspecialrights
  router.post("/", userspecialrights.create);
  router.post("/useraccesscreate", userspecialrights.UserAccessCreate);

  // Retrieve all userspecialrights
  router.get("/", userspecialrights.findAll);
  router.get("/findalluseraccess", userspecialrights.findAllUserAccess);
  router.put("/bulkupdateuseractions", userspecialrights.bulkUpdateUserActions);

  // Retrieve a single userspecialrights with id
  router.get("/:id", userspecialrights.findOne);

  // Update a userspecialrights with id
  router.put("/:id", userspecialrights.updateByPk);

  // Delete a userspecialrights with id
  router.delete("/:id", userspecialrights.deleteById);

  app.use("/api/userspecialrights", router);
};
