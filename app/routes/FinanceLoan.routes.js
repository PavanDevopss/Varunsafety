module.exports = (app) => {
  const financeloanapp = require("../controllers/FinanceLoanApplication.controller");

  var router = require("express").Router();

  // Create Loan Application for Web
  router.post("/createapprovedappweb", financeloanapp.CreateApprovedAppWeb);
  // Find By Id for web
  router.get("/findOne", financeloanapp.FindOne);

  // Create a new financemaster
  router.post("/", financeloanapp.create);
  router.get("/", financeloanapp.findAll);
  router.get("/loanapprovedlist", financeloanapp.LoanApprovedList);
  router.get("/loanapproveddetails", financeloanapp.LoanApprovedDetails);
  router.post("/CreateSelfLoanApp", financeloanapp.CreateSelfLoanApp);
  router.get("/loanapprovedone", financeloanapp.LoanApprovedOne);

  app.use("/api/finloanapp", router);
};
