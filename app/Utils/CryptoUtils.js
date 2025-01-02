const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

// Define the path to the public key file
const invPath = "../PublicKey/einv_sandbox.pem";
const ewbPath = "../PublicKey/ewaybill.pem";

/**
 * Loads the public key from the specified path.
 * @param {string} keyType - The type of key to load ('IRN' or 'EWB').
 * @returns {string} The loaded public key.
 */
function loadPublicKey(keyType) {
  const publicKeyPath = path.join(
    __dirname,
    keyType === "IRN" ? invPath : ewbPath
  );
  try {
    const publicKey = fs.readFileSync(publicKeyPath, "utf8");
    console.log("Public key loaded successfully.");
    return publicKey;
  } catch (error) {
    console.error("Error reading public key:", error);
    throw error;
  }
}

/**
 * Generates a random symmetric key (AES).
 * @returns {Buffer} The generated 256-bit symmetric key.
 */
function generateSymmetricKey() {
  return crypto.randomBytes(32); // 256-bit key
}

/**
 * Encrypts JSON data using the loaded RSA public key.
 * @param {Object} jsonData - The JSON data to be encrypted.
 * @param {string} keyType - The type of key to use for encryption ('IRN' or 'EWB').
 * @returns {string} The encrypted data as a Base64 string.
 */
function encryptData(jsonData, keyType) {
  try {
    const publicKey = loadPublicKey(keyType);

    const jsonDataString = JSON.stringify(jsonData);
    const base64Encoded = Buffer.from(jsonDataString, "utf8").toString(
      "base64"
    );

    const encrypted = crypto.publicEncrypt(
      {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_PADDING,
      },
      Buffer.from(base64Encoded)
    );

    return encrypted.toString("base64");
  } catch (error) {
    console.error("Error during encryption:", error);
    throw error;
  }
}

/**
 * Decrypts the encrypted SEK using the provided AppKey.
 * @param {string} encryptedSek - The encrypted SEK as a Base64 string.
 * @param {string} appKey - The AppKey as a Base64 string.
 * @returns {string} The decrypted SEK as a Base64 string.
 */
function decryptSymmetricKey(encryptedSek, appKey) {
  try {
    const dataToDecrypt = Buffer.from(encryptedSek, "base64");
    const buffer = Buffer.from(appKey, "base64");
    const keyBytes = Buffer.from(new Uint8Array(buffer));

    const decipher = crypto.createDecipheriv("aes-256-ecb", keyBytes, null);
    decipher.setAutoPadding(true);

    let decrypted = decipher.update(dataToDecrypt, "base64", "binary");
    decrypted += decipher.final("binary");

    // Convert result to Base64 string
    const EK_result = Buffer.from(decrypted, "binary").toString("base64");

    return EK_result;
  } catch (error) {
    console.error("Error decrypting symmetric key:", error);
    throw error;
  }
}

// /**
//  * Decrypts data using a symmetric key (SEK).
//  * @param {string} encryptedData - The encrypted data as a Base64 string.
//  * @param {string} sekKey - The symmetric key (SEK) as a Base64 string.
//  * @returns {string} The decrypted data.
//  */
// function decryptBySymmetricKey(encryptedData, sekKey) {
//     try {
//         const sekBytes = Buffer.from(sekKey, 'base64');
//         const decipher = crypto.createDecipheriv('aes-256-ecb', sekBytes, null);
//         decipher.setAutoPadding(true);

//         let decrypted = decipher.update(Buffer.from(encryptedData, 'base64'), 'base64', 'utf8');
//         decrypted += decipher.final('utf8');

//         return decrypted;
//     } catch (error) {
//         console.error('Error decrypting data by symmetric key:', error);
//         throw error;
//     }
// }

// /**
//  * Encrypts data using a symmetric key (SEK).
//  * @param {string} data - The data to be encrypted.
//  * @param {string} sekKey - The symmetric key (SEK) as a Base64 string.
//  * @returns {string} The encrypted data as a Base64 string.
//  */
// function encryptBySymmetricKey(data, sekKey) {
//     try {
//         const sekBytes = Buffer.from(sekKey, 'base64');
//         const cipher = crypto.createCipheriv('aes-256-ecb', sekBytes, null);

//         let encrypted = cipher.update(data, 'utf8', 'base64');
//         encrypted += cipher.final('base64');

