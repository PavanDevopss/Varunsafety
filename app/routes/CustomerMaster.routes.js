// module.exports = (app) => {
//   const customers = require("../controllers/CustomerMaster.controller.js");

//   var router = require("express").Router();

//   // Create a new customers
//   router.post("/", customers.uploadImage, customers.create);

//   // Retrieve all customers
//   router.get("/", customers.findAll);

//   // // Retrieve a single customers with id
//   router.get("/:id", customers.findOne);

//   // // Update a modelmaster with id
//   router.put("/:id", customers.update);

//   // // Delete a modelmaster with id
//   // router.delete("/:id", modelmasters.delete);

//   app.use("/api/customers", router);
// };
module.exports = (app) => {
  const customermaster = require("../controllers/CustomerMaster.controller.js");

  var router = require("express").Router();

  // Create a new customermaster
  router.post("/", customermaster.create);

  // Retrieve all customermaster
  router.get("/", customermaster.findAll);

  router.get("/getcustomerslist", customermaster.GetCustomerList);

  // Retrieve a single customermaster with id
  router.get("/:id", customermaster.findCustomerByID);

  // Update a customermaster with id
  router.put("/:id", customermaster.updateByPk);

  // Delete a customermaster with id
  router.delete("/:id", customermaster.deleteById);

  router.post("/updateCustomerMapping", customermaster.updateCustomerMapping);

  app.use("/api/customermaster", router);
};
