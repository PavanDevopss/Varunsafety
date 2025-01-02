/* eslint-disable no-unused-vars */
const db = require("../models"); // Adjust model import based on your actual model setup♂
const multer = require("multer");
const xlsx = require("xlsx");
const MappingFunction = require("./mappingFunctions");
const TempSKUMaster = db.skumaster_temp;
const EnquiryDMS = db.enquirydms;
const VehicleStock_Temp = db.vehiclestock_temp;
const Offer_Temp = db.offer_temp;
const DepartmentMaster = db.departmentmaster;
const APIActionMaster = db.apiactionmaster;

// Function to configure Multer storage dynamically
const configureStorage = (uploadDir) => {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadDir); // Uploads will be stored in the specified directory
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname); // Use the original filename for uploaded files
    },
  });
  return multer({ storage: storage });
};

// Initialize Multer with the configured storage
// const upload = configureStorage("C:\\Users\\varun\\OneDrive\\Desktop\\uploads");
const upload = configureStorage(
  "/home/administrator/VARUNGROUP/IMAGES_VMS_MARUTI"
);

// Function to determine Sequelize model and mapping function based on modelName
function getModelAndMapping(modelName) {
  let model;
  let mapFunction;
  let additionalParams = [];

  switch (modelName) {
    case "SKUMaster":
      model = TempSKUMaster;
      mapFunction = MappingFunction.mapExcelToDatabaseForSKUMaster;
      break;
    case "Offers":
      model = Offer_Temp;
      mapFunction = MappingFunction.mapExcelToDatabaseForOffers;
      additionalParams = ["DiscountID", "DiscountName", "BranchID"];
      break;
    case "VehicleStock":
      model = VehicleStock_Temp;
      mapFunction = MappingFunction.mapExcelToDatabaseForVehicleStock;
      additionalParams = [
        "BranchCode",
        "BranchID",
        "VendorName",
        "VendorMasterID",
      ];
      break;
    case "EnquiryDMS":
      model = EnquiryDMS;
      mapFunction = MappingFunction.mapExcelToDatabaseForEnquiryDMS;
      break;
    default:
      throw new Error("Invalid model name.");
  }

  return { model, mapFunction, additionalParams };
}

// Export the importExcel function as the handler for the route
// exports.importExcel = async (req, res) => {
//   try {
//     upload.single("file")(req, res, async function (err) {
//       if (err instanceof multer.MulterError) {
//         return res
//           .status(500)
//           .send({ message: "Multer error: " + err.message });
//       } else if (err) {
//         return res
//           .status(500)
//           .send({ message: "Error uploading file: " + err.message });
//       }

//       if (!req.file) {
//         return res.status(400).send({ message: "Excel file not found." });
//       }

//       const { modelName, ...additionalParams } = req.body;

//       if (!modelName) {
//         return res.status(400).send({ message: "Model name is required." });
//       }

//       const excelFile = req.file.path;
//       const workbook = xlsx.readFile(excelFile);
//       const sheetName = workbook.SheetNames[0];
//       const worksheet = workbook.Sheets[sheetName];
//       const excelData = xlsx.utils.sheet_to_json(worksheet);

//       try {
//         const {
//           model,
//           mapFunction,
//           additionalParams: params,
//         } = getModelAndMapping(modelName);

//         const mappingParams = params.map((param) => additionalParams[param]);

//         const mappedData = mapFunction(excelData, ...mappingParams);
//         const insertedData = await model.bulkCreate(mappedData);
//         console.log("Inserted Data:", insertedData);
//         res.send({ message: "Data imported and saved successfully." });
//       } catch (err) {
//         console.error("Error importing and saving data:", err);
//         res.status(500).send({ message: "Error importing and saving data." });
//       }
//     });
//   } catch (err) {
//     console.error("Error parsing uploadPath:", err);
//     res.status(400).send({ message: "Error parsing uploadPath." });
//   }
// };

exports.importExcel = async (req, res) => {
  try {
    upload.single("file")(req, res, async function (err) {
      if (err instanceof multer.MulterError) {
        return res
          .status(500)
          .send({ message: "Multer error: " + err.message });
      } else if (err) {
        return res
          .status(500)
          .send({ message: "Error uploading file: " + err.message });
      }

      if (!req.file) {
        return res.status(400).send({ message: "Excel file not found." });
      }

      const { modelName, ...additionalParams } = req.body;

      if (!modelName) {
        return res.status(400).send({ message: "Model name is required." });
      }

      const excelFile = req.file.path;
      const workbook = xlsx.readFile(excelFile);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const excelData = xlsx.utils.sheet_to_json(worksheet);

      try {
        const {
          model,
          mapFunction,
          additionalParams: params,
        } = getModelAndMapping(modelName);

        const mappingParams = params.map((param) => additionalParams[param]);
        let mappedData = mapFunction(excelData, ...mappingParams);

        let importCount = 0;
        let ignoreCount = 0;

        if (modelName === "EnquiryDMS") {
          // Fetch existing EnquiryNo entries in the database
          const existingEntries = await model.findAll({
            attributes: ["EnquiryNo"],
            raw: true,
          });

          const existingEnquiryNos = new Set(
            existingEntries.map((entry) => entry.EnquiryNo)
          );

          // Filter out duplicates based on EnquiryNo and track counts
          const filteredData = [];
          for (const row of mappedData) {
            if (existingEnquiryNos.has(row.EnquiryNo)) {
              ignoreCount++;
            } else {
              filteredData.push(row);
              importCount++;
            }
          }

          mappedData = filteredData;
        } else {
          // If not EnquiryDMS, assume all data should be imported
          importCount = mappedData.length;
        }

        const insertedData = await model.bulkCreate(mappedData);
        console.log("Inserted Data:", insertedData);
        res.send({
          message: `Data imported and saved successfully. ${importCount} ${modelName} imported and ${ignoreCount} ${modelName} ignored`,
        });
      } catch (err) {
        console.error("Error importing and saving data:", err);
        res.status(500).send({ message: "Error importing and saving data." });
      }
    });
  } catch (err) {
    console.error("Error parsing uploadPath:", err);
    res.status(400).send({ message: "Error parsing uploadPath." });
  }
};

async function findAllByModelName(modelName) {
  let model;
  let mapFunction;

  switch (modelName) {
    case "DepartmentMaster":
      model = DepartmentMaster;
      mapFunction = MappingFunction.findAllDepartments;
      break;
    case "APIActionMaster":
      model = APIActionMaster;
      mapFunction = MappingFunction.findAllActions;
      break;
    default:
      throw new Error("Invalid modelName provided");
  }

  return { model, mapFunction };
}

exports.findAll = async (req, res) => {
  const { modelName } = req.body;

  try {
    if (!modelName) {
      return res.status(400).json({ error: "modelName parameter is required" });
    }

    const { model, mapFunction } = await findAllByModelName(modelName);

    if (!model || !mapFunction) {
      return res.status(404).json({
        message: `No ${modelName} data found.`,
      });
    }

    const data = await mapFunction(); // Execute the mapFunction to get data

    if (!data || data.length === 0) {
      return res.status(404).json({
        message: `No ${modelName} data found.`,
      });
    }

    // Send the mapped data as response
    res.json(data);
  } catch (error) {
    // Handle errors
    console.error(`Error retrieving ${modelName} data:`, error);
    if (error.message === "Invalid modelName provided") {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({
      message: `Failed to retrieve ${modelName} data. Please try again later.`,
      details: error.message,
    });
  }
};
