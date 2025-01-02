module.exports = (app) => {
  const kyc = require("../controllers/kyc.controller.js");

  var router = require("express").Router();
  router.put("/updatecustomer", kyc.updatecustomer);
  router.post("/CreateNewCustomer", kyc.CreateNewCustomer);
  router.post("/newcustomer", kyc.newcustomer);
  router.post("/uploadimages", kyc.CustDocsUpload);
  router.get("/GetCustImages", kyc.GetCustImages);
  router.get("/getcustomers", kyc.GetCustomerDetailsWithEmpid);
  router.post("/creategst", kyc.createGST);
  router.put("/updategst", kyc.updateGST);
  router.get("/getgstdata", kyc.GetGstdata);
  router.get("/GetGstbyId", kyc.GetGstbyId);
  router.get("/getstatepos", kyc.GetStatePOS);
  router.get("/getcustomerbyid", kyc.GetCustomerByID);
  router.get("/getcustomersweb", kyc.GetCustomersweb);
  router.get("/getkycdata", kyc.findAllKYCData);
  router.post("/getcustdocstatus", kyc.GetCustDocStatus);
  router.get("/pendingkyc", kyc.PendingkycList);
  router.get("/approvedkyc", kyc.ApprovedkycList);
  router.post("/acceptkyc", kyc.acceptKyc);
  router.get("/kycdatabystatus", kyc.KycDataByStatus);
  router.get("/kycdatabydocstatus", kyc.KycDataByDocStatus);
  router.get("/getfullcustdata/:id", kyc.GetFullCustData);
  router.put("/gststatus", kyc.GSTStatus);

  // router.post("/pendingkyc", kyc.PendingkycList);
  router.get("/viewcustdata/:id", kyc.ViewCustData);

  app.use("/api/kyc", router);
};
