const axios = require("axios");
/* eslint-disable no-unused-vars */
const db = require("../models");
const DmsTransactions = db.dmsTransaction;
const DmsTransCharge = db.dmstranscharges;
const DmsTransCustomer = db.dmstranscustomer;
const DmsHSNmaster = db.dmsHsnMaster;
const cron = require("node-cron");

const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;

// Third-party authentication API
exports.DmsAuth = async (req, res) => {
  console.log("Request received for authentication");

  try {
    // Validate request body
    const { userId, password } = req.body;

    if (!userId || !password) {
      console.log("Validation failed: Missing userId or password");
      return res.status(400).json({
        message: "Both userId and password are required",
      });
    }

    // Prepare request payload for the third-party API
    const payload = {
      userId: "varun.fdi:yclu$#%!2833**Y",
      password: "#~LU19fs",
    };
    console.log("Payload to send to third-party API:", payload);

    // Call the third-party API
    const response = await axios.post(
      "http://www.dmsfinanceportal.co.in:9090/authenticate",
      payload,
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    console.log("Response from third-party API:", response.data);

    // Return the response from the third-party API
    return res.status(response.status).json(response.data);
  } catch (err) {
    console.error("Error during third-party authentication:", err.message);

    // Handle errors from the third-party API
    if (err.response) {
      return res.status(err.response.status).json({
        message: "Third-party API error",
        details: err.response.data,
      });
    }

    // Handle unexpected errors
    return res.status(500).json({
      message: "Internal server error",
      details: err.message,
    });
  }
};

// Controller for handling the procedure call
// exports.procedureCallWithDate = async (req, res) => {
//   console.log("Starting procedure call with date");

//   try {
//     // Step 1: Generate Bearer Token by calling the authentication API
//     console.log("Generating Bearer token...");
//     const authResponse = await axios.post(
//       "http://www.dmsfinanceportal.co.in:9090/authenticate",
//       {
//         userId: "varun.fdi:yclu$#%!2833**Y",
//         password: "#~LU19fs",
//       },
//       {
//         headers: { "Content-Type": "application/json" },
//       }
//     );
//     console.log("?????????", authResponse.data);
//     const token = authResponse.data.Authorization; // Assume the API returns a token in `data.token`
//     if (!token) {
//       console.log("Failed to generate Bearer token");
//       return res
//         .status(500)
//         .json({ message: "Failed to generate Bearer token" });
//     }
//     console.log("Generated Bearer token:", token);

//     // Step 2: Call the third-party API with the token and payload
//     const payload = {
//       prntGrp: "VARUN",
//       trnType: "VP",
//       mulCd: "ALL",
//       forCd: "ALL",
//       outlet_cd: "ALL",
//       fromdate: "26-10-2024",
//       todate: "26-10-2024",
//       j: `Bearer ${token}`,
//     };

//     console.log("Calling third-party API with payload:", payload);

//     const thirdPartyResponse = await axios.post(
//       "http://www.dmsfinanceportal.co.in:9090/procedureCallWithDate",
//       payload,
//       {
//         headers: {
//           "Content-Type": "application/json",
//           // Authorization: `Bearer ${token}`,
//         },
//       }
//     );

//     console.log("Response from third-party API:", thirdPartyResponse);

//     // Step 3: Return the third-party response to the client
//     return res.status(thirdPartyResponse.status).json(thirdPartyResponse);
//   } catch (err) {
//     console.error("Error during procedure call with date:", err.message);

//     // Handle errors from either the authentication API or third-party API
//     if (err.response) {
//       return res.status(err.response.status).json({
//         message: "Error from API",
//         details: err.response.data,
//       });
//     }

//     // Handle unexpected errors
//     return res.status(500).json({
//       message: "Internal server error",
//       details: err.message,
//     });
//   }
// };

// async function DmsAuth(req, res) {
//   console.log("Request received for authentication");

//   try {
//     // Prepare request payload for the third-party API
//     const payload = {
//       userId: "varun.fdi:yclu$#%!2833**Y",
//       password: "#~LU19fs",
//     };
//     console.log("Payload to send to third-party API:", payload);

//     // Call the third-party API
//     const response = await axios.post(
//       "http://www.dmsfinanceportal.co.in:9090/authenticate",
//       payload,
//       {
//         headers: { "Content-Type": "application/json" },
//       }
//     );

//     console.log("Response from third-party API:", response.data);

//     // Return the response from the third-party API
//     return res.status(response.status).json(response.data);
//   } catch (err) {
//     console.error("Error during third-party authentication:", err.message);

//     // Handle errors from the third-party API
//     if (err.response) {
//       return res.status(err.response.status).json({
//         message: "Third-party API error",
//         details: err.response.data,
//       });
//     }

//     // Handle unexpected errors
//     return res.status(500).json({
//       message: "Internal server error",
//       details: err.message,
//     });
//   }
// }

// module.exports = DmsAuth;

// exports.procedureCallWithDate = async (req, res) => {
//   console.log("Starting procedure call with date");

//   try {
//     // Step 1: Generate Bearer Token by calling the authentication API
//     console.log("Generating Bearer token...");
//     const authResponse = await axios.post(
//       "http://www.dmsfinanceportal.co.in:9090/authenticate",
//       {
//         userId: "varun.fdi:yclu$#%!2833**Y",
//         password: "#~LU19fs",
//       },
//       {
//         headers: { "Content-Type": "application/json" },
//       }
//     );

//     // console.log("Authentication response:", authResponse.data);

//     const token = authResponse.data.Authorization; // Assume the API returns a token in `data.Authorization`
//     if (!token) {
//       console.log("Failed to generate Bearer token");
//       return res
//         .status(500)
//         .json({ message: "Failed to generate Bearer token" });
//     }
//     // console.log("Generated Bearer token:", token);

//     // Step 2: Construct the query string for the third-party API call
//     const payload = {
//       prntGrp: "VARUN",
//       trnType: "VP",
//       mulCd: "ALL",
//       forCd: "ALL",
//       outlet_cd: "ALL",
//       fromdate: "26-10-2024",
//       todate: "26-10-2024",
//       // j: `Bearer ${token}`,
//       // j: "Bearer Bearer:eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ2YXJ1bi5mZGk6eWNsdSQjJSEyODMzKipZIiwiZXhwIjoxNzMxOTk5MjU1LCJpYXQiOjE3MzE5OTU2NTV9.syzC-hY8w1MImoEOo4roxSQtNfeC0lKm7d-zmWm1HOQ0OsRiPU8FyBt9IytNOn4F9G9aBlWQoTAhoxDFELDH8Q",
//     };
//     //console.log(">>>>>>>>>", token);

//     const queryString = new URLSearchParams(payload).toString();
//     // console.log("//////////////", queryString);

//     const apiUrl = `http://www.dmsfinanceportal.co.in:9090/procedureCallWithDate?${queryString}&j=${token}`;

//     //  console.log("?????????????", apiUrl);

//     // Step 3: Call the third-party API with the token
//     const thirdPartyResponse = await axios.get(apiUrl, {
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`, // Ensure the token is correctly formatted
//       },
//     });

//     const dmsdata = thirdPartyResponse.data;

//     if (!dmsdata) {
//       console.log("No data received from third-party API");
//       return res.status(204).json({ message: "No data received" });
//     }

//     //console.log("Data received from third-party API:", dmsdata);

//     // Step 4: Bulk insert or update data into database
//     if (dmsdata.TransactionCustomer && dmsdata.TransactionCustomer.length > 0) {
//       const mappedTransactionCustomer = dmsdata.TransactionCustomer.map(
//         (item) => ({
//           cust_id: item.cust_ID, // Map response field `custid` to database field `cust_ID`
//           cust_name: item.cust_NAME, // Map `custname` to `cust_NAME`
//           // utd: item.utd,
//           // comp_FA: item.compfa,
//           // outlet_CD: item.outletcd,
//           // loc_CD: item.loccd,
//           // dealer_FOR_CD: item.dealerforcd,
//           // dealer_MAP_CD: item.dealermapcd,
//           // parent_GROUP: item.parentgroup,
//           // mul_DEALER_CD: item.muldealercd,
//         })
//       );
//       console.log("}}}}}}}}}}}}}}}}}", mappedTransactionCustomer);
//       await DmsTransCustomer.bulkCreate(mappedTransactionCustomer, {
//         updateOnDuplicate: [
//           "cust_id",
//           "cust_name",
//           // "utd",
//           // "comp_FA",
//           // "outlet_CD",
//           // "loc_CD",
//           // "dealer_FOR_CD",
//           // "dealer_MAP_CD",
//           // "parent_GROUP",
//           // "mul_DEALER_CD",
//         ],
//       });

//       console.log("TransactionCustomer data processed");
//     }

//     // if (dmsdata.TransactionList && dmsdata.TransactionList.length > 0) {
//     //   await DmsTransactions.bulkCreate(dmsdata.TransactionList, {
//     //     updateOnDuplicate: [
//     //       "cust_ID",
//     //       "model_CD",
//     //       "vin",
//     //       "engine_NUM",
//     //       "chassis_NUM",
//     //       "trans_DATE",
//     //       "trans_TYPE",
//     //       "trans_ID",
//     //       "trans_REF_NUM",
//     //       "trans_QTY",
//     //       "trans_SEGMENT",
//     //       "basic_PRICE",
//     //     ],
//     //   });
//     //   console.log("TransactionList data processed");
//     // }

//     // if (dmsdata.TransactionCharges && dmsdata.TransactionCharges.length > 0) {
//     //   await DmsTransCharge.bulkCreate(dmsdata.TransactionCharges, {
//     //     updateOnDuplicate: [
//     //       "charge_CD",
//     //       "charge_AMT",
//     //       "charge_TYPE",
//     //       "charge_DESC",
//     //       "hsn_NO",
//     //       "utd",
//     //       "comp_FA",
//     //       "outlet_CD",
//     //       "loc_CD",
//     //       "dealer_FOR_CD",
//     //       "dealer_MAP_CD",
//     //       "parent_GROUP",
//     //       "mul_DEALER_CD",
//     //     ],
//     //   });
//     //   console.log("TransactionCharges data processed");
//     // }

//     // Step 5: Return a success response
//     // return res.status(200).json({ message: "Data processed successfully!" });

//     console.log("Response from third-party API:", dmsdata);

//     // Step 4: Return the third-party response to the client
//     return res.status(thirdPartyResponse.status).json(dmsdata);
//   } catch (err) {
//     console.error("Error during procedure call with date:", err.message);

//     // Handle errors from either the authentication API or third-party API
//     if (err.response) {
//       return res.status(err.response.status).json({
//         message: "Error from API",
//         details: err.response.data,
//       });
//     }

//     // Handle unexpected errors
//     return res.status(500).json({
//       message: "Internal server error",
//       details: err.message,
//     });
//   }
// };

// exports.procedureCallWithDate = async (req, res) => {
//   console.log("Starting procedure call with date");

//   try {
//     // Step 1: Generate Bearer Token
//     console.log("Generating Bearer token...");
//     const authResponse = await axios.post(
//       "http://www.dmsfinanceportal.co.in:9090/authenticate",
//       {
//         userId: "varun.fdi:yclu$#%!2833**Y",
//         password: "#~LU19fs",
//       },
//       { headers: { "Content-Type": "application/json" } }
//     );

//     const token = authResponse.data.Authorization;
//     if (!token) {
//       console.log("Failed to generate Bearer token");
//       return res
//         .status(500)
//         .json({ message: "Failed to generate Bearer token" });
//     }

//     // Step 2: Prepare API call
//     const payload = {
//       prntGrp: "VARUN",
//       trnType: "VP",
//       mulCd: "ALL",
//       forCd: "ALL",
//       outlet_cd: "ALL",
//       fromdate: "26-10-2024",
//       todate: "26-10-2024",
//     };
//     const queryString = new URLSearchParams(payload).toString();
//     const apiUrl = `http://www.dmsfinanceportal.co.in:9090/procedureCallWithDate?${queryString}&j=${token}`;

//     // Step 3: Call the third-party API
//     const thirdPartyResponse = await axios.get(apiUrl, {
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//     });

//     const dmsdata = thirdPartyResponse.data;

//     if (!dmsdata || !dmsdata.TransactionCustomer) {
//       console.log("No data received from third-party API");
//       return res.status(204).json({ message: "No data received" });
//     }

//     // Step 4: Map and save TransactionCustomer data to DmsTransCustomer table
//     console.log("Saving TransactionCustomer data...");

//     const fieldMapping = {
//       cust_ID: "cust_id",
//       cust_NAME: "cust_name",
//       salutation: "salutation",
//       utd: "utd",
//       gender: "gender",
//       marital_STATUS: "marital_status",
//       comp_FA: "comp_fa",
//       communicate_TO: "communicate_to",
//       res_ADDRESS1: "res_address1",
//       off_ADDRESS2: "off_address2",
//       off_ADDRESS3: "off_address3",
//       off_PIN_CD: "res_pin_cd",
//       res_CITY: "res_city",
//       res_PHONE: "res_phone",
//       mobile1: "mobile1",
//       mobile2: "mobile2",
//       email_ID: "email_id",
//       pan_NO: "pan_no",
//       state: "state",
//       district: "district",
//       tehsil: "tehsil",
//       village: "village",
//       gst_NUM: "gst_num",
//       tin: "tin",
//       uin: "uin",
//       dob: "dob",
//       doa: "doa",
//       ship_ADDRESS1: "ship_address1",
//       ship_ADDRESS2: "ship_address2",
//       ship_ADDRESS3: "ship_address3",
//       ship_PIN_CD: "ship_pin_cd",
//       ship_CITY: "ship_city",
//       ship_STATE: "ship_state",
//       ship_FULL_NAME: "ship_full_name",
//       ship_PAN: "ship_pan",
//       ship_GST_NUM: "ship_gst_num",
//       ship_UIN: "ship_uin",
//       parent_GROUP: "parent_group",
//       dealer_MAP_CD: "dealer_map_cd",
//       dealer_FOR_CD: "dealer_for_cd",
//       outlet_CD: "outlet_cd",
//     };
//     console.log("?????????", fieldMapping);
//     const customersToSave = dmsdata.TransactionCustomer.map((customer) => {
//       const mappedCustomer = {};
//       for (const [apiField, dbField] of Object.entries(fieldMapping)) {
//         mappedCustomer[dbField] = customer[apiField] || null;
//       }
//       return mappedCustomer;
//     });
//     console.log(">>>>>>>>>>>>", customersToSave);
//     await DmsTransCustomer.bulkCreate(customersToSave);

//     const translistMapping = {
//       utd: "utd",
//       parent_GROUP: "parent_group",
//       dealer_MAP_CD: "dealer_map_cd",
//       loc_CD: "loc_cd",
//       comp_FA: "comp_fa",
//       mul_DEALER_CD: "mul_dealer_cd",
//       outlet_CD: "outlet_cd",
//       trans_TYPE: "trans_type",
//       trans_DATE: "trans_date",
//       trans_ID: "trans_id",
//       trans_REF_NUM: "trans_ref_num",
//       trans_REF_DATE: "trans_ref_date",
//       trans_QTY: "trans_qty",
//       trans_SEGMENT: "trans_segment",
//       vin: "vin",
//       model_CD: "model_cd",
//       variant_CD: "variant_cd",
//       ecolor_CD: "ecolor_cd",
//       basic_PRICE: "basic_price",
//       discount: "discount",
//       taxable_VALUE: "taxable_value",
//       service_AMOUNT: "service_amount",
//       gst_NO: "gst_no",
//       place_OF_SUPPLY: "place_of_supply",
//       cust_NAME: "cust_name",
//       executive: "executive",
//       team_HEAD: "team_head",
//       finc_NAME: "finc_name",
//       payment_MODE: "payment_mode",
//       deposit_BANK: "deposit_bank",
//       payment_FOR: "payment_for",
//       ge1: "ge1",
//       ge2: "ge2",
//       ge3: "ge3",
//       ge4: "ge4",
//       ge5: "ge5",
//       ge6: "ge6",
//       ge7: "ge7",
//       ge8: "ge8",
//       ge9: "ge9",
//       ge10: "ge10",
//       ge11: "ge11",
//       ge12: "ge12",
//       ge13: "ge13",
//       ge14: "ge14",
//       ge15: "ge15",
//       engine_NUM: "engine_num",
//       chassis_NUM: "chassis_num",
//       cust_ID: "cust_id",
//       hsn_NO: "hsn_no",
//     };
//     console.log("?????????", translistMapping);
//     const TransListToSave = dmsdata.TransactionList.map((customer) => {
//       const mappedTransList = {};
//       for (const [apiField, dbField] of Object.entries(fieldMapping)) {
//         mappedTransList[dbField] = customer[apiField] || null;
//       }
//       return mappedTransList;
//     });
//     console.log(">>>>>>>>>>>>", TransListToSave);
//     await DmsTransactions.bulkCreate(TransListToSave);

//     // Step 5: Return a success response
//     console.log("Data saved successfully");
//     return res.status(200).json({ message: "Data saved successfully" });
//   } catch (err) {
//     console.error("Error during procedure call with date:", err.message);

//     // Handle API errors
//     if (err.response) {
//       return res.status(err.response.status).json({
//         message: "Error from API",
//         details: err.response.data,
//       });
//     }

//     // Handle unexpected errors
//     return res.status(500).json({
//       message: "Internal server error",
//       details: err.message,
//     });
//   }
// };

// // --12-12-2024 working code
// exports.procedureCallWithDate = async (req, res) => {
//   console.log("Starting procedure call with date");

//   try {
//     // Generate Bearer Token
//     console.log("Generating Bearer token...");
//     const authResponse = await axios.post(
//       "http://www.dmsfinanceportal.co.in:9090/authenticate",
//       {
//         userId: "varun.fdi:yclu$#%!2833**Y",
//         password: "#~LU19fs",
//       },
//       { headers: { "Content-Type": "application/json" } }
//     );

//     const token = authResponse.data.Authorization;
//     if (!token) {
//       console.log("Failed to generate Bearer token");
//       return res
//         .status(500)
//         .json({ message: "Failed to generate Bearer token" });
//     }

//     const payload = {
//       prntGrp: "VARUN",
//       trnType: "VP",
//       mulCd: "ALL",
//       forCd: "ALL",
//       outlet_cd: "ALL",
//       fromdate: "01-10-2024",
//       todate: "02-10-2024",
//     };
//     const queryString = new URLSearchParams(payload).toString();
//     const apiUrl = `http://www.dmsfinanceportal.co.in:9090/procedureCallWithDate?${queryString}&j=${token}`;

//     const thirdPartyResponse = await axios.get(apiUrl, {
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//     });

//     const dmsdata = thirdPartyResponse.data;

//     if (!dmsdata || !dmsdata.TransactionCustomer) {
//       console.log("No data received from third-party API");
//       return res.status(204).json({ message: "No data received" });
//     }

//     console.log("Saving TransactionCustomer data...");
//     const fieldMapping = {
//       cust_ID: "cust_id",
//       cust_NAME: "cust_name",
//       salutation: "salutation",
//       utd: "utd",
//       gender: "gender",
//       marital_STATUS: "marital_status",
//       comp_FA: "comp_fa",
//       communicate_TO: "communicate_to",
//       res_ADDRESS1: "res_address1",
//       off_ADDRESS2: "off_address2",
//       off_ADDRESS3: "off_address3",
//       off_PIN_CD: "res_pin_cd",
//       res_CITY: "res_city",
//       res_PHONE: "res_phone",
//       mobile1: "mobile1",
//       mobile2: "mobile2",
//       email_ID: "email_id",
//       pan_NO: "pan_no",
//       state: "state",
//       district: "district",
//       tehsil: "tehsil",
//       village: "village",
//       gst_NUM: "gst_num",
//       tin: "tin",
//       uin: "uin",
//       dob: "dob",
//       doa: "doa",
//       ship_ADDRESS1: "ship_address1",
//       ship_ADDRESS2: "ship_address2",
//       ship_ADDRESS3: "ship_address3",
//       ship_PIN_CD: "ship_pin_cd",
//       ship_CITY: "ship_city",
//       ship_STATE: "ship_state",
//       ship_FULL_NAME: "ship_full_name",
//       ship_PAN: "ship_pan",
//       ship_GST_NUM: "ship_gst_num",
//       ship_UIN: "ship_uin",
//       parent_GROUP: "parent_group",
//       dealer_MAP_CD: "dealer_map_cd",
//       dealer_FOR_CD: "dealer_for_cd",
//       outlet_CD: "outlet_cd",
//     };

//     const customersToSave = dmsdata.TransactionCustomer.map((customer) => {
//       const mappedCustomer = {};
//       for (const [apiField, dbField] of Object.entries(fieldMapping)) {
//         mappedCustomer[dbField] = customer[apiField] || null;
//       }
//       return mappedCustomer;
//     });

//     for (const customer of customersToSave) {
//       await DmsTransCustomer.upsert(customer, {
//         conflictFields: ["gd_fdi_trans_customer_id"], // Specify unique constraint field
//       }); // Use upsert to avoid duplicates
//     }

//     console.log("Saving TransactionList data...");
//     const translistMapping = {
//       utd: "utd",
//       parent_GROUP: "parent_group",
//       dealer_MAP_CD: "dealer_map_cd",
//       loc_CD: "loc_cd",
//       comp_FA: "comp_fa",
//       mul_DEALER_CD: "mul_dealer_cd",
//       outlet_CD: "outlet_cd",
//       trans_TYPE: "trans_type",
//       trans_DATE: "trans_date",
//       trans_ID: "trans_id",
//       trans_REF_NUM: "trans_ref_num",
//       trans_REF_DATE: "trans_ref_date",
//       trans_QTY: "trans_qty",
//       trans_SEGMENT: "trans_segment",
//       vin: "vin",
//       model_CD: "model_cd",
//       variant_CD: "variant_cd",
//       ecolor_CD: "ecolor_cd",
//       basic_PRICE: "basic_price",
//       discount: "discount",
//       taxable_VALUE: "taxable_value",
//       service_AMOUNT: "service_amount",
//       gst_NO: "gst_no",
//       place_OF_SUPPLY: "place_of_supply",
//       cust_NAME: "cust_name",
//       executive: "executive",
//       team_HEAD: "team_head",
//       finc_NAME: "finc_name",
//       payment_MODE: "payment_mode",
//       deposit_BANK: "deposit_bank",
//       payment_FOR: "payment_for",
//       ge1: "ge1",
//       ge2: "ge2",
//       ge3: "ge3",
//       ge4: "ge4",
//       ge5: "ge5",
//       ge6: "ge6",
//       ge7: "ge7",
//       ge8: "ge8",
//       ge9: "ge9",
//       ge10: "ge10",
//       ge11: "ge11",
//       ge12: "ge12",
//       ge13: "ge13",
//       ge14: "ge14",
//       ge15: "ge15",
//       engine_NUM: "engine_num",
//       chassis_NUM: "chassis_num",
//       cust_ID: "cust_id",
//       hsn_NO: "hsn_no",
//     };

//     const TransListToSave = dmsdata.TransactionList.map((transaction) => {
//       const mappedTransaction = {};
//       for (const [apiField, dbField] of Object.entries(translistMapping)) {
//         mappedTransaction[dbField] = transaction[apiField] || null;
//       }
//       return mappedTransaction;
//     });

//     for (const transaction of TransListToSave) {
//       await DmsTransactions.upsert(transaction, {
//         conflictFields: ["utd"], // Specify unique constraint field
//       }); // Use upsert to avoid duplicates
//     }

//     const transCharges = {
//       utd: "utd",
//       charge_CD: "charge_cd",
//       charge_AMT: "charge_amt",
//       charge_TYPE: "charge_type",
//       dlr_SHARE: "dlr_share",
//       charge_DESC: "charge_desc",
//       msil_SHARE: "msil_share",
//       charge_RATE: "charge_rate",
//       trans_DATE: "trans_date",
//       hsn_NO: "hsn_NO",
//       comp_FA: "comp_fa",
//       outlet_CD: "outlet_cd",
//       loc_CD: "loc_cd",
//       dealer_FOR_CD: "dealer_for_cd",
//       dealer_MAP_CD: "dealer_map_cd",
//       parent_GROUP: "parent_group",
//       mul_DEALER_CD: "mul_dealer_cd",
//     };

//     const TransChargeList = dmsdata.TransactionCharges.map((Charges) => {
//       const mappedCharges = {};
//       for (const [apiField, dbField] of Object.entries(transCharges)) {
//         mappedCharges[dbField] = Charges[apiField] || null;
//       }
//       return mappedCharges;
//     });

//     for (const Charges of TransChargeList) {
//       await DmsTransCharge.upsert(Charges, {
//         conflictFields: ["gd_fdi_trans_charges_id"], // Specify unique constraint field
//       }); // Use upsert to avoid duplicates
//     }

//     console.log("Data saved successfully");
//     return res.status(200).json({ message: "Data saved successfully" });
//   } catch (err) {
//     console.error("Error during procedure call with date:", err.message);

//     if (err.response) {
//       return res.status(err.response.status).json({
//         message: "Error from API",
//         details: err.response.data,
//       });
//     }

//     return res.status(500).json({
//       message: "Internal server error",
//       details: err.message,
//     });
//   }
// };

// Helper function for field mapping
const mapFields = (data, fieldMapping) => {
  const mappedData = {};
  for (const [apiField, dbField] of Object.entries(fieldMapping)) {
    mappedData[dbField] = data[apiField] || null; // Handle missing values
  }
  return mappedData;
};

exports.procedureCallWithDate = async (req, res) => {
  console.log("Starting procedure call with date");

  try {
    // Generate Bearer Token
    console.log("Generating Bearer token...");
    const authResponse = await axios.post(
      "http://www.dmsfinanceportal.co.in:9090/authenticate",
      {
        userId: "varun.fdi:yclu$#%!2833**Y",
        password: "#~LU19fs",
      },
      { headers: { "Content-Type": "application/json" } }
    );

    const token = authResponse.data.Authorization;
    if (!token) {
      console.log("Failed to generate Bearer token");
      return res
        .status(500)
        .json({ message: "Failed to generate Bearer token" });
    }

    const payload = {
      prntGrp: "VARUN",
      trnType: "VP",
      mulCd: "ALL",
      forCd: "ALL",
      outlet_cd: "ALL",
      fromdate: "02-10-2024",
      todate: "03-10-2024",
    };
    const queryString = new URLSearchParams(payload).toString();
    const apiUrl = `http://www.dmsfinanceportal.co.in:9090/procedureCallWithDate?${queryString}&j=${token}`;

    const thirdPartyResponse = await axios.get(apiUrl, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const dmsdata = thirdPartyResponse.data;

    if (!dmsdata || !dmsdata.TransactionCustomer) {
      console.log("No data received from third-party API");
      return res.status(204).json({ message: "No data received" });
    }

    console.log("Mapping and saving data...");

    // Field Mappings
    const customerFieldMapping = {
      cust_ID: "cust_id",
      cust_NAME: "cust_name",
      salutation: "salutation",
      utd: "utd",
      gender: "gender",
      marital_STATUS: "marital_status",
      comp_FA: "comp_fa",
      communicate_TO: "communicate_to",
      res_ADDRESS1: "res_address1",
      off_ADDRESS2: "off_address2",
      off_ADDRESS3: "off_address3",
      off_PIN_CD: "res_pin_cd",
      res_CITY: "res_city",
      res_PHONE: "res_phone",
      mobile1: "mobile1",
      mobile2: "mobile2",
      email_ID: "email_id",
      pan_NO: "pan_no",
      state: "state",
      district: "district",
      tehsil: "tehsil",
      village: "village",
      gst_NUM: "gst_num",
      tin: "tin",
      uin: "uin",
      dob: "dob",
      doa: "doa",
      ship_ADDRESS1: "ship_address1",
      ship_ADDRESS2: "ship_address2",
      ship_ADDRESS3: "ship_address3",
      ship_PIN_CD: "ship_pin_cd",
      ship_CITY: "ship_city",
      ship_STATE: "ship_state",
      ship_FULL_NAME: "ship_full_name",
      ship_PAN: "ship_pan",
      ship_GST_NUM: "ship_gst_num",
      ship_UIN: "ship_uin",
      parent_GROUP: "parent_group",
      dealer_MAP_CD: "dealer_map_cd",
      dealer_FOR_CD: "dealer_for_cd",
      outlet_CD: "outlet_cd",
    };

    const transactionFieldMapping = {
      utd: "utd",
      parent_GROUP: "parent_group",
      dealer_MAP_CD: "dealer_map_cd",
      loc_CD: "loc_cd",
      comp_FA: "comp_fa",
      mul_DEALER_CD: "mul_dealer_cd",
      outlet_CD: "outlet_cd",
      trans_TYPE: "trans_type",
      trans_DATE: "trans_date",
      trans_ID: "trans_id",
      trans_REF_NUM: "trans_ref_num",
      trans_REF_DATE: "trans_ref_date",
      trans_QTY: "trans_qty",
      trans_SEGMENT: "trans_segment",
      vin: "vin",
      model_CD: "model_cd",
      variant_CD: "variant_cd",
      ecolor_CD: "ecolor_cd",
      basic_PRICE: "basic_price",
      discount: "discount",
      taxable_VALUE: "taxable_value",
      service_AMOUNT: "service_amount",
      gst_NO: "gst_no",
      place_OF_SUPPLY: "place_of_supply",
      cust_NAME: "cust_name",
      executive: "executive",
      team_HEAD: "team_head",
      finc_NAME: "finc_name",
      payment_MODE: "payment_mode",
      deposit_BANK: "deposit_bank",
      payment_FOR: "payment_for",
      engine_NUM: "engine_num",
      chassis_NUM: "chassis_num",
      cust_ID: "cust_id",
      hsn_NO: "hsn_no",
    };

    const chargeFieldMapping = {
      utd: "utd",
      charge_CD: "charge_cd",
      charge_AMT: "charge_amt",
      charge_TYPE: "charge_type",
      dlr_SHARE: "dlr_share",
      charge_DESC: "charge_desc",
      msil_SHARE: "msil_share",
      charge_RATE: "charge_rate",
      trans_DATE: "trans_date",
      hsn_NO: "hsn_NO",
      comp_FA: "comp_fa",
      outlet_CD: "outlet_cd",
      loc_CD: "loc_cd",
      dealer_FOR_CD: "dealer_for_cd",
      dealer_MAP_CD: "dealer_map_cd",
      parent_GROUP: "parent_group",
      mul_DEALER_CD: "mul_dealer_cd",
    };

    // Map data
    const customersToSave = dmsdata.TransactionCustomer.map((customer) =>
      mapFields(customer, customerFieldMapping)
    );
    const transactionsToSave = dmsdata.TransactionList.map((transaction) =>
      mapFields(transaction, transactionFieldMapping)
    );
    const chargesToSave = dmsdata.TransactionCharges.map((charge) =>
      mapFields(charge, chargeFieldMapping)
    );

    // Save data using bulk operations
    await Promise.all([
      DmsTransCustomer.bulkCreate(customersToSave, {
        updateOnDuplicate: Object.values(customerFieldMapping),
      }),
      DmsTransactions.bulkCreate(transactionsToSave, {
        updateOnDuplicate: Object.values(transactionFieldMapping),
      }),
      DmsTransCharge.bulkCreate(chargesToSave, {
        updateOnDuplicate: Object.values(chargeFieldMapping),
      }),
    ]);

    console.log("Data saved successfully");
    return res.status(200).json({ message: "Data saved successfully" });
  } catch (err) {
    console.error("Error during procedure call with date:", err.message);

    if (err.response) {
      return res.status(err.response.status).json({
        message: "Error from API",
        details: err.response.data,
      });
    }

    return res.status(500).json({
      message: "Internal server error",
      details: err.message,
    });
  }
};

// CronJob for DMS  test
// test
const saveTransactionData = async () => {
  console.log("Starting procedure call with date");

  try {
    const currentDate = new Date();
    const formattedDate = currentDate
      .toLocaleDateString("en-GB")
      .split("/")
      .reverse()
      .join("-"); // Format as "dd-mm-yyyy"

    const payload = {
      prntGrp: "VARUN",
      trnType: "VP",
      mulCd: "ALL",
      forCd: "ALL",
      outlet_cd: "ALL",
      // fromdate: formattedDate,
      // todate: formattedDate,
      fromdate: "02-10-2024",
      todate: "03-10-2024",
    };

    console.log("Generating Bearer token...");
    const authResponse = await axios.post(
      "http://www.dmsfinanceportal.co.in:9090/authenticate",
      {
        userId: "varun.fdi:yclu$#%!2833**Y",
        password: "#~LU19fs",
      },
      { headers: { "Content-Type": "application/json" } }
    );

    const token = authResponse.data.Authorization;
    if (!token) {
      console.log("Failed to generate Bearer token");
      throw new Error("Failed to generate Bearer token");
    }

    const queryString = new URLSearchParams(payload).toString();
    const apiUrl = `http://www.dmsfinanceportal.co.in:9090/procedureCallWithDate?${queryString}&j=${token}`;

    const thirdPartyResponse = await axios.get(apiUrl, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const dmsdata = thirdPartyResponse.data;

    if (!dmsdata || !dmsdata.TransactionCustomer) {
      console.log("No data received from third-party API");
      return;
    }

    console.log("Saving data to the database...");
    // Save TransactionCustomer data
    const fieldMapping = {
      cust_ID: "cust_id",
      cust_NAME: "cust_name",
      salutation: "salutation",
      utd: "utd",
      gender: "gender",
      marital_STATUS: "marital_status",
      comp_FA: "comp_fa",
      communicate_TO: "communicate_to",
      res_ADDRESS1: "res_address1",
      off_ADDRESS2: "off_address2",
      off_ADDRESS3: "off_address3",
      off_PIN_CD: "res_pin_cd",
      res_CITY: "res_city",
      res_PHONE: "res_phone",
      mobile1: "mobile1",
      mobile2: "mobile2",
      email_ID: "email_id",
      pan_NO: "pan_no",
      state: "state",
      district: "district",
      tehsil: "tehsil",
      village: "village",
      gst_NUM: "gst_num",
      tin: "tin",
      uin: "uin",
      dob: "dob",
      doa: "doa",
      ship_ADDRESS1: "ship_address1",
      ship_ADDRESS2: "ship_address2",
      ship_ADDRESS3: "ship_address3",
      ship_PIN_CD: "ship_pin_cd",
      ship_CITY: "ship_city",
      ship_STATE: "ship_state",
      ship_FULL_NAME: "ship_full_name",
      ship_PAN: "ship_pan",
      ship_GST_NUM: "ship_gst_num",
      ship_UIN: "ship_uin",
      parent_GROUP: "parent_group",
      dealer_MAP_CD: "dealer_map_cd",
      dealer_FOR_CD: "dealer_for_cd",
      outlet_CD: "outlet_cd",
    };

    const customersToSave = dmsdata.TransactionCustomer.map((customer) => {
      const mappedCustomer = {};
      for (const [apiField, dbField] of Object.entries(fieldMapping)) {
        mappedCustomer[dbField] = customer[apiField] || null;
      }
      return mappedCustomer;
    });

    for (const customer of customersToSave) {
      await DmsTransCustomer.upsert(customer, {
        conflictFields: ["gd_fdi_trans_customer_id"],
      });
    }

    // Save TransactionList data
    const translistMapping = {
      utd: "utd",
      parent_GROUP: "parent_group",
      dealer_MAP_CD: "dealer_map_cd",
      loc_CD: "loc_cd",
      comp_FA: "comp_fa",
      mul_DEALER_CD: "mul_dealer_cd",
      outlet_CD: "outlet_cd",
      trans_TYPE: "trans_type",
      trans_DATE: "trans_date",
      trans_ID: "trans_id",
      trans_REF_NUM: "trans_ref_num",
      trans_REF_DATE: "trans_ref_date",
      trans_QTY: "trans_qty",
      trans_SEGMENT: "trans_segment",
      vin: "vin",
      model_CD: "model_cd",
      variant_CD: "variant_cd",
      ecolor_CD: "ecolor_cd",
      basic_PRICE: "basic_price",
      discount: "discount",
      taxable_VALUE: "taxable_value",
      service_AMOUNT: "service_amount",
      gst_NO: "gst_no",
      place_OF_SUPPLY: "place_of_supply",
      cust_NAME: "cust_name",
      executive: "executive",
      team_HEAD: "team_head",
      finc_NAME: "finc_name",
      payment_MODE: "payment_mode",
      deposit_BANK: "deposit_bank",
      payment_FOR: "payment_for",
      ge1: "ge1",
      ge2: "ge2",
      ge3: "ge3",
      ge4: "ge4",
      ge5: "ge5",
      ge6: "ge6",
      ge7: "ge7",
      ge8: "ge8",
      ge9: "ge9",
      ge10: "ge10",
      ge11: "ge11",
      ge12: "ge12",
      ge13: "ge13",
      ge14: "ge14",
      ge15: "ge15",
      engine_NUM: "engine_num",
      chassis_NUM: "chassis_num",
      cust_ID: "cust_id",
      hsn_NO: "hsn_no",
      // Other field mappings...
    };

    const TransListToSave = dmsdata.TransactionList.map((transaction) => {
      const mappedTransaction = {};
      for (const [apiField, dbField] of Object.entries(translistMapping)) {
        mappedTransaction[dbField] = transaction[apiField] || null;
      }
      return mappedTransaction;
    });

    for (const transaction of TransListToSave) {
      await DmsTransactions.upsert(transaction, {
        conflictFields: ["utd"],
      });
    }

    const transCharges = {
      utd: "utd",
      charge_CD: "charge_cd",
      charge_AMT: "charge_amt",
      charge_TYPE: "charge_type",
      dlr_SHARE: "dlr_share",
      charge_DESC: "charge_desc",
      msil_SHARE: "msil_share",
      charge_RATE: "charge_rate",
      trans_DATE: "trans_date",
      hsn_NO: "hsn_NO",
      comp_FA: "comp_fa",
      outlet_CD: "outlet_cd",
      loc_CD: "loc_cd",
      dealer_FOR_CD: "dealer_for_cd",
      dealer_MAP_CD: "dealer_map_cd",
      parent_GROUP: "parent_group",
      mul_DEALER_CD: "mul_dealer_cd",
    };

    const TransChargeList = dmsdata.TransactionCharges.map((Charges) => {
      const mappedCharges = {};
      for (const [apiField, dbField] of Object.entries(transCharges)) {
        mappedCharges[dbField] = Charges[apiField] || null;
      }
      return mappedCharges;
    });

    for (const Charges of TransChargeList) {
      await DmsTransCharge.upsert(Charges, {
        conflictFields: ["gd_fdi_trans_charges_id"], // Specify unique constraint field
      }); // Use upsert to avoid duplicates
    }

    console.log("Data saved successfully");
  } catch (err) {
    console.error("Error during procedure call with date:", err.message);
  }
};

// Schedule the cron job
cron.schedule("15 10 * * *", async () => {
  console.log("Running scheduled task...");
  await saveTransactionData();
});

console.log("Cron job scheduled to run at midnight daily.");
