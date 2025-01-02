/* eslint-disable no-dupe-keys */
/* eslint-disable no-unused-vars */
require("dotenv").config();
const db = require("../models");
const VendorBankDetails = db.vendorbankdetails;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;
const VendorMaster = db.vendormaster;

exports.createNewBank = async (req, res) => {
  try {
    // Validate request body to ensure it's a non-empty array
    if (!Array.isArray(req.body) || req.body.length === 0) {
      return res.status(400).json({
        message: "Request body must be a non-empty array of bank details.",
      });
    }

    // Validate each bank object in the array
    for (const bank of req.body) {
      if (!bank.BankName) {
        return res.status(400).json({ message: "BankName cannot be empty." });
      }

      // Validate that the VendorMasterID exists in the VendorMaster table
      const existingVendor = await VendorMaster.findOne({
        where: { VendorMasterID: bank.VendorMasterID },
      });

      if (!existingVendor) {
        return res.status(400).json({
          message: `No matching vendor found with VendorMasterID: ${bank.VendorMasterID}.`,
        });
      }

      // Check if the bank already exists for the vendor
      const existingModel = await VendorBankDetails.findOne({
        where: { BankName: bank.BankName, VendorMasterID: bank.VendorMasterID },
      });
      if (existingModel) {
        return res.status(400).json({
          message: `Bank '${bank.BankName}' already exists for this vendor.`,
        });
      }
    }

    // Bulk create bank details
    const newBanks = await VendorBankDetails.bulkCreate(
      req.body.map((bank) => ({
        BankName: bank.BankName,
        VendorMasterID: bank.VendorMasterID,
        IFSCCode: bank.IFSCCode,
        AccountNumber: bank.AccountNumber,
        Address: bank.Address,
        AccountHolderName: bank.AccountHolderName,
        bank: bank.bank,
        PINCode: bank.PINCode,
        IsActive: bank.IsActive || true,
        Status: bank.Status || "Active",
      }))
    );

    // Log and return the created bank details
    console.log("New Vendor Banks created:", newBanks);
    return res.status(201).json(newBanks); // Send the newly created banks as response
  } catch (err) {
    // Handle specific errors
    if (err.name === "SequelizeValidationError") {
      return res.status(400).json({
        message: "Validation error",
        details: err.errors.map((e) => e.message),
      });
    }

    if (err.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message: "Database error occurred while creating Vendor Banks.",
        details: err.message,
      });
    }

    if (err.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: err.message,
      });
    }

    console.error("Error creating Vendor Banks:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.bulkUpdateVendorBank = async (req, res) => {
  try {
    const { banks } = req.body;

    // Validate request
    if (!Array.isArray(banks) || banks.length === 0) {
      return res.status(400).json({
        message: "Request body must be a non-empty array of banks.",
      });
    }

    const updatedbanks = [];
    const addedbanks = [];
    const errors = [];

    for (const bank of banks) {
      const { VendorMasterID, VendorBankDetailsID } = bank;

      // Validate VendorMasterID
      if (!VendorMasterID) {
        errors.push({
          VendorMasterID,
          VendorBankDetailsID,
          message: "VendorMasterID is required.",
        });
        continue;
      }

      try {
        // Check if record exists
        const vendorbank = await VendorBankDetails.findOne({
          where: {
            VendorMasterID,
            VendorBankDetailsID,
          },
        });

        if (vendorbank) {
          // Update existing fields
          vendorbank.BankName = bank.BankName || vendorbank.BankName;
          vendorbank.IFSCCode = bank.IFSCCode || vendorbank.IFSCCode;
          vendorbank.AccountNumber =
            bank.AccountNumber || vendorbank.AccountNumber;
          vendorbank.AccountHolderName =
            bank.AccountHolderName || vendorbank.AccountHolderName;
          vendorbank.Address = bank.Address || vendorbank.Address;
          vendorbank.IsActive =
            bank.IsActive !== undefined ? bank.IsActive : vendorbank.IsActive;
          vendorbank.Status = bank.Status || vendorbank.Status;
          vendorbank.ModifiedDate = new Date();

          // Save the updated record
          const updatedVendorbank = await vendorbank.save();
          updatedbanks.push(updatedVendorbank);
        } else {
          // Create a new record
          const newVendorbank = await VendorBankDetails.create({
            VendorMasterID,
            VendorBankDetailsID,
            BankName: bank.BankName || null,
            IFSCCode: bank.IFSCCode || null,
            AccountNumber: bank.AccountNumber || null,
            AccountHolderName: bank.AccountHolderName || null,
            Address: bank.Address || null,
            IsActive: bank.IsActive !== undefined ? bank.IsActive : true, // Default to true if IsActive is not provided
            Status: bank.Status || "Active", // Default status
            CreatedDate: new Date(),
            ModifiedDate: new Date(),
          });

          addedbanks.push(newVendorbank);
        }
      } catch (error) {
        console.error(
          `Error processing vendor bank for VendorMasterID: ${VendorMasterID}, VendorBankDetailsID: ${
            (VendorMasterID, VendorBankDetailsID)
          }`,
          error
        );
        errors.push({
          VendorMasterID,
          VendorBankDetailsID,
          message: "Error processing this record.",
        });
      }
    }

    return res.status(200).json({
      message: "Bulk operation completed.",
      updated: updatedbanks,
      added: addedbanks,
      errors,
    });
  } catch (err) {
    console.error("Error during bulk operation of vendor banks:", err);
    return res.status(500).json({
      message: "Internal server error.",
    });
  }
};
