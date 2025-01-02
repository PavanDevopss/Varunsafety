/* eslint-disable no-dupe-keys */
/* eslint-disable no-unused-vars */
require("dotenv").config();
const db = require("../models");
const NewCarpriceMapping = db.newcarpricemapping;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;
const BranchMaster = db.branchmaster;
const RegionMaster = db.regionmaster;
const StateMaster = db.statemaster;
const NewCarPriceList = db.newcarpricelist;
const ModelMaster = db.modelmaster;
const VariantMaster = db.variantmaster;
const ColourCategoryMaster = db.colourcategory;
const FuelTypeMaster = db.fueltypes;
const TransmissionMaster = db.transmission;
const UserMaster = db.usermaster;
// Basic CRUD API
// Create and Save a new NewCarPriceList
exports.bulkCreate = async (req, res) => {
  try {
    const { mappings } = req.body;

    // Validate input
    if (!Array.isArray(mappings) || mappings.length === 0) {
      return res.status(400).json({
        message: "Request body must be a non-empty array of mappings.",
      });
    }

    const createdMappings = [];
    const errors = [];

    for (const mapping of mappings) {
      const {
        BranchID,
        NewCarPriceListID,
        StateID,
        RegionID,
        PriceType,
        CostOfPrice,
        EffectiveDate,
        IsActive,
        Status,
      } = mapping;

      try {
        // Check if the NewCarPriceList exists
        const existingNewCarPriceList = await NewCarPriceList.findOne({
          where: { NewCarPriceListID },
        });

        if (!existingNewCarPriceList) {
          errors.push({
            NewCarPriceListID,
            message: "No NewCarPriceList found with the provided ID.",
          });
          continue;
        }

        // Create a new record
        const newMapping = await NewCarpriceMapping.create({
          BranchID,
          NewCarPriceListID,
          StateID,
          RegionID,
          PriceType,
          CostOfPrice,
          EffectiveDate,
          IsActive: IsActive !== undefined ? IsActive : true, // Default to true
          Status: Status || "Active", // Default to "Active"
        });

        createdMappings.push(newMapping);
      } catch (error) {
        console.error(
          `Error processing mapping for NewCarPriceListID: ${NewCarPriceListID}`,
          error
        );

        errors.push({
          NewCarPriceListID,
          message: "Error processing this record.",
          details: error.message,
        });
      }
    }

    return res.status(200).json({
      message: "Bulk operation completed.",
      created: createdMappings,
      errors,
    });
  } catch (err) {
    console.error("Error during bulk creation of NewCarpriceMappings:", err);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// Retrieve all NewCarPriceMapping from the database.
exports.findAll = async (req, res) => {
  try {
    const { UserID, BranchID } = req.query;

    // Validate required query parameters
    if (!UserID || !BranchID) {
      return res.status(400).json({
        message: "UserID and BranchID are required query parameters.",
      });
    }

    // Fetch all NewCarPriceMapping data with included related data
    const newCarPriceMappingData = await NewCarpriceMapping.findAll({
      attributes: [
        "NewCarPriceMappingID",
        "BranchID",
        "NewCarPriceListID",
        "StateID",
        "RegionID",
        "PriceType",
        "CostOfPrice",
        "EffectiveDate",
        "IsActive",
        "Status",
        "CreatedDate",
        "ModifiedDate",
      ],
      include: [
        {
          model: BranchMaster,
          as: "NCPMBranchID",
          attributes: ["BranchID", "BranchName"],
        },
        {
          model: RegionMaster,
          as: "NCPMRegionID",
          attributes: ["RegionID", "RegionName"],
        },
        {
          model: StateMaster,
          as: "NCPMStateID",
          attributes: ["StateID", "StateName"],
        },
        {
          model: NewCarPriceList,
          as: "NCPMNewCarPriceListID",
          attributes: [
            "ModelMasterID",
            "VariantID",
            "ColourCategoryID",
            "FuelTypeID",
            "TransmissionID",
            "UserID",
          ],
          where: {
            UserID,
            BranchID,
          },
          include: [
            {
              model: BranchMaster,
              as: "NCPLBranchID",
              attributes: ["BranchID", "BranchName"],
            },
            {
              model: ModelMaster,
              as: "NCPLModelMasterID",
              attributes: ["ModelMasterID", "ModelCode", "ModelDescription"],
            },
            {
              model: VariantMaster,
              as: "NCPLVariantID",
              attributes: ["VariantID", "VariantCode"],
            },
            {
              model: ColourCategoryMaster,
              as: "NCPLColourCategoryID",
              attributes: ["ColourCategoryID", "ColourCategoryName"],
            },
            {
              model: FuelTypeMaster,
              as: "NCPLFuelTypeID",
              attributes: ["FuelTypeID", "FuelTypeName"],
            },
            {
              model: TransmissionMaster,
              as: "NCPLTransmissionID",
              attributes: [
                "TransmissionID",
                "TransmissionCode",
                "TransmissionDescription",
              ],
            },
            {
              model: UserMaster,
              as: "NCPLUserID",
              attributes: ["UserID", "EmpID", "UserName"],
            },
          ],
        },
      ],
      order: [["CreatedDate", "DESC"]],
    });

    // Check if data is empty
    if (!newCarPriceMappingData || newCarPriceMappingData.length === 0) {
      return res.status(404).json({
        message:
          "No New Car Price List data found for the specified UserID and BranchID.",
      });
    }

    // Map the data for response
    const combinedData = newCarPriceMappingData.map((item) => ({
      NewCarPriceMappingID: item.NewCarPriceMappingID,
      BranchID: item.BranchID,
      BranchName: item.NCPMBranchID ? item.NCPMBranchID.BranchName : null,
      StateID: item.StateID,
      StateName: item.NCPMStateID ? item.NCPMStateID.StateName : null,
      RegionID: item.RegionID,
      RegionName: item.NCPMRegionID ? item.NCPMRegionID.RegionName : null,
      PriceType: item.PriceType,
      CostOfPrice: item.CostOfPrice,
      EffectiveDate: item.EffectiveDate,
      ModelMasterID: item.NCPMNewCarPriceListID?.ModelMasterID || null,
      ModelCode:
        item.NCPMNewCarPriceListID?.NCPLModelMasterID?.ModelCode || null,
      ModelDescription:
        item.NCPMNewCarPriceListID?.NCPLModelMasterID?.ModelDescription || null,
      VariantID: item.NCPMNewCarPriceListID?.VariantID || null,
      VariantCode:
        item.NCPMNewCarPriceListID?.NCPLVariantID?.VariantCode || null,
      ColourCategoryID: item.NCPMNewCarPriceListID?.ColourCategoryID || null,
      ColourCategoryName:
        item.NCPMNewCarPriceListID?.NCPLColourCategoryID?.ColourCategoryName ||
        null,
      FuelTypeID: item.NCPMNewCarPriceListID?.FuelTypeID || null,
      FuelTypeName:
        item.NCPMNewCarPriceListID?.NCPLFuelTypeID?.FuelTypeName || null,
      TransmissionID: item.NCPMNewCarPriceListID?.TransmissionID || null,
      TransmissionCode:
        item.NCPMNewCarPriceListID?.NCPLTransmissionID?.TransmissionCode ||
        null,
      TransmissionDescription:
        item.NCPMNewCarPriceListID?.NCPLTransmissionID
          ?.TransmissionDescription || null,
      UserID: item.NCPMNewCarPriceListID?.UserID || null,
      EmpID: item.NCPMNewCarPriceListID?.NCPLUserID?.EmpID || null,
      UserName: item.NCPMNewCarPriceListID?.NCPLUserID?.UserName || null,
      ListBranchID: item.NCPMNewCarPriceListID?.NCPLBranchID?.BranchID || null,
      BranchName: item.NCPMNewCarPriceListID?.NCPLBranchID?.BranchName || null,
      IsActive: item.IsActive,
      Status: item.Status,
      CreatedDate: item.CreatedDate,
      ModifiedDate: item.ModifiedDate,
    }));

    // Send the combined data as response
    res.json(combinedData);
  } catch (error) {
    if (error.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message:
          "Database error occurred while retrieving New Car Price List data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    console.error("Error retrieving New Car Price List data:", error);
    return res.status(500).json({
      message:
        "Failed to retrieve New Car Price List data. Please try again later.",
    });
  }
};

// Find a single NewCarPriceMapping with an id
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;

    // Validate the ID parameter
    if (!id) {
      return res.status(400).json({
        message: "ID parameter is required.",
      });
    }

    // Fetch the NewCarPriceMapping data by primary key with included related data
    const newCarPriceMappingData = await NewCarpriceMapping.findOne({
      where: { NewCarPriceMappingID: id },
      attributes: [
        "NewCarPriceMappingID",
        "BranchID",
        "NewCarPriceListID",
        "StateID",
        "RegionID",
        "PriceType",
        "CostOfPrice",
        "EffectiveDate",
        "IsActive",
        "Status",
        "CreatedDate",
        "ModifiedDate",
      ],
      include: [
        {
          model: BranchMaster,
          as: "NCPMBranchID",
          attributes: ["BranchID", "BranchName"],
        },
        {
          model: RegionMaster,
          as: "NCPMRegionID",
          attributes: ["RegionID", "RegionName"],
        },
        {
          model: StateMaster,
          as: "NCPMStateID",
          attributes: ["StateID", "StateName"],
        },
        {
          model: NewCarPriceList,
          as: "NCPMNewCarPriceListID",
          attributes: [
            "ModelMasterID",
            "VariantID",
            "ColourCategoryID",
            "FuelTypeID",
            "TransmissionID",
            "UserID",
          ],
          include: [
            {
              model: ModelMaster,
              as: "NCPLModelMasterID",
              attributes: ["ModelMasterID", "ModelCode", "ModelDescription"],
            },
            {
              model: VariantMaster,
              as: "NCPLVariantID",
              attributes: ["VariantID", "VariantCode"],
            },
            {
              model: ColourCategoryMaster,
              as: "NCPLColourCategoryID",
              attributes: ["ColourCategoryID", "ColourCategoryName"],
            },
            {
              model: FuelTypeMaster,
              as: "NCPLFuelTypeID",
              attributes: ["FuelTypeID", "FuelTypeName"],
            },
            {
              model: TransmissionMaster,
              as: "NCPLTransmissionID",
              attributes: [
                "TransmissionID",
                "TransmissionCode",
                "TransmissionDescription",
              ],
            },
            {
              model: UserMaster,
              as: "NCPLUserID",
              attributes: ["UserID", "EmpID", "UserName"],
            },
          ],
        },
      ],
    });

    if (!newCarPriceMappingData) {
      return res.status(404).json({
        message: "No New Car Price Mapping data found.",
      });
    }

    // Prepare the response data
    const responseData = {
      NewCarPriceMappingID: newCarPriceMappingData.NewCarPriceMappingID,
      BranchID: newCarPriceMappingData.BranchID,
      NewCarPriceListID: newCarPriceMappingData.NewCarPriceListID,
      BranchName: newCarPriceMappingData.NCPMBranchID
        ? newCarPriceMappingData.NCPMBranchID.BranchName
        : null,
      StateID: newCarPriceMappingData.StateID,
      StateName: newCarPriceMappingData.NCPMStateID
        ? newCarPriceMappingData.NCPMStateID.StateName
        : null,
      RegionID: newCarPriceMappingData.RegionID,
      RegionName: newCarPriceMappingData.NCPMRegionID
        ? newCarPriceMappingData.NCPMRegionID.RegionName
        : null,
      PriceType: newCarPriceMappingData.PriceType,
      CostOfPrice: newCarPriceMappingData.CostOfPrice,
      EffectiveDate: newCarPriceMappingData.EffectiveDate,
      ModelMasterID: newCarPriceMappingData.NCPMNewCarPriceListID
        ? newCarPriceMappingData.NCPMNewCarPriceListID.ModelMasterID
        : null,
      ModelCode: newCarPriceMappingData.NCPMNewCarPriceListID?.NCPLModelMasterID
        ? newCarPriceMappingData.NCPMNewCarPriceListID.NCPLModelMasterID
            .ModelCode
        : null,
      ModelDescription: newCarPriceMappingData.NCPMNewCarPriceListID
        ?.NCPLModelMasterID
        ? newCarPriceMappingData.NCPMNewCarPriceListID.NCPLModelMasterID
            .ModelDescription
        : null,
      VariantID: newCarPriceMappingData.NCPMNewCarPriceListID
        ? newCarPriceMappingData.NCPMNewCarPriceListID.VariantID
        : null,
      VariantCode: newCarPriceMappingData.NCPMNewCarPriceListID?.NCPLVariantID
        ? newCarPriceMappingData.NCPMNewCarPriceListID.NCPLVariantID.VariantCode
        : null,
      ColourCategoryID: newCarPriceMappingData.NCPMNewCarPriceListID
        ? newCarPriceMappingData.NCPMNewCarPriceListID.ColourCategoryID
        : null,
      ColourCategoryName: newCarPriceMappingData.NCPMNewCarPriceListID
        ?.NCPLColourCategoryID
        ? newCarPriceMappingData.NCPMNewCarPriceListID.NCPLColourCategoryID
            .ColourCategoryName
        : null,
      FuelTypeID: newCarPriceMappingData.NCPMNewCarPriceListID
        ? newCarPriceMappingData.NCPMNewCarPriceListID.FuelTypeID
        : null,
      FuelTypeName: newCarPriceMappingData.NCPMNewCarPriceListID?.NCPLFuelTypeID
        ? newCarPriceMappingData.NCPMNewCarPriceListID.NCPLFuelTypeID
            .FuelTypeName
        : null,
      TransmissionID: newCarPriceMappingData.NCPMNewCarPriceListID
        ? newCarPriceMappingData.NCPMNewCarPriceListID.TransmissionID
        : null,
      TransmissionCode: newCarPriceMappingData.NCPMNewCarPriceListID
        ?.NCPLTransmissionID
        ? newCarPriceMappingData.NCPMNewCarPriceListID.NCPLTransmissionID
            .TransmissionCode
        : null,
      TransmissionDescription: newCarPriceMappingData.NCPMNewCarPriceListID
        ?.NCPLTransmissionID
        ? newCarPriceMappingData.NCPMNewCarPriceListID.NCPLTransmissionID
            .TransmissionDescription
        : null,
      UserID: newCarPriceMappingData.NCPMNewCarPriceListID
        ? newCarPriceMappingData.NCPMNewCarPriceListID.UserID
        : null,
      EmpID: newCarPriceMappingData.NCPMNewCarPriceListID?.NCPLUserID
        ? newCarPriceMappingData.NCPMNewCarPriceListID.NCPLUserID.EmpID
        : null,
      UserName: newCarPriceMappingData.NCPMNewCarPriceListID?.NCPLUserID
        ? newCarPriceMappingData.NCPMNewCarPriceListID.NCPLUserID.UserName
        : null,
      IsActive: newCarPriceMappingData.IsActive,
      Status: newCarPriceMappingData.Status,
      CreatedDate: newCarPriceMappingData.CreatedDate,
      ModifiedDate: newCarPriceMappingData.ModifiedDate,
    };

    // Send the response data
    res.json(responseData);
  } catch (error) {
    if (error.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message:
          "Database error occurred while retrieving New Car Price Mapping data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    console.error("Error retrieving New Car Price Mapping data:", error);
    return res.status(500).json({
      message:
        "Failed to retrieve New Car Price Mapping data. Please try again later.",
    });
  }
};

// Update a NewCarPriceMapping by the id in the request
exports.updateByPk = async (req, res) => {
  try {
    const { NewCarPriceMappingID } = req.body;

    let newCarPriceMapping;
    if (NewCarPriceMappingID) {
      // Attempt to find the record by NewCarPriceMappingID
      newCarPriceMapping = await NewCarpriceMapping.findByPk(
        NewCarPriceMappingID
      );
    }

    if (newCarPriceMapping) {
      // Update existing record
      newCarPriceMapping.BranchID =
        req.body.BranchID || newCarPriceMapping.BranchID;
      newCarPriceMapping.StateID =
        req.body.StateID || newCarPriceMapping.StateID;
      newCarPriceMapping.RegionID =
        req.body.RegionID || newCarPriceMapping.RegionID;
      newCarPriceMapping.PriceType =
        req.body.PriceType || newCarPriceMapping.PriceType;
      newCarPriceMapping.CostOfPrice =
        req.body.CostOfPrice || newCarPriceMapping.CostOfPrice;
      newCarPriceMapping.EffectiveDate =
        req.body.EffectiveDate || newCarPriceMapping.EffectiveDate;
      newCarPriceMapping.IsActive =
        req.body.IsActive !== undefined
          ? req.body.IsActive
          : newCarPriceMapping.IsActive;
      newCarPriceMapping.Status = req.body.Status || newCarPriceMapping.Status;
      newCarPriceMapping.ModifiedDate = new Date(); // Update the modified date

      // Save the updated record
      const updatedRecord = await newCarPriceMapping.save();

      return res.status(200).json({
        message: "NewCarPriceMapping updated successfully.",
        data: updatedRecord,
      });
    } else {
      // Create a new record if NewCarPriceMappingID does not exist or is null
      const newRecord = await NewCarpriceMapping.create({
        BranchID: req.body.BranchID,
        NewCarPriceListID: req.body.NewCarPriceListID,
        StateID: req.body.StateID,
        RegionID: req.body.RegionID,
        PriceType: req.body.PriceType,
        CostOfPrice: req.body.CostOfPrice,
        EffectiveDate: req.body.EffectiveDate,
        IsActive: req.body.IsActive !== undefined ? req.body.IsActive : true, // Default to true
        Status: req.body.Status || "Active", // Default to "Active"
        CreatedDate: new Date(),
      });

      return res.status(201).json({
        message: "NewCarPriceMapping created successfully.",
        data: newRecord,
      });
    }
  } catch (error) {
    // Handle specific Sequelize errors
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        message: "Validation error.",
        details: error.errors.map((e) => e.message),
      });
    }

    if (error.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message: "Database error occurred while processing NewCarPriceMapping.",
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
    console.error("Error processing NewCarPriceMapping:", error);
    return res.status(500).json({
      message: "Failed to process NewCarPriceMapping. Please try again later.",
    });
  }
};

