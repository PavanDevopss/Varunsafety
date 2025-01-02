const associateModels = (db) => {
  // Define associations between models here

  // Model Master Associations
  db.modelmaster.belongsTo(db.modeltype, {
    foreignKey: "ModelTypeID", // Foreign key in model master
    targetKey: "ModelTypeID", // Referenced field in model type
    as: "MMModelTypeID", // Alias for this association
  });

  db.modelmaster.belongsTo(db.channelmaster, {
    foreignKey: "ChannelID", // Foreign key in model master
    targetKey: "ChannelID", // Referenced field in channel master
    as: "MMChannelID", // Alias for this association
  });

  // Variant Master Associations
  db.variantmaster.belongsTo(db.transmission, {
    foreignKey: "TransmissionID", // Foreign key in variant master
    targetKey: "TransmissionID", // Referenced field in transmission
    as: "VMTransmissionID", // Alias for this association
  });

  // Colour Master Associations
  db.colourmaster.belongsTo(db.colourcategory, {
    foreignKey: "ColourCategoryID", // Foreign key in colour master
    targetKey: "ColourCategoryID", // Referenced field in colour category
    as: "CMColourCategoryID", // Alias for this association
  });

  // SKU Master Associations
  db.skumaster.belongsTo(db.modelmaster, {
    foreignKey: "ModelMasterID", // Foreign key in SKU master
    targetKey: "ModelMasterID", // Referenced field in model master
    as: "SKUMModelMasterID", // Alias for this association
  });

  db.skumaster.belongsTo(db.variantmaster, {
    foreignKey: "VariantID", // Foreign key in SKU master
    targetKey: "VariantID", // Referenced field in variant master
    as: "SKUMVariantID", // Alias for this association
  });

  db.skumaster.belongsTo(db.fueltypes, {
    foreignKey: "FuelTypeID", // Foreign key in SKU master
    targetKey: "FuelTypeID", // Referenced field in fuel types
    as: "SKUMFuelTypeID", // Alias for this association
  });

  // Division Master Associations
  // db.divisionmaster.belongsTo(db.parentcompany, {
  //   foreignKey: "ParentCmpyID", // Foreign key in division master
  //   targetKey: "ParentCmpyID", // Referenced field in parent company
  //   as: "DMParentCmpyID", // Alias for this association
  // });

  // industry Master Associations
  // db.industrymaster.belongsTo(db.parentcompany, {
  //   foreignKey: "ParentCmpyID", // Foreign key in industry master
  //   targetKey: "ParentCmpyID", // Referenced field in parent company
  //   as: "IMParentCmpyID", // Alias for this association
  // });

  // OEM Master Associations
  db.oemmaster.belongsTo(db.companymaster, {
    foreignKey: "CompanyID", // Foreign key in OEM master
    targetKey: "CompanyID", // Referenced field in parent company
    as: "OEMMCompanyID", // Alias for this association
  });

  db.oemmaster.belongsTo(db.parentcompany, {
    foreignKey: "CompanyID", // Foreign key in OEM master
    targetKey: "ParentCmpyID", // Referenced field in parent company
    as: "OEMMParentCmpyID", // Alias for this association
  });

  // db.oemmaster.belongsTo(db.divisionmaster, {
  //   foreignKey: "DivisionID", // Foreign key in OEM master
  //   targetKey: "DivisionID", // Referenced field in division master
  //   as: "OEMMDivisionID", // Alias for this association
  // });

  db.oemmaster.belongsTo(db.industrymaster, {
    foreignKey: "IndustryID", // Foreign key in OEM master
    targetKey: "IndustryID", // Referenced field in Industry master
    as: "OEMMIndustryID", // Alias for this association
  });

  // Company Master Associations
  db.companymaster.belongsTo(db.parentcompany, {
    foreignKey: "ParentCmpyID", // Foreign key in company master
    targetKey: "ParentCmpyID", // Referenced field in OEM master
    as: "CmpyParentCompany", // Alias for this association
  });

  // db.companymaster.belongsTo(db.oemmaster, {
  //   foreignKey: "OEMID", // Foreign key in company master
  //   targetKey: "OEMID", // Referenced field in OEM master
  //   as: "CmpyMOEMID", // Alias for this association
  // });

  db.companymaster.belongsTo(db.industrymaster, {
    foreignKey: "IndustryID", // Foreign key in company master
    targetKey: "IndustryID", // Referenced field in OEM master
    as: "CmpyIndustryID", // Alias for this association
  });
  db.companymaster.belongsTo(db.statemaster, {
    foreignKey: "StateID", // Foreign key in company master
    targetKey: "StateID", // Referenced field in OEM master
    as: "CmpyStateID", // Alias for this association
  });

  // db.companymaster.belongsToMany(db.companystates, {
  //   through: db.cmpystatemap,
  //   foreignKey: "CompanyID",
  //   otherKey: "CmpyStateID",
  //   as: "CMCmpyStateID", // Alias for this association
  // });

  // Company GST Master Associations
  db.companygstmaster.belongsTo(db.companymaster, {
    foreignKey: "CompanyID", // Foreign key in company gst master
    targetKey: "CompanyID", // Referenced field in Company master
    as: "CmpyGSTMCompanyID", // Alias for this association
  });

  db.companygstmaster.belongsTo(db.statepos, {
    foreignKey: "StatePOSID", // Foreign key in company gst master
    targetKey: "StatePOSID", // Referenced field in StatePOS master
    as: "CmpyGSTMStatePOSID", // Alias for this association
  });

  // State Master Associations
  db.statemaster.belongsTo(db.nationmaster, {
    foreignKey: "NationID", // Foreign key in state master
    targetKey: "NationID", // Referenced field in nation master
    as: "SMNationID", // Alias for this association
  });

  // Company States Associations
  // db.companystates.belongsToMany(db.companymaster, {
  //   through: db.cmpystatemap,
  //   foreignKey: "CmpyStateID",
  //   otherKey: "CompanyID",
  //   as: "CSCompanyID", // Alias for this association
  // });
  db.cmpystatemap.belongsTo(db.companymaster, {
    foreignKey: "CompanyID", // Foreign key in region master
    targetKey: "CompanyID", // Referenced field in state master
    as: "CSMCompanyID", // Alias for this association
  });
  db.cmpystatemap.belongsTo(db.statepos, {
    foreignKey: "StatePOSID", // Foreign key in region master
    targetKey: "StatePOSID", // Referenced field in state master
    as: "CSMStatePOSID", // Alias for this association
  });

  // Region Master Associations
  db.regionmaster.belongsTo(db.statemaster, {
    foreignKey: "StateID", // Foreign key in region master
    targetKey: "StateID", // Referenced field in state master
    as: "RMStateID", // Alias for this association
  });
  // Company Region Associations
  db.companyregions.belongsTo(db.companystates, {
    foreignKey: "CmpyStateID",
    targetKey: "CmpyStateID", // Referenced field in state master
    as: "CRCmpyStateID", // Alias for this association
  });

  db.companyregions.belongsTo(db.statepos, {
    foreignKey: "StatePOSID",
    targetKey: "StatePOSID", // Referenced field in state master
    as: "CRCStatePOSID", // Alias for this association
  });

  db.companyregions.belongsTo(db.companymaster, {
    foreignKey: "CompanyID", // Foreign key in region master
    targetKey: "CompanyID", // Referenced field in state master
    as: "CRCompanyID", // Alias for this association
  });

  // Cluster Master Associations
  db.clustermaster.belongsTo(db.branchmaster, {
    foreignKey: "BranchID", // Foreign key in cluster master
    targetKey: "BranchID", // Referenced field in branch master
    as: "CMBranchID", // Alias for this association
  });

  // Branch Master Associations
  db.branchmaster.belongsTo(db.companymaster, {
    foreignKey: "CompanyID", // Foreign key in branch master
    targetKey: "CompanyID", // Referenced field in company master
    as: "BMCompanyID", // Alias for this association
  });

  db.branchmaster.belongsTo(db.branchtypes, {
    foreignKey: "BranchTypeID", // Foreign key in branch master
    targetKey: "BranchTypeID", // Referenced field in branch types
    as: "BMBranchTypeID", // Alias for this association
  });

  db.branchmaster.belongsTo(db.regionmaster, {
    foreignKey: "RegionID", // Foreign key in branch master
    targetKey: "RegionID", // Referenced field in region master
    as: "BMRegionID", // Alias for this association
  });

  db.branchmaster.belongsTo(db.companyregions, {
    foreignKey: "CmpyRegionID", // Foreign key in branch master
    targetKey: "CmpyRegionID", // Referenced field in region master
    as: "BMCmpyRegionID", // Alias for this association
  });

  db.branchmaster.belongsTo(db.companystates, {
    foreignKey: "CmpyStateID", // Foreign key in branch master
    targetKey: "CmpyStateID", // Referenced field in region master
    as: "BMCmpyStateID", // Alias for this association
  });

  db.branchmaster.belongsTo(db.channelmaster, {
    foreignKey: "ChannelID", // Foreign key in branch master
    targetKey: "ChannelID", // Referenced field in channel master
    as: "BMChannelID", // Alias for this association
  });

  db.branchmaster.belongsTo(db.statepos, {
    foreignKey: "StatePOSID", // Foreign key in branch master
    targetKey: "StatePOSID", // Referenced field in channel master
    as: "BMStatePOSID", // Alias for this association
  });

  db.branchmaster.belongsTo(db.oemmaster, {
    foreignKey: "OEMID", // Foreign key in branch master
    targetKey: "OEMID", // Referenced field in channel master
    as: "BMOEMID", // Alias for this association
  });

  db.branchmaster.belongsTo(db.companygstmaster, {
    foreignKey: "CmpyGSTID", // Foreign key in branch master
    targetKey: "CmpyGSTID", // Referenced field in channel master
    as: "BMCmpyGSTID", // Alias for this association
  });

  // Branch Indents Associations
  db.branchindents.belongsTo(db.branchmaster, {
    foreignKey: "FromBranch", // Foreign key in branch indents
    targetKey: "BranchID", // Referenced field in branch master
    as: "BIFromBranchID", // Alias for this association
  });

  db.branchindents.belongsTo(db.branchmaster, {
    foreignKey: "ToBranch", // Foreign key in branch indents
    targetKey: "BranchID", // Referenced field in branch master
    as: "BIToBranchID", // Alias for this association
  });

  // Channel Master Associations
  db.channelmaster.belongsTo(db.oemmaster, {
    foreignKey: "OEMID", // Foreign key in branch transfers
    targetKey: "OEMID", // Referenced field in branch indents
    as: "ChannelOEMID", // Alias for this association
  });
  db.channelmaster.belongsTo(db.companymaster, {
    foreignKey: "CompanyID", // Foreign key in branch transfers
    targetKey: "CompanyID", // Referenced field in branch indents
    as: "ChannelCompanyID", // Alias for this association
  });

  // Branch Transfers Associations
  db.branchtransfers.belongsTo(db.branchindents, {
    foreignKey: "IndentID", // Foreign key in branch transfers
    targetKey: "IndentID", // Referenced field in branch indents
    as: "BTIndentID", // Alias for this association
  });

  db.branchtransfers.belongsTo(db.branchmaster, {
    foreignKey: "FromBranch", // Foreign key in branch indents
    targetKey: "BranchID", // Referenced field in branch master
    as: "BTFromBranchID", // Alias for this association
  });

  db.branchtransfers.belongsTo(db.branchmaster, {
    foreignKey: "ToBranch", // Foreign key in branch indents
    targetKey: "BranchID", // Referenced field in branch master
    as: "BTToBranchID", // Alias for this association
  });

  db.branchtransfers.belongsTo(db.usermaster, {
    foreignKey: "DriverID", // Foreign key in branch indents
    targetKey: "UserID", // Referenced field in branch master
    as: "BTDriverID", // Alias for this association
  });

  db.branchtransfers.belongsTo(db.usermaster, {
    foreignKey: "IssuedBy", // Foreign key in branch indents
    targetKey: "UserID", // Referenced field in branch master
    as: "BTIssuerID", // Alias for this association
  });

  db.branchtransfers.belongsTo(db.vehiclestock, {
    foreignKey: "PurchaseID", // Foreign key in branch indents
    targetKey: "PurchaseID", // Referenced field in branch master
    as: "BTPurchaseID", // Alias for this association
  });

  // Dealer Indents Associations
  db.dealerindents.belongsTo(db.branchmaster, {
    foreignKey: "FromBranch", // Foreign key in dealer indents
    targetKey: "BranchID", // Referenced field in branch master
    as: "DIFromBranchID", // Alias for this association
  });

  db.dealerindents.belongsTo(db.vendormaster, {
    foreignKey: "ToRegion", // Foreign key in dealer indents
    targetKey: "VendorMasterID", // Referenced field in region master
    as: "DIToRegionID", // Alias for this association
  });

  // Dealer Transfers Associations
  db.dealertransfers.belongsTo(db.dealerindents, {
    foreignKey: "IndentID", // Foreign key in dealer transfers
    targetKey: "IndentID", // Referenced field in dealer indents
    as: "DTIndentID", // Alias for this association
  });

  db.dealertransfers.belongsTo(db.branchmaster, {
    foreignKey: "FromBranch", // Foreign key in branch indents
    targetKey: "BranchID", // Referenced field in branch master
    as: "DTFromBranchID", // Alias for this association
  });

  db.dealertransfers.belongsTo(db.vendormaster, {
    foreignKey: "ToRegion", // Foreign key in branch indents
    targetKey: "VendorMasterID", // Referenced field in branch master
    as: "DTToRegionID", // Alias for this association
  });

  db.dealertransfers.belongsTo(db.usermaster, {
    foreignKey: "DriverID", // Foreign key in branch indents
    targetKey: "UserID", // Referenced field in branch master
    as: "DTDriverID", // Alias for this association
  });

  db.dealertransfers.belongsTo(db.usermaster, {
    foreignKey: "IssuedBy", // Foreign key in branch indents
    targetKey: "UserID", // Referenced field in branch master
    as: "DTIssuerID", // Alias for this association
  });

  db.dealertransfers.belongsTo(db.vehiclestock, {
    foreignKey: "PurchaseID", // Foreign key in branch indents
    targetKey: "PurchaseID", // Referenced field in branch master
    as: "DTPurchaseID", // Alias for this association
  });

  // Offers Associations
  db.offers.belongsTo(db.discountmaster, {
    foreignKey: "DiscountID", // Foreign key in offers
    targetKey: "DiscountID", // Referenced field in discount master
    as: "ODiscountID", // Alias for this association
  });

  db.offers.belongsTo(db.branchmaster, {
    foreignKey: "BranchID", // Foreign key in offers
    targetKey: "BranchID", // Referenced field in branch master
    as: "OBranchID", // Alias for this association
  });

  db.offers.belongsTo(db.modelmaster, {
    foreignKey: "ModelID", // Foreign key in offers
    targetKey: "ModelMasterID", // Referenced field in model master
    as: "OModelID", // Alias for this association
  });

  db.offers.belongsTo(db.variantmaster, {
    foreignKey: "VariantID", // Foreign key in offers
    targetKey: "VariantID", // Referenced field in variant master
    as: "OVariantID", // Alias for this association
  });

  db.offers.belongsTo(db.colourmaster, {
    foreignKey: "ColourID", // Foreign key in offers
    targetKey: "ColourID", // Referenced field in colour master
    as: "OColourID", // Alias for this association
  });

  db.offers.belongsTo(db.transmission, {
    foreignKey: "TransmissionID", // Foreign key in offers
    targetKey: "TransmissionID", // Referenced field in transmission
    as: "OTransmissionID", // Alias for this association
  });

  db.offers.belongsTo(db.fueltypes, {
    foreignKey: "FuelTypeID", // Foreign key in offers
    targetKey: "FuelTypeID", // Referenced field in fuel types
    as: "OFuelTypeID", // Alias for this association
  });

  // Forms Master Associations
  db.formsmaster.belongsTo(db.modulemaster, {
    foreignKey: "ModuleID", // Foreign key in forms master
    targetKey: "ModuleID", // Referenced field in module master
    as: "FMModuleID", // Alias for this association
  });

  // Role Master Associations
  db.rolesmaster.belongsTo(db.departmentmaster, {
    foreignKey: "DeptID", // Foreign key in roles master
    targetKey: "DeptID", // Referenced field in department master
    as: "RMDeptID", // Alias for this association
  });

  // Form Access Rights Associations
  db.formaccessrights.belongsTo(db.rolesmaster, {
    foreignKey: "RoleID", // Foreign key in form access rights
    targetKey: "RoleID", // Referenced field in roles master
    as: "FARRoleID", // Alias for this association
  });

  db.formaccessrights.belongsTo(db.formsmaster, {
    foreignKey: "FormID", // Foreign key in form access rights
    targetKey: "FormID", // Referenced field in forms master
    as: "FARFormID", // Alias for this association
  });

  db.formaccessrights.belongsTo(db.apiactionmaster, {
    foreignKey: "ActionID", // Foreign key in form access rights
    targetKey: "ActionID", // Referenced field in API action master
    as: "FARActionID", // Alias for this association
  });
  db.formaccessrights.belongsTo(db.modulemaster, {
    foreignKey: "ModuleID", // Foreign key in form access rights
    targetKey: "ModuleID", // Referenced field in API action master
    as: "FARModuleID", // Alias for this association
  });

  // Teams Associations
  db.teams.belongsTo(db.branchmaster, {
    foreignKey: "BranchID", // Foreign key in teams
    targetKey: "BranchID", // Referenced field in branch master
    as: "TBranchID", // Alias for this association
  });

  db.teams.belongsTo(db.departmentmaster, {
    foreignKey: "DeptID", // Foreign key in teams
    targetKey: "DeptID", // Referenced field in department master
    as: "TDeptID", // Alias for this association
  });

  db.teams.belongsTo(db.usermaster, {
    foreignKey: "TeamLeadID", // Foreign key in teams
    targetKey: "UserID", // Referenced field in department master
    as: "TTeamLeadID", // Alias for this association
  });
  // Team Members Associations
  db.teammembers.belongsTo(db.teams, {
    foreignKey: "TeamID", // Foreign key in team members
    targetKey: "TeamID", // Referenced field in teams
    as: "TMTeamID", // Alias for this association
  });

  db.teammembers.belongsTo(db.usermaster, {
    foreignKey: "UserID", // Foreign key in team members
    targetKey: "UserID", // Referenced field in user master
    as: "TMUserID", // Alias for this association
  });

  // Customer Document Information Associations
  db.customerdocinfo.belongsTo(db.customerdocinfo, {
    foreignKey: "CustomerID", // Foreign key in customer document info
    targetKey: "CustomerID", // Referenced field in customer document info
    as: "CDICustID", // Alias for this association
  });

  db.customerdocinfo.belongsTo(db.documenttypes, {
    foreignKey: "DocTypeID", // Foreign key in customer document info
    targetKey: "DocTypeID", // Referenced field in document types
    as: "CDIDocTypeID", // Alias for this association
  });

  // Customer Employee Mapping Associations
  db.CustEmpMaping.belongsTo(db.customermaster, {
    foreignKey: "CustomerID", // Foreign key in customer employee mapping
    targetKey: "CustomerID", // Referenced field in customer master
    as: "CEMCustID", // Alias for this association
  });

  db.CustEmpMaping.belongsTo(db.usermaster, {
    foreignKey: "EmpID", // Foreign key in customer employee mapping
    targetKey: "UserID", // Referenced field in user master (changed from EmpID to UserID)
    as: "CEMEmpID", // Alias for this association
  });

  // Customer GST Information Associations
  db.customergstinfo.belongsTo(db.customermaster, {
    foreignKey: "CustomerID", // Foreign key in customer GST info
    targetKey: "CustomerID", // Referenced field in customer master
    as: "CGICustID", // Alias for this association
  });

  db.customergstinfo.belongsTo(db.customerdocinfo, {
    foreignKey: "DocID", // Foreign key in customer GST info
    targetKey: "DocID", // Referenced field in customer document info
    as: "CGIDocID", // Alias for this association
  });

  db.customergstinfo.belongsTo(db.statepos, {
    foreignKey: "StateID", // Foreign key in customer GST info
    targetKey: "StatePOSID", // Referenced field in state position
    as: "CGIStatePOSID", // Alias for this association
  });

  // Document Verification Associations
  db.documentverification.belongsTo(db.customermaster, {
    foreignKey: "CustomerID", // Foreign key in document verification
    targetKey: "CustomerID", // Referenced field in customer master
    as: "DVCustID", // Alias for this association
  });

  db.documentverification.belongsTo(db.customerdocinfo, {
    foreignKey: "DocID", // Foreign key in document verification
    targetKey: "DocID", // Referenced field in customer document info
    as: "DVDocID", // Alias for this association
  });

  db.documentverification.belongsTo(db.customergstinfo, {
    foreignKey: "GSTID", // Foreign key in document verification
    targetKey: "GSTID", // Referenced field in customer GST info
    as: "DVGSTID", // Alias for this association
  });

  db.documentverification.belongsTo(db.usermaster, {
    foreignKey: "UploadBy", // Foreign key in document verification
    targetKey: "EmpID", // Referenced field in user master
    as: "DVUByEmpID", // Alias for this association
  });

  db.documentverification.belongsTo(db.usermaster, {
    foreignKey: "ApprovedBy", // Foreign key in document verification
    targetKey: "EmpID", // Referenced field in user master
    as: "DVAByEmpID", // Alias for this association
  });

  // New Car Bookings Associations
  db.NewCarBookings.belongsTo(db.usermaster, {
    foreignKey: "SalesPersonID", // Foreign key in new car bookings
    targetKey: "UserID", // Referenced field in user master
    as: "NCBSPUserID", // Alias for this association
  });

  db.NewCarBookings.belongsTo(db.usermaster, {
    foreignKey: "TeamLeadID", // Foreign key in new car bookings
    targetKey: "UserID", // Referenced field in user master
    as: "NCBTLUserID", // Alias for this association
  });

  // db.NewCarBookings.belongsTo(db.modelmaster, {
  //   foreignKey: "ModelID", // Foreign key in new car bookings
  //   targetKey: "ModelMasterID", // Referenced field in model master
  //   as: "NCBModelID", // Alias for this association
  // });

  // db.NewCarBookings.belongsTo(db.variantmaster, {
  //   foreignKey: "VariantID", // Foreign key in new car bookings
  //   targetKey: "VariantID", // Referenced field in variant master
  //   as: "NCBVariantID", // Alias for this association
  // });

  // db.NewCarBookings.belongsTo(db.colourmaster, {
  //   foreignKey: "ColourID", // Foreign key in new car bookings
  //   targetKey: "ColourID", // Referenced field in colour master
  //   as: "NCBColourID", // Alias for this association
  // });

  // db.NewCarBookings.belongsTo(db.branchmaster, {
  //   foreignKey: "BranchID", // Foreign key in new car bookings
  //   targetKey: "BranchID", // Referenced field in branch master
  //   as: "NCBBranchID", // Alias for this association
  // });

  db.NewCarBookings.belongsTo(db.customermaster, {
    foreignKey: "CustomerID", // Foreign key in new car bookings
    targetKey: "CustomerID", // Referenced field in customer master
    as: "NCBCustID", // Alias for this association
  });

  // Payment Requests Associations
  db.PaymentRequests.belongsTo(db.customermaster, {
    foreignKey: "CustomerID", // Foreign key in payment requests
    targetKey: "CustomerID", // Referenced field in customer master
    as: "PRqCustID", // Alias for this association
  });

  db.PaymentRequests.belongsTo(db.usermaster, {
    foreignKey: "RequestBy", // Foreign key in payment requests
    targetKey: "UserID", // Referenced field in user master
    as: "PRqUserID", // Alias for this association
  });

  db.PaymentRequests.belongsTo(db.branchmaster, {
    foreignKey: "CollectionBranchID", // Foreign key in payment requests
    targetKey: "BranchID", // Referenced field in branch master
    as: "PRqBranchID", // Alias for this association
  });

  db.PaymentRequests.belongsTo(db.paymentRef, {
    foreignKey: "RefTypeID", // Foreign key in payment requests
    targetKey: "ID", // Referenced field in payment reference
    as: "PRqRefTypeID", // Alias for this association
  });

  db.PaymentRequests.belongsTo(db.financeloanapplication, {
    foreignKey: "FinanceLoanID", // Foreign key in payment requests
    targetKey: "FinanceLoanID", // Referenced field in payment reference
    as: "PRFinanceLoanID", // Alias for this association
  });

  // Customer Receipts Associations
  db.CustReceipt.belongsTo(db.customermaster, {
    foreignKey: "CustID", // Foreign key in customer receipts
    targetKey: "CustomerID", // Referenced field in customer master
    as: "CRCustID", // Alias for this association
  });

  db.CustReceipt.belongsTo(db.usermaster, {
    foreignKey: "AuthorisedBy", // Foreign key in customer receipts
    targetKey: "UserID", // Referenced field in user master
    as: "CRAuthByID", // Alias for this association
  });

  db.CustReceipt.belongsTo(db.branchmaster, {
    foreignKey: "BranchID", // Foreign key in customer receipts
    targetKey: "BranchID", // Referenced field in branch master
    as: "CRBranchID", // Alias for this association
  });

  db.CustReceipt.belongsTo(db.PaymentRequests, {
    foreignKey: "RequestID", // Foreign key in customer receipts
    targetKey: "ID", // Referenced field in payment requests
    as: "CRReqID", // Alias for this association
  });

  // Colour Mapping Associations
  db.colourmapping.belongsTo(db.skumaster, {
    foreignKey: "SKUID", // Foreign key in colour mapping
    targetKey: "SKUID", // Referenced field in SKU master
    as: "CMapSKUID", // Alias for this association
  });

  db.colourmapping.belongsTo(db.colourmaster, {
    foreignKey: "ColourID", // Foreign key in colour mapping
    targetKey: "ColourID", // Referenced field in colour master
    as: "CMapColourID", // Alias for this association
  });

  // Vehicle Stock Associations
  db.vehiclestock.belongsTo(db.vendormaster, {
    foreignKey: "VendorID", // Foreign key in purchase entries
    targetKey: "VendorMasterID", // Referenced field in vendor master
    as: "PEVendorID", // Alias for this association
  });

  db.vehiclestock.belongsTo(db.branchmaster, {
    foreignKey: "BranchID", // Foreign key in purchase entries
    targetKey: "BranchID", // Referenced field in branch master
    as: "PEBranchID", // Alias for this association
  });

  // Variant Mapping Associations
  db.variantmapping.belongsTo(db.variantmaster, {
    foreignKey: "VariantID", // Foreign key in variant mapping
    targetKey: "VariantID", // Referenced field in variant master
    as: "VMVariantID", // Alias for this association
  });

  db.variantmapping.belongsTo(db.modelmaster, {
    foreignKey: "ModelMasterID", // Foreign key in variant mapping
    targetKey: "ModelMasterID", // Referenced field in model master
    as: "VMModelMasterID", // Alias for this association
  });

  // ModelColour Mapping Associations
  db.modelcolourmapping.belongsTo(db.modelmaster, {
    foreignKey: "ModelMasterID", // Foreign key in variant mapping
    targetKey: "ModelMasterID", // Referenced field in model master
    as: "MCMModelMasterID", // Alias for this association
  });

  db.modelcolourmapping.belongsTo(db.variantmaster, {
    foreignKey: "VariantID", // Foreign key in variant mapping
    targetKey: "VariantID", // Referenced field in variant master
    as: "MCMVariantID", // Alias for this association
  });

  db.modelcolourmapping.belongsTo(db.colourmaster, {
    foreignKey: "ColourID", // Foreign key in variant mapping
    targetKey: "ColourID", // Referenced field in variant master
    as: "MCMColourID", // Alias for this association
  });
  // Customer Master Associations
  db.customermaster.belongsTo(db.regionmaster, {
    foreignKey: "DistrictID", // Foreign key in customer master
    targetKey: "RegionID", // Referenced field in region master
    as: "CMRegionID", // Alias for this association
  });

  db.customermaster.belongsTo(db.statemaster, {
    foreignKey: "StateID", // Foreign key in customer master
    targetKey: "StateID", // Referenced field in state master
    as: "CMStateID", // Alias for this association
  });

  db.customermaster.belongsToMany(db.usermaster, {
    through: db.CustEmpMaping, // Join table for many-to-many relationship
    foreignKey: "CustomerID", // Foreign key in customer master
    otherKey: "EmpID", // Column in CustEmpMaping for user master
    as: "CMEmployees", // Alias for this association
  });
  db.customermaster.belongsTo(db.msmeInfo, {
    foreignKey: "MSMEID", // Foreign key in customer master
    targetKey: "MSMEID", // Column in CustEmpMaping for user master
    as: "CMMSMEID", // Alias for this association
  });
  // User Master Associations
  db.usermaster.belongsToMany(db.customermaster, {
    through: db.CustEmpMaping, // Join table for many-to-many relationship
    foreignKey: "EmpID", // Foreign key in user master
    otherKey: "CustomerID", // Column in CustEmpMaping for customer master
    as: "CMCustomers", // Alias for this association
  });

  db.customermaster.belongsTo(db.bankmaster, {
    foreignKey: "BankID", // Foreign key in customer master
    targetKey: "BankID", // Referenced field in bank master
    as: "CMBankID", // Alias for this association
  });

  // db.customermaster.belongsTo(db.modelmaster, {
  //   foreignKey: "ModelID", // Foreign key in customer master
  //   targetKey: "ModelMasterID", // Referenced field in model master
  //   as: "CMModelID", // Alias for this association
  // });

  // db.customermaster.belongsTo(db.variantmaster, {
  //   foreignKey: "VariantID", // Foreign key in customer master
  //   targetKey: "VariantID", // Referenced field in variant master
  //   as: "CMVariantID", // Alias for this association
  // });

  // db.customermaster.belongsTo(db.fueltypes, {
  //   foreignKey: "FuelTypeID", // Foreign key in customer master
  //   targetKey: "FuelTypeID", // Referenced field in fuel types
  //   as: "CMFuelTypeID", // Alias for this association
  // });

  // db.customermaster.belongsTo(db.colourmaster, {
  //   foreignKey: "ColourID", // Foreign key in customer master
  //   targetKey: "ColourID", // Referenced field in colour master
  //   as: "CMColourID", // Alias for this association
  // });

  // Cheque Tracking Associations
  db.chequetracking.belongsTo(db.CustReceipt, {
    foreignKey: "ReceiptID", // Foreign key in cheque tracking
    targetKey: "ReceiptID", // Referenced field in cheque master
    as: "CTReceiptID", // Alias for this association
  });

  db.chequetracking.belongsTo(db.customermaster, {
    foreignKey: "CustomerID", // Foreign key in cheque tracking
    targetKey: "CustomerID", // Referenced field in company bank account
    as: "CTCustomerID", // Alias for this association
  });

  db.chequetracking.belongsTo(db.PaymentRequests, {
    foreignKey: "PaymentID", // Foreign key in cheque tracking
    targetKey: "ID", // Referenced field in company bank account
    as: "CTPaymentID", // Alias for this association
  });

  // Offers Approvals Associations
  db.offersapprovals.belongsTo(db.NewCarBookings, {
    foreignKey: "BookingID", // Foreign key in offers approvals
    targetKey: "BookingID", // Referenced field in new car bookings
    as: "OABookingID", // Alias for this association
  });

  db.offersapprovals.belongsTo(db.offers, {
    foreignKey: "OfferID", // Foreign key in offers approvals
    targetKey: "OfferID", // Referenced field in offers
    as: "OAOfferID", // Alias for this association
  });

  db.offersapprovals.belongsTo(db.usermaster, {
    foreignKey: "RequestedBy", // Foreign key in offers approvals
    targetKey: "UserID", // Referenced field in user master
    as: "OARequestedBy", // Alias for this association
  });

  db.offersapprovals.belongsTo(db.usermaster, {
    foreignKey: "ApprovedBy", // Foreign key in offers approvals
    targetKey: "UserID", // Referenced field in user master
    as: "OAApprovedBy", // Alias for this association
  });

  // Approval Referrals Associations
  db.approvalrefferal.belongsTo(db.offersapprovals, {
    foreignKey: "CustOfferID", // Foreign key in approval referrals
    targetKey: "CustOfferID", // Referenced field in offers approvals
    as: "ARCustOfferID", // Alias for this association
  });

  db.approvalrefferal.belongsTo(db.usermaster, {
    foreignKey: "RequestedBy", // Foreign key in approval referrals
    targetKey: "UserID", // Referenced field in user master
    as: "ARRequestBy", // Alias for this association
  });

  db.approvalrefferal.belongsTo(db.usermaster, {
    foreignKey: "RequestedTo", // Foreign key in approval referrals
    targetKey: "UserID", // Referenced field in user master
    as: "ARRequestTo", // Alias for this association
  });

  // Accessories Associations
  db.accpartmaster.hasMany(db.accpartimages, {
    foreignKey: "PartMasterID", // Foreign key in accessories part map with model
    targetKey: "PartMasterID", // Referenced field in accessories part master
    as: "PartMasterImages", // Alias for this association
  });
  db.accpartmaster.belongsTo(db.acccategory, {
    foreignKey: "AccCategoryID", // Foreign key in accessories part map with model
    targetKey: "AccCategoryID", // Referenced field in accessories part master
    as: "AccessoriesCategoryID", // Alias for this association
  });
  db.accpartmaster.belongsTo(db.accsubcategory, {
    foreignKey: "AccSubCategoryID", // Foreign key in accessories part map with model
    targetKey: "AccSubCategoryID", // Referenced field in accessories part master
    as: "AccessoriesSubCategoryID", // Alias for this association
  });

  db.accpartmapwithmodel.belongsTo(db.accpartmaster, {
    foreignKey: "PartMasterID", // Foreign key in accessories part map with model
    targetKey: "PartMasterID", // Referenced field in accessories part master
    as: "AccPartMasterID", // Alias for this association
  });

  db.accpartmapwithmodel.belongsTo(db.modelmaster, {
    foreignKey: "ModelMasterID", // Foreign key in accessories part map with model
    targetKey: "ModelMasterID", // Referenced field in model master
    as: "AccModelMasterID", // Alias for this association
  });

  db.accpartmapwithmodel.belongsTo(db.variantmaster, {
    foreignKey: "VariantID", // Foreign key in accessories part map with model
    targetKey: "VariantID", // Referenced field in variant master
    as: "AccVariantID", // Alias for this association
  });
  db.accpartmapwithmodel.belongsTo(db.acccategory, {
    foreignKey: "AccCategoryID", // Foreign key in accessories part map with model
    targetKey: "AccCategoryID", // Referenced field in variant master
    as: "MapAccCategoryID", // Alias for this association
  });
  db.accpartmapwithmodel.belongsTo(db.accsubcategory, {
    foreignKey: "AccSubCategoryID", // Foreign key in accessories part map with model
    targetKey: "AccSubCategoryID", // Referenced field in variant master
    as: "MapAccSubCategoryID", // Alias for this association
  });

  db.accpartmaster.hasMany(db.accpartmapwithmodel, {
    foreignKey: "PartMasterID", // Foreign key in accessories part map with model
    targetKey: "PartMasterID", // Referenced field in accessories part master
    as: "AccPartMasterWithModelID", // Alias for this association
  });
  db.accsubcategory.belongsTo(db.acccategory, {
    foreignKey: "AccCategoryID", // Foreign key in accessories part map with model
    targetKey: "AccCategoryID", // Referenced field in accessories part master
    as: "AccessoriesCategoryID", // Alias for this association
  });
  db.accwishlist.belongsTo(db.accpartmaster, {
    foreignKey: "PartMasterID", // Foreign key in accessories part map with model
    targetKey: "PartMasterID", // Referenced field in accessories part master
    as: "WishPartmasterID", // Alias for this association
  });
  db.accwishlist.belongsTo(db.NewCarBookings, {
    foreignKey: "BookingID", // Foreign key in accessories part map with model
    targetKey: "BookingID", // Referenced field in accessories part master
    as: "WishBookingID", // Alias for this association
  });
  db.accwishlist.belongsTo(db.customermaster, {
    foreignKey: "CustomerID", // Foreign key in accessories part map with model
    targetKey: "CustomerID", // Referenced field in accessories part master
    as: "WishCustomerID", // Alias for this association
  });
  db.acccart.belongsTo(db.accpartmaster, {
    foreignKey: "PartMasterID", // Foreign key in accessories part map with model
    targetKey: "PartMasterID", // Referenced field in accessories part master
    as: "AccPartmasterID", // Alias for this association
  });
  // db.acccart.belongsTo(db.offers, {
  //   foreignKey: "AccOfferID", // Foreign key in accessories part map with model
  //   targetKey: "OfferID", // Referenced field in accessories part master
  //   as: "AccAccOfferID", // Alias for this association
  // });

  // db.accpartmaster.belongsTo(db.accpartimages, {
  //   foreignKey: "PartMasterID", // Foreign key in accessories part map with model
  //   targetKey: "PartMasterID", // Referenced field in accessories part master
  //   as: "ImgPartMasterID", // Alias for this association
  // });

  // Finance Application Associations
  db.financeapplication.belongsTo(db.customermaster, {
    foreignKey: "CustomerID", // Foreign key in finance application
    targetKey: "CustomerID", // Referenced field in customer master
    as: "FACustomerID", // Alias for this association
  });

  db.financeapplication.belongsTo(db.NewCarBookings, {
    foreignKey: "BookingID", // Foreign key in finance application
    targetKey: "BookingID", // Referenced field in new car bookings
    as: "FAppBookingID", // Alias for this association
  });

  db.financeapplication.belongsTo(db.financemaster, {
    foreignKey: "FinancierID", // Foreign key in finance application
    targetKey: "FinancierID", // Referenced field in finance master
    as: "FAFinancierID", // Alias for this association
  });

  db.financeapplication.belongsTo(db.finappapplicant, {
    foreignKey: "LoanAppCustID", // Foreign key in finance application
    targetKey: "LoanAppCustID", // Referenced field in finance application customer
    as: "FALoanAppCustID", // Alias for this association
  });

  db.financeapplication.belongsTo(db.usermaster, {
    foreignKey: "UserID", // Foreign key in finance application
    targetKey: "UserID", // Referenced field in finance application customer
    as: "FAUserID", // Alias for this association
  });

  db.financeapplication.belongsTo(db.usermaster, {
    foreignKey: "SalesPersonID", // Foreign key in finance application
    targetKey: "UserID", // Referenced field in finance application customer
    as: "FASalesPersonID", // Alias for this association
  });

  // Finance Application Customer Associations
  // db.finappcustomer.belongsTo(db.financeapplication, {
  //   foreignKey: "FinAppID", // Foreign key in finance application customer
  //   targetKey: "FinAppID", // Referenced field in finance application
  //   as: "FACLoanAppID", // Alias for this association
  // });

  // Finance Application Applicant Associations
  db.finappapplicant.belongsTo(db.customermaster, {
    foreignKey: "CustomerID", // Foreign key in accessories part map with model
    targetKey: "CustomerID", // Referenced field in accessories part master
    as: "FAACustomerID", // Alias for this association
  });
  // db.finappapplicant.hasMany(db.financeapplication, {
  //   foreignKey: "FinAppID", // Foreign key in accessories part map with model
  //   targetKey: "FinAppID", // Referenced field in accessories part master
  //   as: "FAFinAppID", // Alias for this association
  // });

  db.finappapplicant.belongsTo(db.NewCarBookings, {
    foreignKey: "BookingID", // Foreign key in accessories part map with model
    targetKey: "BookingID", // Referenced field in accessories part master
    as: "FABookingID", // Alias for this association
  });

  // Define the association where FinApp Applicant has many FinApp CoApplicants
  db.finappapplicant.hasMany(db.finappcoapplicant, {
    foreignKey: "LoanAppCustID", // The foreign key in FinAppCoApplicant
    sourceKey: "LoanAppCustID", // The primary key in FinAppApplicant
    as: "coApplicants", // Alias for this association
    // constraints: false,
  });

  db.finappapplicant.belongsTo(db.usermaster, {
    foreignKey: "UserID", // The foreign key in FinAppCoApplicant
    sourceKey: "UserID", // The primary key in FinAppApplicant
    as: "FAAUserID", // Alias for this association
  });

  db.finappapplicant.hasMany(db.financedocuments, {
    foreignKey: "CustomerID", // This should match the foreign key in FinanceDocuments
    sourceKey: "LoanAppCustID", // This should match the primary key in FinAppApplicant
    as: "FinApplicantDocs",
  });

  // db.finappapplicant.hasMany(db.finappcoapplicant, {
  //   foreignKey: "FinAppID", // Foreign key in accessories part map with model
  //   targetKey: "FinAppID", // Referenced field in accessories part master
  //   as: "FAAppID", // Alias for this association
  // });

  // Finance Application Co Applicant Associations
  db.finappcoapplicant.belongsTo(db.finappapplicant, {
    foreignKey: "LoanAppCustID", // Foreign key in accessories part map with model
    targetKey: "LoanAppCustID", // Referenced field in accessories part master
    as: "FCALoanAppCustID", // Alias for this association
  });

  db.finappcoapplicant.hasMany(db.financedocuments, {
    foreignKey: "CustomerID", // This should match the foreign key in FinanceDocuments
    sourceKey: "LoanAppCoCustID", // This should match the primary key in FinAppApplicant
    as: "FinCoApplicantDocs",
  });

  // finance loan application to applicant
  db.financeloanapplication.belongsTo(db.finappapplicant, {
    foreignKey: "LoanAppCustID", // Foreign key in accessories part map with model
    targetKey: "LoanAppCustID", // Referenced field in accessories part master
    as: "FinanceloanappID", // Alias for this association
  });

  db.financeloanapplication.belongsTo(db.financeapplication, {
    foreignKey: "FinAppID", // Foreign key in accessories part map with model
    targetKey: "FinAppID", // Referenced field in accessories part master
    as: "FinanceloanFinAppID", // Alias for this association
  });

  db.financeloanapplication.belongsTo(db.NewCarBookings, {
    foreignKey: "BookingID", // Foreign key in accessories part map with model
    targetKey: "BookingID", // Referenced field in accessories part master
    as: "FinanceloanBookingID", // Alias for this association
  });
  db.financeloanapplication.belongsTo(db.customermaster, {
    foreignKey: "CustomerID", // Foreign key in accessories part map with model
    targetKey: "CustomerID", // Referenced field in accessories part master
    as: "FinanceloanCustomerID", // Alias for this association
  });
  db.financeloanapplication.belongsTo(db.usermaster, {
    foreignKey: "UserID", // Foreign key in accessories part map with model
    targetKey: "UserID", // Referenced field in accessories part master
    as: "FinanceloanUserID", // Alias for this association
  });
  db.financeloanapplication.belongsTo(db.financemaster, {
    foreignKey: "FinancierID", // Foreign key in accessories part map with model
    targetKey: "FinancierID", // Referenced field in accessories part master
    as: "FLAFinancierID", // Alias for this association
  });

  db.financedocuments.belongsTo(db.documenttypes, {
    foreignKey: "DocTypeID",
    targetKey: "DocTypeID",
    as: "DocumentType",
  });

  db.documenttypes.hasMany(db.financedocuments, {
    foreignKey: "DocTypeID",
    as: "Documents",
  });

  db.financedocuments.belongsTo(db.finappapplicant, {
    foreignKey: "CustomerID", // Foreign key in accessories part map with model
    targetKey: "LoanAppCustID", // Referenced field in accessories part master
    as: "FDCustID", // Alias for this association
  });

  db.finstatusupdate.belongsTo(db.financeapplication, {
    foreignKey: "FinAppID", // Foreign key in accessories part map with model
    targetKey: "FinAppID", // Referenced field in accessories part master
    as: "FSUFinAppID", // Alias for this association
  });

  db.finstatustracking.belongsTo(db.finstatusupdate, {
    foreignKey: "FinStatusID", // Foreign key in customer master
    targetKey: "FinStatusID", // Referenced field in state master
    as: "FSTFinStatusID", // Alias for this association
  });

  db.financedocuments.belongsTo(db.financeloanapplication, {
    foreignKey: "FinanceLoanID", // Foreign key in accessories part map with model
    targetKey: "FinanceLoanID", // Referenced field in accessories part master
    as: "FDFinanceLoanID", // Alias for this association
  });

  // db.financedocuments.belongsTo(db.financepayments, {
  //   foreignKey: "FinPaymentID", // Foreign key in accessories part map with model
  //   targetKey: "FinPaymentID", // Referenced field in accessories part master
  //   as: "FDPayment", // Alias for this association
  // });

  // Bookings Documents Upload
  db.bookingsdocinfo.belongsTo(db.NewCarBookings, {
    foreignKey: "BookingID", // Foreign key in customer master
    targetKey: "BookingID", // Referenced field in state master
    as: "BDIBookingID", // Alias for this association
  });

  db.bookingsdocinfo.belongsTo(db.documenttypes, {
    foreignKey: "DocTypeID", // Foreign key in customer master
    targetKey: "DocTypeID", // Referenced field in state master
    as: "BDIDocTypeID", // Alias for this association
  });

  db.bookingsdocinfo.belongsTo(db.customermaster, {
    foreignKey: "CustomerID", // Foreign key in customer master
    targetKey: "CustomerID", // Referenced field in state master
    as: "BDICustomerID", // Alias for this association
  });

  db.bookingsdocinfo.belongsTo(db.usermaster, {
    foreignKey: "UploadBy", // Foreign key in customer master
    targetKey: "UserID", // Referenced field in state master
    as: "BDIUploadBy", // Alias for this association
  });

  // Finance Payments Associations
  db.financepayments.belongsTo(db.financeapplication, {
    foreignKey: "FinAppID", // Foreign key in finance payments
    targetKey: "FinAppID", // Referenced field in finance application
    as: "FPFinAppID", // Alias for this association
  });
  db.financepayments.belongsTo(db.customermaster, {
    foreignKey: "CustomerID", // Foreign key in finance payments
    targetKey: "CustomerID", // Referenced field in finance application
    as: "FPCustomerID", // Alias for this association
  });
  db.financepayments.belongsTo(db.finappapplicant, {
    foreignKey: "LoanAppCustID", // Foreign key in finance payments
    targetKey: "LoanAppCustID", // Referenced field in finance application
    as: "FPLoanAppCustID", // Alias for this association
  });
  db.financepayments.belongsTo(db.NewCarBookings, {
    foreignKey: "BookingID", // Foreign key in finance payments
    targetKey: "BookingID", // Referenced field in finance application
    as: "FPBookingID", // Alias for this association
  });
  db.financepayments.belongsTo(db.financeloanapplication, {
    foreignKey: "FinanceLoanID", // Foreign key in finance payments
    targetKey: "FinanceLoanID", // Referenced field in finance application
    as: "FPFinanceLoanID", // Alias for this association
  });
  db.financepayments.belongsTo(db.financedocuments, {
    foreignKey: "FinDocID", // Foreign key in finance payments
    targetKey: "FinDocID", // Referenced field in finance documents
    as: "FPFinDocID", // Alias for this association
  });
  db.financepayments.belongsTo(db.usermaster, {
    foreignKey: "UserID", // Foreign key in finance payments
    targetKey: "UserID", // Referenced field in finance documents
    as: "FPFinUserID", // Alias for this association
  });
  db.authresponse.belongsTo(db.authreq, {
    foreignKey: "AuthReqID", // Foreign key in finance payments
    targetKey: "AuthReqID", // Referenced field in finance documents
    as: "ARAuthReqID", // Alias for this association
  });

  db.ewbres.belongsTo(db.ewbreq, {
    foreignKey: "EWBReqID", // Foreign key in finance payments
    targetKey: "EWBReqID", // Referenced field in finance documents
    as: "ResEWBReqID", // Alias for this association
  });

  db.vasproductpricing.belongsTo(db.valueaddedservice, {
    foreignKey: "VASID", // Foreign key in finance payments
    targetKey: "VASID", // Referenced field in finance documents
    as: "VPPVASID", // Alias for this association
  });
  db.vasproductpricing.belongsTo(db.modelmaster, {
    foreignKey: "ModelMasterID", // Foreign key in finance payments
    targetKey: "ModelMasterID", // Referenced field in finance documents
    as: "VPPModelMasterID", // Alias for this association
  });
  db.vasproductpricing.belongsTo(db.variantmaster, {
    foreignKey: "VariantID", // Foreign key in finance payments
    targetKey: "VariantID", // Referenced field in finance documents
    as: "VPPVariantID", // Alias for this association
  });

  db.vasproductpricing.belongsTo(db.branchmaster, {
    foreignKey: "BranchID", // Foreign key in finance payments
    targetKey: "BranchID", // Referenced field in finance documents
    as: "VPPBranchID", // Alias for this association
  });
  db.vasproductpricing.belongsTo(db.usermaster, {
    foreignKey: "UserID", // Foreign key in finance payments
    targetKey: "UserID", // Referenced field in finance documents
    as: "VPPUserID", // Alias for this association
  });
  db.submodule.belongsTo(db.modulemaster, {
    foreignKey: "ModuleID", // Foreign key in finance payments
    targetKey: "ModuleID", // Referenced field in finance documents
    as: "SMModuleID", // Alias for this association
  });

  // Vehicle Allotment
  db.vehicleallotment.belongsTo(db.NewCarBookings, {
    foreignKey: "BookingID", // Foreign key in finance payments
    targetKey: "BookingID", // Referenced field in finance documents
    as: "AllotBookingID", // Alias for this association
  });

  db.vehicleallotment.belongsTo(db.customermaster, {
    foreignKey: "CustomerID", // Foreign key in finance payments
    targetKey: "CustomerID", // Referenced field in finance documents
    as: "AllotCustomerID", // Alias for this association
  });

  db.vehicleallotment.belongsTo(db.modelmaster, {
    foreignKey: "ModelMasterID", // Foreign key in finance payments
    targetKey: "ModelMasterID", // Referenced field in finance documents
    as: "AllotModelMasterID", // Alias for this association
  });

  db.vehicleallotment.belongsTo(db.variantmaster, {
    foreignKey: "VariantID", // Foreign key in finance payments
    targetKey: "VariantID", // Referenced field in finance documents
    as: "AllotVariantID", // Alias for this association
  });

  db.vehicleallotment.belongsTo(db.colourmaster, {
    foreignKey: "ColourID", // Foreign key in finance payments
    targetKey: "ColourID", // Referenced field in finance documents
    as: "AllotColourID", // Alias for this association
  });

  db.vehicleallotment.belongsTo(db.fueltypes, {
    foreignKey: "FuelTypeID", // Foreign key in finance payments
    targetKey: "FuelTypeID", // Referenced field in finance documents
    as: "AllotFuelTypeID", // Alias for this association
  });

  db.vehicleallotment.belongsTo(db.transmission, {
    foreignKey: "TransmissionID", // Foreign key in finance payments
    targetKey: "TransmissionID", // Referenced field in finance documents
    as: "AllotTransmissionID", // Alias for this association
  });

  db.vehicleallotment.belongsTo(db.branchmaster, {
    foreignKey: "BranchID", // Foreign key in finance payments
    targetKey: "BranchID", // Referenced field in finance documents
    as: "AllotBranchID", // Alias for this association
  });

  db.vehicleallotment.belongsTo(db.usermaster, {
    foreignKey: "SalesPersonID", // Foreign key in finance payments
    targetKey: "UserID", // Referenced field in finance documents
    as: "AllotSPID", // Alias for this association
  });

  db.vehicleallotment.belongsTo(db.usermaster, {
    foreignKey: "TeamLeadID", // Foreign key in finance payments
    targetKey: "UserID", // Referenced field in finance documents
    as: "AllotTLID", // Alias for this association
  });

  db.vehicleallotment.belongsTo(db.vehiclestock, {
    foreignKey: "PurchaseID", // Foreign key in finance payments
    targetKey: "PurchaseID", // Referenced field in finance documents
    as: "AllotPurchaseID", // Alias for this association
  });

  db.vehicleallotment.belongsTo(db.financeloanapplication, {
    foreignKey: "FinanceLoanID", // Foreign key in finance payments
    targetKey: "FinanceLoanID", // Referenced field in finance documents
    as: "AllotFinanceLoanID", // Alias for this association
  });

  db.vehicleallotment.belongsTo(db.usermaster, {
    foreignKey: "AllottedEmpID", // Foreign key in finance payments
    targetKey: "UserID", // Referenced field in finance documents
    as: "AllotEmpID", // Alias for this association
  });

  db.vehicleallotment.belongsTo(db.usermaster, {
    foreignKey: "RevokedEmpID", // Foreign key in finance payments
    targetKey: "UserID", // Referenced field in finance documents
    as: "AllotRevokeEmpID", // Alias for this association
  });

  db.vehicleallotment.belongsTo(db.vehiclechangereq, {
    foreignKey: "VehicleChngReqID", // Foreign key in finance payments
    targetKey: "VehicleChngReqID", // Referenced field in finance documents
    as: "AllotVehicleChngReqID", // Alias for this association
  });

  //Vehicle Allotment Change Request
  db.vehiclechangereq.belongsTo(db.NewCarBookings, {
    foreignKey: "BookingID", // Foreign key in finance payments
    targetKey: "BookingID", // Referenced field in finance documents
    as: "AllotChngBookingID", // Alias for this association
  });

  db.vehiclechangereq.belongsTo(db.customermaster, {
    foreignKey: "CustomerID", // Foreign key in finance payments
    targetKey: "CustomerID", // Referenced field in finance documents
    as: "AllotChngCustomerID", // Alias for this association
  });

  db.vehiclechangereq.belongsTo(db.modelmaster, {
    foreignKey: "ModelMasterID", // Foreign key in finance payments
    targetKey: "ModelMasterID", // Referenced field in finance documents
    as: "AllotChngModelMasterID", // Alias for this association
  });

  db.vehiclechangereq.belongsTo(db.variantmaster, {
    foreignKey: "VariantID", // Foreign key in finance payments
    targetKey: "VariantID", // Referenced field in finance documents
    as: "AllotChngVariantID", // Alias for this association
  });

  db.vehiclechangereq.belongsTo(db.colourmaster, {
    foreignKey: "ColourID", // Foreign key in finance payments
    targetKey: "ColourID", // Referenced field in finance documents
    as: "AllotChngColourID", // Alias for this association
  });

  db.vehiclechangereq.belongsTo(db.fueltypes, {
    foreignKey: "FuelTypeID", // Foreign key in finance payments
    targetKey: "FuelTypeID", // Referenced field in finance documents
    as: "AllotChngFuelTypeID", // Alias for this association
  });

  db.vehiclechangereq.belongsTo(db.transmission, {
    foreignKey: "TransmissionID", // Foreign key in finance payments
    targetKey: "TransmissionID", // Referenced field in finance documents
    as: "AllotChngTransmissionID", // Alias for this association
  });

  db.vehiclechangereq.belongsTo(db.branchmaster, {
    foreignKey: "BranchID", // Foreign key in finance payments
    targetKey: "BranchID", // Referenced field in finance documents
    as: "AllotChngBranchID", // Alias for this association
  });

  db.vehiclechangereq.belongsTo(db.usermaster, {
    foreignKey: "SalesPersonID", // Foreign key in finance payments
    targetKey: "UserID", // Referenced field in finance documents
    as: "AllotChngSPID", // Alias for this association
  });

  db.vehiclechangereq.belongsTo(db.usermaster, {
    foreignKey: "TeamLeadID", // Foreign key in finance payments
    targetKey: "UserID", // Referenced field in finance documents
    as: "AllotChngTLID", // Alias for this association
  });

  db.vehiclechangereq.belongsTo(db.financeloanapplication, {
    foreignKey: "FinanceLoanID", // Foreign key in finance payments
    targetKey: "FinanceLoanID", // Referenced field in finance documents
    as: "AllotChngFinanceLoanID", // Alias for this association
  });

  db.vehiclechangereq.belongsTo(db.usermaster, {
    foreignKey: "ApprovedEmpID", // Foreign key in finance payments
    targetKey: "UserID", // Referenced field in finance documents
    as: "AllotChngEmpID", // Alias for this association
  });

  db.vehiclechangereq.belongsTo(db.usermaster, {
    foreignKey: "CancelledEmpID", // Foreign key in finance payments
    targetKey: "UserID", // Referenced field in finance documents
    as: "AllotChngCancelledEmpID", // Alias for this association
  });

  //UserMaster Associations
  db.usermaster.belongsTo(db.branchmaster, {
    foreignKey: "BranchID", // Foreign key in finance payments
    targetKey: "BranchID", // Referenced field in finance documents
    as: "UMBranchID", // Alias for this association
  });
  db.usermaster.belongsTo(db.regionmaster, {
    foreignKey: "RegionID", // Foreign key in finance payments
    targetKey: "RegionID", // Referenced field in finance documents
    as: "UMRegionID", // Alias for this association
  });
  db.usermaster.belongsTo(db.departmentmaster, {
    foreignKey: "DeptID", // Foreign key in finance payments
    targetKey: "DeptID", // Referenced field in finance documents
    as: "UMDeptID", // Alias for this association
  });
  db.usermaster.belongsTo(db.statemaster, {
    foreignKey: "StateID", // Foreign key in finance payments
    targetKey: "StateID", // Referenced field in finance documents
    as: "UMStateID", // Alias for this association
  });
  // Vendor Master in Admin Panel Associations
  db.vendoraddressdetails.belongsTo(db.vendormaster, {
    foreignKey: "VendorMasterID", // Foreign key in finance payments
    targetKey: "VendorMasterID", // Referenced field in finance documents
    as: "VADVendorMasterID", // Alias for this association
  });
  db.vendoraddressdetails.belongsTo(db.statepos, {
    foreignKey: "StatePOSID", // Foreign key in finance payments
    targetKey: "StatePOSID", // Referenced field in finance documents
    as: "VADStatePOSID", // Alias for this association
  });
  db.vendorgstdetails.belongsTo(db.vendormaster, {
    foreignKey: "VendorMasterID", // Foreign key in finance payments
    targetKey: "VendorMasterID", // Referenced field in finance documents
    as: "VGDVendorMasterID", // Alias for this association
  });
  db.vendorgstdetails.belongsTo(db.statepos, {
    foreignKey: "StatePOSID", // Foreign key in finance payments
    targetKey: "StatePOSID", // Referenced field in finance documents
    as: "VGDStatePOSID", // Alias for this association
  });
  db.vendorbankdetails.belongsTo(db.vendormaster, {
    foreignKey: "VendorMasterID", // Foreign key in finance payments
    targetKey: "VendorMasterID", // Referenced field in finance documents
    as: "VBDVendorMasterID", // Alias for this association
  });
  db.vendordocuments.belongsTo(db.vendormaster, {
    foreignKey: "VendorMasterID", // Foreign key in finance payments
    targetKey: "VendorMasterID", // Referenced field in finance documents
    as: "VDVendorMasterID", // Alias for this association
  });
  db.vendordocuments.belongsTo(db.documenttypes, {
    foreignKey: "DocTypeID", // Foreign key in finance payments
    targetKey: "DocTypeID", // Referenced field in finance documents
    as: "VDDocTypeID", // Alias for this association
  });

  db.vendormaster.belongsTo(db.companyregions, {
    foreignKey: "CmpyRegionID", // Foreign key in branch master
    targetKey: "CmpyRegionID", // Referenced field in region master
    as: "VMCmpyRegionID", // Alias for this association
  });
  // db.usermaster.belongsTo(db.rolesmaster, {
  //   foreignKey: "RoleID", // Foreign key in finance payments
  //   targetKey: "RoleID", // Referenced field in finance documents
  //   as: "UMRoleID", // Alias for this association
  // });

  // Acc Approval Request Associations
  db.accapprovalreq.belongsTo(db.usermaster, {
    foreignKey: "ReqEmpID", // Foreign key in finance payments
    targetKey: "UserID", // Referenced field in finance documents
    as: "AARReqEmpID", // Alias for this association
  });
  db.accapprovalreq.belongsTo(db.usermaster, {
    foreignKey: "ApprovedEmpID", // Foreign key in finance payments
    targetKey: "UserID", // Referenced field in finance documents
    as: "AARApprovedEmpID", // Alias for this association
  });
  db.accapprovalreq.belongsTo(db.usermaster, {
    foreignKey: "CancelledEmpID", // Foreign key in finance payments
    targetKey: "UserID", // Referenced field in finance documents
    as: "AARCancelledEmpID", // Alias for this association
  });
  db.accapprovalreq.belongsTo(db.usermaster, {
    foreignKey: "RefferedTo", // Foreign key in finance payments
    targetKey: "UserID", // Referenced field in finance documents
    as: "AARRefferedTo", // Alias for this association
  });
  db.accapprovalreq.belongsTo(db.NewCarBookings, {
    foreignKey: "BookingID", // Foreign key in finance payments
    targetKey: "BookingID", // Referenced field in finance documents
    as: "AARBookingID", // Alias for this association
  });
  db.accapprovalreq.belongsTo(db.branchmaster, {
    foreignKey: "BranchID", // Foreign key in finance payments
    targetKey: "BranchID", // Referenced field in finance documents
    as: "AARBranchID", // Alias for this association
  });
  // db.accapprovalreq.belongsTo(db.acccart, {
  //   foreignKey: "AccCartID", // Foreign key in finance payments
  //   targetKey: "AccCartID", // Referenced field in finance documents
  //   as: "AARAccCartID", // Alias for this association
  //   constraints: false,
  // });

  // Acc Approval Refferal Associations
  db.accapprovalref.belongsTo(db.accapprovalreq, {
    foreignKey: "AccApprovalReqID", // Foreign key in finance payments
    targetKey: "AccApprovalReqID", // Referenced field in finance documents
    as: "AARAccApprovalReqID", // Alias for this association
  });
  db.accapprovalref.belongsTo(db.usermaster, {
    foreignKey: "ReqByEmpID", // Foreign key in finance payments
    targetKey: "UserID", // Referenced field in finance documents
    as: "AARReqByEmpID", // Alias for this association
  });
  db.accapprovalref.belongsTo(db.usermaster, {
    foreignKey: "ReqToEmpID", // Foreign key in finance payments
    targetKey: "UserID", // Referenced field in finance documents
    as: "AARReqToEmpID", // Alias for this association
  });
  db.accapprovalref.belongsTo(db.acccart, {
    foreignKey: "AccCartID", // Foreign key in finance payments
    targetKey: "AccCartID", // Referenced field in finance documents
    as: "AARefAccCartID", // Alias for this association
  });

  // Acc Approval Cart Associations
  db.accapprovedcart.belongsTo(db.accapprovalreq, {
    foreignKey: "AccApprovalReqID", // Foreign key in finance payments
    targetKey: "AccApprovalReqID", // Referenced field in finance documents
    as: "AACAccAprReqID", // Alias for this association
  });

  // db.accapprovedcart.belongsTo(db.acccart, {
  //   foreignKey: "AccCartID", // Foreign key in finance payments
  //   targetKey: "AccCartID", // Referenced field in finance documents
  //   as: "AACAccCartID", // Alias for this association
  // });

  db.accapprovedcart.belongsTo(db.NewCarBookings, {
    foreignKey: "BookingID", // Foreign key in finance payments
    targetKey: "BookingID", // Referenced field in finance documents
    as: "AACBookingID", // Alias for this association
  });

  db.accapprovedcart.belongsTo(db.branchmaster, {
    foreignKey: "BranchID", // Foreign key in finance payments
    targetKey: "BranchID", // Referenced field in finance documents
    as: "AACBranchID", // Alias for this association
  });

  // // User Special Rights Associations
  db.userspecialrights.belongsTo(db.usermaster, {
    foreignKey: "UserID", // Foreign key in form access rights
    targetKey: "UserID", // Referenced field in roles master
    as: "USRUserID", // Alias for this association
  });

  db.userspecialrights.belongsTo(db.formsmaster, {
    foreignKey: "FormID", // Foreign key in form access rights
    targetKey: "FormID", // Referenced field in forms master
    as: "USRFormID", // Alias for this association
  });

  db.userspecialrights.belongsTo(db.apiactionmaster, {
    foreignKey: "ActionID", // Foreign key in form access rights
    targetKey: "ActionID", // Referenced field in API action master
    as: "USRActionID", // Alias for this association
  });
  db.userspecialrights.belongsTo(db.modulemaster, {
    foreignKey: "ModuleID", // Foreign key in form access rights
    targetKey: "ModuleID", // Referenced field in API action master
    as: "USRModuleID", // Alias for this association
  });

  // Branch Approvals Limit Associations
  db.branchapprovalslimit.belongsTo(db.regionmaster, {
    foreignKey: "RegionID", // Foreign key in form access rights
    targetKey: "RegionID", // Referenced field in API action master
    as: "BALRegionID", // Alias for this association
  });

  db.branchapprovalslimit.belongsTo(db.branchmaster, {
    foreignKey: "BranchID", // Foreign key in form access rights
    targetKey: "BranchID", // Referenced field in API action master
    as: "BALBranchID", // Alias for this association
  });
  db.branchapprovalslimit.belongsTo(db.departmentmaster, {
    foreignKey: "DeptID", // Foreign key in form access rights
    targetKey: "DeptID", // Referenced field in API action master
    as: "BALDeptID", // Alias for this association
  });
  db.branchapprovalslimit.belongsTo(db.usermaster, {
    foreignKey: "UserID", // Foreign key in form access rights
    targetKey: "UserID", // Referenced field in API action master
    as: "BALUserID", // Alias for this association
  });
  db.branchapprovalslimit.belongsTo(db.teams, {
    foreignKey: "TeamID", // Foreign key in form access rights
    targetKey: "TeamID", // Referenced field in API action master
    as: "BALTeamID", // Alias for this association
  });

  //AccIssueReq
  db.accissuereq.belongsTo(db.NewCarBookings, {
    foreignKey: "BookingID", // Foreign key in form access rights
    targetKey: "BookingID", // Referenced field in API action master
    as: "AIRBookingID", // Alias for this association
  });

  db.accissuereq.belongsTo(db.usermaster, {
    foreignKey: "ReqEmpID", // Foreign key in form access rights
    targetKey: "UserID", // Referenced field in API action master
    as: "AIRReqEmpID", // Alias for this association
  });

  db.accissuereq.belongsTo(db.usermaster, {
    foreignKey: "IssuedEmpID", // Foreign key in form access rights
    targetKey: "UserID", // Referenced field in API action master
    as: "AIRIssuedEmpID", // Alias for this association
  });

  db.accissuereq.belongsTo(db.usermaster, {
    foreignKey: "FitmentEmpID", // Foreign key in form access rights
    targetKey: "UserID", // Referenced field in API action master
    as: "AIRFitmentEmpID", // Alias for this association
  });

  db.accissuereq.belongsTo(db.usermaster, {
    foreignKey: "CancelledEmpID", // Foreign key in form access rights
    targetKey: "UserID", // Referenced field in API action master
    as: "AIRCancelledEmpID", // Alias for this association
  });

  db.accissuereq.belongsToMany(db.acccart, {
    through: db.accpartmap,
    foreignKey: "AccIssueID",
    otherKey: "AccCartID",
    as: "AIRAccCartID", // Alias for this association
  });

  db.accissuereq.belongsTo(db.vehicleallotment, {
    foreignKey: "AllotmentID", // Foreign key in form access rights
    targetKey: "AllotmentReqID", // Referenced field in API action master
    as: "AIRAllotmentID", // Alias for this association
  });

  //AccReturnReq
  db.accreturnreq.belongsTo(db.accissuereq, {
    foreignKey: "AccIssueID", // Foreign key in form access rights
    targetKey: "AccIssueID", // Referenced field in API action master
    as: "ARRAccIssueID", // Alias for this association
  });

  db.accreturnreq.belongsTo(db.NewCarBookings, {
    foreignKey: "BookingID", // Foreign key in form access rights
    targetKey: "BookingID", // Referenced field in API action master
    as: "ARRBookingID", // Alias for this association
  });

  db.accreturnreq.belongsTo(db.usermaster, {
    foreignKey: "FitReturnEmpID", // Foreign key in form access rights
    targetKey: "UserID", // Referenced field in API action master
    as: "ARRFitReturnEmpID", // Alias for this association
  });

  db.accreturnreq.belongsTo(db.usermaster, {
    foreignKey: "ApprovedEmpID", // Foreign key in form access rights
    targetKey: "UserID", // Referenced field in API action master
    as: "ARRApprovedEmpID", // Alias for this association
  });

  db.accreturnreq.belongsTo(db.usermaster, {
    foreignKey: "CancelledEmpID", // Foreign key in form access rights
    targetKey: "UserID", // Referenced field in API action master
    as: "ARRCancelledEmpID", // Alias for this association
  });

  db.accreturnreq.belongsToMany(db.acccart, {
    through: db.accpartmap,
    foreignKey: "AccReturnID",
    otherKey: "AccCartID",
    as: "ARRAccCartID", // Alias for this association
  });

  //AccPartMap
  db.accpartmap.belongsTo(db.accissuereq, {
    foreignKey: "AccIssueID", // Foreign key in form access rights
    targetKey: "AccIssueID", // Referenced field in API action master
    as: "APMAccIssueID", // Alias for this association
  });

  db.accpartmap.belongsTo(db.accreturnreq, {
    foreignKey: "AccReturnID", // Foreign key in form access rights
    targetKey: "AccReturnID", // Referenced field in API action master
    as: "APMAccReturnID", // Alias for this association
  });

  // VAS Manager approvals associations
  db.vasmanagerapprovals.belongsTo(db.NewCarBookings, {
    foreignKey: "BookingID", // Foreign key in form access rights
    targetKey: "BookingID", // Referenced field in API action master
    as: "VASMABookingID", // Alias for this association
  });
  db.vasmanagerapprovals.belongsTo(db.branchmaster, {
    foreignKey: "BranchID", // Foreign key in form access rights
    targetKey: "BranchID", // Referenced field in API action master
    as: "VASMABranchID", // Alias for this association
  });
  db.vasmanagerapprovals.belongsTo(db.vasproductpricing, {
    foreignKey: "VASProductID", // Foreign key in form access rights
    targetKey: "VASProductID", // Referenced field in API action master
    as: "VASMAVASProductID", // Alias for this association
  });
  db.vasmanagerapprovals.belongsTo(db.usermaster, {
    foreignKey: "UserID", // Foreign key in form access rights
    targetKey: "UserID", // Referenced field in API action master
    as: "VASMAUserID", // Alias for this association
  });

  // Manager Approvals Map Associations
  db.managerapprovalsmap.belongsTo(db.vasmanagerapprovals, {
    foreignKey: "VASManagerApprovalsID", // Foreign key in form access rights
    targetKey: "VASManagerApprovalsID", // Referenced field in API action master
    as: "MAMVASManagerApprovalsID", // Alias for this association
  });
  db.managerapprovalsmap.belongsTo(db.vasproductpricing, {
    foreignKey: "VASProductID", // Foreign key in form access rights
    targetKey: "VASProductID", // Referenced field in API action master
    as: "MAMVASProductID", // Alias for this association
  });

  //AccJobOrder Associations

  db.accjoborder.belongsTo(db.NewCarBookings, {
    foreignKey: "BookingID", // Foreign key in form access rights
    targetKey: "BookingID", // Referenced field in API action master
    as: "AJOBookingID", // Alias for this association
  });
  db.accjoborder.belongsTo(db.usermaster, {
    foreignKey: "FitmentEmpID", // Foreign key in form access rights
    targetKey: "UserID", // Referenced field in API action master
    as: "AJOFitmentEmpID", // Alias for this association
  });

  db.accjoborder.belongsTo(db.usermaster, {
    foreignKey: "CancelledEmpID", // Foreign key in form access rights
    targetKey: "UserID", // Referenced field in API action master
    as: "AJOCancelledEmpID", // Alias for this association
  });

  db.accjoborder.belongsTo(db.accissuereq, {
    foreignKey: "AccIssueID", // Foreign key in form access rights
    targetKey: "AccIssueID", // Referenced field in API action master
    as: "AJOAccIssueID", // Alias for this association
  });

  // TestDrive Associations

  db.testdrive.belongsTo(db.customermaster, {
    foreignKey: "CustomerID", // Foreign key in form access rights
    targetKey: "CustomerID", // Referenced field in API action master
    as: "TDCustomerID", // Alias for this association
  });

  db.testdrive.belongsTo(db.usermaster, {
    foreignKey: "UserID", // Foreign key in form access rights
    targetKey: "UserID", // Referenced field in API action master
    as: "TDUserID", // Alias for this association
  });

  db.testdrive.belongsTo(db.branchmaster, {
    foreignKey: "BranchID", // Foreign key in form access rights
    targetKey: "BranchID", // Referenced field in API action master
    as: "TDBranchID", // Alias for this association
  });
  db.testdrive.belongsTo(db.regionmaster, {
    foreignKey: "DistrictID", // Foreign key in form access rights
    targetKey: "RegionID", // Referenced field in API action master
    as: "TDDistrictID", // Alias for this association
  });
  db.testdrive.belongsTo(db.statemaster, {
    foreignKey: "StateID", // Foreign key in form access rights
    targetKey: "StateID", // Referenced field in API action master
    as: "TDStateID", // Alias for this association
  });
  db.testdrive.belongsTo(db.modelmaster, {
    foreignKey: "ModelMasterID", // Foreign key in form access rights
    targetKey: "ModelMasterID", // Referenced field in API action master
    as: "TDModelMasterID", // Alias for this association
  });
  db.testdrive.belongsTo(db.fueltypes, {
    foreignKey: "FuelTypeID", // Foreign key in form access rights
    targetKey: "FuelTypeID", // Referenced field in API action master
    as: "TDFuelTypeID", // Alias for this association
  });
  db.testdrive.belongsTo(db.transmission, {
    foreignKey: "TransmissionID", // Foreign key in form access rights
    targetKey: "TransmissionID", // Referenced field in API action master
    as: "TDTransmissionID", // Alias for this association
  });
  // db.testdrive.belongsTo(db.usermaster, {
  //   foreignKey: "DemoEmpID", // Foreign key in form access rights
  //   targetKey: "UserID", // Referenced field in API action master
  //   as: "TDDemoEmpID", // Alias for this association
  // });
  db.testdrive.belongsTo(db.usermaster, {
    foreignKey: "TestDriveEmpID", // Foreign key in form access rights
    targetKey: "UserID", // Referenced field in API action master
    as: "TDTestDriveEmpID", // Alias for this association
  });
  db.testdrive.belongsTo(db.usermaster, {
    foreignKey: "RequestedBy", // Foreign key in form access rights
    targetKey: "UserID", // Referenced field in API action master
    as: "TDRequestedBy", // Alias for this association
  });
  db.testdrive.belongsTo(db.usermaster, {
    foreignKey: "AssignedBy", // Foreign key in form access rights
    targetKey: "UserID", // Referenced field in API action master
    as: "TDAssignedBy", // Alias for this association
  });

  //Test Drive Document Associations
  db.testdrivedocument.belongsTo(db.testdrive, {
    foreignKey: "TestDriveID", // Foreign key in form access rights
    targetKey: "TestDriveID", // Referenced field in API action master
    as: "TDDTestDriveID", // Alias for this association
  });
  db.testdrivedocument.belongsTo(db.documenttypes, {
    foreignKey: "DocTypeID", // Foreign key in form access rights
    targetKey: "DocTypeID", // Referenced field in API action master
    as: "TDDDocTypeID", // Alias for this association
  });

  //Test Drive Allot Associations

  db.testdriveallot.belongsTo(db.testdrive, {
    foreignKey: "TestDriveID", // Foreign key in form access rights
    targetKey: "TestDriveID", // Referenced field in API action master
    as: "TDATestDriveID", // Alias for this association
  });

  db.testdriveallot.belongsTo(db.usermaster, {
    foreignKey: "AssignedBy", // Foreign key in form access rights
    targetKey: "UserID", // Referenced field in API action master
    as: "TDAAssignedBy", // Alias for this association
  });

  db.testdriveallot.belongsTo(db.branchmaster, {
    foreignKey: "BranchID", // Foreign key in form access rights
    targetKey: "BranchID", // Referenced field in API action master
    as: "TDABranchID", // Alias for this association
  });

  //test drive master associations

  db.testdrivemaster.belongsTo(db.branchmaster, {
    foreignKey: "BranchID", // Foreign key in form access rights
    targetKey: "BranchID", // Referenced field in API action master
    as: "TDMBranchID", // Alias for this association
  });
  db.testdrivemaster.belongsTo(db.modelmaster, {
    foreignKey: "ModelMasterID", // Foreign key in form access rights
    targetKey: "ModelMasterID", // Referenced field in API action master
    as: "TDMModelMasterID", // Alias for this association
  });
  db.testdrivemaster.belongsTo(db.variantmaster, {
    foreignKey: "VariantID", // Foreign key in form access rights
    targetKey: "VariantID", // Referenced field in API action master
    as: "TDMVariantID", // Alias for this association
  });
  db.testdrivemaster.belongsTo(db.fueltypes, {
    foreignKey: "FuelTypeID", // Foreign key in form access rights
    targetKey: "FuelTypeID", // Referenced field in API action master
    as: "TDMFuelTypeID", // Alias for this association
  });
  db.testdrivemaster.belongsTo(db.transmission, {
    foreignKey: "TransmissionID", // Foreign key in form access rights
    targetKey: "TransmissionID", // Referenced field in API action master
    as: "TDMTransmissionID", // Alias for this association
  });
  db.testdrivemaster.belongsTo(db.colourmaster, {
    foreignKey: "ColourID", // Foreign key in form access rights
    targetKey: "ColourID", // Referenced field in API action master
    as: "TDMColourID", // Alias for this association
  });

  //test drive master documents associations

  db.testdrivemasterdocuments.belongsTo(db.testdrivemaster, {
    foreignKey: "TestDriveMasterID", // Foreign key in form access rights
    targetKey: "TestDriveMasterID", // Referenced field in API action master
    as: "TDMDTestDriveMasterID", // Alias for this association
  });

  db.testdrivemasterdocuments.belongsTo(db.documenttypes, {
    foreignKey: "DocTypeID", // Foreign key in form access rights
    targetKey: "DocTypeID", // Referenced field in API action master
    as: "TDMDDocTypeID", // Alias for this association
  });

  //New Car Price List Associations

  db.newcarpricelist.belongsTo(db.branchmaster, {
    foreignKey: "BranchID", // Foreign key in form access rights
    targetKey: "BranchID", // Referenced field in API action master
    as: "NCPLBranchID", // Alias for this association
  });

  db.newcarpricelist.belongsTo(db.modelmaster, {
    foreignKey: "ModelMasterID", // Foreign key in form access rights
    targetKey: "ModelMasterID", // Referenced field in API action master
    as: "NCPLModelMasterID", // Alias for this association
  });

  db.newcarpricelist.belongsTo(db.variantmaster, {
    foreignKey: "VariantID", // Foreign key in form access rights
    targetKey: "VariantID", // Referenced field in API action master
    as: "NCPLVariantID", // Alias for this association
  });

  db.newcarpricelist.belongsTo(db.colourcategory, {
    foreignKey: "ColourCategoryID", // Foreign key in form access rights
    targetKey: "ColourCategoryID", // Referenced field in API action master
    as: "NCPLColourCategoryID", // Alias for this association
  });

  db.newcarpricelist.belongsTo(db.fueltypes, {
    foreignKey: "FuelTypeID", // Foreign key in form access rights
    targetKey: "FuelTypeID", // Referenced field in API action master
    as: "NCPLFuelTypeID", // Alias for this association
  });

  db.newcarpricelist.belongsTo(db.transmission, {
    foreignKey: "TransmissionID", // Foreign key in form access rights
    targetKey: "TransmissionID", // Referenced field in API action master
    as: "NCPLTransmissionID", // Alias for this association
  });

  db.newcarpricelist.belongsTo(db.usermaster, {
    foreignKey: "UserID", // Foreign key in form access rights
    targetKey: "UserID", // Referenced field in API action master
    as: "NCPLUserID", // Alias for this association
  });

  //new car price mapping associations

  db.newcarpricemapping.belongsTo(db.newcarpricelist, {
    foreignKey: "NewCarPriceListID", // Foreign key in form access rights
    targetKey: "NewCarPriceListID", // Referenced field in API action master
    as: "NCPMNewCarPriceListID", // Alias for this association
  });
  db.newcarpricemapping.belongsTo(db.statemaster, {
    foreignKey: "StateID", // Foreign key in form access rights
    targetKey: "StateID", // Referenced field in API action master
    as: "NCPMStateID", // Alias for this association
  });

  db.newcarpricemapping.belongsTo(db.regionmaster, {
    foreignKey: "RegionID", // Foreign key in form access rights
    targetKey: "RegionID", // Referenced field in API action master
    as: "NCPMRegionID", // Alias for this association
  });

  db.newcarpricemapping.belongsTo(db.branchmaster, {
    foreignKey: "BranchID", // Foreign key in form access rights
    targetKey: "BranchID", // Referenced field in API action master
    as: "NCPMBranchID", // Alias for this association
  });

  //BranchGates Associations

  db.branchgates.belongsTo(db.branchtypes, {
    foreignKey: "BranchTypeID", // Foreign key in form access rights
    targetKey: "BranchTypeID", // Referenced field in API action master
    as: "BGSBranchTypeID", // Alias for this association
  });

  db.branchgates.belongsTo(db.branchmaster, {
    foreignKey: "BranchID", // Foreign key in form access rights
    targetKey: "BranchID", // Referenced field in API action master
    as: "BGSBranchID", // Alias for this association
  });

  //BranchGatesMapping Associations

  db.branchgatesmapping.belongsTo(db.branchgates, {
    foreignKey: "BranchGateID", // Foreign key in form access rights
    targetKey: "BranchGateID", // Referenced field in API action master
    as: "BGSMBranchGateID", // Alias for this association
  });
  // db.vasproductpricing.belongsTo(db.vasmanagerapprovals, {
  //   foreignKey: "VASManagerApprovalsID", // Foreign key in form access rights
  //   targetKey: "VASManagerApprovalsID", // Referenced field in API action master
  //   as: "VASPPVASManagerApprovalsID", // Alias for this association
  // });
  // Return the db object with all associations defined

  db.accapprovalcartcancelreq.belongsTo(db.usermaster, {
    foreignKey: "ReqEmpID", // Foreign key in form access rights
    targetKey: "UserID", // Referenced field in API action master
    as: "AACCRReqEmpID", // Alias for this association
  });

  db.accapprovalcartcancelreq.belongsTo(db.NewCarBookings, {
    foreignKey: "BookingID", // Foreign key in form access rights
    targetKey: "BookingID", // Referenced field in API action master
    as: "AACCRBookingID", // Alias for this association
  });

  db.accapprovalcartcancelreq.belongsTo(db.branchmaster, {
    foreignKey: "BranchID", // Foreign key in form access rights
    targetKey: "BranchID", // Referenced field in API action master
    as: "AACCRBranchID", // Alias for this association
  });

  // db.accapprovalcartcancelreq.belongsTo(db.acccart, {
  //   foreignKey: "AccCartID", // Foreign key in form access rights
  //   targetKey: "AccCartID", // Referenced field in API action master
  //   as: "AACCRAccCartID", // Alias for this association
  // });

  db.accapprovalcartcancelreq.belongsTo(db.usermaster, {
    foreignKey: "ApprovedEmpID", // Foreign key in form access rights
    targetKey: "UserID", // Referenced field in API action master
    as: "AACCRApprovedEmpID", // Alias for this association
  });

  db.accapprovalcartcancelreq.belongsTo(db.usermaster, {
    foreignKey: "CancelledEmpID", // Foreign key in form access rights
    targetKey: "UserID", // Referenced field in API action master
    as: "AACCRCancelledEmpID", // Alias for this association
  });

  // Invoice
  db.invoice.belongsTo(db.paymentRef, {
    foreignKey: "TransactionType", // Foreign key in form access rights
    targetKey: "ID", // Referenced field in API action master
    as: "ITransactionTypeID", // Alias for this association
  });

  db.invoice.belongsTo(db.customermaster, {
    foreignKey: "CustomerID", // Foreign key in form access rights
    targetKey: "CustomerID", // Referenced field in API action master
    as: "ICustomerID", // Alias for this association
  });

  db.invoice.belongsTo(db.branchmaster, {
    foreignKey: "SaleBranchID", // Foreign key in form access rights
    targetKey: "BranchID", // Referenced field in API action master
    as: "ISaleBranchID", // Alias for this association
  });

  db.invoice.belongsTo(db.usermaster, {
    foreignKey: "SalesPersonID", // Foreign key in form access rights
    targetKey: "UserID", // Referenced field in API action master
    as: "ISalesPersonID", // Alias for this association
  });

  db.invoice.belongsTo(db.usermaster, {
    foreignKey: "TeamLeadID", // Foreign key in form access rights
    targetKey: "UserID", // Referenced field in API action master
    as: "ITeamLeadID", // Alias for this association
  });

  db.invoice.belongsTo(db.vehicleallotment, {
    foreignKey: "AllotmentID", // Foreign key in form access rights
    targetKey: "AllotmentReqID", // Referenced field in API action master
    as: "IAllotmentID", // Alias for this association
  });

  db.invoice.belongsTo(db.financeloanapplication, {
    foreignKey: "FinanceID", // Foreign key in form access rights
    targetKey: "FinanceLoanID", // Referenced field in API action master
    as: "IFinanceID", // Alias for this association
  });

  // Invoice has many InvoiceAddress
  db.invoice.hasMany(db.invoiceaddress, {
    foreignKey: "InvoiceID", // Foreign key in the InvoiceAddress table
    sourceKey: "InvoiceID", // Primary key in the Invoice table
    as: "InvoiceAddresses", // Alias for the association
  });

  db.invoice.hasMany(db.invoiceprodinfo, {
    foreignKey: "InvoiceID", // Foreign key in the InvoiceAddress table
    sourceKey: "InvoiceID", // Primary key in the Invoice table
    as: "InvoiceProductInfo", // Alias for the association
  });

  // InvoiceAddress
  db.invoiceaddress.belongsTo(db.invoice, {
    foreignKey: "InvoiceID", // Foreign key in form access rights
    targetKey: "InvoiceID", // Referenced field in API action master
    as: "IAInvoiceID", // Alias for this association
  });

  // InvoiceAddress
  db.invoiceprodinfo.belongsTo(db.invoice, {
    foreignKey: "InvoiceID", // Foreign key in form access rights
    targetKey: "InvoiceID", // Referenced field in API action master
    as: "IPIInvoiceID", // Alias for this association
  });

  db.invoiceprodinfo.belongsTo(db.masterproducts, {
    foreignKey: "ProductID", // Foreign key in form access rights
    targetKey: "MasterProdID", // Referenced field in API action master
    as: "IPIMasterProdID", // Alias for this association
  });

  //Booking Transfer Associations

  db.bookingtransfer.belongsTo(db.NewCarBookings, {
    foreignKey: "BookingID", // Foreign key in form access rights
    targetKey: "BookingID", // Referenced field in API action master
    as: "BTSBookingID", // Alias for this association
  });

  db.bookingtransfer.belongsTo(db.usermaster, {
    foreignKey: "AcceptedBy", // Foreign key in form access rights
    targetKey: "UserID", // Referenced field in API action master
    as: "BTSAcceptedBy", // Alias for this association
  });

  db.bookingtransfer.belongsTo(db.usermaster, {
    foreignKey: "RequestBy", // Foreign key in form access rights
    targetKey: "UserID", // Referenced field in API action master
    as: "BTSRequestBy", // Alias for this association
  });

  db.bookingtransfer.belongsTo(db.branchmaster, {
    foreignKey: "ToBranch", // Foreign key in form access rights
    targetKey: "BranchID", // Referenced field in API action master
    as: "BTSToBranch", // Alias for this association
  });

  db.bookingtransfer.belongsTo(db.branchmaster, {
    foreignKey: "FromBranch", // Foreign key in form access rights
    targetKey: "BranchID", // Referenced field in API action master
    as: "BTSFromBranch", // Alias for this association
  });

  //Booking Cancellation model Associations

  db.bookingcancellation.belongsTo(db.NewCarBookings, {
    foreignKey: "BookingID", // Foreign key in form access rights
    targetKey: "BookingID", // Referenced field in API action master
    as: "BCBookingID", // Alias for this association
  });

  db.bookingcancellation.belongsTo(db.usermaster, {
    foreignKey: "ReqEmpID", // Foreign key in form access rights
    targetKey: "UserID", // Referenced field in API action master
    as: "BCReqEmpID", // Alias for this association
  });

  db.bookingcancellation.belongsTo(db.usermaster, {
    foreignKey: "TLEmpID", // Foreign key in form access rights
    targetKey: "UserID", // Referenced field in API action master
    as: "BCTLEmpID", // Alias for this association
  });

  db.bookingcancellation.belongsTo(db.usermaster, {
    foreignKey: "ApprovedBy", // Foreign key in form access rights
    targetKey: "UserID", // Referenced field in API action master
    as: "BCApprovedBy", // Alias for this association
  });

  db.bookingcancellation.belongsTo(db.branchmaster, {
    foreignKey: "ReqBranch", // Foreign key in form access rights
    targetKey: "BranchID", // Referenced field in API action master
    as: "BCReqBranch", // Alias for this association
  });

  // TRProcess Associations

  db.trprocess.belongsTo(db.companystates, {
    foreignKey: "CmpyStateID", // Foreign key in form access rights
    targetKey: "CmpyStateID", // Referenced field in API action master
    as: "TRCmpyStateID", // Alias for this association
  });

  // Insurance Policy Mapping Associations

  db.insurancepolicymapping.belongsTo(db.insurancepolicytype, {
    foreignKey: "InsurancePolicyTypeID", // Foreign key in form access rights
    targetKey: "InsurancePolicyTypeID", // Referenced field in API action master
    as: "IPMInsurancePolicyTypeID", // Alias for this association
  });

  db.insurancepolicymapping.belongsTo(db.modelmaster, {
    foreignKey: "ModelMasterID", // Foreign key in form access rights
    targetKey: "ModelMasterID", // Referenced field in API action master
    as: "IPMModelMasterID", // Alias for this association
  });

  db.insurancepolicymapping.belongsTo(db.variantmaster, {
    foreignKey: "VariantID", // Foreign key in form access rights
    targetKey: "VariantID", // Referenced field in API action master
    as: "IPMVariantID", // Alias for this association
  });

  db.insurancepolicymapping.belongsTo(db.transmission, {
    foreignKey: "TransmissionID", // Foreign key in form access rights
    targetKey: "TransmissionID", // Referenced field in API action master
    as: "IPMTransmissionID", // Alias for this association
  });

  //Insurance Value Added Mapping Associations

  db.insurancevaluemapping.belongsTo(db.insurancevalueadded, {
    foreignKey: "InsuranceValueAddedID", // Foreign key in form access rights
    targetKey: "InsuranceValueAddedID", // Referenced field in API action master
    as: "IVMInsuranceValueAddedID", // Alias for this association
  });

  db.insurancevaluemapping.belongsTo(db.insurancepolicymapping, {
    foreignKey: "InsurancePolicyMappingID", // Foreign key in form access rights
    targetKey: "InsurancePolicyMappingID", // Referenced field in API action master
    as: "IVMInsurancePolicyMappingID", // Alias for this association
  });

  // Demo Conversion Associations
  db.democonversion.belongsTo(db.usermaster, {
    foreignKey: "RequestedBy", // Foreign key in form access rights
    targetKey: "UserID", // Referenced field in API action master
    as: "DCRequestedBy", // Alias for this association
  });

  db.democonversion.belongsTo(db.usermaster, {
    foreignKey: "ApprovedBy", // Foreign key in form access rights
    targetKey: "UserID", // Referenced field in API action master
    as: "DCApprovedBy", // Alias for this association
  });

  db.democonversion.belongsTo(db.branchmaster, {
    foreignKey: "FromBranch", // Foreign key in form access rights
    targetKey: "BranchID", // Referenced field in API action master
    as: "DCFromBranch", // Alias for this association
  });

  db.democonversion.belongsTo(db.vehiclestock, {
    foreignKey: "PurchaseID", // Foreign key in form access rights
    targetKey: "PurchaseID", // Referenced field in API action master
    as: "DCPurchaseID", // Alias for this association
  });

  return db;
};

module.exports = associateModels;