//         return encrypted;
//     } catch (error) {
//         console.error('Error encrypting data by symmetric key:', error);
//         throw error;
//     }
// }

/**
 * Decrypts data using a symmetric key (SEK).
 * @param {string} encryptedData - The encrypted data as a Base64 string.
 * @param {string} sekKey - The symmetric key (SEK) as a Base64 string.
 * @returns {string} The decrypted data.
 */
function decryptBySymmetricKey(encryptedData, sekKey) {
  try {
    const dataToDecrypt = Buffer.from(encryptedData, "base64");
    const buffer = Buffer.from(sekKey, "base64");
    const keyBytes = Buffer.from(new Uint8Array(buffer));

    const decipher = crypto.createDecipheriv(
      "aes-256-ecb",
      keyBytes,
      Buffer.alloc(0)
    );
    decipher.setAutoPadding(true);

    let decrypted = decipher.update(dataToDecrypt, null, "binary");
    decrypted += decipher.final("binary");

    // Convert result to UTF-8 string
    const utf8String = Buffer.from(decrypted, "binary").toString("utf8");

    return utf8String;
  } catch (error) {
    console.error("Error decrypting data by symmetric key:", error);
    throw error;
  }
}

function decryptBySymmetricKeyIRN(encryptedData, sekKey) {
  try {
    // Decode the base64-encoded encrypted data and key
    const dataToDecrypt = Buffer.from(encryptedData, "base64");
    const keyBytes = Buffer.from(sekKey, "base64");

    // Create decipher with AES-256-ECB and no IV
    const decipher = crypto.createDecipheriv("aes-256-ecb", keyBytes, null);
    decipher.setAutoPadding(true);

    // Decrypt the data
    const decrypted = Buffer.concat([
      decipher.update(dataToDecrypt),
      decipher.final(),
    ]);

    // Convert decrypted data to UTF-8 string
    return decrypted.toString("utf8");
  } catch (error) {
    console.error("Error decrypting data by symmetric key:", error.message);
    throw error;
  }
}

/**
 * Encrypts data using a symmetric key (SEK).
 * @param {string} data - The data to be encrypted.
 * @param {string} sekKey - The symmetric key (SEK) as a Base64 string.
 * @returns {string} The encrypted data as a Base64 string.
 */
function encryptBySymmetricKey(data, sekKey) {
  try {
    const sekBytes = Buffer.from(sekKey, "base64");

    const cipher = crypto.createCipheriv(
      "aes-256-ecb",
      sekBytes,
      Buffer.alloc(0)
    );
    cipher.setAutoPadding(true);

    let encrypted = cipher.update(data, "utf8", "base64");
    encrypted += cipher.final("base64");

    return encrypted.toString("base64");
  } catch (error) {
    console.error("Error encrypting data by symmetric key:", error);
    throw error;
  }
}

function encryptBySymmetricKeyIRN(data, sekKey) {
  try {
    // Convert the SEK from Base64 to bytes
    const sekBytes = Buffer.from(sekKey, "base64");

    // Initialize the AES-256-ECB cipher
    const cipher = crypto.createCipheriv(
      "aes-256-ecb",
      sekBytes,
      Buffer.alloc(0)
    );
    cipher.setAutoPadding(true);

    // Encrypt the data (UTF-8) and return the result as Base64
    let encrypted = cipher.update(data, "utf8", "base64");
    encrypted += cipher.final("base64"); // Complete the encryption process

    // Return the encrypted data as a Base64 string
    return encrypted;
  } catch (error) {
    console.error("Error encrypting data by symmetric key:", error);
    throw error; // Ensure the error is thrown for the caller to handle
  }
}

module.exports = {
  generateSymmetricKey,
  encryptData,
  decryptSymmetricKey,
  decryptBySymmetricKey,
  decryptBySymmetricKeyIRN,
  encryptBySymmetricKey,
  encryptBySymmetricKeyIRN,
};

// Working Code

// const crypto = require('crypto');
// const fs = require('fs');
// const path = require('path');

// // Define the path to the public key file
// const invPath = "../PublicKey/einv_sandbox.pem";
// const ewbPath = "../PublicKey/ewaybill.pem";
// const publicKeyPath = path.join(__dirname, invPath);

// // Load the public key
// let publicKey;
// try {
//     publicKey = fs.readFileSync(publicKeyPath, 'utf8');
//     console.log('Public key loaded successfully.');
// } catch (error) {
//     console.error('Error reading public key:', error);
//     throw error;
// }

