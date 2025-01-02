const { Model, DataTypes } = require("sequelize");
module.exports = (sequelize) => {
  class TeamMember extends Model {}
  TeamMember.init(
    {
      TeamMemberID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      TeamID: {
        type: DataTypes.INTEGER,
        references: {
          model: "Teams",
          key: "TeamID",
        },
      },
      UserID: {
        type: DataTypes.INTEGER,
        references: {
          model: "UserMaster",
          key: "UserID",
        },
      },
      EmpName: {
        type: DataTypes.STRING(100),
      },
      EmpPosition: {
        type: DataTypes.ENUM,
        values: ["Lead", "Member"],
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
      modelName: "TeamMember",
      tableName: "TeamMember", // Optional: specify the table name if different from model name
      timestamps: false, // Optional: disable timestamps
    }
  );
  return TeamMember;
};
