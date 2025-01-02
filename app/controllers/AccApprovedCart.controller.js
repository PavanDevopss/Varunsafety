/* eslint-disable no-unused-vars */
const db = require("../models");
const AccApprovalCart = db.accapprovedcart;
const UserMaster = db.usermaster;
const AccApprovalReq = db.accapprovalreq;
const NewCarBookings = db.NewCarBookings;
const BranchMaster = db.branchmaster;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;

// Basic CRUD API

// Create and Save a new AccApprovalCart
exports.create = async (req, res) => {
  try {
    // Check if AccApprovedCart already exists with the same AccApprovalReqID
    const existingCart = await AccApprovalCart.findOne({
      where: {
        AccApprovalReqID: req.body.AccApprovalReqID,
        // BookingID: req.body.BookingID,
      },
    });

    if (existingCart) {
      // Check if AccCartID values are the same
      const existingAccCartID = existingCart.AccCartID;
      const newAccCartID = req.body.AccCartID || [];

      // Compare arrays (considering order doesn't matter)
      const arraysAreEqual =
        existingAccCartID.length === newAccCartID.length &&
        existingAccCartID.every((value) => newAccCartID.includes(value));

      if (arraysAreEqual) {
        return res
          .status(400)
          .json({ message: "Approved Cart for this Booking already exists." });
      }

      // If they are not equal, update the AccCartID array
      const updatedAccCartID = Array.from(
        new Set([...existingAccCartID, ...newAccCartID])
      );

      // Update the existing model
      await existingCart.update({
        AccCartID: updatedAccCartID,
        TotalGrossValue: req.body.TotalGrossValue || null,
        Discount: req.body.Discount || null,
        NetValue: req.body.NetValue || null,
        NewCarAccOffer: req.body.NewCarAccOffer || null,
        TotalPayableAmt: req.body.TotalPayableAmt || null,
        TotalDiscount: req.body.TotalDiscount || null,
        ApprovalStatus: req.body.ApprovalStatus || existingCart.ApprovalStatus,
        ModifiedDate: new Date(), // Track when the record was last updated
      });

      return res.status(200).json(existingCart); // Send the updated model
    }

    // Map fields from req.body to the AccApprovedCart object
    const accApprovedCartData = {
      AccApprovalReqID: req.body.AccApprovalReqID,
      AccCartID: req.body.AccCartID || [], // Default to an empty array if not provided
      BookingID: req.body.BookingID,
      BranchID: req.body.BranchID || null,
      TotalGrossValue: req.body.TotalGrossValue || 0,
      Discount: req.body.Discount || 0,
      NetValue: req.body.NetValue || 0,
      NewCarAccOffer: req.body.NewCarAccOffer || 0,
      TotalPayableAmt: req.body.TotalPayableAmt || 0,
      IsActive: req.body.IsActive !== undefined ? req.body.IsActive : true,
      Status: req.body.Status || "Active",
      CreatedDate: new Date(),
    };

    // Save the new AccApprovedCart in the database
    const newAccApprovedCart = await AccApprovalCart.create(
      accApprovedCartData
    );

    return res.status(201).json(newAccApprovedCart); // Send the created cart as a response
  } catch (err) {
    // Handle errors based on specific types
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

    if (err.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message: "Database error occurred while creating AccApprovedCart.",
        details: err.message,
      });
    }

    if (err.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: err.message,
      });
    }

    console.error("Error creating AccApprovedCart:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Retrieve all AccApprovalCarts from the database.
exports.findAll = async (req, res) => {
  try {
    // Fetch AccApprovedCart entries with their associations
    const accApprovedCarts = await AccApprovalCart.findAll({
      attributes: [
        "AccApprovedCartID",
        "AccApprovalReqID",
        "AccCartID",
        "BookingID",
        "BranchID",
        "TotalGrossValue",
        "Discount",
        "NetValue",
        "NewCarAccOffer",
        "TotalPayableAmt",
        "IsActive",
        "Status",
        "CreatedDate",
        "ModifiedDate",
      ],
      include: [
        {
          model: NewCarBookings,
          as: "AACBookingID", // Assuming this alias is correctly set in associations
          attributes: ["BookingNo", "BookingTime", "BookingID"],
        },
        {
          model: BranchMaster,
          as: "AACBranchID", // Assuming this alias is correctly set in associations
          attributes: ["BranchID", "BranchName", "BranchCode"],
        },
        {
          model: AccApprovalReq,
          as: "AACAccAprReqID", // Assuming this alias is correctly set in associations
          // attributes:[]
        },
      ],
      order: [["AccApprovedCartID", "ASC"]], // Order by AccApprovedCartID in ascending order
    });

    if (accApprovedCarts.length === 0) {
      return res.status(404).json({ message: "No AccApprovedCarts found" });
    }

    res.status(200).json(accApprovedCarts);
  } catch (error) {
    // Handle specific Sequelize errors
    if (error.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message: "Database error occurred while retrieving approved carts.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    console.error("Error fetching AccApprovedCarts:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Find a single AccApprovalCart with an id
exports.findOne = async (req, res) => {
  const id = req.params.id;

  try {
    // Fetch the AccApprovedCart with the given ID
    const accApprovedCart = await AccApprovalCart.findByPk(id, {
      attributes: [
        "AccApprovedCartID",
        "AccApprovalReqID",
        "AccCartID",
        "BookingID",
        "BranchID",
        "TotalGrossValue",
        "Discount",
        "NetValue",
        "NewCarAccOffer",
        "TotalPayableAmt",
        "IsActive",
        "Status",
        "CreatedDate",
        "ModifiedDate",
      ],
      include: [
        {
          model: NewCarBookings,
          as: "AACBookingID", // Assuming this alias is correctly set in associations
          attributes: ["BookingNo", "BookingTime", "BookingID"],
        },
        {
          model: BranchMaster,
          as: "AACBranchID", // Assuming this alias is correctly set in associations
          attributes: ["BranchID", "BranchName", "BranchCode"],
        },
        {
          model: AccApprovalReq,
          as: "AACAccAprReqID", // Assuming this alias is correctly set in associations
          // attributes:[]
        },
      ],
    });

    if (!accApprovedCart) {
      return res
        .status(404)
        .json({ message: `AccApprovedCart not found with id: ${id}` });
    }

    res.status(200).json(accApprovedCart);
  } catch (error) {
    // Handle specific Sequelize errors
    if (error.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message: "Database error occurred while retrieving cart data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    console.error("Error fetching AccApprovedCart:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Update a AccApprovalCart by the id in the request
exports.update = async (req, res) => {
  console.log("Cart ID:", req.params.id);

  try {
    // Validate request
    if (!req.params.id) {
      return res.status(400).json({ message: "Cart ID is required" });
    }

    const id = req.params.id;

    // Find the cart by ID
    let accApprovedCart = await AccApprovalCart.findByPk(id);
    console.log("Cart data:", accApprovedCart);

    if (!accApprovedCart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Update fields
    accApprovedCart.AccApprovalReqID =
      req.body.AccApprovalReqID || accApprovedCart.AccApprovalReqID;
    accApprovedCart.AccCartID = req.body.AccCartID || accApprovedCart.AccCartID;
    accApprovedCart.BookingID = req.body.BookingID || accApprovedCart.BookingID;
    accApprovedCart.BranchID = req.body.BranchID || accApprovedCart.BranchID;
    accApprovedCart.TotalGrossValue =
      req.body.TotalGrossValue || accApprovedCart.TotalGrossValue;
    accApprovedCart.Discount = req.body.Discount || accApprovedCart.Discount;
    accApprovedCart.NetValue = req.body.NetValue || accApprovedCart.NetValue;
    accApprovedCart.NewCarAccOffer =
      req.body.NewCarAccOffer || accApprovedCart.NewCarAccOffer;
    accApprovedCart.TotalPayableAmt =
      req.body.TotalPayableAmt || accApprovedCart.TotalPayableAmt;
    accApprovedCart.IsActive =
      req.body.IsActive !== undefined
        ? req.body.IsActive
        : accApprovedCart.IsActive;
    accApprovedCart.Status =
      req.body.Status || accApprovedCart.Status || "Active";
    accApprovedCart.ModifiedDate = new Date();

    console.log("Updated model:", accApprovedCart);

    // Save updated cart in the database
    const updatedAccApprovedCart = await accApprovedCart.save();

    return res.status(200).json(updatedAccApprovedCart);
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
        message: "Database error occurred while updating the cart.",
        details: err.message,
      });
    }

    if (err.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: err.message,
      });
    }

    console.error("Error updating cart:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a AccApprovalCart with the specified id in the request
exports.delete = async (req, res) => {
  const id = req.params.id;

  try {
    // Find the cart by ID
    const accApprovedCart = await AccApprovalCart.findByPk(id);

    // Check if the cart exists
    if (!accApprovedCart) {
      return res.status(404).json({ message: `Cart not found with id: ${id}` });
    }

    // Delete the cart
    await accApprovedCart.destroy();

    // Send a success message
    res.status(200).json({
      message: `Cart with id: ${id} deleted successfully`,
    });
  } catch (err) {
    // Handle specific Sequelize errors
    if (err.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message: "Database error occurred while deleting the cart.",
        details: err.message,
      });
    }

    if (err.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: err.message,
      });
    }

    console.error("Error deleting cart:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
