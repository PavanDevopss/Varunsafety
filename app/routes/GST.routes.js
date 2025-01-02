module.exports = (app) => {
  const gstcontroller = require("../controllers/GST.controller.js");
  // console.log("GST Controller:", gstcontroller);
  var router = require("express").Router();

  // GST Verification API
  router.get("/gstverification", gstcontroller.GSTVerification);
  router.get("/gstverificationfunc", gstcontroller.GSTVerificationFunc);
  router.post("/authapi", gstcontroller.authenticateAPI);
  router.post("/gstewb", gstcontroller.generateEwayBill);
  router.post("/gstewbapi", gstcontroller.generateEwayBillAPI);
  router.get("/getewbdetailsapi", gstcontroller.getEwayBillDetailsAPI);
  router.get("/getewbdetailsbydate", gstcontroller.getEwayBillDetailsByDate);
  router.post("/cancelewb", gstcontroller.cancelEwayBill);
  router.post("/cancelewbapi", gstcontroller.cancelEwayBillAPI);
  router.post("/extendewbvalidity", gstcontroller.extendEwayBillValidity);
  router.post("/extendewbvalidityapi", gstcontroller.extendEwayBillValidityAPI);
  // router.post("/gstewb", gstcontroller.generateEwayBill);
  router.post("/gstirnapi", gstcontroller.generateIRNAPI);

  // IRN get details api
  router.get("/getirndetails", gstcontroller.getIRNDetailsAPI);

  // IRN get details by doc details api
  router.get(
    "/getirndetailsbydoctype",
    gstcontroller.getIRNDetailsByDocTypeAPI
  );
  // Cancel IRN
  router.post("/cancelirn", gstcontroller.cancelIRNAPI);
  // Generate EWB by IRN
  router.post("/genewbbyirn", gstcontroller.generateEWBByIRNAPI);
  // Get EWB details by IRN
  router.get("/getewbbyirn", gstcontroller.getEWBDetailsByIRNAPI);
  // Generate EWB by IRN
  router.post("/cancelewbforirn", gstcontroller.cancelEwayBillForIRNAPI);

  app.use("/gst", router);
};
