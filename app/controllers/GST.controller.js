/* eslint-disable no-unused-vars */
const axios = require("axios");
const {
  generateSymmetricKey,
  encryptData,
  decryptSymmetricKey,
  decryptBySymmetricKey,
  encryptBySymmetricKey,
  decryptBySymmetricKeyIRN,
} = require("../Utils/CryptoUtils");
const db = require("../models");
const GSTEWBErrorCode = db.gstewberrorcodes;
const GSTIRNErrorCode = db.gstirnerrorcodes;

const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const client_gstin = process.env.GSTIN;
const password = process.env.PASSWORD;
const username = "VARUN_MOTORS_4";
const irnURL = process.env.IRNURL;
const ewbURL = process.env.EWBURL;
const EWBGenUrl = process.env.EWBGENURL;
const IRNGenUrl = process.env.IRNGENURL;
const IRNGenUrl2 = process.env.IRNGENURL2;
const baseUrl = process.env.EWBBASEURL;
const IRNDetailsUrl = process.env.IRNDETAILSURL;
const IRNDetailsUrl2 = process.env.IRNDETAILSURL2;
const IRNDetailsByDocTypeUrl = process.env.IRNDETAILSBYDOCTYPEURL;
const IRNDetailsByDocTypeUrl2 = process.env.IRNDETAILSBYDOCTYPEURL2;
const IRNCancelUrl = process.env.IRNCANCELURL;
const IRNCancelUrl2 = process.env.IRNCANCELURL2;
const IRNEWBGenUrl = process.env.IRNEWBGENURL;
const IRNEWBGenUrl2 = process.env.IRNEWBGENURL2;
const IRNEWBGetUrl = process.env.IRNEWBGETURL;
const IRNEWBGetUrl2 = process.env.IRNEWBGETURL2;
const IRNEWBCancelUrl = process.env.IRNEWBCANCELURL;
const IRNEWBCancelUrl2 = process.env.IRNEWBCANCELURL2;

let appKey = "";
let tokenExpiry = "";
let encryptedSek = "";
let authToken = "";
let decryptedSek = "";
let forceRefreshAccessToken = false;

/**
 * Authenticate the user with the given auth type (IRN/EWB).
 * @param {string} authType - Type of authentication (IRN or EWB).
 * @returns {Promise<Object>} - A promise that resolves with authentication data.
 */
async function authenticate(authType) {
  try {
    console.log("Starting authentication process...");

    const symmetricKey = generateSymmetricKey();
    const symmetricKeyBase64 = symmetricKey.toString("base64");
    appKey = symmetricKeyBase64;
    console.log("Generated symmetric key:", symmetricKeyBase64);

    let jsonData;
    let apiUrl;

    if (authType === "IRN") {
      jsonData = {
        UserName: username,
        Password: password,
        AppKey: appKey,
        ForceRefreshAccessToken: forceRefreshAccessToken,
      };
      apiUrl = irnURL;
    } else {
      jsonData = {
        action: "ACCESSTOKEN",
        username: username,
        password: password,
        app_key: appKey,
      };
      apiUrl = ewbURL;
    }

    console.log("Data to be encrypted:", JSON.stringify(jsonData));

    const encryptedData = encryptData(jsonData, authType);
    console.log("Encrypted data:", encryptedData);

    const payload = JSON.stringify({ Data: encryptedData });
    console.log("Payload to be sent:", payload);

    console.log("API URL:", apiUrl);

    const response = await axios.post(apiUrl, payload, {
      headers: {
        "client-id": client_id,
        "client-secret": client_secret,
        Gstin: client_gstin,
        "Content-Type": "application/json",
      },
    });
    console.log("Response received:", response.data);

    const respData = response.data;

    if (
      (authType === "IRN" && respData.Status === 1) ||
      (authType === "EWB" && respData.status === "1")
    ) {
      console.log("Authentication successful");
      // Handle IRN response
      if (authType === "IRN") {
        tokenExpiry =
          respData.Data.TokenExpiry ||
          new Date(new Date().getTime() + 60 * 60 * 1000).toISOString();
        encryptedSek = respData.Data.Sek;
        authToken = respData.Data.AuthToken;
      }
      // Handle EWB response
      else {
        tokenExpiry = new Date(
          new Date().getTime() + 60 * 60 * 1000
        ).toISOString(); // Default expiry time
        encryptedSek = respData.sek;
        authToken = respData.authtoken;
      }

      console.log("TokenExpiry:", tokenExpiry);
      console.log("Encrypted SEK:", encryptedSek);
      console.log("AuthToken:", authToken);

      decryptedSek = decryptSymmetricKey(encryptedSek, appKey);
      console.log("Decrypted SEK:", decryptedSek);

      // forceRefreshAccessToken = false;

      // refreshSession(authType);

      // Return the authentication data instead of sending a response
      return {
        Status: 1,
        Data: {
          AuthToken: authToken,
          Sek: decryptedSek,
          TokenExpiry: tokenExpiry,
        },
      };
    } else {
      // Error handling based on authType
      let errorDetails = {
        ErrorMessage: "Unknown error",
        ErrorCode: "UNKNOWN",
      };

      if (authType === "IRN") {
        // Return response data as it is for IRN
        return {
          Status: 0,
          ErrorDetails: respData,
        };
      } else {
        // Decode and handle error for EWB
        const errorField = respData.error || respData.ErrorCode;

        if (errorField) {
          try {
            const decodedErrorDetails = decodeBase64(errorField);
            console.log("Decoded ErrorDetails:", decodedErrorDetails);
            const retrieveErrorCode = JSON.parse(decodedErrorDetails);
            console.log("Parsed ErrorDetails:", retrieveErrorCode);

            const errorDetailsFromDb = await GSTEWBErrorCode.findOne({
              where: { ErrorCodes: retrieveErrorCode.errorCodes },
            });

            if (errorDetailsFromDb) {
              errorDetails = {
                ErrorMessage: errorDetailsFromDb.Description,
                ErrorCode: retrieveErrorCode.errorCodes,
              };
            } else {
              errorDetails = {
                ErrorMessage:
                  retrieveErrorCode.ErrorMessage || "Error occurred",
                ErrorCode: retrieveErrorCode.errorCodes,
              };
            }
          } catch (parseError) {
            console.error("Error parsing ErrorDetails:", parseError.message);

            errorDetails = {
              ErrorMessage: "Failed to parse error details",
              ErrorCode: "UNKNOWN",
            };
          }
        }

        console.error("Error from API:", errorDetails);
        return {
          Status: 0,
          ErrorDetails: errorDetails,
        };
      }
    }
  } catch (error) {
    console.error("Error during API call:", error.message);
    console.error("Error details:", {
      response: error.response ? error.response.data : null,
      config: error.config,
      message: error.message,
      code: error.code,
    });
    return {
      Status: 0,
      ErrorDetails: "Internal Server Error",
    };
  }
}

// Authentication function
// Authentication function
async function authenticateAPI(req, res) {
  console.log("Received request body:", req.body);

  try {
    const { authType, username, password, forceRefreshAccessToken } = req.body;
    const symmetricKey = generateSymmetricKey();
    const symmetricKeyBase64 = symmetricKey.toString("base64");
    const appKey = symmetricKeyBase64;

    let jsonData;
    let apiUrl;

    if (authType === "IRN") {
      jsonData = {
        UserName: username,
        Password: password,
        AppKey: appKey,
        ForceRefreshAccessToken: forceRefreshAccessToken,
      };
      apiUrl = irnURL;
    } else if (authType === "EWB") {
      jsonData = {
        action: "ACCESSTOKEN",
        username: username,
        password: password,
        app_key: appKey,
      };
      apiUrl = ewbURL;
    } else {
      console.error("Invalid authentication type:", authType);
      return res.status(400).json({
        Status: 0,
        ErrorDetails: "Invalid authentication type",
      });
    }

    console.log("Data to be encrypted:", JSON.stringify(jsonData));
    const encryptedData = encryptData(jsonData, authType);
    const payload = JSON.stringify({ Data: encryptedData });

    console.log("Payload to be sent:", payload);
    console.log("API URL:", apiUrl);

    const response = await axios.post(apiUrl, payload, {
      headers: {
        "client-id": client_id,
        "client-secret": client_secret,
        Gstin: client_gstin,
        "Content-Type": "application/json",
      },
    });

    console.log("Response received:", response.data);
    const respData = response.data;

    if (
      (authType === "IRN" && respData.Status === 1) ||
      (authType === "EWB" && respData.status === "1")
    ) {
      let tokenExpiry, encryptedSek, authToken;

      if (authType === "IRN") {
        tokenExpiry =
          respData.Data.TokenExpiry ||
          new Date(new Date().getTime() + 60 * 60 * 1000).toISOString();
        encryptedSek = respData.Data.Sek;
        authToken = respData.Data.AuthToken;
      } else {
        tokenExpiry = new Date(
          new Date().getTime() + 60 * 60 * 1000
        ).toISOString();
        encryptedSek = respData.sek;
        authToken = respData.authtoken;
      }

      console.log("TokenExpiry:", tokenExpiry);
      console.log("Encrypted SEK:", encryptedSek);
      console.log("AuthToken:", authToken);

      const decryptedSek = decryptSymmetricKey(encryptedSek, appKey);
      console.log("Decrypted SEK:", decryptedSek);

      return res.status(200).json({
        Status: 1,
        Data: {
          AuthToken: authToken,
          Sek: decryptedSek,
          TokenExpiry: tokenExpiry,
        },
      });
    } else {
      let errorDetails = {
        ErrorMessage: "Unknown error",
        ErrorCode: "UNKNOWN",
      };

      if (authType === "IRN") {
        return res.status(400).json({
          Status: 0,
          ErrorDetails: respData,
        });
      } else {
        const errorField = respData.error || respData.ErrorCode;

        if (errorField) {
          try {
            const decodedErrorDetails = decodeBase64(errorField);
            console.log("Decoded ErrorDetails:", decodedErrorDetails);
            const retrieveErrorCode = JSON.parse(decodedErrorDetails);
            console.log("Parsed ErrorDetails:", retrieveErrorCode);

            const errorDetailsFromDb = await GSTEWBErrorCode.findOne({
              where: { ErrorCodes: retrieveErrorCode.errorCodes },
            });

            if (errorDetailsFromDb) {
              errorDetails = {
                ErrorMessage: errorDetailsFromDb.Description,
                ErrorCode: retrieveErrorCode.errorCodes,
              };
            } else {
              errorDetails = {
                ErrorMessage:
                  retrieveErrorCode.ErrorMessage || "Error occurred",
                ErrorCode: retrieveErrorCode.errorCodes,
              };
            }
          } catch (parseError) {
            console.error("Error parsing ErrorDetails:", parseError.message);

            errorDetails = {
              ErrorMessage: "Failed to parse error details",
              ErrorCode: "UNKNOWN",
            };
          }
        }

        console.error("Error from API:", errorDetails);
        return res.status(400).json({
          Status: 0,
          ErrorDetails: errorDetails,
        });
      }
    }
  } catch (error) {
    console.error("Error during authentication:", error.message);
    return res.status(500).json({
      Status: 0,
      ErrorDetails: {
        ErrorMessage: "Internal server error",
      },
    });
  }
}

/**
 * Refresh the session periodically to maintain authentication.
 * @param {string} authType - Type of authentication (IRN or EWB).
 * @returns {Promise<void>} - A promise that resolves when the session is refreshed.
 */
async function refreshSession(authType) {
  try {
    const currentTime = new Date();
    const bufferMillis = 9 * 60 * 1000; // 9 minutes in milliseconds

    let expiryTime =
      authType === "EWB"
        ? new Date(currentTime.getTime() + 60 * 60 * 1000) // 1 hour from now
        : new Date(tokenExpiry); // Ensure tokenExpiry is a valid ISO string

    const timeDifference = expiryTime - currentTime;
    const nextRefreshTime = new Date(expiryTime.getTime() - bufferMillis);
    const remainingTime = nextRefreshTime - currentTime;

    // Format time in HH:mm:ss
    const formatTime = (ms) => {
      const totalSeconds = Math.floor(ms / 1000);
      const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
      const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(
        2,
        "0"
      );
      const seconds = String(totalSeconds % 60).padStart(2, "0");
      return `${hours}:${minutes}:${seconds}`;
    };

    // Format date to 'YYYY-MM-DD HH:mm:ss'
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const seconds = String(date.getSeconds()).padStart(2, "0");
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    console.log("Current time:", formatDate(currentTime));
    console.log("Token expiry time:", formatDate(expiryTime));
    console.log("Time difference (HH:mm:ss):", formatTime(timeDifference));
    console.log("Scheduling next refresh at:", formatDate(nextRefreshTime));
    console.log("Time until next refresh:", formatTime(remainingTime));

    if (remainingTime <= 0) {
      console.log("Time to refresh the session");
      forceRefreshAccessToken = true;
      await authenticate(authType); // Make sure this is properly defined
    } else {
      setTimeout(() => refreshSession(authType), remainingTime);
    }
  } catch (error) {
    console.error("Error in refreshSession:", error.message);
  }
}

/**
 * Verify the GST number by making an API call.
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @returns {Promise<void>} - A promise that resolves when verification is complete.
 */
async function GSTVerification(req, res) {
  try {
    console.log("Starting GST verification process...");

    // Authenticate before proceeding
    const authResponse = await authenticate("IRN");

    // Check if authentication was successful
    if (authResponse.Status !== 1) {
      return res.status(400).json({
        Status: 0,
        ErrorDetails: authResponse.ErrorDetails || "Authentication failed",
      });
    }

    // Use the AuthToken from the successful authentication
    authToken = authResponse.Data.AuthToken;
    decryptedSek = authResponse.Data.Sek;

    console.log("Authentication successful.");

    const getGSTINData = req.query.GstIn;
    console.log("Retrieved GSTIN from request query:", getGSTINData);

    if (!getGSTINData) {
      console.log("Invalid input: GSTIN is required.");
      return res.status(400).json({
        Status: 0,
        ErrorDetails: encodeBase64(
          JSON.stringify({
            ErrorCode: "INVALID_INPUT",
            ErrorMessage: "GSTIN is required.",
          })
        ),
      });
    }

    // API call to verify GST
    const apiUrl = `${process.env.GSTVERIFYURL}/${getGSTINData}`;
    console.log("API URL for GST verification:", apiUrl);

    const response = await axios.get(apiUrl, {
      headers: {
        "client-id": client_id,
        "client-secret": client_secret,
        Gstin: client_gstin,
        user_name: username,
        AuthToken: authToken,
        "Content-Type": "application/json",
      },
    });
    console.log("API call successful. Response data:", response.data);

    const respData = response.data;

    // Check if the response contains an error
    if (respData.Status !== 1) {
      console.log("Error from GST verification API:", respData.ErrorDetails);
      return res.status(400).json({
        Status: 0,
        ErrorDetails:
          respData.ErrorDetails || "An error occurred during GST verification",
      });
    }

    // Proceed with decryption if data is available
    if (!respData.Data) {
      console.log("No data available for decryption.");
      return res.status(400).json({
        Status: 0,
        ErrorDetails: "No data returned from GST verification API",
      });
    }

    const decryptedData = decryptBySymmetricKey(respData.Data, decryptedSek);
    console.log("Decrypted data:", decryptedData);

    console.log("GST verification successful. Returning data:", decryptedData);

    // Ensure to send the decrypted data as a response
    if (!res.headersSent) {
      return res.status(200).json({
        Status: 1,
        Data: JSON.parse(decryptedData), // Parse decrypted JSON before sending
      });
    } else {
      console.error("Response already sent, cannot send new response.");
    }
  } catch (error) {
    console.error("Error during GST verification:", error.message);
    if (!res.headersSent) {
      return res.status(500).json({
        Status: 0,
        ErrorDetails: encodeBase64(
          JSON.stringify({
            ErrorCode: "INTERNAL_ERROR",
            ErrorMessage: "Internal server error",
          })
        ),
      });
    } else {
      console.error("Response already sent, cannot send new response.");
    }
  }
}

