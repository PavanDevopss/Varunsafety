module.exports = (app) => {
  const offersapprovals = require("../controllers/OffersApprovals.controller.js");

  var router = require("express").Router();

  //master ids with bookingid
  router.get("/getmasteridsbybookings", offersapprovals.GetMasterIdsByBookings);

  //  Offder status API

  router.get(
    "/getAllOfferAndStatusForMobile",
    offersapprovals.getAllOfferAndStatusForMobile
  );

  // FindAll details based on BranchName and Status
  router.get("/getallofferbystatus", offersapprovals.getAllOfferByStatus);

  // Web Retrive Offers Data based on BooklingID
  router.get("/AllAppliedOffers", offersapprovals.getAllOffersListByBookingID);

  // Mobile Retrive Offers Data based on Vehicle Details

  // Mobile get all offer applied for a booking ID but categorized (all offers having similar booking ID)
  router.get(
    "/getallofferbydiscountbyidformobile",
    offersapprovals.getAllOfferByDiscountByIDForMobile
  );

  // Dynamic APi for getting Offers based on Status for a Particular Booking ID
  router.get(
    "/getalloffersbasedonstatusformobile",
    offersapprovals.getAllOffersBasedOnStatusForMobile
  );

  // Moblie Bulk Create for applying offers for a Booking
  router.post(
    "/bulkcreateforofferapprovalsformobile",
    offersapprovals.bulkCreateforOfferApprovalsForMobile
  );

  // Mobile get all offer applied for a booking ID (all offers having similar booking ID)
  router.get(
    "/getallappliedoffersformobile",
    offersapprovals.getAllAppliedOffersForMobile
  );

  // Mobile get all Rejected offer applied for a booking ID
  router.get(
    "/getallrejectedoffersbystatusformobile",
    offersapprovals.getAllRejectedOffersByStatusForMobile
  );
  // //test done
  // router.put("/updateapprovedoffers", offersapprovals.updateApprovedOffer);

  // //test done
  // router.put("/updaterejectedoffers", offersapprovals.updateRejectedOffer);

  //update saved offer approvals
  router.put("/updateSavedApprovals", offersapprovals.updateSavedApprovals);
  //test done
  router.post(
    "/bulkupdaterequestedoffers",
    offersapprovals.bulkUpdateRequestedOffers
  );

  router.post(
    "/getoffersforapplying",
    offersapprovals.getAllOfferByDiscountForMobile
  );
  // Create a new offersapprovals
  router.post("/", offersapprovals.create);

  // Retrieve all offersapprovals
  router.get("/", offersapprovals.findAll);

  // Retrieve a single offersapprovals with id
  router.get("/:id", offersapprovals.findOne);

  // Update a offersapprovals with id
  router.put("/:id", offersapprovals.updateByPk);

  // Delete a offersapprovals with id
  router.delete("/:id", offersapprovals.deleteById);

  app.use("/api/offersapprovals", router);
};
