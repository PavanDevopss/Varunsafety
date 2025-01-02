/* eslint-disable no-dupe-keys */
/* eslint-disable no-unused-vars */
const db = require("../models");
const NewCarBookingsModel = require("../models/NewCarBookings.model");
const OffersApprovals = db.offersapprovals;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;
const NewCarBookings = db.NewCarBookings;
const Offers = db.offers;
const CustomerMaster = db.customermaster;
const FuelType = db.fueltypes;
const ModelMaster = db.modelmaster;
const VariantMaster = db.variantmaster;
const ColourMaster = db.colourmaster;
const Transmission = db.transmission;
const UserMaster = db.usermaster;
const ApprovalRefferal = db.approvalrefferal;
const DiscountMaster = db.discountmaster;
const BranchMaster = db.branchmaster;

// Basic CRUD API
// Create and Save a new DivisionMaster
exports.create = async (req, res) => {
  console.log("CustOfferID:", req.body.CustOfferID);
  console.log("BookingID:", req.body.BookingID);
  console.log("OfferID:", req.body.OfferID);

  try {
    // // Validate request
    // const requiredFields = [
    //   "CustOfferID",
    //   "BookingID",
    //   "OfferID",
    //   "MFGShare",
    //   "DealerShare",
    //   "TaxAmount",
    //   "IGSTRate",
    //   "CESSRate",
    //   "OfferAmount",
    //   "Reffered",
    //   "Remarks",
    //   "Status",
    // ];

    // for (const field of requiredFields) {
    //   if (req.body[field] === undefined || req.body[field] === null) {
    //     return res.status(400).json({ message: `${field} cannot be empty` });
    //   }
    // }

    // // Check if BookingID and OfferID are valid
    // const bookingExists = await NewCarBookings.findByPk(req.body.BookingID);
    // if (!bookingExists) {
    //   return res.status(400).json({ message: "Invalid BookingID" });
    // }

    // const offerExists = await Offers.findByPk(req.body.OfferID);
    // if (!offerExists) {
    //   return res.status(400).json({ message: "Invalid OfferID" });
    // }

    // Create an OffersApprovals

    // Retrieve values from Offer table based on OfferID
    const offer = await Offers.findByPk(req.body.OfferID, {
      attributes: [
        "MFGShare",
        "DealerShare",
        "TaxAmount",
        "IGSTRate",
        "CESSRate",
        "OfferAmount",
      ],
    });

    if (!offer) {
      return res.status(400).json({ message: "Invalid OfferID" });
    }
    const offersApprovals = {
      CustOfferID: req.body.CustOfferID,
      BookingID: req.body.BookingID,
      OfferID: req.body.OfferID,
      MFGShare: req.body.MFGShare || offer.MFGShare,
      DealerShare: req.body.DealerShare || offer.DealerShare,
      TaxAmount: req.body.TaxAmount || offer.TaxAmount,
      IGSTRate: req.body.IGSTRate || offer.IGSTRate,
      CESSRate: req.body.CESSRate || offer.CESSRate,
      OfferAmount: req.body.OfferAmount || offer.OfferAmount,
      RequestedBy: req.body.RequestedBy,
      ApprovedBy: req.body.ApprovedBy,
      Reffered: req.body.Reffered || false,
      Remarks: req.body.Remarks,
      Status: req.body.Status || "Requested",
    };

    // Save OffersApprovals in the database
    const newOffersApprovals = await OffersApprovals.create(offersApprovals);

    return res.status(201).json(newOffersApprovals); // Send the newly created OffersApprovals as response
  } catch (err) {
    if (err.name === "SequelizeValidationError") {
      // Handle Sequelize validation errors
      return res.status(400).json({
        message: "Validation error",
        details: err.errors.map((e) => e.message),
      });
    }

    if (err.name === "SequelizeUniqueConstraintError") {
      // Handle unique constraint errors
      return res.status(400).json({
        message: "Unique constraint error",
        details: err.errors.map((e) => e.message),
      });
    }

    console.error("Error creating OffersApprovals:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Retrieve all DivisionMasters from the database.
exports.findAll = async (req, res) => {
  try {
    // Fetch all OffersApprovals data with included NewCarBookings and Offers data
    const offersApprovalsData = await OffersApprovals.findAll({
      attributes: [
        "CustOfferID",
        "BookingID",
        "OfferID",
        "MFGShare",
        "DealerShare",
        "TaxAmount",
        "IGSTRate",
        "CESSRate",
        "OfferAmount",
        "RequestedBy",
        "ApprovedBy",
        "Reffered",
        "Remarks",
        "Status",
      ],
      include: [
        {
          model: NewCarBookings,
          as: "OABookingID",
          attributes: ["BookingNo", "Title"],
        },
        {
          model: Offers,
          as: "OAOfferID",
          attributes: [
            "OfferName",
            "MFGShare",
            "DealerShare",
            "TaxAmount",
            "IGSTRate",
            "CESSRate",
            "OfferAmount",
          ],
        },
        {
          model: UserMaster,
          as: "OARequestedBy",
          attributes: ["UserID", "UserName", "EmpID"],
        },
        {
          model: UserMaster,
          as: "OAApprovedBy",
          attributes: ["UserID", "UserName", "EmpID"],
        },
      ],
      order: [
        ["CustOfferID", "ASC"], // Order by CustOfferID in ascending order
      ],
    });

    // Check if data is empty
    if (!offersApprovalsData || offersApprovalsData.length === 0) {
      return res.status(404).json({
        message: "No OffersApprovals data found.",
      });
    }

    // Map the data for response
    const combinedData = offersApprovalsData.map((item) => ({
      CustOfferID: item.CustOfferID,
      BookingID: item.BookingID,
      OfferID: item.OfferID,
      MFGShare: item.OAOfferID.MFGShare,
      DealerShare: item.OAOfferID.DealerShare,
      TaxAmount: item.OAOfferID.TaxAmount,
      IGSTRate: item.OAOfferID.IGSTRate,
      CESSRate: item.OAOfferID.CESSRate,
      OfferAmount: item.OAOfferID.OfferAmount,
      RequestedBy: item.OARequestedBy.UserName,
      ApprovedBy: item.OAApprovedBy.UserName,

      Reffered: item.Reffered,
      Remarks: item.Remarks,
      Status: item.Status,
      BookingNo: item.OABookingID ? item.OABookingID.BookingNo : null,
      Title: item.OABookingID ? item.OABookingID.Title : null,
      OfferName: item.OAOfferID ? item.OAOfferID.OfferName : null,
    }));

    // Send the combined data as response
    res.json(combinedData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message:
          "Database error occurred while retrieving OffersApprovals data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      // Handle connection errors
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    // General error handling
    console.error("Error retrieving OffersApprovals data:", error);
    return res.status(500).json({
      message:
        "Failed to retrieve OffersApprovals data. Please try again later.",
    });
  }
};

// Find a single DivisionMaster with an id
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;

    // Validate the ID parameter
    if (!id) {
      return res.status(400).json({
        message: "ID parameter is required.",
      });
    }

    // Fetch the OffersApprovals data by primary key with included NewCarBookings and Offers data
    const offersApprovalsData = await OffersApprovals.findOne({
      where: {
        CustOfferID: id,
      },
      attributes: [
        "CustOfferID",
        "BookingID",
        "OfferID",
        "MFGShare",
        "DealerShare",
        "TaxAmount",
        "IGSTRate",
        "CESSRate",
        "OfferAmount",
        "RequestedBy",
        "ApprovedBy",
        "Reffered",
        "Remarks",
        "Status",
      ],
      include: [
        {
          model: NewCarBookings,
          as: "OABookingID",
          attributes: ["BookingNo", "Title"],
        },
        {
          model: Offers,
          as: "OAOfferID",
          attributes: [
            "OfferName",
            "MFGShare",
            "DealerShare",
            "TaxAmount",
            "IGSTRate",
            "CESSRate",
            "OfferAmount",
          ],
        },
        {
          model: UserMaster,
          as: "OARequestedBy",
          attributes: ["UserID", "UserName", "EmpID"],
        },
        {
          model: UserMaster,
          as: "OAApprovedBy",
          attributes: ["UserID", "UserName", "EmpID"],
        },
      ],
    });

    // Check if data is found
    if (!offersApprovalsData) {
      return res.status(404).json({
        message: "OffersApprovals data not found.",
      });
    }

    // Prepare the response data
    const responseData = {
      CustOfferID: offersApprovalsData.CustOfferID,
      BookingID: offersApprovalsData.BookingID,
      OfferID: offersApprovalsData.OfferID,
      MFGShare: offersApprovalsData.OAOfferID.MFGShare,
      DealerShare: offersApprovalsData.OAOfferID.DealerShare,
      TaxAmount: offersApprovalsData.OAOfferID.TaxAmount,
      IGSTRate: offersApprovalsData.OAOfferID.IGSTRate,
      CESSRate: offersApprovalsData.OAOfferID.CESSRate,
      OfferAmount: offersApprovalsData.OAOfferID.OfferAmount,
      RequestedBy: offersApprovalsData.OARequestedBy.UserName,
      ApprovedBy: offersApprovalsData.OAApprovedBy.UserName,
      Reffered: offersApprovalsData.Reffered,
      Remarks: offersApprovalsData.Remarks,
      Status: offersApprovalsData.Status,
      BookingNo: offersApprovalsData.OABookingID
        ? offersApprovalsData.OABookingID.BookingNo
        : null,
      Title: offersApprovalsData.OABookingID
        ? offersApprovalsData.OABookingID.Title
        : null,
      OfferName: offersApprovalsData.OAOfferID
        ? offersApprovalsData.OAOfferID.OfferName
        : null,
    };

    // Send the response data
    res.json(responseData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message:
          "Database error occurred while retrieving OffersApprovals data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      // Handle connection errors
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    // General error handling
    console.error("Error retrieving OffersApprovals data:", error);
    return res.status(500).json({
      message:
        "Failed to retrieve OffersApprovals data. Please try again later.",
    });
  }
};

// Update a DivisionMaster by the id in the request
exports.updateByPk = async (req, res) => {
  console.log("CustOfferID:", req.body.CustOfferID);

  try {
    // Validate request
    if (!req.body.BookingID || !req.body.OfferID) {
      return res
        .status(400)
        .json({ message: "BookingID and OfferID are required" });
    }

    // Validate the ID parameter
    const custOfferId = req.params.id;
    if (!custOfferId) {
      return res.status(400).json({ message: "ID parameter is required." });
    }
    const offer = await Offers.findByPk(req.body.OfferID, {
      attributes: [
        "MFGShare",
        "DealerShare",
        "TaxAmount",
        "IGSTRate",
        "CESSRate",
        "OfferAmount",
      ],
    });

    if (!offer) {
      return res.status(400).json({ message: "Invalid OfferID" });
    }
    // Find the OffersApprovals by ID
    let offersApprovals = await OffersApprovals.findByPk(custOfferId);

    if (!offersApprovals) {
      return res.status(404).json({ message: "OffersApprovals not found" });
    }

    // Update fields
    offersApprovals.BookingID = req.body.BookingID;
    offersApprovals.OfferID = req.body.OfferID;
    offersApprovals.MFGShare = req.body.MFGShare || offer.MFGShare;
    offersApprovals.DealerShare = req.body.DealerShare || offer.DealerShare;
    offersApprovals.TaxAmount = req.body.TaxAmount || offer.TaxAmount;
    offersApprovals.IGSTRate = req.body.IGSTRate || offer.IGSTRate;
    offersApprovals.CESSRate = req.body.CESSRate || offer.CESSRate;
    offersApprovals.OfferAmount = req.body.OfferAmount || offer.OfferAmount;
    offersApprovals.RequestedBy = req.body.RequestedBy;
    offersApprovals.ApprovedBy = req.body.ApprovedBy;

    offersApprovals.Reffered = req.body.Reffered || offersApprovals.Reffered;
    offersApprovals.Remarks = req.body.Remarks || offersApprovals.Remarks;
    offersApprovals.Status = req.body.Status || offersApprovals.Status;
    offersApprovals.ModifiedDate = new Date();

    // Save updated OffersApprovals in the database
    const updatedOffersApprovals = await offersApprovals.save();

    return res.status(200).json(updatedOffersApprovals); // Send the updated OffersApprovals as response
  } catch (err) {
    // Handle errors based on specific types
    if (err.name === "SequelizeValidationError") {
      // Handle Sequelize validation errors
      return res.status(400).json({
        message: "Validation error",
        details: err.errors.map((e) => e.message),
      });
    }

    if (err.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while updating OffersApprovals.",
        details: err.message,
      });
    }

    if (err.name === "SequelizeConnectionError") {
      // Handle connection errors
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: err.message,
      });
    }

    // General error handling
    console.error("Error updating OffersApprovals:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a DivisionMaster with the specified id in the request
exports.deleteById = async (req, res) => {
  const id = req.params.id;

  try {
    // Validate the ID parameter
    if (!id) {
      return res.status(400).json({ message: "ID parameter is required." });
    }

    // Find the OffersApprovals by ID
    const offersApprovals = await OffersApprovals.findByPk(id);

    // Check if the model exists
    if (!offersApprovals) {
      return res
        .status(404)
        .json({ message: "OffersApprovals not found with id: " + id });
    }

    // Delete the model
    await offersApprovals.destroy();

    // Send a success message
    res.status(200).json({
      message: "OffersApprovals with id: " + id + " deleted successfully",
    });
  } catch (err) {
    // Handle errors based on specific types
    if (err.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while deleting OffersApprovals.",
        details: err.message,
      });
    }

    if (err.name === "SequelizeConnectionError") {
      // Handle connection errors
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: err.message,
      });
    }

    // General error handling
    console.error("Error deleting OffersApprovals:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Mobile Retrive Offers Data based on Vehicle Details for applying
exports.getAllOfferByDiscountForMobile = async (req, res) => {
  try {
    // Destructure and validate inputs
    const {
      BranchID,
      ModelID,
      VariantID,
      ColourID,
      TransmissionID,
      FuelTypeID,
      BookingID,
    } = req.body;

    const filterCriteria = {};
    if (BranchID) filterCriteria.BranchID = parseInt(BranchID, 10);
    if (ModelID) filterCriteria.ModelID = parseInt(ModelID, 10);
    if (VariantID) filterCriteria.VariantID = parseInt(VariantID, 10);
    if (ColourID) filterCriteria.ColourID = parseInt(ColourID, 10);
    if (TransmissionID)
      filterCriteria.TransmissionID = parseInt(TransmissionID, 10);
    if (FuelTypeID) filterCriteria.FuelTypeID = parseInt(FuelTypeID, 10);

    // Fetch applied offers and their statuses
    const appliedOffers = await OffersApprovals.findAll({
      where: { BookingID: BookingID },
      attributes: [
        "OfferID",
        "Status",
        "RequestedBy",
        "ApprovedBy",
        "Reffered",
        "Remarks",
      ],
    });

    const appliedOffersMap = new Map(
      appliedOffers.map((offer) => [
        offer.OfferID,
        {
          Status: offer.Status,
          RequestedBy: offer.RequestedBy,
          ApprovedBy: offer.ApprovedBy,
          Reffered: offer.Reffered,
          Remarks: offer.Remarks,
        },
      ])
    );
    console.log("applied offers IDs and statuses: ", appliedOffersMap);

    // Fetch offer details
    const offersData = await Offers.findAll({
      where: filterCriteria,
      attributes: [
        "OfferID",
        "OfferName",
        "ValidFrom",
        "ValidUpto",
        "Status",
        "DiscountID",
        "BranchID",
        "ModelID",
        "VariantID",
        "ColourID",
        "TransmissionID",
        "FuelTypeID",
        "OfferAmount",
        "IGSTRate",
        "CESSRate",
        "MFGShare",
        "DealerShare",
        "TaxAmount",
      ],
      include: [
        {
          model: DiscountMaster,
          as: "ODiscountID",
          attributes: ["DiscountID", "DiscountName", "MultipleSelection"],
        },
        {
          model: BranchMaster,
          as: "OBranchID",
          attributes: ["BranchID", "BranchName"],
        },
      ],
    });

    // Group and format data
    const discountOffersMap = offersData.reduce((acc, offer) => {
      const discountName = offer.ODiscountID
        ? offer.ODiscountID.DiscountName
        : "No Discount";
      const multipleSelection =
        offer.ODiscountID && offer.ODiscountID.MultipleSelection
          ? offer.ODiscountID.MultipleSelection
          : null;

      if (!acc[discountName]) {
        acc[discountName] = {
          DiscountName: discountName,
          MultipleSelection: [],
          Offers: [],
        };
      }

      // Add unique MultipleSelection values
      if (
        multipleSelection &&
        !acc[discountName].MultipleSelection.includes(multipleSelection)
      ) {
        acc[discountName].MultipleSelection.push(multipleSelection);
      }

      acc[discountName].Offers.push({
        OfferID: offer.OfferID,
        OfferName: offer.OfferName,
        ValidFrom: offer.ValidFrom,
        ValidUpto: offer.ValidUpto,
        DiscountID: offer.DiscountID,
        DiscountName: offer.ODiscountID ? offer.ODiscountID.DiscountName : null,
        MultipleSelection: multipleSelection,
        Status: offer.Status,
        BranchID: offer.BranchID,
        BranchName: offer.OBranchID ? offer.OBranchID.BranchName : null,
        ModelID: offer.ModelID,
        VariantID: offer.VariantID,
        ColourID: offer.ColourID,
        TransmissionID: offer.TransmissionID,
        FuelTypeID: offer.FuelTypeID,
        MFGShare: offer.MFGShare,
        DealerShare: offer.DealerShare,
        TaxAmount: offer.TaxAmount,
        IGSTRate: offer.IGSTRate,
        CESSRate: offer.CESSRate,
        OfferAmount: offer.OfferAmount,
        AppliedStatus: appliedOffersMap.has(offer.OfferID)
          ? appliedOffersMap.get(offer.OfferID).Status
          : null,
        RequestedBy: appliedOffersMap.has(offer.OfferID)
          ? appliedOffersMap.get(offer.OfferID).RequestedBy
          : null,
        ApprovedBy: appliedOffersMap.has(offer.OfferID)
          ? appliedOffersMap.get(offer.OfferID).ApprovedBy
          : null,
        Reffered: appliedOffersMap.has(offer.OfferID)
          ? appliedOffersMap.get(offer.OfferID).Reffered
          : null,
        Remarks: appliedOffersMap.has(offer.OfferID)
          ? appliedOffersMap.get(offer.OfferID).Remarks
          : null,
      });

      return acc;
    }, {});

    const formattedData = Object.values(discountOffersMap);

    res.json(formattedData);
  } catch (error) {
    console.error("Error fetching offers data:", error);
    res.status(500).send({
      message: "Failed to retrieve offers data. Please try again later.",
      details: error.message,
    });
  }
};

// FindAll details based on BranchName and Status mobile
exports.getAllOfferByStatus = async (req, res) => {
  const requestStatus = req.query.Status;
  const requestBranch = req.query.BranchName;
  const userID = req.query.UserID;
  // Validate requestStatus input
  if (!requestStatus) {
    return res.status(400).send({ message: "Status is required" });
  }
  // Validate requestBranch input
  if (!requestBranch) {
    return res.status(400).send({ message: "Branch Name is required" });
  }
  // Validate userID input
  if (!userID) {
    return res.status(400).send({ message: "User ID is required" });
  }
  try {
    console.log("Fetching offers data...");
    // Step 1: Find offer approval data using requestStatus and requestBranch and include related models
    const offerApprovalData = await OffersApprovals.findAll({
      include: [
        {
          model: NewCarBookings,
          as: "OABookingID",
          attributes: [
            "BranchName",
            "FirstName",
            "LastName",
            "CustomerID",
            "ModelName",
            "ColourName",
            "VariantName",
          ],
          include: [
            {
              model: CustomerMaster,
              as: "NCBCustID",
              attributes: ["Transmission", "FuelType"],
            },
          ],
        },
        {
          model: UserMaster,
          as: "OARequestedBy",
          attributes: ["UserID", "UserName", "EmpID"],
        },
        {
          model: UserMaster,
          as: "OAApprovedBy",
          attributes: ["UserID", "UserName", "EmpID"],
        },
      ],
      attributes: [
        "CustOfferID",
        "BookingID",
        "OfferID",
        "MFGShare",
        "DealerShare",
        "TaxAmount",
        "IGSTRate",
        "CESSRate",
        "OfferAmount",
        "RequestedBy",
        "ApprovedBy",
        "Reffered",
        "Remarks",
        "Status",
      ],
      where: {
        Status: {
          [Op.eq]: requestStatus,
        },
        ...(requestBranch
          ? { "$OABookingID.BranchName$": { [Op.iLike]: requestBranch } }
          : {}),
        RequestedBy: userID,
      },
    });
    // Extract unique CustOfferIDs from offerApprovalData
    const custOfferIDs = offerApprovalData.map((data) => data.CustOfferID);
    console.log("CustOfferIDs:", custOfferIDs);
    // Step 2: Fetch approval referral data for the retrieved CustOfferIDs
    const approvalRefferalData = await ApprovalRefferal.findAll({
      where: {
        CustOfferID: {
          [Op.in]: custOfferIDs,
        },
        // ActionStatus: {
        //   [Op.not]: "Reffered", // Exclude rows where Status is 'reffered'
        // },
      },
      attributes: ["CustOfferID", "RequestedTo", "CreatedDate"],
      include: [
        {
          model: UserMaster,
          as: "ARRequestTo",
          attributes: ["UserID", "UserName", "EmpID"],
        },
      ],
      order: [["CreatedDate", "DESC"]],
    });
    // Step 3: Filter to get the latest referral for each CustOfferID
    const latestApprovalRefferalData = {};
    approvalRefferalData.forEach((referral) => {
      if (!latestApprovalRefferalData[referral.CustOfferID]) {
        latestApprovalRefferalData[referral.CustOfferID] = referral;
      }
    });
    console.log("Latest Approval Referral Data:", latestApprovalRefferalData);
    // Step 4: Prepare formatted data
    const formattedData = offerApprovalData.map((booking) => {
      // Determine if the offer is Reffered and has not been approved yet
      let isReffered = booking.Status === "Reffered";
      // Find the latest referral for the current offer
      let latestReferral =
        latestApprovalRefferalData[booking.CustOfferID] || null;
      console.log("Booking Data:", booking);
      console.log("Is Reffered:", isReffered);
      console.log("Latest Referral:", latestReferral);
      // Prepare the formatted data object
      const formattedOffer = {
        CustOfferID: booking.CustOfferID,
        BookingID: booking.BookingID,
        OfferID: booking.OfferID,
        MFGShare: booking.MFGShare,
        DealerShare: booking.DealerShare,
        TaxAmount: booking.TaxAmount,
        IGSTRate: booking.IGSTRate,
        CESSRate: booking.CESSRate,
        OfferAmount: booking.OfferAmount,
        RequestedBy: booking.RequestedBy,
        RequestedByName: booking.OARequestedBy
          ? booking.OARequestedBy.UserName
          : null,
        ApprovedBy: isReffered && latestReferral ? null : booking.ApprovedBy, // ApprovedBy only when not Reffered or no latest referral
        ApprovedByName: booking.OAApprovedBy
          ? booking.OAApprovedBy.UserName
          : null,
        Reffered: booking.Reffered,
        RequestedTo:
          latestReferral && latestReferral.ARRequestTo
            ? latestReferral.RequestedTo
            : null, // Show RequestedTo only when latest referral exists
        RequestedToName:
          latestReferral && latestReferral.ARRequestTo
            ? latestReferral.ARRequestTo.UserName
            : null, // Show RequestedTo only when latest referral exists
        Remarks: booking.Remarks,
        BranchName: booking.OABookingID ? booking.OABookingID.BranchName : null,
        FirstName: booking.OABookingID ? booking.OABookingID.FirstName : null,
        LastName: booking.OABookingID ? booking.OABookingID.LastName : null,
        CustomerID: booking.OABookingID ? booking.OABookingID.CustomerID : null,
        ModelName: booking.OABookingID ? booking.OABookingID.ModelName : null,
        VariantName: booking.OABookingID
          ? booking.OABookingID.VariantName
          : null,
        ColourName: booking.OABookingID ? booking.OABookingID.ColourName : null,
        Transmission:
          booking.OABookingID && booking.OABookingID.NCBCustID
            ? booking.OABookingID.NCBCustID.Transmission
            : null,
        FuelTypeName:
          booking.OABookingID && booking.OABookingID.NCBCustID
            ? booking.OABookingID.NCBCustID.FuelType
            : null,
        Status: booking.Status,
      };
      return formattedOffer;
    });
    console.log("Formatted Data:", formattedData);
    // Step 5: Send the formatted data as response
    res.json(formattedData);
  } catch (error) {
    console.error("Error fetching booking data:", error);
    res.status(500).send({
      message: "Failed to retrieve booking data. Please try again later.",
    });
  }
};

// Web Retrive Offers Data based on BooklingID
exports.getAllOffersListByBookingID = async (req, res) => {
  const bookingID = req.query.BookingID;

  // Validate bookingID input
  if (!bookingID) {
    return res.status(400).send({ message: "BookingID is required" });
  }

  try {
    console.log("Fetching offers data...");

    // Fetch the offer approvals based on BookingID
    const offerApprovals = await OffersApprovals.findAll({
      where: { BookingID: bookingID },
      include: [
        {
          model: NewCarBookings,
          as: "OABookingID",
          attributes: [
            "BranchName",
            "ModelName",
            "ColourName",
            "VariantName",
            "CustomerID",
          ],
          include: [
            {
              model: CustomerMaster,
              as: "NCBCustID",
              attributes: ["Transmission", "FuelType"],
            },
          ],
        },
        {
          model: Offers,
          as: "OAOfferID",
          attributes: ["OfferName", "ValidFrom", "ValidUpto", "Status"],
        },
        {
          model: UserMaster,
          as: "OAApprovedBy",
          attributes: ["UserID", "UserName", "EmpID", "Mobile"],
        },
      ],
    });

    if (!offerApprovals.length) {
      return res
        .status(404)
        .json({ message: "No offer approvals found for the given BookingID" });
    }

    // Separate the results into requested, approved, rejected, Reffered, and saved lists
    const requestedList = [];
    const approvedList = [];
    const rejectedList = [];
    const refferedCustOfferIDs = [];
    const savedList = []; // New savedList array

    for (const offerApproval of offerApprovals) {
      const details = {
        CustOfferID: offerApproval.CustOfferID,
        BookingID: offerApproval.BookingID,
        OfferID: offerApproval.OfferID,
        MFGShare: offerApproval.MFGShare,
        DealerShare: offerApproval.DealerShare,
        TaxAmount: offerApproval.TaxAmount,
        IGSTRate: offerApproval.IGSTRate,
        CESSRate: offerApproval.CESSRate,
        OfferAmount: offerApproval.OfferAmount,
        RequestedBy: offerApproval.RequestedBy,
        ApprovedBy: offerApproval.OAApprovedBy
          ? offerApproval.OAApprovedBy.UserName
          : null,
        ApprovedByEmpID: offerApproval.OAApprovedBy
          ? offerApproval.OAApprovedBy.EmpID
          : null,
        Reffered: offerApproval.Reffered,
        Remarks: offerApproval.Remarks,

        OfferName: offerApproval.OAOfferID.OfferName,
        ValidFrom: offerApproval.OAOfferID.ValidFrom,
        ValidUpto: offerApproval.OAOfferID.ValidUpto,
        OfferStatus: offerApproval.OAOfferID.Status,

        BranchName: offerApproval.OABookingID.BranchName,
        ModelName: offerApproval.OABookingID.ModelName,
        ColourName: offerApproval.OABookingID.ColourName,
        VariantName: offerApproval.OABookingID.VariantName,

        Transmission: offerApproval.OABookingID.NCBCustID.Transmission,
        FuelType: offerApproval.OABookingID.NCBCustID.FuelType,
        OfferApprovalStatus: offerApproval.Status,
      };

      // Add records to the appropriate lists based on status
      if (offerApproval.Status === "Requested") {
        requestedList.push(details);
      } else if (offerApproval.Status === "Approved") {
        approvedList.push(details);
      } else if (offerApproval.Status === "Rejected") {
        rejectedList.push(details);
      } else if (offerApproval.Status === "Reffered") {
        refferedCustOfferIDs.push(offerApproval.CustOfferID);
      } else if (offerApproval.Status === "Saved") {
        // Add condition for the savedList (you can change the condition as needed)
        savedList.push(details);
      }
    }

    // If there are any Reffered records, fetch related requested records from ApprovalRefferal
    let refferedDetails = [];

    if (refferedCustOfferIDs.length > 0) {
      refferedDetails = await ApprovalRefferal.findAll({
        where: {
          CustOfferID: refferedCustOfferIDs,
          ActionStatus: "Requested",
        },
        include: [
          {
            model: OffersApprovals,
            as: "ARCustOfferID",
            include: [
              {
                model: NewCarBookings,
                as: "OABookingID",
                attributes: [
                  "BranchName",
                  "ModelName",
                  "ColourName",
                  "VariantName",
                  "CustomerID",
                ],
                include: [
                  {
                    model: CustomerMaster,
                    as: "NCBCustID",
                    attributes: ["Transmission", "FuelType"],
                  },
                ],
              },
              {
                model: Offers,
                as: "OAOfferID",
                attributes: ["OfferName", "ValidFrom", "ValidUpto", "Status"],
              },
            ],
          },
        ],
      });

      // Process the referral approvals to match the structure
      refferedDetails = refferedDetails.map((referralApproval) => {
        const originalOffer = referralApproval.ARCustOfferID;

        return {
          CustOfferID: referralApproval.CustOfferID,
          BookingID: originalOffer.BookingID,
          OfferID: originalOffer.OfferID,
          MFGShare: originalOffer.MFGShare,
          DealerShare: originalOffer.DealerShare,
          TaxAmount: originalOffer.TaxAmount,
          IGSTRate: originalOffer.IGSTRate,
          CESSRate: originalOffer.CESSRate,
          OfferAmount: originalOffer.OfferAmount,
          RequestedBy: originalOffer.RequestedBy,
          ApprovedBy: originalOffer.ApprovedBy,
          Reffered: originalOffer.Reffered,
          Remarks: originalOffer.Remarks,

          OfferName: originalOffer.OAOfferID.OfferName,
          ValidFrom: originalOffer.OAOfferID.ValidFrom,
          ValidUpto: originalOffer.OAOfferID.ValidUpto,
          OfferStatus: originalOffer.OAOfferID.Status,

          BranchName: originalOffer.OABookingID.BranchName,
          ModelName: originalOffer.OABookingID.ModelName,
          ColourName: originalOffer.OABookingID.ColourName,
          VariantName: originalOffer.OABookingID.VariantName,

          Transmission: originalOffer.OABookingID.NCBCustID.Transmission,
          FuelType: originalOffer.OABookingID.NCBCustID.FuelType,
          OfferApprovalStatus: referralApproval.ActionStatus,
        };
      });
    }

    // Return the result
    res.json({
      requested: requestedList,
      approved: approvedList,
      rejected: rejectedList,
      reffered: refferedDetails,
      saved: savedList, // Add savedList to the response
    });
  } catch (error) {
    console.error("Error fetching offer details:", error);
    res.status(500).send({
      message: "Failed to retrieve offer details. Please try again later.",
    });
  }
};

// Moblie Bulk Create for applying offers for a Booking
exports.bulkCreateforOfferApprovalsForMobile = async (req, res) => {
  try {
    // Validate request body
    if (!Array.isArray(req.body) || req.body.length === 0) {
      return res
        .status(400)
        .json({ message: "Request body must be a non-empty array" });
    }

    // Extract offers approvals array from request body
    const offersApprovals = req.body.map((approval) => {
      return {
        CustOfferID: approval.CustOfferID,
        BookingID: approval.BookingID,
        OfferID: approval.OfferID,
        MFGShare: approval.MFGShare,
        DealerShare: approval.DealerShare,
        TaxAmount: approval.TaxAmount || null,
        IGSTRate: approval.IGSTRate || null,
        CESSRate: approval.CESSRate || null,
        OfferAmount: approval.OfferAmount || null,
        RequestedBy: approval.RequestedBy,
        ApprovedBy: approval.ApprovedBy || null,
        Reffered: approval.Reffered || false,
        Remarks: approval.Remarks || null,
        Status: approval.Status || "Requested",
      };
    });

    // Bulk create offers approvals in the database
    const newOffersApprovals = await OffersApprovals.bulkCreate(
      offersApprovals
    );

    return res.status(201).json(newOffersApprovals); // Send the newly created offers approvals as response
  } catch (err) {
    if (err.name === "SequelizeValidationError") {
      // Handle Sequelize validation errors
      return res.status(400).json({
        message: "Validation error",
        details: err.errors.map((e) => e.message),
      });
    }

    if (err.name === "SequelizeUniqueConstraintError") {
      // Handle unique constraint errors
      return res.status(400).json({
        message: "Unique constraint error",
        details: err.errors.map((e) => e.message),
      });
    }

    console.error("Error creating offers approvals in bulk:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Mobile get all offer applied for a booking ID (all offers having similar booking ID)
exports.getAllAppliedOffersForMobile = async (req, res) => {
  const { BookingID } = req.query;

  // Validate BookingID input
  if (!BookingID) {
    return res.status(400).send({ message: "BookingID is required" });
  }

  try {
    console.log("Fetching offers approval data...");

    // Step 1: Find offer approval data using BookingID and include related Offers model
    const offerApprovalData = await OffersApprovals.findAll({
      include: [
        {
          model: Offers,
          as: "OAOfferID",
          attributes: ["OfferName"],
        },
        // {
        //   model: NewCarBookings,
        //   as: "OABookingID",
        //   attributes: [
        //     "BranchName",
        //     "FirstName",
        //     "LastName",
        //     "CustomerID",
        //     "ModelName",
        //     "ColourName",
        //     "VariantName",
        //   ],
        //   include: [
        //     {
        //       model: CustomerMaster,
        //       as: "NCBCustID",
        //       attributes: ["Transmission", "FuelType"],
        //     },
        //   ],
        // },
        // {
        //   model: UserMaster,
        //   as: "OARequestedBy",
        //   attributes: ["UserID", "UserName", "EmpID"],
        // },
        {
          model: UserMaster,
          as: "OAApprovedBy",
          attributes: ["UserID", "UserName", "EmpID"],
        },
      ],
      attributes: [
        "CustOfferID",
        "BookingID",
        "OfferID",
        // "MFGShare",
        // "DealerShare",
        // "TaxAmount",
        // "IGSTRate",
        // "CESSRate",
        "OfferAmount",
        // "RequestedBy",
        "ApprovedBy",
        // "Reffered",
        "Remarks",
        "Status",
      ],
      where: {
        BookingID: {
          [Op.eq]: BookingID,
        },
      },
    });

    console.log("Offer Approval Data:", offerApprovalData);

    // Step 2: Prepare formatted data
    const formattedData = offerApprovalData.map((booking) => {
      console.log("Booking Data:", booking);

      // Prepare the formatted data object
      const formattedOffer = {
        CustOfferID: booking.CustOfferID,
        BookingID: booking.BookingID,
        OfferID: booking.OfferID,
        OfferName: booking.OAOfferID.OfferName,
        // MFGShare: booking.MFGShare,
        // DealerShare: booking.DealerShare,
        // TaxAmount: booking.TaxAmount,
        // IGSTRate: booking.IGSTRate,
        // CESSRate: booking.CESSRate,
        OfferAmount: booking.OfferAmount,
        // RequestedBy: booking.RequestedBy,
        // RequestedByName: booking.OARequestedBy
        //   ? booking.OARequestedBy.UserName
        //   : null,
        ApprovedBy: booking.ApprovedBy,
        ApprovedByName: booking.OAApprovedBy
          ? booking.OAApprovedBy.UserName
          : null,
        // Reffered: booking.Reffered,
        Remarks: booking.Remarks,
        // BranchName: booking.OABookingID ? booking.OABookingID.BranchName : null,
        // FirstName: booking.OABookingID ? booking.OABookingID.FirstName : null,
        // LastName: booking.OABookingID ? booking.OABookingID.LastName : null,
        // CustomerID: booking.OABookingID ? booking.OABookingID.CustomerID : null,
        // ModelName: booking.OABookingID ? booking.OABookingID.ModelName : null,
        // VariantName: booking.OABookingID
        //   ? booking.OABookingID.VariantName
        //   : null,
        // ColourName: booking.OABookingID ? booking.OABookingID.ColourName : null,
        // Transmission:
        //   booking.OABookingID && booking.OABookingID.NCBCustID
        //     ? booking.OABookingID.NCBCustID.Transmission
        //     : null,
        // FuelTypeName:
        //   booking.OABookingID && booking.OABookingID.NCBCustID
        //     ? booking.OABookingID.NCBCustID.FuelType
        //     : null,

        // OfferDetails: booking.OfferDetails
        //   ? {

        // OfferAmount: booking.OAOfferID.OfferAmount,
        // Status: booking.OfferDetails.Status,
        // Remarks: booking.OfferDetails.Remarks,
        //   }
        // : null,
        Status: booking.Status,
      };
      return formattedOffer;
    });

    console.log("Formatted Data:", formattedData);

    // Step 3: Send the formatted data as response
    res.json(formattedData);
  } catch (error) {
    console.error("Error fetching booking data:", error);
    res.status(500).send({
      message: "Failed to retrieve booking data. Please try again later.",
    });
  }
};

// Mobile get all Rejected offer applied for a booking ID
exports.getAllRejectedOffersByStatusForMobile = async (req, res) => {
  const { BookingID, Status } = req.body;

  // Validate BookingID and Status inputs
  if (!BookingID) {
    return res.status(400).send({ message: "BookingID is required" });
  }
  if (!Status) {
    return res.status(400).send({ message: "Status is required" });
  }

  try {
    console.log("Fetching offers approval data...");

    // Step 1: Find offer approval data using BookingID and Status, and include related Offers model
    const offerApprovalData = await OffersApprovals.findAll({
      include: [
        {
          model: Offers,
          as: "OAOfferID",
          attributes: ["OfferName"],
        },
        // {
        //   model: NewCarBookings,
        //   as: "OABookingID",
        //   attributes: [
        //     "BranchName",
        //     "FirstName",
        //     "LastName",
        //     "CustomerID",
        //     "ModelName",
        //     "ColourName",
        //     "VariantName",
        //   ],
        //   include: [
        //     {
        //       model: CustomerMaster,
        //       as: "NCBCustID",
        //       attributes: ["Transmission", "FuelType"],
        //     },
        //   ],
        // },
        // {
        //   model: UserMaster,
        //   as: "OARequestedBy",
        //   attributes: ["UserID", "UserName", "EmpID"],
        // },
        {
          model: UserMaster,
          as: "OAApprovedBy",
          attributes: ["UserID", "UserName", "EmpID"],
        },
      ],
      attributes: [
        "CustOfferID",
        "BookingID",
        "OfferID",
        // "MFGShare",
        // "DealerShare",
        // "TaxAmount",
        // "IGSTRate",
        // "CESSRate",
        "OfferAmount",
        // "RequestedBy",
        "ApprovedBy",
        // "Reffered",
        "Remarks",
        "Status",
      ],
      where: {
        BookingID: {
          [Op.eq]: BookingID,
        },
        Status: {
          [Op.eq]: Status, // Use the Status from the request body
        },
      },
    });

    console.log("Offer Approval Data:", offerApprovalData);

    // Step 2: Prepare formatted data
    const formattedData = offerApprovalData.map((booking) => {
      console.log("Booking Data:", booking);

      // Prepare the formatted data object
      const formattedOffer = {
        CustOfferID: booking.CustOfferID,
        BookingID: booking.BookingID,
        OfferID: booking.OfferID,
        // MFGShare: booking.MFGShare,
        // DealerShare: booking.DealerShare,
        // TaxAmount: booking.TaxAmount,
        // IGSTRate: booking.IGSTRate,
        // CESSRate: booking.CESSRate,
        OfferAmount: booking.OfferAmount,
        // RequestedBy: booking.RequestedBy,
        // RequestedByName: booking.OARequestedBy
        //   ? booking.OARequestedBy.UserName
        //   : null,
        ApprovedBy: booking.ApprovedBy,
        ApprovedByName: booking.OAApprovedBy
          ? booking.OAApprovedBy.UserName
          : null,
        // Reffered: booking.Reffered,
        Remarks: booking.Remarks,
        // BranchName: booking.OABookingID ? booking.OABookingID.BranchName : null,
        // FirstName: booking.OABookingID ? booking.OABookingID.FirstName : null,
        // LastName: booking.OABookingID ? booking.OABookingID.LastName : null,
        // CustomerID: booking.OABookingID ? booking.OABookingID.CustomerID : null,
        // ModelName: booking.OABookingID ? booking.OABookingID.ModelName : null,
        // VariantName: booking.OABookingID
        //   ? booking.OABookingID.VariantName
        //   : null,
        // ColourName: booking.OABookingID ? booking.OABookingID.ColourName : null,
        // Transmission:
        //   booking.OABookingID && booking.OABookingID.NCBCustID
        //     ? booking.OABookingID.NCBCustID.Transmission
        //     : null,
        // FuelTypeName:
        //   booking.OABookingID && booking.OABookingID.NCBCustID
        //     ? booking.OABookingID.NCBCustID.FuelType
        //     : null,

        // OfferDetails: booking.OfferDetails
        //   ? {
        OfferName: booking.OAOfferID.OfferName,
        // OfferAmount: booking.OfferDetails.OfferAmount,
        // Status: booking.OfferDetails.Status,
        // Remarks: booking.OfferDetails.Remarks,
        // }
        // : null,
        Status: booking.Status,
      };
      return formattedOffer;
    });

    console.log("Formatted Data:", formattedData);

    // Step 3: Send the formatted data as response
    res.json(formattedData);
  } catch (error) {
    console.error("Error fetching booking data:", error);
    res.status(500).send({
      message: "Failed to retrieve booking data. Please try again later.",
    });
  }
};

// Mobile get all offer applied for a booking ID but categorized (all offers having similar booking ID)
// exports.getAllOfferByDiscountByIDForMobile = async (req, res) => {
//   try {
//     // Destructure and validate inputs
//     const { BookingID } = req.query;
//     if (!BookingID) {
//       return res.status(400).json({ message: "BookingID is required" });
//     }

//     // Step 1: Find all OffersApprovals that match the provided BookingID
//     const approvals = await OffersApprovals.findAll({
//       where: { BookingID: parseInt(BookingID, 10) },
//       attributes: ["OfferID", "Status"],
//     });

//     // Extract OfferIDs and their statuses from approvals
//     const offerStatusMap = approvals.reduce((acc, approval) => {
//       acc[approval.OfferID] = approval.Status;
//       return acc;
//     }, {});

//     const offerIDs = Object.keys(offerStatusMap);

//     if (offerIDs.length === 0) {
//       return res
//         .status(404)
//         .json({ message: "No offers found for the provided BookingID" });
//     }

//     // Step 2: Fetch offer details using OfferIDs
//     const offersData = await Offers.findAll({
//       where: { OfferID: { [Op.in]: offerIDs } },
//       attributes: [
//         "OfferID",
//         "OfferName",
//         "ValidFrom",
//         "ValidUpto",
//         "DiscountID",
//         "BranchID",
//         "ModelID",
//         "VariantID",
//         "ColourID",
//         "TransmissionID",
//         "FuelTypeID",
//       ],
//       include: [
//         {
//           model: DiscountMaster,
//           as: "ODiscountID",
//           attributes: ["DiscountID", "DiscountName"],
//         },
//         {
//           model: BranchMaster,
//           as: "OBranchID",
//           attributes: ["BranchID", "BranchName"],
//         },
//       ],
//     });

//     // Step 3: Group offers by DiscountName and include Status
//     const discountOffersMap = offersData.reduce((acc, offer) => {
//       const discountName = offer.ODiscountID
//         ? offer.ODiscountID.DiscountName
//         : "No Discount";
//       if (!acc[discountName]) {
//         acc[discountName] = [];
//       }
//       acc[discountName].push({
//         OfferID: offer.OfferID,
//         OfferName: offer.OfferName,
//         ValidFrom: offer.ValidFrom,
//         ValidUpto: offer.ValidUpto,
//         DiscountID: offer.DiscountID,
//         DiscountName: offer.ODiscountID ? offer.ODiscountID.DiscountName : null,
//         BranchID: offer.BranchID,
//         BranchName: offer.OBranchID ? offer.OBranchID.BranchName : null,
//         ModelID: offer.ModelID,
//         VariantID: offer.VariantID,
//         ColourID: offer.ColourID,
//         TransmissionID: offer.TransmissionID,
//         FuelTypeID: offer.FuelTypeID,
//         Status: offerStatusMap[offer.OfferID], // Add Status from OfferApprovals
//       });
//       return acc;
//     }, {});

//     // Step 4: Prepare formatted response data
//     const formattedData = Object.keys(discountOffersMap).map(
//       (discountName) => ({
//         DiscountName: discountName,
//         Offers: discountOffersMap[discountName],
//       })
//     );

//     // Step 5: Send the formatted data as response
//     res.json(formattedData);
//   } catch (error) {
//     console.error("Error fetching offers data:", error);
//     res.status(500).send({
//       message: "Failed to retrieve offers data. Please try again later.",
//       details: error.message,
//     });
//   }
// };

exports.getAllOfferByDiscountByIDForMobile = async (req, res) => {
  try {
    // Destructure and validate inputs
    const { BookingID } = req.query;
    if (!BookingID) {
      return res.status(400).json({ message: "BookingID is required" });
    }

    // Step 1: Find all OffersApprovals that match the provided BookingID
    const approvals = await OffersApprovals.findAll({
      where: { BookingID: parseInt(BookingID, 10) },
      attributes: ["OfferID", "Status", "Remarks", "ApprovedBy"],
    });

    // Create a map of OfferID to its approval data (Status, Remarks, ApprovedBy)
    const offerApprovalMap = approvals.reduce((acc, approval) => {
      acc[approval.OfferID] = {
        Status: approval.Status,
        Remarks: approval.Remarks,
        ApprovedBy: approval.ApprovedBy,
      };
      return acc;
    }, {});

    const offerIDs = Object.keys(offerApprovalMap);

    if (offerIDs.length === 0) {
      return res
        .status(404)
        .json({ message: "No offers found for the provided BookingID" });
    }

    // Step 2: Fetch offer details using OfferIDs
    const offersData = await Offers.findAll({
      where: { OfferID: { [Op.in]: offerIDs } },
      attributes: [
        "OfferID",
        "OfferName",
        "ValidFrom",
        "ValidUpto",
        "DiscountID",
        "BranchID",
        "ModelID",
        "VariantID",
        "ColourID",
        "TransmissionID",
        "FuelTypeID",
        "OfferAmount",
      ],
      include: [
        {
          model: DiscountMaster,
          as: "ODiscountID",
          attributes: ["DiscountID", "DiscountName"],
        },
        {
          model: BranchMaster,
          as: "OBranchID",
          attributes: ["BranchID", "BranchName"],
        },
      ],
    });

    // Step 3: Group offers by DiscountName and include Status, Remarks, ApprovedBy
    const discountOffersMap = offersData.reduce((acc, offer) => {
      const discountName = offer.ODiscountID
        ? offer.ODiscountID.DiscountName
        : "No Discount";
      if (!acc[discountName]) {
        acc[discountName] = [];
      }
      const approvalData = offerApprovalMap[offer.OfferID]; // Get approval data for the offer
      acc[discountName].push({
        OfferID: offer.OfferID,
        OfferName: offer.OfferName,
        ValidFrom: offer.ValidFrom,
        ValidUpto: offer.ValidUpto,
        DiscountID: offer.DiscountID,
        DiscountName: offer.ODiscountID ? offer.ODiscountID.DiscountName : null,
        BranchID: offer.BranchID,
        BranchName: offer.OBranchID ? offer.OBranchID.BranchName : null,
        ModelID: offer.ModelID,
        VariantID: offer.VariantID,
        ColourID: offer.ColourID,
        TransmissionID: offer.TransmissionID,
        FuelTypeID: offer.FuelTypeID,
        Status: approvalData.Status, // Add Status from OfferApprovals
        Remarks: approvalData.Remarks, // Add Remarks from OfferApprovals
        ApprovedBy: approvalData.ApprovedBy, // Add ApprovedBy from OfferApprovals
        OfferAmount: offer.OfferAmount,
      });
      return acc;
    }, {});

    // Step 4: Prepare formatted response data
    const formattedData = Object.keys(discountOffersMap).map(
      (discountName) => ({
        DiscountName: discountName,
        Offers: discountOffersMap[discountName],
      })
    );

    // Step 5: Send the formatted data as response
    res.json(formattedData);
  } catch (error) {
    console.error("Error fetching offers data:", error);
    res.status(500).send({
      message: "Failed to retrieve offers data. Please try again later.",
      details: error.message,
    });
  }
};

exports.getAllOfferAndStatusForMobile = async (req, res) => {
  try {
    // Destructure and validate inputs
    const { BookingID, Status } = req.query;
    if (!BookingID) {
      return res.status(400).json({ message: "BookingID is required" });
    }

    // Step 1: Find all OffersApprovals that match the provided BookingID
    const approvals = await OffersApprovals.findAll({
      where: { BookingID: parseInt(BookingID, 10), Status: Status },
      attributes: ["OfferID", "Status", "Remarks", "ApprovedBy"],
    });
    console.log("????????????", approvals);

    // Create a map of OfferID to its approval data (Status, Remarks, ApprovedBy)
    const offerApprovalMap = approvals.reduce((acc, approval) => {
      acc[approval.OfferID] = {
        Status: approval.Status,
        Remarks: approval.Remarks,
        ApprovedBy: approval.ApprovedBy,
      };
      return acc;
    }, {});

    const offerIDs = Object.keys(offerApprovalMap);

    if (offerIDs.length === 0) {
      return res
        .status(404)
        .json({ message: "No offers found for the provided BookingID" });
    }

    // Step 2: Fetch offer details using OfferIDs
    const offersData = await Offers.findAll({
      where: { OfferID: { [Op.in]: offerIDs } },
      attributes: [
        "OfferID",
        "OfferName",
        "ValidFrom",
        "ValidUpto",
        "DiscountID",
        "BranchID",
        "ModelID",
        "VariantID",
        "ColourID",
        "TransmissionID",
        "FuelTypeID",
        "OfferAmount",
      ],
      include: [
        {
          model: DiscountMaster,
          as: "ODiscountID",
          attributes: ["DiscountID"],
        },
        {
          model: BranchMaster,
          as: "OBranchID",
          attributes: ["BranchID", "BranchName"],
        },
      ],
    });

    // Step 3: Group offers by DiscountName and include Status, Remarks, ApprovedBy
    const discountOffersMap = offersData.reduce((acc, offer) => {
      const discountName = offer.ODiscountID
        ? offer.ODiscountID.DiscountName
        : "No Discount";
      if (!acc[discountName]) {
        acc[discountName] = [];
      }
      const approvalData = offerApprovalMap[offer.OfferID]; // Get approval data for the offer
      acc[discountName].push({
        OfferID: offer.OfferID,
        OfferName: offer.OfferName,
        ValidFrom: offer.ValidFrom,
        ValidUpto: offer.ValidUpto,
        DiscountID: offer.DiscountID,
        DiscountName: offer.ODiscountID ? offer.ODiscountID.DiscountName : null,
        BranchID: offer.BranchID,
        BranchName: offer.OBranchID ? offer.OBranchID.BranchName : null,
        ModelID: offer.ModelID,
        VariantID: offer.VariantID,
        ColourID: offer.ColourID,
        TransmissionID: offer.TransmissionID,
        FuelTypeID: offer.FuelTypeID,
        Status: approvalData.Status, // Add Status from OfferApprovals
        Remarks: approvalData.Remarks, // Add Remarks from OfferApprovals
        ApprovedBy: approvalData.ApprovedBy, // Add ApprovedBy from OfferApprovals
        OfferAmount: offer.OfferAmount,
      });
      return acc;
    }, {});

    // Step 4: Prepare formatted response data
    // const formattedData = Object.keys(discountOffersMap).map(
    //   (discountName) => ({
    //     DiscountName: discountName,
    //     Offers: discountOffersMap[discountName],
    //   })
    // );

    // Step 5: Send the formatted data as response
    res.json(discountOffersMap);
  } catch (error) {
    console.error("Error fetching offers data:", error);
    res.status(500).send({
      message: "Failed to retrieve offers data. Please try again later.",
      details: error.message,
    });
  }
};
// Dynamic APi for getting Offers based on Status for a Particular Booking ID
exports.getAllOffersBasedOnStatusForMobile = async (req, res) => {
  const { Status } = req.query;
  const { BookingID } = req.query;

  // Validate Status input
  if (!Status) {
    return res.status(400).send({ message: "Status is required" });
  }

  try {
    console.log("Fetching offers approval data...");

    // Step 1: Find offer approval data using Status and include related Offers model
    const offerApprovalData = await OffersApprovals.findAll({
      include: [
        {
          model: Offers,
          as: "OAOfferID",
          attributes: ["OfferName", "ValidFrom", "ValidUpto"],
        },

        // {
        //   model: UserMaster,
        //   as: "OAApprovedBy",
        //   attributes: ["UserID", "UserName", "EmpID"],
        // },
      ],
      attributes: [
        "CustOfferID",
        "BookingID",
        "OfferID",
        "OfferAmount",
        "ApprovedBy",
        "Remarks",
        "Status",
      ],
      where: {
        Status: {
          [Op.eq]: Status,
        },
        BookingID: {
          [Op.eq]: BookingID,
        },
      },
    });

    console.log("Offer Approval Data:", offerApprovalData);

    // Step 2: Prepare formatted data
    const formattedData = offerApprovalData.map((approval) => {
      console.log("Approval Data:", approval);

      // Prepare the formatted data object
      const formattedOffer = {
        CustOfferID: approval.CustOfferID,
        BookingID: approval.BookingID,
        OfferID: approval.OfferID,
        // OfferAmount: approval.OfferAmount,
        // ApprovedBy: approval.ApprovedBy,
        // ApprovedByName: approval.OAApprovedBy
        //   ? approval.OAApprovedBy.UserName
        //   : null,

        OfferName: approval.OAOfferID ? approval.OAOfferID.OfferName : null,
        ValidFrom: approval.OAOfferID ? approval.OAOfferID.ValidFrom : null,
        ValidUpto: approval.OAOfferID ? approval.OAOfferID.ValidUpto : null,
        OfferAmount: approval.OfferAmount || null,
        Remarks: approval.Remarks,
        Status: approval.Status,
      };
      return formattedOffer;
    });

    console.log("Formatted Data:", formattedData);

    // Step 3: Send the formatted data as response
    res.json(formattedData);
  } catch (error) {
    console.error("Error fetching offer approval data:", error);
    res.status(500).send({
      message:
        "Failed to retrieve offer approval data. Please try again later.",
    });
  }
};

// Update tables(offer approvals and approval refferal) based on action
exports.bulkUpdateRequestedOffers = async (req, res) => {
  const { ids, Status, RefferedTo, Remarks, UserID } = req.body;

  console.log("!!!!!", req.body);
  // ids are custofferids
  // Validate request
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: "IDs are required" });
  }
  if (!UserID) {
    return res.status(400).json({ message: "UserID are required" });
  }
  if (!Status) {
    return res.status(400).json({ message: "Status is required" });
  }

  if (Status == "Reffered" && !RefferedTo) {
    return res.status(400).json({ message: "RefferedTo is required" });
  }

  if (Status == "Rejected" && !Remarks) {
    return res.status(400).json({ message: "Remarks are required" });
  }
  try {
    if (Status == "Approved" || Status == "Rejected") {
      const appliedOffers = await OffersApprovals.findAll({
        where: {
          CustOfferID: { [Op.in]: ids },
          Status: { [Op.ne]: "Approved" },
        },
      });
      if (!appliedOffers) {
        return res.status(400).json({
          message: "Data with provided OfferIDs not found in offer approvals",
        });
      }
      const offersRef = await ApprovalRefferal.findAll({
        where: {
          CustOfferID: { [Op.in]: ids },
          ActionStatus: { [Op.ne]: "Reffered" },
        },
      });
      if (!offersRef) {
        return res.status(400).json({
          message:
            "Data with provided OfferIDs not found in approval refferals",
        });
      }

      // Update appliedOffers
      for (const offer of appliedOffers) {
        await offer.update({
          Status: Status || offer.Status,
          Remarks: Remarks || offer.Remarks || null,
          ApprovedBy: UserID || null,
        });
      }

      // Update offersRef
      for (const ref of offersRef) {
        await ref.update({
          ActionStatus: Status || ref.ActionStatus,
          ActionDate: req.body.ActionDate || ref.ActionDate || new Date(),
        });
      }

      // Optionally, respond with a success message or the updated records
      return res.status(200).json({ message: "Records updated successfully" });
    } else if (Status === "Reffered") {
      // Update logic for Reffered status
      const appliedOffers = await OffersApprovals.findAll({
        where: {
          CustOfferID: { [Op.in]: ids },
          Status: "Requested",
        },
      });

      if (!appliedOffers.length) {
        return res.status(400).json({
          message: "Data with provided OfferIDs not found in requested offers",
        });
      }

      const offersRef = await ApprovalRefferal.findAll({
        where: {
          CustOfferID: { [Op.in]: ids },
          ActionStatus: { [Op.ne]: "Reffered" },
        },
      });

      if (!offersRef.length) {
        return res.status(400).json({
          message:
            "Data with provided OfferIDs not found in approval referrals",
        });
      }

      // Update appliedOffers
      for (const offer of appliedOffers) {
        await offer.update({
          Status: Status,
          Remarks: Remarks,
          ApprovedBy: UserID,
        });
      }

      // Update offersRef
      for (const ref of offersRef) {
        await ref.update({
          ActionStatus: Status,
          ActionDate: req.body.ActionDate || new Date(),
        });
      }

      // Insert new records into ApprovalRefferal
      const newRecords = ids.map((id) => ({
        CustOfferID: id,
        RequestedBy: UserID,
        RequestDate: req.body.RequestDate || new Date(),
        RequestedTo: RefferedTo,
        ActionDate: req.body.ActionDate || new Date(),
        RequestStatus: req.body.RequestStatus || "Requested",
        ActionStatus: "Requested",
      }));

      await ApprovalRefferal.bulkCreate(newRecords);

      return res.status(200).json({
        message: "Records updated and new records inserted successfully",
      });
    }
  } catch (err) {
    // Handle errors based on specific types
    if (err.name === "SequelizeValidationError") {
      return res.status(400).json({
        message: "Validation error",
        details: err.errors.map((e) => e.message),
      });
    }

    if (err.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message:
          "Database error occurred while updating OffersApprovals and ApprovalRefferal.",
        details: err.message,
      });
    }

    if (err.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: err.message,
      });
    }

    // General error handling
    console.error("Error updating OffersApprovals and ApprovalRefferal:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// // test
// exports.updateApprovedOffer = async (req, res) => {
//   const { id, ApprovedBy, Remarks } = req.body;

//   // Validate request
//   if (!id) {
//     return res.status(400).json({ message: "ID is required" });
//   }

//   if (!ApprovedBy && !Remarks) {
//     return res.status(400).json({
//       message:
//         "At least one field to update (ApprovedBy or Remarks) is required",
//     });
//   }

//   try {
//     // Fetch the OffersApprovals record for the provided id with Status 'Approved'
//     let offerApproval = await OffersApprovals.findOne({
//       where: {
//         CustOfferID: id,
//         Status: "Approved",
//       },
//     });

//     if (!offerApproval) {
//       return res.status(404).json({
//         message:
//           "OffersApprovals not found or not approved for the provided ID",
//       });
//     }

//     // Update fields for the OffersApprovals record
//     if (ApprovedBy) offerApproval.ApprovedBy = ApprovedBy;
//     if (Remarks) offerApproval.Remarks = Remarks;

//     await offerApproval.save();

//     // Fetch and return the updated record with additional information
//     const updatedOfferApproval = await OffersApprovals.findOne({
//       where: { CustOfferID: id },
//       include: [
//         {
//           model: UserMaster,
//           as: "OAApprovedBy",
//           attributes: ["UserID", "UserName", "EmpID"],
//         },
//         {
//           model: Offers,
//           as: "OAOfferID",
//           attributes: ["OfferName", "ValidFrom", "ValidUpto"],
//         },
//       ],
//       attributes: [
//         "CustOfferID",
//         "OfferID",
//         "OfferAmount",
//         "ApprovedBy",
//         "Remarks",
//         "Status",
//       ],
//     });

//     // Format the response as required
//     const formattedResponse = {
//       CustOfferID: updatedOfferApproval.CustOfferID,
//       OfferAmount: updatedOfferApproval.OfferAmount,
//       OfferID: updatedOfferApproval.OfferID,
//       ApprovedBy: updatedOfferApproval.ApprovedBy,
//       Remarks: updatedOfferApproval.Remarks,

//       UserID: updatedOfferApproval.OAApprovedBy
//         ? updatedOfferApproval.OAApprovedBy.UserID
//         : null,
//       UserName: updatedOfferApproval.OAApprovedBy
//         ? updatedOfferApproval.OAApprovedBy.UserName
//         : null,
//       EmpID: updatedOfferApproval.OAApprovedBy
//         ? updatedOfferApproval.OAApprovedBy.EmpID
//         : null,
//       OfferName: updatedOfferApproval.OAOfferID
//         ? updatedOfferApproval.OAOfferID.OfferName
//         : null,
//       ValidFrom: updatedOfferApproval.OAOfferID
//         ? updatedOfferApproval.OAOfferID.ValidFrom
//         : null,
//       ValidUpto: updatedOfferApproval.OAOfferID
//         ? updatedOfferApproval.OAOfferID.ValidUpto
//         : null,
//       Status: updatedOfferApproval.Status,
//     };

//     return res.status(200).json({ updatedOfferApproval: formattedResponse });
//   } catch (err) {
//     // Handle errors based on specific types
//     if (err.name === "SequelizeValidationError") {
//       // Handle Sequelize validation errors
//       return res.status(400).json({
//         message: "Validation error",
//         details: err.errors.map((e) => e.message),
//       });
//     }

//     if (err.name === "SequelizeDatabaseError") {
//       // Handle database errors
//       return res.status(500).json({
//         message: "Database error occurred while updating OffersApprovals.",
//         details: err.message,
//       });
//     }

//     if (err.name === "SequelizeConnectionError") {
//       // Handle connection errors
//       return res.status(503).json({
//         message: "Service unavailable. Unable to connect to the database.",
//         details: err.message,
//       });
//     }

//     // General error handling
//     console.error("Error updating OffersApprovals:", err);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };
// // test
// exports.updateRejectedOffer = async (req, res) => {
//   const { id, Remarks } = req.body;

//   // Validate request
//   if (!id) {
//     return res.status(400).json({ message: "ID is required" });
//   }

//   if (!Remarks) {
//     return res.status(400).json({
//       message:
//         "At least one field to update (ApprovedBy or Remarks) is required",
//     });
//   }

//   try {
//     // Fetch the OffersApprovals record for the provided id with Status 'Approved'
//     let offerApproval = await OffersApprovals.findOne({
//       where: {
//         CustOfferID: id,
//         Status: "Rejected",
//       },
//     });

//     if (!offerApproval) {
//       return res.status(404).json({
//         message:
//           "OffersApprovals not found or not approved for the provided ID",
//       });
//     }

//     // Update fields for the OffersApprovals record
//     // if (ApprovedBy) offerApproval.ApprovedBy = ApprovedBy;
//     if (Remarks) offerApproval.Remarks = Remarks;

//     await offerApproval.save();

//     // Fetch and return the updated record with additional information
//     const updatedOfferApproval = await OffersApprovals.findOne({
//       where: { CustOfferID: id },
//       include: [
//         {
//           model: UserMaster,
//           as: "OAApprovedBy",
//           attributes: ["UserID", "UserName", "EmpID"],
//         },
//         {
//           model: Offers,
//           as: "OAOfferID",
//           attributes: ["OfferName", "ValidFrom", "ValidUpto"],
//         },
//       ],

//       attributes: [
//         "CustOfferID",
//         "OfferID",
//         "OfferAmount",
//         "ApprovedBy",
//         "Remarks",
//         "Status",
//       ],
//     });

//     // Format the response as required
//     const formattedResponse = {
//       CustOfferID: updatedOfferApproval.CustOfferID,
//       OfferID: updatedOfferApproval.OfferID,
//       OfferName: updatedOfferApproval.OfferName,

//       OfferAmount: updatedOfferApproval.OfferAmount,
//       RejectedBy: updatedOfferApproval.ApprovedBy,
//       Remarks: updatedOfferApproval.Remarks,

//       UserID: updatedOfferApproval.OAApprovedBy
//         ? updatedOfferApproval.OAApprovedBy.UserID
//         : null,
//       UserName: updatedOfferApproval.OAApprovedBy
//         ? updatedOfferApproval.OAApprovedBy.UserName
//         : null,
//       EmpID: updatedOfferApproval.OAApprovedBy
//         ? updatedOfferApproval.OAApprovedBy.EmpID
//         : null,
//       OfferName: updatedOfferApproval.OAOfferID
//         ? updatedOfferApproval.OAOfferID.OfferName
//         : null,
//       ValidFrom: updatedOfferApproval.OAOfferID
//         ? updatedOfferApproval.OAOfferID.ValidFrom
//         : null,
//       ValidUpto: updatedOfferApproval.OAOfferID
//         ? updatedOfferApproval.OAOfferID.ValidUpto
//         : null,
//       Status: updatedOfferApproval.Status,
//     };

//     return res.status(200).json({ updatedOfferApproval: formattedResponse });
//   } catch (err) {
//     // Handle errors based on specific types
//     if (err.name === "SequelizeValidationError") {
//       // Handle Sequelize validation errors
//       return res.status(400).json({
//         message: "Validation error",
//         details: err.errors.map((e) => e.message),
//       });
//     }

//     if (err.name === "SequelizeDatabaseError") {
//       // Handle database errors
//       return res.status(500).json({
//         message: "Database error occurred while updating OffersApprovals.",
//         details: err.message,
//       });
//     }

//     if (err.name === "SequelizeConnectionError") {
//       // Handle connection errors
//       return res.status(503).json({
//         message: "Service unavailable. Unable to connect to the database.",
//         details: err.message,
//       });
//     }

//     // General error handling
//     console.error("Error updating OffersApprovals:", err);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };

exports.GetMasterIdsByBookings = async (req, res) => {
  try {
    // Log the received BookingID for debugging
    console.log("BookingID received:", req.query.BookingID);

    // Fetch booking data using req.query.BookingID instead of req.body
    const modelData = await NewCarBookings.findAll({
      where: { BookingID: req.query.BookingID }, // Use req.query to get BookingID
    });

    // Log the fetched booking data for debugging
    console.log("Booking data:", modelData);

    if (!modelData || modelData.length === 0) {
      return res.status(404).json({
        message: "No booking data found.",
      });
    }

    // Process each booking entry and fetch related IDs
    const filteredData = await Promise.all(
      modelData.map(async (booking) => {
        // Find ModelID from ModelTable based on ModelName
        const model = await ModelMaster.findOne({
          where: { ModelDescription: booking.ModelName },
        });
        const ModelID = model ? model.ModelMasterID : null;

        // Find ColourID from ColourMaster based on ColourName
        const colour = await ColourMaster.findOne({
          where: { ColourDescription: booking.ColourName },
        });
        const ColourID = colour ? colour.ColourID : null;

        // Find VariantID from VariantMaster based on VariantName
        const variant = await VariantMaster.findOne({
          where: { VariantCode: booking.VariantName },
        });
        const VariantID = variant ? variant.VariantID : null;

        // Find FuelID from FuelType based on FuelTypeName
        const fuel = await FuelType.findOne({
          where: { FuelTypeName: booking.Fuel },
        });
        const FuelTypeID = fuel ? fuel.FuelTypeID : null;

        // Find TransmissionID from Transmission based on TransmissionCode
        const transmissionData = await Transmission.findOne({
          where: { TransmissionCode: booking.Transmission },
        });
        const TransmissionID = transmissionData
          ? transmissionData.TransmissionID
          : null;

        // Return filtered and mapped data
        return {
          BookingID: booking.BookingID,
          ModelName: booking.ModelName,
          ModelID: ModelID,
          ColourName: booking.ColourName,
          ColourID: ColourID,
          VariantName: booking.VariantName,
          VariantID: VariantID,
          Transmission: booking.Transmission,
          TransmissionID: TransmissionID,
          Fuel: booking.Fuel,
          FuelID: FuelTypeID,
        };
      })
    );

    // Send the filtered data as a response
    res.json(filteredData);
  } catch (error) {
    // Log the error for debugging
    console.error("Error retrieving model data:", error);

    // Send the detailed error message in the response for debugging
    res.status(500).json({
      message: "Failed to retrieve model data. Please try again later.",
      error: error.message,
    });
  }
};

/* Applied Offers for a booking which are grouped by applied, saved, req, ref
// exports.appliedOffersforBooking = async (req, res) => {
//   const bookingID = req.query.BookingID;

//   // Validate bookingID input
//   if (!bookingID) {
//     return res.status(400).send({ message: "BookingID is required" });
//   }

//   try {
//     console.log("Fetching offers data...");

//     // Fetch the offer approvals based on BookingID
//     const offerApprovals = await OffersApprovals.findAll({
//       where: { BookingID: bookingID },
//       include: [
//         {
//           model: NewCarBookings,
//           as: "OABookingID",
//           attributes: [
//             "BranchName",
//             "ModelName",
//             "ColourName",
//             "VariantName",
//             "CustomerID",
//           ],
//           include: [
//             {
//               model: CustomerMaster,
//               as: "NCBCustID",
//               attributes: ["Transmission", "FuelType"],
//             },
//           ],
//         },
//         {
//           model: Offers,
//           as: "OAOfferID",
//           attributes: ["OfferName", "ValidFrom", "ValidUpto", "Status"],
//         },
//       ],
//     });

//     if (!offerApprovals.length) {
//       return res
//         .status(404)
//         .json({ message: "No offer approvals found for the given BookingID" });
//     }

//     // Separate the results into requested, approved, rejected, Reffered, and saved lists
//     const requestedList = [];
//     const approvedList = [];
//     const rejectedList = [];
//     const refferedCustOfferIDs = [];
//     const savedList = []; // New savedList array

//     for (const offerApproval of offerApprovals) {
//       const details = {
//         CustOfferID: offerApproval.CustOfferID,
//         BookingID: offerApproval.BookingID,
//         OfferID: offerApproval.OfferID,
//         MFGShare: offerApproval.MFGShare,
//         DealerShare: offerApproval.DealerShare,
//         TaxAmount: offerApproval.TaxAmount,
//         IGSTRate: offerApproval.IGSTRate,
//         CESSRate: offerApproval.CESSRate,
//         OfferAmount: offerApproval.OfferAmount,
//         RequestedBy: offerApproval.RequestedBy,
//         ApprovedBy: offerApproval.ApprovedBy,
//         Reffered: offerApproval.Reffered,
//         Remarks: offerApproval.Remarks,

//         OfferName: offerApproval.OAOfferID.OfferName,
//         ValidFrom: offerApproval.OAOfferID.ValidFrom,
//         ValidUpto: offerApproval.OAOfferID.ValidUpto,
//         OfferStatus: offerApproval.OAOfferID.Status,

//         BranchName: offerApproval.OABookingID.BranchName,
//         ModelName: offerApproval.OABookingID.ModelName,
//         ColourName: offerApproval.OABookingID.ColourName,
//         VariantName: offerApproval.OABookingID.VariantName,

//         Transmission: offerApproval.OABookingID.NCBCustID.Transmission,
//         FuelType: offerApproval.OABookingID.NCBCustID.FuelType,
//         OfferApprovalStatus: offerApproval.Status,
//       };

//       // Add records to the requestedList for both "Requested" and "Reffered" statuses
//       if (offerApproval.Status === "Requested" || offerApproval.Status === "Reffered") {
//         requestedList.push(details);
//       }

//       // Add records to the appropriate lists based on status
//       if (offerApproval.Status === "Approved") {
//         approvedList.push(details);
//       } else if (offerApproval.Status === "Rejected") {
//         rejectedList.push(details);
//       } else if (offerApproval.Status === "Reffered") {
//         refferedCustOfferIDs.push(offerApproval.CustOfferID);
//       } else if (offerApproval.Status === "Saved") {
//         // Add condition for the savedList (you can change the condition as needed)
//         savedList.push(details);
//       }
//     }

//     // If there are any Reffered records, fetch related requested records from ApprovalRefferal
//     let refferedDetails = [];

//     if (refferedCustOfferIDs.length > 0) {
//       refferedDetails = await ApprovalRefferal.findAll({
//         where: {
//           CustOfferID: refferedCustOfferIDs,
//           ActionStatus: "Requested",
//         },
//         include: [
//           {
//             model: OffersApprovals,
//             as: "ARCustOfferID",
//             include: [
//               {
//                 model: NewCarBookings,
//                 as: "OABookingID",
//                 attributes: [
//                   "BranchName",
//                   "ModelName",
//                   "ColourName",
//                   "VariantName",
//                   "CustomerID",
//                 ],
//                 include: [
//                   {
//                     model: CustomerMaster,
//                     as: "NCBCustID",
//                     attributes: ["Transmission", "FuelType"],
//                   },
//                 ],
//               },
//               {
//                 model: Offers,
//                 as: "OAOfferID",
//                 attributes: ["OfferName", "ValidFrom", "ValidUpto", "Status"],
//               },
//             ],
//           },
//         ],
//       });

//       // Process the referral approvals to match the structure
//       refferedDetails = refferedDetails.map((referralApproval) => {
//         const originalOffer = referralApproval.ARCustOfferID;

//         return {
//           CustOfferID: referralApproval.CustOfferID,
//           BookingID: originalOffer.BookingID,
//           OfferID: originalOffer.OfferID,
//           MFGShare: originalOffer.MFGShare,
//           DealerShare: originalOffer.DealerShare,
//           TaxAmount: originalOffer.TaxAmount,
//           IGSTRate: originalOffer.IGSTRate,
//           CESSRate: originalOffer.CESSRate,
//           OfferAmount: originalOffer.OfferAmount,
//           RequestedBy: originalOffer.RequestedBy,
//           ApprovedBy: originalOffer.ApprovedBy,
//           Reffered: originalOffer.Reffered,
//           Remarks: originalOffer.Remarks,

//           OfferName: originalOffer.OAOfferID.OfferName,
//           ValidFrom: originalOffer.OAOfferID.ValidFrom,
//           ValidUpto: originalOffer.OAOfferID.ValidUpto,
//           OfferStatus: originalOffer.OAOfferID.Status,

//           BranchName: originalOffer.OABookingID.BranchName,
//           ModelName: originalOffer.OABookingID.ModelName,
//           ColourName: originalOffer.OABookingID.ColourName,
//           VariantName: originalOffer.OABookingID.VariantName,

//           Transmission: originalOffer.OABookingID.NCBCustID.Transmission,
//           FuelType: originalOffer.OABookingID.NCBCustID.FuelType,
//           OfferApprovalStatus: referralApproval.ActionStatus,
//         };
//       });
//     }

//     // Return the result
//     res.json({
//       requested: requestedList,
//       approved: approvedList,
//       rejected: rejectedList,
//       reffered: refferedDetails,
//       saved: savedList, // Add savedList to the response
//     });
//   } catch (error) {
//     console.error("Error fetching offer details:", error);
//     res.status(500).send({
//       message: "Failed to retrieve offer details. Please try again later.",
//     });
//   }
// };
*/
exports.updateSavedApprovals = async (req, res) => {
  const bookingID = req.body.BookingID;
  const offerIDs = req.body.OfferID;

  try {
    // Ensure offerIDs is valid and not empty
    if (!offerIDs || !Array.isArray(offerIDs) || offerIDs.length === 0) {
      return res.status(400).send({ message: "Invalid or empty IDs array." });
    }
    // Update OfferApprovals records with the generated GRNNumber
    const [numAffectedRows] = await OffersApprovals.update(
      {
        Status: "Requested",
        ModifiedDate: new Date(),
      },
      { where: { BookingID: bookingID, OfferID: { [Op.in]: offerIDs } } }
    );

    if (numAffectedRows > 0) {
      res.send({ message: "OfferApprovals was updated successfully." });
    } else {
      res.status(404).send({
        message: `Cannot update OfferApprovals with id=${offerIDs}. OfferApprovals not found.`,
      });
    }
  } catch (err) {
    // Handle errors based on specific types
    if (err.name === "SequelizeValidationError") {
      // Handle Sequelize validation errors
      return res.status(400).json({
        message: "Validation error",
        details: err.errors.map((e) => e.message),
      });
    }

    if (err.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while updating OfferApprovals.",
        details: err.message,
      });
    }

    if (err.name === "SequelizeConnectionError") {
      // Handle connection errors
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: err.message,
      });
    }
    console.error("Error updating OfferApprovals:", err);
    res.status(500).send({
      message: `Error updating OfferApprovals with id=${offerIDs}.`,
      details: err.message,
    });
  }
};