/**
 * Function to verify GST number by making an API call.
 * @param {string} gstId - The GSTIN to be verified.
 * @returns {Promise<Object>} - A promise that resolves to the verification response object.
 */
async function GSTVerificationFunc(gstId) {
  try {
    console.log("Starting GST verification process...");

    // Step 1: Authenticate before proceeding
    const authResponse = await authenticate("IRN");

    // Check if authentication was successful
    if (authResponse.Status !== 1) {
      console.error("Authentication failed:", authResponse.ErrorDetails);
      return {
        Status: 0,
        ErrorDetails: authResponse.ErrorDetails || "Authentication failed",
      };
    }

    // Extract the AuthToken and SEK
    const authToken = authResponse.Data.AuthToken;
    const decryptedSek = authResponse.Data.Sek;

    console.log("Authentication successful.");

    // Step 2: Validate the input GSTIN
    if (!gstId) {
      console.log("Invalid input: GSTIN is required.");
      return {
        Status: 0,
        ErrorDetails: "GSTIN is required.",
      };
    }

    console.log("GSTIN received for verification:", gstId);

    // Step 3: Make the API call to verify GST
    const apiUrl = `${process.env.GSTVERIFYURL}/${gstId}`;
    console.log("API URL for GST verification:", apiUrl);

    const response = await axios.get(apiUrl, {
      headers: {
        "client-id": client_id,
        "client-secret": client_secret,
        Gstin: client_gstin,
        user_name: username,
        AuthToken: authToken,
        "Content-Type": "application/json",
      },
    });

    console.log("API response received:", response.data);

    const respData = response.data;

    // Step 4: Handle the response status
    if (respData.Status !== 1) {
      console.log("Error from GST verification API:", respData.ErrorDetails);
      return {
        Status: 0,
        ErrorDetails:
          respData.ErrorDetails || "An error occurred during GST verification",
      };
    }

    // Step 5: Decrypt the response data
    if (!respData.Data) {
      console.log("No data available for decryption.");
      return {
        Status: 0,
        ErrorDetails: "No data returned from GST verification API",
      };
    }

    console.log("Decrypting response data...");
    const decryptedData = decryptBySymmetricKey(respData.Data, decryptedSek);
    console.log("Decrypted GST verification data:", decryptedData);

    // Step 6: Parse decrypted data and return the result object
    const parsedData = JSON.parse(decryptedData);

    const responseObj = {
      Status: 1,
      Data: parsedData, // Final decrypted GST verification data
    };

    console.log("GST verification successful. Returning response object.");
    return responseObj;
  } catch (error) {
    // Handle any errors that occur during the process
    console.error("Error during GST verification:", error.message);

    return {
      Status: 0,
      ErrorDetails: {
        ErrorCode: "INTERNAL_ERROR",
        ErrorMessage: "Internal server error",
      },
    };
  }
}

/**
 * Generates an E-way bill by making an API call.
 * @param {Object} req - The HTTP request object, expected to contain vehicle details in the body.
 * @param {Object} res - The HTTP response object.
 * @returns {Promise<void>} - A promise that resolves when the E-way bill generation is complete.
 */

