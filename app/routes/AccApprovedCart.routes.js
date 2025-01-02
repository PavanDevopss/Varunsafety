module.exports = (app) => {
  // eslint-disable-next-line no-unused-vars
  const accapprovedcart = require("../controllers/AccApprovedCart.controller");

  var router = require("express").Router();

  // Create a new accapprovedcart
  router.post("/", accapprovedcart.create);

  // Retrieve all accapprovedcart
  router.get("/", accapprovedcart.findAll);

  // // Retrieve a single accapprovedcart with id
  router.get("/:id", accapprovedcart.findOne);

  // // Update a accapprovedcart with id
  router.put("/:id", accapprovedcart.update);

  // // Delete a accapprovedcart with id
  router.delete("/:id", accapprovedcart.delete);

  // // Delete all accapprovedcart
  // router.delete("/deleteAll", accapprovedcart.deleteAll);

  app.use("/api/accapprovedcart", router);
};
