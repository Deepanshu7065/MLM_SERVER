// // models/Payment.model.js
// import sequelize from "../DB/sequelize.js";
// import { DataTypes } from "sequelize";
// import User from "./User.modal.js";

// const Payment = sequelize.define("payments", {
//   id: {
//     type: DataTypes.INTEGER,
//     primaryKey: true,
//     autoIncrement: true,
//   },
//   userId: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },

//   name: DataTypes.STRING,
//   email: DataTypes.STRING,
//   phone: DataTypes.STRING,

//   total_amount: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//   },

//   payment_id: DataTypes.STRING,
//   order_id: DataTypes.STRING,
//   payment_method: DataTypes.STRING,

//   status: {
//     type: DataTypes.ENUM("PENDING", "SUCCESS", "FAILED"),
//     defaultValue: "PENDING",
//   },

//   failure_reason: {
//     type: DataTypes.STRING,
//     allowNull: true,
//   },

// }, {
//   timestamps: true,
//   createdAt: "created_at",
//   updatedAt: "updated_at",
//   tableName: "payments",
// });

// User.hasMany(Payment, { foreignKey: "userId", sourceKey: "userId" });
// Payment.belongsTo(User, { foreignKey: "userId", targetKey: "userId" });

// export default Payment;


// models/Payment.model.js
import sequelize from "../DB/sequelize.js";
import { DataTypes } from "sequelize";
import User from "./User.modal.js";
import CartItem from "./Cart.modal.js";

const Payment = sequelize.define("payments", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  name: DataTypes.STRING,
  email: DataTypes.STRING,
  phone: DataTypes.STRING,

  total_amount: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  payment_id: DataTypes.STRING,
  order_id: DataTypes.STRING,
  payment_method: DataTypes.STRING,

  status: {
    type: DataTypes.ENUM("PENDING", "SUCCESS", "FAILED"),
    defaultValue: "PENDING",
  },

  courseIds: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
  },

  failure_reason: {
    type: DataTypes.STRING,
    allowNull: true,
  },

}, {
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
  tableName: "payments",
});

// CartItem.hasMany(Payment, { foreignKey: "courseId", sourceKey: "course_id" });
// Payment.belongsTo(CartItem, { foreignKey: "courseId", targetKey: "course_id" });

User.hasMany(Payment, { foreignKey: "userId", sourceKey: "userId" });
Payment.belongsTo(User, { foreignKey: "userId", targetKey: "userId" });

export default Payment;