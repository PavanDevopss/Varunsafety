/* eslint-disable no-dupe-keys */
/* eslint-disable no-unused-vars */
require("dotenv").config();
const db = require("../models");
const VendorAddressDetails = db.vendoraddressdetails;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;
const VendorMaster = db.vendormaster;

// exports.createNewAddress = async (req, res) => {
//   try {
//     // Validate request
//     if (!req.body.Address) {
//       return res.status(400).json({ message: "Address cannot be empty" });
//     }
//     // if (!/^[a-zA-Z ]*$/.test(req.body.Address)) {
//     //   console.log("Validation failed: Address contains special characters.");
//     //   return res.status(400).json({
//     //     message: "Address should contain only letters",
//     //   });
//     // }

//     // Validate that the VendorMasterID exist and match in the VendorMaster table
//     const existingVendor = await VendorMaster.findOne({
//       where: {
//         VendorMasterID: req.body.VendorMasterID,
//       },
//     });

//     if (!existingVendor) {
//       return res.status(400).json({
//         message: "No matching vendor found with the provided VendorMasterID.",
//       });
//     }

//     // Check if vendor address already exists
//     const existingModel = await VendorAddressDetails.findOne({
//       where: { Address: req.body.Address },
//     });
//     if (existingModel) {
//       return res.status(400).json({ message: "Address already exists" });
//     }
//     // Create a new Vendor Address
//     const newVendorAddress = await VendorAddressDetails.create({
//       Address: req.body.Address,
//       VendorMasterID: req.body.VendorMasterID,
//       StateID: req.body.StateID,
//       City: req.body.City,
//       Contact: req.body.Contact,
//       Email: req.body.Email,
//       PINCode: req.body.PINCode,
//       IsActive: req.body.IsActive || true,
//       Status: req.body.Status || "Active",
//     });

//     // Save Vendor Address in database
//     console.log("New Vendor Address created:", newVendorAddress);

//     return res.status(200).json(newVendorAddress); // Send the newly created ChannelMaster as response
//   } catch (err) {
//     // Handle errors based on specific types
//     if (err.name === "SequelizeValidationError") {
//       // Handle Sequelize validation errors
//       return res.status(400).json({
//         message: "Validation error",
//         details: err.errors.map((e) => e.message),
//       });
//     }

//     if (err.name === "SequelizeDatabaseError") {
//       // Handle database errors
//       return res.status(500).json({
//         message: "Database error occurred while creating Vendor Address.",
//         details: err.message,
//       });
//     }

//     if (err.name === "SequelizeConnectionError") {
//       // Handle connection errors
//       return res.status(503).json({
//         message: "Service unavailable. Unable to connect to the database.",
//         details: err.message,
//       });
//     }
//     console.error("Error creating Vendor Address:", err);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };

exports.createNewAddress = async (req, res) => {
  try {
    // Validate request body to ensure it's a non-empty array
    if (!Array.isArray(req.body) || req.body.length === 0) {
      return res.status(400).json({
        message: "Request body must be a non-empty array of addresses.",
      });
    }

    // Validate each address object
    for (const address of req.body) {
      if (!address.Address) {
        return res.status(400).json({ message: "Address cannot be empty." });
      }

      // Validate that the VendorMasterID exists in the VendorMaster table
      const existingVendor = await VendorMaster.findOne({
        where: { VendorMasterID: address.VendorMasterID },
      });

      if (!existingVendor) {
        return res.status(400).json({
          message: `No matching vendor found with VendorMasterID: ${address.VendorMasterID}.`,
        });
      }

      // Check if the address already exists for the vendor
      const existingModel = await VendorAddressDetails.findOne({
        where: { Address: address.Address },
      });
      if (existingModel) {
        return res
          .status(400)
          .json({ message: `Address '${address.Address}' already exists.` });
      }
    }

    // Bulk create addresses
    const newAddresses = await VendorAddressDetails.bulkCreate(
      req.body.map((address) => ({
        Address: address.Address,
        VendorMasterID: address.VendorMasterID,
        StatePOSID: address.StatePOSID,
        City: address.City,
        Contact: address.Contact,
        Email: address.Email,
        PINCode: address.PINCode,
        IsActive: address.IsActive || true,
        Status: address.Status || "Active",
      }))
    );

    // Save Vendor Addresses in database
    console.log("New Vendor Addresses created:", newAddresses);

    return res.status(201).json(newAddresses); // Send the newly created addresses as response
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
        message: "Database error occurred while creating Vendor Addresses.",
        details: err.message,
      });
    }

    if (err.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: err.message,
      });
    }

    console.error("Error creating Vendor Addresses:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
exports.bulkUpdateVendorAddresses = async (req, res) => {
  try {
    const { addresses } = req.body;

    // Validate request
    if (!Array.isArray(addresses) || addresses.length === 0) {
      return res.status(400).json({
        message: "Request body must be a non-empty array of addresses.",
      });
    }

    const updatedAddresses = [];
    const addedAddresses = [];
    const errors = [];

    for (const address of addresses) {
      const { VendorMasterID, VendorAddressDetailsID } = address;

      // Validate VendorMasterID
      if (!VendorMasterID) {
        errors.push({
          VendorMasterID,
          VendorAddressDetailsID,
          message: "VendorMasterID is required.",
        });
        continue;
      }

      try {
        // Check if record exists
        const vendorAddress = await VendorAddressDetails.findOne({
          where: {
            VendorMasterID,
            VendorAddressDetailsID,
          },
        });

        if (vendorAddress) {
          // Update existing fields
          vendorAddress.Address = address.Address || vendorAddress.Address;
          vendorAddress.StatePOSID =
            address.StatePOSID || vendorAddress.StatePOSID;
          vendorAddress.City = address.City || vendorAddress.City;
          vendorAddress.Contact = address.Contact || vendorAddress.Contact;
          vendorAddress.Email = address.Email || vendorAddress.Email;
          vendorAddress.PINCode = address.PINCode || vendorAddress.PINCode;
          vendorAddress.IsActive =
            address.IsActive !== undefined
              ? address.IsActive
              : vendorAddress.IsActive;
          vendorAddress.Status = address.Status || vendorAddress.Status;
          vendorAddress.ModifiedDate = new Date();

          // Save the updated record
          const updatedVendorAddress = await vendorAddress.save();
          updatedAddresses.push(updatedVendorAddress);
        } else {
          // Create a new record
          const newVendorAddress = await VendorAddressDetails.create({
            VendorMasterID,
            VendorAddressDetailsID,
            Address: address.Address || null,
            StateID: address.StateID || null,
            City: address.City || null,
            Contact: address.Contact || null,
            Email: address.Email || null,
            PINCode: address.PINCode || null,
            IsActive: address.IsActive !== undefined ? address.IsActive : true, // Default to true if IsActive is not provided
            Status: address.Status || "Active", // Default status
            CreatedDate: new Date(),
            ModifiedDate: new Date(),
          });

          addedAddresses.push(newVendorAddress);
        }
      } catch (error) {
        console.error(
          `Error processing vendor address for VendorMasterID: ${VendorMasterID}, VendorAddressDetailsID: ${VendorAddressDetailsID}`,
          error
        );
        errors.push({
          VendorMasterID,
          VendorAddressDetailsID,
          message: "Error processing this record.",
        });
      }
    }

    return res.status(200).json({
      message: "Bulk operation completed.",
      updated: updatedAddresses,
      added: addedAddresses,
      errors,
    });
  } catch (err) {
    console.error("Error during bulk operation of vendor addresses:", err);
    return res.status(500).json({
      message: "Internal server error.",
    });
  }
};
