/* eslint-disable no-unused-vars */
const verifyToken = require("../Utils/Auth.js");
module.exports = (app) => {
  const DropDown = require("../controllers/DropDown.controller.js");

  var router = require("express").Router();

  router.get("/getallbranchnames", DropDown.GetAllBranchNames);
  router.get("/getallvendornames", DropDown.GetAllVendorNames);
  router.get("/getallcolourdata", DropDown.GetAllColourData);
  router.get("/getvariantdata", DropDown.GetVariantData);
  router.get("/getskucodedata", DropDown.GetSKUCodeData);
  router.get("/getfueldata", DropDown.GetFuelData);
  router.get("/gettransmissiondata", DropDown.GetTransmissionDataForSKU);
  router.get("/getcurrentgrn", DropDown.GetCurrentGRN);
  router.get("/getfromtoskulist", DropDown.GetFromToSKULists);
  router.get("/getvehicledata", DropDown.GetVehicleData);
  router.get("/getbranchindentsdata", DropDown.GetBranchIndentsData);
  router.get("/getallmodeltype", DropDown.GetAllModelType);
  router.get("/getallchanneldata", DropDown.GetAllChannelData);
  router.get("/getalltransmissiondata", DropDown.GetAllTransmissionData);
  router.get("/getallcolourcategories", DropDown.GetAllColourCategories);
  router.get("/getallmodeldata", DropDown.GetAllModelData);
  router.get("/getvehiclelistbymodelid", DropDown.GetVehicleListByModelId);
  router.get("/getallbankdata", DropDown.GetAllBankData);
  router.get("/getallregionsbystateid", DropDown.GetAllRegionsByStateID);
  router.get("/getallbanknamesbybanktype", DropDown.GetAllBankNamesByBankType);
  router.get("/getallusersdata", DropDown.GetAllUserData);
  // router.get("/getallusersdata", verifyToken, DropDown.GetAllUserData);
  router.get("/getallproductnames", DropDown.GetAllProductNames);
  router.get("/getallfinancebytype", DropDown.GetAllFinanceByType);
  router.get("/Getallbranchbyregionid", DropDown.GetAllBranchByRegionID);
  router.post("/createposnamesbyid", DropDown.createPOSNamesbyID);

  router.get(
    "/getallsubmodulesbyparentmoduleid",
    DropDown.GetAllSubModulesByParentModuleID
  );
  router.get(
    "/getallsubmodulesbyparentmoduleid",
    DropDown.GetAllSubModulesByParentModuleID
  );
  router.get("/getallindustrynames", DropDown.GetAllIndustryNames);
  router.get("/getallformnames", DropDown.GetAllFormNames);
  router.get("/getallmodulenames", DropDown.GetAllModuleNames);
  router.get("/getallparentmodulenames", DropDown.getAllParentModuleNames);
  router.get("/getalldepartmentnames", DropDown.GetAllDepartmentNames);
  router.get("/GetAlloemnamesbycompanyid", DropDown.GetAllOEMNamesByCompanyID);
  router.get("/getallgstinbycompanyid", DropDown.GetAllGSTINByCompanyID);
  router.get("/getallstateposcompanyid", DropDown.GetAllStatePOSCompanyID);
  router.get("/getallregionbycompanyid", DropDown.GetAllRegionByCompanyID);
  router.get("/getallchannelbycompanyid", DropDown.GetAllChannelByCompanyID);
  router.get("/getallvariantsbymodelid", DropDown.GetAllVariantsByModelID);
  router.get("/getallcoloursbyvariantid", DropDown.GetAllColoursByVariantID);
  router.get("/getallteamleadsbybranchid", DropDown.GetAllTeamLeadsByBranchID);
  router.get("/getalldocumenttypes", DropDown.GetAllDocumentTypes);
  router.get("/getallrolenames", DropDown.GetAllRoleNames);
  router.get("/getallteamsbydeptid", DropDown.GetAllTeamsByDeptID);
  router.get(
    "/getallemployeidsBybranchid",
    DropDown.GetAllEmployeIDsByBranchID
  );
  router.get(
    "/GetAllSubCategoryByCategory",
    DropDown.GetAllSubCategoryByCategory
  );
  router.get("/GetAllFormNamesByWeb", DropDown.GetAllFormNamesByWeb);
  router.get("/GetAllFormNamesByMobile", DropDown.GetAllFormNamesByMobile);

  // mobile api
  router.get("/modeldatamobile", DropDown.ModelDataMobile);
  router.get("/variantdatamobile", DropDown.VariantDataMobile);
  router.get("/colourdatamobile", DropDown.ColourDataMobile);
  router.get("/fueldatamobile", DropDown.FuelDataMobile);
  router.get("/transmissiondatamobile", DropDown.transmissionDataMobile);
  router.get("/getalldiscountnames", DropDown.GetAllDiscountNames);
  router.get("/getallstatepos", DropDown.GetAllStatePOS);
  router.post("/getratesfromsku", DropDown.GetRatesFromSKU);
  router.get("/getalldispatchbranch", DropDown.GetAllDispatchBranch);
  router.get("/findonebyBranchID", DropDown.findonebyBranchID);
  router.get(
    "/GetAllTeamLeadsByBranchIDforBooking",
    DropDown.GetAllTeamLeadsByBranchIDforBooking
  );
  router.get("/getmasterproductsdata", DropDown.GetMasterProductsData);
  router.get("/getalltmsbybranch", DropDown.GetAllTMsByBranch);
  router.get("/getallbranchtypes", DropDown.GetAllBranchTypes);

  router.get("/getallcmpystates", DropDown.GetAllCmpyStates);
  router.get(
    "/getallcmpyregionsbystateid",
    DropDown.GetAllCmpyRegionsByStateID
  );
  router.get("/getallcompanies", DropDown.GetAllCompanies);
  router.get("/getallstatepos", DropDown.GetAllStatePOS);

  app.use("/api/inventory", router);
};
