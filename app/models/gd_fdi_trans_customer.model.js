const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class GdFdiTransCustomer extends Model {}

  GdFdiTransCustomer.init(
    {
      utd: {
        type: DataTypes.STRING(200),
      },
      cust_id: {
        type: DataTypes.STRING(200),
      },
      salutation: {
        type: DataTypes.STRING(200),
      },
      cust_name: {
        type: DataTypes.STRING(200),
      },
      gender: {
        type: DataTypes.STRING(200),
      },
      marital_status: {
        type: DataTypes.STRING(200),
      },
      communicate_to: {
        type: DataTypes.STRING(200),
      },
      res_address1: {
        type: DataTypes.STRING(200),
      },
      res_address2: {
        type: DataTypes.STRING(200),
      },
      res_address3: {
        type: DataTypes.STRING(200),
      },
      res_pin_cd: {
        type: DataTypes.STRING(200),
      },
      res_city: {
        type: DataTypes.STRING(200),
      },
      res_phone: {
        type: DataTypes.STRING(200),
      },
      off_address1: {
        type: DataTypes.STRING(200),
      },
      off_address2: {
        type: DataTypes.STRING(200),
      },
      off_address3: {
        type: DataTypes.STRING(200),
      },
      off_pin_cd: {
        type: DataTypes.STRING(200),
      },
      off_city: {
        type: DataTypes.STRING(200),
      },
      off_phone: {
        type: DataTypes.STRING(200),
      },
      mobile1: {
        type: DataTypes.STRING(200),
      },
      mobile2: {
        type: DataTypes.STRING(200),
      },
      email_id: {
        type: DataTypes.STRING(200),
      },
      pan_no: {
        type: DataTypes.STRING(200),
      },
      state: {
        type: DataTypes.STRING(200),
      },
      district: {
        type: DataTypes.STRING(200),
      },
      tehsil: {
        type: DataTypes.STRING(200),
      },
      village: {
        type: DataTypes.STRING(200),
      },
      gst_num: {
        type: DataTypes.STRING(200),
      },
      tin: {
        type: DataTypes.STRING(200),
      },
      uin: {
        type: DataTypes.STRING(200),
      },
      dob: {
        type: DataTypes.STRING(200),
      },
      doa: {
        type: DataTypes.STRING(200),
      },
      ship_address1: {
        type: DataTypes.STRING(200),
      },
      ship_address2: {
        type: DataTypes.STRING(200),
      },
      ship_address3: {
        type: DataTypes.STRING(200),
      },
      ship_pin_cd: {
        type: DataTypes.STRING(200),
      },
      ship_city: {
        type: DataTypes.STRING(200),
      },
      ship_state: {
        type: DataTypes.STRING(200),
      },
      ship_full_name: {
        type: DataTypes.STRING(200),
      },
      ship_pan: {
        type: DataTypes.STRING(200),
      },
      ship_gst_num: {
        type: DataTypes.STRING(200),
      },
      ship_uin: {
        type: DataTypes.STRING(200),
      },
      parent_group: {
        type: DataTypes.STRING(200),
      },
      dealer_map_cd: {
        type: DataTypes.INTEGER,
      },
      loc_cd: {
        type: DataTypes.STRING(200),
      },
      comp_fa: {
        type: DataTypes.STRING(200),
      },
      mul_dealer_cd: {
        type: DataTypes.STRING(200),
      },
      dealer_for_cd: {
        type: DataTypes.STRING(200),
      },
      outlet_cd: {
        type: DataTypes.STRING(200),
      },
      gd_fdi_trans_customer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      created_date: {
        type: DataTypes.STRING(200),
      },
      ax_flag: {
        type: DataTypes.STRING(1),
      },
      CreatedDate: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: sequelize.literal("NOW()"),
      },
      ModifiedDate: {
        allowNull: true,
        type: DataTypes.DATE,
        // defaultValue: sequelize.literal("NOW()"),
      },
    },
    {
      sequelize,
      modelName: "gd_fdi_trans_customer",
      tableName: "gd_fdi_trans_customer", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return GdFdiTransCustomer;
};
