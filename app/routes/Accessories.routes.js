module.exports = (app) => {
  const Accessories = require("../controllers/Accessories.controller");

  var router = require("express").Router();

  // Create a new apiactionmaster
  router.post("/addpartmaster", Accessories.AddPartMaster);
  router.post("/addmodelwithpart", Accessories.AddModelWithPart);
  router.post("/addpartimages", Accessories.AddPartImages);
  router.get("/getallpartmasters", Accessories.GetAllPartMasters);
  +router.get("/getallmodelwithparts", Accessories.GetAllModelWithParts);
  router.delete("/DeleteModelWithPart", Accessories.DeleteModelWithPart);
  router.get("/getpartimages", Accessories.GetPartImages);
  router.put("/updatepartmaster", Accessories.UpdatePartMaster);
  router.get("/getpartmasterbyid", Accessories.GetPartMasterByID);
  router.post("/addacccategory", Accessories.AddAccCategory);
  router.get("/getallacccategory", Accessories.GetAllAccCategory);
  router.put("/updateacccategory", Accessories.UpdateAccCategory);
  router.delete("/deleteacccategory", Accessories.DeleteAccCategory);
  router.post("/addaccsubcategory", Accessories.AddAccSubCategory);
  router.get("/getallsubacccategory", Accessories.GetAllSubAccCategory);
  router.get("/getallpartmasterdata", Accessories.GetAllPartMasterData);
  router.put("/updateaccsubcategory", Accessories.UpdateAccSubCategory);
  router.get("/getbyidaccsubcategory", Accessories.GetByIdAccSubCategory);
  router.get("/GetSubCategoiresByCateID", Accessories.GetSubCategoiresByCateID);
  router.post("/GetPartMaterBySubCateID", Accessories.GetPartMaterBySubCateID);
  router.post("/AddToWishlist", Accessories.AddToWishlist);
  router.post(
    "/GetAllWishListDataByCustomerID",
    Accessories.GetAllWishListDataByCustomerID
  );
  router.put("/UpdateWishlist", Accessories.UpdateWishlist);
  router.delete("/DeleteWishlist", Accessories.DeleteWishlist);
  router.get(
    "/GetAllWishListDataByBranch",
    Accessories.GetAllWishListDataByBranch
  );
  router.put("/UpdateCart", Accessories.UpdateCart);
  router.post("/AddAccCart", Accessories.AddAccCart);
  router.post("/GetAllAccCartByCustID", Accessories.GetAllAccCartByCustID);
  router.delete("/DeleteAccCart", Accessories.DeleteAccCart);

  app.use("/api/accessoriesmaster", router);
};
