/* eslint-disable no-unused-vars */
const db = require("../models");
const UserMaster = db.usermaster;
const BranchMaster = db.branchmaster;
const DepartmentMaster = db.departmentmaster;
const RegionMaster = db.regionmaster;
const StateMaster = db.statemaster;
const RoleMaster = db.rolesmaster;
const Op = db.Sequelize.Op;
const bcrypt = require("bcrypt");
//const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Create and Save a new User
exports.create = async (req, res) => {
  try {
    // Validate request
    if (!req.body.UserName) {
      return res.status(400).send({
        message: "UserName cannot be empty!",
      });
    }
    if (!/^[a-zA-Z ]*$/.test(req.body.UserName)) {
      return res.status(400).json({
        message: "UserName should contain only letters",
      });
    }
    // Check if DrivingLicense is unique
    const existingLicense = await UserMaster.findOne({
      where: { DrivingLicense: req.body.DrivingLicense },
    });

    if (existingLicense) {
      return res.status(400).json({
        message: "DrivingLicense must be unique. This license already exists.",
      });
    }

    // Create a User
    const Userdata = {
      UserName: req.body.UserName,
      EmpID: req.body.EmpID,
      Email: req.body.Email,
      Mobile: req.body.Mobile,
      Designation: req.body.Designation,
      MPIN: req.body.MPIN || null,
      Password: req.body.Password || null,
      UserStatus: req.body.UserStatus || null,
      RoleID: req.body.RoleID,
      State: req.body.State,
      Region: req.body.Region,
      City: req.body.City,
      Branch: req.body.Branch,
      BranchID: req.body.BranchID,
      RegionID: req.body.RegionID,
      DeptID: req.body.DeptID,
      StateID: req.body.StateID,
      OEMID: req.body.OEMID,
      DateOfJoining: req.body.DateOfJoining,
      DrivingLicense: req.body.DrivingLicense,
      Status: req.body.Status || false,
      IsActive: req.body.IsActive || true,
    };

    // Save USERS in the database
    const Data = await UserMaster.create(Userdata);
    res.status(201).send(Data);
  } catch (err) {
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
        message: "Database error occurred while creating UserMaster.",
        details: err.message,
      });
    }

    if (err.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: err.message,
      });
    }

    console.error("Error creating UserMaster:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// exports.usersignup = async (req, res) => {
//   try {
//     const condition = {
//       EmpID: req.body.EmpID,
//       // Password: req.body.Password
//     };
//     const { newPassword } = req.body;
//     // Finding the user
//     const user = await UserMaster.findOne({ where: condition });

//     if (!user) {
//       return res.status(404).send({ message: "EmpID not found" });
//     }
//     const hashedPassword = await bcrypt.hash(newPassword, 10);

//     // Update user's password in the database
//     user.Password = hashedPassword;
//     user.ModifiedDate = new Date();
//     await user.save();

//     // Send the user data with the new password
//     res.send({ user, newPassword });
//   } catch (err) {
//     // Handle errors
//     res.status(500).send({
//       message: err.message || "Some error occurred while retrieving the user.",
//     });
//   }
// };

exports.usersignup = async (req, res) => {
  try {
    const condition = {
      EmpID: req.body.EmpID,
      // Password: req.body.Password
    };
    const { newPassword } = req.body;
    // Finding the user
    const user = await UserMaster.findOne({ where: condition });

    if (!user) {
      return res.status(404).send({ message: "EmpID not found" });
    }
    // const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password in the database
    user.Password = newPassword;
    user.ModifiedDate = new Date();
    await user.save();

    // Send the user data with the new password
    res.send({ user, newPassword });
  } catch (err) {
    // Handle errors
    res.status(500).send({
      message: err.message || "Some error occurred while retrieving the user.",
    });
  }
};

exports.userlogin = async (req, res) => {
  try {
    const { EmpID, Password } = req.body;

    // Finding the user
    const userData = await UserMaster.findOne({ where: { EmpID } });
    console.log("!!!!!!!!", userData);
    if (!userData) {
      return res
        .status(404)
        .send({ message: "Invalid EMPID or Employee doesn't exist" });
    }

    if (!userData.Password) {
      return res.status(403).send({
        message:
          "Account exists, but a password has not been created. Please click on 'New User' to set up your password.",
      });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(Password, userData.Password);

    if (!isPasswordValid) {
      return res.status(401).send({ message: "Invalid password" });
    }

    const branchData = await BranchMaster.findOne({
      where: { BranchID: userData.BranchID },
    });

    if (!branchData) {
      return res.status(404).send({ message: "User Branch Data not found" });
    }

    // Create the JWT token with user information
    const token = jwt.sign(
      {
        userId: userData.UserID,
        empId: userData.EmpID,
        roleId: userData.RoleID,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY }
    );

    const user = {
      Branch: branchData.BranchName,
      BranchCode: branchData.BranchCode,
      BranchID: userData.BranchID,
      GSTID: branchData.GSTIN,
      City: userData.City,
      // CreatedDate: userData.CreatedDate,
      Designation: userData.Designation,
      Email: userData.Email,
      EmpID: userData.EmpID,
      // IsActive: userData.IsActive,
      // MPIN: userData.MPIN,
      Mobile: userData.Mobile,
      ModifiedDate: userData.ModifiedDate,
      OEMID: userData.OEMID,
      // Password: userData.Password,
      Region: userData.Region,
      RegionID: userData.RegionID,
      RoleID: userData.RoleID,
      State: userData.State,
      Status: userData.Status,
      UserID: userData.UserID,
      UserName: userData.UserName,
      UserStatus: userData.UserStatus,
    };

    // Password is valid, user is authenticated
    res.send({ message: "Login successful", token, user });
  } catch (err) {
    // Handle errors
    res.status(500).send({
      message: err.message || "Some error occurred while logging in.",
    });
  }
};

exports.MobileMPINCreation = async (req, res) => {
  try {
    const condition = {
      EmpID: req.body.EmpID,
      Mobile: req.body.Mobile,
    };
    const { MPIN } = req.body;
    // Finding the user
    //   const user = await UserMaster.findOne({ where: condition },
    //     attributes: { exclude: ['createdBy', 'createdDate', 'modifiedBY', 'modifiedDate'] }
    // );

    const user = await UserMaster.findOne({
      where: condition,
      attributes: { exclude: ["Password", "MPIN", "createdDate"] },
    });

    if (!user) {
      return res.status(404).send({ message: "EmpID not found" });
    }

    if (!MPIN) {
      return res.status(404).send({ message: "MPIN Was Mandatory" });
    } else {
      // const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update user's password in the database
      user.MPIN = MPIN;
      user.ModifiedDate = new Date();
      await user.save();

      // Send the user data with the new password
      res.send({ message: "Mpin Created successful", user });
    }
  } catch (err) {
    // Handle errors
    res.status(500).send({
      message: err.message || "Some error occurred while retrieving the user.",
    });
  }
};

exports.MobileloginWithMpin = async (req, res) => {
  try {
    //const { EmpId, MPIN } = req.body;

    // const condition = {
    //   EmpId: req.query.EmpId,
    //   MPIN: req.query.MPIN
    // };

    const condition = {
      EmpID: req.body.EmpID,
      MPIN: req.body.MPIN,
    };

    console.log(condition);
    // Finding the user
    const user = await UserMaster.findOne({
      where: condition,
      attributes: { exclude: ["Password", "MPIN", "CreatedDate"] },
    });
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    // Create the JWT token with user information
    const token = jwt.sign(
      {
        userId: user.UserID,
        empId: user.EmpID,
        roleId: user.RoleID,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY }
    );
    // Password is valid, user is authenticated
    res.send({ message: "Login successful", token, user });
  } catch (err) {
    // Handle errors
    res.status(500).send({
      message: err.message || "Some error occurred while logging in.",
    });
  }
};

exports.GetUser = async (req, res) => {
  try {
    const condition = {
      EmpID: req.query.EmpID,
      Mobile: req.query.Mobile,
    };

    if (!condition) {
      return res.status(404).send({ message: "Invalid Data" });
    }
    // Finding the user
    const user = await UserMaster.findOne({ where: condition });

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    console.log(user);

    var mid = true;

    if (user.MPIN === null) {
      mid = false;
    } else {
      mid = true;
    }

    // Password is valid, user is authenticated
    res.send({
      message: "Valid User",
      User: true,
      mpin: mid,
      UserName: user.UserName,
    });
  } catch (err) {
    // Handle errors
    res.status(500).send({
      message: err.message || "Some error occurred while logging in.",
    });
  }
};

exports.updatempin = async (req, res) => {
  try {
    // Validate request
    if (!req.body.EmpID || !req.body.OldMPIN || !req.body.NewMPIN) {
      return res
        .status(400)
        .send({ message: "Please provide EmpID, OldMPIN, and NewMPIN" });
    }

    const condition = {
      EmpID: req.body.EmpID,
      MPIN: req.body.OldMPIN,
    };

    // Finding the user
    const user = await UserMaster.findOne({ where: condition });

    if (!user) {
      return res.status(404).send({ message: "Incorrect EmpID or Old MPIN" });
    } else {
      // Update MPIN
      user.MPIN = req.body.NewMPIN;
      user.ModifiedDate = new Date();
      await user.save();

      // MPIN updated successfully
      res.send({ message: "MPIN Updated Successfully" });
    }
  } catch (err) {
    // Handle errors
    console.error("Error in ChangeMPIN:", err);
    res.status(500).send({
      message: "An error occurred while processing your request.",
    });
  }
};

exports.userlogout = async (req, res) => {
  try {
    const { EmpID, Password } = req.body;

    // Finding the user
    const user = await UserMaster.findOne({ where: { EmpID } });

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    res.send({ message: "Logout successful" });
  } catch (err) {
    // Handle errors
    res.status(500).send({
      message: err.message || "Some error occurred while logging in.",
    });
  }
};

exports.ForgetMPIN = async (req, res) => {
  try {
    const { EmpID } = req.body;

    // Finding the user
    const user = await UserMaster.findOne({ where: { EmpID } });

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    console.log(user.MPIN);
    // Update the MPIN status to false
    user.MPIN = null;
    user.ModifiedDate = new Date();
    await user.save();

    res.send({
      message: "Valid User",
      user,
      // User: true,
      // mpin: false,
    });
  } catch (err) {
    // Handle errors
    res.status(500).send({
      message: err.message || "Some error occurred while logging in.",
    });
  }
};

// exports.GetEmployeeByID = async (req, res) => {
//   try {
//     const condition = {
//       EmpID: req.query.EmpID,
//     };

//     if (!condition) {
//       return res.status(404).send({ message: "Invalid Data" });
//     }
//     // Finding the user
//     const user = await UserMaster.findOne({ where: condition });
//     if (!user) {
//       return res.status(404).send({ message: "User not found" });
//     }
//     // Create a new object excluding MPIN and Password
//     const { MPIN, Password, ...userWithoutSensitiveInfo } = user.dataValues;

//     res.send({
//       message: "Valid User",
//       user: userWithoutSensitiveInfo,
//     });
//   } catch (err) {
//     // Handle errors
//     res.status(500).send({
//       message: err.message || "Some error occurred while logging in.",
//     });
//   }
// };

// exports.ChangeMPIN = async (req, res) => {
//   try {

//     const condition = {
//       EmpId: req.body.EmpId,
//       MPIN: req.body.OldMPIN
//     };

//     // Finding the user
//     const user = await UserMaster.findOne({ where: condition });

//     if (!user) {
//       return res.status(404).send({ message: "Wrong MPIN" });
//     }

//     else{

//       user.MPIN = req.body.NewMPIN;
//     await user.save();

//     // Password is valid, user is authenticated
//     res.send({ message: "MPIN Updated Successfully.."});
//     }

//   } catch (err) {
//     // Handle errors
//     res.status(500).send({
//       message: err.message || "Some error occurred while logging in."
//     });
//   }
// };

// // Retrieve all ModelMasters from the database.
// exports.findAll = (req, res) => {
//   const ModelCode = req.query.ModelCode;
//   var condition = ModelCode ? { ModelCode: { [Op.iLike]: `%${title}%` } } : null;

//   ModelMaster.findAll({ where: condition })
//     .then(data => {
//       res.send(data);
//     })
//     .catch(err => {
//       res.status(500).send({
//         message:
//           err.message || "Some error occurred while retrieving ModelMasters."
//       });
//     });
// };

// // Find a single ModelMaster with an id
// exports.findOne = (req, res) => {
//   const id = req.params.id;

//   ModelMaster.findByPk(id)
//     .then(data => {
//       res.send(data);
//     })
//     .catch(err => {
//       res.status(500).send({
//         message: "Error retrieving ModelMaster with id=" + id
//       });
//     });
// };

// // Update a ModelMaster by the id in the request
// exports.update = (req, res) => {
//   const id = req.params.id;

//   ModelMaster.update(req.body, {
//     where: { id: id }
//   })
//     .then(num => {
//       if (num == 1) {
//         res.send({
//           message: "ModelMaster was updated successfully."
//         });
//       } else {
//         res.send({
//           message: `Cannot update ModelMaster with id=${id}. Maybe Tutorial was not found or req.body is empty!`
//         });
//       }
//     })
//     .catch(err => {
//       res.status(500).send({
//         message: "Error updating Tutorial with id=" + id
//       });
//     });
// };

// // Delete a ModelMaster with the specified id in the request
// exports.delete = (req, res) => {
//   const id = req.params.id;

//   ModelMaster.destroy({
//     where: { id: id }
//   })
//     .then(num => {
//       if (num == 1) {
//         res.send({
//           message: "ModelMaster was deleted successfully!"
//         });
//       } else {
//         res.send({
//           message: `Cannot delete ModelMaster with id=${id}. Maybe ModelMaster was not found!`
//         });
//       }
//     })
//     .catch(err => {
//       res.status(500).send({
//         message: "Could not delete ModelMaster with id=" + id
//       });
//     });
// };

exports.GetEmployeeByID = async (req, res) => {
  try {
    const empID = req.query.EmpID;

    if (!empID) {
      console.log("EmpID not provided");
      return res.status(404).send({ message: "Invalid Data" });
    }

    // Finding the user
    const user = await UserMaster.findOne({ where: { EmpID: empID } });

    if (!user) {
      console.log(`User not found for EmpID: ${empID}`);
      return res.status(404).send({ message: "User not found" });
    }

    // Check if Password is not null
    if (user.Password === null) {
      console.log(`Password is null for user with EmpID: ${empID}`);
      return res.status(200).json({
        message: "OTP sent to this number",
        mobile: user.Mobile,
        username: user.UserName,
        EmpiID: user.EmpID,
      });
    }

    return res.status(200).json({
      message: "User already exists",
      mobile: user.Mobile,
      username: user.FirstName,
    });
  } catch (err) {
    console.error("Error occurred:", err.message);
    res.status(500).send({
      message: err.message || "Some error occurred while fetching the user.",
    });
  }
};

// exports.changePasswordWeb = async (req, res) => {
//   try {
//     const { EmpID, newPassword } = req.body;

//     console.log("Received request to change password");
//     console.log("EmpID:", EmpID);

//     // Validate newPassword
//     if (!newPassword) {
//       console.log("New password is missing");
//       return res.status(400).send({ message: "New password is required" });
//     }

//     // Finding the user by EmpID
//     const user = await UserMaster.findOne({ where: { EmpID } });

//     if (!user) {
//       console.log("User not found");
//       return res.status(404).send({ message: "EmpID not found" });
//     }

//     console.log("User found:", user);

//     if (user.Password === null) {
//       console.log("User has not set a password yet");
//       return res.status(400).send({ message: "Create Your Password" });
//     }

//     // Check if the new password matches the old password
//     const isOldPassword = await bcrypt.compare(newPassword, user.Password);

//     if (isOldPassword) {
//       console.log("New password cannot be the same as old password");
//       return res
//         .status(400)
//         .send({ message: "New Password cannot be the same as Old Password" });
//     }

//     // Hash the new password
//     console.log("Hashing new password");
//     const hashedPassword = await bcrypt.hash(newPassword, 10);

//     console.log("Hashed new password:", hashedPassword);

//     // Update user password
//     console.log("Updating password");
//     user.Password = hashedPassword;
//     user.ModifiedDate = new Date();
//     await user.save();

//     // Send a success response
//     console.log("Password successfully updated");
//     res.send({ message: "Password successfully updated" });
//   } catch (err) {
//     console.error("Error occurred while updating password:", err);
//     // Handle errors
//     res.status(500).send({
//       message:
//         err.message || "Some error occurred while updating the password.",
//     });
//   }
// };

exports.changePasswordWeb = async (req, res) => {
  try {
    const { EmpID, newPassword } = req.body;

    console.log("Received request to change password");
    console.log("EmpID:", EmpID);

    // Validate newPassword
    if (!newPassword) {
      console.log("New password is missing");
      return res.status(400).send({ message: "New password is required" });
    }

    // Finding the user by EmpID
    const user = await UserMaster.findOne({ where: { EmpID } });

    if (!user) {
      console.log("User not found");
      return res.status(404).send({ message: "EmpID not found" });
    }

    console.log("User found:", user);

    if (user.Password === null) {
      console.log("User has not set a password yet");
      return res.status(400).send({ message: "Create Your Password" });
    }

    // Check if the new password matches the old password
    const isOldPassword = await bcrypt.compare(newPassword, user.Password);

    if (isOldPassword) {
      console.log("New password cannot be the same as old password");
      return res
        .status(400)
        .send({ message: "New Password cannot be the same as Old Password" });
    }

    // Hash the new password
    console.log("Hashing new password");
    // const hashedPassword = await bcrypt.hash(newPassword, 10);

    // console.log("Hashed new password:", hashedPassword);

    // Update user password
    console.log("Updating password");
    user.Password = newPassword;
    user.ModifiedDate = new Date();
    await user.save();

    // Send a success response
    console.log("Password successfully updated");
    res.send({ message: "Password successfully updated" });
  } catch (err) {
    console.error("Error occurred while updating password:", err);
    // Handle errors
    res.status(500).send({
      message:
        err.message || "Some error occurred while updating the password.",
    });
  }
};

exports.changeMpin = async (req, res) => {
  try {
    const { EmpID, currentMpin, newMpin } = req.body;

    // Log request body
    console.log("Request Body:", req.body);

    // Finding the user by EmpID
    const user = await UserMaster.findOne({ where: { EmpID } });

    // Log the user found
    console.log("User Found:", user);

    if (!user) {
      return res.status(404).send({ message: "EmpID not found" });
    }

    // Log the MPIN comparison
    console.log("Stored MPIN:", user.MPIN);
    console.log("Provided Current MPIN:", currentMpin);

    // Check if the provided current MPIN matches the stored MPIN
    if (user.MPIN !== currentMpin) {
      return res.status(401).send({ message: "Current MPIN is incorrect" });
    }

    // Update user's MPIN in the database
    user.MPIN = newMpin;
    user.ModifiedDate = new Date();
    await user.save();

    // Send a success response
    res.send({ message: "MPIN successfully changed" });
  } catch (err) {
    // Handle errors
    res.status(500).send({
      message: err.message || "Some error occurred while changing the MPIN.",
    });
  }
};

// exports.ForgetpaasswordWeb = async (req, res) => {
//   try {
//     const empID = req.query.EmpID;

//     if (!empID) {
//       console.log("EmpID not provided");
//       return res.status(404).send({ message: "Invalid Data" });
//     }

//     // Finding the user
//     const user = await UserMaster.findOne({ where: { EmpID: empID } });

//     if (!user) {
//       console.log(`User not found for EmpID: ${empID}`);
//       return res.status(404).send({ message: "User not found" });
//     }

//     // Check if Password is not null
//     if (user.Password === null) {
//       console.log(`Password is null for user with EmpID: ${empID}`);
//       return res.status(200).json({
//         message: "Click On New User",
//       });
//     } else {
//       return res.status(200).json({
//         message: "OTP sent to this number",
//         mobile: user.Mobile,
//         username: user.UserName,
//         EmpID: user.EmpID,
//       });
//     }
//   } catch (err) {
//     console.error("Error occurred:", err.message);
//     res.status(500).send({
//       message: err.message || "Some error occurred while fetching the user.",
//     });
//   }
// };

exports.ForgetpaasswordWeb = async (req, res) => {
  try {
    const empID = req.query.EmpID;

    if (!empID) {
      console.log("EmpID not provided");
      return res.status(404).send({ message: "Invalid Data" });
    }

    // Finding the user
    const user = await UserMaster.findOne({ where: { EmpID: empID } });

    if (!user) {
      console.log(`User not found for EmpID: ${empID}`);
      return res.status(404).send({ message: "User not found" });
    }

    // Check if Password is not null
    if (user.Password === null) {
      console.log(`Password is null for user with EmpID: ${empID}`);
      return res.status(200).json({
        message: "Click On New User",
      });
    } else {
      return res.status(200).json({
        message: "OTP sent to this number",
        mobile: user.Mobile,
        username: user.UserName,
        EmpID: user.EmpID,
      });
    }
  } catch (err) {
    console.error("Error occurred:", err.message);
    res.status(500).send({
      message: err.message || "Some error occurred while fetching the user.",
    });
  }
};

exports.userloginmobile = async (req, res) => {
  try {
    const { EmpID, MPIN } = req.body;

    // Finding the user
    const user = await UserMaster.findOne({ where: { EmpID } });

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // Check if the user's MPIN exists
    if (!user.MPIN) {
      return res.status(400).send({ message: "User has no MPIN set" });
    }

    // Compare MPINs
    const isMPINValid = await bcrypt.compare(MPIN, user.MPIN);

    if (!isMPINValid) {
      return res.status(401).send({ message: "Invalid MPIN" });
    }

    // MPIN is valid, user is authenticated
    res.send({ message: "Login successful", user });
  } catch (err) {
    // Handle errors
    res.status(500).send({
      message: err.message || "Some error occurred while logging in.",
    });
  }
};
exports.findAllUsersList = async (req, res) => {
  try {
    // Fetch all user master data with included related data (Branch, Department, Region, State)
    const userMasterData = await UserMaster.findAll({
      attributes: [
        "UserID",
        "UserName",
        "EmpID",
        "Email",
        "Mobile",
        "RoleID",
        "Designation",
        "MPIN",
        "Password",
        "UserStatus",
        "State",
        "Region",
        "City",
        "Branch",
        "OEMID",
        "Status",
      ],
      include: [
        {
          model: BranchMaster,
          as: "UMBranchID",
          attributes: ["BranchID", "BranchName"],
        },
        {
          model: DepartmentMaster,
          as: "UMDeptID",
          attributes: ["DeptID", "DeptCode", "DeptName"], // Corrected "DeotName" to "DeptName"
        },
        {
          model: RegionMaster,
          as: "UMRegionID",
          attributes: ["RegionID", "RegionName"],
        },
        {
          model: StateMaster,
          as: "UMStateID",
          attributes: ["StateID", "StateName"],
        },
      ],
      order: [
        ["CreatedDate", "DESC"], // Order by UserName in decending order
      ],
    });

    // Check if data is empty
    if (!userMasterData || userMasterData.length === 0) {
      return res.status(404).json({
        message: "No user data found.",
      });
    }

    // Map the data for response
    const combinedData = userMasterData.map((item) => ({
      UserID: item.UserID,
      UserName: item.UserName,
      EmpID: item.EmpID,
      Email: item.Email,
      Mobile: item.Mobile,
      RoleID: item.RoleID,
      Designation: item.Designation,
      MPIN: item.MPIN,
      Password: item.Password,
      UserStatus: item.UserStatus,
      State: item.State,
      Region: item.Region,
      City: item.City,
      Branch: item.Branch,
      BranchID: item.UMBranchID ? item.UMBranchID.BranchID : null,
      BranchName: item.UMBranchID ? item.UMBranchID.BranchName : null,
      DeptID: item.UMDeptID ? item.UMDeptID.DeptID : null,
      DeptCode: item.UMDeptID ? item.UMDeptID.DeptCode : null,
      DeptName: item.UMDeptID ? item.UMDeptID.DeptName : null,
      RegionID: item.UMRegionID ? item.UMRegionID.RegionID : null,
      RegionName: item.UMRegionID ? item.UMRegionID.RegionName : null,
      StateID: item.UMStateID ? item.UMStateID.StateID : null,
      StateName: item.UMStateID ? item.UMStateID.StateName : null,
      OEMID: item.OEMID,
      Status: item.Status,
    }));

    // Send the combined data as response
    res.json(combinedData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      // Handle database errors
      return res.status(500).json({
        message: "Database error occurred while retrieving user data.",
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
    console.error("Error retrieving user data:", error);
    res.status(500).json({
      message: "Failed to retrieve user data. Please try again later.",
    });
  }
};
// exports.findAllUsersListBasedOnRoles = async (req, res) => {
//   try {
//     // Fetch all user data with related role data
//     const userMasterData = await UserMaster.findAll({
//       attributes: ["UserID", "UserName", "RoleID"],
//       include: [
//         {
//           model: RoleMaster,
//           as: "UserRole",
//           attributes: ["RoleID", "RoleName"],
//         },
//       ],
//       order: [["UserName", "ASC"]], // Order by UserName in ascending order
//     });

//     // Check if data is empty
//     if (!userMasterData || userMasterData.length === 0) {
//       return res.status(404).json({
//         message: "No user data found.",
//       });
//     }

//     // Group data by RoleName
//     const groupedData = {};
//     userMasterData.forEach((user) => {
//       const roleName = user.UserRole ? user.UserRole.RoleName : "Unknown";
//       if (!groupedData[roleName]) {
//         groupedData[roleName] = [];
//       }
//       groupedData[roleName].push({
//         UserID: user.UserID,
//         UserName: user.UserName,
//       });
//     });

//     // Format grouped data as requested JSON structure
//     const responseData = Object.keys(groupedData).map((roleName) => ({
//       RoleName: roleName,
//       Users: groupedData[roleName],
//     }));

//     // Send the response
//     res.json(responseData);
//   } catch (error) {
//     // Handle errors based on specific types
//     if (error.name === "SequelizeDatabaseError") {
//       return res.status(500).json({
//         message: "Database error occurred while retrieving user data.",
//         details: error.message,
//       });
//     }

//     if (error.name === "SequelizeConnectionError") {
//       return res.status(503).json({
//         message: "Service unavailable. Unable to connect to the database.",
//         details: error.message,
//       });
//     }

//     console.error("Error retrieving user data:", error);
//     res.status(500).json({
//       message: "Failed to retrieve user data. Please try again later.",
//     });
//   }
// };

exports.findAllUsersListBasedOnRoles = async (req, res) => {
  try {
    // Fetch all user data
    const userMasterData = await UserMaster.findAll({
      attributes: [
        "UserID",
        "EmpID",
        "UserName",
        "RoleID",
        "Mobile",
        "Designation",
        "Region",
        "DeptID",
        "Status",
      ],
      include: [
        {
          model: DepartmentMaster,
          as: "UMDeptID",
          attributes: ["DeptCode", "DeptName"],
        },
      ],
      order: [["CreatedDate", "DESC"]], // Order by UserName in decending order
    });

    // Fetch all role data
    const roleMasterData = await RoleMaster.findAll({
      attributes: ["RoleID", "RoleName"],
    });

    // Check if data is empty
    if (!userMasterData || userMasterData.length === 0) {
      return res.status(404).json({
        message: "No user data found.",
      });
    }

    // Create a lookup for roles based on RoleID
    const roleLookup = roleMasterData.reduce((lookup, role) => {
      lookup[role.RoleID] = role.RoleName;
      return lookup;
    }, {});

    // Group data by RoleName
    const groupedData = {};
    userMasterData.forEach((user) => {
      const roleName = roleLookup[user.RoleID] || "Unknown";
      if (!groupedData[roleName]) {
        groupedData[roleName] = [];
      }
      groupedData[roleName].push({
        UserID: user.UserID,
        EmpID: user.EmpID,
        UserName: user.UserName,
        RoleID: user.RoleID,
        Mobile: user.Mobile,
        Designation: user.Designation,
        Region: user.Region,
        DeptID: user.DeptID,
        Status: user.Status,
        DeptCode: user.UMDeptID ? user.UMDeptID.DeptCode : null,
        DeptName: user.UMDeptID ? user.UMDeptID.DeptName : null,
      });
    });

    // Format grouped data as requested JSON structure
    const responseData = Object.keys(groupedData).map((roleName) => ({
      RoleName: roleName,
      Users: groupedData[roleName],
    }));

    // Send the response
    res.json(responseData);
  } catch (error) {
    // Handle errors based on specific types
    if (error.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message: "Database error occurred while retrieving user data.",
        details: error.message,
      });
    }

    if (error.name === "SequelizeConnectionError") {
      return res.status(503).json({
        message: "Service unavailable. Unable to connect to the database.",
        details: error.message,
      });
    }

    console.error("Error retrieving user data:", error);
    res.status(500).json({
      message: "Failed to retrieve user data. Please try again later.",
    });
  }
};

exports.updateByPk = async (req, res) => {
  try {
    // Validate request
    if (!req.body.UserName) {
      return res.status(400).json({ message: "UserName cannot be empty" });
    }

    if (!/^[a-zA-Z ]*$/.test(req.body.UserName)) {
      console.log("Validation failed: UserName contains invalid characters.");
      return res.status(400).json({
        message: "UserName should contain only letters and spaces",
      });
    }

    // Find the user by ID
    const userID = req.params.id;
    let user = await UserMaster.findByPk(userID);

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update fields
    user.UserName = req.body.UserName;
    user.EmpID = req.body.EmpID || user.EmpID;
    user.Email = req.body.Email || user.Email;
    user.Mobile = req.body.Mobile || user.Mobile;
    user.RoleID = req.body.RoleID || user.RoleID;
    user.Designation = req.body.Designation || user.Designation;
    user.MPIN = req.body.MPIN || user.MPIN;
    user.Password = req.body.Password || user.Password;
    user.UserStatus = req.body.UserStatus || user.UserStatus;
    user.State = req.body.State || user.State;
    user.Region = req.body.Region || user.Region;
    user.City = req.body.City || user.City;
    user.Branch = req.body.Branch || user.Branch;
    user.OEMID = req.body.OEMID || user.OEMID;
    user.Status = req.body.Status || user.Status;
    user.ModifiedDate = new Date();

    // Save updated user in the database
    const updatedUser = await user.save();

    // Send the updated user as response
    return res.status(200).json(updatedUser);
  } catch (err) {
    // Handle specific errors
    if (err.name === "SequelizeValidationError") {
      return res.status(400).json({
        message: "Validation error occurred.",
        details: err.errors.map((error) => ({
          message: error.message,
          field: error.path,
        })),
      });
    }

    if (err.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        message: "Database error occurred while updating user.",
        details: err.message,
      });
    }

    // General error handling
    console.error("Error updating user:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
