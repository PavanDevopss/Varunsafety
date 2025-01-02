/* eslint-disable no-dupe-keys */
/* eslint-disable no-unused-vars */
require("dotenv").config();
const db = require("../models");
const VASProductPricing = db.vasproductpricing;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;
const ValueAddedService = db.valueaddedservice;
const ModelMaster = db.modelmaster;
const VariantMaster = db.variantmaster;
const VASManagerApprovals = db.vasmanagerapprovals;
const NewCarBookings = db.NewCarBookings;
const ManagerApprovalsMap = db.managerapprovalsmap;
// Basic CRUD API
// Create and Save a new VASProductPricing
// exports.create = async (req, res) => {
//   console.log("OptionName:", req.body.OptionName);

//   try {
//     // Validate request
//     if (!req.body.OptionName) {
//       return res.status(400).json({ message: "OptionName cannot be empty" });
//     }
//     if (!/^[a-zA-Z ]*$/.test(req.body.OptionName)) {
//       console.log("Validation failed: OptionName contains special characters.");
//       return res.status(400).json({
//         message: "OptionName should contain only letters",
//       });
//     }

//     // Check if OptionName already exists
//     const existingModel = await VASProductPricing.findOne({
//       where: { OptionName: req.body.OptionName },
//     });
//     if (existingModel) {
//       return res.status(400).json({ message: "OptionName already exists" });
//     }

//     // Prepare VASProduct data for multiple VariantIDs and VariantNames
//     const variants = req.body.Variants; // Expecting Variants as an array of objects

//     if (!Array.isArray(variants) || variants.length === 0) {
//       return res
//         .status(400)
//         .json({ message: "Variants should be a non-empty array" });
//     }

//     const vasProducts = variants.map((variant) => ({
//       VASID: req.body.VASID,
//       OptionName: req.body.OptionName,
//       ModelMasterID: req.body.ModelMasterID,
//       ModelName: req.body.ModelName,
//       VariantID: variant.VariantID,
//       VariantName: variant.VariantName,
//       ProductType: req.body.ProductType,
//       ProductDuration: req.body.ProductDuration,
//       EffectiveDate: req.body.EffectiveDate,
//       EndDate: req.body.EndDate,
//       Mandatory: req.body.Mandatory || false,
//       Status: req.body.Status || "Active",
//       TaxApplicable: req.body.TaxApplicable || false,
//       TaxableValue: req.body.TaxableValue,
//       TaxRate: req.body.TaxRate,
//       TotalValue: req.body.TotalValue,
//       TaxValue: req.body.TaxValue,
//       Commission: req.body.Commission,
//       Universal: req.body.Universal || false,
//       IsActive: req.body.IsActive || true,
//     }));

//     // Save all VASProduct entries in the database
//     const newVASProducts = await VASProductPricing.bulkCreate(vasProducts, {
//       validate: true, // Ensure validation on all entries
//     });

//     return res.status(201).json(newVASProducts); // Send the newly created VASProduct as response
//   } catch (err) {
//     if (err.name === "SequelizeValidationError") {
//       return res.status(400).json({
//         message: "Validation error",
//         details: err.errors.map((e) => e.message),
//       });
//     }

//     if (err.name === "SequelizeUniqueConstraintError") {
//       return res.status(400).json({
//         message: "Unique constraint error",
//         details: err.errors.map((e) => e.message),
//       });
//     }

//     console.error("Error creating VASProduct:", err);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };

exports.create = async (req, res) => {
  console.log("OptionName:", req.body.OptionName);
  try {
    // Validate OptionName
    if (!req.body.OptionName) {
      return res.status(400).json({ message: "OptionName cannot be empty" });
    }
    if (!/^[a-zA-Z ]*$/.test(req.body.OptionName)) {
      console.log("Validation failed: OptionName contains special characters.");
      return res.status(400).json({
        message: "OptionName should contain only letters",
      });
    }

    // Check if OptionName already exists
    const existingModel = await VASProductPricing.findOne({
      where: { OptionName: req.body.OptionName },
    });
    if (existingModel) {
      return res.status(400).json({ message: "OptionName already exists" });
    }

    let vasProducts = [];

    if (req.body.Universal) {
      // Fetch all models and variants separately
      const allModels = await ModelMaster.findAll({
        attributes: ["ModelMasterID", "ModelDescription"],
      });
      const allVariants = await VariantMaster.findAll({
        attributes: ["VariantID", "VariantCode"],
      });

      // Generate combinations of model and variant
      vasProducts = allModels.flatMap((model) =>
        allVariants.map((variant) => ({
          VASID: req.body.VASID,
          OptionName: req.body.OptionName,
          ModelMasterID: model.ModelMasterID,
          ModelName: model.ModelDescription,
          VariantID: variant.VariantID,
          VariantName: variant.VariantCode,
          ProductType: req.body.ProductType,
          ProductDuration: req.body.ProductDuration,
          EffectiveDate: req.body.EffectiveDate,
          EndDate: req.body.EndDate,
          Mandatory: req.body.Mandatory || false,
          Status: req.body.Status || "Active",
          TaxApplicable: req.body.TaxApplicable || false,
          TaxableValue: req.body.TaxableValue,
          TaxRate: req.body.TaxRate,
          TotalValue: req.body.TotalValue,
          BranchID: req.body.BranchID,
          UserID: req.body.UserID,
          TaxValue: req.body.TaxValue,
          Commission: req.body.Commission,
          Universal: req.body.Universal || false,
          IsActive: req.body.IsActive || true,
        }))
      );
    } else {
      // Validate provided variants and models
      const variants = req.body.Variants;
      const models = req.body.Models;
      if (
        !Array.isArray(variants) ||
        variants.length === 0 ||
        !Array.isArray(models) ||
        models.length === 0
      ) {
        return res.status(400).json({
          message: "Variants and Models should be non-empty arrays",
        });
      }

      // Generate combinations of provided models and variants
      vasProducts = models.flatMap((model) =>
        variants.map((variant) => ({
          VASID: req.body.VASID,
          OptionName: req.body.OptionName,
          VASManagerApprovalsID: req.body.VASManagerApprovalsID,
          ModelMasterID: model.ModelMasterID,
          ModelName: model.ModelDescription,
          VariantID: variant.VariantID,
          VariantName: variant.VariantCode,
          ProductType: req.body.ProductType,
          ProductDuration: req.body.ProductDuration,
          EffectiveDate: req.body.EffectiveDate,
          EndDate: req.body.EndDate,
          Mandatory: req.body.Mandatory || false,
          Status: req.body.Status || "Active",
          TaxApplicable: req.body.TaxApplicable || false,
          TaxableValue: req.body.TaxableValue,
          TaxRate: req.body.TaxRate,
          TotalValue: req.body.TotalValue,
          BranchID: req.body.BranchID,
          UserID: req.body.UserID,
          TaxValue: req.body.TaxValue,
          Commission: req.body.Commission,
          Universal: req.body.Universal || false,
          IsActive: req.body.IsActive || true,
        }))
      );
    }

    // Log the generated VAS products for verification
    console.log("Generated VAS Products:", vasProducts);

    // Insert VAS products
    const newVASProducts = await VASProductPricing.bulkCreate(vasProducts, {
      validate: true,
    });
    return res.status(201).json(newVASProducts);
  } catch (err) {
    // Enhanced error handling
    if (err.name === "SequelizeValidationError") {
      return res.status(400).json({
        message: "Validation error",
        details: err.errors.map((e) => e.message),
      });
    }
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        message: "Unique constraint error",
        details: err.errors.map((e) => e.message),
      });
    }
    console.error("Error creating VASProduct:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Retrieve all VASProductPricing from the database.
exports.findAll = async (req, res) => {
  try {
    const branchID = req.query.BranchID;
    const userID = req.query.UserID;
    // Fetch all VASProduct data with related ValueAddedService, ModelMaster, and VariantMaster data
    const vasProductData = await VASProductPricing.findAll({
      where: { BranchID: branchID, UserID: userID },
      attributes: [
        "VASProductID",
        "VASID",
        "OptionName",
        "ModelMasterID",
        "ModelName",
        "VariantID",
        "VariantName",
        "ProductType",
        "ProductDuration",
        "EffectiveDate",
        "EndDate",
        "Mandatory",
        "TaxApplicable",
        "TaxableValue",
        "TaxRate",
        "TotalValue",
        "BranchID",
        "UserID",
        "TaxValue",
        "Commission",
        "Universal",
        "IsActive",
        "BranchID",
        "UserID",
        "Status",
        "CreatedDate",
        "ModifiedDate",
      ],
      include: [
        {
          model: ValueAddedService,
          as: "VPPVASID",
          attributes: ["VASID", "ProductCode", "ProductName"], // Assuming 'ValueAddedServiceName' is a relevant field
        },
        // {
        //   model: ModelMaster,
        //   as: "VPPModelMasterID",
        //   attributes: ["ModelMasterID", "ModelCode", "ModelDescription"], // Assuming 'ModelName' is a relevant field
        // },
        // {
        //   model: VariantMaster,
        //   as: "VPPVariantID",
        //   attributes: ["VariantID", "VariantCode"], // Assuming 'VariantName' is a relevant field
        // },
        // {
        //   model: VASManagerApprovals,
        //   as: "VASPPVASManagerApprovalsID",
        //   // attributes: ["VASID", "ProductCode", "ProductName"], // Assuming 'ValueAddedServiceName' is a relevant field
        //   include: [
        //     {
        //       model: NewCarBookings,
        //       as: "VASMABookingID",
        //       attributes: [
        //         "BookingID",
        //         "BookingNo",
        //         "FirstName",
        //         "LastName",
        //         "ModelName",
        //       ],
        //     },
        //   ],
        // },
      ],
      order: [
        ["CreatedDate", "DESC"], // Order by OptionName in ascending order
      ],
    });

    // Check if data is empty
    if (!vasProductData || vasProductData.length === 0) {
      return res.status(404).json({
        message: "No VAS product data found.",
      });
    }

    // Map the data for response
    const combinedData = vasProductData.map((item) => ({
      VASProductID: item.VASProductID,
      VASID: item.VASID || null,
      ProductCode: item.VPPVASID ? item.VPPVASID.ProductCode : null,
      ProductName: item.VPPVASID ? item.VPPVASID.ProductName : null,
      OptionName: item.OptionName,
      ModelMasterID: item.ModelMasterID,
      BranchID: item.BranchID,
      UserID: item.UserID,
      ModelName: item.ModelName,
      BranchID: item.BranchID,
      UserID: item.UserID,
      VariantID: item.VariantID,
      VariantName: item.VariantName,
      ProductType: item.ProductType,
      ProductDuration: item.ProductDuration,
      EffectiveDate: item.EffectiveDate,
      EndDate: item.EndDate,
      Mandatory: item.Mandatory,
      Status: item.Status,
      TaxApplicable: item.TaxApplicable,
      TaxableValue: item.TaxableValue,
      TaxRate: item.TaxRate,
      TotalValue: item.TotalValue,
      TaxValue: item.TaxValue,
      Commission: item.Commission,
      Universal: item.Universal,
      IsActive: item.IsActive,
      CreatedDate: item.CreatedDate,
      ModifiedDate: item.ModifiedDate,
      // BookingID: item.VASPPVASManagerApprovalsID
      //   ? item.VASPPVASManagerApprovalsID.BookingID
      //   : null,
      // BookingNo:
      //   item.VASPPVASManagerApprovalsID &&
      //   item.VASPPVASManagerApprovalsID.VASMABookingID
      //     ? item.VASPPVASManagerApprovalsID.VASMABookingID.BookingNo
      //     : null,
      // FirstName:
      //   item.VASPPVASManagerApprovalsID &&
      //   item.VASPPVASManagerApprovalsID.VASMABookingID
      //     ? item.VASPPVASManagerApprovalsID.VASMABookingID.FirstName
      //     : null,
      // LastName:
      //   item.VASPPVASManagerApprovalsID &&
      //   item.VASPPVASManagerApprovalsID.VASMABookingID
      //     ? item.VASPPVASManagerApprovalsID.VASMABookingID.LastName
      //     : null,
      // ModelName:
      //   item.VASPPVASManagerApprovalsID &&
      //   item.VASPPVASManagerApprovalsID.VASMABookingID
      //     ? item.VASPPVASManagerApprovalsID.VASMABookingID.ModelName
      //     : null,
      // ApprovalStatus: item.VASPPVASManagerApprovalsID
      //   ? item.VASPPVASManagerApprovalsID.Status
      //   : null,
    }));

    // Send the combined data as response
    res.json(combinedData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while retrieving VAS product data.",
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
    console.error("Error retrieving VAS product data:", error);
    return res.status(500).json({
      message: "Failed to retrieve VAS product data. Please try again later.",
    });
  }
};

// Find a single vasProductPricing with an id
exports.findOne = async (req, res) => {
  try {
    const { id } = req.params; // Get the VASID from the request parameters

    // Fetch a single VASProductPricing record by VASID with related ValueAddedService, ModelMaster, and VariantMaster data
    const vasProduct = await VASProductPricing.findOne({
      where: { VASProductID: id }, // Filter by VASID
      attributes: [
        "VASProductID",
        "VASID",
        "OptionName",
        "ModelMasterID",
        "BranchID",
        "UserID",
        "ModelName",
        "VariantID",
        "VariantName",
        "ProductType",
        "ProductDuration",
        "EffectiveDate",
        "EndDate",
        "Mandatory",
        "Status",
        "TaxApplicable",
        "TaxableValue",
        "TaxRate",
        "TotalValue",
        "TaxValue",
        "Commission",
        "Universal",
        "IsActive",
        "CreatedDate",
        "ModifiedDate",
      ],
      include: [
        {
          model: ValueAddedService,
          as: "VPPVASID",
          attributes: ["VASID", "ProductCode", "ProductName"], // ValueAddedService details
        },
      ],
    });

    // Check if the data exists
    if (!vasProduct) {
      return res.status(404).json({
        message: `No VAS product data found for VASID ${id}.`,
      });
    }

    // Map the data for response
    const responseData = {
      VASProductID: vasProduct.VASProductID,
      VASID: vasProduct.VPPVASID ? vasProduct.VPPVASID.VASID : null,
      ProductCode: vasProduct.VPPVASID ? vasProduct.VPPVASID.ProductCode : null,
      ProductName: vasProduct.VPPVASID ? vasProduct.VPPVASID.ProductName : null,
      OptionName: vasProduct.OptionName,
      ModelMasterID: vasProduct.ModelMasterID,
      ModelName: vasProduct.ModelName,
      VariantID: vasProduct.VariantID,
      VariantName: vasProduct.VariantName,
      BranchID: vasProduct.BranchID,
      UserID: vasProduct.UserID,
      ProductType: vasProduct.ProductType,
      ProductDuration: vasProduct.ProductDuration,
      EffectiveDate: vasProduct.EffectiveDate,
      EndDate: vasProduct.EndDate,
      Mandatory: vasProduct.Mandatory,
      Status: vasProduct.Status,
      TaxApplicable: vasProduct.TaxApplicable,
      TaxableValue: vasProduct.TaxableValue,
      TaxRate: vasProduct.TaxRate,
      TotalValue: vasProduct.TotalValue,
      TaxValue: vasProduct.TaxValue,
      Commission: vasProduct.Commission,
      Universal: vasProduct.Universal,
      IsActive: vasProduct.IsActive,
      CreatedDate: vasProduct.CreatedDate,
      ModifiedDate: vasProduct.ModifiedDate,
    };

    // Send the response as an object
    res.json(responseData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message: "Database error occurred while retrieving VAS product data.",
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
    console.error("Error retrieving VAS product data by VASProductID:", error);
    return res.status(500).json({
      message: "Failed to retrieve VAS product data. Please try again later.",
    });
  }
};

// Update a vasProductPricing by the id in the request
// exports.updateByPk = async (req, res) => {
//   try {
//     // Validate request
//     if (!Array.isArray(req.body) || req.body.length === 0) {
//       return res
//         .status(400)
//         .json({ message: "Request body must be a non-empty array" });
//     }

//     const updates = req.body;

//     // Prepare an array to hold promises for each update operation
//     const updatePromises = updates.map(async (updateData) => {
//       const {
//         VASProductID,
//         VASID,
//         ModelMasterID,
//         OptionName,
//         VariantID,
//         ProductType,
//         ProductDuration,
//         EffectiveDate,
//         EndDate,
//         Mandatory,
//         Status,
//         TaxApplicable,
//         TaxableValue,
//         TaxRate,
//         TotalValue,
//         TaxValue,
//         Commission,
//         Universal,
//         IsActive,
//         CreatedDate,
//         ModifiedDate,
//       } = updateData;

//       // Validate mandatory fields
//       if (!VASProductID || !VASID || !ModelMasterID) {
//         return {
//           message: "VASProductID, VASID, and ModelMasterID are required fields",
//           status: 400,
//         };
//       }

//       // Find the product by VASProductID, VASID, and ModelMasterID and validate it
//       const vasProductPricing = await VASProductPricing.findOne({
//         where: { VASProductID, VASID, ModelMasterID },
//       });

//       if (!vasProductPricing) {
//         return {
//           message: `vasProductPricing with VASProductID ${VASProductID} not found`,
//           status: 404,
//         };
//       }

//       // Update fields only if provided in the request
//       if (OptionName !== undefined) vasProductPricing.OptionName = OptionName;
//       if (VariantID !== undefined) vasProductPricing.VariantID = VariantID;
//       if (ProductType !== undefined)
//         vasProductPricing.ProductType = ProductType;
//       if (ProductDuration !== undefined)
//         vasProductPricing.ProductDuration = ProductDuration;
//       if (EffectiveDate !== undefined)
//         vasProductPricing.EffectiveDate = EffectiveDate;
//       if (EndDate !== undefined) vasProductPricing.EndDate = EndDate;
//       if (Mandatory !== undefined) vasProductPricing.Mandatory = Mandatory;
//       if (Status !== undefined) vasProductPricing.Status = Status;
//       if (TaxApplicable !== undefined)
//         vasProductPricing.TaxApplicable = TaxApplicable;
//       if (TaxableValue !== undefined)
//         vasProductPricing.TaxableValue = TaxableValue;
//       if (TaxRate !== undefined) vasProductPricing.TaxRate = TaxRate;
//       if (TotalValue !== undefined) vasProductPricing.TotalValue = TotalValue;
//       if (TaxValue !== undefined) vasProductPricing.TaxValue = TaxValue;
//       if (Commission !== undefined) vasProductPricing.Commission = Commission;
//       if (Universal !== undefined) vasProductPricing.Universal = Universal;
//       if (IsActive !== undefined) vasProductPricing.IsActive = IsActive;
//       vasProductPricing.ModifiedDate = new Date(); // Set modified date to current date

//       // Save updated vasProductPricing in the database
//       await vasProductPricing.save();
//       return {
//         message: `vasProductPricing with VASProductID ${VASProductID} updated successfully`,
//         status: 200,
//       };
//     });

//     // Wait for all update operations to complete
//     const results = await Promise.all(updatePromises);

//     // Filter results to determine the status of each update operation
//     const failedUpdates = results.filter((result) => result.status === 404);

//     if (failedUpdates.length > 0) {
//       return res
//         .status(404)
//         .json({ message: "Some records not found", details: failedUpdates });
//     }

//     return res.status(200).json({
//       message: "All updates completed successfully",
//       details: results,
//     });
//   } catch (err) {
//     // Handle errors based on specific types
//     if (err.name === "SequelizeValidationError") {
//       return res.status(400).json({
//         message: "Validation error",
//         details: err.errors.map((e) => e.message),
//       });
//     }

//     if (err.name === "SequelizeDatabaseError") {
//       return res.status(500).json({
//         message: "Database error occurred during bulk update.",
//         details: err.message,
//       });
//     }

//     if (err.name === "SequelizeConnectionError") {
//       return res.status(503).json({
//         message: "Service unavailable. Unable to connect to the database.",
//         details: err.message,
//       });
//     }

//     // General error handling
//     console.error("Error during bulk update:", err);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };
exports.updateByPk = async (req, res) => {
  try {
    // Validate request
    if (!/^[a-zA-Z ]*$/.test(req.body.OptionName)) {
      console.log("Validation failed: OptionName contains special characters.");
      return res.status(400).json({
        message: "OptionName should contain only letters",
      });
    }

    // Find the VAS product pricing by VASProductID
    const vasProductID = req.params.id;

    // Validate the ID parameter
    if (!vasProductID) {
      return res
        .status(400)
        .json({ message: "VASProductID parameter is required." });
    }

    let vasProduct = await VASProductPricing.findByPk(vasProductID);

    if (!vasProduct) {
      return res.status(404).json({ message: "VAS product not found" });
    }

    // Backup the current ModelMasterID and VariantID
    const oldModelMasterID = vasProduct.ModelMasterID;
    const oldVariantID = vasProduct.VariantID;

    // Update fields (first, you update the basic fields)
    vasProduct.VASID = req.body.VASID || vasProduct.VASID;
    vasProduct.OptionName = req.body.OptionName || vasProduct.OptionName;

    vasProduct.ModelMasterID =
      req.body.ModelMasterID || vasProduct.ModelMasterID;
    vasProduct.VariantID = req.body.VariantID || vasProduct.VariantID;
    vasProduct.BranchID = req.body.BranchID || vasProduct.BranchID;
    vasProduct.UserID = req.body.UserID || vasProduct.UserID;
    vasProduct.ProductType = req.body.ProductType || vasProduct.ProductType;
    vasProduct.ProductDuration =
      req.body.ProductDuration || vasProduct.ProductDuration;
    vasProduct.EffectiveDate =
      req.body.EffectiveDate || vasProduct.EffectiveDate;
    vasProduct.EndDate = req.body.EndDate || vasProduct.EndDate;
    vasProduct.Mandatory = req.body.Mandatory || vasProduct.Mandatory;
    vasProduct.Status = req.body.Status || vasProduct.Status;
    vasProduct.TaxApplicable =
      req.body.TaxApplicable || vasProduct.TaxApplicable;
    vasProduct.TaxableValue = req.body.TaxableValue || vasProduct.TaxableValue;
    vasProduct.TaxRate = req.body.TaxRate || vasProduct.TaxRate;
    vasProduct.TotalValue = req.body.TotalValue || vasProduct.TotalValue;
    vasProduct.TaxValue = req.body.TaxValue || vasProduct.TaxValue;
    vasProduct.Commission = req.body.Commission || vasProduct.Commission;
    vasProduct.Universal = req.body.Universal || vasProduct.Universal;
    vasProduct.IsActive = req.body.IsActive || vasProduct.IsActive;
    vasProduct.ModifiedDate = new Date(); // Update the modified date to the current time

    // Check if the ModelMasterID is updated, if so, fetch the new ModelName
    if (req.body.ModelMasterID && req.body.ModelMasterID !== oldModelMasterID) {
      console.log("ModelMasterID updated, fetching new ModelName...");
      const modelMaster = await ModelMaster.findByPk(req.body.ModelMasterID);
      if (modelMaster) {
        console.log("New ModelName:", modelMaster.ModelName); // Debugging line to check the fetched ModelName
        vasProduct.ModelName = modelMaster.ModelDescription; // Set the new ModelName
      } else {
        return res.status(404).json({ message: "ModelMaster not found." });
      }
    }

    // Check if the VariantID is updated, if so, fetch the new VariantName
    if (req.body.VariantID && req.body.VariantID !== oldVariantID) {
      const variantMaster = await VariantMaster.findByPk(req.body.VariantID);
      if (variantMaster) {
        vasProduct.VariantName = variantMaster.VariantCode; // Set the new VariantName
      } else {
        return res.status(404).json({ message: "VariantMaster not found." });
      }
    }

    // Save updated VASProductPricing in the database
    const updatedVASProduct = await vasProduct.save();

    return res.status(200).json(updatedVASProduct); // Send the updated VASProduct as response
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
        message: "Database error occurred while updating VASProductPricing.",
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
    console.error("Error updating VASProductPricing:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a vasProductPricing with the specified id in the request
exports.deleteById = async (req, res) => {
  try {
    // Validate request
    if (!Array.isArray(req.body) || req.body.length === 0) {
      return res
        .status(400)
        .json({ message: "Request body must be a non-empty array" });
    }

    const deletions = req.body;

    // Prepare an array to hold promises for each delete operation
    const deletePromises = deletions.map(async (deleteData) => {
      const { VASProductID, VASID, ModelMasterID } = deleteData;

      // Validate mandatory fields
      if (!VASProductID || !VASID || !ModelMasterID) {
        return {
          message: "VASProductID, VASID, and ModelMasterID are required fields",
          status: 400,
        };
      }

      // Delete records matching the combination of VASProductID, VASID, and ModelMasterID
      const deletedCount = await VASProductPricing.destroy({
        where: { VASProductID, VASID, ModelMasterID },
      });

      // Check if any records were deleted
      if (deletedCount === 0) {
        return {
          message: `No records found for VASProductID ${VASProductID}, VASID ${VASID}, and ModelMasterID ${ModelMasterID}`,
          status: 404,
        };
      }

      return {
        message: `Successfully deleted records for VASProductID ${VASProductID}, VASID ${VASID}, and ModelMasterID ${ModelMasterID}`,
        status: 200,
      };
    });

    // Wait for all delete operations to complete
    const results = await Promise.all(deletePromises);

    // Filter results to determine the status of each delete operation
    const failedDeletions = results.filter((result) => result.status === 404);

    if (failedDeletions.length > 0) {
      return res
        .status(404)
        .json({ message: "Some records not found", details: failedDeletions });
    }

    return res.status(200).json({
      message: "All deletions completed successfully",
      details: results,
    });
  } catch (err) {
    // Handle errors based on specific types
    if (err.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message: "Database error occurred during bulk delete.",
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
    console.error("Error during bulk delete:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.findAllForMobile = async (req, res) => {
  try {
    const branchID = req.query.BranchID;
    const userID = req.query.UserID;
    const modelMasterID = req.query.ModelMasterID;
    const variantID = req.query.VariantID;
    // Fetch all VASProduct data with related ValueAddedService, ModelMaster, and VariantMaster data
    const vasProductData = await VASProductPricing.findAll({
      where: {
        BranchID: branchID,
        UserID: userID,
        ModelMasterID: modelMasterID,
        VariantID: variantID,
      },
      attributes: [
        "VASProductID",
        "VASID",
        "OptionName",
        "ModelMasterID",
        "ModelName",
        "VariantID",
        "VariantName",
        "TotalValue",
        "BranchID",
        "UserID",
        "Status",
        "CreatedDate",
        "ModifiedDate",
      ],
      include: [
        {
          model: ValueAddedService,
          as: "VPPVASID",
          attributes: ["ProductCode", "ProductName"], // Assuming 'ValueAddedServiceName' is a relevant field
        },
      ],
      order: [
        ["CreatedDate", "DESC"], // Order by OptionName in ascending order
      ],
    });

    // Check if data is empty
    if (!vasProductData || vasProductData.length === 0) {
      return res.status(404).json({
        message: "No VAS product data found.",
      });
    }

    // Map the data for response
    const combinedData = vasProductData.map((item) => ({
      VASProductID: item.VASProductID,
      VASID: item.VASID || null,
      ProductCode: item.VPPVASID ? item.VPPVASID.ProductCode : null,
      ProductName: item.VPPVASID ? item.VPPVASID.ProductName : null,
      OptionName: item.OptionName,
      ModelMasterID: item.ModelMasterID,
      BranchID: item.BranchID,
      UserID: item.UserID,
      ModelName: item.ModelName,
      VariantID: item.VariantID,
      VariantName: item.VariantName,
      TotalValue: item.TotalValue,
    }));

    // Send the combined data as response
    res.json(combinedData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message:
          "Database error occurred while retrieving VAS product for mobile data.",
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
    console.error("Error retrieving VAS product for mobile data:", error);
    return res.status(500).json({
      message: "Failed to retrieve VAS product data. Please try again later.",
    });
  }
};
exports.findOneForApproval = async (req, res) => {
  try {
    const { VASProductID, VASManagerApprovalsID } = req.query; // Get the VASID from the request parameters

    // Fetch a single VASProductPricing record by VASID with related ValueAddedService, ModelMaster, and VariantMaster data
    const vasProduct = await VASManagerApprovals.findOne({
      where: { VASProductID, VASManagerApprovalsID }, // Filter by VASID
      attributes: ["Status", "Remarks", "Reason"],
      include: [
        {
          model: VASProductPricing,
          as: "VASMAVASProductID",
          attributes: [
            "OptionName",
            "ProductType",
            "TotalValue",
            "ProductDuration",
          ],
          include: [
            {
              model: ValueAddedService,
              as: "VPPVASID",
              attributes: ["ProductName"],
            },
          ],
        },
      ],
    });

    // Check if the data exists
    if (!vasProduct) {
      return res.status(404).json({
        message: `No VAS product data found for VASID `,
      });
    }

    // Send the response as an object
    res.json(vasProduct);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message: "Database error occurred while retrieving VAS product data.",
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
    console.error("Error retrieving VAS product data by VASProductID:", error);
    return res.status(500).json({
      message: "Failed to retrieve VAS product data. Please try again later.",
    });
  }
};
