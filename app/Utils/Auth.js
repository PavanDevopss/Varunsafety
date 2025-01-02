const jwt = require("jsonwebtoken");
require("dotenv").config();

const verifyToken = (req, res, next) => {
  //   console.log(req.headers["authorization"]); // Log the header
  const token =
    req.headers["authorization"] && req.headers["authorization"].split(" ")[1];
  //   console.log("Extracted Token:", token); // Log the token

  if (!token) {
    return res.status(401).json({ message: "No token provided" }); // No token
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      // Check if the error is due to token expiration
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token has expired" }); // Expired token
      }
      //   console.error("JWT Verification Error:", err.message); // Log the error
      return res.status(403).json({ message: "Token is not valid" }); // Invalid token
    }

    req.user = user; // Token is valid
    next(); // Proceed to the next middleware or route handler
  });
};

module.exports = verifyToken;

//   const token = req.headers["authorization"];

//   if (!token) {
//     return res.status(403).send({ message: "No token provided!" });
//   }

//   jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
//     if (err) {
//       return res.status(401).send({ message: "Unauthorized!", err });
//     }

//     req.userId = decoded.userId;
//     next();
// });
