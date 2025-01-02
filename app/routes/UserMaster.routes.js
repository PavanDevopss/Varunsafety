module.exports = (app) => {
  const usermaster = require("../controllers/UserMaster.controller.js");

  var router = require("express").Router();

  // Create a new modelmaster
  router.post("/", usermaster.create);

  // // Retrieve all modelmaster
  router.post("/usersignup", usermaster.usersignup);

  router.post("/userlogin", usermaster.userlogin);
  router.post("/userloginmobile", usermaster.userloginmobile);

  router.post("/userlogout", usermaster.userlogout);
  router.post("/mobilempincreate", usermaster.MobileMPINCreation);
  router.post("/mobilelogin", usermaster.MobileloginWithMpin);

  router.get("/getuser", usermaster.GetUser);
  router.get("/findalluserslist", usermaster.findAllUsersList);
  router.get(
    "/findalluserslistbasedonroles",
    usermaster.findAllUsersListBasedOnRoles
  );

  router.post("/updatempin", usermaster.updatempin);
  router.post("/forgetmpin", usermaster.ForgetMPIN);
  router.post("/getemployee", usermaster.GetEmployeeByID);
  router.post("/changepassword", usermaster.changePasswordWeb);
  router.post("/changempin", usermaster.changeMpin);
  router.post("/forgetpaasswordweb", usermaster.ForgetpaasswordWeb);
  router.put("/:id", usermaster.updateByPk);

  // // Retrieve a single modelmaster with id
  // router.get("/:id", modelmasters.findOne);

  // // Update a modelmaster with id
  // router.put("/:id", modelmasters.update);

  // // Delete a modelmaster with id
  // router.delete("/:id", modelmasters.delete);

  app.use("/api/usermasters", router);
};
