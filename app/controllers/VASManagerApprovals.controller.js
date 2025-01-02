/* eslint-disable no-unused-vars */
const db = require("../models");
const VASManagerApprovals = db.vasmanagerapprovals;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;
const VASProductPricing = db.vasproductpricing;
const NewCarBookings = db.NewCarBookings;
const ValueAddedService = db.valueaddedservice;
const CustomerMaster = db.customermaster;
const StateMaster = db.statemaster;
const RegionMaster = db.regionmaster;
const ManagerApprovalsMap = db.managerapprovalsmap;
// Basic CRUD API
// Create and Save a new VASManagerApprovals
exports.create = async (req, res) => {
  const {
    BookingID,
    UserID,
    BranchID,
    Reason,
    Remarks,
    IsActive,
    Status,
    VASProductID,
  } = req.body;

  if (
    !VASProductID ||
    !Array.isArray(VASProductID) ||
    VASProductID.length === 0
  ) {
    return res.status(400).json({
      message: "VASProductID is required and should be a non-empty array.",
    });
  }

  try {
    // Create a record in VASManagerApprovals table
    const vasmanagerapprovals = {
      BookingID,
      UserID,
      BranchID,
      Reason: Reason || null,
      Remarks: Remarks || null,
      IsActive: IsActive !== undefined ? IsActive : true,
      Status: Status || "Pending",
    };

    const newVASManagerApprovals = await VASManagerApprovals.create(
      vasmanagerapprovals
    );

    // Map VASProductID to ManagerApprovalsMap table
    const vasManagerApprovalsID = newVASManagerApprovals.VASManagerApprovalsID;

    const approvalsMap = VASProductID.map((productID) => ({
      VASManagerApprovalsID: vasManagerApprovalsID,
      VASProductID: productID,
    }));

    await ManagerApprovalsMap.bulkCreate(approvalsMap);

    return res.status(201).json({
      message: "VAS Manager Approvals created successfully.",
      VASManagerApprovals: newVASManagerApprovals,
      ApprovalsMap: approvalsMap,
    });
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
        message: "Database error occurred while creating ValueAddedService.",
        details: err.message,
      });
    }

    if (err.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: err.message,
      });
    }

    console.error("Error creating ValueAddedService:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.AddVasProductToBooking = async (req, res) => {
  // Validate request
  try {
    // Access uploaded file paths
    //const filePaths = req.files.map((file) => file.path);

    // Create a model
    const newVasproductDetail = {
      BookingID: req.body.BookingID,
      UserID: req.body.UserID,
      BranchID: req.body.BranchID,
      VASProductID: req.body.VASProductID,
      Status: "Applied",
      IsActive: req.body.IsActive || true,
    };

    // Save VariantMasters in the database
    const AddVastoBooking = await VASManagerApprovals.create(
      newVasproductDetail
    );

    return res.status(201).json(AddVastoBooking); // Send the newly created VariantMaster as response
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
        message: "Database error occurred while creating VariantMaster.",
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
    console.error("Error creating VariantMaster:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.GetVasProductsByBookingID = async (req, res) => {
  try {
    const { BranchID, UserID, BookingID } = req.query;

    // Validate required query parameters
    if (!BranchID || !UserID || !BookingID) {
      return res.status(400).json({
        errorCode: "INVALID_REQUEST",
        message:
          "Missing required query parameters: BranchID, UserID, or BookingID.",
      });
    }

    // Fetch all variant data with included transmission data
    const mapData = await VASManagerApprovals.findAll({
      where: { BookingID, BranchID, UserID },
      include: [
        {
          model: VASProductPricing,
          as: "VASMAVASProductID",
          attributes: [
            "OptionName",
            "ModelName",
            "ProductType",
            "TotalValue",
            "Mandatory",
          ],
        },
      ],
    });

    // Check if data is empty
    if (!mapData || mapData.length === 0) {
      return res.status(404).json({
        errorCode: "NO_DATA_FOUND",
        message: "No variant data found for the provided criteria.",
      });
    }

    // Restructure the data to match the desired format
    const responseData = mapData.map((item) => ({
      VASManagerApprovalsID: item.VASManagerApprovalsID,
      Reason: item.Reason,
      Remarks: item.Remarks,
      Status: item.Status,
      OptionName: item.VASMAVASProductID?.OptionName || null,
      ModelName: item.VASMAVASProductID?.ModelName || null,
      ProductType: item.VASMAVASProductID?.ProductType || null,
      TotalValue: item.VASMAVASProductID?.TotalValue || null,
      Mandatory: item.VASMAVASProductID?.Mandatory || null,
    }));

    // Successful response
    res.status(200).json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error("Error retrieving variant data:", {
      errorName: error.name,
      message: error.message,
      stack: error.stack,
    });

    // Handle specific Sequelize errors
    if (error.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        errorCode: "DATABASE_ERROR",
        message: "A database error occurred while retrieving data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      return res.status(503).json({
        errorCode: "SERVICE_UNAVAILABLE",
        message: "Unable to connect to the database. Please try again later.",
        details: error.message,
      });
    }

    // General fallback for unexpected errors
    res.status(500).json({
      errorCode: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred. Please contact support.",
    });
  }
};

