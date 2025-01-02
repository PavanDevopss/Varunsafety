/* eslint-disable no-unused-vars */
const db = require("../models");
const ModelColourMappingModel = require("../models/ModelColourMapping.model");
const TeamMembersModel = require("../models/TeamMembers.model");
const {
  generateGRNNo,
  generateBIndentNo,
  generateBDCNo,
  generateDDCNo,
  genFinApplicationNumber,
  genRequestNo,
  generateAllotReqNo,
  genVehicleChangeReqNo,
  genAccApprovalReqNo,
  genAccIssueReqNo,
  genAccReturnReqNo,
  genAccJobOrderNo,
  genAccCartRemovalNo,
  genInvoiceNo,
  genDemoConvReqNo,
} = require("../Utils/generateService");
const VehicleStock = db.vehiclestock;
const BranchMaster = db.branchmaster;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;
const VariantMaster = db.variantmaster;
const ColourMaster = db.colourmaster;
const ModelMaster = db.modelmaster;
const SKUMaster = db.skumaster;
const ColourMapping = db.colourmapping;
const VendorMaster = db.vendormaster;
const FuelTypes = db.fueltypes;
const Transmission = db.transmission;
const UserMaster = db.usermaster;
const ModelType = db.modeltype;
const ChannelMaster = db.channelmaster;
const ColourCategory = db.colourcategory;
const BankMaster = db.bankmaster;
const RegionMaster = db.regionmaster;
const StateMaster = db.statemaster;
const FianceMaster = db.financemaster;
const DiscountMaster = db.discountmaster;
const ValueAddedService = db.valueaddedservice;
const FinanceMaster = db.financemaster;
const ModuleMaster = db.modulemaster;
const SubModule = db.submodule;
const DepartmentMaster = db.departmentmaster;
const IndustryMaster = db.industrymaster;
const FormsMaster = db.formsmaster;
const StatePOS = db.statepos;
const CompanyMaster = db.companymaster;
const CmpyStateMap = db.cmpystatemap;
const OEMMaster = db.oemmaster;
const CompanyGSTMaster = db.companygstmaster;
const VariantMapping = db.variantmapping;
const ModelColourMapping = db.modelcolourmapping;
const DocumentTypes = db.documenttypes;
const Teams = db.teams;
const TeamMembers = db.teammembers;
const RoleMaster = db.rolesmaster;
const AccCategory = db.acccategory;
const AccSubCategory = db.accsubcategory;
const MasterProducts = db.masterproducts;
const BranchType = db.branchtypes;
const CompanyStates = db.companystates;
const CompanyRegions = db.companyregions;

