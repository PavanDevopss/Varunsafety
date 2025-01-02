const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class HsnDetailMaster extends Model {}

  HsnDetailMaster.init(
    {
      hsn_sac_catg: {
        type: DataTypes.STRING(200),
      },
      state_cd: {
        type: DataTypes.DOUBLE,
      },
      sgst_ugst: {
        type: DataTypes.DOUBLE,
      },
      cgst: {
        type: DataTypes.DOUBLE,
      },
      igst: {
        type: DataTypes.DOUBLE,
      },
      from_date: {
        type: DataTypes.STRING(200),
      },
      to_date: {
        type: DataTypes.STRING(200),
      },
      gst_code: {
        type: DataTypes.STRING(45),
      },
      gst_desc: {
        type: DataTypes.STRING(200),
      },
      hsn_details_master_id: {
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
      modelName: "hsn_details_master",
      tableName: "hsn_details_master", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return HsnDetailMaster;
};
