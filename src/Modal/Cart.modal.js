// models/CartItem.model.js
import { DataTypes } from "sequelize";
import sequelize from "../DB/sequelize.js";
import Courses from "./courses.modal.js";
import User from "./User.modal.js";


const CartItem = sequelize.define("cart_items", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  course_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
  tableName: "cart_items",
});

User.hasMany(CartItem, { foreignKey: "userId", sourceKey: "userId" });
CartItem.belongsTo(User, { foreignKey: "userId", targetKey: "userId" });

Courses.hasMany(CartItem, { foreignKey: "course_id" });
CartItem.belongsTo(Courses, { foreignKey: "course_id" });

export default CartItem;
