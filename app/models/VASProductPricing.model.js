const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class VASProductPricing extends Model {}

  VASProductPricing.init(
    {
      VASProductID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      VASID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "ValueAddedService", // Reference model name
          key: "VASID", // Reference column name
        },
      },
      // VASManagerApprovalsID: {
      //   type: DataTypes.INTEGER,
      //   allowNull: false,
      //   references: {
      //     model: "VASManagerApprovals", // Reference model name
      //     key: "VASManagerApprovalsID", // Reference column name
      //   },
      // },
      OptionName: {
        type: DataTypes.STRING(100),
      },

      ModelMasterID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "ModelMaster", // Reference model name
          key: "ModelMasterID", // Reference column name
        },
      },

      ModelName: {
        type: DataTypes.STRING(50),
      },
      VariantID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "VariantMaster", // Reference model name
          key: "VariantID", // Reference column name
        },
      },
      VariantName: {
        type: DataTypes.STRING(50),
      },
      ProductType: {
        type: DataTypes.ENUM,
        values: ["Own", "ThirdParty"],
        allowNull: false,
      },
      ProductDuration: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      EffectiveDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      EndDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      Mandatory: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },

      TaxApplicable: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      TaxableValue: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      TaxRate: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      TotalValue: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      TaxValue: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      Commission: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      Universal: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      BranchID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "BranchMaster", // Reference model name
          key: "BranchID", // Reference column name
        },
      },
      UserID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "UserMaster", // Reference model name
          key: "UserID", // Reference column name
        },
      },
      // Reason: {
      //   type: DataTypes.STRING(225),
      // },
      // Remarks: {
      //   type: DataTypes.STRING(225),
      // },
      // ApprovalStatus: {
      //   type: DataTypes.ENUM,
      //   values: ["Pending", "Approved", "Rejected"],
      //   defaultValue: "Pending",
      // },
      Status: {
        type: DataTypes.STRING(25),
        defaultValue: "Active",
      },
      IsActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      CreatedDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("NOW()"),
      },
      ModifiedDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "VASProductPricing",
      tableName: "VASProductPricing", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable automatic timestamps
    }
  );

  return VASProductPricing;
};
