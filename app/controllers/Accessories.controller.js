/* eslint-disable no-unused-vars */
const db = require("../models");
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;
const ModelMaster = db.modelmaster;
const VariantMaster = db.variantmaster;
const AccPartMaster = db.accpartmaster;
const AccPartMapModel = db.accpartmapwithmodel;
const AccPartImages = db.accpartimages;
const AccCategory = db.acccategory;
const AccSubCategory = db.accsubcategory;
const AccWishlist = db.accwishlist;
const custmap = db.CustEmpMaping;
const UserMaster = db.usermaster;
const AccCart = db.acccart;
const multer = require("multer");
const path = require("path");
const { Client } = require("ssh2");
require("dotenv").config();
const fs = require("fs");
const { Console } = require("console");
const { configureMulter } = require("../Utils/multerService");
const { transferImageToServer } = require("../Utils/sshService");
const { genPartName } = require("../Utils/generateService");
const { truncate } = require("fs/promises");
const VehicleAllotment = db.vehicleallotment;

exports.AddAccCategory = async (req, res) => {
  try {
    const existingCategory = await AccCategory.findOne({
      where: { AccCategoryName: req.body.AccCategoryName },
    });
    if (existingCategory) {
      return res
        .status(400)
        .json({ message: "AccCategory Code already exists" });
    }

    // Create a AccCategory
    const accCtegory = {
      AccCategoryName: req.body.AccCategoryName,
      IsActive: req.body.IsActive || true,
      Status: req.body.Status || "Active",
      CreatedDate: req.body.CreatedDate || new Date(),
      // ModifiedDate: req.body.ModifiedDate || new Date(),
    };
    // Save AccCategory in the database
    const newcategory = await AccCategory.create(accCtegory);
    return res.status(200).json(newcategory); // Send the newly created SKUMaster as response
  } catch (err) {
    console.error("Error creating newPartMaster:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.GetAllAccCategory = async (req, res) => {
  try {
    const allCategories = await AccCategory.findAll({
      order: [["CreatedDate", "DESC"]],
    });
    return res.status(200).json(allCategories);
  } catch (err) {
    console.error("Error getting all AccCategories:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.UpdateAccCategory = async (req, res) => {
  try {
    const accCategoryId = req.body.accCategoryId; // assuming id is passed in the URL
    const existingCategory = await AccCategory.findByPk(accCategoryId);
    if (!existingCategory) {
      return res.status(404).json({ message: "AccCategory not found" });
    }

    // Update AccCategory
    existingCategory.AccCategoryName =
      req.body.AccCategoryName || existingCategory.AccCategoryName;
    existingCategory.IsActive = req.body.IsActive || existingCategory.IsActive;
    existingCategory.Status = req.body.Status || existingCategory.Status;
    existingCategory.ModifiedDate = new Date();

    // Save updated AccCategory
    await existingCategory.save();
    return res.status(200).json(existingCategory);
  } catch (err) {
    console.error("Error updating AccCategory:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.DeleteAccCategory = async (req, res) => {
  try {
    const accCategoryId = req.body.accCategoryId; // assuming id is passed in the URL
    const existingCategory = await AccCategory.findByPk(accCategoryId);
    if (!existingCategory) {
      return res.status(404).json({ message: "AccCategory not found" });
    }
    // Delete AccCategory
    await existingCategory.destroy();
    return res
      .status(200)
      .json({ message: "AccCategory deleted successfully" });
  } catch (err) {
    console.error("Error deleting AccCategory:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.AddAccSubCategory = async (req, res) => {
  try {
    const existingCategory = await AccSubCategory.findOne({
      where: { AccSubCategoryName: req.body.AccSubCategoryName },
    });
    if (existingCategory) {
      return res
        .status(400)
        .json({ message: "AccCategory Code already exists" });
    }

    // Create a AccCategory
    const accSubCtegory = {
      AccSubCategoryName: req.body.AccSubCategoryName,
      AccCategoryID: req.body.AccCategoryID,
      IsActive: req.body.IsActive || true,
      Status: req.body.Status || "Active",
      CreatedDate: req.body.CreatedDate || new Date(),
      // ModifiedDate: req.body.ModifiedDate || new Date(),
    };
    // Save AccSubCategory in the database
    const newsubcategory = await AccSubCategory.create(accSubCtegory);
    return res.status(200).json(newsubcategory); // Send the newly created SKUMaster as response
  } catch (err) {
    console.error("Error creating newPartMaster:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.GetAllSubAccCategory = async (req, res) => {
  try {
    const allCategories = await AccSubCategory.findAll({
      include: [
        {
          model: AccCategory, // Assuming AccCategory is the associated model
          as: "AccessoriesCategoryID", // Correct alias for the association
          attributes: [
            ["AccCategoryID", "AccCategoryID"], // Fetch AccCategoryID as AccCategoryID
            "AccCategoryName", // Fetch AccCategoryName
          ],
        },
      ],
      order: [["CreatedDate", "DESC"]],
    });

    // Map the results to the desired structure
    const combinedData = allCategories.map((item) => ({
      AccSubCategoryID: item.AccSubCategoryID,
      AccSubCategoryName: item.AccSubCategoryName,

      AccCategoryID: item.AccessoriesCategoryID // Access the correct alias
        ? item.AccessoriesCategoryID.AccCategoryID
        : null, // Map AccCategoryID
      AccCategoryName: item.AccessoriesCategoryID // Access the correct alias
        ? item.AccessoriesCategoryID.AccCategoryName
        : null, // Map AccCategoryName
      IsActive: item.IsActive,
      Status: item.Status,
      CreatedDate: item.CreatedDate,
      ModifiedDate: item.ModifiedDate,
    }));

    return res.status(200).json(combinedData); // Return the mapped data
  } catch (err) {
    console.error("Error getting all AccCategories:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.UpdateAccSubCategory = async (req, res) => {
  try {
    const AccSubCategoryID = req.body.AccSubCategoryID; // assuming id is passed in the URL
    const existingSubCategory = await AccSubCategory.findByPk(AccSubCategoryID);
    if (!existingSubCategory) {
      return res.status(404).json({ message: "AccCategory not found" });
    }

    // Update AccCategory
    existingSubCategory.AccSubCategoryName =
      req.body.AccSubCategoryName || existingSubCategory.AccSubCategoryName;
    existingSubCategory.AccCategoryID =
      req.body.AccCategoryID || existingSubCategory.AccCategoryID;
    existingSubCategory.IsActive =
      req.body.IsActive !== undefined
        ? req.body.IsActive
        : existingSubCategory.IsActive;
    existingSubCategory.Status = req.body.Status || existingSubCategory.Status;
    existingSubCategory.ModifiedDate = new Date();

    // Save updated AccCategory
    await existingSubCategory.save();
    return res.status(200).json(existingSubCategory);
  } catch (err) {
    console.error("Error updating AccCategory:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.GetByIdAccSubCategory = async (req, res) => {
  try {
    const { id } = req.query;

    // Validate the ID parameter
    if (!id) {
      return res.status(400).json({
        message: "ID parameter is required.",
      });
    }

    // Fetch the action data by primary key
    const partData = await AccSubCategory.findOne({
      where: {
        AccSubCategoryID: id,
      },
      include: [
        {
          model: AccCategory,
          as: "AccessoriesCategoryID",
          attributes: ["AccCategoryID", "AccCategoryName"], // Select specific fields
        },
      ],
    });

    // Check if data is found
    if (!partData) {
      return res.status(404).json({
        message: "PartData not found.",
      });
    }

    // Modify the result to remove AccessoriesCategoryID and place its fields at root level
    const responseData = {
      AccSubCategoryID: partData.AccSubCategoryID,
      AccSubCategoryName: partData.AccSubCategoryName,
      AccCategoryID: partData.AccessoriesCategoryID?.AccCategoryID, // Assign AccCategoryID from AccessoriesCategoryID
      AccCategoryName: partData.AccessoriesCategoryID?.AccCategoryName, // Assign AccCategoryName from AccessoriesCategoryID
      IsActive: partData.IsActive,
      Status: partData.Status,
      CreatedDate: partData.CreatedDate,
      ModifiedDate: partData.ModifiedDate,
    };

    // Send the response data
    res.json(responseData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message: "Database error occurred while retrieving action data.",
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
    console.error("Error retrieving action data:", error);
    return res.status(500).json({
      message: "Failed to retrieve action data. Please try again later.",
    });
  }
};

exports.AddPartMaster = async (req, res) => {
  try {
    // Check if ModelCode already exists
    const existingPart = await AccPartMaster.findOne({
      where: { PartCode: req.body.PartCode },
    });
    if (existingPart) {
      return res.status(400).json({ message: "PartCode Code already exists" });
    }

    // Create a model
    const partMaster = {
      PartCode: req.body.PartCode,
      PartName: req.body.PartName,
      AccCategoryID: req.body.AccCategoryID,
      AccSubCategoryID: req.body.AccSubCategoryID,
      MinQuantity: req.body.MinQuantity,
      Price: req.body.Price,
      Origin: req.body.Origin,
      Specification: req.body.Specification,
      Features: req.body.Features,
      FitmentStatus: req.body.FitmentStatus,
      UniverselModel: req.body.UniverselModel || false,
      IsActive: req.body.IsActive || true,
      Status: req.body.Status || "Active",
      CreatedDate: req.body.CreatedDate || new Date(),
      // ModifiedDate: req.body.ModifiedDate || new Date(),
    };
    // Save newPartMaster in the database
    const newPartMaster = await AccPartMaster.create(partMaster);
    console.log("??????", newPartMaster);
    return res.status(200).json(newPartMaster); // Send the newly created SKUMaster as response
  } catch (err) {
    // Handle errors based on specific types
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

    if (err.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while creating newPartMaster.",
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
    console.error("Error creating SKUMaster:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.GetAllPartMasters = async (req, res) => {
  try {
    console.log("Fetching part masters...");

    // Fetch PartMasters with AccessoriesCategoryID and AccessoriesSubCategoryID
    const partmasters = await AccPartMapModel.findAll({
      include: [
        {
          model: AccPartMaster,
          as: "AccPartMasterID", // Use the updated alias
          attributes: [
            "PartCode",
            "PartName",
            "AccCategoryID",
            "AccSubCategoryID",
            "MinQuantity",
            "Price",
            "Origin",
            "Specification",
            "Features",
            "FitmentStatus",
            "UniverselModel",
          ],
          include: [
            {
              model: AccCategory,
              as: "AccessoriesCategoryID",
              attributes: ["AccCategoryName"],
            },
            {
              model: AccSubCategory,
              as: "AccessoriesSubCategoryID", // Use the updated alias
              attributes: ["AccSubCategoryName"],
            },
          ],
        },
        {
          model: ModelMaster,
          as: "AccModelMasterID", // Use the updated alias
          attributes: ["ModelCode", "ModelDescription"],
        },
        {
          model: VariantMaster,
          as: "AccVariantID", // Use the updated alias
          attributes: ["VariantCode"],
        },
      ],

      attributes: [
        "PartModelID",
        "PartMasterID",
        "ModelMasterID",
        "VariantID",
        "IsActive",
        "Status",
        "CreatedDate",
        "ModifiedDate",
      ],
      order: [["CreatedDate", "DESC"]],
    });

    console.log(`Retrieved ${partmasters.length} part masters.`);

    if (partmasters.length === 0) {
      return res.status(404).json({ message: "No Part Masters found" });
    }

    // Map all the fields
    const mappedPartMasters = partmasters.map((part) => ({
      PartModelID: part.PartModelID,
      PartMasterID: part.PartMasterID,
      ModelMasterID: part.ModelMasterID,
      VariantID: part.VariantID,
      IsActive: part.IsActive,
      Status: part.Status,
      CreatedDate: part.CreatedDate,
      ModifiedDate: part.ModifiedDate,
      PartCode: part.AccPartMasterID?.PartCode,
      PartName: part.AccPartMasterID?.PartName,
      AccCategoryID: part.AccPartMasterID?.AccCategoryID,
      AccSubCategoryID: part.AccPartMasterID?.AccSubCategoryID,
      MinQuantity: part.AccPartMasterID?.MinQuantity,
      Price: part.AccPartMasterID?.Price,
      Origin: part.AccPartMasterID?.Origin,
      FitmentStatus: part.AccPartMasterID?.FitmentStatus,
      Specification: part.AccPartMasterID?.Specification,
      Features: part.AccPartMasterID?.Features,
      UniverselModel: part.AccPartMasterID?.UniverselModel,
      AccSubCategoryName:
        part.AccPartMasterID?.AccessoriesSubCategoryID?.AccSubCategoryName,
      AccCategoryName:
        part.AccPartMasterID?.AccessoriesCategoryID?.AccCategoryName,
      ModelCode: part.AccModelMasterID?.ModelCode,
      ModelDescription: part.AccModelMasterID?.ModelDescription,
      VariantCode: part.AccVariantID?.VariantCode,
    }));

    // Return the mapped result
    return res.status(200).json(mappedPartMasters);
  } catch (error) {
    console.error("Error fetching part masters:", error);

    // Handle database-specific errors
    if (error.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message: "Database error occurred while retrieving part master data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    // General error handler
    return res.status(500).json({
      message: "Internal server error",
      details: error.message,
    });
  }
};

exports.GetPartMasterByID = async (req, res) => {
  try {
    const { id, BookingID } = req.query;
    console.log("??????", id);

    // Validate the ID parameter
    if (!id) {
      return res.status(400).json({
        message: "ID parameter is required.",
      });
    }

    // Fetch the action data by primary key
    const wishlistdata = await AccWishlist.findOne({
      where: {
        BookingID: BookingID,
        PartMasterID: id,
      },
    });

    // Fetch the action data by primary key
    const PartData = await AccPartMaster.findOne({
      where: {
        PartMasterID: id,
      },
    });

    // Fetch the images related to the part
    const partimages = await AccPartImages.findAll({
      where: {
        PartMasterID: id,
      },
    });

    // Check if PartData is found
    if (!PartData) {
      return res.status(404).json({
        message: "PartData not found.",
      });
    }

    // Check if images are found
    if (!partimages || partimages.length === 0) {
      return res.status(404).json({
        message: "No images found for the provided PartMasterID.",
      });
    }

    // Send the combined response
    res.json({
      PartData,
      partimages,
      wishlistdata,
      MaxQty: 10, // Assuming Value
    });
  } catch (error) {
    // Handle specific Sequelize errors
    if (error.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message: "Database error occurred while retrieving data.",
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
    console.error("Error retrieving data:", error);
    return res.status(500).json({
      message: "Failed to retrieve data. Please try again later.",
    });
  }
};

exports.UpdatePartMaster = async (req, res) => {
  try {
    // // Validate request
    // if (!req.body.PartCode) {
    //   return res.status(400).json({ message: "PartCode cannot be empty" });
    // }
    // if (!/^[a-zA-Z0-9]*$/.test(req.body.PartCode)) {
    //   console.log("Validation failed: PartCode contains special characters.");
    //   return res.status(400).json({
    //     message: "PartCode should contain only letters and numbers",
    //   });
    // }
    // Find the AccPartMaster by ID
    const partMasterID = req.body.PartMasterID;
    let accPartMaster = await AccPartMaster.findByPk(partMasterID);

    if (!accPartMaster) {
      return res.status(404).json({ message: "AccPartMaster not found" });
    }

    // Update fields
    accPartMaster.PartCode = req.body.PartCode || accPartMaster.PartCode;
    accPartMaster.PartName = req.body.PartName || accPartMaster.PartName;
    accPartMaster.Category = req.body.Category || accPartMaster.Category;
    accPartMaster.FitmentStatus =
      req.body.FitmentStatus || accPartMaster.FitmentStatus;
    accPartMaster.MinQuantity =
      req.body.MinQuantity || accPartMaster.MinQuantity;
    accPartMaster.Price = req.body.Price || accPartMaster.Price;
    accPartMaster.Origin = req.body.Origin || accPartMaster.Origin;
    accPartMaster.Specification =
      req.body.Specification || accPartMaster.Specification;
    accPartMaster.Features = req.body.Features || accPartMaster.Features;
    accPartMaster.UniverselModel =
      req.body.UniverselModel !== undefined
        ? req.body.UniverselModel
        : accPartMaster.UniverselModel;
    accPartMaster.IsActive =
      req.body.IsActive !== undefined
        ? req.body.IsActive
        : accPartMaster.IsActive;
    accPartMaster.Status = req.body.Status || accPartMaster.Status;
    accPartMaster.ModifiedDate = new Date();

    // Save updated AccPartMaster in the database
    const updatedAccPartMaster = await accPartMaster.save();

    return res.status(200).json(updatedAccPartMaster); // Send the updated AccPartMaster as response
  } catch (err) {
    console.error("Error updating AccPartMaster:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.AddModelWithPart = async (req, res) => {
  try {
    const {
      PartMasterID,
      ModelMasterID,
      Variants,
      AccCategoryID,
      AccSubCategoryID,
    } = req.body;

    // Ensure Variants is an array
    if (!Array.isArray(Variants)) {
      return res.status(400).json({ message: "Variants should be an array" });
    }

    // Create an array of PartWithModel objects
    const partWithModels = Variants.map((VariantID) => ({
      PartMasterID,
      AccCategoryID,
      AccSubCategoryID,
      ModelMasterID,
      VariantID,
      IsActive: true,
      Status: "Active",
      CreatedDate: new Date(),
      // ModifiedDate: new Date(),
    }));

    // Insert all parts with models into the database
    const newPartWithModels = await AccPartMapModel.bulkCreate(partWithModels);

    return res.status(200).json(newPartWithModels);
  } catch (err) {
    console.error("Error creating newPartWithModels:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.GetAllModelWithParts = async (req, res) => {
  try {
    const partmasters = await AccPartMapModel.findAll({
      where: { Status: "Active" },
      include: [
        {
          model: ModelMaster,
          as: "AccModelMasterID",
          attributes: ["ModelCode", "ModelDescription"],
        },
        {
          model: VariantMaster,
          as: "AccVariantID",
          attributes: ["VariantCode"],
        },
      ],
      order: [["PartModelID", "ASC"]],
    });

    console.log(`Retrieved ${partmasters.length} part masters.`);

    if (partmasters.length === 0) {
      return res.status(404).json({ message: "No part masters found" });
    }

    const formattedPartMasters = partmasters.map((partmaster) => ({
      PartModelID: partmaster.PartModelID,
      ModelCode: partmaster.AccModelMasterID.ModelCode,
      ModelDescription: partmaster.AccModelMasterID.ModelDescription,
      VariantCode: partmaster.AccVariantID.VariantCode,
    }));

    return res.status(200).json(formattedPartMasters);
  } catch (error) {
    console.error("Error creating newPartWithModels:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
exports.DeleteModelWithPart = async (req, res) => {
  const { id, Status } = req.query; // Get 'id' from query parameters

  try {
    // Ensure id is provided
    if (!id) {
      return res.status(400).json({ message: "PartModelID is required" });
    }

    // Find the record to ensure it exists
    const partmaster = await AccPartMapModel.findOne({
      where: { PartModelID: id },
    });

    if (!partmaster) {
      return res.status(404).json({ message: "Part master not found" });
    }

    // Update the status to "Inactive"
    const [updated] = await AccPartMapModel.update(
      { Status: Status, ModifiedDate: new Date() },
      { where: { PartModelID: id } }
    );

    if (updated) {
      return res
        .status(200)
        .json({ message: "Part master status updated to 'Inactive'" });
    }

    return res.status(400).json({ message: "Failed to update status" });
  } catch (error) {
    console.error("Error updating part master status:", error); // Improved error logging
    return res.status(500).json({ message: "Internal server error" });
  }
};

// const upload = configureMulter(
//   // "C:/Users/varun/OneDrive/Desktop/uploads/", // Adjust upload path as needed
//   "/home/administrator/VARUNGROUP/IMAGES_VMS_MARUTI",
//   1000000, // File size limit (1MB)
//   ["jpeg", "jpg", "png", "gif"], // Allowed file types
//   "PartImgUrl" // Field name in your request
// );

// exports.AddPartImages = async (req, res) => {
//   // Call the upload middleware before processing the request
//   upload(req, res, async (err) => {
//     if (err) {
//       // Handle any errors from multer
//       return res.status(400).json({ message: err.message });
//     }
//     console.log("Request Body:", req.body);
//     console.log("Request File:", req.file);
//     try {
//       const localFilePath = req.file.path;
//       // Generate filename dynamically
//       const filename = await genPartName(req.file, req.body.PartMasterID);
//       const remoteFilePath = process.env.Customer_Documents_PATH + filename;
//       // Upload file to server via SSH
//       const sshConfig = {
//         host: process.env.SSH_HOST,
//         port: process.env.SSH_PORT,
//         username: process.env.SSH_USERNAME,
//         privateKeyPath: process.env.SSH_PRIVATE_KEY_PATH,
//       };
//       await transferImageToServer(
//         localFilePath,
//         remoteFilePath,
//         sshConfig,
//         "upload"
//       );
//       // Validate request and prepare data
//       const documents = {
//         PartMasterID: req.body.PartMasterID,
//         PartImgUrl: remoteFilePath,
//         // IsActive: req.body.IsActive,
//       };
//       const createdDocuments = await AccPartImages.create(documents);
//       return res.status(200).json({
//         message: "Document created/updated successfully",
//         createdDocuments,
//       }); // Send the newly created/updated documents as response
//     } catch (err) {
//       console.error("Error creating/updating documents:", err);
//       return res.status(500).json({ message: "Internal server error" });
//     } finally {
//       // Clean up temporary file
//       if (req.file && fs.existsSync(req.file.path)) {
//         fs.unlinkSync(req.file.path);
//       }
//     }
//   });
// };

exports.GetPartImages = async (req, res) => {
  try {
    const { PartMasterID } = req.query; // Extract PartMasterID from query parameters
    if (!PartMasterID) {
      return res.status(400).json({
        message: "PartMasterID parameter is required.",
      });
    }

    const partimages = await AccPartImages.findOne({
      where: {
        PartMasterID: PartMasterID,
      },
    });

    // Check if data is empty
    if (!partimages) {
      return res.status(404).json({
        message: "No part images found for the specified PartMasterID.",
      });
    }

    // Send the data as response
    res.json(partimages);
  } catch (error) {
    // Handle Sequelize errors
    if (error instanceof sequelize.DatabaseError) {
      return res.status(500).json({
        message: "Database error occurred while retrieving part images.",
        details: error.message,
      });
    } else if (error instanceof sequelize.ConnectionError) {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    } else {
      console.error("Error retrieving part images:", error);
      res.status(500).json({
        message: "Failed to retrieve part images. Please try again later.",
      });
    }
  }
};
// const configureMulter1 = (uploadPath, fileSizeLimit, fileTypes, fieldName) => {
//   const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//       cb(null, uploadPath);
//     },
//     filename: (req, file, cb) => {
//       cb(null, Date.now() + "-" + file.originalname);
//     },
//   });

//   const fileFilter = (req, file, cb) => {
//     const fileType = file.mimetype.split("/")[1];
//     if (fileTypes.includes(fileType)) {
//       cb(null, true);
//     } else {
//       cb(new Error("Invalid file type"), false);
//     }
//   };

//   return multer({
//     storage: storage,
//     limits: { fileSize: fileSizeLimit },
//     fileFilter: fileFilter,
//   }).array(fieldName, 10); // Adjust the maximum number of files as needed
// };

// const upload = configureMulter1(
//   "/home/administrator/VARUNGROUP/IMAGES_VMS_MARUTI",
//   1000000, // File size limit (1MB)
//   ["jpeg", "jpg", "png", "gif"], // Allowed file types
//   "PartImgUrl" // Field name in your request
// );

// exports.AddPartImages = async (req, res) => {
//   upload(req, res, async (err) => {
//     if (err) {
//       return res.status(400).json({ message: err.message });
//     }

//     try {
//       const files = req.files;
//       if (!files || files.length === 0) {
//         return res.status(400).json({ message: "No files uploaded" });
//       }

//       const partMasterID = req.body.PartMasterID;
//       const sshConfig = {
//         host: process.env.SSH_HOST,
//         port: process.env.SSH_PORT,
//         username: process.env.SSH_USERNAME,
//         privateKeyPath: process.env.SSH_PRIVATE_KEY_PATH,
//       };

//       const uploadedDocuments = await Promise.all(
//         files.map(async (file) => {
//           const localFilePath = file.path;
//           const filename = await genPartName(file, partMasterID);
//           const remoteFilePath = process.env.Customer_Documents_PATH + filename;

//           await transferImageToServer(
//             localFilePath,
//             remoteFilePath,
//             sshConfig,
//             "upload"
//           );

//           // Prepare the document data
//           return {
//             PartMasterID: partMasterID,
//             PartImgUrl: remoteFilePath,
//           };
//         })
//       );

//       const createdDocuments = await AccPartImages.bulkCreate(
//         uploadedDocuments
//       );

//       return res.status(200).json({
//         message: "Documents created/updated successfully",
//         createdDocuments,
//       });
//     } catch (err) {
//       console.error("Error creating/updating documents:", err);
//       return res.status(500).json({ message: "Internal server error" });
//     } finally {
//       // Clean up temporary files
//       if (req.files && req.files.length > 0) {
//         req.files.forEach((file) => {
//           if (fs.existsSync(file.path)) {
//             fs.unlinkSync(file.path);
//           }
//         });
//       }
//     }
//   });
// };

const configureMulter1 = (uploadPath, fileSizeLimit, fileTypes, fieldName) => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + "-" + file.originalname);
    },
  });

  const fileFilter = (req, file, cb) => {
    const fileType = file.mimetype.split("/")[1];
    if (fileTypes.includes(fileType)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"), false);
    }
  };

  return multer({
    storage: storage,
    limits: { fileSize: fileSizeLimit },
    fileFilter: fileFilter,
  }).array(fieldName, 10); // Adjust the maximum number of files as needed
};

const upload = configureMulter1(
  "/home/administrator/VARUNGROUP/IMAGES_VMS_MARUTI",
  // "C:\\Users\\itvsp\\Desktop\\Uploads",
  // "C:\\Users\\varun\\OneDrive\\Desktop\\uploads", // Madhukar local address
  1000000, // File size limit (1MB)
  ["jpeg", "jpg", "png", "gif"], // Allowed file types
  "PartImgUrl" // Field name in your request
);

// Generate a unique filename by appending an incrementing number
const genPartName1 = async (file, partMasterID, index) => {
  const extension = file.originalname.split(".").pop();
  return `P${partMasterID}_${index}.${extension}`;
};

exports.AddPartImages = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    try {
      const files = req.files;
      if (!files || files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      const partMasterID = req.body.PartMasterID;
      const sshConfig = {
        host: process.env.SSH_HOST,
        port: process.env.SSH_PORT,
        username: process.env.SSH_USERNAME,
        privateKeyPath: process.env.SSH_PRIVATE_KEY_PATH,
      };

      const uploadedDocuments = await Promise.all(
        files.map(async (file, index) => {
          const localFilePath = file.path;
          const filename = await genPartName(file, partMasterID, index + 1);
          const remoteFilePath = process.env.Customer_Documents_PATH + filename;
          await transferImageToServer(
            localFilePath,
            remoteFilePath,
            sshConfig,
            "upload"
          );

          // Prepare the document data
          return {
            PartMasterID: partMasterID,
            PartImgUrl: remoteFilePath,
          };
        })
      );

      const createdDocuments = await AccPartImages.bulkCreate(
        uploadedDocuments
      );

      return res.status(200).json({
        message: "Documents created/updated successfully",
        createdDocuments,
      });
    } catch (err) {
      console.error("Error creating/updating documents:", err);
      return res.status(500).json({ message: "Internal server error" });
    } finally {
      // Clean up temporary files
      if (req.files && req.files.length > 0) {
        req.files.forEach((file) => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      }
    }
  });
};

exports.GetSubCategoiresByCateID = async (req, res) => {
  try {
    const { AccCategoryID } = req.query; // Extract PartMasterID from query parameters
    if (!AccCategoryID) {
      return res.status(400).json({
        message: "CategoryID parameter is required.",
      });
    }
    const Subcategoies = await AccSubCategory.findAll({
      where: { AccCategoryID: AccCategoryID },
    });
    if (!Subcategoies) {
      return res.status(400).json({
        message: " No data found",
      });
    }
    return res.status(200).json(Subcategoies);
  } catch (err) {
    console.error("Error getting all Subcategoies:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.GetPartMaterBySubCateID = async (req, res) => {
  try {
    const { AccCategoryID, AccSubCategoryID, ModelMasterID, VariantID } =
      req.body;

    // Validate required parameters
    if (!ModelMasterID) {
      return res.status(400).json({
        message: "ModelMasterID parameter is required.",
      });
    }
    if (!VariantID) {
      return res.status(400).json({
        message: "VariantID parameter is required.",
      });
    }
    if (!AccCategoryID) {
      return res.status(400).json({
        message: "AccCategoryID parameter is required.",
      });
    }
    if (!AccSubCategoryID) {
      return res.status(400).json({
        message: "AccSubCategoryID parameter is required.",
      });
    }

    // Fetch the parts and their images by manually joining on PartMasterID
    const Subcategories = await AccPartMapModel.findAll({
      where: {
        ModelMasterID: ModelMasterID,
        VariantID: VariantID,
        AccCategoryID: AccCategoryID,
        AccSubCategoryID: AccSubCategoryID,
      },
      attributes: [
        "PartModelID",
        "PartMasterID",
        "ModelMasterID",
        "VariantID",
        "AccCategoryID",
        "AccSubCategoryID", // Include all AccPartMapModel attributes
        "IsActive",
        "Status",
      ],
      include: [
        {
          model: AccPartMaster,
          as: "AccPartMasterID", // Alias
          attributes: [
            "PartMasterID",
            "PartCode",
            "PartName",
            "AccCategoryID",
            "AccSubCategoryID",
            "MinQuantity",
            "Price",
            "Origin",
            "Specification",
            "Features",
            "UniverselModel",
            "IsActive",
            "Status",
          ],
        },
      ],
    });

    // Get all PartMasterIDs from the result
    const partMasterIds = Subcategories.map(
      (subcategory) => subcategory.PartMasterID
    );

    // Fetch the images for the retrieved PartMasterIDs
    const partImages = await AccPartImages.findAll({
      where: {
        PartMasterID: partMasterIds, // Match the PartMasterID manually
      },
      attributes: ["PartMasterID", "PartImgUrl"], // Fetch images based on PartMasterID
    });

    // Combine the part data and images manually
    const result = Subcategories.map((subcategory) => {
      const partMaster = subcategory.AccPartMasterID;
      const images = partImages.find(
        (image) => image.PartMasterID === partMaster.PartMasterID
      ); // Get the first matching image

      return {
        // Include all attributes from AccPartMapModel
        PartModelID: subcategory.PartModelID,
        PartMasterID: subcategory.PartMasterID,
        ModelMasterID: subcategory.ModelMasterID,
        VariantID: subcategory.VariantID,
        AccCategoryID: subcategory.AccCategoryID,
        AccSubCategoryID: subcategory.AccSubCategoryID,
        MappingIsActive: subcategory.IsActive,
        MappingStatus: subcategory.Status,

        // Include all attributes from AccPartMaster
        ...partMaster.get({ plain: true }),

        // Include the PartImgUrl
        PartImgUrl: images ? images.PartImgUrl : null, // Add PartImgUrl field
      };
    });

    // Send the response with the combined result
    return res.status(200).json(result);
  } catch (err) {
    console.error("Error getting all Subcategories:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// exports.AddToWishlist = async (req, res) => {
//   try {
//     // Create a AccCategory
//     const wishlist = {
//       PartMasterID: req.body.PartMasterID,
//       BookingID: req.body.BookingID,
//       CustomerID: req.body.CustomerID,
//       QTY: req.body.QTY,
//       IsActive: req.body.IsActive || true,
//       Status: req.body.Status || "Active",
//       CreatedDate: req.body.CreatedDate || new Date(),
//       // ModifiedDate: req.body.ModifiedDate || new Date(),
//     };
//     // Save newwishlist in the database
//     const newwishlist = await AccWishlist.create(wishlist);
//     return res.status(200).json(newwishlist); // Send the newly created SKUMaster as response
//   } catch (err) {
//     console.error("Error creating newPartMaster:", err);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };
exports.AddToWishlist = async (req, res) => {
  try {
    const {
      PartMasterID,
      BookingID,
      CustomerID,
      QTY,
      IsActive,
      Status,
      CreatedDate,
    } = req.body;

    // Check if wishlist item with given PartMasterID and BookingID already exists
    const existingWishlist = await AccWishlist.findOne({
      where: { PartMasterID, BookingID },
    });

    if (existingWishlist) {
      // If it exists, update the existing wishlist item
      const updatedWishlist = await existingWishlist.update({
        CustomerID,
        QTY,
        IsActive: IsActive !== undefined ? IsActive : existingWishlist.IsActive,
        Status: Status || existingWishlist.Status,
        ModifiedDate: new Date(), // Only update ModifiedDate on update
      });
      return res.status(200).json(updatedWishlist); // Send the updated wishlist item as response
    } else {
      // If it does not exist, create a new wishlist item
      const newWishlist = await AccWishlist.create({
        PartMasterID,
        BookingID,
        CustomerID,
        QTY,
        IsActive: IsActive !== undefined ? IsActive : true,
        Status: Status || "Active",
        CreatedDate: CreatedDate || new Date(),
      });
      return res.status(201).json(newWishlist); // Send the newly created wishlist item as response
    }
  } catch (err) {
    console.error("Error in AddOrUpdateWishlist:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.GetAllWishListDataByCustomerID = async (req, res) => {
  try {
    const { CustomerID, BookingID } = req.query;
    if (!CustomerID || !BookingID) {
      return res
        .status(404)
        .json({ message: "Required CustomerID and BookingID" });
    }
    const wishlist = await AccWishlist.findAll({
      where: { CustomerID: CustomerID, BookingID: BookingID, Status: "Active" },
      include: [
        {
          model: db.accpartmaster,
          as: "WishPartmasterID",
          include: [
            {
              model: db.accpartimages,
              as: "PartMasterImages",
            },
          ],
        },
        {
          model: db.NewCarBookings,
          as: "WishBookingID",
        },
      ],
    });

    console.log(`Retrieved ${wishlist.length} part masters.`);

    if (wishlist.length === 0) {
      return res.status(404).json({ message: "No part masters found" });
    }
    return res.status(200).json(wishlist);
  } catch (error) {
    console.error("Error creating newPartWithModels:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.UpdateWishlist = async (req, res) => {
  try {
    const AccWishlistID = req.query.id; // Assuming the ID is passed as a URL parameter

    // Find the existing wishlist by ID
    const existingWishlist = await AccWishlist.findByPk(AccWishlistID);

    if (!existingWishlist) {
      return res.status(404).json({ message: "Wishlist item not found" });
    }

    // Prepare updated values
    const updatedWishlist = {
      PartMasterID: req.body.PartMasterID || existingWishlist.PartMasterID,
      BookingID: req.body.BookingID || existingWishlist.BookingID,
      CustomerID: req.body.CustomerID || existingWishlist.CustomerID,
      QTY: req.body.QTY || existingWishlist.QTY,
      IsActive:
        req.body.IsActive !== undefined
          ? req.body.IsActive
          : existingWishlist.IsActive,
      Status: req.body.Status || existingWishlist.Status,
      CreatedDate: existingWishlist.CreatedDate, // Should not be modified
      ModifiedDate: new Date(), // Automatically set ModifiedDate to current date
    };

    // Update the wishlist
    await existingWishlist.update(updatedWishlist);

    return res.status(200).json(existingWishlist); // Send the updated wishlist as response
  } catch (err) {
    console.error("Error updating wishlist:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.DeleteWishlist = async (req, res) => {
  try {
    const AccWishlistID = req.query.id; // Assuming the ID is passed as a URL parameter

    // Find the existing wishlist by ID
    const existingWishlist = await AccWishlist.findByPk(AccWishlistID);

    if (!existingWishlist) {
      return res.status(404).json({ message: "Wishlist item not found" });
    }

    // Delete the wishlist item
    await existingWishlist.destroy();

    return res
      .status(200)
      .json({ message: "Wishlist item deleted successfully" });
  } catch (err) {
    console.error("Error deleting wishlist:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.GetAllWishListDataByBranch = async (req, res) => {
  try {
    // Fetch the wishlist data
    const wishlist = await AccWishlist.findAll({
      attributes: ["AccWishlistID", "PartMasterID", "QTY"],
      include: [
        {
          model: db.accpartmaster,
          as: "WishPartmasterID",
          attributes: ["PartMasterID"],
        },
        {
          model: db.NewCarBookings,
          as: "WishBookingID",
          attributes: [
            "BookingID",
            "BookingNo",
            "ModelName",
            "VariantName",
            "Fuel",
            "BranchName",
            "Transmission",
            "ColourName",
          ],
        },
        {
          model: db.customermaster,
          as: "WishCustomerID",
          attributes: ["CustomerID", "Title", "FirstName", "LastName"],
        },
      ],
    });
    console.log(`Retrieved ${wishlist.length} wishlist items.`);
    const itemCount = wishlist.length;
    if (wishlist.length === 0) {
      return res.status(404).json({ message: "No wishlist items found" });
    }
    // Extract the CustomerIDs from wishlist
    const customerIds = wishlist.map((item) => item.WishCustomerID.CustomerID);
    // Fetch details from custmap table for corresponding CustomerIDs
    const customerMaps = await custmap.findAll({
      where: {
        CustomerID: customerIds, // Find all records where CustomerID is in the list
      },
    });
    // Extract the EmpIDs from customerMaps
    const empIds = customerMaps.map((item) => item.EmpID);
    // Fetch details from UserMaster table for corresponding EmpIDs
    const userMaps = await UserMaster.findAll({
      where: {
        UserID: empIds, // Find all records where UserID matches EmpID from customerMaps
      },
      attributes: ["UserID", "UserName", "EmpID"],
    });
    // Map the custmap and userMaps data into the corresponding wishlist entries
    const wishlistWithDetails = wishlist.map((wishlistItem) => {
      const customerMap = customerMaps.find(
        (custMap) =>
          custMap.CustomerID === wishlistItem.WishCustomerID.CustomerID
      );
      const userMap = customerMap
        ? userMaps.find((userMap) => userMap.UserID === customerMap.EmpID)
        : null;

      // const partcount = wishlistItem.WishBookingID.BookingID;
      // console.log(".....", partcount);
      // Merge all fields into a single JSON object
      return {
        AccWishlistID: wishlistItem.AccWishlistID,
        PartMasterID: wishlistItem.PartMasterID,
        QTY: wishlistItem.QTY,
        PartDetails: wishlistItem.WishPartmasterID
          ? wishlistItem.WishPartmasterID.toJSON()
          : null,
        BookingDetails: wishlistItem.WishBookingID
          ? wishlistItem.WishBookingID.toJSON()
          : null,
        CustomerDetails: wishlistItem.WishCustomerID
          ? wishlistItem.WishCustomerID.toJSON()
          : null,
        // CustomerMap: customerMap ? customerMap.toJSON() : null,
        SalesPerson: userMap ? userMap.toJSON() : null,
        TotalParts: itemCount,
        Status: "Booked",
        CarImageUrl:
          "/var/www/html/IMAGES_VMS_MARUTI/ModelMasterImages/CE_CELERIO.jpg",
      };
    });
    return res.status(200).json(wishlistWithDetails);
  } catch (error) {
    console.error(
      "Error retrieving wishlist data with custmap and userMaps:",
      error
    );
    return res.status(500).json({ message: "Internal server error" });
  }
};

// exports.AddAccCart = async (req, res) => {
//   try {
//     // Create a AccCart
//     const accCart = {
//       PartMasterID: req.body.PartMasterID,
//       DiscountType: req.body.DiscountType,
//       DiscountValue: req.body.DiscountValue,
//       DiscountPercentage: req.body.DiscountPercentage,
//       BookingID: req.body.BookingID,
//       CustomerID: req.body.CustomerID,
//       QTY: req.body.QTY,
//       IsActive: req.body.IsActive || true,
//       Status: req.body.Status || "Active",
//       CreatedDate: req.body.CreatedDate || new Date(),
//       // ModifiedDate: req.body.ModifiedDate || new Date(),
//     };
//     // Save AccCart in the database
//     const newcart = await AccCart.create(accCart);
//     return res.status(200).json(newcart);
//   } catch (error) {
//     console.error("Error occurred while creating DealerTransfer:", error);
//     // Handle errors based on specific types

//     if (error.name === "SequelizeUniqueConstraintError") {
//       // Handle unique constraint errors
//       return res.status(400).json({
//         message: "Unique constraint error",
//         details: error.errors.map((e) => e.message),
//       });
//     }

//     if (error.name === "SequelizeDatabaseError") {
//       // Handle database errors
//       return res.status(500).json({
//         message: "Database error occurred while creating AccCart.",
//         details: error.message,
//       });
//     }

//     if (error.name === "SequelizeConnectionError") {
//       // Handle connection errors
//       return res.status(503).json({
//         message: "Service unavailable. Unable to connect to the database.",
//         details: error.message,
//       });
//     }

//     // Determine error type and send appropriate response
//     if (error.name === "SequelizeValidationError") {
//       res.status(400).json({
//         message: "Validation error occurred while creating DealerTransfer.",
//         errors: error.errors,
//       });
//     } else {
//       res.status(500).json({
//         message:
//           "Internal server error occurred while creating DealerTransfer.",
//       });
//     }
//   }
// };

exports.GetAllAccCartByCustID = async (req, res) => {
  try {
    const { BookingID, CustomerID } = req.body;

    const allCarts = await AccCart.findAll({
      where: { CustomerID: CustomerID, BookingID: BookingID },
      include: [
        {
          model: db.accpartmaster,
          as: "AccPartmasterID",
          include: [
            {
              model: db.accpartimages,
              as: "PartMasterImages",
            },
          ],
        },
      ],
    });

    // Handle empty response (no carts found)
    if (allCarts.length === 0) {
      return res.status(404).json({
        message: "No carts found for the provided BookingID and CustomerID.",
      });
    }

    const allotmentData = await VehicleAllotment.findOne({
      where: { BookingID: BookingID, AllotmentStatus: "Allotted" },
    });
    const AllotmentID = allotmentData ? allotmentData.AllotmentReqID : null;
    // Check if all CartStatus are 'Approved'
    const allApproved = allCarts.every(
      (cart) => cart.toJSON().CartStatus === "Approved"
    );

    // Add 'WholeCartStatus' based on whether all CartStatus are 'Approved'
    const WholeCartStatus = allApproved ? "Approved" : "Pending";

    // Return the response with WholeCartStatus and allCarts
    return res.status(200).json({ WholeCartStatus, AllotmentID, allCarts });
  } catch (error) {
    console.error("Error occurred while creating DealerTransfer:", error);
    // Handle errors based on specific types

    if (error.name === "SequelizeUniqueConstraintError") {
      // Handle unique constraint errors
      return res.status(400).json({
        message: "Unique constraint error",
        details: error.errors.map((e) => e.message),
      });
    }

    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while get AccCart.",
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

    // Determine error type and send appropriate response
    if (error.name === "SequelizeValidationError") {
      res.status(400).json({
        message: "Validation error occurred while creating DealerTransfer.",
        errors: error.errors,
      });
    } else {
      res.status(500).json({
        message:
          "Internal server error occurred while creating DealerTransfer.",
      });
    }
  }
};

exports.AddAccCart = async (req, res) => {
  try {
    // Create an AccCart object
    const accCart = {
      PartMasterID: req.body.PartMasterID,
      DiscountType: req.body.DiscountType,
      DiscountValue: req.body.DiscountValue,
      DiscountPercentage: req.body.DiscountPercentage,
      BookingID: req.body.BookingID,
      CustomerID: req.body.CustomerID,
      RequestedBy: req.body.RequestedBy,
      QTY: req.body.QTY,
      AccOfferAmt: req.body.AccOfferAmt,
      IsActive: req.body.IsActive || true,
      Status: req.body.Status || "Active",
      CreatedDate: req.body.CreatedDate || new Date(),
    };

    // Save AccCart in the database
    const newcart = await AccCart.create(accCart);

    // Attempt to update AccWishlist Status to 'InActive' after successfully saving newcart
    try {
      await AccWishlist.update(
        { Status: "InActive" },
        {
          where: {
            CustomerID: req.body.CustomerID,
            PartMasterID: req.body.PartMasterID,
          },
        }
      );
    } catch (wishlistError) {
      console.error(
        "Error occurred while updating AccWishlist:",
        wishlistError
      );
      // Optionally: You can log or return a separate error if needed
    }

    // Return the created cart (regardless of whether the wishlist update succeeds)
    return res.status(200).json(newcart);
  } catch (error) {
    console.error("Error occurred while creating AccCart:", error);

    // Handle errors based on specific types
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        message: "Unique constraint error",
        details: error.errors.map((e) => e.message),
      });
    }

    if (error.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message: "Database error occurred while creating AccCart.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        message: "Validation error occurred while creating AccCart.",
        errors: error.errors,
      });
    } else {
      return res.status(500).json({
        message: "Internal server error occurred while creating AccCart.",
      });
    }
  }
};
exports.DeleteAccCart = async (req, res) => {
  try {
    const AccCartID = req.query.id; // Assuming the ID is passed as a URL parameter

    // Find the existing wishlist by ID
    const existingAcccart = await AccCart.findByPk(AccCartID);

    if (!existingAcccart) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    const wishlistdata = {
      PartMasterID: existingAcccart.PartMasterID,
      BookingID: existingAcccart.BookingID,
      CustomerID: existingAcccart.CustomerID,
      QTY: existingAcccart.QTY,
      Status: "Active",
    };
    const createwishlist = await AccWishlist.create(wishlistdata);
    // Delete the wishlist item
    await existingAcccart.destroy();
    return res
      .status(200)
      .json({ message: "Cart item deleted successfully", createwishlist });
  } catch (err) {
    console.error("Error deleting Cart:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
exports.UpdateCart = async (req, res) => {
  try {
    const AccCartID = req.query.id;
    const existingCaart = await AccCart.findByPk(AccCartID);
    if (!existingCaart) {
      return res.status(404).json({ message: "AccCartID not found" });
    }

    // Update AccCategory
    existingCaart.DiscountType =
      req.body.DiscountType || existingCaart.DiscountType;
    existingCaart.DiscountValue =
      req.body.DiscountValue ?? existingCaart.DiscountValue ?? 0;
    existingCaart.DiscountPercentage =
      req.body.DiscountPercentage ?? existingCaart.DiscountPercentage ?? 0;
    existingCaart.QTY = req.body.QTY ?? existingCaart.QTY ?? 0;
    existingCaart.IsActive = req.body.IsActive || existingCaart.IsActive;
    existingCaart.Status = req.body.Status || existingCaart.Status;
    existingCaart.ModifiedDate = new Date();

    // Save updated AccCategory
    await existingCaart.save();
    return res.status(200).json(existingCaart);
  } catch (error) {
    console.error("Error occurred while creating AccCart:", error);

    // Handle errors based on specific types
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        message: "Unique constraint error",
        details: error.errors.map((e) => e.message),
      });
    }

    if (error.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message: "Database error occurred while creating AccCart.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        message: "Validation error occurred while creating AccCart.",
        errors: error.errors,
      });
    } else {
      return res.status(500).json({
        message: "Internal server error occurred while creating AccCart.",
      });
    }
  }
};

// TEST API
// exports.AccCarttoWishlist = async (req, res) => {
//   try {
//     const AccCartID = req.query.id; // Assuming the ID is passed as a URL parameter
//     const Status = req.query.CartStatus;

//     // Find the existing wishlist by ID
//     const existingAcccart = await AccCart.findByPk(AccCartID);

//     if (!existingAcccart) {
//       return res.status(404).json({ message: "Cart item not found" });
//     }

//     if (Status !== "Approved") {
//       const wishlistdata = {
//         PartMasterID: existingAcccart.PartMasterID,
//         BookingID: existingAcccart.BookingID,
//         CustomerID: existingAcccart.CustomerID,
//         QTY: existingAcccart.QTY,
//         Status: "Active",
//       };
//       const createwishlist = await AccWishlist.create(wishlistdata);
//       // Delete the wishlist item
//       await existingAcccart.destroy();
//       return res
//         .status(200)
//         .json({ message: "Cart item deleted successfully", createwishlist });
//     }
//     // else {

//     // }
//   } catch (err) {
//     console.error("Error deleting Cart:", err);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };
exports.GetAllPartMasterData = async (req, res) => {
  try {
    // Fetch all Part Master data
    const partMasterData = await AccPartMaster.findAll({
      attributes: [
        "PartMasterID",
        "PartCode",
        "PartName",
        "AccCategoryID",
        "AccSubCategoryID",
        "MinQuantity",
        "Price",
        "Origin",
        "Specification",
        "Features",
        "UniverselModel",
        "FitmentStatus",
        "IsActive",
        "Status",
        "CreatedDate",
      ],
      include: [
        {
          model: AccCategory,
          as: "AccessoriesCategoryID",
          attributes: ["AccCategoryName"],
        },
        {
          model: AccSubCategory,
          as: "AccessoriesSubCategoryID",
          attributes: ["AccSubCategoryName"],
        },
      ],
      order: [["CreatedDate", "DESC"]],
    });

    // Check if data is empty
    if (!partMasterData || partMasterData.length === 0) {
      return res.status(404).json({
        message: "No Part Master data found.",
      });
    }

    // Extract all PartMasterIDs from partMasterData
    const partMasterIDs = partMasterData.map((item) => item.PartMasterID);

    // Fetch all images for the retrieved PartMasterIDs
    const partImages = await AccPartImages.findAll({
      where: { PartMasterID: partMasterIDs }, // Filter images by PartMasterIDs
      attributes: ["PartMasterID", "PartImgUrl"],
    });

    // Group images by PartMasterID
    const groupedImages = partImages.reduce((acc, image) => {
      if (!acc[image.PartMasterID]) {
        acc[image.PartMasterID] = [];
      }
      acc[image.PartMasterID].push(image.PartImgUrl);
      return acc;
    }, {});

    // Combine the Part Master data with the grouped images
    const combinedData = partMasterData.map((item) => ({
      PartMasterID: item.PartMasterID,
      PartCode: item.PartCode,
      PartName: item.PartName,
      AccCategoryID: item.AccCategoryID,
      AccCategoryName: item.AccessoriesCategoryID
        ? item.AccessoriesCategoryID.AccCategoryName
        : null,
      AccSubCategoryID: item.AccSubCategoryID,
      AccSubCategoryName: item.AccessoriesSubCategoryID
        ? item.AccessoriesSubCategoryID.AccSubCategoryName
        : null,
      MinQuantity: item.MinQuantity,
      Price: item.Price,
      Origin: item.Origin,
      Specification: item.Specification,
      Features: item.Features,
      UniverselModel: item.UniverselModel,
      FitmentStatus: item.FitmentStatus,
      IsActive: item.IsActive,
      Status: item.Status,
      CreatedDate: item.CreatedDate,
      Images: groupedImages[item.PartMasterID] || [], // Include grouped images
    }));

    // Send the combined data as response
    res.json(combinedData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message: "Database error occurred while retrieving part master data.",
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
    console.error("Error retrieving part master data:", error);
    return res.status(500).json({
      message: "Failed to retrieve part master data. Please try again later.",
    });
  }
};
