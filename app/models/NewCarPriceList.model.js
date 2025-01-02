const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class NewCarPriceList extends Model {}

  NewCarPriceList.init(
    {
      NewCarPriceListID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      BranchID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "BranchMaster", // This is the name of the referenced model
          key: "BranchID", // This is the name of the referenced column
        },
      },
      ModelMasterID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "ModelMaster", // This is the name of the referenced model
          key: "ModelMasterID", // This is the name of the referenced column
        },
      },
      VariantID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "VariantMaster", // This is the name of the referenced model
          key: "VariantID", // This is the name of the referenced column
        },
      },
      ColourCategoryID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "ColourCategory", // This is the name of the referenced model
          key: "ColourCategoryID", // This is the name of the referenced column
        },
      },
      FuelTypeID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "FuelType", // This is the name of the referenced model
          key: "FuelTypeID", // This is the name of the referenced column
        },
      },
      TransmissionID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Transmission", // This is the name of the referenced model
          key: "TransmissionID", // This is the name of the referenced column
        },
      },
      UserID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "UserMaster", // This is the name of the referenced model
          key: "UserID", // This is the name of the referenced column
        },
      },
      IsActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      Status: {
        type: DataTypes.STRING(25),
        defaultValue: "Active",
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
      modelName: "NewCarPriceList",
      tableName: "NewCarPriceList", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );

  return NewCarPriceList;
};
