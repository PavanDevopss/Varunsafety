/* eslint-disable no-dupe-keys */
/* eslint-disable no-unused-vars */
const db = require("../models");
const Offers = db.offers;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;
const DiscountMaster = db.discountmaster;
const ModelMaster = db.modelmaster;
const VariantMaster = db.variantmaster;
const ColourMaster = db.colourmaster;
const Transmission = db.transmission;
const FuelType = db.fueltypes;
const BranchMaster = db.branchmaster;
const SKUMaster = db.skumaster;
const Offer = db.offers;

// Basic CRUD API

// Create and Save a new Offers
exports.create = async (req, res) => {
  console.log("OfferName:", req.body.OfferName);

  try {
    // Validate request
    // if (!req.body.OfferName) {
    //   return res.status(400).json({ message: "OfferName cannot be empty" });
    // }

    // Check if OfferName already exists
    const existingModel = await Offers.findOne({
      where: { OfferName: req.body.OfferName },
    });
    if (existingModel) {
      return res.status(400).json({ message: "OfferName already exists" });
    }
    if (!/^[a-zA-Z ]*$/.test(req.body.OfferName)) {
      console.log("Validation failed: OfferName contains special characters.");
      return res.status(400).json({
        message: "OfferName should contain only letters",
      });
    }
    // Validate foreign keys
    const [
      discountExists,
      branchExists,
      modelExists,
      variantExists,
      colourExists,
      transmissionExists,
      fuelTypeExists,
    ] = await Promise.all([
      DiscountMaster.findByPk(req.body.DiscountID),
      BranchMaster.findByPk(req.body.BranchID),
      ModelMaster.findByPk(req.body.ModelID),
      VariantMaster.findByPk(req.body.VariantID),
      ColourMaster.findByPk(req.body.ColourID),
      Transmission.findByPk(req.body.TransmissionID),
      FuelType.findByPk(req.body.FuelTypeID),
    ]);

    if (!discountExists) {
      return res.status(400).json({ message: "Invalid DiscountID" });
    }
    if (!branchExists) {
      return res.status(400).json({ message: "Invalid BranchID" });
    }
    if (!modelExists) {
      return res.status(400).json({ message: "Invalid ModelID" });
    }
    if (!variantExists) {
      return res.status(400).json({ message: "Invalid VariantID" });
    }
    if (!colourExists) {
      return res.status(400).json({ message: "Invalid ColourID" });
    }
    if (!transmissionExists) {
      return res.status(400).json({ message: "Invalid TransmissionID" });
    }
    if (!fuelTypeExists) {
      return res.status(400).json({ message: "Invalid FuelTypeID" });
    }

    // Create an Offers object
    const offers = {
      OfferName: discountExists.DiscountName,
      DiscountID: req.body.DiscountID,
      BranchID: req.body.BranchID,
      ModelID: req.body.ModelID,
      VariantID: req.body.VariantID,
      ColourID: req.body.ColourID,
      TransmissionID: req.body.TransmissionID,
      FuelTypeID: req.body.FuelTypeID,
      ValidFrom: req.body.ValidFrom,
      ValidUpto: req.body.ValidUpto,
      MFGShare: req.body.MFGShare,
      DealerShare: req.body.DealerShare,
      TaxAmount: req.body.TaxAmount || null,
      IGSTRate: req.body.IGSTRate || null,
      CESSRate: req.body.CESSRate || null,
      OfferAmount: req.body.OfferAmount || null,
      Remarks: req.body.Remarks,
      IsActive: req.body.IsActive || true,
      Status: req.body.Status || "Active",
    };
    console.log("Offers: ", offers);

    // Fetch SKU data for IGSTRate and CESSRate
    const skuData = await SKUMaster.findOne({
      attributes: ["IGSTRate", "CESSRate"],
      where: {
        ModelMasterID: offers.ModelID,
        VariantID: offers.VariantID,
        FuelTypeID: offers.FuelTypeID,
      },
    });

    // Check if SKU data is found
    if (!skuData) {
      return res.status(404).json({
        message: "SKU data not found for the offer.",
      });
    }

    // Update offer data with SKUMaster data
    offers.IGSTRate = skuData.IGSTRate;
    offers.CESSRate = skuData.CESSRate;

    // Calculation
    offers.TaxAmount =
      (offers.MFGShare + offers.DealerShare) *
      ((offers.IGSTRate + offers.CESSRate) / 100);
    offers.OfferAmount =
      offers.MFGShare + offers.DealerShare + offers.TaxAmount;

    // Save Offer in the database
    const newOffer = await Offers.create(offers);
    console.log("New Offer: ", newOffer);

    return res.status(201).json(newOffer); // Send the newly created Offer as response
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

    console.error("Error creating Offers:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Retrieve all Offer from the database.
exports.findAll = async (req, res) => {
  try {
    // Fetch all offer data with included associations
    const offerData = await Offers.findAll({
      attributes: [
        "OfferID",
        "OfferName",
        "DiscountID",
        "BranchID",
        "ModelID",
        "VariantID",
        "ColourID",
        "TransmissionID",
        "FuelTypeID",
        "ValidFrom",
        "ValidUpto",
        "MFGShare",
        "DealerShare",
        "TaxAmount",
        "IGSTRate",
        "CESSRate",
        "OfferAmount",
        "Remarks",
        "IsActive",
        "Status",
        "CreatedDate",
        "ModifiedDate",
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
          attributes: ["BranchID", "BranchName", "BranchCode"],
        },
        {
          model: ModelMaster,
          as: "OModelID",
          attributes: ["ModelMasterID", "ModelCode", "ModelDescription"],
        },
        {
          model: VariantMaster,
          as: "OVariantID",
          attributes: ["VariantID", "VariantCode"],
        },
        {
          model: ColourMaster,
          as: "OColourID",
          attributes: ["ColourID", "ColourCode", "ColourDescription"],
        },
        {
          model: Transmission,
          as: "OTransmissionID",
          attributes: ["TransmissionID", "TransmissionCode"],
        },
        {
          model: FuelType,
          as: "OFuelTypeID",
          attributes: ["FuelTypeID", "FuelTypeName", "FuelCode"],
        },
      ],
      order: [
        ["CreatedDate", "DESC"], // Order by ModelDescription in ascending order
      ],
    });

    // Check if offer data is empty
    if (!offerData || offerData.length === 0) {
      return res.status(404).json({
        message: "No offer data found.",
      });
    }

    // Iterate through each offer to fetch SKU data and update IGSTRate and CESSRate
    for (let offer of offerData) {
      const skuData = await SKUMaster.findOne({
        attributes: ["IGSTRate", "CESSRate"],
        where: {
          ModelMasterID: offer.ModelID,
          VariantID: offer.VariantID,
          FuelTypeID: offer.FuelTypeID,
        },
      });

      if (skuData) {
        offer.setDataValue("IGSTRate", skuData.IGSTRate);
        offer.setDataValue("CESSRate", skuData.CESSRate);
      }
    }

    // Combine offer data with nested attributes
    const combinedData = offerData.map((item) => {
      const {
        OBranchID,
        OModelID,
        OVariantID,
        OColourID,
        OTransmissionID,
        OFuelTypeID,
      } = item;

      return {
        OfferID: item.OfferID,
        OfferName: item.OfferName,
        DiscountID: item.ODiscountID ? item.ODiscountID.DiscountID : null,
        DiscountName: item.ODiscountID ? item.ODiscountID.DiscountName : null,
        BranchID: OBranchID ? OBranchID.BranchID : null,
        BranchName: OBranchID ? OBranchID.BranchName : null,
        BranchCode: OBranchID ? OBranchID.BranchCode : null,
        ModelMasterID: OModelID ? OModelID.ModelMasterID : null,
        ModelCode: OModelID ? OModelID.ModelCode : null,
        ModelDescription: OModelID ? OModelID.ModelDescription : null,
        VariantID: OVariantID ? OVariantID.VariantID : null,
        VariantCode: OVariantID ? OVariantID.VariantCode : null,
        ColourID: OColourID ? OColourID.ColourID : null,
        ColourCode: OColourID ? OColourID.ColourCode : null,
        ColourDescription: OColourID ? OColourID.ColourDescription : null,
        TransmissionID: OTransmissionID ? OTransmissionID.TransmissionID : null,
        TransmissionCode: OTransmissionID
          ? OTransmissionID.TransmissionCode
          : null,
        FuelTypeID: OFuelTypeID ? OFuelTypeID.FuelTypeID : null,
        FuelTypeName: OFuelTypeID ? OFuelTypeID.FuelTypeName : null,
        FuelCode: OFuelTypeID ? OFuelTypeID.FuelCode : null,
        ValidFrom: item.ValidFrom,
        ValidUpto: item.ValidUpto,
        MFGShare: item.MFGShare,
        DealerShare: item.DealerShare,
        TaxAmount: item.TaxAmount,
        IGSTRate: item.IGSTRate, // Use the updated IGSTRate
        CESSRate: item.CESSRate, // Use the updated CESSRate
        OfferAmount: item.OfferAmount,
        Remarks: item.Remarks,
        IsActive: item.IsActive,
        Status: item.Status,
        CreatedDate: item.CreatedDate,
        ModifiedDate: item.ModifiedDate,
      };
    });

    // Send the combined data as response
    res.json(combinedData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while retrieving offer data.",
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
    console.error("Error retrieving offer data:", error);
    return res.status(500).json({
      message: "Failed to retrieve offer data. Please try again later.",
    });
  }
};

//Find a single Offer with an id
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;

    // Validate the ID parameter
    if (!id) {
      return res.status(400).json({
        message: "ID parameter is required.",
      });
    }

    // Fetch the offer data by primary key with included associations
    const offerNameData = await Offers.findOne({
      where: {
        OfferID: id,
      },
      attributes: [
        "OfferID",
        "OfferName",
        "DiscountID",
        "BranchID",
        "ModelID",
        "VariantID",
        "ColourID",
        "TransmissionID",
        "FuelTypeID",
        "ValidFrom",
        "ValidUpto",
        "MFGShare",
        "DealerShare",
        "TaxAmount",
        "IGSTRate",
        "CESSRate",
        "OfferAmount",
        "Remarks",
        "IsActive",
        "Status",
        "CreatedDate",
        "ModifiedDate",
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
        {
          model: ModelMaster,
          as: "OModelID",
          attributes: ["ModelMasterID", "ModelCode", "ModelDescription"],
        },
        {
          model: VariantMaster,
          as: "OVariantID",
          attributes: ["VariantID", "VariantCode"],
        },
        {
          model: ColourMaster,
          as: "OColourID",
          attributes: ["ColourID", "ColourCode", "ColourDescription"],
        },
        {
          model: Transmission,
          as: "OTransmissionID",
          attributes: ["TransmissionID", "TransmissionCode"],
        },
        {
          model: FuelType,
          as: "OFuelTypeID",
          attributes: ["FuelTypeID", "FuelTypeName"],
        },
      ],
    });

    // Check if offer data is found
    if (!offerNameData) {
      return res.status(404).json({
        message: "Offer data not found.",
      });
    }

    // Fetch SKU data to update IGSTRate and CESSRate
    const skuData = await SKUMaster.findOne({
      attributes: ["IGSTRate", "CESSRate"],
      where: {
        ModelMasterID: offerNameData.ModelID,
        VariantID: offerNameData.VariantID,
        FuelTypeID: offerNameData.FuelTypeID,
      },
    });

    // Update IGSTRate and CESSRate if SKU data is found
    if (skuData) {
      offerNameData.setDataValue("IGSTRate", skuData.IGSTRate);
      offerNameData.setDataValue("CESSRate", skuData.CESSRate);
    }

    // Prepare the response data
    const responseData = {
      OfferID: offerNameData.OfferID,
      OfferName: offerNameData.OfferName,
      DiscountID: offerNameData.ODiscountID
        ? offerNameData.ODiscountID.DiscountID
        : null,
      DiscountName: offerNameData.ODiscountID
        ? offerNameData.ODiscountID.DiscountName
        : null,
      BranchID: offerNameData.OBranchID
        ? offerNameData.OBranchID.BranchID
        : null,
      BranchName: offerNameData.OBranchID
        ? offerNameData.OBranchID.BranchName
        : null,
      ModelMasterID: offerNameData.OModelID
        ? offerNameData.OModelID.ModelMasterID
        : null,
      ModelCode: offerNameData.OModelID
        ? offerNameData.OModelID.ModelCode
        : null,
      ModelDescription: offerNameData.OModelID
        ? offerNameData.OModelID.ModelDescription
        : null,
      VariantID: offerNameData.OVariantID
        ? offerNameData.OVariantID.VariantID
        : null,
      VariantCode: offerNameData.OVariantID
        ? offerNameData.OVariantID.VariantCode
        : null,
      ColourID: offerNameData.OColourID
        ? offerNameData.OColourID.ColourID
        : null,
      ColourCode: offerNameData.OColourID
        ? offerNameData.OColourID.ColourCode
        : null,
      ColourDescription: offerNameData.OColourID
        ? offerNameData.OColourID.ColourDescription
        : null,
      TransmissionID: offerNameData.OTransmissionID
        ? offerNameData.OTransmissionID.TransmissionID
        : null,
      TransmissionCode: offerNameData.OTransmissionID
        ? offerNameData.OTransmissionID.TransmissionCode
        : null,
      FuelTypeID: offerNameData.OFuelTypeID
        ? offerNameData.OFuelTypeID.FuelTypeID
        : null,
      FuelTypeName: offerNameData.OFuelTypeID
        ? offerNameData.OFuelTypeID.FuelTypeName
        : null,
      ValidFrom: offerNameData.ValidFrom,
      ValidUpto: offerNameData.ValidUpto,
      MFGShare: offerNameData.MFGShare,
      DealerShare: offerNameData.DealerShare,
      TaxAmount: offerNameData.TaxAmount,
      IGSTRate: offerNameData.IGSTRate, // Use updated value from offerNameData
      CESSRate: offerNameData.CESSRate, // Use updated value from offerNameData
      OfferAmount: offerNameData.OfferAmount,
      Remarks: offerNameData.Remarks,
      IsActive: offerNameData.IsActive,
      Status: offerNameData.Status,
      CreatedDate: offerNameData.CreatedDate,
      ModifiedDate: offerNameData.ModifiedDate,
    };

    // Send the response data
    res.json(responseData);
  } catch (error) {
    // Handle Sequelize errors
    if (error.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message: "Database error occurred while retrieving offer data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    // General error handling
    console.error("Error retrieving offer data:", error);
    return res.status(500).json({
      message: "Failed to retrieve offer data. Please try again later.",
    });
  }
};

// Update a Offer by the id in the request
exports.updateByPk = async (req, res) => {
  // console.log("OfferName:", req.body.OfferName);

  try {
    // Validate request
    // if (!req.body.DiscountID) {
    //   return res.status(400).json({ message: "DiscountID cannot be empty" });
    // }
    // if (!req.body.OfferName) {
    //   return res.status(400).json({ message: "OfferName cannot be empty" });
    // }
    // if (!/^[a-zA-Z ]*$/.test(req.body.OfferName)) {
    //   console.log("Validation failed: OfferName contains special characters.");
    //   return res.status(400).json({
    //     message: "OfferName should contain only letters",
    //   });
    // }
    // Find the offer by ID
    const offerId = req.params.id;

    // Validate the ID parameter
    if (!offerId) {
      return res.status(400).json({ message: "ID parameter is required." });
    }

    let offer = await Offers.findByPk(offerId);

    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    // let discount = await DiscountMaster.findByPk(req.body.DiscountID);

    // if (!discount) {
    //   return res.status(404).json({ message: "discount not found" });
    // }

    // Parse and assign dates
    // offer.OfferName = req.body.OfferName;
    // offer.ValidFrom = new Date(req.body.ValidFrom);
    // offer.ValidUpto = new Date(req.body.ValidUpto);

    // Update fields
    // offer.OfferName =
    offer.BranchID = req.body.BranchID || offer.BranchID;
    //   req.body.OfferName || discount.DiscountName || offer.OfferName;
    // offer.DiscountID = req.body.DiscountID || offer.DiscountID;
    offer.ModelID = req.body.ModelID || offer.ModelID;
    offer.VariantID = req.body.VariantID || offer.VariantID;
    offer.ColourID = req.body.ColourID || offer.ColourID;
    offer.TransmissionID = req.body.TransmissionID || offer.TransmissionID;
    offer.FuelTypeID = req.body.FuelTypeID || offer.FuelTypeID;
    offer.ValidFrom = req.body.ValidFrom || offer.ValidFrom;
    offer.ValidUpto = req.body.ValidUpto || offer.ValidUpto;
    offer.MFGShare = req.body.MFGShare || offer.MFGShare;
    offer.DealerShare = req.body.DealerShare || offer.DealerShare;
    offer.TaxAmount = req.body.TaxAmount || offer.TaxAmount;
    offer.IGSTRate = req.body.IGSTRate || offer.IGSTRate;
    offer.CESSRate = req.body.CESSRate || offer.CESSRate;
    offer.OfferAmount = req.body.OfferAmount || offer.OfferAmount;
    offer.Remarks = req.body.Remarks || offer.Remarks;
    offer.IsActive = req.body.IsActive || offer.IsActive;
    offer.Status = req.body.Status || offer.Status;
    offer.ModifiedDate = new Date();

    // Save updated offer in the database
    const updatedOffer = await offer.save();

    return res.status(200).json(updatedOffer); // Send the updated offer as response
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
        message: "Database error occurred while updating offer.",
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
    console.error("Error updating offer:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a Offer with the specified id in the request
exports.deleteById = async (req, res) => {
  const id = req.params.id;

  try {
    // Validate the ID parameter
    if (!id) {
      return res.status(400).json({ message: "ID parameter is required." });
    }

    // Find the offer by ID
    const offer = await Offers.findByPk(id);

    // Check if the offer exists
    if (!offer) {
      return res
        .status(404)
        .json({ message: "Offer not found with id: " + id });
    }

    // Delete the offer
    await offer.destroy();

    // Send a success message
    res.status(200).json({
      message: "Offer with id: " + id + " deleted successfully",
    });
  } catch (err) {
    // Handle errors based on specific types
    if (err.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while deleting Offer.",
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
    console.error("Error deleting Offer:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// BulkCreate and Save a new Offers
exports.bulkCreate = async (req, res) => {
  try {
    // Validate request body
    if (!Array.isArray(req.body) || req.body.length === 0) {
      return res
        .status(400)
        .json({ message: "Request body must be a non-empty array" });
    }

    // Extract offers array from request body
    const offers = await Promise.all(
      req.body.map(async (offer) => {
        try {
          // Fetch DiscountName from DiscountMaster using DiscountID
          const discount = await DiscountMaster.findByPk(offer.DiscountID);
          if (!discount) {
            return res.status(400).json({
              message: `Discount with ID ${offer.DiscountID} not found`,
            });
          }

          // Map fields including DiscountName
          return {
            OfferName: discount.DiscountName,
            DiscountID: offer.DiscountID,
            // DiscountName: discount.DiscountName, // Assuming DiscountName is a field in DiscountMaster
            BranchID: offer.BranchID,
            ModelID: offer.ModelID,
            VariantID: offer.VariantID,
            ColourID: offer.ColourID,
            TransmissionID: offer.TransmissionID,
            FuelTypeID: offer.FuelTypeID,
            ValidFrom: offer.ValidFrom,
            ValidUpto: offer.ValidUpto,
            MFGShare: offer.MFGShare,
            DealerShare: offer.DealerShare,
            TaxAmount: offer.TaxAmount || null,
            IGSTRate: offer.IGSTRate || null,
            CESSRate: offer.CESSRate || null,
            OfferAmount: offer.OfferAmount || null,
            Remarks: offer.Remarks,
            IsActive: offer.IsActive || true,
            Status: offer.Status || "Active",
          };
        } catch (error) {
          console.error("Error fetching discount details:", error);
          throw error; // Propagate error for centralized error handling
        }
      })
    );

    // Bulk create offers in the database
    const newOffers = await Offers.bulkCreate(offers);

    return res.status(201).json(newOffers); // Send the newly created offers as response
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

    console.error("Error creating offers in bulk:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.OffersSearch = async (req, res) => {
  const { searchValue } = req.query;

  // Check if searchValue is provided
  if (!searchValue) {
    return res.status(400).send({ message: "searchValue must be provided" });
  }

  try {
    // Constructing the where clause based on the search values
    const whereClause = {
      [Op.or]: [
        { OfferName: { [Op.like]: `%${searchValue}%` } },
        { "$OModelID.ModelCode$": { [Op.like]: `%${searchValue}%` } },
      ],
    };

    // Perform database query to find entries with the given criteria
    const offers = await Offer.findAll({
      where: whereClause,
      include: [
        {
          model: DiscountMaster,
          as: "ODiscountID",
          attributes: ["DiscountID", "DiscountName"],
        },
        {
          model: BranchMaster,
          as: "OBranchID",
          attributes: ["BranchID", "BranchName", "BranchCode"],
        },
        {
          model: ModelMaster,
          as: "OModelID",
          attributes: ["ModelMasterID", "ModelCode", "ModelDescription"],
        },
        {
          model: VariantMaster,
          as: "OVariantID",
          attributes: ["VariantID", "VariantCode"],
        },
        {
          model: ColourMaster,
          as: "OColourID",
          attributes: ["ColourID", "ColourCode", "ColourDescription"],
        },
        {
          model: Transmission,
          as: "OTransmissionID",
          attributes: ["TransmissionID", "TransmissionCode"],
        },
        {
          model: FuelType,
          as: "OFuelTypeID",
          attributes: ["FuelTypeID", "FuelTypeName", "FuelCode"],
        },
      ],
      order: [
        ["OfferName", "ASC"], // Order by OfferName in ascending order
      ],
    });

    // Check if offers data is empty
    if (!offers || offers.length === 0) {
      return res.status(404).send({
        message: `No offers found with the provided criteria`,
      });
    }

    // Map fields to flatten the response with all attributes
    const flatData = offers.map((offer) => ({
      OfferID: offer.OfferID,
      OfferName: offer.OfferName,
      DiscountID: offer.ODiscountID ? offer.ODiscountID.DiscountID : null,
      DiscountName: offer.ODiscountID ? offer.ODiscountID.DiscountName : null,
      BranchID: offer.OBranchID ? offer.OBranchID.BranchID : null,
      BranchName: offer.OBranchID ? offer.OBranchID.BranchName : null,
      BranchCode: offer.OBranchID ? offer.OBranchID.BranchCode : null,
      ModelID: offer.OModelID ? offer.OModelID.ModelMasterID : null,
      ModelCode: offer.OModelID ? offer.OModelID.ModelCode : null,
      ModelDescription: offer.OModelID ? offer.OModelID.ModelDescription : null,
      VariantID: offer.OVariantID ? offer.OVariantID.VariantID : null,
      VariantCode: offer.OVariantID ? offer.OVariantID.VariantCode : null,
      ColourID: offer.OColourID ? offer.OColourID.ColourID : null,
      ColourCode: offer.OColourID ? offer.OColourID.ColourCode : null,
      ColourDescription: offer.OColourID
        ? offer.OColourID.ColourDescription
        : null,
      TransmissionID: offer.OTransmissionID
        ? offer.OTransmissionID.TransmissionID
        : null,
      TransmissionCode: offer.OTransmissionID
        ? offer.OTransmissionID.TransmissionCode
        : null,
      FuelTypeID: offer.OFuelTypeID ? offer.OFuelTypeID.FuelTypeID : null,
      FuelTypeName: offer.OFuelTypeID ? offer.OFuelTypeID.FuelTypeName : null,
      FuelCode: offer.OFuelTypeID ? offer.OFuelTypeID.FuelCode : null,
      ValidFrom: offer.ValidFrom,
      ValidUpto: offer.ValidUpto,
      MFGShare: offer.MFGShare,
      DealerShare: offer.DealerShare,
      TaxAmount: offer.TaxAmount,
      IGSTRate: offer.IGSTRate,
      CESSRate: offer.CESSRate,
      OfferAmount: offer.OfferAmount,
      Remarks: offer.Remarks,
      IsActive: offer.IsActive,
      Status: offer.Status,
      CreatedDate: offer.CreatedDate,
      ModifiedDate: offer.ModifiedDate,
    }));

    // Send the flattened data
    res.send(flatData);
  } catch (err) {
    // Handle database errors
    console.error("Error retrieving offers:", err);
    res.status(500).send({
      message: `Error retrieving offers with the provided criteria`,
    });
  }
};