exports.findAllVASManagerApprovals = async (req, res) => {
  try {
    const { BranchID } = req.query;

    // Fetch all variant data with included transmission data
    const mapData = await VASManagerApprovals.findAll({
      where: { BranchID },
      attributes: [
        "VASManagerApprovalsID",
        "BookingID",
        "UserID",
        "BranchID",
        "VASProductID",
        "Reason",
        "Remarks",
        "Status",
        "CreatedDate",
      ],
      include: [
        {
          model: NewCarBookings,
          as: "VASMABookingID",
          attributes: ["BookingNo", "FirstName", "LastName"],
        },
        {
          model: VASProductPricing,
          as: "VASMAVASProductID",
          attributes: [
            "VASProductID",
            "VASID",
            "OptionName",
            "ModelName",
            "VariantName",
            "ProductType",
            "TotalValue",
            "BranchID",
            "UserID",
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
      order: [["CreatedDate", "DESC"]],
    });

    // Check if data is empty
    if (!mapData || mapData.length === 0) {
      return res.status(404).json({
        message: "No variant data found.",
      });
    }

    // Flatten the response data
    const flattenedData = mapData.map((item) => {
      // Flatten the VASMABookingID (NewCarBookings)
      const bookingData = item.VASMABookingID || {};
      const booking = {
        BookingNo: bookingData.BookingNo || null,
        FirstName: bookingData.FirstName || null,
        LastName: bookingData.LastName || null,
      };

      // Flatten the VASMAVASProductID (VASProductPricing)
      const productPricingData = item.VASMAVASProductID || {};
      const productPricing = {
        VASProductID: productPricingData.VASProductID || null,
        VASID: productPricingData.VASID || null,
        OptionName: productPricingData.OptionName || null,
        ModelName: productPricingData.ModelName || null,
        VariantName: productPricingData.VariantName || null,
        ProductType: productPricingData.ProductType || null,
        TotalValue: productPricingData.TotalValue || null,
        BranchID: productPricingData.BranchID || null,
        UserID: productPricingData.UserID || null,
      };

      // Flatten the ValueAddedService (VPPVASID)
      const valueAddedServiceData = productPricingData.VPPVASID || {};
      const valueAddedService = {
        ProductName: valueAddedServiceData.ProductName || null,
      };

      // Combine everything into a flat structure
      return {
        VASManagerApprovalsID: item.VASManagerApprovalsID,
        BookingID: item.BookingID,
        UserID: item.UserID,
        BranchID: item.BranchID,
        VASProductID: item.VASProductID,
        Reason: item.Reason,
        Remarks: item.Remarks,
        Status: item.Status,
        CreatedDate: item.CreatedDate,
        ...booking,
        ...productPricing,
        ...valueAddedService,
      };
    });

    // Send the flattened data as response
    res.json(flattenedData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while retrieving vas data.",
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

    console.error("Error retrieving vas data:", error);
    res.status(500).json({
      message: "Failed to retrieve vas data. Please try again later.",
    });
  }
};

// Retrieve single VASManagerApprovals from the database.
exports.findOne = async (req, res) => {
  try {
    const { BranchID, UserID, VASManagerApprovalsID } = req.query;
    // Fetch all variant data with included transmission data
    const mapData = await ManagerApprovalsMap.findAll({
      where: { VASManagerApprovalsID },
      attributes: [
        "ManagerApprovalsMapID",
        "VASManagerApprovalsID",
        "VASProductID",
        "IsActive",
        "Status",
      ],
      include: [
        {
          model: VASManagerApprovals,
          as: "MAMVASManagerApprovalsID",
          attributes: [
            "BookingID",
            "UserID",
            "BranchID",
            "Reason",
            "Remarks",
            "Status",
          ],
          where: { BranchID, UserID },
          include: [
            {
              model: NewCarBookings,
              as: "VASMABookingID",
              attributes: [
                "BookingNo",
                "FirstName",
                "LastName",
                "ModelName",
                "ColourName",
                "VariantName",
                "Transmission",
                "Fuel",
                "CorporateSchema",
                "RegistrationType",
                "Finance",
                "Insurance",
                "Exchange",
                "Title",
                "PhoneNo",
                "OfficeNo",
                "Email",
                "Occupation",
                "Company",
                "DOB",
                "DateOfAnniversary",
                "Address",
                "PINCode",
                "District",
                "State",
              ],
            },
          ],
        },

        {
          model: VASProductPricing,
          as: "MAMVASProductID",
          attributes: [
            "VASProductID",
            "VASID",
            "OptionName",
            "ModelName",
            "ProductType",
            "TotalValue",
            "BranchID",
            "UserID",
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
      order: [
        ["ManagerApprovalsMapID", "ASC"], // Order by ModelDescription in ascending order
      ],
    });

    // Check if data is empty
    if (!mapData || mapData.length === 0) {
      return res.status(404).json({
        message: "No variant data found.",
      });
    }

    // Send the combined data as response
    res.json(mapData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while retrieving variant name data.",
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
    console.error("Error retrieving variant data:", error);
    res.status(500).json({
      message: "Failed to retrieve variant data. Please try again later.",
    });
  }
};
// Update a VASProductPricing by the id in the request
exports.updateByPk = async (req, res) => {
  try {
    // Find the model by ID
    const vasManagerApprovalsID = req.params.id;
    let vASManagerApprovalsID = await VASManagerApprovals.findByPk(
      vasManagerApprovalsID
    );
    console.log("vASManagerApprovalsID data: ", vASManagerApprovalsID);

    if (!vASManagerApprovalsID) {
      return res
        .status(404)
        .json({ message: "vasManagerApprovalsID not found" });
    }

    // Update other fields
    vASManagerApprovalsID.Status =
      req.body.Status || vASManagerApprovalsID.Status || "Pending";
    vASManagerApprovalsID.Remarks =
      req.body.Remarks || vASManagerApprovalsID.Remarks || null;
    vASManagerApprovalsID.Reason =
      req.body.Reason || vASManagerApprovalsID.Reason || null;
    vASManagerApprovalsID.IsActive =
      req.body.IsActive !== undefined
        ? req.body.IsActive
        : vASManagerApprovalsID.IsActive;
    vASManagerApprovalsID.ModifiedDate = new Date();

    console.log("vASManagerApprovals:", vASManagerApprovalsID);

    // Save updated Manager Approval in the database
    const updatedvASManagerApprovalsID = await vASManagerApprovalsID.save();

    return res.status(200).json(updatedvASManagerApprovalsID); // Send the updated updatedvASManagerApprovalsID as response
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
        message: "Database error occurred while updating ManagerApprovals.",
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
    console.error("Error updating ManagerApprovals:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
// Delete a VASManagerApprovals with the specified id in the request
exports.deleteById = async (req, res) => {
  const id = req.params.id;
  const { Reason } = req.query; // Get the reason from the request body

  try {
    // Find the VASManagerApproval by ID
    const vasManagerApprovals = await VASManagerApprovals.findByPk(id);

    // Check if the model exists
    if (!vasManagerApprovals) {
      return res
        .status(404)
        .json({ message: "VASManagerApprovals not found with id: " + id });
    }

    // Get the VASProductID from the found record
    const { VASProductID } = vasManagerApprovals;

    // Check if the VASProductID exists in the VASProductPricing table
    const vasProductPricing = await VASProductPricing.findOne({
      where: { VASProductID },
    });

    if (!vasProductPricing) {
      return res.status(400).json({
        message:
          "VASProductPricing record not found for the associated VASProductID.",
      });
    }

    // Check if the Mandatory field is true
    if (vasProductPricing.Mandatory) {
      // If Mandatory is true, validate that a reason is provided
      if (!Reason || Reason.trim() === "") {
        return res.status(400).json({
          message:
            "A reason is required because the associated VASProductID is marked as Mandatory.",
        });
      }

      // Update the Status field to "Requested Status" and save the reason
      vasManagerApprovals.Status = "Requested";
      vasManagerApprovals.Reason = Reason; // Assuming there's a `Reason` field in the model
      await vasManagerApprovals.save();

      return res.status(200).json({
        message: `VASManagerApprovals with id: ${id} cannot be deleted. Status updated to 'Pending' and reason saved.`,
        data: {
          Status: vasManagerApprovals.Status,
          Reason: vasManagerApprovals.Reason,
        },
      });
    }

    // If Mandatory is false, proceed with deletion
    await vasManagerApprovals.destroy();

    // Send a success message
    res.status(200).json({
      message: `VASManagerApprovals with id: ${id} deleted successfully.`,
    });
  } catch (err) {
    // Handle errors based on specific types
    if (err.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message:
          "Database error occurred while processing VASManagerApprovals.",
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

    console.error("Error processing VASManagerApprovals:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.findOneDetails = async (req, res) => {
  try {
    const { BranchID, BookingID, VASManagerApprovalsID } = req.query;

    // Fetch VASManagerApprovals data with included NewCarBookings data
    const mapData = await VASManagerApprovals.findAll({
      where: { BranchID, VASManagerApprovalsID },
      attributes: [
        "VASManagerApprovalsID",
        "BookingID",
        "UserID",
        "BranchID",
        "Reason",
        "Remarks",
        "Status",
      ],
      include: [
        {
          model: NewCarBookings,
          as: "VASMABookingID",
          attributes: [
            "BookingNo",
            "FirstName",
            "LastName",
            "ModelName",
            "ColourName",
            "VariantName",
            "Transmission",
            "Fuel",
            "CorporateSchema",
            "RegistrationType",
            "Finance",
            "Insurance",
            "Exchange",
            "Title",
            "PhoneNo",
            "OfficeNo",
            "Email",
            "Occupation",
            "Company",
            "DOB",
            "Gender",
            "DateOfAnniversary",
            "Address",
            "PINCode",
            "District",
            "State",
          ],
          include: [
            {
              model: CustomerMaster,
              as: "NCBCustID",
              attributes: ["CustomerType", "RelationName", "RelationType"],
            },
          ],
        },
      ],
      order: [["VASManagerApprovalsID", "ASC"]], // Ensure correct ordering
    });

    // Check if mapData is empty
    if (!mapData || mapData.length === 0) {
      return res.status(404).json({
        message: "No data found for the given criteria.",
      });
    }

    // Fetch related VAS pricing data
    const vasPricing = await VASManagerApprovals.findAll({
      where: { BookingID },
      attributes: ["VASManagerApprovalsID", "BookingID", "VASProductID"],
      include: [
        {
          model: VASProductPricing,
          as: "VASMAVASProductID",
          attributes: ["OptionName", "VASID", "TotalValue"],
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

    // Combine both datasets into one response object
    res.json({
      mapData,
      vasPricing,
    });
  } catch (error) {
    // Enhanced error handling
    const errorResponse = {
      message: "An error occurred while processing your request.",
      details: error.message,
    };

    if (error.name === "SequelizeDatabaseError") {
      errorResponse.message = "Database error occurred.";
      return res.status(500).json(errorResponse);
    }

    if (error.name === "SequelizeConnectionError") {
      errorResponse.message =
        "Service unavailable. Database connection failed.";
      return res.status(503).json(errorResponse);
    }

    console.error("Error in findOneDetails:", error);
    res.status(500).json(errorResponse);
  }
};
