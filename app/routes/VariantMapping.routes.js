module.exports = (app) => {
  const variantmapping = require("../controllers/VariantMapping.controller.js");

  var router = require("express").Router();

  // Create a new variantmapping
  router.post("/", variantmapping.create);
  router.get("/", variantmapping.findAll);
  router.get("/:VariantMappingID", variantmapping.findOne);
  router.put("/:VariantMappingID", variantmapping.update);
  router.delete("/:VariantMappingID", variantmapping.delete);

  app.use("/api/variantmapping", router);
};
