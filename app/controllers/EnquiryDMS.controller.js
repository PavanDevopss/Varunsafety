/* eslint-disable no-unused-vars */
const db = require("../models");
const Enquiry = db.enquirydms;
const UserMaster = db.usermaster;
const ModelMaster = db.modelmaster;
const BranchMaster = db.branchmaster;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;
const { QueryTypes } = require("sequelize");
const { Sequelize } = require("sequelize");

exports.create = (req, res) => {
  // Validate request
  if (!req.body.Branch) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
    return;
  }

  // Create a User
  const Enquirydata = {
    Branch: req.body.Branch,
    EnquiryNo: req.body.EnquiryNo,
    DSECode: req.body.DSECode,
    User: req.body.User,
  };

  // Save UASERS in the database
  Enquiry.create(Enquirydata)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while creating the Users.",
      });
    });
};

// exports.findAll = (req, res) => {
//     const DSECode = req.body.UID;

//     Enquiry.findAll({ where: { DSECode } })

//       .then(data => {
//         const desiredFields = ["EnquiryID", "DealerLocation", "DSECode"]; // Replace with your desired fields

//         const filteredData = data.map(customer => {
//           return desiredFields.reduce((acc, field) => {
//             acc[field] = customer[field];
//             return acc;
//           }, {});
//         });
//         console.log(filteredData);
//         res.send(filteredData);
//       })
//       .catch(err => {
//         res.status(500).send({
//           message: err.message || "Some error occurred while retrieving Customers."
//         });
//       });
//   };

// exports.findAll = async (req, res) => {

//   try {
//     const enquiryData = await sequelize.query(`
//     SELECT "Enquiry".*, "UserId"
//     FROM "Enquiry"
//     INNER JOIN "Users" ON "Users"."OEMID" = "Enquiry"."DSECode"
//     WHERE "Users"."UserId" = :userId;
//   `, {
//     type: QueryTypes.SELECT,
//     replacements: { userId: userId },
//   });

//     const desiredFields = ["EnquiryID", "DealerLocation", "DSECode"]; // Replace with your desired fields
//     const filteredData = enquiryData.map(customer => {
//       return desiredFields.reduce((acc, field) => {
//         acc[field] = customer[field];
//         return acc;
//       }, {});
//     });

//     res.send(filteredData);
//   } catch (err) {
//     res.status(500).send({
//       message: err.message || "Some error occurred while retrieving Customers."
//     });
//   }
// };

// enquiry userid with request body

// exports.findAll = async (req, res) => {
//   try {
//     // Parse userId from request body
//     const { UserId } = req.body;

//     if (!UserId) {
//       return res.status(400).send({ message: "userId is required in the request body" });
//     }

//     Enquiry.belongsTo(User, { foreignKey: 'DSECode' });

//     const enquiryData = await sequelize.query(`
//       SELECT "Enquiry".*, "Users"."UserId"
//       FROM "Enquiry"
//       INNER JOIN "Users" ON "Users"."OEMID" = "Enquiry"."DSECode"
//       WHERE "Users"."UserId" = :userId;
//     `, {
//       type: QueryTypes.SELECT,
//       replacements: { userId: UserId },
//     });

//     const desiredFields = ["EnquiryID", "DealerLocation", "DSECode"]; // Replace with your desired fields
//     const filteredData = enquiryData.map(customer => {
//       return desiredFields.reduce((acc, field) => {
//         acc[field] = customer[field];
//         return acc;
//       }, {});
//     });

//     res.send(filteredData);
//   } catch (err) {
//     res.status(500).send({
//       message: err.message || "Some error occurred while retrieving Customers."
//     });
//   }
// };

// exports.findAll = async (req, res) => {
//   const getAllmodelsQuery = `
//     SELECT public."Enquiry".*, "Users"."UserId"
//     FROM public."Enquiry"
//     INNER JOIN public."Users" ON "Users"."OEMID" = "Enquiry"."DSECode"
//     WHERE "Users"."UserId" = 1
//   `;

//   try {
//     const getModels = await Seq.query(getAllmodelsQuery, { type: sequelize.QueryTypes.SELECT });
//     return res.status(200).json({ status: 'success', data: getModels });
//   } catch (err) {
//     console.error(err); // Log the error for debugging purposes
//     res.status(500).send({
//       message: err.message || "Some error occurred while retrieving ModelMasters."
//     });
//   }
// };

// working................ userId with paramas

// exports.findAll = async (req, res) => {
//   const UserId = req.params.userId; // Assuming userId is sent in the request body

