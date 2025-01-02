/* eslint-disable no-dupe-keys */
/* eslint-disable no-unused-vars */
require("dotenv").config();
const db = require("../models");
const NewCarPriceList = db.newcarpricelist;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;
const BranchMaster = db.branchmaster;
const ModelMaster = db.modelmaster;
const VariantMaster = db.variantmaster;
const ColourCategory = db.colourcategory;
const FuelType = db.fueltypes;
const Transmission = db.transmission;
const UserMaster = db.usermaster;

// Basic CRUD API
// Create and Save a new NewCarPriceList
exports.create = async (req, res) => {
  try {
    // Create a NewCarPriceList
    const newCarPriceList = {
      BranchID: req.body.BranchID,
      ModelMasterID: req.body.ModelMasterID,
      VariantID: req.body.VariantID,
      ColourCategoryID: req.body.ColourCategoryID,
      FuelTypeID: req.body.FuelTypeID,
      TransmissionID: req.body.TransmissionID,
      UserID: req.body.UserID,
      IsActive: req.body.IsActive || true,
      Status: req.body.Status || "Active",
    };

    // Save NewCarPriceList in the database
    const newNewCarPriceList = await NewCarPriceList.create(newCarPriceList);

    return res.status(201).json(newNewCarPriceList); // Send the newly created NewCarPriceList as response
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

    console.error("Error creating NewCarPriceList:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Retrieve all NewCarPriceLists from the database.
exports.findAll = async (req, res) => {
  try {
    // Fetch all NewCarPriceList data with included related data
    const newCarPriceListData = await NewCarPriceList.findAll({
      attributes: [
        "NewCarPriceListID",
        "BranchID",
        "ModelMasterID",
        "VariantID",
        "ColourCategoryID",
        "FuelTypeID",
        "TransmissionID",
        "UserID",
        "IsActive",
        "Status",
        "CreatedDate",
        "ModifiedDate",
      ],
      include: [
        {
          model: BranchMaster,
          as: "NCPLBranchID",
          attributes: ["BranchName"],
        },
        {
          model: ModelMaster,
          as: "NCPLModelMasterID",
          attributes: ["ModelCode", "ModelDescription"],
        },
        {
          model: VariantMaster,
          as: "NCPLVariantID",
          attributes: ["VariantCode"],
        },
        {
          model: ColourCategory,
          as: "NCPLColourCategoryID",
          attributes: ["ColourCategoryName"],
        },
        {
          model: FuelType,
          as: "NCPLFuelTypeID",
          attributes: ["FuelTypeName"],
        },
        {
          model: Transmission,
          as: "NCPLTransmissionID",
          attributes: ["TransmissionCode", "TransmissionDescription"],
        },
        {
          model: UserMaster,
          as: "NCPLUserID",
          attributes: ["EmpID", "UserName"],
        },
      ],
      order: [["CreatedDate", "DESC"]],
    });

    // Check if data is empty
    if (!newCarPriceListData || newCarPriceListData.length === 0) {
      return res.status(404).json({
        message: "No New Car Price List data found.",
      });
    }

    // Map the data for response
    const combinedData = newCarPriceListData.map((item) => ({
      NewCarPriceListID: item.NewCarPriceListID,
      BranchID: item.BranchID,
      BranchName: item.NCPLBranchID ? item.NCPLBranchID.BranchName : null,
      ModelMasterID: item.ModelMasterID,
      ModelCode: item.NCPLModelMasterID
        ? item.NCPLModelMasterID.ModelCode
        : null,
      ModelDescription: item.NCPLModelMasterID
        ? item.NCPLModelMasterID.ModelDescription
        : null,
      VariantID: item.VariantID,
      VariantCode: item.NCPLVariantID ? item.NCPLVariantID.VariantCode : null,
      ColourCategoryID: item.ColourCategoryID,
      ColourCategoryName: item.NCPLColourCategoryID
        ? item.NCPLColourCategoryID.ColourCategoryName
        : null,
      FuelTypeID: item.FuelTypeID,
      FuelTypeName: item.NCPLFuelTypeID
        ? item.NCPLFuelTypeID.FuelTypeName
        : null,
      TransmissionID: item.TransmissionID,
      TransmissionCode: item.NCPLTransmissionID
        ? item.NCPLTransmissionID.TransmissionCode
        : null,
      TransmissionDescription: item.NCPLTransmissionID
        ? item.NCPLTransmissionID.TransmissionDescription
        : null,
      UserID: item.UserID,
      EmpID: item.NCPLUserID ? item.NCPLUserID.EmpID : null,
      UserName: item.NCPLUserID ? item.NCPLUserID.UserName : null,
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

// Find a single NewCarPriceList with an id
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;

    // Validate the ID parameter
    if (!id) {
      return res.status(400).json({
        message: "ID parameter is required.",
      });
    }

    // Fetch the NewCarPriceList data by primary key with included related data
    const newCarPriceListData = await NewCarPriceList.findOne({
      where: { NewCarPriceListID: id },
      attributes: [
        "NewCarPriceListID",
        "BranchID",
        "ModelMasterID",
        "VariantID",
        "ColourCategoryID",
        "FuelTypeID",
        "TransmissionID",
        "UserID",
        "IsActive",
        "Status",
        "CreatedDate",
        "ModifiedDate",
      ],
      include: [
        {
          model: BranchMaster,
          as: "NCPLBranchID",
          attributes: ["BranchName"],
        },
        {
          model: ModelMaster,
          as: "NCPLModelMasterID",
          attributes: ["ModelCode", "ModelDescription"],
        },
        {
          model: VariantMaster,
          as: "NCPLVariantID",
          attributes: ["VariantCode"],
        },
        {
          model: ColourCategory,
          as: "NCPLColourCategoryID",
          attributes: ["ColourCategoryName"],
        },
        {
          model: FuelType,
          as: "NCPLFuelTypeID",
          attributes: ["FuelTypeName"],
        },
        {
          model: Transmission,
          as: "NCPLTransmissionID",
          attributes: ["TransmissionCode", "TransmissionDescription"],
        },
        {
          model: UserMaster,
          as: "NCPLUserID",
          attributes: ["EmpID", "UserName"],
        },
      ],
    });

    // Check if data is found
    if (!newCarPriceListData) {
      return res.status(404).json({
        message: "No New Car Price List data found for the provided ID.",
      });
    }

    // Prepare the response data
    const responseData = {
      NewCarPriceListID: newCarPriceListData.NewCarPriceListID,
      BranchID: newCarPriceListData.BranchID,
      BranchName: newCarPriceListData.NCPLBranchID
        ? newCarPriceListData.NCPLBranchID.BranchName
        : null,
      ModelMasterID: newCarPriceListData.ModelMasterID,
      ModelCode: newCarPriceListData.NCPLModelMasterID
        ? newCarPriceListData.NCPLModelMasterID.ModelCode
        : null,
      ModelDescription: newCarPriceListData.NCPLModelMasterID
        ? newCarPriceListData.NCPLModelMasterID.ModelDescription
        : null,
      VariantID: newCarPriceListData.VariantID,
      VariantCode: newCarPriceListData.NCPLVariantID
        ? newCarPriceListData.NCPLVariantID.VariantCode
        : null,
      ColourCategoryID: newCarPriceListData.ColourCategoryID,
      ColourCategoryName: newCarPriceListData.NCPLColourCategoryID
        ? newCarPriceListData.NCPLColourCategoryID.ColourCategoryName
        : null,
      FuelTypeID: newCarPriceListData.FuelTypeID,
      FuelTypeName: newCarPriceListData.NCPLFuelTypeID
        ? newCarPriceListData.NCPLFuelTypeID.FuelTypeName
        : null,
      TransmissionID: newCarPriceListData.TransmissionID,
      TransmissionCode: newCarPriceListData.NCPLTransmissionID
        ? newCarPriceListData.NCPLTransmissionID.TransmissionCode
        : null,
      TransmissionDescription: newCarPriceListData.NCPLTransmissionID
        ? newCarPriceListData.NCPLTransmissionID.TransmissionDescription
        : null,
      UserID: newCarPriceListData.UserID,
      EmpID: newCarPriceListData.NCPLUserID
        ? newCarPriceListData.NCPLUserID.EmpID
        : null,
      UserName: newCarPriceListData.NCPLUserID
        ? newCarPriceListData.NCPLUserID.UserName
        : null,
      IsActive: newCarPriceListData.IsActive,
      Status: newCarPriceListData.Status,
      CreatedDate: newCarPriceListData.CreatedDate,
      ModifiedDate: newCarPriceListData.ModifiedDate,
    };

    // Send the response data
    res.json(responseData);
  } catch (error) {
    // Handle errors based on specific types
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

    // General error handling
    console.error("Error retrieving New Car Price List data:", error);
    return res.status(500).json({
      message:
        "Failed to retrieve New Car Price List data. Please try again later.",
    });
  }
};

// Update a NewCarPriceList by the id in the request
exports.updateByPk = async (req, res) => {
  try {
    const id = req.params.id;

    // Validate the ID parameter
    if (!id) {
      return res.status(400).json({ message: "ID parameter is required." });
    }

    // Find the NewCarPriceList record by primary key
    const newCarPriceList = await NewCarPriceList.findByPk(id);

    if (!newCarPriceList) {
      return res.status(404).json({ message: "NewCarPriceList not found." });
    }

    // Update fields (check for undefined or null values before updating)
    newCarPriceList.BranchID = req.body.BranchID || newCarPriceList.BranchID;
    newCarPriceList.ModelMasterID =
      req.body.ModelMasterID || newCarPriceList.ModelMasterID;
    newCarPriceList.VariantID = req.body.VariantID || newCarPriceList.VariantID;
    newCarPriceList.ColourCategoryID =
      req.body.ColourCategoryID || newCarPriceList.ColourCategoryID;
    newCarPriceList.FuelTypeID =
      req.body.FuelTypeID || newCarPriceList.FuelTypeID;
    newCarPriceList.TransmissionID =
      req.body.TransmissionID || newCarPriceList.TransmissionID;
    newCarPriceList.UserID = req.body.UserID || newCarPriceList.UserID;
    newCarPriceList.IsActive = req.body.IsActive || newCarPriceList.IsActive;
    newCarPriceList.Status = req.body.Status || newCarPriceList.Status;
    newCarPriceList.ModifiedDate = new Date(); // Update the modified date to the current timestamp

    // Save the updated record
    const updatedNewCarPriceList = await newCarPriceList.save();

    return res.status(200).json({
      message: "NewCarPriceList updated successfully.",
      data: updatedNewCarPriceList,
    });
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
        message: "Database error occurred while updating NewCarPriceList.",
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
    console.error("Error updating NewCarPriceList:", error);
    return res.status(500).json({
      message: "Failed to update NewCarPriceList. Please try again later.",
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
    const newCarPriceList = await NewCarPriceList.findByPk(id);

    // Check if the model exists
    if (!newCarPriceList) {
      return res
        .status(404)
        .json({ message: "NewCarPriceList not found with id: " + id });
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
