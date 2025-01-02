const db = require("../models");
const CompanyLevel = db.companylevel;

// Create and Save a new User
exports.create = (req, res) => {
  // Validate request
  if (!req.body.LevelName) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
    return;
  }

  // Create a CompanyLeveldata
  const companyLeveldata = {
    LevelName: req.body.LevelName,
  };

  // Save CompanyLeveldata in the database
  CompanyLevel.create(companyLeveldata)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while creating the CompanyLeveldata.",
      });
    });
};

exports.findAll = (req, res) => {
  CompanyLevel.findAll()
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while retrieving CompanyLeveldata.",
      });
    });
};