//   if (!UserId) {
//     return res.status(400).json({ status: 'error', message: 'UserId is required in the request body.' });
//   }
//   const getAllmodelsQuery = `
//     SELECT public."Enquiry".*, "Users"."UserId"
//     FROM public."Enquiry"
//     INNER JOIN public."Users" ON "Users"."OEMID" = "Enquiry"."DSECode"
//     WHERE "Users"."UserId" = ${UserId}
//   `;
//   try {
//     const getdata = await Seq.query(getAllmodelsQuery, { type: sequelize.QueryTypes.SELECT });
//     const desiredFields = ["EnquiryDate","EnquiryStatus","EnquiryNo", "Source", "CustomerType","TitleName","ProspectName","MobileNumber","OfficePhone",
//     "EmailId","SubCompany","DateofBirth","DateofWedding","Address","District","StateDesc","PinCode","ModelName","VariantName","FuelType","DealerLocation","DSEName"]; // Replace with your desired fields

//     const filteredData = getdata.map(customer => {
//       return desiredFields.reduce((acc, field) => {
//         acc[field] = customer[field];
//         return acc;
//       }, {});
//     });

//     // Send the response here
//     return res.status(200).json({ status: 'success', data: filteredData });
//   } catch (err) {
//     console.error(err); // Log the error for debugging purposes
//     res.status(500).send({
//       message: err.message || "Some error occurred while retrieving ModelMasters."
//     });
//   }
// };

exports.findAll = async (req, res) => {
  const EmpID = req.query.EmpID; // Retrieve EmpID from query parameters

  if (!EmpID) {
    return res.status(400).json({
      status: "error",
      message: "EmpID is required in the query parameters.",
    });
  }

  try {
    // Fetch UserMaster first to get OEMID (DSECode) for the given EmpID
    const userMaster = await UserMaster.findOne({
      where: { EmpID: EmpID },
      attributes: ["OEMID"], // Assuming OEMID is equivalent to DSECode in EnquiryDMS
    });

    if (!userMaster) {
      return res.status(404).json({
        status: "error",
        message: "User with the provided EmpID not found.",
      });
    }

    // Fetch data from EnquiryDMS
    const enquiries = await Enquiry.findAll({
      where: { DSECode: userMaster.OEMID },
      attributes: [
        "EnquiryID",
        "Date",
        "EnquiryStatus",
        "EnquiryNo",
        "Source",
        "CustomerType",
        "CompanyInstitution",
        "Title",
        "FirstName",
        "MobileNo",
        "OfficePhone",
        "EmailID",
        "SubCompany",
        "DateofBirth",
        "DateofAnniversary",
        "Address",
        "District",
        "StateDesc",
        "PINCode",
        "Model",
        "Variant",
        "FuelType",
        "Branch",
        "User",
        "Colour",
        "Transmission",
      ],
      // order: [["CreatedDate", "DESC"]],
    });

    // Extract unique models
    const modelsList = [...new Set(enquiries.map((enquiry) => enquiry.Model))];

    // Fetch ModelMaster data for these models
    const modelData = await ModelMaster.findAll({
      where: { ModelDescription: modelsList },
      attributes: ["ModelDescription", "ModelImageURL"],
    });

    // Create a mapping from ModelDescription to ModelImageURL
    const modelImageMap = modelData.reduce((acc, model) => {
      acc[model.ModelDescription] = model.ModelImageURL;
      return acc;
    }, {});

    // Map and filter the data, adding ModelImageURL
    const enquiriesWithImages = enquiries.map((enquiry) => {
      return {
        ...enquiry.toJSON(),
        ModelImageURL: modelImageMap[enquiry.Model] || null,
      };
    });

    // Extract unique branches
    const branchList = [...new Set(enquiries.map((enquiry) => enquiry.Branch))];

    // Fetch BranchMaster data for these branches
    const branchData = await BranchMaster.findAll({
      where: { OEMStoreName: branchList },
      attributes: ["BranchName", "OEMStoreName"],
    });

    // Create a mapping from OEMStoreName to BranchName
    const branchNameMap = branchData.reduce((acc, branch) => {
      acc[branch.OEMStoreName] = branch.BranchName;
      return acc;
    }, {});

    // Map and filter the data, adding VGBranchName
    const finalData = enquiriesWithImages.map((enquiry) => {
      return {
        ...enquiry,
        VGBranchName: branchNameMap[enquiry.Branch] || null,
      };
    });

    // Send the response
    return res.status(200).json({
      status: "success",
      data: finalData,
    });
  } catch (err) {
    console.error(err); // Log the error for debugging purposes
    return res.status(500).json({
      status: "error",
      message: err.message || "Some error occurred while retrieving data.",
    });
  }
};