// Get ID, Code, Name, OEMStore Name from Branch Master Table
exports.GetAllBranchNames = async (req, res) => {
  try {
    // Fetch branch names
    const data = await BranchMaster.findAll({
      attributes: [
        "BranchID",
        "BranchCode",
        "BranchName",
        "OEMStoreName",
        // "RegionID",
        "GSTIN",
      ],
      order: [
        ["BranchName", "ASC"], // Order by BranchName in ascending order
      ],
    });

    // Check if data is empty
    if (!data || data.length === 0) {
      return res.status(404).json({
        message: "No branch names found.",
      });
    }

    // Send the branch names as response
    res.json(data);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      console.error("Database error:", error);
      return res.status(500).json({
        message: "Database error occurred while retrieving branch names.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      // Handle connection errors
      console.error("Connection error:", error);
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeValidationError") {
      // Handle validation errors
      console.error("Validation error:", error);
      return res.status(400).json({
        message: "Validation error occurred while retrieving branch names.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeTimeoutError") {
      // Handle timeout errors
      console.error("Timeout error:", error);
      return res.status(504).json({
        message: "Request timeout while retrieving branch names.",
        details: error.message,
      });
    }
    // Handle errors
    console.error("Error retrieving branch names:", error);
    res.status(500).json({
      message: "Failed to retrieve branch names. Please try again later.",
      details: error.message,
    });
  }
};

// Get ID, Vendor Name  from Vendor Master Table
exports.GetAllVendorNames = async (req, res) => {
  try {
    // Fetch vendor names
    const data = await VendorMaster.findAll({
      attributes: ["VendorMasterID", "VendorName", "GSTID"],
      order: [
        ["VendorName", "ASC"], // Order by VendorName in ascending order
      ],
    });

    // Check if data is empty
    if (!data || data.length === 0) {
      return res.status(404).json({
        message: "No vendor names found.",
      });
    }

    // Send the vendor names as response
    res.json(data);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      console.error("Database error:", error);
      return res.status(500).json({
        message: "Database error occurred while retrieving vendor names.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      // Handle connection errors
      console.error("Connection error:", error);
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeValidationError") {
      // Handle validation errors
      console.error("Validation error:", error);
      return res.status(400).json({
        message: "Validation error occurred while retrieving vendor names.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeTimeoutError") {
      // Handle timeout errors
      console.error("Timeout error:", error);
      return res.status(504).json({
        message: "Request timeout while retrieving vendor names.",
        details: error.message,
      });
    }

    console.error("Error retrieving vendor names:", error);
    res.status(500).json({
      message: "Failed to retrieve vendor names. Please try again later.",
      details: error.message,
    });
  }
};

// Get Colour Code, Colour Description, CategoryName from Colour Master Table
exports.GetAllColourData = async (req, res) => {
  try {
    // Fetch colour data
    const data = await ColourMaster.findAll({
      attributes: ["ColourID", "ColourCode", "ColourDescription"],
      include: [
        {
          model: ColourCategory,
          as: "CMColourCategoryID",
          attributes: ["ColourCategoryName"],
        },
      ],
      order: [
        ["ColourDescription", "ASC"], // Order by ColourDescription in ascending order
      ],
    });

    // Check if data is empty
    if (!data || data.length === 0) {
      return res.status(404).json({
        message: "No colour data found.",
      });
    }

    // Map and flatten fields
    const mappedData = data.map((color) => ({
      ColourID: color.ColourID,
      ColourCode: color.ColourCode,
      ColourDescription: color.ColourDescription,
      ColourCategoryName: color.CMColourCategoryID
        ? color.CMColourCategoryID.ColourCategoryName
        : null,
      combined: `${color.ColourDescription} - ${color.ColourCode}`,
    }));

    // Send the mapped data as response
    res.json(mappedData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      console.error("Database error:", error);
      return res.status(500).json({
        message: "Database error occurred while retrieving colour data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      // Handle connection errors
      console.error("Connection error:", error);
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeValidationError") {
      // Handle validation errors
      console.error("Validation error:", error);
      return res.status(400).json({
        message: "Validation error occurred while retrieving colour data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeTimeoutError") {
      // Handle timeout errors
      console.error("Timeout error:", error);
      return res.status(504).json({
        message: "Request timeout while retrieving colour data.",
        details: error.message,
      });
    }
    console.error("Error retrieving colour data:", error);
    res.status(500).json({
      message: "Failed to retrieve colour data. Please try again later.",
      details: error.message,
    });
  }
};

// Get Variant Code, Variant ID and Transmission ID from Variant Master Table
exports.GetVariantData = async (req, res) => {
  try {
    // Fetch variant data
    const data = await VariantMaster.findAll({
      attributes: ["VariantID", "VariantCode", "TransmissionID"],
      order: [
        ["VariantCode", "ASC"], // Order by VariantCode in ascending order
      ],
    });

    // Check if data is empty
    if (!data || data.length === 0) {
      return res.status(404).json({
        message: "No variant data found.",
      });
    }

    // Send the variant data as response
    res.json(data);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      console.error("Database error:", error);
      return res.status(500).json({
        message: "Database error occurred while retrieving variant data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      // Handle connection errors
      console.error("Connection error:", error);
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeValidationError") {
      // Handle validation errors
      console.error("Validation error:", error);
      return res.status(400).json({
        message: "Validation error occurred while retrieving variant data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeTimeoutError") {
      // Handle timeout errors
      console.error("Timeout error:", error);
      return res.status(504).json({
        message: "Request timeout while retrieving variant data.",
        details: error.message,
      });
    }
    console.error("Error retrieving variant data:", error);
    res.status(500).json({
      message: "Failed to retrieve variant data. Please try again later.",
      details: error.message,
    });
  }
};

// Get ID, SKU Code from SKU Master Table
exports.GetSKUCodeData = async (req, res) => {
  try {
    // Fetch SKU codes
    const skuList = await SKUMaster.findAll({
      attributes: ["SKUID", "SKUCode"],
      order: [
        ["SKUCode", "ASC"], // Order by SKUCode in ascending order
      ],
    });

    // Check if skuList is empty
    if (!skuList || skuList.length === 0) {
      return res.status(404).send({
        message: "No SKU codes found.",
      });
    }

    // Send the SKU codes as response
    res.send(skuList);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      console.error("Database error:", error);
      return res.status(500).json({
        message: "Database error occurred while retrieving SKUcode data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      // Handle connection errors
      console.error("Connection error:", error);
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeValidationError") {
      // Handle validation errors
      console.error("Validation error:", error);
      return res.status(400).json({
        message: "Validation error occurred while retrieving SKUcode data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeTimeoutError") {
      // Handle timeout errors
      console.error("Timeout error:", error);
      return res.status(504).json({
        message: "Request timeout while retrieving SKUcode data.",
        details: error.message,
      });
    }
    console.error("Error retrieving SKUCode List:", error);
    res.status(500).send({
      message: "Failed to retrieve SKUCode List. Please try again later.",
      details: error.message,
    });
  }
};

// Get Fuel Type Name, Fuel Type ID, Fuel Code from Fuel Type Table
exports.GetFuelData = async (req, res) => {
  try {
    // Fetch SKU codes
    const fuelList = await FuelTypes.findAll({
      attributes: ["FuelTypeID", "FuelTypeName", "FuelCode"],
      order: [
        ["FuelCode", "ASC"], // Order by FuelCode in ascending order
      ],
    });

    // Check if skuList is empty
    if (!fuelList || fuelList.length === 0) {
      return res.status(404).send({
        message: "No Fuel types found.",
      });
    }

    const formattedData = fuelList.map((fuel) => ({
      FuelTypeID: fuel.FuelTypeID,
      FuelCode: fuel.FuelCode,
      FuelTypeName: fuel.FuelTypeName,
      combined: `${fuel.FuelTypeName} - ${fuel.FuelCode}`,
    }));
    // Send the formatted data as response
    res.json(formattedData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      console.error("Database error:", error);
      return res.status(500).json({
        message: "Database error occurred while retrieving fuel data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      // Handle connection errors
      console.error("Connection error:", error);
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeValidationError") {
      // Handle validation errors
      console.error("Validation error:", error);
      return res.status(400).json({
        message: "Validation error occurred while retrieving fuel data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeTimeoutError") {
      // Handle timeout errors
      console.error("Timeout error:", error);
      return res.status(504).json({
        message: "Request timeout while retrieving fuel data.",
        details: error.message,
      });
    }
    console.error("Error retrieving Fuel List:", error);
    res.status(500).send({
      message: "Failed to retrieve Fuel List. Please try again later.",
      details: error.message,
    });
  }
};

exports.GetTransmissionDataForSKU = async (req, res) => {
  try {
    // Find SKU details including VariantID
    const skuDetails = await SKUMaster.findOne({
      attributes: ["VariantID"],
      where: { SKUCode: req.body.SKUCode }, // Assuming you're passing SKU code as a parameter
    });

    if (!skuDetails) {
      return res.status(404).json({
        message: "SKU not found.",
      });
    }

    // Find TransmissionID using VariantID
    const variantDetails = await VariantMaster.findOne({
      attributes: ["TransmissionID"],
      where: { VariantID: skuDetails.VariantID },
    });

    if (!variantDetails) {
      return res.status(404).json({
        message: "Variant details not found.",
      });
    }

    // Find Transmission details using TransmissionID
    const transmissionDetails = await Transmission.findOne({
      attributes: ["TransmissionCode", "TransmissionDescription"],
      where: { TransmissionID: variantDetails.TransmissionID },
    });

    if (!transmissionDetails) {
      return res.status(404).json({
        message: "Transmission details not found.",
      });
    }

    // Send the transmission details as response
    res.json(transmissionDetails);
  } catch (error) {
    // Handle errors
    console.error("Error retrieving transmission data:", error);
    res.status(500).json({
      message: "Failed to retrieve transmission data. Please try again later.",
    });
  }
}; //no

// Generating GRN and exporting it
exports.GetCurrentGRN = async (req, res) => {
  try {
    // Call the generateGRN function from InTransitVehicles.controller.js
    const currentGRN = await genDemoConvReqNo();

    // Do something with the currentGRN if needed
    console.log("Current GRN:", currentGRN);

    // Return the currentGRN as the response
    return res.json({ currentGRN });
  } catch (error) {
    console.error("Error getting current GRN:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}; //no

exports.GetFromToSKULists = async (req, res) => {
  try {
    // Fetch branch names
    const branchNames = await BranchMaster.findAll({
      attributes: ["OEMStoreName"],
    });

    // Fetch vendor names
    const vendorNames = await VendorMaster.findAll({
      attributes: ["VendorName"],
    });

    // Fetch SKU codes
    const skuList = await SKUMaster.findAll({ attributes: ["SKUCode"] });

    // Check if data is empty
    if (
      (!branchNames || branchNames.length === 0) &&
      (!vendorNames || vendorNames.length === 0) &&
      (!skuList || skuList.length === 0)
    ) {
      return res.status(404).json({
        message: "No branch names, vendor names, or SKU codes found.",
      });
    }

    // Send the data as response
    res.json({ branchNames, vendorNames, skuList });
  } catch (error) {
    // Handle errors
    console.error("Error retrieving data:", error);
    res.status(500).json({
      message: "Failed to retrieve data. Please try again later.",
    });
  }
}; //no

//Get Vehicle data based on SKUCode for Add New Entry Page
exports.GetVehicleData = async (req, res) => {
  try {
    const skuCode = req.query.SKUCode;
    const vendorID = req.query.VendorID;
    const branchID = req.query.BranchID;
    console.log("sssssss", skuCode);

    // Fetch SKUMaster data
    const skuVehicleData = await SKUMaster.findOne({
      where: { SKUCode: skuCode },
      include: [
        {
          model: ModelMaster,
          as: "SKUMModelMasterID",
          attributes: ["ModelCode", "ModelDescription"],
        },
        {
          model: VariantMaster,
          as: "SKUMVariantID",
          attributes: ["VariantCode", "TransmissionID"],
          include: [
            {
              model: Transmission,
              as: "VMTransmissionID",
              attributes: ["TransmissionCode"],
            },
          ],
        },
        {
          model: FuelTypes,
          as: "SKUMFuelTypeID",
          attributes: ["FuelTypeName"],
        },
      ],
      attributes: [
        "VariantDescription",
        "SKUCode",
        "IGSTRate",
        "CESSRate",
        "DRF",
        "ModelMasterID",
        "VariantID",
        "FuelTypeID",
      ],
    });

    const vendorData = await VendorMaster.findOne({
      where: { VendorMasterID: vendorID },
    });
    const branchData = await BranchMaster.findOne({
      where: { BranchID: branchID },
    });

    var sameState = false;
    // Extract the first two letters of each string
    const vendorPrefix = vendorData.GSTID.slice(0, 2);
    const branchPrefix = branchData.GSTIN.slice(0, 2);
    var cgst = 0;
    var sgst = 0;
    // Compare the prefixes
    if (vendorPrefix === branchPrefix) {
      sameState = true;
      cgst = skuVehicleData.IGSTRate / 2;
      sgst = skuVehicleData.IGSTRate / 2;
      skuVehicleData.IGSTRate = 0;
    }

    // Call the generateGRN function from InTransitVehicles.controller.js
    // const currentGRN = await generateGRNNo();

    // Mapping and flattening fields
    const vehicleData = {
      VendorID: vendorData.VendorMasterID,
      VendorName: vendorData.VendorName,
      BranchID: branchData.BranchID,
      BranchName: branchData.BranchName,
      SKUCode: skuVehicleData.SKUCode,
      IGSTAmt: skuVehicleData.IGSTRate,
      CGSTAmt: cgst,
      SGSTAmt: sgst,
      CESSAmt: skuVehicleData.CESSRate,
      DRF: skuVehicleData.DRF,
      TransmissionID: skuVehicleData.SKUMVariantID
        ? skuVehicleData.SKUMVariantID.TransmissionID
        : null,
      TransmissionCode: skuVehicleData.SKUMVariantID
        ? skuVehicleData.SKUMVariantID.VMTransmissionID.TransmissionCode
        : null,
      ModelMasterID: skuVehicleData.ModelMasterID,

      ModelCode: skuVehicleData.SKUMModelMasterID
        ? skuVehicleData.SKUMModelMasterID.ModelCode
        : null,
      ModelDescription: skuVehicleData.SKUMModelMasterID
        ? skuVehicleData.SKUMModelMasterID.ModelDescription
        : null,
      VariantID: skuVehicleData.VariantID,
      VariantCode: skuVehicleData.SKUMVariantID
        ? skuVehicleData.SKUMVariantID.VariantCode
        : null,
      VariantDescription: skuVehicleData.VariantDescription,
      FuelTypeID: skuVehicleData.FuelTypeID,
      FuelType: skuVehicleData.SKUMFuelTypeID
        ? skuVehicleData.SKUMFuelTypeID.FuelTypeName
        : null,
      SameState: sameState,
      // GRNNo: currentGRN,
    };

    // Send all data together
    res.send(vehicleData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      console.error("Database error:", error);
      return res.status(500).json({
        message: "Database error occurred while retrieving vehicle data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      // Handle connection errors
      console.error("Connection error:", error);
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeValidationError") {
      // Handle validation errors
      console.error("Validation error:", error);
      return res.status(400).json({
        message: "Validation error occurred while retrieving vehicle data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeTimeoutError") {
      // Handle timeout errors
      console.error("Timeout error:", error);
      return res.status(504).json({
        message: "Request timeout while retrieving vehicle data.",
        details: error.message,
      });
    }
    console.error("Error fetching data:", error);
    res.status(500).json({
      message: "Failed to retrieve vehicle data. Please try again later.",
      details: error.message,
    });
  }
};

exports.GetBranchIndentsData = async (req, res) => {
  try {
    // Fetch branch names
    const branchNames = await BranchMaster.findAll({
      attributes: ["BranchID", "OEMStoreName"],
    });

    // Fetch Model data
    const modelDescription = await ModelMaster.findAll({
      attributes: ["ModelMasterID", "ModelDescription"],
    });

    // Fetch Variant type
    const variantType = await VariantMaster.findAll({
      attributes: ["VariantID", "VariantCode"],
    });

    // Fetch Colour type
    const colourType = await ColourMaster.findAll({
      attributes: ["ColourID", "ColourDescription"],
    });

    // Fetch Driver data
    const driverData = await UserMaster.findAll({
      attributes: ["UserID", "UserName", "EmpID", "Mobile"],
      where: { EmpID: req.body.EmpID },
    });

    // Check if data is empty
    if (
      (!branchNames || branchNames.length === 0) &&
      (!modelDescription || modelDescription.length === 0) &&
      (!variantType || variantType.length === 0) &&
      (!colourType || colourType.length === 0) &&
      (!driverData || driverData.length === 0)
    ) {
      return res.status(404).json({
        message:
          "No branch names, model Description, variant types, colour types or driver data found.",
      });
    }

    // Send the data as response
    res.json({
      branchNames,
      modelDescription,
      variantType,
      colourType,
      driverData,
    });
  } catch (error) {
    // Handle errors
    console.error("Error retrieving data:", error);
    res.status(500).json({
      message: "Failed to retrieve data. Please try again later.",
    });
  }
}; //no

// Get Model Type Name and Model Type Id form Model Type Table
exports.GetAllModelType = async (req, res) => {
  try {
    // Fetch model type data
    const modelTypeData = await ModelType.findAll({
      attributes: ["ModelTypeID", "ModelTypeName"],
      order: [
        ["ModelTypeName", "ASC"], // Order by ModelTypeName in ascending order
      ],
    });

    // Check if data is empty
    if (!modelTypeData || modelTypeData.length === 0) {
      return res.status(404).json({
        message: "No model types found.",
      });
    }

    // Send the branch names as response
    res.json(modelTypeData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      console.error("Database error:", error);
      return res.status(500).json({
        message: "Database error occurred while retrieving model data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      // Handle connection errors
      console.error("Connection error:", error);
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeValidationError") {
      // Handle validation errors
      console.error("Validation error:", error);
      return res.status(400).json({
        message: "Validation error occurred while retrieving model data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeTimeoutError") {
      // Handle timeout errors
      console.error("Timeout error:", error);
      return res.status(504).json({
        message: "Request timeout while retrieving model data.",
        details: error.message,
      });
    }
    // Handle errors
    console.error("Error retrieving model types:", error);
    res.status(500).json({
      message: "Failed to retrieve model types. Please try again later.",
      details: error.message,
    });
  }
};

// Get Channel Name and Channel ID from Channel Master
exports.GetAllChannelData = async (req, res) => {
  try {
    // Fetch channel data
    const channelData = await ChannelMaster.findAll({
      attributes: ["ChannelID", "ChannelName"],
      order: [
        ["ChannelName", "ASC"], // Order by ChannelName in ascending order
      ],
    });

    // Check if data is empty
    if (!channelData || channelData.length === 0) {
      return res.status(404).json({
        message: "No Channel data found.",
      });
    }

    // Send the branch names as response
    res.json(channelData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      console.error("Database error:", error);
      return res.status(500).json({
        message: "Database error occurred while retrieving channel data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      // Handle connection errors
      console.error("Connection error:", error);
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeValidationError") {
      // Handle validation errors
      console.error("Validation error:", error);
      return res.status(400).json({
        message: "Validation error occurred while retrieving channel data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeTimeoutError") {
      // Handle timeout errors
      console.error("Timeout error:", error);
      return res.status(504).json({
        message: "Request timeout while retrieving channel data.",
        details: error.message,
      });
    }
    // Handle errors
    console.error("Error retrieving channel data:", error);
    res.status(500).json({
      message: "Failed to retrieve channels data. Please try again later.",
      details: error.message,
    });
  }
};

// Get Transmission Code and Transmission ID from Transmission Table
exports.GetAllTransmissionData = async (req, res) => {
  try {
    // Fetch channel data
    const transmissionData = await Transmission.findAll({
      attributes: ["TransmissionID", "TransmissionCode"],
      order: [
        ["TransmissionCode", "ASC"], // Order by TransmissionCode in ascending order
      ],
    });

    // Check if data is empty
    if (!transmissionData || transmissionData.length === 0) {
      return res.status(404).json({
        message: "No Channel data found.",
      });
    }

    // Send the branch names as response
    res.json(transmissionData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      console.error("Database error:", error);
      return res.status(500).json({
        message: "Database error occurred while retrieving transmisssion data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      // Handle connection errors
      console.error("Connection error:", error);
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeValidationError") {
      // Handle validation errors
      console.error("Validation error:", error);
      return res.status(400).json({
        message:
          "Validation error occurred while retrieving transmisssion data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeTimeoutError") {
      // Handle timeout errors
      console.error("Timeout error:", error);
      return res.status(504).json({
        message: "Request timeout while retrieving transmisssion data.",
        details: error.message,
      });
    }
    // Handle errors
    console.error("Error retrieving channel data:", error);
    res.status(500).json({
      message: "Failed to retrieve channels data. Please try again later.",
      details: error.message,
    });
  }
};

// Get Colour Category Name and Colour Category ID from Colour Category table
exports.GetAllColourCategories = async (req, res) => {
  try {
    // Fetch channel data
    const colourCategoryData = await ColourCategory.findAll({
      attributes: ["ColourCategoryID", "ColourCategoryName"],
      order: [
        ["ColourCategoryName", "ASC"], // Order by ColourCategoryName in ascending order
      ],
    });

    // Check if data is empty
    if (!colourCategoryData || colourCategoryData.length === 0) {
      return res.status(404).json({
        message: "No Colour Category data found.",
      });
    }

    // Send the branch names as response
    res.json(colourCategoryData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      console.error("Database error:", error);
      return res.status(500).json({
        message:
          "Database error occurred while retrieving colourcategories data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      // Handle connection errors
      console.error("Connection error:", error);
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeValidationError") {
      // Handle validation errors
      console.error("Validation error:", error);
      return res.status(400).json({
        message:
          "Validation error occurred while retrieving colourcategories data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeTimeoutError") {
      // Handle timeout errors
      console.error("Timeout error:", error);
      return res.status(504).json({
        message: "Request timeout while retrieving colourcategories data.",
        details: error.message,
      });
    }
    // Handle errors
    console.error("Error retrieving colour category data:", error);
    res.status(500).json({
      message:
        "Failed to retrieve colour category data. Please try again later.",
      details: error.message,
    });
  }
};

// Get Model Master ID, Model Code and Model Description from Model Master Table
exports.GetAllModelData = async (req, res) => {
  try {
    // Fetch model data
    const modelData = await ModelMaster.findAll({
      attributes: ["ModelMasterID", "ModelCode", "ModelDescription"],
      order: [
        ["ModelDescription", "ASC"], // Order by ModelDescription in ascending order
      ],
    });

    // Check if data is empty
    if (!modelData || modelData.length === 0) {
      return res.status(404).json({
        message: "No Model data found.",
      });
    }

    // Map the data to the desired format
    const formattedData = modelData.map((model) => ({
      ModelID: model.ModelMasterID,
      ModelCode: model.ModelCode,
      ModelDescription: model.ModelDescription,
      combined: `${model.ModelDescription} - ${model.ModelCode}`,
    }));

    // Send the formatted data as response
    res.json(formattedData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      console.error("Database error:", error);
      return res.status(500).json({
        message: "Database error occurred while retrieving model data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      // Handle connection errors
      console.error("Connection error:", error);
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeValidationError") {
      // Handle validation errors
      console.error("Validation error:", error);
      return res.status(400).json({
        message: "Validation error occurred while retrieving model data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeTimeoutError") {
      // Handle timeout errors
      console.error("Timeout error:", error);
      return res.status(504).json({
        message: "Request timeout while retrieving model data.",
        details: error.message,
      });
    }

    // Handle other errors
    console.error("Error retrieving model data:", error);
    res.status(500).json({
      message: "Failed to retrieve model data. Please try again later.",
      details: error.message,
    });
  }
};

// Get Vehicle data based on Model ID from Model Master Table
exports.GetVehicleListByModelId = async (req, res) => {
  try {
    const modelId = req.body.ModelMasterID;
    // Fetch model data
    const vehicleDetails = await SKUMaster.findAll({
      attributes: [
        "SKUID",
        "SKUCode",
        "VariantID",
        "VariantDescription",
        "FuelTypeID",
      ],
      where: { ModelMasterID: modelId },
      include: [
        {
          model: VariantMaster,
          as: "SKUMVariantID",
          attributes: ["VariantID", "VariantCode"],
          include: [
            {
              model: Transmission,
              as: "VMTransmissionID",
              attributes: [
                "TransmissionID",
                "TransmissionCode",
                "TransmissionDescription",
              ],
            },
          ],
        },
        {
          model: FuelTypes,
          as: "SKUMFuelTypeID",
          attributes: ["FuelTypeID", "FuelTypeName", "FuelCode"],
        },
      ],
    });

    // Check if data is empty
    if (!vehicleDetails || vehicleDetails.length === 0) {
      return res.status(404).json({
        message: "No Model data found.",
      });
    }

    // Send the data as response
    res.json(vehicleDetails);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      console.error("Database error:", error);
      return res.status(500).json({
        message:
          "Database error occurred while retrieving vehicle list by model id data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      // Handle connection errors
      console.error("Connection error:", error);
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeValidationError") {
      // Handle validation errors
      console.error("Validation error:", error);
      return res.status(400).json({
        message:
          "Validation error occurred while retrieving vehicle list by model id data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeTimeoutError") {
      // Handle timeout errors
      console.error("Timeout error:", error);
      return res.status(504).json({
        message:
          "Request timeout while retrieving vehicle list by model id data.",
        details: error.message,
      });
    }
    // Handle errors
    console.error("Error retrieving vehicle list by model id data:", error);
    res.status(500).json({
      message:
        "Failed to retrieve vehicle list by model id data. Please try again later.",
    });
  }
};

// Get Bank ID, Bank Type and Bank Name from Bank Master Table
exports.GetAllBankData = async (req, res) => {
  try {
    // Fetch model data
    const bankData = await BankMaster.findAll({
      attributes: ["BankID", "BankName", "BankType"],
      order: [
        ["BankName", "ASC"], // Order by BankName in ascending order
      ],
    });

    // Check if data is empty
    if (!bankData || bankData.length === 0) {
      return res.status(404).json({
        message: "No Model data found.",
      });
    }

    // Send the data as response
    res.json(bankData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      console.error("Database error:", error);
      return res.status(500).json({
        message: "Database error occurred while retrieving bank data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      // Handle connection errors
      console.error("Connection error:", error);
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeValidationError") {
      // Handle validation errors
      console.error("Validation error:", error);
      return res.status(400).json({
        message: "Validation error occurred while retrieving bank data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeTimeoutError") {
      // Handle timeout errors
      console.error("Timeout error:", error);
      return res.status(504).json({
        message: "Request timeout while retrieving bank data.",
        details: error.message,
      });
    }
    // Handle errors
    console.error("Error retrieving bank data:", error);
    res.status(500).json({
      message: "Failed to retrieve bank data. Please try again later.",
      details: error.message,
    });
  }
};

// Get Bank ID, Bank Type and Bank Name from Bank Master Table
exports.GetAllRegionsByStateID = async (req, res) => {
  try {
    const id = req.query.ID;
    // Fetch model data
    const regionMaster = await RegionMaster.findAll({
      attributes: ["RegionID", "RegionName", "IsActive", "Status"],
      include: [
        {
          model: StateMaster,
          as: "RMStateID",
          attributes: ["StateID", "StateName"], // Include StateID and StateName attributes
        },
      ],
      where: { StateID: id },
      order: [
        ["RegionName", "ASC"], // Order by RegionName in ascending order
      ],
    });

    // Check if data is empty
    if (!regionMaster || regionMaster.length === 0) {
      return res.status(404).json({
        message: "No Model data found.",
      });
    }
    // Map the returned data to a JSON list
    const mappedRegions = regionMaster.map((region) => ({
      RegionID: region.RegionID,
      RegionName: region.RegionName,
      IsActive: region.IsActive,
      Status: region.Status,
      StateID: region.RMStateID.StateID,
      StateName: region.RMStateID.StateName,
    }));

    // Send the data as response
    res.json(mappedRegions);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      console.error("Database error:", error);
      return res.status(500).json({
        message: "Database error occurred while retrieving region data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      // Handle connection errors
      console.error("Connection error:", error);
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeValidationError") {
      // Handle validation errors
      console.error("Validation error:", error);
      return res.status(400).json({
        message: "Validation error occurred while retrieving region data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeTimeoutError") {
      // Handle timeout errors
      console.error("Timeout error:", error);
      return res.status(504).json({
        message: "Request timeout while retrieving region data.",
        details: error.message,
      });
    }
    // Handle errors
    console.error("Error retrieving region data:", error);
    res.status(500).json({
      message: "Failed to retrieve region data. Please try again later.",
      details: error.message,
    });
  }
};

// Get Model Master dropdown for mobile
exports.ModelDataMobile = async (req, res) => {
  try {
    // Fetch distinct ModelDescriptions ordered alphabetically
    const modelDescriptions = await ModelMaster.findAll({
      attributes: [
        [
          sequelize.fn("DISTINCT", sequelize.col("ModelDescription")),
          "ModelDescription",
        ],
      ],
      order: [
        ["ModelDescription", "ASC"], // Order by ModelDescription in ascending order
      ],
    });

    // Check if data is empty
    if (!modelDescriptions || modelDescriptions.length === 0) {
      return res.status(404).json({
        message: "No Model descriptions found.",
      });
    }
    // Mapping the results to the desired format
    const formattedData = modelDescriptions.map((item) => ({
      ModelName: item.ModelDescription, // Adjust the field name as needed
    }));

    // Send the data as response
    res.json(formattedData);
  } catch (error) {
    // Handle errors
    console.error("Error retrieving model descriptions:", error);
    res.status(500).json({
      message: "Failed to retrieve model descriptions. Please try again later.",
      details: error.message,
    });
  }
};

// Get Variant Master dropdown for mobile
exports.VariantDataMobile = async (req, res) => {
  try {
    // Fetch distinct VariantCodes ordered alphabetically
    const variantCodes = await VariantMaster.findAll({
      attributes: [
        [sequelize.fn("DISTINCT", sequelize.col("VariantCode")), "VariantCode"],
      ],
      order: [
        ["VariantCode", "ASC"], // Order by VariantCode in ascending order
      ],
    });

    // Check if data is empty
    if (!variantCodes || variantCodes.length === 0) {
      return res.status(404).json({
        message: "No variant codes found.",
      });
    }

    // Mapping the results to the desired format
    const formattedData = variantCodes.map((item) => ({
      VariantCode: item.VariantCode,
    }));

    // Send the variant codes as response
    res.json(formattedData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      console.error("Database error:", error);
      return res.status(500).json({
        message: "Database error occurred while retrieving variant codes.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      // Handle connection errors
      console.error("Connection error:", error);
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeValidationError") {
      // Handle validation errors
      console.error("Validation error:", error);
      return res.status(400).json({
        message: "Validation error occurred while retrieving variant codes.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeTimeoutError") {
      // Handle timeout errors
      console.error("Timeout error:", error);
      return res.status(504).json({
        message: "Request timeout while retrieving variant codes.",
        details: error.message,
      });
    }

    // Handle other errors
    console.error("Error retrieving variant codes:", error);
    res.status(500).json({
      message: "Failed to retrieve variant codes. Please try again later.",
      details: error.message,
    });
  }
};

// Get Colour Master dropdown for mobile
exports.ColourDataMobile = async (req, res) => {
  try {
    // Fetch distinct ColourDescriptions ordered alphabetically
    const colourDescriptions = await ColourMaster.findAll({
      attributes: [
        [
          sequelize.fn("DISTINCT", sequelize.col("ColourDescription")),
          "ColourDescription",
        ],
      ],
      order: [
        ["ColourDescription", "ASC"], // Order by ColourDescription in ascending order
      ],
    });

    // Check if data is empty
    if (!colourDescriptions || colourDescriptions.length === 0) {
      return res.status(404).json({
        message: "No colour descriptions found.",
      });
    }

    // Mapping the results to the desired format
    const formattedData = colourDescriptions.map((item) => ({
      ColourDescription: item.ColourDescription,
    }));

    // Send the colour descriptions as response
    res.json(formattedData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      console.error("Database error:", error);
      return res.status(500).json({
        message:
          "Database error occurred while retrieving colour descriptions.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      // Handle connection errors
      console.error("Connection error:", error);
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeValidationError") {
      // Handle validation errors
      console.error("Validation error:", error);
      return res.status(400).json({
        message:
          "Validation error occurred while retrieving colour descriptions.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeTimeoutError") {
      // Handle timeout errors
      console.error("Timeout error:", error);
      return res.status(504).json({
        message: "Request timeout while retrieving colour descriptions.",
        details: error.message,
      });
    }

    // Handle other errors
    console.error("Error retrieving colour descriptions:", error);
    res.status(500).json({
      message:
        "Failed to retrieve colour descriptions. Please try again later.",
      details: error.message,
    });
  }
};

// Get Fuel Master dropdown for mobile
exports.FuelDataMobile = async (req, res) => {
  try {
    // Fetch distinct FuelTypeNames ordered alphabetically
    const fuelTypeNames = await FuelTypes.findAll({
      attributes: [
        [
          sequelize.fn("DISTINCT", sequelize.col("FuelTypeName")),
          "FuelTypeName",
        ],
      ],
      order: [
        ["FuelTypeName", "ASC"], // Order by FuelTypeName in ascending order
      ],
    });

    // Check if data is empty
    if (!fuelTypeNames || fuelTypeNames.length === 0) {
      return res.status(404).json({
        message: "No fuel types found.",
      });
    }

    // Mapping the results to the desired format
    const formattedData = fuelTypeNames.map((item) => ({
      FuelTypeName: item.FuelTypeName,
    }));

    // Send the fuel type names as response
    res.json(formattedData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      console.error("Database error:", error);
      return res.status(500).json({
        message: "Database error occurred while retrieving fuel types.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      // Handle connection errors
      console.error("Connection error:", error);
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeValidationError") {
      // Handle validation errors
      console.error("Validation error:", error);
      return res.status(400).json({
        message: "Validation error occurred while retrieving fuel types.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeTimeoutError") {
      // Handle timeout errors
      console.error("Timeout error:", error);
      return res.status(504).json({
        message: "Request timeout while retrieving fuel types.",
        details: error.message,
      });
    }

    // Handle other errors
    console.error("Error retrieving fuel types:", error);
    res.status(500).json({
      message: "Failed to retrieve fuel types. Please try again later.",
      details: error.message,
    });
  }
};

// Get transmission Master dropdown for mobile
exports.transmissionDataMobile = async (req, res) => {
  try {
    // Fetch distinct TransmissionCodes ordered alphabetically
    const transmissionCodes = await Transmission.findAll({
      attributes: [
        [
          sequelize.fn("DISTINCT", sequelize.col("TransmissionCode")),
          "TransmissionCode",
        ],
      ],
      order: [
        ["TransmissionCode", "ASC"], // Order by TransmissionCode in ascending order
      ],
    });

    // Check if data is empty
    if (!transmissionCodes || transmissionCodes.length === 0) {
      return res.status(404).json({
        message: "No transmission codes found.",
      });
    }

    // Mapping the results to the desired format
    const formattedData = transmissionCodes.map((item) => ({
      TransmissionCode: item.TransmissionCode,
    }));

    // Send the transmission codes as response
    res.json(formattedData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      console.error("Database error:", error);
      return res.status(500).json({
        message: "Database error occurred while retrieving transmission codes.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      // Handle connection errors
      console.error("Connection error:", error);
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeValidationError") {
      // Handle validation errors
      console.error("Validation error:", error);
      return res.status(400).json({
        message:
          "Validation error occurred while retrieving transmission codes.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeTimeoutError") {
      // Handle timeout errors
      console.error("Timeout error:", error);
      return res.status(504).json({
        message: "Request timeout while retrieving transmission codes.",
        details: error.message,
      });
    }

    // Handle other errors
    console.error("Error retrieving transmission codes:", error);
    res.status(500).json({
      message: "Failed to retrieve transmission codes. Please try again later.",
      details: error.message,
    });
  }
};

// Get ID, Name from Discount Master Table
exports.GetAllDiscountNames = async (req, res) => {
  try {
    // Fetch Discount names
    const data = await DiscountMaster.findAll({
      attributes: ["DiscountID", "DiscountName"],
      order: [
        ["DiscountName", "ASC"], // Order by DiscountID in ascending order
      ],
    });

    // Check if data is empty
    if (!data || data.length === 0) {
      return res.status(404).json({
        message: "No discount names found.",
      });
    }

    // Send the discount names as response
    res.json(data);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      console.error("Database error:", error);
      return res.status(500).json({
        message: "Database error occurred while retrieving discount names.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      // Handle connection errors
      console.error("Connection error:", error);
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeValidationError") {
      // Handle validation errors
      console.error("Validation error:", error);
      return res.status(400).json({
        message: "Validation error occurred while retrieving discount names.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeTimeoutError") {
      // Handle timeout errors
      console.error("Timeout error:", error);
      return res.status(504).json({
        message: "Request timeout while retrieving dicount names.",
        details: error.message,
      });
    }
    // Handle errors
    console.error("Error retrieving discount names:", error);
    res.status(500).json({
      message: "Failed to retrieve discount names. Please try again later.",
      details: error.message,
    });
  }
};

// Get CESS and IGST Rates from SKU based on Vehicle details
exports.GetRatesFromSKU = async (req, res) => {
  try {
    // Fetch SKU data for IGSTRate and CESSRate
    const skuData = await SKUMaster.findOne({
      attributes: ["IGSTRate", "CESSRate"],
      where: {
        ModelMasterID: req.body.ModelID,
        VariantID: req.body.VariantID,
        FuelTypeID: req.body.FuelTypeID,
      },
    });

    // Check if data is empty
    if (!skuData || skuData.length === 0) {
      return res.status(404).json({
        message: "No skuData found.",
      });
    }

    // Extract rates from the fetched SKU data
    const { IGSTRate, CESSRate } = skuData;

    // Calculate TaxAmount and OfferAmount
    const MFGShare = req.body.MFGShare || 0;
    const DealerShare = req.body.DealerShare || 0;

    const TaxAmount = (MFGShare + DealerShare) * ((IGSTRate + CESSRate) / 100);
    const OfferAmount = MFGShare + DealerShare + TaxAmount;

    // Send the response with required parameters
    res.json({
      IGSTRate,
      CESSRate,
      TaxAmount,
      OfferAmount,
    });
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      console.error("Database error:", error);
      return res.status(500).json({
        message: "Database error occurred while retrieving discount names.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      // Handle connection errors
      console.error("Connection error:", error);
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeValidationError") {
      // Handle validation errors
      console.error("Validation error:", error);
      return res.status(400).json({
        message: "Validation error occurred while retrieving discount names.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeTimeoutError") {
      // Handle timeout errors
      console.error("Timeout error:", error);
      return res.status(504).json({
        message: "Request timeout while retrieving dicount names.",
        details: error.message,
      });
    }
    // Handle errors
    console.error("Error retrieving discount names:", error);
    res.status(500).json({
      message: "Failed to retrieve discount names. Please try again later.",
      details: error.message,
    });
  }
};

exports.GetAllBankNamesByBankType = async (req, res) => {
  try {
    const bankType = req.query.BankType;

    // Check if BankType is provided
    if (!bankType) {
      return res.status(400).json({ error: "BankType is required" });
    }

    // Query the BankMaster table for the given BankType
    const banks = await BankMaster.findAll({
      attributes: ["BankID", "BankName"], // Include BankID in the query
      where: {
        BankType: bankType,
      },
    });

    // Map the results to extract BankID and BankName
    const bankDetails = banks.map((bank) => ({
      BankID: bank.BankID,
      BankName: bank.BankName,
    }));

    return res.json({ bankDetails });
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      console.error("Database error:", error);
      return res.status(500).json({
        message: "Database error occurred while retrieving bank data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      // Handle connection errors
      console.error("Connection error:", error);
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeValidationError") {
      // Handle validation errors
      console.error("Validation error:", error);
      return res.status(400).json({
        message: "Validation error occurred while retrieving bank data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeTimeoutError") {
      // Handle timeout errors
      console.error("Timeout error:", error);
      return res.status(504).json({
        message: "Request timeout while retrieving bank data.",
        details: error.message,
      });
    }

    // Handle other errors
    console.error("Error retrieving bank data:", error);
    return res.status(500).json({
      message: "Failed to retrieve bank data. Please try again later.",
      details: error.message,
    });
  }
};

// Get ID, Name from Discount Master Table
exports.GetAllUserData = async (req, res) => {
  try {
    // Fetch User Data
    const data = await UserMaster.findAll({
      attributes: ["UserID", "UserName", "EmpID", "Mobile"],
      order: [
        ["UserName", "ASC"], // Order by DiscountID in ascending order
      ],
    });

    // Check if data is empty
    if (!data || data.length === 0) {
      return res.status(404).json({
        message: "No user data found.",
      });
    }

    // Send the discount names as response
    res.json(data);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      console.error("Database error:", error);
      return res.status(500).json({
        message: "Database error occurred while retrieving user data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      // Handle connection errors
      console.error("Connection error:", error);
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeValidationError") {
      // Handle validation errors
      console.error("Validation error:", error);
      return res.status(400).json({
        message: "Validation error occurred while retrieving user data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeTimeoutError") {
      // Handle timeout errors
      console.error("Timeout error:", error);
      return res.status(504).json({
        message: "Request timeout while retrieving user data.",
        details: error.message,
      });
    }
    // Handle errors
    console.error("Error retrieving user data:", error);
    res.status(500).json({
      message: "Failed to retrieve user data. Please try again later.",
      details: error.message,
    });
  }
};

// Get ID, Name form ValueAddedService table
exports.GetAllProductNames = async (req, res) => {
  try {
    // Fetch product names
    const data = await ValueAddedService.findAll({
      attributes: ["VASID", "ProductCode", "ProductName"],
      order: [
        ["ProductName", "ASC"], // Order by ProductName in ascending order
      ],
    });

    // Check if data is empty
    if (!data || data.length === 0) {
      return res.status(404).json({
        message: "No product names found.",
      });
    }

    // Send the product names as response
    res.json(data);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      console.error("Database error:", error);
      return res.status(500).json({
        message: "Database error occurred while retrieving product names.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      // Handle connection errors
      console.error("Connection error:", error);
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeValidationError") {
      // Handle validation errors
      console.error("Validation error:", error);
      return res.status(400).json({
        message: "Validation error occurred while retrieving product names.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeTimeoutError") {
      // Handle timeout errors
      console.error("Timeout error:", error);
      return res.status(504).json({
        message: "Request timeout while retrieving product names.",
        details: error.message,
      });
    }
    // Handle errors
    console.error("Error retrieving product names:", error);
    res.status(500).json({
      message: "Failed to retrieve product names. Please try again later.",
      details: error.message,
    });
  }
};

exports.GetAllFinanceByType = async (req, res) => {
  try {
    const financerType = req.query.FinancerType;

    // Check if BankType is provided
    if (!financerType) {
      return res.status(400).json({ error: "BankType is required" });
    }

    // Query the BankMaster table for the given BankType
    const financierData = await FinanceMaster.findAll({
      attributes: ["FinancierID", "FinancierName", "FinancierCode", "Location"], // Include BankID in the query
      where: {
        Category: financerType,
      },
    });

    return res.json({ financierData });
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      console.error("Database error:", error);
      return res.status(500).json({
        message: "Database error occurred while retrieving bank data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      // Handle connection errors
      console.error("Connection error:", error);
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeValidationError") {
      // Handle validation errors
      console.error("Validation error:", error);
      return res.status(400).json({
        message: "Validation error occurred while retrieving bank data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeTimeoutError") {
      // Handle timeout errors
      console.error("Timeout error:", error);
      return res.status(504).json({
        message: "Request timeout while retrieving bank data.",
        details: error.message,
      });
    }

    // Handle other errors
    console.error("Error retrieving bank data:", error);
    return res.status(500).json({
      message: "Failed to retrieve bank data. Please try again later.",
      details: error.message,
    });
  }
};

exports.GetAllSubModulesByParentModuleID = async (req, res) => {
  try {
    const { ParentModuleID } = req.query; // Extract ParentModuleID from request params

    // Validate request
    if (!ParentModuleID) {
      return res.status(400).json({
        message: "ParentModuleID is required.",
      });
    }

    // Fetch submodules based on ParentModuleID
    const subModules = await ModuleMaster.findAll({
      where: { ParentModuleID }, // Filter by ParentModuleID
      attributes: ["ModuleCode", "ModuleName", "ParentModuleID"],
      order: [["ModuleName", "ASC"]], // Optional: Order by module name
    });

    // Check if submodules exist
    if (!subModules || subModules.length === 0) {
      return res.status(404).json({
        message: `No submodules found for ParentModuleID: ${ParentModuleID}`,
      });
    }

    // Send the submodules as a response
    res.json(subModules);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while retrieving submodule data.",
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
    console.error("Error retrieving submodule data:", error);
    return res.status(500).json({
      message: "Failed to retrieve submodule data. Please try again later.",
    });
  }
};

exports.GetAllModuleNames = async (req, res) => {
  try {
    // Fetch ModuleName
    const data = await ModuleMaster.findAll({
      attributes: ["ModuleID", "ModuleCode", "ModuleName"],
      order: [
        ["ModuleName", "ASC"], // Order by ModuleName in ascending order
      ],
    });

    // Check if data is empty
    if (!data || data.length === 0) {
      return res.status(404).json({
        message: "No Module names found.",
      });
    }

    // Send the Module names as response
    res.json(data);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      console.error("Database error:", error);
      return res.status(500).json({
        message: "Database error occurred while retrieving Module names.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      // Handle connection errors
      console.error("Connection error:", error);
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeValidationError") {
      // Handle validation errors
      console.error("Validation error:", error);
      return res.status(400).json({
        message: "Validation error occurred while retrieving Module names.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeTimeoutError") {
      // Handle timeout errors
      console.error("Timeout error:", error);
      return res.status(504).json({
        message: "Request timeout while retrieving Module names.",
        details: error.message,
      });
    }
    // Handle errors
    console.error("Error retrieving Module names:", error);
    res.status(500).json({
      message: "Failed to retrieve Module names. Please try again later.",
      details: error.message,
    });
  }
};

exports.GetAllDepartmentNames = async (req, res) => {
  try {
    // Fetch DeptName
    const data = await DepartmentMaster.findAll({
      attributes: ["DeptID", "DeptCode", "DeptName"],
      order: [
        ["DeptName", "ASC"], // Order by DeptName in ascending order
      ],
    });

    // Check if data is empty
    if (!data || data.length === 0) {
      return res.status(404).json({
        message: "No department names found.",
      });
    }

    // Send the department names as response
    res.json(data);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      console.error("Database error:", error);
      return res.status(500).json({
        message: "Database error occurred while retrieving department names.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      // Handle connection errors
      console.error("Connection error:", error);
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeValidationError") {
      // Handle validation errors
      console.error("Validation error:", error);
      return res.status(400).json({
        message: "Validation error occurred while retrieving department names.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeTimeoutError") {
      // Handle timeout errors
      console.error("Timeout error:", error);
      return res.status(504).json({
        message: "Request timeout while retrieving department names.",
        details: error.message,
      });
    }
    // Handle errors
    console.error("Error retrieving department names:", error);
    res.status(500).json({
      message: "Failed to retrieve department names. Please try again later.",
      details: error.message,
    });
  }
};

exports.GetAllIndustryNames = async (req, res) => {
  try {
    // Fetch industry names
    const data = await IndustryMaster.findAll({
      attributes: ["IndustryID", "IndustryName"],
      order: [
        ["IndustryName", "ASC"], // Order by IndustryName in ascending order
      ],
    });

    // Check if data is empty
    if (!data || data.length === 0) {
      return res.status(404).json({
        message: "No industry names found.",
      });
    }

    // Send the industry names as response
    res.json(data);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      console.error("Database error:", error);
      return res.status(500).json({
        message: "Database error occurred while retrieving industry names.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      // Handle connection errors
      console.error("Connection error:", error);
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeValidationError") {
      // Handle validation errors
      console.error("Validation error:", error);
      return res.status(400).json({
        message: "Validation error occurred while retrieving industry names.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeTimeoutError") {
      // Handle timeout errors
      console.error("Timeout error:", error);
      return res.status(504).json({
        message: "Request timeout while retrieving industry names.",
        details: error.message,
      });
    }
    // Handle errors
    console.error("Error retrieving industry names:", error);
    res.status(500).json({
      message: "Failed to retrieve industry names. Please try again later.",
      details: error.message,
    });
  }
};
exports.GetAllFormNames = async (req, res) => {
  try {
    const id = req.query.ModuleID;
    // Fetch model data
    const formMaster = await FormsMaster.findAll({
      attributes: ["FormID", "FormCode", "FormName"],
      include: [
        {
          model: ModuleMaster,
          as: "FMModuleID",
          attributes: ["ModuleID", "ModuleName"], // Include ModuleID and ModuleName attributes
        },
      ],
      where: { ModuleID: id },
      order: [
        ["FormName", "ASC"], // Order by FormName in ascending order
      ],
    });

    // Check if data is empty
    if (!formMaster || formMaster.length === 0) {
      return res.status(404).json({
        message: "No form data found.",
      });
    }
    // Map the returned data to a JSON list
    const mappedForms = formMaster.map((form) => ({
      FormID: form.FormID,
      FormCode: form.FormCode,
      FormName: form.FormName,
      ModuleID: form.FMModuleID.ModuleID,
      ModuleName: form.FMModuleID.ModuleName,
    }));

    // Send the data as response
    res.json(mappedForms);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      console.error("Database error:", error);
      return res.status(500).json({
        message: "Database error occurred while retrieving form data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      // Handle connection errors
      console.error("Connection error:", error);
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeValidationError") {
      // Handle validation errors
      console.error("Validation error:", error);
      return res.status(400).json({
        message: "Validation error occurred while retrieving form data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeTimeoutError") {
      // Handle timeout errors
      console.error("Timeout error:", error);
      return res.status(504).json({
        message: "Request timeout while retrieving form data.",
        details: error.message,
      });
    }
    // Handle errors
    console.error("Error retrieving form data:", error);
    res.status(500).json({
      message: "Failed to retrieve form data. Please try again later.",
      details: error.message,
    });
  }
};

exports.GetAllBranchByRegionID = async (req, res) => {
  try {
    const id = req.query.ID;
    // Fetch model data
    const branchMaster = await BranchMaster.findAll({
      attributes: ["BranchID", "BranchCode", "BranchName"],
      include: [
        {
          model: RegionMaster,
          as: "BMRegionID",
          attributes: ["RegionID", "RegionName"], // Include StateID and StateName attributes
        },
      ],
      where: { RegionID: id },
      order: [
        ["BranchName", "ASC"], // Order by RegionName in ascending order
      ],
    });

    // Check if data is empty
    if (!branchMaster || branchMaster.length === 0) {
      return res.status(404).json({
        message: "No branch data found.",
      });
    }
    // Map the returned data to a JSON list
    const mappedBranch = branchMaster.map((branch) => ({
      BranchID: branch.BranchID,
      BranchCode: branch.BranchCode,
      BranchName: branch.BranchName,
      RegionID: branch.BMRegionID.RegionID,
      RegionName: branch.BMRegionID.RegionName,
    }));

    // Send the data as response
    res.json(mappedBranch);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      console.error("Database error:", error);
      return res.status(500).json({
        message: "Database error occurred while retrieving branch data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      // Handle connection errors
      console.error("Connection error:", error);
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeValidationError") {
      // Handle validation errors
      console.error("Validation error:", error);
      return res.status(400).json({
        message: "Validation error occurred while retrieving branch data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeTimeoutError") {
      // Handle timeout errors
      console.error("Timeout error:", error);
      return res.status(504).json({
        message: "Request timeout while retrieving branch data.",
        details: error.message,
      });
    }
    // Handle errors
    console.error("Error retrieving branch data:", error);
    res.status(500).json({
      message: "Failed to retrieve branch data. Please try again later.",
      details: error.message,
    });
  }
};

exports.createPOSNamesbyID = async (req, res) => {
  try {
    const posRequests = req.body; // Expecting an array of objects in the request body

    // Validate the request body
    if (!Array.isArray(posRequests) || posRequests.length === 0) {
      return res
        .status(400)
        .json({ message: "Request body must be a non-empty array." });
    }

    // Prepare an array to hold the results of all mapped POS
    const allMappedPOS = [];
    const cmpStateMapPromises = [];

    for (const { POSID, CompanyID } of posRequests) {
      // Validate the presence of POSID and CompanyID
      if (!POSID || !CompanyID) {
        return res
          .status(400)
          .json({ message: "Both POSID and CompanyID are required." });
      }

      // Fetch model data for the current POSID
      const pos = await StatePOS.findAll({
        attributes: ["StatePOSID", "POSID", "StateName"],
        where: { POSID: String(POSID) }, // Ensure POSID is a string
        order: [["StateName", "ASC"]],
      });

      // Check if data is empty
      if (!pos || pos.length === 0) {
        return res.status(404).json({
          message: `No form data found for POSID: ${POSID}.`,
        });
      }

      // Check if CompanyID exists in CompanyMaster
      const companyExists = await CompanyMaster.findOne({
        where: { CompanyID },
      });

      if (!companyExists) {
        return res.status(404).json({
          message: `CompanyID ${CompanyID} does not exist.`,
        });
      }

      // Save CompanyID and StatePOSID in CmpStateMap for each StatePOSID
      const stateMapCreationPromises = pos.map((item) =>
        CmpyStateMap.create({
          CompanyID: CompanyID,
          StatePOSID: item.StatePOSID,
        })
      );

      const createdStateMaps = await Promise.all(stateMapCreationPromises);

      // Fetch the CmpyStateMapID and other data after creation
      const mappedPOSWithStateMap = createdStateMaps.map((stateMap, index) => ({
        CmpyStateMapID: stateMap.CmpyStateMapID,
        CompanyID: stateMap.CompanyID,
        StatePOSID: pos[index].StatePOSID,
        POSID: pos[index].POSID,
        StateName: pos[index].StateName,
      }));

      allMappedPOS.push(...mappedPOSWithStateMap);
    }

    // Send the data as response
    res.json(allMappedPOS);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      console.error("Database error:", error);
      return res.status(500).json({
        message: "Database error occurred while retrieving POS data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      console.error("Connection error:", error);
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeValidationError") {
      console.error("Validation error:", error);
      return res.status(400).json({
        message: "Validation error occurred while retrieving POS data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeTimeoutError") {
      console.error("Timeout error:", error);
      return res.status(504).json({
        message: "Request timeout while retrieving POS data.",
        details: error.message,
      });
    }

    // General error handling
    console.error("Error retrieving POS data:", error);
    res.status(500).json({
      message: "Failed to retrieve POS data. Please try again later.",
      details: error.message,
    });
  }
};

exports.getAllParentModuleNames = async (req, res) => {
  try {
    // Fetch all module data
    const moduleData = await ModuleMaster.findAll({
      attributes: ["ModuleID", "ModuleName", "ParentModuleID"],
      order: [["ModuleName", "ASC"]], // Order by ModuleName in ascending order
    });

    // Check if data is empty
    if (!moduleData || moduleData.length === 0) {
      return res.status(404).json({
        message: "No module data found.",
      });
    }

    // Create a map for easy lookup of ParentModuleName
    const moduleMap = moduleData.reduce((map, item) => {
      map[item.ModuleID] = item; // Map each module by ModuleID
      return map;
    }, {});

    // Build the dropdown response
    const dropdownData = moduleData.map((item) => {
      const parentModule = item.ParentModuleID
        ? moduleMap[item.ParentModuleID] // Lookup parent module in the map
        : null;

      return {
        ModuleID: item.ModuleID,
        ModuleName: item.ModuleName,
        ParentModuleID: item.ParentModuleID,
        ParentModuleName: parentModule ? parentModule.ModuleName : null, // Get ParentModuleName if it exists
      };
    });

    // Send the dropdown data as a response
    res.json(dropdownData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while retrieving module data.",
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
    console.error("Error retrieving module data:", error);
    return res.status(500).json({
      message: "Failed to retrieve module data. Please try again later.",
    });
  }
};

exports.GetAllOEMNamesByCompanyID = async (req, res) => {
  try {
    const { CompanyID } = req.query;
    // Fetch oem names
    const data = await OEMMaster.findAll({
      where: { CompanyID },
      attributes: ["OEMID", "OEMName", "CompanyID"],
      order: [
        ["OEMName", "ASC"], // Order by OEMName in ascending order
      ],
    });

    // Check if data is empty
    if (!data || data.length === 0) {
      return res.status(404).json({
        message: "No oem names found.",
      });
    }

    // Send the oem names as response
    res.json(data);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      console.error("Database error:", error);
      return res.status(500).json({
        message: "Database error occurred while retrieving oem names.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      // Handle connection errors
      console.error("Connection error:", error);
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeValidationError") {
      // Handle validation errors
      console.error("Validation error:", error);
      return res.status(400).json({
        message: "Validation error occurred while retrieving oem names.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeTimeoutError") {
      // Handle timeout errors
      console.error("Timeout error:", error);
      return res.status(504).json({
        message: "Request timeout while retrieving oem names.",
        details: error.message,
      });
    }
    // Handle errors
    console.error("Error retrieving oem names:", error);
    res.status(500).json({
      message: "Failed to retrieve oem names. Please try again later.",
      details: error.message,
    });
  }
};

exports.GetAllGSTINByCompanyID = async (req, res) => {
  try {
    const { CompanyID } = req.query;
    // Fetch oem names
    const data = await CompanyGSTMaster.findAll({
      where: { CompanyID },
      attributes: ["CmpyGSTID", "GSTIN", "CompanyID"],
      order: [
        ["CmpyGSTID", "ASC"], // Order by CmpyGSTID in ascending order
      ],
    });

    // Check if data is empty
    if (!data || data.length === 0) {
      return res.status(404).json({
        message: "No gst found.",
      });
    }

    // Send the gst as response
    res.json(data);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      console.error("Database error:", error);
      return res.status(500).json({
        message: "Database error occurred while retrieving gst.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      // Handle connection errors
      console.error("Connection error:", error);
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeValidationError") {
      // Handle validation errors
      console.error("Validation error:", error);
      return res.status(400).json({
        message: "Validation error occurred while retrieving gst.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeTimeoutError") {
      // Handle timeout errors
      console.error("Timeout error:", error);
      return res.status(504).json({
        message: "Request timeout while retrieving gst.",
        details: error.message,
      });
    }
    // Handle errors
    console.error("Error retrieving gst:", error);
    res.status(500).json({
      message: "Failed to retrieve gst . Please try again later.",
      details: error.message,
    });
  }
};

exports.GetAllStatePOSCompanyID = async (req, res) => {
  try {
    const { CompanyID } = req.query;
    // Fetch oem names
    const data = await CmpyStateMap.findAll({
      where: { CompanyID },
      attributes: ["CmpyStateMapID", "CompanyID", "StatePOSID"],
      include: [
        {
          model: StatePOS,
          as: "CSMStatePOSID",
          attributes: ["StatePOSID", "POSID", "StateName"],
        },
      ],
      order: [
        ["CmpyStateMapID", "ASC"], // Order by CmpyStateMapID in ascending order
      ],
    });

    // Check if data is empty
    if (!data || data.length === 0) {
      return res.status(404).json({
        message: "No gst found.",
      });
    }
    const mappedData = data.map((item) => ({
      CmpyStateMapID: item.CmpyStateMapID,
      CompanyID: item.CompanyID,
      StatePOSID: item.StatePOSID,

      POSID: item.CSMStatePOSID.POSID,
      StateName: item.CSMStatePOSID.StateName,
    }));
    // Send the states as response
    res.json(mappedData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      console.error("Database error:", error);
      return res.status(500).json({
        message: "Database error occurred while retrieving states.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      // Handle connection errors
      console.error("Connection error:", error);
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeValidationError") {
      // Handle validation errors
      console.error("Validation error:", error);
      return res.status(400).json({
        message: "Validation error occurred while retrieving states.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeTimeoutError") {
      // Handle timeout errors
      console.error("Timeout error:", error);
      return res.status(504).json({
        message: "Request timeout while retrieving states.",
        details: error.message,
      });
    }
    // Handle errors
    console.error("Error retrieving states:", error);
    res.status(500).json({
      message: "Failed to retrieve states . Please try again later.",
      details: error.message,
    });
  }
};

exports.GetAllStatePOS = async (req, res) => {
  try {
    // Fetch all StatePOS data
    const data = await StatePOS.findAll({
      attributes: ["StatePOSID", "POSID", "StateName"],
      order: [["StatePOSID", "ASC"]], // Order by StatePOSID in ascending order
    });

    // Check if data is empty
    if (!data || data.length === 0) {
      return res.status(404).json({
        message: "No POSIDs found.",
      });
    }

    // Send the data as response
    res.json(data);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      console.error("Database error:", error);
      return res.status(500).json({
        message: "Database error occurred while retrieving POSIDs.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      console.error("Connection error:", error);
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeValidationError") {
      console.error("Validation error:", error);
      return res.status(400).json({
        message: "Validation error occurred while retrieving POSIDs.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeTimeoutError") {
      console.error("Timeout error:", error);
      return res.status(504).json({
        message: "Request timeout while retrieving POSIDs.",
        details: error.message,
      });
    }

    // General error handling
    console.error("Error retrieving POSIDs:", error);
    res.status(500).json({
      message: "Failed to retrieve POSIDs. Please try again later.",
      details: error.message,
    });
  }
};

exports.GetAllRegionByCompanyID = async (req, res) => {
  try {
    const { CompanyID } = req.query;
    // Fetch region names
    const data = await CompanyRegions.findAll({
      where: { CompanyID },
      attributes: ["CmpyRegionID", "CmpyRegionName", "CompanyID"],
      order: [
        ["CmpyRegionID", "ASC"], // Order by RegionName in ascending order
      ],
    });

    // Check if data is empty
    if (!data || data.length === 0) {
      return res.status(404).json({
        message: "No region names found.",
      });
    }

    // Send the region as response
    res.json(data);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      console.error("Database error:", error);
      return res.status(500).json({
        message: "Database error occurred while retrieving region names.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      // Handle connection errors
      console.error("Connection error:", error);
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeValidationError") {
      // Handle validation errors
      console.error("Validation error:", error);
      return res.status(400).json({
        message: "Validation error occurred while retrieving region names.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeTimeoutError") {
      // Handle timeout errors
      console.error("Timeout error:", error);
      return res.status(504).json({
        message: "Request timeout while retrieving region names.",
        details: error.message,
      });
    }
    // Handle errors
    console.error("Error retrieving region names:", error);
    res.status(500).json({
      message: "Failed to retrieve region names . Please try again later.",
      details: error.message,
    });
  }
};

exports.GetAllChannelByCompanyID = async (req, res) => {
  try {
    const { CompanyID } = req.query;
    // Fetch channel names
    const data = await ChannelMaster.findAll({
      where: { CompanyID },
      attributes: ["ChannelID", "ChannelName", "CompanyID"],
      order: [
        ["ChannelName", "ASC"], // Order by ChannelName in ascending order
      ],
    });

    // Check if data is empty
    if (!data || data.length === 0) {
      return res.status(404).json({
        message: "No channel names found.",
      });
    }

    // Send the channel as response
    res.json(data);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      console.error("Database error:", error);
      return res.status(500).json({
        message: "Database error occurred while retrieving channel names.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      // Handle connection errors
      console.error("Connection error:", error);
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeValidationError") {
      // Handle validation errors
      console.error("Validation error:", error);
      return res.status(400).json({
        message: "Validation error occurred while retrieving channel names.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeTimeoutError") {
      // Handle timeout errors
      console.error("Timeout error:", error);
      return res.status(504).json({
        message: "Request timeout while retrieving channel names.",
        details: error.message,
      });
    }
    // Handle errors
    console.error("Error retrieving channel names:", error);
    res.status(500).json({
      message: "Failed to retrieve channel names . Please try again later.",
      details: error.message,
    });
  }
};

exports.GetAllVariantsByModelID = async (req, res) => {
  try {
    const id = req.query.ModelID;
    // Fetch model data
    const variantMapping = await VariantMapping.findAll({
      where: { ModelMasterID: id },
      attributes: ["VariantMappingID", "ModelMasterID", "VariantID"],
      include: [
        {
          model: VariantMaster,
          as: "VMVariantID",
          attributes: ["VariantID", "VariantCode"], // Include StateID and StateName attributes
        },
      ],
      order: [
        ["VariantMappingID", "ASC"], // Order by RegionName in ascending order
      ],
    });

    // Check if data is empty
    if (!variantMapping || variantMapping.length === 0) {
      return res.status(404).json({
        message: "No Variant data found.",
      });
    }
    // Map the returned data to a JSON list
    const mappedVariantMapping = variantMapping.map((variant) => ({
      VariantMappingID: variant.VariantMappingID,
      ModelID: variant.ModelMasterID,
      VariantID: variant.VMVariantID.VariantID,
      VariantCode: variant.VMVariantID.VariantCode,
    }));

    // Send the data as response
    res.json(mappedVariantMapping);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      console.error("Database error:", error);
      return res.status(500).json({
        message: "Database error occurred while retrieving variant data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      // Handle connection errors
      console.error("Connection error:", error);
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeValidationError") {
      // Handle validation errors
      console.error("Validation error:", error);
      return res.status(400).json({
        message: "Validation error occurred while retrieving variant data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeTimeoutError") {
      // Handle timeout errors
      console.error("Timeout error:", error);
      return res.status(504).json({
        message: "Request timeout while retrieving variant data.",
        details: error.message,
      });
    }
    // Handle errors
    console.error("Error retrieving variant data:", error);
    res.status(500).json({
      message: "Failed to retrieve variant data. Please try again later.",
      details: error.message,
    });
  }
};

exports.GetAllTeamLeadsByBranchID = async (req, res) => {
  try {
    const id = req.query.BranchID;
    // Fetch user data
    const userMaster = await UserMaster.findAll({
      attributes: ["UserID", "UserName", "EmpID"],
      include: [
        {
          model: BranchMaster,
          as: "UMBranchID",
          attributes: ["BranchID", "BranchName"], // Include BranchID and BranchName attributes
        },
      ],
      where: { BranchID: id },
      order: [
        ["UserName", "ASC"], // Order by UserName in ascending order
      ],
    });

    // Check if data is empty
    if (!userMaster || userMaster.length === 0) {
      return res.status(404).json({
        message: "No User data found.",
      });
    }
    // Map the returned data to a JSON list
    const mappedUsers = userMaster.map((user) => ({
      UserID: user.UserID,
      UserName: user.UserName,
      EmpID: user.EmpID,
      BranchID: user.UMBranchID.BranchID,
      BranchName: user.UMBranchID.BranchName,
    }));

    // Send the data as response
    res.json(mappedUsers);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      console.error("Database error:", error);
      return res.status(500).json({
        message: "Database error occurred while retrieving user data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      // Handle connection errors
      console.error("Connection error:", error);
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeValidationError") {
      // Handle validation errors
      console.error("Validation error:", error);
      return res.status(400).json({
        message: "Validation error occurred while retrieving user data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeTimeoutError") {
      // Handle timeout errors
      console.error("Timeout error:", error);
      return res.status(504).json({
        message: "Request timeout while retrieving user data.",
        details: error.message,
      });
    }
    // Handle errors
    console.error("Error retrieving user data:", error);
    res.status(500).json({
      message: "Failed to retrieve user data. Please try again later.",
      details: error.message,
    });
  }
};

exports.GetAllColoursByVariantID = async (req, res) => {
  try {
    // Parse the VariantID and ModelID from query parameters to integers
    const id = parseInt(req.query.VariantID, 10); // Parse VariantID to integer
    const ids = parseInt(req.query.ModelID, 10); // Parse ModelID to integer
    // Fetch colour data
    const modelColourMapping = await ModelColourMapping.findAll({
      where: { VariantID: id, ModelMasterID: ids },
      attributes: [
        "ModelColourMappingID",
        "ModelMasterID",
        "VariantID",
        "ColourID",
      ],
      include: [
        {
          model: ColourMaster,
          as: "MCMColourID",
          attributes: ["ColourID", "ColourCode", "ColourDescription"], // Include ColourCode and ColourDescription attributes
        },
      ],
      order: [
        ["ModelColourMappingID", "ASC"], // Order by ModelColourMappingID in ascending order
      ],
    });

    // console.log(modelColourMapping);
    // Check if data is empty
    if (!modelColourMapping || modelColourMapping.length === 0) {
      return res.status(404).json({
        message: "No Variant data found.",
      });
    }
    // Map the returned data to a JSON list
    const mappedModelColourMapping = modelColourMapping.map((colour) => ({
      ModelColourMappingID: colour.ModelColourMappingID,
      ModelID: colour.ModelMasterID,
      VariantID: colour.VariantID,
      ColourID: colour.ColourID,
      ColourCode: colour.MCMColourID.ColourCode,
      ColourDescription: colour.MCMColourID.ColourDescription,
    }));

    // Send the data as response
    res.json(mappedModelColourMapping);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      console.error("Database error:", error);
      return res.status(500).json({
        message: "Database error occurred while retrieving colour data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      // Handle connection errors
      console.error("Connection error:", error);
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeValidationError") {
      // Handle validation errors
      console.error("Validation error:", error);
      return res.status(400).json({
        message: "Validation error occurred while retrieving colour data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeTimeoutError") {
      // Handle timeout errors
      console.error("Timeout error:", error);
      return res.status(504).json({
        message: "Request timeout while retrieving colour data.",
        details: error.message,
      });
    }
    // Handle errors
    console.error("Error retrieving colour data:", error);
    res.status(500).json({
      message: "Failed to retrieve colour data. Please try again later.",
      details: error.message,
    });
  }
};

exports.GetAllDocumentTypes = async (req, res) => {
  try {
    // Fetch DocumentTypes
    const data = await DocumentTypes.findAll({
      attributes: ["DocTypeID", "DocumentAs", "Doctype"],
      order: [
        ["DocTypeID", "ASC"], // Order by DocTypeID in ascending order
      ],
    });

    // Check if data is empty
    if (!data || data.length === 0) {
      return res.status(404).json({
        message: "No document types found.",
      });
    }

    // Send the DocumentTypes as response
    res.json(data);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      console.error("Database error:", error);
      return res.status(500).json({
        message: "Database error occurred while retrieving DocumentTypes.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      // Handle connection errors
      console.error("Connection error:", error);
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeValidationError") {
      // Handle validation errors
      console.error("Validation error:", error);
      return res.status(400).json({
        message: "Validation error occurred while retrieving DocumentTypes.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeTimeoutError") {
      // Handle timeout errors
      console.error("Timeout error:", error);
      return res.status(504).json({
        message: "Request timeout while retrieving DocumentTypes.",
        details: error.message,
      });
    }
    // Handle errors
    console.error("Error retrieving DocumentTypes:", error);
    res.status(500).json({
      message: "Failed to retrieve DocumentTypes. Please try again later.",
      details: error.message,
    });
  }
};

exports.GetAllRoleNames = async (req, res) => {
  try {
    const { DeptID } = req.query; // Assume DeptID is passed as a query parameter

    // Validate DeptID
    if (!DeptID) {
      return res.status(400).json({ message: "DeptID is required" });
    }

    // Fetch roles based on DeptID
    const data = await RoleMaster.findAll({
      attributes: ["RoleID", "RoleName"],
      include: [
        {
          model: DepartmentMaster,
          as: "RMDeptID",
          attributes: ["DeptID", "DeptCode", "DeptName"],
          where: { DeptID }, // Filter roles by DeptID
        },
      ],
      order: [["RoleID", "ASC"]], // Order by RoleID in ascending order
    });

    // Check if data is empty
    if (!data || data.length === 0) {
      return res.status(404).json({
        message: `No roles found for DeptID: ${DeptID}`,
      });
    }
    const mappedRole = data.map((role) => ({
      RoleID: role.RoleID,
      RoleName: role.RoleName,
      DeptID: role.RMDeptID.DeptID,
      DeptCode: role.RMDeptID.DeptCode,
      DeptName: role.RMDeptID.DeptName,
    }));

    // Send the data as response
    res.json(mappedRole);
    // Send the role data as response
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      console.error("Database error:", error);
      return res.status(500).json({
        message: "Database error occurred while retrieving roles.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      console.error("Connection error:", error);
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeValidationError") {
      console.error("Validation error:", error);
      return res.status(400).json({
        message: "Validation error occurred while retrieving roles.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeTimeoutError") {
      console.error("Timeout error:", error);
      return res.status(504).json({
        message: "Request timeout while retrieving roles.",
        details: error.message,
      });
    }
    // Handle generic errors
    console.error("Error retrieving roles:", error);
    res.status(500).json({
      message: "Failed to retrieve roles. Please try again later.",
      details: error.message,
    });
  }
};

exports.GetAllTeamsByDeptID = async (req, res) => {
  try {
    const id = req.query.ID;
    // Fetch model data
    const teams = await Teams.findAll({
      attributes: ["TeamID", "TeamName"],
      include: [
        {
          model: DepartmentMaster,
          as: "TDeptID",
          attributes: ["DeptID", "DeptName"], // Include DeptiD and DeptName attributes
        },
      ],
      where: { DeptID: id },
      order: [
        ["TeamName", "ASC"], // Order by TeamName in ascending order
      ],
    });

    // Check if data is empty
    if (!teams || teams.length === 0) {
      return res.status(404).json({
        message: "No teams data found.",
      });
    }
    // Map the returned data to a JSON list
    const mappedTeams = teams.map((team) => ({
      TeamID: team.TeamID,
      TeamName: team.TeamName,
      DeptID: team.TDeptID.DeptID,
      DeptName: team.TDeptID.DeptName,
    }));

    // Send the data as response
    res.json(mappedTeams);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      console.error("Database error:", error);
      return res.status(500).json({
        message: "Database error occurred while retrieving branch data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      // Handle connection errors
      console.error("Connection error:", error);
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeValidationError") {
      // Handle validation errors
      console.error("Validation error:", error);
      return res.status(400).json({
        message: "Validation error occurred while retrieving team data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeTimeoutError") {
      // Handle timeout errors
      console.error("Timeout error:", error);
      return res.status(504).json({
        message: "Request timeout while retrieving team data.",
        details: error.message,
      });
    }
    // Handle errors
    console.error("Error retrieving team data:", error);
    res.status(500).json({
      message: "Failed to retrieve team data. Please try again later.",
      details: error.message,
    });
  }
};

exports.GetAllEmployeIDsByBranchID = async (req, res) => {
  try {
    const id = req.query.ID;
    // Fetch employee data
    const employee = await UserMaster.findAll({
      attributes: ["UserID", "UserName", "EmpID", "Designation"],
      include: [
        {
          model: BranchMaster,
          as: "UMBranchID",
          attributes: ["BranchID", "BranchName"], // Include BranchID and BranchName attributes
        },
      ],
      where: { BranchID: id },
      order: [
        ["UserName", "ASC"], // Order by UserName in ascending order
      ],
    });

    // Check if data is empty
    if (!employee || employee.length === 0) {
      return res.status(404).json({
        message: "No employee data found.",
      });
    }
    // Map the returned data to a JSON list
    const mappedEmployee = employee.map((employee) => ({
      UserID: employee.UserID,
      UserName: employee.UserName,
      EmpID: employee.EmpID,
      Designation: employee.Designation,
      BranchID: employee.UMBranchID.BranchID,
      BranchName: employee.UMBranchID.BranchName,
    }));

    // Send the data as response
    res.json(mappedEmployee);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      console.error("Database error:", error);
      return res.status(500).json({
        message: "Database error occurred while retrieving Employee data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      // Handle connection errors
      console.error("Connection error:", error);
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeValidationError") {
      // Handle validation errors
      console.error("Validation error:", error);
      return res.status(400).json({
        message: "Validation error occurred while retrieving Employee data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeTimeoutError") {
      // Handle timeout errors
      console.error("Timeout error:", error);
      return res.status(504).json({
        message: "Request timeout while retrieving Employee data.",
        details: error.message,
      });
    }
    // Handle errors
    console.error("Error retrieving Employee data:", error);
    res.status(500).json({
      message: "Failed to retrieve Employee data. Please try again later.",
      details: error.message,
    });
  }
};

exports.GetAllSubCategoryByCategory = async (req, res) => {
  try {
    const id = req.query.ID;
    // Fetch employee data
    const accSubCategory = await AccSubCategory.findAll({
      attributes: ["AccSubCategoryID", "AccSubCategoryName"],
      include: [
        {
          model: AccCategory,
          as: "AccessoriesCategoryID",
          attributes: ["AccCategoryName", "AccCategoryID"], // Include AccCategoryID and AccCategoryName attributes
        },
      ],
      where: { AccCategoryID: id },
      order: [
        ["AccSubCategoryID", "ASC"], // Order by UserName in ascending order
      ],
    });

    // Check if data is empty
    if (!accSubCategory || accSubCategory.length === 0) {
      return res.status(404).json({
        message: "No accSubCategory data found.",
      });
    }
    // Map the returned data to a JSON list
    const mappedSubCategory = accSubCategory.map((accsubCategory) => ({
      AccSubCategoryID: accsubCategory.AccSubCategoryID,
      AccSubCategoryName: accsubCategory.AccSubCategoryName,
      AccCategoryID: accsubCategory.AccessoriesCategoryID.AccCategoryID,
      AccCategoryName: accsubCategory.AccessoriesCategoryID.AccCategoryName,
    }));

    // Send the data as response
    res.json(mappedSubCategory);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      console.error("Database error:", error);
      return res.status(500).json({
        message:
          "Database error occurred while retrieving accSubCategory data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      // Handle connection errors
      console.error("Connection error:", error);
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeValidationError") {
      // Handle validation errors
      console.error("Validation error:", error);
      return res.status(400).json({
        message:
          "Validation error occurred while retrieving accSubCategory data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeTimeoutError") {
      // Handle timeout errors
      console.error("Timeout error:", error);
      return res.status(504).json({
        message: "Request timeout while retrieving accSubCategory data.",
        details: error.message,
      });
    }
    // Handle errors
    console.error("Error retrieving accSubCategory data:", error);
    res.status(500).json({
      message:
        "Failed to retrieve accSubCategory data. Please try again later.",
      details: error.message,
    });
  }
};

// Branch Dropdown for inventory purchase upload
exports.GetAllDispatchBranch = async (req, res) => {
  try {
    // Fetch branch names
    const data = await BranchMaster.findAll({
      where: { BranchTypeID: 6 },
      attributes: [
        "BranchID",
        "BranchCode",
        "BranchName",
        "OEMStoreName",
        // "RegionID",
        "GSTIN",
      ],
      order: [
        ["BranchName", "ASC"], // Order by BranchName in ascending order
      ],
    });

    // Check if data is empty
    if (!data || data.length === 0) {
      return res.status(404).json({
        message: "No branch names found.",
      });
    }

    // Send the branch names as response
    res.json(data);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      console.error("Database error:", error);
      return res.status(500).json({
        message: "Database error occurred while retrieving branch names.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      // Handle connection errors
      console.error("Connection error:", error);
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeValidationError") {
      // Handle validation errors
      console.error("Validation error:", error);
      return res.status(400).json({
        message: "Validation error occurred while retrieving branch names.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeTimeoutError") {
      // Handle timeout errors
      console.error("Timeout error:", error);
      return res.status(504).json({
        message: "Request timeout while retrieving branch names.",
        details: error.message,
      });
    }
    // Handle errors
    console.error("Error retrieving branch names:", error);
    res.status(500).json({
      message: "Failed to retrieve branch names. Please try again later.",
      details: error.message,
    });
  }
};

exports.findonebyBranchID = async (req, res) => {
  try {
    const { BranchID } = req.query;
    // Fetch branch names
    const data = await BranchMaster.findOne({
      where: { BranchID },
      attributes: [
        "BranchID",
        "BranchCode",
        "BranchName",
        "State",
        "District",
        "Status",
      ],
      order: [
        ["BranchName", "ASC"], // Order by BranchName in ascending order
      ],
    });

    // Check if data is empty
    if (!data || data.length === 0) {
      return res.status(404).json({
        message: "No branch names found.",
      });
    }

    // Send the branch names as response
    res.json(data);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      console.error("Database error:", error);
      return res.status(500).json({
        message: "Database error occurred while retrieving branch names.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      // Handle connection errors
      console.error("Connection error:", error);
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeValidationError") {
      // Handle validation errors
      console.error("Validation error:", error);
      return res.status(400).json({
        message: "Validation error occurred while retrieving branch names.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeTimeoutError") {
      // Handle timeout errors
      console.error("Timeout error:", error);
      return res.status(504).json({
        message: "Request timeout while retrieving branch names.",
        details: error.message,
      });
    }
    // Handle errors
    console.error("Error retrieving branch names:", error);
    res.status(500).json({
      message: "Failed to retrieve branch names. Please try again later.",
      details: error.message,
    });
  }
};

exports.GetAllFormNamesByWeb = async (req, res) => {
  try {
    const id = req.query.ModuleID;

    // Fetch model data
    const formMaster = await FormsMaster.findAll({
      where: {
        FormInterface: "Web",
        ModuleID: id, // Combine conditions in the same `where` clause
      },
      attributes: ["FormID", "FormCode", "FormName", "FormInterface"],
      include: [
        {
          model: ModuleMaster,
          as: "FMModuleID",
          attributes: ["ModuleID", "ModuleName"], // Include ModuleID and ModuleName attributes
        },
      ],
      order: [["FormName", "ASC"]], // Order by FormName in ascending order
    });

    // Check if data is empty
    if (!formMaster || formMaster.length === 0) {
      return res.status(404).json({
        message: "No form data found.",
      });
    }

    // Map the returned data to a JSON list
    const mappedForms = formMaster.map((form) => ({
      FormID: form.FormID,
      FormCode: form.FormCode,
      FormName: form.FormName,
      FormInterface: form.FormInterface,
      ModuleID: form.FMModuleID?.ModuleID,
      ModuleName: form.FMModuleID?.ModuleName,
    }));

    // Send the data as response
    res.json(mappedForms);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      console.error("Database error:", error);
      return res.status(500).json({
        message: "Database error occurred while retrieving form data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      // Handle connection errors
      console.error("Connection error:", error);
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeValidationError") {
      // Handle validation errors
      console.error("Validation error:", error);
      return res.status(400).json({
        message: "Validation error occurred while retrieving form data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeTimeoutError") {
      // Handle timeout errors
      console.error("Timeout error:", error);
      return res.status(504).json({
        message: "Request timeout while retrieving form data.",
        details: error.message,
      });
    }

    // Handle other errors
    console.error("Error retrieving form data:", error);
    res.status(500).json({
      message: "Failed to retrieve form data. Please try again later.",
      details: error.message,
    });
  }
};

exports.GetAllFormNamesByMobile = async (req, res) => {
  try {
    const id = req.query.ModuleID;

    // Fetch model data
    const formMaster = await FormsMaster.findAll({
      where: {
        FormInterface: "Mobile",
        ModuleID: id, // Combine conditions in the same `where` clause
      },
      attributes: ["FormID", "FormCode", "FormName", "FormInterface"],
      include: [
        {
          model: ModuleMaster,
          as: "FMModuleID",
          attributes: ["ModuleID", "ModuleName"], // Include ModuleID and ModuleName attributes
        },
      ],
      order: [["FormName", "ASC"]], // Order by FormName in ascending order
    });

    // Check if data is empty
    if (!formMaster || formMaster.length === 0) {
      return res.status(404).json({
        message: "No form data found.",
      });
    }

    // Map the returned data to a JSON list
    const mappedForms = formMaster.map((form) => ({
      FormID: form.FormID,
      FormCode: form.FormCode,
      FormName: form.FormName,
      FormInterface: form.FormInterface,
      ModuleID: form.FMModuleID?.ModuleID,
      ModuleName: form.FMModuleID?.ModuleName,
    }));

    // Send the data as response
    res.json(mappedForms);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      console.error("Database error:", error);
      return res.status(500).json({
        message: "Database error occurred while retrieving form data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      // Handle connection errors
      console.error("Connection error:", error);
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeValidationError") {
      // Handle validation errors
      console.error("Validation error:", error);
      return res.status(400).json({
        message: "Validation error occurred while retrieving form data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeTimeoutError") {
      // Handle timeout errors
      console.error("Timeout error:", error);
      return res.status(504).json({
        message: "Request timeout while retrieving form data.",
        details: error.message,
      });
    }

    // Handle other errors
    console.error("Error retrieving form data:", error);
    res.status(500).json({
      message: "Failed to retrieve form data. Please try again later.",
      details: error.message,
    });
  }
};

exports.GetAllTeamLeadsByBranchIDforBooking = async (req, res) => {
  try {
    const id = req.query.BranchID;

    // Fetch team data
    const TeamData = await Teams.findAll({
      attributes: ["TeamName", "BranchID", "LeaderName", "TeamLeadID"],
      include: [
        {
          model: UserMaster,
          as: "TTeamLeadID", // Ensure this alias matches your Sequelize associations
          attributes: ["UserID", "UserName", "EmpID"],
        },
        {
          model: BranchMaster, // Include the BranchMaster model
          as: "TBranchID", // Ensure the alias matches the Sequelize association
          attributes: ["BranchName"],
        },
      ],
      where: { BranchID: id },
      order: [["TeamID", "ASC"]], // Order by TeamID in ascending order
    });

    // Check if data is empty
    if (!TeamData || TeamData.length === 0) {
      return res.status(404).json({
        message: "No team data found for the specified branch.",
      });
    }

    // Map the returned data to a JSON list
    const mappedTeams = TeamData.map((team) => ({
      UserID: team.TTeamLeadID?.UserID, // Safely access nested properties
      UserName: team.TTeamLeadID?.UserName,
      EmpID: team.TTeamLeadID?.EmpID,
      BranchName: team.TBranchID?.BranchName,
      TeamName: team.TeamName,
      LeaderName: team.LeaderName,
      TeamLeadID: team.TeamLeadID,
      BranchID: team.BranchID,
    }));

    // Send the data as response
    res.json(mappedTeams);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      console.error("Database error:", error);
      return res.status(500).json({
        message: "Database error occurred while retrieving team data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      console.error("Connection error:", error);
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeValidationError") {
      console.error("Validation error:", error);
      return res.status(400).json({
        message: "Validation error occurred while retrieving team data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeTimeoutError") {
      console.error("Timeout error:", error);
      return res.status(504).json({
        message: "Request timeout while retrieving team data.",
        details: error.message,
      });
    }

    // Handle unexpected errors
    console.error("Error retrieving team data:", error);
    res.status(500).json({
      message: "Failed to retrieve team data. Please try again later.",
      details: error.message,
    });
  }
};

exports.GetMasterProductsData = async (req, res) => {
  try {
    // Fetch variant data
    const data = await MasterProducts.findAll({
      attributes: [
        "MasterProdID",
        "ProductType",
        "ProductName",
        "ProductCost",
        "HSNValue",
        "CESSRate",
        "GSTRate",
        "IsActive",
        "Status",
        "CreatedDate",
        "ModifiedDate",
      ],
      order: [["MasterProdID", "DESC"]], // Order by MasterProdID in descending order
    });

    // Check if data is empty
    if (!data || data.length === 0) {
      return res.status(404).json({
        message: "No master products found.",
      });
    }

    // Send the variant data as response
    res.json(data);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      console.error("Database error:", error);
      return res.status(500).json({
        message: "Database error occurred while retrieving master products.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      // Handle connection errors
      console.error("Connection error:", error);
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeValidationError") {
      // Handle validation errors
      console.error("Validation error:", error);
      return res.status(400).json({
        message: "Validation error occurred while retrieving master products.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeTimeoutError") {
      // Handle timeout errors
      console.error("Timeout error:", error);
      return res.status(504).json({
        message: "Request timeout while retrieving master products.",
        details: error.message,
      });
    }
    console.error("Error retrieving master products:", error);
    res.status(500).json({
      message: "Failed to retrieve master products. Please try again later.",
      details: error.message,
    });
  }
};

exports.GetAllTMsByBranch = async (req, res) => {
  try {
    const { UserID, BranchID } = req.query; // Retrieve UserID and BranchID from request body
    // Fetch TeamID for the given UserID
    const userTeam = await TeamMembers.findOne({
      where: { UserID },
      attributes: ["TeamID"],
    });

    if (!userTeam) {
      return res.status(404).json({
        message: "User not found in any team.",
      });
    }

    const teamID = userTeam.TeamID; // Get the TeamID for the user

    const searchCondition = {
      ...(teamID ? { TeamID: teamID } : {}), // Only add TeamID if available
    };
    // Fetch all team members in the same TeamID and BranchID
    const teams = await TeamMembers.findAll({
      attributes: ["TeamID", "UserID", "EmpName", "EmpPosition"],
      include: [
        {
          model: UserMaster,
          as: "TMUserID",
          attributes: ["UserID", "EmpID", "UserName"],
        },
        {
          model: Teams,
          as: "TMTeamID",
          attributes: [
            "TeamID",
            "TeamName",
            "BranchID",
            "DeptID",
            "TeamLeadID",
            "LeaderName",
          ],
          include: [
            {
              model: UserMaster,
              as: "TTeamLeadID",
              attributes: ["UserID", "EmpID", "UserName"],
            },
          ],
          where: {
            ...(BranchID ? { BranchID } : {}), // Apply BranchID filter if provided
          },
        },
      ],
      where: searchCondition, // Apply the searchCondition for TeamID
      order: [["EmpName", "ASC"]], // Optional: Order by employee name or any other field
    });
    // Check if data is empty
    if (!teams || teams.length === 0) {
      return res.status(404).json({
        message: "No team members found for the given team and branch.",
      });
    }

    // Map the returned data to a JSON list
    const mappedTeams = teams.map((team) => ({
      TeamID: team.TeamID || null,
      EmpName: team.EmpName || null,
      EmpPosition: team.EmpPosition || null,
      UserID: team.TMUserID.UserID || null,
      UserName: team.TMUserID.UserName || null,
      UserEmpID: team.TMUserID.EmpID || null,
      TeamName: team.TMTeamID.TeamName || null,
      TeamLeadID: team.TMTeamID.TeamLeadID || null,
      TeamLeadEmpID: team.TMTeamID.TTeamLeadID.EmpID || null,
      TeamLeadName: team.TMTeamID.LeaderName || null,
      BranchID: team.TMTeamID.BranchID || null,
    }));

    // Send the data as response
    res.json(mappedTeams);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      console.error("Database error:", error);
      return res.status(500).json({
        message: "Database error occurred while retrieving branch data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      // Handle connection errors
      console.error("Connection error:", error);
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeValidationError") {
      // Handle validation errors
      console.error("Validation error:", error);
      return res.status(400).json({
        message: "Validation error occurred while retrieving team data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeTimeoutError") {
      // Handle timeout errors
      console.error("Timeout error:", error);
      return res.status(504).json({
        message: "Request timeout while retrieving team data.",
        details: error.message,
      });
    }
    // Handle errors
    console.error("Error retrieving team data:", error);
    res.status(500).json({
      message: "Failed to retrieve team data. Please try again later.",
      details: error.message,
    });
  }
};

// Get ID, Code, Name, Branch Name from Branch Master Table
exports.GetAllBranchTypes = async (req, res) => {
  try {
    // Fetch branch names
    const data = await BranchType.findAll({
      attributes: [
        "BranchTypeID",
        "BranchTypeName",
        "IsActive",
        "Status",
        // "RegionID",
        "CreatedDate",
      ],
      order: [
        ["BranchTypeName", "ASC"], // Order by BranchName in ascending order
      ],
    });

    // Check if data is empty
    if (!data || data.length === 0) {
      return res.status(404).json({
        message: "No branch names found.",
      });
    }

    // Send the branch names as response
    res.json(data);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      console.error("Database error:", error);
      return res.status(500).json({
        message: "Database error occurred while retrieving branch names.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      // Handle connection errors
      console.error("Connection error:", error);
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeValidationError") {
      // Handle validation errors
      console.error("Validation error:", error);
      return res.status(400).json({
        message: "Validation error occurred while retrieving branch names.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeTimeoutError") {
      // Handle timeout errors
      console.error("Timeout error:", error);
      return res.status(504).json({
        message: "Request timeout while retrieving branch names.",
        details: error.message,
      });
    }
    // Handle errors
    console.error("Error retrieving branch names:", error);
    res.status(500).json({
      message: "Failed to retrieve branch names. Please try again later.",
      details: error.message,
    });
  }
};

// Company States Dropdown
exports.GetAllCmpyStates = async (req, res) => {
  try {
    // Fetch all StatePOS data
    const data = await CompanyStates.findAll({
      attributes: [
        "CmpyStateID",
        "CmpyStateName",
        "IsActive",
        "Status",
        "CreatedDate",
      ],
      where: { IsActive: true },
      order: [["CmpyStateName", "ASC"]], // Order by StatePOSID in ascending order
    });

    // Check if data is empty
    if (!data || data.length === 0) {
      return res.status(404).json({
        message: "No CompanyStates found.",
      });
    }

    // Send the data as response
    res.json(data);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      console.error("Database error:", error);
      return res.status(500).json({
        message: "Database error occurred while retrieving CompanyStates.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      console.error("Connection error:", error);
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeValidationError") {
      console.error("Validation error:", error);
      return res.status(400).json({
        message: "Validation error occurred while retrieving CompanyStates.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeTimeoutError") {
      console.error("Timeout error:", error);
      return res.status(504).json({
        message: "Request timeout while retrieving CompanyStates.",
        details: error.message,
      });
    }

    // General error handling
    console.error("Error retrieving CompanyStates:", error);
    res.status(500).json({
      message: "Failed to retrieve CompanyStates. Please try again later.",
      details: error.message,
    });
  }
};

// Get Bank ID, Bank Type and Bank Name from Bank Master Table
exports.GetAllCmpyRegionsByStateID = async (req, res) => {
  try {
    const id = req.query.ID;
    // Fetch model data
    const regionMaster = await CompanyRegions.findAll({
      attributes: [
        "CmpyRegionID",
        "CmpyRegionName",
        "CmpyStateID",
        "StatePOSID",
        "CompanyID",
        "IsActive",
        "Status",
      ],
      include: [
        {
          model: CompanyStates,
          as: "CRCmpyStateID",
          attributes: ["CmpyStateID", "CmpyStateName"], // Include StateID and StateName attributes
        },
      ],
      where: { CmpyStateID: id },
      order: [
        ["CmpyRegionName", "ASC"], // Order by RegionName in ascending order
      ],
    });

    // Check if data is empty
    if (!regionMaster || regionMaster.length === 0) {
      return res.status(404).json({
        message: "No Model data found.",
      });
    }
    // Map the returned data to a JSON list
    const mappedRegions = regionMaster.map((region) => ({
      RegionID: region.CmpyRegionID,
      RegionName: region.CmpyRegionName,
      IsActive: region.IsActive,
      Status: region.Status,
      StateID: region.CRCmpyStateID ? region.CRCmpyStateID.CmpyStateID : null,
      StateName: region.CRCmpyStateID
        ? region.CRCmpyStateID.CmpyStateName
        : null,
    }));

    // Send the data as response
    res.json(mappedRegions);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      console.error("Database error:", error);
      return res.status(500).json({
        message: "Database error occurred while retrieving region data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      // Handle connection errors
      console.error("Connection error:", error);
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeValidationError") {
      // Handle validation errors
      console.error("Validation error:", error);
      return res.status(400).json({
        message: "Validation error occurred while retrieving region data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeTimeoutError") {
      // Handle timeout errors
      console.error("Timeout error:", error);
      return res.status(504).json({
        message: "Request timeout while retrieving region data.",
        details: error.message,
      });
    }
    // Handle errors
    console.error("Error retrieving region data:", error);
    res.status(500).json({
      message: "Failed to retrieve region data. Please try again later.",
      details: error.message,
    });
  }
};

exports.GetAllCompanies = async (req, res) => {
  try {
    // Fetch all StatePOS data
    const data = await CompanyMaster.findAll({
      attributes: [
        "CompanyID",
        "CompanyName",
        "ParentCmpyID",
        "IndustryID",
        "StateID",
        "IsActive",
        "Status",
        "CreatedDate",
      ],
      where: { IsActive: true },
      order: [["CompanyName", "ASC"]], // Order by StatePOSID in ascending order
    });

    // Check if data is empty
    if (!data || data.length === 0) {
      return res.status(404).json({
        message: "No CompanyMaster found.",
      });
    }

    // Send the data as response
    res.json(data);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      console.error("Database error:", error);
      return res.status(500).json({
        message: "Database error occurred while retrieving CompanyMaster.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      console.error("Connection error:", error);
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeValidationError") {
      console.error("Validation error:", error);
      return res.status(400).json({
        message: "Validation error occurred while retrieving CompanyMaster.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeTimeoutError") {
      console.error("Timeout error:", error);
      return res.status(504).json({
        message: "Request timeout while retrieving CompanyMaster.",
        details: error.message,
      });
    }

    // General error handling
    console.error("Error retrieving CompanyMaster:", error);
    res.status(500).json({
      message: "Failed to retrieve CompanyMaster. Please try again later.",
      details: error.message,
    });
  }
};

exports.GetAllStatePOS = async (req, res) => {
  try {
    // Fetch all StatePOS data
    const data = await StatePOS.findAll({
      attributes: [
        "StatePOSID",
        "POSID",
        "StateName",
        "IsActive",
        "Status",
        "CreatedDate",
      ],
      where: { IsActive: true },
      order: [["POSID", "ASC"]], // Order by StatePOSID in ascending order
    });

    // Check if data is empty
    if (!data || data.length === 0) {
      return res.status(404).json({
        message: "No StatePOS found.",
      });
    }

    // Send the data as response
    res.json(data);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      console.error("Database error:", error);
      return res.status(500).json({
        message: "Database error occurred while retrieving StatePOS.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      console.error("Connection error:", error);
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeValidationError") {
      console.error("Validation error:", error);
      return res.status(400).json({
        message: "Validation error occurred while retrieving StatePOS.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeTimeoutError") {
      console.error("Timeout error:", error);
      return res.status(504).json({
        message: "Request timeout while retrieving StatePOS.",
        details: error.message,
      });
    }

    // General error handling
    console.error("Error retrieving StatePOS:", error);
    res.status(500).json({
      message: "Failed to retrieve StatePOS. Please try again later.",
      details: error.message,
    });
  }
};
