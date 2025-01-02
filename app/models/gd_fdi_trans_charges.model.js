const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class GdFdiTransCharges extends Model {}

  GdFdiTransCharges.init(
    {
      utd: {
        type: DataTypes.STRING,
      },
      charge_cd: {
        type: DataTypes.STRING(45),
      },
      charge_type: {
        type: DataTypes.STRING(45),
      },
      charge_desc: {
        type: DataTypes.STRING(70),
      },
      charge_rate: {
        type: DataTypes.DOUBLE,
      },
      charge_amt: {
        type: DataTypes.DOUBLE,
      },
      msil_share: {
        type: DataTypes.DOUBLE,
      },
      dlr_share: {
        type: DataTypes.DOUBLE,
      },
      parent_group: {
        type: DataTypes.STRING(45),
      },
      dealer_map_cd: {
        type: DataTypes.INTEGER,
      },
      loc_cd: {
        type: DataTypes.STRING(45),
      },
      comp_fa: {
        type: DataTypes.STRING(45),
      },
      mul_dealer_cd: {
        type: DataTypes.STRING(45),
      },
      dealer_for_cd: {
        type: DataTypes.STRING(45),
      },
      outlet_cd: {
        type: DataTypes.STRING(45),
      },
      gd_fdi_trans_charges_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      created_date: {
        type: DataTypes.STRING(50),
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
      modelName: "gd_fdi_trans_charges",
      tableName: "gd_fdi_trans_charges", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return GdFdiTransCharges;
};