/* Old Code for getting enquiries
exports.findAll = async (req, res) => {
  const EmpID = req.query.EmpID; // Retrieve EmpId from query parameters

  if (!EmpID) {
    return res.status(400).json({
      status: "error",
      message: "EmpId is required in the query parameters.",
    });
  }
  // const getAllmodelsQuery = `
  //   SELECT public."EnquiryDMS".*, "UserMaster"."EmpID"
  //   FROM public."EnquiryDMS"
  //   INNER JOIN public."UserMaster" ON "UserMaster"."OEMID" = "EnquiryDMS"."DSECode"
  //   WHERE "UserMaster"."EmpID" = $1`; // Using parameterized query

  try {
    // const getdata = await Seq.query(getAllmodelsQuery, {
    //   bind: [EmpID], // Bind EmpId as parameter value
    //   type: sequelize.QueryTypes.SELECT,
    // });
    // Fetch UserMaster first to get DSECode for the given EmpID
    const userMaster = await UserMaster.findOne({
      where: { EmpID: EmpID },
      attributes: ["OEMID"], // Assuming OEMID is equivalent to DSECode in EnquiryDMS
    });

    if (!userMaster) {
      return res.status(404).json({
        status: "error",
        message: "User with the provided EmpID not found.",
      });
    }
    // Fetch data using Sequelize query
    const getdata = await Enquiry.findAll({
      where: { DSECode: userMaster.OEMID },
      attributes: [
        "EnquiryID",
        "Date",
        "EnquiryStatus",
        "EnquiryNo",
        "Source",
        "CustomerType",
        "CompanyInstitution",
        "Title",
        "FirstName",
        // "LastName",
        // "Occupation",
        "MobileNo",
        "OfficePhone",
        "EmailID",
        "SubCompany",
        "DateofBirth",
        "DateofAnniversary",
        "Address",
        "District",
        "StateDesc",
        "PINCode",
        "Model",
        "Variant",
        "FuelType",
        "Branch",
        "User",
        "Colour",
        "Transmission",
      ],
      order: [
        ["Date", "ASC"], // Order by ModelDescription in ascending order
      ],
    });

    // //console.log(getdata);
    // const desiredFields = [
    //   "EnquiryID",
    //   "Date",
    //   "EnquiryStatus",
    //   "EnquiryNo",
    //   "Source",
    //   "CustomerType",
    //   "CompanyInstitution",
    //   "Title",
    //   "FirstName",
    //   "LastName",
    //   "Occupation",
    //   "MobileNo",
    //   "OfficePhone",
    //   "EmailID",
    //   "SubCompany",
    //   "DateofBirth",
    //   "DateofAnniversary",
    //   "Address",
    //   "District",
    //   "StateDesc",
    //   "PINCode",
    //   "Model",
    //   "Variant",
    //   "FuelType",
    //   "Branch",
    //   "User",
    //   "Colour",
    //   "Transmission",
    // ]; // Replace with your desired fields

    // const filteredData = getdata.map((customer) => {
    //   return desiredFields.reduce((acc, field) => {
    //     acc[field] = customer[field];
    //     return acc;
    //   }, {});
    // });

    // Extract desired fields
    const desiredFields = [
      "EnquiryID",
      "Date",
      "EnquiryStatus",
      "EnquiryNo",
      "Source",
      "CustomerType",
      "CompanyInstitution",
      "Title",
      "FirstName",
      "LastName",
      "Occupation",
      "MobileNo",
      "OfficePhone",
      "EmailID",
      "SubCompany",
      "DateofBirth",
      "DateofAnniversary",
      "Address",
      "District",
      "StateDesc",
      "PINCode",
      "Model",
      "Variant",
      "FuelType",
      "Branch",
      "User",
      "Colour",
      "Transmission",
    ];

    // Map and filter the data
    const filteredData = getdata.map((enquiry) => {
      return desiredFields.reduce((acc, field) => {
        acc[field] = enquiry.get(field); // Access field value using get() method
        return acc;
      }, {});
    });

    // Send the response here
    return res.status(200).json({ status: "success", data: filteredData });
  } catch (err) {
    console.error(err); // Log the error for debugging purposes
    res.status(500).send({
      message:
        err.message || "Some error occurred while retrieving ModelMasters.",
    });
  }
};

*/

// exports.findOne = async (req, res) => {
//   const { UserID: UserID, EnquiryID: EnquiryID } = req.body;

//   console.log(req.body);
//   if (!UserID || !EnquiryID) {
//     return res.status(400).json({
//       status: "error",
//       message: "UserID and EnquiryId are required in the request body.",
//     });
//   }

//   try {
//     const GetEnquiryByIdQuery = `
//       SELECT public."EnquiryDMS".*, "UserMaster"."UserID"
//       FROM public."EnquiryDMS"
//       INNER JOIN public."UserMaster" ON "UserMaster"."OEMID" = "EnquiryDMS"."DSECode"
//       WHERE "UserMaster"."UserID" = ${UserID} and "EnquiryDMS"."EnquiryID"= ${EnquiryID};
//     `;

