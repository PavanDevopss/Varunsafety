/* eslint-disable no-unused-vars */
// middleware/checkRole.js

const db = require("../models");
const FormAccessRights = db.formaccessrights;
const APIActionMaster = db.apiactionmaster;
const FormMaster = db.formsmaster;
const RoleMaster = db.rolesmaster;

const checkRole = (formName, actionName) => {
  return async (req, res, next) => {
    const { roleId } = req.body; // Assuming req.body.roleId contains the role ID of the authenticated user

    console.log("Role ID:", roleId);
    console.log("Form Name:", formName);
    console.log("Action Name:", actionName);

    try {
      // Check if the role has permission for the specified form and action
      const accessRight = await FormAccessRights.findOne({
        where: {
          RoleID: roleId,
        },
        include: [
          {
            model: FormMaster,
            as: "formsMaster",
            where: { FormName: formName },
          },
          {
            model: APIActionMaster,
            as: "apiActionMaster",
            where: { ActionName: actionName },
          },
        ],
      });
      console.log("Access Right:", accessRight);
      if (accessRight) {
        console.log("User Authorized");
        next(); // User has required permission, continue to next middleware
      } else {
        console.log(
          "UnAuthorized access!! user doesn't have sufficient access."
        );
        return res.status(403).json({ message: "Unauthorized access" });
      }
    } catch (error) {
      console.error("Error checking role:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
};

module.exports = checkRole;

module.exports = checkRole;