// Delete a NewCarPriceList with the specified id in the request
exports.deleteById = async (req, res) => {
  const id = req.params.id;

  try {
    // Validate the ID parameter
    if (!id) {
      return res.status(400).json({ message: "ID parameter is required." });
    }

    // Find the model by ID
    const newCarPriceList = await NewCarpriceMapping.findByPk(id);

    // Check if the model exists
    if (!newCarPriceList) {
      return res
        .status(404)
        .json({ message: "NewCarPriceMapping not found with id: " + id });
    }

    // Delete the model
    await newCarPriceList.destroy();

    // Send a success message
    res.status(200).json({
      message: "NewCarPriceList with id: " + id + " deleted successfully",
    });
  } catch (err) {
    // Handle errors based on specific types
    if (err.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while deleting NewCarPriceList.",
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
    console.error("Error deleting NewCarPriceList:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.findAllPricingList = async (req, res) => {
  try {
    const { NewCarPriceListID } = req.query;
    // Fetch all NewCarPriceList data with included related data
    const newCarPriceMappingData = await NewCarpriceMapping.findAll({
      where: {
        NewCarPriceListID,
      },
      attributes: [
        "NewCarPriceMappingID",
        "BranchID",
        "NewCarPriceListID",
        "StateID",
        "RegionID",
        "PriceType",
        "CostOfPrice",
        "EffectiveDate",
        "IsActive",
        "Status",
        "CreatedDate",
        "ModifiedDate",
      ],
      include: [
        {
          model: BranchMaster,
          as: "NCPMBranchID",
          attributes: ["BranchID", "BranchName"],
        },
        {
          model: RegionMaster,
          as: "NCPMRegionID",
          attributes: ["RegionID", "RegionName"],
        },
        {
          model: StateMaster,
          as: "NCPMStateID",
          attributes: ["StateID", "StateName"],
        },
        {
          model: NewCarPriceList,
          as: "NCPMNewCarPriceListID",
          attributes: [
            "ModelMasterID",
            "VariantID",
            "ColourCategoryID",
            "FuelTypeID",
            "TransmissionID",
            "UserID",
          ],
          include: [
            {
              model: ModelMaster,
              as: "NCPLModelMasterID",
              attributes: ["ModelMasterID", "ModelCode", "ModelDescription"],
            },
            {
              model: VariantMaster,
              as: "NCPLVariantID",
              attributes: ["VariantID", "VariantCode"],
            },
            {
              model: ColourCategoryMaster,
              as: "NCPLColourCategoryID",
              attributes: ["ColourCategoryID", "ColourCategoryName"],
            },
            {
              model: FuelTypeMaster,
              as: "NCPLFuelTypeID",
              attributes: ["FuelTypeID", "FuelTypeName"],
            },
            {
              model: TransmissionMaster,
              as: "NCPLTransmissionID",
              attributes: [
                "TransmissionID",
                "TransmissionCode",
                "TransmissionDescription",
              ],
            },
            {
              model: UserMaster,
              as: "NCPLUserID",
              attributes: ["UserID", "EmpID", "UserName"],
            },
          ],
        },
      ],
      order: [["CreatedDate", "DESC"]],
    });

    // Check if data is empty
    if (!newCarPriceMappingData || newCarPriceMappingData.length === 0) {
      return res.status(404).json({
        message: "No New Car Price List data found.",
      });
    }

    // Map the data for response
    const combinedData = newCarPriceMappingData.map((item) => ({
      NewCarPriceMappingID: item.NewCarPriceMappingID,
      BranchID: item.BranchID,
      BranchName: item.NCPMBranchID ? item.NCPMBranchID.BranchName : null,
      StateID: item.StateID,
      StateName: item.NCPMStateID ? item.NCPMStateID.StateName : null,
      RegionID: item.RegionID,
      RegionName: item.NCPMRegionID ? item.NCPMRegionID.RegionName : null,
      PriceType: item.PriceType,
      CostOfPrice: item.CostOfPrice,
      EffectiveDate: item.EffectiveDate,
      ModelMasterID: item.NCPMNewCarPriceListID
        ? item.NCPMNewCarPriceListID.ModelMasterID
        : null,
      ModelCode: item.NCPMNewCarPriceListID?.NCPLModelMasterID
        ? item.NCPMNewCarPriceListID.NCPLModelMasterID.ModelCode
        : null,
      ModelDescription: item.NCPMNewCarPriceListID?.NCPLModelMasterID
        ? item.NCPMNewCarPriceListID.NCPLModelMasterID.ModelDescription
        : null,
      VariantID: item.NCPMNewCarPriceListID?.VariantID,
      VariantCode: item.NCPMNewCarPriceListID?.NCPLVariantID
        ? item.NCPMNewCarPriceListID.NCPLVariantID.VariantCode
        : null,
      ColourCategoryID: item.NCPMNewCarPriceListID?.ColourCategoryID,
      ColourCategoryName: item.NCPMNewCarPriceListID?.NCPLColourCategoryID
        ? item.NCPMNewCarPriceListID.NCPLColourCategoryID.ColourCategoryName
        : null,
      FuelTypeID: item.NCPMNewCarPriceListID?.FuelTypeID,
      FuelTypeName: item.NCPMNewCarPriceListID?.NCPLFuelTypeID
        ? item.NCPMNewCarPriceListID.NCPLFuelTypeID.FuelTypeName
        : null,
      TransmissionID: item.NCPMNewCarPriceListID?.TransmissionID,
      TransmissionCode: item.NCPMNewCarPriceListID?.NCPLTransmissionID
        ? item.NCPMNewCarPriceListID.NCPLTransmissionID.TransmissionCode
        : null,
      TransmissionDescription: item.NCPMNewCarPriceListID?.NCPLTransmissionID
        ? item.NCPMNewCarPriceListID.NCPLTransmissionID.TransmissionDescription
        : null,
      UserID: item.NCPMNewCarPriceListID?.UserID,
      EmpID: item.NCPMNewCarPriceListID?.NCPLUserID
        ? item.NCPMNewCarPriceListID.NCPLUserID.EmpID
        : null,
      UserName: item.NCPMNewCarPriceListID?.NCPLUserID
        ? item.NCPMNewCarPriceListID.NCPLUserID.UserName
        : null,
      IsActive: item.IsActive,
      Status: item.Status,
      CreatedDate: item.CreatedDate,
      ModifiedDate: item.ModifiedDate,
    }));

    // Send the combined data as response
    res.json(combinedData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message:
          "Database error occurred while retrieving New Car Price List data.",
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
    console.error("Error retrieving New Car Price List data:", error);
    return res.status(500).json({
      message:
        "Failed to retrieve New Car Price List data. Please try again later.",
    });
  }
};
