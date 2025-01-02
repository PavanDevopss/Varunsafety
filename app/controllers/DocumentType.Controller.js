/* eslint-disable no-unused-vars */
const db = require("../models");
const DocumentType = db.documenttypes;
const Op = db.Sequelize.Op;
const sequelize = db.Sequelize;
const Seq = db.sequelize;

exports.create = async (req, res) => {
  try {
    // Create a Customer
    const DocType = {
      DocumentAs: req.body.DocumentAs,
      Doctype: req.body.Doctype,
      IsActive: req.body.IsActive !== undefined ? req.body.IsActive : true,
      Status: req.body.Status || "Active",
    };
    // Save Customer in the database
    const data = await DocumentType.create(DocType);

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({
      message:
        err.message || "Some error occurred while creating the Customer.",
    });
  }
};

exports.findAllData = async (req, res) => {
  try {
    const customer = await DocumentType.findAll();

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    res.status(200).json(customer);
  } catch (err) {
    res.status(500).json({
      message:
        err.message || "Some error occurred while retrieving the Customer.",
    });
  }
};
