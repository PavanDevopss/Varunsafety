/* eslint-disable no-dupe-keys */
/* eslint-disable no-unused-vars */
require("dotenv").config();
const db = require("../models");
const VendorGSTDetails = db.vendorgstdetails;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;
const VendorMaster = db.vendormaster;
const StatePOS = db.statepos;

exports.createNewGST = async (req, res) => {
  try {
    const gstDetail = req.body; // Expecting a single GST detail object

    // Validate that the required fields are provided
    if (!gstDetail || !gstDetail.RegistrationNo) {
      return res
        .status(400)
        .json({ message: "RegistrationNo cannot be empty." });
    }

    // Validate that the VendorMasterID exists in the VendorMaster table
    const existingVendor = await VendorMaster.findOne({
      where: {
        VendorMasterID: gstDetail.VendorMasterID,
      },
    });

    if (!existingVendor) {
      return res.status(400).json({
        message: `No matching vendor found with VendorMasterID: ${gstDetail.VendorMasterID}.`,
      });
    }

    // Check if the combination of RegistrationNo and VendorMasterID already exists
    const existingModel = await VendorGSTDetails.findOne({
      where: {
        RegistrationNo: gstDetail.RegistrationNo,
        VendorMasterID: gstDetail.VendorMasterID,
      },
    });

    if (existingModel) {
      return res.status(400).json({
        message: `GSTNumber ${gstDetail.RegistrationNo} already exists for vendor with ID ${gstDetail.VendorMasterID}.`,
      });
    }

    // Create a new VendorGSTDetails entry
    const newGSTDetail = await VendorGSTDetails.create({
      VendorMasterID: gstDetail.VendorMasterID,
      RegistrationNo: gstDetail.RegistrationNo,
      RegistrationType: gstDetail.RegistrationType,
      Address: gstDetail.Address,
      PINCode: gstDetail.PINCode,
      StatePOSID: gstDetail.StatePOSID,
      LegalName: gstDetail.LegalName,
      TradeName: gstDetail.TradeName,
      EntityType: gstDetail.EntityType,
      DateOfReg: gstDetail.DateOfReg,
      IsActive: gstDetail.IsActive !== undefined ? gstDetail.IsActive : true,
      Status: gstDetail.Status || "Active",
    });

    console.log("New GST detail created:", newGSTDetail);

    // Send the newly created VendorGSTDetails as response
    return res.status(200).json(newGSTDetail);
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
        message: "Database error occurred while creating Vendor GST.",
        details: err.message,
      });
    }

    if (err.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: err.message,
      });
    }

    console.error("Error creating Vendor GST:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.findAllGSTs = async (req, res) => {
  try {
    const VendorMasterID = req.query.VendorMasterID;
    // Fetch all VendorGSTDetails data with included StatePOS data
    const gstData = await VendorGSTDetails.findAll({
      where: { VendorMasterID },
      attributes: [
        "VendorGSTDetailsID",
        "VendorMasterID",
        "RegistrationNo",
        "StatePOSID",
      ],
      include: [
        {
          model: StatePOS,
          as: "VGDStatePOSID",
          attributes: ["POSID", "StateName"], // Include POSID and StateName attributes
        },
      ],
      order: [["VendorMasterID", "ASC"]],
    });

    // Check if data is empty
    if (!gstData || gstData.length === 0) {
      return res.status(404).json({
        message: "No GST data found.",
      });
    }

    // Map the data for response
    const combinedData = gstData.map((item) => ({
      VendorGSTDetailsID: item.VendorGSTDetailsID,
      VendorMasterID: item.VendorMasterID,
      RegistrationNo: item.RegistrationNo,
      StatePOSID: item.StatePOSID,
      POSID: item.VGDStatePOSID ? item.VGDStatePOSID.POSID : null,
      StateName: item.VGDStatePOSID ? item.VGDStatePOSID.StateName : null,
    }));

    // Send the combined data as response
    res.json(combinedData);
  } catch (error) {
    if (error.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message: "Database error occurred while retrieving GST data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    console.error("Error retrieving GST data:", error);
    return res.status(500).json({
      message: "Failed to retrieve GST data. Please try again later.",
    });
  }
};

exports.updateGSTDetails = async (req, res) => {
  try {
    const { id } = req.params; // Assuming 'id' is the primary key of VendorGSTDetails
    const updatedData = req.body;

    // Validate that the required fields are provided
    if (!updatedData || !updatedData.RegistrationNo) {
      return res
        .status(400)
        .json({ message: "RegistrationNo cannot be empty." });
    }

    // Check if the VendorGSTDetails entry exists
    const gstDetail = await VendorGSTDetails.findOne({
      where: { VendorGSTDetailsID: id }, // Replace VendorGSTDetailID with the actual primary key field
    });

    if (!gstDetail) {
      return res.status(404).json({
        message: `No GST detail found with ID: ${id}.`,
      });
    }

    // Validate VendorMasterID if it's being updated
    if (updatedData.VendorMasterID) {
      const existingVendor = await VendorMaster.findOne({
        where: { VendorMasterID: updatedData.VendorMasterID },
      });

      if (!existingVendor) {
        return res.status(400).json({
          message: `No matching vendor found with VendorMasterID: ${updatedData.VendorMasterID}.`,
        });
      }
    }

    // Check for duplicate RegistrationNo within the same VendorMasterID if being updated
    if (
      updatedData.RegistrationNo &&
      updatedData.VendorMasterID &&
      (updatedData.RegistrationNo !== gstDetail.RegistrationNo ||
        updatedData.VendorMasterID !== gstDetail.VendorMasterID)
    ) {
      const existingGST = await VendorGSTDetails.findOne({
        where: {
          RegistrationNo: updatedData.RegistrationNo,
          VendorMasterID: updatedData.VendorMasterID,
        },
      });

      if (existingGST) {
        return res.status(400).json({
          message: `GSTNumber ${updatedData.RegistrationNo} already exists for vendor with ID ${updatedData.VendorMasterID}.`,
        });
      }
    }

    // Update the GST detail
    gstDetail.RegistrationNo =
      updatedData.RegistrationNo || gstDetail.RegistrationNo;
    gstDetail.RegistrationType =
      updatedData.RegistrationType || gstDetail.RegistrationType;
    gstDetail.Address = updatedData.Address || gstDetail.Address;
    gstDetail.PINCode = updatedData.PINCode || gstDetail.PINCode;
    gstDetail.StatePOSID = updatedData.StatePOSID || gstDetail.StatePOSID;
    gstDetail.LegalName = updatedData.LegalName || gstDetail.LegalName;
    gstDetail.TradeName = updatedData.TradeName || gstDetail.TradeName;
    gstDetail.EntityType = updatedData.EntityType || gstDetail.EntityType;
    gstDetail.DateOfReg = updatedData.DateOfReg || gstDetail.DateOfReg;
    gstDetail.IsActive =
      updatedData.IsActive !== undefined
        ? updatedData.IsActive
        : gstDetail.IsActive;
    gstDetail.Status = updatedData.Status || gstDetail.Status;
    gstDetail.ModifiedDate = new Date();

    // Save the updated GST detail
    const updatedGSTDetail = await gstDetail.save();

    console.log("Updated GST detail:", updatedGSTDetail);

    return res.status(200).json(updatedGSTDetail);
  } catch (err) {
    // Handle specific error types
    if (err.name === "SequelizeValidationError") {
      return res.status(400).json({
        message: "Validation error",
        details: err.errors.map((e) => e.message),
      });
    }

    if (err.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message: "Database error occurred while updating Vendor GST.",
        details: err.message,
      });
    }

    if (err.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: err.message,
      });
    }

    console.error("Error updating Vendor GST:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
