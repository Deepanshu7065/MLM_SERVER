import { DataTypes } from "sequelize";
import sequelize from "../DB/sequelize.js";

const User = sequelize.define("users", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  role: {
    type: DataTypes.ENUM("user", "admin"),
    defaultValue: "user"
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  referalCode: {
    type: DataTypes.STRING,
    unique: true,
    field: "referalCode"  // Added explicit field mapping
  },
  parent_code: {
    type: DataTypes.STRING,
    allowNull: true,
    field: "parent_code"  // Added explicit field mapping
  },
  ref_by_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: "ref_by_id"  // Added explicit field mapping
  },
  userId: {
    type: DataTypes.STRING,
    unique: true,
    field: "userId"  // This was already there
  },
}, {
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
  tableName: "Users",
  freezeTableName: true  // Added to prevent Sequelize from pluralizing
});

export default User;