async function generateEwayBill(inputJson) {
  try {
    console.log("Starting E-way bill generation process...");

    // Step 1: Authenticate to get the token and SEK (Symmetric Encryption Key)
    console.log("Authenticating to obtain token and SEK...");
    const authResponse = await authenticate("EWB");

    // Check if authentication was successful
    if (authResponse.Status !== 1) {
      console.error(
        "Authentication failed:",
        authResponse.ErrorDetails || "No details available"
      );
      throw new Error(authResponse.ErrorDetails || "Authentication failed");
    }

    // Extract the authentication token and SEK from the response
    const authToken = authResponse.Data.AuthToken;
    const decryptedSek = authResponse.Data.Sek;
    console.log("Authentication successful. Token and SEK acquired.");

    // Step 2: Extract vehicle details from the input
    const vehicleDetails = inputJson;

    // Check if vehicle details are provided
    if (!vehicleDetails) {
      console.log("Invalid input: Vehicle details are required.");
      throw new Error("Vehicle details are required.");
    }

    // Step 3: Prepare the request JSON with vehicle details
    console.log("Preparing request JSON with vehicle details...");
    const requestJson = vehicleDetails; // Directly use the body as vehicle details
    console.log("Request JSON:", requestJson);

    // Step 4: Convert the request JSON to a UTF-8 string
    console.log("Converting request JSON to UTF-8 string...");
    const jsonString = JSON.stringify(requestJson);
    console.log("UTF-8 encoded request JSON:", jsonString);

    // Step 5: Encrypt the JSON using SEK
    console.log("Encrypting JSON using SEK...");
    const encryptedData = encryptBySymmetricKey(jsonString, decryptedSek);
    console.log("Encrypted data:", encryptedData);

    // Step 6: Create the final request payload
    console.log("Creating request payload...");
    const requestPayload = {
      action: "GENEWAYBILL",
      data: encryptedData, // Encrypted data
    };
    console.log("Request payload:", requestPayload);

    // Step 7: Send the POST request to the E-way Bill API
    console.log("Sending POST request to E-way Bill API...");
    const response = await axios.post(
      EWBGenUrl,
      JSON.stringify(requestPayload),
      {
        headers: {
          "client-id": client_id,
          "client-secret": client_secret,
          Gstin: client_gstin,
          authtoken: authToken,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("API response received:", response.data);

    // Step 8: Handle the response from the API
    const retrivedData = response.data;
    console.log("Retrieved data:", retrivedData);

    // Destructure the response to check status and error
    const { status, error, data } = retrivedData;

    if (status === "1") {
      // If status is 1, decrypt the response data
      console.log("Decrypting response data...");
      const decryptedResponse = decryptBySymmetricKey(data, decryptedSek);
      const ewayBillData = JSON.parse(decryptedResponse);
      console.log("E-way bill generated successfully:", ewayBillData);

      // Optionally update your table
      // console.log("Updating branchTransferData with E-way bill information...");
      // const updateResult = await updateBranchTransferData({
      //   ewayBillNo: ewayBillData.ewayBillNo,
      //   ewayBillDate: ewayBillData.ewayBillDate,
      //   validUpto: ewayBillData.validUpto,
      //   alert: ewayBillData.alert,
      // });
      // if (!updateResult.success) {
      //   throw new Error("Failed to update branch transfer data.");
      // }

      // Return the data
      return {
        Status: 1,
        Data: ewayBillData,
      };
    } else {
      // If status is not 1, handle multiple error codes
      const decodedError = decodeBase64(error);
      let errorDetails = {};

      try {
        // Parse the decoded error string as JSON
        errorDetails = JSON.parse(decodedError);
      } catch (parseError) {
        // Handle any parsing errors
        errorDetails = {
          ErrorCode: "PARSE_ERROR",
          ErrorMessage: "Error details could not be parsed.",
          errorCodes: "Unknown",
        };
      }

      // Process multiple error codes
      const rawErrorCodes = (errorDetails.errorCodes || "Unknown").toString();
      const errorCodesArray = rawErrorCodes
        .split(",")
        .map((code) => code.trim())
        .filter((code) => code);
      console.log("Error codes array:", errorCodesArray);

      // Look up additional error information from the database
      let detailedErrorMessages = {};

      try {
        const errorDetailsFromDb = await GSTEWBErrorCode.findAll({
          where: {
            ErrorCodes: errorCodesArray,
          },
        });

        // Map error codes to their descriptions
        errorDetailsFromDb.forEach((errorDetail) => {
          detailedErrorMessages[errorDetail.ErrorCodes] =
            errorDetail.Description;
        });
      } catch (dbError) {
        console.error(
          "Error querying database for detailed error messages:",
          dbError.message
        );
      }

      // Build the final error details
      const errorResponses = errorCodesArray.map((code) => ({
        ErrorCode: code,
        ErrorMessage: detailedErrorMessages[code] || "Unknown error message",
      }));

      console.error("Failed to generate E-way bill:", {
        ErrorMessages: errorResponses,
      });

      return {
        Status: 0,
        ErrorDetails: {
          ErrorMessages: errorResponses,
        },
      };
    }
  } catch (error) {
    // Catch any errors that occur during the process
    console.error("Error generating E-way bill:", error.message);
    return {
      Status: 0,
      ErrorDetails: {
        ErrorCode: "INTERNAL_ERROR",
        ErrorMessage: "Internal server error",
      },
    };
  }
}

// The Below function is used as an API, it sends response where as the above returns it as function
async function generateEwayBillAPI(req, res, inputJson) {
  try {
    console.log("Starting E-way bill generation process...");

    // Step 1: Authenticate to get the token and SEK (Symmetric Encryption Key)
    console.log("Authenticating to obtain token and SEK...");
    const authResponse = await authenticate("EWB");

    // Check if authentication was successful
    if (authResponse.Status !== 1) {
      console.error(
        "Authentication failed:",
        authResponse.ErrorDetails || "No details available"
      );
      return res.status(400).json({
        Status: 0,
        ErrorDetails: authResponse.ErrorDetails || "Authentication failed",
      });
    }

    // Extract the authentication token and SEK from the response
    const authToken = authResponse.Data.AuthToken;
    const decryptedSek = authResponse.Data.Sek;
    console.log("Authentication successful. Token and SEK acquired.");

    // Step 2: Extract vehicle details from the request body
    const vehicleDetails = req.body;

    // Check if vehicle details are provided in the request
    if (!vehicleDetails) {
      console.log("Invalid input: Vehicle details are required.");
      return res.status(400).json({
        Status: 0,
        ErrorDetails: "Vehicle details are required.",
      });
    }

    // Step 3: Prepare the request JSON with vehicle details
    console.log("Preparing request JSON with vehicle details...");
    const requestJson = vehicleDetails; // Directly use the body as vehicle details
    console.log("Request JSON:", requestJson);

    // Step 4: Convert the request JSON to a UTF-8 string
    console.log("Converting request JSON to UTF-8 string...");
    const jsonString = JSON.stringify(requestJson);
    console.log("UTF-8 encoded request JSON:", jsonString);

    // Step 5: Encrypt the JSON using SEK
    console.log("Encrypting JSON using SEK...");
    const encryptedData = encryptBySymmetricKey(jsonString, decryptedSek);
    console.log("Encrypted data:", encryptedData);

    // Step 6: Create the final request payload
    console.log("Creating request payload...");
    const requestPayload = {
      action: "GENEWAYBILL",
      data: encryptedData, // Encrypted data
    };
    console.log("Request payload:", requestPayload);

    // Step 7: Send the POST request to the E-way Bill API
    console.log("Sending POST request to E-way Bill API...");
    const response = await axios.post(
      EWBGenUrl,
      JSON.stringify(requestPayload),
      {
        headers: {
          "client-id": client_id,
          "client-secret": client_secret,
          Gstin: client_gstin,
          authtoken: authToken,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("API response received:", response.data);

    // Step 8: Handle the response from the API
    const retrivedData = response.data;
    console.log("Retrieved data:", retrivedData);

    // Destructure the response to check status and error
    const { status, error, info } = retrivedData;

    if (status === "1") {
      // If status is 1, decrypt the response data
      console.log("Decrypting response data...");
      const decryptedResponse = decryptBySymmetricKey(
        retrivedData.data,
        decryptedSek
      );
      console.log("E-way bill generated successfully:", decryptedResponse);

      // Return the decrypted response data
      return res.status(200).json({
        Status: 1,
        Data: JSON.parse(decryptedResponse),
      });
    } else {
      // If status is not 1, handle multiple error codes
      const decodedError = decodeBase64(error);
      let errorDetails = {};

      try {
        // Parse the decoded error string as JSON
        errorDetails = JSON.parse(decodedError);
      } catch (parseError) {
        // Handle any parsing errors
        errorDetails = {
          ErrorCode: "PARSE_ERROR",
          ErrorMessage: "Error details could not be parsed.",
          errorCodes: "Unknown",
        };
      }

      // Process multiple error codes
      const rawErrorCodes = (errorDetails.errorCodes || "Unknown").toString();
      const errorCodesArray = rawErrorCodes
        .split(",")
        .map((code) => code.trim())
        .filter((code) => code); // Split and trim codes
      console.log("Error codes array:", errorCodesArray);

      // Look up additional error information from the database
      let detailedErrorMessages = {};

      try {
        const errorDetailsFromDb = await GSTEWBErrorCode.findAll({
          where: {
            ErrorCodes: errorCodesArray,
          },
        });

        // Map error codes to their descriptions
        errorDetailsFromDb.forEach((errorDetail) => {
          detailedErrorMessages[errorDetail.ErrorCodes] =
            errorDetail.Description;
        });
      } catch (dbError) {
        console.error(
          "Error querying database for detailed error messages:",
          dbError.message
        );
      }

      // Build the final error details
      const errorResponses = errorCodesArray.map((code) => ({
        ErrorCode: code,
        ErrorMessage: detailedErrorMessages[code] || "Unknown error message",
      }));

      console.error("Failed to generate E-way bill:", {
        ErrorMessages: errorResponses,
      });

      return res.status(400).json({
        Status: 0,
        ErrorDetails: {
          ErrorMessages: errorResponses,
        },
      });
    }
  } catch (error) {
    // Catch any errors that occur during the process
    console.error("Error generating E-way bill:", error.message);
    return res.status(500).json({
      Status: 0,
      ErrorDetails: encodeBase64(
        JSON.stringify({
          ErrorCode: "INTERNAL_ERROR",
          ErrorMessage: "Internal server error",
        })
      ),
    });
  }
}

/**
 * Retrieves E-way Bill details by making an API call.
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @returns {Promise<void>} - A promise that resolves when the details are retrieved and processed.
 */
async function getEwayBillDetailsAPI(req, res) {
  try {
    console.log("Starting E-way Bill verification process...");

    // Authenticate (already done)
    const authResponse = await authenticate("EWB");

    // Check if authentication was successful
    if (authResponse.Status !== 1) {
      return res.status(400).json({
        Status: 0,
        ErrorDetails: authResponse.ErrorDetails || "Authentication failed",
      });
    }

    // Extract authentication token and decryption key from response
    const authToken = authResponse.Data.AuthToken;
    const decryptedSek = authResponse.Data.Sek;

    console.log("Authentication successful.");

    // Retrieve E-way Bill number from request query
    const ewbNo = req.query.ewbNo;
    console.log("Retrieved E-Way Bill number from request query:", ewbNo);

    // Validate that E-way Bill number is provided
    if (!ewbNo) {
      console.log("Invalid input: E-Way Bill number is required.");
      return res.status(400).json({
        Status: 0,
        ErrorDetails: encodeBase64(
          JSON.stringify({
            ErrorCode: "INVALID_INPUT",
            ErrorMessage: "E-Way Bill number is required.",
          })
        ),
      });
    }

    // Construct the API URL for retrieving E-way Bill details
    const apiUrl = `${baseUrl}/ewayapi/GetEwayBill`;
    console.log("API URL for E-Way Bill details:", apiUrl);

    // Make a GET request to the E-way Bill API
    const response = await axios.get(apiUrl, {
      headers: {
        "Content-Type": "application/json",
        "client-id": client_id,
        "client-secret": client_secret,
        Gstin: client_gstin,
        authtoken: authToken,
      },
      params: {
        ewbNo: ewbNo,
      },
    });

    console.log("API call successful. Response data:", response.data);
    const responseData = response.data;

    // Extract relevant data from the API response
    const EncryptRek = responseData.rek;
    const ewbResData = responseData.data;
    const status = responseData.status;
    const Hmac = responseData.hmac;

    console.log("filled data REK:", EncryptRek);
    console.log("filled data Response:", ewbResData);
    console.log("filled data Status:", status);
    console.log("filled data Hmac:", Hmac);
    console.log("filled data decryptedSek:", decryptedSek);

    // Check if the status indicates a successful response
    if (status === "1") {
      console.log("Beginning Decryption process............");

      // Decrypt the encryption key using the decrypted Sek
      const encryptionKey = decryptSymmetricKey(EncryptRek, decryptedSek);
      console.log("Decrypted Encryption Key:", encryptionKey);

      // Decrypt the E-way Bill response data
      const decryptedResponse = decryptBySymmetricKey(
        ewbResData,
        encryptionKey
      );
      console.log("Decrypted Response Data:", decryptedResponse);

      // Return the decrypted response
      return res.status(200).json({
        Status: 1,
        Data: JSON.parse(decryptedResponse), // Parse decrypted JSON before sending
      });

      // The following HMAC validation code is commented out for now
      // Verify HMAC
      // const base64Data = Buffer.from(decryptedResponse).toString("base64");
      // const isValid = verifyHmac(base64Data, Hmac, encryptionKey);
      // console.log("HMAC Validation:", isValid);

      // if (isValid) {
      //   console.log("Decrypted Response:", JSON.parse(decryptedResponse));
      //   if (!res.headersSent) {
      //     return res.status(200).json({
      //       Status: 1,
      //       Data: JSON.parse(decryptedResponse),
      //     });
      //   } else {
      //     console.error("Response already sent, cannot send new response.");
      //   }
      // } else {
      //   console.error("HMAC validation failed.");
      //   return res.status(400).json({
      //     Status: 0,
      //     ErrorDetails: "HMAC validation failed.",
      //   });
      // }
    } else {
      // Decode and parse the error message from the API response
      const decodedError = decodeBase64(responseData.error);
      let errorDetails;
      let errorCodesArray = [];

      try {
        errorDetails = JSON.parse(decodedError);
        errorCodesArray = errorDetails.errorCodes
          ? errorDetails.errorCodes.split(",")
          : [];
      } catch (parseError) {
        errorDetails = {
          ErrorCode: "PARSE_ERROR",
          ErrorMessage: "Error details could not be parsed.",
          errorCodes: "Unknown",
        };
      }

      // Look up additional error information from the database
      let detailedErrorMessages = {};

      try {
        if (errorCodesArray.length > 0) {
          const errorDetailsFromDb = await GSTEWBErrorCode.findAll({
            where: {
              ErrorCodes: errorCodesArray,
            },
          });

          errorDetailsFromDb.forEach((errorDetail) => {
            detailedErrorMessages[errorDetail.ErrorCodes] =
              errorDetail.Description;
          });
        }
      } catch (dbError) {
        console.error(
          "Error querying database for detailed error messages:",
          dbError.message
        );
      }

      // Build the final error details
      const errorResponses = errorCodesArray.map((code) => ({
        ErrorCode: code,
        ErrorMessage: detailedErrorMessages[code] || "Unknown error message",
      }));

      console.error("Failed to fetch E-way bill details:", {
        ErrorMessages: errorResponses,
      });

      return res.status(400).json({
        Status: 0,
        ErrorDetails: {
          ErrorMessages: errorResponses,
        },
      });
    }
  } catch (error) {
    // Handle unexpected errors
    console.error("Error fetching E-way bill details:", error.message);
    return res.status(500).json({
      Status: 0,
      ErrorDetails: encodeBase64(
        JSON.stringify({
          ErrorCode: "INTERNAL_ERROR",
          ErrorMessage: "Internal server error",
        })
      ),
    });
  }
}

/**
 * Retrieves E-way Bill details by making an API call.
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @returns {Promise<void>} - A promise that resolves when the details are retrieved and processed.
 */
async function getEwayBillDetailsByDate(req, res) {
  try {
    console.log("Starting E-way Bill verification process...");

    // Authenticate (already done)
    const authResponse = await authenticate("EWB");

    // Check if authentication was successful
    if (authResponse.Status !== 1) {
      return res.status(400).json({
        Status: 0,
        ErrorDetails: authResponse.ErrorDetails || "Authentication failed",
      });
    }

    // Extract authentication token and decryption key from response
    const authToken = authResponse.Data.AuthToken;
    const decryptedSek = authResponse.Data.Sek;

    console.log("Authentication successful.");

    // Retrieve E-way Bill date from request query
    const ewbNo = req.query.ewbDate;
    console.log("Retrieved E-Way Bill number from request query:", ewbNo);

    // Validate that E-way Bill number is provided
    if (!ewbNo) {
      console.log("Invalid input: E-Way Bill number is required.");
      return res.status(400).json({
        Status: 0,
        ErrorDetails: encodeBase64(
          JSON.stringify({
            ErrorCode: "INVALID_INPUT",
            ErrorMessage: "E-Way Bill date is required.",
          })
        ),
      });
    }

    // Construct the API URL for retrieving E-way Bill details
    const apiUrl = `${baseUrl}/ewayapi/GetEwayBillsByDate`;
    console.log("API URL for E-Way Bill details:", apiUrl);

    // Make a GET request to the E-way Bill API
    const response = await axios.get(apiUrl, {
      headers: {
        "Content-Type": "application/json",
        "client-id": client_id,
        "client-secret": client_secret,
        Gstin: client_gstin,
        authtoken: authToken,
      },
      params: {
        date: ewbNo,
      },
    });

    console.log("API call successful. Response data:", response.data);
    const responseData = response.data;

    // Extract relevant data from the API response
    const EncryptRek = responseData.rek;
    const ewbResData = responseData.data;
    const status = responseData.status;
    const Hmac = responseData.hmac;

    console.log("filled data REK:", EncryptRek);
    console.log("filled data Response:", ewbResData);
    console.log("filled data Status:", status);
    console.log("filled data Hmac:", Hmac);
    console.log("filled data decryptedSek:", decryptedSek);

    // Check if the status indicates a successful response
    if (status === "1") {
      console.log("Beginning Decryption process............");

      // Decrypt the encryption key using the decrypted Sek
      const encryptionKey = decryptSymmetricKey(EncryptRek, decryptedSek);
      console.log("Decrypted Encryption Key:", encryptionKey);

      // Decrypt the E-way Bill response data
      const decryptedResponse = decryptBySymmetricKey(
        ewbResData,
        encryptionKey
      );
      console.log("Decrypted Response Data:", decryptedResponse);

      // Return the decrypted response
      return res.status(200).json({
        Status: 1,
        Data: JSON.parse(decryptedResponse), // Parse decrypted JSON before sending
      });

      // The following HMAC validation code is commented out for now
      // Verify HMAC
      // const base64Data = Buffer.from(decryptedResponse).toString("base64");
      // const isValid = verifyHmac(base64Data, Hmac, encryptionKey);
      // console.log("HMAC Validation:", isValid);

      // if (isValid) {
      //   console.log("Decrypted Response:", JSON.parse(decryptedResponse));
      //   if (!res.headersSent) {
      //     return res.status(200).json({
      //       Status: 1,
      //       Data: JSON.parse(decryptedResponse),
      //     });
      //   } else {
      //     console.error("Response already sent, cannot send new response.");
      //   }
      // } else {
      //   console.error("HMAC validation failed.");
      //   return res.status(400).json({
      //     Status: 0,
      //     ErrorDetails: "HMAC validation failed.",
      //   });
      // }
    } else {
      // Decode and parse the error message from the API response
      const decodedError = decodeBase64(responseData.error);
      let errorDetails;
      let errorCodesArray = [];

      try {
        errorDetails = JSON.parse(decodedError);
        errorCodesArray = errorDetails.errorCodes
          ? errorDetails.errorCodes.split(",")
          : [];
      } catch (parseError) {
        errorDetails = {
          ErrorCode: "PARSE_ERROR",
          ErrorMessage: "Error details could not be parsed.",
        };
      }

      // Look up additional error information from the database
      let detailedErrorMessages = {};

      try {
        if (errorCodesArray.length > 0) {
          const errorDetailsFromDb = await GSTEWBErrorCode.findAll({
            where: {
              ErrorCodes: errorCodesArray,
            },
          });

          errorDetailsFromDb.forEach((errorDetail) => {
            detailedErrorMessages[errorDetail.ErrorCodes] =
              errorDetail.Description;
          });
        }
      } catch (dbError) {
        console.error(
          "Error querying database for detailed error messages:",
          dbError.message
        );
      }

      // Build the final error details
      const errorResponses = errorCodesArray.map((code) => ({
        ErrorCode: code,
        ErrorMessage: detailedErrorMessages[code] || "Unknown error message",
      }));

      console.error("Failed to fetch E-way bill details:", {
        ErrorMessages: errorResponses,
      });

      return res.status(400).json({
        Status: 0,
        ErrorDetails: {
          ErrorMessages: errorResponses,
        },
      });
    }
  } catch (error) {
    // Handle unexpected errors
    console.error("Error fetching E-way bill details:", error.message);
    return res.status(500).json({
      Status: 0,
      ErrorDetails: encodeBase64(
        JSON.stringify({
          ErrorCode: "INTERNAL_ERROR",
          ErrorMessage: "Internal server error",
        })
      ),
    });
  }
}

/**
 * Generates an E-way bill by making an API call.
 * @param {Object} req - The HTTP request object, expected to contain vehicle details in the body.
 * @param {Object} res - The HTTP response object.
 * @returns {Promise<void>} - A promise that resolves when the E-way bill cancellation is complete.
 */
async function cancelEwayBill(inputJson) {
  try {
    console.log("Starting E-way bill cancellation process...");

    // Step 1: Authenticate to get the token and SEK (Symmetric Encryption Key)
    console.log("Authenticating to obtain token and SEK...");
    const authResponse = await authenticate("EWB");

    // Check if authentication was successful
    if (authResponse.Status !== 1) {
      console.error(
        "Authentication failed:",
        authResponse.ErrorDetails || "No details available"
      );
      return {
        Status: 0,
        ErrorDetails: authResponse.ErrorDetails || "Authentication failed",
      };
    }

    // Extract the authentication token and SEK from the response
    const authToken = authResponse.Data.AuthToken;
    const decryptedSek = authResponse.Data.Sek;
    console.log("Authentication successful. Token and SEK acquired.");

    // Step 2: Extract vehicle details from the input
    const vehicleDetails = inputJson;

    // Check if vehicle details are provided
    if (!vehicleDetails) {
      console.log("Invalid input: Vehicle details are required.");
      return { Status: 0, ErrorDetails: "Vehicle details are required." };
    }

    // Step 3: Prepare the request JSON with vehicle details
    console.log("Preparing request JSON with vehicle details...");
    const requestJson = vehicleDetails;
    console.log("Request JSON:", requestJson);

    // Step 4: Convert the request JSON to a UTF-8 string
    console.log("Converting request JSON to UTF-8 string...");
    const jsonString = JSON.stringify(requestJson);
    console.log("UTF-8 encoded request JSON:", jsonString);

    // Step 5: Encrypt the JSON using SEK
    console.log("Encrypting JSON using SEK...");
    const encryptedData = encryptBySymmetricKey(jsonString, decryptedSek);
    console.log("Encrypted data:", encryptedData);

    // Step 6: Create the final request payload
    console.log("Creating request payload...");
    const requestPayload = {
      action: "CANEWB",
      data: encryptedData,
    };
    console.log("Request payload:", requestPayload);

    // Step 7: Send the POST request to the E-way Bill API
    const apiUrl = `${baseUrl}/ewayapi/`;

    console.log("Sending POST request to E-way Bill API...");
    const response = await axios.post(apiUrl, JSON.stringify(requestPayload), {
      headers: {
        "client-id": client_id,
        "client-secret": client_secret,
        Gstin: client_gstin,
        authtoken: authToken,
        "Content-Type": "application/json",
      },
    });
    console.log("API response received:", response.data);

    // Step 8: Handle the response from the API
    const retrivedData = response.data;
    console.log("Retrieved data:", retrivedData);

    // Destructure the response to check status and error
    const { status, error, data } = retrivedData;

    if (status === "1") {
      // If status is 1, decrypt the response data
      console.log("Decrypting response data...");
      const decryptedResponse = decryptBySymmetricKey(data, decryptedSek);
      const cancellationData = JSON.parse(decryptedResponse);
      console.log("E-way bill cancelled successfully:", cancellationData);

      // Return the data
      return {
        Status: 1,
        Data: cancellationData,
      };
    } else {
      // If status is not 1, decode and format the error details
      const decodedError = decodeBase64(error);
      let errorDetails;
      let errorCodesArray = [];

      try {
        // Parse the decoded error string as JSON
        errorDetails = JSON.parse(decodedError);
        errorCodesArray = errorDetails.errorCodes
          ? errorDetails.errorCodes.split(",")
          : [];
      } catch (parseError) {
        // Handle any parsing errors
        errorDetails = {
          ErrorCode: "PARSE_ERROR",
          ErrorMessage: "Error details could not be parsed.",
          errorCodes: "Unknown",
        };
      }

      // Look up additional error information from the database
      let detailedErrorMessages = {};

      try {
        if (errorCodesArray.length > 0) {
          const errorDetailsFromDb = await GSTEWBErrorCode.findAll({
            where: {
              ErrorCodes: errorCodesArray,
            },
          });

          errorDetailsFromDb.forEach((errorDetail) => {
            detailedErrorMessages[errorDetail.ErrorCodes] =
              errorDetail.Description;
          });
        }
      } catch (dbError) {
        console.error(
          "Error querying database for detailed error messages:",
          dbError.message
        );
      }

      // Build the final error details
      const errorResponses = errorCodesArray.map((code) => ({
        ErrorCode: code,
        ErrorMessage: detailedErrorMessages[code] || "Unknown error message",
      }));

      console.error("Failed to cancel E-way bill:", {
        ErrorMessages: errorResponses,
      });

      return {
        Status: 0,
        ErrorDetails: {
          ErrorMessages: errorResponses,
        },
      };
    }
  } catch (error) {
    // Catch any errors that occur during the process
    console.error("Error cancelling E-way bill:", error.message);
    return {
      Status: 0,
      ErrorDetails: {
        ErrorCode: "INTERNAL_ERROR",
        ErrorMessage: "Internal server error",
      },
    };
  }
}

// The Below function is used as an API, it sends response where as the above returns it as function
async function cancelEwayBillAPI(req, res) {
  try {
    console.log("Starting E-way bill cancellation process...");

    // Step 1: Authenticate to get the token and SEK (Symmetric Encryption Key)
    console.log("Authenticating to obtain token and SEK...");
    const authResponse = await authenticate("EWB");

    // Check if authentication was successful
    if (authResponse.Status !== 1) {
      console.error(
        "Authentication failed:",
        authResponse.ErrorDetails || "No details available"
      );
      return res.status(400).json({
        Status: 0,
        ErrorDetails: authResponse.ErrorDetails || "Authentication failed",
      });
    }

    // Extract the authentication token and SEK from the response
    const authToken = authResponse.Data.AuthToken;
    const decryptedSek = authResponse.Data.Sek;
    console.log("Authentication successful. Token and SEK acquired.");

    // Step 2: Extract vehicle details from the request body
    const vehicleDetails = req.body;

    // Check if vehicle details are provided in the request
    if (!vehicleDetails) {
      console.log("Invalid input: Vehicle details are required.");
      return res.status(400).json({
        Status: 0,
        ErrorDetails: "Vehicle details are required.",
      });
    }

    // Step 3: Prepare the request JSON with vehicle details
    console.log("Preparing request JSON with vehicle details...");
    const requestJson = vehicleDetails; // Directly use the body as vehicle details
    console.log("Request JSON:", requestJson);

    // Step 4: Convert the request JSON to a UTF-8 string
    console.log("Converting request JSON to UTF-8 string...");
    const jsonString = JSON.stringify(requestJson);
    console.log("UTF-8 encoded request JSON:", jsonString);

    // Step 5: Encrypt the JSON using SEK
    console.log("Encrypting JSON using SEK...");
    const encryptedData = encryptBySymmetricKey(jsonString, decryptedSek);
    console.log("Encrypted data:", encryptedData);

    // Step 6: Create the final request payload
    console.log("Creating request payload...");
    const requestPayload = {
      action: "CANEWB",
      data: encryptedData, // Encrypted data
    };
    console.log("Request payload:", requestPayload);

    // Step 7: Send the POST request to the E-way Bill API
    const apiUrl = `${baseUrl}/ewayapi/`;

    console.log("Sending POST request to E-way Bill API...");
    const response = await axios.post(apiUrl, JSON.stringify(requestPayload), {
      headers: {
        "client-id": client_id,
        "client-secret": client_secret,
        Gstin: client_gstin,
        authtoken: authToken,
        "Content-Type": "application/json",
      },
    });
    console.log("API response received:", response.data);

    // Step 8: Handle the response from the API
    const retrivedData = response.data;
    console.log("Retrieved data:", retrivedData);

    // Destructure the response to check status and error
    const { status, error, info } = retrivedData;

    if (status === "1") {
      // If status is 1, decrypt the response data
      console.log("Decrypting response data...");
      const decryptedResponse = decryptBySymmetricKey(
        retrivedData.data,
        decryptedSek
      );
      console.log("E-way bill cancelled successfully:", decryptedResponse);

      // Return the decrypted response data
      return res.status(200).json({
        Status: 1,
        Data: JSON.parse(decryptedResponse),
      });
    } else {
      // Decode and parse the error message from the API response
      const decodedError = decodeBase64(error);
      let errorDetails;
      let errorCodesArray = [];

      try {
        errorDetails = JSON.parse(decodedError);
        errorCodesArray = errorDetails.errorCodes
          ? errorDetails.errorCodes.split(",")
          : [];
      } catch (parseError) {
        errorDetails = {
          ErrorCode: "PARSE_ERROR",
          ErrorMessage: "Error details could not be parsed.",
        };
      }

      // Look up additional error information from the database
      let detailedErrorMessages = {};

      try {
        if (errorCodesArray.length > 0) {
          const errorDetailsFromDb = await GSTEWBErrorCode.findAll({
            where: {
              ErrorCodes: errorCodesArray,
            },
          });

          errorDetailsFromDb.forEach((errorDetail) => {
            detailedErrorMessages[errorDetail.ErrorCodes] =
              errorDetail.Description;
          });
        }
      } catch (dbError) {
        console.error(
          "Error querying database for detailed error messages:",
          dbError.message
        );
      }

      // Build the final error details
      const errorResponses = errorCodesArray.map((code) => ({
        ErrorCode: code,
        ErrorMessage: detailedErrorMessages[code] || "Unknown error message",
      }));

      console.error("Failed to cancel E-way bill:", {
        ErrorMessages: errorResponses,
      });

      return res.status(400).json({
        Status: 0,
        ErrorDetails: {
          ErrorMessages: errorResponses,
        },
      });
    }
  } catch (error) {
    // Handle unexpected errors
    console.error("Error cancelling E-way bill:", error.message);
    return res.status(500).json({
      Status: 0,
      ErrorDetails: encodeBase64(
        JSON.stringify({
          ErrorCode: "INTERNAL_ERROR",
          ErrorMessage: "Internal server error",
        })
      ),
    });
  }
}

/**
 * Generates an E-way bill by making an API call.
 * @param {Object} req - The HTTP request object, expected to contain vehicle details in the body.
 * @param {Object} res - The HTTP response object.
 * @returns {Promise<void>} - A promise that resolves when the E-way bill extension is complete.
 */
async function extendEwayBillValidity(inputJson) {
  try {
    console.log("Starting E-way bill extend validity process...");

    // Step 1: Authenticate to get the token and SEK (Symmetric Encryption Key)
    console.log("Authenticating to obtain token and SEK...");
    const authResponse = await authenticate("EWB");

    // Check if authentication was successful
    if (authResponse.Status !== 1) {
      console.error(
        "Authentication failed:",
        authResponse.ErrorDetails || "No details available"
      );
      return {
        Status: 0,
        ErrorDetails: authResponse.ErrorDetails || "Authentication failed",
      };
    }

    // Extract the authentication token and SEK from the response
    const authToken = authResponse.Data.AuthToken;
    const decryptedSek = authResponse.Data.Sek;
    console.log("Authentication successful. Token and SEK acquired.");

    // Step 2: Extract extend validity details from the input
    const extendValidityDetails = inputJson;

    // Check if extend validity details are provided
    if (!extendValidityDetails) {
      console.log("Invalid input: Extend validity details are required.");
      return {
        Status: 0,
        ErrorDetails: "Extend validity details are required.",
      };
    }

    // Step 3: Prepare the request JSON with extend validity details
    console.log("Preparing request JSON with extend validity details...");
    const requestJson = extendValidityDetails;
    console.log("Request JSON:", requestJson);

    // Step 4: Convert the request JSON to a UTF-8 string
    console.log("Converting request JSON to UTF-8 string...");
    const jsonString = JSON.stringify(requestJson);
    console.log("UTF-8 encoded request JSON:", jsonString);

    // Step 5: Encrypt the JSON using SEK
    console.log("Encrypting JSON using SEK...");
    const encryptedData = encryptBySymmetricKey(jsonString, decryptedSek);
    console.log("Encrypted data:", encryptedData);

    // Step 6: Create the final request payload
    console.log("Creating request payload...");
    const requestPayload = {
      action: "EXTENDVALIDITY",
      data: encryptedData,
    };
    console.log("Request payload:", requestPayload);

    // Step 7: Send the POST request to the E-way Bill API
    const apiUrl = `${baseUrl}/ewayapi/`; // Assuming the base URL is correct

    console.log("Sending POST request to E-way Bill API...");
    const response = await axios.post(apiUrl, JSON.stringify(requestPayload), {
      headers: {
        "client-id": client_id,
        "client-secret": client_secret,
        Gstin: client_gstin,
        authtoken: authToken,
        "Content-Type": "application/json",
      },
    });
    console.log("API response received:", response.data);

    // Step 8: Handle the response from the API
    const retrievedData = response.data;
    console.log("Retrieved data:", retrievedData);

    // Destructure the response to check status and error
    const { status, error, data } = retrievedData;

    if (status === "1") {
      // If status is 1, decrypt the response data
      console.log("Decrypting response data...");
      const decryptedResponse = decryptBySymmetricKey(data, decryptedSek);
      const validityData = JSON.parse(decryptedResponse);
      console.log("Extend validity successful:", validityData);

      // Return the data
      return {
        Status: 1,
        Data: validityData,
      };
    } else {
      // If status is not 1, decode and format the error details
      const decodedError = decodeBase64(error);
      let errorDetails;
      let errorCodesArray = [];

      try {
        // Parse the decoded error string as JSON
        errorDetails = JSON.parse(decodedError);
        errorCodesArray = errorDetails.errorCodes
          ? errorDetails.errorCodes.split(",")
          : [];
      } catch (parseError) {
        // Handle any parsing errors
        errorDetails = {
          ErrorCode: "PARSE_ERROR",
          ErrorMessage: "Error details could not be parsed.",
          errorCodes: "Unknown",
        };
      }

      // Look up additional error information from the database
      let detailedErrorMessages = {};

      try {
        if (errorCodesArray.length > 0) {
          const errorDetailsFromDb = await GSTEWBErrorCode.findAll({
            where: {
              ErrorCodes: errorCodesArray,
            },
          });

          errorDetailsFromDb.forEach((errorDetail) => {
            detailedErrorMessages[errorDetail.ErrorCodes] =
              errorDetail.Description;
          });
        }
      } catch (dbError) {
        console.error(
          "Error querying database for detailed error messages:",
          dbError.message
        );
      }

      // Build the final error details
      const errorResponses = errorCodesArray.map((code) => ({
        ErrorCode: code,
        ErrorMessage: detailedErrorMessages[code] || "Unknown error message",
      }));

      console.error("Failed to extend E-way bill validity:", {
        ErrorMessages: errorResponses,
      });

      return {
        Status: 0,
        ErrorDetails: {
          ErrorMessages: errorResponses,
        },
      };
    }
  } catch (error) {
    // Catch any errors that occur during the process
    console.error("Error extending E-way bill validity:", error.message);
    return {
      Status: 0,
      ErrorDetails: {
        ErrorCode: "INTERNAL_ERROR",
        ErrorMessage: "Internal server error",
      },
    };
  }
}

// The Below function is used as an API, it sends response where as the above returns it as function
async function extendEwayBillValidityAPI(req, res, inputJson) {
  try {
    console.log("Starting E-way bill extend validity process...");

    // Step 1: Authenticate to get the token and SEK (Symmetric Encryption Key)
    console.log("Authenticating to obtain token and SEK...");
    const authResponse = await authenticate("EWB");

    // Check if authentication was successful
    if (authResponse.Status !== 1) {
      console.error(
        "Authentication failed:",
        authResponse.ErrorDetails || "No details available"
      );
      return res.status(400).json({
        Status: 0,
        ErrorDetails: authResponse.ErrorDetails || "Authentication failed",
      });
    }

    // Extract the authentication token and SEK from the response
    const authToken = authResponse.Data.AuthToken;
    const decryptedSek = authResponse.Data.Sek;
    console.log("Authentication successful. Token and SEK acquired.");

    // Step 2: Extract extend validity details from the request body
    const extendValidityDetails = req.body;

    // Check if extend validity details are provided in the request
    if (!extendValidityDetails) {
      console.log("Invalid input: Extend validity details are required.");
      return res.status(400).json({
        Status: 0,
        ErrorDetails: "Extend validity details are required.",
      });
    }

    // Step 3: Prepare the request JSON with extend validity details
    console.log("Preparing request JSON with extend validity details...");
    const requestJson = extendValidityDetails;
    console.log("Request JSON:", requestJson);

    // Step 4: Convert the request JSON to a UTF-8 string
    console.log("Converting request JSON to UTF-8 string...");
    const jsonString = JSON.stringify(requestJson);
    console.log("UTF-8 encoded request JSON:", jsonString);

    // Step 5: Encrypt the JSON using SEK
    console.log("Encrypting JSON using SEK...");
    const encryptedData = encryptBySymmetricKey(jsonString, decryptedSek);
    console.log("Encrypted data:", encryptedData);

    // Step 6: Create the final request payload
    console.log("Creating request payload...");
    const requestPayload = {
      action: "EXTENDVALIDITY",
      data: encryptedData,
    };
    console.log("Request payload:", requestPayload);

    // Step 7: Send the POST request to the E-way Bill API
    console.log("Sending POST request to E-way Bill API...");
    const response = await axios.post(
      EWBGenUrl,
      JSON.stringify(requestPayload),
      {
        headers: {
          "client-id": client_id,
          "client-secret": client_secret,
          Gstin: client_gstin,
          authtoken: authToken,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("API response received:", response.data);

    // Step 8: Handle the response from the API
    const retrievedData = response.data;
    console.log("Retrieved data:", retrievedData);

    // Destructure the response to check status and error
    const { status, error, data } = retrievedData;

    if (status === "1") {
      // If status is 1, decrypt the response data
      console.log("Decrypting response data...");
      const decryptedResponse = decryptBySymmetricKey(data, decryptedSek);
      console.log("Extend validity successful:", decryptedResponse);

      // Return the decrypted response data
      return res.status(200).json({
        Status: 1,
        Data: JSON.parse(decryptedResponse),
      });
    } else {
      // If status is not 1, decode and format the error details
      const decodedError = decodeBase64(error);
      let errorDetails;
      let errorCodesArray = [];

      try {
        // Parse the decoded error string as JSON
        errorDetails = JSON.parse(decodedError);
        errorCodesArray = errorDetails.errorCodes
          ? errorDetails.errorCodes.split(",")
          : [];
      } catch (parseError) {
        // Handle any parsing errors
        errorDetails = {
          ErrorCode: "PARSE_ERROR",
          ErrorMessage: "Error details could not be parsed.",
          errorCodes: "Unknown",
        };
      }

      // Look up additional error information from the database
      let detailedErrorMessages = {};

      try {
        if (errorCodesArray.length > 0) {
          const errorDetailsFromDb = await GSTEWBErrorCode.findAll({
            where: {
              ErrorCodes: errorCodesArray,
            },
          });

          errorDetailsFromDb.forEach((errorDetail) => {
            detailedErrorMessages[errorDetail.ErrorCodes] =
              errorDetail.Description;
          });
        }
      } catch (dbError) {
        console.error(
          "Error querying database for detailed error messages:",
          dbError.message
        );
      }

      // Build the final error details
      const errorResponses = errorCodesArray.map((code) => ({
        ErrorCode: code,
        ErrorMessage: detailedErrorMessages[code] || "Unknown error message",
      }));

      console.error("Failed to extend E-way bill validity:", {
        ErrorMessages: errorResponses,
      });

      return res.status(400).json({
        Status: 0,
        ErrorDetails: {
          ErrorMessages: errorResponses,
        },
      });
    }
  } catch (error) {
    // Catch any errors that occur during the process
    console.error("Error extending E-way bill validity:", error.message);
    return res.status(500).json({
      Status: 0,
      ErrorDetails: {
        ErrorCode: "INTERNAL_ERROR",
        ErrorMessage: "Internal server error",
      },
    });
  }
}

/* Utility functions*/
function decodeBase64(encodedData) {
  return Buffer.from(encodedData, "base64").toString("utf8");
}

function encodeBase64(input) {
  if (typeof input !== "string") {
    throw new Error("Input must be a string");
  }

  return Buffer.from(input, "utf-8").toString("base64");
}

// The Below function is used as an API, it sends response where as the above returns it as function
async function generateIRNAPI(req, res, inputJson) {
  try {
    console.log("Starting IRN bill generation process...");

    // Step 1: Authenticate to get the token and SEK (Symmetric Encryption Key)
    console.log("Authenticating to obtain token and SEK...");
    const authResponse = await authenticate("IRN");
    console.log("Authentication response:", authResponse); // Log authentication response

    // Check if authentication was successful
    if (authResponse.Status !== 1) {
      console.error(
        "Authentication failed:",
        authResponse.ErrorDetails || "No details available"
      );
      return res.status(400).json({
        Status: 0,
        ErrorDetails: authResponse.ErrorDetails || "Authentication failed",
      });
    }

    // Extract the authentication token and SEK from the response
    const authToken = authResponse.Data.AuthToken;
    const decryptedSek = authResponse.Data.Sek;
    console.log("Authentication successful. Token and SEK acquired.");
    console.log("Auth Token:", authToken); // Log auth token
    console.log("Decrypted SEK:", decryptedSek); // Log decrypted SEK

    // Step 2: Extract vehicle details from the request body
    const vehicleDetails = req.body;

    // Check if vehicle details are provided in the request
    if (!vehicleDetails) {
      console.log("Invalid input: Vehicle details are required.");
      return res.status(400).json({
        Status: 0,
        ErrorDetails: "Vehicle details are required.",
      });
    }

    // Step 3: Prepare the request JSON with vehicle details
    console.log("Preparing request JSON with vehicle details...");
    const requestJson = vehicleDetails; // Directly use the body as vehicle details
    console.log("Request JSON:", requestJson); // Log the request JSON

    // Step 4: Convert the request JSON to a UTF-8 string
    console.log("Converting request JSON to UTF-8 string...");
    const jsonString = JSON.stringify(requestJson);
    console.log("UTF-8 encoded request JSON:", jsonString); // Log UTF-8 encoded string

    // Step 5: Encrypt the JSON using SEK
    console.log("Encrypting JSON using SEK...");
    const encryptedData = encryptBySymmetricKey(jsonString, decryptedSek);
    console.log("Encrypted data:", encryptedData); // Log encrypted data

    // Step 6: Create the final request payload
    console.log("Creating request payload...");
    const requestPayload = {
      // action: "GENEWAYBILL",
      Data: encryptedData, // Encrypted data
    };
    console.log("Request payload:", requestPayload); // Log the request payload

    // Step 7: Send the POST request to the E-way Bill API
    console.log("Sending POST request to IRN Bill API...");
    console.log("POST API URL:", IRNGenUrl2); // Log the API URL
    const response = await axios.post(
      IRNGenUrl2,
      JSON.stringify(requestPayload),
      {
        headers: {
          "client-id": client_id,
          "client-secret": client_secret,
          Gstin: client_gstin,
          user_name: username,
          authtoken: authToken,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("API response received:", response.data); // Log the response from the IRN API

    // Step 8: Handle the response from the API
    const retrivedData = response.data;
    console.log("Retrieved data:", retrivedData); // Log the retrieved data

    // Destructure the response to check status and error
    const { Status, ErrorDetails, Data } = retrivedData;
    console.log("Status:", Status); // Log the status from the response
    console.log("Error:", ErrorDetails); // Log any error message from the response
    // console.log("Retrieved data Seperated:", Data); // Log the retrieved data
    // console.log("Retrieved data Seperated2:", retrivedData?.Data); // Log the retrieved data

    //     if (Status == 1) {
    //       // If status is 1, decrypt the response data
    //       console.log("Decrypting response data...");
    //       const decryptedResponse = decryptBySymmetricKeyIRN(Data, decryptedSek);
    //       console.log("IRN bill generated successfully:", decryptedResponse); // Log decrypted response

    //       // Return the decrypted response data
    //       return res.status(200).json({
    //         Status: 1,
    //         Data: JSON.parse(decryptedResponse),
    //       });
    //     } else {
    //       // If status is not 1, handle multiple error codes
    //       const decodedError = decodeBase64(ErrorDetails);
    //       console.log("Decoded error:", decodedError); // Log decoded error

    //       let errorDetails = {};
    //       try {
    //         // Parse the decoded error string as JSON
    //         errorDetails = JSON.parse(decodedError);
    //         console.log("Parsed error details:", errorDetails); // Log parsed error details
    //       } catch (parseError) {
    //         // Handle any parsing errors
    //         errorDetails = {
    //           ErrorCode: "PARSE_ERROR",
    //           ErrorMessage: "Error details could not be parsed.",
    //           errorCodes: "Unknown",
    //         };
    //       }

    //       // Process multiple error codes
    //       const rawErrorCodes = (errorDetails.errorCodes || "Unknown").toString();
    //       const errorCodesArray = rawErrorCodes
    //         .split(",")
    //         .map((code) => code.trim())
    //         .filter((code) => code); // Split and trim codes
    //       console.log("Error codes array:", errorCodesArray); // Log error codes array

    //       // Look up additional error information from the database
    //       let detailedErrorMessages = {};
    //       try {
    //         const errorDetailsFromDb = await GSTIRNErrorCode.findAll({
    //           where: {
    //             ErrorCodes: errorCodesArray,
    //           },
    //         });

    //         // Map error codes to their descriptions
    //         errorDetailsFromDb.forEach((errorDetail) => {
    //           detailedErrorMessages[errorDetail.ErrorCodes] =
    //             errorDetail.Description;
    //         });
    //         console.log("Detailed error messages from DB:", detailedErrorMessages); // Log DB error messages
    //       } catch (dbError) {
    //         console.error(
    //           "Error querying database for detailed error messages:",
    //           dbError.message
    //         );
    //       }

    //       // Build the final error details
    //       const errorResponses = errorCodesArray.map((code) => ({
    //         ErrorCode: code,
    //         ErrorMessage: detailedErrorMessages[code] || "Unknown error message",
    //       }));

    //       console.error("Failed to generate IRN bill:", {
    //         ErrorMessages: errorResponses,
    //       });

    //       return res.status(400).json({
    //         Status: 0,
    //         ErrorDetails: {
    //           ErrorMessages: errorResponses,
    //         },
    //       });
    //     }
    //   } catch (error) {
    //     // Catch any errors that occur during the process
    //     console.error("Error generating IRN bill:", error.message);
    //     return res.status(500).json({
    //       Status: 0,
    //       ErrorDetails: encodeBase64(
    //         JSON.stringify({
    //           ErrorCode: "INTERNAL_ERROR",
    //           ErrorMessage: "Internal server error",
    //         })
    //       ),
    //     });
    //   }
    // }

    if (Status == 1) {
      // If status is 1, decrypt the response data
      console.log("Decrypting response data...");
      const decryptedResponse = decryptBySymmetricKeyIRN(Data, decryptedSek);
      console.log("IRN bill generated successfully:", decryptedResponse); // Log decrypted response

      // Return the decrypted response data
      return res.status(200).json({
        Status: 1,
        Data: JSON.parse(decryptedResponse),
      });
    } else {
      // If status is not 1, return the raw error details
      console.log("Error encountered. Returning error details...");
      console.log("Error Details:", ErrorDetails);

      return res.status(400).json({
        Status: 0,
        ErrorDetails: ErrorDetails, // Send raw error details directly
      });
    }
  } catch (error) {
    // Catch any errors that occur during the process
    console.error("Error generating IRN bill:", error.message);
    return res.status(500).json({
      Status: 0,
      ErrorDetails: encodeBase64(
        JSON.stringify({
          ErrorCode: "INTERNAL_ERROR",
          ErrorMessage: "Internal server error",
        })
      ),
    });
  }
}

/**
 * Generates an IRN by making an API call.
 * @param {Object} inputJson - The JSON input containing vehicle details and other data for IRN generation.
 * @returns {Promise<Object>} - A promise that resolves to the API response object.
 */
async function generateIRN(inputJson) {
  try {
    console.log("Starting IRN bill generation process...");

    // Step 1: Authenticate to get the token and SEK (Symmetric Encryption Key)
    console.log("Authenticating to obtain token and SEK...");
    const authResponse = await authenticate("IRN");
    console.log("Authentication response:", authResponse);

    // Check if authentication was successful
    if (authResponse.Status !== 1) {
      console.error(
        "Authentication failed:",
        authResponse.ErrorDetails || "No details available"
      );
      return {
        Status: 0,
        ErrorDetails: authResponse.ErrorDetails || "Authentication failed",
      };
    }

    // Extract the authentication token and SEK from the response
    const authToken = authResponse.Data.AuthToken;
    const decryptedSek = authResponse.Data.Sek;
    console.log("Authentication successful. Token and SEK acquired.");

    // Step 2: Prepare the request JSON with vehicle details
    if (!inputJson) {
      console.log("Invalid input: Vehicle details are required.");
      return {
        Status: 0,
        ErrorDetails: "Vehicle details are required.",
      };
    }

    console.log("Preparing request JSON with vehicle details...");
    const jsonString = JSON.stringify(inputJson);
    console.log("UTF-8 encoded request JSON:", jsonString);

    // Step 3: Encrypt the JSON using SEK
    console.log("Encrypting JSON using SEK...");
    const encryptedData = encryptBySymmetricKey(jsonString, decryptedSek);
    console.log("Encrypted data:", encryptedData);

    // Step 4: Create the final request payload
    const requestPayload = {
      Data: encryptedData,
    };
    console.log("Request payload:", requestPayload);

    // Step 5: Send the POST request to the IRN API
    console.log("Sending POST request to IRN API...");
    const response = await axios.post(
      IRNGenUrl2,
      JSON.stringify(requestPayload),
      {
        headers: {
          "client-id": client_id,
          "client-secret": client_secret,
          Gstin: client_gstin,
          user_name: username,
          authtoken: authToken,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("API response received:", response.data);

    // Step 6: Handle the response from the API
    const retrievedData = response.data;
    const { Status, ErrorDetails, Data } = retrievedData;

    if (Status == 1) {
      // Decrypt the response data if Status is 1
      console.log("Decrypting response data...");
      const decryptedResponse = decryptBySymmetricKeyIRN(Data, decryptedSek);
      const parsedResponse = JSON.parse(decryptedResponse);
      console.log("IRN bill generated successfully:", parsedResponse);

      return {
        Status: 1,
        Data: parsedResponse,
      };
    } else {
      // Directly return the raw error details for Status !== 1
      console.error(
        "Failed to generate IRN bill. Error details:",
        ErrorDetails
      );
      return {
        Status: 0,
        ErrorDetails: ErrorDetails,
      };
    }
  } catch (error) {
    console.error("Error generating IRN bill:", error.message);
    return {
      Status: 0,
      ErrorDetails: {
        ErrorCode: "INTERNAL_ERROR",
        ErrorMessage: "Internal server error",
      },
    };
  }
}

/**
 * Retrieve IRN details by making an API call.
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @returns {Promise<void>} - A promise that resolves when the retrieval is complete.
 */
async function getIRNDetailsAPI(req, res) {
  try {
    // Log start of the IRN retrieval process
    console.log("Starting IRN retrivial process...");

    // Authenticate before proceeding with the API call
    const authResponse = await authenticate("IRN");

    // Check if authentication was successful
    if (authResponse.Status !== 1) {
      // If authentication fails, return error with status 400
      return res.status(400).json({
        Status: 0,
        ErrorDetails: authResponse.ErrorDetails || "Authentication failed",
      });
    }

    // Use the AuthToken and Sek from the successful authentication response
    authToken = authResponse.Data.AuthToken;
    decryptedSek = authResponse.Data.Sek;

    console.log("Authentication successful.");

    // Retrieve the IRN (Invoice Reference Number) from the request query
    const getIRNData = req.query.Irn;
    console.log("Retrieved IRN from request query:", getIRNData);

    // Check if the IRN is provided in the request
    if (!getIRNData) {
      // If IRN is missing, return an error message
      console.log("Invalid input: IRN is required.");
      return res.status(400).json({
        Status: 0,
        ErrorDetails: encodeBase64(
          JSON.stringify({
            ErrorCode: "INVALID_INPUT",
            ErrorMessage: "IRN is required.",
          })
        ),
      });
    }

    // Construct the API URL for IRN retrieval using the provided IRN
    const apiUrl = `${IRNDetailsUrl2}${getIRNData}`;
    console.log("API URL for IRN retrivial:", apiUrl);

    // Make the API call to retrieve IRN details
    const response = await axios.get(apiUrl, {
      headers: {
        "client-id": client_id,
        "client-secret": client_secret,
        Gstin: client_gstin,
        user_name: username,
        AuthToken: authToken,
        "Content-Type": "application/json",
      },
    });

    // Log the response data from the IRN API call
    console.log("API call successful. Response data:", response.data);

    const respData = response.data;

    // Check if the API response indicates an error
    if (respData.Status !== 1) {
      // If an error is returned from the API, send a response with error details
      console.log("Error from GST verification API:", respData.ErrorDetails);
      return res.status(400).json({
        Status: 0,
        ErrorDetails:
          respData.ErrorDetails || "An error occurred during GST verification",
      });
    }

    // Proceed with decryption if the response contains data
    if (!respData.Data) {
      // If no data is found, return an error message
      console.log("No data available for decryption.");
      return res.status(400).json({
        Status: 0,
        ErrorDetails: "No data returned from GST verification API",
      });
    }

    // Decrypt the response data using the symmetric key (Sek)
    const decryptedData = decryptBySymmetricKey(respData.Data, decryptedSek);
    console.log("Decrypted data:", decryptedData);

    // Log the successful verification and the decrypted data
    console.log("GST verification successful. Returning data:", decryptedData);

    // Send the decrypted data as a response if no previous response has been sent
    if (!res.headersSent) {
      return res.status(200).json({
        Status: 1,
        Data: JSON.parse(decryptedData), // Parse the decrypted JSON before sending it
      });
    } else {
      // If a response has already been sent, log the issue
      console.error("Response already sent, cannot send new response.");
    }
  } catch (error) {
    // Log any errors during the IRN retrieval process
    console.error("Error during GST verification:", error.message);

    // If an error occurs and no response has been sent, return a generic error message
    if (!res.headersSent) {
      return res.status(500).json({
        Status: 0,
        ErrorDetails: encodeBase64(
          JSON.stringify({
            ErrorCode: "INTERNAL_ERROR",
            ErrorMessage: "Internal server error",
          })
        ),
      });
    } else {
      // If a response has already been sent, log the issue
      console.error("Response already sent, cannot send new response.");
    }
  }
}

/**
 * Function to retrieve IRN details by making an API call.
 * @param {string} irn - The Invoice Reference Number (IRN) to be verified.
 * @returns {Promise<Object>} - A promise that resolves to the IRN verification response object.
 */
async function getIRNDetails(irn) {
  try {
    // Log start of the IRN retrieval process
    console.log("Starting IRN retrieval process...");

    // Step 1: Authenticate before proceeding with the API call
    const authResponse = await authenticate("IRN");

    // Check if authentication was successful
    if (authResponse.Status !== 1) {
      // If authentication fails, return error with status 400
      console.error("Authentication failed:", authResponse.ErrorDetails);
      return {
        Status: 0,
        ErrorDetails: authResponse.ErrorDetails || "Authentication failed",
      };
    }

    // Step 2: Use the AuthToken and Sek from the successful authentication response
    const authToken = authResponse.Data.AuthToken;
    const decryptedSek = authResponse.Data.Sek;

    console.log("Authentication successful.");

    // Step 3: Validate the IRN input
    if (!irn) {
      console.log("Invalid input: IRN is required.");
      return {
        Status: 0,
        ErrorDetails: "IRN is required.",
      };
    }

    console.log("IRN received for verification:", irn);

    // Step 4: Construct the API URL for IRN retrieval
    const apiUrl = `${IRNDetailsUrl2}${irn}`;
    console.log("API URL for IRN retrieval:", apiUrl);

    // Step 5: Make the API call to retrieve IRN details
    const response = await axios.get(apiUrl, {
      headers: {
        "client-id": client_id,
        "client-secret": client_secret,
        Gstin: client_gstin,
        user_name: username,
        AuthToken: authToken,
        "Content-Type": "application/json",
      },
    });

    console.log("API response received:", response.data);

    const respData = response.data;

    // Step 6: Handle the response status
    if (respData.Status !== 1) {
      console.log("Error from GST verification API:", respData.ErrorDetails);
      return {
        Status: 0,
        ErrorDetails:
          respData.ErrorDetails || "An error occurred during GST verification",
      };
    }

    // Step 7: Check if data is available for decryption
    if (!respData.Data) {
      console.log("No data available for decryption.");
      return {
        Status: 0,
        ErrorDetails: "No data returned from GST verification API",
      };
    }

    // Step 8: Decrypt the response data using the symmetric key (Sek)
    const decryptedData = decryptBySymmetricKey(respData.Data, decryptedSek);
    console.log("Decrypted data:", decryptedData);

    // Step 9: Return the final response object with decrypted data
    const parsedData = JSON.parse(decryptedData);

    const responseObj = {
      Status: 1,
      Data: parsedData, // Final decrypted IRN data
    };

    console.log("IRN retrieval successful. Returning response object.");
    return responseObj; // Return the successful verification result
  } catch (error) {
    // Handle any errors that occur during the process
    console.error("Error during IRN retrieval:", error.message);

    // Return an error response with a generic internal error message
    return {
      Status: 0,
      ErrorDetails: {
        ErrorCode: "INTERNAL_ERROR",
        ErrorMessage: "Internal server error",
      },
    };
  }
}

/**
 * Retrieve IRN details by making an API call.
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @returns {Promise<void>} - A promise that resolves when the retrieval is complete.
 */
async function getIRNDetailsByDocTypeAPI(req, res) {
  try {
    // Log start of the IRN retrieval process
    console.log("Starting IRN retrivial process...");

    // Authenticate before proceeding with the API call
    const authResponse = await authenticate("IRN");

    // Check if authentication was successful
    if (authResponse.Status !== 1) {
      // If authentication fails, return error with status 400
      return res.status(400).json({
        Status: 0,
        ErrorDetails: authResponse.ErrorDetails || "Authentication failed",
      });
    }

    // Use the AuthToken and Sek from the successful authentication response
    authToken = authResponse.Data.AuthToken;
    decryptedSek = authResponse.Data.Sek;

    console.log("Authentication successful.");

    // Retrieve the IRN (Invoice Reference Number) from the request query
    const docType = req.query.DocType;
    const docNo = req.query.DocNo;
    const docDate = req.query.DocDate;
    console.log("Retrieved docType from request query:", docType);
    console.log("Retrieved docNo from request query:", docNo);
    console.log("Retrieved docDate from request query:", docDate);

    // Check if the docType is provided in the request
    if (!docType) {
      // If IRN is missing, return an error message
      console.log("Invalid input: docType is required.");
      return res.status(400).json({
        Status: 0,
        ErrorDetails: encodeBase64(
          JSON.stringify({
            ErrorCode: "INVALID_INPUT",
            ErrorMessage: "docType is required.",
          })
        ),
      });
    }

    // Check if the docNo is provided in the request
    if (!docNo) {
      // If IRN is missing, return an error message
      console.log("Invalid input: docNo is required.");
      return res.status(400).json({
        Status: 0,
        ErrorDetails: encodeBase64(
          JSON.stringify({
            ErrorCode: "INVALID_INPUT",
            ErrorMessage: "docNo is required.",
          })
        ),
      });
    }

    // Check if the docDate is provided in the request
    if (!docDate) {
      // If IRN is missing, return an error message
      console.log("Invalid input: docDate is required.");
      return res.status(400).json({
        Status: 0,
        ErrorDetails: encodeBase64(
          JSON.stringify({
            ErrorCode: "INVALID_INPUT",
            ErrorMessage: "docDate is required.",
          })
        ),
      });
    }

    // Construct the API URL for IRN retrieval using the provided IRN
    const apiUrl = `${IRNDetailsByDocTypeUrl2}?doctype=${docType}&docnum=${docNo}&docdate=${docDate}`;
    console.log("API URL for IRN retrivial:", apiUrl);

    // Make the API call to retrieve IRN details
    const response = await axios.get(apiUrl, {
      headers: {
        "client-id": client_id,
        "client-secret": client_secret,
        Gstin: client_gstin,
        user_name: username,
        AuthToken: authToken,
        "Content-Type": "application/json",
      },
    });

    // Log the response data from the IRN API call
    console.log("API call successful. Response data:", response.data);

    const respData = response.data;

    // Check if the API response indicates an error
    if (respData.Status !== 1) {
      // If an error is returned from the API, send a response with error details
      console.log("Error from GST verification API:", respData.ErrorDetails);
      return res.status(400).json({
        Status: 0,
        ErrorDetails:
          respData.ErrorDetails || "An error occurred during GST verification",
      });
    }

    // Proceed with decryption if the response contains data
    if (!respData.Data) {
      // If no data is found, return an error message
      console.log("No data available for decryption.");
      return res.status(400).json({
        Status: 0,
        ErrorDetails: "No data returned from GST verification API",
      });
    }

    // Decrypt the response data using the symmetric key (Sek)
    const decryptedData = decryptBySymmetricKey(respData.Data, decryptedSek);
    console.log("Decrypted data:", decryptedData);

    // Log the successful verification and the decrypted data
    console.log("GST verification successful. Returning data:", decryptedData);

    // Send the decrypted data as a response if no previous response has been sent
    if (!res.headersSent) {
      return res.status(200).json({
        Status: 1,
        Data: JSON.parse(decryptedData), // Parse the decrypted JSON before sending it
      });
    } else {
      // If a response has already been sent, log the issue
      console.error("Response already sent, cannot send new response.");
    }
  } catch (error) {
    // Log any errors during the IRN retrieval process
    console.error("Error during GST verification:", error.message);

    // If an error occurs and no response has been sent, return a generic error message
    if (!res.headersSent) {
      return res.status(500).json({
        Status: 0,
        ErrorDetails: encodeBase64(
          JSON.stringify({
            ErrorCode: "INTERNAL_ERROR",
            ErrorMessage: "Internal server error",
          })
        ),
      });
    } else {
      // If a response has already been sent, log the issue
      console.error("Response already sent, cannot send new response.");
    }
  }
}

/**
 * Function to retrieve IRN details by making an API call.
 * @param {string} irn - The Invoice Reference Number (IRN) to be verified.
 * @returns {Promise<Object>} - A promise that resolves to the IRN verification response object.
 */
async function getIRNDetailsByDocType(docType, docNo, docDate) {
  try {
    // Log start of the IRN retrieval process
    console.log("Starting IRN retrieval process...");

    // Step 1: Authenticate before proceeding with the API call
    const authResponse = await authenticate("IRN");

    // Check if authentication was successful
    if (authResponse.Status !== 1) {
      // If authentication fails, return error with status 400
      console.error("Authentication failed:", authResponse.ErrorDetails);
      return {
        Status: 0,
        ErrorDetails: authResponse.ErrorDetails || "Authentication failed",
      };
    }

    // Step 2: Use the AuthToken and Sek from the successful authentication response
    const authToken = authResponse.Data.AuthToken;
    const decryptedSek = authResponse.Data.Sek;

    console.log("Authentication successful.");

    // Step 3: Validate the IRN input
    console.log("Retrieved docType from request query:", docType);
    console.log("Retrieved docNo from request query:", docNo);
    console.log("Retrieved docDate from request query:", docDate);

    // Check if the docType is provided in the request
    if (!docType) {
      // If IRN is missing, return an error message
      console.log("Invalid input: docType is required.");
      return {
        Status: 0,
        ErrorDetails: "docType is required.",
      };
    }

    // Check if the docNo is provided in the request
    if (!docNo) {
      // If IRN is missing, return an error message
      console.log("Invalid input: docNo is required.");
      return {
        Status: 0,
        ErrorDetails: "docNo is required.",
      };
    }

    // Check if the docDate is provided in the request
    if (!docDate) {
      // If IRN is missing, return an error message
      console.log("Invalid input: docDate is required.");
      return {
        Status: 0,
        ErrorDetails: "docDate is required.",
      };
    }

    // Step 4: Construct the API URL for IRN retrieval
    const apiUrl = `${IRNDetailsByDocTypeUrl2}?doctype=${docType}&docnum=${docNo}&docdate=${docDate}`;
    console.log("API URL for IRN retrieval:", apiUrl);

    // Step 5: Make the API call to retrieve IRN details
    const response = await axios.get(apiUrl, {
      headers: {
        "client-id": client_id,
        "client-secret": client_secret,
        Gstin: client_gstin,
        user_name: username,
        AuthToken: authToken,
        "Content-Type": "application/json",
      },
    });

    console.log("API response received:", response.data);

    const respData = response.data;

    // Step 6: Handle the response status
    if (respData.Status !== 1) {
      console.log("Error from GST verification API:", respData.ErrorDetails);
      return {
        Status: 0,
        ErrorDetails:
          respData.ErrorDetails || "An error occurred during GST verification",
      };
    }

    // Step 7: Check if data is available for decryption
    if (!respData.Data) {
      console.log("No data available for decryption.");
      return {
        Status: 0,
        ErrorDetails: "No data returned from GST verification API",
      };
    }

    // Step 8: Decrypt the response data using the symmetric key (Sek)
    const decryptedData = decryptBySymmetricKey(respData.Data, decryptedSek);
    console.log("Decrypted data:", decryptedData);

    // Step 9: Return the final response object with decrypted data
    const parsedData = JSON.parse(decryptedData);

    const responseObj = {
      Status: 1,
      Data: parsedData, // Final decrypted IRN data
    };

    console.log("IRN retrieval successful. Returning response object.");
    return responseObj; // Return the successful verification result
  } catch (error) {
    // Handle any errors that occur during the process
    console.error("Error during IRN retrieval:", error.message);

    // Return an error response with a generic internal error message
    return {
      Status: 0,
      ErrorDetails: {
        ErrorCode: "INTERNAL_ERROR",
        ErrorMessage: "Internal server error",
      },
    };
  }
}

async function cancelIRNAPI(req, res, inputJson) {
  try {
    console.log("Starting IRN bill cancellation process...");

    // Step 1: Authenticate to get the token and SEK (Symmetric Encryption Key)
    console.log("Authenticating to obtain token and SEK...");
    const authResponse = await authenticate("IRN");
    console.log("Authentication response:", authResponse); // Log authentication response

    // Check if authentication was successful
    if (authResponse.Status !== 1) {
      console.error(
        "Authentication failed:",
        authResponse.ErrorDetails || "No details available"
      );
      return res.status(400).json({
        Status: 0,
        ErrorDetails: authResponse.ErrorDetails || "Authentication failed",
      });
    }

    // Extract the authentication token and SEK from the response
    const authToken = authResponse.Data.AuthToken;
    const decryptedSek = authResponse.Data.Sek;
    console.log("Authentication successful. Token and SEK acquired.");
    console.log("Auth Token:", authToken); // Log auth token
    console.log("Decrypted SEK:", decryptedSek); // Log decrypted SEK

    // Step 2: Extract vehicle details from the request body
    const vehicleDetails = req.body;

    // Check if vehicle details are provided in the request
    if (!vehicleDetails) {
      console.log("Invalid input: Vehicle details are required.");
      return res.status(400).json({
        Status: 0,
        ErrorDetails: "Vehicle details are required.",
      });
    }

    // Step 3: Prepare the request JSON with vehicle details
    console.log("Preparing request JSON with vehicle details...");
    const requestJson = vehicleDetails; // Directly use the body as vehicle details
    console.log("Request JSON:", requestJson); // Log the request JSON

    // Step 4: Convert the request JSON to a UTF-8 string
    console.log("Converting request JSON to UTF-8 string...");
    const jsonString = JSON.stringify(requestJson);
    console.log("UTF-8 encoded request JSON:", jsonString); // Log UTF-8 encoded string

    // Step 5: Encrypt the JSON using SEK
    console.log("Encrypting JSON using SEK...");
    const encryptedData = encryptBySymmetricKey(jsonString, decryptedSek);
    console.log("Encrypted data:", encryptedData); // Log encrypted data

    // Step 6: Create the final request payload
    console.log("Creating request payload...");
    const requestPayload = {
      // action: "GENEWAYBILL",
      Data: encryptedData, // Encrypted data
    };
    console.log("Request payload:", requestPayload); // Log the request payload

    // Step 7: Send the POST request to the E-way Bill API
    console.log("Sending POST request to IRN Bill API...");
    console.log("POST API URL:", IRNCancelUrl2); // Log the API URL
    const response = await axios.post(
      IRNCancelUrl2,
      JSON.stringify(requestPayload),
      {
        headers: {
          "client-id": client_id,
          "client-secret": client_secret,
          Gstin: client_gstin,
          user_name: username,
          authtoken: authToken,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("API response received:", response.data); // Log the response from the IRN API

    // Step 8: Handle the response from the API
    const retrivedData = response.data;
    console.log("Retrieved data:", retrivedData); // Log the retrieved data

    // Destructure the response to check status and error
    const { Status, ErrorDetails, Data } = retrivedData;
    console.log("Status:", Status); // Log the status from the response
    console.log("Error:", ErrorDetails); // Log any error message from the response
    // console.log("Retrieved data Seperated:", Data); // Log the retrieved data
    // console.log("Retrieved data Seperated2:", retrivedData?.Data); // Log the retrieved data

    //     if (Status == 1) {
    //       // If status is 1, decrypt the response data
    //       console.log("Decrypting response data...");
    //       const decryptedResponse = decryptBySymmetricKeyIRN(Data, decryptedSek);
    //       console.log("IRN bill generated successfully:", decryptedResponse); // Log decrypted response

    //       // Return the decrypted response data
    //       return res.status(200).json({
    //         Status: 1,
    //         Data: JSON.parse(decryptedResponse),
    //       });
    //     } else {
    //       // If status is not 1, handle multiple error codes
    //       const decodedError = decodeBase64(ErrorDetails);
    //       console.log("Decoded error:", decodedError); // Log decoded error

    //       let errorDetails = {};
    //       try {
    //         // Parse the decoded error string as JSON
    //         errorDetails = JSON.parse(decodedError);
    //         console.log("Parsed error details:", errorDetails); // Log parsed error details
    //       } catch (parseError) {
    //         // Handle any parsing errors
    //         errorDetails = {
    //           ErrorCode: "PARSE_ERROR",
    //           ErrorMessage: "Error details could not be parsed.",
    //           errorCodes: "Unknown",
    //         };
    //       }

    //       // Process multiple error codes
    //       const rawErrorCodes = (errorDetails.errorCodes || "Unknown").toString();
    //       const errorCodesArray = rawErrorCodes
    //         .split(",")
    //         .map((code) => code.trim())
    //         .filter((code) => code); // Split and trim codes
    //       console.log("Error codes array:", errorCodesArray); // Log error codes array

    //       // Look up additional error information from the database
    //       let detailedErrorMessages = {};
    //       try {
    //         const errorDetailsFromDb = await GSTIRNErrorCode.findAll({
    //           where: {
    //             ErrorCodes: errorCodesArray,
    //           },
    //         });

    //         // Map error codes to their descriptions
    //         errorDetailsFromDb.forEach((errorDetail) => {
    //           detailedErrorMessages[errorDetail.ErrorCodes] =
    //             errorDetail.Description;
    //         });
    //         console.log("Detailed error messages from DB:", detailedErrorMessages); // Log DB error messages
    //       } catch (dbError) {
    //         console.error(
    //           "Error querying database for detailed error messages:",
    //           dbError.message
    //         );
    //       }

    //       // Build the final error details
    //       const errorResponses = errorCodesArray.map((code) => ({
    //         ErrorCode: code,
    //         ErrorMessage: detailedErrorMessages[code] || "Unknown error message",
    //       }));

    //       console.error("Failed to generate IRN bill:", {
    //         ErrorMessages: errorResponses,
    //       });

    //       return res.status(400).json({
    //         Status: 0,
    //         ErrorDetails: {
    //           ErrorMessages: errorResponses,
    //         },
    //       });
    //     }
    //   } catch (error) {
    //     // Catch any errors that occur during the process
    //     console.error("Error generating IRN bill:", error.message);
    //     return res.status(500).json({
    //       Status: 0,
    //       ErrorDetails: encodeBase64(
    //         JSON.stringify({
    //           ErrorCode: "INTERNAL_ERROR",
    //           ErrorMessage: "Internal server error",
    //         })
    //       ),
    //     });
    //   }
    // }

    if (Status == 1) {
      // If status is 1, decrypt the response data
      console.log("Decrypting response data...");
      const decryptedResponse = decryptBySymmetricKeyIRN(Data, decryptedSek);
      console.log("IRN bill generated successfully:", decryptedResponse); // Log decrypted response

      // Return the decrypted response data
      return res.status(200).json({
        Status: 1,
        Data: JSON.parse(decryptedResponse),
      });
    } else {
      // If status is not 1, return the raw error details
      console.log("Error encountered. Returning error details...");
      console.log("Error Details:", ErrorDetails);

      return res.status(400).json({
        Status: 0,
        ErrorDetails: ErrorDetails, // Send raw error details directly
      });
    }
  } catch (error) {
    // Catch any errors that occur during the process
    console.error("Error generating IRN bill:", error.message);
    return res.status(500).json({
      Status: 0,
      ErrorDetails: encodeBase64(
        JSON.stringify({
          ErrorCode: "INTERNAL_ERROR",
          ErrorMessage: "Internal server error",
        })
      ),
    });
  }
}

/**
 * Cancels an IRN by making an API call.
 * @param {Object} inputJson - The JSON input containing vehicle details and other data for IRN cancellation.
 * @returns {Promise<Object>} - A promise that resolves to the API response object.
 */
async function cancelIRN(inputJson) {
  try {
    console.log("Starting IRN bill cancellation process...");

    // Step 1: Authenticate to get the token and SEK (Symmetric Encryption Key)
    console.log("Authenticating to obtain token and SEK...");
    const authResponse = await authenticate("IRN");
    console.log("Authentication response:", authResponse);

    // Check if authentication was successful
    if (authResponse.Status !== 1) {
      console.error(
        "Authentication failed:",
        authResponse.ErrorDetails || "No details available"
      );
      return {
        Status: 0,
        ErrorDetails: authResponse.ErrorDetails || "Authentication failed",
      };
    }

    // Extract the authentication token and SEK from the response
    const authToken = authResponse.Data.AuthToken;
    const decryptedSek = authResponse.Data.Sek;
    console.log("Authentication successful. Token and SEK acquired.");

    // Step 2: Validate and prepare the input JSON
    if (!inputJson) {
      console.log("Invalid input: Vehicle details are required.");
      return {
        Status: 0,
        ErrorDetails: "Vehicle details are required.",
      };
    }

    const jsonString = JSON.stringify(inputJson);
    console.log("UTF-8 encoded request JSON:", jsonString);

    // Step 3: Encrypt the JSON using SEK
    console.log("Encrypting JSON using SEK...");
    const encryptedData = encryptBySymmetricKey(jsonString, decryptedSek);
    console.log("Encrypted data:", encryptedData);

    // Step 4: Create the final request payload
    const requestPayload = {
      Data: encryptedData, // Encrypted data
    };
    console.log("Request payload:", requestPayload);

    // Step 5: Send the POST request to the IRN API
    console.log("Sending POST request to IRN API...");
    const response = await axios.post(
      IRNCancelUrl2,
      JSON.stringify(requestPayload),
      {
        headers: {
          "client-id": client_id,
          "client-secret": client_secret,
          Gstin: client_gstin,
          user_name: username,
          authtoken: authToken,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("API response received:", response.data);

    // Step 6: Handle the response from the API
    const retrievedData = response.data;
    const { Status, ErrorDetails, Data } = retrievedData;

    if (Status === 1) {
      // Decrypt the response data if Status is 1
      console.log("Decrypting response data...");
      const decryptedResponse = decryptBySymmetricKeyIRN(Data, decryptedSek);
      const parsedResponse = JSON.parse(decryptedResponse);
      console.log("IRN cancellation successful:", parsedResponse);

      return {
        Status: 1,
        Data: parsedResponse,
      };
    } else {
      // If status is not 1, return the raw error details
      console.error("Failed to cancel IRN. Error details:", ErrorDetails);
      return {
        Status: 0,
        ErrorDetails: ErrorDetails, // Return raw error details directly
      };
    }
  } catch (error) {
    console.error("Error canceling IRN bill:", error.message);
    return {
      Status: 0,
      ErrorDetails: {
        ErrorCode: "INTERNAL_ERROR",
        ErrorMessage: "Internal server error",
      },
    };
  }
}

async function generateEWBByIRNAPI(req, res, inputJson) {
  try {
    console.log("Starting EWB generation by IRN process...");

    // Step 1: Authenticate to get the token and SEK (Symmetric Encryption Key)
    console.log("Authenticating to obtain token and SEK...");
    const authResponse = await authenticate("IRN");
    console.log("Authentication response:", authResponse); // Log authentication response

    // Check if authentication was successful
    if (authResponse.Status !== 1) {
      console.error(
        "Authentication failed:",
        authResponse.ErrorDetails || "No details available"
      );
      return res.status(400).json({
        Status: 0,
        ErrorDetails: authResponse.ErrorDetails || "Authentication failed",
      });
    }

    // Extract the authentication token and SEK from the response
    const authToken = authResponse.Data.AuthToken;
    const decryptedSek = authResponse.Data.Sek;
    console.log("Authentication successful. Token and SEK acquired.");
    console.log("Auth Token:", authToken); // Log auth token
    console.log("Decrypted SEK:", decryptedSek); // Log decrypted SEK

    // Step 2: Extract vehicle details from the request body
    const vehicleDetails = req.body;

    // Check if vehicle details are provided in the request
    if (!vehicleDetails) {
      console.log("Invalid input: Vehicle details are required.");
      return res.status(400).json({
        Status: 0,
        ErrorDetails: "Vehicle details are required.",
      });
    }

    // Step 3: Prepare the request JSON with vehicle details
    console.log("Preparing request JSON with vehicle details...");
    const requestJson = vehicleDetails; // Directly use the body as vehicle details
    console.log("Request JSON:", requestJson); // Log the request JSON

    // Step 4: Convert the request JSON to a UTF-8 string
    console.log("Converting request JSON to UTF-8 string...");
    const jsonString = JSON.stringify(requestJson);
    console.log("UTF-8 encoded request JSON:", jsonString); // Log UTF-8 encoded string

    // Step 5: Encrypt the JSON using SEK
    console.log("Encrypting JSON using SEK...");
    const encryptedData = encryptBySymmetricKey(jsonString, decryptedSek);
    console.log("Encrypted data:", encryptedData); // Log encrypted data

    // Step 6: Create the final request payload
    console.log("Creating request payload...");
    const requestPayload = {
      // action: "GENEWAYBILL",
      Data: encryptedData, // Encrypted data
    };
    console.log("Request payload:", requestPayload); // Log the request payload

    // Step 7: Send the POST request to the E-way Bill API
    console.log("Sending POST request to IRN Bill API...");
    console.log("POST API URL:", IRNEWBGenUrl2); // Log the API URL
    const response = await axios.post(
      IRNEWBGenUrl2,
      JSON.stringify(requestPayload),
      {
        headers: {
          "client-id": client_id,
          "client-secret": client_secret,
          Gstin: client_gstin,
          user_name: username,
          authtoken: authToken,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("API response received:", response.data); // Log the response from the IRN API

    // Step 8: Handle the response from the API
    const retrivedData = response.data;
    console.log("Retrieved data:", retrivedData); // Log the retrieved data

    // Destructure the response to check status and error
    const { Status, ErrorDetails, Data } = retrivedData;
    console.log("Status:", Status); // Log the status from the response
    console.log("Error:", ErrorDetails); // Log any error message from the response
    // console.log("Retrieved data Seperated:", Data); // Log the retrieved data
    // console.log("Retrieved data Seperated2:", retrivedData?.Data); // Log the retrieved data

    //     if (Status == 1) {
    //       // If status is 1, decrypt the response data
    //       console.log("Decrypting response data...");
    //       const decryptedResponse = decryptBySymmetricKeyIRN(Data, decryptedSek);
    //       console.log("IRN bill generated successfully:", decryptedResponse); // Log decrypted response

    //       // Return the decrypted response data
    //       return res.status(200).json({
    //         Status: 1,
    //         Data: JSON.parse(decryptedResponse),
    //       });
    //     } else {
    //       // If status is not 1, handle multiple error codes
    //       const decodedError = decodeBase64(ErrorDetails);
    //       console.log("Decoded error:", decodedError); // Log decoded error

    //       let errorDetails = {};
    //       try {
    //         // Parse the decoded error string as JSON
    //         errorDetails = JSON.parse(decodedError);
    //         console.log("Parsed error details:", errorDetails); // Log parsed error details
    //       } catch (parseError) {
    //         // Handle any parsing errors
    //         errorDetails = {
    //           ErrorCode: "PARSE_ERROR",
    //           ErrorMessage: "Error details could not be parsed.",
    //           errorCodes: "Unknown",
    //         };
    //       }

    //       // Process multiple error codes
    //       const rawErrorCodes = (errorDetails.errorCodes || "Unknown").toString();
    //       const errorCodesArray = rawErrorCodes
    //         .split(",")
    //         .map((code) => code.trim())
    //         .filter((code) => code); // Split and trim codes
    //       console.log("Error codes array:", errorCodesArray); // Log error codes array

    //       // Look up additional error information from the database
    //       let detailedErrorMessages = {};
    //       try {
    //         const errorDetailsFromDb = await GSTIRNErrorCode.findAll({
    //           where: {
    //             ErrorCodes: errorCodesArray,
    //           },
    //         });

    //         // Map error codes to their descriptions
    //         errorDetailsFromDb.forEach((errorDetail) => {
    //           detailedErrorMessages[errorDetail.ErrorCodes] =
    //             errorDetail.Description;
    //         });
    //         console.log("Detailed error messages from DB:", detailedErrorMessages); // Log DB error messages
    //       } catch (dbError) {
    //         console.error(
    //           "Error querying database for detailed error messages:",
    //           dbError.message
    //         );
    //       }

    //       // Build the final error details
    //       const errorResponses = errorCodesArray.map((code) => ({
    //         ErrorCode: code,
    //         ErrorMessage: detailedErrorMessages[code] || "Unknown error message",
    //       }));

    //       console.error("Failed to generate IRN bill:", {
    //         ErrorMessages: errorResponses,
    //       });

    //       return res.status(400).json({
    //         Status: 0,
    //         ErrorDetails: {
    //           ErrorMessages: errorResponses,
    //         },
    //       });
    //     }
    //   } catch (error) {
    //     // Catch any errors that occur during the process
    //     console.error("Error generating IRN bill:", error.message);
    //     return res.status(500).json({
    //       Status: 0,
    //       ErrorDetails: encodeBase64(
    //         JSON.stringify({
    //           ErrorCode: "INTERNAL_ERROR",
    //           ErrorMessage: "Internal server error",
    //         })
    //       ),
    //     });
    //   }
    // }

    if (Status == 1) {
      // If status is 1, decrypt the response data
      console.log("Decrypting response data...");
      const decryptedResponse = decryptBySymmetricKeyIRN(Data, decryptedSek);
      console.log("IRN bill generated successfully:", decryptedResponse); // Log decrypted response

      // Return the decrypted response data
      return res.status(200).json({
        Status: 1,
        Data: JSON.parse(decryptedResponse),
      });
    } else {
      // If status is not 1, return the raw error details
      console.log("Error encountered. Returning error details...");
      console.log("Error Details:", ErrorDetails);

      return res.status(400).json({
        Status: 0,
        ErrorDetails: ErrorDetails, // Send raw error details directly
      });
    }
  } catch (error) {
    // Catch any errors that occur during the process
    console.error("Error generating IRN bill:", error.message);
    return res.status(500).json({
      Status: 0,
      ErrorDetails: encodeBase64(
        JSON.stringify({
          ErrorCode: "INTERNAL_ERROR",
          ErrorMessage: "Internal server error",
        })
      ),
    });
  }
}

/**
 * Generates an E-way Bill (EWB) using an IRN by making an API call.
 * @param {Object} inputJson - The JSON input containing vehicle details and other data for EWB generation.
 * @returns {Promise<Object>} - A promise that resolves to the API response object.
 */
async function generateEWBByIRN(inputJson) {
  try {
    console.log("Starting EWB generation by IRN process...");

    // Step 1: Authenticate to get the token and SEK (Symmetric Encryption Key)
    console.log("Authenticating to obtain token and SEK...");
    const authResponse = await authenticate("IRN");
    console.log("Authentication response:", authResponse);

    // Check if authentication was successful
    if (authResponse.Status !== 1) {
      console.error(
        "Authentication failed:",
        authResponse.ErrorDetails || "No details available"
      );
      return {
        Status: 0,
        ErrorDetails: authResponse.ErrorDetails || "Authentication failed",
      };
    }

    // Extract the authentication token and SEK from the response
    const authToken = authResponse.Data.AuthToken;
    const decryptedSek = authResponse.Data.Sek;
    console.log("Authentication successful. Token and SEK acquired.");

    // Step 2: Validate and prepare the input JSON (vehicle details)
    if (!inputJson) {
      console.log("Invalid input: Vehicle details are required.");
      return {
        Status: 0,
        ErrorDetails: "Vehicle details are required.",
      };
    }

    const jsonString = JSON.stringify(inputJson);
    console.log("UTF-8 encoded request JSON:", jsonString);

    // Step 3: Encrypt the JSON using SEK
    console.log("Encrypting JSON using SEK...");
    const encryptedData = encryptBySymmetricKey(jsonString, decryptedSek);
    console.log("Encrypted data:", encryptedData);

    // Step 4: Create the final request payload
    const requestPayload = {
      Data: encryptedData, // Encrypted data
    };
    console.log("Request payload:", requestPayload);

    // Step 5: Send the POST request to the E-way Bill API
    console.log("Sending POST request to EWB API...");
    const response = await axios.post(
      IRNEWBGenUrl2, // Ensure IRNEWBGenUrl2 is the correct URL for generating the EWB
      JSON.stringify(requestPayload),
      {
        headers: {
          "client-id": client_id,
          "client-secret": client_secret,
          Gstin: client_gstin,
          user_name: username,
          authtoken: authToken,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("API response received:", response.data);

    // Step 6: Handle the response from the API
    const retrievedData = response.data;
    const { Status, ErrorDetails, Data } = retrievedData;

    if (Status === 1) {
      // Decrypt the response data if Status is 1
      console.log("Decrypting response data...");
      const decryptedResponse = decryptBySymmetricKeyIRN(Data, decryptedSek);
      const parsedResponse = JSON.parse(decryptedResponse);
      console.log("EWB generated successfully:", parsedResponse);

      return {
        Status: 1,
        Data: parsedResponse,
      };
    } else {
      // If status is not 1, return the raw error details
      console.error("Failed to generate EWB. Error details:", ErrorDetails);
      return {
        Status: 0,
        ErrorDetails: ErrorDetails, // Return raw error details directly
      };
    }
  } catch (error) {
    console.error("Error generating EWB:", error.message);
    return {
      Status: 0,
      ErrorDetails: {
        ErrorCode: "INTERNAL_ERROR",
        ErrorMessage: "Internal server error",
      },
    };
  }
}

/**
 * Retrieve IRN details by making an API call.
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @returns {Promise<void>} - A promise that resolves when the retrieval is complete.
 */
async function getEWBDetailsByIRNAPI(req, res) {
  try {
    // Log start of the IRN retrieval process
    console.log("Starting EWB retrivial by IRN process...");

    // Authenticate before proceeding with the API call
    const authResponse = await authenticate("IRN");

    // Check if authentication was successful
    if (authResponse.Status !== 1) {
      // If authentication fails, return error with status 400
      return res.status(400).json({
        Status: 0,
        ErrorDetails: authResponse.ErrorDetails || "Authentication failed",
      });
    }

    // Use the AuthToken and Sek from the successful authentication response
    authToken = authResponse.Data.AuthToken;
    decryptedSek = authResponse.Data.Sek;

    console.log("Authentication successful.");

    // Retrieve the IRN (Invoice Reference Number) from the request query
    const irnNo = req.query.Irn;

    console.log("Retrieved irnNo from request query:", irnNo);

    // Check if the irnNo is provided in the request
    if (!irnNo) {
      // If IRN is missing, return an error message
      console.log("Invalid input: irnNo is required.");
      return res.status(400).json({
        Status: 0,
        ErrorDetails: encodeBase64(
          JSON.stringify({
            ErrorCode: "INVALID_INPUT",
            ErrorMessage: "irnNo is required.",
          })
        ),
      });
    }

    // Construct the API URL for IRN retrieval using the provided IRN
    const apiUrl = `${IRNEWBGetUrl2}${irnNo}`;
    console.log("API URL for IRN retrivial:", apiUrl);

    // Make the API call to retrieve IRN details
    const response = await axios.get(apiUrl, {
      headers: {
        "client-id": client_id,
        "client-secret": client_secret,
        Gstin: client_gstin,
        user_name: username,
        AuthToken: authToken,
        "Content-Type": "application/json",
      },
    });

    // Log the response data from the IRN API call
    console.log("API call successful. Response data:", response.data);

    const respData = response.data;

    // Check if the API response indicates an error
    if (respData.Status !== 1) {
      // If an error is returned from the API, send a response with error details
      console.log("Error from GST verification API:", respData.ErrorDetails);
      return res.status(400).json({
        Status: 0,
        ErrorDetails:
          respData.ErrorDetails || "An error occurred during GST verification",
      });
    }

    // Proceed with decryption if the response contains data
    if (!respData.Data) {
      // If no data is found, return an error message
      console.log("No data available for decryption.");
      return res.status(400).json({
        Status: 0,
        ErrorDetails: "No data returned from GST verification API",
      });
    }

    // Decrypt the response data using the symmetric key (Sek)
    const decryptedData = decryptBySymmetricKey(respData.Data, decryptedSek);
    console.log("Decrypted data:", decryptedData);

    // Log the successful verification and the decrypted data
    console.log("GST verification successful. Returning data:", decryptedData);

    // Send the decrypted data as a response if no previous response has been sent
    if (!res.headersSent) {
      return res.status(200).json({
        Status: 1,
        Data: JSON.parse(decryptedData), // Parse the decrypted JSON before sending it
      });
    } else {
      // If a response has already been sent, log the issue
      console.error("Response already sent, cannot send new response.");
    }
  } catch (error) {
    // Log any errors during the IRN retrieval process
    console.error("Error during GST verification:", error.message);

    // If an error occurs and no response has been sent, return a generic error message
    if (!res.headersSent) {
      return res.status(500).json({
        Status: 0,
        ErrorDetails: encodeBase64(
          JSON.stringify({
            ErrorCode: "INTERNAL_ERROR",
            ErrorMessage: "Internal server error",
          })
        ),
      });
    } else {
      // If a response has already been sent, log the issue
      console.error("Response already sent, cannot send new response.");
    }
  }
}

/**
 * Retrieve IRN details by making an API call.
 * @param {string} irnNo - The IRN (Invoice Reference Number) to retrieve details for.
 * @returns {Promise<Object>} - A promise that resolves to the API response object.
 */
async function getEWBDetailsByIRN(irnNo) {
  try {
    console.log("Starting EWB retrieval by IRN process...");

    // Step 1: Authenticate before proceeding with the API call
    const authResponse = await authenticate("IRN");

    // Check if authentication was successful
    if (authResponse.Status !== 1) {
      console.error(
        "Authentication failed:",
        authResponse.ErrorDetails || "No details available"
      );
      return {
        Status: 0,
        ErrorDetails: authResponse.ErrorDetails || "Authentication failed",
      };
    }

    // Use the AuthToken and Sek from the successful authentication response
    const authToken = authResponse.Data.AuthToken;
    const decryptedSek = authResponse.Data.Sek;
    console.log("Authentication successful.");

    // Step 2: Check if the IRN number is provided
    if (!irnNo) {
      console.log("Invalid input: irnNo is required.");
      return {
        Status: 0,
        ErrorDetails: "irnNo is required.",
      };
    }

    // Step 3: Construct the API URL for IRN retrieval using the provided IRN
    const apiUrl = `${IRNEWBGetUrl2}${irnNo}`;
    console.log("API URL for IRN retrieval:", apiUrl);

    // Step 4: Make the API call to retrieve IRN details
    const response = await axios.get(apiUrl, {
      headers: {
        "client-id": client_id,
        "client-secret": client_secret,
        Gstin: client_gstin,
        user_name: username,
        AuthToken: authToken,
        "Content-Type": "application/json",
      },
    });
    console.log("API call successful. Response data:", response.data);

    const respData = response.data;

    // Step 5: Check if the API response indicates an error
    if (respData.Status !== 1) {
      console.log("Error from GST verification API:", respData.ErrorDetails);
      return {
        Status: 0,
        ErrorDetails:
          respData.ErrorDetails || "An error occurred during GST verification",
      };
    }

    // Step 6: Proceed with decryption if the response contains data
    if (!respData.Data) {
      console.log("No data available for decryption.");
      return {
        Status: 0,
        ErrorDetails: "No data returned from GST verification API",
      };
    }

    // Step 7: Decrypt the response data using the symmetric key (Sek)
    const decryptedData = decryptBySymmetricKey(respData.Data, decryptedSek);
    console.log("Decrypted data:", decryptedData);

    // Step 8: Log the successful verification and the decrypted data
    console.log("GST verification successful. Returning data:", decryptedData);

    return {
      Status: 1,
      Data: JSON.parse(decryptedData), // Parse the decrypted JSON before returning it
    };
  } catch (error) {
    // Log any errors during the IRN retrieval process
    console.error("Error during GST verification:", error.message);

    return {
      Status: 0,
      ErrorDetails: {
        ErrorCode: "INTERNAL_ERROR",
        ErrorMessage: "Internal server error",
      },
    };
  }
}

/**
 * Generates an E-way bill by making an API call.
 * @param {Object} req - The HTTP request object, expected to contain vehicle details in the body.
 * @param {Object} res - The HTTP response object.
 * @returns {Promise<void>} - A promise that resolves when the E-way bill generation is complete.
 */

async function cancelEwayBillForIRNAPI(req, res, inputJson) {
  try {
    console.log("Starting E-way bill cancellation process...");

    // Step 1: Authenticate to get the token and SEK (Symmetric Encryption Key)
    console.log("Authenticating to obtain token and SEK...");
    const authResponse = await authenticate("EWB");

    // Check if authentication was successful
    if (authResponse.Status !== 1) {
      console.error(
        "Authentication failed:",
        authResponse.ErrorDetails || "No details available"
      );
      return res.status(400).json({
        Status: 0,
        ErrorDetails: authResponse.ErrorDetails || "Authentication failed",
      });
    }

    // Extract the authentication token and SEK from the response
    const authToken = authResponse.Data.AuthToken;
    const decryptedSek = authResponse.Data.Sek;
    console.log("Authentication successful. Token and SEK acquired.");

    // Step 2: Extract vehicle details from the request body
    const vehicleDetails = req.body;

    // Check if vehicle details are provided in the request
    if (!vehicleDetails) {
      console.log("Invalid input: Vehicle details are required.");
      return res.status(400).json({
        Status: 0,
        ErrorDetails: "Vehicle details are required.",
      });
    }

    // Step 3: Prepare the request JSON with vehicle details
    console.log("Preparing request JSON with vehicle details...");
    const requestJson = vehicleDetails; // Directly use the body as vehicle details
    console.log("Request JSON:", requestJson);

    // Step 4: Convert the request JSON to a UTF-8 string
    console.log("Converting request JSON to UTF-8 string...");
    const jsonString = JSON.stringify(requestJson);
    console.log("UTF-8 encoded request JSON:", jsonString);

    // Step 5: Encrypt the JSON using SEK
    console.log("Encrypting JSON using SEK...");
    const encryptedData = encryptBySymmetricKey(jsonString, decryptedSek);
    console.log("Encrypted data:", encryptedData);

    // Step 6: Create the final request payload
    console.log("Creating request payload...");
    const requestPayload = {
      action: "CANEWB", // Action for EWB cancellation
      data: encryptedData, // Encrypted data
    };
    console.log("Request payload:", requestPayload);

    // Step 7: Send the POST request to the E-way Bill API
    console.log("Sending POST request to E-way Bill API...");
    const response = await axios.post(
      IRNEWBCancelUrl2, // E-way Bill cancellation URL
      JSON.stringify(requestPayload),
      {
        headers: {
          "client-id": client_id,
          "client-secret": client_secret,
          Gstin: client_gstin,
          authtoken: authToken,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("API response received:", response.data);

    // Step 8: Handle the response from the API
    const retrivedData = response.data;
    console.log("Retrieved data:", retrivedData); // Log the retrieved data

    // Destructure the response to check status and error
    const { status, error, data } = retrivedData;
    console.log("Status:", status); // Log the status from the response
    console.log("Error:", error); // Log any error message from the response

    if (status === "1") {
      // If status is 1, decrypt the response data
      console.log("Decrypting response data...");
      const decryptedResponse = decryptBySymmetricKey(data, decryptedSek);
      const cancellationData = JSON.parse(decryptedResponse);
      console.log("E-way bill cancelled successfully:", cancellationData);

      // Send the response with the cancelled data
      return res.status(200).json({
        Status: 1,
        Data: cancellationData,
      });
    } else {
      // If status is not 1, decode and format the error details
      const decodedError = decodeBase64(error);
      let errorDetails;
      let errorCodesArray = [];

      try {
        // Parse the decoded error string as JSON
        errorDetails = JSON.parse(decodedError);
        errorCodesArray = errorDetails.errorCodes
          ? errorDetails.errorCodes.split(",")
          : [];
      } catch (parseError) {
        // Handle any parsing errors
        errorDetails = {
          ErrorCode: "PARSE_ERROR",
          ErrorMessage: "Error details could not be parsed.",
          errorCodes: "Unknown",
        };
      }

      // Look up additional error information from the database
      let detailedErrorMessages = {};

      try {
        if (errorCodesArray.length > 0) {
          const errorDetailsFromDb = await GSTEWBErrorCode.findAll({
            where: {
              ErrorCodes: errorCodesArray,
            },
          });

          errorDetailsFromDb.forEach((errorDetail) => {
            detailedErrorMessages[errorDetail.ErrorCodes] =
              errorDetail.Description;
          });
        }
      } catch (dbError) {
        console.error(
          "Error querying database for detailed error messages:",
          dbError.message
        );
      }

      // Build the final error details
      const errorResponses = errorCodesArray.map((code) => ({
        ErrorCode: code,
        ErrorMessage: detailedErrorMessages[code] || "Unknown error message",
      }));

      console.error("Failed to cancel E-way bill:", {
        ErrorMessages: errorResponses,
      });

      return res.status(400).json({
        Status: 0,
        ErrorDetails: {
          ErrorMessages: errorResponses,
        },
      });
    }
  } catch (error) {
    // Catch any errors that occur during the process
    console.error("Error cancelling E-way bill:", error.message);
    return res.status(500).json({
      Status: 0,
      ErrorDetails: {
        ErrorCode: "INTERNAL_ERROR",
        ErrorMessage: "Internal server error",
      },
    });
  }
}

/**
 * Cancels an E-way bill by making an API call.
 * @param {Object} vehicleDetails - The vehicle details for which the E-way bill needs to be canceled.
 * @returns {Promise<Object>} - A promise that resolves to the API response object.
 */
async function cancelEwayBillForIRN(vehicleDetails) {
  try {
    console.log("Starting E-way bill cancellation process...");

    // Step 1: Authenticate to get the token and SEK (Symmetric Encryption Key)
    const authResponse = await authenticate("EWB");

    // Check if authentication was successful
    if (authResponse.Status !== 1) {
      console.error(
        "Authentication failed:",
        authResponse.ErrorDetails || "No details available"
      );
      return {
        Status: 0,
        ErrorDetails: authResponse.ErrorDetails || "Authentication failed",
      };
    }

    // Use the AuthToken and Sek from the successful authentication response
    const authToken = authResponse.Data.AuthToken;
    const decryptedSek = authResponse.Data.Sek;
    console.log("Authentication successful. Token and SEK acquired.");

    // Step 2: Check if vehicle details are provided
    if (!vehicleDetails) {
      console.log("Invalid input: Vehicle details are required.");
      return {
        Status: 0,
        ErrorDetails: "Vehicle details are required.",
      };
    }

    // Step 3: Convert the vehicle details to a UTF-8 string
    const jsonString = JSON.stringify(vehicleDetails);
    console.log("UTF-8 encoded request JSON:", jsonString);

    // Step 4: Encrypt the JSON using SEK
    const encryptedData = encryptBySymmetricKey(jsonString, decryptedSek);
    console.log("Encrypted data:", encryptedData);

    // Step 5: Create the final request payload for the E-way bill cancellation API
    const requestPayload = {
      action: "CANEWB", // Action for EWB cancellation
      data: encryptedData, // Encrypted data
    };
    console.log("Request payload:", requestPayload);

    // Step 6: Send the POST request to the E-way Bill API
    const response = await axios.post(
      IRNEWBCancelUrl2, // E-way Bill cancellation URL
      JSON.stringify(requestPayload),
      {
        headers: {
          "client-id": client_id,
          "client-secret": client_secret,
          Gstin: client_gstin,
          authtoken: authToken,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("API response received:", response.data);

    // Step 7: Handle the response from the API
    const retrivedData = response.data;
    const { status, error, data } = retrivedData;

    if (status === "1") {
      // If status is 1, decrypt the response data
      const decryptedResponse = decryptBySymmetricKey(data, decryptedSek);
      const cancellationData = JSON.parse(decryptedResponse);
      console.log("E-way bill cancelled successfully:", cancellationData);

      return {
        Status: 1,
        Data: cancellationData,
      };
    } else {
      // If status is not 1, decode and format the error details
      const decodedError = decodeBase64(error);
      let errorDetails;
      let errorCodesArray = [];

      try {
        // Parse the decoded error string as JSON
        errorDetails = JSON.parse(decodedError);
        errorCodesArray = errorDetails.errorCodes
          ? errorDetails.errorCodes.split(",")
          : [];
      } catch (parseError) {
        errorDetails = {
          ErrorCode: "PARSE_ERROR",
          ErrorMessage: "Error details could not be parsed.",
          errorCodes: "Unknown",
        };
      }

      // Look up additional error information from the database
      let detailedErrorMessages = {};

      try {
        if (errorCodesArray.length > 0) {
          const errorDetailsFromDb = await GSTEWBErrorCode.findAll({
            where: {
              ErrorCodes: errorCodesArray,
            },
          });

          errorDetailsFromDb.forEach((errorDetail) => {
            detailedErrorMessages[errorDetail.ErrorCodes] =
              errorDetail.Description;
          });
        }
      } catch (dbError) {
        console.error(
          "Error querying database for detailed error messages:",
          dbError.message
        );
      }

      // Build the final error details
      const errorResponses = errorCodesArray.map((code) => ({
        ErrorCode: code,
        ErrorMessage: detailedErrorMessages[code] || "Unknown error message",
      }));

      console.error("Failed to cancel E-way bill:", {
        ErrorMessages: errorResponses,
      });

      return {
        Status: 0,
        ErrorDetails: {
          ErrorMessages: errorResponses,
        },
      };
    }
  } catch (error) {
    // Log any errors during the cancellation process
    console.error("Error cancelling E-way bill:", error.message);

    return {
      Status: 0,
      ErrorDetails: {
        ErrorCode: "INTERNAL_ERROR",
        ErrorMessage: "Internal server error",
      },
    };
  }
}

// Export functions for use in other modules
module.exports = {
  authenticate,
  refreshSession,
  GSTVerification,
  GSTVerificationFunc,
  generateEwayBill,
  generateEwayBillAPI,
  getEwayBillDetailsAPI,
  getEwayBillDetailsByDate,
  cancelEwayBill,
  cancelEwayBillAPI,
  extendEwayBillValidity,
  extendEwayBillValidityAPI,
  authenticateAPI,
  generateIRNAPI,
  generateIRN,
  getIRNDetailsAPI,
  getIRNDetails,
  getIRNDetailsByDocTypeAPI,
  getIRNDetailsByDocType,
  cancelIRNAPI,
  cancelIRN,
  generateEWBByIRNAPI,
  generateEWBByIRN,
  getEWBDetailsByIRNAPI,
  getEWBDetailsByIRN,
  cancelEwayBillForIRNAPI,
  cancelEwayBillForIRN,
};
