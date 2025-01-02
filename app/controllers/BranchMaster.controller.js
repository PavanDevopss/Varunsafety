/* eslint-disable no-unused-vars */
const db = require("../models");
const BranchMaster = db.branchmaster;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;
const CompanyMaster = db.companymaster;
const BranchTypes = db.branchtypes;
const RegionMaster = db.regionmaster;
const CmpyRegion = db.companyregions;
const ChannelMaster = db.channelmaster;
const OEMMaster = db.oemmaster;
const CompanyGSTMaster = db.companygstmaster;
const StatePOS = db.statepos;

//Basic CRUD API for Vehicle Stock
exports.create = async (req, res) => {
  console.log("BranchName:", req.body.BranchName);

  try {
    // Validate request
    if (!req.body.BranchName) {
      return res.status(400).json({ message: "BranchName cannot be empty" });
    }
    if (!/^[a-zA-Z ]*$/.test(req.body.BranchName)) {
      console.log("Validation failed: BranchName contains special characters.");
      return res.status(400).json({
        message: "BranchName should contain only letters",
      });
    }

    // Check if BranchName already exists
    const existingModel = await BranchMaster.findOne({
      where: { BranchName: req.body.BranchName },
    });
    if (existingModel) {
      return res.status(400).json({ message: "BranchName already exists" });
    }

    // Create a BranchMaster without specifying BranchID
    const branchMaster = {
      BranchCode: req.body.BranchCode,
      BranchName: req.body.BranchName,
      OEMStoreName: req.body.OEMStoreName,
      CompanyID: req.body.CompanyID,
      BranchTypeID: req.body.BranchTypeID,
      RegionID: req.body.RegionID,
      CmpyRegionID: req.body.CmpyRegionID,
      StatePOSID: req.body.StatePOSID,
      CmpyStateID: req.body.CmpyStateID,
      OEMID: req.body.OEMID,
      CmpyGSTID: req.body.CmpyGSTID,
      ChannelID: req.body.ChannelID,
      Contact: req.body.Contact,
      Email: req.body.Email,
      MSILCode: req.body.MSILCode,
      DealerCode: req.body.DealerCode,
      CityCode: req.body.CityCode,
      StoreID: req.body.StoreID,
      StoreCode: req.body.StoreCode,
      LocationCode: req.body.LocationCode,
      SubLedger: req.body.SubLedger,
      GSTIN: req.body.GSTIN,
      State: req.body.State,
      District: req.body.District,
      Address: req.body.Address,
      PINCode: req.body.PINCode,
      IsActive: req.body.IsActive || true,
      Status: req.body.Status || "Active",
    };
    console.log("mapped data: ", branchMaster);

    // Save BranchMaster in the database
    const newBranchMaster = await BranchMaster.create(branchMaster);
    console.log("saved data: ", newBranchMaster);

    return res.status(201).json(newBranchMaster); // Send the newly created BranchMaster as response
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

    console.error("Error creating BranchMaster:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//Retrieve all stock from the database
exports.findAll = async (req, res) => {
  try {
    const branchData = await BranchMaster.findAll({
      attributes: [
        "BranchID",
        "BranchCode",
        "BranchName",
        "OEMStoreName",
        "CompanyID",
        "BranchTypeID",
        "RegionID",
        "ChannelID",
        "Contact",
        "Email",
        "MSILCode",
        "DealerCode",
        "CityCode",
        "StoreID",
        "StoreCode",
        "LocationCode",
        "SubLedger",
        "GSTIN",
        "State",
        "District",
        "Address",
        "PINCode",
        "OEMID",
        "CmpyGSTID",
        "CmpyStateID",
        "CmpyRegionID",
        "StatePOSID",
        "IsActive",
        "Status",
        "CreatedDate",
        "ModifiedDate",
      ],
      include: [
        {
          model: CompanyMaster,
          attributes: ["CompanyID", "CompanyName"], // Adjust the attributes as needed
          as: "BMCompanyID",
        },
        {
          model: BranchTypes,
          attributes: ["BranchTypeID", "BranchTypeName"], // Adjust the attributes as needed
          as: "BMBranchTypeID",
        },
        {
          model: RegionMaster,
          attributes: ["RegionID", "RegionName"], // Adjust the attributes as needed
          as: "BMRegionID",
        },
        {
          model: CmpyRegion,
          attributes: ["CmpyRegionID", "CmpyRegionName"], // Adjust the attributes as needed
          as: "BMCmpyRegionID",
        },
        {
          model: ChannelMaster,
          attributes: ["ChannelID", "ChannelName"], // Adjust the attributes as needed
          as: "BMChannelID",
        },
        {
          model: OEMMaster,
          attributes: ["OEMID", "OEMName"], // Adjust the attributes as needed
          as: "BMOEMID",
        },
        {
          model: CompanyGSTMaster,
          attributes: ["CmpyGSTID", "GSTIN"], // Adjust the attributes as needed
          as: "BMCmpyGSTID",
        },
        {
          model: StatePOS,
          attributes: ["StatePOSID", "POSID", "StateName"], // Adjust the attributes as needed
          as: "BMStatePOSID",
        },
      ],
      order: [
        ["BranchName", "ASC"], // Order by ModelDescription in ascending order
      ],
    });

    // Check if data is empty
    if (!branchData || branchData.length === 0) {
      return res.status(404).json({
        message: "No branch data found.",
      });
    }

    // Map the data for response
    const mappedData = branchData.map((item) => ({
      BranchID: item.BranchID,
      BranchCode: item.BranchCode,
      BranchName: item.BranchName,
      OEMStoreName: item.OEMStoreName,
      CompanyID: item.CompanyID,
      CompanyName: item.BMCompanyID ? item.BMCompanyID.CompanyName : null,
      BranchTypeID: item.BranchTypeID,
      BranchTypeName: item.BMBranchTypeID
        ? item.BMBranchTypeID.BranchTypeName
        : null,
      RegionID: item.RegionID,
      RegionName: item.BMRegionID ? item.BMRegionID.RegionName : null,
      CmpyRegionID: item.CmpyRegionID,
      CmpyRegionName: item.BMCmpyRegionID
        ? item.BMCmpyRegionID.CmpyRegionName
        : null,
      ChannelID: item.ChannelID,
      ChannelName: item.BMChannelID ? item.BMChannelID.ChannelName : null,
      Contact: item.Contact,
      Email: item.Email,
      MSILCode: item.MSILCode,
      DealerCode: item.DealerCode,
      CityCode: item.CityCode,
      StoreID: item.StoreID,
      StoreCode: item.StoreCode,
      LocationCode: item.LocationCode,
      SubLedger: item.SubLedger,
      GSTIN: item.GSTIN,
      State: item.State,
      District: item.District,
      Address: item.Address,
      PINCode: item.PINCode,
      OEMID: item.OEMID,
      CmpyGSTID: item.CmpyGSTID,
      StatePOSID: item.StatePOSID,
      OEMName: item.BMOEMID ? item.BMOEMID.OEMName : null,
      GSTINNumber: item.BMCmpyGSTID ? item.BMCmpyGSTID.GSTIN : null,
      POSID: item.BMStatePOSID ? item.BMStatePOSID.POSID : null,
      StateName: item.BMStatePOSID ? item.BMStatePOSID.StateName : null,
      IsActive: item.IsActive,
      Status: item.Status,
      CreatedDate: item.CreatedDate,
      ModifiedDate: item.ModifiedDate,
    }));

    // Send the mapped data as response
    res.json(mappedData);
  } catch (error) {
    // Handle errors
    console.error("Error retrieving branch data:", error);
    res.status(500).json({
      message: "Failed to retrieve branch data. Please try again later.",
      error: error.message,
    });
  }
};

// Find a single stock with an id
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;

    // Validate the ID parameter
    if (!id) {
      return res.status(400).json({
        message: "ID parameter is required.",
      });
    }

    // Fetch the branch data by primary key with included associations
    const branchData = await BranchMaster.findOne({
      where: {
        BranchID: id,
      },
      attributes: [
        "BranchID",
        "BranchCode",
        "BranchName",
        "OEMStoreName",
        "CompanyID",
        "BranchTypeID",
        "RegionID",
        "ChannelID",
        "Contact",
        "Email",
        "MSILCode",
        "DealerCode",
        "CityCode",
        "StoreID",
        "StoreCode",
        "LocationCode",
        "SubLedger",
        "GSTIN",
        "State",
        "District",
        "Address",
        "PINCode",
        "OEMID",
        "CmpyGSTID",
        "StatePOSID",
        "IsActive",
        "Status",
        "CreatedDate",
        "ModifiedDate",
      ],
      include: [
        {
          model: CompanyMaster,
          as: "BMCompanyID",
          attributes: ["CompanyID", "CompanyName"],
        },
        {
          model: BranchTypes,
          as: "BMBranchTypeID",
          attributes: ["BranchTypeID", "BranchTypeName"],
        },
        {
          model: RegionMaster,
          as: "BMRegionID",
          attributes: ["RegionID", "RegionName"],
        },
        {
          model: CmpyRegion,
          attributes: ["CmpyRegionID", "CmpyRegionName"], // Adjust the attributes as needed
          as: "BMCmpyRegionID",
        },
        {
          model: ChannelMaster,
          as: "BMChannelID",
          attributes: ["ChannelID", "ChannelName"],
        },
        {
          model: OEMMaster,
          attributes: ["OEMID", "OEMName"], // Adjust the attributes as needed
          as: "BMOEMID",
        },
        {
          model: CompanyGSTMaster,
          attributes: ["CmpyGSTID", "GSTIN"], // Adjust the attributes as needed
          as: "BMCmpyGSTID",
        },
        {
          model: StatePOS,
          attributes: ["StatePOSID", "POSID", "StateName"], // Adjust the attributes as needed
          as: "BMStatePOSID",
        },
      ],
    });

    // Check if data is found
    if (!branchData) {
      return res.status(404).json({
        message: "Branch data not found.",
      });
    }

    // Prepare the response data
    const responseData = {
      BranchID: branchData.BranchID,
      BranchCode: branchData.BranchCode,
      BranchName: branchData.BranchName,
      OEMStoreName: branchData.OEMStoreName,
      CompanyID: branchData.CompanyID,
      CompanyName: branchData.BMCompanyID
        ? branchData.BMCompanyID.CompanyName
        : null,
      BranchTypeID: branchData.BranchTypeID,
      BranchTypeName: branchData.BMBranchTypeID
        ? branchData.BMBranchTypeID.BranchTypeName
        : null,
      RegionID: branchData.RegionID,
      RegionName: branchData.BMRegionID
        ? branchData.BMRegionID.RegionName
        : null,
      CmpyRegionID: branchData.CmpyRegionID,
      CmpyRegionName: branchData.BMCmpyRegionID
        ? branchData.BMCmpyRegionID.CmpyRegionName
        : null,
      ChannelID: branchData.ChannelID,
      ChannelName: branchData.BMChannelID
        ? branchData.BMChannelID.ChannelName
        : null,
      Contact: branchData.Contact,
      Email: branchData.Email,
      MSILCode: branchData.MSILCode,
      DealerCode: branchData.DealerCode,
      CityCode: branchData.CityCode,
      StoreID: branchData.StoreID,
      StoreCode: branchData.StoreCode,
      LocationCode: branchData.LocationCode,
      SubLedger: branchData.SubLedger,
      GSTIN: branchData.GSTIN,
      State: branchData.State,
      District: branchData.District,
      Address: branchData.Address,
      PINCode: branchData.PINCode,
      OEMID: branchData.OEMID,
      CmpyGSTID: branchData.CmpyGSTID,
      StatePOSID: branchData.StatePOSID,
      OEMName: branchData.BMOEMID ? branchData.BMOEMID.OEMName : null,
      GSTINNumber: branchData.BMCmpyGSTID ? branchData.BMCmpyGSTID.GSTIN : null,
      StateName: branchData.BMStatePOSID
        ? branchData.BMStatePOSID.StateName
        : null,
      IsActive: branchData.IsActive,
      Status: branchData.Status,
      CreatedDate: branchData.CreatedDate,
      ModifiedDate: branchData.ModifiedDate,
    };

    // Send the response data
    res.json(responseData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while retrieving branch data.",
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
    console.error("Error retrieving branch data:", error);
    return res.status(500).json({
      message: "Failed to retrieve branch data. Please try again later.",
    });
  }
};

// Update a BranchMaster by the id in the request
exports.updateByPk = async (req, res) => {
  console.log("BranchName:", req.body.BranchName);

  try {
    // Validate request
    if (!req.body.BranchName) {
      return res.status(400).json({ message: "BranchName cannot be empty" });
    }
    if (!/^[a-zA-Z ]*$/.test(req.body.BranchName)) {
      console.log("Validation failed: BranchName contains special characters.");
      return res.status(400).json({
        message: "BranchName should contain only letters",
      });
    }

    // Find the branch by ID
    const branchId = req.params.id;

    // Validate the ID parameter
    if (!branchId) {
      return res.status(400).json({ message: "ID parameter is required." });
    }

    let branchMaster = await BranchMaster.findByPk(branchId);

    if (!branchMaster) {
      return res.status(404).json({ message: "BranchMaster not found" });
    }

    // Update fields
    branchMaster.BranchName = req.body.BranchName;
    branchMaster.BranchCode = req.body.BranchCode || branchMaster.BranchCode;
    branchMaster.OEMStoreName =
      req.body.OEMStoreName || branchMaster.OEMStoreName;
    branchMaster.CompanyID = req.body.CompanyID || branchMaster.CompanyID;
    branchMaster.BranchTypeID =
      req.body.BranchTypeID || branchMaster.BranchTypeID;
    branchMaster.RegionID = req.body.RegionID || branchMaster.RegionID;
    branchMaster.ChannelID = req.body.ChannelID || branchMaster.ChannelID;
    branchMaster.Contact = req.body.Contact || branchMaster.Contact;
    branchMaster.Email = req.body.Email || branchMaster.Email;
    branchMaster.MSILCode = req.body.MSILCode || branchMaster.MSILCode;
    branchMaster.DealerCode = req.body.DealerCode || branchMaster.DealerCode;
    branchMaster.CityCode = req.body.CityCode || branchMaster.CityCode;
    branchMaster.StoreID = req.body.StoreID || branchMaster.StoreID;
    branchMaster.StoreCode = req.body.StoreCode || branchMaster.StoreCode;
    branchMaster.LocationCode =
      req.body.LocationCode || branchMaster.LocationCode;
    branchMaster.SubLedger = req.body.SubLedger || branchMaster.SubLedger;
    branchMaster.GSTIN = req.body.GSTIN || branchMaster.GSTIN;
    branchMaster.State = req.body.State || branchMaster.State;
    branchMaster.District = req.body.District || branchMaster.District;
    branchMaster.Address = req.body.Address || branchMaster.Address;
    branchMaster.PINCode = req.body.PINCode || branchMaster.PINCode;
    branchMaster.OEMID = req.body.OEMID || branchMaster.OEMID;
    branchMaster.OEMStoreName =
      req.body.OEMStoreName || branchMaster.OEMStoreName;
    branchMaster.CmpyGSTID = req.body.CmpyGSTID || branchMaster.CmpyGSTID;
    branchMaster.StatePOSID = req.body.StatePOSID || branchMaster.StatePOSID;
    branchMaster.CmpyStateID = req.body.CmpyStateID || branchMaster.CmpyStateID;
    branchMaster.CmpyRegionID =
      req.body.CmpyRegionID || branchMaster.CmpyRegionID;
    branchMaster.IsActive = req.body.IsActive || branchMaster.IsActive;
    branchMaster.Status = req.body.Status || branchMaster.Status;
    branchMaster.ModifiedDate = new Date();

    // Save updated BranchMaster in the database
    const updatedBranchMaster = await branchMaster.save();

    return res.status(200).json(updatedBranchMaster); // Send the updated BranchMaster as response
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
        message: "Database error occurred while updating BranchMaster.",
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
    console.error("Error updating BranchMaster:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a BranchMaster with the specified id in the request
exports.deleteById = async (req, res) => {
  const id = req.params.id;

  try {
    // Validate the ID parameter
    if (!id) {
      return res.status(400).json({ message: "ID parameter is required." });
    }

    // Find the model by ID
    const branchMaster = await BranchMaster.findByPk(id);

    // Check if the model exists
    if (!branchMaster) {
      return res
        .status(404)
        .json({ message: "BranchMaster not found with id: " + id });
    }

    // Delete the model
    await branchMaster.destroy();

    // Send a success message
    res.status(200).json({
      message: "BranchMaster with id: " + id + " deleted successfully",
    });
  } catch (err) {
    // Handle errors based on specific types
    if (err.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while deleting BranchMaster.",
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
    console.error("Error deleting BranchMaster:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
