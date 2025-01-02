/* eslint-disable no-unused-vars */
const db = require("../models");
const CompanyMaster = db.companymaster;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;
const OEMMaster = db.oemmaster;
const ParentCompany = db.parentcompany;
const IndustryMaster = db.industrymaster;
const CompanyStates = db.statemaster;
const CompanyGSTMaster = db.companygstmaster;
const RegionMaster = db.regionmaster;
const BranchMaster = db.branchmaster;
const ChannelMaster = db.channelmaster;
const BranchTypes = db.branchtypes;
const StateMaster = db.statemaster;
const CmpyStateMap = db.cmpystatemap;
const StatePOS = db.statepos;
const CompanyRegions = db.companyregions;
// Basic CRUD API
// Create and Save a new CompanyMaster
exports.create = async (req, res) => {
  console.log("CompanyName:", req.body.CompanyName);

  try {
    // Validate request
    if (!req.body.CompanyName) {
      return res.status(400).json({ message: "CompanyName cannot be empty" });
    }
    if (!/^[a-zA-Z ]*$/.test(req.body.CompanyName)) {
      console.log(
        "Validation failed: CompanyName contains special characters."
      );
      return res.status(400).json({
        message: "CompanyName should contain only letters",
      });
    }
    // Check if CompanyName already exists
    const existingModel = await CompanyMaster.findOne({
      where: { CompanyName: req.body.CompanyName },
    });
    if (existingModel) {
      return res.status(400).json({ message: "CompanyName already exists" });
    }

    // Create a new CompanyMaster
    const newCompanyMaster = await CompanyMaster.create({
      CompanyName: req.body.CompanyName,
      ParentCmpyID: req.body.ParentCmpyID,
      IndustryID: req.body.IndustryID,
      StateID: req.body.StateID,
      PANNo: req.body.PANNo,
      Contact: req.body.Contact,
      Website: req.body.Website,
      TAN: req.body.TAN,
      CIN: req.body.CIN,
      RegAddress: req.body.RegAddress,
      CmpyStateID: req.body.CmpyStateID,
      Email: req.body.Email,
      City: req.body.City,
      PINCode: req.body.PINCode,
      Country: req.body.Country,
      IsActive: req.body.IsActive || true,
      Status: req.body.Status || "Active",
    });

    // Save CompanyMaster in database
    console.log("New CompanyMaster created:", newCompanyMaster);

    return res.status(201).json(newCompanyMaster); // Send the newly created CompanyMaster as response
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
        message: "Database error occurred while creating CompanyMaster.",
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
    console.error("Error creating CompanyMaster:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Retrieve all CompanyMaster from the database.
exports.findAll = async (req, res) => {
  try {
    // Fetch all company data with included OEM data
    const companyNameData = await CompanyMaster.findAll({
      attributes: [
        "CompanyID",
        "CompanyName",
        "ParentCmpyID",
        "IndustryID",
        "StateID",
        "PANNo",
        "TAN",
        "CIN",
        "Website",
        "Contact",
        "RegAddress",
        "Email",
        "City",
        "PINCode",
        "Country",
        "IsActive",
        "Status",
      ],
      include: [
        {
          model: ParentCompany,
          as: "CmpyParentCompany",
          attributes: ["ParentCmpyID", "ParentCmpyName"], // Include OEMID and OEMName attributes
        },
        {
          model: IndustryMaster,
          as: "CmpyIndustryID",
          attributes: ["IndustryID", "IndustryName"], // Include OEMID and OEMName attributes
        },
        {
          model: StateMaster,
          as: "CmpyStateID",
          attributes: ["StateID", "StateName"], // Include OEMID and OEMName attributes
        },
      ],
      order: [
        ["CompanyName", "ASC"], // Order by ModelDescription in ascending order
      ],
    });

    // Check if data is empty
    if (!companyNameData || companyNameData.length === 0) {
      return res.status(404).json({
        message: "No company name data found.",
      });
    }

    // Map the data for response
    const combinedData = companyNameData.map((item) => ({
      CompanyID: item.CompanyID,
      CompanyName: item.CompanyName,
      ParentCmpyID: item.ParentCmpyID,
      Website: item.Website,
      Contact: item.Contact,
      ParentCmpyName: item.CmpyParentCompany
        ? item.CmpyParentCompany.ParentCmpyName
        : null,
      IndustryID: item.IndustryID,
      IndustryName: item.CmpyIndustryID
        ? item.CmpyIndustryID.IndustryName
        : null,
      StateID: item.CmpyStateID ? item.CmpyStateID.StateID : null,
      StateName: item.CmpyStateID ? item.CmpyStateID.StateName : null,
      PANNo: item.PANNo,
      TAN: item.TAN,
      CIN: item.CIN,
      RegAddress: item.RegAddress,
      Email: item.Email,
      City: item.City,
      PINCode: item.PINCode,
      Country: item.Country,
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
        message: "Database error occurred while retrieving company name data.",
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
    console.error("Error retrieving company name data:", error);
    return res.status(500).json({
      message: "Failed to retrieve company name data. Please try again later.",
    });
  }
};

// Find a single CompanyMaster with an id
exports.findOne = async (req, res) => {
  try {
    const { CompanyID, IndustryID, ParentCmpyID } = req.query;

    if (!CompanyID) {
      return res
        .status(400)
        .json({ message: "CompanyID parameter is required." });
    }

    const companyData = await CompanyMaster.findOne({
      where: { CompanyID },
      attributes: [
        "CompanyID",
        "CompanyName",
        "ParentCmpyID",
        "IndustryID",
        "StateID",
        "PANNo",
        "TAN",
        "CIN",
        "RegAddress",
        "Website",
        "Contact",
        "Email",
        "City",
        "PINCode",
        "Country",
        "IsActive",
        "Status",
        "CreatedDate",
        "ModifiedDate",
      ],
    });

    if (!companyData) {
      return res.status(404).json({ message: "Company data not found." });
    }

    const oemData = await OEMMaster.findAll({
      where: {
        CompanyID,
        IndustryID: IndustryID || companyData.IndustryID,
        ParentCmpyID: ParentCmpyID || companyData.ParentCmpyID,
      },
      attributes: ["OEMID", "OEMCode", "OEMName"],
    });

    const gstData = await CompanyGSTMaster.findAll({
      where: { CompanyID },
      attributes: [
        "CmpyGSTID",
        "CompanyID",
        "RegistrationType",
        "GSTIN",
        "LegalName",
        "TradeName",
        "DOR",
        "EntityType",
        "StatePOSID",
        "Address",
        "Status",
      ],
      include: [
        {
          model: StatePOS,
          as: "CmpyGSTMStatePOSID",
          attributes: ["POSID", "StateName"],
        },
      ],
    });

    const statePosData = await CmpyStateMap.findAll({
      where: { CompanyID },
      attributes: ["CmpyStateMapID", "CompanyID", "StatePOSID"],
      include: [
        {
          model: StatePOS,
          as: "CSMStatePOSID",
          attributes: ["POSID", "StateName"],
        },
      ],
    });

    const regionData = await RegionMaster.findAll({
      where: { CompanyID },
      attributes: ["RegionID", "RegionName", "Status"],
      include: [
        {
          model: StateMaster,
          as: "RMStateID",
          attributes: ["StateID", "StateName"],
        },
      ],
    });

    const channelData = await ChannelMaster.findAll({
      where: { CompanyID },
      attributes: ["ChannelID", "ChannelName", "Status"],
      include: [
        {
          model: OEMMaster,
          as: "ChannelOEMID",
          attributes: ["OEMID", "OEMName", "OEMCode"],
        },
      ],
    });

    // Fetch branch count for each region
    const regionWithBranchCounts = await Promise.all(
      regionData.map(async (region) => {
        const branchCount = await BranchMaster.count({ where: { CompanyID } });
        return {
          RegionID: region.RegionID,
          RegionName: region.RegionName,
          Status: region.Status,
          BranchCount: branchCount,
          StateID: region.RMStateID.StateID,
          StateName: region.RMStateID.StateName,
        };
      })
    );

    const responseData = {
      CompanyID: companyData.CompanyID,
      CompanyName: companyData.CompanyName,
      ParentCmpyID: companyData.ParentCmpyID,
      IndustryID: companyData.IndustryID,
      StateID: companyData.StateID,
      PANNo: companyData.PANNo,
      TAN: companyData.TAN,
      CIN: companyData.CIN,
      RegAddress: companyData.RegAddress,
      Website: companyData.Website,
      Contact: companyData.Contact,
      Email: companyData.Email,
      City: companyData.City,
      PINCode: companyData.PINCode,
      Country: companyData.Country,
      IsActive: companyData.IsActive,
      Status: companyData.Status,
      CreatedDate: companyData.CreatedDate,
      ModifiedDate: companyData.ModifiedDate,
      OEMs: oemData.map((oem) => ({
        OEMID: oem.OEMID,
        OEMCode: oem.OEMCode,
        OEMName: oem.OEMName,
      })),
      GSTs: gstData.map((gst) => ({
        CmpyGSTID: gst.CmpyGSTID,
        RegistrationType: gst.RegistrationType,
        GSTIN: gst.GSTIN,
        LegalName: gst.LegalName,
        TradeName: gst.TradeName,
        DOR: gst.DOR,
        EntityType: gst.EntityType,
        StatePOSID: gst.StatePOSID,
        Address: gst.Address,
        Status: gst.Status,

        POSID: gst.CmpyGSTMStatePOSID ? gst.CmpyGSTMStatePOSID.POSID : null,
        StateName: gst.CmpyGSTMStatePOSID
          ? gst.CmpyGSTMStatePOSID.StateName
          : null,
      })),
      POSStates: statePosData.map((state) => ({
        CmpyStateMapID: state.CmpyStateMapID,
        POSID: state.CSMStatePOSID ? state.CSMStatePOSID.POSID : null,
        StateName: state.CSMStatePOSID ? state.CSMStatePOSID.StateName : null,
      })),
      Regions: regionWithBranchCounts,
      Channels: channelData.map((channel) => ({
        ChannelID: channel.ChannelID,
        ChannelName: channel.ChannelName,
        Status: channel.Status,
        OEMID: channel.ChannelOEMID.OEMID,
        OEMName: channel.ChannelOEMID.OEMName,
        OEMCode: channel.ChannelOEMID.OEMCode,
      })),
    };

    res.json(responseData);
  } catch (error) {
    if (error.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message: "Database error occurred while retrieving company data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    console.error("Error retrieving company data:", error);
    return res.status(500).json({
      message: "Failed to retrieve company data. Please try again later.",
    });
  }
};

// Update a CompanyMaster by the id in the request
exports.updateByPk = async (req, res) => {
  console.log("CompanyName:", req.body.CompanyName);

  try {
    // Validate request
    if (!req.body.CompanyName) {
      return res.status(400).json({ message: "CompanyName cannot be empty" });
    }
    if (!/^[a-zA-Z ]*$/.test(req.body.CompanyName)) {
      console.log(
        "Validation failed: CompanyName contains special characters."
      );
      return res.status(400).json({
        message: "CompanyName should contain only letters",
      });
    }
    // Find the CompanyMaster by ID
    const companyID = req.params.id;
    let companyMaster = await CompanyMaster.findByPk(companyID);

    if (!companyMaster) {
      return res.status(404).json({ message: "CompanyMaster not found" });
    }

    // Update fields
    companyMaster.CompanyName =
      req.body.CompanyName || companyMaster.CompanyName;
    companyMaster.ParentCmpyID =
      req.body.ParentCmpyID || companyMaster.ParentCmpyID;
    companyMaster.IndustryID = req.body.IndustryID || companyMaster.IndustryID;
    companyMaster.PANNo = req.body.PANNo || companyMaster.PANNo;
    companyMaster.TAN = req.body.TAN || companyMaster.TAN;
    companyMaster.CIN = req.body.CIN || companyMaster.CIN;
    companyMaster.RegAddress = req.body.RegAddress || companyMaster.RegAddress;
    companyMaster.CmpyStateID =
      req.body.CmpyStateID || companyMaster.CmpyStateID;
    companyMaster.Email = req.body.Email || companyMaster.Email;
    companyMaster.City = req.body.City || companyMaster.City;
    companyMaster.PINCode = req.body.PINCode || companyMaster.PINCode;
    companyMaster.Country = req.body.Country || companyMaster.Country;
    companyMaster.IsActive = req.body.IsActive || companyMaster.IsActive;
    companyMaster.Status = req.body.Status || companyMaster.Status;
    companyMaster.ModifiedDate = new Date();

    // Save updated CompanyMaster in the database
    const updatedCompanyMaster = await companyMaster.save();

    return res.status(200).json(updatedCompanyMaster); // Send the updated CompanyMaster as response
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
        message: "Database error occurred while updating CompanyMaster.",
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
    console.error("Error updating CompanyMaster:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a CompanyMaster with the specified id in the request
exports.deleteById = async (req, res) => {
  const id = req.params.id; // Extract ID from request parameters

  try {
    // Find the model by its primary key (ID)
    const companyMaster = await CompanyMaster.findByPk(id);

    // If the record doesn't exist, send a 404 response
    if (!companyMaster) {
      return res
        .status(404)
        .json({ message: `CompanyMaster not found with id: ${id}` });
    }

    // Delete the record
    await companyMaster.destroy();

    // Send success response
    return res.status(200).json({
      message: `CompanyMaster with id: ${id} deleted successfully`,
    });
  } catch (err) {
    // Handle Sequelize-specific errors

    if (err.name === "SequelizeForeignKeyConstraintError") {
      // Foreign key constraint error
      return res.status(400).json({
        message: `Cannot delete CompanyMaster with id: ${id} as it is referenced by other records.`,
        details: err.message,
      });
    }

    if (err.name === "SequelizeDatabaseError") {
      // General database error
      return res.status(500).json({
        message: "Database error occurred while deleting CompanyMaster.",
        details: err.message,
      });
    }

    if (err.name === "SequelizeConnectionError") {
      // Connection error
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: err.message,
      });
    }

    if (err.name === "SequelizeValidationError") {
      // Validation error
      return res.status(400).json({
        message: "Validation error occurred while deleting CompanyMaster.",
        details: err.message,
      });
    }

    // Log and return generic server error for other cases
    console.error("Error deleting CompanyMaster:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.createNewOEMs = async (req, res) => {
  console.log("OEMs:", req.body);

  try {
    // Validate if request body is an array
    if (!Array.isArray(req.body) || req.body.length === 0) {
      return res
        .status(400)
        .json({ message: "Request body must be a non-empty array" });
    }

    // Collect errors and results
    let errors = [];
    let createdOEMs = [];

    // Use Promise.all to process all items concurrently
    await Promise.all(
      req.body.map(async (oem, index) => {
        // Validate required fields
        if (!oem.OEMName) {
          errors.push({
            message: `OEMName cannot be empty for record at index ${index}`,
          });
          return;
        }

        if (!/^[a-zA-Z ]*$/.test(oem.OEMName)) {
          errors.push({
            message: `OEMName should contain only letters for record at index ${index}`,
          });
          return;
        }

        // Validate that the CompanyID, ParentCmpyID, and IndustryID exist in the CompanyMaster table
        const existingCompany = await CompanyMaster.findOne({
          where: {
            CompanyID: oem.CompanyID,
            ParentCmpyID: oem.ParentCmpyID,
            IndustryID: oem.IndustryID,
          },
        });

        if (!existingCompany) {
          errors.push({
            message: `No matching company found with the provided CompanyID, ParentCmpyID, and IndustryID for record at index ${index}`,
          });
          return;
        }

        // Check if OEMCode already exists
        const existingModel = await OEMMaster.findOne({
          where: { OEMCode: oem.OEMCode },
        });
        if (existingModel) {
          errors.push({
            message: `OEMCode already exists for record at index ${index}`,
          });
          return;
        }

        try {
          // Create the new OEMMaster
          const newOEMMaster = await OEMMaster.create({
            OEMCode: oem.OEMCode,
            OEMName: oem.OEMName,
            CompanyID: oem.CompanyID,
            ParentCmpyID: oem.ParentCmpyID,
            IndustryID: oem.IndustryID,
            IsActive: oem.IsActive !== undefined ? oem.IsActive : true,
            Status: oem.Status || "Active",
          });

          createdOEMs.push(newOEMMaster);
        } catch (err) {
          errors.push({
            message: `Error creating OEMMaster for record at index ${index}`,
            details: err.message,
          });
        }
      })
    );

    // Return partial success if there were errors
    if (errors.length > 0) {
      return res.status(207).json({
        message: "Some records could not be processed",
        createdOEMs,
        errors,
      });
    }

    // All records were successfully created
    return res.status(201).json({
      message: "All records created successfully",
      createdOEMs,
    });
  } catch (err) {
    console.error("Error creating OEMMasters:", err);

    if (err.name === "SequelizeValidationError") {
      return res.status(400).json({
        message: "Validation error",
        details: err.errors.map((e) => e.message),
      });
    }

    if (err.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message: "Database error occurred while creating OEMMasters.",
        details: err.message,
      });
    }

    if (err.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: err.message,
      });
    }

    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.createNewGST = async (req, res) => {
  console.log("GSTIN:", req.body.GSTIN);

  try {
    // Validate request
    if (!req.body.GSTIN) {
      return res.status(400).json({ message: "GSTIN cannot be empty" });
    }
    if (!/^[a-zA-Z0-9]*$/.test(req.body.GSTIN)) {
      // Allow only alphanumeric GSTIN values
      console.log("Validation failed: GSTIN contains special characters.");
      return res.status(400).json({
        message: "GSTIN should contain only alphanumeric characters",
      });
    }

    // Check if the CompanyID exists in the CompanyMaster table
    const existingCompany = await CompanyMaster.findOne({
      where: { CompanyID: req.body.CompanyID },
    });

    if (!existingCompany) {
      return res.status(400).json({
        message: "No company found with the provided CompanyID",
      });
    }

    // Check if GSTIN already exists in CompanyGSTMaster
    const existingGSTIN = await CompanyGSTMaster.findOne({
      where: { GSTIN: req.body.GSTIN },
    });
    if (existingGSTIN) {
      return res.status(400).json({ message: "GSTIN already exists" });
    }

    // Create a new CompanyGSTMaster
    const newCompanyGSTMaster = await CompanyGSTMaster.create({
      CompanyID: req.body.CompanyID,
      GSTIN: req.body.GSTIN,
      RegistrationType: req.body.RegistrationType,
      LegalName: req.body.LegalName,
      TradeName: req.body.TradeName,
      DOR: req.body.DOR,
      Address: req.body.Address,
      StatePOSID: req.body.StatePOSID,
      ClientID: req.body.ClientID || null,
      ClientSecret: req.body.ClientSecret || null,
      PINCode: req.body.PINCode,
      UserName: req.body.UserName || null,
      Password: req.body.Password || null,
      GSTStatus: req.body.GSTStatus || true,
      IsActive: req.body.IsActive || true,
      Status: req.body.Status || "Active",
    });

    // Save CompanyGSTMaster in database
    console.log("New CompanyGSTMaster created:", newCompanyGSTMaster);

    return res.status(201).json(newCompanyGSTMaster); // Send the newly created CompanyGSTMaster as response
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
        message: "Database error occurred while creating CompanyGSTMaster.",
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
    console.error("Error creating CompanyGSTMaster:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.createNewRegions = async (req, res) => {
  console.log("Regions data:", req.body);

  try {
    // Validate request
    if (!Array.isArray(req.body) || req.body.length === 0) {
      return res
        .status(400)
        .json({ message: "Request body must be a non-empty array." });
    }

    // Collect promises for region creation and company validation
    const regionCreationPromises = [];
    const existingCompanyIDs = new Set(); // To track unique CompanyIDs for validation

    for (const region of req.body) {
      if (!region.CmpyRegionName) {
        return res
          .status(400)
          .json({ message: "CmpyRegionName cannot be empty" });
      }

      if (!/^[a-zA-Z ]*$/.test(region.CmpyRegionName)) {
        console.log(
          "Validation failed: CmpyRegionName contains invalid characters."
        );
        return res.status(400).json({
          message: "CmpyRegionName should contain only letters and spaces",
        });
      }

      // Check if CompanyID is valid and collect unique IDs
      if (!region.CompanyID) {
        return res
          .status(400)
          .json({ message: "CompanyID is required for each region." });
      }
      existingCompanyIDs.add(region.CompanyID);
    }

    // Validate the existence of all companies
    const companyValidationPromises = [...existingCompanyIDs].map(
      async (companyId) => {
        const existingCompany = await CompanyMaster.findOne({
          where: { CompanyID: companyId },
        });

        if (!existingCompany) {
          throw new Error(`No company found with CompanyID: ${companyId}`);
        }
      }
    );

    await Promise.all(companyValidationPromises);

    // Create new regions
    for (const region of req.body) {
      const branchCount = await BranchMaster.count({
        where: { CompanyID: region.CompanyID },
      });

      const newCompanyRegions = await CompanyRegions.create({
        CmpyRegionName: region.CmpyRegionName,
        StatePOSID: region.StatePOSID,
        CompanyID: region.CompanyID,
        IsActive: region.IsActive || true,
        Status: region.Status || "Active",
      });

      regionCreationPromises.push({
        newRegion: newCompanyRegions,
        branchCount: branchCount,
      });
    }

    // Wait for all region creations to finish
    const results = await Promise.all(regionCreationPromises);

    // Send the newly created regions along with branch counts as response
    return res.status(201).json(results);
  } catch (err) {
    // Handle errors based on specific types
    if (err.message && err.message.startsWith("No company found")) {
      return res.status(400).json({ message: err.message });
    }

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
        message: "Database error occurred while creating CompanyRegions.",
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

    console.error("Error creating CompanyRegions:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.createnNewChannel = async (req, res) => {
  console.log("Channels:", req.body);

  try {
    // Validate request
    if (!Array.isArray(req.body) || req.body.length === 0) {
      return res.status(400).json({
        message: "Request body must be a non-empty array of channels.",
      });
    }

    // Validate each channel object
    for (const channel of req.body) {
      if (!channel.ChannelName) {
        return res.status(400).json({ message: "ChannelName cannot be empty" });
      }
      if (!/^[a-zA-Z ]*$/.test(channel.ChannelName)) {
        console.log(
          "Validation failed: ChannelName contains special characters."
        );
        return res.status(400).json({
          message: "ChannelName should contain only letters",
        });
      }

      // Validate that the CompanyID exists in the CompanyMaster table
      const existingCompany = await CompanyMaster.findOne({
        where: { CompanyID: channel.CompanyID },
      });

      if (!existingCompany) {
        return res.status(400).json({
          message: `No matching company found with CompanyID: ${channel.CompanyID}.`,
        });
      }

      // Check if ChannelName already exists
      const existingModel = await ChannelMaster.findOne({
        where: { ChannelName: channel.ChannelName },
      });

      if (existingModel) {
        return res.status(400).json({
          message: `ChannelName '${channel.ChannelName}' already exists`,
        });
      }
    }

    // Bulk create channels
    const newChannels = await ChannelMaster.bulkCreate(
      req.body.map((channel) => ({
        ChannelName: channel.ChannelName,
        CompanyID: channel.CompanyID,
        OEMID: channel.OEMID,
        IsActive: channel.IsActive || true,
        Status: channel.Status || "Active",
      }))
    );

    // Save ChannelMaster in database
    console.log("New ChannelMasters created:", newChannels);

    return res.status(201).json(newChannels); // Send the newly created ChannelMasters as response
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
        message: "Database error occurred while creating ChannelMasters.",
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

    console.error("Error creating ChannelMasters:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.findAllBranches = async (req, res) => {
  const { OEMID, CmpyGSTID, StatePOSID, RegionID, ChannelID, CompanyID } =
    req.query;
  try {
    const branchData = await BranchMaster.findAll({
      where: { OEMID, CmpyGSTID, StatePOSID, RegionID, ChannelID, CompanyID },
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
        "DealerCode",
        "CityCode",
        "StoreID",
        "StoreCode",
        "LocationCode",
        "SubLedger",
        "GSTIN",
        "IsActive",
        "Status",
        "OEMID",
        "State",
        "District",
        "Address",
        "PINCode",
        "CmpyGSTID",
        "StatePOSID",
        "CreatedDate",
        "ModifiedDate",
      ],
      // include: [
      //   {
      //     model: CompanyMaster,
      //     attributes: ["CompanyID", "CompanyName"], // Adjust the attributes as needed
      //     as: "BMCompanyID",
      //   },
      //   {
      //     model: BranchTypes,
      //     attributes: ["BranchTypeID", "BranchTypeName"], // Adjust the attributes as needed
      //     as: "BMBranchTypeID",
      //   },
      //   {
      //     model: RegionMaster,
      //     attributes: ["RegionID", "RegionName"], // Adjust the attributes as needed
      //     as: "BMRegionID",
      //   },
      //   {
      //     model: ChannelMaster,
      //     attributes: ["ChannelID", "ChannelName"], // Adjust the attributes as needed
      //     as: "BMChannelID",
      //   },
      // ],
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

    // // Map the data for response
    // const mappedData = branchData.map((item) => ({
    //   BranchID: item.BranchID,
    //   BranchCode: item.BranchCode,
    //   BranchName: item.BranchName,
    //   OEMStoreName: item.OEMStoreName,
    //   CompanyID: item.CompanyID,
    //   CompanyName: item.BMCompanyID ? item.BMCompanyID.CompanyName : null,
    //   BranchTypeID: item.BranchTypeID,
    //   BranchTypeName: item.BMBranchType
    //     ? item.BMBranchTypeID.BranchTypeName
    //     : null,
    //   RegionID: item.RegionID,
    //   RegionName: item.BMRegion ? item.BMRegionID.RegionName : null,
    //   ChannelID: item.ChannelID,
    //   ChannelName: item.BMChannel ? item.BMChannelID.ChannelName : null,
    //   Contact: item.Contact,
    //   Email: item.Email,
    //   DealerCode: item.DealerCode,
    //   CityCode: item.CityCode,
    //   StoreID: item.StoreID,
    //   StoreCode: item.StoreCode,
    //   LocationCode: item.LocationCode,
    //   SubLedger: item.SubLedger,
    //   GSTIN: item.GSTIN,
    //   IsActive: item.IsActive,
    //   Status: item.Status,
    //   CreatedDate: item.CreatedDate,
    //   ModifiedDate: item.ModifiedDate,
    // }));

    // Send the mapped data as response
    res.json(branchData);
  } catch (error) {
    // Handle errors
    console.error("Error retrieving branch data:", error);
    res.status(500).json({
      message: "Failed to retrieve branch data. Please try again later.",
      error: error.message,
    });
  }
};

exports.bulkUpdateCompanyOEM = async (req, res) => {
  try {
    const { oems } = req.body;

    if (!Array.isArray(oems) || oems.length === 0) {
      return res.status(400).json({
        message: "Request body must be a non-empty array of OEMs.",
      });
    }

    const errors = [];
    const updatedOEMs = [];
    const createdOEMs = [];

    // Prepare company validation data
    const companyIDs = oems.map((oem) => ({
      CompanyID: oem.CompanyID,
      ParentCmpyID: oem.ParentCmpyID,
      IndustryID: oem.IndustryID,
    }));

    // Fetch existing companies from CompanyMaster
    const existingCompanies = await CompanyMaster.findAll({
      where: { [Op.or]: companyIDs },
      attributes: ["CompanyID", "ParentCmpyID", "IndustryID"],
    });

    // Create a Set for valid company checks
    const validCompanies = new Set(
      existingCompanies.map(
        (c) => `${c.CompanyID}-${c.ParentCmpyID}-${c.IndustryID}`
      )
    );

    // Process records concurrently
    await Promise.all(
      oems.map(async (oem, index) => {
        const {
          CompanyID,
          ParentCmpyID,
          IndustryID,
          OEMID, // Required for updates
          OEMCode,
          OEMName,
          IsActive,
          Status,
        } = oem;

        // Validate OEMName
        if (!OEMName || !/^[a-zA-Z ]*$/.test(OEMName)) {
          errors.push({
            index,
            message: `Invalid OEMName at index ${index}. It must only contain letters and spaces.`,
          });
          return;
        }

        // Validate Company details
        if (!validCompanies.has(`${CompanyID}-${ParentCmpyID}-${IndustryID}`)) {
          errors.push({
            index,
            message: `Invalid Company details at index ${index}. CompanyID: ${CompanyID}, ParentCmpyID: ${ParentCmpyID}, IndustryID: ${IndustryID}`,
          });
          return;
        }

        if (OEMID) {
          // Update existing OEM if OEMID is provided
          const existingOEM = await OEMMaster.findOne({
            where: { OEMID },
          });

          if (existingOEM) {
            try {
              existingOEM.OEMCode = OEMCode || existingOEM.OEMCode;
              existingOEM.OEMName = OEMName || existingOEM.OEMName;
              existingOEM.IsActive =
                IsActive !== undefined ? IsActive : existingOEM.IsActive;
              existingOEM.Status = Status || existingOEM.Status;
              existingOEM.ModifiedDate = new Date();

              const updatedOEM = await existingOEM.save();
              updatedOEMs.push(updatedOEM);
            } catch (err) {
              errors.push({
                index,
                message: `Error updating OEM at index ${index}.`,
                details: err.message,
              });
            }
          } else {
            errors.push({
              index,
              message: `OEM with ID ${OEMID} not found at index ${index}.`,
            });
          }
        } else {
          // Create new OEM if OEMID is not provided
          try {
            const newOEM = await OEMMaster.create({
              OEMCode,
              OEMName,
              CompanyID,
              ParentCmpyID,
              IndustryID,
              IsActive: IsActive !== undefined ? IsActive : true,
              Status: Status || "Active",
              CreatedDate: new Date(),
              ModifiedDate: new Date(),
            });
            createdOEMs.push(newOEM);
          } catch (err) {
            errors.push({
              index,
              message: `Error creating OEM at index ${index}.`,
              details: err.message,
            });
          }
        }
      })
    );

    // Return results
    const statusCode = errors.length > 0 ? 207 : 200;
    return res.status(statusCode).json({
      message: "Bulk operation completed.",
      updated: updatedOEMs,
      added: createdOEMs,
      errors,
    });
  } catch (err) {
    console.error("Error during bulk update of OEMs:", err);
    return res.status(500).json({
      message: "Internal server error.",
    });
  }
};

exports.bulkUpdateCompanyRegions = async (req, res) => {
  try {
    const { companyregions } = req.body;

    // Validate request
    if (!Array.isArray(companyregions) || companyregions.length === 0) {
      return res.status(400).json({
        message: "Request body must be a non-empty array of companyregions.",
      });
    }

    const updatedcompanyregions = [];
    const addedcompanyregions = [];
    const errors = [];

    for (const bank of companyregions) {
      const { CompanyID, CmpyRegionID } = bank;

      // Validate CompanyID
      if (!CompanyID) {
        errors.push({
          CompanyID,
          CmpyRegionID,
          message: "CompanyID is required.",
        });
        continue;
      }

      try {
        // Check if record exists
        const companyRegions = await CompanyRegions.findOne({
          where: {
            CompanyID,
            CmpyRegionID,
          },
        });

        if (companyRegions) {
          // Update existing fields
          companyRegions.CmpyRegionName =
            bank.CmpyRegionName || companyRegions.CmpyRegionName;
          companyRegions.StatePOSID =
            bank.StatePOSID || companyRegions.StatePOSID;
          companyRegions.IsActive =
            bank.IsActive !== undefined
              ? bank.IsActive
              : companyRegions.IsActive;
          companyRegions.Status = bank.Status || companyRegions.Status;
          companyRegions.ModifiedDate = new Date();

          // Save the updated record
          const updatedcompanyRegions = await companyRegions.save();
          updatedcompanyregions.push(updatedcompanyRegions);
        } else {
          // Create a new record
          const newcompanyRegions = await CompanyRegions.create({
            CompanyID,
            CmpyRegionID,
            CmpyRegionName: bank.CmpyRegionName || null,
            StatePOSID: bank.StatePOSID || null,
            IsActive: bank.IsActive !== undefined ? bank.IsActive : true, // Default to true if IsActive is not provided
            Status: bank.Status || "Active", // Default status
            CreatedDate: new Date(),
            ModifiedDate: new Date(),
          });

          addedcompanyregions.push(newcompanyRegions);
        }
      } catch (error) {
        console.error(
          `Error processing vendor bank for CompanyID: ${CompanyID}, RegionID: ${
            (CompanyID, CmpyRegionID)
          }`,
          error
        );
        errors.push({
          CompanyID,
          CmpyRegionID,
          message: "Error processing this record.",
        });
      }
    }

    return res.status(200).json({
      message: "Bulk operation completed.",
      updated: updatedcompanyregions,
      added: addedcompanyregions,
      errors,
    });
  } catch (err) {
    console.error("Error during bulk operation of vendor companyregions:", err);
    return res.status(500).json({
      message: "Internal server error.",
    });
  }
};

exports.bulkUpdatePOSNames = async (req, res) => {
  try {
    const posRequests = req.body; // Array of requests

    // Validate the request body
    if (!Array.isArray(posRequests) || posRequests.length === 0) {
      return res
        .status(400)
        .json({ message: "Request body must be a non-empty array." });
    }

    const updatedPOS = [];
    const addedPOS = [];
    const errors = [];

    for (const pos of posRequests) {
      const { CmpyStateMapID, CompanyID, POSID } = pos;

      // Validation: Ensure required fields are provided
      if ((!CmpyStateMapID && !POSID) || !CompanyID) {
        errors.push({
          request: pos,
          message:
            "Either CmpyStateMapID or POSID must be provided, and CompanyID is required.",
        });
        continue;
      }

      try {
        if (CmpyStateMapID) {
          // Handle updating an existing record
          const existingRecord = await CmpyStateMap.findOne({
            where: { CmpyStateMapID },
          });

          if (!existingRecord) {
            errors.push({
              request: pos,
              message: `No record found with CmpyStateMapID: ${CmpyStateMapID}.`,
            });
            continue;
          }

          // Retrieve the StatePOSID based on the provided POSID
          const statePOS = await StatePOS.findOne({
            where: { POSID: String(POSID) }, // Ensure POSID is a string
          });

          if (!statePOS) {
            errors.push({
              request: pos,
              message: `No StatePOSID found for POSID: ${POSID}.`,
            });
            continue;
          }

          // Update the existing record in CmpyStateMap
          existingRecord.CompanyID = CompanyID;
          existingRecord.StatePOSID = statePOS.StatePOSID;
          await existingRecord.save();

          updatedPOS.push({
            CmpyStateMapID: existingRecord.CmpyStateMapID,
            CompanyID: existingRecord.CompanyID,
            StatePOSID: existingRecord.StatePOSID,
          });
        } else {
          // Handle creating a new record
          const statePOS = await StatePOS.findAll({
            where: { POSID: String(POSID) }, // Ensure POSID is a string
          });

          if (!statePOS || statePOS.length === 0) {
            errors.push({
              request: pos,
              message: `No StatePOSID found for POSID: ${POSID}.`,
            });
            continue;
          }

          // Iterate over all retrieved StatePOSID entries and create mappings
          for (const item of statePOS) {
            const newRecord = await CmpyStateMap.create({
              CompanyID,
              StatePOSID: item.StatePOSID,
            });

            addedPOS.push({
              CmpyStateMapID: newRecord.CmpyStateMapID,
              CompanyID: newRecord.CompanyID,
              StatePOSID: newRecord.StatePOSID,
              POSID: POSID,
              StateName: item.StateName,
            });
          }
        }
      } catch (err) {
        console.error("Error processing request:", pos, err);
        errors.push({
          request: pos,
          message: "An error occurred while processing this request.",
        });
      }
    }

    // Return the final response
    return res.status(200).json({
      message: "Bulk operation completed.",
      updated: updatedPOS,
      added: addedPOS,
      errors: errors,
    });
  } catch (err) {
    console.error("Internal server error:", err);
    return res.status(500).json({
      message: "Internal server error.",
      details: err.message,
    });
  }
};

exports.bulkUpdateCompanyChannels = async (req, res) => {
  try {
    const { channels } = req.body;

    // Validate request
    if (!Array.isArray(channels) || channels.length === 0) {
      return res.status(400).json({
        message: "Request body must be a non-empty array of channels.",
      });
    }

    const updatedchannels = [];
    const addedchannels = [];
    const errors = [];

    for (const bank of channels) {
      const { CompanyID, ChannelID } = bank;

      // Validate CompanyID
      if (!CompanyID) {
        errors.push({
          CompanyID,
          ChannelID,
          message: "CompanyID is required.",
        });
        continue;
      }

      try {
        // Check if record exists
        const companychannel = await ChannelMaster.findOne({
          where: {
            CompanyID,
            ChannelID,
          },
        });

        if (companychannel) {
          // Update existing fields
          companychannel.ChannelName =
            bank.ChannelName || companychannel.ChannelName;
          companychannel.OEMID = bank.OEMID || companychannel.OEMID;
          companychannel.Status = bank.Status || companychannel.Status;
          companychannel.IsActive =
            bank.IsActive !== undefined
              ? bank.IsActive
              : companychannel.IsActive;
          companychannel.Status = bank.Status || companychannel.Status;
          companychannel.ModifiedDate = new Date();

          // Save the updated record
          const updatedcompanychannel = await companychannel.save();
          updatedchannels.push(updatedcompanychannel);
        } else {
          // Create a new record
          const newcompanychannel = await ChannelMaster.create({
            CompanyID,
            ChannelID,
            ChannelName: bank.ChannelName || null,
            OEMID: bank.OEMID || null,
            Status: bank.Status || null,
            IsActive: bank.IsActive !== undefined ? bank.IsActive : true, // Default to true if IsActive is not provided
            Status: bank.Status || "Active", // Default status
            CreatedDate: new Date(),
          });

          addedchannels.push(newcompanychannel);
        }
      } catch (error) {
        console.error(
          `Error processing company channel for CompanyID: ${CompanyID}, ChannelID: ${
            (CompanyID, ChannelID)
          }`,
          error
        );
        errors.push({
          CompanyID,
          ChannelID,
          message: "Error processing this record.",
        });
      }
    }

    return res.status(200).json({
      message: "Bulk operation completed.",
      updated: updatedchannels,
      added: addedchannels,
      errors,
    });
  } catch (err) {
    console.error("Error during bulk operation of company channels:", err);
    return res.status(500).json({
      message: "Internal server error.",
    });
  }
};