// /**
//  * Generates a random symmetric key (AES).
//  * @returns {Buffer} The generated 256-bit symmetric key.
//  */
// function generateSymmetricKey() {
//     return crypto.randomBytes(32); // 256-bit key
// }

// /**
//  * Encrypts JSON data using the loaded RSA public key.
//  * @param {Object} jsonData - The JSON data to be encrypted.
//  * @returns {string} The encrypted data as a Base64 string.
//  */
// function encryptData(jsonData) {
//     try {
//         if (!publicKey) {
//             throw new Error('Public key is not defined.');
//         }

//         // console.log('Public Key:', publicKey);

//         const jsonDataString = JSON.stringify(jsonData);
//         const base64Encoded = Buffer.from(jsonDataString, 'utf8').toString('base64');

//         const encrypted = crypto.publicEncrypt({
//             key: publicKey,
//             padding: crypto.constants.RSA_PKCS1_PADDING
//         }, Buffer.from(base64Encoded));

//         return encrypted.toString('base64');
//     } catch (error) {
//         console.error('Error during encryption:', error);
//         throw error;
//     }
// }

// /**
//  * Decrypts the encrypted SEK using the provided AppKey.
//  * @param {string} encryptedSek - The encrypted SEK as a Base64 string.
//  * @param {string} appKey - The AppKey as a Base64 string.
//  * @returns {string} The decrypted SEK as a Base64 string.
//  */
// function decryptSymmetricKey(encryptedSek, appKey) {
//     try {
//         const dataToDecrypt = Buffer.from(encryptedSek, 'base64');
//         const buffer = Buffer.from(appKey, 'base64');
//         const keyBytes = Buffer.from(new Uint8Array(buffer));

//         const decipher = crypto.createDecipheriv('aes-256-ecb', keyBytes, null);
//         decipher.setAutoPadding(true);

//         let decrypted = decipher.update(dataToDecrypt, 'base64', 'binary');
//         decrypted += decipher.final('binary');

//         // Convert result to Base64 string
//         const EK_result = Buffer.from(decrypted, 'binary').toString('base64');

//         return EK_result;
//     } catch (error) {
//         console.error('Error decrypting symmetric key:', error);
//         throw error;
//     }
// }

// /**
//  * Decrypts data using a symmetric key (SEK).
//  * @param {string} encryptedData - The encrypted data as a Base64 string.
//  * @param {string} sekKey - The symmetric key (SEK) as a Base64 string.
//  * @returns {string} The decrypted data.
//  */
// function decryptBySymmetricKey(encryptedData, sekKey) {
//     try {
//         const dataToDecrypt = Buffer.from(encryptedData, 'base64');
//         const buffer = Buffer.from(sekKey, 'base64');
//         const keyBytes = Buffer.from(new Uint8Array(buffer));

//         const decipher = crypto.createDecipheriv('aes-256-ecb', keyBytes, Buffer.alloc(0));
//         decipher.setAutoPadding(true);

//         let decrypted = decipher.update(dataToDecrypt, null, 'binary');
//         decrypted += decipher.final('binary');

//         // Convert result to UTF-8 string
//         const utf8String = Buffer.from(decrypted, 'binary').toString('utf8');

//         return utf8String;
//     } catch (error) {
//         console.error('Error decrypting data by symmetric key:', error);
//         throw error;
//     }
// }

// /**
//  * Encrypts data using a symmetric key (SEK).
//  * @param {string} data - The data to be encrypted.
//  * @param {string} sekKey - The symmetric key (SEK) as a Base64 string.
//  * @returns {string} The encrypted data as a Base64 string.
//  */
// function encryptBySymmetricKey(data, sekKey) {
//     try {
//         const sekBytes = Buffer.from(sekKey, 'base64');

//         const cipher = crypto.createCipheriv('aes-256-ecb', sekBytes, Buffer.alloc(0));
//         cipher.setAutoPadding(true);

//         let encrypted = cipher.update(data, 'utf8', 'base64');
//         encrypted += cipher.final('base64');

//         return encrypted;
//     } catch (error) {
//         console.error('Error encrypting data by symmetric key:', error);
//         throw error;
//     }
// }

// module.exports = {
//     generateSymmetricKey,
//     encryptData,
//     decryptSymmetricKey,
//     decryptBySymmetricKey,
//     encryptBySymmetricKey
// };