//     const getdataByid = await Seq.query(GetEnquiryByIdQuery, {
//       replacements: { UserID, EnquiryID },
//       type: sequelize.QueryTypes.SELECT,
//     });
//     console.log("........", getdataByid);
//     const desiredFields1 = [
//       "EnquiryDate",
//       "EnquiryStatus",
//       "EnquiryNo",
//       "Source",
//       "CustomerType",
//       "CompanyInstitution",
//       "TitleName",
//       "ProspectName",
//       "MobileNo",
//       "OfficePhone",
//       "EmailId",
//       "SubCompany",
//       "DateofBirth",
//       "DateofWedding",
//       "Address",
//       "District",
//       "StateDesc",
//       "PINCode",
//       "ModelName",
//       "VariantName",
//       "FuelType",
//       "DealerLocation",
//       "DSEName",
//       "Colour",
//       "Transmission",
//     ]; // Replace with your desired fields

//     const filteredData1 = getdataByid.map((customer) => {
//       return desiredFields1.reduce((acc, field) => {
//         acc[field] = customer[field];
//         return acc;
//       }, {});
//     });

//     // Send the response here
//     return res.status(200).json({ status: "success", data: filteredData1 });
//   } catch (error) {
//     console.error(error);
//     return res
//       .status(500)
//       .json({ message: error.message || "Internal server error" });
//   }
// };

exports.findOne = async (req, res) => {
  const { UserID, EnquiryID } = req.body;

  if (!UserID || !EnquiryID) {
    return res.status(400).json({
      status: "error",
      message: "UserID and EnquiryID are required in the request body.",
    });
  }

  try {
    // Fetch UserMaster first to get DSECode for the given UserID
    const userMaster = await UserMaster.findOne({
      where: { UserID: UserID },
      attributes: ["OEMID"], // Assuming OEMID is equivalent to DSECode in EnquiryDMS
    });

    if (!userMaster) {
      return res.status(404).json({
        status: "error",
        message: "User with the provided UserID not found.",
      });
    }

    // Fetch EnquiryDMS data based on EnquiryID and DSECode (OEMID from UserMaster)
    const enquiryData = await Enquiry.findOne({
      where: { EnquiryID: EnquiryID, DSECode: userMaster.OEMID },
      attributes: [
        "EnquiryDate",
        "EnquiryStatus",
        "EnquiryNo",
        "Source",
        "CustomerType",
        "CompanyInstitution",
        "TitleName",
        "ProspectName",
        "MobileNo",
        "OfficePhone",
        "EmailId",
        "SubCompany",
        "DateofBirth",
        "DateofWedding",
        "Address",
        "District",
        "StateDesc",
        "PINCode",
        "ModelName",
        "VariantName",
        "FuelType",
        "DealerLocation",
        "DSEName",
        "Colour",
        "Transmission",
      ],
    });

    if (!enquiryData) {
      return res.status(404).json({
        status: "error",
        message:
          "Enquiry data not found for the provided UserID and EnquiryID.",
      });
    }

    // Extract desired fields
    const desiredFields = [
      "EnquiryDate",
      "EnquiryStatus",
      "EnquiryNo",
      "Source",
      "CustomerType",
      "CompanyInstitution",
      "TitleName",
      "ProspectName",
      "MobileNo",
      "OfficePhone",
      "EmailId",
      "SubCompany",
      "DateofBirth",
      "DateofWedding",
      "Address",
      "District",
      "StateDesc",
      "PINCode",
      "ModelName",
      "VariantName",
      "FuelType",
      "DealerLocation",
      "DSEName",
      "Colour",
      "Transmission",
    ];

    // Map and filter the data
    const filteredData = desiredFields.reduce((acc, field) => {
      acc[field] = enquiryData.get(field); // Access field value using get() method
      return acc;
    }, {});

    // Send response
    return res.status(200).json({ status: "success", data: filteredData });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to retrieve enquiry data. Please try again later.",
    });
  }
};

exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const enquiry = await Enquiry.findByPk(id);

    if (!enquiry) {
      return res
        .status(404)
        .json({ message: `Enquiry with id=${id} not found.` });
    }

    // Update the Enquiry with the data from the request body
    await enquiry.update(req.body);

    // Fetch the updated Enquiry (optional, you can customize the response as needed)
    const updatedEnquiry = await Enquiry.findByPk(id);

    return res.json({
      message: "Enquiry was updated successfully.",
      enquiry: updatedEnquiry,
    });
  } catch (error) {
    console.error("Error updating Enquiry:", error);
    return res
      .status(500)
      .json({ message: "Internal server error while updating Enquiry." });
  }
};
