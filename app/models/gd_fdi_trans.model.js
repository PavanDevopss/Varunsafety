const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class GdFdiTrans extends Model {}

  GdFdiTrans.init(
    {
      utd: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
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
      outlet_cd: {
        type: DataTypes.STRING(200),
      },
      trans_type: {
        type: DataTypes.STRING(200),
      },
      trans_date: {
        type: DataTypes.STRING(200),
      },
      trans_id: {
        type: DataTypes.STRING(200),
      },
      trans_ref_num: {
        type: DataTypes.STRING(200),
      },
      trans_ref_date: {
        type: DataTypes.STRING(200),
      },
      trans_qty: {
        type: DataTypes.INTEGER,
      },
      trans_segment: {
        type: DataTypes.STRING(200),
      },
      vin: {
        type: DataTypes.STRING(200),
      },
      model_cd: {
        type: DataTypes.STRING(200),
      },
      variant_cd: {
        type: DataTypes.STRING(200),
      },
      ecolor_cd: {
        type: DataTypes.STRING(200),
      },
      basic_price: {
        type: DataTypes.REAL,
      },
      discount: {
        type: DataTypes.REAL,
      },
      taxable_value: {
        type: DataTypes.REAL,
      },
      service_amount: {
        type: DataTypes.REAL,
      },
      gst_no: {
        type: DataTypes.STRING(200),
      },
      place_of_supply: {
        type: DataTypes.STRING(200),
      },
      cust_name: {
        type: DataTypes.STRING(100),
      },
      executive: {
        type: DataTypes.STRING(120),
      },
      team_head: {
        type: DataTypes.STRING(100),
      },
      finc_name: {
        type: DataTypes.STRING(100),
      },
      payment_mode: {
        type: DataTypes.STRING(100),
      },
      deposit_bank: {
        type: DataTypes.STRING(100),
      },
      payment_for: {
        type: DataTypes.STRING(100),
      },
      ge1: {
        type: DataTypes.STRING(250),
      },
      ge2: {
        type: DataTypes.STRING(250),
      },
      ge3: {
        type: DataTypes.STRING(250),
      },
      ge4: {
        type: DataTypes.STRING(250),
      },
      ge5: {
        type: DataTypes.STRING(250),
      },
      ge6: {
        type: DataTypes.STRING(250),
      },
      ge7: {
        type: DataTypes.STRING(250),
      },
      ge8: {
        type: DataTypes.STRING(250),
      },

      ge9: {
        type: DataTypes.STRING(250),
      },
      ge10: {
        type: DataTypes.STRING(250),
      },
      ge11: {
        type: DataTypes.STRING(250),
      },
      ge12: {
        type: DataTypes.STRING(250),
      },
      ge13: {
        type: DataTypes.STRING(250),
      },
      ge14: {
        type: DataTypes.STRING(250),
      },
      ge15: {
        type: DataTypes.STRING(250),
      },
      gd_fdi_trans_id: {
        type: DataTypes.INTEGER,
      },
      created_date: {
        type: DataTypes.STRING(200),
      },
      engine_num: {
        type: DataTypes.STRING(200),
      },
      chassis_num: {
        type: DataTypes.STRING(200),
      },
      cust_id: {
        type: DataTypes.STRING(200),
      },
      hsn_no: {
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
      modelName: "gd_fdi_trans",
      tableName: "gd_fdi_trans", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return GdFdiTrans;
};
